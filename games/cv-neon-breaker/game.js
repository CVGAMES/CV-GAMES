(function () {
  'use strict';

  const gameId = 'cv-neon-breaker';
  const bestScoreKey = 'cv-games-cv-neon-breaker-best';
  const controlModeKey = 'cv-games-cv-neon-breaker-control';
  const favoriteStorageKey = 'cv-games-favorites';
  const themeStorageKey = 'cv-games-theme';
  const canvasWidth = 800;
  const canvasHeight = 560;
  const initialLives = 3;
  const maximumLives = 5;
  const comboLimit = 5;
  const paddleBaseWidth = 132;
  const paddleWideWidth = 196;
  const paddleHeight = 18;
  const ballRadius = 9;
  const slowMultiplier = 0.7;
  const phaseLayouts = [
    [
      '...NNNN...',
      '..NWNNS...',
      '...NRN....',
      '..NNNN....'
    ],
    [
      '.NNRNNRNN.',
      'NNWNNMNSNN',
      '.NRNNRNNN.',
      '..NLNNP...'
    ],
    [
      'NNRNNRNNNN',
      '.RNNWNNR..',
      'NNNXMNNNSN',
      '.NNRNNRLB.',
      '..A..A....'
    ],
    [
      'RNNRNNRNNR',
      '.NNWMMNSN.',
      'NNRNNRNNNN',
      '.RNNLNNR..',
      '..XXNNXX..'
    ],
    [
      'RNNRNNRNNR',
      'NNWNNRNNNS',
      'RNNXNNXNNR',
      '.A.MH.MA..',
      'RNNRNNRNNR'
    ]
  ];
  const blockPalette = ['#48e6f5', '#a770ff', '#ff70c4', '#ffd05e', '#54e5b3'];
  const powerUpSymbols = { wide: '↔', slow: '◷', life: '♥', pierce: '✦', shield: '⬡', blast: '✹' };

  const bySelector = (selector) => document.querySelector(selector);
  const canvas = bySelector('[data-cv-neon-breaker-canvas]');
  const context = canvas?.getContext('2d', { alpha: false });
  if (!canvas || !context) return;

  const scoreElement = bySelector('[data-score]');
  const bestScoreElement = bySelector('[data-best-score]');
  const introBestScoreElement = bySelector('[data-intro-best-score]');
  const phaseElement = bySelector('[data-phase]');
  const livesElement = bySelector('[data-lives]');
  const comboElement = bySelector('[data-combo]');
  const finalScoreElement = bySelector('[data-final-score]');
  const finalPhaseElement = bySelector('[data-final-phase]');
  const finalBestScoreElement = bySelector('[data-final-best-score]');
  const victoryScoreElement = bySelector('[data-victory-score]');
  const victoryBestScoreElement = bySelector('[data-victory-best-score]');
  const introScreen = bySelector('[data-intro-screen]');
  const readyScreen = bySelector('[data-ready-screen]');
  const pauseScreen = bySelector('[data-pause-screen]');
  const phaseScreen = bySelector('[data-phase-screen]');
  const gameOverScreen = bySelector('[data-gameover-screen]');
  const victoryScreen = bySelector('[data-victory-screen]');
  const pauseButton = bySelector('[data-pause-game]');
  const pauseIcon = bySelector('[data-pause-icon]');
  const pauseLabel = bySelector('[data-pause-label]');
  const settingsOpenButton = bySelector('[data-open-settings]');
  const gamePanel = bySelector('[data-neon-game-panel]');
  const touchControls = bySelector('[data-touch-controls]');
  const controlModeButtons = [...document.querySelectorAll('[data-control-mode]')];
  const settingsModal = bySelector('[data-settings-modal]');
  const statusElement = bySelector('[data-game-status]');
  const favoriteButton = bySelector('[data-game-favorite]');
  const launchButtons = [...document.querySelectorAll('[data-launch-ball]')];
  const stats = window.CV_GAMES_STATS;

  const state = {
    mode: 'intro',
    frameId: null,
    lastTime: 0,
    phaseIndex: 0,
    score: 0,
    lives: initialLives,
    combo: 0,
    clock: 0,
    paddle: null,
    ball: null,
    blocks: [],
    powerUps: [],
    effects: {
      wideUntil: 0,
      slowUntil: 0,
      slowActive: false,
      pierceUntil: 0,
      shieldCharges: 0,
      shieldFlashUntil: 0,
      blasts: []
    },
    bestScore: readBestScore(),
    controlMode: readControlMode(),
    accessRegistered: false,
    announcedMilestones: new Set(),
    movement: { left: false, right: false },
    touchPointerId: null
  };

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const rounded = (value) => Math.round(value * 100) / 100;

  function readBestScore() {
    try {
      const value = Math.floor(Number(localStorage.getItem(bestScoreKey)));
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  function detectControlMode() {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    const hasTouch = coarsePointer === undefined ? (navigator.maxTouchPoints || 0) > 0 : coarsePointer;
    return hasTouch ? 'touch' : 'keyboard';
  }

  function readControlMode() {
    try {
      const saved = localStorage.getItem(controlModeKey);
      return ['keyboard', 'touch', 'buttons'].includes(saved) ? saved : detectControlMode();
    } catch {
      return detectControlMode();
    }
  }

  function updateControlMode() {
    if (gamePanel) gamePanel.dataset.controlMode = state.controlMode;
    if (touchControls) touchControls.hidden = state.controlMode !== 'buttons';
    controlModeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.controlMode === state.controlMode)));
    clearMovement();
  }

  function setControlMode(mode) {
    if (!['keyboard', 'touch', 'buttons'].includes(mode)) return;
    state.controlMode = mode;
    try {
      localStorage.setItem(controlModeKey, mode);
    } catch {
      // A escolha continua ativa durante esta sessão.
    }
    updateControlMode();
  }

  function persistBestScore() {
    try {
      localStorage.setItem(bestScoreKey, String(state.bestScore));
    } catch {
      // O recorde atual continua visível mesmo se o armazenamento não estiver disponível.
    }
  }

  function getFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : []);
    } catch {
      return new Set();
    }
  }

  let favorites = getFavorites();

  function saveFavorites() {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites]));
      window.dispatchEvent(new Event('cv-games-favorites-change'));
    } catch {
      // Favoritar não interrompe a partida se o armazenamento local estiver indisponível.
    }
  }

  function updateFavoriteInterface() {
    const isFavorite = favorites.has(gameId);
    const icon = favoriteButton?.querySelector('.favorite-icon');
    const label = favoriteButton?.querySelector('[data-favorite-label]');
    const count = favoriteButton?.querySelector('[data-favorite-count]');
    if (favoriteButton) {
      favoriteButton.setAttribute('aria-pressed', String(isFavorite));
      favoriteButton.setAttribute('aria-label', isFavorite ? 'Remover CV NEON BREAKER dos favoritos' : 'Adicionar CV NEON BREAKER aos favoritos');
      favoriteButton.setAttribute('title', isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    }
    if (icon) icon.textContent = isFavorite ? '♥' : '♡';
    if (label) label.textContent = isFavorite ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(favorites.size);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch {
      // O tema permanece aplicado durante a visita atual.
    }
    const toggle = bySelector('[data-theme-toggle]');
    if (toggle) {
      const isLight = theme === 'light';
      toggle.textContent = isLight ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
      toggle.setAttribute('title', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    }
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.cvNeonBreakerState = mode;
    if (introScreen) introScreen.hidden = mode !== 'intro';
    if (readyScreen) readyScreen.hidden = mode !== 'ready';
    if (pauseScreen) pauseScreen.hidden = mode !== 'paused';
    if (phaseScreen) phaseScreen.hidden = mode !== 'phase';
    if (gameOverScreen) gameOverScreen.hidden = mode !== 'gameover';
    if (victoryScreen) victoryScreen.hidden = mode !== 'victory';

    launchButtons.forEach((button) => { button.disabled = mode !== 'ready'; });
    if (pauseButton) {
      const isPaused = mode === 'paused';
      if (pauseIcon) pauseIcon.textContent = isPaused ? '▶' : '⏸';
      if (pauseLabel) pauseLabel.textContent = isPaused ? ' Retomar' : ' Pausar';
      pauseButton.setAttribute('aria-label', isPaused ? 'Retomar jogo' : 'Pausar jogo');
      pauseButton.disabled = mode !== 'running' && mode !== 'paused';
    }

    const messages = {
      intro: 'Tela inicial. Escolha Jogar para preparar a primeira esfera.',
      ready: 'Esfera preparada. Use Espaço, toque na arena ou Lançar para começar.',
      running: 'Partida em andamento. Destrua todos os blocos da fase.',
      paused: 'Jogo pausado. A esfera, os power-ups e a pontuação estão congelados.',
      phase: `Fase ${state.phaseIndex + 1} concluída. Prepare-se para a próxima arena.`,
      gameover: `Fim de partida. Pontuação ${state.score}.`,
      victory: `Vitória! Você concluiu as ${phaseLayouts.length} fases.`
    };
    if (statusElement) statusElement.textContent = messages[mode] || '';
  }

  function updateHud() {
    const phase = state.phaseIndex + 1;
    const visibleCombo = Math.max(1, state.combo);
    if (scoreElement) scoreElement.textContent = String(state.score);
    if (bestScoreElement) bestScoreElement.textContent = String(Math.max(state.bestScore, state.score));
    if (introBestScoreElement) introBestScoreElement.textContent = String(state.bestScore);
    if (phaseElement) phaseElement.textContent = `${phase} / ${phaseLayouts.length}`;
    if (livesElement) livesElement.textContent = String(state.lives);
    if (comboElement) comboElement.textContent = `x${visibleCombo}`;
  }

  function updateFinalScores() {
    if (finalScoreElement) finalScoreElement.textContent = String(state.score);
    if (finalPhaseElement) finalPhaseElement.textContent = String(state.phaseIndex + 1);
    if (finalBestScoreElement) finalBestScoreElement.textContent = String(state.bestScore);
    if (victoryScoreElement) victoryScoreElement.textContent = String(state.score);
    if (victoryBestScoreElement) victoryBestScoreElement.textContent = String(state.bestScore);
    updateHud();
  }

  function clearMovement() {
    state.movement.left = false;
    state.movement.right = false;
    state.touchPointerId = null;
  }

  function cancelFrame() {
    if (state.frameId !== null) {
      window.cancelAnimationFrame(state.frameId);
      state.frameId = null;
    }
  }

  function createBlocks(phaseIndex) {
    const layout = phaseLayouts[phaseIndex] || phaseLayouts[0];
    const columns = 10;
    const blockWidth = 64;
    const blockHeight = 30;
    const gap = 8;
    const totalWidth = columns * blockWidth + (columns - 1) * gap;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 62;
    const powerUps = { W: 'wide', S: 'slow', L: 'life', P: 'pierce', H: 'shield', B: 'blast' };
    const blocks = [];

    layout.forEach((row, rowIndex) => {
      Array.from(row.padEnd(columns, '.')).slice(0, columns).forEach((symbol, columnIndex) => {
        if (symbol === '.') return;
        const moving = symbol === 'M';
        const explosive = symbol === 'X';
        const hits = symbol === 'A' ? 3 : symbol === 'R' ? 2 : 1;
        blocks.push({
          x: startX + columnIndex * (blockWidth + gap),
          originX: startX + columnIndex * (blockWidth + gap),
          y: startY + rowIndex * (blockHeight + gap),
          width: blockWidth,
          height: blockHeight,
          hits,
          strong: hits > 1,
          armored: symbol === 'A',
          explosive,
          moving,
          motionSeed: rowIndex * .8 + columnIndex * .57,
          powerUp: powerUps[symbol] || null,
          hue: explosive ? 3 : moving ? 0 : (phaseIndex * 2 + rowIndex + columnIndex) % blockPalette.length
        });
      });
    });
    return blocks;
  }

  function resetEffects() {
    state.effects.wideUntil = 0;
    state.effects.slowUntil = 0;
    state.effects.slowActive = false;
    state.effects.pierceUntil = 0;
    state.effects.shieldCharges = 0;
    state.effects.shieldFlashUntil = 0;
    state.effects.blasts = [];
    state.powerUps = [];
    if (state.paddle) {
      state.paddle.width = paddleBaseWidth;
      state.paddle.x = clamp(state.paddle.x, 12, canvasWidth - state.paddle.width - 12);
    }
  }

  function resetPaddleAndBall() {
    state.paddle = {
      x: (canvasWidth - paddleBaseWidth) / 2,
      y: canvasHeight - 44,
      width: paddleBaseWidth,
      height: paddleHeight,
      speed: 610
    };
    state.ball = {
      x: canvasWidth / 2,
      y: state.paddle.y - ballRadius - 2,
      radius: ballRadius,
      vx: 0,
      vy: 0,
      attached: true
    };
  }

  function resetCampaign() {
    cancelFrame();
    clearMovement();
    state.phaseIndex = 0;
    state.score = 0;
    state.lives = initialLives;
    state.combo = 0;
    state.clock = 0;
    resetEffects();
    state.blocks = createBlocks(state.phaseIndex);
    resetPaddleAndBall();
    updateHud();
  }

  function getPhaseSpeed() {
    return Math.min(322 + state.phaseIndex * 27, 430);
  }

  function getBallSpeed() {
    if (!state.ball) return getPhaseSpeed();
    return Math.hypot(state.ball.vx, state.ball.vy) || getPhaseSpeed();
  }

  function scaleBallVelocity(multiplier) {
    if (!state.ball || state.ball.attached) return;
    const speed = clamp(getBallSpeed() * multiplier, 220, 520);
    const directionX = state.ball.vx >= 0 ? 1 : -1;
    const ratio = clamp(Math.abs(state.ball.vx) / Math.max(getBallSpeed(), 1), 0.2, 0.82);
    state.ball.vx = directionX * speed * ratio;
    state.ball.vy = state.ball.vy >= 0 ? speed * Math.sqrt(1 - ratio * ratio) : -speed * Math.sqrt(1 - ratio * ratio);
  }

  function registerFirstLaunch() {
    if (state.accessRegistered) return;
    if (typeof stats?.registerAccess === 'function') stats.registerAccess(gameId);
    state.accessRegistered = true;
  }

  function emitMilestone(name, detail, key) {
    if (state.announcedMilestones.has(key)) return;
    state.announcedMilestones.add(key);
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {
      // O jogo segue funcionando se CustomEvent não estiver disponível.
    }
  }

  function startGame() {
    resetCampaign();
    setMode('ready');
    drawScene();
  }

  function launchBall() {
    if (state.mode !== 'ready' || !state.ball || !state.paddle) return;
    const speed = getPhaseSpeed();
    state.ball.attached = false;
    state.ball.vx = speed * 0.48;
    state.ball.vy = -Math.sqrt(speed * speed - state.ball.vx * state.ball.vx);
    registerFirstLaunch();
    setMode('running');
    state.lastTime = performance.now();
    cancelFrame();
    state.frameId = window.requestAnimationFrame(gameLoop);
  }

  function pauseGame() {
    if (state.mode !== 'running') return;
    cancelFrame();
    clearMovement();
    setMode('paused');
    drawScene();
  }

  function resumeGame() {
    if (state.mode !== 'paused') return;
    setMode('running');
    state.lastTime = performance.now();
    cancelFrame();
    state.frameId = window.requestAnimationFrame(gameLoop);
  }

  function togglePause() {
    if (state.mode === 'running') pauseGame();
    else if (state.mode === 'paused') resumeGame();
  }

  function addScore(points) {
    state.score += Math.max(0, Math.floor(points));
    updateHud();
  }

  function destroyBlock(index, block) {
    state.blocks.splice(index, 1);
    state.combo = Math.min(comboLimit, state.combo + 1);
    window.CV_GAME_AUDIO?.playTone(430 + state.combo * 24, .07, 'square', block.strong ? .05 : .035);
    const multiplier = Math.max(1, state.combo);
    addScore((block.strong ? 24 : 12) * multiplier);
    if (state.combo >= comboLimit) {
      emitMilestone('cv-games-neon-breaker-combo', { combo: state.combo, score: state.score }, 'combo-neon');
    }
    if (block.powerUp) spawnPowerUp(block);
    if (block.explosive) {
      const x = block.x + block.width / 2;
      const y = block.y + block.height / 2;
      state.effects.blasts.push({ x, y, radius: 0, life: .28, duration: .28, maxRadius: 90 });
      damageBlocksInRadius(x, y, 90);
    }
  }

  function damageBlock(index, block) {
    if (index < 0 || state.blocks[index] !== block) return;
    if (block.hits > 1) {
      block.hits -= 1;
      addScore(6);
      window.CV_GAME_AUDIO?.playTone(310, .055, 'triangle', .028);
      return;
    }
    destroyBlock(index, block);
  }

  function damageBlocksInRadius(x, y, radius) {
    const targets = state.blocks.filter((block) => {
      const dx = block.x + block.width / 2 - x;
      const dy = block.y + block.height / 2 - y;
      return Math.hypot(dx, dy) <= radius;
    });
    targets.forEach((block) => {
      const index = state.blocks.indexOf(block);
      if (index >= 0) damageBlock(index, block);
    });
  }

  function spawnPowerUp(block) {
    const labels = { wide: '↔', slow: '🐢', life: '❤', pierce: '✦', shield: '⬡', blast: '✹' };
    state.powerUps.push({
      kind: block.powerUp,
      label: labels[block.powerUp],
      x: block.x + block.width / 2,
      y: block.y + block.height / 2,
      width: 28,
      height: 24,
      speed: 128
    });
  }

  function applyPowerUp(kind) {
    if (kind === 'wide') {
      state.effects.wideUntil = state.clock + 9;
      state.paddle.width = paddleWideWidth;
      state.paddle.x = clamp(state.paddle.x, 12, canvasWidth - state.paddle.width - 12);
    } else if (kind === 'slow') {
      const wasActive = state.effects.slowActive;
      state.effects.slowUntil = state.clock + 7;
      state.effects.slowActive = true;
      if (!wasActive) scaleBallVelocity(slowMultiplier);
    } else if (kind === 'life') {
      state.lives = Math.min(maximumLives, state.lives + 1);
    } else if (kind === 'pierce') {
      state.effects.pierceUntil = state.clock + 6;
    } else if (kind === 'shield') {
      state.effects.shieldCharges = Math.min(2, state.effects.shieldCharges + 1);
      state.effects.shieldFlashUntil = state.clock + .35;
    } else if (kind === 'blast') {
      const x = state.paddle.x + state.paddle.width / 2;
      const y = Math.max(130, state.paddle.y - 155);
      state.effects.blasts.push({ x, y, radius: 0, life: .42, duration: .42, maxRadius: 250 });
      damageBlocksInRadius(x, y, 235);
      window.CV_GAME_AUDIO?.playTone(180, .24, 'sawtooth', .07);
    }
    updateHud();
  }

  function updateEffects() {
    if (state.effects.wideUntil && state.clock >= state.effects.wideUntil) {
      state.effects.wideUntil = 0;
      state.paddle.width = paddleBaseWidth;
      state.paddle.x = clamp(state.paddle.x, 12, canvasWidth - state.paddle.width - 12);
    }
    if (state.effects.slowActive && state.clock >= state.effects.slowUntil) {
      state.effects.slowUntil = 0;
      state.effects.slowActive = false;
      scaleBallVelocity(1 / slowMultiplier);
    }
  }

  function setPaddleCenter(position) {
    if (!state.paddle || (state.mode !== 'running' && state.mode !== 'ready')) return;
    state.paddle.x = clamp(position - state.paddle.width / 2, 12, canvasWidth - state.paddle.width - 12);
    if (state.ball?.attached) {
      state.ball.x = state.paddle.x + state.paddle.width / 2;
      state.ball.y = state.paddle.y - state.ball.radius - 2;
    }
  }

  function updatePaddle(delta) {
    if (!state.paddle) return;
    const direction = Number(state.movement.right) - Number(state.movement.left);
    if (direction) setPaddleCenter(state.paddle.x + state.paddle.width / 2 + direction * state.paddle.speed * delta);
  }

  function bounceFromPaddle() {
    const paddleCenter = state.paddle.x + state.paddle.width / 2;
    const offset = clamp((state.ball.x - paddleCenter) / (state.paddle.width / 2), -0.92, 0.92);
    const speed = clamp(Math.max(getBallSpeed(), getPhaseSpeed()), 260, 520);
    const angle = offset * 1.04;
    let horizontal = speed * Math.sin(angle);
    const minimumHorizontal = speed * .32;
    if (Math.abs(horizontal) < minimumHorizontal) {
      const direction = offset === 0 ? (state.ball.vx < 0 ? -1 : 1) : (offset < 0 ? -1 : 1);
      horizontal = minimumHorizontal * direction;
    }
    state.ball.vx = horizontal;
    state.ball.vy = -Math.max(145, Math.sqrt(Math.max(1, speed * speed - horizontal * horizontal)));
    state.ball.y = state.paddle.y - state.ball.radius - .5;
    window.CV_GAME_AUDIO?.playTone(250 + Math.round(Math.abs(offset) * 180), .06, 'sine', .03);
  }

  function collideWithBlock(index, block) {
    const ball = state.ball;
    if (state.effects.pierceUntil > state.clock) {
      damageBlock(index, block);
      return;
    }
    const overlapLeft = ball.x + ball.radius - block.x;
    const overlapRight = block.x + block.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - block.y;
    const overlapBottom = block.y + block.height - (ball.y - ball.radius);
    const minimum = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minimum === overlapLeft) {
      ball.x = block.x - ball.radius - .1;
      ball.vx = -Math.abs(ball.vx);
    } else if (minimum === overlapRight) {
      ball.x = block.x + block.width + ball.radius + .1;
      ball.vx = Math.abs(ball.vx);
    } else if (minimum === overlapTop) {
      ball.y = block.y - ball.radius - .1;
      ball.vy = -Math.abs(ball.vy);
    } else {
      ball.y = block.y + block.height + ball.radius + .1;
      ball.vy = Math.abs(ball.vy);
    }

    damageBlock(index, block);
  }

  function moveBall(delta) {
    const ball = state.ball;
    const paddle = state.paddle;
    if (!ball || ball.attached) return;
    const previousY = ball.y;
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + ball.radius >= canvasWidth) {
      ball.x = canvasWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    const previousBottom = previousY + ball.radius;
    const currentBottom = ball.y + ball.radius;
    const reachesPaddle = ball.vy > 0
      && previousBottom <= paddle.y + 2
      && currentBottom >= paddle.y
      && ball.x + ball.radius >= paddle.x
      && ball.x - ball.radius <= paddle.x + paddle.width;
    if (reachesPaddle) bounceFromPaddle();

    for (let index = 0; index < state.blocks.length; index += 1) {
      const block = state.blocks[index];
      const overlaps = ball.x + ball.radius > block.x
        && ball.x - ball.radius < block.x + block.width
        && ball.y + ball.radius > block.y
        && ball.y - ball.radius < block.y + block.height;
      if (overlaps) {
        collideWithBlock(index, block);
        break;
      }
    }

    if (ball.vy > 0 && ball.y + ball.radius >= canvasHeight - 18 && state.effects.shieldCharges > 0) {
      ball.y = canvasHeight - 18 - ball.radius;
      ball.vy = -Math.abs(ball.vy);
      state.effects.shieldCharges -= 1;
      state.effects.shieldFlashUntil = state.clock + .35;
      window.CV_GAME_AUDIO?.playTone(620, .13, 'triangle', .055);
    } else if (ball.y - ball.radius > canvasHeight) loseLife();
  }

  function updateMovingBlocks() {
    state.blocks.forEach((block) => {
      if (block.moving) block.x = block.originX + Math.sin(state.clock * 1.45 + block.motionSeed) * 17;
    });
  }

  function updateVisualEffects(delta) {
    state.effects.blasts = state.effects.blasts.filter((blast) => {
      blast.life -= delta;
      blast.radius = blast.maxRadius * (1 - blast.life / blast.duration);
      return blast.life > 0;
    });
  }

  function updatePowerUps(delta) {
    const active = [];
    state.powerUps.forEach((powerUp) => {
      powerUp.y += powerUp.speed * delta;
      const caught = powerUp.y + powerUp.height / 2 >= state.paddle.y
        && powerUp.y - powerUp.height / 2 <= state.paddle.y + state.paddle.height
        && powerUp.x + powerUp.width / 2 >= state.paddle.x
        && powerUp.x - powerUp.width / 2 <= state.paddle.x + state.paddle.width;
      if (caught) {
        applyPowerUp(powerUp.kind);
      } else if (powerUp.y - powerUp.height / 2 <= canvasHeight + 8) {
        active.push(powerUp);
      }
    });
    state.powerUps = active;
  }

  function finishPhase() {
    const completedPhase = state.phaseIndex + 1;
    emitMilestone('cv-games-neon-breaker-phase-complete', { phase: completedPhase, score: state.score }, `phase-${completedPhase}`);
    resetEffects();
    clearMovement();
    if (completedPhase >= phaseLayouts.length) {
      finishVictory();
      return;
    }
    setMode('phase');
    drawScene();
  }

  function nextPhase() {
    if (state.mode !== 'phase') return;
    state.phaseIndex += 1;
    state.combo = 0;
    resetEffects();
    state.blocks = createBlocks(state.phaseIndex);
    resetPaddleAndBall();
    updateHud();
    setMode('ready');
    drawScene();
  }

  function updateBestScore() {
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      persistBestScore();
    }
  }

  function finishGameOver() {
    cancelFrame();
    clearMovement();
    updateBestScore();
    updateFinalScores();
    setMode('gameover');
    drawScene();
  }

  function finishVictory() {
    cancelFrame();
    clearMovement();
    updateBestScore();
    updateFinalScores();
    emitMilestone('cv-games-neon-breaker-victory', { score: state.score, phasesCompleted: phaseLayouts.length }, 'victory');
    setMode('victory');
    drawScene();
  }

  function loseLife() {
    if (state.mode !== 'running') return;
    window.CV_GAME_AUDIO?.playTone(150, .22, 'sawtooth', .05);
    state.lives -= 1;
    state.combo = 0;
    resetEffects();
    clearMovement();
    if (state.lives <= 0) {
      state.lives = 0;
      finishGameOver();
      return;
    }
    resetPaddleAndBall();
    updateHud();
    setMode('ready');
    drawScene();
  }

  function update(delta) {
    state.clock += delta;
    updateEffects();
    updateMovingBlocks();
    updatePaddle(delta);
    moveBall(delta);
    if (state.mode !== 'running') return;
    updatePowerUps(delta);
    updateVisualEffects(delta);
    if (!state.blocks.length) finishPhase();
  }

  function roundedRect(x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y + safeRadius, safeRadius);
    context.closePath();
  }

  function drawBackground() {
    const gradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, '#07112e');
    gradient.addColorStop(.5, '#191554');
    gradient.addColorStop(1, '#390d59');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.strokeStyle = 'rgba(147, 124, 255, .12)';
    context.lineWidth = 1;
    for (let x = 24; x < canvasWidth; x += 48) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvasHeight);
      context.stroke();
    }
    for (let y = 24; y < canvasHeight; y += 48) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvasWidth, y);
      context.stroke();
    }

    context.fillStyle = 'rgba(203, 232, 255, .68)';
    [[72, 38], [188, 88], [338, 42], [521, 105], [697, 52], [752, 183], [91, 311], [620, 346], [390, 467], [160, 504]].forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 1.7, 0, Math.PI * 2);
      context.fill();
    });
  }

  function drawBlock(block) {
    const color = block.explosive ? '#ff895f' : blockPalette[block.hue];
    context.save();
    context.shadowColor = color;
    context.shadowBlur = block.strong ? 13 : 9;
    roundedRect(block.x, block.y, block.width, block.height, 7);
    context.fillStyle = color;
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = block.strong || block.explosive ? 3 : 2;
    context.strokeStyle = block.explosive ? '#fff1c6' : block.strong ? '#fff3cb' : 'rgba(240, 253, 255, .78)';
    context.stroke();
    if (block.explosive || block.moving || block.strong) {
      context.fillStyle = '#1b1644';
      context.font = '900 14px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const symbol = block.explosive ? '✹' : block.moving ? '↔' : block.armored ? ['III', 'II', 'I'][3 - block.hits] : block.hits === 2 ? 'II' : 'I';
      context.fillText(symbol, block.x + block.width / 2, block.y + block.height / 2 + 1);
    } else if (block.powerUp) {
      context.fillStyle = 'rgba(12, 19, 55, .72)';
      context.font = '900 14px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(powerUpSymbols[block.powerUp] || '◆', block.x + block.width / 2, block.y + block.height / 2 + 1);
    }
    context.restore();
  }

  function drawPaddle() {
    const paddle = state.paddle;
    if (!paddle) return;
    const gradient = context.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
    gradient.addColorStop(0, '#42e8f8');
    gradient.addColorStop(.52, '#d0ffff');
    gradient.addColorStop(1, '#be75ff');
    context.save();
    context.shadowColor = 'rgba(90, 231, 255, .7)';
    context.shadowBlur = 16;
    roundedRect(paddle.x, paddle.y, paddle.width, paddle.height, 9);
    context.fillStyle = gradient;
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 2;
    context.strokeStyle = '#edffff';
    context.stroke();
    context.restore();
  }

  function drawBall() {
    const ball = state.ball;
    if (!ball) return;
    const gradient = context.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, ball.radius + 2);
    gradient.addColorStop(0, '#fffef0');
    gradient.addColorStop(.5, '#ffe66a');
    gradient.addColorStop(1, '#ff70c4');
    context.save();
    context.shadowColor = 'rgba(255, 149, 226, .9)';
    context.shadowBlur = 19;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    context.shadowBlur = 0;
    context.lineWidth = 2;
    context.strokeStyle = '#fffbd7';
    context.stroke();
    context.restore();
  }

  function drawPowerUps() {
    state.powerUps.forEach((powerUp) => {
      const colors = { wide: '#49e8f8', slow: '#9a8dff', life: '#ff78b9', pierce: '#fff06b', shield: '#75f5bc', blast: '#ff9867' };
      context.save();
      context.shadowColor = colors[powerUp.kind];
      context.shadowBlur = 12;
      roundedRect(powerUp.x - powerUp.width / 2, powerUp.y - powerUp.height / 2, powerUp.width, powerUp.height, 7);
      context.fillStyle = colors[powerUp.kind];
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = '#12163e';
      context.font = '900 14px system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(powerUp.label, powerUp.x, powerUp.y + 1);
      context.restore();
    });
  }

  function drawEffectLabels() {
    const effects = [];
    if (state.effects.wideUntil > state.clock) effects.push('↔ Plataforma maior');
    if (state.effects.slowUntil > state.clock) effects.push('🐢 Slow');
    if (state.effects.pierceUntil > state.clock) effects.push('✦ Perfuração');
    if (state.effects.shieldCharges > 0) effects.push(`⬡ Escudo ${state.effects.shieldCharges}`);
    if (!effects.length) return;
    context.save();
    context.font = '800 13px system-ui, sans-serif';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(239, 244, 255, .9)';
    context.fillText(effects.join('  •  '), canvasWidth - 20, canvasHeight - 18);
    context.restore();
  }

  function drawSpecialEffects() {
    if (state.effects.shieldCharges > 0 || state.effects.shieldFlashUntil > state.clock) {
      const flashing = state.effects.shieldFlashUntil > state.clock;
      context.save();
      context.strokeStyle = flashing ? 'rgba(153,255,217,.98)' : 'rgba(102,235,195,.65)';
      context.lineWidth = flashing ? 8 : 3;
      context.shadowColor = '#66ebc3';
      context.shadowBlur = flashing ? 26 : 12;
      context.beginPath();
      context.moveTo(18, canvasHeight - 15);
      context.lineTo(canvasWidth - 18, canvasHeight - 15);
      context.stroke();
      context.restore();
    }
    state.effects.blasts.forEach((blast) => {
      context.save();
      context.globalAlpha = Math.max(0, blast.life / blast.duration);
      context.strokeStyle = '#ffe98a';
      context.lineWidth = 7;
      context.shadowColor = '#ff9f65';
      context.shadowBlur = 25;
      context.beginPath();
      context.arc(blast.x, blast.y, blast.radius, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    });
  }

  function drawScene() {
    drawBackground();
    state.blocks.forEach(drawBlock);
    drawPowerUps();
    drawSpecialEffects();
    drawPaddle();
    drawBall();
    drawEffectLabels();
    context.save();
    context.fillStyle = 'rgba(230, 239, 255, .58)';
    context.font = '800 13px system-ui, sans-serif';
    context.textAlign = 'left';
    context.fillText(`Arena Neon · Fase ${state.phaseIndex + 1}`, 18, canvasHeight - 18);
    context.restore();
  }

  function gameLoop(timestamp) {
    if (state.mode !== 'running') {
      state.frameId = null;
      return;
    }
    const delta = Math.min((timestamp - state.lastTime) / 1000, .035);
    state.lastTime = timestamp;
    update(delta);
    drawScene();
    if (state.mode === 'running') state.frameId = window.requestAnimationFrame(gameLoop);
    else state.frameId = null;
  }

  function isMovementKey(event) {
    return state.controlMode === 'keyboard' && (event.code === 'KeyA' || event.code === 'KeyD' || event.key === 'ArrowLeft' || event.key === 'ArrowRight');
  }

  function setMovementFromKey(event, pressed) {
    if (state.controlMode !== 'keyboard' || (state.mode !== 'running' && state.mode !== 'ready') || !isMovementKey(event)) return false;
    const isLeft = event.code === 'KeyA' || event.key === 'ArrowLeft';
    const isRight = event.code === 'KeyD' || event.key === 'ArrowRight';
    if (isLeft) state.movement.left = pressed;
    if (isRight) state.movement.right = pressed;
    if (pressed && state.mode === 'ready' && state.paddle) {
      const direction = isLeft ? -1 : isRight ? 1 : 0;
      setPaddleCenter(state.paddle.x + state.paddle.width / 2 + direction * 34);
      drawScene();
    }
    return true;
  }

  function getCanvasX(event) {
    const bounds = canvas.getBoundingClientRect();
    return (event.clientX - bounds.left) * canvasWidth / Math.max(bounds.width, 1);
  }

  function bindHeldControl(selector, direction) {
    const button = bySelector(selector);
    if (!button) return;
    const release = () => { state.movement[direction] = false; };
    button.addEventListener('pointerdown', (event) => {
      if (state.controlMode !== 'buttons' || (state.mode !== 'running' && state.mode !== 'ready')) return;
      event.preventDefault();
      state.movement[direction] = true;
      if (state.mode === 'ready' && state.paddle) {
        const offset = direction === 'left' ? -34 : 34;
        setPaddleCenter(state.paddle.x + state.paddle.width / 2 + offset);
        drawScene();
      }
      try {
        button.setPointerCapture?.(event.pointerId);
      } catch {
        // Eventos sintetizados podem não disponibilizar captura de ponteiro.
      }
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
    button.addEventListener('lostpointercapture', release);
  }

  function openSettings() {
    if (state.mode === 'running') pauseGame();
    if (!settingsModal) return;
    settingsModal.hidden = false;
    settingsModal.querySelector('[data-close-settings]')?.focus();
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.hidden = true;
    settingsOpenButton?.focus({ preventScroll: true });
  }

  function prepareMenu() {
    const menuButton = bySelector('[data-menu-toggle]');
    const menu = bySelector('[data-primary-nav]');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  function init() {
    resetCampaign();
    setMode('intro');
    updateControlMode();
    updateFinalScores();
    updateFavoriteInterface();
    prepareMenu();
    setTheme(document.documentElement.dataset.theme || 'dark');
    drawScene();

    bySelector('[data-start-game]')?.addEventListener('click', startGame);
    document.querySelectorAll('[data-restart-game]').forEach((button) => button.addEventListener('click', startGame));
    launchButtons.forEach((button) => button.addEventListener('click', launchBall));
    bySelector('[data-next-phase]')?.addEventListener('click', nextPhase);
    pauseButton?.addEventListener('click', togglePause);
    bySelector('[data-resume-game]')?.addEventListener('click', resumeGame);
    settingsOpenButton?.addEventListener('click', openSettings);
    document.querySelectorAll('[data-close-settings]').forEach((button) => button.addEventListener('click', closeSettings));
    settingsModal?.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettings(); });
    controlModeButtons.forEach((button) => button.addEventListener('click', () => setControlMode(button.dataset.controlMode)));
    favoriteButton?.addEventListener('click', () => {
      if (favorites.has(gameId)) favorites.delete(gameId);
      else favorites.add(gameId);
      saveFavorites();
      updateFavoriteInterface();
    });
    bySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    canvas.addEventListener('pointermove', (event) => {
      if (state.mode !== 'running' && state.mode !== 'ready') return;
      if (event.pointerType === 'mouse') {
        setPaddleCenter(getCanvasX(event));
        if (state.mode === 'ready') drawScene();
        return;
      }
      if (state.controlMode === 'touch' && state.touchPointerId === event.pointerId) setPaddleCenter(getCanvasX(event));
    });
    canvas.addEventListener('pointerdown', (event) => {
      if (state.controlMode === 'touch' && (event.pointerType === 'touch' || event.pointerType === 'mouse') && (state.mode === 'running' || state.mode === 'ready')) {
        event.preventDefault();
        state.touchPointerId = event.pointerId;
        setPaddleCenter(getCanvasX(event));
        try { canvas.setPointerCapture(event.pointerId); } catch { /* Alguns navegadores não permitem captura em eventos sintetizados. */ }
      }
      if (state.mode === 'ready') {
        event.preventDefault();
        launchBall();
      }
    });
    canvas.addEventListener('pointerup', clearMovement);
    canvas.addEventListener('pointercancel', clearMovement);
    canvas.addEventListener('lostpointercapture', clearMovement);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && settingsModal && !settingsModal.hidden) { closeSettings(); return; }
      if (settingsModal && !settingsModal.hidden) return;
      if (event.key.toLowerCase() === 'p' && (state.mode === 'running' || state.mode === 'paused')) {
        event.preventDefault();
        togglePause();
        return;
      }
      if ((event.code === 'Space' || event.key === ' ') && state.mode === 'ready') {
        event.preventDefault();
        launchBall();
        return;
      }
      if (setMovementFromKey(event, true)) event.preventDefault();
    });
    document.addEventListener('keyup', (event) => {
      if (setMovementFromKey(event, false)) event.preventDefault();
    });
    bindHeldControl('[data-move-left]', 'left');
    bindHeldControl('[data-move-right]', 'right');
    window.addEventListener('pointerup', clearMovement);
    window.addEventListener('blur', () => {
      clearMovement();
      if (state.mode === 'running') pauseGame();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.mode === 'running') pauseGame();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
