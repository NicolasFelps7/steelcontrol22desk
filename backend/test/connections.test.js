import test,{after,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
Object.assign(process.env,{NODE_ENV:'development',SECURITY_PROFILE:'development',DATABASE_URL:'postgresql://test:test@127.0.0.1:5432/test',JWT_SECRET:'internal-tests-'.repeat(5),REDIS_URL:''});
const {prisma}=await import('../src/lib/prisma.js');
const {connectionRoutes}=await import('../src/modules/connections/connection.routes.js');
const {seal,unseal,digest,validateConnection}=await import('../src/modules/connections/connectionSecurity.js');
const restores=[];
function patch(object,key,fn){const prev=object[key];object[key]=fn;restores.push(()=>object[key]=prev);}
afterEach(()=>{while(restores.length)restores.pop()();});
const app=express();app.use(express.json());app.use('/conexoes',connectionRoutes);app.use((err,req,res,next)=>res.status(err.status||500).json({mensagem:err.message}));
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}/conexoes`;
after(async()=>{await new Promise(r=>server.close(r));await prisma.$disconnect();});
function auth(cargo='ADMINISTRADOR'){
 patch(prisma.usuario,'findUnique',async()=>({id:7,empresaId:3,nome:'Teste',email:'unit@example.test',ativo:true,emailVerificadoEm:new Date(),cargo,tokenVersion:0,statusVinculo:'APROVADO',empresa:{status:'ATIVA'}}));
 patch(prisma.auditLog,'create',async()=>({id:1}));
 return {authorization:'Bearer '+jwt.sign({usuarioId:7,tokenVersion:0},process.env.JWT_SECRET)};
}
async function call(path,{method='GET',body,headers={}}={}){const r=await fetch(base+path,{method,headers:{'content-type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
test('credencial de provisionamento é cifrada e vinculada ao host/máquina/versão',()=>{
 const cipher=seal('private-test-key',process.env.JWT_SECRET,'h:7:2');assert.ok(!cipher.includes('private-test-key'));
 assert.equal(unseal(cipher,process.env.JWT_SECRET,'h:7:2'),'private-test-key');
 assert.throws(()=>unseal(cipher,process.env.JWT_SECRET,'other:7:2'));
 assert.throws(()=>unseal(cipher,'wrong-secret','h:7:2'));
});
test('parâmetros não podem forjar permissão do servidor ou injetar porta inválida',()=>{
 assert.equal(validateConnection({parametros:{serverRemoteControlEnabled:true}}).parametros.serverRemoteControlEnabled,undefined);
 assert.throws(()=>validateConnection({driver:'UNSUPPORTED'}));assert.throws(()=>validateConnection({parametros:{port:-4}}));
 assert.throws(()=>validateConnection({parametros:{serialPort:'COM3; command'}}));
});
test('visitante autenticado não configura conexão',async()=>{
 const r=await call('/maquinas/7',{method:'PUT',headers:auth('VISITANTE'),body:{hostId:'other'}});assert.equal(r.status,403);
});
test('computador de outra empresa não pode receber máquina da sessão',async()=>{
 const headers=auth();let query;patch(prisma.connectionHost,'findFirst',async q=>{query=q;return null;});
 const r=await call('/maquinas/7',{method:'PUT',headers,body:{hostId:'other',empresaId:99}});
 assert.equal(r.status,404);assert.equal(query.where.empresaId,3);
});
test('código expirado não vincula empresa',async()=>{
 const headers=auth();patch(prisma.connectionHost,'findUnique',async()=>({id:'h',empresaId:null,pairingAte:new Date(0)}));
 assert.equal((await call('/vincular',{method:'POST',headers,body:{codigo:'ABCDEF0123456789'}})).status,409);
});
test('duas tentativas de vínculo não assumem o mesmo computador',async()=>{
 const headers=auth();patch(prisma.connectionHost,'findUnique',async()=>({id:'h',empresaId:null,pairingAte:new Date(Date.now()+100000)}));
 patch(prisma.connectionHost,'updateMany',async q=>{assert.equal(q.where.empresaId,null);assert.equal(q.data.empresaId,3);return {count:0};});
 assert.equal((await call('/vincular',{method:'POST',headers,body:{codigo:'ABCDEF0123456789'}})).status,409);
});
test('host offline não recebe uma nova configuração',async()=>{
 const headers=auth();patch(prisma.connectionHost,'findFirst',async()=>({id:'h',empresaId:3,vistoEm:new Date(0)}));
 assert.equal((await call('/maquinas/7',{method:'PUT',headers,body:{hostId:'h'}})).status,409);
});
test('configuração gera chave interna sem devolvê-la à interface',async()=>{
 const headers=auth();const host={id:'h',empresaId:3,vistoEm:new Date(),portas:[{porta:'COM3'}]};let saved,keyUpdate;
 patch(prisma.connectionHost,'findFirst',async()=>host);
 patch(prisma,'$transaction',async fn=>fn({$queryRaw:async()=>[], $executeRaw:async()=>1,connectionHost:{findFirst:async()=>host},maquina:{findFirst:async()=>({id:7,controlador:'DOBOT_MAGICIAN'}),update:async q=>{keyUpdate=q;}},machineConnection:{findUnique:async()=>null,findMany:async()=>[],upsert:async q=>{saved=q.create;}}}));
 const r=await call('/maquinas/7',{method:'PUT',headers,body:{hostId:'h',driver:'DOBOT_MAGICIAN',parametros:{serialPort:'COM3'},comandos:false}});
 assert.equal(r.status,200);assert.equal(saved.empresaId,3);assert.equal(saved.comandos,false);assert.equal(saved.estado,'CONNECTING');
 const plain=unseal(saved.segredo,process.env.JWT_SECRET,'h:7:1');assert.match(plain,/^scd_/);assert.ok(!JSON.stringify(r.data).includes(plain));assert.equal(keyUpdate.data.deviceKeyHash,digest(plain));
});
test('estado público nunca inclui token ou chave cifrada',async()=>{
 const headers=auth();patch(prisma.maquina,'findFirst',async()=>({id:7}));
 patch(prisma.machineConnection,'findFirst',async q=>{assert.equal(q.where.empresaId,3);return {id:'c',hostId:'h',driver:'MOCK',parametros:{},ativa:true,comandos:false,estado:'ONLINE',segredo:'should-not-leak',host:{nome:'PC',vistoEm:new Date(),tokenHash:'hidden'}};});
 const r=await call('/maquinas/7',{headers});assert.equal(r.status,200);assert.ok(!JSON.stringify(r.data).includes('should-not-leak'));assert.ok(!JSON.stringify(r.data).includes('tokenHash'));
});
test('host revogado é recusado antes da leitura de perfis',async()=>{
 patch(prisma.connectionHost,'findUnique',async()=>({id:'h',revogadoEm:new Date()}));
 assert.equal((await call('/computador/sincronizar',{method:'POST',headers:{'x-connection-token':'t'.repeat(40)},body:{}})).status,401);
});
test('sincronização ignora empresa forjada e usa apenas empresa do host autenticado',async()=>{
 patch(prisma.connectionHost,'findUnique',async()=>({id:'h',empresaId:3}));patch(prisma.empresa,'findUnique',async()=>({status:'ATIVA'}));patch(prisma.connectionHost,'update',async()=>({}));
 patch(prisma.machineConnection,'findMany',async q=>{assert.deepEqual(q.where,{hostId:'h',empresaId:3});return [];});
 const r=await call('/computador/sincronizar',{method:'POST',headers:{'x-connection-token':'t'.repeat(40)},body:{empresaId:99,portas:[]}});
 assert.equal(r.status,200);assert.equal(r.data.vinculado,true);
});
test('sessão de navegador exige administrador e recebe empresa do usuário, sem confiar no body',async()=>{
  const headers=auth();let saved;
  patch(prisma.connectionHost,'create',async q=>{saved=q.data;return {id:'browser',pairingAte:q.data.pairingAte};});
  const r=await call('/navegador/iniciar',{method:'POST',headers,body:{empresaId:999}});
  assert.equal(r.status,201);assert.equal(saved.tipo,'NAVEGADOR');assert.equal(saved.empresaId,3);assert.equal(saved.tokenHash,digest(r.data.token));assert.equal(r.data.empresaId,3);
});
test('funcionário não inicia ponte USB no navegador',async()=>{
  assert.equal((await call('/navegador/iniciar',{method:'POST',headers:auth('OPERADOR'),body:{}})).status,403);
});
test('sessão de navegador expirada é recusada mesmo vinculada a empresa',async()=>{
  patch(prisma.connectionHost,'findUnique',async()=>({id:'h',empresaId:3,tipo:'NAVEGADOR',pairingAte:new Date(0)}));
  assert.equal((await call('/computador/sincronizar',{method:'POST',headers:{'x-connection-token':'x'.repeat(40)},body:{}})).status,401);
});
test('porta de navegador válida e mapeamentos rejeitam caminhos de protótipo',()=>{
  assert.equal(validateConnection({parametros:{serialPort:'browser-12345678-1234-1234-1234-123456789abc'}}).driver,'AUTO');
  assert.throws(()=>validateConnection({parametros:{fieldMap:{temperatura:'constructor.prototype'}}}));
  assert.throws(()=>validateConnection({parametros:{commandMap:{IHM_START:{arbitrary:'object'}}}}));
});
test('protocolo industrial nativo não pode ser configurado em host de navegador',async()=>{
  const headers=auth();patch(prisma.connectionHost,'findFirst',async()=>({id:'h',empresaId:3,tipo:'NAVEGADOR',vistoEm:new Date(),pairingAte:new Date(Date.now()+60000)}));
  assert.equal((await call('/maquinas/7',{method:'PUT',headers,body:{hostId:'h',driver:'MODBUS_TCP',parametros:{host:'192.0.2.1'}}})).status,409);
});
