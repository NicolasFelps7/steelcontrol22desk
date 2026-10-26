import test from 'node:test';
import assert from 'node:assert/strict';
import {adapterCatalog,connectionCapabilities} from '../src/modules/connections/adapterCatalog.js';
const machine=()=>({tipo:'Compressor personalizado',controlador:'OUTRO',modoSimulacao:false,intervaloLeitura:2000,ultimaTelemetriaEm:new Date(),integracaoMeta:{hmi:{remoteControlEnabled:true}}});
const link=()=>({driver:'SERIAL_JSON',ativa:true,estado:'ONLINE',comandos:true,parametros:{commandMap:{IHM_START:'START'}},host:{tipo:'EDGE',vistoEm:new Date(),pairingAte:new Date(Date.now()+60000)}});
test('categoria livre não impede capacidades de um adaptador de comunicação',()=>{
 const caps=connectionCapabilities(machine(),link());assert.equal(caps.categoria,'Compressor personalizado');assert.equal(caps.monitoramento.confirmado,true);assert.equal(caps.controle.habilitado,true);
});
test('abrir porta ou heartbeat sem telemetria não comprova monitoramento',()=>{
 const m=machine();m.ultimaTelemetriaEm=null;assert.equal(connectionCapabilities(m,link()).monitoramento.confirmado,false);
});
test('simulação, revogação e falta de autorização remota nunca liberam controle real',()=>{
 const m=machine(),l=link();m.integracaoMeta.hmi.remoteControlEnabled=false;assert.equal(connectionCapabilities(m,l).controle.habilitado,false);
 l.host.revogadoEm=new Date();assert.equal(connectionCapabilities(m,l).monitoramento.confirmado,false);
 const expired=link();expired.host.tipo='NAVEGADOR';assert.equal(connectionCapabilities(m,expired).monitoramento.confirmado,false);
 m.modoSimulacao=true;assert.equal(connectionCapabilities(m,link()).situacao,'SIMULACAO');assert.equal(connectionCapabilities(m,link()).controle.habilitado,false);
});
test('adaptador inexistente exige integração, sem afirmar suporte automático',()=>{
 const l=link();l.driver='PROPRIETARIO';assert.equal(connectionCapabilities(machine(),l).situacao,'REQUER_ADAPTADOR');
 assert.equal(connectionCapabilities(machine(),null).cadastro,true);assert.equal(connectionCapabilities(machine(),null).monitoramento.confirmado,false);
 assert.ok(adapterCatalog.find(a=>a.id==='MODBUS_TCP').ambientes.every(x=>x!=='NAVEGADOR'));
});
