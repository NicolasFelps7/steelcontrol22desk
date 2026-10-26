import { prisma } from './prisma.js';
const entry=(nivel,mensagem,orientacao)=>({nivel,mensagem,orientacao});
export const diagnosticCodes=Object.freeze({
  CONEXAO_CONFIRMADA:entry('INFO','Comunicação com o equipamento confirmada.','Acompanhe a telemetria e mantenha a ponte de comunicação ativa.'),
  CONEXAO_AGUARDANDO:entry('INFO','Aguardando comunicação com o equipamento.','Confira a alimentação, a porta, o protocolo e o baud rate. Abrir a porta não comprova comunicação.'),
  CONEXAO_FALHOU:entry('ERROR','O adaptador informou falha de comunicação.','Confira cabo, alimentação, protocolo e parâmetros do fabricante. Consulte outros eventos deste período.'),
  CONEXAO_ENCERRADA:entry('INFO','A conexão com a máquina foi encerrada.','Para retomar, autorize a interface e salve a conexão novamente.'),
  PONTE_OFFLINE:entry('WARN','A ponte deixou de sincronizar com o servidor.','Verifique internet, computador e aba do navegador. Uma aba fechada não mantém o USB ativo.'),
  USB_PERMISSAO_NEGADA:entry('WARN','A seleção da porta USB não foi autorizada ou foi cancelada.','Clique em Autorizar USB e selecione a porta correta. Em computador gerenciado, consulte o responsável de TI.'),
  USB_INDISPONIVEL:entry('ERROR','Não foi possível abrir a porta USB.','Verifique o cabo e feche outros programas que estejam usando a porta. Confirme o baud rate.'),
  USB_DESCONECTADA:entry('WARN','A leitura da porta USB foi interrompida.','Reconecte o cabo, autorize a porta e salve a conexão novamente.'),
  PACOTE_INVALIDO:entry('ERROR','O equipamento enviou uma mensagem incompatível.','O adaptador serial JSON exige um objeto por linha. Confira protocolo e mapeamento de campos.'),
  SERVIDOR_INDISPONIVEL:entry('ERROR','A ponte perdeu contato com o servidor.','Confira a internet e a disponibilidade do SteelControl. Retome a conexão após restabelecer o acesso.'),
  ACK_TIMEOUT:entry('ERROR','O equipamento não confirmou um comando dentro do prazo.','Confira o estado físico da máquina antes de solicitar outro comando. Não repita movimentos sem verificar o resultado.'),
  COMANDO_BLOQUEADO_LOCAL:entry('WARN','A ponte bloqueou um comando por política de controle.','Confira cargo, controle remoto, mapeamento, prazo e intertravamentos. Não desative proteções físicas.'),
  COMANDO_ENVIO_FALHOU:entry('ERROR','A ponte não conseguiu enviar um comando ao equipamento.','Confira o mapeamento de comandos e a comunicação. Verifique o estado físico antes de tentar novamente.')
  ,FALHA_SERVIDOR:entry('ERROR','O servidor não conseguiu concluir uma solicitação.','Verifique a disponibilidade do serviço e do banco. Consulte o responsável pela hospedagem se o problema persistir.')
});
export const clientDiagnosticCodes=new Set(['USB_PERMISSAO_NEGADA','USB_INDISPONIVEL','USB_DESCONECTADA','PACOTE_INVALIDO','SERVIDOR_INDISPONIVEL','ACK_TIMEOUT','COMANDO_BLOQUEADO_LOCAL','COMANDO_ENVIO_FALHOU']);
export async function recordDiagnostic({empresaId,maquinaId=null,usuarioId=null,codigo,origem='SISTEMA',eventoCliente=null,strict=false},db=prisma){
  const definition=diagnosticCodes[codigo];if(!definition||!Number.isSafeInteger(empresaId)||empresaId<=0)return;
  try{
    return await db.diagnosticEvent.create({data:{empresaId,maquinaId,usuarioId,codigo,nivel:definition.nivel,origem,eventoCliente}});
  }catch(error){if(strict)throw error;if(error.code!=='P2002')console.error('[DIAGNOSTICO] Não foi possível gravar um evento.');}
}
const states={ONLINE:'CONEXAO_CONFIRMADA',CONNECTING:'CONEXAO_AGUARDANDO',ERROR:'CONEXAO_FALHOU',STOPPED:'CONEXAO_ENCERRADA',OFFLINE:'PONTE_OFFLINE'};
export async function transitionConnection(link,estado,db=prisma){
  const codigo=states[estado];if(!codigo||link.estado===estado)return;
  if(db===prisma)return prisma.$transaction(tx=>transitionConnection(link,estado,tx));
  const result=await db.machineConnection.updateMany({where:{id:link.id,empresaId:link.empresaId,versao:link.versao,estado:{not:estado},...(estado!=='STOPPED'?{ativa:true}:{})},data:{estado}});
  if(result.count)await recordDiagnostic({empresaId:link.empresaId,maquinaId:link.maquinaId,codigo,origem:'CONEXAO',strict:true},db);
}
export async function sweepOfflineConnections(){
  // A condição também é revalidada no UPDATE para não derrubar um heartbeat novo.
  const cutoff=new Date(Date.now()-30000);
  const links=await prisma.machineConnection.findMany({where:{ativa:true,estado:{not:'OFFLINE'},host:{OR:[{vistoEm:{lt:cutoff}},{revogadoEm:{not:null}},{tipo:'NAVEGADOR',pairingAte:{lt:new Date()}}]}},take:500});
  for(const link of links){
    await prisma.$transaction(async tx=>{
      const changed=await tx.machineConnection.updateMany({where:{id:link.id,versao:link.versao,ativa:true,estado:{not:'OFFLINE'},host:{OR:[{vistoEm:{lt:cutoff}},{revogadoEm:{not:null}},{tipo:'NAVEGADOR',pairingAte:{lt:new Date()}}]}},data:{estado:'OFFLINE'}});
      if(changed.count)await recordDiagnostic({empresaId:link.empresaId,maquinaId:link.maquinaId,codigo:'PONTE_OFFLINE',origem:'SERVIDOR',strict:true},tx);
    });
  }
}
export function startDiagnosticMonitor(){
  let busy=false;
  const run=async()=>{if(busy)return;busy=true;try{await sweepOfflineConnections();}catch{console.error('[DIAGNOSTICO] Verificação de presença indisponível.');}finally{busy=false;}};
  const timer=setInterval(run,15000);timer.unref();void run();return ()=>clearInterval(timer);
}
