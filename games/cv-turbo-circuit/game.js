(() => {
  'use strict';

  if (document.documentElement.dataset.turboAccess !== 'granted') return;

  const GAME_ID = 'cv-turbo-circuit';
  const CONTROL_KEY = 'cv-games-cv-turbo-circuit-control';
  const UNLOCK_KEY = 'cv-games-cv-turbo-circuit-unlocked';
  const LAPS = 3;
  const DAMAGE_LIMIT = 5;
  const ROAD_WIDTH = 132;
  const $ = (selector) => document.querySelector(selector);
  const canvas = $('[data-race-canvas]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  window.CV_GAMES_STATS?.registerAccess?.(GAME_ID);

  const ui = {
    panel: $('#turbo-game-panel'), stageRoot: $('[data-stage-root]'), startScreen: $('[data-start-screen]'),
    pauseScreen: $('[data-pause-screen]'), resultsScreen: $('[data-results-screen]'), settings: $('[data-settings-modal]'),
    exitModal: $('[data-exit-modal]'), countdown: $('[data-countdown]'), stage: $('[data-stage]'), startStage: $('[data-start-stage]'),
    unlocked: $('[data-unlocked-label]'), lap: $('[data-lap]'), position: $('[data-position]'), speed: $('[data-speed]'),
    damage: $('[data-damage-track]'), summary: $('[data-control-summary]'), status: $('[data-race-status]'),
    resultIcon: $('[data-result-icon]'), resultKicker: $('[data-result-kicker]'), resultTitle: $('[data-result-title]'),
    playerPlace: $('[data-player-place]'), podium: $('[data-podium]'), resultNote: $('[data-result-note]'),
    nextRace: $('[data-next-race]'), joystick: $('[data-joystick]'), joystickNub: $('[data-joystick-nub]'),
    audio: $('[data-game-audio]')
  };

  const rawPath = [
    [500,96],[755,101],[860,150],[900,245],[900,325],[825,390],[715,402],[645,465],
    [665,535],[750,572],[845,578],[900,650],[900,765],[835,855],[690,900],[500,900],
    [310,900],[165,855],[100,765],[100,300],[135,180],[245,110]
  ];
  const track = buildTrack(rawPath, 16);
  const stages = [
    { name:'Pista Aurora', sky:'#10201f', turf:'#244a3c', asphalt:'#343b3c', trim:'#f18b4e' },
    { name:'Costa Rubra', sky:'#1e1a1c', turf:'#514036', asphalt:'#39393b', trim:'#ff7253' },
    { name:'Bosque Neon', sky:'#111f20', turf:'#274d45', asphalt:'#323c3b', trim:'#73e0bb' },
    { name:'Deserto Turbo', sky:'#24201b', turf:'#685037', asphalt:'#3d3b38', trim:'#ffd06d' },
    { name:'Grande Final', sky:'#171827', turf:'#353450', asphalt:'#30353d', trim:'#bd9aff' }
  ];
  const rivalData = [
    { name:'Rubi', color:'#f3534b', stripe:'#ffd1ad', lane:-32, skill:.91 },
    { name:'Vórtice', color:'#a66bff', stripe:'#e5d3ff', lane:31, skill:.94 },
    { name:'Faísca', color:'#ffd24f', stripe:'#fff3ad', lane:-10, skill:.89 },
    { name:'Cometa', color:'#53c8f1', stripe:'#c9f3ff', lane:13, skill:.96 }
  ];
  const stageLabel = (number) => `ETAPA ${String(number).padStart(2,'0')} / 05`;
  const readUnlocked = () => {
    try { return Math.max(1, Math.min(5, Number(localStorage.getItem(UNLOCK_KEY)) || 1)); } catch { return 1; }
  };
  const readControlMode = () => {
    try {
      const saved = localStorage.getItem(CONTROL_KEY);
      if (saved === 'keyboard' || saved === 'analog') return saved;
    } catch { /* Usa a escolha automática. */ }
    return matchMedia('(pointer: coarse)').matches ? 'analog' : 'keyboard';
  };
  const state = {
    mode:'intro', controlMode:readControlMode(), unlocked:readUnlocked(), selectedStage:readUnlocked(),
    cars:[], keys:new Set(), pressed:new Set(), joystickPointer:null, joystick:{x:0,y:0},
    width:1000,height:1000,lastFrame:0,elapsed:0,countdown:0,started:false,uiTimer:0,
    playerAir:0,offRoad:0,collisionCooldown:0,finishDeadline:0,stageIndex:0,playerProgress:0,lastAlong:0,
    decor:makeDecor(),
  };

  const favoriteKey = 'cv-games-favorites';
  const favoriteButton = $('[data-game-favorite]');
  function readFavorites() {
    try { const saved=JSON.parse(localStorage.getItem(favoriteKey)||'[]');return new Set(Array.isArray(saved)?saved.filter((id)=>typeof id==='string'):[]); }
    catch { return new Set(); }
  }
  function updateFavorite() {
    const favorites=readFavorites();
    const active=favorites.has(GAME_ID);
    favoriteButton?.setAttribute('aria-pressed',String(active));
    if(favoriteButton){
      favoriteButton.setAttribute('aria-label',`${active?'Remover':'Adicionar'} CV TURBO CIRCUIT ${active?'dos':'aos'} favoritos`);
      favoriteButton.title=active?'Remover dos favoritos':'Adicionar aos favoritos';
      const icon=favoriteButton.querySelector('.favorite-icon');
      const label=favoriteButton.querySelector('[data-favorite-label]');
      const count=favoriteButton.querySelector('[data-favorite-count]');
      if(icon)icon.textContent=active?'♥':'♡';
      if(label)label.textContent=active?'Favoritado':'Favoritar';
      if(count)count.textContent=String(favorites.size);
    }
  }

  function syncThemeButton() {
    const button=$('[data-theme-toggle]');
    if(!button)return;
    const light=document.documentElement.dataset.theme==='light';
    button.textContent=light?'☀️':'🌙';
    button.setAttribute('aria-label',light?'Ativar modo escuro':'Ativar modo claro');
    button.title=light?'Ativar modo escuro':'Ativar modo claro';
  }

  function buildTrack(points, steps) {
    const samples = [];
    for (let i = 0; i < points.length; i += 1) {
      const p0 = points[(i - 1 + points.length) % points.length];
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const p3 = points[(i + 2) % points.length];
      for (let step = 0; step < steps; step += 1) {
        const t = step / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = .5 * ((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3);
        const y = .5 * ((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3);
        samples.push({x,y,distance:0});
      }
    }
    let length = 0;
    for (let i = 0; i < samples.length; i += 1) {
      if (i) length += Math.hypot(samples[i].x - samples[i-1].x, samples[i].y - samples[i-1].y);
      samples[i].distance = length;
    }
    const last = samples[samples.length-1];
    length += Math.hypot(samples[0].x - last.x, samples[0].y - last.y);
    return {samples,length};
  }

  function makeDecor() {
    const items = [];
    for (let i = 0; i < track.samples.length; i += 13) {
      const sample = track.samples[i];
      const previous = track.samples[(i - 1 + track.samples.length) % track.samples.length];
      const next = track.samples[(i + 1) % track.samples.length];
      const tx = next.x - previous.x;
      const ty = next.y - previous.y;
      const mag = Math.hypot(tx,ty) || 1;
      const side = i % 2 ? 1 : -1;
      const offset = ROAD_WIDTH * (.72 + ((i * 17) % 34) / 100) * side;
      const nx = -ty / mag;
      const ny = tx / mag;
      items.push({x:sample.x + nx*offset, y:sample.y + ny*offset, size:5 + ((i*7)%8), phase:i%3});
    }
    return items;
  }

  function sampleTrack(distance) {
    let d = distance % track.length;
    if (d < 0) d += track.length;
    let low = 0;
    let high = track.samples.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (track.samples[mid].distance <= d) low = mid;
      else high = mid - 1;
    }
    const a = track.samples[low];
    const b = track.samples[(low + 1) % track.samples.length];
    const endDistance = low + 1 < track.samples.length ? b.distance : track.length;
    const span = Math.max(.0001, endDistance - a.distance);
    const t = (d - a.distance) / span;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const angle = Math.atan2(dy,dx);
    return {x:a.x + dx*t,y:a.y + dy*t,angle,tx:Math.cos(angle),ty:Math.sin(angle),nx:-Math.sin(angle),ny:Math.cos(angle),along:d};
  }

  function findTrackPoint(x,y) {
    let best = null;
    let bestDistance = Infinity;
    for (let i=0;i<track.samples.length;i+=1) {
      const p = track.samples[i];
      const dx = x-p.x;
      const dy = y-p.y;
      const distance = dx*dx + dy*dy;
      if (distance < bestDistance) {
        const prev = track.samples[(i-1+track.samples.length)%track.samples.length];
        const next = track.samples[(i+1)%track.samples.length];
        const angle = Math.atan2(next.y-prev.y,next.x-prev.x);
        const nx = -Math.sin(angle);
        const ny = Math.cos(angle);
        bestDistance = distance;
        best = {x:p.x,y:p.y,angle,along:p.distance,offset:dx*nx+dy*ny,distance:Math.sqrt(distance)};
      }
    }
    return best;
  }

  function positionCarOnTrack(car, distance) {
    const p = sampleTrack(distance);
    car.x = p.x + p.nx*car.lane;
    car.y = p.y + p.ny*car.lane;
    car.angle = p.angle;
  }

  function createCar(info, distance, isPlayer) {
    const car = {
      ...info,x:0,y:0,angle:0,speed:0,maxSpeed:0,accel:0,distance,
      prevAlong:((distance%track.length)+track.length)%track.length,
      damage:0,airborne:0,offRoad:0,collisionCooldown:0,finished:false,finishTime:null,
      isPlayer,eliminated:false,rank:1
    };
    positionCarOnTrack(car,distance);
    return car;
  }

  function setStatus(message) { if (ui.status) ui.status.textContent = message; }

  function setControlMode(mode, save = true) {
    if (!['analog','keyboard'].includes(mode)) return;
    state.controlMode = mode;
    document.querySelectorAll('[data-control-mode]').forEach((button) => button.setAttribute('aria-pressed',String(button.dataset.controlMode === mode)));
    if (save) {
      try { localStorage.setItem(CONTROL_KEY,mode); } catch { /* A escolha vale para esta visita. */ }
    }
    if (ui.summary) {
      const hardwareDetected=document.documentElement.classList.contains('cv-hardware-input-detected');
      ui.summary.textContent = mode === 'analog' ? 'Analógico · vire arrastando na pista; acelere e freie nos pedais.' : hardwareDetected ? 'Teclado · ← → ou A/D viram · ↑/W acelera · ↓/S freia.' : 'Teclado selecionado · sem teclado, escolha Analógico.';
    }
  }

  function currentStage() { return stages[Math.max(0,Math.min(stages.length-1,state.selectedStage-1))]; }
  function roadWidth() { return ROAD_WIDTH - state.stageIndex*5; }
  function visibleScreenFor(mode) { return ['playing','paused','results'].includes(mode) ? mode : 'intro'; }

  function updateStageLabels() {
    const title = stageLabel(state.selectedStage);
    if (ui.stage) ui.stage.textContent = title;
    if (ui.startStage) ui.startStage.textContent = title;
    if (ui.unlocked) ui.unlocked.textContent = state.selectedStage <= state.unlocked ? `ETAPA ${state.unlocked} LIBERADA` : `ETAPA ${state.selectedStage} DESBLOQUEADA`;
  }

  function setScreen(screen) {
    ui.startScreen.hidden = screen !== 'intro';
    ui.pauseScreen.hidden = screen !== 'paused';
    ui.resultsScreen.hidden = screen !== 'results';
    ui.settings.hidden = screen !== 'settings';
    ui.exitModal.hidden = screen !== 'exit';
  }

  function startRace() {
    state.stageIndex = state.selectedStage - 1;
    state.elapsed = 0;
    state.countdown = 3;
    state.started = false;
    state.playerAir = 0;
    state.offRoad = 0;
    state.collisionCooldown = 0;
    state.finishDeadline = 0;
    state.joystick = {x:0,y:0};
    state.keys.clear();
    state.pressed.clear();
    state.mode = 'playing';
    state.cars = [createCar({name:'Você',color:'#ff884a',stripe:'#fff0cb',lane:17,skill:1},0,true)];
    rivalData.forEach((rival,index) => {
      const car = createCar({...rival},-(index+1)*34,false);
      car.maxSpeed = (196 + index*9 + state.stageIndex*13) * rival.skill;
      car.accel = 115 + state.stageIndex*7;
      state.cars.push(car);
    });
    state.playerProgress = 0;
    state.lastAlong = 0;
    setScreen('playing');
    ui.countdown.hidden = false;
    ui.countdown.textContent = '3';
    updateStageLabels();
    updateUI(true);
    setStatus('Concentre-se. A largada começa em 3…');
    playSound(480,.12,'triangle',.045);
    if (!state.raf) state.raf = requestAnimationFrame(loop);
  }

  function completeCountdown() {
    state.started = true;
    ui.countdown.hidden = true;
    setStatus('VALENDO! Use os pedais e controle as curvas.');
    playSound(740,.22,'triangle',.06);
  }

  function getPlayerInput() {
    let steer = 0;
    let accelerate = state.pressed.has('accelerate');
    let brake = state.pressed.has('brake');
    if (state.controlMode === 'keyboard') {
      steer = Number(state.keys.has('ArrowRight') || state.keys.has('KeyD')) - Number(state.keys.has('ArrowLeft') || state.keys.has('KeyA'));
      accelerate ||= state.keys.has('ArrowUp') || state.keys.has('KeyW');
      brake ||= state.keys.has('ArrowDown') || state.keys.has('KeyS') || state.keys.has('Space');
    } else {
      steer = state.joystick.x;
      const gamepad = navigator.getGamepads?.()?.find((pad) => pad?.connected);
      if (gamepad) {
        const axis = Number(gamepad.axes[0]) || 0;
        if (Math.abs(axis) > Math.abs(steer)) steer = Math.max(-1,Math.min(1,axis));
        accelerate ||= Boolean(gamepad.buttons[0]?.pressed || gamepad.buttons[7]?.pressed);
        brake ||= Boolean(gamepad.buttons[1]?.pressed || gamepad.buttons[6]?.pressed);
      }
    }
    return {steer,accelerate,brake};
  }

  function updatePlayer(car,dt) {
    car.collisionCooldown = Math.max(0,car.collisionCooldown-dt);
    if (car.finished || car.eliminated) return;
    if (car.airborne > 0) {
      car.airborne -= dt;
      car.angle += dt*3.8;
      car.speed *= Math.max(0,1-dt*1.4);
      if (car.airborne <= 0) {
        const nearest = findTrackPoint(car.x,car.y);
        const p = sampleTrack(nearest?.along ?? car.distance);
        car.distance = car.distance - (car.distance % track.length) + p.along;
        car.prevAlong = p.along;
        car.x = p.x + p.nx * Math.max(-roadWidth()*.2,Math.min(roadWidth()*.2,nearest?.offset ?? 0));
        car.y = p.y + p.ny * Math.max(-roadWidth()*.2,Math.min(roadWidth()*.2,nearest?.offset ?? 0));
        car.angle = p.angle;
        car.speed = Math.min(car.speed,88);
        damagePlayer('Você saiu da pista e voltou ao último trecho seguro.');
      }
      return;
    }
    const input = getPlayerInput();
    const nearestBefore = findTrackPoint(car.x,car.y);
    const onRoad = nearestBefore && Math.abs(nearestBefore.offset) <= roadWidth()*.47;
    const stagePenalty = state.stageIndex * 5;
    const maxSpeed = 296 - stagePenalty;
    const grip = onRoad ? 1 : .56;
    const steeringPower = (1.3 + Math.min(1,car.speed/maxSpeed)*2.05) * grip;
    car.angle += input.steer * steeringPower * dt;
    if (input.accelerate) car.speed += (onRoad ? 170 : 100)*dt;
    else car.speed -= (onRoad ? 39 : 105)*dt;
    if (input.brake) car.speed -= 300*dt;
    car.speed = Math.max(0,Math.min(maxSpeed,car.speed));
    const launchLimit = Math.min(1,.66 + state.elapsed*.075);
    if (state.elapsed < 4) car.speed = Math.min(car.speed,maxSpeed*launchLimit);
    const slowRoad = onRoad ? 1 : .52;
    car.x += Math.cos(car.angle)*car.speed*dt*slowRoad;
    car.y += Math.sin(car.angle)*car.speed*dt*slowRoad;
    if (!input.accelerate) car.speed = Math.max(0,car.speed - car.speed*.2*dt);
    const nearest = findTrackPoint(car.x,car.y);
    if (!nearest) return;
    if (Math.abs(nearest.offset) > roadWidth()*.58) {
      car.offRoad += dt;
      car.speed = Math.max(42,car.speed-72*dt);
      if (car.offRoad > .38) {
        car.airborne = .82;
        car.offRoad = 0;
        playSound(170,.23,'sawtooth',.09);
        setStatus('FORA DA PISTA! O carro está voltando para o asfalto.');
      }
    } else {
      car.offRoad = 0;
      if (Math.abs(nearest.offset) > roadWidth()*.46) car.speed = Math.max(52,car.speed-22*dt);
    }
    let delta = nearest.along - car.prevAlong;
    if (delta < -track.length/2) delta += track.length;
    if (delta > track.length/2) delta -= track.length;
    car.distance += delta;
    car.prevAlong = nearest.along;
    state.playerProgress = Math.max(0,car.distance);
    if (car.distance >= track.length*LAPS && !car.finished) markFinished(car);
  }

  function updateRivals(dt) {
    const difficulty = state.stageIndex;
    state.cars.slice(1).forEach((car,index) => {
      if (car.finished) return;
      const pNow = sampleTrack(car.distance);
      const pAhead = sampleTrack(car.distance + 45);
      const curve = Math.max(.72,Math.min(1,(pNow.tx*pAhead.tx + pNow.ty*pAhead.ty + 1.15)/2.15));
      const target = car.maxSpeed * curve;
      const startSlow = state.elapsed < 4 ? .7 + state.elapsed*.075 : 1;
      const accel = car.speed < target*startSlow ? car.accel : 74;
      car.speed += (car.speed < target*startSlow ? accel : -accel*.42)*dt;
      car.speed = Math.max(0,Math.min(car.maxSpeed,car.speed));
      car.distance += car.speed*dt;
      const laneShift = Math.sin(state.elapsed*.35 + index*2.1 + difficulty*.7)*4;
      car.lane = rivalData[index].lane + laneShift;
      positionCarOnTrack(car,car.distance);
      if (car.distance >= track.length*LAPS) markFinished(car);
    });
  }

  function markFinished(car) {
    if (car.finished) return;
    car.finished = true;
    car.finishTime = state.elapsed;
    car.speed = 0;
    if (car.isPlayer) {
      setStatus('Você cruzou a linha! Aguarde a chegada dos outros pilotos.');
      playSound(880,.3,'triangle',.065);
    }
    if (!state.finishDeadline) state.finishDeadline = state.elapsed + 34;
  }

  function damagePlayer(message) {
    const player = state.cars[0];
    if (!player || player.eliminated || player.collisionCooldown > 0) return;
    player.damage += 1;
    player.collisionCooldown = 1.05;
    player.speed *= .56;
    playSound(125,.22,'sawtooth',.11);
    if (player.damage >= DAMAGE_LIMIT) {
      player.eliminated = true;
      player.explodedAt=state.elapsed;
      player.speed = 0;
      playSound(88,.5,'sawtooth',.14);
      setStatus('O carro foi danificado demais. Aguarde o resultado da corrida.');
    } else {
      setStatus(`${message} Integridade ${DAMAGE_LIMIT-player.damage}/${DAMAGE_LIMIT}.`);
    }
  }

  function handleCollisions() {
    const player = state.cars[0];
    if (!player || player.airborne > 0 || player.finished || player.eliminated) return;
    for (const rival of state.cars.slice(1)) {
      if (rival.finished) continue;
      const dx = player.x-rival.x;
      const dy = player.y-rival.y;
      const distance = Math.hypot(dx,dy);
      if (distance > 25 || distance < .001) continue;
      const nx = dx/distance;
      const ny = dy/distance;
      const overlap = 25-distance;
      player.x += nx*overlap*.72;
      player.y += ny*overlap*.72;
      player.angle += nx*.07;
      player.speed *= .84;
      if (player.collisionCooldown <= 0 && player.speed > 95) damagePlayer('Batida com um piloto rival.');
      break;
    }
  }

  function updateRace(dt) {
    if (state.mode !== 'playing') return;
    state.elapsed += dt;
    if (!state.started) {
      const next = Math.max(1,Math.ceil(state.countdown));
      if (ui.countdown.textContent !== String(next)) {
        ui.countdown.textContent = String(next);
        playSound(420 + (3-next)*80,.1,'triangle',.04);
      }
      state.countdown -= dt;
      if (state.countdown <= 0) completeCountdown();
      state.uiTimer += dt;
      if (state.uiTimer > .12) { state.uiTimer=0; updateUI(); }
      return;
    }
    updatePlayer(state.cars[0],dt);
    updateRivals(dt);
    handleCollisions();
    const botsFinished = state.cars.slice(1).every((car) => car.finished);
    if (botsFinished || (state.finishDeadline && state.elapsed > state.finishDeadline) || state.elapsed > 135) {
      finishRace();
      return;
    }
    state.uiTimer += dt;
    if (state.uiTimer > .12) { state.uiTimer=0; updateUI(); }
  }

  function getRanking() {
    return [...state.cars].sort((a,b) => {
      if (a.finished && b.finished) return a.finishTime-b.finishTime;
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      return b.distance-a.distance;
    });
  }

  function finishRace() {
    state.mode = 'results';
    state.pressed.clear();
    state.keys.clear();
    ui.countdown.hidden = true;
    const ranking = getRanking();
    const place = ranking.findIndex((car) => car.isPlayer)+1;
    const advanced = place <= 3;
    const isFinal = state.selectedStage >= 5;
    if (advanced && !isFinal) {
      state.unlocked = Math.max(state.unlocked,state.selectedStage+1);
      try { localStorage.setItem(UNLOCK_KEY,String(state.unlocked)); } catch { /* Progresso guardado só nesta sessão. */ }
    }
    ui.resultIcon.textContent = advanced ? '🏆' : state.cars[0].eliminated ? '💥' : '🏁';
    ui.resultKicker.textContent = advanced ? isFinal ? 'CAMPEONATO CONCLUÍDO' : 'CLASSIFICADO PARA A PRÓXIMA' : 'ETAPA ENCERRADA';
    ui.resultTitle.textContent = advanced ? isFinal ? place===1 ? 'Você venceu o campeonato!' : 'Campeonato concluído!' : 'Você chegou ao pódio!' : 'Dá para buscar o pódio.';
    ui.playerPlace.textContent = `Você terminou em ${place}º lugar${state.cars[0].eliminated ? ' · carro abandonou a corrida' : ''}.`;
    ui.podium.replaceChildren();
    ranking.slice(0,3).forEach((car,index) => {
      const row = document.createElement('li');
      const medal = ['🥇','🥈','🥉'][index];
      row.innerHTML = `<b>${medal}</b><strong></strong><span></span>`;
      row.querySelector('strong').textContent = car.isPlayer ? 'Você' : car.name;
      row.querySelector('span').textContent = car.finished ? `${car.finishTime.toFixed(1)} s` : car.eliminated ? 'Abandonou' : 'No circuito';
      ui.podium.append(row);
    });
    ui.resultNote.textContent = advanced ? isFinal ? 'Você concluiu as cinco etapas do CV Turbo Circuit.' : `${stages[state.selectedStage-1].name} liberada. Os robôs serão mais rápidos.` : 'Fique entre os três primeiros para liberar a próxima etapa.';
    ui.nextRace.hidden = !advanced;
    ui.nextRace.textContent = advanced ? isFinal ? '↻ NOVO CAMPEONATO' : 'PRÓXIMA ETAPA →' : '';
    $('[data-race-again]').textContent = advanced ? '↻ CORRER DE NOVO' : '↻ TENTAR DE NOVO';
    ui.resultsScreen.hidden = false;
    ui.startScreen.hidden = true;
    ui.pauseScreen.hidden = true;
    ui.settings.hidden = true;
    ui.exitModal.hidden = true;
    setStatus(advanced ? 'Etapa classificada.' : 'Etapa não classificada. Tente outra vez.');
    updateUI(true);
  }

  function updateUI(force = false) {
    const player = state.cars[0];
    updateStageLabels();
    if (!player) {
      ui.lap.textContent = '1 / 3';
      ui.position.textContent = '—';
      ui.speed.textContent = '0';
      updateDamage(0);
      return;
    }
    const lap = Math.min(LAPS,Math.max(1,Math.floor(Math.max(0,player.distance)/track.length)+1));
    ui.lap.textContent = `${lap} / ${LAPS}`;
    const place = getRanking().findIndex((car) => car.isPlayer)+1;
    ui.position.textContent = `${place}º / 5`;
    ui.speed.textContent = String(Math.round(player.speed*.76));
    updateDamage(player.damage);
    if (force) setControlMode(state.controlMode,false);
  }

  function updateDamage(damage) {
    [...ui.damage.children].forEach((segment,index) => {
      const active = index < DAMAGE_LIMIT-damage;
      segment.classList.toggle('is-active',active);
      segment.classList.toggle('is-low',active && DAMAGE_LIMIT-damage <= 2);
    });
  }

  function drawTrackPath(scaleX,scaleY) {
    context.beginPath();
    track.samples.forEach((point,index) => {
      if (!index) context.moveTo(point.x*scaleX,point.y*scaleY);
      else context.lineTo(point.x*scaleX,point.y*scaleY);
    });
    context.closePath();
  }

  function drawWorld() {
    const stage = currentStage();
    const w = 1000;
    const h = 1000;
    const scaleX=canvas.width/w;
    const scaleY=canvas.height/h;
    const screenScale=Math.min(scaleX,scaleY);
    context.setTransform(scaleX,0,0,scaleY,0,0);
    context.clearRect(0,0,w,h);
    context.fillStyle=stage.sky;
    context.fillRect(0,0,w,h);
    context.fillStyle=stage.turf;
    context.fillRect(0,0,w,h);
    context.save();
    context.globalAlpha=.14;
    context.strokeStyle='#c1dfa5';
    context.lineWidth=1;
    for(let y=18;y<h;y+=38){ context.beginPath(); context.moveTo(0,y); context.lineTo(w,y); context.stroke(); }
    context.restore();
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.lineJoin='round';
    context.lineCap='round';
    drawTrackPath(scaleX,scaleY); context.strokeStyle='#111819'; context.lineWidth=(roadWidth()+34)*screenScale; context.stroke();
    drawTrackPath(scaleX,scaleY); context.strokeStyle=stage.trim; context.lineWidth=(roadWidth()+20)*screenScale; context.stroke();
    drawTrackPath(scaleX,scaleY); context.strokeStyle=stage.asphalt; context.lineWidth=roadWidth()*screenScale; context.stroke();
    drawTrackPath(scaleX,scaleY); context.strokeStyle='rgba(255,255,255,.09)'; context.lineWidth=2*screenScale; context.setLineDash([3*screenScale,12*screenScale]); context.stroke(); context.setLineDash([]);
    drawTrackPath(scaleX,scaleY); context.strokeStyle='rgba(255,242,192,.68)'; context.lineWidth=3*screenScale; context.setLineDash([22*screenScale,22*screenScale]); context.stroke(); context.setLineDash([]);
    drawStartLine(scaleX,scaleY,screenScale);
    context.restore();
    drawDecor(stage);
    drawCars();
    drawLapMarker(scaleX,scaleY,screenScale);
    if (state.mode === 'playing' && state.cars[0]?.airborne > 0) drawAirDust(state.cars[0]);
  }

  function drawStartLine(scaleX,scaleY,screenScale) {
    const p=sampleTrack(0);
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.translate(p.x*scaleX,p.y*scaleY);
    context.rotate(Math.atan2(p.ty*scaleY,p.tx*scaleX));
    const band=8*screenScale;
    for(let i=0;i<8;i+=1){
      context.fillStyle=i%2?'#20282a':'#f4f1e7';
      context.fillRect(-band/2,-roadWidth()*screenScale/2+i*roadWidth()*screenScale/8,band,roadWidth()*screenScale/8+screenScale);
    }
    context.restore();
  }

  function drawDecor(stage) {
    state.decor.forEach((item) => {
      if(item.phase===0){
        context.fillStyle='rgba(8,24,20,.34)'; context.beginPath(); context.arc(item.x+4,item.y+5,item.size+2,0,Math.PI*2); context.fill();
        context.fillStyle=stage.trim; context.globalAlpha=.48; context.beginPath(); context.arc(item.x,item.y,item.size,0,Math.PI*2); context.fill(); context.globalAlpha=1;
        context.fillStyle='rgba(235,239,203,.4)'; context.beginPath(); context.arc(item.x-item.size*.25,item.y-item.size*.25,item.size*.28,0,Math.PI*2); context.fill();
      } else if(item.phase===1){
        context.save(); context.translate(item.x,item.y); context.rotate(.4); context.fillStyle='rgba(231,237,214,.58)'; context.fillRect(-item.size*.6,-item.size*.35,item.size*1.2,item.size*.7); context.fillStyle=stage.trim; context.fillRect(-item.size*.48,-item.size*.27,item.size*.5,item.size*.16); context.restore();
      } else {
        context.fillStyle='rgba(8,17,17,.48)'; context.beginPath(); context.arc(item.x,item.y,item.size*.8,0,Math.PI*2); context.fill();
        context.fillStyle='rgba(105,141,106,.85)'; context.beginPath(); context.arc(item.x-1,item.y-2,item.size*.65,0,Math.PI*2); context.fill();
      }
    });
    const p=sampleTrack(track.length*.23);
    context.save(); context.translate(p.x,p.y); context.rotate(p.angle+.7);
    context.fillStyle='rgba(4,9,10,.5)'; context.fillRect(-39,-roadWidth()*.95,78,22);
    context.fillStyle='#bbc8c0'; context.font='900 13px system-ui'; context.textAlign='center'; context.textBaseline='middle'; context.fillText(stage.name.toUpperCase(),0,-roadWidth()*.95+11);
    context.restore();
  }

  function drawLapMarker(scaleX,scaleY,screenScale) {
    const player=state.cars[0];
    if(!player)return;
    const lap=Math.min(LAPS,Math.max(1,Math.floor(Math.max(0,player.distance)/track.length)+1));
    const marker=sampleTrack(track.length*(lap-1));
    context.save(); context.setTransform(1,0,0,1,0,0); context.translate(marker.x*scaleX,marker.y*scaleY); context.rotate(Math.atan2(marker.ty*scaleY,marker.tx*scaleX)); context.scale(screenScale,screenScale);
    context.fillStyle='rgba(11,18,19,.78)'; context.beginPath(); context.roundRect?.(-30,-roadWidth()*.76,60,18,6); if(!context.roundRect)context.rect(-30,-roadWidth()*.76,60,18); context.fill();
    context.fillStyle='#ffe2af'; context.font='900 10px system-ui'; context.textAlign='center'; context.textBaseline='middle'; context.fillText('LARGADA',0,-roadWidth()*.76+9); context.restore();
  }

  function drawCars() {
    const cars=state.cars;
    if(!cars.length)return;
    const ordered=[...cars.slice(1),cars[0]];
    ordered.forEach((car) => {
      const isPlayer=car.isPlayer;
      let x=car.x; let y=car.y; let angle=car.angle;
      if(!isPlayer){const p=sampleTrack(car.distance);x=p.x+p.nx*car.lane;y=p.y+p.ny*car.lane;angle=p.angle;}
      if(isPlayer && car.eliminated){drawExplosion(car);return;}
      if(isPlayer && car.airborne>0){
        context.globalAlpha=.4+Math.abs(Math.sin(state.elapsed*13))*.28;
        context.save(); context.fillStyle='rgba(0,0,0,.4)'; context.beginPath(); context.ellipse(x+12,y+19,23,12,0,0,Math.PI*2); context.fill(); context.restore();
      }
      drawCar(car,x,y,angle);
      context.globalAlpha=1;
    });
  }

  function drawExplosion(car) {
    const age=state.elapsed-(car.explodedAt||state.elapsed);
    if(age>1.35)return;
    const progress=Math.min(1,age/1.1);
    const radius=14+progress*64;
    const scaleX=canvas.width/1000;
    const scaleY=canvas.height/1000;
    const screenScale=Math.min(scaleX,scaleY);
    context.save(); context.setTransform(1,0,0,1,0,0); context.translate(car.x*scaleX,car.y*scaleY); context.scale(screenScale,screenScale);
    context.globalAlpha=1-progress*.82;
    const glow=context.createRadialGradient(0,0,2,0,0,radius);
    glow.addColorStop(0,'#fff5b5');glow.addColorStop(.24,'#ffbf53');glow.addColorStop(.58,'#f15c32');glow.addColorStop(1,'rgba(155,46,29,0)');
    context.fillStyle=glow;context.beginPath();context.arc(0,0,radius,0,Math.PI*2);context.fill();
    context.strokeStyle='rgba(255,220,155,.8)';context.lineWidth=4*(1-progress);context.beginPath();context.arc(0,0,radius*.72,0,Math.PI*2);context.stroke();
    context.restore();
  }

  function drawCar(car,x,y,angle) {
    const scaleX=canvas.width/1000;
    const scaleY=canvas.height/1000;
    const screenScale=Math.min(scaleX,scaleY);
    const screenAngle=Math.atan2(Math.sin(angle)*scaleY,Math.cos(angle)*scaleX);
    context.save(); context.setTransform(1,0,0,1,0,0); context.translate(x*scaleX,y*scaleY); context.rotate(screenAngle); context.scale(screenScale,screenScale);
    context.fillStyle='rgba(0,0,0,.42)'; context.beginPath(); context.ellipse(5,7,26,17,0,0,Math.PI*2); context.fill();
    context.fillStyle='#101415';
    context.fillRect(-17,-17,12,5); context.fillRect(7,-17,12,5); context.fillRect(-17,12,12,5); context.fillRect(7,12,12,5);
    context.fillStyle=car.color; context.beginPath(); context.roundRect?.(-24,-13,48,26,8); if(!context.roundRect)context.rect(-24,-13,48,26); context.fill();
    context.fillStyle=car.stripe||'#fff'; context.fillRect(-9,-11,6,22);
    context.fillStyle='rgba(8,24,30,.9)'; context.beginPath(); context.roundRect?.(-10,-9,19,18,5); if(!context.roundRect)context.rect(-10,-9,19,18); context.fill();
    context.fillStyle='rgba(225,248,255,.65)'; context.fillRect(-6,-7,10,3);
    context.fillStyle='#fff3bc'; context.fillRect(17,-9,4,5); context.fillRect(17,4,4,5);
    context.fillStyle='#ff5149'; context.fillRect(-22,-9,3,5); context.fillRect(-22,4,3,5);
    if(car.isPlayer){context.strokeStyle='rgba(255,229,161,.9)';context.lineWidth=2;context.beginPath();context.ellipse(0,0,29,19,0,0,Math.PI*2);context.stroke();}
    context.restore();
    if(!car.isPlayer){context.save();context.setTransform(1,0,0,1,0,0);context.translate(x*scaleX,y*scaleY);context.scale(screenScale,screenScale);context.font='800 12px system-ui';context.textAlign='center';context.fillStyle='rgba(5,11,13,.76)';context.beginPath();context.roundRect?.(-24,-37,48,17,6);if(!context.roundRect)context.rect(-24,-37,48,17);context.fill();context.fillStyle='#f4f2e8';context.textBaseline='middle';context.fillText(car.name,0,-28);context.restore();}
  }

  function drawAirDust(car) {
    context.save();
    for(let i=0;i<6;i+=1){
      const a=state.elapsed*4+i*Math.PI/3;
      context.fillStyle=i%2?'rgba(225,209,156,.42)':'rgba(221,233,222,.36)';
      context.beginPath(); context.arc(car.x+Math.cos(a)*30,car.y+Math.sin(a)*23,5+(i%3)*2,0,Math.PI*2); context.fill();
    }
    context.restore();
  }

  function playSound(frequency,duration,type,level) { window.CV_GAME_AUDIO?.playTone(frequency,duration,type,level); }

  function loop(now) {
    state.raf=0;
    if(state.mode==='playing') updateRace(Math.min(.045,Math.max(0,(now-state.lastFrame)/1000 || 0)));
    state.lastFrame=now;
    drawWorld();
    state.raf=requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const rect=canvas.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const width=Math.round(rect.width*dpr);
    const height=Math.round(rect.height*dpr);
    if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;}
    drawWorld();
  }

  function bindPedal(button,key) {
    if(!button)return;
    const down=(event)=>{event.preventDefault();state.pressed.add(key);button.classList.add('is-pressed');button.setPointerCapture?.(event.pointerId);};
    const up=(event)=>{if(event)event.preventDefault();state.pressed.delete(key);button.classList.remove('is-pressed');};
    button.addEventListener('pointerdown',down);
    ['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach((name)=>button.addEventListener(name,up));
    button.addEventListener('contextmenu',(event)=>event.preventDefault());
  }

  canvas.addEventListener('pointerdown',(event)=>{
    if(state.mode!=='playing' || state.controlMode!=='analog' || !state.started)return;
    event.preventDefault();
    state.joystickPointer=event.pointerId;
    canvas.setPointerCapture?.(event.pointerId);
    ui.joystick.hidden=false;
    const rect=canvas.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width*100;
    const y=(event.clientY-rect.top)/rect.height*100;
    ui.joystick.style.left=`${x}%`;ui.joystick.style.top=`${y}%`;
    state.stickOrigin={x:event.clientX,y:event.clientY};
    updateStick(event);
  });
  canvas.addEventListener('pointermove',(event)=>{if(event.pointerId===state.joystickPointer)updateStick(event);});
  function updateStick(event){
    if(!state.stickOrigin)return;
    const dx=event.clientX-state.stickOrigin.x;
    const dy=event.clientY-state.stickOrigin.y;
    const magnitude=Math.hypot(dx,dy)||1;
    const scale=Math.min(1,magnitude/47);
    const x=dx/magnitude*scale;
    const y=dy/magnitude*scale;
    state.joystick.x=x;
    state.joystick.y=y;
    ui.joystickNub.style.transform=`translate(calc(-50% + ${x*37}px),calc(-50% + ${y*37}px))`;
  }
  const endStick=(event)=>{
    if(event.pointerId!==state.joystickPointer)return;
    state.joystickPointer=null;state.stickOrigin=null;state.joystick={x:0,y:0};ui.joystick.hidden=true;
  };
  canvas.addEventListener('pointerup',endStick);
  canvas.addEventListener('pointercancel',endStick);

  bindPedal($('[data-accelerate]'),'accelerate');
  bindPedal($('[data-brake]'),'brake');
  favoriteButton?.addEventListener('click',()=>{
    const favorites=readFavorites();
    if(favorites.has(GAME_ID))favorites.delete(GAME_ID);else favorites.add(GAME_ID);
    try{localStorage.setItem(favoriteKey,JSON.stringify([...favorites]));window.dispatchEvent(new Event('cv-games-favorites-change'));}catch{ /* Favorito opcional. */ }
    updateFavorite();
  });
  const menuButton=$('[data-menu-toggle]');
  const menu=$('[data-primary-nav]');
  menuButton?.addEventListener('click',()=>{
    const open=menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });
  menu?.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>{menu.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');}));
  $('[data-theme-toggle]')?.addEventListener('click',()=>{
    document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light';
    try{localStorage.setItem('cv-games-theme',document.documentElement.dataset.theme);}catch{ /* Tema aplicado nesta visita. */ }
    syncThemeButton();
  });
  document.querySelectorAll('[data-control-mode]').forEach((button)=>button.addEventListener('click',()=>setControlMode(button.dataset.controlMode)));
  window.addEventListener('cv-input-capabilities-change',()=>setControlMode(state.controlMode,false));
  document.querySelectorAll('[data-open-settings]').forEach((button)=>button.addEventListener('click',()=>{state.previousMode=state.mode;state.mode='settings';setControlMode(state.controlMode,false);setScreen('settings');}));
  document.querySelectorAll('[data-close-settings]').forEach((button)=>button.addEventListener('click',()=>{state.mode=state.previousMode||'intro';setScreen(visibleScreenFor(state.mode));}));
  document.querySelector('[data-settings-modal]')?.addEventListener('click',(event)=>{if(event.target===ui.settings){state.mode=state.previousMode||'intro';setScreen(visibleScreenFor(state.mode));}});
  $('[data-start-race]').addEventListener('click',startRace);
  $('[data-pause]').addEventListener('click',()=>{
    if(state.mode==='playing'){state.mode='paused';state.pressed.clear();state.keys.clear();setScreen('paused');setStatus('Corrida pausada.');}
    else if(state.mode==='paused'){state.mode='playing';setScreen('playing');state.lastFrame=performance.now();setStatus('De volta à pista.');}
  });
  $('[data-resume-race]').addEventListener('click',()=>{state.mode='playing';setScreen('playing');state.lastFrame=performance.now();setStatus('De volta à pista.');});
  $('[data-race-again]').addEventListener('click',startRace);
  ui.nextRace.addEventListener('click',()=>{
    if(state.selectedStage>=5)state.selectedStage=1;
    else state.selectedStage=Math.min(5,state.selectedStage+1);
    updateStageLabels();
    state.mode='intro';setScreen('intro');
  });
  $('[data-exit]').addEventListener('click',()=>{state.previousMode=state.mode;state.mode='exit';setScreen('exit');});
  document.querySelectorAll('[data-close-exit]').forEach((button)=>button.addEventListener('click',()=>{state.mode=state.previousMode||'intro';setScreen(state.mode==='playing'?'playing':state.mode==='paused'?'paused':state.mode==='results'?'results':'intro');}));
  $('[data-confirm-exit]').addEventListener('click',()=>{window.location.href='../../index.html#jogos';});

  window.addEventListener('keydown',(event)=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(event.code) && state.controlMode==='keyboard' && state.mode==='playing')event.preventDefault();
    state.keys.add(event.code);
    if((event.code==='Escape' || event.code==='KeyP') && state.mode==='playing'){
      if(event.code==='Escape' && (document.fullscreenElement || ui.panel.classList.contains('is-fullscreen-fallback')))return;
      state.mode='paused';state.pressed.clear();state.keys.clear();setScreen('paused');setStatus('Corrida pausada.');
    } else if(event.code==='KeyP' && state.mode==='paused'){
      state.mode='playing';setScreen('playing');state.lastFrame=performance.now();
    }
  });
  window.addEventListener('keyup',(event)=>state.keys.delete(event.code));
  window.addEventListener('blur',()=>{state.keys.clear();state.pressed.clear();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && state.mode==='playing'){state.mode='paused';state.pressed.clear();state.keys.clear();setScreen('paused');setStatus('Corrida pausada enquanto a página ficou em segundo plano.');}});
  window.addEventListener('resize',resizeCanvas);
  document.addEventListener('cv-games-fullscreenchange',resizeCanvas);

  setControlMode(state.controlMode,false);
  updateFavorite();
  syncThemeButton();
  updateStageLabels();
  updateUI(true);
  resizeCanvas();
  if(!state.raf)state.raf=requestAnimationFrame(loop);
})();
