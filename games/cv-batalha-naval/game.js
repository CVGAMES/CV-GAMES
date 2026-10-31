(function () {
  'use strict';

  const profileName = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '')
    .trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
  if (!['educvv dev1', 'educvv dev'].includes(profileName)) return;

  const $ = (selector) => document.querySelector(selector);
  const gameId = 'cv-batalha-naval';
  const letters = 'ABCDEFGHIJ';
  const fleetTemplate = Object.freeze([
    { id:'carrier', name:'Porta-aviões', length:5, mark:'▰' },
    { id:'battleship', name:'Encouraçado', length:4, mark:'▰' },
    { id:'cruiser', name:'Cruzador', length:3, mark:'▰' },
    { id:'submarine', name:'Submarino', length:3, mark:'▰' },
    { id:'patrol', name:'Patrulha', length:2, mark:'▰' }
  ]);
  const lobby = $('[data-lobby]');
  const gameView = $('[data-game-view]');
  const modeChoices = $('[data-mode-choices]');
  const difficultyPicker = $('[data-ai-difficulty-picker]');
  const difficultyBack = $('[data-difficulty-back]');
  const deployStage = $('[data-deploy-stage]');
  const battleStage = $('[data-battle-stage]');
  const grids = {
    deploy:$('[data-deploy-board]'), enemy:$('[data-enemy-board]'), player:$('[data-player-board]')
  };
  const ui = {
    startComputer:$('[data-start-computer]'), deployColumns:$('[data-deploy-columns]'), deployRows:$('[data-deploy-rows]'),
    enemyColumns:$('[data-enemy-columns]'), enemyRows:$('[data-enemy-rows]'), playerColumns:$('[data-player-columns]'), playerRows:$('[data-player-rows]'),
    shipList:$('[data-ship-list]'), readyCount:$('[data-ready-count]'), deployHint:$('[data-deploy-hint]'), rotate:$('[data-rotate]'),
    orientation:$('[data-orientation-label]'), randomize:$('[data-randomize]'), clearFleet:$('[data-clear-fleet]'), deployStart:$('[data-deploy-start]'),
    topStatus:$('[data-top-status]'), aiLevelBadge:$('[data-ai-level-badge]'), turnStatus:$('[data-turn-status]'), turnTitle:$('[data-turn-title]'),
    turnDetail:$('[data-turn-detail]'), shotCounter:$('[data-shot-counter]'), enemyShipsLeft:$('[data-enemy-ships-left]'), battleLog:$('[data-battle-log]'),
    defenseHint:$('[data-defense-hint]'), newBattle:$('[data-new-battle]'), resultOverlay:$('[data-result-overlay]'), resultTitle:$('[data-result-title]'),
    resultDetail:$('[data-result-detail]'), resultPlayerShots:$('[data-result-player-shots]'), resultAiShots:$('[data-result-ai-shots]'),
    resultRematch:$('[data-result-rematch]'), favorite:$('[data-game-favorite]')
  };
  const state = {
    phase:'lobby', orientation:'h', selectedShip:'carrier', playerFleet:[], enemyFleet:[],
    enemyMarks:Array(100).fill('unknown'), playerMarks:Array(100).fill('unknown'),
    difficulty:window.CV_GAMES_AI_DIFFICULTY?.get(gameId) || 'medium', turn:'player', log:[],
    lastPlayerTarget:0, result:null
  };
  const cellButtons = { deploy:[], enemy:[], player:[] };
  let aiTimer = 0;

  function coordinate(index) { return `${letters[index % 10]}${Math.floor(index / 10) + 1}`; }
  function cellIndex(row,col) { return row * 10 + col; }
  function within(row,col) { return row >= 0 && row < 10 && col >= 0 && col < 10; }
  function coordinatesFor(start,length,orientation) {
    const row = Math.floor(start / 10);
    const col = start % 10;
    const cells = [];
    for (let offset = 0; offset < length; offset += 1) {
      const nextRow = row + (orientation === 'v' ? offset : 0);
      const nextCol = col + (orientation === 'h' ? offset : 0);
      if (!within(nextRow,nextCol)) return null;
      cells.push(cellIndex(nextRow,nextCol));
    }
    return cells;
  }
  function randomFleet() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const fleet = [];
      let failed = false;
      for (const template of fleetTemplate) {
        let placed = null;
        for (let tries = 0; tries < 450; tries += 1) {
          const start = Math.floor(Math.random() * 100);
          const orientation = Math.random() < .5 ? 'h' : 'v';
          const cells = coordinatesFor(start,template.length,orientation);
          if (cells && !fleet.some((ship) => cells.some((index) => ship.cells.includes(index)))) {
            placed = { ...template, cells, orientation, sunk:false };
            break;
          }
        }
        if (!placed) { failed = true; break; }
        fleet.push(placed);
      }
      if (!failed && fleet.length === fleetTemplate.length) return fleet;
    }
    return [];
  }
  function makeAxes(columnsElement,rowsElement) {
    columnsElement.replaceChildren(...Array.from(letters, (letter) => {
      const item = document.createElement('span'); item.textContent = letter; return item;
    }));
    rowsElement.replaceChildren(...Array.from({ length:10 },(_,index) => {
      const item = document.createElement('span'); item.textContent = String(index + 1); return item;
    }));
  }
  function makeGrid(kind,element) {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 100; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'naval-cell';
      button.dataset.cell = String(index);
      button.dataset.grid = kind;
      button.setAttribute('role','gridcell');
      button.tabIndex = index === 0 ? 0 : -1;
      fragment.append(button);
      cellButtons[kind].push(button);
    }
    element.replaceChildren(fragment);
    element.addEventListener('keydown',(event) => navigateGrid(event,kind));
  }
  function navigateGrid(event,kind) {
    const vectors = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
    const vector = vectors[event.key];
    if (!vector) return;
    const button = event.target.closest('[data-cell]');
    if (!button) return;
    event.preventDefault();
    let row = Math.floor(Number(button.dataset.cell) / 10);
    let col = Number(button.dataset.cell) % 10;
    for (let tries = 0; tries < 10; tries += 1) {
      row += vector[0]; col += vector[1];
      if (!within(row,col)) return;
      const next = cellButtons[kind][cellIndex(row,col)];
      if (!next.disabled) {
        cellButtons[kind].forEach((cell) => { cell.tabIndex = -1; });
        next.tabIndex = 0; next.focus(); return;
      }
    }
  }
  function shipAt(fleet,index) { return fleet.find((ship) => ship.cells.includes(index)) || null; }
  function clearCellStyle(button) {
    button.className = 'naval-cell';
    button.textContent = '';
  }
  function renderSetupBoard() {
    const selected = fleetTemplate.find((ship) => ship.id === state.selectedShip);
    for (let index = 0; index < 100; index += 1) {
      const button = cellButtons.deploy[index];
      const ship = shipAt(state.playerFleet,index);
      clearCellStyle(button);
      button.disabled = false;
      if (ship) {
        button.classList.add('is-ship',`ship-${ship.id}`);
        const position = ship.cells.indexOf(index);
        if (position === 0) button.classList.add('ship-bow');
        if (position === ship.cells.length - 1) button.classList.add('ship-stern');
        button.textContent = position === 0 ? '◆' : '•';
        button.setAttribute('aria-label',`Casa ${coordinate(index)}, ${ship.name}. Toque para reposicionar este navio.`);
      } else {
        button.setAttribute('aria-label',`Casa ${coordinate(index)}, água. Posicionar ${selected?.name || 'navio'} aqui.`);
      }
    }
  }
  function renderShipList() {
    ui.shipList.replaceChildren();
    for (const template of fleetTemplate) {
      const placed = state.playerFleet.find((ship) => ship.id === template.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `naval-ship-choice${state.selectedShip === template.id && !placed ? ' is-selected' : ''}${placed ? ' is-placed' : ''}`;
      button.dataset.shipId = template.id;
      button.disabled = Boolean(placed);
      const icon = document.createElement('span'); icon.className = 'naval-ship-silhouette'; icon.textContent = template.mark.repeat(template.length);
      const copy = document.createElement('span'); copy.className = 'naval-ship-copy';
      const name = document.createElement('strong'); name.textContent = template.name;
      const length = document.createElement('small'); length.textContent = `${template.length} casas`;
      copy.append(name,length);
      const stateLabel = document.createElement('em'); stateLabel.textContent = placed ? 'Posicionado' : state.selectedShip === template.id ? 'Selecionado' : 'Aguardando';
      button.append(icon,copy,stateLabel);
      ui.shipList.append(button);
    }
    const placed = state.playerFleet.length;
    ui.readyCount.textContent = `${placed} / ${fleetTemplate.length} prontos`;
    ui.deployStart.disabled = placed !== fleetTemplate.length;
    ui.orientation.textContent = state.orientation === 'h' ? 'Horizontal' : 'Vertical';
    ui.rotate.setAttribute('aria-label',`Girar navio. Orientação atual: ${state.orientation === 'h' ? 'horizontal' : 'vertical'}`);
    if (placed === fleetTemplate.length) ui.deployHint.textContent = 'Frota pronta. Confira o mapa e inicie a batalha.';
    else ui.deployHint.textContent = `Posicione ${fleetTemplate.find((ship) => ship.id === state.selectedShip)?.name || 'o próximo navio'} no mapa. Clique em um navio já posto para movê-lo.`;
  }
  function renderBattleBoard(kind,fleet,marks) {
    for (let index = 0; index < 100; index += 1) {
      const button = cellButtons[kind][index];
      const ship = shipAt(fleet,index);
      const mark = marks[index];
      clearCellStyle(button);
      if (ship && kind === 'player') button.classList.add('is-ship',`ship-${ship.id}`);
      if (mark === 'miss') { button.classList.add('is-miss'); button.textContent = ''; }
      else if (mark === 'hit') { button.classList.add('is-hit'); button.textContent = '✕'; }
      else if (mark === 'sunk') { button.classList.add('is-sunk'); button.textContent = '✕'; }
      else if (ship && kind === 'player') button.textContent = '•';
      const targetable = kind === 'enemy' && state.phase === 'battle' && state.turn === 'player' && mark === 'unknown';
      button.disabled = kind === 'enemy' ? !targetable : true;
      if (kind === 'enemy') {
        const label = mark === 'unknown' ? `Casa ${coordinate(index)}, alvo não verificado. Disparar.` : `Casa ${coordinate(index)}, ${mark === 'miss' ? 'água' : mark === 'sunk' ? 'navio afundado' : 'acerto'}.`;
        button.setAttribute('aria-label',label);
      } else {
        const label = ship ? `Casa ${coordinate(index)}, ${ship.name}${mark === 'miss' ? ', recebeu um disparo na água próxima' : mark === 'hit' ? ', atingido' : mark === 'sunk' ? ', afundado' : ''}.` : `Casa ${coordinate(index)}, água${mark === 'miss' ? ', disparo recebido' : ''}.`;
        button.setAttribute('aria-label',label);
      }
    }
  }
  function renderLog() {
    if (!state.log.length) {
      const empty = document.createElement('li'); empty.textContent = 'Aguardando o primeiro disparo.'; ui.battleLog.replaceChildren(empty); return;
    }
    const items = state.log.slice(0,7).map((entry,index) => {
      const item = document.createElement('li');
      if (index === 0) item.classList.add('is-latest');
      item.dataset.result = entry.type;
      const stamp = document.createElement('span'); stamp.textContent = entry.coordinate;
      const message = document.createElement('strong'); message.textContent = entry.message;
      item.append(stamp,message); return item;
    });
    ui.battleLog.replaceChildren(...items);
  }
  function addLog(coordinateLabel,message,type) {
    state.log.unshift({ coordinate:coordinateLabel, message, type });
    state.log = state.log.slice(0,16);
  }
  function render() {
    const inBattle = state.phase === 'battle' || state.phase === 'result';
    deployStage.hidden = state.phase !== 'setup';
    battleStage.hidden = !inBattle;
    ui.topStatus.textContent = state.phase === 'setup' ? 'Preparação da frota' : state.phase === 'result' ? 'Batalha encerrada' : inBattle ? 'Batalha em andamento' : 'Pronto para zarpar';
    const difficulty = window.CV_GAMES_AI_DIFFICULTY?.getDetails?.(state.difficulty);
    ui.aiLevelBadge.hidden = state.phase === 'lobby';
    ui.aiLevelBadge.textContent = `IA · ${difficulty?.name || 'Médio'}`;
    if (state.phase === 'setup') {
      renderSetupBoard(); renderShipList();
    }
    if (inBattle) {
      renderBattleBoard('enemy',state.enemyFleet,state.enemyMarks);
      renderBattleBoard('player',state.playerFleet,state.playerMarks);
      const enemyRemaining = state.enemyFleet.filter((ship) => !ship.sunk).length;
      ui.enemyShipsLeft.textContent = `Navios restantes: ${enemyRemaining} / 5`;
      const shots = state.enemyMarks.filter((mark) => mark !== 'unknown').length;
      ui.shotCounter.textContent = `${shots} ${shots === 1 ? 'disparo' : 'disparos'}`;
      ui.turnStatus.dataset.turn = state.turn;
      if (state.phase === 'result') {
        ui.turnTitle.textContent = state.result === 'player' ? 'Vitória: setor limpo' : 'Sua frota foi derrotada';
        ui.turnDetail.textContent = state.result === 'player' ? 'Todos os navios inimigos foram localizados.' : 'O computador encontrou o último navio da sua frota.';
      } else if (state.turn === 'computer') {
        ui.turnTitle.textContent = 'O computador está mirando…';
        ui.turnDetail.textContent = `A frota adversária está no nível ${difficulty?.name || 'Médio'}.`;
      } else {
        ui.turnTitle.textContent = 'Sua vez de disparar';
        ui.turnDetail.textContent = 'Escolha uma casa ainda não verificada no mapa inimigo.';
      }
      ui.defenseHint.textContent = `${state.playerFleet.filter((ship) => !ship.sunk).length} navios aliados ainda navegando.`;
      renderLog();
    }
    ui.resultOverlay.hidden = state.phase !== 'result';
  }
  function nextUnplacedShip() {
    return fleetTemplate.find((template) => !state.playerFleet.some((ship) => ship.id === template.id))?.id || null;
  }
  function placeSelectedShip(index) {
    const template = fleetTemplate.find((ship) => ship.id === state.selectedShip);
    if (!template) { ui.deployHint.textContent = 'Sua frota já está completa. Toque em um navio para reposicioná-lo.'; return; }
    const cells = coordinatesFor(index,template.length,state.orientation);
    if (!cells) { ui.deployHint.textContent = `O ${template.name} não cabe nessa direção. Gire o navio ou escolha outra casa.`; return; }
    if (state.playerFleet.some((ship) => cells.some((cell) => ship.cells.includes(cell)))) {
      ui.deployHint.textContent = 'Esse espaço já está ocupado. Escolha outra casa para o navio.'; return;
    }
    state.playerFleet.push({ ...template,cells,orientation:state.orientation,sunk:false });
    window.CV_GAME_AUDIO?.playTone(470,.08,'triangle',.035);
    state.selectedShip = nextUnplacedShip();
    render();
  }
  function removeShipAt(index) {
    const ship = shipAt(state.playerFleet,index);
    if (!ship) return false;
    state.playerFleet = state.playerFleet.filter((item) => item.id !== ship.id);
    state.selectedShip = ship.id;
    ui.deployHint.textContent = `${ship.name} removido. Escolha uma nova posição.`;
    render();
    return true;
  }
  function randomizePlayerFleet() {
    const fleet = randomFleet();
    if (!fleet.length) { ui.deployHint.textContent = 'Não foi possível sortear a frota. Tente novamente.'; return; }
    state.playerFleet = fleet;
    state.selectedShip = null;
    window.CV_GAME_AUDIO?.playTone(560,.12,'sine',.04);
    render();
  }
  function clearPlayerFleet() {
    state.playerFleet = [];
    state.selectedShip = fleetTemplate[0].id;
    state.orientation = 'h';
    render();
  }
  function resetBattleState() {
    window.clearTimeout(aiTimer); aiTimer = 0;
    state.phase = 'setup'; state.orientation = 'h'; state.selectedShip = fleetTemplate[0].id;
    state.playerFleet = []; state.enemyFleet = [];
    state.enemyMarks = Array(100).fill('unknown'); state.playerMarks = Array(100).fill('unknown');
    state.turn = 'player'; state.log = []; state.lastPlayerTarget = 0; state.result = null;
  }
  function startDeployment(difficulty = state.difficulty) {
    window.clearTimeout(aiTimer); aiTimer = 0;
    state.difficulty = window.CV_GAMES_AI_DIFFICULTY?.set(gameId,difficulty) || difficulty;
    resetBattleState();
    lobby.hidden = true; gameView.hidden = false;
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    render();
    cellButtons.deploy[0]?.focus({ preventScroll:true });
  }
  function beginBattle() {
    if (state.phase !== 'setup' || state.playerFleet.length !== fleetTemplate.length) return;
    state.enemyFleet = randomFleet();
    if (!state.enemyFleet.length) { ui.deployHint.textContent = 'A frota adversária não pôde ser preparada. Tente iniciar novamente.'; return; }
    state.phase = 'battle'; state.turn = 'player';
    state.enemyMarks = Array(100).fill('unknown'); state.playerMarks = Array(100).fill('unknown');
    state.log = [{ coordinate:'—',message:'A batalha começou. Você dispara primeiro.',type:'info' }];
    window.CV_GAME_AUDIO?.playTone(660,.16,'triangle',.05);
    render();
    focusFirstOpen(cellButtons.enemy,state.enemyMarks,0);
  }
  function focusFirstOpen(buttons,marks,preferred = 0) {
    let target = -1;
    for (let offset = 0; offset < 100; offset += 1) {
      const index = (preferred + offset) % 100;
      if (marks[index] === 'unknown' && !buttons[index].disabled) { target = index; break; }
    }
    if (target < 0) return;
    buttons.forEach((button,index) => { button.tabIndex = index === target ? 0 : -1; });
    buttons[target].focus({ preventScroll:true });
  }
  function applyShot(fleet,marks,index) {
    const ship = shipAt(fleet,index);
    if (!ship) { marks[index] = 'miss'; return { hit:false,sunk:null }; }
    marks[index] = 'hit';
    if (ship.cells.every((cell) => marks[cell] === 'hit' || marks[cell] === 'sunk')) {
      ship.sunk = true;
      ship.cells.forEach((cell) => { marks[cell] = 'sunk'; });
      return { hit:true,sunk:ship };
    }
    return { hit:true,sunk:null };
  }
  function allSunk(fleet) { return fleet.length > 0 && fleet.every((ship) => ship.sunk); }
  function playerFire(index) {
    if (state.phase !== 'battle' || state.turn !== 'player' || state.enemyMarks[index] !== 'unknown') return;
    state.lastPlayerTarget = index;
    const shot = applyShot(state.enemyFleet,state.enemyMarks,index);
    const location = coordinate(index);
    if (shot.sunk) {
      addLog(location,`Alvo afundado: ${shot.sunk.name}.`,'sunk');
      window.CV_GAME_AUDIO?.playTone(210,.22,'sawtooth',.045);
    } else if (shot.hit) {
      addLog(location,'Acerto confirmado.','hit');
      window.CV_GAME_AUDIO?.playTone(520,.12,'triangle',.045);
    } else {
      addLog(location,'Água. Nenhum contato neste setor.','miss');
      window.CV_GAME_AUDIO?.playTone(280,.08,'sine',.035);
    }
    if (allSunk(state.enemyFleet)) { finishGame('player'); return; }
    state.turn = 'computer';
    render();
    aiTimer = window.setTimeout(computerFire,650);
  }
  function hitClusters(indices) {
    const remaining = new Set(indices);
    const clusters = [];
    while (remaining.size) {
      const first = remaining.values().next().value;
      remaining.delete(first);
      const cluster = [first];
      for (let cursor = 0; cursor < cluster.length; cursor += 1) {
        const cell = cluster[cursor];
        const row = Math.floor(cell / 10), col = cell % 10;
        const neighbors = [[row-1,col],[row+1,col],[row,col-1],[row,col+1]];
        for (const [nextRow,nextCol] of neighbors) {
          if (!within(nextRow,nextCol)) continue;
          const next = cellIndex(nextRow,nextCol);
          if (remaining.has(next)) { remaining.delete(next); cluster.push(next); }
        }
      }
      clusters.push(cluster);
    }
    return clusters;
  }
  function aiTargetScores() {
    const scores = Array(100).fill(0);
    const activeHits = state.playerMarks.flatMap((mark,index) => mark === 'hit' ? [index] : []);
    const clusters = hitClusters(activeHits);
    const neighborBonus = state.difficulty === 'expert' ? 14 : 5;
    for (const hit of activeHits) {
      const row = Math.floor(hit / 10), col = hit % 10;
      for (const [nextRow,nextCol] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) {
        if (!within(nextRow,nextCol)) continue;
        const next = cellIndex(nextRow,nextCol);
        if (state.playerMarks[next] === 'unknown') scores[next] += neighborBonus;
      }
    }
    for (const cluster of clusters) {
      if (cluster.length < 2) continue;
      const rows = new Set(cluster.map((cell) => Math.floor(cell / 10)));
      const cols = new Set(cluster.map((cell) => cell % 10));
      const ends = [];
      if (rows.size === 1) {
        const row = Math.floor(cluster[0] / 10);
        const sorted = cluster.map((cell) => cell % 10).sort((a,b) => a-b);
        ends.push([row,sorted[0]-1],[row,sorted[sorted.length-1]+1]);
      } else if (cols.size === 1) {
        const col = cluster[0] % 10;
        const sorted = cluster.map((cell) => Math.floor(cell / 10)).sort((a,b) => a-b);
        ends.push([sorted[0]-1,col],[sorted[sorted.length-1]+1,col]);
      }
      for (const [row,col] of ends) if (within(row,col)) {
        const index = cellIndex(row,col);
        if (state.playerMarks[index] === 'unknown') scores[index] += state.difficulty === 'expert' ? 30 : 12;
      }
    }
    const lengths = state.playerFleet.filter((ship) => !ship.sunk).map((ship) => ship.length);
    for (const length of lengths) {
      for (const orientation of ['h','v']) {
        for (let start = 0; start < 100; start += 1) {
          const cells = coordinatesFor(start,length,orientation);
          if (!cells || cells.some((cell) => state.playerMarks[cell] === 'miss' || state.playerMarks[cell] === 'sunk')) continue;
          const hitCount = cells.filter((cell) => state.playerMarks[cell] === 'hit').length;
          const weight = hitCount ? (state.difficulty === 'expert' ? 4.5 : 2.4) + hitCount : activeHits.length ? .55 : 1;
          for (const cell of cells) if (state.playerMarks[cell] === 'unknown') scores[cell] += weight;
        }
      }
    }
    return scores;
  }
  function chooseComputerTarget() {
    const candidates = state.playerMarks.flatMap((mark,index) => mark === 'unknown' ? [index] : []);
    if (!candidates.length) return null;
    if (state.difficulty === 'easy') return candidates[Math.floor(Math.random() * candidates.length)];
    const hits = state.playerMarks.flatMap((mark,index) => mark === 'hit' ? [index] : []);
    if (state.difficulty === 'medium' && hits.length) {
      const adjacent = [];
      for (const hit of hits) {
        const row = Math.floor(hit / 10), col = hit % 10;
        for (const [r,c] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) {
          if (within(r,c)) { const index = cellIndex(r,c); if (state.playerMarks[index] === 'unknown') adjacent.push(index); }
        }
      }
      if (adjacent.length && Math.random() < .82) return adjacent[Math.floor(Math.random() * adjacent.length)];
    }
    const scores = aiTargetScores();
    const ranked = candidates.map((index) => ({ index,score:scores[index] })).sort((a,b) => b.score - a.score);
    const bestScore = ranked[0].score;
    if (state.difficulty === 'expert') return ranked.find((item) => item.score === bestScore).index;
    const top = ranked.filter((item) => item.score >= bestScore * .82).slice(0,Math.min(4,ranked.length));
    return top[Math.floor(Math.random() * top.length)].index;
  }
  function computerFire() {
    aiTimer = 0;
    if (state.phase !== 'battle' || state.turn !== 'computer') return;
    const target = chooseComputerTarget();
    if (target === null) { finishGame('player'); return; }
    const shot = applyShot(state.playerFleet,state.playerMarks,target);
    const location = coordinate(target);
    if (shot.sunk) {
      addLog(location,`O computador afundou seu ${shot.sunk.name}.`,'sunk');
      window.CV_GAME_AUDIO?.playTone(195,.24,'sawtooth',.05);
    } else if (shot.hit) {
      addLog(location,'O computador acertou um navio seu.','hit');
      window.CV_GAME_AUDIO?.playTone(350,.14,'triangle',.045);
    } else {
      addLog(location,'O disparo do computador caiu na água.','miss');
      window.CV_GAME_AUDIO?.playTone(250,.08,'sine',.035);
    }
    if (allSunk(state.playerFleet)) { finishGame('computer'); return; }
    state.turn = 'player';
    render();
    focusFirstOpen(cellButtons.enemy,state.enemyMarks,state.lastPlayerTarget);
  }
  function finishGame(winner) {
    window.clearTimeout(aiTimer); aiTimer = 0;
    state.phase = 'result'; state.result = winner;
    const playerShots = state.enemyMarks.filter((mark) => mark !== 'unknown').length;
    const aiShots = state.playerMarks.filter((mark) => mark !== 'unknown').length;
    ui.resultTitle.textContent = winner === 'player' ? 'Vitória naval!' : 'A frota foi derrotada';
    ui.resultDetail.textContent = winner === 'player'
      ? `Você encontrou os cinco navios em ${playerShots} disparos.`
      : `O computador encontrou toda a sua frota em ${aiShots} disparos.`;
    ui.resultPlayerShots.textContent = String(playerShots);
    ui.resultAiShots.textContent = String(aiShots);
    window.CV_GAME_AUDIO?.playTone(winner === 'player' ? 740 : 190,.34,'triangle',.055);
    render();
    ui.resultRematch.focus({ preventScroll:true });
  }
  function openDifficultyPicker() {
    modeChoices.hidden = true;
    difficultyPicker.hidden = false;
    difficultyPicker.scrollIntoView({ behavior:'smooth',block:'center' });
  }
  function closeDifficultyPicker() {
    difficultyPicker.hidden = true;
    modeChoices.hidden = false;
  }
  async function newBattle() {
    if (state.phase === 'battle' || state.playerFleet.length) {
      const confirmed = await window.CV_GAMES_DIALOG?.confirm?.({
        title:'Preparar outra batalha?',
        message:'O mapa e o progresso desta batalha serão zerados.',
        confirmText:'Nova batalha',cancelText:'Continuar jogando'
      });
      if (!confirmed) return;
    }
    startDeployment(state.difficulty);
  }
  function getFavorites() {
    try {
      const stored = JSON.parse(localStorage.getItem('cv-games-favorites') || '[]');
      return new Set(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
    } catch { return new Set(); }
  }
  function updateFavorite() {
    const favorites = getFavorites();
    const active = favorites.has(gameId);
    ui.favorite.setAttribute('aria-pressed',String(active));
    ui.favorite.setAttribute('aria-label',`${active ? 'Remover' : 'Adicionar'} CV BATALHA NAVAL ${active ? 'dos' : 'aos'} favoritos`);
    ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    ui.favorite.querySelector('.favorite-icon').textContent = active ? '♥' : '♡';
    ui.favorite.querySelector('[data-favorite-label]').textContent = active ? 'Favoritado' : 'Favoritar';
    ui.favorite.querySelector('[data-favorite-count]').textContent = String(window.CV_GAMES_COUNT_VISIBLE_FAVORITES?.() ?? favorites.size);
  }
  function toggleFavorite() {
    const favorites = getFavorites();
    if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem('cv-games-favorites',JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch {}
    updateFavorite();
  }
  function prepareMenu() {
    const menuButton = $('[data-menu-toggle]');
    const menu = $('[data-primary-nav]');
    menuButton?.addEventListener('click',() => {
      const open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded',String(open));
    });
    menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click',() => {
      menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false');
    }));
  }
  function syncThemeButton() {
    const button = $('[data-theme-toggle]');
    if (!button) return;
    const dark = document.documentElement.dataset.theme !== 'light';
    button.textContent = dark ? '🌙' : '☀️';
    button.setAttribute('aria-label',dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    button.title = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
  }

  makeAxes(ui.deployColumns,ui.deployRows);
  makeAxes(ui.enemyColumns,ui.enemyRows);
  makeAxes(ui.playerColumns,ui.playerRows);
  makeGrid('deploy',grids.deploy);
  makeGrid('enemy',grids.enemy);
  makeGrid('player',grids.player);
  render();

  grids.deploy.addEventListener('click',(event) => {
    const button = event.target.closest('[data-cell]');
    if (!button || state.phase !== 'setup') return;
    const index = Number(button.dataset.cell);
    if (!removeShipAt(index)) placeSelectedShip(index);
  });
  grids.enemy.addEventListener('click',(event) => {
    const button = event.target.closest('[data-cell]');
    if (button) playerFire(Number(button.dataset.cell));
  });
  ui.shipList.addEventListener('click',(event) => {
    const button = event.target.closest('[data-ship-id]');
    if (!button || button.disabled) return;
    state.selectedShip = button.dataset.shipId;
    render();
  });
  ui.rotate.addEventListener('click',() => { state.orientation = state.orientation === 'h' ? 'v' : 'h'; render(); });
  ui.randomize.addEventListener('click',randomizePlayerFleet);
  ui.clearFleet.addEventListener('click',clearPlayerFleet);
  ui.deployStart.addEventListener('click',beginBattle);
  ui.startComputer.addEventListener('click',openDifficultyPicker);
  difficultyBack.addEventListener('click',closeDifficultyPicker);
  document.addEventListener('cv-ai-difficulty-start',(event) => {
    if (event.detail?.gameKey === gameId) startDeployment(event.detail.difficulty);
  });
  ui.newBattle.addEventListener('click',newBattle);
  ui.resultRematch.addEventListener('click',() => startDeployment(state.difficulty));
  ui.favorite.addEventListener('click',toggleFavorite);
  document.addEventListener('cv-games-favorites-change',updateFavorite);
  document.addEventListener('cv-game-return-to-mode-menu',() => {
    window.clearTimeout(aiTimer); aiTimer = 0;
    state.phase = 'lobby'; state.turn = 'player'; state.result = null;
    closeDifficultyPicker();
  });
  $('[data-theme-toggle]')?.addEventListener('click',() => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cv-games-theme',theme); } catch {}
    syncThemeButton();
  });
  document.addEventListener('keydown',(event) => {
    if (event.key.toLowerCase() === 'r' && state.phase === 'setup' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable="true"]')) {
      event.preventDefault(); state.orientation = state.orientation === 'h' ? 'v' : 'h'; render();
    }
  });

  prepareMenu();
  updateFavorite();
  syncThemeButton();
})();
