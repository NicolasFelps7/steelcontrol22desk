/* Eventos da empresa alimentam a lista; a API continua sendo a fonte de verdade. */
(() => {
  'use strict';
  const eventName = 'steelcontrol:empresa-evento';
  const storageKey = 'steelcontrolMachinesChanged';
  const removedTypes = new Set(['maquina.desativada', 'maquina.excluida']);
  const companyId = () => {
    try { return Number(JSON.parse(localStorage.getItem('empresa') || '{}').id) || 0; }
    catch { return 0; }
  };
  const machineId = event => Number(event?.dados?.maquinaId || 0);
  function dispatch(event) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: event }));
  }
  // Storage liga janelas do mesmo perfil sem publicar credenciais.
  window.addEventListener('storage', event => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      const data = JSON.parse(event.newValue);
      if (companyId() > 0 && Number(data.empresaId) === companyId() && String(data.tipo).startsWith('maquina.')) dispatch(data);
    } catch { /* Uma mensagem inválida não interfere na sincronização autenticada. */ }
  });
  function notify(type, id) {
    if (!String(type).startsWith('maquina.') || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) return;
    const event = { tipo: type, dados: { maquinaId: Number(id) }, empresaId: companyId(), em: new Date().toISOString() };
    dispatch(event);
    if (event.empresaId) {
      try { localStorage.setItem(storageKey, JSON.stringify(event)); } catch { /* SSE permanece ativo. */ }
    }
  }
  function create({ read, render, onRemove = () => {}, onError = () => {}, pollMs = 5000 }) {
    let stopped = false, revision = 0, pending = false, task = null, controller = null;
    let items = [];
    const removedIds = new Set();
    function replace(next, reason) {
      const ids = new Set(next.map(item => Number(item.id)));
      for (const old of items) if (!ids.has(Number(old.id))) onRemove(Number(old.id));
      items = next;
      render(items.slice(), { reason });
    }
    async function load() {
      do {
        pending = false;
        const started = revision;
        controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const next = await read(controller.signal);
          if (!Array.isArray(next)) throw new Error('Lista de equipamentos inválida.');
          if (!stopped && started === revision) replace(next.filter(item => !removedIds.has(Number(item.id))), 'sync');
        } catch (error) {
          if (!stopped && started === revision) onError(error);
        } finally { clearTimeout(timeout); }
      } while (pending && !stopped);
      return items.slice();
    }
    function refresh() {
      if (stopped) return Promise.resolve(items.slice());
      if (!task) task = load().finally(() => { task = null; });
      return task;
    }
    function changed(event) {
      const data = event.detail;
      const type = String(data?.tipo || '');
      if (data?.empresaId && companyId() && Number(data.empresaId) !== companyId()) return;
      if (type !== 'conectado' && !type.startsWith('maquina.')) return;
      revision += 1;
      pending = true;
      const id = machineId(data);
      if (removedTypes.has(type) && id > 0) {
        removedIds.add(id);
        replace(items.filter(item => Number(item.id) !== id), 'removed');
      }
      void refresh();
    }
    const focused = () => { void refresh(); };
    const interval = setInterval(focused, Math.max(1000, pollMs));
    window.addEventListener(eventName, changed);
    window.addEventListener('focus', focused);
    function stop() {
      stopped = true;
      clearInterval(interval);
      controller?.abort();
      window.removeEventListener(eventName, changed);
      window.removeEventListener('focus', focused);
    }
    return { refresh, stop };
  }
  window.SteelControlMachineSync = Object.freeze({ create, notify });
})();
