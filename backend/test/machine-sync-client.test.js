import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
class ClientEvent extends Event {
  constructor(type, options = {}) { super(type); this.detail = options.detail; }
}
const source = fs.readFileSync(new URL('../../frontend/assets/js/machine-sync.js', import.meta.url), 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function harness(read) {
  const window = new EventTarget();
  const store = new Map([['empresa', JSON.stringify({ id: 3 })]]);
  const intervals = new Map();let seq = 0;
  const localStorage = {getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
  vm.runInNewContext(source, {window,localStorage,CustomEvent:ClientEvent,AbortController,Date,console,
    setTimeout,clearTimeout,setInterval:fn=>{intervals.set(++seq,fn);return seq;},clearInterval:id=>intervals.delete(id)});
  const renders=[],removed=[],errors=[];
  const client=window.SteelControlMachineSync.create({read,render:items=>renders.push(items.map(x=>({...x}))),onRemove:id=>removed.push(id),onError:e=>errors.push(e)});
  return {window,client,store,renders,removed,errors,intervals,
    emit:(tipo,id,empresaId=3)=>window.dispatchEvent(new ClientEvent('steelcontrol:empresa-evento',{detail:{tipo,empresaId,dados:{maquinaId:id}}}))};
}
test('exclusão remove o cartão antes de esperar qualquer outra resposta HTTP',async()=>{
  let next=[{id:7,nome:'Dobot'}];const h=harness(async()=>next);
  await h.client.refresh();next=[];
  h.emit('maquina.desativada',7);
  assert.deepEqual(h.renders.at(-1),[]);
  assert.deepEqual(h.removed,[7]);
  await settle();h.client.stop();
});
test('resposta antiga não ressuscita equipamento removido durante o carregamento',async()=>{
  const old=deferred();let calls=0;
  const h=harness(()=>{calls++;return calls===1?Promise.resolve([{id:7}]):calls===2?old.promise:Promise.resolve([]);});
  await h.client.refresh();const pending=h.client.refresh();
  h.emit('maquina.desativada',7);
  old.resolve([{id:7}]);await pending;
  assert.deepEqual(h.renders.at(-1),[]);assert.equal(calls,3);
  assert.equal(h.renders.slice(1).some(items=>items.some(x=>x.id===7)),false);
  h.client.stop();
});
test('cadastro e edição chegam pelos eventos sem clicar em atualizar',async()=>{
  let next=[];const h=harness(async()=>next);await h.client.refresh();
  next=[{id:9,nome:'Novo robô'}];h.emit('maquina.criada',9);await settle();
  assert.equal(h.renders.at(-1)[0].nome,'Novo robô');
  next=[{id:9,nome:'Robô editado'}];h.emit('maquina.atualizada',9);await settle();
  assert.equal(h.renders.at(-1)[0].nome,'Robô editado');h.client.stop();
});
test('reconexão SSE e verificação periódica recuperam eventos perdidos',async()=>{
  let next=[{id:4}];const h=harness(async()=>next);await h.client.refresh();
  next=[];h.emit('conectado');await settle();
  assert.deepEqual(h.renders.at(-1),[]);assert.deepEqual(h.removed,[4]);
  next=[{id:8}];for(const fn of h.intervals.values())fn();await settle();
  assert.equal(h.renders.at(-1)[0].id,8);h.client.stop();
});
test('rajada de eventos agrupa carregamentos e mantém somente a revisão nova',async()=>{
  const delayed=deferred();let calls=0;
  const h=harness(()=>++calls===1?delayed.promise:Promise.resolve([{id:20,nome:'Atual'}]));
  const loading=h.client.refresh();
  for(let n=0;n<20;n++)h.emit('maquina.atualizada',20);
  delayed.resolve([{id:20,nome:'Antigo'}]);await loading;
  assert.equal(calls,2);assert.equal(h.renders.length,1);assert.equal(h.renders[0][0].nome,'Atual');h.client.stop();
});
test('evento de outra empresa não altera a lista',async()=>{
  let calls=0;const h=harness(async()=>{calls++;return [{id:7}];});await h.client.refresh();
  h.emit('maquina.desativada',7,99);await settle();
  assert.equal(calls,1);assert.equal(h.renders.at(-1)[0].id,7);h.client.stop();
});
test('falha de rede preserva a lista e o fechamento cancela atualizações',async()=>{
  let fail=false;const h=harness(async()=>{if(fail)throw Error('offline');return [{id:7}];});
  await h.client.refresh();fail=true;await h.client.refresh();
  assert.equal(h.renders.at(-1)[0].id,7);assert.equal(h.errors.length,1);
  h.client.stop();h.emit('maquina.desativada',7);await settle();
  assert.equal(h.renders.at(-1)[0].id,7);assert.equal(h.intervals.size,0);
});
test('notificação entre janelas tem somente identificação da empresa e da máquina',()=>{
  const h=harness(async()=>[]);let received;
  h.window.addEventListener('steelcontrol:empresa-evento',e=>{received=e.detail;});
  h.window.SteelControlMachineSync.notify('maquina.criada',12);
  const saved=JSON.parse(h.store.get('steelcontrolMachinesChanged'));
  assert.equal(saved.empresaId,3);assert.equal(saved.dados.maquinaId,12);
  assert.deepEqual(Object.keys(saved.dados),['maquinaId']);assert.equal(received.tipo,'maquina.criada');
  h.client.stop();
});
