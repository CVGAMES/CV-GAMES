(function () {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const gameId = 'cv-damas';
  const files = 'abcdefgh';
  const settingsKey = 'cv-games-checkers-settings-v1';
  const favoriteKey = 'cv-games-favorites';
  const defaultSettings = { rotate:true, showMoves:true, coordinates:true };
  const lobby = $('[data-lobby]');
  const gameView = $('[data-game-view]');
  const boardElement = $('[data-board]');
  const boardStack = $('[data-board-stack]');
  const settingsDialog = $('[data-settings-dialog]');
  const ui = {
    start:$('[data-start-local]'), turnLabel:$('[data-turn-label]'), turnPanel:$('[data-live-turn]'),
    status:$('[data-game-status]'), statusDetail:$('[data-status-detail]'), statusCard:$('.checkers-status-card'), statusIcon:$('[data-status-icon]'),
    undo:$('[data-undo]'), resign:$('[data-resign]'), newGame:$('[data-new-game]'), settingsOpen:$('[data-settings-open]'), settingsClose:$('[data-settings-close]'),
    moveList:$('[data-move-list]'), moveCount:$('[data-move-count]'), whiteCaptured:$('[data-white-captured]'), blackCaptured:$('[data-black-captured]'),
    whiteMaterial:$('[data-white-material]'), blackMaterial:$('[data-black-material]'), favorite:$('[data-game-favorite]'),
    resultOverlay:$('[data-result-overlay]'), resultTitle:$('[data-result-title]'), resultDetail:$('[data-result-detail]'), resultNewGame:$('[data-result-new-game]')
  };

  const state = {
    board:createInitialBoard(), turn:'w', started:false, selected:null, focusSquare:61,
    legalRoutes:[], continuation:null, pendingMove:null, lastMove:null, moveLog:[], turnNumber:1,
    undoStack:[], capturedBy:{ w:[], b:[] }, outcome:null, settings:readSettings()
  };
  const squareButtons = [];

  function createInitialBoard() {
    const board = Array(64).fill(null);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[row * 8 + col] = 'b';
    }
    for (let row = 5; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[row * 8 + col] = 'w';
    }
    return board;
  }
  function readSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(settingsKey) || '{}');
      return Object.fromEntries(Object.keys(defaultSettings).map((key) => [key, typeof stored[key] === 'boolean' ? stored[key] : defaultSettings[key]]));
    } catch { return { ...defaultSettings }; }
  }
  function saveSettings() {
    try { localStorage.setItem(settingsKey, JSON.stringify(state.settings)); } catch { /* Preferências continuam nesta sessão. */ }
  }
  const rowOf = (square) => Math.floor(square / 8);
  const colOf = (square) => square % 8;
  const inside = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;
  const colorOf = (piece) => piece ? piece.toLowerCase() : null;
  const isKing = (piece) => piece === 'W' || piece === 'B';
  const opponent = (color) => color === 'w' ? 'b' : 'w';
  const sideName = (color) => color === 'w' ? 'Brancas' : 'Pretas';
  const sideLower = (color) => color === 'w' ? 'brancas' : 'pretas';
  const squareName = (square) => `${files[colOf(square)]}${8 - rowOf(square)}`;
  const isFinished = () => Boolean(state.outcome);

  function makeBoard() {
    const fragment = document.createDocumentFragment();
    for (let square = 0; square < 64; square += 1) {
      const row = rowOf(square);
      const col = colOf(square);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `checkers-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      button.dataset.square = String(square);
      button.setAttribute('role', 'gridcell');
      button.tabIndex = square === state.focusSquare ? 0 : -1;
      const piece = document.createElement('span');
      piece.className = 'checkers-piece';
      piece.setAttribute('aria-hidden', 'true');
      button.append(piece);
      fragment.append(button);
      squareButtons.push(button);
    }
    boardElement.replaceChildren(fragment);
  }

  function captureSteps(board, from, piece) {
    const moves = [];
    const color = colorOf(piece);
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let row = rowOf(from) + dr;
      let col = colOf(from) + dc;
      if (!isKing(piece)) {
        if (!inside(row, col)) continue;
        const victim = row * 8 + col;
        const landingRow = row + dr;
        const landingCol = col + dc;
        if (!inside(landingRow, landingCol)) continue;
        const landing = landingRow * 8 + landingCol;
        if (colorOf(board[victim]) === opponent(color) && !board[landing]) moves.push({ from, to:landing, captured:victim });
        continue;
      }

      let victim = -1;
      while (inside(row, col)) {
        const square = row * 8 + col;
        const occupant = board[square];
        if (occupant) {
          if (victim !== -1 || colorOf(occupant) === color) break;
          victim = square;
        } else if (victim !== -1) {
          moves.push({ from, to:square, captured:victim });
        }
        row += dr;
        col += dc;
      }
    }
    return moves;
  }

  function captureSequences(board, from, piece, prefix = []) {
    const possible = captureSteps(board, from, piece);
    if (!possible.length) return prefix.length ? [{ steps:prefix }] : [];
    const routes = [];
    for (const step of possible) {
      const nextBoard = board.slice();
      nextBoard[step.from] = null;
      nextBoard[step.captured] = null;
      nextBoard[step.to] = piece;
      const nextPrefix = [...prefix, step];
      const reachesKingRow = !isKing(piece) && rowOf(step.to) === (colorOf(piece) === 'w' ? 0 : 7);
      if (reachesKingRow) {
        routes.push({ steps:nextPrefix });
      } else {
        const continuations = captureSequences(nextBoard, step.to, piece, nextPrefix);
        if (continuations.length) routes.push(...continuations);
        else routes.push({ steps:nextPrefix });
      }
    }
    return routes;
  }

  function quietSteps(board, from, piece) {
    const moves = [];
    const color = colorOf(piece);
    const directions = isKing(piece)
      ? [[-1,-1],[-1,1],[1,-1],[1,1]]
      : [[color === 'w' ? -1 : 1,-1],[color === 'w' ? -1 : 1,1]];
    for (const [dr, dc] of directions) {
      let row = rowOf(from) + dr;
      let col = colOf(from) + dc;
      while (inside(row, col)) {
        const to = row * 8 + col;
        if (board[to]) break;
        moves.push({ from, to, captured:null });
        if (!isKing(piece)) break;
        row += dr;
        col += dc;
      }
    }
    return moves;
  }

  function legalRoutes(board, color) {
    const captures = [];
    for (let square = 0; square < 64; square += 1) {
      const piece = board[square];
      if (colorOf(piece) === color) captures.push(...captureSequences(board, square, piece));
    }
    if (captures.length) {
      const longest = Math.max(...captures.map((route) => route.steps.length));
      return captures.filter((route) => route.steps.length === longest);
    }
    const quiet = [];
    for (let square = 0; square < 64; square += 1) {
      const piece = board[square];
      if (colorOf(piece) === color) quietSteps(board, square, piece).forEach((step) => quiet.push({ steps:[step] }));
    }
    return quiet;
  }

  function countPieces(color) { return state.board.reduce((count, piece) => count + (colorOf(piece) === color ? 1 : 0), 0); }
  function routesForSelection() {
    if (state.continuation) return state.continuation.routes;
    if (state.selected === null) return [];
    return state.legalRoutes.filter((route) => route.steps[0].from === state.selected);
  }
  function currentStepIndex() { return state.continuation ? state.continuation.stepIndex : 0; }

  function clearSquareDecorations(button) {
    button.classList.remove('is-selected','is-legal','is-capture','is-last-move');
    button.querySelectorAll('.square-coordinate').forEach((label) => label.remove());
  }
  function renderCoordinates(button, square, flipped) {
    if (!state.settings.coordinates) return;
    const row = rowOf(square);
    const col = colOf(square);
    const fileOnEdge = flipped ? row === 0 : row === 7;
    const rankOnEdge = flipped ? col === 7 : col === 0;
    if (fileOnEdge) {
      const file = document.createElement('span');
      file.className = `square-coordinate file${flipped ? ' file-edge-flipped' : ''}`;
      file.textContent = files[col];
      file.setAttribute('aria-hidden','true');
      button.append(file);
    }
    if (rankOnEdge) {
      const rank = document.createElement('span');
      rank.className = `square-coordinate rank${flipped ? ' rank-edge-flipped' : ''}`;
      rank.textContent = String(8 - row);
      rank.setAttribute('aria-hidden','true');
      button.append(rank);
    }
  }

  function renderBoard() {
    const flipped = state.settings.rotate && state.turn === 'b';
    boardElement.classList.toggle('is-flipped', flipped);
    boardStack.dataset.bottomSide = flipped ? 'black' : 'white';
    const options = routesForSelection();
    const stepIndex = currentStepIndex();
    const destinations = new Map();
    options.forEach((route) => {
      const step = route.steps[stepIndex];
      if (!step) return;
      const info = destinations.get(step.to) || { capture:false };
      info.capture ||= step.captured !== null;
      destinations.set(step.to, info);
    });
    const lastPath = state.lastMove?.path || [];
    for (let square = 0; square < 64; square += 1) {
      const button = squareButtons[square];
      const piece = state.board[square];
      clearSquareDecorations(button);
      const token = button.querySelector('.checkers-piece');
      token.classList.toggle('white', colorOf(piece) === 'w');
      token.classList.toggle('black', colorOf(piece) === 'b');
      token.classList.toggle('is-king', isKing(piece));
      token.innerHTML = piece ? '<span class="checkers-pip"></span>' + (isKing(piece) ? '<span class="checkers-crown">♛</span>' : '') : '';
      button.setAttribute('aria-label', `${squareName(square)}, ${piece ? `${sideName(colorOf(piece))}${isKing(piece) ? ' dama' : ' peça'}` : 'casa vazia'}`);
      if (square === state.selected) button.classList.add('is-selected');
      if (lastPath.includes(square)) button.classList.add('is-last-move');
      const target = destinations.get(square);
      if (target && state.settings.showMoves) {
        button.classList.add('is-legal');
        if (target.capture) button.classList.add('is-capture');
      }
      renderCoordinates(button, square, flipped);
      button.tabIndex = square === state.focusSquare ? 0 : -1;
    }
  }

  function renderCaptured(color, element, totalElement) {
    const pieces = state.capturedBy[color];
    if (pieces.length) {
      element.replaceChildren(...pieces.map((piece) => {
        const token = document.createElement('span');
        token.className = `captured-piece ${colorOf(piece) === 'w' ? 'white' : 'black'}`;
        token.textContent = '●';
        token.setAttribute('aria-hidden','true');
        return token;
      }));
    } else element.textContent = '—';
    element.setAttribute('aria-label', `Peças capturadas pelas ${sideLower(color)}: ${pieces.length}`);
    totalElement.textContent = pieces.length ? `+${pieces.length}` : '—';
  }

  function renderSeats() {
    for (const color of ['w','b']) {
      const name = color === 'w' ? 'white' : 'black';
      const card = $(`[data-player-card="${name}"]`);
      card.classList.toggle('is-active', state.started && !isFinished() && state.turn === color);
      const text = $(`[data-${name}-state]`);
      if (text) text.textContent = isFinished() ? 'Partida encerrada' : !state.started ? (color === 'w' ? 'Jogam primeiro' : 'Esperando a vez') : state.turn === color ? 'Sua vez de jogar' : 'Esperando a vez';
    }
    renderCaptured('w', ui.whiteCaptured, ui.whiteMaterial);
    renderCaptured('b', ui.blackCaptured, ui.blackMaterial);
    ui.turnPanel.dataset.turn = state.turn;
  }

  function renderStatus() {
    ui.statusCard.classList.remove('is-check','is-finished');
    let title = `Vez das ${sideLower(state.turn)}`;
    let detail = state.continuation ? 'Continue a captura com a mesma peça.' : state.legalRoutes.some((route) => route.steps[0].captured !== null) ? 'Captura obrigatória: escolha uma peça marcada.' : 'Escolha uma peça para ver seus movimentos.';
    let icon = state.turn === 'w' ? '●' : '◉';
    if (state.outcome?.type === 'win') {
      title = `Vitória das ${sideLower(state.outcome.winner)}`;
      detail = state.outcome.reason;
      icon = '🏆';
      ui.statusCard.classList.add('is-finished');
    } else if (state.outcome?.type === 'resignation') {
      title = `Vitória das ${sideLower(state.outcome.winner)}`;
      detail = `${sideName(state.outcome.loser)} desistiram da partida.`;
      icon = '⚑';
      ui.statusCard.classList.add('is-finished');
    }
    ui.status.textContent = title;
    ui.statusDetail.textContent = detail;
    ui.statusIcon.textContent = icon;
    ui.turnLabel.textContent = state.started ? (isFinished() ? title : `Vez das ${sideLower(state.turn)}`) : 'Aguardando partida';
    ui.resultOverlay.hidden = !isFinished();
    if (isFinished()) {
      ui.resultTitle.textContent = state.outcome.winner ? `Vitória das ${sideName(state.outcome.winner)}` : title;
      ui.resultDetail.textContent = detail;
    }
    ui.undo.disabled = state.undoStack.length === 0;
    ui.resign.disabled = !state.started || isFinished();
    ui.newGame.disabled = !state.started;
  }

  function renderHistory() {
    ui.moveCount.textContent = `${state.moveLog.length} ${state.moveLog.length === 1 ? 'lance' : 'lances'}`;
    if (!state.moveLog.length) {
      const empty = document.createElement('p');
      empty.className = 'checkers-empty-history';
      empty.textContent = 'A partida começa. Brancas jogam primeiro.';
      ui.moveList.replaceChildren(empty);
      return;
    }
    const grouped = new Map();
    state.moveLog.forEach((move) => {
      if (!grouped.has(move.number)) grouped.set(move.number, {});
      grouped.get(move.number)[move.color] = move.notation;
    });
    const rows = [];
    for (const [number, moves] of grouped) {
      const row = document.createElement('div');
      row.className = `checkers-move-row${number === state.moveLog[state.moveLog.length - 1].number ? ' is-latest' : ''}`;
      const label = document.createElement('span'); label.className = 'checkers-move-number'; label.textContent = `${number}.`;
      const white = document.createElement('span'); white.className = 'checkers-move-san'; white.textContent = moves.w || '';
      const black = document.createElement('span'); black.className = 'checkers-move-san'; black.textContent = moves.b || '';
      row.append(label, white, black);
      rows.push(row);
    }
    ui.moveList.replaceChildren(...rows);
    ui.moveList.scrollTop = ui.moveList.scrollHeight;
  }

  function render() {
    renderBoard();
    renderSeats();
    renderStatus();
    renderHistory();
  }

  function saveSnapshot() {
    state.undoStack.push({
      board:[...state.board], turn:state.turn, selected:state.selected, focusSquare:state.focusSquare,
      legalRoutes:state.legalRoutes.map((route) => ({ steps:route.steps.map((step) => ({ ...step })) })),
      lastMove:state.lastMove ? { path:[...state.lastMove.path] } : null,
      moveLog:state.moveLog.map((move) => ({ ...move })), turnNumber:state.turnNumber,
      capturedBy:{ w:[...state.capturedBy.w], b:[...state.capturedBy.b] }, outcome:state.outcome ? { ...state.outcome } : null
    });
  }

  function playTone(frequency, duration, type, volume) {
    window.CV_GAME_AUDIO?.playTone(frequency, duration, type, volume);
  }

  function finishTurn() {
    const move = state.pendingMove;
    if (!move) return;
    const finalSquare = move.steps[move.steps.length - 1].to;
    const piece = state.board[finalSquare];
    let promoted = false;
    if (piece === 'w' && rowOf(finalSquare) === 0) { state.board[finalSquare] = 'W'; promoted = true; }
    else if (piece === 'b' && rowOf(finalSquare) === 7) { state.board[finalSquare] = 'B'; promoted = true; }
    const path = [move.from, ...move.steps.map((step) => step.to)];
    const separator = move.captured.length ? ' × ' : ' – ';
    const notation = path.map((square) => squareName(square)).join(separator) + (promoted ? ' ♛' : '');
    state.lastMove = { path };
    state.moveLog.push({ color:move.color, number:state.turnNumber, notation });
    state.focusSquare = finalSquare;
    state.pendingMove = null;
    state.continuation = null;
    state.selected = null;
    state.turn = opponent(move.color);
    if (move.color === 'b') state.turnNumber += 1;
    state.legalRoutes = legalRoutes(state.board, state.turn);
    if (countPieces(state.turn) === 0) {
      state.outcome = { type:'win', winner:move.color, reason:`${sideName(state.turn)} ficaram sem peças.` };
    } else if (!state.legalRoutes.length) {
      state.outcome = { type:'win', winner:move.color, reason:`${sideName(state.turn)} não têm movimentos legais.` };
    }
    playTone(move.captured.length ? 245 : 420, move.captured.length ? .12 : .07, move.captured.length ? 'triangle' : 'sine', move.captured.length ? .055 : .035);
    if (promoted) playTone(720, .2, 'triangle', .05);
    render();
    if (isFinished()) {
      playTone(620, .24, 'triangle', .05);
      ui.resultNewGame.focus({ preventScroll:true });
    } else squareButtons[state.focusSquare].focus({ preventScroll:true });
  }

  function executeStep(routes, stepIndex) {
    const step = routes[0].steps[stepIndex];
    if (!step) return;
    if (!state.pendingMove) {
      saveSnapshot();
      state.pendingMove = { color:state.turn, from:step.from, steps:[], captured:[] };
    }
    const piece = state.board[step.from];
    state.board[step.from] = null;
    state.board[step.to] = piece;
    state.pendingMove.steps.push({ ...step });
    if (step.captured !== null) {
      state.pendingMove.captured.push(state.board[step.captured]);
      state.capturedBy[state.turn].push(state.board[step.captured]);
      state.board[step.captured] = null;
    }
    state.lastMove = { path:[state.pendingMove.from, ...state.pendingMove.steps.map((item) => item.to)] };
    state.focusSquare = step.to;
    const nextIndex = stepIndex + 1;
    const continuingRoutes = routes.filter((route) => route.steps.length > nextIndex);
    if (step.captured !== null && continuingRoutes.length) {
      state.selected = step.to;
      state.continuation = { routes:continuingRoutes, stepIndex:nextIndex };
      state.legalRoutes = continuingRoutes;
      playTone(260, .1, 'triangle', .05);
      render();
      squareButtons[state.focusSquare].focus({ preventScroll:true });
      return;
    }
    finishTurn();
  }

  function selectSquare(square) {
    if (!state.started || isFinished()) return;
    state.focusSquare = square;
    const routes = routesForSelection();
    const stepIndex = currentStepIndex();
    if (routes.length) {
      const matching = routes.filter((route) => route.steps[stepIndex]?.to === square);
      if (matching.length) { executeStep(matching, stepIndex); return; }
    }
    if (state.continuation) {
      renderBoard();
      return;
    }
    const piece = state.board[square];
    if (colorOf(piece) === state.turn) {
      const pieceRoutes = state.legalRoutes.filter((route) => route.steps[0].from === square);
      state.selected = pieceRoutes.length ? (state.selected === square ? null : square) : null;
    } else state.selected = null;
    renderBoard();
  }

  function startLocalGame() {
    state.board = createInitialBoard();
    state.turn = 'w';
    state.selected = null;
    state.focusSquare = 61;
    state.legalRoutes = legalRoutes(state.board, state.turn);
    state.continuation = null;
    state.pendingMove = null;
    state.lastMove = null;
    state.moveLog = [];
    state.turnNumber = 1;
    state.undoStack = [];
    state.capturedBy = { w:[], b:[] };
    state.outcome = null;
    state.started = true;
    lobby.hidden = true;
    gameView.hidden = false;
    render();
    squareButtons[state.focusSquare].focus({ preventScroll:true });
  }

  async function newGame() {
    if ((state.moveLog.length || state.pendingMove) && !await window.CV_GAMES_DIALOG.confirm({
      title:'Começar outra partida?', message:'A partida atual será encerrada e o tabuleiro voltará à posição inicial.',
      confirmText:'Nova partida', cancelText:'Continuar jogando'
    })) return;
    startLocalGame();
  }

  function undoMove() {
    const snapshot = state.undoStack.pop();
    if (!snapshot) return;
    state.board = snapshot.board;
    state.turn = snapshot.turn;
    state.selected = snapshot.selected;
    state.focusSquare = snapshot.focusSquare;
    state.legalRoutes = snapshot.legalRoutes;
    state.continuation = null;
    state.pendingMove = null;
    state.lastMove = snapshot.lastMove;
    state.moveLog = snapshot.moveLog;
    state.turnNumber = snapshot.turnNumber;
    state.capturedBy = snapshot.capturedBy;
    state.outcome = snapshot.outcome;
    render();
    squareButtons[state.focusSquare].focus({ preventScroll:true });
  }

  async function resign() {
    if (isFinished() || !state.started) return;
    const current = state.turn;
    if (!await window.CV_GAMES_DIALOG.confirm({
      title:'Desistir da partida?', message:`As ${sideLower(current)} querem desistir? A vitória será das ${sideLower(opponent(current))}.`,
      confirmText:'Desistir', cancelText:'Continuar jogando', tone:'danger'
    })) return;
    state.outcome = { type:'resignation', loser:current, winner:opponent(current) };
    state.continuation = null;
    state.pendingMove = null;
    state.selected = null;
    render();
    ui.resultNewGame.focus({ preventScroll:true });
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  function loadSettings() {
    document.querySelectorAll('[data-setting-rotate]').forEach((input) => { input.checked = state.settings.rotate; });
    document.querySelectorAll('[data-setting-moves]').forEach((input) => { input.checked = state.settings.showMoves; });
    document.querySelectorAll('[data-setting-coordinates]').forEach((input) => { input.checked = state.settings.coordinates; });
  }
  function updateSetting(event) {
    const input = event.currentTarget;
    const key = Object.entries({ '[data-setting-rotate]':'rotate', '[data-setting-moves]':'showMoves', '[data-setting-coordinates]':'coordinates' }).find(([selector]) => input.matches(selector))?.[1];
    if (!key) return;
    state.settings[key] = input.checked;
    saveSettings();
    loadSettings();
    renderBoard();
  }

  function readFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : []);
    } catch { return new Set(); }
  }
  function updateFavorite() {
    const favorites = readFavorites();
    const active = favorites.has(gameId);
    const icon = ui.favorite.querySelector('.favorite-icon');
    const label = ui.favorite.querySelector('[data-favorite-label]');
    const count = ui.favorite.querySelector('[data-favorite-count]');
    ui.favorite.setAttribute('aria-pressed', String(active));
    ui.favorite.setAttribute('aria-label', `${active ? 'Remover' : 'Adicionar'} CV DAMAS ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    if (icon) icon.textContent = active ? '♥' : '♡';
    if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(favorites.size);
  }
  function toggleFavorite() {
    const favorites = readFavorites();
    if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem(favoriteKey, JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch { /* Favoritos são opcionais. */ }
    updateFavorite();
  }

  function prepareMenu() {
    const button = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
    if (!button || !menu) return;
    button.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }));
  }

  boardElement.addEventListener('click', (event) => {
    const button = event.target.closest('[data-square]');
    if (button) selectSquare(Number(button.dataset.square));
  });
  boardElement.addEventListener('keydown', (event) => {
    const button = event.target.closest('[data-square]');
    if (!button || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const square = Number(button.dataset.square);
    let row = rowOf(square);
    let col = colOf(square);
    const direction = boardElement.classList.contains('is-flipped') ? -1 : 1;
    const vector = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[event.key];
    row += vector[0] * direction;
    col += vector[1] * direction;
    if (inside(row, col)) {
      state.focusSquare = row * 8 + col;
      squareButtons[square].tabIndex = -1;
      squareButtons[state.focusSquare].tabIndex = 0;
      squareButtons[state.focusSquare].focus();
    }
  });

  ui.start.addEventListener('click', startLocalGame);
  ui.undo.addEventListener('click', undoMove);
  ui.resign.addEventListener('click', resign);
  ui.newGame.addEventListener('click', newGame);
  ui.resultNewGame.addEventListener('click', startLocalGame);
  ui.settingsOpen.addEventListener('click', () => { loadSettings(); if (settingsDialog.showModal) settingsDialog.showModal(); else settingsDialog.setAttribute('open',''); });
  ui.settingsClose.addEventListener('click', () => closeDialog(settingsDialog));
  for (const selector of ['[data-setting-rotate]','[data-setting-moves]','[data-setting-coordinates]']) document.querySelectorAll(selector).forEach((input) => input.addEventListener('change', updateSetting));
  settingsDialog.addEventListener('click', (event) => { if (event.target === settingsDialog) closeDialog(settingsDialog); });
  ui.favorite.addEventListener('click', toggleFavorite);
  function syncThemeButton() {
    const button = $('[data-theme-toggle]');
    if (!button) return;
    const dark = document.documentElement.dataset.theme !== 'light';
    button.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    button.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
    button.textContent = dark ? '🌙' : '☀️';
  }
  $('[data-theme-toggle]')?.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try { localStorage.setItem('cv-games-theme', nextTheme); } catch { /* Tema aplicado nesta página. */ }
    syncThemeButton();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'u' && state.started && !event.repeat && !event.ctrlKey && !event.metaKey) undoMove();
    if (event.key === 'Escape' && settingsDialog.open) closeDialog(settingsDialog);
  });

  loadSettings();
  prepareMenu();
  makeBoard();
  render();
  updateFavorite();
  syncThemeButton();
})();
