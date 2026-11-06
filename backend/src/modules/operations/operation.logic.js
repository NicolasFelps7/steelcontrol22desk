export const FIELDS = Object.freeze(['fabricados','rejeitados','pedidos','embalagem','notasFiscais','distribuicao','producaoSegundos','paradaSegundos','manutencaoSegundos','metaUnidades']);
export const writableRoles = new Set(['ADMINISTRADOR','SUPERVISOR','TECNICO']);
const validNumber = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1e9;
export function validateRecord(body, now = new Date()) {
  const allowed = new Set(['maquinaId','eventoId','ocorridoEm','observacao','valores']);
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => !allowed.has(k))) throw Object.assign(new Error('Registro inválido.'), { statusCode: 400 });
  if (!Number.isSafeInteger(body.maquinaId) || body.maquinaId < 1 || typeof body.eventoId !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(body.eventoId)) throw Object.assign(new Error('Máquina ou identificador inválido.'), { statusCode: 400 });
  const date = new Date(body.ocorridoEm);
  if (typeof body.ocorridoEm !== 'string' || !Number.isFinite(date.getTime()) || date > new Date(now.getTime()+60000) || date < new Date(now.getTime()-366*86400000)) throw Object.assign(new Error('Informe uma data nos últimos 366 dias, sem data futura.'), { statusCode: 400 });
  const values = body.valores;
  if (!values || typeof values !== 'object' || Array.isArray(values) || !Object.keys(values).length || Object.keys(values).some(k => !FIELDS.includes(k) || !validNumber(values[k]) || (!k.endsWith('Segundos') && !Number.isInteger(values[k])))) throw Object.assign(new Error('Informe contagens inteiras não negativas e tempos em segundos.'), { statusCode: 400 });
  if (typeof body.observacao !== 'string' || body.observacao.length > 240) throw Object.assign(new Error('Observação inválida (máximo 240 caracteres).'), { statusCode: 400 });
  return { maquinaId: body.maquinaId, eventoId: body.eventoId, ocorridoEm: date, observacao: body.observacao.trim(), valores: Object.fromEntries(FIELDS.filter(k => Object.hasOwn(values,k)).map(k => [k,values[k]])) };
}
export function sameRecord(a,b) {
  return a.maquinaId === b.maquinaId && new Date(a.ocorridoEm).getTime() === b.ocorridoEm.getTime() && a.observacao === b.observacao && FIELDS.every(k => a.valores[k] === b.valores[k]);
}
const kind = machine => `${machine.tipo||''} ${machine.controlador||''} ${machine.nome||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function total(items,key) { const n=items.map(x=>x[key]).filter(validNumber);return n.length ? n.reduce((a,b)=>a+b,0) : null; }
function counters(row,machine) {
  const raw = row.dadosExtras?.operacao?.contadores || {};
  const values = Object.fromEntries(FIELDS.filter(k => validNumber(raw[k]) && (k.endsWith('Segundos') || Number.isInteger(raw[k]))).map(k => [k,raw[k]]));
  // O gateway Dobot incrementa producao a cada PTP; isso não comprova uma peça.
  if (!kind(machine).includes('dobot') && machine.integracaoMeta?.operacao?.producaoConfirmada === true && values.fabricados == null && validNumber(row.producao)) values.fabricados=row.producao;
  if (validNumber(raw.ciclos) && Number.isInteger(raw.ciclos)) values.ciclos=raw.ciclos;
  else if ((kind(machine).includes('dobot') || machine.integracaoMeta?.operacao?.ciclosConfirmados === true) && validNumber(row.ciclos)) values.ciclos=row.ciclos;
  return values;
}
export function buildReport({machines,readings=[],baselines=[],records=[],source='TELEMETRIA',start,end,truncated=false,deltas=null}) {
  const pairs={cicloMedioSegundos:['fabricados','producaoSegundos'],desperdicioPct:['fabricados','rejeitados'],unidadesHora:['fabricados','producaoSegundos'],atingimentoMetaPct:['fabricados','metaUnidades']};
  const perMachine=[];let incomplete=false;
  const ordered=[...readings].sort((a,b)=>new Date(a.criadoEm)-new Date(b.criadoEm) || a.id-b.id);
  for (const machine of machines) {
    const values={}, pairSafe={};
    if (source === 'REGISTROS') {
      const rows=records.filter(r=>r.maquinaId===machine.id && r.ativo!==false);
      for (const key of FIELDS) values[key]=total(rows.map(r=>r.valores),key);
      for(const [metric,keys] of Object.entries(pairs))pairSafe[metric]=rows.filter(r=>keys.some(k=>validNumber(r.valores[k]))).every(r=>keys.every(k=>validNumber(r.valores[k])));
    } else if (deltas && !truncated && !machine.modoSimulacao) {
      for (const row of deltas.filter(r=>r.maquinaId===machine.id)) {
        if (validNumber(row.total)) values[row.key]=row.total;
        if (row.missing) incomplete=true;
      }
    } else if (!truncated && !machine.modoSimulacao) {
      const previous={};const sums={};
      const baseline=baselines.find(r=>r.maquinaId===machine.id);
      if (baseline && !String(baseline.origem).toUpperCase().includes('SIMUL')) Object.assign(previous,counters(baseline,machine));
      for (const row of ordered.filter(r=>r.maquinaId===machine.id)) {
        if (String(row.origem).toUpperCase().includes('SIMUL')) continue;
        for (const [key,value] of Object.entries(counters(row,machine))) {
          if (previous[key]!=null) sums[key]=(sums[key]??0)+(value>=previous[key]?value-previous[key]:value);
          else incomplete=true;
          previous[key]=value;
        }
      }
      Object.assign(values,sums);
    }
    if(source!=='REGISTROS')for(const [metric,keys] of Object.entries(pairs))pairSafe[metric]=keys.every(k=>validNumber(values[k])&&(!deltas||deltas.some(r=>r.maquinaId===machine.id&&r.key===k&&!r.missing)));
    perMachine.push({id:machine.id,values,kind:kind(machine),pairSafe});
  }
  const aggregate=list => Object.fromEntries([...FIELDS,'ciclos'].map(k=>[k,total(list.map(m=>m.values),k)]));
  const result=aggregate(perMachine), belt=aggregate(perMachine.filter(m=>/esteira|conveyor/.test(m.kind))), injection=aggregate(perMachine.filter(m=>/injet|inject/.test(m.kind)));
  const derived=list=>{
    const v=aggregate(list);
    const safe=metric=>{const keys=pairs[metric], contributors=list.filter(m=>keys.some(k=>validNumber(m.values[k])));return contributors.length>0&&contributors.every(m=>m.pairSafe[metric]);};
    return {cicloMedioSegundos:safe('cicloMedioSegundos')&&v.fabricados>0&&v.producaoSegundos!=null?v.producaoSegundos/v.fabricados:null,
      desperdicioPct:safe('desperdicioPct')&&v.fabricados!=null&&v.rejeitados!=null&&v.fabricados+v.rejeitados>0?100*v.rejeitados/(v.fabricados+v.rejeitados):null,
      unidadesHora:safe('unidadesHora')&&v.fabricados!=null&&v.producaoSegundos>0?3600*v.fabricados/v.producaoSegundos:null,
      atingimentoMetaPct:safe('atingimentoMetaPct')&&v.fabricados!=null&&v.metaUnidades>0?100*v.fabricados/v.metaUnidades:null};
  };
  return {periodo:{inicio:start.toISOString(),fim:end.toISOString()},origem:source,geradoEm:end.toISOString(),
    indicadores:{...result,...derived(perMachine),workflow:{pedidos:result.pedidos,fabricacao:result.fabricados,embalagem:result.embalagem,notasFiscais:result.notasFiscais,distribuicao:result.distribuicao},esteira:belt,injetoras:{...injection,...derived(perMachine.filter(m=>/injet|inject/.test(m.kind)))}},
    qualidade:{truncado:truncated,baselineParcial:incomplete,leituras:deltas?deltas.filter(r=>r.key==='ciclos').reduce((n,r)=>n+r.samples,0):readings.length,registros:records.length,
      coberturaFabricados:perMachine.filter(m=>m.values.fabricados!=null).length,maquinas:machines.length},
    registrosRecentes:records.slice(-6).reverse().map(r=>({id:r.id,maquinaId:r.maquinaId,ocorridoEm:r.ocorridoEm,observacao:r.observacao,valores:r.valores}))};
}
