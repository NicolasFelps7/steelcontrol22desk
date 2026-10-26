import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { authRequired,requireRoles } from '../../middlewares/auth.js';
import { criarRateLimit } from '../../middlewares/security.js';
import { registrarAuditoria } from '../../lib/audit.js';
import { clientDiagnosticCodes,recordDiagnostic } from '../../lib/diagnostics.js';
import { diagnosticFilters,feedQuery,publicDiagnostic,diagnosticCsv } from './diagnosticFeed.js';
export const diagnosticRoutes=Router();
const run=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(error=>error.status===400?res.status(400).json({mensagem:error.message}):next(error));
diagnosticRoutes.use(authRequired,requireRoles('ADMINISTRADOR','SUPERVISOR','TECNICO'));
diagnosticRoutes.get('/maquinas',run(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.json(await prisma.maquina.findMany({where:{empresaId:req.auth.empresaId},select:{id:true,nome:true,ativo:true},orderBy:{nome:'asc'}}));
}));
diagnosticRoutes.post('/eventos',criarRateLimit({janelaMs:60000,limite:90,prefixo:'diagnostic-event'}),run(async(req,res)=>{
 const codigo=String(req.body?.codigo||'');
 const maquinaId=req.body?.maquinaId==null?null:Number(req.body.maquinaId);
 const eventId=String(req.body?.eventoCliente||'');
 if(!clientDiagnosticCodes.has(codigo)||!/^[-a-f0-9]{36}$/i.test(eventId)||(maquinaId!==null&&(!Number.isSafeInteger(maquinaId)||maquinaId<=0)))return res.status(400).json({mensagem:'Evento de diagnóstico inválido.'});
 if(req.body.empresaId!=null&&Number(req.body.empresaId)!==req.auth.empresaId)return res.status(403).json({mensagem:'Evento de outra empresa recusado.'});
 if(maquinaId!==null&&!await prisma.maquina.findFirst({where:{id:maquinaId,empresaId:req.auth.empresaId},select:{id:true}}))return res.status(404).json({mensagem:'Máquina não encontrada nesta empresa.'});
 // Apenas códigos conhecidos: nunca persistir mensagens livres de driver/cliente.
 const saved=await recordDiagnostic({empresaId:req.auth.empresaId,usuarioId:req.auth.usuarioId,maquinaId,codigo,origem:'NAVEGADOR',eventoCliente:eventId});
 if(!saved){const existing=await prisma.diagnosticEvent.findUnique({where:{empresaId_eventoCliente:{empresaId:req.auth.empresaId,eventoCliente:eventId}}});if(!existing)return res.status(503).json({mensagem:'Registro indisponível. O cliente pode reenviar o evento.'});}
 res.status(202).json({registrado:true});
}));
async function fetchFeed(req,exporting=false){
 const filters=diagnosticFilters(req.query),admin=req.auth.cargo==='ADMINISTRADOR';
 const [rows,counts]=await Promise.all([prisma.$queryRaw(feedQuery(req.auth.empresaId,admin,filters,{exporting})),prisma.$queryRaw(feedQuery(req.auth.empresaId,admin,filters,{count:true}))]);
 return {itens:rows.map(publicDiagnostic),total:Number(counts[0]?.total||0),limit:filters.limit,offset:filters.offset,geradoEm:new Date().toISOString()};
}
diagnosticRoutes.get('/',run(async(req,res)=>{res.setHeader('Cache-Control','no-store');res.json(await fetchFeed(req));}));
diagnosticRoutes.get('/exportar',criarRateLimit({janelaMs:60000,limite:6,prefixo:'diagnostic-export'}),run(async(req,res)=>{
 const data=await fetchFeed(req,true);
 await registrarAuditoria({req,acao:'EXPORTAR_DIAGNOSTICO',entidade:'RELATORIO',detalhes:{quantidade:data.itens.length,limitado:data.total>5000}});
 res.setHeader('Cache-Control','no-store');
 res.json({nomeArquivo:'SteelControl-diagnostico-'+new Date().toISOString().slice(0,10)+'.csv',conteudo:diagnosticCsv(data.itens),total:data.total,exportados:data.itens.length,limitado:data.total>5000});
}));
