(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const $ = (selector) => document.querySelector(selector);
  const boardElement = $('[data-board]');
  const lobby = $('[data-lobby]');
  const gameView = $('[data-game-view]');
  const gameId = 'cv-quadrados';
  const modeChoices = $('[data-mode-choices]');
  const difficultyPicker = $('[data-ai-difficulty-picker]');
  const lobbyCopy = $('[data-lobby-copy]');
  const lobbyFootnote = $('[data-lobby-footnote]');
  const difficultyBack = $('[data-difficulty-back]');
  const boardSize = 600;
  const margin = 36;
  const step = (boardSize - margin * 2) / 5;
  const colors = {
    a:{ name:'Azul', symbol:'A' },
    b:{ name:'Coral', symbol:'B' }
  };
  const ui = {
    start:$('[data-start-local]'), startComputer:$('[data-start-computer]'), turnCard:$('[data-live-turn]'), turnLabel:$('[data-turn-label]'),
    statusCard:$('[data-status-card]'), statusMark:$('[data-status-mark]'), status:$('[data-game-status]'), statusDetail:$('[data-status-detail]'),
    undo:$('[data-undo]'), newGame:$('[data-new-game]'), aScore:$('[data-a-score]'), bScore:$('[data-b-score]'),
    aState:$('[data-a-state]'), bState:$('[data-b-state]'), boxesCount:$('[data-boxes-count]'), bonusNote:$('[data-bonus-note]'),
    progress:$('[data-progress]'), progressLabel:$('[data-progress-label]'), progressFill:$('[data-progress-fill]'),
    moveCount:$('[data-move-count]'), moveList:$('[data-move-list]'), favorite:$('[data-game-favorite]'),
    aiLevelBadge:$('[data-ai-level-badge]'), resultOverlay:$('[data-result-overlay]'), resultTitle:$('[data-result-title]'), resultScore:$('[data-result-score]'),
    resultBreakdown:$('[data-result-breakdown]'), nextMatch:$('[data-next-match]')
  };
  const state = {
    started:false, current:'a', outcome:null, inputLocked:false, edgeOwners:new Map(), boxes:Array(25).fill(null),
    scores:{ a:0, b:0 }, history:[], undoStack:[], focusEdge:null, lastBoxCount:0,
    mode:'local', difficulty:window.CV_GAMES_AI_DIFFICULTY?.get(gameId) || 'medium', computerThinking:false
  };
  let inputUnlockTimeout = null;
  let computerTimer = 0;
  const edges = [];
  const edgeMap = new Map();
  const boxes = [];

  function svgElement(tag,attributes = {}) {
    const element = document.createElementNS(SVG_NS,tag);
    for (const [name,value] of Object.entries(attributes)) element.setAttribute(name,String(value));
    return element;
  }
  function point(row,col) { return { x:margin + col * step, y:margin + row * step }; }
  function addEdge(orientation,row,col) {
    const horizontal = orientation === 'h';
    const start = point(row,col);
    const end = horizontal ? point(row,col + 1) : point(row + 1,col);
    const edge = {
      key:`${orientation}-${row}-${col}`, orientation, row, col,
      x:(start.x + end.x) / 2, y:(start.y + end.y) / 2,
      start, end, group:null, visible:null, preview:null, hit:null
    };
    const group = svgElement('g',{ class:'edge-interaction', 'data-edge-key':edge.key, role:'button', tabindex:'-1', 'aria-disabled':'false' });
    const visible = svgElement('line',{ class:'dots-edge-visible', x1:start.x,y1:start.y,x2:end.x,y2:end.y });
    const preview = svgElement('line',{ class:'dots-edge-preview', x1:start.x,y1:start.y,x2:end.x,y2:end.y });
    const hit = svgElement('line',{ class:'dots-edge-hit', x1:start.x,y1:start.y,x2:end.x,y2:end.y,stroke:'transparent','stroke-width':'38','pointer-events':'stroke' });
    group.append(visible,preview,hit);
    edge.group = group; edge.visible = visible; edge.preview = preview; edge.hit = hit;
    edges.push(edge); edgeMap.set(edge.key,edge);
    return edge;
  }
  function createBoard() {
    boardElement.setAttribute('viewBox',`0 0 ${boardSize} ${boardSize}`);
    const boxLayer = svgElement('g',{ 'aria-hidden':'true' });
    const edgeLayer = svgElement('g',{ 'aria-label':'Linhas disponíveis' });
    const dotLayer = svgElement('g',{ 'aria-hidden':'true' });
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const topLeft = point(row,col);
        const rect = svgElement('rect',{ class:'dots-box-fill', x:topLeft.x,y:topLeft.y,width:step,height:step,rx:8 });
        const label = svgElement('text',{ class:'dots-box-label',x:topLeft.x + step / 2,y:topLeft.y + step / 2,'aria-hidden':'true' });
        boxLayer.append(rect,label);
        boxes.push({ row,col,rect,label });
      }
    }
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 5; col += 1) addEdge('h',row,col);
    }
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 6; col += 1) addEdge('v',row,col);
    }
    for (const edge of edges) edgeLayer.append(edge.group);
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const location = point(row,col);
        const dot = svgElement('circle',{ class:'dots-node',cx:location.x,cy:location.y,r:8.5 });
        dotLayer.append(dot);
      }
    }
    boardElement.replaceChildren(boxLayer,edgeLayer,dotLayer);
    state.focusEdge = edges[0]?.key || null;
    render();
  }
  function boxEdgeKeys(row,col) {
    return [`h-${row}-${col}`,`h-${row + 1}-${col}`,`v-${row}-${col}`,`v-${row}-${col + 1}`];
  }
  function adjacentBoxes(edge) {
    if (edge.orientation === 'h') {
      const adjacent = [];
      if (edge.row > 0) adjacent.push((edge.row - 1) * 5 + edge.col);
      if (edge.row < 5) adjacent.push(edge.row * 5 + edge.col);
      return adjacent;
    }
    const adjacent = [];
    if (edge.col > 0) adjacent.push(edge.row * 5 + edge.col - 1);
    if (edge.col < 5) adjacent.push(edge.row * 5 + edge.col);
    return adjacent;
  }
  function playerName(player, compact = false) {
    if (state.mode !== 'computer') return compact ? colors[player].name : `Jogador ${colors[player].name}`;
    return player === 'a' ? (compact ? 'Você' : 'Você · Azul') : (compact ? 'Computador' : 'Computador · Coral');
  }
  function currentPosition() {
    return { edgeOwners:new Set(state.edgeOwners.keys()), boxes:[...state.boxes], scores:{ ...state.scores }, current:state.current };
  }
  function countBoxEdges(position, boxIndex) {
    const box = boxes[boxIndex];
    return boxEdgeKeys(box.row,box.col).reduce((count,key) => count + Number(position.edgeOwners.has(key)),0);
  }
  function applySimulatedEdge(position, edge, player) {
    const next = { edgeOwners:new Set(position.edgeOwners), boxes:[...position.boxes], scores:{ ...position.scores }, current:player };
    next.edgeOwners.add(edge.key);
    let captured = 0;
    for (const boxIndex of adjacentBoxes(edge)) {
      if (next.boxes[boxIndex] !== null) continue;
      if (boxEdgeKeys(boxes[boxIndex].row,boxes[boxIndex].col).every((key) => next.edgeOwners.has(key))) {
        next.boxes[boxIndex] = player;
        next.scores[player] += 1;
        captured += 1;
      }
    }
    if (!captured) next.current = player === 'a' ? 'b' : 'a';
    return { position:next, captured };
  }
  function tacticalMoves(position, limit = 8) {
    const available = edges.filter((edge) => !position.edgeOwners.has(edge.key));
    const captures = [];
    const safe = [];
    const risky = [];
    for (const edge of available) {
      const captured = adjacentBoxes(edge).filter((boxIndex) => position.boxes[boxIndex] === null && countBoxEdges(position,boxIndex) === 3).length;
      const exposure = adjacentBoxes(edge).filter((boxIndex) => position.boxes[boxIndex] === null && countBoxEdges(position,boxIndex) === 2).length;
      if (captured) captures.push({ edge, captured, exposure });
      else if (!exposure) safe.push({ edge, captured, exposure });
      else risky.push({ edge, captured, exposure });
    }
    if (captures.length) {
      captures.sort((a,b) => b.captured - a.captured || a.exposure - b.exposure);
      return captures.slice(0,limit).map((item) => item.edge);
    }
    const pool = safe.length ? safe : risky;
    pool.sort((a,b) => a.exposure - b.exposure || Math.abs(a.edge.x - boardSize / 2) + Math.abs(a.edge.y - boardSize / 2) - Math.abs(b.edge.x - boardSize / 2) - Math.abs(b.edge.y - boardSize / 2));
    return pool.slice(0,limit).map((item) => item.edge);
  }
  function evaluatePosition(position, perspective = 'b') {
    const opponent = perspective === 'a' ? 'b' : 'a';
    let score = (position.scores[perspective] - position.scores[opponent]) * 100;
    for (let boxIndex = 0; boxIndex < position.boxes.length; boxIndex += 1) {
      if (position.boxes[boxIndex] !== null) continue;
      const sides = countBoxEdges(position,boxIndex);
      if (sides === 3) score += position.current === perspective ? 24 : -24;
      else if (sides === 2) score += position.current === perspective ? -1.2 : 1.2;
    }
    return score;
  }
  function searchPosition(position, depth, alpha, beta, budget) {
    if (position.edgeOwners.size === edges.length || depth <= 0 || budget.nodes <= 0) return evaluatePosition(position);
    budget.nodes -= 1;
    const player = position.current;
    const maximizing = player === 'b';
    const moves = tacticalMoves(position,budget.branchLimit);
    if (!moves.length) return evaluatePosition(position);
    let best = maximizing ? -Infinity : Infinity;
    for (const edge of moves) {
      const { position:next } = applySimulatedEdge(position,edge,player);
      const nextDepth = depth - Number(next.current !== player);
      const score = searchPosition(next,nextDepth,alpha,beta,budget);
      if (maximizing) { best = Math.max(best,score); alpha = Math.max(alpha,best); }
      else { best = Math.min(best,score); beta = Math.min(beta,best); }
      if (beta <= alpha || budget.nodes <= 0) break;
    }
    return best;
  }
  function chooseComputerEdge() {
    const position = currentPosition();
    const available = edges.filter((edge) => !position.edgeOwners.has(edge.key));
    if (!available.length) return null;
    if (state.difficulty === 'easy') return available[Math.floor(Math.random() * available.length)];
    const branchLimit = state.difficulty === 'expert' ? 7 : 5;
    const depth = state.difficulty === 'expert' ? 3 : 2;
    const candidates = tacticalMoves(position,branchLimit);
    if (!candidates.length) return null;
    if (state.difficulty === 'medium') {
      const ranked = candidates.map((edge) => {
        const { position:next, captured } = applySimulatedEdge(position,edge,'b');
        return { edge, score:captured * 100 - next.boxes.filter((owner,index) => owner === null && countBoxEdges(next,index) === 3).length * 8 + Math.random() * 4 };
      }).sort((a,b) => b.score - a.score);
      return ranked[0].edge;
    }
    const ranked = candidates.map((edge) => {
      const { position:next } = applySimulatedEdge(position,edge,'b');
      const nextDepth = depth - Number(next.current !== 'b');
      const budget = { nodes:state.difficulty === 'expert' ? 1800 : 650, branchLimit };
      return { edge, score:searchPosition(next,nextDepth,-Infinity,Infinity,budget) };
    }).sort((a,b) => b.score - a.score);
    const bestScore = ranked[0].score;
    const bestMoves = ranked.filter((item) => Math.abs(item.score - bestScore) < .001);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].edge;
  }
  function edgeDescription(edge) {
    return edge.orientation === 'h'
      ? `horizontal, linha ${edge.row + 1}, pontos ${edge.col + 1}–${edge.col + 2}`
      : `vertical, coluna ${edge.col + 1}, pontos ${edge.row + 1}–${edge.row + 2}`;
  }
  function nearestOpenEdge(preferredKey) {
    const available = edges.filter((edge) => !state.edgeOwners.has(edge.key));
    if (!available.length) return null;
    const preferred = edgeMap.get(preferredKey);
    if (!preferred) return available[0];
    return available.reduce((best,edge) => {
      const score = (edge.x - preferred.x) ** 2 + (edge.y - preferred.y) ** 2;
      const bestScore = (best.x - preferred.x) ** 2 + (best.y - preferred.y) ** 2;
      return score < bestScore ? edge : best;
    },available[0]);
  }
  function renderBoard() {
    boardElement.setAttribute('aria-busy',String(state.inputLocked || state.computerThinking));
    if (state.focusEdge && state.edgeOwners.has(state.focusEdge)) state.focusEdge = nearestOpenEdge(state.focusEdge)?.key || null;
    for (const edge of edges) {
      const owner = state.edgeOwners.get(edge.key);
      const open = !owner;
      edge.group.classList.toggle('is-drawn',!open);
      edge.group.classList.toggle('owner-a',owner === 'a');
      edge.group.classList.toggle('owner-b',owner === 'b');
      edge.group.classList.toggle('turn-a',open && state.started && !state.outcome && !state.inputLocked && !state.computerThinking && state.current === 'a');
      edge.group.classList.toggle('turn-b',open && state.started && !state.outcome && !state.inputLocked && !state.computerThinking && state.current === 'b');
      edge.visible.classList.toggle('owner-a',owner === 'a');
      edge.visible.classList.toggle('owner-b',owner === 'b');
      edge.group.setAttribute('aria-label',open ? `Traçar linha ${edgeDescription(edge)}` : `Linha ${edgeDescription(edge)}, feita pelo jogador ${colors[owner].name}`);
      edge.group.setAttribute('aria-disabled',String(!open || !state.started || Boolean(state.outcome) || state.inputLocked || state.computerThinking || (state.mode === 'computer' && state.current === 'b')));
      edge.group.setAttribute('aria-pressed',String(!open));
      edge.group.setAttribute('tabindex',open && state.started && !state.outcome && !state.inputLocked && !state.computerThinking && !(state.mode === 'computer' && state.current === 'b') && edge.key === state.focusEdge ? '0' : '-1');
      edge.hit.setAttribute('pointer-events',open && state.started && !state.outcome && !state.inputLocked && !state.computerThinking && !(state.mode === 'computer' && state.current === 'b') ? 'stroke' : 'none');
    }
    for (let index = 0; index < boxes.length; index += 1) {
      const owner = state.boxes[index];
      boxes[index].rect.classList.toggle('owner-a',owner === 'a');
      boxes[index].rect.classList.toggle('owner-b',owner === 'b');
      boxes[index].label.classList.toggle('owner-a',owner === 'a');
      boxes[index].label.classList.toggle('owner-b',owner === 'b');
      boxes[index].label.textContent = owner ? colors[owner].symbol : '';
    }
  }
  function renderPlayers() {
    for (const player of ['a','b']) {
      const card = $(`[data-player-card="${player}"]`);
      card.classList.toggle('is-active',state.started && !state.outcome && !state.inputLocked && !state.computerThinking && state.current === player);
      const name = $(`[data-player-name="${player}"]`);
      if (name) name.textContent = playerName(player);
      const label = player === 'a' ? ui.aState : ui.bState;
      label.textContent = !state.started ? 'Aguardando a partida' : state.outcome ? state.outcome.type === 'win' && state.outcome.winner === player ? 'Venceu a partida' : 'Partida encerrada' : state.current === player && state.mode === 'computer' && player === 'b' && (state.computerThinking || state.inputLocked) ? 'Analisando o tabuleiro…' : state.inputLocked && state.current === player ? 'Preparando a jogada…' : state.current === player ? state.mode === 'computer' && player === 'a' ? 'Sua vez de jogar' : 'Sua vez de jogar' : 'Esperando a vez';
    }
    ui.aScore.textContent = String(state.scores.a);
    ui.bScore.textContent = String(state.scores.b);
    const completed = state.scores.a + state.scores.b;
    ui.boxesCount.innerHTML = `${completed}<span>/25</span>`;
    ui.progressLabel.textContent = `${completed} de 25`;
    ui.progress.setAttribute('aria-valuenow',String(completed));
    ui.progressFill.style.width = `${completed / 25 * 100}%`;
  }
  function renderHistory() {
    ui.moveCount.textContent = `${state.history.length} ${state.history.length === 1 ? 'linha' : 'linhas'}`;
    if (!state.history.length) {
      const empty = document.createElement('li');
      empty.className = 'squares-empty-history';
      empty.textContent = 'As linhas traçadas aparecem aqui.';
      ui.moveList.replaceChildren(empty);
      return;
    }
    const items = state.history.map((move,index) => {
      const item = document.createElement('li');
      if (index === state.history.length - 1) item.classList.add('is-latest');
      const number = document.createElement('span'); number.className = 'squares-move-number'; number.textContent = `${index + 1}.`;
      const player = document.createElement('strong'); player.className = 'squares-move-player'; player.dataset.player = move.player; player.textContent = playerName(move.player,true);
      const description = document.createElement('span'); description.textContent = move.boxCount ? `+${move.boxCount} ${move.boxCount === 1 ? 'quadrado' : 'quadrados'}` : edgeMap.get(move.key) ? edgeDescription(edgeMap.get(move.key)) : 'linha';
      description.className = move.boxCount ? 'squares-move-reward' : '';
      item.append(number,player,description);
      return item;
    });
    ui.moveList.replaceChildren(...items);
    ui.moveList.scrollTop = ui.moveList.scrollHeight;
  }
  function renderStatus() {
    ui.statusCard.removeAttribute('data-result');
    const difficulty = window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty);
    ui.aiLevelBadge.hidden = state.mode !== 'computer';
    ui.aiLevelBadge.textContent = state.mode === 'computer' ? `IA · ${difficulty?.name || 'Médio'}` : '';
    if (!state.started) {
      ui.status.textContent = 'Pronto para jogar';
      ui.statusDetail.textContent = 'Escolha uma linha entre dois pontos vizinhos.';
      ui.statusMark.textContent = '●';
      ui.turnCard.dataset.player = 'a';
      ui.turnLabel.textContent = 'Jogador Azul';
    } else if (state.outcome?.type === 'win') {
      const winner = state.outcome.winner;
      ui.statusCard.dataset.result = winner;
      ui.status.textContent = `${playerName(winner)} venceu!`;
      ui.statusDetail.textContent = `${state.scores[winner]} quadrados conquistados. Comece outra partida para jogar novamente.`;
      ui.statusMark.textContent = '★';
      ui.turnCard.dataset.player = 'finished';
      ui.turnLabel.textContent = `Vitória do ${colors[winner].name}`;
    } else if (state.outcome?.type === 'draw') {
      ui.statusCard.dataset.result = 'draw';
      ui.status.textContent = 'Partida empatada';
      ui.statusDetail.textContent = 'Os dois jogadores conquistaram a mesma quantidade de quadrados.';
      ui.statusMark.textContent = '½';
      ui.turnCard.dataset.player = 'finished';
      ui.turnLabel.textContent = 'Empate';
    } else if (state.computerThinking && state.current === 'b') {
      ui.status.textContent = 'O computador está pensando…';
      ui.statusDetail.textContent = `A IA está no nível ${difficulty?.name || 'Médio'} e avaliando as linhas disponíveis.`;
      ui.statusMark.textContent = '✦';
      ui.turnCard.dataset.player = 'b';
      ui.turnLabel.textContent = 'Computador pensando…';
    } else if (state.inputLocked) {
      ui.status.textContent = 'Aguarde um instante…';
      ui.statusDetail.textContent = `Preparando a jogada de ${playerName(state.current)}.`;
      ui.statusMark.textContent = '✦';
      ui.turnCard.dataset.player = state.current;
      ui.turnLabel.textContent = `Próxima vez: Jogador ${colors[state.current].name}`;
    } else {
      ui.status.textContent = state.mode === 'computer' && state.current === 'a' ? 'Sua vez de jogar' : `Vez do jogador ${colors[state.current].name}`;
      ui.statusDetail.textContent = state.lastBoxCount
        ? `Fechou ${state.lastBoxCount} ${state.lastBoxCount === 1 ? 'quadrado' : 'quadrados'}! ${state.mode === 'computer' && state.current === 'a' ? 'Você' : 'Este jogador'} joga novamente.`
        : 'Trace uma linha entre dois pontos vizinhos.';
      ui.statusMark.textContent = '●';
      ui.turnCard.dataset.player = state.current;
      ui.turnLabel.textContent = playerName(state.current);
    }
    ui.bonusNote.hidden = !(state.lastBoxCount && !state.outcome && !state.inputLocked && !state.computerThinking);
    ui.bonusNote.textContent = state.lastBoxCount === 1 ? 'Fechou um quadrado! Jogue novamente.' : `Fechou ${state.lastBoxCount} quadrados! Jogue novamente.`;
    ui.undo.disabled = state.undoStack.length === 0 || state.inputLocked || state.computerThinking;
    ui.resultOverlay.hidden = !state.outcome;
    if (state.outcome?.type === 'win') {
      const winner = state.outcome.winner;
      ui.resultTitle.textContent = `${playerName(winner)} ganhou!`;
      ui.resultScore.textContent = `Marcou ${state.scores[winner]} de ${boxes.length} quadrados.`;
      ui.resultBreakdown.textContent = `Azul ${state.scores.a}  ·  Coral ${state.scores.b}`;
    } else if (state.outcome?.type === 'draw') {
      ui.resultTitle.textContent = 'Empate!';
      ui.resultScore.textContent = `Cada jogador marcou ${state.scores.a} de ${boxes.length} quadrados.`;
      ui.resultBreakdown.textContent = `Azul ${state.scores.a}  ·  Coral ${state.scores.b}`;
    }
  }
  function render() {
    renderBoard();
    renderPlayers();
    renderStatus();
    renderHistory();
  }
  function recordSnapshot() {
    state.undoStack.push({
      edgeOwners:new Map(state.edgeOwners), boxes:[...state.boxes], current:state.current,
      outcome:state.outcome ? { ...state.outcome } : null, scores:{ ...state.scores },
      history:state.history.map((move) => ({ ...move })), focusEdge:state.focusEdge, lastBoxCount:state.lastBoxCount
    });
  }
  function applyEdge(key, computerMove = false) {
    const edge = edgeMap.get(key);
    if (!edge || !state.started || state.outcome || state.inputLocked || state.edgeOwners.has(key)) return;
    if (computerMove) {
      if (state.mode !== 'computer' || state.current !== 'b' || !state.computerThinking) return;
    } else if (state.computerThinking || (state.mode === 'computer' && state.current === 'b')) return;
    recordSnapshot();
    const player = state.current;
    state.edgeOwners.set(key,player);
    const completed = [];
    for (const boxIndex of adjacentBoxes(edge)) {
      if (state.boxes[boxIndex] !== null) continue;
      const box = boxes[boxIndex];
      if (boxEdgeKeys(box.row,box.col).every((edgeKey) => state.edgeOwners.has(edgeKey))) {
        state.boxes[boxIndex] = player;
        completed.push(boxIndex);
        state.scores[player] += 1;
      }
    }
    state.lastBoxCount = completed.length;
    state.history.push({ player,key,boxCount:completed.length });
    if (completed.length) {
      window.CV_GAME_AUDIO?.playTone(620, .12, 'sine', .05);
      if (completed.length > 1) window.CV_GAME_AUDIO?.playTone(820, .16, 'triangle', .045);
    } else window.CV_GAME_AUDIO?.playTone(300, .055, 'square', .025);
    state.focusEdge = key;
    if (state.edgeOwners.size === edges.length) {
      if (state.scores.a === state.scores.b) state.outcome = { type:'draw' };
      else state.outcome = { type:'win', winner:state.scores.a > state.scores.b ? 'a' : 'b' };
    } else if (!completed.length) state.current = player === 'a' ? 'b' : 'a';
    state.computerThinking = state.mode === 'computer' && state.current === 'b' && !state.outcome;
    state.focusEdge = nearestOpenEdge(key)?.key || null;
    state.inputLocked = !state.outcome;
    render();
    if (state.inputLocked) {
      inputUnlockTimeout = window.setTimeout(() => {
        inputUnlockTimeout = null;
        state.inputLocked = false;
        render();
        if (state.computerThinking) scheduleComputerMove();
        else if (state.focusEdge) edgeMap.get(state.focusEdge)?.group.focus({ preventScroll:true });
      },450);
    } else if (state.outcome) ui.nextMatch.focus({ preventScroll:true });
    else if (state.focusEdge) edgeMap.get(state.focusEdge).group.focus({ preventScroll:true });
  }
  function scheduleComputerMove() {
    window.clearTimeout(computerTimer);
    const wait = window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty)?.wait || 430;
    computerTimer = window.setTimeout(() => {
      computerTimer = 0;
      if (!state.started || state.mode !== 'computer' || state.current !== 'b' || !state.computerThinking || state.outcome || state.inputLocked) return;
      const edge = chooseComputerEdge();
      if (!edge) { state.computerThinking = false; render(); return; }
      applyEdge(edge.key,true);
    },wait);
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

  function startMatch(mode = state.mode, difficulty = state.difficulty) {
    if (inputUnlockTimeout !== null) window.clearTimeout(inputUnlockTimeout);
    window.clearTimeout(computerTimer);
    inputUnlockTimeout = null;
    computerTimer = 0;
    state.inputLocked = false;
    state.computerThinking = false;
    state.mode = mode;
    state.difficulty = window.CV_GAMES_AI_DIFFICULTY?.set(gameId,difficulty) || difficulty;
    state.started = true;
    state.current = 'a';
    state.outcome = null;
    state.edgeOwners = new Map();
    state.boxes = Array(25).fill(null);
    state.scores = { a:0,b:0 };
    state.history = [];
    state.undoStack = [];
    state.lastBoxCount = 0;
    state.focusEdge = edges[0]?.key || null;
    lobby.hidden = true;
    gameView.hidden = false;
    enterMatchFullscreen();
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    render();
    if (state.focusEdge) edgeMap.get(state.focusEdge).group.focus({ preventScroll:true });
  }
  function openDifficultyPicker() {
    modeChoices.hidden = true;
    lobbyFootnote.hidden = true;
    difficultyPicker.hidden = false;
    lobbyCopy.querySelector('h2').textContent = 'Ajuste o desafio da IA';
    lobbyCopy.querySelector('p:last-child').textContent = 'Escolha o nível do computador. A decisão fica salva neste aparelho.';
    difficultyPicker.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function closeDifficultyPicker() {
    if (!difficultyPicker) return;
    difficultyPicker.hidden = true;
    modeChoices.hidden = false;
    lobbyFootnote.hidden = false;
    lobbyCopy.querySelector('h2').textContent = 'Quem vai jogar?';
    lobbyCopy.querySelector('p:last-child').textContent = 'Dispute o tabuleiro com alguém no mesmo dispositivo ou enfrente o computador.';
  }
  async function newGame() {
    if (state.history.length && !await window.CV_GAMES_DIALOG.confirm({
      title:'Começar uma nova partida?',
      message:'O tabuleiro e o placar desta partida serão zerados.',
      confirmText:'Nova partida', cancelText:'Continuar jogando'
    })) return;
    startMatch();
  }
  function restoreSnapshot(snapshot) {
    state.edgeOwners = snapshot.edgeOwners;
    state.boxes = snapshot.boxes;
    state.current = snapshot.current;
    state.outcome = snapshot.outcome;
    state.scores = snapshot.scores;
    state.history = snapshot.history;
    state.focusEdge = snapshot.focusEdge;
    state.lastBoxCount = snapshot.lastBoxCount;
  }
  function undoMove() {
    if (!state.undoStack.length || state.inputLocked || state.computerThinking) return;
    const undoLastPlayerGroup = (player) => {
      let changed = false;
      while (state.history.at(-1)?.player === player && state.undoStack.length) {
        restoreSnapshot(state.undoStack.pop());
        changed = true;
      }
      return changed;
    };
    if (state.mode === 'computer') {
      const lastPlayer = state.history.at(-1)?.player;
      if (lastPlayer === 'b') {
        undoLastPlayerGroup('b');
        undoLastPlayerGroup('a');
      } else undoLastPlayerGroup('a');
    } else restoreSnapshot(state.undoStack.pop());
    state.computerThinking = false;
    render();
    if (state.focusEdge) edgeMap.get(state.focusEdge)?.group.focus({ preventScroll:true });
  }
  function focusNextEdge(currentKey,dx,dy) {
    if (state.inputLocked || state.computerThinking || !state.started || state.outcome || (state.mode === 'computer' && state.current === 'b')) return;
    const current = edgeMap.get(currentKey);
    if (!current) return;
    const candidates = edges.filter((edge) => !state.edgeOwners.has(edge.key) && edge.key !== currentKey);
    const directional = candidates.filter((edge) => (edge.x - current.x) * dx + (edge.y - current.y) * dy > 0);
    const pool = directional.length ? directional : candidates;
    const next = pool.reduce((best,edge) => {
      const vx = edge.x - current.x;
      const vy = edge.y - current.y;
      const score = (vx * vx + vy * vy) + Math.abs(vx * dy - vy * dx) * step;
      const bestX = best.x - current.x;
      const bestY = best.y - current.y;
      const bestScore = (bestX * bestX + bestY * bestY) + Math.abs(bestX * dy - bestY * dx) * step;
      return score < bestScore ? edge : best;
    },pool[0]);
    if (!next) return;
    state.focusEdge = next.key;
    renderBoard();
    next.group.focus();
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
    ui.favorite.setAttribute('aria-label',`${active ? 'Remover' : 'Adicionar'} CV QUADRADOS ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    if (icon) icon.textContent = active ? '♥' : '♡';
    if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(window.CV_GAMES_COUNT_VISIBLE_FAVORITES?.() ?? favorites.size);
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
    const target = event.target.closest('[data-edge-key]');
    if (target) applyEdge(target.dataset.edgeKey);
  });
  boardElement.addEventListener('keydown',(event) => {
    const target = event.target.closest('[data-edge-key]');
    if (!target) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      applyEdge(target.dataset.edgeKey);
    } else if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      const vectors = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };
      const [dx,dy] = vectors[event.key];
      focusNextEdge(target.dataset.edgeKey,dx,dy);
    }
  });
  ui.start.addEventListener('click',() => startMatch('local'));
  ui.startComputer.addEventListener('click',openDifficultyPicker);
  difficultyBack.addEventListener('click',closeDifficultyPicker);
  document.addEventListener('cv-ai-difficulty-start',(event) => {
    if (event.detail?.gameKey === gameId) startMatch('computer',event.detail.difficulty);
  });
  document.addEventListener('cv-game-return-to-mode-menu', () => {
    if (inputUnlockTimeout !== null) window.clearTimeout(inputUnlockTimeout);
    window.clearTimeout(computerTimer);
    inputUnlockTimeout = null;
    computerTimer = 0;
    state.inputLocked = false;
    state.computerThinking = false;
    state.started = false;
    state.mode = 'local';
    closeDifficultyPicker();
  });
  ui.undo.addEventListener('click',undoMove);
  ui.newGame.addEventListener('click',newGame);
  ui.nextMatch.addEventListener('click',() => startMatch());
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
    if (event.key.toLowerCase() === 'u' && state.started && !state.inputLocked && !event.repeat && !event.ctrlKey && !event.metaKey) undoMove();
  });

  prepareMenu();
  createBoard();
  updateFavorite();
  syncThemeButton();
})();
