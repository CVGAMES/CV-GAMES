(function () {
  'use strict';

  // Reutilizável: páginas futuras com [data-lobby] e [data-game-view]
  // adicionam [data-mode-menu-return] para herdar a confirmação e o retorno.

  const confirmReturn = async () => {
    if (typeof window.CV_GAMES_DIALOG?.confirm === 'function') {
      return window.CV_GAMES_DIALOG.confirm({
        title:'Voltar à escolha da partida?',
        message:'A partida atual será encerrada. Você poderá escolher novamente como quer jogar.',
        confirmText:'Voltar ao menu',
        cancelText:'Continuar jogando',
        tone:'danger'
      });
    }
    return window.confirm('A partida atual será encerrada. Voltar à escolha da partida?');
  };

  const exitFullscreen = async (view) => {
    if (document.fullscreenElement === view && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { /* A tela volta ao normal ao ocultar a partida. */ }
    } else if (document.webkitFullscreenElement === view && document.webkitExitFullscreen) {
      try { document.webkitExitFullscreen(); } catch { /* A tela volta ao normal ao ocultar a partida. */ }
    }
    if (view.classList.contains('is-fullscreen-fallback')) {
      view.classList.remove('is-fullscreen-fallback');
      if (!document.querySelector('.is-fullscreen-fallback')) document.body.classList.remove('has-fullscreen-fallback');
      document.dispatchEvent(new Event('cv-games-fullscreenchange'));
    }
  };

  document.addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-mode-menu-return]') : null;
    if (!button || button.disabled) return;
    const view = button.closest('[data-game-view]');
    const lobby = document.querySelector('[data-lobby]');
    if (!view || !lobby) return;

    event.preventDefault();
    button.disabled = true;
    let confirmed = false;
    try { confirmed = await confirmReturn(); } catch { confirmed = false; }
    button.disabled = false;
    if (!confirmed) { button.focus({ preventScroll:true }); return; }

    await exitFullscreen(view);
    view.querySelectorAll('dialog[open]').forEach((dialog) => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
    view.querySelectorAll('[data-result-overlay]').forEach((overlay) => { overlay.hidden = true; });
    window.CV_GAME_AUDIO?.pauseForMenu?.();
    document.dispatchEvent(new CustomEvent('cv-game-return-to-mode-menu', { detail:{ view, lobby } }));
    view.hidden = true;
    lobby.hidden = false;
    lobby.scrollIntoView({ behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center' });
    lobby.querySelector('[data-start-local]:not(:disabled), [data-start-computer]:not(:disabled)')?.focus({ preventScroll:true });
  });
})();
