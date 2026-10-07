(function () {
  'use strict';

  const allowedProfiles = Object.freeze(['educvv dev1', 'educvv dev']);
  const normalizeNickname = (value) => String(value || '')
    .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  const getAllowed = () => allowedProfiles.includes(
    normalizeNickname(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname)
  );
  const allowed = getAllowed();

  document.documentElement.dataset.turboAccess = allowed ? 'granted' : 'locked';
  window.addEventListener('pageshow', () => {
    if (getAllowed() !== allowed) window.location.reload();
  });
  if (allowed) return;

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
    const light = theme === 'light';
    themeButton.textContent = light ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
    themeButton.title = light ? 'Ativar modo escuro' : 'Ativar modo claro';
  });
}());
