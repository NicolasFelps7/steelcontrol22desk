'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { trustedLocal, trustedRemote, parseEdgeLink, trustedRemoteFrame } = require('../security.cjs');
test('somente o domínio exato do sistema pode navegar na janela remota', () => {
  assert.equal(trustedRemote('https://web-production-6682df.up.railway.app/app/login'), true);
  for (const url of ['http://web-production-6682df.up.railway.app', 'https://web-production-6682df.up.railway.app.evil.test', 'file:///tmp/a', 'javascript:alert(1)']) {
    assert.equal(trustedRemote(url), false);
  }
});
test('link do Edge aceita apenas máquina positiva e nunca servidor, chaves ou comandos',()=>{
  assert.deepEqual(parseEdgeLink('steelcontrol://connect?maquinaId=7'),{machineId:7});
  assert.deepEqual(parseEdgeLink('steelcontrol://connect'),{machineId:null});
  for(const value of ['steelcontrol://connect?maquinaId=0','steelcontrol://connect?maquinaId=-1','steelcontrol://connect?maquinaId=2147483648','steelcontrol://connect?maquinaId=7&maquinaId=8','steelcontrol://connect?token=secret','steelcontrol://connect?url=https://evil.test','steelcontrol://user:pass@connect?maquinaId=7','steelcontrol://connect/other?maquinaId=7','steelcontrol://connect?maquinaId=7#command','https://connect?maquinaId=7'])assert.equal(parseEdgeLink(value),null,value);
});
test('IPC do Edge aceita somente janelas autorizadas e seu frame principal',()=>{
  const frame={url:'https://web-production-6682df.up.railway.app/app/maquinas?edge=1'};
  const wc={mainFrame:frame};const win={isDestroyed:()=>false,webContents:wc};
  assert.equal(trustedRemoteFrame({sender:wc,senderFrame:frame},[null,win]),true);
  assert.equal(trustedRemoteFrame({sender:wc,senderFrame:{...frame}},[win]),false);
  assert.equal(trustedRemoteFrame({sender:{},senderFrame:frame},[win]),false);
  frame.url='https://evil.test';assert.equal(trustedRemoteFrame({sender:wc,senderFrame:frame},[win]),false);
});
test('IPC exige o frame principal da janela local exata', () => {
  const filename = '/tmp/panel.html'; const frame = { url: pathToFileURL(filename).href };
  const window = { isDestroyed: () => false, webContents: { mainFrame: frame } };
  assert.equal(trustedLocal(frame, window, filename), true);
  assert.equal(trustedLocal({ ...frame }, window, filename), false);
  assert.equal(trustedLocal({ url: 'https://web-production-6682df.up.railway.app' }, window, filename), false);
  frame.url += '?query'; assert.equal(trustedLocal(frame, window, filename), false);
});
