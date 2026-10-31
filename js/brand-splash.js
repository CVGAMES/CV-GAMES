(function () {
  'use strict';

  const root = document.documentElement;
  const splash = document.querySelector('[data-brand-splash]');
  if (!splash || !root.classList.contains('cv-intro-pending')) {
    splash?.remove();
    return;
  }

  const skipButton = splash.querySelector('[data-brand-splash-skip]');
  const reducedMotion = root.classList.contains('cv-intro-reduced');
  let finished = false;
  let closeTimer = 0;

  function removeSplash() {
    root.classList.remove('cv-intro-pending', 'cv-intro-reduced');
    splash.remove();
    document.dispatchEvent(new Event('cv-games-intro-finished'));
  }

  function closeSplash(skip = false) {
    if (finished) return;
    finished = true;
    window.clearTimeout(closeTimer);
    if (skip) {
      removeSplash();
      return;
    }
    splash.classList.add('is-exiting');
    window.setTimeout(removeSplash, reducedMotion ? 180 : 450);
  }

  skipButton?.addEventListener('click', () => closeSplash(true));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('cv-intro-pending')) {
      event.preventDefault();
      closeSplash(true);
    }
  });

  closeTimer = window.setTimeout(() => closeSplash(), reducedMotion ? 360 : 1480);
  window.addEventListener('pagehide', () => closeSplash(true), { once:true });
})();
