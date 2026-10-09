import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../frontend/assets/js/dobot-runtime.js', import.meta.url), 'utf8');
function harness() {
  const callbacks = {};
  const pointOutput = { textContent: '' };
  const elements = {};
  for (const name of ['dobotAutoCycles', 'dobotAutoSpeed', 'dobotAutoReset']) {
    elements[name] = { value: '1', addEventListener: (type, fn) => { callbacks[`${name}:${type}`] = fn; } };
  }
  const listeners = {};
  const requests = [];
  let current = { controlador: 'DOBOT_MAGICIAN', modoSimulacao: false, integracaoMeta: { dobot: { automatico: {
    pontos: { P0: { x: 150, y: 0, z: 80, r: 0 } }, ciclos: 3, velocidade: 18, versao: 2
  } } } };
  const store = new Map([['autenticado', 'true'], ['maquinaId', '9']]);
  const sandbox = {
    Headers, URLSearchParams, console,
    setInterval: () => 0, setTimeout, Date,
    window: { STEELCONTROL_API_URL: 'https://steel.test', location: { search: '' }, addEventListener: (key, fn) => { listeners[key] = fn; } },
    document: { getElementById: id => elements[id] || null, querySelectorAll: () => [],
      querySelector: selector => selector.includes('point-value="P0"') ? pointOutput : null },
    localStorage: { getItem: key => store.get(key) || null, removeItem: key => store.delete(key) },
    fetch: async (url, options = {}) => {
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body); requests.push({ url, body });
        current = { ...current, integracaoMeta: { dobot: { automatico: { ...body, versao: 3 } } } };
        return { ok: true, json: async () => ({ automatico: current.integracaoMeta.dobot.automatico, integracaoMeta: current.integracaoMeta }) };
      }
      return { ok: true, json: async () => url.endsWith('/diagnostico') ? {} : current };
    }
  };
  vm.runInNewContext(source, sandbox);
  return { callbacks, elements, pointOutput, listeners, requests };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
test('desktop abre com ensino do banco e reage ao ensino vindo do mobile', async () => {
  const h = harness(); await settle();
  assert.equal(h.elements.dobotAutoCycles.value, '3');
  assert.equal(h.elements.dobotAutoSpeed.value, '18');
  assert.match(h.pointOutput.textContent, /150/);
  h.listeners['steelcontrol:machine-snapshot']({ detail: { integracaoMeta: { dobot: { automatico: {
    pontos: { P0: { x: 180, y: 20, z: 90, r: 0 } }, ciclos: 5, velocidade: 12, versao: 3
  } } } } });
  assert.match(h.pointOutput.textContent, /180/);
  assert.equal(h.elements.dobotAutoCycles.value, '5');
  h.listeners['steelcontrol:machine-diagnostic']({ detail: { integracaoMeta: { dobot: { automatico: {
    pontos: {}, ciclos: 1, velocidade: 15, versao: 2
  } } } } });
  assert.match(h.pointOutput.textContent, /180/);
});
test('redefinir no desktop grava no servidor com a versão que foi lida', async () => {
  const h = harness(); await settle();
  await h.callbacks['dobotAutoReset:click']();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, 'https://steel.test/maquinas/9/dobot/automatico');
  assert.equal(h.requests[0].body.versao, 2);
  assert.deepEqual(h.requests[0].body.pontos, {});
  assert.equal(h.pointOutput.textContent, 'Não ensinado');
});
