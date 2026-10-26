// Registro de contratos de comunicação. Categoria comercial não define protocolo.
const adapter = (id,nome,ambientes,monitoramento,controle,observacao) => ({id,nome,ambientes,monitoramento,controle,observacao});
export const adapterCatalog = Object.freeze([
  adapter('SERIAL_JSON','USB / serial JSON',['EDGE'],true,true,'JSON por linha; comandos exigem mapeamento e confirmação do equipamento.'),
  adapter('DOBOT_MAGICIAN','Dobot Magician',['EDGE'],true,true,'Driver específico; requer ponte compatível com o protocolo binário.'),
  adapter('MODBUS_TCP','Modbus TCP',['EDGE'],true,true,'Requer acesso à rede industrial e mapa de registradores.'),
  adapter('MODBUS_RTU','Modbus RTU',['EDGE'],true,true,'Requer porta serial e mapa de registradores.'),
  adapter('OPC_UA','OPC UA',['EDGE'],true,true,'Requer endpoint e mapa de nós; comandos dependem dos nós de escrita.'),
  adapter('MQTT','MQTT',['EDGE'],true,true,'Requer broker, tópicos e contrato de mensagens.'),
  adapter('HTTP_REST','HTTP / REST',['EDGE'],true,true,'Requer API e contrato compatíveis com o equipamento.'),
  adapter('TCP_IP','TCP / IP JSON',['EDGE'],true,true,'JSON por linha; requer acesso ao endereço do equipamento.'),
  adapter('MOCK','Simulação',['EDGE'],true,false,'Somente demonstração; não confirma comunicação física.')
]);
export function connectionCapabilities(machine,link,now=Date.now()) {
  const driver=link?.driver==='AUTO' ? (machine.controlador==='DOBOT_MAGICIAN'?'DOBOT_MAGICIAN':machine.protocolo==='USB_SERIAL'?'SERIAL_JSON':machine.protocolo) : link?.driver;
  const item=adapterCatalog.find(a=>a.id===driver);
  const fresh=machine.ultimaTelemetriaEm && now-new Date(machine.ultimaTelemetriaEm).getTime()<Math.max(15000,Number(machine.intervaloLeitura||2000)*3);
  const hostAvailable=link?.host && !link.host.revogadoEm && now-new Date(link.host.vistoEm).getTime()<20000 && link.host.tipo!=='NAVEGADOR';
  const connected=Boolean(link?.ativa&&hostAvailable&&link.estado==='ONLINE'&&fresh);
  const meta=machine.integracaoMeta||{};
  const remote=machine.controlador==='DOBOT_MAGICIAN'?meta.dobot?.remoteControlEnabled===true:meta.hmi?.remoteControlEnabled===true;

  const simulated=machine.modoSimulacao!==false;
  return {
    cadastro:true,categoria:machine.tipo||'Equipamento',adaptador:driver||null,
    situacao:simulated?'SIMULACAO':!link?'SEM_CONEXAO':!item?'REQUER_ADAPTADOR':!link.ativa?'DESCONECTADA':connected?'COMUNICACAO_CONFIRMADA':'AGUARDANDO_COMUNICACAO',
    monitoramento:{suportado:Boolean(item?.monitoramento),confirmado:!simulated&&connected},
    controle:{suportado:Boolean(item?.controle),habilitado:Boolean(!simulated&&connected&&item?.controle&&link?.comandos&&remote)},
    observacao:item?.observacao||'Cadastre o equipamento e configure uma interface de comunicação ou adaptador.'
  };
}
