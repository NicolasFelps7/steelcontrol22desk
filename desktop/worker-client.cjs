'use strict';
const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');
const readline = require('node:readline');

class WorkerClient extends EventEmitter {
  constructor(command, args, options = {}) {
    super();
    this.command = command; this.args = args; this.options = options;
    this.pending = new Map(); this.seq = 0; this.child = null;
    this.ready = false; this.stopping = false; this.retry = 0; this.timer = null;
    this.fatal = false;
  }
  start() {
    if (this.child || this.stopping || this.fatal) return;
    this.emit('state', { running: false, message: 'Iniciando conexões…' });
    const child = spawn(this.command, this.args, {
      ...this.options, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
    });
    this.child = child;
    // Eventos de erro do pipe nunca podem derrubar o Desktop.
    child.stdin.on('error', () => {});
    const lines = readline.createInterface({ input: child.stdout });
    lines.on('line', line => {
      if (line.length > 262144) return;
      let msg;
      try { msg = JSON.parse(line); } catch { return; }
      if (msg.id != null) {
        const request = this.pending.get(msg.id);
        if (request) {
          clearTimeout(request.timer); this.pending.delete(msg.id);
          if (msg.error) request.reject(new Error(msg.error)); else request.resolve(msg.result);
        }
      } else if (msg.event === 'ready') {
        this.ready = true; this.retry = 0;
        this.emit('state', { running: true, message: 'Conexões disponíveis' });
      } else if (msg.event === 'fatal') {
        this.fatal = true;
        this.emit('state', { running: false, message: String(msg.message).slice(0, 500) });
      } else if (msg.event === 'status') this.emit('status', msg);
      // Logs não são transmitidos ao conteúdo remoto nem persistidos com segredos.
    });
    child.stderr.on('data', () => {});
    child.once('error', () => {
      this.emit('state', { running: false, message: 'Não foi possível iniciar o Edge incluído. Reinstale o Desktop ou confira a geração do instalador.' });
    });
    child.once('close', () => {
      lines.close();
      if (this.child !== child) return;
      this.child = null; this.ready = false;
      for (const request of this.pending.values()) {
        clearTimeout(request.timer); request.reject(new Error('A conexão local foi interrompida.'));
      }
      this.pending.clear();
      if (!this.stopping && !this.fatal) {
        this.emit('state', { running: false, message: 'Conexão local interrompida. Tentando reiniciar…' });
        this.timer = setTimeout(() => this.start(), Math.min(30000, 1000 * 2 ** Math.min(this.retry++, 5)));
      }
      this.emit('closed');
    });
  }
  request(action, data = {}) {
    if (!this.ready || !this.child || this.stopping) return Promise.reject(new Error('Aguarde a inicialização das conexões.'));
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id); reject(new Error('A operação excedeu o tempo de espera. Atualize a lista antes de tentar novamente.'));
      }, 45000);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ id, action, data }) + '\n', err => {
        if (!err) return;
        const pending = this.pending.get(id);
        if (pending) { clearTimeout(timer); this.pending.delete(id); reject(new Error('O Edge não está disponível.')); }
      });
    });
  }
  async stop() {
    this.stopping = true; clearTimeout(this.timer);
    const child = this.child;
    if (!child) return;
    await new Promise(resolve => {
      const timer = setTimeout(() => { child.kill(); resolve(); }, 15000);
      child.once('close', () => { clearTimeout(timer); resolve(); });
      child.stdin.end(JSON.stringify({ action: 'shutdown' }) + '\n');
    });
  }
}
module.exports = { WorkerClient };
