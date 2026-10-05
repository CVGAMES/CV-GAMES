(function () {
  'use strict';

  const nickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
    .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  const allowed = nickname === 'educvv dev1';
  document.body.dataset.orbitalAccess = allowed ? 'granted' : 'locked';
  window.addEventListener('pageshow', () => {
    const currentNickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
      .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
    if ((currentNickname === 'educvv dev1') !== allowed) window.location.reload();
  });
  if (allowed) return;

  const hide = (selector) => {
    const element = document.querySelector(selector);
    if (element) element.hidden = true;
  };
  hide('.orbital-back');
  hide('.orbital-introduction');
  hide('.orbital-layout');
  hide('.orbital-howto');
  hide('.ad-slot');
  hide('.header-actions');
  const gate = document.querySelector('[data-profile-locked]');
  if (gate) gate.hidden = false;
  document.querySelector('[data-game-audio]')?.remove();

  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-primary-nav]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }
  const themeButton = document.querySelector('[data-theme-toggle]');
  themeButton?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cv-games-theme', theme); } catch {}
    const isLight = theme === 'light';
    themeButton.textContent = isLight ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    themeButton.title = isLight ? 'Ativar modo escuro' : 'Ativar modo claro';
  });
})();
