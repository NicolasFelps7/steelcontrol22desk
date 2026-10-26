/* Configuração da conexão dentro do SteelControl. Credenciais ficam no componente interno. */
(() => {
  'use strict';
  const drivers = {AUTO:'Automático pelo cadastro',DOBOT_MAGICIAN:'Dobot Magician (USB)',SERIAL_JSON:'USB / serial JSON',MODBUS_RTU:'Modbus RTU',MODBUS_TCP:'Modbus TCP',OPC_UA:'OPC UA',MQTT:'MQTT',HTTP_REST:'HTTP / REST',TCP_IP:'TCP / IP JSON',MOCK:'Simulador'};
  const states = {ONLINE:'Conectada',CONNECTING:'Conectando',ERROR:'Falha de comunicação',STOPPED:'Desconectada',OFFLINE:'Computador offline'};
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function request(path, method='GET', body) {
    const response=await fetchAutenticado(`${API_URL}/conexoes${path}`,{method,cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
    const data=await response.json();if(!response.ok)throw new Error(data.mensagem||'Não foi possível configurar a conexão.');return data;
  }
  window.abrirConexaoMaquina = async machine => {
    const dialog=document.createElement('dialog');dialog.className='machine-connection-dialog';
    dialog.innerHTML=`<form class="connection-form"><div class="connection-heading"><div><h2>Conexão${machine?' — '+escape(machine.nome):' do computador'}</h2><p>Configure a comunicação e acompanhe o estado do equipamento.</p></div><button type="button" data-close aria-label="Fechar">×</button></div>
      <p data-message role="status" aria-live="polite">Carregando…</p>
      <div class="connection-computer"><p>O computador selecionado mantém a comunicação com as máquinas USB ou na rede industrial. Ele precisa permanecer ligado.</p><button type="button" data-pair class="connection-action">Vincular este computador</button><div data-manual hidden><label>Código do computador<input name="codigo" autocomplete="off" maxlength="20"></label><button type="button" data-claim class="connection-action">Vincular</button></div></div>
      <div data-computers></div>
      <div data-fields ${machine?'':'hidden'}><div class="connection-grid"><label>Computador<select name="hostId" required></select></label><label>Protocolo<select name="driver">${Object.entries(drivers).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><label>Porta USB / serial<select name="serialPort"><option value="">Pelo cadastro</option></select></label><label>Baud rate<input name="baud" type="number" min="1" value="115200"></label><label>IP / host<input name="host" placeholder="Ex.: 192.168.1.50"></label><label>Porta de rede<input name="port" type="number" min="1" max="65535"></label><label>Unit ID (Modbus)<input name="unitId" type="number" min="0" max="247" value="1"></label><label>Endpoint<input name="endpoint"></label><label>Tópico MQTT<input name="topic"></label></div>
      <details><summary>Configuração avançada</summary><label>Parâmetros do fabricante (JSON)<textarea name="advanced" rows="3"></textarea></label></details>
      <label class="connection-control"><input type="checkbox" name="comandos"> Permitir comandos autorizados nesta conexão</label><p class="connection-note">As permissões do usuário e a liberação de controle remoto da máquina continuam obrigatórias. Conectar não inicia um movimento.</p></div>
      <div class="connection-footer"><button type="button" data-refresh class="connection-action secondary">Atualizar estado</button>${machine?'<button type="button" data-disconnect class="connection-action secondary">Desconectar</button><button type="submit" class="connection-action">Salvar e conectar</button>':''}</div></form>`;
    document.body.append(dialog);dialog.showModal();
    const form=dialog.querySelector('form'), fields=form.elements, msg=dialog.querySelector('[data-message]');let hosts=[],timer,busy=false,current=null,catalog=[],closed=false;
    const capabilityBox=document.createElement('div');capabilityBox.className='connection-capabilities';dialog.querySelector('[data-fields]').prepend(capabilityBox);
    const adapters=document.createElement('details');adapters.className='connection-catalog';adapters.innerHTML='<summary>Protocolos e requisitos de integração</summary><div></div>';dialog.querySelector('.connection-footer').before(adapters);
    const adapterNote=document.createElement('p');adapterNote.className='connection-note';fields.driver.closest('label').append(adapterNote);
    const say=(text,error=false)=>{msg.textContent=text;msg.classList.toggle('connection-error',error);};
    const close=()=>{closed=true;clearInterval(timer);dialog.close();dialog.remove();};
    dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    const ports=()=>{
      const host=hosts.find(h=>h.id===fields.hostId.value),value=fields.serialPort.value;
      fields.serialPort.innerHTML='<option value="">Pelo cadastro</option>'+(host?.portas||[]).map(p=>`<option value="${escape(p.porta)}">${escape(p.porta)} — ${escape(p.nome)}</option>`).join('');
      if([...fields.serialPort.options].some(o=>o.value===value))fields.serialPort.value=value;
    };
    function protocolFields(){
      const driver=fields.driver.value,serial=['AUTO','DOBOT_MAGICIAN','SERIAL_JSON','MODBUS_RTU'].includes(driver),network=['AUTO','MODBUS_TCP','MQTT','TCP_IP','HTTP_REST','OPC_UA'].includes(driver);
      for(const key of ['serialPort','baud'])fields[key].closest('label').hidden=!serial;
      for(const key of ['host','port'])fields[key].closest('label').hidden=!network;
      fields.unitId.closest('label').hidden=!['AUTO','MODBUS_TCP','MODBUS_RTU'].includes(driver);
      fields.endpoint.closest('label').hidden=!['AUTO','OPC_UA','HTTP_REST'].includes(driver);
      fields.topic.closest('label').hidden=!['AUTO','MQTT'].includes(driver);
      adapterNote.textContent=catalog.find(a=>a.id===driver)?.observacao||'O protocolo será resolvido pelo adaptador do computador selecionado.';
    }
    fields.hostId.onchange=()=>{ports();protocolFields();};fields.driver.onchange=protocolFields;
    async function load(initial=false){
      if(closed)return;
      const data=await request('/computadores');hosts=data.computadores.filter(h=>h.tipo!=='NAVEGADOR');
      const previous=fields.hostId.value;
      fields.hostId.innerHTML=hosts.length?hosts.map(h=>`<option value="${escape(h.id)}">${escape(h.nome)}${h.online?'':' — offline'}</option>`).join(''):'<option value="">Nenhum computador vinculado</option>';
      if(hosts.some(h=>h.id===previous))fields.hostId.value=previous;
      ports();protocolFields();
      const computers=dialog.querySelector('[data-computers]');computers.replaceChildren();
      if(!machine)for(const host of hosts){
        const row=document.createElement('div');row.className='connection-host-row';
        const label=document.createElement('span');label.textContent=host.nome+' · '+(host.online?'Online':'Offline');
        const revoke=document.createElement('button');revoke.type='button';revoke.className='connection-action secondary';revoke.textContent='Desvincular';revoke.onclick=()=>operation(async()=>{
          if(!confirm('Desvincular este computador? As conexões e credenciais das máquinas vinculadas a ele serão desativadas.'))return;
          await request('/computadores/'+encodeURIComponent(host.id),'DELETE');await load();
        });row.append(label,revoke);computers.append(row);
      }
      if(machine){
        const result=await request('/maquinas/'+machine.id);current=result.conexao;
        capabilityBox.replaceChildren();
        const caps=result.capacidades;
        if(caps)for(const text of ['Cadastro: disponível para esta categoria','Monitoramento: '+(caps.situacao==='SIMULACAO'?'simulação':caps.monitoramento.confirmado?'comunicação confirmada':'aguardando comunicação real'),'Controle: '+(caps.controle.habilitado?'habilitado conforme permissões':'bloqueado')]){const p=document.createElement('p');p.textContent=text;capabilityBox.append(p);}
        if(initial&&current){fields.hostId.value=current.hostId;ports();fields.driver.value=current.driver;fields.comandos.checked=current.comandos;
          const simple=['serialPort','baud','host','port','unitId','endpoint','topic'];
          for(const key of simple)if(current.parametros[key]!=null)fields[key].value=current.parametros[key];
          const advanced=Object.fromEntries(Object.entries(current.parametros).filter(([key])=>!simple.includes(key)));
          fields.advanced.value=Object.keys(advanced).length?JSON.stringify(advanced,null,2):'';
          protocolFields();
        }
        say(current?`${states[current.estado]||'Estado indisponível'} · ${current.computador}`:hosts.length?'Selecione o computador e a comunicação da máquina.':'Vincule o computador conectado à máquina para continuar.');
      }else say(hosts.length?'Computadores vinculados: '+hosts.map(h=>`${h.nome} (${h.online?'online':'offline'})`).join(', '):'Vincule este computador para disponibilizar suas portas ao site e ao mobile.');
      if(!window.steelControlComputer){dialog.querySelector('[data-pair]').hidden=true;}
      if(!hosts.length)say('Abra o SteelControl Edge no computador conectado à máquina e entre nesta empresa. O Edge disponibilizará suas portas automaticamente.');
    }
    async function operation(fn){if(busy)return;busy=true;dialog.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(e){say(e.message,true);}finally{busy=false;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);}}
    async function bindEdge(){
      say('Vinculando o computador…');const pair=await window.steelControlComputer.pairing();
      if(pair.vinculado&&!hosts.some(h=>h.id===pair.id))throw new Error('Este computador já está vinculado a outra empresa. Entre na conta correspondente para desvinculá-lo.');
      if(!pair.vinculado&&pair.codigo&&!hosts.some(h=>h.id===pair.id))await request('/vincular','POST',{codigo:pair.codigo});
      say('Vínculo autorizado. Aguardando o computador disponibilizar suas portas…');
      await load();
      if(pair.id&&(!current||current.tipo==='NAVEGADOR')){fields.hostId.value=pair.id;ports();}
    }
    dialog.querySelector('[data-pair]').onclick=()=>operation(bindEdge);
    dialog.querySelector('[data-claim]').onclick=()=>operation(async()=>{await request('/vincular','POST',{codigo:fields.codigo.value});fields.codigo.value='';await load();});
    dialog.querySelector('[data-refresh]').onclick=()=>operation(()=>load());
    dialog.querySelector('[data-disconnect]')?.addEventListener('click',()=>operation(async()=>{
      if(!confirm('Desconectar esta máquina? O histórico será mantido.'))return;
      await request('/maquinas/'+machine.id,'DELETE');await load();
    }));
    form.onsubmit=event=>{event.preventDefault();operation(async()=>{
      if(!machine)return;
      let parametros={};if(fields.advanced.value.trim())parametros=JSON.parse(fields.advanced.value);
      if(!parametros||Array.isArray(parametros)||typeof parametros!=='object')throw new Error('Use um objeto JSON na configuração avançada.');
      for(const key of ['serialPort','baud','host','port','unitId','endpoint','topic'])if(!fields[key].closest('label').hidden&&fields[key].value.trim())parametros[key]=['baud','port','unitId'].includes(key)?Number(fields[key].value):fields[key].value.trim();
      const result=await request('/maquinas/'+machine.id,'PUT',{hostId:fields.hostId.value,driver:fields.driver.value,parametros,comandos:fields.comandos.checked});say(result.mensagem);
    });};
    try{
      catalog=(await request('/adaptadores')).adaptadores;
      const list=adapters.querySelector('div');for(const item of catalog){const p=document.createElement('p');p.textContent=item.nome+' — disponível no Edge; '+item.observacao;list.append(p);}
      await load(true);
      if(machine&&!current){
        const preferred=machine.controlador==='DOBOT_MAGICIAN'?'DOBOT_MAGICIAN':machine.protocolo==='USB_SERIAL'?'SERIAL_JSON':machine.protocolo;
        if(drivers[preferred])fields.driver.value=preferred;protocolFields();
      }
      if(!closed&&document.body.classList.contains('edge-mode')&&window.steelControlComputer)await operation(bindEdge);
    }catch(e){say(e.message,true);}
    if(!closed)timer=setInterval(()=>{if(!busy&&dialog.isConnected)load().catch(e=>say(e.message,true));},5000);
  };
  document.addEventListener('DOMContentLoaded',()=>{
    if(!usuarioEhAdministrador())return;
    const params=new URLSearchParams(location.search);
    if(params.get('edge')==='1'&&window.steelControlComputer){void edgeWorkspace(params);return;}
    const header=document.querySelector('.cadastro-header');
    if(header){const button=document.createElement('button');button.className='toggle-form-btn';button.type='button';button.textContent='Abrir SteelControl Edge';button.onclick=()=>window.abrirSteelControlEdge(null);header.append(button);}
    if(params.has('conexoes'))window.abrirSteelControlEdge(null);
  });
  async function edgeWorkspace(params){
    document.body.classList.add('edge-mode');document.title='SteelControl Edge';
    const shell=document.createElement('main');shell.className='edge-workspace';
    shell.innerHTML='<header class="edge-workspace-heading"><div><span class="edge-kicker">STEELCONTROL</span><h1>Edge</h1><p>Uma conexão entre suas máquinas, o site e o mobile.</p></div><span class="edge-app-tag">Conexões industriais</span></header><div class="edge-steps"><span>1 · Cadastro no sistema</span><span>2 · Configuração no Edge</span><span>3 · Comunicação confirmada</span></div><div class="edge-workspace-actions"><button type="button" data-bind>Vincular este Edge à empresa</button><button type="button" data-refresh-edge>Atualizar máquinas</button><button type="button" data-diagnostics>Diagnóstico</button></div><p data-edge-status role="status"></p><section data-edge-machines class="edge-machines"></section><footer>O Edge continua ativo próximo ao relógio ao fechar esta janela. O computador e o equipamento precisam permanecer ligados.</footer>';
    document.body.append(shell);
    const status=shell.querySelector('[data-edge-status]');
    const account=document.createElement('p');account.className='edge-account';account.textContent='Conta autenticada no SteelControl';shell.querySelector('.edge-steps').before(account);
    fetchAutenticado(`${API_URL}/empresa`,{cache:'no-store'}).then(async response=>{if(response.ok){const company=await response.json();if(company.nome)account.textContent='Empresa: '+company.nome;}}).catch(()=>{});
    const switchAccount=document.createElement('button');switchAccount.type='button';switchAccount.textContent='Trocar conta';switchAccount.onclick=()=>{if(confirm('Trocar a conta desta janela? O vínculo atual do Edge permanece até ser revogado pela empresa.'))void sair(false);};shell.querySelector('.edge-workspace-actions').append(switchAccount);
    shell.querySelector('[data-bind]').onclick=()=>window.abrirConexaoMaquina(null);
    shell.querySelector('[data-diagnostics]').onclick=()=>window.abrirCentralDiagnostico?.();
    async function refresh(){
      status.textContent='Carregando os equipamentos da empresa…';
      try{
        const response=await fetchAutenticado(`${API_URL}/maquinas`,{cache:'no-store'});const machines=await response.json();if(!response.ok)throw new Error(machines.mensagem||'Entre na conta da empresa para continuar.');
        const list=shell.querySelector('[data-edge-machines]');list.replaceChildren();
        for(const machine of machines){
          const card=document.createElement('article');card.className='edge-machine-card';
          const name=document.createElement('h2');name.textContent=machine.nome;
          const info=document.createElement('p');info.textContent=(machine.tipo||'Equipamento')+' · '+(machine.protocolo||'Protocolo a configurar');
          const hint=document.createElement('p');hint.textContent=machine.modoSimulacao?'Simulação disponível no sistema.':'Cadastro existente · configure a comunicação física.';
          const configure=document.createElement('button');configure.type='button';configure.textContent='Configurar conexão';configure.disabled=machine.modoSimulacao;configure.onclick=()=>window.abrirConexaoMaquina(machine);
          card.append(name,info,hint,configure);list.append(card);
        }
        status.textContent=machines.length?'Escolha um equipamento para conectar. Nenhum movimento é iniciado ao configurar o Edge.':'Cadastre uma máquina no site ou no mobile. Ela aparecerá aqui na mesma empresa.';
        return machines;
      }catch(error){status.textContent=error.message;return [];}
    }
    shell.querySelector('[data-refresh-edge]').onclick=refresh;
    const machines=await refresh();const raw=params.get('maquinaId');
    if(raw&&/^[1-9]\d{0,9}$/.test(raw)){
      const machine=machines.find(m=>m.id===Number(raw));
      if(machine&&!machine.modoSimulacao)await window.abrirConexaoMaquina(machine);
      else status.textContent='A máquina indicada não está disponível como equipamento real nesta empresa. Confira a conta e escolha um cadastro da lista.';
    }
  }
})();
