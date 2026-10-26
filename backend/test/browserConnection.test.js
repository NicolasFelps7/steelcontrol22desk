import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const adapters=require('../../frontend/assets/js/machine-adapters.js');
const source=fs.readFileSync(new URL('../../frontend/assets/js/browser-machine-bridge.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
 const calls=[],intervals=[],writes=[],states=[];let stream,config=null,company=3,command=null;
 const port={readable:new ReadableStream({start(c){stream=c;}}),writable:new WritableStream({write(bytes){writes.push(JSON.parse(new TextDecoder().decode(bytes)));}}),async open(){calls.push('port.open');},async close(){calls.push('port.close');}};
 const events={};
 const window={isSecureContext:true,API_URL:'https://example.test',addEventListener(name,fn){events[name]=fn;},dispatchEvent(event){states.push(event);}};
 const fetch=async(url,options={})=>{
  const path=new URL(url).pathname;calls.push(path);
  let data={};
  if(path==='/conexoes/navegador/iniciar')data={id:'host',token:'unit-browser-credential',empresaId:3};
  else if(path==='/conexoes/navegador/autorizacao')data={empresaId:company};
  else if(path==='/conexoes/computador/sincronizar')data={vinculado:true,conexoes:config?[config]:[]};
  else if(path==='/device/7/config')data={integracaoMeta:{hmi:{remoteControlEnabled:true}}};
  else if(path==='/device/7/comandos/proximo'){const next=command;command=null;return {ok:true,status:next?200:204,json:async()=>next};}
  else if(path==='/device/7/telemetria')data={ok:true};
  else if(path.includes('/confirmar'))calls.push(JSON.parse(options.body).status);
  return {ok:true,status:200,json:async()=>data};
 };
 const context={window,navigator:{serial:{async requestPort(){calls.push('requestPort');return port;}}},location:{origin:'https://example.test'},SteelControlAdapters:adapters,fetch,fetchAutenticado:fetch,AbortSignal,CustomEvent,crypto:webcrypto,TextDecoder,TextEncoder,setInterval(fn){intervals.push(fn);return intervals.length;},clearInterval(){},Date,Map,Set,JSON};
 Object.defineProperty(context,'localStorage',{get(){throw Error('Credentials must not be persisted');}});
 vm.runInNewContext(source,context);
 return {bridge:window.SteelControlBrowserBridge,calls,writes,states,intervals,port,send(value){stream.enqueue(new TextEncoder().encode(JSON.stringify(value)+'\n'));},setCompany(v){company=v;},setConfig(portId){config={id:'link',maquinaId:7,driver:'SERIAL_JSON',versao:1,ativa:true,comandos:true,credencial:'unit-device-credential',parametros:{serialPort:portId,commandMap:{IHM_START:'RUN'}}};},setCommand(value){command=value;}};
}
test('normalizador aceita métricas mapeadas e preserva campos de categorias diferentes',()=>{
 const result=adapters.normalize({sensors:{temp:42},pressao:7},{temperatura:'sensors.temp'});
 assert.equal(result.temperatura,42);assert.equal(result.dadosExtras.equipamento.pressao,7);
 assert.equal(adapters.normalize({rpm:1000}).temperatura,undefined);
 assert.throws(()=>adapters.normalize({temperatura:'falha'}));assert.throws(()=>adapters.create('PROPRIETARIO'));
});
test('autoriza porta no gesto do usuário antes da rede e não grava credenciais no armazenamento',async()=>{
 const f=fixture();const result=await f.bridge.authorize();assert.equal(f.calls[0],'requestPort');assert.match(result.serialPort,/^browser-/);assert.equal(result.hostId,'host');assert.equal(f.bridge.active(),true);await f.bridge.close();
});
test('comando USB espera ACK físico, recusa ACK desconhecido e encerra ao mudar de empresa',async()=>{
 const f=fixture();const p=await f.bridge.authorize();f.setConfig(p.serialPort);await f.bridge.sync();
 f.send({temperatura:25,dadosExtras:{hmi:{interlocks:{startPermitted:true,estopOk:true}}}});await tick();await tick();
 const cmd={id:9,comando:'IHM_START',tentativaEntrega:1,payload:{expiresAt:new Date(Date.now()+10000).toISOString()}};
 f.setCommand(cmd);await f.intervals[1]();await tick();
 assert.equal(f.writes.length,1);assert.equal(f.writes[0].comando,'RUN');assert.ok(!f.calls.includes('CONCLUIDO'));
 f.send({ack:{id:999,status:'CONCLUIDO'}});await tick();assert.ok(!f.calls.includes('CONCLUIDO'));
 f.send({ack:{id:9,status:'CONCLUIDO'}});await tick();await tick();assert.ok(f.calls.includes('CONCLUIDO'));
 f.setCompany(99);await f.bridge.sync();assert.ok(f.calls.includes('port.close'));
 await f.bridge.close();
});
test('comando reentregue nunca é executado novamente no equipamento',async()=>{
 const f=fixture();const p=await f.bridge.authorize();f.setConfig(p.serialPort);await f.bridge.sync();f.send({corrente:1});await tick();await tick();
 f.setCommand({id:10,comando:'IHM_START',tentativaEntrega:2,payload:{expiresAt:new Date(Date.now()+10000).toISOString()}});
 await f.intervals[1]();await tick();assert.equal(f.writes.length,0);assert.ok(f.calls.includes('FALHOU'));await f.bridge.close();
});
test('START sem intertravamento físico positivo não chega à porta',async()=>{
 const f=fixture();const p=await f.bridge.authorize();f.setConfig(p.serialPort);await f.bridge.sync();f.send({temperatura:25});await tick();await tick();
 f.setCommand({id:11,comando:'IHM_START',tentativaEntrega:1,payload:{expiresAt:new Date(Date.now()+10000).toISOString()}});
 await f.intervals[1]();await tick();assert.equal(f.writes.length,0);assert.ok(f.calls.includes('FALHOU'));await f.bridge.close();
});
