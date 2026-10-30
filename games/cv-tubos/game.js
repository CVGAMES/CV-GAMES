(function () {
  'use strict';

  if (document.documentElement.dataset.tubesAccess !== 'granted') return;

  const $ = (selector) => document.querySelector(selector);
  const gameId = 'cv-tubos';
  const storageKey = 'cv-games-tubos-progress-v1';
  const favoriteKey = 'cv-games-favorites';
  const capacity = 4;
  const palette = [
    { name:'Turquesa', value:'#27c8df' },
    { name:'Coral', value:'#ff5d89' },
    { name:'Amarelo', value:'#ffc843' },
    { name:'Violeta', value:'#9a6cff' },
    { name:'Verde', value:'#40d98d' },
    { name:'Laranja', value:'#ff944d' }
  ];

  const ui = {
    lobby:$('[data-lobby]'), game:$('[data-game-view]'), board:$('[data-board]'),
    levelSelect:$('[data-level-select]'), nextLevel:$('[data-next-level]'), startCampaign:$('[data-start-campaign]'), startDaily:$('[data-start-daily]'),
    campaignBest:$('[data-campaign-best]'), dailyBest:$('[data-daily-best]'), today:$('[data-today-label]'),
    modeLabel:$('[data-mode-label]'), stageTitle:$('[data-stage-title]'), moveCount:$('[data-move-count]'), elapsed:$('[data-elapsed]'), record:$('[data-record]'),
    colorCount:$('[data-color-count]'), status:$('[data-status]'), undo:$('[data-undo]'), hint:$('[data-hint]'), restart:$('[data-restart]'),
    reward:$('[data-reward-panel]'), rewardTitle:$('[data-reward-title]'), rewardDescription:$('[data-reward-description]'), rewardButton:$('[data-extra-unlock]'),
    extraDialog:$('[data-extra-dialog]'), countdown:$('[data-countdown]'), resultOverlay:$('[data-result-overlay]'), resultKicker:$('[data-result-kicker]'),
    resultTitle:$('[data-result-title]'), resultDetail:$('[data-result-detail]'), resultMoves:$('[data-result-moves]'), resultTime:$('[data-result-time]'),
    resultNext:$('[data-result-next]'), resultClose:$('[data-result-close]'), exitDialog:$('[data-exit-dialog]'), toast:$('[data-toast]'),
    favorite:$('[data-game-favorite]'), favoriteCount:$('[data-favorite-count]'), favoriteLabel:$('[data-favorite-label]'),
    menuButton:$('[data-menu-toggle]'), menu:$('[data-primary-nav]')
  };

  const state = {
    mode:null, level:1, dayKey:'', colors:3, board:[], initialBoard:[], selected:null, hintMove:null,
    history:[], moves:0, started:false, solved:false, startedAt:0, elapsedMs:0, clockId:0,
    extraUnlocked:false, rewardInterval:0, toastTimeout:0
  };

  function readProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const unlockedLevel = Math.max(1, Math.floor(Number(value.unlockedLevel) || 1));
      return {
        unlockedLevel,
        campaignBest: value.campaignBest && typeof value.campaignBest === 'object' ? value.campaignBest : {},
        daily: value.daily && typeof value.daily === 'object' ? value.daily : {}
      };
    } catch {
      return { unlockedLevel:1, campaignBest:{}, daily:{} };
    }
  }

  function writeProgress(progress) {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* A fase continua jogável sem persistência local. */ }
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', { weekday:'long', day:'numeric', month:'long' }).format(date);
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    return `${String(Math.floor(totalSeconds / 60)).padStart(2,'0')}:${String(totalSeconds % 60).padStart(2,'0')}`;
  }

  function levelColors(level, daily) {
    return daily ? 4 : Math.min(palette.length, 3 + Math.floor((level - 1) / 5));
  }

  function hashSeed(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function copyBoard(board) { return board.map((tube) => [...tube]); }

  /*
   * The level is mixed backwards from a solved board. We also keep each
   * reversed piece separate from an equal piece underneath, so the game's
   * normal full-group pour can undo the scramble reliably.
   */
  function generateBoard(colorCount, scrambleMoves, seedText) {
    const random = seededRandom(hashSeed(seedText));
    const board = Array.from({ length:colorCount }, (_, color) => Array(capacity).fill(color));
    board.push([], []);
    let previous = null;

    for (let step = 0; step < scrambleMoves; step += 1) {
      const candidates = [];
      for (let source = 0; source < board.length; source += 1) {
        const tube = board[source];
        if (!tube.length) continue;
        const color = tube[tube.length - 1];
        if (tube.length > 1 && tube[tube.length - 2] !== color) continue;

        for (let target = 0; target < board.length; target += 1) {
          if (target === source || board[target].length >= capacity) continue;
          if (board[target].length && board[target][board[target].length - 1] === color) continue;
          if (previous && source === previous.target && target === previous.source && color === previous.color) continue;
          candidates.push({ source, target, color });
        }
      }
      if (!candidates.length) break;
      const move = candidates[Math.floor(random() * candidates.length)];
      board[move.source].pop();
      board[move.target].push(move.color);
      previous = move;
    }
    return board;
  }

  function todayRecord(progress, key) {
    return progress.daily[key] || null;
  }

  function renderLobby() {
    const progress = readProgress();
    const unlocked = progress.unlockedLevel;
    ui.nextLevel.textContent = String(unlocked);
    const picker = ui.levelSelect;
    const lastVisible = unlocked;
    const firstVisible = unlocked > 100 ? unlocked - 99 : 1;
    picker.replaceChildren();
    for (let level = firstVisible; level <= lastVisible; level += 1) {
      const option = document.createElement('option');
      option.value = String(level);
      option.textContent = `Fase ${level}${level === unlocked ? ' · próxima' : ''}`;
      picker.append(option);
    }
    picker.value = String(unlocked);
    updateStartButton();

    const completedLevels = Object.keys(progress.campaignBest).length;
    const latestBest = progress.campaignBest[String(Math.max(1, unlocked - 1))];
    ui.campaignBest.textContent = completedLevels
      ? `Fases concluídas: ${completedLevels} · ${latestBest ? `melhor na fase anterior: ${latestBest.moves} jogadas` : 'continue avançando para registrar novos recordes'}.`
      : 'Melhor resultado: ainda sem fases concluídas.';

    const now = new Date();
    const key = localDateKey(now);
    ui.today.textContent = formatDate(now);
    const daily = todayRecord(progress, key);
    ui.dailyBest.textContent = daily?.completed
      ? `Seu melhor resultado hoje: ${daily.bestMoves} jogadas · ${formatTime(daily.bestTime)}.`
      : 'Seu resultado de hoje: ainda não concluído.';
  }

  function updateStartButton() {
    ui.startCampaign.textContent = `▶ Jogar fase ${ui.levelSelect.value || 1}`;
  }

  function startGame(mode, requestedLevel) {
    clearInterval(state.clockId);
    clearTimeout(state.toastTimeout);
    state.mode = mode;
    state.level = Math.max(1, Math.floor(Number(requestedLevel) || 1));
    state.dayKey = mode === 'daily' ? localDateKey(new Date()) : '';
    state.colors = levelColors(state.level, mode === 'daily');
    const scrambleMoves = mode === 'daily'
      ? 34
      : Math.min(78, 8 + state.level * 2 + state.colors * 3);
    state.board = generateBoard(state.colors, scrambleMoves, mode === 'daily'
      ? `cv-tubos-daily-${state.dayKey}`
      : `cv-tubos-level-${state.level}`);
    state.initialBoard = copyBoard(state.board);
    state.selected = null;
    state.hintMove = null;
    state.history = [];
    state.moves = 0;
    state.started = true;
    state.solved = false;
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    state.extraUnlocked = false;
    ui.resultOverlay.hidden = true;
    ui.lobby.hidden = true;
    ui.game.hidden = false;
    ui.modeLabel.textContent = mode === 'daily' ? 'DESAFIO DIÁRIO' : 'CAMPANHA';
    ui.stageTitle.textContent = mode === 'daily' ? 'Desafio de hoje' : `Fase ${state.level}`;
    ui.colorCount.textContent = `${state.colors} ${state.colors === 1 ? 'cor' : 'cores'}`;
    ui.status.className = 'tubes-status';
    ui.status.textContent = 'Selecione um tubo para começar. Toque nele novamente ou em outro tubo para despejar.';
    refreshReward();
    updateStats();
    renderBoard();
    state.clockId = window.setInterval(updateElapsed, 250);
    ui.game.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function updateElapsed() {
    if (!state.started || state.solved) return;
    state.elapsedMs = performance.now() - state.startedAt;
    ui.elapsed.textContent = formatTime(state.elapsedMs);
  }

  function updateStats() {
    ui.moveCount.textContent = String(state.moves);
    ui.undo.disabled = state.history.length === 0 || state.solved;
    if (state.mode === 'daily') {
      const saved = todayRecord(readProgress(), state.dayKey);
      ui.record.textContent = saved?.completed ? `${saved.bestMoves}` : '—';
    } else {
      const best = readProgress().campaignBest[String(state.level)];
      ui.record.textContent = best ? String(best.moves) : '—';
    }
    ui.elapsed.textContent = formatTime(state.elapsedMs);
  }

  function colorName(color) { return palette[color]?.name || 'Cor'; }

  function isTubeSolved(tube) {
    return tube.length === capacity && tube.every((color) => color === tube[0]);
  }

  function renderBoard() {
    if (!ui.board) return;
    const fragment = document.createDocumentFragment();
    state.board.forEach((tube, index) => {
      const isMini = state.extraUnlocked && index === state.board.length - 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `tube${isMini ? ' is-mini' : ''}${state.selected === index ? ' is-selected' : ''}${isTubeSolved(tube) ? ' is-solved' : ''}`;
      button.dataset.tube = String(index);
      if (state.hintMove?.source === index) button.classList.add('is-hint-source');
      if (state.hintMove?.target === index) button.classList.add('is-hint-target');
      const contents = tube.length
        ? `${tube.length} de ${capacity} espaços; cores, de baixo para cima: ${tube.map(colorName).join(', ')}`
        : 'vazio';
      button.setAttribute('aria-label', `Tubo ${index + 1}${isMini ? ', tubo extra pequeno' : ''}: ${contents}`);
      button.setAttribute('aria-pressed', String(state.selected === index));

      const mouth = document.createElement('span');
      mouth.className = 'tube-mouth';
      mouth.setAttribute('aria-hidden','true');
      const glass = document.createElement('span');
      glass.className = 'tube-glass';
      glass.setAttribute('aria-hidden','true');
      [...tube].reverse().forEach((color) => {
        const segment = document.createElement('span');
        segment.className = 'tube-segment';
        segment.style.setProperty('--liquid', palette[color]?.value || '#7bdcff');
        glass.append(segment);
      });
      const number = document.createElement('span');
      number.className = 'tube-number';
      number.textContent = isMini ? 'extra' : String(index + 1);
      button.append(mouth, glass, number);
      fragment.append(button);
    });

    if (!state.extraUnlocked) {
      const slot = document.createElement('div');
      slot.className = 'tube-extra-slot';
      slot.setAttribute('aria-label','Espaço do tubo extra bloqueado');
      slot.innerHTML = '<span class="mini-tube-rim" aria-hidden="true"></span><span class="mini-tube-glass" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="tube-number">extra</span>';
      fragment.append(slot);
    }
    ui.board.replaceChildren(fragment);
  }

  function countTopColor(tube) {
    if (!tube.length) return 0;
    const color = tube[tube.length - 1];
    let count = 0;
    for (let index = tube.length - 1; index >= 0 && tube[index] === color; index -= 1) count += 1;
    return count;
  }

  function canPour(sourceIndex, targetIndex, board = state.board) {
    if (sourceIndex === targetIndex) return false;
    const source = board[sourceIndex];
    const target = board[targetIndex];
    if (!source?.length || !target || target.length >= capacity) return false;
    return target.length === 0 || target[target.length - 1] === source[source.length - 1];
  }

  function isSolved() {
    return state.board.every((tube) => tube.length === 0 || isTubeSolved(tube));
  }

  function showStatus(message, kind = '') {
    ui.status.textContent = message;
    ui.status.className = `tubes-status${kind ? ` is-${kind}` : ''}`;
  }

  function showToast(message) {
    clearTimeout(state.toastTimeout);
    ui.toast.textContent = message;
    ui.toast.hidden = false;
    state.toastTimeout = window.setTimeout(() => { ui.toast.hidden = true; }, 3000);
  }

  function saveUndo() {
    state.history.push({ board:copyBoard(state.board), moves:state.moves });
    if (state.history.length > 100) state.history.shift();
  }

  function tryPour(sourceIndex, targetIndex) {
    if (!canPour(sourceIndex, targetIndex)) return false;
    saveUndo();
    const source = state.board[sourceIndex];
    const target = state.board[targetIndex];
    const color = source[source.length - 1];
    const amount = Math.min(countTopColor(source), capacity - target.length);
    for (let unit = 0; unit < amount; unit += 1) target.push(source.pop());
    state.moves += 1;
    state.selected = null;
    state.hintMove = null;
    renderBoard();
    updateStats();
    if (isSolved()) {
      finishGame();
    } else {
      showStatus(`${amount} ${amount === 1 ? 'peça' : 'peças'} ${colorName(color).toLowerCase()} foram para o tubo ${targetIndex + 1}.`);
    }
    return true;
  }

  function onTubeClick(index) {
    if (!state.started || state.solved) return;
    state.hintMove = null;
    if (state.selected === null) {
      if (!state.board[index].length) {
        showStatus('Esse tubo está vazio. Selecione um tubo com uma cor no topo.', 'warning');
        return;
      }
      state.selected = index;
      showStatus(`Tubo ${index + 1} selecionado. Escolha onde despejar ${colorName(state.board[index].at(-1)).toLowerCase()}.`);
      renderBoard();
      return;
    }

    if (state.selected === index) {
      state.selected = null;
      showStatus('Seleção cancelada. Escolha outro tubo.');
      renderBoard();
      return;
    }

    if (tryPour(state.selected, index)) return;
    if (state.board[index].length) {
      state.selected = index;
      showStatus(`Tubo ${index + 1} selecionado. Só pode despejar sobre a mesma cor ou em um tubo vazio.`, 'warning');
      renderBoard();
    } else {
      showStatus('Esse movimento não cabe. Use um tubo vazio ou outro que tenha a mesma cor no topo.', 'warning');
    }
  }

  function boardRunCount(board) {
    return board.reduce((total, tube) => {
      let groups = 0;
      for (let index = 0; index < tube.length; index += 1) {
        if (index === 0 || tube[index] !== tube[index - 1]) groups += 1;
      }
      return total + groups;
    }, 0);
  }

  function showHint() {
    if (!state.started || state.solved) return;
    const candidates = [];
    const currentRuns = boardRunCount(state.board);
    for (let source = 0; source < state.board.length; source += 1) {
      const tube = state.board[source];
      if (!tube.length || isTubeSolved(tube)) continue;
      const color = tube[tube.length - 1];
      const amount = countTopColor(tube);
      for (let target = 0; target < state.board.length; target += 1) {
        if (!canPour(source, target)) continue;
        const next = copyBoard(state.board);
        const transfer = Math.min(amount, capacity - next[target].length);
        for (let unit = 0; unit < transfer; unit += 1) next[target].push(next[source].pop());
        const completed = isTubeSolved(next[target]);
        const sourceFreed = next[source].length === 0;
        const runGain = currentRuns - boardRunCount(next);
        const exposesNewColor = next[source].length > 0 && next[source].at(-1) !== color;
        const sameColorTarget = state.board[target].length > 0;
        const score = runGain * 8 + (completed ? 10 : 0) + (sourceFreed ? 2 : 0)
          + (exposesNewColor ? 2 : 0) + (sameColorTarget ? 1 : 0) - (state.board[source].length === capacity && isTubeSolved(state.board[source]) ? 20 : 0);
        candidates.push({ source, target, score });
      }
    }
    if (!candidates.length) {
      showStatus('Não encontrei um despejo possível. Reinicie a fase para tentar outra vez.', 'warning');
      return;
    }
    const bestScore = Math.max(...candidates.map((move) => move.score));
    const best = candidates.filter((move) => move.score === bestScore);
    state.hintMove = best[Math.floor(Math.random() * best.length)];
    state.selected = state.hintMove.source;
    showStatus(`Dica: despeje do tubo ${state.hintMove.source + 1} para o tubo ${state.hintMove.target + 1}.`, 'success');
    renderBoard();
  }

  function restartLevel() {
    if (!state.started) return;
    clearInterval(state.clockId);
    state.board = copyBoard(state.initialBoard);
    if (state.extraUnlocked) state.board.push([]);
    state.selected = null;
    state.hintMove = null;
    state.history = [];
    state.moves = 0;
    state.solved = false;
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    ui.resultOverlay.hidden = true;
    ui.status.className = 'tubes-status';
    ui.status.textContent = 'Fase reiniciada. Selecione um tubo para começar.';
    updateStats();
    renderBoard();
    state.clockId = window.setInterval(updateElapsed, 250);
  }

  function undoMove() {
    if (!state.history.length || state.solved) return;
    const previous = state.history.pop();
    state.board = copyBoard(previous.board);
    state.moves = previous.moves;
    state.selected = null;
    state.hintMove = null;
    updateStats();
    renderBoard();
    showStatus('Última jogada desfeita.');
  }

  function recordResult() {
    const progress = readProgress();
    if (state.mode === 'daily') {
      const previous = progress.daily[state.dayKey] || { completed:false, bestMoves:null, bestTime:null };
      const isBetter = !previous.completed || state.moves < previous.bestMoves
        || (state.moves === previous.bestMoves && state.elapsedMs < previous.bestTime);
      progress.daily[state.dayKey] = {
        completed:true,
        bestMoves:isBetter ? state.moves : previous.bestMoves,
        bestTime:isBetter ? state.elapsedMs : previous.bestTime
      };
      const oldDays = Object.keys(progress.daily).sort().slice(0, -35);
      oldDays.forEach((day) => { delete progress.daily[day]; });
    } else {
      const key = String(state.level);
      const previous = progress.campaignBest[key];
      const isBetter = !previous || state.moves < previous.moves
        || (state.moves === previous.moves && state.elapsedMs < previous.time);
      if (isBetter) progress.campaignBest[key] = { moves:state.moves, time:state.elapsedMs };
      if (state.level >= progress.unlockedLevel) progress.unlockedLevel = state.level + 1;
    }
    writeProgress(progress);
  }

  function finishGame() {
    state.elapsedMs = performance.now() - state.startedAt;
    state.solved = true;
    state.selected = null;
    state.hintMove = null;
    clearInterval(state.clockId);
    recordResult();
    updateStats();
    renderBoard();
    ui.resultKicker.textContent = state.mode === 'daily' ? 'DESAFIO DIÁRIO CONCLUÍDO' : 'FASE CONCLUÍDA';
    ui.resultTitle.textContent = state.mode === 'daily' ? 'Desafio resolvido!' : 'Muito bem!';
    ui.resultDetail.textContent = state.mode === 'daily'
      ? 'Você organizou o tabuleiro do dia. Seu resultado ficou salvo neste aparelho.'
      : `Você organizou as ${state.colors} cores da fase ${state.level}. A próxima fase foi liberada.`;
    ui.resultMoves.textContent = String(state.moves);
    ui.resultTime.textContent = formatTime(state.elapsedMs);
    ui.resultNext.textContent = state.mode === 'daily' ? 'Jogar desafio novamente ↻' : `Próxima fase ${state.level + 1} →`;
    ui.resultOverlay.hidden = false;
    showStatus('Todas as cores estão organizadas. Fase concluída!', 'success');
    renderLobby();
  }

  function refreshReward() {
    ui.reward.classList.toggle('is-unlocked', state.extraUnlocked);
    if (state.extraUnlocked) {
      ui.rewardTitle.textContent = 'Tubo extra liberado';
      ui.rewardDescription.textContent = 'O frasco menor já está no tabuleiro e pode receber cores.';
      ui.rewardButton.textContent = '✓ Liberado nesta fase';
      ui.rewardButton.disabled = true;
    } else {
      ui.rewardTitle.textContent = 'Tubo extra';
      ui.rewardDescription.textContent = 'Um espaço a mais, como recompensa de anúncio.';
      ui.rewardButton.textContent = '▶ Prévia · 10s';
      ui.rewardButton.disabled = false;
    }
  }

  function cancelRewardCountdown() {
    clearInterval(state.rewardInterval);
    state.rewardInterval = 0;
    if (ui.extraDialog.open) ui.extraDialog.close();
  }

  function beginRewardCountdown() {
    if (!state.started || state.solved || state.extraUnlocked || state.rewardInterval) return;
    let seconds = 10;
    ui.countdown.textContent = String(seconds);
    if (typeof ui.extraDialog.showModal === 'function') ui.extraDialog.showModal();
    else ui.extraDialog.setAttribute('open','');
    state.rewardInterval = window.setInterval(() => {
      seconds -= 1;
      ui.countdown.textContent = String(Math.max(0,seconds));
      if (seconds > 0) return;
      clearInterval(state.rewardInterval);
      state.rewardInterval = 0;
      if (ui.extraDialog.open) ui.extraDialog.close();
      state.extraUnlocked = true;
      state.board.push([]);
      refreshReward();
      renderBoard();
      showStatus('Tubo extra liberado para esta fase. Use o frasco menor como espaço vazio.', 'success');
    }, 1000);
  }

  function openExitDialog() {
    if (typeof ui.exitDialog.showModal === 'function') ui.exitDialog.showModal();
    else ui.exitDialog.setAttribute('open','');
  }

  function returnToLobby() {
    clearInterval(state.clockId);
    cancelRewardCountdown();
    state.started = false;
    ui.resultOverlay.hidden = true;
    ui.game.hidden = true;
    ui.lobby.hidden = false;
    renderLobby();
    ui.lobby.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cv-games-theme',theme); } catch { /* O tema segue ativo nesta visita. */ }
    const toggle = $('[data-theme-toggle]');
    if (toggle) {
      const light = theme === 'light';
      toggle.textContent = light ? '☀️' : '🌙';
      toggle.setAttribute('aria-label',light ? 'Ativar modo escuro' : 'Ativar modo claro');
      toggle.title = light ? 'Ativar modo escuro' : 'Ativar modo claro';
    }
  }

  function refreshFavorites() {
    let favorites = [];
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      favorites = Array.isArray(saved) ? saved : [];
    } catch { favorites = []; }
    const active = favorites.includes(gameId);
    const icon = ui.favorite.querySelector('.favorite-icon');
    ui.favorite.setAttribute('aria-pressed',String(active));
    ui.favorite.setAttribute('aria-label',`${active ? 'Remover' : 'Adicionar'} CV Tubos ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    if (icon) icon.textContent = active ? '♥' : '♡';
    ui.favoriteLabel.textContent = active ? 'Favoritado' : 'Favoritar';
    ui.favoriteCount.textContent = String(favorites.length);
  }

  function toggleFavorite() {
    let favorites = [];
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      favorites = Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
    } catch { favorites = []; }
    const index = favorites.indexOf(gameId);
    if (index >= 0) favorites.splice(index,1);
    else favorites.push(gameId);
    try {
      localStorage.setItem(favoriteKey,JSON.stringify(favorites));
      window.dispatchEvent(new Event('cv-games-favorites-change'));
    } catch { /* Favoritos são opcionais neste navegador. */ }
    refreshFavorites();
  }

  function prepareMenuAndTheme() {
    ui.menuButton?.addEventListener('click', () => {
      const open = ui.menu.classList.toggle('is-open');
      ui.menuButton.setAttribute('aria-expanded',String(open));
      ui.menuButton.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');
    });
    ui.menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      ui.menu.classList.remove('is-open');
      ui.menuButton?.setAttribute('aria-expanded','false');
    }));
    const initialTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    setTheme(initialTheme);
    $('[data-theme-toggle]')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  }

  function bindEvents() {
    ui.levelSelect.addEventListener('change',updateStartButton);
    ui.startCampaign.addEventListener('click',() => startGame('campaign',ui.levelSelect.value));
    ui.startDaily.addEventListener('click',() => startGame('daily',1));
    ui.board.addEventListener('click',(event) => {
      const tube = event.target.closest('[data-tube]');
      if (tube) onTubeClick(Number(tube.dataset.tube));
    });
    ui.undo.addEventListener('click',undoMove);
    ui.hint.addEventListener('click',showHint);
    ui.restart.addEventListener('click',restartLevel);
    ui.rewardButton.addEventListener('click',beginRewardCountdown);
    $('[data-extra-close]')?.addEventListener('click',cancelRewardCountdown);
    $('[data-extra-cancel]')?.addEventListener('click',cancelRewardCountdown);
    ui.extraDialog.addEventListener('cancel',(event) => { event.preventDefault(); cancelRewardCountdown(); });
    ui.extraDialog.addEventListener('click',(event) => { if (event.target === ui.extraDialog) cancelRewardCountdown(); });
    $('[data-back-lobby]')?.addEventListener('click',openExitDialog);
    $('[data-exit-close]')?.addEventListener('click',() => ui.exitDialog.close());
    $('[data-exit-stay]')?.addEventListener('click',() => ui.exitDialog.close());
    $('[data-exit-confirm]')?.addEventListener('click',() => { ui.exitDialog.close(); returnToLobby(); });
    ui.exitDialog.addEventListener('click',(event) => { if (event.target === ui.exitDialog) ui.exitDialog.close(); });
    ui.resultNext.addEventListener('click',() => {
      if (state.mode === 'daily') startGame('daily',1);
      else startGame('campaign',state.level + 1);
    });
    ui.resultClose.addEventListener('click',returnToLobby);
    ui.favorite.addEventListener('click',toggleFavorite);
    window.addEventListener('storage',(event) => {
      if (event.key === favoriteKey) refreshFavorites();
    });
    window.addEventListener('cv-games-favorites-change',refreshFavorites);
  }

  function init() {
    window.CV_GAMES_STATS?.registerAccess?.(gameId);
    renderLobby();
    refreshFavorites();
    prepareMenuAndTheme();
    bindEvents();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}());
