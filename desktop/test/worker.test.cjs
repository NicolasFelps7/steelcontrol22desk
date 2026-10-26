'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { WorkerClient } = require('../worker-client.cjs');
const fixture = `
const rl = require('node:readline').createInterface({input:process.stdin});
console.log(JSON.stringify({event:'ready'}));
rl.on('line', line => {
  const r=JSON.parse(line);
  if(r.action==='shutdown')return process.exit(0);
  if(r.action==='fail')console.log(JSON.stringify({id:r.id,error:'chave inválida'}));
  else console.log(JSON.stringify({id:r.id,result:{ok:true,action:r.action}}));
});`;
test('supervisor correlaciona respostas e encerra sem reiniciar o Edge', async () => {
  const worker = new WorkerClient(process.execPath, ['-e', fixture]);
  worker.start();
  while (!worker.ready) await once(worker, 'state');
  assert.deepEqual(await worker.request('list'), { ok: true, action: 'list' });
  await assert.rejects(worker.request('fail'), /chave inválida/);
  await worker.stop();
  assert.equal(worker.child, null);
  assert.equal(worker.stopping, true);
  assert.equal(worker.pending.size, 0);
  await assert.rejects(worker.request('list'), /inicialização/);
});
test('falha fatal não dispara reinícios sucessivos nem abre outro Edge', async () => {
  const worker = new WorkerClient(process.execPath, ['-e', `console.log(JSON.stringify({event:'fatal',message:'Outro Edge aberto'}));process.exit(2)`]);
  const closed = once(worker, 'closed'); worker.start(); await closed;
  assert.equal(worker.fatal, true); assert.equal(worker.timer, null);
  await worker.stop();
});
