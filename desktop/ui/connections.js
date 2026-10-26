'use strict';
const api = window.steelConnections;
const form = document.querySelector('#connection');
const notice = document.querySelector('#notice');
const fields = form.elements;
let profiles = [], selected = null, busy = false, refreshTimer, poll;
let defaultServer = 'https://web-production-6682df.up.railway.app';
function message(text, error = false) { notice.textContent = text; notice.classList.toggle('error', error); }
function button(text, action, className = 'secondary') {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.className = className;
  b.disabled = busy; b.addEventListener('click', action); return b;
}
async function operation(callback) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(b => b.disabled = true);
  try { await callback(); } catch (err) { message(err.message || 'Não foi possível concluir.', true); }
  finally {
    busy = false; document.querySelectorAll('button').forEach(b => b.disabled = false);
    await refresh();
  }
}
function reset() {
  selected = null; form.reset(); fields.serverUrl.value = defaultServer;
  fields.deviceKey.required = true; fields.deviceKey.placeholder = 'Device Key gerada no sistema';
  document.querySelector('#package').value = '';
  document.querySelector('#formTitle').textContent = 'Conectar uma máquina';
}
function edit(profile) {
  reset(); selected = profile.id;
  for (const [key, value] of Object.entries(profile)) {
    if (fields[key] && key !== 'allowCommands') fields[key].value = value ?? '';
  }
  for (const key of ['host', 'port', 'serialPort', 'baud', 'unitId', 'endpoint', 'topic']) {
    if (profile.params[key] != null) fields[key].value = profile.params[key];
  }
  const simple = new Set(['host','port','serialPort','baud','unitId','endpoint','topic','commandEndpoint','commandTopic']);
  const advanced = Object.fromEntries(Object.entries(profile.params).filter(([key]) => !simple.has(key)));
  fields.advanced.value = Object.keys(advanced).length ? JSON.stringify(advanced, null, 2) : '';
  fields.commandEndpoint.value = profile.params.commandTopic || profile.params.commandEndpoint || '';
  fields.allowCommands.checked = profile.allowCommands === true;
  fields.deviceKey.required = !profile.hasKey;
  fields.deviceKey.placeholder = 'Deixe vazio para manter a chave protegida';
  document.querySelector('#formTitle').textContent = 'Configurar ' + profile.label;
}
function render() {
  const container = document.querySelector('#profiles'); container.replaceChildren();
  if (!profiles.length) {
    const p = document.createElement('p'); p.textContent = 'Nenhuma conexão local. Cadastre uma máquina no sistema e conecte aqui.'; container.append(p);
  }
  const labels = { ONLINE: 'Conectada', STOPPED: 'Desconectada', ERROR: 'Falha — tentando reconectar' };
  for (const profile of profiles) {
    const card = document.createElement('div'); card.className = 'card';
    const name = document.createElement('strong'); name.textContent = profile.label;
    const info = document.createElement('small'); info.textContent = 'ID ' + profile.machineId + ' · ' + profile.driver;
    const status = document.createElement('small'); status.className = profile.state.toLowerCase();
    status.textContent = (labels[profile.state] || 'Conectando…') + (profile.enabled ? ' · reconexão habilitada' : '');
    card.append(name, info, status, button('Configurar', () => edit(profile)));
    card.append(button(profile.enabled ? 'Desconectar' : 'Conectar', () => operation(async () => {
      await api.request(profile.enabled ? 'disconnect' : 'connect', { id: profile.id });
      message(profile.enabled ? 'Conexão desativada. Ela não voltará ao iniciar o Windows.' : 'Conexão iniciada. Aguarde o estado do driver.');
    })));
    card.append(button('Remover', () => operation(async () => {
      if (!window.confirm('Remover esta conexão local? A máquina e os dados do sistema serão mantidos.')) return;
      await api.request('remove', { id: profile.id });
      if (selected === profile.id) reset();
      message('Conexão local removida.');
    }), 'danger'));
    container.append(card);
  }
}
async function refresh() {
  try {
    const settings = await api.request('settings');
    defaultServer = settings.serverUrl;
    const startup = document.querySelector('#autoStart');
    startup.checked = settings.autoStart; startup.disabled = !settings.packaged || busy;
    document.querySelector('#worker').textContent = settings.worker.message;
    if (!settings.worker.running) return;
    const data = await api.request('list'); profiles = data.profiles;
    if (fields.driver.options.length === 1) {
      fields.driver.replaceChildren();
      for (const [value, text] of Object.entries(data.drivers)) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; fields.driver.append(option);
      }
    }
    render();
  } catch (err) { message(err.message, true); }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  operation(async () => {
    const data = Object.fromEntries(new FormData(form));
    if (!selected && !String(data.deviceKey || '').trim()) throw new Error('Informe a chave gerada no sistema.');
    let params = {};
    if (data.advanced.trim()) {
      try { params = JSON.parse(data.advanced); } catch { throw new Error('Parâmetros avançados precisam ser um JSON válido.'); }
      if (!params || Array.isArray(params) || typeof params !== 'object') throw new Error('Use um objeto JSON nos parâmetros avançados.');
    }
    for (const key of ['host', 'port', 'serialPort', 'baud', 'unitId', 'endpoint', 'topic']) {
      if (String(data[key] || '').trim()) params[key] = ['port', 'baud', 'unitId'].includes(key) ? Number(data[key]) : data[key].trim();
    }
    if (data.commandEndpoint) params[data.driver === 'MQTT' ? 'commandTopic' : 'commandEndpoint'] = data.commandEndpoint.trim();
    message('Validando a chave no servidor…');
    const result = await api.request('save', {
      id: selected, label: data.label, serverUrl: data.serverUrl, machineId: Number(data.machineId),
      deviceKey: data.deviceKey.trim(), driver: data.driver, intervalMs: Number(data.intervalMs), params,
      allowCommands: fields.allowCommands.checked
    });
    selected = result.id; fields.deviceKey.value = ''; fields.deviceKey.required = false;
    document.querySelector('#package').value = '';
    message('Configuração salva. O estado ficará “Conectada” quando o driver confirmar a conexão.');
  });
});
document.querySelector('#import').addEventListener('click', () => {
  try {
    const data = JSON.parse(document.querySelector('#package').value);
    const server = data.server || data.serverUrl || data.apiBaseUrl;
    const machineId = Number(data.machineId || data.machine_id);
    const key = data.deviceKey || data.device_key;
    if (!server || !Number.isSafeInteger(machineId) || machineId <= 0 || typeof key !== 'string' || key.length < 16) throw new Error();
    const existing = profiles.find(p => p.machineId === machineId && p.serverUrl === server.replace(/\/$/, ''));
    if (existing) edit(existing); else reset();
    fields.serverUrl.value = server; fields.machineId.value = machineId; fields.deviceKey.value = key;
    fields.allowCommands.checked = false;
    document.querySelector('#package').value = '';
    message('Pacote preenchido. Confira a comunicação e clique em Salvar e conectar.');
  } catch { message('Pacote inválido. Copie novamente o pacote gerado pelo SteelControl.', true); }
});
document.querySelector('#detect').addEventListener('click', () => operation(async () => {
  const ports = await api.request('ports'); const list = document.querySelector('#serialPorts'); list.replaceChildren();
  for (const p of ports) {
    const option = document.createElement('option'); option.value = p.port; option.label = p.description; list.append(option);
  }
  message(ports.length ? 'Portas encontradas: ' + ports.map(p => p.port).join(', ') : 'Nenhuma porta serial encontrada. Confira o cabo USB e o driver do fabricante.');
}));
document.querySelector('#autoStart').addEventListener('change', event => operation(async () => {
  const result = await api.request('autoStart', { enabled: event.target.checked });
  message(result.enabled ? 'Inicialização com o Windows habilitada.' : 'Inicialização com o Windows desabilitada.');
}));
document.querySelector('#new').addEventListener('click', reset);
document.querySelector('#cancel').addEventListener('click', reset);
document.querySelector('#refresh').addEventListener('click', refresh);
api.onChange(() => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 250); });
reset(); refresh(); poll = setInterval(() => { if (!busy) refresh(); }, 5000);
window.addEventListener('beforeunload', () => { clearInterval(poll); clearTimeout(refreshTimer); });
