(function () {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const boardElement = $('[data-board]');
  const lobby = $('[data-lobby]');
  const gameView = $('[data-game-view]');
  const gameId = 'cv-jogo-da-velha';
  const scoreKey = 'cv-jogo-da-velha-scores-v1';
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const ui = {
    start:$('[data-start-local]'), startComputer:$('[data-start-computer]'), turnCard:$('[data-live-turn]'), turnSymbol:$('[data-turn-symbol]'), turnLabel:$('[data-turn-label]'),
    statusCard:$('[data-status-card]'), statusMark:$('[data-status-mark]'), status:$('[data-game-status]'), statusDetail:$('[data-status-detail]'),
    undo:$('[data-undo]'), resetScores:$('[data-reset-scores]'), newRound:$('[data-new-round]'), roundLabel:$('[data-round-label]'),
    xScore:$('[data-x-score]'), oScore:$('[data-o-score]'), drawScore:$('[data-draw-score]'), xName:$('[data-x-name]'), oName:$('[data-o-name]'), xState:$('[data-x-state]'), oState:$('[data-o-state]'),
    moveCount:$('[data-move-count]'), moveList:$('[data-move-list]'), favorite:$('[data-game-favorite]'),
    resultOverlay:$('[data-result-overlay]'), resultTitle:$('[data-result-title]'), resultScore:$('[data-result-score]'),
    resultBreakdown:$('[data-result-breakdown]'), resultNextRound:$('[data-result-next-round]')
  };
  const state = {
    board:Array(9).fill(null), current:'x', starter:'x', started:false, outcome:null,
    mode:'local', winningCells:[], history:[], undoStack:[], focusSquare:4,
    scores:readScores()
  };
  const cells = [];
  let computerTimer = 0;

  function readScores() {
    try {
      const saved = JSON.parse(localStorage.getItem(scoreKey) || '{}');
      return {
        x:Number.isSafeInteger(saved.x) && saved.x >= 0 ? saved.x : 0,
        o:Number.isSafeInteger(saved.o) && saved.o >= 0 ? saved.o : 0,
        draws:Number.isSafeInteger(saved.draws) && saved.draws >= 0 ? saved.draws : 0,
        cpuX:Number.isSafeInteger(saved.cpuX) && saved.cpuX >= 0 ? saved.cpuX : 0,
        cpuO:Number.isSafeInteger(saved.cpuO) && saved.cpuO >= 0 ? saved.cpuO : 0,
        cpuDraws:Number.isSafeInteger(saved.cpuDraws) && saved.cpuDraws >= 0 ? saved.cpuDraws : 0
      };
    } catch { return { x:0, o:0, draws:0, cpuX:0, cpuO:0, cpuDraws:0 }; }
  }
  function saveScores() {
    try { localStorage.setItem(scoreKey,JSON.stringify(state.scores)); } catch { /* O placar continua disponível nesta partida. */ }
  }
  function playerName(player) {
    if (state.mode === 'computer') return player === 'x' ? 'Você' : 'Computador';
    return player === 'x' ? 'X' : 'O';
  }
  function modeScores() {
    return state.mode === 'computer'
      ? { x:state.scores.cpuX, o:state.scores.cpuO, draws:state.scores.cpuDraws }
      : { x:state.scores.x, o:state.scores.o, draws:state.scores.draws };
  }
  function cellName(index) {
    const row = Math.floor(index / 3);
    const col = index % 3;
    if (row === 1 && col === 1) return 'centro';
    const rows = ['linha de cima','linha do meio','linha de baixo'];
    const columns = ['à esquerda','no centro','à direita'];
    return `${rows[row]}, ${columns[col]}`;
  }
  function createBoard() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 9; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ttt-cell';
      button.dataset.cell = String(index);
      button.setAttribute('role','gridcell');
      button.tabIndex = index === state.focusSquare ? 0 : -1;
      button.setAttribute('aria-label',`Casa ${cellName(index)}, vazia`);
      const mark = document.createElement('span');
      mark.className = 'ttt-mark';
      mark.setAttribute('aria-hidden','true');
      button.append(mark);
      fragment.append(button);
      cells.push(button);
    }
    boardElement.replaceChildren(fragment);
    render();
  }
  function getWinningLine() { return winLines.find((line) => line.every((index) => state.board[index] === state.current)) || null; }
  function recordSnapshot() {
    state.undoStack.push({
      board:[...state.board], current:state.current, outcome:state.outcome,
      winningCells:[...state.winningCells], history:[...state.history], focusSquare:state.focusSquare
    });
  }
  function renderBoard() {
    cells.forEach((button,index) => {
      const value = state.board[index];
      const mark = button.querySelector('.ttt-mark');
      mark.textContent = value === 'x' ? '×' : value === 'o' ? '○' : '';
      mark.className = `ttt-mark${value ? ` ttt-mark-${value}` : ''}`;
      button.classList.toggle('is-winner',state.winningCells.includes(index));
      button.disabled = !state.started || Boolean(value) || (state.mode === 'computer' && state.current === 'o' && !state.outcome);
      button.tabIndex = index === state.focusSquare ? 0 : -1;
      button.setAttribute('aria-label',`Casa ${cellName(index)}, ${value ? `marcada com ${playerName(value)}` : 'vazia'}`);
    });
  }
  function renderPlayers() {
    const finished = Boolean(state.outcome);
    ui.xName.textContent = state.mode === 'computer' ? 'Você · X' : 'Jogador X';
    ui.oName.textContent = state.mode === 'computer' ? 'Computador · O' : 'Jogador O';
    for (const player of ['x','o']) {
      const card = $(`[data-player-card="${player}"]`);
      card.classList.toggle('is-active',state.started && !finished && state.current === player);
      const label = player === 'x' ? ui.xState : ui.oState;
      label.textContent = !state.started ? 'Aguardando a partida' : finished ? state.outcome.type === 'win' && state.outcome.winner === player ? 'Venceu esta rodada' : 'Rodada encerrada' : state.current === player ? state.mode === 'computer' && player === 'o' ? 'Pensando…' : 'Sua vez de jogar' : 'Esperando a vez';
    }
    const scores = modeScores();
    ui.xScore.textContent = String(scores.x);
    ui.oScore.textContent = String(scores.o);
    ui.drawScore.textContent = String(scores.draws);
  }
  function renderHistory() {
    ui.moveCount.textContent = `${state.history.length} ${state.history.length === 1 ? 'jogada' : 'jogadas'}`;
    if (!state.history.length) {
      const empty = document.createElement('li');
      empty.className = 'ttt-empty-history';
      empty.textContent = 'As jogadas aparecem aqui.';
      ui.moveList.replaceChildren(empty);
      return;
    }
    const items = state.history.map((move,index) => {
      const item = document.createElement('li');
      if (index === state.history.length - 1) item.classList.add('is-latest');
      const number = document.createElement('span'); number.className = 'ttt-move-index'; number.textContent = `${index + 1}.`;
      const player = document.createElement('strong'); player.className = 'ttt-move-player'; player.dataset.player = move.player; player.textContent = playerName(move.player);
      const location = document.createElement('span'); location.textContent = cellName(move.square);
      item.append(number,player,location);
      return item;
    });
    ui.moveList.replaceChildren(...items);
  }
  function renderStatus() {
    ui.statusCard.removeAttribute('data-result');
    if (!state.started) {
      ui.status.textContent = 'Pronto para jogar';
      ui.statusDetail.textContent = 'Faça três símbolos em linha para vencer a rodada.';
      ui.statusMark.textContent = '✦';
      ui.turnCard.dataset.player = 'x';
      ui.turnSymbol.textContent = '×';
      ui.turnLabel.textContent = state.mode === 'computer' ? 'Você · X' : 'Jogador X';
    } else if (state.outcome?.type === 'win') {
      const winner = state.outcome.winner;
      ui.statusCard.dataset.result = winner;
      ui.status.textContent = state.mode === 'computer' ? `${playerName(winner)} venceu!` : `Jogador ${playerName(winner)} venceu!`;
      ui.statusDetail.textContent = 'Três em linha. Comece outra rodada para continuar a disputa.';
      ui.statusMark.textContent = winner === 'x' ? '×' : '○';
      ui.turnCard.dataset.player = 'finished';
      ui.turnSymbol.textContent = '✓';
      ui.turnLabel.textContent = `Vitória de ${playerName(winner)}`;
    } else if (state.outcome?.type === 'draw') {
      ui.statusCard.dataset.result = 'draw';
      ui.status.textContent = 'Deu velha!';
      ui.statusDetail.textContent = 'As nove casas foram preenchidas. A próxima rodada começa com o outro jogador.';
      ui.statusMark.textContent = '½';
      ui.turnCard.dataset.player = 'finished';
      ui.turnSymbol.textContent = '½';
      ui.turnLabel.textContent = 'Rodada empatada';
    } else {
      ui.status.textContent = state.mode === 'computer' && state.current === 'o' ? 'O computador está pensando…' : state.mode === 'computer' ? 'Sua vez de jogar' : `Vez do jogador ${playerName(state.current)}`;
      ui.statusDetail.textContent = `${state.board.filter(Boolean).length ? state.mode === 'computer' && state.current === 'o' ? 'O computador está escolhendo uma casa.' : 'Escolha uma casa vazia para continuar.' : `${playerName(state.current)} começa esta rodada.`}`;
      ui.statusMark.textContent = state.current === 'x' ? '×' : '○';
      ui.turnCard.dataset.player = state.current;
      ui.turnSymbol.textContent = state.current === 'x' ? '×' : '○';
      ui.turnLabel.textContent = state.mode === 'computer' ? playerName(state.current) : `Jogador ${playerName(state.current)}`;
    }
    ui.undo.disabled = state.undoStack.length === 0;
    ui.newRound.textContent = state.outcome ? '＋ Próxima rodada' : '＋ Nova rodada';
    const scores = modeScores();
    const completedRounds = scores.x + scores.o + scores.draws;
    ui.roundLabel.textContent = `Rodada ${Math.max(1,completedRounds + (state.outcome ? 0 : 1))} · ${playerName(state.starter)} começa`;
    ui.resultOverlay.hidden = !state.outcome;
    if (state.outcome?.type === 'win') {
      ui.resultTitle.textContent = state.mode === 'computer' ? `${playerName(state.outcome.winner)} ganhou!` : `Jogador ${playerName(state.outcome.winner)} ganhou!`;
      ui.resultScore.textContent = `Venceu esta rodada com três símbolos em linha.`;
      ui.resultBreakdown.textContent = `Placar geral: ${state.mode === 'computer' ? `Você ${scores.x}  ·  Computador ${scores.o}` : `X ${scores.x}  ·  O ${scores.o}`}  ·  Empates ${scores.draws}`;
    } else if (state.outcome?.type === 'draw') {
      ui.resultTitle.textContent = 'Deu velha!';
      ui.resultScore.textContent = 'Esta rodada terminou empatada.';
      ui.resultBreakdown.textContent = `Placar geral: ${state.mode === 'computer' ? `Você ${scores.x}  ·  Computador ${scores.o}` : `X ${scores.x}  ·  O ${scores.o}`}  ·  Empates ${scores.draws}`;
    }
  }
  function render() {
    renderBoard();
    renderPlayers();
    renderStatus();
    renderHistory();
  }
  function startRound(starter) {
    window.clearTimeout(computerTimer);
    computerTimer = 0;
    state.board = Array(9).fill(null);
    state.starter = starter;
    state.current = starter;
    state.outcome = null;
    state.winningCells = [];
    state.history = [];
    state.undoStack = [];
    state.focusSquare = 4;
    render();
    if (state.mode === 'computer' && starter === 'o') queueComputerMove();
    else cells[state.focusSquare].focus({ preventScroll:true });
  }
  function startLocalGame() {
    state.mode = 'local';
    state.started = true;
    lobby.hidden = true;
    gameView.hidden = false;
    startRound('x');
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
  }
  function startComputerGame() {
    state.mode = 'computer';
    state.started = true;
    lobby.hidden = true;
    gameView.hidden = false;
    startRound('x');
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
  }
  function boardWinner(board) {
    for (const line of winLines) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }
  function minimax(board, player, depth) {
    const winner = boardWinner(board);
    if (winner === 'o') return 10 - depth;
    if (winner === 'x') return depth - 10;
    const open = board.map((value,index) => value ? -1 : index).filter((index) => index >= 0);
    if (!open.length) return 0;
    const values = open.map((index) => {
      board[index] = player;
      const score = minimax(board,player === 'o' ? 'x' : 'o',depth + 1);
      board[index] = null;
      return score;
    });
    return player === 'o' ? Math.max(...values) : Math.min(...values);
  }
  function chooseComputerMove() {
    const open = state.board.map((value,index) => value ? -1 : index).filter((index) => index >= 0);
    const scored = open.map((index) => {
      state.board[index] = 'o';
      const score = minimax(state.board,'x',1);
      state.board[index] = null;
      return { index, score };
    });
    const bestScore = Math.max(...scored.map((entry) => entry.score));
    const best = scored.filter((entry) => entry.score === bestScore);
    return best[Math.floor(Math.random() * best.length)]?.index;
  }
  function queueComputerMove() {
    window.clearTimeout(computerTimer);
    if (!state.started || state.mode !== 'computer' || state.current !== 'o' || state.outcome) return;
    computerTimer = window.setTimeout(() => {
      computerTimer = 0;
      const move = chooseComputerMove();
      if (Number.isInteger(move)) playCell(move,true);
    },480);
  }
  function playCell(index, fromComputer = false) {
    if (!state.started || state.outcome || state.board[index] || (state.mode === 'computer' && state.current === 'o' && !fromComputer)) return;
    recordSnapshot();
    const player = state.current;
    state.board[index] = player;
    state.history.push({ player, square:index });
    state.focusSquare = index;
    const line = getWinningLine();
    if (line) {
      state.outcome = { type:'win', winner:player };
      state.winningCells = line;
      const scoreKey = state.mode === 'computer' ? player === 'x' ? 'cpuX' : 'cpuO' : player;
      state.scores[scoreKey] += 1;
      saveScores();
      window.CV_GAME_AUDIO?.playTone(player === 'x' ? 620 : 520, .12, 'triangle', .05);
      window.CV_GAME_AUDIO?.playTone(800, .2, 'sine', .04);
    } else if (state.board.every(Boolean)) {
      state.outcome = { type:'draw' };
      state.scores[state.mode === 'computer' ? 'cpuDraws' : 'draws'] += 1;
      saveScores();
      window.CV_GAME_AUDIO?.playTone(320, .16, 'sine', .035);
    } else state.current = player === 'x' ? 'o' : 'x';
    if (!state.outcome) window.CV_GAME_AUDIO?.playTone(player === 'x' ? 480 : 360, .065, 'sine', .035);
    render();
    if (state.outcome) ui.resultNextRound.focus({ preventScroll:true });
    else if (state.mode === 'computer' && state.current === 'o') queueComputerMove();
    else cells[index].focus({ preventScroll:true });
  }
  function startNextRound() { startRound(state.starter === 'x' ? 'o' : 'x'); }
  async function newRound() {
    if (state.history.length && !state.outcome && !await window.CV_GAMES_DIALOG.confirm({
      title:'Começar outra rodada?', message:'A rodada atual será encerrada sem alterar o placar.',
      confirmText:'Começar rodada', cancelText:'Continuar jogando'
    })) return;
    startNextRound();
  }
  function undoMove() {
    const computerWasWaiting = Boolean(computerTimer);
    window.clearTimeout(computerTimer);
    computerTimer = 0;
    const removeComputerReply = state.mode === 'computer' && !computerWasWaiting && state.history.at(-1)?.player === 'o' && state.history.length > 1;
    const snapshot = state.undoStack.pop();
    if (!snapshot) {
      if (state.mode === 'computer' && state.current === 'o' && !state.outcome) queueComputerMove();
      return;
    }
    if (state.outcome?.type === 'win') {
      const scoreKey = state.mode === 'computer' ? state.outcome.winner === 'x' ? 'cpuX' : 'cpuO' : state.outcome.winner;
      state.scores[scoreKey] = Math.max(0,state.scores[scoreKey] - 1);
    }
    if (state.outcome?.type === 'draw') {
      const scoreKey = state.mode === 'computer' ? 'cpuDraws' : 'draws';
      state.scores[scoreKey] = Math.max(0,state.scores[scoreKey] - 1);
    }
    state.board = snapshot.board;
    state.current = snapshot.current;
    state.outcome = snapshot.outcome;
    state.winningCells = snapshot.winningCells;
    state.history = snapshot.history;
    state.focusSquare = snapshot.focusSquare;
    if (removeComputerReply) {
      const previous = state.undoStack.pop();
      if (previous) {
        state.board = previous.board;
        state.current = previous.current;
        state.outcome = previous.outcome;
        state.winningCells = previous.winningCells;
        state.history = previous.history;
        state.focusSquare = previous.focusSquare;
      }
    }
    saveScores();
    render();
    if (state.mode === 'computer' && state.current === 'o' && !state.outcome) queueComputerMove();
    else cells[state.focusSquare].focus({ preventScroll:true });
  }
  async function resetScores() {
    if (!await window.CV_GAMES_DIALOG.confirm({
      title:'Zerar o placar?', message:'Os placares dos dois modos e os empates serão apagados deste dispositivo.',
      confirmText:'Zerar placar', cancelText:'Manter placar', tone:'danger'
    })) return;
    state.scores = { x:0, o:0, draws:0, cpuX:0, cpuO:0, cpuDraws:0 };
    saveScores();
    renderPlayers();
    renderStatus();
  }
  function readFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem('cv-games-favorites') || '[]');
      return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
    } catch { return new Set(); }
  }
  function updateFavorite() {
    if (!ui.favorite) return;
    const favorites = readFavorites();
    const active = favorites.has(gameId);
    const icon = ui.favorite.querySelector('.favorite-icon');
    const label = ui.favorite.querySelector('[data-favorite-label]');
    const count = ui.favorite.querySelector('[data-favorite-count]');
    ui.favorite.setAttribute('aria-pressed',String(active));
    ui.favorite.setAttribute('aria-label',`${active ? 'Remover' : 'Adicionar'} CV JOGO DA VELHA ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    if (icon) icon.textContent = active ? '♥' : '♡';
    if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(favorites.size);
  }
  function toggleFavorite() {
    const favorites = readFavorites();
    if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem('cv-games-favorites',JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch { /* Favoritos são opcionais. */ }
    updateFavorite();
  }
  function prepareMenu() {
    const menuButton = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click',() => {
      const open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded',String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click',() => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded','false');
    }));
  }

  boardElement.addEventListener('click',(event) => {
    const button = event.target.closest('[data-cell]');
    if (button) playCell(Number(button.dataset.cell));
  });
  boardElement.addEventListener('keydown',(event) => {
    const button = event.target.closest('[data-cell]');
    if (!button || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const index = Number(button.dataset.cell);
    let row = Math.floor(index / 3);
    let col = index % 3;
    const [dr,dc] = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[event.key];
    row += dr; col += dc;
    if (row >= 0 && row < 3 && col >= 0 && col < 3) {
      state.focusSquare = row * 3 + col;
      cells.forEach((cell,cellIndex) => { cell.tabIndex = cellIndex === state.focusSquare ? 0 : -1; });
      cells[state.focusSquare].focus();
    }
  });
  ui.start.addEventListener('click',startLocalGame);
  ui.startComputer.addEventListener('click',startComputerGame);
  ui.undo.addEventListener('click',undoMove);
  ui.resetScores.addEventListener('click',resetScores);
  ui.newRound.addEventListener('click',newRound);
  ui.resultNextRound.addEventListener('click',startNextRound);
  ui.favorite?.addEventListener('click',toggleFavorite);
  function syncThemeButton() {
    const button = $('[data-theme-toggle]');
    if (!button) return;
    const dark = document.documentElement.dataset.theme !== 'light';
    button.setAttribute('aria-label',dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    button.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
    button.textContent = dark ? '🌙' : '☀️';
  }
  $('[data-theme-toggle]')?.addEventListener('click',() => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try { localStorage.setItem('cv-games-theme',nextTheme); } catch { /* O tema continua aplicado nesta página. */ }
    syncThemeButton();
  });
  document.addEventListener('keydown',(event) => {
    if (event.key.toLowerCase() === 'u' && state.started && !event.repeat && !event.ctrlKey && !event.metaKey) undoMove();
  });

  prepareMenu();
  createBoard();
  updateFavorite();
  syncThemeButton();
})();
