import { EventEmitter } from "events";

import { createRealtimeBridge } from "./realtimeBridge.js";

const bus = new EventEmitter();
bus.setMaxListeners(0);

let bridge;
export function iniciarRealtimeDistribuido() {
  bridge = createRealtimeBridge({
    url: process.env.REDIS_URL,
    database: process.env.DATABASE_URL || "",
    deliver: (topic, event) => bus.emit(topic, event)
  });
  bridge?.start().catch(() => console.warn("[REALTIME] Canal entre réplicas indisponível."));
  return () => bridge?.close();
}

function emitir(topic, event) {
  bus.emit(topic, event);
  bridge?.publish(topic, event);
}

function canalMaquina(maquinaId) {
  return `maquina:${Number(maquinaId)}`;
}

function canalEmpresa(empresaId) {
  return `empresa:${Number(empresaId)}`;
}

export function publicarEventoMaquina(maquinaId, tipo, dados) {
  emitir(canalMaquina(maquinaId), {
    tipo,
    dados,
    em: new Date().toISOString()
  });
}

export function assinarEventosMaquina(maquinaId, listener) {
  const nomeCanal = canalMaquina(maquinaId);
  bus.on(nomeCanal, listener);

  return () => {
    bus.off(nomeCanal, listener);
  };
}

// Eventos em tempo real no escopo da empresa. Usados para sincronizar
// desktop, tablet e outros clientes sem F5 quando um administrador altera
// funcionários, faciais, logo, dados da empresa ou equipamentos.
export function publicarEventoEmpresa(empresaId, tipo, dados = {}) {
  const id = Number(empresaId);
  if (!Number.isInteger(id) || id <= 0) return;

  emitir(canalEmpresa(id), {
    tipo,
    dados,
    empresaId: id,
    em: new Date().toISOString()
  });
}

export function assinarEventosEmpresa(empresaId, listener) {
  const nomeCanal = canalEmpresa(empresaId);
  bus.on(nomeCanal, listener);

  return () => {
    bus.off(nomeCanal, listener);
  };
}
