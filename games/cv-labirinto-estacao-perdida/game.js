(function () {
  'use strict';

  const nickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
    .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  if (!['educvv dev1', 'educvv dev'].includes(nickname)) return;

  const $ = (selector) => document.querySelector(selector);
  const canvas = $('[data-canvas]');
  const ctx = canvas.getContext('2d', { alpha: false });
  const gameId = 'cv-labirinto';
  const recordKey = 'cv-games-cv-labirinto-record-v1';
  const settingsKey = 'cv-games-cv-labirinto-settings-v1';
  const directions = [
    { key: 'up', x: 0, y: -1 }, { key: 'right', x: 1, y: 0 },
    { key: 'down', x: 0, y: 1 }, { key: 'left', x: -1, y: 0 }
  ];
  const keyMap = { ArrowUp: 'up', KeyW: 'up', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left' };
  const ui = {
    panel: $('[data-fullscreen-root]'), stage: $('[data-stage]'), room: $('[data-room]'), time: $('[data-time]'), keys: $('[data-keys]'),
    lives: $('[data-lives]'), score: $('[data-score]'), charge: $('[data-charge]'), best: $('[data-best-score]'),
    status: $('[data-status-text]'), statusLed: $('[data-status-led]'), overlay: $('[data-overlay]'), overlayIcon: $('[data-overlay-icon]'),
    overlayKicker: $('[data-overlay-kicker]'), overlayTitle: $('[data-overlay-title]'), overlayCopy: $('[data-overlay-copy]'),
    overlayRecord: $('[data-overlay-record]'), overlayPrimary: $('[data-overlay-primary]'), overlaySecondary: $('[data-overlay-secondary]'),
    pause: $('[data-pause]'), exitOpen: $('[data-exit-open]'), exitDialog: $('[data-exit-dialog]'),
    settingsOpen: $('[data-settings-open]'), settingsDialog: $('[data-settings-dialog]'), settingsClose: $('[data-settings-close]'),
    modeLabel: $('[data-mode-label]'), controlHint: $('[data-control-hint]'), touchControls: $('[data-touch-controls]'),
    emp: $('[data-emp]'), empLabel: $('[data-emp-label]'), sound: $('[data-sound-toggle]'), volume: $('[data-sfx-volume]'),
    volumeOutput: $('[data-sfx-output]'), favorite: $('[data-game-favorite]')
  };
  const state = {
    mode: 'menu', room: 1, lives: 3, score: 0, roomTime: 110, totalTime: 0, keys: [], energy: [], enemies: [],
    player: { x: 1, y: 1 }, exit: { x: 1, y: 1 }, grid: [], columns: 19, rows: 13, charge: 0,
    invulnerable: 0, pulse: 0, moveCooldown: 0, enemyCooldown: 0, roomDamageStart: 3, initialKeyCount: 0, bestScore: 0,
    controlMode: 'auto', sfxVolume: 1, muted: false, previousMode: 'menu', resumeAfterSettings: false
  };
  let viewport = { x: 0, y: 0, cell: 1, width: 1, height: 1, cameraReady: false };
  let lastFrame = 0;
  let lastDraw = 0;
  let coarseDevice = false;
  let animationFrame = 0;
  let audioContext = null;
  let heldKeys = [];
  let heldTouchDirection = null;

  function readObject(key, fallback = {}) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch { return fallback; }
  }

  function saveSetting(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* A preferência continua nesta sessão. */ }
  }

  function loadPreferences() {
    const saved = readObject(settingsKey);
    state.controlMode = ['auto', 'keys', 'touch'].includes(saved.controlMode) ? saved.controlMode : 'auto';
    state.sfxVolume = Number.isFinite(Number(saved.sfxVolume)) ? Math.max(0, Math.min(1, Number(saved.sfxVolume))) : 1;
    state.muted = saved.muted === true;
    if (ui.volume) ui.volume.value = String(Math.round(state.sfxVolume * 100));
    if (ui.volumeOutput) ui.volumeOutput.value = `${Math.round(state.sfxVolume * 100)}%`;
    if (ui.volumeOutput) ui.volumeOutput.textContent = `${Math.round(state.sfxVolume * 100)}%`;
    applyControls();
    updateSoundButton();
  }

  function loadRecord() {
    const saved = readObject(recordKey);
    return {
      score: Number.isSafeInteger(saved.score) && saved.score > 0 ? saved.score : 0,
      rooms: Number.isSafeInteger(saved.rooms) && saved.rooms > 0 ? Math.min(5, saved.rooms) : 0
    };
  }

  function saveRecord() {
    const current = loadRecord();
    const next = { score: Math.max(current.score, state.score), rooms: Math.max(current.rooms, Math.min(5, state.room)) };
    try { localStorage.setItem(recordKey, JSON.stringify(next)); } catch { /* O recorde segue válido nesta partida. */ }
    state.bestScore = next.score;
    if (ui.best) ui.best.textContent = formatNumber(next.score);
    return next;
  }

  function formatNumber(value) { return Math.max(0, Math.floor(value)).toLocaleString('pt-BR'); }
  function formatTime(value) {
    const seconds = Math.max(0, Math.ceil(value));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
  function cellKey(x, y) { return `${x},${y}`; }
  function inside(x, y, grid = state.grid) { return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length; }
  function isOpen(x, y, grid = state.grid) { return inside(x, y, grid) && grid[y][x] === 0; }

  function makeMaze(roomNumber) {
    const columns = 35 + (roomNumber - 1) * 4;
    const rows = 23 + (roomNumber - 1) * 2;
    const grid = Array.from({ length: rows }, () => Array(columns).fill(1));
    const stack = [{ x: 1, y: 1 }];
    grid[1][1] = 0;
    while (stack.length) {
      const current = stack[stack.length - 1];
      const candidates = directions
        .map((direction) => ({ x: current.x + direction.x * 2, y: current.y + direction.y * 2, direction }))
        .filter((next) => next.x > 0 && next.x < columns - 1 && next.y > 0 && next.y < rows - 1 && grid[next.y][next.x] === 1);
      if (!candidates.length) { stack.pop(); continue; }
      const next = randomItem(candidates);
      grid[current.y + next.direction.y][current.x + next.direction.x] = 0;
      grid[next.y][next.x] = 0;
      stack.push({ x: next.x, y: next.y });
    }
    const firstPaths = floodFill(grid, { x: 1, y: 1 });
    const chamberSeeds = shuffle(firstPaths.filter((item) => item.distance >= 7
      && item.x >= 3 && item.x < columns - 3 && item.y >= 3 && item.y < rows - 3));
    chamberSeeds.slice(0, 3 + roomNumber).forEach((seed) => {
      const radiusX = randomItem([1, 2]);
      const radiusY = randomItem([1, 2]);
      for (let y = seed.y - radiusY; y <= seed.y + radiusY; y += 1) {
        for (let x = seed.x - radiusX; x <= seed.x + radiusX; x += 1) {
          if (x > 0 && x < columns - 1 && y > 0 && y < rows - 1) grid[y][x] = 0;
        }
      }
    });
    for (let y = 1; y < rows - 1; y += 1) {
      for (let x = 1; x < columns - 1; x += 1) {
        if (grid[y][x] !== 1) continue;
        const joinsHorizontalPaths = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
        const joinsVerticalPaths = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
        if ((joinsHorizontalPaths || joinsVerticalPaths) && Math.random() < .4) grid[y][x] = 0;
      }
    }
    const reachable = floodFill(grid, { x: 1, y: 1 });
    const farthest = reachable.reduce((best, item) => item.distance > best.distance ? item : best, reachable[0]);
    const candidates = shuffle(reachable.filter((item) => item.distance >= 4 && cellKey(item.x, item.y) !== cellKey(farthest.x, farthest.y)));
    const keyCount = Math.min(4, 2 + Math.floor((roomNumber - 1) / 2));
    const keyCells = [];
    for (const candidate of candidates) {
      if (keyCells.every((key) => Math.abs(key.x - candidate.x) + Math.abs(key.y - candidate.y) >= 4)) keyCells.push({ x: candidate.x, y: candidate.y });
      if (keyCells.length >= keyCount) break;
    }
    const used = new Set([cellKey(1, 1), cellKey(farthest.x, farthest.y), ...keyCells.map((key) => cellKey(key.x, key.y))]);
    const energyCells = candidates.filter((cell) => !used.has(cellKey(cell.x, cell.y))).slice(1, 2).map(({ x, y }) => ({ x, y, taken: false }));
    energyCells.forEach((cell) => used.add(cellKey(cell.x, cell.y)));
    const enemyCount = 2 + Math.floor((roomNumber - 1) / 2);
    const enemySpots = shuffle(reachable.filter((cell) => cell.distance >= 9 && !used.has(cellKey(cell.x, cell.y))));
    const enemies = enemySpots.slice(0, enemyCount).map(({ x, y }, index) => ({ x, y, stunned: 0, phase: index * .8 }));
    return { grid, columns, rows, keys: keyCells, energy: energyCells, enemies, exit: { x: farthest.x, y: farthest.y } };
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function floodFill(grid, start) {
    const queue = [{ ...start, distance: 0 }];
    const visited = new Set([cellKey(start.x, start.y)]);
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      directions.forEach((direction) => {
        const x = current.x + direction.x;
        const y = current.y + direction.y;
        const key = cellKey(x, y);
        if (!isOpen(x, y, grid) || visited.has(key)) return;
        visited.add(key);
        queue.push({ x, y, distance: current.distance + 1 });
      });
    }
    return queue;
  }

  function loadRoom(roomNumber) {
    const room = makeMaze(roomNumber);
    state.room = roomNumber;
    state.grid = room.grid;
    state.columns = room.columns;
    state.rows = room.rows;
    state.player = { x: 1, y: 1 };
    state.keys = room.keys;
    state.initialKeyCount = room.keys.length;
    state.energy = room.energy;
    state.enemies = room.enemies;
    state.exit = room.exit;
    state.roomTime = Math.max(72, 110 - (roomNumber - 1) * 9);
    state.roomDamageStart = state.lives;
    state.enemyCooldown = .45;
    state.moveCooldown = 0;
    viewport.cameraReady = false;
    updateCamera(1);
    updateHud();
    draw(performance.now());
  }

  function startRun() {
    state.mode = 'playing';
    state.lives = 3;
    state.score = 0;
    state.totalTime = 0;
    state.charge = 0;
    state.invulnerable = 0;
    state.pulse = 0;
    loadRoom(1);
    ui.overlay.hidden = true;
    ui.pause.disabled = false;
    ui.status.textContent = 'Encontre os cartões de acesso e observe a rota dos robôs.';
    ui.statusLed.classList.remove('is-danger');
    window.CV_GAMES_STATS?.registerAccess?.(gameId);
    playSound('start');
    canvas.focus({ preventScroll: true });
  }

  function showOverlay({ mode, icon, kicker, title, copy, primary, secondary = '', record = '' }) {
    state.mode = mode;
    ui.overlayIcon.textContent = icon;
    ui.overlayKicker.textContent = kicker;
    ui.overlayTitle.textContent = title;
    ui.overlayCopy.textContent = copy;
    ui.overlayPrimary.textContent = primary;
    ui.overlaySecondary.hidden = !secondary;
    ui.overlaySecondary.textContent = secondary;
    ui.overlayRecord.textContent = record;
    ui.overlay.hidden = false;
    ui.pause.disabled = mode === 'menu' || mode === 'won' || mode === 'lost';
    draw(performance.now());
  }

  function pauseRun() {
    if (state.mode === 'playing') {
      showOverlay({ mode: 'paused', icon: 'Ⅱ', kicker: 'PAUSA', title: 'Exploração pausada', copy: 'Respire, confira seus cartões e retome quando estiver pronto.', primary: '▶ CONTINUAR', secondary: 'VOLTAR AO MENU' });
      ui.status.textContent = 'Partida pausada.';
    } else if (state.mode === 'paused') resumeRun();
  }

  function resumeRun() {
    state.mode = 'playing';
    ui.overlay.hidden = true;
    ui.pause.disabled = false;
    ui.status.textContent = 'Continue até encontrar a saída do setor.';
    canvas.focus({ preventScroll: true });
  }

  function returnToMenu() {
    state.mode = 'menu';
    ui.pause.disabled = true;
    ui.status.textContent = 'A estação está silenciosa. Encontre o primeiro cartão.';
    showOverlay({ mode: 'menu', icon: '⌗', kicker: 'TRANSMISSÃO RECEBIDA', title: 'Encontre uma saída', copy: 'Explore cinco setores, recupere os cartões de acesso e evite os robôs de segurança. Cada setor tem um novo labirinto.', primary: '▶ INICIAR EXPLORAÇÃO', record: `Seu recorde: ${formatNumber(state.bestScore)} pontos` });
  }

  function finishRun(won) {
    const record = saveRecord();
    const elapsed = formatTime(state.totalTime);
    const copy = won
      ? `Você escapou dos cinco setores em ${elapsed}, com ${formatNumber(state.score)} pontos e ${state.lives} ${state.lives === 1 ? 'vida restante' : 'vidas restantes'}.`
      : `Você chegou ao setor ${state.room}, marcou ${formatNumber(state.score)} pontos e sobreviveu por ${elapsed}.`;
    ui.status.textContent = won ? 'Sinal de saída confirmado. Você escapou da estação!' : 'Sinal perdido. A exploração foi encerrada.';
    ui.statusLed.classList.toggle('is-danger', !won);
    showOverlay({ mode: won ? 'won' : 'lost', icon: won ? '✦' : '!', kicker: won ? 'MISSÃO CONCLUÍDA' : 'MISSÃO ENCERRADA', title: won ? 'Você escapou!' : 'A estação venceu', copy, primary: '↻ TENTAR DE NOVO', secondary: 'VOLTAR AO MENU', record: `Melhor recorde: ${formatNumber(record.score)} pontos · ${record.rooms} ${record.rooms === 1 ? 'setor' : 'setores'}` });
    playSound(won ? 'win' : 'lose');
  }

  function setStatus(message, danger = false) {
    ui.status.textContent = message;
    ui.statusLed.classList.toggle('is-danger', danger);
  }

  function updateHud() {
    ui.room.textContent = `${Math.min(state.room, 5)} / 5`;
    ui.time.textContent = formatTime(state.roomTime);
    ui.time.classList.toggle('is-warning', state.roomTime <= 20);
    const totalKeys = state.initialKeyCount || 2;
    ui.keys.textContent = `${Math.max(0, totalKeys - (state.keys?.length || 0))} / ${totalKeys}`;
    ui.lives.textContent = Array.from({ length: 3 }, (_, index) => index < state.lives ? '♥' : '♡').join(' ');
    ui.lives.setAttribute('aria-label', `${state.lives} ${state.lives === 1 ? 'vida' : 'vidas'}`);
    ui.score.textContent = formatNumber(state.score);
    ui.charge.textContent = `${state.charge} / 3`;
    ui.emp.disabled = state.mode !== 'playing' || state.charge <= 0;
    ui.empLabel.textContent = state.charge > 0 ? `${state.charge} ${state.charge === 1 ? 'carga disponível' : 'cargas disponíveis'}` : 'Encontre energia';
  }

  function tryMove(directionName) {
    if (state.mode !== 'playing') return;
    const direction = directions.find((item) => item.key === directionName);
    if (!direction) return;
    const x = state.player.x + direction.x;
    const y = state.player.y + direction.y;
    if (!isOpen(x, y)) return;
    if (x === state.exit.x && y === state.exit.y && state.keys.length) {
      setStatus(`A saída está trancada. Faltam ${state.keys.length} ${state.keys.length === 1 ? 'cartão' : 'cartões'}.`);
      playSound('locked');
      return;
    }
    state.player = { x, y };
    state.moveCooldown = .14;
    collectAtPlayer();
    if (state.mode !== 'playing') return;
    checkContact();
    if (state.mode === 'playing' && x === state.exit.x && y === state.exit.y && state.keys.length === 0) clearRoom();
    updateHud();
  }

  function collectAtPlayer() {
    const keyIndex = state.keys.findIndex((item) => item.x === state.player.x && item.y === state.player.y);
    if (keyIndex >= 0) {
      state.keys.splice(keyIndex, 1);
      state.score += 120;
      setStatus(state.keys.length ? `Cartão recuperado. Ainda faltam ${state.keys.length}.` : 'Todos os cartões recuperados. A saída foi destravada!');
      playSound('key');
    }
    const energyIndex = state.energy.findIndex((item) => !item.taken && item.x === state.player.x && item.y === state.player.y);
    if (energyIndex >= 0) {
      state.energy[energyIndex].taken = true;
      state.charge = Math.min(3, state.charge + 1);
      state.score += 60;
      setStatus('Célula de energia recuperada. Pulso EMP carregado.');
      playSound('energy');
    }
  }

  function clearRoom() {
    const timeBonus = Math.floor(state.roomTime) * 12;
    state.score += 300 + timeBonus;
    if (state.lives === state.roomDamageStart) state.lives = Math.min(3, state.lives + 1);
    if (state.room >= 5) { finishRun(true); return; }
    const nextRoom = state.room + 1;
    setStatus(`Setor ${state.room} limpo. Entrando no setor ${nextRoom}…`);
    playSound('door');
    loadRoom(nextRoom);
    updateHud();
  }

  function takeHit() {
    if (state.invulnerable > 0 || state.mode !== 'playing') return;
    state.lives -= 1;
    state.player = { x: 1, y: 1 };
    state.invulnerable = 1.6;
    if (state.lives <= 0) { updateHud(); finishRun(false); return; }
    setStatus('Robô detectado! Você perdeu uma vida e voltou ao início do setor.', true);
    playSound('hit');
    updateHud();
  }

  function checkContact() {
    if (state.invulnerable > 0) return;
    if (state.enemies.some((enemy) => enemy.stunned <= 0 && enemy.x === state.player.x && enemy.y === state.player.y)) takeHit();
  }

  function findStepToward(start, target) {
    const startKey = cellKey(start.x, start.y);
    const targetKey = cellKey(target.x, target.y);
    const queue = [{ x: start.x, y: start.y }];
    const previous = new Map([[startKey, null]]);
    let found = false;
    for (let index = 0; index < queue.length && !found; index += 1) {
      const current = queue[index];
      for (const direction of directions) {
        const x = current.x + direction.x;
        const y = current.y + direction.y;
        const key = cellKey(x, y);
        if (!isOpen(x, y) || previous.has(key)) continue;
        previous.set(key, cellKey(current.x, current.y));
        if (key === targetKey) { found = true; break; }
        queue.push({ x, y });
      }
    }
    if (!found) return null;
    let stepKey = targetKey;
    while (previous.get(stepKey) && previous.get(stepKey) !== startKey) stepKey = previous.get(stepKey);
    const [x, y] = stepKey.split(',').map(Number);
    return { x, y };
  }

  function moveEnemies() {
    state.enemies.forEach((enemy) => {
      if (enemy.stunned > 0) return;
      const distance = Math.abs(enemy.x - state.player.x) + Math.abs(enemy.y - state.player.y);
      let next = distance <= 14 ? findStepToward(enemy, state.player) : null;
      if (!next) {
        const options = shuffle(directions.map((direction) => ({ x: enemy.x + direction.x, y: enemy.y + direction.y })).filter((cell) => isOpen(cell.x, cell.y)));
        next = options[0] || null;
      }
      if (next) { enemy.x = next.x; enemy.y = next.y; }
    });
    checkContact();
  }

  function useEmp() {
    if (state.mode !== 'playing' || state.charge <= 0) return;
    state.charge -= 1;
    state.pulse = .5;
    let disabled = 0;
    state.enemies.forEach((enemy) => {
      if (Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) <= 5.5) {
        enemy.stunned = 3.1;
        disabled += 1;
      }
    });
    setStatus(disabled ? `Pulso EMP desativou ${disabled} ${disabled === 1 ? 'robô' : 'robôs'} por alguns segundos.` : 'Pulso EMP ativado. Nenhum robô estava no alcance.');
    playSound('emp');
    updateHud();
  }

  function update(delta) {
    if (state.mode !== 'playing') return;
    state.totalTime += delta;
    state.roomTime = Math.max(0, state.roomTime - delta);
    state.invulnerable = Math.max(0, state.invulnerable - delta);
    state.pulse = Math.max(0, state.pulse - delta);
    state.enemies.forEach((enemy) => { enemy.stunned = Math.max(0, enemy.stunned - delta); });
    state.moveCooldown = Math.max(0, state.moveCooldown - delta);
    state.enemyCooldown -= delta;
    const moveDirection = heldTouchDirection || heldKeys[heldKeys.length - 1];
    if (moveDirection && state.moveCooldown <= 0) tryMove(moveDirection);
    if (state.enemyCooldown <= 0 && state.mode === 'playing') {
      moveEnemies();
      state.enemyCooldown = Math.max(.29, .5 - (state.room - 1) * .035);
      updateHud();
    }
    if (state.roomTime <= 0 && state.mode === 'playing') finishRun(false);
    updateHud();
  }

  function updateCamera(delta = 0) {
    const worldWidth = state.columns * viewport.cell;
    const worldHeight = state.rows * viewport.cell;
    const targetX = worldWidth <= viewport.width
      ? (viewport.width - worldWidth) / 2
      : Math.max(viewport.width - worldWidth, Math.min(0, viewport.width / 2 - (state.player.x + .5) * viewport.cell));
    const targetY = worldHeight <= viewport.height
      ? (viewport.height - worldHeight) / 2
      : Math.max(viewport.height - worldHeight, Math.min(0, viewport.height / 2 - (state.player.y + .5) * viewport.cell));
    if (!viewport.cameraReady || delta >= .5) {
      viewport.x = targetX;
      viewport.y = targetY;
      viewport.cameraReady = true;
      return;
    }
    const blend = 1 - Math.exp(-delta * 9);
    viewport.x += (targetX - viewport.x) * blend;
    viewport.y += (targetY - viewport.y) * blend;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const dpr = Math.min(coarse ? 1.35 : 1.7, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    viewport.width = rect.width;
    viewport.height = rect.height;
    viewport.cell = Math.max(10, Math.min(32, (rect.width - 22) / 21, (rect.height - 22) / 15));
    updateCamera(1);
    draw(performance.now());
  }

  function draw(now) {
    if (!canvas || !ctx || !viewport.width) return;
    const { width, height, cell } = viewport;
    ctx.clearRect(0, 0, width, height);
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#081522');
    background.addColorStop(1, '#102532');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    const firstColumn = Math.max(0, Math.floor(-viewport.x / cell));
    const lastColumn = Math.min(state.columns, Math.ceil((width - viewport.x) / cell));
    const firstRow = Math.max(0, Math.floor(-viewport.y / cell));
    const lastRow = Math.min(state.rows, Math.ceil((height - viewport.y) / cell));
    ctx.strokeStyle = 'rgba(125, 199, 191, .12)';
    ctx.lineWidth = 1;
    for (let y = firstRow; y < lastRow; y += 1) {
      for (let x = firstColumn; x < lastColumn; x += 1) {
        const px = x * cell;
        const py = y * cell;
        if (state.grid[y]?.[x] === 1) {
          const gradient = ctx.createLinearGradient(px, py, px + cell, py + cell);
          gradient.addColorStop(0, '#365663');
          gradient.addColorStop(1, '#1c3542');
          ctx.fillStyle = gradient;
          ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
          ctx.fillStyle = 'rgba(172, 231, 220, .1)';
          ctx.fillRect(px + 2, py + 2, cell - 4, Math.max(1, cell * .07));
        } else {
          ctx.fillStyle = (x + y) % 2 ? '#142c37' : '#122833';
          ctx.fillRect(px, py, cell, cell);
          ctx.strokeRect(px, py, cell, cell);
        }
      }
    }
    drawExit(cell, now);
    state.keys.forEach((key, index) => drawKey(key, index, cell, now));
    state.energy.forEach((item) => { if (!item.taken) drawEnergy(item, cell, now); });
    state.enemies.forEach((enemy, index) => drawRobot(enemy, index, cell, now));
    drawPlayer(cell, now);
    if (state.pulse > 0) {
      const progress = 1 - state.pulse / .5;
      const radius = cell * (1.5 + progress * 4);
      ctx.beginPath();
      ctx.arc((state.player.x + .5) * cell, (state.player.y + .5) * cell, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(105, 247, 210, ${state.pulse * 1.8})`;
      ctx.lineWidth = Math.max(2, cell * .1);
      ctx.stroke();
    }
    ctx.restore();
    drawMinimap();
  }

  function drawMinimap() {
    if (!viewport.width || !state.grid.length) return;
    const mapWidth = Math.min(156, viewport.width * .3);
    const mapHeight = mapWidth * state.rows / state.columns;
    const mapCell = mapWidth / state.columns;
    const mapX = viewport.width - mapWidth - 10;
    const mapY = 10;
    ctx.save();
    ctx.fillStyle = 'rgba(5, 14, 22, .86)';
    ctx.beginPath();
    ctx.roundRect(mapX - 5, mapY - 5, mapWidth + 10, mapHeight + 10, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(133, 224, 198, .4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    for (let y = 0; y < state.rows; y += 1) {
      for (let x = 0; x < state.columns; x += 1) {
        ctx.fillStyle = state.grid[y]?.[x] === 1 ? '#48616a' : '#1b3b3e';
        ctx.fillRect(mapX + x * mapCell, mapY + y * mapCell, Math.ceil(mapCell), Math.ceil(mapCell));
      }
    }
    const marker = (point, color, radius = Math.max(1.5, mapCell * .78)) => {
      ctx.beginPath();
      ctx.arc(mapX + (point.x + .5) * mapCell, mapY + (point.y + .5) * mapCell, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };
    state.keys.forEach((key) => marker(key, '#e1ff87', Math.max(1.2, mapCell * .55)));
    marker(state.exit, state.keys.length ? '#ffca76' : '#7dffd0', Math.max(1.6, mapCell * .7));
    state.enemies.forEach((enemy) => marker(enemy, enemy.stunned > 0 ? '#a4f3ff' : '#ff7585', Math.max(1.4, mapCell * .65)));
    marker(state.player, '#72ffd2', Math.max(2, mapCell * .9));
    ctx.restore();
  }

  function drawExit(cell, now) {
    const x = (state.exit.x + .5) * cell;
    const y = (state.exit.y + .5) * cell;
    const open = state.keys.length === 0;
    const pulse = .5 + Math.sin(now / 260) * .12;
    ctx.save();
    ctx.shadowColor = open ? '#63ffc2' : '#ffbd59';
    ctx.shadowBlur = cell * (open ? 1.1 : .45);
    ctx.fillStyle = open ? `rgba(76, 239, 177, ${pulse})` : 'rgba(255, 184, 79, .45)';
    ctx.beginPath();
    ctx.roundRect(x - cell * .32, y - cell * .38, cell * .64, cell * .76, cell * .12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = open ? '#b5ffe1' : '#ffe0a3';
    ctx.lineWidth = Math.max(1.5, cell * .07);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + cell * .12, y, Math.max(1.2, cell * .035), 0, Math.PI * 2);
    ctx.fillStyle = '#f6fff8';
    ctx.fill();
    ctx.restore();
  }

  function drawKey(key, index, cell, now) {
    const x = (key.x + .5) * cell;
    const y = (key.y + .5) * cell;
    const bob = Math.sin(now / 220 + index) * cell * .05;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = '#c9ff82';
    ctx.shadowBlur = cell * .7;
    ctx.fillStyle = '#d1ff90';
    ctx.fillRect(-cell * .18, -cell * .18, cell * .36, cell * .36);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f4ffd7';
    ctx.lineWidth = Math.max(1, cell * .045);
    ctx.strokeRect(-cell * .18, -cell * .18, cell * .36, cell * .36);
    ctx.restore();
  }

  function drawEnergy(item, cell, now) {
    const x = (item.x + .5) * cell;
    const y = (item.y + .5) * cell;
    const radius = cell * (.16 + Math.sin(now / 170) * .015);
    ctx.save();
    ctx.shadowColor = '#66d9ff';
    ctx.shadowBlur = cell * .8;
    ctx.fillStyle = '#86e7ff';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e2fbff';
    ctx.fillRect(x - cell * .035, y - cell * .23, cell * .07, cell * .46);
    ctx.restore();
  }

  function drawRobot(enemy, index, cell, now) {
    const x = (enemy.x + .5) * cell;
    const y = (enemy.y + .5) * cell;
    const bob = Math.sin(now / 180 + enemy.phase + index) * cell * .035;
    const radius = cell * .31;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.shadowColor = enemy.stunned > 0 ? '#8defff' : '#ff586a';
    ctx.shadowBlur = cell * (enemy.stunned > 0 ? .9 : .55);
    ctx.fillStyle = enemy.stunned > 0 ? '#71cbe1' : '#713c52';
    ctx.beginPath();
    ctx.roundRect(-radius, -radius * .8, radius * 2, radius * 1.65, radius * .34);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = enemy.stunned > 0 ? '#c5f8ff' : '#ff9aa5';
    ctx.lineWidth = Math.max(1, cell * .045);
    ctx.stroke();
    ctx.fillStyle = enemy.stunned > 0 ? '#eefeff' : '#ffadb3';
    ctx.beginPath();
    ctx.arc(-radius * .36, -radius * .02, Math.max(1.3, radius * .17), 0, Math.PI * 2);
    ctx.arc(radius * .36, -radius * .02, Math.max(1.3, radius * .17), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = enemy.stunned > 0 ? '#dcfaff' : '#ea7584';
    ctx.beginPath();
    ctx.moveTo(-radius * .38, radius * .67); ctx.lineTo(-radius * .52, radius * .92);
    ctx.moveTo(radius * .38, radius * .67); ctx.lineTo(radius * .52, radius * .92);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(cell, now) {
    if (state.invulnerable > 0 && Math.floor(now / 85) % 2) return;
    const x = (state.player.x + .5) * cell;
    const y = (state.player.y + .5) * cell;
    const radius = cell * .3;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#66ffd0';
    ctx.shadowBlur = cell * .8;
    ctx.fillStyle = '#51cfa9';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(1.2, cell * .05);
    ctx.strokeStyle = '#caffee';
    ctx.stroke();
    ctx.fillStyle = '#102a35';
    ctx.beginPath();
    ctx.arc(radius * .34, -radius * .14, Math.max(1.4, radius * .18), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    const delta = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    update(delta);
    updateCamera(delta);
    const renderInterval = coarseDevice ? 1000 / 30 : 1000 / 60;
    if (!lastDraw || now - lastDraw >= renderInterval) {
      draw(now);
      lastDraw = now;
    }
    animationFrame = window.requestAnimationFrame(frame);
  }

  function playSound(kind) {
    if (state.muted || state.sfxVolume <= 0) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume()?.catch?.(() => {});
    const presets = {
      start: [440, .11, 'sine', .16], key: [760, .13, 'sine', .19], energy: [940, .17, 'triangle', .2],
      locked: [190, .12, 'square', .1], emp: [260, .28, 'sawtooth', .14], hit: [115, .24, 'triangle', .2],
      door: [590, .25, 'sine', .17], win: [830, .32, 'triangle', .17], lose: [135, .42, 'sawtooth', .16]
    };
    const [frequency, duration, type, level] = presets[kind] || presets.start;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (kind === 'emp' || kind === 'win' || kind === 'key' || kind === 'energy') oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * .62), now + duration);
    gain.gain.setValueAtTime(level * state.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function applyControls() {
    const coarse = window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    coarseDevice = coarse;
    const touchActive = state.controlMode === 'touch' || (state.controlMode === 'auto' && coarse);
    document.body.classList.toggle('has-touch-controls', touchActive);
    document.body.dataset.controlMode = state.controlMode;
    const labels = { auto: 'CONTROLES AUTOMÁTICOS', keys: 'TECLADO ATIVADO', touch: 'TOQUE ATIVADO' };
    ui.modeLabel.textContent = labels[state.controlMode];
    ui.controlHint.textContent = touchActive ? 'Use o direcional para andar · encontre energia e toque em Pulso EMP' : 'WASD ou setas para mover · E para usar o pulso EMP';
    document.querySelectorAll('[data-control-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.controlMode === state.controlMode)));
  }

  function updateSoundButton() {
    ui.sound.textContent = state.muted ? '🔇' : '🔊';
    ui.sound.setAttribute('aria-pressed', String(state.muted));
    ui.sound.setAttribute('aria-label', state.muted ? 'Ativar efeitos sonoros' : 'Desativar efeitos sonoros');
    ui.sound.title = state.muted ? 'Som desligado' : 'Som ligado';
  }

  function readFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem('cv-games-favorites') || '[]');
      return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
    } catch { return new Set(); }
  }

  function updateFavorite() {
    const favorites = readFavorites();
    const active = favorites.has(gameId);
    const icon = ui.favorite.querySelector('.favorite-icon');
    const label = ui.favorite.querySelector('[data-favorite-label]');
    ui.favorite.setAttribute('aria-pressed', String(active));
    ui.favorite.setAttribute('aria-label', `${active ? 'Remover' : 'Adicionar'} CV LABIRINTO ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    icon.textContent = active ? '♥' : '♡';
    label.textContent = active ? 'Favoritado' : 'Favoritar';
    ui.favorite.querySelector('[data-favorite-count]').textContent = String(favorites.size);
  }

  function toggleFavorite() {
    const favorites = readFavorites();
    if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem('cv-games-favorites', JSON.stringify([...favorites])); } catch { /* Favorito opcional. */ }
    window.dispatchEvent(new Event('cv-games-favorites-change'));
    updateFavorite();
  }

  function prepareSettings() {
    document.querySelectorAll('[data-control-mode]').forEach((button) => button.addEventListener('click', () => {
      state.controlMode = button.dataset.controlMode;
      saveSetting(settingsKey, { controlMode: state.controlMode, sfxVolume: state.sfxVolume, muted: state.muted });
      applyControls();
    }));
    ui.volume.addEventListener('input', () => {
      state.sfxVolume = Number(ui.volume.value) / 100;
      ui.volumeOutput.value = `${ui.volume.value}%`;
      ui.volumeOutput.textContent = `${ui.volume.value}%`;
      saveSetting(settingsKey, { controlMode: state.controlMode, sfxVolume: state.sfxVolume, muted: state.muted });
    });
    ui.settingsOpen.addEventListener('click', () => {
      state.resumeAfterSettings = state.mode === 'playing';
      state.previousMode = state.mode;
      if (state.resumeAfterSettings) state.mode = 'paused';
      if (ui.settingsDialog.showModal) ui.settingsDialog.showModal(); else ui.settingsDialog.setAttribute('open', '');
    });
    ui.settingsClose.addEventListener('click', () => ui.settingsDialog.close?.());
    ui.settingsDialog.addEventListener('close', () => {
      if (state.resumeAfterSettings && state.mode === 'paused') state.mode = 'playing';
      state.resumeAfterSettings = false;
    });
    ui.settingsDialog.addEventListener('click', (event) => { if (event.target === ui.settingsDialog) ui.settingsDialog.close?.(); });
  }

  function prepareInputs() {
    document.addEventListener('keydown', (event) => {
      if (ui.settingsDialog.open || ui.exitDialog.open || event.target.closest?.('input, button, a, dialog')) return;
      const direction = keyMap[event.code];
      if (direction && state.controlMode !== 'touch') {
        event.preventDefault();
        heldKeys = heldKeys.filter((item) => item !== direction);
        heldKeys.push(direction);
        if (!event.repeat) tryMove(direction);
        return;
      }
      if (event.repeat) return;
      if (event.code === 'KeyE' || event.code === 'KeyQ') { event.preventDefault(); useEmp(); }
      else if (event.code === 'Space' && ['playing', 'paused'].includes(state.mode)) { event.preventDefault(); pauseRun(); }
    });
    document.addEventListener('keyup', (event) => {
      const direction = keyMap[event.code];
      if (direction) heldKeys = heldKeys.filter((item) => item !== direction);
    });
    window.addEventListener('blur', () => { heldKeys = []; heldTouchDirection = null; });
    ui.touchControls.querySelectorAll('[data-move]').forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        heldTouchDirection = button.dataset.move;
        try { button.setPointerCapture(event.pointerId); } catch { /* Captura opcional. */ }
        tryMove(heldTouchDirection);
      });
      const release = () => { heldTouchDirection = null; };
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('contextmenu', (event) => event.preventDefault());
    });
    ui.emp.addEventListener('click', useEmp);
  }

  function prepareMenu() {
    const button = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
    button?.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
    menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      button?.setAttribute('aria-expanded', 'false');
    }));
    $('[data-theme-toggle]')?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('cv-games-theme', next); } catch { /* Tema continua aplicado nesta visita. */ }
      const theme = $('[data-theme-toggle]');
      theme.textContent = next === 'light' ? '☀️' : '🌙';
      theme.setAttribute('aria-label', next === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
    });
  }

  function prepareButtons() {
    ui.overlayPrimary.addEventListener('click', () => {
      if (state.mode === 'paused') resumeRun();
      else startRun();
    });
    ui.overlaySecondary.addEventListener('click', returnToMenu);
    ui.pause.addEventListener('click', pauseRun);
    ui.sound.addEventListener('click', () => {
      state.muted = !state.muted;
      saveSetting(settingsKey, { controlMode: state.controlMode, sfxVolume: state.sfxVolume, muted: state.muted });
      updateSoundButton();
      if (!state.muted) playSound('start');
    });
    ui.exitOpen.addEventListener('click', () => {
      if (state.mode === 'menu') { window.location.href = '../../index.html#jogos'; return; }
      if (['won', 'lost'].includes(state.mode)) { returnToMenu(); return; }
      if (ui.exitDialog.showModal) ui.exitDialog.showModal(); else ui.exitDialog.setAttribute('open', '');
    });
    $('[data-exit-cancel]').addEventListener('click', () => ui.exitDialog.close?.());
    $('[data-exit-confirm]').addEventListener('click', () => { ui.exitDialog.close?.(); returnToMenu(); });
    ui.exitDialog.addEventListener('click', (event) => { if (event.target === ui.exitDialog) ui.exitDialog.close?.(); });
    ui.favorite.addEventListener('click', toggleFavorite);
  }

  function init() {
    const record = loadRecord();
    state.bestScore = record.score;
    ui.best.textContent = formatNumber(record.score);
    loadPreferences();
    updateHud();
    resizeCanvas();
    if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(ui.stage);
    else window.addEventListener('resize', resizeCanvas);
    document.addEventListener('fullscreenchange', resizeCanvas);
    document.addEventListener('webkitfullscreenchange', resizeCanvas);
    document.addEventListener('cv-games-fullscreenchange', resizeCanvas);
    prepareMenu();
    prepareSettings();
    prepareInputs();
    prepareButtons();
    updateFavorite();
    animationFrame = window.requestAnimationFrame(frame);
  }

  window.addEventListener('pagehide', () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    audioContext?.close?.().catch?.(() => {});
  }, { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
