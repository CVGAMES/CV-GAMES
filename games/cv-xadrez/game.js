(function () {
  'use strict';

  const Chess = window.CV_CHESS_ENGINE;
  if (!Chess) return;
  const $ = (selector) => document.querySelector(selector);
  const boardElement = $('[data-board]');
  const lobby = $('[data-lobby]');
  const gameView = $('[data-game-view]');
  const boardStack = $('[data-board-stack]');
  const settingsDialog = $('[data-settings-dialog]');
  const promotionDialog = $('[data-promotion-dialog]');
  const modeChoices = $('[data-mode-choices]');
  const difficultyPicker = $('[data-ai-difficulty-picker]');
  const lobbyCopy = $('[data-lobby-copy]');
  const lobbyFootnote = $('[data-lobby-footnote]');
  const difficultyBack = $('[data-difficulty-back]');
  const settingsKey = 'cv-games-chess-settings-v2';
  const legacySettingsKey = 'cv-games-chess-settings-v1';
  const favoriteKey = 'cv-games-favorites';
  const gameId = 'cv-xadrez';
  const symbols = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
  };
  const names = { K:'rei', Q:'dama', R:'torre', B:'bispo', N:'cavalo', P:'peão' };
  const materialValues = { Q:9, R:5, B:3, N:3, P:1, K:0 };
  const searchValues = { Q:900, R:500, B:330, N:320, P:100, K:0 };
  const mateScore = 100000;
  const defaultSettings = { rotate:false, showMoves:true, coordinates:true };

  const ui = {
    startLocal:$('[data-start-local]'), startComputer:$('[data-start-computer]'), turnLabel:$('[data-turn-label]'), turnPanel:$('[data-live-turn]'),
    status:$('[data-game-status]'), statusDetail:$('[data-status-detail]'), statusCard:$('.chess-status-card'), statusIcon:$('[data-status-icon]'),
    undo:$('[data-undo]'), drawClaim:$('[data-draw-claim]'), resign:$('[data-resign]'), newGame:$('[data-new-game]'),
    settingsOpen:$('[data-settings-open]'), settingsClose:$('[data-settings-close]'),
    moveList:$('[data-move-list]'), moveCount:$('[data-move-count]'), whiteCaptured:$('[data-white-captured]'), blackCaptured:$('[data-black-captured]'),
    whiteMaterial:$('[data-white-material]'), blackMaterial:$('[data-black-material]'),
    favorite:$('[data-game-favorite]'), aiLevelBadge:$('[data-ai-level-badge]'),
    whiteName:$('[data-white-name]'), blackName:$('[data-black-name]'),
    resultOverlay:$('[data-result-overlay]'), resultTitle:$('[data-result-title]'), resultDetail:$('[data-result-detail]'), resultNewGame:$('[data-result-new-game]')
  };
  const state = {
    position:Chess.createInitialPosition(), legalMoves:[], selected:null, lastMove:null, outcome:null, focusSquare:60,
    moveLog:[], undoStack:[], repetitions:new Map(), capturedBy:{ w:[], b:[] },
    settings:readSettings(), promotionMove:null, started:false,
    mode:'local', difficulty:window.CV_GAMES_AI_DIFFICULTY?.get(gameId) || 'medium', computerThinking:false, drag:null
  };
  const squareButtons = [];
  let computerTimer = 0;
  let suppressNextDragClick = false;

  function readSettings() {
    try {
      const current = localStorage.getItem(settingsKey);
      const stored = JSON.parse(current || localStorage.getItem(legacySettingsKey) || '{}');
      const settings = { ...defaultSettings, ...Object.fromEntries(Object.keys(defaultSettings).map((key) => [key, typeof stored[key] === 'boolean' ? stored[key] : defaultSettings[key]])) };
      if (!current) {
        settings.rotate = false;
        localStorage.setItem(settingsKey,JSON.stringify(settings));
      }
      return settings;
    } catch { return { ...defaultSettings }; }
  }
  function saveSettings() {
    try { localStorage.setItem(settingsKey, JSON.stringify(state.settings)); } catch { /* Preferências continuam nesta sessão. */ }
  }
  function colorName(color) { return color === 'w' ? 'brancas' : 'pretas'; }
  function sideName(color) { return color === 'w' ? 'Brancas' : 'Pretas'; }
  function pieceDescription(piece) { return piece ? `${piece[0] === 'w' ? 'peça branca' : 'peça preta'}: ${names[piece[1]]}` : 'casa vazia'; }
  function pieceAt(position, square) { return position.board[square]; }
  function currentPositionKey() { return Chess.positionKey(state.position); }
  function isFinished() { return Boolean(state.outcome && ['checkmate','stalemate','fivefold','seventy-five-move','insufficient','claimed-draw','resignation'].includes(state.outcome.type)); }

  function createBoard() {
    const fragment = document.createDocumentFragment();
    for (let square = 0; square < 64; square += 1) {
      const row = Chess.rowOf(square);
      const col = Chess.colOf(square);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `chess-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      button.dataset.square = String(square);
      button.setAttribute('role', 'gridcell');
      button.tabIndex = square === state.focusSquare ? 0 : -1;
      const piece = document.createElement('span');
      piece.className = 'chess-piece';
      piece.setAttribute('aria-hidden', 'true');
      button.append(piece);
      fragment.append(button);
      squareButtons.push(button);
    }
    boardElement.replaceChildren(fragment);
    render();
  }

  function clearSquareDecorations(button) {
    button.classList.remove('is-selected','is-legal','is-capture','is-check','is-last-move','is-drag-source','is-drop-target','is-invalid-drop','is-draggable');
    button.querySelectorAll('.square-coordinate').forEach((label) => label.remove());
  }

  function renderCoordinates(button, square, flipped) {
    if (!state.settings.coordinates) return;
    const row = Chess.rowOf(square);
    const col = Chess.colOf(square);
    const fileOnEdge = flipped ? row === 0 : row === 7;
    const rankOnEdge = flipped ? col === 7 : col === 0;
    if (fileOnEdge) {
      const file = document.createElement('span');
      file.className = `square-coordinate file${flipped ? ' file-edge-flipped' : ''}`;
      file.textContent = Chess.squareName(square)[0];
      file.setAttribute('aria-hidden','true');
      button.append(file);
    }
    if (rankOnEdge) {
      const rank = document.createElement('span');
      rank.className = `square-coordinate rank${flipped ? ' rank-edge-flipped' : ''}`;
      rank.textContent = Chess.squareName(square)[1];
      rank.setAttribute('aria-hidden','true');
      button.append(rank);
    }
  }

  function renderBoard() {
    const flipped = state.mode === 'local' && state.settings.rotate && state.position.turn === 'b';
    boardElement.classList.toggle('is-flipped', flipped);
    boardStack.dataset.bottomSide = flipped ? 'black' : 'white';
    const checkedKing = Chess.isInCheck(state.position) ? state.position.board.findIndex((piece) => piece === `${state.position.turn}K`) : -1;
    const legalForSelected = state.selected === null ? [] : state.legalMoves.filter((move) => move.from === state.selected);
    const legalDestinations = new Map();
    for (const move of legalForSelected) {
      const previous = legalDestinations.get(move.to) || { capture:false };
      previous.capture ||= Boolean(move.capture);
      legalDestinations.set(move.to, previous);
    }
    for (let square = 0; square < 64; square += 1) {
      const button = squareButtons[square];
      const piece = pieceAt(state.position, square);
      button.disabled = !state.started || (state.mode === 'computer' && (state.position.turn !== 'w' || state.computerThinking));
      clearSquareDecorations(button);
      if (state.started && !isFinished() && !state.computerThinking && piece?.[0] === state.position.turn && (state.mode !== 'computer' || state.position.turn === 'w')) button.classList.add('is-draggable');
      const pieceElement = button.querySelector('.chess-piece');
      pieceElement.textContent = piece ? symbols[piece] : '';
      pieceElement.classList.toggle('white', piece?.[0] === 'w');
      pieceElement.classList.toggle('black', piece?.[0] === 'b');
      button.setAttribute('aria-label', `${Chess.squareName(square)}, ${pieceDescription(piece)}`);
      if (square === state.selected) button.classList.add('is-selected');
      if (state.drag?.moved && square === state.drag.from) button.classList.add('is-drag-source');
      if (state.drag?.target === square) button.classList.add('is-drop-target');
      if (state.lastMove && (square === state.lastMove.from || square === state.lastMove.to)) button.classList.add('is-last-move');
      if (square === checkedKing) button.classList.add('is-check');
      const destination = legalDestinations.get(square);
      if (destination && state.settings.showMoves) {
        button.classList.add('is-legal');
        if (destination.capture) button.classList.add('is-capture');
      }
      renderCoordinates(button, square, flipped);
      button.tabIndex = square === state.focusSquare ? 0 : -1;
    }
  }

  function renderSeats() {
    const current = state.position.turn;
    const difficulty = window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty);
    if (ui.whiteName) ui.whiteName.textContent = state.mode === 'computer' ? 'Você · Brancas' : 'Brancas';
    if (ui.blackName) ui.blackName.textContent = state.mode === 'computer' ? 'Computador · Pretas' : 'Pretas';
    if (ui.aiLevelBadge) {
      ui.aiLevelBadge.hidden = state.mode !== 'computer';
      ui.aiLevelBadge.textContent = state.mode === 'computer' ? `IA · ${difficulty?.name || 'Médio'}` : '';
    }
    for (const color of ['w','b']) {
      const card = $(`[data-player-card="${color === 'w' ? 'white' : 'black'}"]`);
      card.classList.toggle('is-active', !isFinished() && current === color);
      const text = $(`[data-${color === 'w' ? 'white' : 'black'}-state]`);
      if (text) {
        if (isFinished()) text.textContent = 'Partida encerrada';
        else if (state.mode === 'computer' && color === 'b') text.textContent = state.computerThinking ? 'Analisando o tabuleiro…' : 'Adversário virtual';
        else if (state.mode === 'computer' && color === 'w') text.textContent = current === 'w' ? 'Sua vez de jogar' : 'Aguardando a IA';
        else text.textContent = current === color ? 'Sua vez de jogar' : 'Esperando a vez';
      }
      const capturedElement = color === 'w' ? ui.whiteCaptured : ui.blackCaptured;
      const capturedPieces = [...state.capturedBy[color]].sort((a,b) => materialValues[b[1]] - materialValues[a[1]]);
      if (capturedPieces.length) {
        capturedElement.replaceChildren(...capturedPieces.map((piece) => {
          const symbol = document.createElement('span');
          symbol.className = `captured-piece ${piece[0] === 'w' ? 'white' : 'black'}`;
          symbol.textContent = symbols[piece];
          symbol.setAttribute('aria-hidden','true');
          return symbol;
        }));
      } else capturedElement.textContent = '—';
      capturedElement.setAttribute('aria-label', `Peças capturadas pelas ${colorName(color)}: ${capturedPieces.map((piece) => names[piece[1]]).join(', ') || 'nenhuma'}`);
    }
    const whitePoints = state.capturedBy.w.reduce((sum,piece) => sum + materialValues[piece[1]],0);
    const blackPoints = state.capturedBy.b.reduce((sum,piece) => sum + materialValues[piece[1]],0);
    ui.whiteMaterial.textContent = whitePoints ? `+${whitePoints}` : '—';
    ui.blackMaterial.textContent = blackPoints ? `+${blackPoints}` : '—';
    ui.turnPanel.dataset.turn = current;
  }

  function renderStatus() {
    const current = state.position.turn;
    const outcome = state.outcome || {};
    let title = state.mode === 'computer' && current === 'b' ? (state.computerThinking ? 'O computador está pensando…' : 'Vez do computador') : `Vez das ${colorName(current)}`;
    let detail = state.mode === 'computer' && current === 'b' ? `A IA está no nível ${window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty)?.name || 'Médio'}.` : 'Escolha uma peça para ver seus movimentos.';
    let icon = current === 'w' ? '♙' : '♟';
    ui.statusCard.classList.remove('is-check','is-finished');
    if (outcome.type === 'checkmate') {
      title = `Xeque-mate — ${colorName(outcome.winner)} venceram`;
      detail = `Vitória das ${colorName(outcome.winner)}.`;
      icon = '♛';
      ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'stalemate') {
      title = 'Empate por afogamento'; detail = 'O jogador da vez não tem lances legais e não está em xeque.'; icon = '½'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'fivefold') {
      title = 'Empate por repetição'; detail = 'A mesma posição ocorreu cinco vezes.'; icon = '½'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'seventy-five-move') {
      title = 'Empate pela regra dos 75 lances'; detail = '75 lances foram feitos sem captura ou movimento de peão.'; icon = '½'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'insufficient') {
      title = 'Empate por material insuficiente'; detail = 'Não há material suficiente para forçar xeque-mate.'; icon = '½'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'claimed-draw') {
      title = 'Empate reivindicado'; detail = outcome.reason; icon = '½'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.type === 'resignation') {
      title = `Vitória das ${colorName(outcome.winner)}`; detail = `${sideName(outcome.loser)} desistiram da partida.`; icon = '⚑'; ui.statusCard.classList.add('is-finished');
    } else if (outcome.check) {
      title = `Xeque nas ${colorName(current)}`; detail = `As ${colorName(current)} precisam responder ao xeque.`; icon = '♔'; ui.statusCard.classList.add('is-check');
    }
    ui.status.textContent = title;
    ui.statusDetail.textContent = detail;
    ui.statusIcon.textContent = icon;
    ui.turnLabel.textContent = isFinished() ? title : state.mode === 'computer' && current === 'b' ? (state.computerThinking ? 'Computador pensando…' : 'Vez do computador') : `Vez das ${colorName(current)}`;
    ui.resultOverlay.hidden = !isFinished();
    if (isFinished()) {
      ui.resultTitle.textContent = outcome.winner ? `Vitória das ${sideName(outcome.winner)}` : title;
      ui.resultDetail.textContent = detail;
    }
    ui.drawClaim.disabled = !(outcome.claimable && !isFinished());
    ui.drawClaim.title = outcome.claimable ? 'Reivindicar empate por repetição ou pela regra dos 50 lances' : 'Disponível após uma posição ocorrer três vezes ou 50 lances sem captura ou movimento de peão';
    ui.undo.disabled = state.undoStack.length === 0 || state.computerThinking;
  }

  function renderHistory() {
    ui.moveCount.textContent = `${state.moveLog.length} ${state.moveLog.length === 1 ? 'lance' : 'lances'}`;
    if (!state.moveLog.length) {
      const empty = document.createElement('p');
      empty.className = 'chess-empty-history';
      empty.textContent = 'A partida começa com 1. e4, 1. d4 ou qualquer jogada legal.';
      ui.moveList.replaceChildren(empty);
      return;
    }
    const rows = [];
    for (let index = 0; index < state.moveLog.length; index += 2) {
      const white = state.moveLog[index];
      const black = state.moveLog[index + 1];
      const row = document.createElement('div');
      row.className = `chess-move-row${index >= state.moveLog.length - (state.moveLog.length % 2 || 2) ? ' is-latest' : ''}`;
      const number = document.createElement('span'); number.className = 'chess-move-number'; number.textContent = `${white.number}.`;
      const whiteSan = document.createElement('span'); whiteSan.className = 'chess-move-san'; whiteSan.textContent = white.san;
      const blackSan = document.createElement('span'); blackSan.className = 'chess-move-san'; blackSan.textContent = black?.san || '';
      row.append(number,whiteSan,blackSan);
      rows.push(row);
    }
    ui.moveList.replaceChildren(...rows);
    ui.moveList.scrollTop = ui.moveList.scrollHeight;
  }

  function render() {
    state.legalMoves = Chess.getLegalMoves(state.position);
    const key = currentPositionKey();
    state.outcome = state.outcome?.type === 'claimed-draw' || state.outcome?.type === 'resignation'
      ? state.outcome
      : Chess.getOutcome(state.position, state.repetitions.get(key) || 1);
    renderBoard();
    renderSeats();
    renderStatus();
    renderHistory();
  }

  function saveSnapshot() {
    state.undoStack.push({
      position:Chess.clonePosition(state.position), lastMove:state.lastMove ? { ...state.lastMove } : null,
      moveLog:state.moveLog.map((move) => ({ ...move })),
      repetitions:new Map(state.repetitions), capturedBy:{ w:[...state.capturedBy.w], b:[...state.capturedBy.b] },
      outcome:state.outcome ? { ...state.outcome } : null
    });
  }

  function evaluatePosition(position) {
    let score = 0;
    for (let square = 0; square < 64; square += 1) {
      const piece = position.board[square];
      if (!piece) continue;
      const color = piece[0];
      const type = piece[1];
      const row = Chess.rowOf(square);
      const col = Chess.colOf(square);
      const center = 3.5 - (Math.abs(row - 3.5) + Math.abs(col - 3.5)) / 2;
      let positional = 0;
      if (type === 'P') positional = (color === 'b' ? row - 1 : 6 - row) * 7 + center * 2;
      else if (type === 'N') positional = center * 8;
      else if (type === 'B') positional = center * 4;
      else if (type === 'Q') positional = center * 1.5;
      const value = searchValues[type] + positional;
      score += color === 'b' ? value : -value;
    }
    if (Chess.isInCheck(position, 'w')) score += 24;
    if (Chess.isInCheck(position, 'b')) score -= 24;
    return score;
  }

  function moveOrderScore(position, move) {
    const victim = move.captured || position.board[move.to];
    const attacker = position.board[move.from];
    let score = victim ? 10 * searchValues[victim[1]] - searchValues[attacker?.[1] || 'P'] : 0;
    if (move.promotion) score += searchValues[move.promotion] + 700;
    if (move.castle) score += 25;
    return score;
  }

  function searchPosition(position, depth, alpha, beta, ply = 0) {
    const moves = Chess.getLegalMoves(position);
    if (!moves.length) {
      if (!Chess.isInCheck(position)) return 0;
      return position.turn === 'b' ? -mateScore + ply : mateScore - ply;
    }
    if (position.halfmove >= 150 || Chess.isInsufficientMaterial(position)) return 0;
    if (depth <= 0) return evaluatePosition(position);

    moves.sort((a,b) => moveOrderScore(position,b) - moveOrderScore(position,a));
    if (position.turn === 'b') {
      let best = -Infinity;
      for (const move of moves) {
        const next = Chess.applyMove(position,move).position;
        best = Math.max(best,searchPosition(next,depth - 1,alpha,beta,ply + 1));
        alpha = Math.max(alpha,best);
        if (beta <= alpha) break;
      }
      return best;
    }
    let best = Infinity;
    for (const move of moves) {
      const next = Chess.applyMove(position,move).position;
      best = Math.min(best,searchPosition(next,depth - 1,alpha,beta,ply + 1));
      beta = Math.min(beta,best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function chooseComputerMove() {
    const moves = Chess.getLegalMoves(state.position);
    if (!moves.length) return null;
    if (state.difficulty === 'easy') return moves[Math.floor(Math.random() * moves.length)];

    const depth = state.difficulty === 'expert' ? 3 : state.difficulty === 'hard' ? 2 : 1;
    const ranked = moves.map((move) => ({
      move,
      score:searchPosition(Chess.applyMove(state.position,move).position,depth - 1,-Infinity,Infinity,1)
    })).sort((a,b) => b.score - a.score);
    if (state.difficulty === 'hard' && ranked.length > 1 && Math.random() < .12) return ranked[1].move;
    if (state.difficulty === 'medium' && ranked.length > 1 && Math.random() < .2) return ranked[Math.min(1 + Math.floor(Math.random() * Math.min(2,ranked.length - 1)),ranked.length - 1)].move;
    const bestScore = ranked[0].score;
    const bestMoves = ranked.filter((candidate) => candidate.score === bestScore);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
  }

  function scheduleComputerMove() {
    const delay = window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty)?.wait || 430;
    window.clearTimeout(computerTimer);
    computerTimer = window.setTimeout(() => {
      computerTimer = 0;
      if (!state.started || state.mode !== 'computer' || state.position.turn !== 'b' || isFinished()) return;
      const move = chooseComputerMove();
      state.computerThinking = false;
      if (move) playMove(move,true);
      else render();
    },delay);
  }

  function playMove(move, fromComputer = false) {
    if (!state.started || isFinished()) return;
    if (state.mode === 'computer' && (fromComputer ? state.position.turn !== 'b' : state.position.turn !== 'w')) return;
    const before = state.position;
    const san = Chess.moveToSan(before, move, state.legalMoves);
    saveSnapshot();
    const result = Chess.applyMove(before, move);
    state.position = result.position;
    state.lastMove = { from:move.from, to:move.to };
    state.focusSquare = move.to;
    if (result.captured) state.capturedBy[before.turn].push(result.captured);
    state.moveLog.push({ color:before.turn, number:before.fullmove, san });
    const key = currentPositionKey();
    state.repetitions.set(key, (state.repetitions.get(key) || 0) + 1);
    state.selected = null;
    state.computerThinking = state.mode === 'computer' && state.position.turn === 'b';
    window.CV_GAME_AUDIO?.playTone(result.captured ? 250 : 420, result.captured ? .13 : .075, result.captured ? 'triangle' : 'sine', result.captured ? .055 : .038);
    render();
    if (isFinished()) {
      state.computerThinking = false;
      render();
      window.CV_GAME_AUDIO?.playTone(620, .22, 'triangle', .045);
      ui.resultNewGame.focus({ preventScroll:true });
    }
    else if (state.computerThinking) scheduleComputerMove();
    else squareButtons[state.focusSquare].focus({ preventScroll:true });
  }

  function selectSquare(square) {
    if (!state.started || isFinished() || state.computerThinking || (state.mode === 'computer' && state.position.turn !== 'w')) return;
    state.focusSquare = square;
    const piece = pieceAt(state.position, square);
    if (state.selected !== null) {
      const matchingMoves = state.legalMoves.filter((move) => move.from === state.selected && move.to === square);
      if (matchingMoves.length) {
        if (matchingMoves.some((move) => move.promotion)) {
          state.promotionMove = matchingMoves[0];
          showPromotionOptions();
          return;
        }
        playMove(matchingMoves[0]);
        return;
      }
    }
    if (piece && piece[0] === state.position.turn) state.selected = state.selected === square ? null : square;
    else state.selected = null;
    renderBoard();
  }

  function removeDragGhost(ghost = state.drag?.ghost) {
    ghost?.remove();
    squareButtons.forEach((button) => button.classList.remove('is-drag-source','is-drop-target'));
  }

  function beginPieceDrag(event) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const squareButton = event.target.closest('[data-square]');
    if (!squareButton || !boardElement.contains(squareButton) || !state.started || isFinished() || state.computerThinking) return;
    const from = Number(squareButton.dataset.square);
    const piece = pieceAt(state.position,from);
    if (!piece || piece[0] !== state.position.turn || (state.mode === 'computer' && state.position.turn !== 'w')) return;
    state.drag = { pointerId:event.pointerId, from, piece, startX:event.clientX, startY:event.clientY, moved:false, target:null, ghost:null };
    state.drag.ghost = document.createElement('span');
    state.drag.ghost.className = `chess-drag-ghost ${piece[0] === 'w' ? 'white' : 'black'}`;
    state.drag.ghost.textContent = symbols[piece];
    state.drag.ghost.setAttribute('aria-hidden','true');
    gameView.append(state.drag.ghost);
    state.drag.ghost.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%) scale(.94)`;
    document.documentElement.classList.add('chess-piece-grabbing');
    try { squareButton.setPointerCapture(event.pointerId); } catch { /* O arraste ainda funciona sem captura do ponteiro. */ }
  }

  function movePieceDrag(event) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX,event.clientY - drag.startY) >= 9) {
        drag.moved = true;
        state.selected = drag.from;
        renderBoard();
      }
    }
    drag.ghost.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%) scale(.94)`;
    if (!drag.moved) return;
    const underPointer = document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-square]');
    const target = underPointer && boardElement.contains(underPointer) ? Number(underPointer.dataset.square) : null;
    if (drag.target !== target) {
      if (drag.target !== null) squareButtons[drag.target].classList.remove('is-drop-target','is-invalid-drop');
      drag.target = target;
      if (target !== null) {
        const legal = state.legalMoves.some((move) => move.from === drag.from && move.to === target);
        squareButtons[target].classList.add(legal ? 'is-drop-target' : 'is-invalid-drop');
      }
    }
  }

  function finishPieceDrag(event) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const droppedOn = document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-square]');
    const destination = droppedOn && boardElement.contains(droppedOn) ? Number(droppedOn.dataset.square) : null;
    const moved = drag.moved;
    const from = drag.from;
    state.drag = null;
    document.documentElement.classList.remove('chess-piece-grabbing');
    removeDragGhost(drag.ghost);
    if (!moved) return;

    suppressNextDragClick = true;
    window.setTimeout(() => { suppressNextDragClick = false; },0);
    event.preventDefault();
    if (destination !== null && destination !== from && state.legalMoves.some((move) => move.from === from && move.to === destination)) {
      state.selected = from;
      selectSquare(destination);
      return;
    }
    state.selected = null;
    renderBoard();
  }

  function cancelPieceDrag(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    const wasDragging = state.drag.moved;
    const ghost = state.drag.ghost;
    state.drag = null;
    document.documentElement.classList.remove('chess-piece-grabbing');
    removeDragGhost(ghost);
    if (wasDragging) {
      state.selected = null;
      renderBoard();
    }
  }

  function showPromotionOptions() {
    const color = state.position.turn;
    document.querySelectorAll('[data-promote]').forEach((button) => {
      const type = button.dataset.promote;
      const symbol = button.querySelector('span');
      symbol.textContent = symbols[`${color}${type}`];
      symbol.className = `promotion-symbol ${color === 'w' ? 'white' : 'black'}`;
    });
    if (typeof promotionDialog.showModal === 'function') promotionDialog.showModal();
    else promotionDialog.setAttribute('open','');
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function enterMatchFullscreen() {
    if (!gameView || document.fullscreenElement === gameView || document.webkitFullscreenElement === gameView || gameView.classList.contains('is-fullscreen-fallback')) return;
    const useFallback = () => {
      gameView.classList.add('is-fullscreen-fallback');
      document.body.classList.add('has-fullscreen-fallback');
      const fullscreenButton = $(`[data-fullscreen-button="#${gameView.id}"]`);
      fullscreenButton?.setAttribute('aria-pressed','true');
      fullscreenButton?.setAttribute('aria-label','Sair da tela cheia');
      if (fullscreenButton) fullscreenButton.title = 'Sair da tela cheia';
      const label = fullscreenButton?.querySelector('[data-fullscreen-label]');
      if (label) label.textContent = 'Sair da tela cheia';
      document.dispatchEvent(new Event('cv-games-fullscreenchange'));
    };
    try {
      const request = gameView.requestFullscreen
        ? gameView.requestFullscreen()
        : gameView.webkitRequestFullscreen
          ? gameView.webkitRequestFullscreen()
          : null;
      if (!request && !gameView.requestFullscreen && !gameView.webkitRequestFullscreen) useFallback();
      else if (request && typeof request.catch === 'function') request.catch(useFallback);
    } catch { useFallback(); }
  }

  function startGame(mode, difficulty = state.difficulty) {
    window.clearTimeout(computerTimer);
    computerTimer = 0;
    state.mode = mode;
    state.difficulty = difficulty;
    state.computerThinking = false;
    state.position = Chess.createInitialPosition();
    state.selected = null;
    state.lastMove = null;
    state.focusSquare = 60;
    state.moveLog = [];
    state.undoStack = [];
    state.capturedBy = { w:[], b:[] };
    state.repetitions = new Map([[currentPositionKey(),1]]);
    state.outcome = null;
    state.started = true;
    lobby.hidden = true;
    gameView.hidden = false;
    enterMatchFullscreen();
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    render();
    squareButtons[60].focus({ preventScroll:true });
  }

  function startLocalGame() { startGame('local'); }
  function startComputerGame(difficulty = state.difficulty) { startGame('computer',difficulty); }
  function startCurrentMode() { state.mode === 'computer' ? startComputerGame(state.difficulty) : startLocalGame(); }

  function openDifficultyPicker() {
    if (modeChoices) modeChoices.hidden = true;
    if (lobbyFootnote) lobbyFootnote.hidden = true;
    if (lobbyCopy) {
      lobbyCopy.querySelector('h2').textContent = 'Escolha a dificuldade';
      lobbyCopy.querySelector('p:last-child').textContent = 'Ajuste o desafio antes de enfrentar o computador.';
    }
    if (difficultyPicker) difficultyPicker.hidden = false;
    difficultyPicker?.querySelector('[data-ai-difficulty-range]')?.focus({ preventScroll:true });
  }

  function closeDifficultyPicker() {
    if (difficultyPicker) difficultyPicker.hidden = true;
    if (modeChoices) modeChoices.hidden = false;
    if (lobbyFootnote) lobbyFootnote.hidden = false;
    if (lobbyCopy) {
      lobbyCopy.querySelector('h2').textContent = 'Como quer jogar?';
      lobbyCopy.querySelector('p:last-child').textContent = 'Reúna outra pessoa e joguem no mesmo dispositivo ou desafie o computador. Escolha o modo para continuar.';
    }
    ui.startComputer?.focus({ preventScroll:true });
  }

  async function newGame() {
    if (state.moveLog.length && !await window.CV_GAMES_DIALOG.confirm({
      title:'Começar outra partida?', message:'A partida atual será encerrada e o tabuleiro voltará à posição inicial.',
      confirmText:'Nova partida', cancelText:'Continuar jogando'
    })) return;
    startCurrentMode();
  }

  function undoMove() {
    if (state.computerThinking) return;
    let snapshot = null;
    const plies = state.mode === 'computer' && state.position.turn === 'w' && state.moveLog.length >= 2 ? 2 : 1;
    for (let index = 0; index < plies; index += 1) snapshot = state.undoStack.pop() || snapshot;
    if (!snapshot) return;
    state.position = snapshot.position;
    state.lastMove = snapshot.lastMove;
    state.moveLog = snapshot.moveLog;
    state.repetitions = snapshot.repetitions;
    state.capturedBy = snapshot.capturedBy;
    state.outcome = snapshot.outcome;
    state.selected = null;
    state.promotionMove = null;
    state.computerThinking = false;
    state.focusSquare = state.lastMove?.to ?? 60;
    if (promotionDialog.open) closeDialog(promotionDialog);
    render();
  }

  function claimDraw() {
    const key = currentPositionKey();
    const repetitionCount = state.repetitions.get(key) || 1;
    const reason = repetitionCount >= 3 ? 'Empate reivindicado por repetição tripla.' : 'Empate reivindicado pela regra dos 50 lances.';
    state.outcome = { type:'claimed-draw', reason };
    state.selected = null;
    render();
    ui.resultNewGame.focus({ preventScroll:true });
  }

  async function resign() {
    if (isFinished()) return;
    const current = state.mode === 'computer' ? 'w' : state.position.turn;
    if (!await window.CV_GAMES_DIALOG.confirm({
      title:'Desistir da partida?',
      message:`As ${colorName(current)} querem desistir? A vitória será das ${colorName(current === 'w' ? 'b' : 'w')}.`,
      confirmText:'Desistir', cancelText:'Continuar jogando', tone:'danger'
    })) return;
    state.outcome = { type:'resignation', loser:current, winner:current === 'w' ? 'b' : 'w' };
    state.selected = null;
    render();
    ui.resultNewGame.focus({ preventScroll:true });
  }

  function loadSettingsIntoDialog() {
    document.querySelectorAll('[data-setting-rotate]').forEach((control) => { control.checked = state.settings.rotate; });
    document.querySelectorAll('[data-setting-moves]').forEach((control) => { control.checked = state.settings.showMoves; });
    document.querySelectorAll('[data-setting-coordinates]').forEach((control) => { control.checked = state.settings.coordinates; });
  }

  function updateSettings(event) {
    const control = event.currentTarget;
    const settingKey = Object.entries({ '[data-setting-rotate]':'rotate', '[data-setting-moves]':'showMoves', '[data-setting-coordinates]':'coordinates' }).find(([selector]) => control.matches(selector))?.[1];
    if (!settingKey) return;
    state.settings[settingKey] = control.checked;
    loadSettingsIntoDialog();
    saveSettings();
    renderBoard();
    renderSeats();
  }
  loadSettingsIntoDialog();

  function readFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
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
    ui.favorite.setAttribute('aria-label',`${active ? 'Remover' : 'Adicionar'} CV XADREZ ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    if (icon) icon.textContent = active ? '♥' : '♡';
    if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(window.CV_GAMES_COUNT_VISIBLE_FAVORITES?.() ?? favorites.size);
  }
  function toggleFavorite() {
    const favorites = readFavorites();
    if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem(favoriteKey,JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch { /* Favoritos são opcionais. */ }
    updateFavorite();
  }

  function prepareMenu() {
    const menuButton = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded',String(open));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded','false');
    }));
  }

  boardElement.addEventListener('click',(event) => {
    if (suppressNextDragClick) {
      suppressNextDragClick = false;
      event.preventDefault();
      return;
    }
    const squareButton = event.target.closest('[data-square]');
    if (squareButton) selectSquare(Number(squareButton.dataset.square));
  });
  boardElement.addEventListener('pointerdown',beginPieceDrag);
  boardElement.addEventListener('pointermove',movePieceDrag);
  boardElement.addEventListener('pointerup',finishPieceDrag);
  boardElement.addEventListener('pointercancel',cancelPieceDrag);
  boardElement.addEventListener('lostpointercapture',cancelPieceDrag);
  boardElement.addEventListener('keydown',(event) => {
    const squareButton = event.target.closest('[data-square]');
    if (!squareButton || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const square = Number(squareButton.dataset.square);
    let row = Chess.rowOf(square);
    let col = Chess.colOf(square);
    const flipped = boardElement.classList.contains('is-flipped');
    const vector = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] }[event.key];
    const direction = flipped ? -1 : 1;
    row += vector[0] * direction;
    col += vector[1] * direction;
    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      state.focusSquare = row * 8 + col;
      squareButtons[square].tabIndex = -1;
      squareButtons[state.focusSquare].tabIndex = 0;
      squareButtons[state.focusSquare].focus();
    }
  });

  ui.startLocal.addEventListener('click',startLocalGame);
  ui.startComputer?.addEventListener('click',openDifficultyPicker);
  difficultyBack?.addEventListener('click',closeDifficultyPicker);
  document.addEventListener('cv-ai-difficulty-start',(event) => {
    if (event.detail?.gameKey === gameId) startComputerGame(event.detail.difficulty);
  });
  document.addEventListener('cv-game-return-to-mode-menu', () => {
    window.clearTimeout(computerTimer);
    computerTimer = 0;
    document.documentElement.classList.remove('chess-piece-grabbing');
    if (state.drag) {
      const ghost = state.drag.ghost;
      state.drag = null;
      removeDragGhost(ghost);
    }
    closeDifficultyPicker();
    state.started = false;
    state.selected = null;
    state.promotionMove = null;
    state.computerThinking = false;
  });
  ui.undo.addEventListener('click',undoMove);
  ui.drawClaim.addEventListener('click',claimDraw);
  ui.resign.addEventListener('click',resign);
  ui.newGame.addEventListener('click',newGame);
  ui.resultNewGame.addEventListener('click',startCurrentMode);
  ui.settingsOpen.addEventListener('click',() => { loadSettingsIntoDialog(); if (settingsDialog.showModal) settingsDialog.showModal(); else settingsDialog.setAttribute('open',''); });
  ui.settingsClose.addEventListener('click',() => closeDialog(settingsDialog));
  for (const selector of ['[data-setting-rotate]','[data-setting-moves]','[data-setting-coordinates]']) document.querySelectorAll(selector).forEach((control) => control.addEventListener('change',(event) => updateSettings(event)));
  document.querySelectorAll('[data-promote]').forEach((button) => button.addEventListener('click',() => {
    if (!state.promotionMove) return;
    playMove({ ...state.promotionMove, promotion:button.dataset.promote });
    state.promotionMove = null;
    closeDialog(promotionDialog);
  }));
  promotionDialog.addEventListener('close',() => { state.promotionMove = null; });
  settingsDialog.addEventListener('click',(event) => { if (event.target === settingsDialog) closeDialog(settingsDialog); });
  promotionDialog.addEventListener('click',(event) => { if (event.target === promotionDialog) event.preventDefault(); });
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
    try { localStorage.setItem('cv-games-theme',nextTheme); } catch { /* Theme is still applied for the current page. */ }
    syncThemeButton();
  });
  document.addEventListener('keydown',(event) => {
    if (event.key.toLowerCase() === 'u' && state.started && !event.repeat && !event.ctrlKey && !event.metaKey) undoMove();
    if (event.key === 'Escape' && settingsDialog.open) closeDialog(settingsDialog);
  });

  prepareMenu();
  createBoard();
  updateFavorite();
  syncThemeButton();
})();
