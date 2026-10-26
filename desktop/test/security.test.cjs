'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { trustedLocal, trustedRemote } = require('../security.cjs');
test('somente o domínio exato do sistema pode navegar na janela remota', () => {
  assert.equal(trustedRemote('https://web-production-6682df.up.railway.app/app/login'), true);
  for (const url of ['http://web-production-6682df.up.railway.app', 'https://web-production-6682df.up.railway.app.evil.test', 'file:///tmp/a', 'javascript:alert(1)']) {
    assert.equal(trustedRemote(url), false);
  }
});
test('IPC exige o frame principal da janela local exata', () => {
  const filename = '/tmp/panel.html'; const frame = { url: pathToFileURL(filename).href };
  const window = { isDestroyed: () => false, webContents: { mainFrame: frame } };
  assert.equal(trustedLocal(frame, window, filename), true);
  assert.equal(trustedLocal({ ...frame }, window, filename), false);
  assert.equal(trustedLocal({ url: 'https://web-production-6682df.up.railway.app' }, window, filename), false);
  frame.url += '?query'; assert.equal(trustedLocal(frame, window, filename), false);
});
