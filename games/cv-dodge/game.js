(function () {
  'use strict';

  const canvas = document.querySelector('[data-orbital-canvas]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const $ = (selector) => document.querySelector(selector);
  if (document.body.dataset.orbitalAccess !== 'granted') return;
  const all = (selector) => [...document.querySelectorAll(selector)];
  const gameId = 'cv-dodge';
  const favoritesKey = 'cv-games-favorites';
  const themeKey = 'cv-games-theme';
  const columns = 12;
  const rows = 8;
  const baseLives = 15;
  const bestKey = 'cv-games-orbital-defense-record';
  const towerTypes = {
    pulse: { name: 'Sentinela', cost: 55, damage: 12, range: 2.65, reload: .62, color: '#5ce1d6', projectile: '#9afff2', speed: 620, splash: 0, slow: 0 },
    cannon: { name: 'Canhão', cost: 85, damage: 37, range: 2.95, reload: 1.42, color: '#ffad72', projectile: '#ffd29c', speed: 410, splash: .7, slow: 0 },
    cryo: { name: 'Congelante', cost: 70, damage: 5, range: 2.5, reload: .54, color: '#79caff', projectile: '#b0e6ff', speed: 560, splash: 0, slow: .48 },
    plasma: { name: 'Plasma', cost: 125, damage: 22, range: 3.55, reload: 1.08, color: '#d39cff', projectile: '#e9bcff', speed: 720, splash: .26, slow: 0 }
  };
  const routeGrid = [
    [0, 3], [1, 3], [2, 3], [2, 2], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    [6, 2], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [9, 5], [9, 4], [9, 3], [9, 2], [10, 2], [11, 2]
  ];
  const routeSet = new Set(routeGrid.map(([x, y]) => `${x},${y}`));
  const towers = [];
  const enemies = [];
  const projectiles = [];
  const particles = [];
  let geometry = { width: 0, height: 0, cell: 0, left: 0, top: 0 };
  let mode = 'intro';
  let previousMode = 'ready';
  let currentWave = 0;
  let nextWave = 1;
  let credits = 160;
  let lives = baseLives;
  let kills = 0;
  let score = 0;
  let bestWave = readBest();
  let selectedBlueprint = 'pulse';
  let selectedTowerId = null;
  let nextEntityId = 1;
  let spawnQueue = [];
  let spawnTimer = 0;
  let hoverCell = null;
  let lastFrame = 0;
  let lastShotSoundAt = 0;
  let toastTimeout;
  let sessionCounted = false;
  let favorites = readFavorites();

  function readFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
      return new Set(Array.isArray(value) ? value.filter((id) => typeof id === 'string') : []);
    } catch { return new Set(); }
  }

  function readBest() {
    try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); } catch { return 0; }
  }

  function playTone(frequency, duration = .08, type = 'sine', level = .035) {
    window.CV_GAME_AUDIO?.playTone(frequency, duration, type, level);
  }

  function setMode(next) {
    mode = next;
    document.body.dataset.orbitalState = next;
    $('[data-intro-screen]').hidden = next !== 'intro';
    $('[data-pause-screen]').hidden = next !== 'paused';
    $('[data-gameover-screen]').hidden = next !== 'over';
    syncUi();
  }

  function syncUi() {
    $('[data-wave]').textContent = currentWave || '—';
    $('[data-credits]').textContent = credits.toLocaleString('pt-BR');
    $('[data-lives]').textContent = lives;
    $('[data-kills]').textContent = kills;
    $('[data-best-wave]').textContent = bestWave;
    const statusCopy = {
      intro: 'Prepare sua defesa', ready: currentWave ? 'Onda concluída · defesa pronta' : 'Monte suas primeiras torres',
      running: 'Onda inimiga em andamento', paused: 'Partida pausada', over: 'Missão encerrada'
    };
    $('[data-hud-status]').textContent = statusCopy[mode] || '';
    const launch = $('[data-launch-wave]');
    launch.disabled = mode !== 'ready';
    launch.textContent = mode === 'intro' ? 'Inicie a missão' : mode === 'running' ? 'Onda em andamento' : `Lançar onda ${nextWave}`;
    launch.insertAdjacentHTML('beforeend', ' <span aria-hidden="true">→</span>');
    if (mode === 'intro') launch.textContent = 'Inicie a missão →';
    $('[data-wave-label]').textContent = mode === 'running' ? `ONDA ${currentWave} · EM COMBATE` : mode === 'ready' ? `PRÓXIMA · ONDA ${nextWave}` : 'MISSÃO PRONTA';
    $('[data-wave-summary]').textContent = mode === 'running' ? `${enemies.length + spawnQueue.length} hostis na rota` : mode === 'ready' && currentWave ? 'Defesa reforçada · avance' : 'Construa sua defesa';
    $('[data-wave-reward]').textContent = mode === 'ready' && currentWave ? `Próxima onda: mais inimigos e ${30 + nextWave * 12} créditos de bônus.` : 'Sobreviva às ondas e ganhe créditos para expandir.';
    $('[data-pause-game]').disabled = !['running', 'ready'].includes(mode);
    const pauseButton = $('[data-pause-game]');
    pauseButton.textContent = mode === 'paused' ? '▶' : '⏸';
    pauseButton.setAttribute('aria-label', mode === 'paused' ? 'Retomar partida' : 'Pausar partida');
    pauseButton.title = mode === 'paused' ? 'Retomar partida' : 'Pausar partida';
    $('[data-pause-label]').textContent = mode === 'paused' ? 'RETOMAR' : 'PAUSAR';
    $('[data-final-wave]').textContent = currentWave;
    $('[data-final-kills]').textContent = kills;
    $('[data-final-score]').textContent = score.toLocaleString('pt-BR');
    $('[data-final-best]').textContent = bestWave;
    syncTowerDetails();
  }

  function syncTowerDetails() {
    const tower = towers.find((item) => item.id === selectedTowerId);
    const config = tower ? towerTypes[tower.type] : towerTypes[selectedBlueprint];
    const level = tower?.level || 1;
    const damage = Math.round(config.damage * (1 + .5 * (level - 1)));
    const range = (config.range + .16 * (level - 1)).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    $('[data-selected-title]').textContent = tower ? `${config.name} selecionada` : `${config.name} selecionada`;
    $('[data-selected-level]').textContent = `NÍVEL ${level}`;
    $('[data-selected-damage]').textContent = damage;
    $('[data-selected-range]').textContent = range;
    const upgrade = $('[data-upgrade-tower]');
    const upgradeCost = tower ? 50 + tower.level * 55 : 50 + 55;
    $('[data-upgrade-cost]').textContent = `${upgradeCost} ✧`;
    upgrade.disabled = !tower || tower.level >= 4 || credits < upgradeCost || !['ready', 'running'].includes(mode);
    $('[data-sell-tower]').disabled = !tower || !['ready', 'running'].includes(mode);
    $('[data-build-tip]').textContent = tower
      ? tower.level >= 4 ? 'Esta torre já alcançou o nível máximo.' : `Melhore por ${upgradeCost} créditos ou venda por ${Math.floor(tower.spent * .68)}.`
      : `Custa ${config.cost} créditos. Clique em uma área livre da rota para construir.`;
  }

  function showToast(message) {
    const toast = $('[data-toast]');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.hidden = true; }, 1900);
  }

  function countPlay() {
    if (sessionCounted) return;
    sessionCounted = true;
    window.CV_GAMES_STATS?.registerAccess?.(gameId);
    window.CV_GAMES_STATS?.recordPlay?.(gameId);
  }

  function startMission() {
    if (mode !== 'intro') return;
    countPlay();
    setMode('ready');
    $('[data-game-status]').textContent = 'Selecione uma torre e construa sua defesa. Quando estiver pronto, lance a onda.';
    showToast('Núcleo online. Posicione suas primeiras torres.');
  }

  function createWaveQueue(wave) {
    const count = Math.min(24, 6 + wave * 2);
    const queue = [];
    for (let index = 0; index < count; index += 1) {
      if (wave >= 3 && index % 5 === 3) queue.push('scout');
      else if (wave >= 4 && index % 7 === 5) queue.push('armored');
      else queue.push('drone');
    }
    if (wave % 5 === 0) queue.push('boss');
    return queue;
  }

  function launchWave() {
    if (mode === 'intro') { startMission(); return; }
    if (mode !== 'ready') return;
    currentWave = nextWave;
    nextWave += 1;
    spawnQueue = createWaveQueue(currentWave);
    spawnTimer = .15;
    credits += 30 + currentWave * 12;
    setMode('running');
    $('[data-game-status]').textContent = currentWave % 5 === 0 ? `Onda ${currentWave}: contato de chefe detectado!` : `Onda ${currentWave}: inimigos se aproximando.`;
    playTone(currentWave % 5 === 0 ? 280 : 420, .2, 'triangle', .05);
    if (currentWave % 5 === 0) showToast(`Alerta: chefe detectado na onda ${currentWave}!`);
    else showToast(`Onda ${currentWave} iniciada · +${30 + currentWave * 12} créditos`);
    syncUi();
  }

  function setPause() {
    if (mode === 'paused') {
      setMode(previousMode);
      $('[data-game-status]').textContent = 'Defesa retomada.';
      return;
    }
    if (!['ready', 'running'].includes(mode)) return;
    previousMode = mode;
    setMode('paused');
    $('[data-game-status]').textContent = 'Partida pausada.';
  }

  function endGame() {
    setMode('over');
    const achievedWave = Math.max(currentWave, 0);
    if (achievedWave > bestWave) {
      bestWave = achievedWave;
      try { localStorage.setItem(bestKey, String(bestWave)); } catch {}
    }
    syncUi();
    $('[data-game-status]').textContent = `Missão encerrada na onda ${currentWave}.`;
    playTone(150, .5, 'sawtooth', .045);
  }

  function resetMission() {
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    currentWave = 0;
    nextWave = 1;
    credits = 160;
    lives = baseLives;
    kills = 0;
    score = 0;
    spawnQueue = [];
    selectedTowerId = null;
    selectedBlueprint = 'pulse';
    sessionCounted = false;
    all('[data-tower]').forEach((button) => button.classList.toggle('is-selected', button.dataset.tower === selectedBlueprint));
    setMode('intro');
    $('[data-game-status]').textContent = 'Selecione suas torres para começar a missão.';
  }

  function upgradeSelectedTower() {
    const tower = towers.find((item) => item.id === selectedTowerId);
    if (!tower || tower.level >= 4) return;
    const cost = 50 + tower.level * 55;
    if (credits < cost) { showToast('Créditos insuficientes para esta melhoria.'); return; }
    credits -= cost;
    tower.level += 1;
    tower.spent += cost;
    addBurst(tower.x, tower.y, towerTypes[tower.type].color, 22);
    playTone(650, .14, 'sine', .045);
    showToast(`${towerTypes[tower.type].name} melhorada para o nível ${tower.level}.`);
    syncUi();
  }

  function sellSelectedTower() {
    const index = towers.findIndex((item) => item.id === selectedTowerId);
    if (index < 0) return;
    const tower = towers[index];
    const refund = Math.floor(tower.spent * .68);
    credits += refund;
    towers.splice(index, 1);
    selectedTowerId = null;
    playTone(310, .1, 'triangle', .035);
    showToast(`Torre vendida · ${refund} créditos recuperados.`);
    syncUi();
  }

  function towerAt(column, row) {
    return towers.find((tower) => tower.column === column && tower.row === row);
  }

  function buildAt(column, row) {
    if (mode !== 'ready' && mode !== 'running') return;
    if (column < 0 || row < 0 || column >= columns || row >= rows) return;
    const existing = towerAt(column, row);
    if (existing) {
      selectedTowerId = existing.id;
      selectedBlueprint = existing.type;
      all('[data-tower]').forEach((button) => button.classList.toggle('is-selected', button.dataset.tower === existing.type));
      syncUi();
      return;
    }
    if (routeSet.has(`${column},${row}`)) { showToast('Essa casa faz parte da rota. Escolha um terreno livre.'); return; }
    const config = towerTypes[selectedBlueprint];
    if (credits < config.cost) { showToast('Créditos insuficientes para construir esta torre.'); return; }
    credits -= config.cost;
    const point = cellCenter(column, row);
    const tower = { id: nextEntityId++, type: selectedBlueprint, column, row, x: point.x, y: point.y, level: 1, spent: config.cost, reload: .2, angle: -Math.PI / 2 };
    towers.push(tower);
    selectedTowerId = tower.id;
    addBurst(tower.x, tower.y, config.color, 13);
    playTone(530, .09, 'triangle', .045);
    $('[data-game-status]').textContent = `${config.name} construída. Prepare o próximo movimento.`;
    syncUi();
  }

  function cellCenter(column, row) {
    return { x: geometry.left + (column + .5) * geometry.cell, y: geometry.top + (row + .5) * geometry.cell };
  }

  function pointOnRoute(distance) {
    const maxIndex = routeGrid.length - 1;
    const segment = Math.min(maxIndex - 1, Math.floor(distance));
    const portion = Math.max(0, Math.min(1, distance - segment));
    const from = cellCenter(routeGrid[segment][0], routeGrid[segment][1]);
    const to = cellCenter(routeGrid[segment + 1][0], routeGrid[segment + 1][1]);
    return { x: from.x + (to.x - from.x) * portion, y: from.y + (to.y - from.y) * portion };
  }

  function spawnEnemy(kind) {
    const wave = currentWave;
    const boss = kind === 'boss';
    const scout = kind === 'scout';
    const armored = kind === 'armored';
    const baseHealth = 38 + wave * 9 + Math.pow(wave, 1.24) * 2.2;
    const health = boss ? 460 + wave * 82 : baseHealth * (scout ? .68 : armored ? 1.72 : 1);
    const speed = boss ? 58 + Math.min(16, wave * .8) : Math.min(152, 83 + wave * 2.1) * (scout ? 1.34 : armored ? .72 : 1);
    const start = pointOnRoute(0);
    enemies.push({ id: nextEntityId++, kind, x: start.x, y: start.y, distance: 0, health, maxHealth: health, speed, radius: boss ? geometry.cell * .25 : geometry.cell * (scout ? .115 : armored ? .17 : .145), slowTimer: 0, slowFactor: 1, color: boss ? '#ffc76b' : scout ? '#ef82ff' : armored ? '#ff797d' : '#ff647e', seed: Math.random() * Math.PI * 2 });
    if (boss) playTone(190, .42, 'sawtooth', .055);
  }

  function distanceBetween(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function updateEnemies(delta) {
    for (let index = enemies.length - 1; index >= 0; index -= 1) {
      const enemy = enemies[index];
      enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
      const multiplier = enemy.slowTimer > 0 ? enemy.slowFactor : 1;
      enemy.distance += (enemy.speed * multiplier * delta) / geometry.cell;
      if (enemy.distance >= routeGrid.length - 1) {
        enemies.splice(index, 1);
        const damage = enemy.kind === 'boss' ? 4 : enemy.kind === 'armored' ? 2 : 1;
        lives = Math.max(0, lives - damage);
        addBurst(enemy.x, enemy.y, '#ff6979', 17);
        playTone(115, .2, 'sawtooth', .05);
        $('[data-game-status]').textContent = `${enemy.kind === 'boss' ? 'Chefe' : 'Inimigo'} atravessou a defesa · base −${damage}.`;
        syncUi();
        if (lives <= 0) { endGame(); return; }
        continue;
      }
      const position = pointOnRoute(enemy.distance);
      enemy.x = position.x;
      enemy.y = position.y;
    }
  }

  function chooseTarget(tower, range) {
    let target = null;
    let progress = -1;
    for (const enemy of enemies) {
      if (distanceBetween(tower, enemy) > range) continue;
      if (enemy.distance > progress) { target = enemy; progress = enemy.distance; }
    }
    return target;
  }

  function updateTowers(delta) {
    for (const tower of towers) {
      const config = towerTypes[tower.type];
      const levelBoost = 1 + .5 * (tower.level - 1);
      const range = (config.range + .16 * (tower.level - 1)) * geometry.cell;
      tower.reload -= delta;
      const target = chooseTarget(tower, range);
      if (!target) continue;
      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
      if (tower.reload > 0) continue;
      tower.reload = config.reload * Math.max(.68, 1 - .04 * (tower.level - 1));
      projectiles.push({ id: nextEntityId++, x: tower.x, y: tower.y, targetId: target.id, type: tower.type, speed: config.speed, damage: config.damage * levelBoost, splash: config.splash * geometry.cell, slow: config.slow, color: config.projectile, radius: tower.type === 'cannon' ? 5 : 3.5 });
      const now = performance.now();
      if (now - lastShotSoundAt > 150) {
        lastShotSoundAt = now;
        const frequency = tower.type === 'cryo' ? 720 : tower.type === 'cannon' ? 260 : tower.type === 'plasma' ? 560 : 430;
        playTone(frequency, .045, tower.type === 'cannon' ? 'triangle' : 'sine', .014);
      }
    }
  }

  function damageEnemy(enemy, projectile) {
    if (!enemies.includes(enemy)) return;
    const victims = projectile.splash > 0
      ? enemies.filter((other) => distanceBetween(enemy, other) <= projectile.splash)
      : [enemy];
    for (const victim of victims) {
      victim.health -= projectile.damage * (victim === enemy ? 1 : .65);
      if (projectile.slow) {
        victim.slowTimer = Math.max(victim.slowTimer, 1.2);
        victim.slowFactor = projectile.slow;
      }
      addBurst(victim.x, victim.y, projectile.color, victim === enemy ? 3 : 2);
      if (victim.health <= 0) destroyEnemy(victim);
    }
    if (projectile.splash) addBurst(enemy.x, enemy.y, projectile.color, 10);
  }

  function destroyEnemy(enemy) {
    const index = enemies.indexOf(enemy);
    if (index < 0) return;
    enemies.splice(index, 1);
    const reward = enemy.kind === 'boss' ? 115 + currentWave * 8 : enemy.kind === 'armored' ? 19 : enemy.kind === 'scout' ? 17 : 13;
    credits += reward;
    kills += 1;
    score += enemy.kind === 'boss' ? 450 : enemy.kind === 'armored' ? 55 : 35;
    addBurst(enemy.x, enemy.y, enemy.color, enemy.kind === 'boss' ? 24 : 11);
    if (enemy.kind === 'boss') {
      score += 850;
      showToast(`Chefe abatido · +${reward} créditos`);
      playTone(820, .24, 'triangle', .05);
    }
    syncUi();
  }

  function updateProjectiles(delta) {
    for (let index = projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = projectiles[index];
      const target = enemies.find((enemy) => enemy.id === projectile.targetId);
      if (!target) { projectiles.splice(index, 1); continue; }
      const distance = distanceBetween(projectile, target);
      const step = projectile.speed * delta;
      if (distance <= step + target.radius) {
        damageEnemy(target, projectile);
        projectiles.splice(index, 1);
      } else {
        projectile.x += ((target.x - projectile.x) / distance) * step;
        projectile.y += ((target.y - projectile.y) / distance) * step;
      }
    }
  }

  function updateWave(delta) {
    if (spawnQueue.length) {
      spawnTimer -= delta;
      if (spawnTimer <= 0) {
        spawnEnemy(spawnQueue.shift());
        spawnTimer = .72;
      }
    } else if (!enemies.length) {
      const bonus = 30 + currentWave * 12;
      credits += bonus;
      score += currentWave * 120;
      setMode('ready');
      $('[data-game-status]').textContent = `Onda ${currentWave} repelida · bônus de ${bonus} créditos.`;
      showToast(`Onda ${currentWave} repelida · +${bonus} créditos`);
      playTone(610, .19, 'sine', .045);
      syncUi();
    }
  }

  function addBurst(x, y, color, count) {
    const limit = Math.min(count, Math.max(0, 140 - particles.length));
    for (let index = 0; index < limit; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 18 + Math.random() * 100;
      const life = .22 + Math.random() * .42;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, color, size: 1.2 + Math.random() * 2.8 });
    }
  }

  function updateParticles(delta) {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= delta;
      if (particle.life <= 0) { particles.splice(index, 1); continue; }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= .97;
      particle.vy *= .97;
    }
  }

  function layoutCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.min(rect.width / columns, rect.height / rows);
    geometry = { width: rect.width, height: rect.height, cell, left: (rect.width - cell * columns) / 2, top: (rect.height - cell * rows) / 2 };
  }

  function roundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
  }

  function drawGrid() {
    const { cell, left, top } = geometry;
    const routeGradient = ctx.createLinearGradient(left, top, left + columns * cell, top + rows * cell);
    routeGradient.addColorStop(0, '#173b4b');
    routeGradient.addColorStop(.55, '#173348');
    routeGradient.addColorStop(1, '#25354a');
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = left + column * cell;
        const y = top + row * cell;
        const onRoute = routeSet.has(`${column},${row}`);
        ctx.fillStyle = onRoute ? routeGradient : ((column + row) % 2 ? '#0b1d32' : '#0d2137');
        roundedRect(x + 1, y + 1, cell - 2, cell - 2, cell * .08);
        ctx.fill();
        if (!onRoute) {
          ctx.fillStyle = 'rgba(130, 190, 208, .09)';
          ctx.beginPath(); ctx.arc(x + cell * (.18 + (column % 3) * .18), y + cell * (.22 + (row % 3) * .17), Math.max(1, cell * .018), 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(94, 197, 205, .09)'; ctx.lineWidth = 1; roundedRect(x + 3, y + 3, cell - 6, cell - 6, cell * .075); ctx.stroke();
        }
      }
    }
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    routeGrid.forEach(([column, row], index) => {
      const point = cellCenter(column, row);
      if (!index) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = 'rgba(2, 12, 27, .42)'; ctx.lineWidth = cell * .36; ctx.stroke();
    ctx.strokeStyle = 'rgba(94, 218, 211, .12)'; ctx.lineWidth = cell * .23; ctx.stroke();
    ctx.setLineDash([cell * .1, cell * .12]); ctx.strokeStyle = 'rgba(119, 230, 218, .32)'; ctx.lineWidth = Math.max(1, cell * .017); ctx.stroke();
    ctx.restore();
    drawGate(routeGrid[0], 'ENTRADA', '#62d7d0');
    drawGate(routeGrid[routeGrid.length - 1], 'NÚCLEO', '#ff7c91');
    if (hoverCell && mode !== 'intro' && mode !== 'over') {
      const { column, row } = hoverCell;
      const tower = towerAt(column, row);
      const selected = towers.find((item) => item.id === selectedTowerId);
      const point = tower || selected || cellCenter(column, row);
      const config = tower ? towerTypes[tower.type] : selected ? towerTypes[selected.type] : towerTypes[selectedBlueprint];
      ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, (config.range + .16 * ((tower || selected)?.level - 1 || 0)) * cell, 0, Math.PI * 2);
      ctx.fillStyle = `${config.color}0b`; ctx.strokeStyle = `${config.color}55`; ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.fill(); ctx.stroke(); ctx.restore();
      if (!tower) {
        const x = left + column * cell; const y = top + row * cell;
        ctx.strokeStyle = routeSet.has(`${column},${row}`) ? '#ff7c91' : `${towerTypes[selectedBlueprint].color}b0`;
        ctx.lineWidth = 2; ctx.setLineDash([]); roundedRect(x + 4, y + 4, cell - 8, cell - 8, cell * .1); ctx.stroke();
      }
    }
  }

  function drawGate(gridPoint, label, color) {
    const point = cellCenter(gridPoint[0], gridPoint[1]);
    const radius = geometry.cell * .24;
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = geometry.cell * .24;
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, geometry.cell * .025);
    ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = color; ctx.globalAlpha = .15; ctx.beginPath(); ctx.arc(point.x, point.y, radius * .74, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .95; ctx.shadowBlur = 0; ctx.fillStyle = '#deeff4'; ctx.font = `900 ${Math.max(6, geometry.cell * .095)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(label, point.x, point.y - geometry.cell * .34); ctx.restore();
  }

  function drawTowers() {
    for (const tower of towers) {
      const config = towerTypes[tower.type];
      const radius = geometry.cell * .28;
      const selected = tower.id === selectedTowerId;
      ctx.save();
      if (selected) { ctx.beginPath(); ctx.arc(tower.x, tower.y, geometry.cell * (config.range + .16 * (tower.level - 1)), 0, Math.PI * 2); ctx.fillStyle = `${config.color}0c`; ctx.fill(); ctx.strokeStyle = `${config.color}52`; ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]); }
      ctx.shadowColor = `${config.color}88`; ctx.shadowBlur = selected ? 17 : 8;
      ctx.beginPath(); ctx.arc(tower.x, tower.y, radius, 0, Math.PI * 2); ctx.fillStyle = '#102b40'; ctx.fill(); ctx.lineWidth = selected ? 2.5 : 1.6; ctx.strokeStyle = config.color; ctx.stroke();
      ctx.shadowBlur = 0; ctx.translate(tower.x, tower.y); ctx.rotate(tower.angle);
      ctx.fillStyle = config.color; roundedRect(-radius * .2, -radius * .2, radius * 1.3, radius * .4, radius * .18); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.shadowColor = config.color; ctx.shadowBlur = 8; ctx.fillStyle = '#efffff'; ctx.font = `900 ${geometry.cell * .22}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icon = tower.type === 'pulse' ? '✦' : tower.type === 'cannon' ? '◉' : tower.type === 'cryo' ? '❄' : 'ϟ';
      ctx.fillText(icon, tower.x, tower.y); ctx.restore();
      if (tower.level > 1) {
        ctx.fillStyle = '#f3d68a'; ctx.beginPath(); ctx.arc(tower.x + radius * .68, tower.y - radius * .68, geometry.cell * .085, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a2a24'; ctx.font = `900 ${geometry.cell * .09}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(tower.level), tower.x + radius * .68, tower.y - radius * .68);
      }
    }
  }

  function drawEnemies(time) {
    for (const enemy of enemies) {
      const boss = enemy.kind === 'boss';
      const scout = enemy.kind === 'scout';
      const radius = enemy.radius * (1 + Math.sin(time * .005 + enemy.seed) * .045);
      ctx.save();
      ctx.shadowColor = enemy.color; ctx.shadowBlur = boss ? 23 : 11;
      ctx.fillStyle = boss ? '#4d3245' : scout ? '#382546' : enemy.kind === 'armored' ? '#4b2939' : '#3d2639';
      ctx.strokeStyle = enemy.color; ctx.lineWidth = boss ? 2.4 : 1.6;
      ctx.beginPath();
      if (boss) {
        for (let side = 0; side < 8; side += 1) { const angle = Math.PI / 4 * side - Math.PI / 8; const x = enemy.x + Math.cos(angle) * radius; const y = enemy.y + Math.sin(angle) * radius; if (side === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.closePath();
      } else {
        ctx.moveTo(enemy.x - radius, enemy.y); ctx.lineTo(enemy.x - radius * .25, enemy.y - radius * .8); ctx.lineTo(enemy.x + radius, enemy.y - radius * .12); ctx.lineTo(enemy.x + radius * .6, enemy.y + radius * .72); ctx.lineTo(enemy.x - radius * .55, enemy.y + radius * .62); ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = boss ? '#fff1b1' : '#fff2f3'; ctx.beginPath(); ctx.arc(enemy.x + radius * .18, enemy.y - radius * .12, Math.max(1.4, radius * .11), 0, Math.PI * 2); ctx.fill();
      if (enemy.slowTimer > 0) { ctx.strokeStyle = '#90dbff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius * 1.25, 0, Math.PI * 2); ctx.stroke(); }
      const barWidth = radius * (boss ? 3.2 : 2.5); const barY = enemy.y - radius - (boss ? 12 : 8);
      ctx.fillStyle = 'rgba(2, 8, 18, .8)'; roundedRect(enemy.x - barWidth / 2, barY, barWidth, boss ? 5 : 3.5, 2); ctx.fill();
      const ratio = Math.max(0, enemy.health / enemy.maxHealth); ctx.fillStyle = ratio < .28 ? '#ff6e7d' : boss ? '#ffc869' : '#73e3cc'; roundedRect(enemy.x - barWidth / 2, barY, barWidth * ratio, boss ? 5 : 3.5, 2); ctx.fill();
      if (boss) { ctx.fillStyle = '#ffe1a4'; ctx.font = `900 ${geometry.cell * .105}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('CHEFE', enemy.x, barY - 4); }
      ctx.restore();
    }
  }

  function drawEffects(time) {
    for (const projectile of projectiles) {
      ctx.save(); ctx.shadowColor = projectile.color; ctx.shadowBlur = 12; ctx.fillStyle = projectile.color;
      ctx.beginPath(); ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .4; ctx.beginPath(); ctx.arc(projectile.x, projectile.y, projectile.radius * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (const particle of particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife); ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    const portal = cellCenter(routeGrid[0][0], routeGrid[0][1]);
    const pulse = .8 + Math.sin(time * .003) * .12;
    ctx.strokeStyle = 'rgba(101, 232, 217, .32)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(portal.x, portal.y, geometry.cell * .34 * pulse, 0, Math.PI * 2); ctx.stroke();
  }

  function render(time) {
    layoutCanvas();
    if (!geometry.cell) return;
    ctx.clearRect(0, 0, geometry.width, geometry.height);
    const bg = ctx.createLinearGradient(0, 0, geometry.width, geometry.height);
    bg.addColorStop(0, '#081526'); bg.addColorStop(1, '#101a31'); ctx.fillStyle = bg; ctx.fillRect(0, 0, geometry.width, geometry.height);
    drawGrid(); drawTowers(); drawEnemies(time); drawEffects(time);
  }

  function frame(time) {
    const delta = lastFrame ? Math.min(.04, (time - lastFrame) / 1000) : 0;
    lastFrame = time;
    if (mode === 'running' && geometry.cell) {
      updateWave(delta);
      if (mode === 'running') { updateEnemies(delta); updateTowers(delta); updateProjectiles(delta); }
    }
    if (mode !== 'paused') updateParticles(delta);
    render(time);
    requestAnimationFrame(frame);
  }

  function updateHover(event) {
    const rect = canvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const column = Math.floor((localX - geometry.left) / geometry.cell);
    const row = Math.floor((localY - geometry.top) / geometry.cell);
    hoverCell = column >= 0 && row >= 0 && column < columns && row < rows ? { column, row } : null;
  }

  canvas.addEventListener('pointermove', updateHover);
  canvas.addEventListener('pointerleave', () => { hoverCell = null; });
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (mode !== 'ready' && mode !== 'running') return;
    updateHover(event);
    if (hoverCell) buildAt(hoverCell.column, hoverCell.row);
  });

  function updateFavoriteInterface() {
    const button = $('[data-game-favorite]');
    if (!button) return;
    const isFavorite = favorites.has(gameId);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.setAttribute('aria-label', isFavorite ? 'Remover CV Defesa Orbital dos favoritos' : 'Adicionar CV Defesa Orbital aos favoritos');
    button.title = isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    const icon = button.querySelector('.favorite-icon');
    const label = button.querySelector('[data-favorite-label]');
    const count = button.querySelector('[data-favorite-count]');
    if (icon) icon.textContent = isFavorite ? '♥' : '♡';
    if (label) label.textContent = isFavorite ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(favorites.size);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(themeKey, theme); } catch {}
    const button = $('[data-theme-toggle]');
    if (button) {
      const isLight = theme === 'light';
      button.textContent = isLight ? '☀️' : '🌙';
      button.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
      button.title = isLight ? 'Ativar modo escuro' : 'Ativar modo claro';
    }
  }

  function prepareSiteControls() {
    const favoriteButton = $('[data-game-favorite]');
    favoriteButton?.addEventListener('click', () => {
      if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
      try {
        localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
        window.dispatchEvent(new Event('cv-games-favorites-change'));
      } catch {}
      updateFavoriteInterface();
    });
    $('[data-theme-toggle]')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    const menuButton = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
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
    setTheme(document.documentElement.dataset.theme || 'dark');
    updateFavoriteInterface();
  }

  all('[data-tower]').forEach((button) => button.addEventListener('click', () => {
    selectedBlueprint = button.dataset.tower;
    selectedTowerId = null;
    all('[data-tower]').forEach((item) => item.classList.toggle('is-selected', item === button));
    syncTowerDetails();
  }));
  $('[data-start-game]').addEventListener('click', startMission);
  $('[data-launch-wave]').addEventListener('click', launchWave);
  $('[data-pause-game]').addEventListener('click', setPause);
  $('[data-resume-game]').addEventListener('click', setPause);
  $('[data-restart-game]').addEventListener('click', resetMission);
  $('[data-upgrade-tower]').addEventListener('click', upgradeSelectedTower);
  $('[data-sell-tower]').addEventListener('click', sellSelectedTower);
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'p' && !event.repeat) setPause();
    if (event.key === 'Escape' && mode === 'running' && !document.fullscreenElement) setPause();
    if (event.key === 'Escape' && mode === 'paused') setPause();
  });
  document.addEventListener('cv-games-fullscreenchange', () => requestAnimationFrame(layoutCanvas));
  if ('ResizeObserver' in window) new ResizeObserver(layoutCanvas).observe(canvas.parentElement);
  window.addEventListener('resize', layoutCanvas, { passive: true });

  bestWave = readBest();
  prepareSiteControls();
  syncUi();
  requestAnimationFrame(frame);
})();
