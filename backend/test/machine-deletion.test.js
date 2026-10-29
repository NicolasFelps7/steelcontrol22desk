import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
Object.assign(process.env,{NODE_ENV:'development',SECURITY_PROFILE:'development',DATABASE_URL:'postgresql://test:test@127.0.0.1:5432/test',JWT_SECRET:'machine-deletion-tests-'.repeat(4)});
const {prisma}=await import('../src/lib/prisma.js');
const {excluir}=await import('../src/modules/machines/machine.controller.js');
const undo=[];
function patch(obj,key,fn){const old=obj[key];obj[key]=fn;undo.push(()=>obj[key]=old);}
afterEach(()=>{while(undo.length)undo.pop()();});
function response(){return{code:200,status(n){this.code=n;return this;},json(body){this.body=body;return this;}};}
const req=(cargo='ADMINISTRADOR',id='7')=>({params:{id},auth:{cargo,empresaId:3,usuarioId:8}});
test('exclusão revoga conexão, chave e comandos na mesma transação e preserva código',async()=>{
  const calls=[];
  patch(prisma,'$transaction',async fn=>fn({
    $executeRaw:async()=>{calls.push('lock');},
    maquina:{findFirst:async q=>{assert.deepEqual(q.where,{id:7,empresaId:3,ativo:true});return{nome:'Dobot',codigo:'ROBO-1'};},update:async q=>{calls.push('machine');assert.equal(q.data.ativo,false);assert.equal(q.data.deviceKeyHash,null);assert.equal(q.data.codigo,undefined);assert.ok(q.data.logs.create);}},
    machineConnection:{updateMany:async q=>{calls.push('connection');assert.deepEqual(q.where,{maquinaId:7,empresaId:3});assert.equal(q.data.ativa,false);assert.equal(q.data.segredo,null);assert.equal(q.data.comandos,false);}},
    comandoMaquina:{updateMany:async q=>{calls.push('commands');assert.equal(q.data.status,'CANCELADO');assert.deepEqual(q.where.status.in,['PENDENTE','ENTREGUE']);}}
  }));
  patch(prisma.auditLog,'create',async()=>({}));
  const res=response();await excluir(req(),res,error=>{throw error;});
  assert.equal(res.code,200);assert.deepEqual(calls,['lock','connection','commands','machine']);
});
test('máquina de outra empresa ou já desativada não é alterada',async()=>{
  patch(prisma,'$transaction',async fn=>fn({$executeRaw:async()=>{},maquina:{findFirst:async()=>null,update:async()=>assert.fail('write inesperado')}}));
  const res=response();await excluir(req(),res,error=>{throw error;});assert.equal(res.code,404);
});
test('permissão e ID são verificados antes do banco',async()=>{
  patch(prisma,'$transaction',async()=>assert.fail('não deve acessar banco'));
  let res=response();await excluir(req('OPERADOR'),res,error=>{throw error;});assert.equal(res.code,403);
  for(const id of ['x','0','-1','2147483648']){res=response();await excluir(req('ADMINISTRADOR',id),res,error=>{throw error;});assert.equal(res.code,400);}
});
