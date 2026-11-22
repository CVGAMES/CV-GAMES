(function () {
  'use strict';

  const key = 'cv-games-theme';
  const preferenceVersionKey = 'cv-games-theme-choice-version';
  const preferenceVersion = '2';
  const root = document.documentElement;

  function readTheme() {
    try {
      // The first visit after this update starts in Christmas mode for every profile.
      // After that, keep the user's explicit choice between Christmas and normal.
      if (localStorage.getItem(preferenceVersionKey) !== preferenceVersion) {
        localStorage.setItem(key, 'christmas');
        localStorage.setItem(preferenceVersionKey, preferenceVersion);
        return 'christmas';
      }
      return localStorage.getItem(key) === 'normal' ? 'normal' : 'christmas';
    } catch {
      return root.dataset.theme === 'normal' ? 'normal' : 'christmas';
    }
  }

  function syncButtons() {
    const isChristmas = root.dataset.theme === 'christmas';
    const icon = isChristmas ? '🏠' : '🎄';
    const label = isChristmas ? 'Voltar ao tema normal' : 'Ativar tema de Natal';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.hidden = false;
      if (button.textContent !== icon) button.textContent = icon;
      if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
      if (button.title !== label) button.title = label;
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = isChristmas ? '#071426' : '#07111f';
  }

  function applyTheme(theme, persist) {
    const next = theme === 'normal' ? 'normal' : 'christmas';
    root.dataset.theme = next;
    if (persist) {
      try {
        localStorage.setItem(key, next);
        localStorage.setItem(preferenceVersionKey, preferenceVersion);
      } catch { /* A preferência continua ativa nesta página. */ }
    }
    syncButtons();
    window.dispatchEvent(new CustomEvent('cv-games-theme-change', { detail: { theme: next } }));
  }

  function refreshTheme() {
    applyTheme(readTheme(), false);
  }

  applyTheme(readTheme(), false);

  document.addEventListener('click', (event) => {
    const button = event.target && event.target.closest
      ? event.target.closest('[data-theme-toggle]')
      : null;
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applyTheme(root.dataset.theme === 'christmas' ? 'normal' : 'christmas', true);
  }, true);

  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === preferenceVersionKey) refreshTheme();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncButtons, { once: true });
  else syncButtons();
}());
