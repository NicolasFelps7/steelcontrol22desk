'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8');
async function fixture(args=[]){
 const windows=[],handlers=new Map();const app=new EventEmitter();
 Object.assign(app,{isPackaged:true,setName(){},requestSingleInstanceLock:()=>true,whenReady:()=>Promise.resolve(),setAppUserModelId(){},setAsDefaultProtocolClient(name){app.protocol=name;},getPath:()=>'/tmp/steelcontrol-fixture',setLoginItemSettings(){},getLoginItemSettings:()=>({openAtLogin:true}),quit(){},exit(){assert.fail('O aplicativo não deveria falhar ao iniciar');}});
 class Window extends EventEmitter{
  constructor(options){super();this.options=options;this.webContents=new EventEmitter();Object.assign(this.webContents,{mainFrame:{url:''},setWindowOpenHandler(){},getURL:()=>this.url});windows.push(this);}
  isDestroyed(){return false;}isMinimized(){return false;}show(){this.visible=true;}focus(){}setTitle(value){this.title=value;}
  loadURL(url){this.url=url;this.webContents.mainFrame.url=url;return Promise.resolve();}
 }
 class Worker extends EventEmitter{start(){}request(){return Promise.resolve({codigo:'temporary-pairing-code'});}stop(){return Promise.resolve();}}
 class Tray{setToolTip(){}setContextMenu(){}on(){}}
 const electron={app,BrowserWindow:Window,Menu:{buildFromTemplate:x=>x,setApplicationMenu(){}},Tray,ipcMain:{handle:(key,fn)=>handlers.set(key,fn)},dialog:{showErrorBox(){assert.fail('Falha inesperada');},showMessageBox(){}},session:{fromPartition:()=>({setPermissionRequestHandler(){},setPermissionCheckHandler(){}})}};
 const runtimeRequire=name=>name==='electron'?electron:name==='./worker-client.cjs'?{WorkerClient:Worker}:name==='./security.cjs'?require('../security.cjs'):name==='./python-runtime.cjs'?require('../python-runtime.cjs'):name==='node:fs'?{readFileSync(){throw Error('first start');}}:require(name);
 vm.runInNewContext(source,{require:runtimeRequire,__dirname:path.resolve(__dirname,'..'),process:{argv:['app.exe',...args],platform:'win32',execPath:'/app.exe',resourcesPath:'/resources',env:{}},URL,Promise,console});
 await new Promise(resolve=>setImmediate(resolve));return {app,windows,handlers};
}
test('link a frio abre a janela Edge diretamente na máquina e preserva destino após login',async()=>{
 const f=await fixture(['steelcontrol://connect?maquinaId=7']);assert.equal(f.app.protocol,'steelcontrol');assert.equal(f.windows.length,1);
 const edge=f.windows[0];assert.match(edge.url,/edge=1&maquinaId=7/);
 await edge.loadURL('https://web-production-6682df.up.railway.app/app/login');edge.webContents.emit('did-finish-load');assert.match(edge.url,/login$/);
 await edge.loadURL('https://web-production-6682df.up.railway.app/app/maquinas');edge.webContents.emit('did-finish-load');assert.match(edge.url,/edge=1&maquinaId=7/);
 f.app.emit('second-instance',{},['app.exe','steelcontrol://connect?maquinaId=8']);assert.equal(f.windows.length,1);assert.match(edge.url,/maquinaId=8/);
});
test('IPC abre o Edge pelo site autenticável e bloqueia iframe e máquina inválida',async()=>{
 const f=await fixture();const main=f.windows[0],open=f.handlers.get('computer:open-edge');
 assert.throws(()=>open({sender:main.webContents,senderFrame:{...main.webContents.mainFrame}},7));
 assert.throws(()=>open({sender:main.webContents,senderFrame:main.webContents.mainFrame},'7'));
 open({sender:main.webContents,senderFrame:main.webContents.mainFrame},7);assert.equal(f.windows.length,1);assert.match(f.windows[0].url,/maquinaId=7/);
 const pair=f.handlers.get('computer:pair');const edge=f.windows[0];assert.equal((await pair({sender:edge.webContents,senderFrame:edge.webContents.mainFrame})).codigo,'temporary-pairing-code');
});
test('link com servidor ou segredo arbitrário não abre destino externo',async()=>{
 const f=await fixture(['steelcontrol://connect?url=https://evil.test&token=private']);assert.equal(f.windows.length,1);assert.equal(f.windows[0].url,'https://web-production-6682df.up.railway.app/app/maquinas?edge=1');
});
