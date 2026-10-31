(function () {
  'use strict';

  const allowedProfiles = Object.freeze(['educvv dev1', 'educvv dev']);
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  const getAllowed = () => allowedProfiles.includes(normalize(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname));
  const allowed = getAllowed();
  const accessContent = document.querySelector('[data-access-content]');
  const lockCard = document.querySelector('[data-profile-locked]');

  document.documentElement.dataset.battleshipAccess = allowed ? 'granted' : 'locked';
  if (allowed) {
    if (accessContent) accessContent.hidden = false;
  } else if (lockCard) {
    lockCard.hidden = false;
  }

  const refreshAccess = () => {
    if (getAllowed() !== allowed) window.location.reload();
  };
  window.addEventListener('pageshow', refreshAccess);
  window.addEventListener('cv-games-profile-change', refreshAccess);
  window.addEventListener('storage', (event) => {
    if (event.key === 'cv-games-profile') refreshAccess();
  });

  if (allowed) return;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-primary-nav]');
  menuButton?.addEventListener('click', () => {
    const open = menu?.classList.toggle('is-open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));
  const themeButton = document.querySelector('[data-theme-toggle]');
  themeButton?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cv-games-theme', theme); } catch {}
    themeButton.textContent = theme === 'light' ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
  });
})();
