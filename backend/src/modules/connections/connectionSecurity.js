import crypto from 'node:crypto';
export const DRIVERS = ['AUTO','DOBOT_MAGICIAN','MODBUS_TCP','MODBUS_RTU','OPC_UA','MQTT','HTTP_REST','TCP_IP','SERIAL_JSON','MOCK'];
export const digest = value => crypto.createHash('sha256').update(String(value)).digest('hex');
export const online = date => Boolean(date && Date.now() - new Date(date).getTime() < 20000);
export function seal(value, secret, context) {
  const key = crypto.createHash('sha256').update(`steelcontrol-connections-v1:${secret}`).digest();
  const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from(context));
  const data = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');
}
export function unseal(value, secret, context) {
  const raw = Buffer.from(value,'base64url');
  const key = crypto.createHash('sha256').update(`steelcontrol-connections-v1:${secret}`).digest();
  const cipher = crypto.createDecipheriv('aes-256-gcm',key,raw.subarray(0,12));
  cipher.setAAD(Buffer.from(context)); cipher.setAuthTag(raw.subarray(12,28));
  return Buffer.concat([cipher.update(raw.subarray(28)),cipher.final()]).toString('utf8');
}
export function validateConnection(body) {
  const driver = String(body.driver || 'AUTO').toUpperCase();
  if (!DRIVERS.includes(driver)) throw new Error('Selecione um protocolo compatível.');
  const params = body.parametros || {};
  if (!params || Array.isArray(params) || typeof params !== 'object' || JSON.stringify(params).length > 8000)
    throw new Error('Configuração de comunicação inválida.');
  if (params.port != null && (!Number.isInteger(Number(params.port)) || Number(params.port)<1 || Number(params.port)>65535))
    throw new Error('A porta de rede deve estar entre 1 e 65535.');
  if (params.serialPort && !/^(AUTO|COM\d+|browser-[a-f0-9-]{36}|\/dev\/[\w./-]+)$/i.test(String(params.serialPort)))
    throw new Error('Selecione uma porta serial válida.');
  if(params.baud!=null&&(!Number.isInteger(Number(params.baud))||Number(params.baud)<300||Number(params.baud)>4000000))throw new Error('Baud rate inválido.');
  for(const name of ['fieldMap','commandMap'])if(params[name]!=null){
    if(typeof params[name]!=='object'||Array.isArray(params[name])||Object.keys(params[name]).length>64)throw new Error('Mapeamento inválido.');
    for(const [key,value] of Object.entries(params[name]))if(!/^[A-Za-z][\w.]{0,80}$/.test(key)||typeof value!=='string'||!value.length||value.length>120||/(?:__proto__|constructor|prototype)/.test(key+'.'+value))throw new Error('Mapeamento inválido.');
  }
  // A permissão do servidor nunca pode ser forjada nos parâmetros do cliente.
  delete params.serverRemoteControlEnabled;
  return { driver, parametros: params, comandos: body.comandos === true };
}
