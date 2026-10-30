import { lockMachine } from "../../lib/machineLock.js";
import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { authRequired, requireRoles } from '../../middlewares/auth.js';
import { criarRateLimit } from '../../middlewares/security.js';
import { registrarAuditoria } from '../../lib/audit.js';
import { gerarDeviceKey, hashDeviceKey, deviceKeyHint } from '../../lib/deviceSecurity.js';
import { digest, online, seal, unseal, validateConnection } from './connectionSecurity.js';
import { adapterCatalog, connectionCapabilities } from './adapterCatalog.js';
import { transitionConnection,recordDiagnostic } from '../../lib/diagnostics.js';

export const connectionRoutes = Router();
const admin = requireRoles('ADMINISTRADOR');
const run = fn => (req,res,next) => Promise.resolve(fn(req,res)).catch(error => {
  if ([400,403,409].includes(error.status)) return res.status(error.status).json({mensagem:error.message});
  next(error);
});
const fail = (res,status,mensagem) => res.status(status).json({mensagem});
const audit = (req,acao,detalhes) => registrarAuditoria({req,acao,entidade:'CONEXAO',detalhes});
const keyContext = (host,id,version) => `${host}:${id}:${version}`;

// O primeiro registro não concede empresa nem acesso a máquinas.
connectionRoutes.post('/computador/registrar', criarRateLimit({janelaMs:60000,limite:6,prefixo:'connection-enroll'}), run(async(req,res)=>{
  const now = new Date();
  await prisma.connectionHost.deleteMany({where:{empresaId:null,pairingAte:{lt:now}}});
  const token=crypto.randomBytes(32).toString('base64url');
  const codigo=crypto.randomBytes(8).toString('hex').toUpperCase();
  const host=await prisma.connectionHost.create({data:{nome:String(req.body?.nome||'Computador industrial').slice(0,100),tokenHash:digest(token),pairingHash:digest(codigo),pairingAte:new Date(Date.now()+600000)}});
  res.status(201).json({id:host.id,token,codigo,expiraEm:host.pairingAte});
}));
async function hostAuth(req,res,next) {
  try {
    const token=String(req.get('x-connection-token')||'');
    if(token.length<32)return fail(res,401,'Conexão local não autorizada.');
    const host=await prisma.connectionHost.findUnique({where:{tokenHash:digest(token)}});
    if(!host||host.revogadoEm)return fail(res,401,'Conexão local revogada ou inválida.');
    if(host.tipo==='NAVEGADOR')return fail(res,401,'Conexão pelo navegador desativada. Use o SteelControl Edge.');
    if(!host.empresaId&&new Date(host.pairingAte)<new Date())return fail(res,401,'Vínculo expirado.');
    if(host.empresaId){
      const company=await prisma.empresa.findUnique({where:{id:host.empresaId},select:{status:true}});
      if(company?.status!=='ATIVA')return fail(res,403,'Empresa indisponível.');
    }
    req.connectionHost=host;req.auditIdentity={empresaId:host.empresaId};next();
  } catch(e){next(e);}
}
connectionRoutes.post('/computador/sincronizar',hostAuth,run(async(req,res)=>{
  const host=req.connectionHost;
  const portas=Array.isArray(req.body?.portas)?req.body.portas.slice(0,32).map(p=>({porta:String(p.porta||'').slice(0,120),nome:String(p.nome||'USB / serial').slice(0,120)})):[];
  await prisma.connectionHost.update({where:{id:host.id},data:{vistoEm:new Date(),portas}});
  if(!host.empresaId)return res.json({vinculado:false,conexoes:[]});
  // Revalida o vínculo em cada sincronização; o dispositivo nunca escolhe a empresa.
  const links=await prisma.machineConnection.findMany({where:{hostId:host.id,empresaId:host.empresaId}});
  const reports=Array.isArray(req.body?.estados)?req.body.estados.slice(0,100):[];
  for(const r of reports){
    if(!['ONLINE','ERROR','STOPPED','CONNECTING'].includes(r.estado))continue;
    const link=links.find(x=>x.id===r.id&&x.versao===Number(r.versao));
    if(!link)continue;
    await transitionConnection(link,r.estado);
    await prisma.machineConnection.updateMany({where:{id:link.id,hostId:host.id,versao:link.versao},data:{estado:r.estado,...(r.salvo===true?{segredo:null}:{})}});
  }
  const result=[];
  for(const link of links){
    const machine=await prisma.maquina.findFirst({where:{id:link.maquinaId,empresaId:host.empresaId,ativo:true},select:{id:true,nome:true,intervaloLeitura:true}});
    if(!machine)continue;
    result.push({id:link.id,maquinaId:machine.id,nome:machine.nome,driver:link.driver,parametros:link.parametros,ativa:link.ativa,comandos:link.comandos,versao:link.versao,intervaloLeitura:machine.intervaloLeitura,
      ...(link.segredo?{credencial:unseal(link.segredo,env.jwtSecret,keyContext(host.id,machine.id,link.versao))}:{})});
  }
  res.json({vinculado:true,conexoes:result});
}));
connectionRoutes.use(authRequired);
connectionRoutes.get('/adaptadores', (req,res)=>res.json({adaptadores:adapterCatalog,cadastroLivre:true}));
connectionRoutes.all('/navegador/:acao',admin,(req,res)=>fail(res,410,'A ponte do navegador foi desativada. Abra o SteelControl Edge para conectar a máquina.'));
connectionRoutes.post('/vincular',admin,criarRateLimit({janelaMs:60000,limite:8,prefixo:'connection-claim'}),run(async(req,res)=>{
  const code=String(req.body?.codigo||'').replace(/\s|-/g,'').toUpperCase();
  if(!/^[A-F0-9]{16}$/.test(code))return fail(res,400,'Código de vínculo inválido.');
  const host=await prisma.connectionHost.findUnique({where:{pairingHash:digest(code)}});
  if(!host||host.empresaId||host.revogadoEm||new Date(host.pairingAte)<new Date())return fail(res,409,'Código expirado ou já utilizado. Abra o SteelControl no computador e tente novamente.');
  const claimed=await prisma.connectionHost.updateMany({where:{id:host.id,empresaId:null,pairingHash:digest(code),revogadoEm:null,pairingAte:{gt:new Date()}},data:{empresaId:req.auth.empresaId,pairingHash:null}});
  if(claimed.count!==1)return fail(res,409,'Este computador já foi vinculado.');
  await audit(req,'VINCULAR_COMPUTADOR',{computadorId:host.id});
  res.json({mensagem:'Computador vinculado à empresa.'});
}));
connectionRoutes.get('/computadores',run(async(req,res)=>{
  const hosts=await prisma.connectionHost.findMany({where:{empresaId:req.auth.empresaId,revogadoEm:null,tipo:'EDGE'},select:{id:true,nome:true,tipo:true,vistoEm:true,portas:true}});
  res.json({computadores:hosts.map(h=>({...h,online:online(h.vistoEm)}))});
}));
connectionRoutes.delete('/computadores/:hostId',admin,run(async(req,res)=>{
  await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT "id" FROM "ConnectionHost" WHERE "id" = ${req.params.hostId} FOR UPDATE`;
    const host=await tx.connectionHost.findFirst({where:{id:req.params.hostId,empresaId:req.auth.empresaId,revogadoEm:null}});
    if(!host)return;
    const links=await tx.machineConnection.findMany({where:{hostId:host.id,empresaId:req.auth.empresaId}});
    for(const link of links){
      await lockMachine(tx, link.maquinaId);
      const current=await tx.machineConnection.findFirst({where:{id:link.id,hostId:host.id,empresaId:req.auth.empresaId}});
      if(current){
        await tx.maquina.updateMany({where:{id:link.maquinaId,empresaId:req.auth.empresaId},data:{deviceKeyHash:null,deviceKeyHint:null}});
        await recordDiagnostic({empresaId:req.auth.empresaId,maquinaId:link.maquinaId,usuarioId:req.auth.usuarioId,codigo:'CONEXAO_ENCERRADA',origem:'SISTEMA'},tx);
      }
    }
    await tx.connectionHost.update({where:{id:host.id},data:{revogadoEm:new Date()}});
    await tx.machineConnection.updateMany({where:{hostId:host.id},data:{ativa:false,segredo:null,comandos:false,estado:'STOPPED'}});
  });
  await audit(req,'REVOGAR_COMPUTADOR',{computadorId:req.params.hostId});res.json({mensagem:'Computador desvinculado e credenciais revogadas.'});
}));
connectionRoutes.use('/maquinas/:id', (req,res,next)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0)return fail(res,400,'Máquina inválida.');
  next();
});
connectionRoutes.get('/maquinas/:id',run(async(req,res)=>{
  const machine=await prisma.maquina.findFirst({where:{id:Number(req.params.id),empresaId:req.auth.empresaId,ativo:true}});
  if(!machine)return fail(res,404,'Máquina não encontrada.');
  const link=await prisma.machineConnection.findFirst({where:{maquinaId:machine.id,empresaId:req.auth.empresaId},include:{host:true}});
  res.json({capacidades:connectionCapabilities(machine,link),conexao:link?{id:link.id,hostId:link.hostId,tipo:link.host.tipo||'EDGE',computador:link.host.nome,driver:link.driver,parametros:link.parametros,ativa:link.ativa,comandos:link.comandos,estado:!link.ativa?'STOPPED':link.host.revogadoEm||!online(link.host.vistoEm)?'OFFLINE':link.estado}:null});
}));
connectionRoutes.put('/maquinas/:id',admin,run(async(req,res)=>{
  let cfg;try{cfg=validateConnection(req.body||{});}catch(e){return fail(res,400,e.message);}
  const id=Number(req.params.id), hostId=String(req.body?.hostId||'');
  const host=await prisma.connectionHost.findFirst({where:{id:hostId,empresaId:req.auth.empresaId,revogadoEm:null}});
  if(!host)return fail(res,404,'Computador não encontrado nesta empresa.');
  if(!online(host.vistoEm))return fail(res,409,'Abra o SteelControl no computador conectado à máquina antes de continuar.');
  if(host.tipo==='NAVEGADOR')return fail(res,409,'Use um computador com SteelControl Edge. A ponte do navegador foi desativada.');
  if(['DOBOT_MAGICIAN','SERIAL_JSON','MODBUS_RTU'].includes(cfg.driver)&&(!cfg.parametros.serialPort||cfg.parametros.serialPort==='AUTO'))return fail(res,400,'Selecione a porta USB / serial da máquina.');
  if(['MODBUS_TCP','TCP_IP','MQTT'].includes(cfg.driver)&&!String(cfg.parametros.host||'').trim())return fail(res,400,'Informe o IP ou host da máquina.');
  if(cfg.parametros.serialPort&&cfg.parametros.serialPort!=='AUTO'&&!(Array.isArray(host.portas)&&host.portas.some(p=>p.porta===cfg.parametros.serialPort)))return fail(res,409,'Essa porta não está disponível no computador selecionado.');
  const secret=gerarDeviceKey();
  const changed=await prisma.$transaction(async tx=>{
    // Serializa transferências da mesma máquina entre computadores e criação de versão.
    await tx.$queryRaw`SELECT "id" FROM "ConnectionHost" WHERE "id" = ${hostId} FOR UPDATE`;
    const authorized=await tx.connectionHost.findFirst({where:{id:hostId,empresaId:req.auth.empresaId,revogadoEm:null}});
    if(!authorized)throw Object.assign(new Error('Computador revogado.'),{status:409});
    await lockMachine(tx, id);
    const machine=await tx.maquina.findFirst({where:{id,empresaId:req.auth.empresaId,ativo:true}});
    if(!machine)return false;
    if((cfg.driver==='MOCK'||cfg.driver==='AUTO'&&machine.protocolo==='MOCK')&&machine.modoSimulacao===false)throw Object.assign(new Error('Máquinas reais não podem usar o simulador. Selecione o protocolo do equipamento.'),{status:400});
    if(machine.modoSimulacao===true&&cfg.driver!=='MOCK')throw Object.assign(new Error('Este cadastro é de simulação. Altere para equipamento real antes de conectar hardware.'),{status:400});
    if(cfg.driver==='AUTO'&&machine.controlador!=='DOBOT_MAGICIAN'&&!['USB_SERIAL',...['DOBOT_MAGICIAN','MODBUS_TCP','MODBUS_RTU','OPC_UA','MQTT','HTTP_REST','TCP_IP','SERIAL_JSON','MOCK']].includes(machine.protocolo))throw Object.assign(new Error('Selecione um protocolo suportado para esta máquina.'),{status:400});
    const previous=await tx.machineConnection.findUnique({where:{maquinaId:id}});
    const version=(previous?.versao||0)+1;
    if(cfg.parametros.serialPort){
      const siblings=await tx.machineConnection.findMany({where:{hostId,empresaId:req.auth.empresaId,ativa:true,maquinaId:{not:id}}});
      if(siblings.some(x=>x.parametros?.serialPort===cfg.parametros.serialPort))throw Object.assign(new Error('Esta porta já está em uso por outra máquina.'),{status:409});
    }
    const values={hostId,empresaId:req.auth.empresaId,driver:cfg.driver,parametros:cfg.parametros,comandos:cfg.comandos,ativa:true,estado:'CONNECTING',versao:version,segredo:seal(secret,env.jwtSecret,keyContext(hostId,id,version))};
    await tx.machineConnection.upsert({where:{maquinaId:id},create:{...values,maquinaId:id},update:values});
    await tx.maquina.update({where:{id},data:{deviceKeyHash:hashDeviceKey(secret),deviceKeyHint:deviceKeyHint(secret)}});
    return true;
  });
  if(!changed)return fail(res,404,'Máquina não encontrada.');
  await audit(req,'CONFIGURAR_CONEXAO',{maquinaId:id,computadorId:hostId,driver:cfg.driver,comandos:cfg.comandos});
  await recordDiagnostic({empresaId:req.auth.empresaId,maquinaId:id,usuarioId:req.auth.usuarioId,codigo:'CONEXAO_AGUARDANDO',origem:'SISTEMA'});
  res.json({mensagem:'Configuração enviada. Aguardando confirmação da máquina.'});
}));
connectionRoutes.delete('/maquinas/:id',admin,run(async(req,res)=>{
  const id=Number(req.params.id);
  await prisma.$transaction(async tx=>{
    await lockMachine(tx, id);
    await tx.machineConnection.updateMany({where:{maquinaId:id,empresaId:req.auth.empresaId},data:{ativa:false,comandos:false,estado:'STOPPED',segredo:null,versao:{increment:1}}});
    await tx.maquina.updateMany({where:{id,empresaId:req.auth.empresaId},data:{deviceKeyHash:null,deviceKeyHint:null}});
  });
  const owned=await prisma.maquina.findFirst({where:{id,empresaId:req.auth.empresaId},select:{id:true}});
  if(owned)await recordDiagnostic({empresaId:req.auth.empresaId,maquinaId:id,usuarioId:req.auth.usuarioId,codigo:'CONEXAO_ENCERRADA',origem:'SISTEMA'});
  await audit(req,'DESCONECTAR_MAQUINA',{maquinaId:id});res.json({mensagem:'Conexão desativada. O histórico foi preservado.'});
}));
