(function () {
  'use strict';

  const supportedGames = new Set(['cv-quadrados','cv-xadrez','cv-damas','cv-jogo-da-velha']);
  const assetBase = new URL('./assets/', document.currentScript.src).href;
  const normalize = (value) => String(value || '').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
  let confirmed = false;
  let bypassNextStart = false;
  let reactionTimer = 0;

  function currentProfileName() {
    try {
      return window.CV_GAMES_PROFILE?.getProfile?.()?.nickname
        || JSON.parse(localStorage.getItem('cv-games-profile') || 'null')?.nickname
        || '';
    } catch { return ''; }
  }

  function isTargetProfile() { return ['adryan v', 'lista'].includes(normalize(currentProfileName())); }
  function isActive(gameKey) {
    const gameView = document.querySelector('[data-game-view]');
    return confirmed && supportedGames.has(String(gameKey)) && isTargetProfile()
      && window.CV_GAMES_AI_DIFFICULTY?.isAdryanModeEnabled?.(String(gameKey)) === true
      && Boolean(gameView && !gameView.hidden);
  }

  const prompt = document.createElement('dialog');
  prompt.className = 'adryan-confirm-dialog';
  prompt.setAttribute('aria-labelledby','adryan-confirm-title');
  prompt.innerHTML = '<div class="adryan-confirm-icon" aria-hidden="true">😈</div><p class="adryan-eyebrow">MODO ADRYAN</p><h2 id="adryan-confirm-title">Você é o Adryan?</h2><p>Boa sorte.</p><div class="adryan-confirm-actions"><button type="button" data-adryan-no>Não</button><button type="button" data-adryan-yes>Sim</button></div>';
  document.body.append(prompt);

  function continueToDifficulty(button, enableSecret) {
    confirmed = enableSecret;
    const gameKey = button.closest('[data-game-key]')?.dataset.gameKey
      || document.querySelector('[data-ai-difficulty-picker]')?.dataset.aiDifficultyKey;
    if (gameKey) {
      if (enableSecret) window.CV_GAMES_AI_DIFFICULTY?.enableAdryanMode?.(gameKey);
      else window.CV_GAMES_AI_DIFFICULTY?.disableAdryanMode?.(gameKey);
    }
    if (prompt.open) prompt.close();
    bypassNextStart = true;
    button.click();
  }

  let pendingStart = null;
  prompt.querySelector('[data-adryan-yes]').addEventListener('click',() => {
    if (pendingStart) continueToDifficulty(pendingStart,true);
  });
  prompt.querySelector('[data-adryan-no]').addEventListener('click',() => {
    if (pendingStart) continueToDifficulty(pendingStart,false);
  });
  prompt.addEventListener('cancel',(event) => {
    event.preventDefault();
    if (pendingStart) continueToDifficulty(pendingStart,false);
  });

  document.addEventListener('click',(event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-start-computer]') : null;
    if (!button || !isTargetProfile()) return;
    if (bypassNextStart) { bypassNextStart = false; return; }
    const gameKey = document.querySelector('[data-ai-difficulty-picker]')?.dataset.aiDifficultyKey || '';
    if (!supportedGames.has(gameKey)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    pendingStart = button;
    if (typeof prompt.showModal === 'function') prompt.showModal();
    else prompt.setAttribute('open','');
    prompt.querySelector('[data-adryan-yes]').focus();
  },true);

  const reactions = {
    aiBox:{ sounds:['faaah.mp3','role-reveal.mp3','dexter.mp3','explosion.mp3'] },
    aiCapture:{ sounds:['shocked.mp3','chicken-scream.mp3','lutador.mp3'] },
    promotion:{ sounds:['role-reveal.mp3','faaah.mp3','shocked.mp3'] },
    steal:{ sounds:['dexter.mp3','shocked.mp3','role-reveal.mp3','explosion.mp3'] },
    end:{ sounds:['baby-laugh.mp3','cat-laugh.mp3','du-bist-gut-genug.mp3'] }
  };
  const images = [
    'trollface.png','side-eye-car.png','burning-book.png','glowing-paper.png',
    'shocked-face.png','side-eye-presenter.png','thanos-signal.png','blond-smirk.png',
    'brick-wall.png','whisper.png','minimalist.png','awkward.png','shy.png',
    'war-face.png','creepy-moon.png','toast.png'
  ];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const reactionLayer = document.createElement('div');
  reactionLayer.className = 'adryan-reaction-layer';
  reactionLayer.hidden = true;
  reactionLayer.setAttribute('aria-live','polite');
  reactionLayer.setAttribute('aria-atomic','true');
  function mountReactionLayer() {
    const gameView = document.querySelector('[data-game-view]');
    const fullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    const host = fullscreen || (gameView?.classList.contains('is-fullscreen-fallback')
      ? document.body : gameView || document.body);
    if (reactionLayer.parentElement !== host) host.append(reactionLayer);
  }
  document.addEventListener('fullscreenchange',mountReactionLayer);
  document.addEventListener('webkitfullscreenchange',mountReactionLayer);
  mountReactionLayer();

  function react(gameKey, kind) {
    if (!isActive(gameKey)) return;
    const final = kind === 'win';
    const showImage = final || Math.random() < .5;
    const showSound = !final && !showImage;
    const config = reactions[kind] || reactions.aiCapture;
    window.clearTimeout(reactionTimer);
    reactionLayer.replaceChildren();
    reactionLayer.classList.toggle('is-jumpscare',showImage);
    if (showImage) {
      const image = document.createElement('img');
      image.src = assetBase + (final ? pick(['war-face.png','thanos-signal.png','trollface.png']) : pick(images));
      image.alt = '';
      image.className = 'adryan-meme-image';
      image.draggable = false;
      reactionLayer.append(image);
    }
    mountReactionLayer();
    reactionLayer.hidden = !showImage;
    if (showSound) {
      const audio = new Audio(assetBase + pick(config.sounds));
      audio.volume = .7;
      audio.play().catch(() => {});
    }
    if (showImage) reactionTimer = window.setTimeout(() => {
      reactionLayer.hidden = true;
      reactionLayer.classList.remove('is-jumpscare');
      reactionLayer.replaceChildren();
    },650);
    else {
      reactionLayer.classList.remove('is-jumpscare');
      reactionLayer.replaceChildren();
    }
  }

  function reactSeries(gameKey,kind,count,showWin = false,showEnd = false) {
    const total = Math.max(0,Math.min(12,Number(count) || 0));
    const gap = 720;
    for (let index = 0; index < total; index += 1) {
      window.setTimeout(() => react(gameKey,kind),index * gap);
    }
    if (showWin || showEnd) window.setTimeout(() => react(gameKey,showWin ? 'win' : 'end'),total * gap);
  }

  window.CV_GAMES_ADRYAN = Object.freeze({ isActive, react, reactSeries });
})();
