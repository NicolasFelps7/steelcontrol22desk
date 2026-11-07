/* O idioma da home compartilha a preferência do login, sem carregar autenticação. */
(() => {
  'use strict';
  const copy = globalThis.STEEL_HOME_COPY;
  const supported = ['pt', 'en', 'es', 'fr', 'de', 'it'];
  const select = document.getElementById('steelLanguageSelect');
  const normalize = value => supported.includes(String(value || '').slice(0, 2)) ? String(value).slice(0, 2) : 'pt';
  const read = () => { try { return normalize(localStorage.getItem('idiomaSistema')); } catch { return 'pt'; } };
  const menuLabel = open => copy[document.documentElement.lang.slice(0,2)]?.[open ? 't272' : 't013'];
  function apply(value) {
    const lang = normalize(value);
    const table = copy?.[lang];
    if (!table) return;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    document.querySelectorAll('[data-home-t],[data-home-text]').forEach(node => {
      const key = node.getAttribute('data-home-t') || node.getAttribute('data-home-text');
      if (typeof table[key] === 'string') node.textContent = table[key];
    });
    document.querySelectorAll('[data-home-attr]').forEach(node => {
      const attributes = JSON.parse(node.getAttribute('data-home-attr'));
      for (const [name,key] of Object.entries(attributes)) {
        if (['aria-label','title','alt','data-cap','content'].includes(name) && typeof table[key] === 'string') node.setAttribute(name,table[key]);
      }
    });
    // A legenda acompanha a aba atualmente aberta, inclusive após mudar idioma.
    const active = document.querySelector('.tab[aria-selected="true"]');
    const caption = document.getElementById('cap');
    if (active && caption) caption.textContent = active.getAttribute('data-cap') || '';
    const menu = document.getElementById('burger');
    if (menu) menu.setAttribute('aria-label',menuLabel(menu.getAttribute('aria-expanded') === 'true'));
    if (select) {
      select.value = lang;
      select.setAttribute('aria-label', {pt:'Idioma', en:'Language', es:'Idioma', fr:'Langue', de:'Sprache', it:'Lingua'}[lang]);
    }
  }
  select?.addEventListener('change', () => {
    const lang = normalize(select.value);
    try { localStorage.setItem('idiomaSistema',lang); } catch { /* Continua traduzindo sem armazenamento. */ }
    apply(lang);
  });
  window.addEventListener('storage', event => { if (event.key === 'idiomaSistema') apply(event.newValue); });
  window.SteelHomeI18n = Object.freeze({apply,menuLabel,supported:Object.freeze(supported)});
  apply(read());
})();
