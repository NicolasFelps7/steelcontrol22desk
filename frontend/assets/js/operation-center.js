const $=id=>document.getElementById(id);
const catalogue=await fetch('assets/operation-locales.json?v=20261106_1').then(r=>{if(!r.ok)throw Error('locales');return r.json();});
let language=localStorage.getItem('idiomaSistema')||'pt';if(!Object.hasOwn(catalogue,language))language='pt';
const tr=key=>catalogue[language]?.[key]||catalogue.pt[key]||key;
let days=1,source='TELEMETRIA',machineId=Number(new URLSearchParams(location.search).get('maquinaId'))||null;
let report=null,sequence=0,pending=null,events=null,debounce=null,saving=false,draftId=null;
const fields=['fabricados','rejeitados','pedidos','embalagem','notasFiscais','distribuicao','producaoSegundos','paradaSegundos','manutencaoSegundos','metaUnidades'];
const number=(value,digits=0)=>typeof value==='number'&&Number.isFinite(value)?new Intl.NumberFormat(language,{maximumFractionDigits:digits}).format(value):'—';
const time=value=>value?new Date(value).toLocaleString(language):'—';
function el(tag,text,className){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(className)n.className=className;return n;}
async function api(path,options={}) {
 const token=localStorage.getItem('token');const headers={'Accept':'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})};
 const res=await fetch(`${window.STEELCONTROL_API_URL||''}${path}`,{credentials:'include',cache:'no-store',...options,headers});
 if(res.status===401){location.replace('/app/login');throw Error(tr('error'));}
 let data;try{data=await res.json();}catch{throw Error(tr('error'));}
 if(!res.ok)throw Error(data.mensagem||tr('error'));return data;
}
function message(value,error=false){$('opMessage').textContent=value;$('opMessage').classList.toggle('error',error);}
function metric(label,value,unit='',digits=0){const row=el('div',null,`op-metric${typeof value==='number'?' available':''}`);row.append(el('dt',tr(label)));const dd=el('dd',number(value,digits));if(value!=null&&unit)dd.append(el('small',` ${unit}`));if(value==null){dd.title=tr('none');dd.append(el('small',` ${tr('none')}`));}row.append(dd);return row;}
function renderMetrics(){const v=report?.indicadores||{},belt=v.esteira||{},inj=v.injetoras||{};
 $('opResults').replaceChildren(metric('fabricados',v.fabricados),metric('cycle',v.cicloMedioSegundos,'s',1),metric('waste',v.desperdicioPct,'%',1),metric('cycles',v.ciclos));
 $('opBelt').replaceChildren(...['producaoSegundos','paradaSegundos','manutencaoSegundos'].map(k=>metric(k,belt[k]==null?null:belt[k]/60,'min',1)));
 $('opInjection').replaceChildren(metric('hour',inj.unidadesHora,'',1),metric('goal',inj.atingimentoMetaPct,'%',1));
 const wf=v.workflow||{};const icons=['▤','⚙','◇','▧','↗'];$('opWorkflow').replaceChildren(...['pedidos','fabricacao','embalagem','notasFiscais','distribuicao'].map((k,i)=>{const item=el('li');item.append(el('span',tr(k)),el('span',icons[i],'op-step-icon'),el('strong',number(wf[k])));return item;}));
 $('opRangeLabel').textContent=tr(days===1?'day':days===7?'week':'month');$('opUpdated').textContent=time(report?.geradoEm);
 $('opCoverage').textContent=report?`${tr('coverage')}: ${report.qualidade.coberturaFabricados}/${report.qualidade.maquinas} · ${tr('source')}: ${tr(source==='TELEMETRIA'?'live':'records')}`:tr('none');
}
function render(){renderMetrics();const machines=report?.maquinas||[];
 const options=[el('option',tr('all'))];options[0].value='';for(const m of machines){const o=el('option',m.nome);o.value=m.id;options.push(o);}$('opMachine').replaceChildren(...options);$('opMachine').value=machineId||'';
 $('opTechnical').hidden=!machineId||!machines.some(m=>m.id===machineId);$('opRegister').hidden=!report?.podeRegistrar;
 const nodes=machines.slice(0,8).map((m,i)=>{const node=el('button',null,`op-node${m.online?' online':''}${machineId===m.id?' selected':''}`);node.style.left=`${i%2?61:43}%`;node.style.top=`${30+Math.floor(i/2)*11}%`;node.setAttribute('aria-pressed',String(machineId===m.id));node.append(el('b',m.nome));const small=el('small');small.append(el('i'),document.createTextNode(tr(m.simulacao?'simulation':m.online?'online':'offline')));node.append(small);node.onclick=()=>changeMachine(m.id);return node;});
 $('opHotspots').replaceChildren(...nodes);if(report&&!machines.length)$('opHotspots').append(el('p',tr('empty')));
 $('opRecent').hidden=source!=='REGISTROS'||!report?.registrosRecentes?.length;
 $('opRecent').querySelector('div').replaceChildren(...(report?.registrosRecentes||[]).map(row=>{const div=el('div',null,'op-record');div.append(el('time',time(row.ocorridoEm)),el('span',`${machines.find(m=>m.id===row.maquinaId)?.nome||''} · ${row.observacao||tr('records')}`));if(report.podeRegistrar){const btn=el('button',tr('remove'));btn.onclick=()=>removeRecord(row.id,btn);div.append(btn);}return div;}));
}
async function load(clear=false){const version=++sequence;pending?.abort();pending=new AbortController();if(clear){report=null;renderMetrics();}message(tr('loading'));
 const query=new URLSearchParams({dias:days,origem:source});if(machineId)query.set('maquinaId',machineId);
 try{const data=await api(`/empresa/operacao?${query}`,{signal:pending.signal});if(version!==sequence)return;report=data;render();const q=data.qualidade;message(q.truncado?tr('limit'):q.baselineParcial||q.coberturaFabricados<q.maquinas?tr('partial'):'');}
 catch(error){if(error.name==='AbortError'||version!==sequence)return;message(error.message||tr('error'),true);}
}
function changeMachine(id){machineId=id;const url=new URL(location.href);id?url.searchParams.set('maquinaId',id):url.searchParams.delete('maquinaId');history.replaceState(null,'',url);load(true);}
function applyLanguage(){document.documentElement.lang=language;document.querySelectorAll('[data-op]').forEach(n=>n.textContent=tr(n.dataset.op));$('opLanguage').value=language;render();}
function recordFields(){const holder=$('opValueFields');holder.replaceChildren(...fields.map(key=>{const label=el('label');label.append(el('span',`${tr(key)}${key.endsWith('Segundos')?` (${tr('seconds')})`:''}`));const input=el('input');input.name=key;input.type='number';input.min=0;input.max=1e9;input.step=key.endsWith('Segundos')?'0.1':'1';input.inputMode=key.endsWith('Segundos')?'decimal':'numeric';label.append(input);return label;}));}
function openRecord(){const machines=(report?.maquinas||[]).filter(m=>!m.simulacao);if(!machines.length){message(tr('realRequired'),true);return;}draftId=crypto.randomUUID();$('opForm').reset();recordFields();$('opRecordMachine').replaceChildren(...machines.map(m=>{const o=el('option',m.nome);o.value=m.id;return o;}));if(machineId&&machines.some(m=>m.id===machineId))$('opRecordMachine').value=machineId;
 const now=new Date();$('opRecordDate').value=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,16);$('opFormError').textContent='';$('opDialog').showModal();}
