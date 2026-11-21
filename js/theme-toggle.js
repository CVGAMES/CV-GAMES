(function () {
  'use strict';

  const key = 'cv-games-theme';
  const profileKey = 'cv-games-profile';
  const root = document.documentElement;
  const allowedProfiles = new Set(['educvv dev', 'educvv dev1']);

  function normalizeNickname(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  }

  function hasThemeAccess() {
    try {
      const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
      return allowedProfiles.has(normalizeNickname(profile?.nickname));
    } catch {
      return false;
    }
  }

  function readTheme() {
    if (!hasThemeAccess()) return 'normal';
    try {
      return localStorage.getItem(key) === 'christmas' ? 'christmas' : 'normal';
    } catch {
      return root.dataset.theme === 'christmas' ? 'christmas' : 'normal';
    }
  }

  function syncButtons() {
    const canUseTheme = hasThemeAccess();
    const isChristmas = canUseTheme && root.dataset.theme === 'christmas';
    const icon = isChristmas ? '🏠' : '🎄';
    const label = isChristmas ? 'Voltar ao tema normal' : 'Ativar tema de Natal';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.hidden = !canUseTheme;
      if (!canUseTheme) return;
      if (button.textContent !== icon) button.textContent = icon;
      if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
      if (button.title !== label) button.title = label;
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = isChristmas ? '#071426' : '#07111f';
  }

  function applyTheme(theme, persist) {
    const canUseTheme = hasThemeAccess();
    const next = canUseTheme && theme === 'christmas' ? 'christmas' : 'normal';
    root.dataset.theme = next;
    if (persist || !canUseTheme) {
      try { localStorage.setItem(key, next); } catch { /* A preferência fica ativa nesta página. */ }
    }
    syncButtons();
    window.dispatchEvent(new CustomEvent('cv-games-theme-change', { detail: { theme: next } }));
  }

  function refreshForProfileChange() {
    if (!hasThemeAccess()) applyTheme('normal', true);
    else applyTheme(readTheme(), false);
  }

  applyTheme(readTheme(), true);

  document.addEventListener('click', (event) => {
    const button = event.target && event.target.closest
      ? event.target.closest('[data-theme-toggle]')
      : null;
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!hasThemeAccess()) {
      applyTheme('normal', true);
      return;
    }
    applyTheme(root.dataset.theme === 'christmas' ? 'normal' : 'christmas', true);
  }, true);

  window.addEventListener('cv-games-profile-change', refreshForProfileChange);
  window.addEventListener('storage', (event) => {
    if (event.key === profileKey) refreshForProfileChange();
    else if (event.key === key) applyTheme(event.newValue, false);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncButtons, { once: true });
  else syncButtons();
}());