/* Compatibilidade com páginas antigas em cache. A ponte Web Serial foi retirada.
 * As conexões são executadas exclusivamente pelo SteelControl Edge instalado. */
if (typeof window !== 'undefined') {
  try { Promise.resolve(window.SteelControlBrowserBridge?.close?.()).catch(() => {}); } catch (_) {}
  delete window.SteelControlBrowserBridge;
}
