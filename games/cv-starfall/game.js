(function () {
  'use strict';

  const gameId = 'cv-starfall';
  const bestKey = 'cv-games-cv-starfall-best';
  const bestWaveKey = 'cv-games-cv-starfall-best-wave';
  const setupCompleteKey = 'cv-games-cv-starfall-setup-complete';
  const controlModeKey = 'cv-games-cv-starfall-control';
  const performanceModeKey = 'cv-games-cv-starfall-performance';
  const dailyBestPrefix = 'cv-games-cv-starfall-daily:';
  const achievementStoragePrefix = 'cv-games-cv-starfall-achievements:';
  const favoritesKey = 'cv-games-favorites';
  const canvas = document.querySelector('[data-game-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    stage: $('[data-stage]'), overlay: $('[data-main-overlay]'), title: $('[data-overlay-title]'), copy: $('[data-overlay-copy]'), start: $('[data-start]'), missionSetupModal: $('[data-mission-setup]'), exitModal: $('[data-exit-confirmation]'), stop: $('[data-stop-mission]'), audio: $('[data-game-audio]'),
    wave: $('[data-wave]'), score: $('[data-score]'), lives: $('[data-lives]'), shields: $('[data-shields]'), healthFill: $('[data-health-fill]'), best: $('[data-best]'), overlayBest: $('[data-overlay-best]'),
    zone: $('[data-zone]'), timer: $('[data-timer]'), upgrade: $('[data-upgrade]'), upgradeOptions: $('[data-upgrade-options]'), pause: $('[data-pause]'), pauseIcon: $('[data-pause-icon]'), pauseLabel: $('[data-pause-label]'), ability: $('[data-ability]'), abilityCooldown: $('[data-ability-cooldown]'), panel: $('[data-fullscreen-root]'), hud: $('.starfall-hud'), status: $('[data-status]'), toast: $('[data-toast]'), favorite: $('[data-game-favorite]'),
    skinPicker: $('[data-skin-picker]'), equippedShip: $('[data-equipped-ship]'), shipModal: $('[data-ship-modal]'), settingsModal: $('[data-settings-modal]'), performanceModeButtons: Array.from(document.querySelectorAll('[data-performance-mode]')), achievementsModal: $('[data-achievements-modal]'), achievementsList: $('[data-achievements-list]'), achievementsCount: $('[data-achievement-count]'), dailyStart: $('[data-start-daily]'), dailyRecord: $('[data-daily-record]'), dailySummaryModal: $('[data-daily-summary-modal]'), dailySummaryStart: $('[data-start-daily-again]'), dailySummaryDate: $('[data-daily-summary-date]'), dailySummaryResult: $('[data-daily-summary-result]'), dailySummaryRecord: $('[data-daily-summary-record]'), dailySummaryDetails: $('[data-daily-summary-details]'), runSummary: $('[data-run-summary]'), joystick: $('[data-joystick]'), joystickNub: $('[data-joystick-nub]'), controlHint: $('[data-control-hint]'), rankList: $('[data-rank-list]'), rankStatus: $('[data-rank-status]')
  };
  const skins = [
    { id: 'aurora', name: 'Aurora', color: '#7df7e8', accent: '#bffff5', ability: 'Explosão Nova', abilityShort: 'NOVA', cooldown: 25, shape: 'classic', description: 'Uma explosão ampla atinge todos os inimigos próximos.' },
    { id: 'aegis', name: 'Aegis', color: '#72bdff', accent: '#c9eaff', ability: 'Barreira Aegis', abilityShort: 'BARREIRA', cooldown: 25, shape: 'shield', unlockWave: 10, description: 'Uma barreira absorve três impactos.' },
    { id: 'chronos', name: 'Chronos', color: '#c897ff', accent: '#efd5ff', ability: 'Dobra Temporal', abilityShort: 'TEMPO', cooldown: 25, shape: 'ring', unlockWave: 20, description: 'Desacelera inimigos e projéteis por alguns segundos.' },
    { id: 'tempest', name: 'Tempestade', color: '#87aaff', accent: '#d5dcff', ability: 'Poço Negro', abilityShort: 'POÇO NEGRO', cooldown: 34, shape: 'wing', unlockWave: 30, description: 'Dispare uma singularidade que puxa e fere os inimigos próximos.' },
    { id: 'flashblade', name: 'Flashblade', color: '#ffc86e', accent: '#fff0b4', ability: 'Corte Flash', abilityShort: 'CORTE', cooldown: 25, shape: 'blade', unlockWave: 40, description: 'Uma lâmina veloz faz curvas e ricocheteia em várias direções.' },
    { id: 'redshift', name: 'Bastião Rubro', color: '#d83a2e', accent: '#ffd06a', ability: 'Escudo de Retorno', abilityShort: 'RETORNO', cooldown: 30, shape: 'reflector', secret: true, description: 'Por alguns segundos, reflete projéteis: parte volta pela trajetória e parte mira em quem atacou.' }
  ];
  const starfallAchievements = [
    { id: 'first-flight', icon: '🚀', title: 'Primeiro voo', description: 'Comece sua primeira missão.', metric: 'missionsStarted', target: 1, unit: 'missão' },
    { id: 'guardian-hunter', icon: '👾', title: 'Caçador de guardiões', description: 'Derrote um chefe principal.', metric: 'bossesDefeated', target: 1, unit: 'chefe' },
    { id: 'clean-orbit', icon: '🛡️', title: 'Órbita perfeita', description: 'Conclua uma onda sem perder vidas.', metric: 'cleanWaves', target: 1, unit: 'onda limpa' },
    { id: 'daily-pilot', icon: '📅', title: 'Piloto diário', description: 'Termine um Desafio Diário.', metric: 'dailyRunsFinished', target: 1, unit: 'desafio' },
    { id: 'planet-hopper', icon: '🪐', title: 'Viajante galáctico', description: 'Alcance a onda 15.', metric: 'bestWaveReached', target: 15, unit: 'ondas' },
    { id: 'star-legend', icon: '🌌', title: 'Lenda das estrelas', description: 'Alcance a onda 50.', metric: 'bestWaveReached', target: 50, unit: 'ondas' },
    { id: 'ability-collector', icon: '✨', title: 'Mestre das naves', description: 'Use a habilidade de cada nave.', metric: 'abilityShips', target: skins.length, unit: 'naves' }
  ];
  const zones = [
    { name: 'Órbita Azul', colors: ['#07132b', '#111d36'], stars: '190,220,255' },
    { name: 'Marte Rubro', colors: ['#29101d', '#361a2b'], stars: '255,196,177' },
    { name: 'Nebulosa Violeta', colors: ['#1d1034', '#20133e'], stars: '222,190,255' },
    { name: 'Cinturão Dourado', colors: ['#261b0c', '#30230f'], stars: '255,225,164' },
    { name: 'Abismo Ciano', colors: ['#061f29', '#0a2633'], stars: '170,241,255' }
  ];
  const bossTypes = {
    meteor: { name: 'Colosso de Cinzas', color: '#ff925f' },
    drone: { name: 'Mãe de Enxame', color: '#ff5fa4' },
    brute: { name: 'Titã Âmbar', color: '#ffcf69' },
    hunter: { name: 'Espectro Roxo', color: '#b68aff' },
    prism: { name: 'Prisma Rebote', color: '#71eaff' }
  };
  const state = {
    mode: 'intro', lastTime: 0, raf: 0, width: 800, height: 560, dpr: 1,
    score: 0, best: readBest(), bestCompletedWave: readBestWave(), wave: 1, lives: 3, maxLives: 6, shields: 0, tempShields: 0, invulnerable: 0, elapsed: 0,
    shotCooldown: 0, waveGrace: 0, enemySpawn: 0, powerSpawn: 0, waveKills: 0,
    enemiesRequired: 6, bossWave: false, bossSpawned: false, miniBossTimer: 0, miniBossSpawned: false,
    keys: new Set(), bullets: [], enemyBullets: [], enemies: [], particles: [], pickups: [], stars: [], effects: [],
    selectedSkin: readSkin(), controlMode: readControlMode(), performanceMode: readPerformanceMode(), upgrades: {}, abilityCooldown: 0, abilityBaseCooldown: 0, abilityPower: 1,
    slowTime: 0, lastBossType: '', magnet: 105, pierce: 0, critChance: 0, armorChance: 0, regenLevel: 0, regenTimer: 24, drones: 0, droneCooldown: 0,
    blastRadius: 0, bossDamageBonus: 0, bonusShots: 0, lowHullBoost: 0, salvageHeal: 0, singularityRadius: 235, singularityDuration: 6.5, reflectTime: 0, reflectContacts: new Set(), reflectDamageBonus: 0, reflectDurationBonus: 0, endlessDamage: 0, endlessSpeed: 0,
    player: { x: 400, y: 460, radius: 13, speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, color: '#7df7e8' },
    pointer: { active: false, x: 0, y: 0 }, analog: { active: false, x: 0, y: 0 },
    dailyChallenge: false, pendingDailyChallenge: false, challengeDate: '', dailyBestScore: 0, skinBeforeDaily: '', randomStreams: null, exitReturnFocus: null, exitWasPlaying: false,
    waveDamageTaken: false, achievementProgress: null
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function randomUnit(stream = 'combat') {
    if (!state.dailyChallenge || !state.randomStreams) return Math.random();
    let value = (state.randomStreams[stream] + 0x6D2B79F5) >>> 0;
    state.randomStreams[stream] = value;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
  const random = (min, max, stream = 'combat') => min + randomUnit(stream) * (max - min);
  const visualRandomUnit = () => Math.random();
  const visualRandom = (min, max) => min + visualRandomUnit() * (max - min);
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const upgradeLevel = (id) => state.upgrades[id] || 0;
  function enemyUpgradeLevel() {
    const investedLevels = Object.values(state.upgrades).reduce((total, level) => total + level, 0);
    return Math.min(12, Math.floor(investedLevels / 5));
  }
  function enemyUpgradeHpScale() { return 1 + enemyUpgradeLevel() * .022; }
  function enemyUpgradeSpeedScale() { return 1 + enemyUpgradeLevel() * .006; }
  function enemyUpgradeAttackScale() { return 1 + enemyUpgradeLevel() * .008; }
  function enemyUpgradeFireRateScale() { return Math.max(.88, 1 - enemyUpgradeLevel() * .01); }
  const upgradeList = [
    { id:'damage', icon:'✹', name:'Núcleo de impacto', description:'Aumenta moderadamente o dano por disparo.', max:8, available:()=>upgradeLevel('damage')<8, apply:()=>{state.player.damage=Math.min(2.35,state.player.damage+.17);} },
    { id:'speed', icon:'➤', name:'Propulsores vetoriais', description:'Aumenta a velocidade da nave.', max:6, available:()=>upgradeLevel('speed')<6, apply:()=>{state.player.speed=Math.min(405,state.player.speed*1.1);} },
    { id:'rapid', icon:'⚡', name:'Recarga cinética', description:'Reduz o intervalo entre disparos.', max:7, available:()=>upgradeLevel('rapid')<7, apply:()=>{state.player.fireRate=Math.max(.19,state.player.fireRate*.93);} },
    { id:'spread', icon:'✦', name:'Canhões laterais', description:'Adiciona um disparo ao leque da nave.', max:4, available:()=>state.player.spread<5, apply:()=>{state.player.spread=Math.min(5,state.player.spread+1);} },
    { id:'repair', icon:'♥', name:'Reparo de casco', description:'Recupera uma vida e concede proteção breve.', max:0, available:()=>state.lives<state.maxLives, apply:()=>{state.lives=Math.min(state.maxLives,state.lives+1);state.invulnerable=.8;} },
    { id:'shield', icon:'⬡', name:'Escudo de energia', description:'Ganhe um escudo que bloqueia um impacto.', max:4, available:()=>state.shields<4, apply:()=>{state.shields=Math.min(4,state.shields+1);} },
    { id:'pierce', icon:'⌁', name:'Projétil perfurante', description:'Cada tiro atravessa mais um inimigo.', max:3, available:()=>state.pierce<3, apply:()=>{state.pierce+=1;} },
    { id:'critical', icon:'✧', name:'Mira de precisão', description:'Aumenta a chance de causar dano crítico.', max:5, available:()=>state.critChance<.4, apply:()=>{state.critChance=Math.min(.4,state.critChance+.08);} },
    { id:'drone', icon:'◈', name:'Drone auxiliar', description:'Um satélite ataca inimigos próximos.', max:3, available:()=>state.drones<3, apply:()=>{state.drones+=1;} },
    { id:'magnet', icon:'⌖', name:'Ímã gravitacional', description:'Atrai recursos de mais longe.', max:5, available:()=>upgradeLevel('magnet')<5, apply:()=>{state.magnet=Math.min(315,state.magnet+42);} },
    { id:'cooldown', icon:'◷', name:'Condensador', description:'Reduz a recarga da habilidade especial.', max:5, available:()=>upgradeLevel('cooldown')<5, apply:()=>{state.abilityBaseCooldown=Math.max(22,state.abilityBaseCooldown*.9);state.abilityCooldown=Math.max(0,state.abilityCooldown-4);} },
    { id:'power', icon:'✴', name:'Amplificador de núcleo', description:'Fortalece a habilidade especial.', max:4, available:()=>upgradeLevel('power')<4, apply:()=>{state.abilityPower=Math.min(2,state.abilityPower+.2);} },
    { id:'armor', icon:'⬟', name:'Blindagem reativa', description:'Chance de anular um impacto recebido.', max:4, available:()=>state.armorChance<.32, apply:()=>{state.armorChance=Math.min(.32,state.armorChance+.08);} },
    { id:'regen', icon:'✚', name:'Nanorreparadores', description:'Recupera uma vida periodicamente.', max:3, available:()=>state.regenLevel<3, apply:()=>{state.regenLevel+=1;} },
    { id:'bounty', icon:'◇', name:'Contrato de caça', description:'Aumenta os pontos obtidos por inimigo.', max:5, available:()=>upgradeLevel('bounty')<5, apply:()=>{state.scoreMultiplier=(state.scoreMultiplier||1)+.12;} }
    ,{ id:'volley', icon:'✣', name:'Salva auxiliar', description:'Adiciona disparos extras ao seu leque.', max:3, available:()=>state.bonusShots<3, apply:()=>{state.bonusShots+=1;} }
    ,{ id:'blast', icon:'✺', name:'Munição de plasma', description:'Seus tiros atingem inimigos próximos ao alvo.', max:4, available:()=>state.blastRadius<56, apply:()=>{state.blastRadius=Math.min(56,state.blastRadius+14);} }
    ,{ id:'bossDamage', icon:'☄', name:'Rompedor de guardiões', description:'Aumenta o dano causado aos chefes.', max:5, available:()=>state.bossDamageBonus<.75, apply:()=>{state.bossDamageBonus=Math.min(.75,state.bossDamageBonus+.15);} }
    ,{ id:'lowHull', icon:'⚑', name:'Protocolo de emergência', description:'Ganha velocidade quando restam duas vidas ou menos.', max:3, available:()=>state.lowHullBoost<3, apply:()=>{state.lowHullBoost+=1;} }
    ,{ id:'lifeSupport', icon:'♥+', name:'Casco reforçado', description:'Aumenta o máximo de vida e recupera uma unidade.', max:3, available:()=>state.maxLives<9, apply:()=>{state.maxLives=Math.min(9,state.maxLives+1);state.lives=Math.min(state.maxLives,state.lives+1);} }
    ,{ id:'gravityWell', icon:'🌀', name:'Poço gravitacional', description:'Amplia e prolonga o buraco negro da Tempestade.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('gravityWell')<3, apply:()=>{state.singularityRadius+=32;state.singularityDuration+=.7;} }
    ,{ id:'returnCore', icon:'⟲', name:'Núcleo de contra-ataque', description:'Aumenta o dano, prolonga o escudo refletor e reduz sua recarga.', max:4, available:()=>currentSkin().id==='redshift'&&upgradeLevel('returnCore')<4, apply:()=>{state.reflectDamageBonus=Math.min(.9,state.reflectDamageBonus+.23);state.reflectDurationBonus=Math.min(2,state.reflectDurationBonus+.5);state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1.25);} }
    ,{ id:'salvageHeal', icon:'✚', name:'Recuperação de destroços', description:'Inimigos destruídos podem liberar energia de reparo.', max:4, available:()=>state.salvageHeal<4, apply:()=>{state.salvageHeal+=1;} }
    ,{ id:'endlessDamage', icon:'✹', name:'Núcleo adaptativo', description:'Reforço repetível com ganho decrescente e limite seguro de dano.', max:0, stack:true, available:()=>state.endlessDamage<1.24, apply:()=>{state.endlessDamage=Math.min(1.25,state.endlessDamage + .11 / (1 + upgradeLevel('endlessDamage') * .14));} }
    ,{ id:'endlessSpeed', icon:'➤', name:'Impulso de longo curso', description:'Aumenta a mobilidade aos poucos, com velocidade máxima controlada.', max:0, stack:true, available:()=>state.endlessSpeed<118, apply:()=>{state.endlessSpeed=Math.min(120,state.endlessSpeed + 8 / (1 + upgradeLevel('endlessSpeed') * .12));} }
  ];

  function readBest() { try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); } catch { return 0; } }
  function readBestWave() { try { return Math.max(0, Number(localStorage.getItem(bestWaveKey)) || 0); } catch { return 0; } }
  function profileNickname() { return String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '').trim().toLocaleLowerCase('pt-BR'); }
  function saoPauloDateKey(date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      const part = (type) => parts.find((item) => item.type === type)?.value || '00';
      return `${part('year')}-${part('month')}-${part('day')}`;
    } catch { return date.toISOString().slice(0, 10); }
  }
  function formatChallengeDate(key) {
    const [year, month, day] = String(key || '').split('-').map(Number);
    if (!year || !month || !day) return 'hoje';
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  function seedDailyStreams(dateKey) {
    let seed = 2166136261;
    for (const char of `CV-STARFALL-DESAFIO-${dateKey}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
    const salts = { enemy: 0x243f6a88, boss: 0x85a308d3, loot: 0x13198a2e, combat: 0x03707344, ability: 0xa4093822, upgrades: 0x299f31d0, spawnTimer: 0x082efa98, attack: 0xec4e6c89 };
    state.randomStreams = Object.fromEntries(Object.entries(salts).map(([name, salt]) => [name, (seed ^ salt) >>> 0]));
  }
  function dailyBestKey(dateKey) { const nickname = profileNickname(); return dailyBestPrefix + (nickname ? encodeURIComponent(nickname) : 'local') + ':' + dateKey; }
  function readDailyBest(dateKey = saoPauloDateKey()) {
    try {
      const record = JSON.parse(localStorage.getItem(dailyBestKey(dateKey)) || 'null');
      if (!record || !Number.isFinite(Number(record.wave)) || !Number.isFinite(Number(record.score))) return null;
      return { wave: Math.max(1, Math.floor(Number(record.wave))), score: Math.max(0, Math.floor(Number(record.score))), elapsed_seconds: Math.max(0, Math.floor(Number(record.elapsed_seconds) || 0)), ship_name: String(record.ship_name || 'Aurora') };
    } catch { return null; }
  }
  function saveDailyBest(run) {
    const previous = readDailyBest(run.challenge_date);
    const isRecord = !previous || run.wave > previous.wave || (run.wave === previous.wave && run.score > previous.score);
    if (isRecord) {
      try { localStorage.setItem(dailyBestKey(run.challenge_date), JSON.stringify({ wave: run.wave, score: run.score, elapsed_seconds: run.elapsed_seconds, ship_name: run.ship_name })); } catch { /* O desafio ainda pode ser concluído sem armazenamento local. */ }
    }
    return { isRecord, best: isRecord ? run : previous };
  }
  function updateDailyChallengeInfo(dateKey = saoPauloDateKey()) {
    if (!ui.dailyRecord) return;
    const best = readDailyBest(dateKey);
    ui.dailyRecord.textContent = best
      ? `Desafio de ${formatChallengeDate(dateKey)} · seu recorde local: onda ${best.wave} · ${best.score} pontos`
      : `Desafio de ${formatChallengeDate(dateKey)} · mesma sequência para todos · recorde ainda não definido`;
  }
  function showDailySummary(run, result) {
    if (!ui.dailySummaryModal) return;
    if (ui.dailySummaryDate) ui.dailySummaryDate.textContent = `Desafio de ${formatChallengeDate(state.challengeDate)}`;
    if (ui.dailySummaryResult) ui.dailySummaryResult.textContent = result.isRecord ? 'NOVO RECORDE DO DIA!' : 'MISSÃO ENCERRADA';
    if (ui.dailySummaryRecord) {
      const best = result.best || run;
      ui.dailySummaryRecord.textContent = `Seu melhor resultado hoje: onda ${best.wave} · ${Number(best.score).toLocaleString('pt-BR')} pontos.`;
    }
    if (ui.dailySummaryDetails) {
      const stats = [
        ['Onda alcançada', String(run.wave)],
        ['Pontuação', `${Number(run.score).toLocaleString('pt-BR')} pontos`],
        ['Tempo de missão', formatTime(run.elapsed_seconds)],
        ['Nave utilizada', run.ship_name],
        ['Melhorias coletadas', String(run.buff_summary.melhorias)],
        ['Dano final', run.buff_summary.dano],
        ['Velocidade final', String(run.buff_summary.velocidade)],
        ['Escudos restantes', String(run.buff_summary.escudos)]
      ];
      ui.dailySummaryDetails.replaceChildren();
      stats.forEach(([label, value]) => {
        const item = document.createElement('div');
        item.className = 'starfall-daily-summary-stat';
        const name = document.createElement('span');
        name.textContent = label;
        const resultText = document.createElement('strong');
        resultText.textContent = value;
        item.append(name, resultText);
        ui.dailySummaryDetails.append(item);
      });
    }
    ui.dailySummaryModal.hidden = false;
    syncAudioVisibility();
    ui.dailySummaryModal.querySelector('[data-close-daily-summary]')?.focus();
  }
  function closeDailySummary() {
    if (!ui.dailySummaryModal) return;
    ui.dailySummaryModal.hidden = true;
    if (state.mode === 'gameover' && state.dailyChallenge) {
      state.dailyChallenge = false;
      state.challengeDate = '';
      state.dailyBestScore = 0;
      state.randomStreams = null;
      if (state.skinBeforeDaily) { state.selectedSkin = state.skinBeforeDaily; state.skinBeforeDaily = ''; }
      resetGame();
      setMode('intro');
      ui.title.textContent = 'O céu está caindo.';
      ui.copy.textContent = 'Desvie dos meteoros, destrua os drones e sobreviva. A cada onda, escolha uma melhoria para sua nave.';
      ui.start.textContent = '▶ INICIAR MISSÃO';
      ui.status.textContent = 'Pronto para a missão.';
    }
    ui.dailyStart?.focus();
    syncAudioVisibility();
  }
  function achievementStorageKey() {
    const nickname = profileNickname();
    return achievementStoragePrefix + (nickname ? encodeURIComponent(nickname) : 'local');
  }
  function emptyAchievementProgress() {
    return { missionsStarted: 0, bossesDefeated: 0, cleanWaves: 0, dailyRunsFinished: 0, bestWaveReached: 0, abilityShips: [], unlocked: {} };
  }
  function readAchievementProgress() {
    const empty = emptyAchievementProgress();
    try {
      const saved = JSON.parse(localStorage.getItem(achievementStorageKey()) || 'null');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return empty;
      for (const key of ['missionsStarted', 'bossesDefeated', 'cleanWaves', 'dailyRunsFinished', 'bestWaveReached']) {
        const value = Number(saved[key]);
        empty[key] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      }
      empty.abilityShips = Array.isArray(saved.abilityShips) ? [...new Set(saved.abilityShips.filter((id) => skins.some((skin) => skin.id === id)))] : [];
      empty.unlocked = saved.unlocked && typeof saved.unlocked === 'object' && !Array.isArray(saved.unlocked)
        ? Object.fromEntries(starfallAchievements.filter((item) => Number(saved.unlocked[item.id]) > 0).map((item) => [item.id, Number(saved.unlocked[item.id])]))
        : {};
    } catch { /* Conquistas reiniciam com segurança se o armazenamento estiver indisponível. */ }
    return empty;
  }
  function saveAchievementProgress() {
    try { localStorage.setItem(achievementStorageKey(), JSON.stringify(state.achievementProgress)); } catch { /* As conquistas continuam visíveis nesta sessão. */ }
  }
  function achievementValue(definition) {
    const value = state.achievementProgress?.[definition.metric];
    return definition.metric === 'abilityShips' ? (Array.isArray(value) ? value.length : 0) : Math.max(0, Number(value) || 0);
  }
  function renderAchievements() {
    if (!state.achievementProgress) state.achievementProgress = readAchievementProgress();
    const unlockedCount = starfallAchievements.filter((item) => achievementValue(item) >= item.target).length;
    if (ui.achievementsCount) ui.achievementsCount.textContent = `${unlockedCount}/${starfallAchievements.length}`;
    if (!ui.achievementsList) return;
    ui.achievementsList.replaceChildren();
    starfallAchievements.forEach((definition) => {
      const value = Math.min(definition.target, achievementValue(definition));
      const unlocked = value >= definition.target;
      const card = document.createElement('article'); card.className = 'starfall-achievement' + (unlocked ? ' is-unlocked' : '');
      const icon = document.createElement('span'); icon.className = 'starfall-achievement-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = unlocked ? definition.icon : '🔒';
      const body = document.createElement('span'); body.className = 'starfall-achievement-copy';
      const title = document.createElement('strong'); title.textContent = definition.title;
      const description = document.createElement('small'); description.textContent = definition.description;
      const progress = document.createElement('span'); progress.className = 'starfall-achievement-progress'; progress.textContent = unlocked ? 'Conquista desbloqueada' : `${value}/${definition.target} ${definition.unit}`;
      body.append(title, description, progress); card.append(icon, body); ui.achievementsList.append(card);
    });
  }
  function recordAchievementEvent(eventName, value) {
    if (!state.achievementProgress) state.achievementProgress = readAchievementProgress();
    const progress = state.achievementProgress;
    if (eventName === 'mission') progress.missionsStarted++;
    else if (eventName === 'boss') progress.bossesDefeated++;
    else if (eventName === 'clean-wave') progress.cleanWaves++;
    else if (eventName === 'daily-run') progress.dailyRunsFinished++;
    else if (eventName === 'wave') progress.bestWaveReached = Math.max(progress.bestWaveReached, Math.floor(Number(value) || 0));
    else if (eventName === 'ship-ability' && skins.some((skin) => skin.id === value) && !progress.abilityShips.includes(value)) progress.abilityShips.push(value);
    else return;
    for (const definition of starfallAchievements) {
      if (achievementValue(definition) < definition.target || progress.unlocked[definition.id]) continue;
      const record = Date.now(); progress.unlocked[definition.id] = record;
      window.dispatchEvent(new CustomEvent('cv-games-achievement-unlocked', { detail: { icon: definition.icon, title: definition.title, description: definition.description, unlockedAt: record } }));
    }
    saveAchievementProgress();
    renderAchievements();
  }
  function isDeveloperProfile() { return ['educvv dev', 'educvv dev1'].includes(profileNickname()); }
  function isCypherProfile() { return profileNickname() === 'cypher'; }
  function isAllUpgradesProfile() { return profileNickname() === 'educvv dev1'; }
  function hasDeveloperPerks() { return isDeveloperProfile() && !state.dailyChallenge; }
  function skinUnlocked(skin) {
    if (skin.secret) return isDeveloperProfile() || isCypherProfile();
    return isDeveloperProfile() || !skin.unlockWave || Math.max(readBestWave(), state.bestCompletedWave) >= skin.unlockWave;
  }
  function readSkin() {
    try {
      const id = localStorage.getItem('cv-games-cv-starfall-skin');
      const skin = skins.find((item) => item.id === id);
      if (!skin) return 'aurora';
      const unlocked = skin.secret
        ? isDeveloperProfile() || isCypherProfile()
        : isDeveloperProfile() || !skin.unlockWave || readBestWave() >= skin.unlockWave;
      return unlocked ? id : 'aurora';
    } catch { return 'aurora'; }
  }
  function readControlMode() { try { const mode=localStorage.getItem(controlModeKey); return ['keys','touch','analog'].includes(mode)?mode:'keys'; } catch { return 'keys'; } }
  function readPerformanceMode() { try { return localStorage.getItem(performanceModeKey) === 'light' ? 'light' : 'normal'; } catch { return 'normal'; } }
  function currentSkin() {
    const selected = skins.find((skin) => skin.id === state.selectedSkin);
    return selected && skinUnlocked(selected) ? selected : skins[0];
  }
  function saveBest() { try { localStorage.setItem(bestKey, String(state.best)); } catch { /* Recorde mantido nesta sessão. */ } }
  function saveBestWave() { try { localStorage.setItem(bestWaveKey, String(state.bestCompletedWave)); } catch { /* Desbloqueios mantidos nesta sessão. */ } }
  function updateEquippedShip() {
    if (!ui.equippedShip) return;
    const skin = currentSkin();
    const silhouettes = { classic: 'M20 3 L34 35 L20 28 L6 35 Z', blade: 'M20 2 L24 16 L36 33 L20 27 L4 33 L16 16 Z', wing: 'M20 2 L25 16 L37 30 L25 27 L20 38 L15 27 L3 30 L15 16 Z', shield: 'M20 2 L32 17 L29 32 L20 37 L11 32 L8 17 Z', ring: 'M20 3 L34 35 L20 28 L6 35 Z', reflector: 'M20 2 L33 10 L37 23 L28 34 L20 38 L12 34 L3 23 L7 10 Z' };
    ui.equippedShip.style.setProperty('--skin-color', skin.color);
    ui.equippedShip.innerHTML = '<svg class="starfall-equipped-icon" viewBox="0 0 40 40" aria-hidden="true"><path d="' + silhouettes[skin.shape] + '" fill="' + skin.color + '" stroke="' + skin.accent + '" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="3.3" ry="6" fill="#f1ffff"/><path d="M15 31 L20 38 L25 31" fill="' + skin.accent + '"/>' + (skin.shape === 'ring' ? '<ellipse cx="20" cy="21" rx="17" ry="8" fill="none" stroke="' + skin.accent + '" stroke-width="1.2"/>' : skin.shape === 'reflector' ? '<path d="M3 17 Q20 1 37 17" fill="none" stroke="' + skin.accent + '" stroke-width="2"/>' : '') + '</svg><span><strong>Nave equipada: ' + skin.name + '</strong><small>' + skin.ability + (hasDeveloperPerks() ? ' · sem recarga' : ' · recarga ' + skin.cooldown + 's') + '</small></span>';
  }
  function releaseAnalog() {
    state.analog.active = false; state.analog.x = 0; state.analog.y = 0; state.analog.pointerId = null;
    if (ui.joystick) { ui.joystick.hidden = true; ui.joystick.classList.remove('is-active'); }
    if (ui.joystickNub) { ui.joystickNub.style.left = '50%'; ui.joystickNub.style.top = '50%'; }
  }
  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.cvStarfallState = mode;
    ui.overlay.hidden = !['intro', 'gameover', 'paused'].includes(mode);
    const menuActions = [ui.dailyStart, ui.dailyRecord, ui.overlay?.querySelector('[data-open-ships]'), ui.overlay?.querySelector('[data-open-achievements]')];
    menuActions.forEach((item) => { if (item) item.hidden = mode === 'paused'; });
    const menuExit = ui.overlay?.querySelector('[data-exit-from-menu]');
    if (menuExit) menuExit.hidden = mode !== 'paused';
    ui.upgrade.hidden = mode !== 'upgrade';
    ui.pause.disabled = !['playing'].includes(mode) && mode !== 'paused';
    if (ui.pauseIcon) ui.pauseIcon.textContent = mode === 'paused' ? '▶' : '⏸';
    if (ui.pauseLabel) ui.pauseLabel.textContent = mode === 'paused' ? 'RETOMAR' : 'PAUSAR';
    ui.pause.setAttribute('aria-label', mode === 'paused' ? 'Retomar missão' : 'Pausar missão');
    ui.pause.title = mode === 'paused' ? 'Retomar missão' : 'Pausar missão';
    if (ui.stop) ui.stop.hidden = !['playing', 'paused', 'upgrade', 'gameover'].includes(mode);
    updateAbilityButton();
  }
  function formatTime(seconds) {
    const value = Math.max(0, Math.floor(seconds));
    return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
  }
  function currentZone() { return zones[Math.floor((state.wave - 1) / 15) % zones.length]; }
  function updateHud() {
    ui.wave.textContent = String(state.wave);
    if (ui.zone) ui.zone.textContent = currentZone().name;
    if (ui.timer) ui.timer.textContent = formatTime(state.elapsed);
    ui.score.textContent = String(state.score);
    const shownBest = state.dailyChallenge ? state.dailyBestScore : state.best;
    ui.best.textContent = String(shownBest);
    ui.overlayBest.textContent = String(shownBest);
    ui.lives.textContent = String(state.lives);
    if (ui.shields) ui.shields.textContent = String(state.shields + state.tempShields);
    if (ui.healthFill) {
      const ratio = clamp(state.lives / state.maxLives, 0, 1);
      ui.healthFill.style.width = (ratio * 100) + '%';
      ui.healthFill.style.background = ratio > .6 ? 'linear-gradient(90deg,#38dc91,#a7ff9b)' : ratio > .3 ? 'linear-gradient(90deg,#ff9f43,#ffe16b)' : 'linear-gradient(90deg,#ff456c,#ff8c72)';
      ui.healthFill.parentElement?.setAttribute('aria-label', 'Vida: ' + state.lives + ' de ' + state.maxLives);
      ui.healthFill.parentElement?.style.setProperty('--health-segment', (100 / state.maxLives) + '%');
    }
    updateAbilityButton();
  }
  function updateAbilityButton() {
    if (!ui.ability) return;
    const skin = currentSkin();
    const ready = state.abilityCooldown <= 0;
    ui.ability.disabled = state.mode !== 'playing' || !ready;
    ui.ability.textContent = '★';
    ui.ability.setAttribute('aria-label', ready ? 'Usar habilidade ' + skin.ability + ' · tecla E' : skin.ability + ' recarregando: ' + Math.ceil(state.abilityCooldown) + ' segundos');
    if (ui.abilityCooldown) ui.abilityCooldown.textContent = hasDeveloperPerks() ? 'Livre' : ready ? 'Pronta' : Math.ceil(state.abilityCooldown) + 's';
    ui.ability.title = skin.ability + (hasDeveloperPerks() ? ' · sem recarga: ' : ': ') + skin.description;
  }
  function renderSkinPicker() {
    if (!ui.skinPicker) return;
    ui.skinPicker.replaceChildren();
    skins.forEach((skin) => {
      if (skin.secret && !skinUnlocked(skin)) {
        const secretCard = document.createElement('button');
        secretCard.type = 'button';
        secretCard.className = 'starfall-skin-card is-secret';
        secretCard.disabled = true;
        secretCard.setAttribute('aria-label', 'Nave desconhecida, conteúdo secreto');
        secretCard.title = 'Nave desconhecida · secreta';
        secretCard.innerHTML = '<span class="starfall-skin-icon" aria-hidden="true">?</span><strong>Desconhecido</strong><span>SECRETO</span>';
        ui.skinPicker.append(secretCard);
        return;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'starfall-skin-card' + (skin.id === state.selectedSkin ? ' is-selected' : '');
      button.setAttribute('aria-pressed', String(skin.id === state.selectedSkin));
      button.title = skin.description;
      const unlocked = skinUnlocked(skin);
      button.disabled = !unlocked;
      button.classList.toggle('is-locked', !unlocked);
      button.innerHTML = '<span class="starfall-skin-icon" style="--skin-color:' + skin.color + '" aria-hidden="true">' + (unlocked ? '✦' : '🔒') + '</span><strong>' + skin.name + '</strong><span>' + (unlocked ? skin.ability : 'Desbloqueia na onda ' + skin.unlockWave) + '</span><small>' + skin.description + '</small>';
      button.addEventListener('click', () => {
        if (!skinUnlocked(skin) || state.mode === 'playing' || state.mode === 'upgrade') return;
        state.selectedSkin = skin.id;
        try { localStorage.setItem('cv-games-cv-starfall-skin', skin.id); } catch { /* A escolha vale para esta sessão. */ }
        renderSkinPicker();
        updateEquippedShip();
        ui.copy.textContent = skin.description;
        closeShips();
      });
      ui.skinPicker.append(button);
    });
  }
  function makeStars() {
    const count = state.performanceMode === 'light' ? 34 : 100;
    state.stars = Array.from({ length: count }, () => ({ x: visualRandom(0, state.width), y: visualRandom(0, state.height), z: visualRandom(.25, 1), phase: visualRandom(0, 7) }));
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    state.dpr = Math.min(window.devicePixelRatio || 1, state.performanceMode === 'light' ? 1 : 2);
    canvas.width = Math.round(rect.width * state.dpr);
    canvas.height = Math.round(rect.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.width = rect.width;
    state.height = rect.height;
    state.player.x = clamp(state.player.x, 22, state.width - 22);
    state.player.y = clamp(state.player.y, 22, state.height - 22);
    makeStars();
    if (state.mode !== 'playing') draw(performance.now());
  }
  function tone(freq, duration = .08, type = 'sine', volume = .035) {
    window.CV_GAME_AUDIO?.playTone(freq, duration, type, volume);
  }
  function toast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.remove('is-visible');
    void ui.toast.offsetWidth;
    ui.toast.classList.add('is-visible');
  }
  function resetGame() {
    state.score = 0; state.wave = 1; state.lives = 3; state.maxLives = 6; state.shields = 0; state.tempShields = 0; state.invulnerable = 1.4; state.elapsed = 0;
    state.shotCooldown = 0; state.waveGrace = .45; state.enemySpawn = .22; state.powerSpawn = 8; state.waveKills = 0;
    state.enemiesRequired = 9; state.bossWave = false; state.bossSpawned = false; state.miniBossTimer = 0; state.miniBossSpawned = false;
    state.bullets = []; state.enemyBullets = []; state.enemies = []; state.particles = []; state.pickups = []; state.effects = [];
    const skin = currentSkin();
    state.player = { x: state.width / 2, y: state.height * .78, radius: 13, speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, color: skin.color, accent: skin.accent, shape: skin.shape };
    state.upgrades = {}; state.abilityCooldown = 0; state.abilityBaseCooldown = skin.cooldown; state.abilityPower = 1; state.slowTime = 0;
    state.scoreMultiplier = 1; state.magnet = 105; state.pierce = 0; state.critChance = 0; state.armorChance = 0; state.regenLevel = 0; state.regenTimer = 24; state.drones = 0; state.droneCooldown = 0; state.lastBossType = '';
    state.blastRadius = 0; state.bossDamageBonus = 0; state.bonusShots = 0; state.lowHullBoost = 0; state.salvageHeal = 0; state.singularityRadius = 235; state.singularityDuration = 6.5; state.reflectTime = 0; state.reflectContacts = new Set(); state.reflectDamageBonus = 0; state.reflectDurationBonus = 0; state.endlessDamage = 0; state.endlessSpeed = 0;
    state.waveDamageTaken = false;
    if (isAllUpgradesProfile() && !state.dailyChallenge) grantAllUpgrades();
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    if (ui.runSummary) { ui.runSummary.hidden = true; ui.runSummary.replaceChildren(); }
    renderSkinPicker();
    updateEquippedShip();
    updateHud();
  }
  function grantAllUpgrades() {
    let changed = true;
    let passes = 0;
    while (changed && passes < 60) {
      changed = false;
      passes++;
      for (const upgrade of upgradeList) {
        if (!upgrade.available()) continue;
        upgrade.apply();
        state.upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
        changed = true;
      }
    }
    state.lives = state.maxLives;
  }
  function startGame(dailyChallenge = false) {
    if (!['intro', 'gameover'].includes(state.mode)) return;
    cancelAnimationFrame(state.raf);
    if (ui.dailySummaryModal) ui.dailySummaryModal.hidden = true;
    syncAudioVisibility();
    if (dailyChallenge) {
      if (!state.skinBeforeDaily) state.skinBeforeDaily = state.selectedSkin;
      state.selectedSkin = 'aurora';
      state.dailyChallenge = true;
      state.challengeDate = saoPauloDateKey();
      seedDailyStreams(state.challengeDate);
      state.dailyBestScore = readDailyBest(state.challengeDate)?.score || 0;
      updateDailyChallengeInfo(state.challengeDate);
    } else {
      state.dailyChallenge = false;
      state.challengeDate = '';
      state.dailyBestScore = 0;
      state.randomStreams = null;
      if (state.skinBeforeDaily) { state.selectedSkin = state.skinBeforeDaily; state.skinBeforeDaily = ''; }
    }
    resetGame();
    setMode('playing');
    ui.status.textContent = state.dailyChallenge ? `Desafio diário de ${formatChallengeDate(state.challengeDate)}. Boa sorte, piloto!` : isAllUpgradesProfile() ? 'Missão iniciada com todos os upgrades disponíveis.' : 'Missão iniciada. Sobreviva à primeira onda!';
    if (state.dailyChallenge) toast('DESAFIO DIÁRIO · NAVE AURORA');
    else if (isAllUpgradesProfile()) toast('UPGRADES MÁXIMOS EQUIPADOS');
    recordAchievementEvent('mission');
    recordAchievementEvent('wave', state.wave);
    if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    state.lastTime = performance.now();
    state.raf = requestAnimationFrame(frame);
  }
  function pauseGame() {
    if (state.mode === 'playing') {
      state.keys.clear(); state.pointer.active = false; releaseAnalog();
      setMode('paused'); ui.title.textContent = 'Missão pausada'; ui.copy.textContent = 'Respire fundo. Sua nave está segura por enquanto.';
      ui.start.textContent = '▶ RETOMAR MISSÃO'; ui.status.textContent = 'Jogo pausado.';
      cancelAnimationFrame(state.raf);
    } else if (state.mode === 'paused') {
      setMode('playing'); ui.status.textContent = 'Missão retomada.'; state.lastTime = performance.now(); state.raf = requestAnimationFrame(frame);
    }
  }
  function finishGame() {
    if (state.mode === 'gameover') return;
    setMode('gameover');
    const dailyRun = state.dailyChallenge;
    const newRecord = !dailyRun && state.score > state.best;
    if (newRecord) { state.best = state.score; saveBest(); }
    updateHud();
    ui.title.textContent = dailyRun ? 'DESAFIO CONCLUÍDO' : newRecord ? 'NOVO RECORDE!' : 'A missão acabou.';
    ui.copy.textContent = dailyRun
      ? `Desafio de ${formatChallengeDate(state.challengeDate)}: você chegou à onda ${state.wave}, marcou ${state.score} pontos e sobreviveu por ${formatTime(state.elapsed)}.`
      : `Você chegou à onda ${state.wave}, marcou ${state.score} pontos e sobreviveu por ${formatTime(state.elapsed)}.`;
    ui.start.textContent = '↻ TENTAR DE NOVO';
    ui.status.textContent = dailyRun ? 'Seu resultado diário foi guardado neste dispositivo.' : 'Nave perdida. Uma nova missão pode começar quando quiser.';
    const run = {
      wave: state.wave, score: state.score, elapsed_seconds: Math.floor(state.elapsed),
      ship_id: currentSkin().id, ship_name: currentSkin().name,
      buff_summary: {
        dano: (state.player.damage * (1 + state.endlessDamage)).toFixed(2), velocidade: Math.round(Math.min(525, state.player.speed + state.endlessSpeed)),
        recarga: state.player.fireRate.toFixed(2) + 's', disparos: state.player.spread + state.bonusShots,
        drones: state.drones, perfuracao: state.pierce, chance_critica: Math.round(state.critChance * 100) + '%',
        escudos: state.shields, vida_maxima: state.maxLives, reparo_dest: Math.round(state.salvageHeal * 3.5) + '%',
        explosao: state.blastRadius, dano_chefe: Math.round(state.bossDamageBonus * 100) + '%', buraco_negro: currentSkin().id === 'tempest' ? Math.round(state.singularityRadius) : 0,
        melhorias: Object.values(state.upgrades).reduce((sum, value) => sum + value, 0),
        reforco_adaptativo: Math.round(state.endlessDamage * 100) + '%', impulso_extra: Math.round(state.endlessSpeed)
      }
    };
    if (ui.runSummary) {
      ui.runSummary.hidden = dailyRun;
      if (dailyRun) ui.runSummary.replaceChildren();
      else ui.runSummary.textContent = 'Resumo: onda ' + run.wave + ' · ' + formatTime(run.elapsed_seconds) + ' · ' + run.ship_name + ' · dano ' + run.buff_summary.dano + ' · velocidade ' + run.buff_summary.velocidade + ' · vida máxima ' + run.buff_summary.vida_maxima + ' · reparo ' + run.buff_summary.reparo_dest + ' · leque ' + run.buff_summary.disparos + ' · raio plasma ' + run.buff_summary.explosao + ' · dano a chefes ' + run.buff_summary.dano_chefe + (run.buff_summary.buraco_negro ? ' · buraco negro ' + run.buff_summary.buraco_negro + 'px' : '') + ' · melhorias ' + run.buff_summary.melhorias + ' · núcleo adaptativo ' + run.buff_summary.reforco_adaptativo + ' · impulso extra +' + run.buff_summary.impulso_extra;
    }
    if (dailyRun) {
      const result = saveDailyBest({ ...run, challenge_date: state.challengeDate });
      state.dailyBestScore = result.best?.score || state.dailyBestScore;
      recordAchievementEvent('daily-run');
      updateHud();
      updateDailyChallengeInfo();
      if (ui.rankStatus) ui.rankStatus.textContent = result.isRecord ? 'Novo recorde diário local!' : 'Desafio guardado neste dispositivo';
      showDailySummary(run, result);
    } else submitRun(run).then(refreshLeaderboard);
    tone(newRecord ? 520 : 170, .3, newRecord ? 'triangle' : 'sawtooth', .05);
    if (dailyRun && state.skinBeforeDaily) {
      state.selectedSkin = state.skinBeforeDaily;
      state.skinBeforeDaily = '';
      renderSkinPicker();
      updateEquippedShip();
    }
  }
  function openUpgrade() {
    const completedWave = state.wave;
    if (!state.waveDamageTaken) recordAchievementEvent('clean-wave');
    recordAchievementEvent('wave', completedWave);
    if (state.wave > state.bestCompletedWave) { state.bestCompletedWave = state.wave; saveBestWave(); renderSkinPicker(); }
    setMode('upgrade');
    state.wave += 1;
    if (Math.floor((state.wave - 1) / 15) !== Math.floor((state.wave - 2) / 15)) toast('NOVO PLANETA: ' + currentZone().name.toUpperCase());
    updateHud();
    ui.status.textContent = 'Escolha uma melhoria antes da próxima onda.';
    const availableUpgrades = upgradeList.filter((upgrade) => upgrade.available());
    const choices = [];
    while (availableUpgrades.length && choices.length < 3) {
      const weights = availableUpgrades.map((upgrade) => upgrade.id === 'spread' || upgrade.id === 'volley' ? 1.7 : 1);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let roll = randomUnit('upgrades') * totalWeight;
      let selectedIndex = 0;
      for (; selectedIndex < weights.length - 1; selectedIndex++) {
        roll -= weights[selectedIndex];
        if (roll < 0) break;
      }
      choices.push(availableUpgrades.splice(selectedIndex, 1)[0]);
    }
    ui.upgradeOptions.replaceChildren();
    if (!choices.length) {
      beginNextWave();
      setMode('playing');
      ui.status.textContent = `Onda ${state.wave}. Boa sorte, piloto.`;
      state.lastTime = performance.now();
      state.raf = requestAnimationFrame(frame);
      return;
    }
    for (const upgrade of choices) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'starfall-upgrade-card';
      button.innerHTML = `<span class="starfall-upgrade-icon" aria-hidden="true">${upgrade.icon}</span><strong>${upgrade.name}${upgrade.max ? ` · ${upgradeLevel(upgrade.id) + 1}/${upgrade.max}` : upgrade.stack ? ` · ${upgradeLevel(upgrade.id) + 1}` : ''}</strong><span>${upgrade.description}</span>`;
      button.addEventListener('click', () => {
        upgrade.apply();
        state.upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
        updateHud();
        toast(`${upgrade.icon} ${upgrade.name.toUpperCase()}`);
        beginNextWave();
        setMode('playing'); ui.status.textContent = `Onda ${state.wave}. Boa sorte, piloto.`;
        state.lastTime = performance.now(); state.raf = requestAnimationFrame(frame);
      });
      ui.upgradeOptions.append(button);
    }
    tone(640, .2, 'triangle', .04);
  }
  function beginNextWave() {
    state.enemiesRequired = 10 + Math.floor(state.wave * 2.15) + Math.floor(state.wave / 10) * 3;
    state.waveKills = 0; state.bossWave = state.wave % 10 === 0; state.bossSpawned = false;
    const waveInCycle = state.wave % 10;
    state.miniBossSpawned = false; state.miniBossTimer = !state.bossWave && (waveInCycle === 4 || waveInCycle === 8) ? 3.5 : 0;
    state.enemySpawn = .31; state.waveGrace = .4; state.powerSpawn = 7.5;
    state.waveDamageTaken = false;
    recordAchievementEvent('wave', state.wave);
    ui.status.textContent = state.bossWave ? `Onda ${state.wave}: sinal de guardião detectado!` : `Onda ${state.wave}: novos inimigos se aproximam.`;
    if (state.bossWave) toast(`GUARDIÃO NA ONDA ${state.wave}`);
  }
  function spawnEnemy() {
    const edge = Math.floor(randomUnit('enemy') * 4);
    const pad = 22;
    const pos = edge === 0 ? { x: random(pad, state.width - pad, 'enemy'), y: -18 }
      : edge === 1 ? { x: state.width + 18, y: random(pad, state.height - pad, 'enemy') }
        : edge === 2 ? { x: random(pad, state.width - pad, 'enemy'), y: state.height + 18 }
          : { x: -18, y: random(pad, state.height - pad, 'enemy') };
    const roll = randomUnit('enemy');
    let kind = 'meteor';
    if (state.wave >= 2 && roll > .43) kind = 'drone';
    if (state.wave >= 3 && roll > .72) kind = 'hunter';
    if (state.wave >= 6 && roll > .87) kind = 'brute';
    if (state.wave >= 4 && roll > .985 && !state.enemies.some((enemy) => enemy.kind === 'ricochet' && !enemy.dead)) kind = 'ricochet';
    const tier = Math.floor((state.wave - 1) / 10);
    const multiplier = Math.min(3.6, 1 + (state.wave - 1) * .04 + tier * .12) * enemyUpgradeSpeedScale();
    const hpScale = (1 + tier * .55 + Math.floor((state.wave - 1) / 20) * .3) * enemyUpgradeHpScale();
    const config = {
      meteor: { r: random(15, 23, 'enemy') + Math.min(8, tier), hp: Math.ceil((2 + Math.floor(state.wave / 8)) * hpScale), speed: random(64, 92, 'enemy') * multiplier, score: 85, color: '#f6a26f' },
      drone: { r: 16 + Math.min(5, tier), hp: Math.ceil((3 + Math.floor(state.wave / 6)) * hpScale), speed: random(75, 102, 'enemy') * multiplier, score: 145, color: '#ff5fa4', shoot: random(1.05, 1.65, 'attack') },
      hunter: { r: 14 + Math.min(4, tier), hp: Math.ceil((3 + Math.floor(state.wave / 5)) * hpScale), speed: Math.min(330, random(126, 153, 'enemy') * (1 + Math.min(state.wave - 1, 28) * .04)) * enemyUpgradeSpeedScale(), score: 185, color: '#b68aff' },
      brute: { r: 26 + Math.min(8, tier * 2), hp: Math.ceil((8 + Math.floor(state.wave / 3)) * hpScale), speed: 49 * multiplier, score: 280, color: '#ffcf69', shoot: 1.55 },
      ricochet: { r: 17 + Math.min(6, tier), hp: Math.ceil((4 + Math.floor(state.wave / 6)) * hpScale), speed: random(72, 98, 'enemy') * multiplier, score: 210, color: '#71eaff', shoot: random(.95, 1.5, 'attack') }
    }[kind];
    state.enemies.push({ ...pos, ...config, kind, maxHp: config.hp, cooldown: config.shoot || 0, spin: random(-2, 2, 'enemy'), angle: random(0, 7, 'enemy'), ramCooldown: 0, hitFlash: 0 });
  }
  function selectBossType() {
    if (state.wave === 10) return 'drone';
    if (state.wave === 20) return 'hunter';
    if (state.wave === 30) return 'brute';
    if (state.wave === 40) return 'prism';
    if (state.wave === 50) return 'meteor';
    const types = ['meteor', 'drone', 'brute', 'hunter', 'prism'];
    if (state.lastBossType && randomUnit('boss') < .28) return state.lastBossType;
    return types[Math.floor(randomUnit('boss') * types.length)];
  }
  function spawnBoss(isMini = false) {
    if (!isMini) {
      if (state.bossSpawned) return;
      state.bossSpawned = true;
    }
    const bossType = selectBossType();
    if (!isMini) state.lastBossType = bossType;
    const tier = Math.floor((state.wave - 1) / 10);
    const hp = isMini
      ? Math.round(Math.min(18, 5 + tier * 2) * enemyUpgradeHpScale())
      : Math.round((115 + state.wave * 9 + Math.pow(state.wave / 5, 2) * 15 + tier * 55) * .72 * enemyUpgradeHpScale());
    const boss = bossTypes[bossType];
    const radius = isMini ? random(21, 26, 'boss') : bossType === 'brute' ? 47 : 40;
    state.enemies.push({ x: random(state.width * .3, state.width * .7, 'boss'), y: isMini ? -30 : -55, r: radius, hp, maxHp: hp, speed: (isMini ? 43 + tier * 3 : 68 + tier * 11) * enemyUpgradeSpeedScale(), score: isMini ? 350 + state.wave * 35 : 1900 + state.wave * 180, color: boss.color, kind: 'boss', bossType, bossName: (isMini ? 'Mini-chefe ' : '') + boss.name, isMiniBoss: isMini, phase: 1, cooldown: isMini ? 2.25 : .72, angle: 0, spin: .35, ramCooldown: 0, dashTime: 0, dashCooldown: 2.2, hitFlash: 0, drift: random(0, Math.PI * 2, 'boss') });
    toast((isMini ? 'MINI-CHEFE: ' : '') + boss.name.toUpperCase());
    if (!isMini) tone(90, .7, 'sawtooth', .045);
  }
  function spawnPickup(x, y, kind) {
    const pickupKind = kind || (randomUnit('loot') < .06 ? 'charge' : randomUnit('loot') > .5 ? 'repair' : 'shield');
    state.pickups.push({ x, y, kind: pickupKind, r: 11, life: 10, spin: 0 });
  }
  function burst(x, y, color, count = 12, power = 100) {
    const lightMode = state.performanceMode === 'light';
    const particleCount = lightMode ? Math.ceil(count * .45) : count;
    const particleLimit = lightMode ? 110 : Infinity;
    for (let i = 0; i < particleCount && state.particles.length < particleLimit; i++) {
      const angle = visualRandomUnit() * Math.PI * 2; const speed = visualRandom(power * .25, power);
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: visualRandom(.22, .62), maxLife: .62, r: visualRandom(1.5, 3.5), color });
    }
  }
  function fire() {
    const n = state.player.spread + state.bonusShots;
    for (let i = 0; i < n; i++) {
      const offset = i - (n - 1) / 2;
      const angle = -Math.PI / 2 + offset * .17;
      state.bullets.push({ x: state.player.x + Math.sin(angle) * 13, y: state.player.y - 10, vx: Math.sin(angle) * 40, vy: Math.cos(angle) * -510, r: 3.5, damage: state.player.damage, color: '#8affee' });
    }
    tone(420, .035, 'square', .012);
  }
  function nearestEnemy() {
    const active = state.enemies.filter((enemy) => !enemy.dead);
    const nearbyHunter = active.filter((enemy) => enemy.kind === 'hunter' && distance(state.player, enemy) < 235).sort((a, b) => distance(state.player, a) - distance(state.player, b))[0];
    if (nearbyHunter) return nearbyHunter;
    return active.sort((a, b) => {
      const score = (enemy) => (enemy.kind === 'boss' ? 240 : enemy.kind === 'hunter' ? 165 : enemy.kind === 'drone' ? 70 : 0) - distance(state.player, enemy);
      return score(b) - score(a);
    })[0] || null;
  }
  function fireAt(target) {
    if (!target) return;
    const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
    const totalShots = state.player.spread + state.bonusShots;
    for (let i = 0; i < totalShots; i++) {
      const direction = angle + (i - (totalShots - 1) / 2) * .16;
      const critical = randomUnit('combat') < state.critChance;
      state.bullets.push({ x: state.player.x + Math.cos(direction) * 13, y: state.player.y + Math.sin(direction) * 13, vx: Math.cos(direction) * 510, vy: Math.sin(direction) * 510, r: critical ? 5 : 3.5, damage: state.player.damage * (1 + state.endlessDamage) * (critical ? 2 : 1), pierce: state.pierce, hit: [], color: critical ? '#ffe38a' : currentSkin().accent });
    }
    tone(420, .035, 'square', .01);
  }
  function enemyFire(enemy) {
    const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
    const shot = (a, speed, r, extras = {}) => state.enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.r * .35, vx: Math.cos(a) * speed * enemyUpgradeAttackScale(), vy: Math.sin(a) * speed * enemyUpgradeAttackScale(), r: r || 5, color: enemy.color, source: enemy, ...extras });
    if (enemy.isMiniBoss) {
      const speed = Math.min(285, 175 + state.wave * 1.35);
      if (enemy.bossType === 'prism') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .24, speed, 5, { bounces: 1, damage: 1 });
      } else if (enemy.bossType === 'brute') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .2, speed * .82, 5, { damage: 1 });
      } else {
        for (let i = -1; i <= 1; i++) shot(angle + i * .22, speed, 4, { damage: 1 });
      }
      tone(170, .05, 'sawtooth', .01); return;
    }
    if (enemy.kind !== 'boss') {
      if (enemy.kind === 'ricochet') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .2, Math.min(350, 220 + state.wave * 2.4), 6, { bounces: 1, damage: 1 });
      } else if (enemy.kind === 'brute') {
        shot(angle, Math.min(300, 185 + state.wave * 2), 8, { explosive: true, fuse: 1.25, blastRadius: 66, damage: 1 });
      } else shot(angle, Math.min(360, 210 + state.wave * 2.8), 5, { damage: 1 });
      tone(150, .06, 'sawtooth', .012); return;
    }
    const phase = enemy.phase || 1;
    const speedScale = 1 + (phase - 1) * .18;
    const bossShot = (a, speed, r, extras = {}) => shot(a, speed * speedScale, r, { damage: phase >= 3 ? 2 : 1, ...extras });
    if (enemy.bossType === 'meteor') {
      const start = performance.now() / 1000;
      const count = phase >= 3 ? 15 : phase === 2 ? 12 : 9;
      for (let i = 0; i < count; i++) bossShot(start + i * Math.PI * 2 / count, 175 + state.wave, 6);
      if (phase >= 2) bossShot(angle, 290 + state.wave, 7);
    } else if (enemy.bossType === 'drone') {
      const spread = phase >= 3 ? 4 : phase === 2 ? 3 : 2;
      for (let i = -spread; i <= spread; i++) bossShot(angle + i * .15, 265 + state.wave, 5);
      if (phase >= 3) bossShot(angle - .045, 330 + state.wave, 5);
    } else if (enemy.bossType === 'brute') {
      for (let i = -2; i <= 2; i++) bossShot(angle + i * .19, 180 + state.wave, i === 0 ? 8 : 6);
      if (phase >= 3) for (let i = -1; i <= 1; i++) bossShot(angle + i * .28, 270 + state.wave, 6, { bounces: 1 });
    } else if (enemy.bossType === 'hunter') {
      const spread = phase >= 3 ? 2 : phase === 2 ? 1 : 0;
      for (let i = -spread; i <= spread; i++) bossShot(angle + i * .12, 315 + state.wave, 6);
      if (phase >= 2) bossShot(angle - .055, 350 + state.wave, 5);
      if (phase >= 3) bossShot(angle + .055, 350 + state.wave, 5);
    } else {
      const count = phase >= 3 ? 8 : phase === 2 ? 6 : 4;
      const start = performance.now() / 1000;
      for (let i = 0; i < count; i++) bossShot(start + i * Math.PI * 2 / count, 230 + state.wave, 6, { bounces: 1 });
    }
    tone(150, .06, 'sawtooth', .012);
  }
  function explodeBullet(bullet) {
    if (bullet.exploded) return;
    bullet.exploded = true; bullet.dead = true;
    const radius = bullet.blastRadius || 78;
    burst(bullet.x, bullet.y, '#ffbd67', 26, 165); burst(bullet.x, bullet.y, '#fff1b4', 13, 105);
    if (distance(bullet, state.player) < radius + state.player.radius && state.reflectTime <= 0) damagePlayer(bullet.damage || 2);
    state.enemies.forEach((enemy) => { if (!enemy.dead && distance(bullet, enemy) < radius + enemy.r) damageEnemy(enemy, 8 + state.wave * .2, true); });
  }
  function damagePlayer(amount = 1) {
    if (state.invulnerable > 0 || state.mode !== 'playing') return;
    if (randomUnit('combat') < state.armorChance) { state.invulnerable = .28; toast('BLINDAGEM REATIVA'); tone(480, .1, 'triangle', .025); return; }
    let remaining = Math.max(1, Math.floor(amount));
    const tempUsed = Math.min(state.tempShields, remaining); state.tempShields -= tempUsed; remaining -= tempUsed;
    const regularUsed = Math.min(state.shields, remaining); state.shields -= regularUsed; remaining -= regularUsed;
    if (remaining === 0) { state.invulnerable = .82; toast(tempUsed ? 'BARREIRA AEGIS ABSORVEU O IMPACTO' : 'ESCUDO ABSORVEU O IMPACTO'); tone(680, .18, 'triangle', .04); updateHud(); return; }
    if (tempUsed || regularUsed) toast('IMPACTO ROMPEU SEUS ESCUDOS');
    state.waveDamageTaken = true;
    state.lives = Math.max(0, state.lives - remaining);
    state.invulnerable = 1.35; burst(state.player.x, state.player.y, '#ff6687', 22, 160); tone(120, .23, 'sawtooth', .05); updateHud();
    if (state.lives <= 0) finishGame();
  }
  function reflectIncomingBullet(bullet) {
    if (state.reflectTime <= 0 || bullet.dead || bullet.reflected) return false;
    const shieldRadius = state.player.radius + 20;
    if (distance(bullet, state.player) > shieldRadius + bullet.r) return false;
    const originalAttacker = bullet.source && !bullet.source.dead && state.enemies.includes(bullet.source) ? bullet.source : null;
    const target = randomUnit('ability') < .58 ? originalAttacker || nearestEnemy() : null;
    const angle = target
      ? Math.atan2(target.y - state.player.y, target.x - state.player.x)
      : Math.atan2(-bullet.vy, -bullet.vx);
    const speed = clamp(Math.hypot(bullet.vx, bullet.vy) * 1.08, 300, 480);
    bullet.x = state.player.x + Math.cos(angle) * (shieldRadius + bullet.r + 2);
    bullet.y = state.player.y + Math.sin(angle) * (shieldRadius + bullet.r + 2);
    bullet.vx = Math.cos(angle) * speed;
    bullet.vy = Math.sin(angle) * speed;
    bullet.damage = Math.min(12, Math.max(2, (bullet.damage || 1) * (1 + state.abilityPower * .42 + state.reflectDamageBonus)));
    bullet.color = currentSkin().color;
    bullet.r = clamp(bullet.r || 5, 4, 7);
    bullet.reflected = true;
    bullet.reflectLife = 2.2;
    bullet.explosive = false;
    bullet.exploded = false;
    bullet.fuse = null;
    bullet.blastRadius = 0;
    bullet.bounces = 0;
    burst(bullet.x, bullet.y, currentSkin().accent, 5, 85);
    return true;
  }
  function defeatEnemy(enemy, ability) {
    if (!enemy || enemy.dead) return;
    enemy.dead = true;
    state.score += Math.round(enemy.score * (state.scoreMultiplier || 1));
    state.waveKills += enemy.kind === 'boss' ? (enemy.isMiniBoss ? 2 : state.enemiesRequired) : 1;
    burst(enemy.x, enemy.y, enemy.color, enemy.kind === 'boss' ? 44 : 15, enemy.kind === 'boss' ? 220 : 110);
    if (state.salvageHeal > 0 && state.lives < state.maxLives && randomUnit('loot') < state.salvageHeal * .035) { state.lives++; toast('DESTROÇOS RECICLADOS · +1 VIDA'); }
    if (enemy.kind === 'boss' && !enemy.isMiniBoss) {
      recordAchievementEvent('boss');
      spawnPickup(enemy.x - 20, enemy.y, 'repair'); spawnPickup(enemy.x, enemy.y, 'shield'); spawnPickup(enemy.x + 20, enemy.y, 'charge');
      toast(enemy.bossName.toUpperCase() + ' DESTRUÍDO');
    } else if (enemy.isMiniBoss) {
      spawnPickup(enemy.x, enemy.y, 'charge'); toast('MINI-CHEFE DESTRUÍDO');
    } else if (randomUnit('loot') < .1) spawnPickup(enemy.x, enemy.y);
    updateHud();
  }
  function damageEnemy(enemy, amount, fromAbility) {
    if (!enemy || enemy.dead) return;
    if (enemy.kind === 'boss') amount *= 1 + state.bossDamageBonus;
    enemy.hp -= amount;
    enemy.hitFlash = .12;
    if (enemy.kind === 'boss' && !enemy.isMiniBoss && enemy.hp > 0) {
      const ratio = enemy.hp / enemy.maxHp;
      const nextPhase = ratio <= .32 ? 3 : ratio <= .66 ? 2 : 1;
      if (nextPhase > (enemy.phase || 1)) {
        enemy.phase = nextPhase; enemy.cooldown = .18;
        burst(enemy.x, enemy.y, enemy.color, 30 + nextPhase * 8, 190);
        toast(enemy.bossName.toUpperCase() + ' · FASE ' + nextPhase);
      }
    }
    if (enemy.hp <= 0) defeatEnemy(enemy, fromAbility);
  }
  function activateAbility() {
    const developerProfile = hasDeveloperPerks();
    if (state.mode !== 'playing' || (!developerProfile && state.abilityCooldown > 0)) return;
    const skin = currentSkin();
    recordAchievementEvent('ship-ability', skin.id);
    state.abilityCooldown = developerProfile ? 0 : state.abilityBaseCooldown || skin.cooldown;
    if (skin.id === 'aurora') {
      const radius = 285;
      state.effects.push({ type: 'nova', x: state.player.x, y: state.player.y, radius: 0, maxRadius: radius, life: .95, total: .95 });
      state.enemies.slice().forEach((enemy) => { const d = distance(state.player, enemy); if (d < radius + enemy.r) damageEnemy(enemy, (33 + Math.max(0, radius - d) * .1) * state.abilityPower, true); });
      burst(state.player.x, state.player.y, skin.color, 76, 310); burst(state.player.x, state.player.y, '#ffffff', 28, 190); toast('EXPLOSÃO NOVA');
    } else if (skin.id === 'flashblade') {
      const angle = state.player.angle || -Math.PI / 2;
      state.effects.push({ type: 'blade', x: state.player.x, y: state.player.y, vx: Math.cos(angle) * 730, vy: Math.sin(angle) * 730, angle, turnTimer: .12, life: 9.4, total: 9.4, bounces: 0, damage: 14 * state.abilityPower, hitCooldowns: [], trail: [{ x: state.player.x, y: state.player.y }] });
      burst(state.player.x, state.player.y, skin.color, 34, 195); toast('CORTE FLASH · TRAJETÓRIA INSTÁVEL');
    } else if (skin.id === 'tempest') {
      const angle = state.player.angle || -Math.PI / 2;
      state.effects.push({ type: 'singularity-shot', x: state.player.x + Math.cos(angle) * 18, y: state.player.y + Math.sin(angle) * 18, vx: Math.cos(angle) * 470, vy: Math.sin(angle) * 470, angle, life: .72, total: .72 });
      toast('SINGULARIDADE DISPARADA');
    } else if (skin.id === 'chronos') {
      state.slowTime = 5.4; state.effects.push({ type: 'chronos', life: 5.4, total: 5.4 }); toast('TEMPO DOBRADO');
    } else if (skin.id === 'aegis') {
      state.tempShields = Math.max(state.tempShields, 3); state.effects.push({ type: 'aegis', life: 9, total: 9 }); toast('BARREIRA AEGIS · 3 IMPACTOS'); updateHud();
    } else if (skin.id === 'redshift') {
      const duration = Math.min(10, 8 + state.reflectDurationBonus);
      state.reflectTime = duration;
      state.reflectContacts = new Set();
      state.effects.push({ type: 'reflect-shield', life: duration, total: duration });
      burst(state.player.x, state.player.y, skin.color, 42, 210); burst(state.player.x, state.player.y, skin.accent, 18, 145);
      toast('ESCUDO DE RETORNO · ' + duration.toFixed(1).replace('.', ',') + 's');
    }
    updateAbilityButton(); tone(740, .22, 'triangle', .05);
  }
  function update(dt) {
    state.elapsed += dt;
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.waveGrace = Math.max(0, state.waveGrace - dt);
    state.shotCooldown -= dt;
    state.powerSpawn -= dt;
    state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    state.slowTime = Math.max(0, state.slowTime - dt);
    state.reflectTime = Math.max(0, state.reflectTime - dt);
    if (state.regenLevel > 0 && state.lives < state.maxLives) {
      state.regenTimer -= dt;
      if (state.regenTimer <= 0) { state.lives++; state.regenTimer = Math.max(16, 32 - state.regenLevel * 4); toast('NANORREPARO +1 VIDA'); updateHud(); }
    }
    let dx = 0; let dy = 0;
    if (state.controlMode === 'keys') {
      if (state.keys.has('ArrowLeft') || state.keys.has('KeyA')) dx -= 1;
      if (state.keys.has('ArrowRight') || state.keys.has('KeyD')) dx += 1;
      if (state.keys.has('ArrowUp') || state.keys.has('KeyW')) dy -= 1;
      if (state.keys.has('ArrowDown') || state.keys.has('KeyS')) dy += 1;
    } else if (state.controlMode === 'touch' && state.pointer.active) {
      const d = Math.hypot(state.pointer.x - state.player.x, state.pointer.y - state.player.y);
      if (d > 8) { dx = (state.pointer.x - state.player.x) / d; dy = (state.pointer.y - state.player.y) / d; }
    } else if (state.controlMode === 'analog' && state.analog.active) { dx = state.analog.x; dy = state.analog.y; }
    if (dx !== 0 || dy !== 0) {
      // Quantiza a direção do movimento em oito ângulos de 45 graus.
      const eighthTurn = Math.PI / 4;
      state.player.angle = Math.round(Math.atan2(dy, dx) / eighthTurn) * eighthTurn;
    }
    const norm = Math.hypot(dx, dy) || 1;
    const hullSpeed = state.lives <= 2 ? 1 + state.lowHullBoost * .12 : 1;
    const moveSpeed = Math.min(525, state.player.speed + state.endlessSpeed);
    state.player.x = clamp(state.player.x + (dx / norm) * moveSpeed * hullSpeed * dt, 17, state.width - 17);
    state.player.y = clamp(state.player.y + (dy / norm) * moveSpeed * hullSpeed * dt, 17, state.height - 17);
    if (state.shotCooldown <= 0 && state.enemies.length) { fireAt(nearestEnemy()); state.shotCooldown = state.player.fireRate; }
    if (!state.bossWave && state.waveKills < state.enemiesRequired && state.waveGrace <= 0) {
      state.enemySpawn -= dt;
      if (state.enemySpawn <= 0 && state.enemies.length < Math.min(42, 12 + Math.floor(state.wave * .62))) { spawnEnemy(); state.enemySpawn = Math.max(.2, .72 - state.wave * .01 - Math.floor((state.wave - 1) / 10) * .045) * random(.52, .88, 'spawnTimer'); }
    }
    if (state.bossWave && !state.bossSpawned) { state.enemySpawn -= dt; if (state.enemySpawn <= 0) spawnBoss(); }
    if (state.miniBossTimer > 0 && !state.miniBossSpawned) {
      state.miniBossTimer -= dt;
      if (state.miniBossTimer <= 0) { state.miniBossSpawned = true; spawnBoss(true); }
    }
    if (state.powerSpawn <= 0 && state.wave > 1) { spawnPickup(random(30, state.width - 30, 'loot'), random(40, state.height - 40, 'loot')); state.powerSpawn = random(13, 20, 'spawnTimer'); }
    for (const bullet of state.bullets) { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; }
    state.bullets = state.bullets.filter(b => b.x > -20 && b.x < state.width + 20 && b.y > -30 && b.y < state.height + 20);
    const slowFactor = state.slowTime > 0 ? .42 : 1;
    for (const bullet of state.enemyBullets) {
      if (bullet.dead) continue;
      reflectIncomingBullet(bullet);
      if (bullet.reflected) {
        bullet.reflectLife -= dt;
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        const target = state.enemies.find((enemy) => !enemy.dead && Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r * .72);
        if (target) {
          damageEnemy(target, bullet.damage, true);
          burst(bullet.x, bullet.y, bullet.color, 8, 95);
          bullet.dead = true;
        }
        if (bullet.reflectLife <= 0 || bullet.x < -24 || bullet.x > state.width + 24 || bullet.y < -24 || bullet.y > state.height + 24) bullet.dead = true;
        continue;
      }
      if (bullet.fuse != null) { bullet.fuse -= dt * slowFactor; if (bullet.fuse <= 0) { explodeBullet(bullet); continue; } }
      bullet.x += bullet.vx * dt * slowFactor; bullet.y += bullet.vy * dt * slowFactor;
      const hitX = bullet.x < bullet.r || bullet.x > state.width - bullet.r;
      const hitY = bullet.y < bullet.r || bullet.y > state.height - bullet.r;
      if (hitX || hitY) {
        if ((bullet.bounces || 0) > 0) {
          if (hitX) { bullet.x = clamp(bullet.x, bullet.r, state.width - bullet.r); bullet.vx *= -1; }
          if (hitY) { bullet.y = clamp(bullet.y, bullet.r, state.height - bullet.r); bullet.vy *= -1; }
          bullet.bounces--;
          if (bullet.bounces === 0) burst(bullet.x, bullet.y, bullet.color, 5, 65);
        } else if (bullet.explosive) explodeBullet(bullet);
        else bullet.dead = true;
      }
    }
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    for (const enemy of state.enemies) {
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      enemy.angle += enemy.spin * dt;
      enemy.ramCooldown = Math.max(0, (enemy.ramCooldown || 0) - dt);
      enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
      if (enemy.kind === 'boss') {
        enemy.drift += dt * slowFactor * (.65 + (enemy.phase || 1) * .22);
        if (enemy.bossType === 'hunter' && !enemy.isMiniBoss && enemy.dashTime > 0) {
          enemy.x += Math.cos(angle) * 420 * dt; enemy.y += Math.sin(angle) * 420 * dt; enemy.dashTime -= dt;
        } else {
          const targetY = 112 + Math.sin(enemy.drift * .8) * Math.min(35, state.height * .045);
          enemy.y += clamp(targetY - enemy.y, -enemy.speed * dt * slowFactor, enemy.speed * dt * slowFactor);
          const targetX = state.width / 2 + Math.sin(enemy.drift * (enemy.bossType === 'prism' ? 1.7 : 1.1)) * Math.min(state.width * .34, 260);
          enemy.x += clamp(targetX - enemy.x, -enemy.speed * (1 + (enemy.phase - 1) * .5) * dt * slowFactor, enemy.speed * (1 + (enemy.phase - 1) * .5) * dt * slowFactor);
          if (enemy.bossType === 'hunter' && !enemy.isMiniBoss) {
            enemy.x += Math.cos(angle) * 36 * dt * slowFactor;
            enemy.dashCooldown -= dt * slowFactor;
            if (enemy.dashCooldown <= 0) { enemy.dashTime = .55; enemy.dashCooldown = Math.max(1.5, 3.1 - enemy.phase * .5); toast('INVESTIDA DO ESPECTRO'); }
          }
        }
      } else {
        const speed = enemy.kind === 'hunter' || enemy.kind === 'ricochet' ? enemy.speed : enemy.speed * .82;
        enemy.x += Math.cos(angle) * speed * dt * slowFactor; enemy.y += Math.sin(angle) * speed * dt * slowFactor;
      }
      if (enemy.cooldown) {
        enemy.cooldown -= dt * slowFactor;
        if (enemy.cooldown <= 0 && enemy.y > 0 && enemy.y < state.height - 25) {
          enemyFire(enemy);
          const baseCooldown = enemy.kind === 'boss' ? (enemy.isMiniBoss ? random(2.1, 2.7, 'attack') : Math.max(.48, (enemy.bossType === 'hunter' ? .92 : enemy.bossType === 'drone' ? .76 : enemy.bossType === 'prism' ? .86 : 1.1) * (1 - (enemy.phase - 1) * .16))) : enemy.kind === 'brute' || enemy.kind === 'ricochet' ? random(1.05, 1.55, 'attack') : random(1.45, 2.35, 'attack');
          enemy.cooldown = baseCooldown * enemyUpgradeFireRateScale();
        }
      }
      if (distance(state.player, enemy) < state.player.radius + enemy.r * .75) {
        if (state.reflectTime > 0) {
          if (!state.reflectContacts.has(enemy)) {
            state.reflectContacts.add(enemy);
            const angleAway = Math.atan2(enemy.y - state.player.y, enemy.x - state.player.x);
            const separation = enemy.r + state.player.radius + 10;
            enemy.x = clamp(state.player.x + Math.cos(angleAway) * separation, enemy.r, state.width - enemy.r);
            enemy.y = clamp(state.player.y + Math.sin(angleAway) * separation, enemy.r, state.height - enemy.r);
            damageEnemy(enemy, (enemy.kind === 'boss' ? 7 : 5) * state.abilityPower, true);
            burst(state.player.x + Math.cos(angleAway) * (state.player.radius + 14), state.player.y + Math.sin(angleAway) * (state.player.radius + 14), currentSkin().accent, 8, 120);
          }
          continue;
        }
        if (enemy.kind !== 'hunter' || enemy.ramCooldown <= 0) {
          damagePlayer(enemy.kind === 'boss' && enemy.phase >= 2 ? 2 : 1);
          if (enemy.kind === 'hunter') {
            enemy.ramCooldown = 1.2;
            const separation = enemy.r + state.player.radius + 12;
            enemy.x = clamp(state.player.x - Math.cos(angle) * separation, enemy.r, state.width - enemy.r);
            enemy.y = clamp(state.player.y - Math.sin(angle) * separation, enemy.r, state.height - enemy.r);
            burst(enemy.x, enemy.y, enemy.color, 8, 90);
          }
        }
      }
    }
    for (const bullet of state.bullets) {
      for (const enemy of state.enemies) {
        if (bullet.dead || enemy.dead || (bullet.hit && bullet.hit.includes(enemy))) continue;
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r * .72) {
          damageEnemy(enemy, bullet.damage, false); burst(bullet.x, bullet.y, bullet.color, 4, 56);
          if (state.blastRadius > 0) state.enemies.forEach((nearby) => { if (nearby !== enemy && !nearby.dead && distance(enemy, nearby) < state.blastRadius + nearby.r) damageEnemy(nearby, bullet.damage * .45, true); });
          if (bullet.pierce > 0) { bullet.pierce--; bullet.hit = bullet.hit || []; bullet.hit.push(enemy); }
          else bullet.dead = true;
          break;
        }
      }
    }
    state.bullets = state.bullets.filter(b => !b.dead);
    state.enemies = state.enemies.filter(e => !e.dead && e.y > -100 && e.y < state.height + 100 && e.x > -100 && e.x < state.width + 100);
    for (const bullet of state.enemyBullets) if (!bullet.dead && !bullet.reflected && Math.hypot(bullet.x - state.player.x, bullet.y - state.player.y) < bullet.r + state.player.radius * .7) {
      if (reflectIncomingBullet(bullet)) continue;
      if (bullet.explosive) explodeBullet(bullet);
      else { bullet.dead = true; damagePlayer(bullet.damage || 1); }
    }
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    state.droneCooldown -= dt;
    if (state.drones && state.droneCooldown <= 0) {
      state.droneCooldown = .42;
      for (let i = 0; i < state.drones; i++) {
        const angle = performance.now() / 800 + i * Math.PI * 2 / state.drones;
        const satellite = { x: state.player.x + Math.cos(angle) * 39, y: state.player.y + Math.sin(angle) * 39 };
        const enemy = state.enemies.find((target) => !target.dead && distance(satellite, target) < target.r + 11);
        if (enemy) damageEnemy(enemy, .85, true);
      }
    }
    for (const pickup of state.pickups) {
      pickup.life -= dt; pickup.spin += dt * 3;
      const angle = Math.atan2(state.player.y - pickup.y, state.player.x - pickup.x);
      if (distance(state.player, pickup) < state.magnet) { const pull = 96 + state.magnet * .15; pickup.x += Math.cos(angle) * pull * dt; pickup.y += Math.sin(angle) * pull * dt; }
      if (distance(state.player, pickup) < state.player.radius + pickup.r) {
        pickup.dead = true;
        if (pickup.kind === 'repair') { state.lives = Math.min(state.maxLives, state.lives + 1); toast('CASCO REPARADO +1 VIDA'); }
        else if (pickup.kind === 'charge') { state.abilityCooldown = Math.max(0, state.abilityCooldown - 8); toast('CARGA DE HABILIDADE −8s'); }
        else { state.shields = Math.min(4, state.shields + 1); toast('ESCUDO DE ENERGIA +1'); }
        const color = pickup.kind === 'repair' ? '#76ffae' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff';
        burst(pickup.x, pickup.y, color, 14, 90); tone(780, .17, 'sine', .04); updateHud();
      }
    }
    state.pickups = state.pickups.filter(p => !p.dead && p.life > 0);
    const activeEffects = [];
    for (const effect of state.effects) {
      effect.life -= dt;
      if (effect.type === 'blade') {
        effect.turnTimer -= dt;
        if (effect.turnTimer <= 0) {
          const target = state.enemies.filter((enemy) => !enemy.dead)
            .sort((a, b) => distance(effect, a) - distance(effect, b))[0];
          if (target) {
            const targetAngle = Math.atan2(target.y - effect.y, target.x - effect.x);
            const difference = Math.atan2(Math.sin(targetAngle - effect.angle), Math.cos(targetAngle - effect.angle));
            effect.angle += difference * .74 + random(-.38, .38, 'ability');
          } else effect.angle += random(-1.45, 1.45, 'ability');
          const speed = random(680, 835, 'ability');
          effect.vx = Math.cos(effect.angle) * speed; effect.vy = Math.sin(effect.angle) * speed;
          effect.turnTimer = random(.16, .28, 'ability');
        }
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        let bounced = false;
        if (effect.x < 7 || effect.x > state.width - 7) { effect.x = clamp(effect.x, 7, state.width - 7); effect.angle = Math.PI - effect.angle + random(-.52, .52, 'ability'); bounced = true; }
        if (effect.y < 7 || effect.y > state.height - 7) { effect.y = clamp(effect.y, 7, state.height - 7); effect.angle = -effect.angle + random(-.52, .52, 'ability'); bounced = true; }
        if (bounced) {
          effect.bounces++; const speed = random(650, 800, 'ability'); effect.vx = Math.cos(effect.angle) * speed; effect.vy = Math.sin(effect.angle) * speed;
          effect.turnTimer = random(.1, .18, 'ability'); burst(effect.x, effect.y, '#fff3ba', 12, 135); burst(effect.x, effect.y, '#ffc86e', 9, 100);
        }
        const previous = effect.trail[effect.trail.length - 1];
        if (!previous || Math.hypot(effect.x - previous.x, effect.y - previous.y) > 9) effect.trail.push({ x: effect.x, y: effect.y });
        if (effect.trail.length > (state.performanceMode === 'light' ? 10 : 24)) effect.trail.shift();
        effect.hitCooldowns = (effect.hitCooldowns || []).filter((entry) => { entry.time -= dt; return entry.time > 0 && !entry.enemy.dead; });
        for (const enemy of state.enemies) {
          const cooling = effect.hitCooldowns.some((entry) => entry.enemy === enemy);
          if (!enemy.dead && !cooling && Math.hypot(effect.x - enemy.x, effect.y - enemy.y) < enemy.r + 25) {
            damageEnemy(enemy, effect.damage, true); effect.hitCooldowns.push({ enemy, time: .42 });
            burst(effect.x, effect.y, '#fff4c7', 10, 125); burst(effect.x, effect.y, '#ffc86e', 8, 100);
          }
        }
        if (visualRandomUnit() < dt * (state.performanceMode === 'light' ? 7 : 22) && (state.performanceMode !== 'light' || state.particles.length < 110)) state.particles.push({ x: effect.x, y: effect.y, vx: visualRandom(-30, 30), vy: visualRandom(-30, 30), life: .28, maxLife: .28, r: visualRandom(2, 4), color: visualRandomUnit() < .5 ? '#fff7d5' : '#ffc86e' });
      } else if (effect.type === 'singularity-shot') {
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        if (effect.x < 12 || effect.x > state.width - 12 || effect.y < 12 || effect.y > state.height - 12) { effect.x = clamp(effect.x, 12, state.width - 12); effect.y = clamp(effect.y, 12, state.height - 12); effect.life = 0; }
        if (visualRandomUnit() < dt * (state.performanceMode === 'light' ? 9 : 28) && (state.performanceMode !== 'light' || state.particles.length < 110)) state.particles.push({ x: effect.x + visualRandom(-5, 5), y: effect.y + visualRandom(-5, 5), vx: visualRandom(-55, 55), vy: visualRandom(-55, 55), life: .38, maxLife: .38, r: visualRandom(1.5, 3), color: visualRandomUnit() < .5 ? '#8ef6ff' : '#c19cff' });
        const hit = state.enemies.find((enemy) => !enemy.dead && distance(effect, enemy) < enemy.r + 13);
        if (hit) { damageEnemy(hit, 24 * state.abilityPower, true); effect.life = 0; }
        if (effect.life <= 0) {
          effect.type = 'blackhole'; effect.life = state.singularityDuration; effect.total = state.singularityDuration; effect.radius = state.singularityRadius; effect.damageClock = .2;
          effect.vx *= .45; effect.vy *= .45; effect.moveTimer = .55;
          burst(effect.x, effect.y, '#b99aff', 34, 210); burst(effect.x, effect.y, '#7df7e8', 20, 130);
          toast('POÇO NEGRO ATIVO');
        }
      } else if (effect.type === 'blackhole') {
        effect.moveTimer -= dt;
        if (effect.moveTimer <= 0) {
          const cluster = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(effect, a) - distance(effect, b)).slice(0, 5);
          let targetX = random(20, state.width - 20, 'ability'), targetY = random(20, state.height - 20, 'ability');
          if (cluster.length) { targetX = cluster.reduce((sum, enemy) => sum + enemy.x, 0) / cluster.length; targetY = cluster.reduce((sum, enemy) => sum + enemy.y, 0) / cluster.length; }
          const desired = Math.atan2(targetY - effect.y, targetX - effect.x) + random(-.5, .5, 'ability');
          let current = Math.atan2(effect.vy, effect.vx);
          const turn = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
          current += turn * (cluster.length ? .5 : .8);
          effect.vx = Math.cos(current) * 155; effect.vy = Math.sin(current) * 155;
          effect.moveTimer = random(.55, .95, 'ability');
        }
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        if (effect.x < 18 || effect.x > state.width - 18) { effect.x = clamp(effect.x, 18, state.width - 18); effect.vx *= -1; effect.moveTimer = .18; }
        if (effect.y < 18 || effect.y > state.height - 18) { effect.y = clamp(effect.y, 18, state.height - 18); effect.vy *= -1; effect.moveTimer = .18; }
        effect.damageClock -= dt;
        for (const enemy of state.enemies) {
          if (enemy.dead) continue;
          const dxHole = effect.x - enemy.x; const dyHole = effect.y - enemy.y; const d = Math.hypot(dxHole, dyHole);
          if (d < effect.radius) {
            const pull = (110 + (1 - d / effect.radius) * 260) * dt;
            enemy.x += dxHole / (d || 1) * pull; enemy.y += dyHole / (d || 1) * pull;
          }
        }
        if (effect.damageClock <= 0) {
          effect.damageClock = .32;
          state.enemies.forEach((enemy) => { if (!enemy.dead && distance(effect, enemy) < effect.radius) damageEnemy(enemy, 4.2 * state.abilityPower, true); });
        }
        for (const bullet of state.enemyBullets) {
          if (bullet.dead) continue;
          const dxHole = effect.x - bullet.x; const dyHole = effect.y - bullet.y; const d = Math.hypot(dxHole, dyHole);
          if (d < effect.radius) { if (d < 16) bullet.dead = true; else { const force = (180 + (1 - d / effect.radius) * 360) * dt; bullet.vx += dxHole / d * force; bullet.vy += dyHole / d * force; } }
        }
        for (const pickup of state.pickups) {
          const dxHole = effect.x - pickup.x; const dyHole = effect.y - pickup.y; const d = Math.hypot(dxHole, dyHole);
          if (d < effect.radius) { const force = (120 + (1 - d / effect.radius) * 210) * dt; pickup.x += dxHole / (d || 1) * force; pickup.y += dyHole / (d || 1) * force; }
        }
      } else if (effect.type === 'nova') effect.radius = effect.maxRadius * (1 - effect.life / effect.total);
      if (effect.life > 0) activeEffects.push(effect);
    }
    state.effects = activeEffects;
    state.enemies = state.enemies.filter(e => !e.dead);
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    state.pickups = state.pickups.filter(p => !p.dead);
    for (const p of state.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985; p.vy *= .985; p.life -= dt; }
    state.particles = state.particles.filter(p => p.life > 0);
    if (state.mode === 'playing' && state.waveKills >= state.enemiesRequired && state.enemies.length === 0 && (state.miniBossSpawned || state.miniBossTimer <= 0)) openUpgrade();
    if (Math.floor(state.elapsed) !== Math.floor(state.elapsed - dt)) updateHud();
    updateAbilityButton();
  }
  function drawShip(x, y, size, skin, angle = -Math.PI / 2, alpha = 1) {
    const ship = skin && typeof skin === 'object' ? skin : currentSkin();
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); ctx.globalAlpha = alpha;
    ctx.shadowColor = ship.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 18; ctx.fillStyle = ship.color; ctx.strokeStyle = ship.accent; ctx.lineWidth = 2;
    ctx.beginPath();
    if (ship.shape === 'blade') {
      ctx.moveTo(0, -size * 1.65); ctx.lineTo(size * .34, -size * .22); ctx.lineTo(size * 1.12, size * .8); ctx.lineTo(0, size * .43); ctx.lineTo(-size * 1.12, size * .8); ctx.lineTo(-size * .34, -size * .22);
    } else if (ship.shape === 'reflector') {
      ctx.moveTo(0, -size * 1.55); ctx.lineTo(size * .58, -size * .62); ctx.lineTo(size * 1.24, -size * .12); ctx.lineTo(size * .8, size * .78); ctx.lineTo(size * .27, size * .48); ctx.lineTo(0, size * 1.02); ctx.lineTo(-size * .27, size * .48); ctx.lineTo(-size * .8, size * .78); ctx.lineTo(-size * 1.24, -size * .12); ctx.lineTo(-size * .58, -size * .62);
    } else if (ship.shape === 'wing') {
      ctx.moveTo(0, -size * 1.5); ctx.lineTo(size * .5, -size * .25); ctx.lineTo(size * 1.25, size * .65); ctx.lineTo(size * .34, size * .42); ctx.lineTo(0, size); ctx.lineTo(-size * .34, size * .42); ctx.lineTo(-size * 1.25, size * .65); ctx.lineTo(-size * .5, -size * .25);
    } else if (ship.shape === 'shield') {
      ctx.moveTo(0, -size * 1.48); ctx.lineTo(size, -size * .15); ctx.lineTo(size * .72, size * .86); ctx.lineTo(0, size * 1.08); ctx.lineTo(-size * .72, size * .86); ctx.lineTo(-size, -size * .15);
    } else {
      ctx.moveTo(0, -size * 1.45); ctx.lineTo(size * .92, size); ctx.lineTo(0, size * .56); ctx.lineTo(-size * .92, size);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#f1ffff'; ctx.beginPath(); ctx.ellipse(0, -size * .08, size * .27, size * .52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ship.accent; ctx.beginPath(); ctx.moveTo(-size * .42, size * .58); ctx.lineTo(0, size * visualRandom(1, 1.8)); ctx.lineTo(size * .42, size * .58); ctx.closePath(); ctx.fill();
    if (ship.shape === 'ring') { ctx.strokeStyle = ship.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.22, size * .58, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  function drawEnemy(enemy) {
    ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.rotate(enemy.angle); ctx.shadowColor = enemy.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : enemy.kind === 'boss' ? 24 : 12; ctx.fillStyle = enemy.color; ctx.strokeStyle = '#ffeef5'; ctx.lineWidth = 1.2;
    if (enemy.kind === 'boss' && enemy.bossType === 'drone') {
      ctx.beginPath(); ctx.arc(0, 0, enemy.r * .82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff2fa'; ctx.beginPath(); ctx.arc(0, 0, enemy.r * 1.16, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.fillStyle = '#fff2fa'; ctx.beginPath(); ctx.arc(Math.cos(a) * enemy.r, Math.sin(a) * enemy.r, 4, 0, Math.PI * 2); ctx.fill(); }
    } else if (enemy.kind === 'boss' && enemy.bossType === 'hunter') {
      ctx.beginPath(); ctx.moveTo(0, -enemy.r * 1.45); ctx.lineTo(enemy.r * .62, -enemy.r * .1); ctx.lineTo(enemy.r * .38, enemy.r * 1.25); ctx.lineTo(0, enemy.r * .68); ctx.lineTo(-enemy.r * .38, enemy.r * 1.25); ctx.lineTo(-enemy.r * .62, -enemy.r * .1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(-9, -3, 18, 5);
    } else if (enemy.kind === 'meteor' || enemy.kind === 'brute' || enemy.bossType === 'meteor' || enemy.bossType === 'brute') {
      const n = 8; ctx.beginPath();
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const r = enemy.r * (i % 2 ? .78 : visualRandom(.91, 1.08)); const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (enemy.kind === 'boss') {
      ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const r = enemy.r * (i % 2 ? .87 : 1.2); const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff3f7'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = enemy.color; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, -enemy.r * 1.15); ctx.lineTo(enemy.r, enemy.r * .85); ctx.lineTo(0, enemy.r * .46); ctx.lineTo(-enemy.r, enemy.r * .85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(-3, -2, 6, 4);
    }
    ctx.restore();
    if (enemy.kind === 'boss' && !enemy.isMiniBoss) {
      const barWidth = Math.min(250, state.width * .48); const ratio = clamp(enemy.hp / enemy.maxHp, 0, 1);
      const immersive = ui.panel && (document.fullscreenElement === ui.panel || document.webkitFullscreenElement === ui.panel || ui.panel.classList.contains('is-fullscreen-fallback'));
      const canvasTop = canvas.getBoundingClientRect().top;
      const belowHud = ui.hud ? ui.hud.getBoundingClientRect().bottom - canvasTop + 12 : 0;
      const barY = immersive ? Math.max(window.innerWidth <= 700 ? 88 : 78, belowHud) : 15;
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(state.width / 2 - barWidth / 2, barY, barWidth, 7);
      ctx.fillStyle = enemy.color; ctx.fillRect(state.width / 2 - barWidth / 2, barY, barWidth * ratio, 8);
      ctx.fillStyle = '#ffdbe4'; ctx.font = '800 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(enemy.bossName.toUpperCase() + ' · FASE ' + (enemy.phase || 1), state.width / 2, barY + 20);
    } else if (enemy.hp > 1) {
      const healthWidth = enemy.isMiniBoss ? enemy.r * 1.25 : enemy.r * 2;
      const healthY = enemy.y - enemy.r - (enemy.isMiniBoss ? 8 : 6);
      ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(enemy.x - healthWidth / 2, healthY, healthWidth, enemy.isMiniBoss ? 3 : 2);
      ctx.fillStyle = enemy.color; ctx.fillRect(enemy.x - healthWidth / 2, healthY, healthWidth * (enemy.hp / enemy.maxHp), enemy.isMiniBoss ? 3 : 2);
    }
  }
  function draw(timestamp) {
    ctx.clearRect(0, 0, state.width, state.height);
    const zone = currentZone();
    const bg = ctx.createLinearGradient(0, 0, state.width, state.height); bg.addColorStop(0, zone.colors[0]); bg.addColorStop(1, zone.colors[1]); ctx.fillStyle = bg; ctx.fillRect(0, 0, state.width, state.height);
    for (const star of state.stars) { star.y += star.z * .13; if (star.y > state.height) { star.y = 0; star.x = visualRandom(0, state.width); } const twinkle = state.performanceMode === 'light' ? .72 : .45 + .45 * Math.sin(timestamp / 600 + star.phase); ctx.fillStyle = `rgba(${zone.stars},${twinkle * star.z})`; ctx.fillRect(star.x, star.y, star.z * 1.5, star.z * 1.5); }
    ctx.strokeStyle = 'rgba(129,160,255,.045)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(state.width / 2, 0); ctx.lineTo(state.width / 2, state.height); ctx.moveTo(0, state.height / 2); ctx.lineTo(state.width, state.height / 2); ctx.stroke();
    for (const pickup of state.pickups) {
      const color = pickup.kind === 'repair' ? '#72ffad' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff'; ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(pickup.spin); ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 16; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -pickup.r); ctx.lineTo(pickup.r, 0); ctx.lineTo(0, pickup.r); ctx.lineTo(-pickup.r, 0); ctx.closePath(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pickup.kind === 'repair' ? '+' : pickup.kind === 'charge' ? '◷' : '⬡', 0, 0); ctx.restore();
    }
    for (const b of state.bullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    for (const b of state.enemyBullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    for (const enemy of state.enemies) drawEnemy(enemy);
    for (const p of state.particles) { ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const effect of state.effects) {
      const alpha = clamp(effect.life / (effect.total || effect.life), 0, 1);
      if (effect.type === 'nova') {
        ctx.save(); ctx.globalAlpha = alpha; const nova = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, effect.radius - 40), effect.x, effect.y, effect.radius); nova.addColorStop(0, 'rgba(125,247,232,.02)'); nova.addColorStop(.82, 'rgba(125,247,232,.09)'); nova.addColorStop(1, 'rgba(255,255,255,.35)'); ctx.fillStyle = nova; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = currentSkin().color; ctx.lineWidth = 8; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 34; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * .92, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'blade') {
        ctx.save(); ctx.globalAlpha = Math.min(1, alpha * 1.8); ctx.lineCap = 'round';
        if (effect.trail.length > 1) { ctx.beginPath(); ctx.moveTo(effect.trail[0].x, effect.trail[0].y); effect.trail.slice(1).forEach((point) => ctx.lineTo(point.x, point.y)); ctx.strokeStyle = 'rgba(255,200,110,.68)'; ctx.shadowColor = '#ffc86e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 22; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = 'rgba(255,248,220,.84)'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 7; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.strokeStyle = '#fff'; ctx.shadowColor = '#ffc86e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 34; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(0, -12, 34, 0); ctx.stroke(); ctx.strokeStyle = '#fff1b4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-29, 0); ctx.quadraticCurveTo(0, -9, 29, 0); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'singularity-shot' || effect.type === 'blackhole') {
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(timestamp / 260);
        const radius = effect.type === 'blackhole' ? 22 + Math.sin(timestamp / 95) * 3 : 13;
        const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, effect.type === 'blackhole' ? effect.radius * .42 : 25); glow.addColorStop(0, 'rgba(4,5,18,.99)'); glow.addColorStop(.22, 'rgba(23,13,54,.97)'); glow.addColorStop(.55, 'rgba(137,105,255,.22)'); glow.addColorStop(1, 'rgba(69,219,255,0)');
        ctx.globalAlpha = effect.type === 'blackhole' ? .95 : alpha; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, effect.type === 'blackhole' ? effect.radius * .42 : 25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#be9aff'; ctx.shadowColor = '#9c75ff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 28; ctx.lineWidth = effect.type === 'blackhole' ? 4 : 3; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.7, radius * .72, timestamp / 430, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#8ef6ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.28, radius * .5, -timestamp / 510, 0, Math.PI * 2); ctx.stroke();
        if (effect.type === 'blackhole') { ctx.globalAlpha = .12 + Math.sin(timestamp / 180) * .035; ctx.setLineDash([5, 13]); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10; ctx.beginPath(); ctx.arc(0, 0, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = '#03040d'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(0, 0, radius * .58, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (effect.type === 'lightning') {
        ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#dce5ff'; ctx.shadowColor = '#87aaff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 18; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'reflect-shield') {
        ctx.save(); ctx.translate(state.player.x, state.player.y);
        const shieldRadius = state.player.radius + 20;
        const pulse = .48 + Math.sin(timestamp / 105) * .09;
        ctx.globalAlpha = pulse * alpha;
        const glow = ctx.createRadialGradient(0, 0, shieldRadius * .55, 0, 0, shieldRadius + 8);
        glow.addColorStop(0, 'rgba(216,58,46,0)'); glow.addColorStop(.76, 'rgba(216,58,46,.08)'); glow.addColorStop(1, 'rgba(255,208,106,.24)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, shieldRadius + 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = currentSkin().color; ctx.lineWidth = 3; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 22;
        ctx.beginPath(); ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = Math.max(.22, pulse * alpha * .72); ctx.strokeStyle = currentSkin().accent; ctx.lineWidth = 2; ctx.setLineDash([7, 9]); ctx.lineDashOffset = -timestamp * .035; ctx.beginPath(); ctx.arc(0, 0, shieldRadius + 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      } else if (effect.type === 'aegis') {
        if (state.tempShields > 0) { ctx.save(); ctx.globalAlpha = .35 + .25 * Math.sin(timestamp / 150); ctx.strokeStyle = currentSkin().color; ctx.lineWidth = 3; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 22; ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + 17, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      } else if (effect.type === 'chronos') {
        ctx.save(); ctx.globalAlpha = .08 * alpha; ctx.fillStyle = '#c897ff'; ctx.fillRect(0, 0, state.width, state.height); ctx.restore();
      }
    }
    if (state.invulnerable <= 0 || Math.floor(timestamp / 90) % 2 === 0) drawShip(state.player.x, state.player.y, state.player.radius, currentSkin(), state.player.angle);
    if (state.shields || state.tempShields) { ctx.strokeStyle = `rgba(110,190,255,${.3 + Math.sin(timestamp / 150) * .12})`; ctx.lineWidth = 2 + Math.min(3, state.tempShields); ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + 9 + state.tempShields * 2, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < state.drones; i++) { const a = timestamp / 800 + i * Math.PI * 2 / state.drones; ctx.fillStyle = '#eafaff'; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(state.player.x + Math.cos(a) * 39, state.player.y + Math.sin(a) * 39, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
  }
  function frame(timestamp) {
    if (state.mode !== 'playing') return;
    const dt = Math.min(.033, Math.max(0, (timestamp - state.lastTime) / 1000)); state.lastTime = timestamp;
    update(dt); draw(timestamp);
    if (state.mode === 'playing') state.raf = requestAnimationFrame(frame);
  }
  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = event.clientX - rect.left; state.pointer.y = event.clientY - rect.top;
  }
  function readFavorites() { try { const list = JSON.parse(localStorage.getItem(favoritesKey) || '[]'); return new Set(Array.isArray(list) ? list : []); } catch { return new Set(); } }
  function updateFavorite() {
    if (!ui.favorite) return;
    const favorites = readFavorites(); const active = favorites.has(gameId);
    ui.favorite.setAttribute('aria-pressed', String(active)); ui.favorite.setAttribute('aria-label', `${active ? 'Remover' : 'Adicionar'} CV STARFALL ${active ? 'dos' : 'aos'} favoritos`); ui.favorite.title = active ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    const icon = ui.favorite.querySelector('.favorite-icon'); const label = ui.favorite.querySelector('[data-favorite-label]');
    if (icon) icon.textContent = active ? '♥' : '♡'; if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
  }
  function toggleFavorite() {
    const favorites = readFavorites(); if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem(favoritesKey, JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch { /* Favoritos são opcionais. */ }
    updateFavorite();
  }
  function supabaseConfig() { const config = window.CV_STARFALL_SUPABASE || {}; return config.url && (config.publicKey || config.anonKey) ? config : null; }
  function supabaseHeaders(config) {
    const key = config.publicKey || config.anonKey;
    const headers = { apikey: key };
    // A publishable key is sent in `apikey` only; legacy anon JWTs also work as a bearer token.
    if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
    return headers;
  }
  function authorizedNickname() {
    const nickname = String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '').trim().toLocaleLowerCase('pt-BR');
    const names = window.CV_STARFALL_SUPABASE?.allowedNicknames || ['educvv'];
    return names.map((name) => String(name).trim().toLocaleLowerCase('pt-BR')).includes(nickname) ? nickname : '';
  }
  function renderLeaderboard(rows) {
    if (!ui.rankList) return;
    ui.rankList.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('li'); empty.className = 'starfall-rank-empty';
      empty.textContent = 'O placar compartilhado será exibido depois da configuração do Supabase.';
      ui.rankList.append(empty); return;
    }
    rows.slice(0, 5).forEach((row, index) => {
      const item = document.createElement('li'); item.className = 'starfall-rank-item';
      const rank = document.createElement('strong'); rank.className = 'starfall-rank-number'; rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('span'); body.className = 'starfall-rank-body';
      const name = document.createElement('strong'); name.textContent = row.nickname || 'Piloto';
      const detail = document.createElement('small'); const buff = row.buff_summary || {};
      detail.textContent = 'Onda ' + row.wave + ' · ' + formatTime(row.elapsed_seconds) + ' · ' + (row.ship_name || 'Nave');
      const stats = document.createElement('small'); stats.className = 'starfall-rank-stats';
      stats.textContent = 'Dano ' + (buff.dano || '1.00') + ' · velocidade ' + (buff.velocidade || '260') + ' · vida máxima ' + (buff.vida_maxima || '6') + ' · reparo ' + (buff.reparo_dest || '0%') + ' · recarga ' + (buff.recarga || '0.34s') + ' · leque ' + (buff.disparos || '1') + ' · drones ' + (buff.drones || '0') + ' · perfuração ' + (buff.perfuracao || '0') + ' · crítico ' + (buff.chance_critica || '0%') + ' · escudos ' + (buff.escudos || '0') + ' · raio plasma ' + (buff.explosao || '0') + ' · dano a chefes ' + (buff.dano_chefe || '0%') + (buff.buraco_negro ? ' · buraco negro ' + buff.buraco_negro + 'px' : '') + ' · melhorias ' + (buff.melhorias || '0');
      body.append(name, detail, stats); item.append(rank, body); ui.rankList.append(item);
    });
  }
  async function refreshLeaderboard() {
    const config = supabaseConfig();
    if (!config) { if (ui.rankStatus) ui.rankStatus.textContent = 'Aguardando configuração do Supabase'; renderLeaderboard([]); return; }
    try {
      const url = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores?select=nickname,wave,score,elapsed_seconds,ship_name,buff_summary&order=wave.desc,score.desc&limit=5';
      const response = await fetch(url, { headers: supabaseHeaders(config) });
      if (!response.ok) throw new Error('Ranking indisponível');
      renderLeaderboard(await response.json());
      if (ui.rankStatus) ui.rankStatus.textContent = 'Placar compartilhado';
    } catch {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Placar indisponível agora';
      renderLeaderboard([]);
    }
  }
  async function submitRun(run) {
    const config = supabaseConfig();
    if (!config) { if (ui.rankStatus) ui.rankStatus.textContent = 'Configure o Supabase para publicar recordes'; return; }
    const nickname = authorizedNickname();
    if (!nickname) { if (ui.rankStatus) ui.rankStatus.textContent = 'Perfil autorizado para o teste: educvv'; return; }
    const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores';
    const headers = supabaseHeaders(config);
    try {
      const read = await fetch(base + '?select=wave,score&nickname=eq.' + encodeURIComponent(nickname) + '&limit=1', { headers });
      if (!read.ok) throw new Error('Não foi possível consultar o recorde.');
      const previous = (await read.json())[0];
      const better = !previous || run.wave > previous.wave || (run.wave === previous.wave && run.score > previous.score);
      if (!better) { if (ui.rankStatus) ui.rankStatus.textContent = 'Seu melhor resultado continua no placar'; return; }
      run.nickname = nickname;
      const response = await fetch(base + '?on_conflict=nickname', {
        method: 'POST',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(run)
      });
      if (!response.ok) throw new Error('Não foi possível salvar o recorde.');
      if (ui.rankStatus) ui.rankStatus.textContent = 'Recorde de ' + nickname + ' publicado';
    } catch {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Não foi possível salvar o recorde';
    }
  }
  function updateControlUI() {
    document.querySelectorAll('[data-control-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.controlMode === state.controlMode)));
    if (ui.joystick && !state.analog.active) ui.joystick.hidden = true;
    if (ui.controlHint) ui.controlHint.textContent = state.controlMode === 'keys'
      ? 'WASD ou setas movem · E ativa a habilidade · disparo automático.'
      : state.controlMode === 'touch' ? 'Toque e arraste na arena para mover · use o botão da habilidade.'
        : 'Toque em qualquer ponto da arena e arraste o analógico translúcido · solte para ocultar.';
  }
  function updatePerformanceModeUI() {
    ui.performanceModeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.performanceMode === state.performanceMode)));
  }
  function setPerformanceMode(mode) {
    if (!['normal', 'light'].includes(mode) || mode === state.performanceMode) return;
    state.performanceMode = mode;
    try { localStorage.setItem(performanceModeKey, mode); } catch { /* Preferência vale para a sessão. */ }
    if (mode === 'light' && state.particles.length > 110) state.particles = state.particles.slice(-110);
    updatePerformanceModeUI();
    resize();
    if (ui.missionSetupModal?.hidden && ui.settingsModal?.hidden) toast(mode === 'light' ? 'MODO LEVE ATIVADO' : 'MODO NORMAL ATIVADO');
  }
  function syncAudioVisibility() {
    if (!ui.audio) return;
    const modalOpen = [ui.missionSetupModal, ui.exitModal, ui.settingsModal, ui.shipModal, ui.achievementsModal, ui.dailySummaryModal]
      .some((modal) => modal && !modal.hidden);
    ui.audio.classList.toggle('is-menu-hidden', modalOpen);
    if (modalOpen) {
      const audioToggle = ui.audio.querySelector('[data-audio-toggle]');
      const audioPanel = ui.audio.querySelector('[data-audio-panel]');
      if (audioPanel) audioPanel.hidden = true;
      audioToggle?.setAttribute('aria-expanded', 'false');
    }
  }
  function openMissionSetup(dailyChallenge = false) {
    if (!['intro', 'gameover'].includes(state.mode) || !ui.missionSetupModal) return;
    try {
      const alreadyConfigured = localStorage.getItem(setupCompleteKey) === 'true';
      const preferencesWereSaved = localStorage.getItem(controlModeKey) !== null && localStorage.getItem(performanceModeKey) !== null;
      if (alreadyConfigured || preferencesWereSaved) {
        localStorage.setItem(setupCompleteKey, 'true');
        startGame(dailyChallenge);
        return;
      }
    } catch { /* Se o armazenamento estiver bloqueado, a escolha é mostrada novamente. */ }
    state.pendingDailyChallenge = dailyChallenge;
    ui.missionSetupModal.hidden = false;
    syncAudioVisibility();
    ui.missionSetupModal.querySelector('[data-confirm-mission-setup]')?.focus();
  }
  function closeMissionSetup() {
    if (!ui.missionSetupModal) return;
    ui.missionSetupModal.hidden = true;
    const dailyChallenge = state.pendingDailyChallenge;
    state.pendingDailyChallenge = false;
    syncAudioVisibility();
    const returnTarget = ui.dailySummaryModal && !ui.dailySummaryModal.hidden
      ? ui.dailySummaryStart
      : dailyChallenge ? ui.dailyStart : ui.start;
    returnTarget?.focus();
  }
  function confirmMissionSetup() {
    const dailyChallenge = state.pendingDailyChallenge;
    state.pendingDailyChallenge = false;
    try { localStorage.setItem(setupCompleteKey, 'true'); } catch { /* A configuração vale durante esta sessão. */ }
    if (ui.missionSetupModal) ui.missionSetupModal.hidden = true;
    syncAudioVisibility();
    startGame(dailyChallenge);
  }
  function openExitConfirmation() {
    if (!ui.exitModal) { returnToMenu(); return; }
    state.exitReturnFocus = document.activeElement;
    state.exitWasPlaying = state.mode === 'playing';
    if (state.exitWasPlaying) pauseGame();
    ui.exitModal.hidden = false;
    syncAudioVisibility();
    ui.exitModal.querySelector('[data-cancel-exit]')?.focus();
  }
  function closeExitConfirmation() {
    if (!ui.exitModal) return;
    ui.exitModal.hidden = true;
    syncAudioVisibility();
    const returnTarget = state.exitReturnFocus;
    state.exitReturnFocus = null;
    const resume = state.exitWasPlaying;
    state.exitWasPlaying = false;
    if (resume && state.mode === 'paused') {
      pauseGame();
      ui.pause?.focus();
    } else if (returnTarget instanceof HTMLElement && returnTarget.isConnected && !returnTarget.hidden && returnTarget.getClientRects().length) returnTarget.focus();
    else ui.overlay?.querySelector('[data-exit-from-menu]')?.focus();
  }
  function returnToMenu() {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.keys.clear();
    state.pointer.active = false;
    releaseAnalog();
    state.pendingDailyChallenge = false;
    state.exitReturnFocus = null;
    state.exitWasPlaying = false;
    if (state.skinBeforeDaily) {
      state.selectedSkin = state.skinBeforeDaily;
      state.skinBeforeDaily = '';
    }
    state.dailyChallenge = false;
    state.challengeDate = '';
    state.dailyBestScore = 0;
    state.randomStreams = null;
    [ui.missionSetupModal, ui.exitModal, ui.settingsModal, ui.shipModal, ui.achievementsModal, ui.dailySummaryModal]
      .forEach((modal) => { if (modal) modal.hidden = true; });
    resetGame();
    setMode('intro');
    ui.title.textContent = 'O céu está caindo.';
    ui.copy.textContent = 'Desvie dos meteoros, destrua os drones e sobreviva. A cada onda, escolha uma melhoria para sua nave.';
    ui.start.textContent = '▶ INICIAR MISSÃO';
    ui.status.textContent = 'Pronto para a missão.';
    updateDailyChallengeInfo();
    syncAudioVisibility();
    ui.start.focus();
  }
  function openSettings() {
    if (state.mode === 'playing') pauseGame();
    if (ui.settingsModal) ui.settingsModal.hidden = false;
    syncAudioVisibility();
    ui.settingsModal?.querySelector('[data-close-settings]')?.focus();
  }
  function closeSettings() { if (ui.settingsModal) ui.settingsModal.hidden = true; syncAudioVisibility(); }
  function openShips() {
    if (!['intro', 'gameover'].includes(state.mode)) return;
    if (ui.shipModal) ui.shipModal.hidden = false;
    syncAudioVisibility();
    ui.shipModal?.querySelector('[data-close-ships]')?.focus();
  }
  function closeShips() { if (ui.shipModal) ui.shipModal.hidden = true; syncAudioVisibility(); }
  function openAchievements() {
    if (!['intro', 'gameover'].includes(state.mode)) return;
    renderAchievements();
    if (ui.achievementsModal) ui.achievementsModal.hidden = false;
    syncAudioVisibility();
    ui.achievementsModal?.querySelector('[data-close-achievements]')?.focus();
  }
  function closeAchievements() { if (ui.achievementsModal) ui.achievementsModal.hidden = true; syncAudioVisibility(); }
  document.querySelectorAll('[data-control-mode]').forEach((button) => button.addEventListener('click', () => {
    state.controlMode = button.dataset.controlMode;
    try { localStorage.setItem(controlModeKey, state.controlMode); } catch { /* Preferência vale para a sessão. */ }
    state.keys.clear(); state.pointer.active = false; releaseAnalog(); updateControlUI();
  }));
  ui.performanceModeButtons.forEach((button) => button.addEventListener('click', () => setPerformanceMode(button.dataset.performanceMode)));
  $('[data-open-settings]')?.addEventListener('click', openSettings);
  $('[data-open-ships]')?.addEventListener('click', openShips);
  $('[data-open-achievements]')?.addEventListener('click', openAchievements);
  ui.dailyStart?.addEventListener('click', () => openMissionSetup(true));
  document.querySelectorAll('[data-close-mission-setup]').forEach((button) => button.addEventListener('click', closeMissionSetup));
  $('[data-confirm-mission-setup]')?.addEventListener('click', confirmMissionSetup);
  ui.stop?.addEventListener('click', openExitConfirmation);
  $('[data-exit-from-menu]')?.addEventListener('click', openExitConfirmation);
  document.querySelectorAll('[data-cancel-exit]').forEach((button) => button.addEventListener('click', closeExitConfirmation));
  $('[data-confirm-exit]')?.addEventListener('click', returnToMenu);
  document.querySelectorAll('[data-close-settings]').forEach((button) => button.addEventListener('click', closeSettings));
  document.querySelectorAll('[data-close-ships]').forEach((button) => button.addEventListener('click', closeShips));
  document.querySelectorAll('[data-close-achievements]').forEach((button) => button.addEventListener('click', closeAchievements));
  document.querySelectorAll('[data-close-daily-summary]').forEach((button) => button.addEventListener('click', closeDailySummary));
  ui.dailySummaryStart?.addEventListener('click', () => openMissionSetup(true));
  ui.start.addEventListener('click', () => state.mode === 'paused' ? pauseGame() : openMissionSetup());
  ui.pause.addEventListener('click', pauseGame);
  ui.ability?.addEventListener('click', activateAbility);
  ui.favorite?.addEventListener('click', toggleFavorite);
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.code === 'Escape' && ui.missionSetupModal && !ui.missionSetupModal.hidden) { closeMissionSetup(); return; }
    if (event.code === 'Escape' && ui.exitModal && !ui.exitModal.hidden) { closeExitConfirmation(); return; }
    if (event.code === 'Escape' && ui.settingsModal && !ui.settingsModal.hidden) { closeSettings(); return; }
    if (event.code === 'Escape' && ui.shipModal && !ui.shipModal.hidden) { closeShips(); return; }
    if (event.code === 'Escape' && ui.achievementsModal && !ui.achievementsModal.hidden) { closeAchievements(); return; }
    if (event.code === 'Escape' && ui.dailySummaryModal && !ui.dailySummaryModal.hidden) { closeDailySummary(); return; }
    if (event.code === 'Escape' || event.code === 'KeyP') { if (state.mode === 'playing' || state.mode === 'paused') pauseGame(); }
    if (event.code === 'Enter' && ['intro', 'gameover'].includes(state.mode) && (!ui.shipModal || ui.shipModal.hidden) && !event.target.closest('button,[role="dialog"],input,select,textarea')) openMissionSetup();
    if (event.code === 'KeyE' && !event.repeat) activateAbility();
    if (state.controlMode === 'keys') state.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => state.keys.delete(event.code));
  window.addEventListener('blur', () => { state.keys.clear(); state.pointer.active = false; releaseAnalog(); if (state.mode === 'playing') pauseGame(); });
  canvas.addEventListener('pointerdown', (event) => {
    if (state.mode !== 'playing' || !['touch', 'analog'].includes(state.controlMode)) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    if (state.controlMode === 'touch') { pointerPosition(event); state.pointer.active = true; return; }
    const rect = ui.stage.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    state.analog.active = true; state.analog.pointerId = event.pointerId; state.analog.originX = x; state.analog.originY = y;
    ui.joystick.style.left = x + 'px'; ui.joystick.style.top = y + 'px'; ui.joystick.hidden = false; ui.joystick.classList.add('is-active');
    moveAnalog(event);
  });
  canvas.addEventListener('pointermove', (event) => { if (state.pointer.active && state.controlMode === 'touch') pointerPosition(event); });
  function moveAnalog(event) {
    if (!state.analog.active || state.analog.pointerId !== event.pointerId) return;
    const rect = ui.stage.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const max = 54;
    const dx = x - state.analog.originX; const dy = y - state.analog.originY; const length = Math.hypot(dx, dy); const scale = length > max ? max / length : 1;
    state.analog.x = dx * scale / max; state.analog.y = dy * scale / max;
    ui.joystickNub.style.left = 'calc(50% + ' + (state.analog.x * max) + 'px)'; ui.joystickNub.style.top = 'calc(50% + ' + (state.analog.y * max) + 'px)';
  }
  canvas.addEventListener('pointermove', moveAnalog);
  canvas.addEventListener('pointerup', (event) => { state.pointer.active = false; if (state.analog.pointerId === event.pointerId) releaseAnalog(); });
  canvas.addEventListener('pointercancel', (event) => { state.pointer.active = false; if (state.analog.pointerId === event.pointerId) releaseAnalog(); });
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);
  document.addEventListener('webkitfullscreenchange', resize);
  document.addEventListener('cv-games-fullscreenchange', resize);
  state.achievementProgress = readAchievementProgress();
  renderAchievements(); updateDailyChallengeInfo();
  renderSkinPicker(); updateEquippedShip(); updateControlUI(); updatePerformanceModeUI(); updateHud(); updateFavorite(); resize(); setMode('intro'); draw(0); refreshLeaderboard();
})();
