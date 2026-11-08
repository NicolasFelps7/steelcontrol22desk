import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createRealtimeBridge } from '../src/lib/realtimeBridge.js';

test('encaminha uma vez para outra réplica da mesma base e isola bases distintas',async () => {
  const transport = new EventEmitter();
  function connect() {
    return {
      on(){}, async connect(){}, isReady:true, isOpen:true,
      duplicate:connect, async subscribe(topic,fn){transport.on(topic,fn);},
      async publish(topic,data){transport.emit(topic,data);},destroy(){}
    };
  }
  const seen = [[],[],[]];
  const peers = seen.map((list,index)=>createRealtimeBridge({
    url:'test',database:index===2?'outra':'mesma',connect,
    deliver:(topic,event)=>list.push([topic,event])
  }));
  await Promise.all(peers.map(p=>p.start()));
  const event = {tipo:'telemetria',dados:{j1:31}};
  peers[0].publish('maquina:9',event);
  assert.deepEqual(seen,[[],[['maquina:9',event]],[]]);
  peers.forEach(p=>p.close());
});
