/* A aba aberta atua como ponte USB. Tokens e chaves ficam somente na memória desta página. */
(() => {
  'use strict';
  const ports=new Map(),runtimes=new Map();let session=null,timer=null,syncing=false,closing=false;
  const base=()=>String(window.API_URL||window.STEELCONTROL_API_URL||location.origin).replace(/\/$/,'');
  const announce=()=>window.dispatchEvent(new CustomEvent('steelcontrol:connection-change',{detail:{ports:ports.size,running:runtimes.size}}));
  async function json(path,options={},authenticated=false){
    const fn=authenticated?fetchAutenticado:fetch;
    const response=await fn(base()+path,{cache:'no-store',...options,signal:AbortSignal.timeout(10000)});
    if(response.status===204)return null;
    const data=await response.json();
    if(!response.ok)throw Object.assign(new Error(data.mensagem||'A comunicação com o servidor falhou.'),{status:response.status});
    return data;
  }
  const device=(runtime,path,body)=>json('/device/'+runtime.config.maquinaId+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Device-Key':runtime.key},...(body===undefined?{}:{body:JSON.stringify(body)})});
  function state(runtime,status,message=''){runtime.state=status;runtime.message=message;announce();}
  async function ack(runtime,id,status){await device(runtime,'/comandos/'+id+'/confirmar',{status});}
  async function packet(runtime,value){
    if(runtime.stopped)return;
    if(value?.ack){
      const id=Number(value.ack.id),pending=runtime.pending.get(id);
      if(pending&&['CONCLUIDO','FALHOU'].includes(value.ack.status)){
        const result=Date.now()<=pending.deadline?value.ack.status:'FALHOU';
        runtime.pending.delete(id);runtime.finished.set(id,result);
        await ack(runtime,id,result);
      }
      return;
    }
    const data=SteelControlAdapters.normalize(value,runtime.config.parametros?.fieldMap);
    await device(runtime,'/telemetria',data);
    if(!runtime.stopped){runtime.interlocks=data.dadosExtras?.hmi?.interlocks||{};runtime.lastTelemetry=Date.now();state(runtime,'ONLINE');}
  }
  async function stopRuntime(runtime){
    runtime.stopped=true;clearInterval(runtime.poll);runtime.poll=null;
    await runtime.adapter?.close().catch(()=>{});
    runtime.key='';state(runtime,'STOPPED');
  }
  async function poll(runtime){
    if(runtime.polling||runtime.stopped)return;runtime.polling=true;
    try{
      for(const [id,p] of runtime.pending)if(Date.now()>p.deadline){runtime.pending.delete(id);runtime.finished.set(id,'FALHOU');await ack(runtime,id,'FALHOU');}
      if(runtime.lastTelemetry&&Date.now()-runtime.lastTelemetry>15000)state(runtime,'CONNECTING','Aguardando telemetria recente.');
      if(!runtime.config.comandos)return;
      const command=await device(runtime,'/comandos/proximo?waitMs=0');if(!command)return;
      const id=Number(command.id);
      if(runtime.finished.has(id)){await ack(runtime,id,runtime.finished.get(id));return;}
      if(runtime.pending.has(id))return;
      // Nunca repetir um movimento após perda de ACK ou expiração.
      const expiry=Date.parse(command.payload?.expiresAt||'');
      const fresh=runtime.lastTelemetry&&Date.now()-runtime.lastTelemetry<15000;
      const cfg=await device(runtime,'/config');
      if(runtime.stopped)return;
      const remote=cfg.integracaoMeta?.hmi?.remoteControlEnabled===true;
      const locks=runtime.interlocks||{};
      const safeStart=command.comando!=='IHM_START'||(locks.startPermitted===true&&locks.estopOk!==false&&locks.safetyDoorClosed!==false&&locks.guardOk!==false);
      if(!fresh||!remote||!safeStart||(cfg.paradaSeguranca&&command.comando!=='IHM_STOP')||!Number.isFinite(expiry)||Date.now()>=expiry||Number(command.tentativaEntrega)>1||!String(command.comando).startsWith('IHM_')){
        runtime.finished.set(id,'FALHOU');await ack(runtime,id,'FALHOU');return;
      }
      runtime.pending.set(id,{deadline:Math.min(expiry,Date.now()+5000)});
      try{await runtime.adapter.command(command);}
      catch(error){runtime.pending.delete(id);runtime.finished.set(id,'FALHOU');await ack(runtime,id,'FALHOU');}
      // CONCLUIDO só é enviado depois de receber o ACK do próprio equipamento.
    }catch(error){await stopRuntime(runtime);state(runtime,'ERROR',error.message+' Salve a conexão novamente para retomar.');}
    finally{runtime.polling=false;}
  }
  async function startRuntime(config,old){
    const key=config.credencial||old?.key;
    if(old)await stopRuntime(old);
    const port=ports.get(config.parametros?.serialPort);
    const runtime={config,key,state:'CONNECTING',stopped:false,pending:new Map(),finished:new Map(),lastTelemetry:0};
    runtimes.set(config.id,runtime);
    if(!config.ativa){state(runtime,'STOPPED');return;}
    if(config.driver!=='SERIAL_JSON'||!port||!key){state(runtime,'ERROR','Autorize a porta USB nesta aba e salve a conexão novamente.');return;}
    try{
      runtime.adapter=SteelControlAdapters.create(config.driver,port,config.parametros,value=>packet(runtime,value),error=>{state(runtime,'ERROR',error.message);runtime.stopped=true;clearInterval(runtime.poll);});
      await device(runtime,'/config');
      await runtime.adapter.open();runtime.saved=true;
      runtime.poll=setInterval(()=>poll(runtime),750);
    }catch(error){state(runtime,'ERROR',error.message);runtime.stopped=true;await runtime.adapter?.close().catch(()=>{});}
  }
  async function sync(){
    if(!session||syncing||closing)return;syncing=true;
    try{
      // Confirma que a conta continua autorizada antes de manter a ponte ativa.
      const authorized=await json('/conexoes/navegador/autorizacao',{},true);
      if(authorized.empresaId!==session.empresaId)throw new Error('A conta mudou de empresa.');
      const result=await json('/conexoes/computador/sincronizar',{method:'POST',headers:{'Content-Type':'application/json','X-Connection-Token':session.token},body:JSON.stringify({portas:[...ports.keys()].map((porta,index)=>({porta,nome:'USB autorizado '+(index+1)})),estados:[...runtimes].map(([id,r])=>({id,versao:r.config.versao,estado:r.state,salvo:r.saved===true}))})});
      const active=new Set();
      for(const config of result.conexoes){active.add(config.id);const old=runtimes.get(config.id);if(!old||old.config.versao!==config.versao)await startRuntime(config,old);}
      for(const [id,runtime] of runtimes)if(!active.has(id)){await stopRuntime(runtime);runtimes.delete(id);}
    }catch(error){
      // Falha fechada: não conservar comandos físicos durante perda de autorização/rede.
      for(const r of runtimes.values())await stopRuntime(r);
      clearInterval(timer);timer=null;session=null;announce();
      window.dispatchEvent(new CustomEvent('steelcontrol:connection-error',{detail:error.message+' Autorize a porta novamente para retomar.'}));
    }finally{syncing=false;announce();}
  }
  window.SteelControlBrowserBridge={
    supported:()=>Boolean(window.isSecureContext&&navigator.serial&&typeof navigator.serial.requestPort==='function'),
    async authorize(){
      if(!this.supported())throw new Error('Use Chrome ou Edge compatível no computador, com o site em HTTPS.');
      // Deve ser a primeira operação assíncrona do clique (ativação transitória).
      const port=await navigator.serial.requestPort();
      if(!session){session=await json('/conexoes/navegador/iniciar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:'Navegador USB — '+new Date().toLocaleTimeString('pt-BR')})},true);}
      let id=[...ports].find(([,existing])=>existing===port)?.[0];
      if(!id){id='browser-'+crypto.randomUUID();ports.set(id,port);}
      await sync();if(!session)throw new Error('A sessão de conexão foi encerrada. Tente novamente.');
      if(!timer)timer=setInterval(sync,4000);
      return {hostId:session.id,serialPort:id};
    },
    async close(){closing=true;clearInterval(timer);for(const r of runtimes.values())await stopRuntime(r);if(session)await json('/conexoes/computadores/'+encodeURIComponent(session.id),{method:'DELETE'},true).catch(()=>{});runtimes.clear();ports.clear();session=null;closing=false;announce();},
    sync,
    active:()=>runtimes.size>0||ports.size>0
  };
  window.addEventListener('beforeunload',event=>{if(window.SteelControlBrowserBridge.active()){event.preventDefault();event.returnValue='';}});
  window.addEventListener('pagehide',()=>{window.SteelControlBrowserBridge.close();});
})();