async function saveRecord(event){event.preventDefault();if(saving)return;const values={};for(const key of fields){const raw=$('opForm').elements.namedItem(key).value;if(raw.trim()!=='')values[key]=Number(raw);}
 const date=new Date($('opRecordDate').value);if(!Object.keys(values).length||!Number.isFinite(date.getTime())||Object.entries(values).some(([key,n])=>!Number.isFinite(n)||n<0||n>1e9||(!key.endsWith('Segundos')&&!Number.isInteger(n)))){$('opFormError').textContent=tr('fieldError');return;}
 saving=true;const controls=[...$('opForm').querySelectorAll('input,select,button')];controls.forEach(n=>n.disabled=true);
 try{await api('/empresa/operacao/registros',{method:'POST',body:JSON.stringify({eventoId:draftId,maquinaId:Number($('opRecordMachine').value),ocorridoEm:date.toISOString(),observacao:$('opRecordNote').value,valores:values})});$('opDialog').close();source='REGISTROS';$('opSource').value=source;await load(true);message(tr('saved'));}catch(error){$('opFormError').textContent=error.message;}finally{saving=false;controls.forEach(n=>n.disabled=false);}}
async function removeRecord(id,button){if(!confirm(tr('confirmRemove')))return;button.disabled=true;try{await api(`/empresa/operacao/registros/${encodeURIComponent(id)}`,{method:'DELETE'});await load(true);}catch(error){message(error.message,true);button.disabled=false;}}
$('opMachine').onchange=e=>changeMachine(Number(e.target.value)||null);$('opSource').onchange=e=>{source=e.target.value;load(true);};$('opRefresh').onclick=()=>load();
$('opRanges').onclick=event=>{const button=event.target.closest('[data-days]');if(!button)return;days=Number(button.dataset.days);$('opRanges').querySelectorAll('button').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});load(true);};
$('opLanguage').onchange=e=>{language=e.target.value;localStorage.setItem('idiomaSistema',language);applyLanguage();};
$('opTechnical').onclick=()=>{const m=report?.maquinas.find(m=>m.id===machineId);if(!m)return;localStorage.setItem('maquinaId',m.id);localStorage.setItem('maquinaSelecionada',m.nome);localStorage.setItem('controladorSelecionado',m.controlador||'OUTRO');const controller=String(m.controlador||'').toUpperCase();const view=controller.includes('DOBOT')?'dobot':controller==='IMPRESSORA_3D'?'printer3d':'controller';const target=`/app/dashboard?view=${view}`;localStorage.setItem('dashboardMaquinaDestino',target);location.href=target;};
$('opRegister').onclick=openRecord;$('opForm').onsubmit=saveRecord;$('opForm').oninput=()=>{if(!saving)draftId=crypto.randomUUID();};for(const id of ['opClose','opCancel'])$(id).onclick=()=>{if(!saving)$('opDialog').close();};$('opDialog').addEventListener('cancel',e=>{if(saving)e.preventDefault();});
$('opFullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.op-board').requestFullscreen();}catch{}};
function connectEvents(){events?.close();if(document.hidden)return;events=new EventSource(`${window.STEELCONTROL_API_URL||''}/empresa/stream`,{withCredentials:true});for(const type of ['maquina.criada','maquina.atualizada','maquina.desativada','maquina.excluida','operacao.registrada','operacao.removida'])events.addEventListener(type,event=>{try{const data=JSON.parse(event.data);if((type==='maquina.desativada'||type==='maquina.excluida')&&report){report.maquinas=report.maquinas.filter(m=>m.id!==data.dados?.maquinaId);render();if(machineId===data.dados?.maquinaId)machineId=null;}}catch{}if(!debounce)debounce=setTimeout(()=>{debounce=null;load();},200);});}
const poll=setInterval(()=>{if(!document.hidden)load();},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){events?.close();pending?.abort();}else{connectEvents();load();}});window.addEventListener('pagehide',()=>{events?.close();pending?.abort();clearInterval(poll);clearTimeout(debounce);});
applyLanguage();connectEvents();load();
