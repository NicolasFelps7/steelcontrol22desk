'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../frontend/assets/js/maquinas.js'),'utf8');
const start=src.indexOf('// A descoberta antiga lista anuncios UDP;');
const end=src.indexOf('\nasync function varrerDispositivos()',start);
assert.ok(start!==-1&&end>start,'Funções de descoberta não encontradas');
const section=src.slice(start,end);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function setup({local,hosts,net,backendFail=false}={}){
  const grid={innerHTML:''};
  const messages=[];
  const context={
    window:local===null?{}:{steelControlComputer:{ports:async()=>local||[]}},
    API_URL:'http://localhost:3000',
    fetchAutenticado:async url=>{
      if(url.endsWith('/conexoes/computadores'))return {ok:true,json:async()=>({computadores:hosts||[]})};
      if(url.endsWith('/descoberta')){
        if(backendFail)throw new Error('UDP falhou');
        return {ok:true,json:async()=>net||[]};
      }
      throw new Error('URL inesperada '+url);
    },
    usuarioEhAdministrador:()=>true,
    dispositivosDescobertos:[],
    portasUsbDetectadas:[],
    maquinas:[],
    document:{getElementById:id=>id==='discoveredDevicesGrid'?grid:null},
    escaparHtml:escape,
    formatarControladorLista:x=>x,
    formatarProtocoloLista:x=>x,
    formatarTempoDescoberta:x=>x,
    discoveryMessage:(...args)=>messages.push(args),
    console,
  };
  vm.createContext(context);
  vm.runInContext(section,context);
  await vm.runInContext('carregarDispositivosDescobertos()',context);
  return {grid,context,messages};
}
(async()=>{
  let r=await setup({local:[{port:'COM4',description:'USB Serial Port'}]});
  assert.match(r.grid.innerHTML,/COM4/);
  assert.match(r.grid.innerHTML,/Configurar conexão USB/);
  assert.doesNotMatch(r.grid.innerHTML,/Nenhuma porta USB/);
  console.log('PASSA: Edge Desktop mostra COM4 diretamente');
  r=await setup({local:null,hosts:[{id:'h1',nome:'PC do laboratório',online:true,portas:[{porta:'COM4',nome:'Silicon Labs CP210x'}]}]});
  assert.match(r.grid.innerHTML,/COM4/);
  assert.match(r.grid.innerHTML,/PC do laboratório/);
  console.log('PASSA: Chrome mostra COM4 do computador Edge vinculado');
  r=await setup({local:null,hosts:[{id:'h2',nome:'PC desligado',online:false,portas:[{porta:'COM4'}]}]});
  assert.doesNotMatch(r.grid.innerHTML,/Configurar conexão USB/);
  console.log('PASSA: Porta de Edge offline não aparece como disponível');
  r=await setup({local:[{port:'COM4',description:'USB Serial Port'}],backendFail:true});
  assert.match(r.grid.innerHTML,/COM4/);
  console.log('PASSA: falha no UDP não esconde COM4 local');
  r=await setup({local:[{port:'COM4',description:'USB Serial Port'}],hosts:[{id:'h1',nome:'Local',online:true,portas:[{porta:'COM4'}]}]});
  assert.equal((r.grid.innerHTML.match(/Configurar conexão USB/g)||[]).length,1);
  console.log('PASSA: a COM4 não aparece duplicada');
  r=await setup({local:[{port:'COM4',description:'<img src=x onerror=alert(1)>'},{port:'COM4<script>',description:'Invalida'}]});
  assert.match(r.grid.innerHTML,/&lt;img/);
  assert.doesNotMatch(r.grid.innerHTML,/<img/);
  assert.equal((r.grid.innerHTML.match(/Configurar conexão USB/g)||[]).length,1);
  console.log('PASSA: caracteres perigosos e portas inválidas são filtrados');
})().catch(e=>{console.error(e);process.exitCode=1});
