/* O link contém apenas o ID. Empresa, sessão e credenciais são validadas pelo backend. */
(() => {
 'use strict';
 const validId=value=>Number.isInteger(value)&&value>0&&value<=2147483647;
 let activeClose=null;
 window.abrirSteelControlEdge=async(machine=null,{automatic=true}={})=>{
  const id=machine?.id??null;
  if(id!==null&&!validId(id))throw new Error('Máquina inválida.');
  if(machine?.modoSimulacao===true)return;
  activeClose?.();
  if(window.steelControlComputer?.openEdge){await window.steelControlComputer.openEdge(id);return;}
  const dialog=document.createElement('dialog');dialog.className='edge-launch-dialog';
  dialog.innerHTML='<div class="edge-launch-top"><span class="edge-kicker">STEELCONTROL EDGE</span><button type="button" data-close aria-label="Fechar">×</button></div><h2></h2><p data-description></p><ol><li>Abra o Edge no computador conectado ao equipamento.</li><li>Entre na mesma empresa e confira a máquina selecionada.</li><li>Escolha protocolo e porta ou endereço. Salve e aguarde a comunicação.</li></ol><p data-status role="status" aria-live="polite"></p><div class="edge-launch-actions"><a data-open>Abrir SteelControl Edge</a><a data-download href="/downloads/SteelControl-Edge-Windows.zip" download>Baixar SteelControl Edge</a><button type="button" data-retry>Tentar abrir novamente</button><button type="button" data-existing>Configurar um Edge já vinculado</button></div><details><summary>O Edge não abriu?</summary><p>Se ainda não instalou o Edge neste computador, baixe o pacote Windows, extraia a pasta e execute INSTALAR_STEELCONTROL_EDGE.ps1. É necessário ter Node.js 22 LTS e Python 3.11 ou superior. Depois da instalação, clique em Tentar abrir novamente e autorize a abertura se o navegador perguntar.</p></details>';
  dialog.querySelector('h2').textContent=machine?'Conectar '+machine.nome:'Conecte suas máquinas';
  dialog.querySelector('[data-description]').textContent=machine?'O cadastro já está no sistema. Agora configure a comunicação no Edge, sem cadastrar a máquina outra vez.':'O Edge mantém a comunicação com os equipamentos e compartilha os dados com o site e o mobile.';
  const link=dialog.querySelector('[data-open]');link.href='steelcontrol://connect'+(id?'?maquinaId='+id:'');
  const status=dialog.querySelector('[data-status]');status.textContent='O computador precisa permanecer ligado. Fechar a página do site não encerra o Edge.';
  const requestOpen=()=>{status.textContent='Solicitação enviada ao Windows. Se aparecer uma confirmação do navegador, autorize. A conexão física só será confirmada após receber telemetria.';window.location.href=link.href;};
  dialog.querySelector('[data-retry]').onclick=requestOpen;
  let timer=null,checking=false;
  const close=()=>{clearInterval(timer);dialog.close();dialog.remove();if(activeClose===close)activeClose=null;};activeClose=close;
  dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.querySelector('[data-existing]').onclick=()=>{close();window.abrirConexaoMaquina(machine);};
  link.onclick=()=>{status.textContent='Solicitação enviada ao Windows. Autorize a abertura do aplicativo se o navegador perguntar. A conexão só será confirmada após receber dados da máquina.';};
  document.body.append(dialog);dialog.showModal();
  // A chamada automática pode ser bloqueada pelo navegador; o link manual permanece disponível.
  if(automatic){try{link.click();}catch{status.textContent='Clique em Abrir SteelControl Edge ou Tentar abrir novamente.';}}
  if(id)timer=setInterval(async()=>{
   if(checking||!dialog.isConnected)return;checking=true;
   try{const response=await fetchAutenticado(`${window.STEELCONTROL_API_URL}/conexoes/maquinas/${id}`,{cache:'no-store'});if(response.ok){const result=await response.json();if(result.capacidades?.monitoramento?.confirmado){status.textContent='Comunicação confirmada. Esta máquina já pode ser acompanhada no site e no mobile.';clearInterval(timer);}}}catch{/* Não confundir abertura do aplicativo com sucesso físico. */}finally{checking=false;}
  },5000);
 };
})();
