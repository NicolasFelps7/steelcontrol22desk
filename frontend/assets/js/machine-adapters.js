/* Adaptadores de navegador: sem biblioteca nativa e sem inferir protocolo pelo tipo da máquina. */
(function(root){
  'use strict';
  const forbidden=new Set(['__proto__','prototype','constructor']);
  function at(object,path){
    return String(path).split('.').reduce((value,key)=>forbidden.has(key)||!value||!Object.hasOwn(value,key)?undefined:value[key],object);
  }
  function normalize(packet,map={}){
    if(!packet||Array.isArray(packet)||typeof packet!=='object')throw new Error('A máquina deve enviar objetos JSON por linha.');
    const source=packet.telemetria||packet;
    if(!source||Array.isArray(source)||typeof source!=='object')throw new Error('Telemetria inválida.');
    const result={origem:'EQUIPAMENTO'};
    for(const field of ['temperatura','vibracao','corrente','producao','ciclos','consumoEnergia','qualidadeSinal','latenciaMs']){
      const value=at(source,map[field]||field);
      if(value!==undefined&&value!==null&&value!==''){
        if(typeof value==='boolean'||!Number.isFinite(Number(value)))throw new Error('Leitura numérica inválida: '+field);
        result[field]=Number(value);
      }
    }
    // Campos específicos de qualquer categoria permanecem no dashboard genérico.
    result.dadosExtras=source.dadosExtras&&typeof source.dadosExtras==='object'&&!Array.isArray(source.dadosExtras)?source.dadosExtras:{equipamento:source};
    if(JSON.stringify(result).length>24000)throw new Error('Pacote de telemetria muito grande.');
    return result;
  }
  class SerialJsonAdapter{
    constructor(port,params={},onPacket=()=>{},onError=()=>{}){this.port=port;this.params=params;this.onPacket=onPacket;this.onError=onError;this.closed=false;this.reader=null;}
    async open(){
      await this.port.open({baudRate:Number(this.params.baud||115200),bufferSize:8192});
      this.closed=false;this.reading=this.read();
    }
    async read(){
      const decoder=new TextDecoder();let buffer='';
      try{
        this.reader=this.port.readable.getReader();
        while(!this.closed){
          const {value,done}=await this.reader.read();if(done)break;
          buffer+=decoder.decode(value,{stream:true});
          if(buffer.length>65536)throw new Error('A máquina excedeu o limite de mensagem serial.');
          let end;
          while((end=buffer.indexOf('\n'))>=0){
            const line=buffer.slice(0,end).trim();buffer=buffer.slice(end+1);
            if(line)await this.onPacket(JSON.parse(line));
          }
        }
        if(!this.closed)throw new Error('A porta USB foi desconectada.');
      }catch(error){if(!this.closed)this.onError(error);}
      finally{this.reader?.releaseLock();this.reader=null;}
    }
    async command(command){
      const mapped=this.params.commandMap?.[command.comando];
      if(typeof mapped!=='string'||!mapped.trim())throw new Error('Comando sem mapeamento para este equipamento.');
      const writer=this.port.writable.getWriter();
      try{await writer.write(new TextEncoder().encode(JSON.stringify({id:command.id,comando:mapped,payload:command.payload||{}})+'\n'));}
      finally{writer.releaseLock();}
    }
    async close(){this.closed=true;await this.reader?.cancel().catch(()=>{});await this.reading;await this.port.close();}
  }
  const registry=new Map();
  function register(id,factory){if(registry.has(id)||typeof factory!=='function')throw new Error('Adaptador inválido ou duplicado.');registry.set(id,factory);}
  register('SERIAL_JSON',(port,params,onPacket,onError)=>new SerialJsonAdapter(port,params,onPacket,onError));
  const api={register,normalize,create(id,...args){const factory=registry.get(id);if(!factory)throw new Error('Este protocolo exige outro adaptador.');return factory(...args);}};
  root.SteelControlAdapters=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
