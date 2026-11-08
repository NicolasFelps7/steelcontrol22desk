(function(){'use strict';
const section=document.createElement('dialog');section.id='machineWorkspaceModal';section.className='op-machine-workspace machine-workspace-modal';section.setAttribute('aria-labelledby','machineWorkspaceTitle');
const header=document.createElement('header'),copy=document.createElement('div'),eyebrow=document.createElement('small'),title=document.createElement('h2'),close=document.createElement('button'),tabs=document.createElement('nav'),body=document.createElement('div'),status=document.createElement('p');
title.id='machineWorkspaceTitle';eyebrow.textContent='ÁREA TÉCNICA DO EQUIPAMENTO';copy.append(eyebrow,title);close.type='button';close.textContent='×';close.className='workspace-close';close.setAttribute('aria-label','Fechar painel');header.className='workspace-modal-header';header.append(copy,close);body.className='workspace-modal-body';status.className='workspace-status';status.setAttribute('role','status');section.append(header,tabs,status,body);document.body.append(section);
let updateHistory=null;
let context=null,currentTab='state',wantedMode='manual',revision=0,timer=null,selected=null,busy=false,dobotMount=null,controlId=null,returnFocus=null;
const tr=k=>context?.tr(k)||k,api=(path,options)=>context.api(path,options),make=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
const labels={state:'Estado',control:'Controle · Manual / Automático',maintenance:'Manutenção',alerts:'Alertas',logs:'Logs',connection:'Conexão'};
function info(label,value){const row=make('p');row.append(make('strong',`${label}: `),document.createTextNode(value==null?'—':String(value)));return row;}
function disposeControls(){dobotMount?.dispose();dobotMount=null;controlId=null;}
function finish(){revision++;clearInterval(timer);disposeControls();body.replaceChildren();if(section.open)section.close();returnFocus?.focus?.();}
close.onclick=finish;section.addEventListener('cancel',event=>{event.preventDefault();finish();});section.addEventListener('click',event=>{if(event.target!==section)return;const r=section.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)finish();});
async function load(){if(!context||!selected||!section.open)return;const token=++revision,id=selected;status.textContent=tr('loading');try{
 const [machine,diagnostic]=await Promise.all([api(`/maquinas/${id}`),api(`/maquinas/${id}/diagnostico`)]);if(token!==revision||id!==selected||!section.open)return;context.onSnapshot?.(machine,diagnostic);title.textContent=machine.nome;status.textContent='';if(currentTab==='control'&&dobotMount&&controlId===id){dobotMount.setMode?.(wantedMode);return;}disposeControls();body.replaceChildren();body.classList.remove('sc-records');
 if(currentTab==='state'){const grid=make('div');grid.className='workspace-state-grid';grid.append(info('Controlador',machine.controlador),info('Protocolo',machine.protocolo),info('Estado',diagnostic.estadoConexao?.texto),info('Última telemetria',machine.ultimaTelemetriaEm?new Date(machine.ultimaTelemetriaEm).toLocaleString():'—'),info('Manutenção',machine.manutencao));body.append(grid);}
 if(currentTab==='alerts'){for(const row of machine.alertas||[])body.append(info(row.tipo||'Alerta',row.mensagem));if(!machine.alertas?.length)body.append(make('p','Nenhum alerta registrado.'));}
 if(currentTab==='logs'){if(!context.report()?.podeAuditar)body.append(make('p','Logs restritos à administração.'));else SteelMachineRecords.logs(body,{machine});}
 if(currentTab==='maintenance'){const rows=await api(`/maquinas/${id}/manutencoes`);if(token!==revision||!section.open)return;updateHistory=SteelMachineRecords.maintenance(body,{machine,rows,canRegister:context.report()?.podeRegistrar===true,user:context.user?.()||{},onCreate:async payload=>{if(busy)return;busy=true;try{await api(`/maquinas/${id}/manutencoes`,{method:'POST',body:JSON.stringify(payload)});if(selected===id&&section.open){await load();status.textContent='Manutenção registrada no histórico da máquina.';}}finally{busy=false;}}});}
 if(currentTab==='connection'){body.append(info('Computador/Edge',diagnostic.estadoConexao?.detalhe),info('Host',machine.host),info('Protocolo',machine.protocolo));const link=make('a','Configurar conexão / equipamento');link.href='/app/maquinas';link.className='op-action';body.append(link);}
 if(currentTab==='control')renderControls(machine,diagnostic);
 }catch(error){if(token===revision&&section.open)status.textContent=error.message;}}
function renderControls(machine,diagnostic){const id=machine.id,isDobot=String(machine.controlador||'').includes('DOBOT'),online=diagnostic.estadoConexao?.codigo==='CONECTADA'&&!machine.modoSimulacao,allowed=context.report()?.podeRegistrar===true;
 body.append(make('p','Seleção e rotação 3D não enviam movimentos. Comandos reais exigem a conexão e as permissões verificadas pela API.'));
 const buttons=make('div');buttons.className='op-workspace-commands';
 const send=async(command,payload={})=>{if(busy)return;if(!command.endsWith('STOP')&&!confirm(`Confirmar ${command} para ${machine.nome}? A área física deve estar livre e supervisionada.`))return;busy=true;buttons.querySelectorAll('button').forEach(b=>b.disabled=true);try{const endpoint=isDobot?'comandos':machine.controlador==='IMPRESSORA_3D'?'impressora3d/comandos':'ihm/comandos';const result=await api(`/maquinas/${id}/${endpoint}`,{method:'POST',body:JSON.stringify({comando:command,payload})});status.textContent=`Solicitação registrada: ${result.comando?.id||result.id||'aguardando ACK do Edge'}. Isto não confirma execução.`;}catch(error){status.textContent=error.message;}finally{busy=false;buttons.querySelectorAll('button').forEach(b=>b.disabled=b.dataset.allowed!=='true');}};
 const button=(text,command,can)=>{const b=make('button',text);b.disabled=!can;b.dataset.allowed=String(Boolean(can));b.onclick=()=>send(command);buttons.append(b);};
 if(isDobot){const template=document.getElementById('dobotControlTemplate');if(template){body.replaceChildren(template.content.cloneNode(true));controlId=id;dobotMount=window.SteelDobotControl.mount(body,id);dobotMount.setMode?.(wantedMode);return;}body.append(make('p','Componente de controle indisponível. Atualize a página.'));}
 else if(machine.controlador!=='IMPRESSORA_3D'){button('START','IHM_START',online&&allowed&&diagnostic.hmi?.startPolicy?.permitido===true);button('STOP','IHM_STOP',online&&context.report()?.podeParar===true);button('RESET','IHM_RESET',online&&allowed&&diagnostic.hmi?.remoteControlEnabled===true);}
 else {const enabled=online&&allowed&&machine.integracaoMeta?.impressora3d?.remoteControlEnabled===true;for(const[label,command]of [['Pausar impressão','PRINTER3D_PAUSE'],['Retomar impressão','PRINTER3D_RESUME'],['Cancelar impressão','PRINTER3D_CANCEL'],['Luz ON','PRINTER3D_LIGHT_ON'],['Luz OFF','PRINTER3D_LIGHT_OFF']])button(label,command,enabled);}

 body.append(buttons);}
function renderTabs(){tabs.hidden=currentTab==='control';section.classList.toggle('control-only',currentTab==='control');tabs.replaceChildren(...Object.entries(labels).map(([key,label])=>{const b=make('button',label);b.type='button';b.classList.toggle('selected',currentTab===key);b.onclick=()=>showTab(selected,key);return b;}));}
function showTab(id,tab){if(tab==='automatic'){tab='control';wantedMode='automatic';}else if(tab==='control')wantedMode='manual';if(!Object.hasOwn(labels,tab)||!id)return;if(id!==selected||tab!==currentTab)disposeControls();selected=id;currentTab=tab;if(!section.open){returnFocus=document.activeElement;section.showModal();}renderTabs();section.scrollTop=0;load();clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&!busy&&currentTab!=='maintenance'&&!dobotMount)load();},7000);}
let historyRead = false, historyPending = false;
window.addEventListener('steelcontrol:empresa-evento', async ({detail}) => {
  if (!section.open || currentTab !== 'maintenance' || !updateHistory) return;
  if (detail?.tipo !== 'conectado' && !(detail?.tipo === 'maquina.manutencao' && Number(detail.dados?.maquinaId) === selected)) return;
  historyPending = true;
  if (historyRead) return;
  historyRead = true;
  try {
    while (historyPending && section.open && currentTab === 'maintenance') {
      historyPending = false;
      const id = selected, token = revision;
      const [rows,machine] = await Promise.all([api(`/maquinas/${id}/manutencoes`),api(`/maquinas/${id}`)]);
      if (token === revision && section.open) updateHistory?.(rows,machine);
    }
  } catch (error) {if(section.open)status.textContent=error.message;}
  finally {historyRead = false;}
});
window.SteelMachineWorkspace={historyChanged(id) {
 if(id===selected && section.open && ['alerts','logs'].includes(currentTab)) load();
},mount(ctx){context=ctx;},select(id){if(id!==selected&&section.open)finish();selected=id;},showTab,show(id){showTab(id,currentTab);},close:finish};
window.addEventListener('pagehide',finish);
})();
