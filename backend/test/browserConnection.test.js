import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const launcher=fs.readFileSync(new URL('../../frontend/assets/js/edge-launcher.js',import.meta.url),'utf8');
test('o site encaminha somente o ID ao Edge e não transfere a chave por IPC',async()=>{
 const calls=[],window={steelControlComputer:{openEdge:async id=>calls.push(id)}};
 vm.runInNewContext(launcher,{window});
 await window.abrirSteelControlEdge({id:7,nome:'Máquina',deviceKey:'never-send'});assert.deepEqual(calls,[7]);
 await window.abrirSteelControlEdge({id:8,modoSimulacao:true});assert.deepEqual(calls,[7]);
 await assert.rejects(()=>window.abrirSteelControlEdge({id:'7; command'}));
});
test('arquivos de compatibilidade não mantêm a ponte nem pedem acesso serial',async()=>{
 const retired=fs.readFileSync(new URL('../../frontend/assets/js/browser-machine-bridge.js',import.meta.url),'utf8');
 let closed=false;const window={SteelControlBrowserBridge:{close:async()=>{closed=true;}}};vm.runInNewContext(retired,{window,Promise});
 assert.equal(closed,true);assert.equal(window.SteelControlBrowserBridge,undefined);assert.ok(!retired.includes('requestPort'));
 const html=fs.readFileSync(new URL('../../frontend/maquinas.html',import.meta.url),'utf8');assert.ok(!html.includes('src="assets/js/browser-machine-bridge'));assert.ok(html.includes('assets/js/edge-launcher.js'));
});
