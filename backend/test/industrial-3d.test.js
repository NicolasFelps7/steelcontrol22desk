import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL(`../../frontend/${name}`,import.meta.url),'utf8');
const context=vm.createContext({console});
vm.runInContext(read('assets/industrial3d/three.min.js'),context);
vm.runInContext(read('assets/industrial3d/machine-models.js'),context);
const {THREE:T,SteelMachineModels:M}=context;
test('15 famílias possuem malhas 3D finitas e selecionáveis, sem planos de fotografia',()=>{
 const signatures=new Set();
 for(const [kind,label]of M.kinds){
  const model=M.build({id:42,tipo:label});assert.equal(model.userData.kind,kind);assert.equal(model.userData.machineId,42);
  const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());assert(!bounds.isEmpty());assert([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>.1));
  let count=0;model.traverse(mesh=>{if(!mesh.isMesh)return;count++;assert(!mesh.material.map);assert(!mesh.material.wireframe);for(const n of mesh.geometry.attributes.position.array)assert(Number.isFinite(n));});assert(count>=9);
  signatures.add(`${count}:${size.toArray().map(n=>n.toFixed(2)).join(',')}`);
  model.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(0,10,0),new T.Vector3(0,-1,0));assert(ray.intersectObject(model,true).length>0);M.dispose(model);
 }
 assert(signatures.size>=14);
});
test('tipo físico prevalece sobre controlador; compressor não é prensa',()=>{
 assert.equal(M.classify({tipo:'Esteira industrial',controlador:'CLP_PLC'}),'conveyor');
 assert.equal(M.classify({tipo:'Compressor',controlador:'CNC'}),'compressor');
 assert.equal(M.classify({tipo:'Braço robótico',controlador:'DOBOT_MAGICIAN'}),'dobot');
 assert.equal(M.classify({tipo:'Personalizada',nome:'Torno 01'}),'lathe');
 assert.equal(M.classify({tipo:'<script>alert(1)</script>'}),'generic');
});
test('pose aceita somente juntas finitas de equipamento real online',()=>{
 const g=M.build({id:1,tipo:'Dobot Magician'}),j=g.userData.joints,start=j.yaw.rotation.y;
 M.applyState(g,{online:false,joints:{j1:90}});assert.equal(j.yaw.rotation.y,start);
 M.applyState(g,{online:true,simulacao:true,joints:{j1:90}});assert.equal(j.yaw.rotation.y,start);
 for(const j1 of [NaN,Infinity,361,'90']){M.applyState(g,{online:true,joints:{j1}});assert.equal(j.yaw.rotation.y,start);}
 M.applyState(g,{online:true,joints:{j1:90,j2:30,j3:60,j4:-20}});assert(Math.abs(j.yaw.rotation.y+Math.PI/2)<1e-8);assert(Math.abs(j.elbow.rotation.z-Math.PI/6)<1e-8);
 const pose=j.elbow.rotation.z;M.applyState(g,{online:true,joints:{j3:100}});assert.equal(j.elbow.rotation.z,pose);
});
test('todas as torres de estado acompanham online e ficam apagadas offline',()=>{
 const g=M.build({id:1,tipo:'Injetora'});assert(g.userData.statusLamps.length>=2);
 M.applyState(g,{online:true});for(const row of g.userData.statusLamps)assert.equal(row[0].material.color.getHex(),0x62c784);
 M.applyState(g,{online:false});for(const row of g.userData.statusLamps)for(const light of row)assert.equal(light.material.color.getHex(),0x27323a);
});
test('visualizador é local e isolado; componente Dobot está completo na central nova',()=>{
 const html=read('assets/industrial3d/index.html'),viewer=read('assets/industrial3d/machine-viewer.js');assert(html.includes("connect-src 'none'"));assert(!/https?:\/\//.test(html));assert(!/fetch\(|XMLHttpRequest|WebSocket|\.innerHTML\s*=/.test(viewer));
 const page=read('operacao.html'),component=read('assets/js/dobot-control-component.js');
 for(const match of component.matchAll(/\$\("([a-zA-Z0-9]+)"\)/g))assert(page.includes(`id="${match[1]}"`),`ID do componente: ${match[1]}`);
 assert(!page.includes('operation-floor.png'));assert(read('index.html').includes('url=/app/dashboard'));
});
