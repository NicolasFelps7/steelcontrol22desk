import { telemetryQuery } from './operation.telemetry.js';
import { prisma } from '../../lib/prisma.js';
import { calcularEstadoConexao } from '../../lib/machinePolicy.js';
import { publicarEventoEmpresa } from '../../lib/realtime.js';
import { registrarAuditoria } from '../../lib/audit.js';
import { buildReport,validateRecord,sameRecord,writableRoles } from './operation.logic.js';

export function createOperationController(db,{state=calcularEstadoConexao,publish=publicarEventoEmpresa,audit=registrarAuditoria}={}) {
  const cache=new Map();
  const invalidate=empresaId=>{for(const key of cache.keys())if(key.startsWith(`${empresaId}:`))cache.delete(key);};
  async function report(req,res,next) {
    try {
      const days=Number(req.query.dias??1), id=req.query.maquinaId==null?null:Number(req.query.maquinaId), source=req.query.origem??'TELEMETRIA';
      if (![1,7,31].includes(days) || (id!==null&&(!Number.isSafeInteger(id)||id<1)) || !['TELEMETRIA','REGISTROS'].includes(source)) return res.status(400).json({mensagem:'Filtro inválido.'});
      let all=await db.maquina.findMany({where:{empresaId:req.auth.empresaId,ativo:true},orderBy:{id:'asc'},take:101,select:{id:true,nome:true,modelo:true,tipo:true,controlador:true,modoSimulacao:true,status:true,statusConexao:true,ultimaTelemetriaEm:true,ultimoHeartbeatEm:true,intervaloLeitura:true,telemetria:{orderBy:{criadoEm:'desc'},take:1,select:{dadosExtras:true,origem:true}}}});
      if (id!==null&&!all.some(m=>m.id===id)) {
        const selected=await db.maquina.findFirst({where:{id,empresaId:req.auth.empresaId,ativo:true},select:{id:true,nome:true,modelo:true,tipo:true,controlador:true,modoSimulacao:true,status:true,statusConexao:true,ultimaTelemetriaEm:true,ultimoHeartbeatEm:true,intervaloLeitura:true,telemetria:{orderBy:{criadoEm:'desc'},take:1,select:{dadosExtras:true,origem:true}}}});
        if(!selected)return res.status(404).json({mensagem:'Máquina indisponível.'});
        all=[...all.slice(0,99),selected];
      }
      const cacheKey=`${req.auth.empresaId}:${req.auth.cargo}:${days}:${id}:${source}:`+JSON.stringify(all.map(m=>[m.id,m.nome,m.modoSimulacao,m.controlador,m.tipo]));
      const cached=cache.get(cacheKey);
      if(cached && Date.now()-cached.at<3000){res.setHeader('Cache-Control','no-store');return res.json(cached.data);}
      const machines=all.filter(m=>id===null||m.id===id).slice(0,100), ids=machines.map(m=>m.id), end=new Date(),start=new Date(end.getTime()-days*86400000);
      let readings=[],baselines=[],records=[],deltas=null,truncated=id===null&&all.length>100;
      if (ids.length && source==='REGISTROS') {
        records=await db.industrialRecord.findMany({where:{empresaId:req.auth.empresaId,maquinaId:{in:ids},ativo:true,ocorridoEm:{gte:start,lte:end}},orderBy:[{ocorridoEm:'asc'},{id:'asc'}],take:12001});
        truncated ||= records.length>12000;
        if(truncated) records=[];
      } else if (ids.length) {
        deltas=await db.$transaction(async tx=>{
          await tx.$executeRaw`SET LOCAL statement_timeout = '8000ms'`;
          return tx.$queryRaw(telemetryQuery({empresaId:req.auth.empresaId,ids,start,end}));
        },{timeout:10000,maxWait:3000});
      }
      const result=buildReport({machines,readings:readings.slice(0,12000),baselines:baselines.filter(Boolean),records,source,start,end,truncated,deltas});
      res.setHeader('Cache-Control','no-store');
      const data={...result,podeAuditar:req.auth.cargo==='ADMINISTRADOR',podeRegistrar:writableRoles.has(req.auth.cargo),podeParar:['ADMINISTRADOR','SUPERVISOR','TECNICO','OPERADOR'].includes(req.auth.cargo),maquinaId:id,maquinas:all.slice(0,100).map(m=>({id:m.id,nome:m.nome,modelo:m.modelo,tipo:m.tipo,controlador:m.controlador,simulacao:m.modoSimulacao,online:!m.modoSimulacao&&state(m).codigo==='CONECTADA',ultimaTelemetriaEm:m.ultimaTelemetriaEm,joints:!m.modoSimulacao&&m.telemetria?.[0]?.origem!=='SIMULADOR'?Object.fromEntries(['j1','j2','j3','j4'].filter(k=>Number.isFinite(m.telemetria?.[0]?.dadosExtras?.dobot?.joints?.[k])&&Math.abs(m.telemetria[0].dadosExtras.dobot.joints[k])<=360).map(k=>[k,m.telemetria[0].dadosExtras.dobot.joints[k]])):null}))};
      if(cache.size>=80)cache.delete(cache.keys().next().value);cache.set(cacheKey,{at:Date.now(),data});
      res.json(data);
    } catch(error){if(error.code==='P2028'||error.meta?.code==='57014')return res.status(503).json({codigo:'OPERATION_QUERY_TIMEOUT',mensagem:'Consulta demorou demais. Selecione uma máquina ou período menor.'});next(error);}
  }
  async function create(req,res,next) {
    try {
      if(!writableRoles.has(req.auth.cargo)) return res.status(403).json({mensagem:'Seu cargo não permite registrar produção.'});
      const data=validateRecord(req.body);
      const machine=await db.maquina.findFirst({where:{id:data.maquinaId,empresaId:req.auth.empresaId,ativo:true},select:{id:true,modoSimulacao:true}});
      if(!machine) return res.status(404).json({mensagem:'Máquina indisponível.'});
      if(machine.modoSimulacao) return res.status(409).json({mensagem:'Registros reais exigem equipamento fora do modo simulação.'});
      const where={empresaId_eventoId:{empresaId:req.auth.empresaId,eventoId:data.eventoId}};
      const existing=await db.industrialRecord.findUnique({where});
      const respondExisting=row=>row.ativo&&sameRecord(row,data)?res.status(200).json({id:row.id,repetido:true}):res.status(409).json({mensagem:'Identificador já utilizado por outro registro ou por registro removido.'});
      if(existing) return respondExisting(existing);
      let row;
      try {row=await db.industrialRecord.create({data:{...data,empresaId:req.auth.empresaId,criadoPorId:req.auth.usuarioId}});}
      catch(error){if(error.code==='P2002'){const duplicate=await db.industrialRecord.findUnique({where});if(duplicate)return respondExisting(duplicate);}throw error;}
      await audit({req,acao:'REGISTRAR_PRODUCAO',entidade:'OPERACAO',detalhes:{registroId:row.id,maquinaId:data.maquinaId}});
      invalidate(req.auth.empresaId);
      publish(req.auth.empresaId,'operacao.registrada',{maquinaId:data.maquinaId});
      res.status(201).json({id:row.id,repetido:false});
    }catch(error){next(error);}
  }
  async function remove(req,res,next) {
    try {
      if(!writableRoles.has(req.auth.cargo))return res.status(403).json({mensagem:'Sem permissão.'});
      if(!/^[a-zA-Z0-9-]{20,60}$/.test(req.params.id||'')) return res.status(400).json({mensagem:'Identificador inválido.'});
      const result=await db.industrialRecord.updateMany({where:{id:req.params.id,empresaId:req.auth.empresaId,ativo:true,maquina:{ativo:true}},data:{ativo:false}});
      if(!result.count)return res.status(404).json({mensagem:'Registro indisponível.'});
      await audit({req,acao:'REMOVER_REGISTRO_PRODUCAO',entidade:'OPERACAO',detalhes:{registroId:req.params.id}});
      invalidate(req.auth.empresaId);
      publish(req.auth.empresaId,'operacao.removida',{});res.json({removido:true});
    }catch(error){next(error);}
  }
  return {report,create,remove};
}
export const operationController=createOperationController(prisma);
