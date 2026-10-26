import test,{after,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
Object.assign(process.env,{NODE_ENV:'development',SECURITY_PROFILE:'development',DATABASE_URL:'postgresql://test:test@127.0.0.1:5432/test',JWT_SECRET:'diagnostic-tests-'.repeat(5),REDIS_URL:''});
const {prisma}=await import('../src/lib/prisma.js');
const {diagnosticRoutes}=await import('../src/modules/connections/diagnostic.routes.js');
const {diagnosticFilters,feedQuery,publicDiagnostic,diagnosticCsv}=await import('../src/modules/connections/diagnosticFeed.js');
const {transitionConnection,sweepOfflineConnections}=await import('../src/lib/diagnostics.js');
const {accessAudit}=await import('../src/middlewares/accessAudit.js');
const restores=[];function patch(object,key,fn){const old=object[key];object[key]=fn;restores.push(()=>object[key]=old);}
afterEach(()=>{while(restores.length)restores.pop()();});
const app=express();app.use(express.json());app.use('/diagnostico',diagnosticRoutes);app.use((e,req,res,next)=>res.status(500).json({mensagem:e.message}));
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/diagnostico';
after(async()=>{await new Promise(r=>server.close(r));await prisma.$disconnect();});
function auth(cargo='ADMINISTRADOR'){
 patch(prisma.usuario,'findUnique',async()=>({id:7,empresaId:3,nome:'Responsável',ativo:true,emailVerificadoEm:new Date(),cargo,statusVinculo:'APROVADO',empresa:{status:'ATIVA'},tokenVersion:0}));
 patch(prisma.auditLog,'create',async()=>({id:1}));return {authorization:'Bearer '+jwt.sign({usuarioId:7},process.env.JWT_SECRET)};
}
async function call(path='',{headers={},body,method='GET'}={}){const r=await fetch(base+path,{method,headers:{'content-type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
const event={codigo:'PACOTE_INVALIDO',maquinaId:4,eventoCliente:'12345678-1234-1234-1234-123456789abc'};
test('diagnóstico exige autenticação e impede acesso de operador',async()=>{
 assert.equal((await call()).status,401);assert.equal((await call('',{headers:auth('OPERADOR')})).status,403);
});
test('evento de máquina de outra empresa é recusado',async()=>{
 const headers=auth();patch(prisma.maquina,'findFirst',async q=>{assert.equal(q.where.empresaId,3);return null;});assert.equal((await call('/eventos',{method:'POST',headers,body:event})).status,404);
});
test('coletor usa códigos conhecidos e não persiste mensagens, tokens ou dados arbitrários',async()=>{
 const headers=auth();let saved;patch(prisma.maquina,'findFirst',async()=>({id:4}));patch(prisma.diagnosticEvent,'create',async q=>{saved=q.data;return {id:'e'};});
 const result=await call('/eventos',{method:'POST',headers,body:{...event,mensagem:'password=private',token:'private',detalhes:{face:[1,2,3]}}});
 assert.equal(result.status,202);assert.equal(saved.empresaId,3);assert.equal(saved.usuarioId,7);assert.equal(saved.nivel,'ERROR');assert.equal(saved.mensagem,undefined);assert.equal(saved.token,undefined);assert.equal(saved.detalhes,undefined);
 assert.equal((await call('/eventos',{method:'POST',headers,body:{...event,codigo:'ERROR_RAW'}})).status,400);
});
test('evento com empresa anterior é recusado sem reatribuição',async()=>{
 assert.equal((await call('/eventos',{method:'POST',headers:auth(),body:{...event,empresaId:999}})).status,403);
});
test('reenvio do mesmo id é idempotente por empresa',async()=>{
 const headers=auth();patch(prisma.maquina,'findFirst',async()=>({id:4}));patch(prisma.diagnosticEvent,'create',async()=>{throw Object.assign(new Error('duplicate'),{code:'P2002'});});
 patch(prisma.diagnosticEvent,'findUnique',async q=>{assert.equal(q.where.empresaId_eventoCliente.empresaId,3);return {id:'e'};});assert.equal((await call('/eventos',{method:'POST',headers,body:event})).status,202);
});
test('consulta de técnico não inclui auditoria administrativa e usa empresa da sessão',async()=>{
 const headers=auth('TECNICO');let queries=0;
 patch(prisma,'$queryRaw',async sql=>{queries++;assert.ok(!sql.text.includes('"AuditLog"'));assert.ok(!sql.values.includes(999));return sql.text.includes('COUNT(*)')?[{total:0}]:[];});
 const result=await call('?empresaId=999',{headers});assert.equal(result.status,200);assert.equal(result.data.total,0);assert.equal(queries,2);
});
test('exportação aplica os mesmos filtros, remove credenciais e informa limite',async()=>{
 const headers=auth();patch(prisma,'$queryRaw',async sql=>{assert.ok(sql.values.includes(4));return sql.text.includes('COUNT(*)')?[{total:6000}]:[{id:'log:1',data:new Date(),maquina:'=EXEC()',usuario:'Sistema',origem:'OPERACAO',nivel:'INFO',codigo:'EVENTO_OPERACIONAL',mensagem:'token=private-value'}];});
 const result=await call('/exportar?maquinaId=4',{headers});assert.equal(result.status,200);assert.equal(result.data.limitado,true);assert.equal(result.data.exportados,1);assert.ok(!result.data.conteudo.includes('private-value'));assert.ok(result.data.conteudo.includes("'=EXEC()"));
});
test('filtros rejeitam intervalo excessivo, severidade inventada e ids inválidos',()=>{
 assert.throws(()=>diagnosticFilters({de:'2000-01-01'}));assert.throws(()=>diagnosticFilters({nivel:'DEBUG_RAW'}));assert.throws(()=>diagnosticFilters({maquinaId:'3 OR 1=1'}));assert.throws(()=>diagnosticFilters({limit:99999}));
 const q=feedQuery(3,false,diagnosticFilters({q:"'; DROP TABLE empresa;--"}));assert.ok(!q.text.includes('DROP TABLE'));assert.ok(q.values.some(v=>String(v).includes('DROP TABLE')));
});
test('redação remove chaves e credenciais e CSV neutraliza fórmulas',()=>{
 const safe=publicDiagnostic({codigo:'LEGADO',mensagem:'Bearer abc.def scd_abc123 https://user:pass@example.test token=secret'});assert.ok(!safe.mensagem.includes('abc.def'));assert.ok(!safe.mensagem.includes('scd_'));assert.ok(!safe.mensagem.includes('user:pass'));assert.ok(!safe.mensagem.includes('=secret'));
 assert.ok(diagnosticCsv([{data:new Date(),maquina:'  @FORMULA'}]).includes("'  @FORMULA"));
 const quoted=publicDiagnostic({codigo:'LEGADO',mensagem:'password="two secret words" embedding=[0.1,0.2,0.3]',payload:{private:'never-return'}});assert.ok(!quoted.mensagem.includes('secret words'));assert.ok(!quoted.mensagem.includes('0.2'));assert.equal(quoted.payload,undefined);
});
test('estado repetido não duplica evento e reconexão registra a transição',async()=>{
 let changes=0,events=0;const db={machineConnection:{updateMany:async()=>{changes++;return {count:1};}},diagnosticEvent:{create:async q=>{events++;assert.equal(q.data.codigo,'CONEXAO_CONFIRMADA');return {};}}};
 const link={id:'c',empresaId:3,maquinaId:4,versao:1,estado:'ONLINE'};await transitionConnection(link,'ONLINE',db);assert.equal(changes,0);await transitionConnection({...link,estado:'OFFLINE'},'ONLINE',db);assert.equal(events,1);
});
test('monitor offline revalida heartbeat no update para evitar evento falso',async()=>{
 patch(prisma,'$transaction',async fn=>fn(prisma));
 patch(prisma.machineConnection,'findMany',async()=>[{id:'c',empresaId:3,maquinaId:4,versao:1}]);let check;
 patch(prisma.machineConnection,'updateMany',async q=>{check=q.where;return {count:0};});patch(prisma.diagnosticEvent,'create',async()=>assert.fail('Não deve registrar offline após heartbeat novo'));
 await sweepOfflineConnections();assert.ok(check.host.OR.some(x=>x.vistoEm?.lt instanceof Date));
});
test('auditoria não duplica pacotes de telemetria bem-sucedidos mas preserva falhas sem payload',async()=>{
 let saved=null;patch(prisma.auditLog,'create',async q=>{saved=q.data;return {};});
 const request={path:'/device/4/telemetria',method:'POST',auth:{empresaId:3,usuarioId:7},body:{token:'never-collect'}};
 let finish;const response={statusCode:200,once:(name,fn)=>{finish=fn;}};
 accessAudit(request,response,()=>{});finish();assert.equal(saved,null);
 response.statusCode=500;finish();await new Promise(r=>setImmediate(r));assert.equal(saved.acao,'FALHA_SERVIDOR');assert.ok(!JSON.stringify(saved).includes('never-collect'));
});
