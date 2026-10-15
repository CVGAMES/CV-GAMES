(function () {
  'use strict';

  const gameId = 'cv-starfall';
  const bestKey = 'cv-games-cv-starfall-best';
  const bestWaveKey = 'cv-games-cv-starfall-best-wave';
  const setupCompleteKey = 'cv-games-cv-starfall-setup-complete';
  const controlModeKey = 'cv-games-cv-starfall-control';
  const performanceModeKey = 'cv-games-cv-starfall-performance';
  const eclipseSkipVideoKey = 'cv-games-cv-starfall-eclipse-skip-video';
  const dailyBestPrefix = 'cv-games-cv-starfall-daily:';
  const achievementStoragePrefix = 'cv-games-cv-starfall-achievements:';
  const favoritesKey = 'cv-games-favorites';
  const eclipseSprite = new Image();
  eclipseSprite.src = new URL('eclipse-ship.png', document.baseURI).href;
  const eclipseShrineSprite = new Image();
  eclipseShrineSprite.src = new URL('eclipse-shrine.png', document.baseURI).href;
  const eclipseDomainVideoUrl = new URL('../../CV GAMES/sprite nave sprites/video começo esnpnação de dominio.mp4', document.baseURI).href;
  const eclipseDomainMusicUrl = new URL('../../CV GAMES/sprite nave sprites/audio music apara fundo depois que video acabar.m4a', document.baseURI).href;
  const canvas = document.querySelector('[data-game-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    stage: $('[data-stage]'), overlay: $('[data-main-overlay]'), title: $('[data-overlay-title]'), copy: $('[data-overlay-copy]'), start: $('[data-start]'), missionSetupModal: $('[data-mission-setup]'), exitModal: $('[data-exit-confirmation]'), stop: $('[data-stop-mission]'), audio: $('[data-game-audio]'), eclipseCutscene: $('[data-eclipse-cutscene]'), eclipseVideo: $('[data-eclipse-video]'),
    wave: $('[data-wave]'), score: $('[data-score]'), lives: $('[data-lives]'), shields: $('[data-shields]'), healthFill: $('[data-health-fill]'), best: $('[data-best]'), overlayBest: $('[data-overlay-best]'),
    zone: $('[data-zone]'), timer: $('[data-timer]'), upgrade: $('[data-upgrade]'), upgradeOptions: $('[data-upgrade-options]'), pause: $('[data-pause]'), pauseIcon: $('[data-pause-icon]'), pauseLabel: $('[data-pause-label]'), ability: $('[data-ability]'), abilityCooldown: $('[data-ability-cooldown]'), eclipseQWrap: $('[data-eclipse-q-wrap]'), eclipseQ: $('[data-eclipse-q]'), eclipseQCooldown: $('[data-eclipse-q-cooldown]'), panel: $('[data-fullscreen-root]'), hud: $('.starfall-hud'), status: $('[data-status]'), toast: $('[data-toast]'), favorite: $('[data-game-favorite]'),
    skinPicker: $('[data-skin-picker]'), equippedShip: $('[data-equipped-ship]'), eclipseSkipOptions: Array.from(document.querySelectorAll('[data-eclipse-skip-option]')), eclipseSkipCheckboxes: Array.from(document.querySelectorAll('[data-eclipse-skip-video]')), shipModal: $('[data-ship-modal]'), settingsModal: $('[data-settings-modal]'), performanceModeButtons: Array.from(document.querySelectorAll('[data-performance-mode]')), deviceTypeIndicators: [], adminTools: null, adminClearWave: null, adminToggleBuffs: null, adminToggleCooldown: null, achievementsModal: $('[data-achievements-modal]'), achievementsList: $('[data-achievements-list]'), achievementsCount: $('[data-achievement-count]'), dailyStart: $('[data-start-daily]'), dailyRecord: $('[data-daily-record]'), dailySummaryModal: $('[data-daily-summary-modal]'), dailySummaryStart: $('[data-start-daily-again]'), dailySummaryDate: $('[data-daily-summary-date]'), dailySummaryResult: $('[data-daily-summary-result]'), dailySummaryRecord: $('[data-daily-summary-record]'), dailySummaryDetails: $('[data-daily-summary-details]'), runSummary: $('[data-run-summary]'), joystick: $('[data-joystick]'), joystickNub: $('[data-joystick-nub]'), controlHint: $('[data-control-hint]'), rankList: $('[data-rank-list]'), rankStatus: $('[data-rank-status]')
  };
  const skins = [
    { id: 'aurora', name: 'Aurora', color: '#7df7e8', accent: '#bffff5', ability: 'Explosão Nova', abilityShort: 'NOVA', cooldown: 25, shape: 'classic', description: 'Uma explosão ampla atinge todos os inimigos próximos.' },
    { id: 'aegis', name: 'Aegis', color: '#72bdff', accent: '#c9eaff', ability: 'Barreira Aegis', abilityShort: 'BARREIRA', cooldown: 25, shape: 'shield', unlockWave: 10, description: 'Uma barreira absorve três impactos.' },
    { id: 'chronos', name: 'Chronos', color: '#c897ff', accent: '#efd5ff', ability: 'Dobra Temporal', abilityShort: 'TEMPO', cooldown: 25, shape: 'ring', unlockWave: 20, description: 'Desacelera inimigos e projéteis por alguns segundos.' },
    { id: 'tempest', name: 'Tempestade', color: '#87aaff', accent: '#d5dcff', ability: 'Poço Negro', abilityShort: 'POÇO NEGRO', cooldown: 34, shape: 'wing', unlockWave: 30, description: 'Dispare uma singularidade que puxa e fere os inimigos próximos.' },
    { id: 'flashblade', name: 'Flashblade', color: '#ffc86e', accent: '#fff0b4', ability: 'Corte Flash', abilityShort: 'CORTE', cooldown: 25, shape: 'blade', unlockWave: 40, description: 'Uma lâmina veloz faz curvas e ricocheteia em várias direções.' },
    { id: 'redshift', name: 'Bastião Rubro', color: '#d83a2e', accent: '#ffd06a', ability: 'Escudo de Retorno', abilityShort: 'RETORNO', cooldown: 30, shape: 'reflector', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'cypher'], description: 'Por alguns segundos, reflete projéteis: parte volta pela trajetória e parte mira em quem atacou.' },
    { id: 'eclipse', name: 'Eclipse', color: '#a879ff', accent: '#e8dcff', ability: 'Expansão de Domínio', abilityShort: 'DOMÍNIO', cooldown: 30, shape: 'eclipse', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'nys'], description: 'E: abre o Domínio Eclipse com cortes por 10 segundos. Q: cria uma Isca Umbral por 4 segundos para atrair disparos diretos.' },
    { id: 'saurion', name: 'Saurion', color: '#42d66e', accent: '#d4ff72', ability: 'Rugido de Garras', abilityShort: 'RUGIDO', cooldown: 28, cooldownQ: 32, shape: 'dino', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'adm'], description: 'E: atordoa uma grande área; três garras leves reaparecem a cada 2 segundos por 15 segundos. Q causa dano extra aos alvos marcados.' }
  ];
  const starfallAchievements = [
    { id: 'first-flight', icon: '🚀', title: 'Primeiro voo', description: 'Comece sua primeira missão.', metric: 'missionsStarted', target: 1, unit: 'missão' },
    { id: 'guardian-hunter', icon: '👾', title: 'Caçador de guardiões', description: 'Derrote um chefe principal.', metric: 'bossesDefeated', target: 1, unit: 'chefe' },
    { id: 'clean-orbit', icon: '🛡️', title: 'Órbita perfeita', description: 'Conclua uma onda sem perder vidas.', metric: 'cleanWaves', target: 1, unit: 'onda limpa' },
    { id: 'daily-pilot', icon: '📅', title: 'Piloto diário', description: 'Termine um Desafio Diário.', metric: 'dailyRunsFinished', target: 1, unit: 'desafio' },
    { id: 'planet-hopper', icon: '🪐', title: 'Viajante galáctico', description: 'Alcance a onda 15.', metric: 'bestWaveReached', target: 15, unit: 'ondas' },
    { id: 'star-legend', icon: '🌌', title: 'Lenda das estrelas', description: 'Alcance a onda 50.', metric: 'bestWaveReached', target: 50, unit: 'ondas' },
    { id: 'ability-collector', icon: '✨', title: 'Mestre das naves', description: 'Use a habilidade de cada nave disponível para este perfil.', metric: 'abilityShips', target: profileNickname() === 'adm' ? skins.length : skins.filter((skin) => !skin.secret || skin.allowedProfiles.includes(profileNickname())).length, unit: 'naves' }
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
  function detectMobileDevice() {
    const handheldAgent = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches || false;
    const finePointer = window.matchMedia?.('(any-pointer: fine)').matches || false;
    const hasTouch = navigator.maxTouchPoints > 0;
    const touchOnly = navigator.maxTouchPoints > 1 && coarsePointer && !finePointer;
    return Boolean(coarsePointer && !finePointer && hasTouch && (handheldAgent || touchOnly));
  }
  const detectedMobileDevice = detectMobileDevice();
  const mobileEntityScale = .82;
  const state = {
    mode: 'intro', lastTime: 0, raf: 0, width: 800, height: 560, dpr: 1,
    score: 0, best: readBest(), bestCompletedWave: readBestWave(), wave: 1, lives: 3, maxLives: 6, shields: 0, tempShields: 0, invulnerable: 0, elapsed: 0,
    shotCooldown: 0, waveGrace: 0, enemySpawn: 0, powerSpawn: 0, waveKills: 0,
    enemiesRequired: 6, bossWave: false, bossSpawned: false, miniBossTimer: 0, miniBossSpawned: false,
    keys: new Set(), bullets: [], enemyBullets: [], enemies: [], particles: [], pickups: [], stars: [], effects: [],
    selectedSkin: readSkin(), controlMode: readControlMode(), performanceMode: readPerformanceMode(), mobileSizing: detectedMobileDevice, upgrades: {}, abilityCooldown: 0, abilityBaseCooldown: 0, abilityPower: 1, adminNoCooldown: false, adminBuffsActive: false,
    slowTime: 0, lastBossType: '', magnet: 105, pierce: 0, critChance: 0, armorChance: 0, regenLevel: 0, regenTimer: 24, drones: 0, droneCooldown: 0,
    blastRadius: 0, bossDamageBonus: 0, bonusShots: 0, lowHullBoost: 0, salvageHeal: 0, singularityRadius: 235, singularityDuration: 6.5, reflectTime: 0, reflectContacts: new Set(), reflectDamageBonus: 0, reflectDurationBonus: 0, eclipseTime: 0, eclipsePhase: 'idle', eclipseCutTimer: 0, eclipseDurationBonus: 0, eclipseCutBonus: 0, eclipseCutDamage: 0, eclipseHitCooldowns: [], eclipseImpactCooldown: 0, eclipseDecoy: null, eclipseDecoyCooldown: 0, dinoRoarBonus: 0, dinoRoarRangeBonus: 0, dinoStampedeCharges: 3, dinoStampedeRecharge: 0, dinoStampedeExtra: 0, dinoStampedeDamageBonus: 0, endlessDamage: 0, endlessSpeed: 0,
    player: { x: 400, y: 460, radius: detectedMobileDevice ? 13 * mobileEntityScale : 13, speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, color: '#7df7e8' },
    pointer: { active: false, x: 0, y: 0 }, analog: { active: false, x: 0, y: 0 },
    dailyChallenge: false, pendingDailyChallenge: false, challengeDate: '', dailyBestScore: 0, skinBeforeDaily: '', randomStreams: null, exitReturnFocus: null, exitWasPlaying: false,
    waveDamageTaken: false, achievementProgress: null
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const mobileSize = (value) => value * (state.mobileSizing ? mobileEntityScale : 1);
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
    { id:'drone', icon:'◈', name:'Drone auxiliar', description:'Um satélite ataca inimigos próximos e pode se sacrificar para salvar a nave.', max:3, available:()=>state.drones<3, apply:()=>{state.drones+=1;} },
    { id:'magnet', icon:'⌖', name:'Ímã gravitacional', description:'Atrai recursos de mais longe.', max:5, available:()=>upgradeLevel('magnet')<5, apply:()=>{state.magnet=Math.min(315,state.magnet+42);} },
    { id:'cooldown', icon:'◷', name:'Condensador', description:'Reduz a recarga da habilidade especial.', max:5, available:()=>upgradeLevel('cooldown')<5, apply:()=>{const minimum=currentSkin().id==='eclipse'?25:22;state.abilityBaseCooldown=Math.max(minimum,state.abilityBaseCooldown*.9);state.abilityCooldown=Math.max(0,state.abilityCooldown-4);} },
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
    ,{ id:'eclipseVeil', icon:'✧', name:'Manto de eclipse', description:'Prolonga a sequência e amplia o alcance dos cortes.', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseVeil')<4, apply:()=>{state.eclipseDurationBonus=Math.min(2.2,state.eclipseDurationBonus+.55);state.eclipseCutBonus=Math.min(36,state.eclipseCutBonus+9);} }
    ,{ id:'eclipseCooldown', icon:'◷', name:'Ressonador do domínio', description:'Reduz a recarga da Eclipse em 1 segundo, até o mínimo de 25 segundos.', max:5, available:()=>currentSkin().id==='eclipse'&&state.abilityBaseCooldown>25, apply:()=>{state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1);state.abilityCooldown=Math.max(0,state.abilityCooldown-1);} }
    ,{ id:'eclipseDamage', icon:'⚔', name:'Fio do domínio', description:'Aumenta o dano de cada corte em 0,25 (até +1,00).', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseDamage')<4, apply:()=>{state.eclipseCutDamage=Math.min(1,state.eclipseCutDamage+.25);} }
    ,{ id:'dinoFangs', icon:'〰', name:'Ressonância jurássica', description:'Aumenta o dano das garras e o alcance do Rugido de Garras.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoFangs')<4, apply:()=>{state.dinoRoarBonus+=4;state.dinoRoarRangeBonus+=18;} }
    ,{ id:'dinoStampede', icon:'🐾', name:'Manada ancestral', description:'Adiciona um raptor ao Estouro da Manada e fortalece a investida.', max:2, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoStampede')<2, apply:()=>{state.dinoStampedeExtra+=1;state.dinoStampedeDamageBonus+=2.5;} }
    ,{ id:'dinoResonance', icon:'◷', name:'Ressonância fóssil', description:'Reduz em 2 segundos o intervalo de recarga entre as cargas de Q, até 24 segundos.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoResonance')<4, apply:()=>{state.dinoStampedeRecharge=Math.max(0,state.dinoStampedeRecharge-2);} }
    ,{ id:'salvageHeal', icon:'✚', name:'Recuperação de destroços', description:'Inimigos destruídos podem liberar energia de reparo.', max:4, available:()=>state.salvageHeal<4, apply:()=>{state.salvageHeal+=1;} }
    ,{ id:'endlessDamage', icon:'✹', name:'Núcleo adaptativo', description:'Reforço repetível com ganho decrescente e limite seguro de dano.', max:0, stack:true, available:()=>state.endlessDamage<1.24, apply:()=>{state.endlessDamage=Math.min(1.25,state.endlessDamage + .11 / (1 + upgradeLevel('endlessDamage') * .14));} }
    ,{ id:'endlessSpeed', icon:'➤', name:'Impulso de longo curso', description:'Aumenta a mobilidade aos poucos, com velocidade máxima controlada.', max:0, stack:true, available:()=>state.endlessSpeed<118, apply:()=>{state.endlessSpeed=Math.min(120,state.endlessSpeed + 8 / (1 + upgradeLevel('endlessSpeed') * .12));} }
  ];

  function readBest() { try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); } catch { return 0; } }
  function readBestWave() { try { return Math.max(0, Number(localStorage.getItem(bestWaveKey)) || 0); } catch { return 0; } }
  function profileNickname() { return String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'); }
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
  function isAllShipsProfile() { return profileNickname() === 'adm'; }
  function isAllUpgradesProfile() { return profileNickname() === 'educvv dev1'; }
  function hasDeveloperPerks() { return isDeveloperProfile() && !state.dailyChallenge && state.adminNoCooldown; }
  function shipCooldownSummary(skin) {
    if (hasDeveloperPerks()) return 'sem recarga';
    if (skin.id === 'eclipse') return 'E 30s→25s com melhorias · Q 24s';
    if (skin.id === 'saurion') return 'E ' + skin.cooldown + 's→22s · Q 3 cargas · ' + skin.cooldownQ + 's→24s por carga';
    return 'recarga ' + skin.cooldown + 's';
  }
  function skinUnlocked(skin) {
    if (isAllShipsProfile()) return true;
    if (skin.secret) return Array.isArray(skin.allowedProfiles) && skin.allowedProfiles.includes(profileNickname());
    return isDeveloperProfile() || !skin.unlockWave || Math.max(readBestWave(), state.bestCompletedWave) >= skin.unlockWave;
  }
  function readSkin() {
    try {
      const id = localStorage.getItem('cv-games-cv-starfall-skin');
      const skin = skins.find((item) => item.id === id);
      if (!skin) return 'aurora';
      return skinUnlocked(skin) ? id : 'aurora';
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
    const equippedIcon = skin.shape === 'eclipse'
      ? '<span class="starfall-equipped-icon starfall-eclipse-sprite" aria-hidden="true"></span>'
      : skin.shape === 'dino' ? '<span class="starfall-equipped-icon starfall-dino-icon" aria-hidden="true">🦖</span>'
      : '<svg class="starfall-equipped-icon" viewBox="0 0 40 40" aria-hidden="true"><path d="' + silhouettes[skin.shape] + '" fill="' + skin.color + '" stroke="' + skin.accent + '" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="3.3" ry="6" fill="#f1ffff"/><path d="M15 31 L20 38 L25 31" fill="' + skin.accent + '"/>' + (skin.shape === 'ring' ? '<ellipse cx="20" cy="21" rx="17" ry="8" fill="none" stroke="' + skin.accent + '" stroke-width="1.2"/>' : skin.shape === 'reflector' ? '<path d="M3 17 Q20 1 37 17" fill="none" stroke="' + skin.accent + '" stroke-width="2"/>' : '') + '</svg>';
    ui.equippedShip.innerHTML = equippedIcon + '<span><strong>Nave equipada: ' + skin.name + '</strong><small>' + skin.ability + ' · ' + shipCooldownSummary(skin) + '</small></span>';
    updateEclipseSkipOption();
  }
  function readEclipseVideoSkip() {
    try { return localStorage.getItem(eclipseSkipVideoKey) === 'true'; } catch { return false; }
  }
  function updateEclipseSkipOption() {
    const shouldShow = currentSkin().id === 'eclipse';
    ui.eclipseSkipOptions.forEach((option) => { option.hidden = !shouldShow; });
    ui.eclipseSkipCheckboxes.forEach((checkbox) => { checkbox.checked = readEclipseVideoSkip(); });
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
    updateEclipseSkipOption();
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
    const skin = currentSkin();
    const ready = state.abilityCooldown <= 0;
    const eclipseIntro = skin.id === 'eclipse' && state.eclipsePhase === 'cinematic';
    const eclipseActive = skin.id === 'eclipse' && state.eclipsePhase === 'active';
    const active = eclipseIntro || eclipseActive;
    if (ui.ability) {
      ui.ability.disabled = state.mode !== 'playing' || eclipseIntro || eclipseActive || (!ready && !active);
      ui.ability.setAttribute('aria-pressed', String(active));
      ui.ability.textContent = '★';
      ui.ability.setAttribute('aria-label', eclipseIntro ? 'Abertura da Expansão de Domínio em andamento' : eclipseActive ? 'Santuário ativo por mais ' + Math.ceil(state.eclipseTime) + ' segundos' : ready ? 'Usar habilidade ' + skin.ability + ' · tecla E' : skin.ability + ' recarregando: ' + Math.ceil(state.abilityCooldown) + ' segundos');
      if (ui.abilityCooldown) ui.abilityCooldown.textContent = eclipseIntro ? 'ABERTURA' : eclipseActive ? 'DOMÍNIO ' + Math.ceil(state.eclipseTime) + 's' : hasDeveloperPerks() ? 'Livre' : ready ? 'Pronta' : Math.ceil(state.abilityCooldown) + 's';
      ui.ability.title = skin.ability + (hasDeveloperPerks() ? ' · sem recarga: ' : ': ') + skin.description;
    }
    if (ui.eclipseQWrap && ui.eclipseQ) {
      const isEclipse = skin.id === 'eclipse';
      const isSaurion = skin.id === 'saurion';
      const showQ = (isEclipse || isSaurion) && ['playing', 'paused'].includes(state.mode);
      const stampedeRemaining = state.effects.reduce((remaining, effect) => effect.type === 'dino-raptor' ? Math.max(remaining, effect.life) : remaining, 0);
      const qActive = isEclipse ? Boolean(state.eclipseDecoy && state.eclipseDecoy.life > 0) : isSaurion && stampedeRemaining > 0;
      const qCooldown = isEclipse ? state.eclipseDecoyCooldown : state.dinoStampedeRecharge;
      const dinoCharges = hasDeveloperPerks() ? 3 : state.dinoStampedeCharges;
      const qReady = hasDeveloperPerks() || (isEclipse ? qCooldown <= 0 : dinoCharges > 0);
      ui.eclipseQWrap.hidden = !showQ;
      ui.eclipseQ.disabled = !showQ || state.mode !== 'playing' || (isEclipse && state.eclipsePhase !== 'idle') || (isEclipse && qActive) || !qReady;
      ui.eclipseQ.textContent = isEclipse ? '◉' : '✦';
      ui.eclipseQ.classList.toggle('is-saurion', isSaurion);
      ui.eclipseQ.setAttribute('aria-pressed', String(qActive));
      ui.eclipseQ.setAttribute('aria-label', qActive && isEclipse
        ? 'Isca Umbral ativa por mais ' + Math.ceil(state.eclipseDecoy.life) + ' segundos'
        : !qReady ? isEclipse ? 'Isca Umbral recarregando: ' + Math.ceil(qCooldown) + ' segundos' : 'Estouro da Manada sem cargas; próxima em ' + Math.ceil(qCooldown) + ' segundos'
          : isEclipse ? 'Ativar Isca Umbral · tecla Q · cópia por 4 segundos' : 'Ativar Estouro da Manada · tecla Q · ' + (hasDeveloperPerks() ? 'usos ilimitados' : dinoCharges + ' cargas restantes'));
      ui.eclipseQ.title = isEclipse ? 'Isca Umbral · Q · cópia por 4s · recarga de 24s' : 'Estouro da Manada · 3 cargas · Q · recarga de ' + Math.max(24, skin.cooldownQ - upgradeLevel('dinoResonance') * 2) + 's por carga';
      if (ui.eclipseQCooldown) ui.eclipseQCooldown.textContent = isEclipse
        ? qActive ? 'ISCA ' + Math.ceil(state.eclipseDecoy.life) + 's' : hasDeveloperPerks() ? 'Livre' : qReady ? 'Pronta' : Math.ceil(qCooldown) + 's'
        : hasDeveloperPerks() ? '∞ CARGAS' : dinoCharges + '/3' + (dinoCharges < 3 ? ' · ' + Math.ceil(qCooldown) + 's' : ' CARGAS');
    }
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
      const icon = skin.shape === 'eclipse' ? '<span class="starfall-skin-icon starfall-eclipse-sprite" aria-hidden="true"></span>' : skin.shape === 'dino' ? '<span class="starfall-skin-icon starfall-dino-icon" aria-hidden="true">🦖</span>' : '<span class="starfall-skin-icon" style="--skin-color:' + skin.color + '" aria-hidden="true">' + (unlocked ? '✦' : '🔒') + '</span>';
      button.innerHTML = icon + '<strong>' + skin.name + '</strong><span>' + (unlocked ? skin.ability : 'Desbloqueia na onda ' + skin.unlockWave) + '</span><small>' + skin.description + '<br>' + shipCooldownSummary(skin) + '</small>';
      button.addEventListener('click', () => {
        if (!skinUnlocked(skin) || state.mode === 'playing' || state.mode === 'upgrade') return;
        state.selectedSkin = skin.id;
        try { localStorage.setItem('cv-games-cv-starfall-skin', skin.id); } catch { /* A escolha vale para esta sessão. */ }
        renderSkinPicker();
        updateEquippedShip();
        updateControlUI();
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
    state.player = { x: state.width / 2, y: state.height * .78, radius: mobileSize(13), speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, color: skin.color, accent: skin.accent, shape: skin.shape };
    state.upgrades = {}; state.abilityCooldown = 0; state.abilityBaseCooldown = skin.cooldown; state.abilityPower = 1; state.slowTime = 0; state.adminNoCooldown = isDeveloperProfile(); state.adminBuffsActive = false;
    state.scoreMultiplier = 1; state.magnet = 105; state.pierce = 0; state.critChance = 0; state.armorChance = 0; state.regenLevel = 0; state.regenTimer = 24; state.drones = 0; state.droneCooldown = 0; state.lastBossType = '';
    state.blastRadius = 0; state.bossDamageBonus = 0; state.bonusShots = 0; state.lowHullBoost = 0; state.salvageHeal = 0; state.singularityRadius = 235; state.singularityDuration = 6.5; state.reflectTime = 0; state.reflectContacts = new Set(); state.reflectDamageBonus = 0; state.reflectDurationBonus = 0; state.eclipseTime = 0; state.eclipsePhase = 'idle'; state.eclipseCutTimer = 0; state.eclipseDurationBonus = 0; state.eclipseCutBonus = 0; state.eclipseCutDamage = 0; state.eclipseHitCooldowns = []; state.eclipseImpactCooldown = 0; state.eclipseDecoy = null; state.eclipseDecoyCooldown = 0; state.dinoRoarBonus = 0; state.dinoRoarRangeBonus = 0; state.dinoStampedeCharges = 3; state.dinoStampedeRecharge = 0; state.dinoStampedeExtra = 0; state.dinoStampedeDamageBonus = 0; state.endlessDamage = 0; state.endlessSpeed = 0;
    state.waveDamageTaken = false;
    if (isAllUpgradesProfile() && !state.dailyChallenge) grantAllUpgrades();
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    if (ui.runSummary) { ui.runSummary.hidden = true; ui.runSummary.replaceChildren(); }
    renderSkinPicker();
    updateEquippedShip();
    updateHud();
  }
  function grantAllUpgrades() {
    state.adminBuffsActive = true;
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
    refreshDeviceSizing();
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
      const nextUpgradeLevel = upgrade.id === 'drone' ? state.drones + 1 : upgradeLevel(upgrade.id) + 1;
      button.innerHTML = `<span class="starfall-upgrade-icon" aria-hidden="true">${upgrade.icon}</span><strong>${upgrade.name}${upgrade.max ? ` · ${nextUpgradeLevel}/${upgrade.max}` : upgrade.stack ? ` · ${nextUpgradeLevel}` : ''}</strong><span>${upgrade.description}</span>`;
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
    config.r = mobileSize(config.r);
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
      : Math.round((115 + state.wave * 9 + Math.pow(state.wave / 5, 2) * 15 + tier * 55) * .66 * enemyUpgradeHpScale());
    const boss = bossTypes[bossType];
    const radius = isMini ? random(21, 26, 'boss') : bossType === 'brute' ? 47 : 40;
    state.enemies.push({ x: random(state.width * .3, state.width * .7, 'boss'), y: isMini ? -30 : -55, r: mobileSize(radius), hp, maxHp: hp, speed: (isMini ? 43 + tier * 3 : 68 + tier * 11) * enemyUpgradeSpeedScale(), score: isMini ? 350 + state.wave * 35 : 1900 + state.wave * 180, color: boss.color, kind: 'boss', bossType, bossName: (isMini ? 'Mini-chefe ' : '') + boss.name, isMiniBoss: isMini, phase: 1, cooldown: isMini ? 2.25 : .72, angle: 0, spin: .35, ramCooldown: 0, dashTime: 0, dashCooldown: 2.2, hitFlash: 0, drift: random(0, Math.PI * 2, 'boss') });
    toast((isMini ? 'MINI-CHEFE: ' : '') + boss.name.toUpperCase());
    if (!isMini) tone(90, .7, 'sawtooth', .045);
  }
  function spawnPickup(x, y, kind) {
    const pickupKind = kind || (randomUnit('loot') < .06 ? 'charge' : randomUnit('loot') > .5 ? 'repair' : 'shield');
    state.pickups.push({ x, y, kind: pickupKind, r: mobileSize(11), life: 10, spin: 0 });
  }
  function burst(x, y, color, count = 12, power = 100) {
    const lightMode = state.performanceMode === 'light';
    const particleCount = lightMode ? Math.ceil(count * .45) : count;
    const particleLimit = lightMode ? 110 : Infinity;
    for (let i = 0; i < particleCount && state.particles.length < particleLimit; i++) {
      const angle = visualRandomUnit() * Math.PI * 2; const speed = visualRandom(power * .25, power);
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: visualRandom(.22, .62), maxLife: .62, r: mobileSize(visualRandom(1.5, 3.5)), color });
    }
  }
  function fire() {
    const n = state.player.spread + state.bonusShots;
    for (let i = 0; i < n; i++) {
      const offset = i - (n - 1) / 2;
      const angle = -Math.PI / 2 + offset * .17;
      state.bullets.push({ x: state.player.x + Math.sin(angle) * mobileSize(13), y: state.player.y - mobileSize(10), vx: Math.sin(angle) * 40, vy: Math.cos(angle) * -510, r: mobileSize(3.5), damage: state.player.damage, color: '#8affee' });
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
    const bossAssist = target.kind === 'boss' && !target.isMiniBoss;
    const bossDistance = Math.max(1, distance(state.player, target));
    const bossHalfSpread = bossAssist ? Math.atan2(Math.max(3, target.r * .45), bossDistance) : 0;
    for (let i = 0; i < totalShots; i++) {
      const centeredShot = i - (totalShots - 1) / 2;
      // Contra chefes principais, mantém o leque extra dentro da área do alvo.
      const direction = angle + (bossAssist
        ? centeredShot / Math.max(.5, (totalShots - 1) / 2) * bossHalfSpread
        : centeredShot * .16);
      const critical = randomUnit('combat') < state.critChance;
      state.bullets.push({ x: state.player.x + Math.cos(direction) * mobileSize(13), y: state.player.y + Math.sin(direction) * mobileSize(13), vx: Math.cos(direction) * 510, vy: Math.sin(direction) * 510, r: mobileSize(critical ? 5 : 3.5), damage: state.player.damage * (1 + state.endlessDamage) * (critical ? 2 : 1), pierce: state.pierce, hit: [], assistTarget: bossAssist ? target : null, color: critical ? '#ffe38a' : currentSkin().accent });
    }
    tone(420, .035, 'square', .01);
  }
  function enemyAimTarget() {
    return currentSkin().id === 'eclipse' && state.eclipseDecoy?.life > 0 ? state.eclipseDecoy : state.player;
  }
  function enemyFire(enemy) {
    const target = enemyAimTarget();
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const shot = (a, speed, r, extras = {}) => state.enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.r * .35, vx: Math.cos(a) * speed * enemyUpgradeAttackScale(), vy: Math.sin(a) * speed * enemyUpgradeAttackScale(), r: mobileSize(r || 5), color: enemy.color, source: enemy, ...extras });
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
    const radius = mobileSize(bullet.blastRadius || 78);
    burst(bullet.x, bullet.y, '#ffbd67', 26, 165); burst(bullet.x, bullet.y, '#fff1b4', 13, 105);
    if (distance(bullet, state.player) < radius + state.player.radius && state.reflectTime <= 0) damagePlayer(bullet.damage || 2);
    state.enemies.forEach((enemy) => { if (!enemy.dead && distance(bullet, enemy) < radius + enemy.r) damageEnemy(enemy, 8 + state.wave * .2, true); });
  }
  function damagePlayer(amount = 1) {
    if (state.eclipsePhase === 'active' || state.invulnerable > 0 || state.mode !== 'playing') return;
    if (randomUnit('combat') < state.armorChance) { state.invulnerable = .28; toast('BLINDAGEM REATIVA'); tone(480, .1, 'triangle', .025); return; }
    let remaining = Math.max(1, Math.floor(amount));
    const tempUsed = Math.min(state.tempShields, remaining); state.tempShields -= tempUsed; remaining -= tempUsed;
    const regularUsed = Math.min(state.shields, remaining); state.shields -= regularUsed; remaining -= regularUsed;
    if (remaining === 0) { state.invulnerable = .82; toast(tempUsed ? 'BARREIRA AEGIS ABSORVEU O IMPACTO' : 'ESCUDO ABSORVEU O IMPACTO'); tone(680, .18, 'triangle', .04); updateHud(); return; }
    if (tempUsed || regularUsed) toast('IMPACTO ROMPEU SEUS ESCUDOS');
    if (state.drones > 0 && state.lives - remaining <= 0) {
      sacrificeDrone();
      state.lives = 1;
      state.invulnerable = 1.35;
      burst(state.player.x, state.player.y, currentSkin().color, 24, 170);
      updateHud();
      return;
    }
    state.waveDamageTaken = true;
    state.lives = Math.max(0, state.lives - remaining);
    state.invulnerable = 1.35; burst(state.player.x, state.player.y, '#ff6687', 22, 160); tone(120, .23, 'sawtooth', .05); updateHud();
    if (state.lives <= 0) finishGame();
  }
  function sacrificeDrone() {
    const droneIndex = state.drones - 1;
    const angle = performance.now() / 800 + droneIndex * Math.PI * 2 / state.drones;
    const x = state.player.x + Math.cos(angle) * mobileSize(39);
    const y = state.player.y + Math.sin(angle) * mobileSize(39);
    state.drones -= 1;
    state.upgrades.drone = Math.max(0, upgradeLevel('drone') - 1);
    burst(x, y, currentSkin().color, 30, 185);
    burst(x, y, '#ffffff', 16, 135);
    toast('DRONE SACRIFICADO · NAVE SALVA COM 1 VIDA');
    tone(310, .28, 'triangle', .055);
  }
  function reflectIncomingBullet(bullet) {
    if (state.reflectTime <= 0 || bullet.dead || bullet.reflected) return false;
    const shieldRadius = state.player.radius + mobileSize(20);
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
    bullet.r = mobileSize(clamp(bullet.r || 5, 4, 7));
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
  function finishEclipseSpecial() {
    state.eclipsePhase = 'idle';
    state.eclipseTime = 0;
    state.eclipseHitCooldowns = [];
    state.invulnerable = Math.max(state.invulnerable, 3);
    toast('PROTEÇÃO DO DOMÍNIO · 3s');
    updateAbilityButton();
  }
  function beginEclipseSpecial() {
    if (state.eclipsePhase !== 'cinematic') return;
    if (ui.eclipseVideo) ui.eclipseVideo.pause();
    if (ui.eclipseCutscene) { ui.eclipseCutscene.hidden = true; ui.eclipseCutscene.setAttribute('aria-hidden', 'true'); }
    state.eclipsePhase = 'active';
    state.eclipseTime = Math.min(10.3, 10 + state.eclipseDurationBonus + Math.max(0, state.abilityPower - 1) * .7);
    state.eclipseCutTimer = 0;
    state.eclipseHitCooldowns = [];
    state.player.x = state.width / 2;
    state.player.y = state.height / 2;
    window.CV_GAME_AUDIO?.playSpecialMusic(eclipseDomainMusicUrl, ui.eclipseVideo?.volume ?? 1);
    updateAbilityButton();
    state.lastTime = performance.now();
    if (state.mode === 'playing') state.raf = requestAnimationFrame(frame);
  }
  function startEclipseCinematic(skipVideo = false) {
    state.eclipsePhase = 'cinematic';
    state.eclipseTime = 0;
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    cancelAnimationFrame(state.raf); state.raf = 0;
    window.CV_GAME_AUDIO?.pauseForCutscene();
    if (skipVideo) { beginEclipseSpecial(); return; }
    if (!ui.eclipseVideo || !ui.eclipseCutscene) { beginEclipseSpecial(); return; }
    ui.eclipseCutscene.hidden = false;
    ui.eclipseCutscene.setAttribute('aria-hidden', 'false');
    ui.eclipseVideo.muted = false;
    ui.eclipseVideo.playsInline = true;
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      ui.eclipseVideo.removeEventListener('ended', finish);
      ui.eclipseVideo.removeEventListener('error', finish);
      beginEclipseSpecial();
    };
    ui.eclipseVideo.addEventListener('ended', finish, { once: true });
    ui.eclipseVideo.addEventListener('error', finish, { once: true });
    ui.eclipseVideo.src = eclipseDomainVideoUrl;
    ui.eclipseVideo.currentTime = 0;
    ui.eclipseVideo.load();
    ui.eclipseVideo.play()?.catch?.(finish);
  }
  function updateEclipseCuts(dt) {
    if (state.eclipsePhase !== 'active' || state.eclipseTime <= 0) return;
    state.eclipseCutTimer -= dt;
    if (state.eclipseCutTimer > 0) return;
    const lightMode = state.performanceMode === 'light';
    state.eclipseCutTimer = lightMode ? .2 : .16;
    const cutCount = lightMode ? 6 : 9;
    const cutLifetime = lightMode ? .32 : .36;
    for (let cut = 0; cut < cutCount; cut++) {
      const angle = random(-Math.PI, Math.PI, 'ability');
      const directionX = Math.cos(angle); const directionY = Math.sin(angle);
      const centerX = random(state.width * .16, state.width * .84, 'ability');
      const centerY = random(state.height * .16, state.height * .84, 'ability');
      const xBounds = [((0 - centerX) / directionX), ((state.width - centerX) / directionX)].sort((a, b) => a - b);
      const yBounds = [((0 - centerY) / directionY), ((state.height - centerY) / directionY)].sort((a, b) => a - b);
      const start = Math.max(xBounds[0], yBounds[0]); const end = Math.min(xBounds[1], yBounds[1]);
      const x1 = centerX + directionX * start; const y1 = centerY + directionY * start;
      const x2 = centerX + directionX * end; const y2 = centerY + directionY * end;
      const width = mobileSize(random(lightMode ? 1.35 : 1.5, lightMode ? 2.4 : 2.9, 'ability'));
      const colorRoll = randomUnit('ability');
      const color = colorRoll < .58 ? '#e32636' : colorRoll < .84 ? '#fffafa' : '#111015';
      state.effects.push({ type: 'eclipse-slash', x1, y1, x2, y2, angle, width, color, life: cutLifetime, total: cutLifetime });
      const lineX = x2 - x1; const lineY = y2 - y1; const lineLengthSquared = lineX * lineX + lineY * lineY;
      for (const enemy of state.enemies) {
        if (enemy.dead) continue;
        const projection = clamp(((enemy.x - x1) * lineX + (enemy.y - y1) * lineY) / lineLengthSquared, 0, 1);
        const nearestX = x1 + lineX * projection; const nearestY = y1 + lineY * projection;
        if (Math.hypot(enemy.x - nearestX, enemy.y - nearestY) > enemy.r + width + state.eclipseCutBonus) continue;
        if (state.eclipseHitCooldowns.some((hit) => hit.enemy === enemy)) continue;
        if (state.eclipseImpactCooldown <= 0) {
          state.eclipseImpactCooldown = random(1.05, 1.45, 'ability');
          state.effects.push({ type: 'eclipse-impact', x: nearestX, y: nearestY, angle: random(-Math.PI, Math.PI, 'ability'), size: mobileSize(random(30, 48, 'ability')), life: .11, total: .11 });
        }
        damageEnemy(enemy, (2.5 + state.eclipseCutDamage) * state.abilityPower, true);
        state.eclipseHitCooldowns.push({ enemy, time: .55 });
        burst(nearestX, nearestY, '#fffafa', 5, 82);
      }
    }
  }
  function activateEclipseDecoy() {
    if (currentSkin().id !== 'eclipse' || state.mode !== 'playing' || state.eclipsePhase !== 'idle' || state.eclipseDecoy?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.eclipseDecoyCooldown > 0) return;
    recordAchievementEvent('ship-ability', 'eclipse');
    state.eclipseDecoy = { x: state.player.x, y: state.player.y, angle: state.player.angle, life: 4, total: 4 };
    state.eclipseDecoyCooldown = developerProfile ? 0 : 24;
    burst(state.player.x, state.player.y, '#bd91ff', 24, 120);
    burst(state.player.x, state.player.y, '#f2e8ff', 9, 70);
    toast('ISCA UMBRAL · MIRA DESVIADA');
    tone(310, .13, 'sine', .035);
    updateAbilityButton();
  }
  function dinoStampedeCooldownDuration() {
    return Math.max(24, currentSkin().cooldownQ - upgradeLevel('dinoResonance') * 2);
  }
  function advanceDinoStampedeRecharge(seconds) {
    if (hasDeveloperPerks()) { state.dinoStampedeCharges = 3; state.dinoStampedeRecharge = 0; return; }
    if (state.dinoStampedeCharges >= 3) { state.dinoStampedeCharges = 3; state.dinoStampedeRecharge = 0; return; }
    if (state.dinoStampedeRecharge <= 0) {
      state.dinoStampedeCharges = Math.min(3, state.dinoStampedeCharges + 1);
      state.dinoStampedeRecharge = state.dinoStampedeCharges < 3 ? dinoStampedeCooldownDuration() : 0;
      return;
    }
    state.dinoStampedeRecharge = Math.max(0, state.dinoStampedeRecharge - seconds);
    if (state.dinoStampedeRecharge <= 0) {
      state.dinoStampedeCharges = Math.min(3, state.dinoStampedeCharges + 1);
      state.dinoStampedeRecharge = state.dinoStampedeCharges < 3 ? dinoStampedeCooldownDuration() : 0;
    }
  }
  function nearestDinoTarget(x, y, preferBoss = false, hit = []) {
    const available = state.enemies.filter((enemy) => !enemy.dead && !hit.includes(enemy));
    if (!available.length) return null;
    if (preferBoss) {
      const bosses = available.filter((enemy) => enemy.kind === 'boss' && !enemy.isMiniBoss);
      if (bosses.length) return bosses.sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y))[0];
    }
    return available.sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y))[0];
  }
  function emitDinoClawSet(enemy) {
    const scale = visualRandom(.58, 1.08);
    const sideAngle = visualRandom(-Math.PI, Math.PI);
    const centerDistance = enemy.r * visualRandom(.12, .36);
    const centerX = enemy.x + Math.cos(sideAngle) * centerDistance;
    const centerY = enemy.y + Math.sin(sideAngle) * centerDistance;
    const slashAngle = sideAngle + Math.PI / 2 + visualRandom(-.16, .16);
    const directionX = Math.cos(slashAngle); const directionY = Math.sin(slashAngle);
    const normalX = -directionY; const normalY = directionX;
    const spacing = Math.max(mobileSize(5), enemy.r * .36 * scale);
    for (let claw = -1; claw <= 1; claw++) {
      const clawScale = scale * visualRandom(claw === 0 ? .78 : .58, claw === 0 ? 1.12 : 1.32);
      const length = Math.max(mobileSize(13), enemy.r * clawScale * visualRandom(.95, 1.45));
      const offset = claw * spacing;
      const x1 = centerX + normalX * offset - directionX * length * .5;
      const y1 = centerY + normalY * offset - directionY * length * .5;
      const x2 = centerX + normalX * offset + directionX * length * .5;
      const y2 = centerY + normalY * offset + directionY * length * .5;
      const bend = visualRandom(-length * .12, length * .12);
      state.effects.push({
        type: 'dino-claw', x1, y1, x2, y2,
        cx: (x1 + x2) / 2 + normalX * bend,
        cy: (y1 + y2) / 2 + normalY * bend,
        width: mobileSize(Math.max(1.15, enemy.r * .065 * clawScale)),
        life: .32, total: .32, color: claw === 0 ? '#efffc8' : '#72f58e'
      });
    }
  }
  function strokeDinoClawPath(effect) {
    ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1);
    if (Number.isFinite(effect.cx) && Number.isFinite(effect.cy)) ctx.quadraticCurveTo(effect.cx, effect.cy, effect.x2, effect.y2);
    else ctx.lineTo(effect.x2, effect.y2);
    ctx.stroke();
  }
  function activateDinoStampede() {
    if (currentSkin().id !== 'saurion' || state.mode !== 'playing') return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.dinoStampedeCharges <= 0) return;
    recordAchievementEvent('ship-ability', 'saurion');
    if (!developerProfile) {
      state.dinoStampedeCharges = Math.max(0, state.dinoStampedeCharges - 1);
      if (state.dinoStampedeRecharge <= 0) state.dinoStampedeRecharge = dinoStampedeCooldownDuration();
    }
    const count = 3 + state.dinoStampedeExtra;
    const speed = Math.max(590, Math.min(740, state.width * .92));
    const mainBoss = nearestDinoTarget(state.player.x, state.player.y, true);
    for (let index = 0; index < count; index++) {
      const lanePosition = index / Math.max(1, count - 1);
      const y = index === 0 ? clamp(state.player.y, 34, state.height - 34) : clamp(state.height * (.2 + lanePosition * .6) + random(-state.height * .04, state.height * .04, 'ability'), 34, state.height - 34);
      const fromLeft = index === 0 && mainBoss ? mainBoss.x >= state.player.x : randomUnit('ability') < .5;
      const x = fromLeft ? -75 : state.width + 75;
      const target = index === 0 && mainBoss ? mainBoss : nearestDinoTarget(x, y, false);
      const angle = target ? Math.atan2(target.y - y, target.x - x) : fromLeft ? 0 : Math.PI;
      const life = 2.65;
      state.effects.push({ type: 'dino-raptor', x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, angle, turnRate: 5.1, target, size: mobileSize(34), radius: mobileSize(36), damage: (13 + state.dinoStampedeDamageBonus) * state.abilityPower, life, total: life, hit: [] });
    }
    burst(state.player.x, state.player.y, '#75f28b', 30, 160);
    burst(state.player.x, state.player.y, '#eaffb2', 9, 100);
    toast('ESTOURO DA MANADA · ' + count + ' RAPTORES · ' + (developerProfile ? '∞' : state.dinoStampedeCharges + '/3') + ' CARGAS');
    tone(125, .28, 'sawtooth', .045);
    updateAbilityButton();
  }
  function activateSecondaryAbility() {
    if (currentSkin().id === 'eclipse') activateEclipseDecoy();
    else if (currentSkin().id === 'saurion') activateDinoStampede();
  }
  function activateAbility() {
    const developerProfile = hasDeveloperPerks();
    if (state.mode !== 'playing' || (!developerProfile && state.abilityCooldown > 0)) return;
    const skin = currentSkin();
    if (skin.id === 'eclipse' && state.eclipsePhase !== 'idle') return;
    if (skin.id === 'eclipse') state.eclipseDecoy = null;
    recordAchievementEvent('ship-ability', skin.id);
    state.abilityCooldown = developerProfile ? 0 : state.abilityBaseCooldown || skin.cooldown;
    if (skin.id === 'eclipse') {
      const duration = Math.min(10.3, 10 + state.eclipseDurationBonus + Math.max(0, state.abilityPower - 1) * .7);
      state.eclipseTime = duration;
      startEclipseCinematic(readEclipseVideoSkip());
    } else if (skin.id === 'aurora') {
      const radius = mobileSize(285);
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
    } else if (skin.id === 'saurion') {
      const radius = mobileSize(460 + state.dinoRoarRangeBonus);
      state.effects.push({ type: 'dino-roar', x: state.player.x, y: state.player.y, radius, life: .92, total: .92 });
      let clearedBullets = 0;
      for (const bullet of state.enemyBullets) {
        if (bullet.dead || bullet.reflected) continue;
        if (distance(state.player, bullet) <= radius) {
          bullet.dead = true; clearedBullets++;
          burst(bullet.x, bullet.y, '#caff91', 5, 70);
        }
      }
      let markedTargets = 0;
      for (const enemy of state.enemies) {
        if (enemy.dead || distance(state.player, enemy) > radius + enemy.r) continue;
        const boss = enemy.kind === 'boss';
        enemy.dinoStun = Math.max(enemy.dinoStun || 0, boss ? .68 : 1.2);
        enemy.dinoCutMark = 15;
        enemy.dinoClawBursts = 8;
        enemy.dinoClawTimer = .12;
        markedTargets++;
        burst(enemy.x, enemy.y, '#75f28b', boss ? 6 : 4, boss ? 92 : 72);
      }
      burst(state.player.x, state.player.y, '#75f28b', 34, 260);
      burst(state.player.x, state.player.y, '#eaffb2', 12, 150);
      const roarSummary = ['RUGIDO DE GARRAS'];
      if (markedTargets) roarSummary.push(markedTargets + ' ALVOS MARCADOS');
      if (clearedBullets) roarSummary.push(clearedBullets + ' PROJÉTEIS DESFEITOS');
      toast(roarSummary.join(' · '));
    }
    updateAbilityButton();
    if (skin.id === 'saurion') tone(92, .38, 'sawtooth', .04);
    else if (skin.id !== 'eclipse') tone(740, .22, 'triangle', .05);
  }
  function update(dt) {
    state.elapsed += dt;
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.waveGrace = Math.max(0, state.waveGrace - dt);
    state.shotCooldown -= dt;
    state.powerSpawn -= dt;
    state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    state.eclipseDecoyCooldown = Math.max(0, state.eclipseDecoyCooldown - dt);
    advanceDinoStampedeRecharge(dt);
    if (state.eclipseDecoy) {
      state.eclipseDecoy.life = Math.max(0, state.eclipseDecoy.life - dt);
      if (state.eclipseDecoy.life <= 0) state.eclipseDecoy = null;
    }
    state.slowTime = Math.max(0, state.slowTime - dt);
    state.reflectTime = Math.max(0, state.reflectTime - dt);
    state.eclipseTime = Math.max(0, state.eclipseTime - dt);
    state.eclipseImpactCooldown = Math.max(0, state.eclipseImpactCooldown - dt);
    state.eclipseHitCooldowns.forEach((hit) => { hit.time -= dt; });
    state.eclipseHitCooldowns = state.eclipseHitCooldowns.filter((hit) => hit.time > 0 && !hit.enemy.dead);
    if (state.eclipsePhase === 'active' && state.eclipseTime <= 0) finishEclipseSpecial();
    if (state.regenLevel > 0 && state.lives < state.maxLives) {
      state.regenTimer -= dt;
      if (state.regenTimer <= 0) { state.lives++; state.regenTimer = Math.max(16, 32 - state.regenLevel * 4); toast('NANORREPARO +1 VIDA'); updateHud(); }
    }
    let dx = 0; let dy = 0;
    if (state.eclipsePhase === 'active') {
      state.pointer.active = false;
      if (state.analog.active) releaseAnalog();
      state.player.x = state.width / 2;
      state.player.y = state.height / 2;
    } else if (state.controlMode === 'keys') {
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
    updateEclipseCuts(dt);
    if (state.eclipsePhase !== 'active' && state.shotCooldown <= 0 && state.enemies.length) { fireAt(nearestEnemy()); state.shotCooldown = state.player.fireRate; }
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
    for (const bullet of state.bullets) {
      const target = bullet.assistTarget;
      if (target?.dead) bullet.assistTarget = null;
      else if (target) {
        const dx = target.x - bullet.x;
        const dy = target.y - bullet.y;
        const targetDistance = Math.hypot(dx, dy);
        const assistRadius = Math.max(110, target.r * 3.4);
        if (targetDistance < assistRadius) {
          const speed = Math.hypot(bullet.vx, bullet.vy) || 510;
          const currentAngle = Math.atan2(bullet.vy, bullet.vx);
          const targetAngle = Math.atan2(dy, dx);
          const difference = Math.atan2(Math.sin(targetAngle - currentAngle), Math.cos(targetAngle - currentAngle));
          const proximity = clamp(1 - targetDistance / assistRadius, 0, 1);
          const maxTurn = 2.1 * (.55 + proximity * .45) * dt;
          const adjustedAngle = currentAngle + clamp(difference, -maxTurn, maxTurn);
          bullet.vx = Math.cos(adjustedAngle) * speed;
          bullet.vy = Math.sin(adjustedAngle) * speed;
        }
      }
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
    }
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
      const decoy = state.eclipseDecoy;
      if (decoy && currentSkin().id === 'eclipse' && Math.hypot(bullet.x - decoy.x, bullet.y - decoy.y) < bullet.r + state.player.radius * .9) {
        if (bullet.explosive) explodeBullet(bullet);
        else { bullet.dead = true; burst(decoy.x, decoy.y, '#bd91ff', 6, 62); }
        continue;
      }
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
      if (enemy.dead) continue;
      const aimTarget = enemyAimTarget();
      const angle = Math.atan2(aimTarget.y - enemy.y, aimTarget.x - enemy.x);
      const frozenByEclipse = state.eclipsePhase === 'cinematic';
      enemy.dinoStun = Math.max(0, (enemy.dinoStun || 0) - dt);
      enemy.dinoCutMark = Math.max(0, (enemy.dinoCutMark || 0) - dt);
      if (enemy.dinoCutMark > 0 && (enemy.dinoClawBursts || 0) > 0) {
        enemy.dinoClawTimer = Math.max(0, (enemy.dinoClawTimer || 0) - dt);
        if (enemy.dinoClawTimer <= 0) {
          emitDinoClawSet(enemy);
          const clawDamage = (.65 + state.dinoRoarBonus * .0125) * state.abilityPower * (enemy.kind === 'boss' ? 1.25 : 1);
          damageEnemy(enemy, clawDamage, true);
          burst(enemy.x, enemy.y, '#caff91', enemy.kind === 'boss' ? 6 : 4, 96);
          enemy.dinoClawBursts--;
          enemy.dinoClawTimer = 2;
          if (enemy.dead) continue;
        }
      }
      const stunnedByDino = enemy.dinoStun > 0;
      if (frozenByEclipse || stunnedByDino) {
        enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
      } else {
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
      }
      if (distance(state.player, enemy) < state.player.radius + enemy.r * .75) {
        if (state.eclipseTime > 0 || stunnedByDino) continue;
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
      if (bullet.explosive && state.eclipsePhase !== 'active') explodeBullet(bullet);
      else if (bullet.explosive) { bullet.dead = true; burst(bullet.x, bullet.y, '#d9b9ff', 10, 115); }
      else { bullet.dead = true; damagePlayer(bullet.damage || 1); }
    }
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    state.droneCooldown -= dt;
    if (state.drones && state.droneCooldown <= 0) {
      state.droneCooldown = .42;
      for (let i = 0; i < state.drones; i++) {
        const angle = performance.now() / 800 + i * Math.PI * 2 / state.drones;
        const satellite = { x: state.player.x + Math.cos(angle) * mobileSize(39), y: state.player.y + Math.sin(angle) * mobileSize(39) };
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
        else if (pickup.kind === 'charge') {
          state.abilityCooldown = Math.max(0, state.abilityCooldown - 8);
          if (currentSkin().id === 'eclipse') state.eclipseDecoyCooldown = Math.max(0, state.eclipseDecoyCooldown - 8);
          if (currentSkin().id === 'saurion') advanceDinoStampedeRecharge(8);
          toast('CARGA DE HABILIDADE −8s');
        }
        else { state.shields = Math.min(4, state.shields + 1); toast('ESCUDO DE ENERGIA +1'); }
        const color = pickup.kind === 'repair' ? '#76ffae' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff';
        burst(pickup.x, pickup.y, color, 14, 90); tone(780, .17, 'sine', .04); updateHud();
      }
    }
    state.pickups = state.pickups.filter(p => !p.dead && p.life > 0);
    const activeEffects = [];
    for (const effect of state.effects) {
      effect.life -= dt;
      if (effect.type === 'dino-raptor') {
        if (!effect.target || effect.target.dead || effect.hit.includes(effect.target)) effect.target = nearestDinoTarget(effect.x, effect.y, false, effect.hit);
        if (effect.target) {
          const desiredAngle = Math.atan2(effect.target.y - effect.y, effect.target.x - effect.x);
          const difference = Math.atan2(Math.sin(desiredAngle - effect.angle), Math.cos(desiredAngle - effect.angle));
          effect.angle += clamp(difference, -effect.turnRate * dt, effect.turnRate * dt);
        }
        const speed = Math.hypot(effect.vx, effect.vy) || 680;
        effect.vx = Math.cos(effect.angle) * speed; effect.vy = Math.sin(effect.angle) * speed;
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        effect.hit = effect.hit || [];
        for (const enemy of state.enemies) {
          if (enemy.dead || effect.hit.includes(enemy) || Math.hypot(effect.x - enemy.x, effect.y - enemy.y) >= effect.radius + enemy.r * .7) continue;
          const markedBySaurion = enemy.dinoCutMark > 0;
          damageEnemy(enemy, effect.damage * (markedBySaurion ? 1.3 : 1), true);
          effect.hit.push(enemy);
          if (effect.type === 'dino-raptor') effect.target = null;
          burst(effect.x, effect.y, markedBySaurion ? '#eaffb2' : '#9dff79', markedBySaurion ? 14 : 10, markedBySaurion ? 130 : 105);
          burst(effect.x, effect.y, '#e9ffd0', 5, 72);
        }
        if (visualRandomUnit() < dt * 16 && (state.performanceMode !== 'light' || state.particles.length < 110)) state.particles.push({ x: effect.x + visualRandom(-12, 12), y: effect.y + visualRandom(-12, 12), vx: visualRandom(-32, 32), vy: visualRandom(-32, 32), life: .34, maxLife: .34, r: mobileSize(visualRandom(2, 4)), color: visualRandomUnit() < .5 ? '#d4ff72' : '#50e884' });
        if (effect.x < -100 || effect.x > state.width + 100 || effect.y < -100 || effect.y > state.height + 100) effect.life = 0;
      } else if (effect.type === 'blade') {
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
          if (!enemy.dead && !cooling && Math.hypot(effect.x - enemy.x, effect.y - enemy.y) < enemy.r + mobileSize(25)) {
            damageEnemy(enemy, effect.damage, true); effect.hitCooldowns.push({ enemy, time: .42 });
            burst(effect.x, effect.y, '#fff4c7', 10, 125); burst(effect.x, effect.y, '#ffc86e', 8, 100);
          }
        }
        if (visualRandomUnit() < dt * (state.performanceMode === 'light' ? 7 : 22) && (state.performanceMode !== 'light' || state.particles.length < 110)) state.particles.push({ x: effect.x, y: effect.y, vx: visualRandom(-30, 30), vy: visualRandom(-30, 30), life: .28, maxLife: .28, r: mobileSize(visualRandom(2, 4)), color: visualRandomUnit() < .5 ? '#fff7d5' : '#ffc86e' });
      } else if (effect.type === 'singularity-shot') {
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        if (effect.x < 12 || effect.x > state.width - 12 || effect.y < 12 || effect.y > state.height - 12) { effect.x = clamp(effect.x, 12, state.width - 12); effect.y = clamp(effect.y, 12, state.height - 12); effect.life = 0; }
        if (visualRandomUnit() < dt * (state.performanceMode === 'light' ? 9 : 28) && (state.performanceMode !== 'light' || state.particles.length < 110)) state.particles.push({ x: effect.x + visualRandom(-5, 5), y: effect.y + visualRandom(-5, 5), vx: visualRandom(-55, 55), vy: visualRandom(-55, 55), life: .38, maxLife: .38, r: mobileSize(visualRandom(1.5, 3)), color: visualRandomUnit() < .5 ? '#8ef6ff' : '#c19cff' });
        const hit = state.enemies.find((enemy) => !enemy.dead && distance(effect, enemy) < enemy.r + mobileSize(13));
        if (hit) { damageEnemy(hit, 24 * state.abilityPower, true); effect.life = 0; }
        if (effect.life <= 0) {
          effect.type = 'blackhole'; effect.life = state.singularityDuration; effect.total = state.singularityDuration; effect.radius = mobileSize(state.singularityRadius); effect.damageClock = .2;
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
  function drawDinoHeadLocal(size, color, accent, jawOpen, timestamp) {
    const pulse = .92 + Math.sin(timestamp / 95) * .08;
    if (state.performanceMode !== 'light') {
      const aura = ctx.createRadialGradient(0, 0, size * .12, 0, 0, size * 1.8);
      aura.addColorStop(0, 'rgba(92,255,117,.2)'); aura.addColorStop(.58, 'rgba(44,210,102,.12)'); aura.addColorStop(1, 'rgba(35,190,99,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.65, size * 1.85, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const armor = ctx.createLinearGradient(-size, -size, size, size);
    armor.addColorStop(0, '#123d35'); armor.addColorStop(.35, color); armor.addColorStop(.72, '#168c56'); armor.addColorStop(1, '#0b382f');
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#14613e'; ctx.strokeStyle = accent; ctx.lineWidth = size * .055;
      ctx.beginPath(); ctx.moveTo(side * size * .48, -size * .48); ctx.lineTo(side * size * 1.02, -size * .94); ctx.lineTo(side * size * .86, -size * .28); ctx.lineTo(side * size * 1.24, size * .02); ctx.lineTo(side * size * .61, size * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a9ff74'; ctx.beginPath(); ctx.moveTo(side * size * .73, -size * .58); ctx.lineTo(side * size * .96, -size * .8); ctx.lineTo(side * size * .85, -size * .39); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = armor; ctx.strokeStyle = accent; ctx.lineWidth = size * .075; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .32;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.38); ctx.quadraticCurveTo(size * .78, -size * 1.16, size * .72, -size * .48); ctx.lineTo(size * .92, -size * .08); ctx.quadraticCurveTo(size * .73, size * .28, size * .35, size * .27); ctx.lineTo(0, size * .1); ctx.lineTo(-size * .35, size * .27); ctx.quadraticCurveTo(-size * .73, size * .28, -size * .92, -size * .08); ctx.lineTo(-size * .72, -size * .48); ctx.quadraticCurveTo(-size * .78, -size * 1.16, 0, -size * 1.38); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#071d1c'; ctx.beginPath(); ctx.moveTo(-size * .66, size * .02); ctx.quadraticCurveTo(0, size * .27, size * .66, size * .02); ctx.lineTo(size * .48, size * (.34 + jawOpen * .2)); ctx.quadraticCurveTo(0, size * (.48 + jawOpen * .45), -size * .48, size * (.34 + jawOpen * .2)); ctx.closePath(); ctx.fill();
    const jaw = ctx.createLinearGradient(0, size * .18, 0, size * 1.03);
    jaw.addColorStop(0, accent); jaw.addColorStop(.32, '#5bea7a'); jaw.addColorStop(1, '#106546');
    ctx.fillStyle = jaw; ctx.strokeStyle = '#caff8e'; ctx.lineWidth = size * .045;
    ctx.beginPath(); ctx.moveTo(-size * .58, size * (.28 + jawOpen * .18)); ctx.quadraticCurveTo(0, size * (.44 + jawOpen * .38), size * .58, size * (.28 + jawOpen * .18)); ctx.lineTo(size * .42, size * (.79 + jawOpen * .4)); ctx.quadraticCurveTo(0, size * (.98 + jawOpen * .48), -size * .42, size * (.79 + jawOpen * .4)); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#f4ffd4'; ctx.beginPath(); ctx.moveTo(side * size * .48, size * .08); ctx.lineTo(side * size * .31, size * .08); ctx.lineTo(side * size * .42, size * (.33 + jawOpen * .12)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(side * size * .34, size * (.38 + jawOpen * .2)); ctx.lineTo(side * size * .2, size * (.38 + jawOpen * .2)); ctx.lineTo(side * size * .3, size * (.54 + jawOpen * .25)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#08251d'; ctx.beginPath(); ctx.ellipse(side * size * .43, -size * .34, size * .22, size * .16, side * -.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dcff7a'; ctx.shadowColor = '#c9ff70'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .18; ctx.beginPath(); ctx.ellipse(side * size * .45, -size * .34, size * .09, size * .08 * pulse, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#baff7c'; ctx.beginPath(); ctx.ellipse(side * size * .3, -size * .56, size * .075, size * .055, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#d8ff9b'; ctx.globalAlpha *= .8; ctx.lineWidth = size * .035; ctx.beginPath(); ctx.moveTo(-size * .28, -size * .91); ctx.quadraticCurveTo(0, -size * 1.02, size * .28, -size * .91); ctx.stroke();
  }
  function drawDinoHead(x, y, size, angle, jawOpen, timestamp, alpha = 1, skin = currentSkin()) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); ctx.globalAlpha = alpha;
    drawDinoHeadLocal(size, skin.color, skin.accent, jawOpen, timestamp);
    ctx.restore();
  }
  function drawDinoShipLocal(size, color, accent, timestamp) {
    const pulse = .88 + Math.sin(timestamp / 72) * .12;
    const baseAlpha = ctx.globalAlpha;
    if (state.performanceMode !== 'light') {
      const aura = ctx.createRadialGradient(0, 0, size * .18, 0, 0, size * 2.15);
      aura.addColorStop(0, 'rgba(68,238,112,.18)'); aura.addColorStop(.62, 'rgba(54,196,100,.08)'); aura.addColorStop(1, 'rgba(30,150,76,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.9, size * 2.05, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // Twin ion thrusters establish the rear and give the silhouette a clear fighter-ship profile.
    for (const side of [-1, 1]) {
      const engineX = side * size * .47;
      const flameLength = size * (1.18 + Math.sin(timestamp / 48 + side) * .13);
      const flame = ctx.createLinearGradient(engineX, size * .62, engineX, size * .62 + flameLength);
      flame.addColorStop(0, 'rgba(228,255,157,.96)'); flame.addColorStop(.26, 'rgba(91,255,119,.82)'); flame.addColorStop(.72, 'rgba(39,215,126,.42)'); flame.addColorStop(1, 'rgba(31,174,121,0)');
      ctx.fillStyle = flame; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .38;
      ctx.beginPath(); ctx.moveTo(engineX - size * .14, size * .48); ctx.quadraticCurveTo(engineX - size * .21, size * 1.08, engineX, size * .62 + flameLength); ctx.quadraticCurveTo(engineX + size * .21, size * 1.08, engineX + size * .14, size * .48); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#092b27'; ctx.strokeStyle = accent; ctx.lineWidth = size * .07;
      ctx.beginPath(); ctx.rect(engineX - size * .18, size * .43, size * .36, size * .37); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#aaff85'; ctx.globalAlpha *= pulse; ctx.beginPath(); ctx.ellipse(engineX, size * .61, size * .075, size * .13, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= pulse;
    }

    // Swept, armored wings with small claw-like tips keep the dinosaur theme while reading as a ship.
    const wing = ctx.createLinearGradient(0, -size * .65, 0, size * .72);
    wing.addColorStop(0, '#a7ff77'); wing.addColorStop(.28, color); wing.addColorStop(.72, '#167d52'); wing.addColorStop(1, '#0b3a36');
    for (const side of [-1, 1]) {
      ctx.fillStyle = wing; ctx.strokeStyle = accent; ctx.lineWidth = size * .055;
      ctx.beginPath(); ctx.moveTo(side * size * .23, -size * .57); ctx.quadraticCurveTo(side * size * .72, -size * .48, side * size * 1.2, -size * .04); ctx.lineTo(side * size * 1.34, size * .38); ctx.lineTo(side * size * 1.05, size * .28); ctx.lineTo(side * size * 1.17, size * .73); ctx.lineTo(side * size * .66, size * .51); ctx.quadraticCurveTo(side * size * .39, size * .39, side * size * .25, size * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d8ff98'; ctx.globalAlpha = baseAlpha * .84;
      ctx.beginPath(); ctx.moveTo(side * size * 1.02, size * .26); ctx.lineTo(side * size * 1.34, size * .38); ctx.lineTo(side * size * 1.17, size * .73); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = baseAlpha * .72; ctx.strokeStyle = '#baff8c'; ctx.lineWidth = size * .035;
      ctx.beginPath(); ctx.moveTo(side * size * .44, -size * .27); ctx.quadraticCurveTo(side * size * .84, size * .02, side * size * 1.05, size * .47); ctx.stroke();
      ctx.globalAlpha = baseAlpha;
      ctx.fillStyle = '#082b2b'; ctx.beginPath(); ctx.ellipse(side * size * .76, size * .13, size * .12, size * .07, side * .18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .12; ctx.beginPath(); ctx.arc(side * size * .76, size * .13, size * .045, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }

    // Central armored fuselage: pointed nose, cockpit and a short row of dorsal plates.
    ctx.globalAlpha = baseAlpha;
    const hull = ctx.createLinearGradient(-size * .46, -size, size * .46, size * .92);
    hull.addColorStop(0, '#dcff9a'); hull.addColorStop(.2, color); hull.addColorStop(.56, '#168b56'); hull.addColorStop(1, '#073b37');
    ctx.fillStyle = hull; ctx.strokeStyle = '#caff91'; ctx.lineWidth = size * .075; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .28;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.55); ctx.lineTo(size * .3, -size * .93); ctx.lineTo(size * .42, -size * .31); ctx.lineTo(size * .34, size * .48); ctx.lineTo(size * .19, size * .82); ctx.lineTo(0, size * 1.02); ctx.lineTo(-size * .19, size * .82); ctx.lineTo(-size * .34, size * .48); ctx.lineTo(-size * .42, -size * .31); ctx.lineTo(-size * .3, -size * .93); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;

    // The nose has a raptor-mask brow; the inset canopy remains visibly cockpit-like.
    ctx.fillStyle = '#082b2d'; ctx.strokeStyle = '#92ff88'; ctx.lineWidth = size * .045;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.24); ctx.quadraticCurveTo(size * .25, -size * .9, size * .2, -size * .52); ctx.quadraticCurveTo(0, -size * .37, -size * .2, -size * .52); ctx.quadraticCurveTo(-size * .25, -size * .9, 0, -size * 1.24); ctx.closePath(); ctx.fill(); ctx.stroke();
    const canopy = ctx.createLinearGradient(0, -size * 1.12, 0, -size * .51);
    canopy.addColorStop(0, '#d5ff9b'); canopy.addColorStop(.18, '#52f3bd'); canopy.addColorStop(.55, '#0d6570'); canopy.addColorStop(1, '#092c3b');
    ctx.fillStyle = canopy; ctx.beginPath(); ctx.moveTo(0, -size * 1.12); ctx.quadraticCurveTo(size * .16, -size * .88, size * .13, -size * .58); ctx.quadraticCurveTo(0, -size * .46, -size * .13, -size * .58); ctx.quadraticCurveTo(-size * .16, -size * .88, 0, -size * 1.12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(231,255,186,.9)'; ctx.lineWidth = size * .025; ctx.beginPath(); ctx.moveTo(-size * .09, -size * .96); ctx.quadraticCurveTo(0, -size * .89, size * .08, -size * .75); ctx.stroke();

    // Emerald eyes and swept dorsal fins act as the signature saurian markings.
    for (const side of [-1, 1]) {
      ctx.globalAlpha = baseAlpha; ctx.fillStyle = '#062621'; ctx.beginPath(); ctx.ellipse(side * size * .29, -size * .67, size * .115, size * .075, side * -.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e6ff83'; ctx.shadowColor = '#baff63'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .14; ctx.beginPath(); ctx.ellipse(side * size * .3, -size * .67, size * .052, size * .046 * pulse, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#caff88'; ctx.beginPath(); ctx.moveTo(side * size * .16, size * .08); ctx.lineTo(side * size * .35, size * .31); ctx.lineTo(side * size * .16, size * .27); ctx.closePath(); ctx.fill();
    }
    for (let plate = 0; plate < 4; plate++) {
      const y = -size * .18 + plate * size * .2;
      const plateSize = size * (.14 - plate * .012);
      ctx.globalAlpha = baseAlpha; ctx.fillStyle = plate % 2 ? '#60ed81' : '#dcff91'; ctx.strokeStyle = '#1a9a61'; ctx.lineWidth = size * .025;
      ctx.beginPath(); ctx.moveTo(-plateSize, y + plateSize * .5); ctx.lineTo(0, y - plateSize); ctx.lineTo(plateSize, y + plateSize * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(206,255,148,.78)'; ctx.beginPath(); ctx.ellipse(0, size * .59, size * .1, size * .19, 0, 0, Math.PI * 2); ctx.fill();
  }
  function drawShip(x, y, size, skin, angle = -Math.PI / 2, alpha = 1) {
    const ship = skin && typeof skin === 'object' ? skin : currentSkin();
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); ctx.globalAlpha = alpha;
    if (ship.shape === 'eclipse' && eclipseSprite.complete && eclipseSprite.naturalWidth) {
      const now = performance.now();
      const spriteHeight = size * 4.65;
      const spriteWidth = spriteHeight * eclipseSprite.naturalWidth / eclipseSprite.naturalHeight;
      const thrusters = [
        { x: -size * .43, y: size * 1.02, width: size * .36, length: size * 1.3, phase: 1.7 },
        { x: 0, y: size * 1.06, width: size * .48, length: size * 1.58, phase: 0 },
        { x: size * .43, y: size * 1.02, width: size * .36, length: size * 1.3, phase: 3.1 }
      ];
      thrusters.forEach((thruster) => {
        const pulse = .82 + .18 * Math.sin(now / 49 + thruster.phase);
        const flameLength = thruster.length * pulse;
        const flame = ctx.createLinearGradient(thruster.x, thruster.y, thruster.x, thruster.y + flameLength);
        flame.addColorStop(0, 'rgba(246,228,255,.98)');
        flame.addColorStop(.22, 'rgba(207,153,255,.94)');
        flame.addColorStop(.64, 'rgba(151,74,255,.7)');
        flame.addColorStop(1, 'rgba(111,45,255,0)');
        ctx.fillStyle = flame;
        ctx.shadowColor = ship.color;
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12;
        ctx.beginPath();
        ctx.moveTo(thruster.x - thruster.width * .32, thruster.y);
        ctx.quadraticCurveTo(thruster.x - thruster.width * .62, thruster.y + flameLength * .48, thruster.x, thruster.y + flameLength);
        ctx.quadraticCurveTo(thruster.x + thruster.width * .62, thruster.y + flameLength * .48, thruster.x + thruster.width * .32, thruster.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.shadowColor = ship.color;
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 11;
      ctx.drawImage(eclipseSprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
      ctx.restore();
      return;
    }
    if (ship.shape === 'dino') {
      drawDinoShipLocal(size, ship.color, ship.accent, performance.now());
      ctx.restore();
      return;
    }
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
    if (enemy.dinoCutMark > 0) {
      ctx.save(); ctx.globalAlpha = clamp(enemy.dinoCutMark / .8, .3, .82);
      ctx.strokeStyle = '#9cff85'; ctx.shadowColor = '#62f58a'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 8;
      ctx.lineWidth = mobileSize(1.4); ctx.setLineDash([mobileSize(3), mobileSize(6)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(5), performance.now() / 500, performance.now() / 500 + Math.PI * 1.55); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (enemy.dinoStun > 0) {
      ctx.save(); ctx.globalAlpha = .58 + Math.sin(performance.now() / 65 + enemy.x) * .16;
      ctx.strokeStyle = '#eaffb2'; ctx.shadowColor = '#aaff82'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10;
      ctx.lineWidth = mobileSize(1.5); ctx.setLineDash([mobileSize(4), mobileSize(4)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(8), 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#eaffb2';
      for (let spark = 0; spark < 3; spark++) {
        const spin = performance.now() / 260 + spark * Math.PI * 2 / 3;
        const sx = enemy.x + Math.cos(spin) * (enemy.r + mobileSize(10));
        const sy = enemy.y + Math.sin(spin) * (enemy.r + mobileSize(10));
        ctx.beginPath(); ctx.arc(sx, sy, mobileSize(2), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
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
      const color = pickup.kind === 'repair' ? '#72ffad' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff'; ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(pickup.spin); ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(16); ctx.strokeStyle = color; ctx.lineWidth = mobileSize(2); ctx.beginPath(); ctx.moveTo(0, -pickup.r); ctx.lineTo(pickup.r, 0); ctx.lineTo(0, pickup.r); ctx.lineTo(-pickup.r, 0); ctx.closePath(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.font = 'bold ' + mobileSize(12) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pickup.kind === 'repair' ? '+' : pickup.kind === 'charge' ? '◷' : '⬡', 0, 0); ctx.restore();
    }
    for (const b of state.bullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    for (const b of state.enemyBullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    for (const enemy of state.enemies) drawEnemy(enemy);
    for (const p of state.particles) { ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    const eclipseActive = currentSkin().id === 'eclipse' && state.eclipsePhase === 'active';
    if (eclipseActive) {
      const shrineScale = state.mobileSizing ? .86 : 1;
      const shrineSize = Math.min(state.width * .7, state.height * .64) * shrineScale;
      const shrineX = state.width / 2 - shrineSize / 2;
      const shrineY = state.height / 2 - shrineSize / 2;
      ctx.save();
      if (state.performanceMode !== 'light') { ctx.shadowColor = '#e32636'; ctx.shadowBlur = 24; }
      if (eclipseShrineSprite.complete && eclipseShrineSprite.naturalWidth) ctx.drawImage(eclipseShrineSprite, shrineX, shrineY, shrineSize, shrineSize);
      else {
        ctx.fillStyle = 'rgba(17,16,21,.92)'; ctx.strokeStyle = '#e32636'; ctx.lineWidth = 3;
        ctx.fillRect(shrineX + shrineSize * .14, shrineY + shrineSize * .2, shrineSize * .72, shrineSize * .66);
        ctx.strokeRect(shrineX + shrineSize * .14, shrineY + shrineSize * .2, shrineSize * .72, shrineSize * .66);
      }
      ctx.restore();
    }
    for (const effect of state.effects) {
      const alpha = clamp(effect.life / (effect.total || effect.life), 0, 1);
      if (effect.type === 'nova') {
        ctx.save(); ctx.globalAlpha = alpha; const nova = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, effect.radius - mobileSize(40)), effect.x, effect.y, effect.radius); nova.addColorStop(0, 'rgba(125,247,232,.02)'); nova.addColorStop(.82, 'rgba(125,247,232,.09)'); nova.addColorStop(1, 'rgba(255,255,255,.35)'); ctx.fillStyle = nova; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = currentSkin().color; ctx.lineWidth = mobileSize(8); ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(34); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = mobileSize(2); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * .92, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'dino-roar') {
        const progress = 1 - alpha;
        const waveRadius = effect.radius * (.08 + progress * .92);
        const waveAlpha = Math.sin(Math.PI * Math.min(1, progress * 1.08)) * .8 + alpha * .14;
        ctx.save();
        const wave = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, waveRadius - mobileSize(56)), effect.x, effect.y, waveRadius);
        wave.addColorStop(0, 'rgba(190,255,119,0)'); wave.addColorStop(.76, 'rgba(88,244,131,.045)'); wave.addColorStop(.94, 'rgba(88,244,131,.2)'); wave.addColorStop(1, 'rgba(234,255,178,.48)');
        ctx.globalAlpha = waveAlpha; ctx.fillStyle = wave;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, waveRadius, 0, Math.PI * 2); ctx.fill();
        ctx.lineCap = 'round'; ctx.shadowColor = '#7aff91'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(20);
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = waveRadius * (1 - ring * .11);
          ctx.globalAlpha = waveAlpha * (.9 - ring * .22); ctx.strokeStyle = ring === 1 ? '#eaffb2' : '#63f5a2'; ctx.lineWidth = mobileSize(ring === 0 ? 4 : 2);
          ctx.beginPath(); ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2); ctx.stroke();
        }
        const coreFlash = clamp(1 - progress * 4.5, 0, 1);
        ctx.shadowBlur = 0; ctx.globalAlpha = coreFlash * .52; ctx.fillStyle = '#eaffb2';
        ctx.beginPath(); ctx.arc(effect.x, effect.y, mobileSize(18 + progress * 32), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = waveAlpha * .18; ctx.fillStyle = '#70f69b';
        ctx.beginPath(); ctx.arc(effect.x, effect.y, waveRadius * .62, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'dino-claw') {
        const fade = Math.min(1, (1 - alpha) * 9, alpha * 2.4);
        const dx = effect.x2 - effect.x1; const dy = effect.y2 - effect.y1; const length = Math.hypot(dx, dy) || 1;
        const ux = dx / length; const uy = dy / length; const nx = -uy; const ny = ux;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = fade * .5; ctx.strokeStyle = '#103d29'; ctx.shadowColor = '#52fa8d'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 11;
        ctx.lineWidth = effect.width * 3.2; strokeDinoClawPath(effect);
        ctx.globalAlpha = fade * .9; ctx.strokeStyle = effect.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 8;
        ctx.lineWidth = effect.width * 1.9; strokeDinoClawPath(effect);
        ctx.globalAlpha = fade; ctx.strokeStyle = '#f1ffd2'; ctx.shadowColor = '#caff91'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 5;
        ctx.lineWidth = effect.width * .58; strokeDinoClawPath(effect);
        ctx.shadowBlur = 0; ctx.fillStyle = '#eaffb2'; ctx.globalAlpha = fade * .8;
        for (const end of [{ x: effect.x1, y: effect.y1, sign: 1 }, { x: effect.x2, y: effect.y2, sign: -1 }]) {
          const tipLength = effect.width * 3.2;
          const baseX = end.x + ux * tipLength * end.sign; const baseY = end.y + uy * tipLength * end.sign;
          ctx.beginPath(); ctx.moveTo(end.x, end.y); ctx.lineTo(baseX + nx * effect.width * .72, baseY + ny * effect.width * .72);
          ctx.lineTo(baseX - nx * effect.width * .72, baseY - ny * effect.width * .72); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      } else if (effect.type === 'dino-raptor') {
        const progress = 1 - alpha;
        const fade = clamp(Math.min(progress * 9, alpha * 3.2), 0, 1);
        const jawOpen = .28 + Math.sin(timestamp / 75 + effect.y) * .2;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle + Math.PI / 2);
        const trail = ctx.createLinearGradient(0, effect.size * .35, 0, effect.size * 3.2);
        trail.addColorStop(0, 'rgba(226,255,157,.7)'); trail.addColorStop(.22, 'rgba(113,255,135,.48)'); trail.addColorStop(.68, 'rgba(49,219,126,.17)'); trail.addColorStop(1, 'rgba(29,177,128,0)');
        ctx.globalAlpha = fade * .78; ctx.fillStyle = trail; ctx.shadowColor = '#48ef80'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(15);
        ctx.beginPath(); ctx.moveTo(-effect.size * .3, effect.size * .48); ctx.quadraticCurveTo(-effect.size * .18, effect.size * 1.85, 0, effect.size * 3.05); ctx.quadraticCurveTo(effect.size * .18, effect.size * 1.85, effect.size * .3, effect.size * .48); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        ctx.globalAlpha = fade * .72; ctx.strokeStyle = '#bfff87'; ctx.lineWidth = mobileSize(1.7);
        ctx.beginPath(); ctx.ellipse(0, effect.size * .32, effect.size * .95, effect.size * .3, timestamp / 190 + effect.y * .01, .15, Math.PI * 1.78); ctx.stroke();
        ctx.globalAlpha = fade * .4; ctx.strokeStyle = '#53f6ad'; ctx.lineWidth = mobileSize(1.1);
        ctx.beginPath(); ctx.ellipse(0, effect.size * .58, effect.size * .7, effect.size * .23, -timestamp / 240 - effect.x * .01, Math.PI, Math.PI * 2.72); ctx.stroke();
        for (let spark = 0; spark < 3; spark++) {
          const orbit = timestamp / 155 + spark * Math.PI * 2 / 3 + effect.y * .02;
          const sx = Math.cos(orbit) * effect.size * (.42 + spark * .08);
          const sy = effect.size * (.9 + spark * .57) + Math.sin(orbit) * effect.size * .17;
          ctx.globalAlpha = fade * (.55 - spark * .1); ctx.fillStyle = spark === 0 ? '#f2ffbd' : '#8dff9f';
          ctx.beginPath(); ctx.arc(sx, sy, mobileSize(1.8 + spark * .45), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        drawDinoHead(effect.x, effect.y, effect.size, effect.angle, jawOpen, timestamp, fade * .96, { color: '#42d66e', accent: '#d4ff72' });
      } else if (effect.type === 'eclipse-intro') {
      } else if (effect.type === 'eclipse-intro') {
        const progress = 1 - alpha; const maxRadius = Math.hypot(state.width, state.height) * .62;
        ctx.save(); ctx.globalAlpha = alpha * .12; ctx.fillStyle = '#e32636'; ctx.fillRect(0, 0, state.width, state.height);
        for (let ring = 0; ring < 3; ring++) {
          const ringProgress = clamp(progress * 1.8 - ring * .2, 0, 1);
          const radius = 16 + ringProgress * maxRadius;
          ctx.globalAlpha = alpha * (.48 - ring * .09); ctx.strokeStyle = ring === 1 ? '#fffafa' : '#e32636';
          ctx.shadowColor = '#111015'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 14;
          ctx.lineWidth = ring === 0 ? 2.2 : 1.2; ctx.beginPath(); ctx.ellipse(effect.x, effect.y, radius, radius * .62, -progress * .35, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'eclipse-slash') {
        const dx = effect.x2 - effect.x1; const dy = effect.y2 - effect.y1;
        const length = Math.hypot(dx, dy) || 1; const nx = -dy / length; const ny = dx / length;
        const slashAlpha = Math.min(1, (1 - alpha) * 10, alpha * 2);
        ctx.save(); ctx.lineCap = 'round';
        ctx.globalAlpha = slashAlpha * .42; ctx.strokeStyle = effect.color; ctx.shadowColor = '#e32636'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10;
        ctx.lineWidth = effect.width * 2.2; ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = slashAlpha * .9; ctx.strokeStyle = '#fffafa'; ctx.shadowColor = '#111015'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 5;
        ctx.lineWidth = effect.width * .72; ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = slashAlpha * .52; ctx.strokeStyle = '#111015'; ctx.shadowBlur = 0;
        ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(effect.x1 + nx * 2.5, effect.y1 + ny * 2.5); ctx.lineTo(effect.x2 + nx * 2.5, effect.y2 + ny * 2.5); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'eclipse-impact') {
        const flash = clamp((alpha - .08) / .58, 0, 1); const size = effect.size * (.78 + (1 - alpha) * .72);
        ctx.save();
        ctx.globalAlpha = flash * .1; ctx.fillStyle = '#fffafa'; ctx.fillRect(0, 0, state.width, state.height);
        ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.lineCap = 'square';
        ctx.globalAlpha = flash * .78; ctx.strokeStyle = '#e32636'; ctx.shadowColor = '#111015'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 15;
        ctx.lineWidth = 3;
        for (let ray = 0; ray < 8; ray++) {
          const angle = ray * Math.PI / 4; const inner = size * .22; const outer = size * (ray % 2 ? .9 : 1.35);
          ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
        }
        const core = ctx.createRadialGradient(0, 0, 1, 0, 0, size * .34);
        core.addColorStop(0, 'rgba(255,250,250,.98)'); core.addColorStop(.4, 'rgba(227,38,54,.72)'); core.addColorStop(1, 'rgba(17,16,21,0)');
        ctx.globalAlpha = flash; ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, size * .34, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'blade') {
        ctx.save(); ctx.globalAlpha = Math.min(1, alpha * 1.8); ctx.lineCap = 'round';
        if (effect.trail.length > 1) { ctx.beginPath(); ctx.moveTo(effect.trail[0].x, effect.trail[0].y); effect.trail.slice(1).forEach((point) => ctx.lineTo(point.x, point.y)); ctx.strokeStyle = 'rgba(255,200,110,.68)'; ctx.shadowColor = '#ffc86e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22); ctx.lineWidth = mobileSize(8); ctx.stroke(); ctx.strokeStyle = 'rgba(255,248,220,.84)'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(7); ctx.lineWidth = mobileSize(2); ctx.stroke(); }
        ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.strokeStyle = '#fff'; ctx.shadowColor = '#ffc86e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(34); ctx.lineWidth = mobileSize(8); ctx.beginPath(); ctx.moveTo(-mobileSize(34), 0); ctx.quadraticCurveTo(0, -mobileSize(12), mobileSize(34), 0); ctx.stroke(); ctx.strokeStyle = '#fff1b4'; ctx.lineWidth = mobileSize(3); ctx.beginPath(); ctx.moveTo(-mobileSize(29), 0); ctx.quadraticCurveTo(0, -mobileSize(9), mobileSize(29), 0); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'singularity-shot' || effect.type === 'blackhole') {
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(timestamp / 260);
        const radius = mobileSize(effect.type === 'blackhole' ? 22 + Math.sin(timestamp / 95) * 3 : 13);
        const glowRadius = effect.type === 'blackhole' ? effect.radius * .42 : mobileSize(25);
        const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, glowRadius); glow.addColorStop(0, 'rgba(4,5,18,.99)'); glow.addColorStop(.22, 'rgba(23,13,54,.97)'); glow.addColorStop(.55, 'rgba(137,105,255,.22)'); glow.addColorStop(1, 'rgba(69,219,255,0)');
        ctx.globalAlpha = effect.type === 'blackhole' ? .95 : alpha; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, glowRadius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#be9aff'; ctx.shadowColor = '#9c75ff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(28); ctx.lineWidth = mobileSize(effect.type === 'blackhole' ? 4 : 3); ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.7, radius * .72, timestamp / 430, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#8ef6ff'; ctx.lineWidth = mobileSize(1.5); ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.28, radius * .5, -timestamp / 510, 0, Math.PI * 2); ctx.stroke();
        if (effect.type === 'blackhole') { ctx.globalAlpha = .12 + Math.sin(timestamp / 180) * .035; ctx.setLineDash([mobileSize(5), mobileSize(13)]); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = mobileSize(1.5); ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10); ctx.beginPath(); ctx.arc(0, 0, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = '#03040d'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(0, 0, radius * .58, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (effect.type === 'lightning') {
        ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#dce5ff'; ctx.shadowColor = '#87aaff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 18; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'reflect-shield') {
        ctx.save(); ctx.translate(state.player.x, state.player.y);
        const shieldRadius = state.player.radius + mobileSize(20);
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
        if (state.tempShields > 0) { ctx.save(); ctx.globalAlpha = .35 + .25 * Math.sin(timestamp / 150); ctx.strokeStyle = currentSkin().color; ctx.lineWidth = mobileSize(3); ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22); ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(17), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      } else if (effect.type === 'chronos') {
        ctx.save(); ctx.globalAlpha = .08 * alpha; ctx.fillStyle = '#c897ff'; ctx.fillRect(0, 0, state.width, state.height); ctx.restore();
      }
    }
    const decoy = state.eclipseDecoy;
    if (decoy && currentSkin().id === 'eclipse') {
      const fade = clamp(decoy.life / .45, 0, 1);
      const pulse = .34 + Math.sin(timestamp / 100) * .07;
      ctx.save();
      ctx.globalAlpha = pulse * fade;
      ctx.strokeStyle = '#c9a8ff'; ctx.lineWidth = mobileSize(2);
      ctx.beginPath(); ctx.arc(decoy.x, decoy.y, state.player.radius + mobileSize(12 + Math.sin(timestamp / 130) * 2), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = pulse * .45 * fade;
      ctx.setLineDash([mobileSize(4), mobileSize(7)]); ctx.beginPath(); ctx.arc(decoy.x, decoy.y, state.player.radius + mobileSize(19), -timestamp / 950, Math.PI * 2 - timestamp / 950); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      drawShip(decoy.x, decoy.y, state.player.radius, currentSkin(), decoy.angle, .42 * fade);
    }
    if (!eclipseActive && (state.invulnerable <= 0 || Math.floor(timestamp / 90) % 2 === 0)) drawShip(state.player.x, state.player.y, state.player.radius, currentSkin(), state.player.angle);
    if (!eclipseActive && (state.shields || state.tempShields)) { ctx.strokeStyle = `rgba(110,190,255,${.3 + Math.sin(timestamp / 150) * .12})`; ctx.lineWidth = mobileSize(2 + Math.min(3, state.tempShields)); ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(9 + state.tempShields * 2), 0, Math.PI * 2); ctx.stroke(); }
    if (!eclipseActive) for (let i = 0; i < state.drones; i++) { const a = timestamp / 800 + i * Math.PI * 2 / state.drones; ctx.fillStyle = '#eafaff'; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12); ctx.beginPath(); ctx.arc(state.player.x + Math.cos(a) * mobileSize(39), state.player.y + Math.sin(a) * mobileSize(39), mobileSize(5), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
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
    const count = ui.favorite.querySelector('[data-favorite-count]');
    if (icon) icon.textContent = active ? '♥' : '♡'; if (label) label.textContent = active ? 'Favoritado' : 'Favoritar';
    if (count) count.textContent = String(favorites.size);
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
    const hardwareInputDetected = document.documentElement.classList.contains('cv-hardware-input-detected');
    const isEclipse = currentSkin().id === 'eclipse';
    const isSaurion = currentSkin().id === 'saurion';
    const abilityInstruction = isEclipse ? 'E abre o Domínio · Q ativa a Isca Umbral' : isSaurion ? 'E libera o Rugido de Garras · Q com 3 cargas chama raptores que perseguem inimigos marcados' : 'ativa a habilidade';
    if (ui.controlHint) ui.controlHint.textContent = state.controlMode === 'keys'
      ? hardwareInputDetected ? 'WASD ou setas movem · ' + abilityInstruction + ' · disparo automático.' : 'Disparo automático · controles configuráveis.'
      : state.controlMode === 'touch' ? 'Toque e arraste na arena para mover · ' + (isEclipse || isSaurion ? 'botões das habilidades E e Q.' : 'use o botão da habilidade.')
        : 'Toque em qualquer ponto da arena e arraste o analógico translúcido · solte para ocultar.' + (isEclipse || isSaurion ? ' Botões E e Q ativam as habilidades.' : '');
  }
  function createDeviceIndicators() {
    [ui.missionSetupModal, ui.settingsModal].forEach((modal) => {
      const note = modal?.querySelector('.starfall-performance-note');
      if (!note) return;
      const label = document.createElement('span');
      label.className = 'starfall-settings-label';
      label.textContent = 'Dispositivo';
      const picker = document.createElement('div');
      picker.className = 'starfall-device-picker';
      picker.setAttribute('role', 'group');
      picker.setAttribute('aria-label', 'Tipo de dispositivo detectado');
      [['mobile', '📱 Celular'], ['desktop', '🖥 Computador']].forEach(([type, name]) => {
        const indicator = document.createElement('span');
        indicator.dataset.deviceType = type;
        indicator.textContent = name;
        indicator.setAttribute('aria-current', 'false');
        picker.append(indicator);
      });
      const help = document.createElement('small');
      help.className = 'starfall-performance-note';
      help.textContent = 'Detectado automaticamente; a escala reduzida é aplicada somente em celulares.';
      note.after(label, picker, help);
    });
    ui.deviceTypeIndicators = Array.from(document.querySelectorAll('[data-device-type]'));
  }
  function updateDeviceTypeUI() {
    const selectedType = state.mobileSizing ? 'mobile' : 'desktop';
    ui.deviceTypeIndicators.forEach((indicator) => {
      const selected = indicator.dataset.deviceType === selectedType;
      indicator.classList.toggle('is-detected', selected);
      indicator.setAttribute('aria-current', String(selected));
      indicator.textContent = (indicator.dataset.deviceType === 'mobile' ? '📱 Celular' : '🖥 Computador') + (selected ? ' · Detectado' : '');
    });
  }
  function createAdminTools() {
    const card = ui.settingsModal?.querySelector('.starfall-modal-card');
    const readyButton = card?.querySelector('.button-primary[data-close-settings]');
    if (!card || !readyButton) return;
    const section = document.createElement('section');
    section.className = 'starfall-admin-tools';
    section.hidden = true;
    section.setAttribute('aria-label', 'Ferramentas de teste para desenvolvedores');
    const kicker = document.createElement('p');
    kicker.className = 'starfall-kicker';
    kicker.textContent = 'ADMIN ABUSE · TESTES';
    const title = document.createElement('h3');
    title.textContent = 'Ferramentas da missão';
    const note = document.createElement('small');
    note.className = 'starfall-performance-note';
    note.textContent = 'Pause e use os botões, ou pressione F durante a missão para limpar a onda. Indisponível no Desafio Diário.';
    const clearWave = document.createElement('button');
    clearWave.type = 'button';
    clearWave.className = 'button button-secondary';
    clearWave.textContent = '✹ Eliminar inimigos e avançar onda';
    clearWave.addEventListener('click', clearCurrentWaveForAdmin);
    const toggleBuffs = document.createElement('button');
    toggleBuffs.type = 'button';
    toggleBuffs.className = 'button button-secondary';
    toggleBuffs.addEventListener('click', toggleAdminBuffs);
    const toggleCooldown = document.createElement('button');
    toggleCooldown.type = 'button';
    toggleCooldown.className = 'button button-secondary';
    toggleCooldown.addEventListener('click', toggleAdminCooldown);
    section.append(kicker, title, note, clearWave, toggleBuffs, toggleCooldown);
    card.insertBefore(section, readyButton);
    ui.adminTools = section;
    ui.adminClearWave = clearWave;
    ui.adminToggleBuffs = toggleBuffs;
    ui.adminToggleCooldown = toggleCooldown;
    updateAdminToolsUI();
  }
  function updateAdminToolsUI() {
    if (!ui.adminTools) return;
    const isAllowed = isDeveloperProfile() && !state.dailyChallenge;
    ui.adminTools.hidden = !isAllowed;
    if (!isAllowed) return;
    const missionPaused = state.mode === 'paused';
    const missionActive = missionPaused || state.mode === 'upgrade';
    if (ui.adminClearWave) ui.adminClearWave.disabled = !missionPaused;
    if (ui.adminToggleBuffs) {
      ui.adminToggleBuffs.disabled = !missionActive;
      ui.adminToggleBuffs.textContent = state.adminBuffsActive ? '− Remover todos os buffs' : '＋ Dar todos os buffs';
      ui.adminToggleBuffs.setAttribute('aria-pressed', String(state.adminBuffsActive));
    }
    if (ui.adminToggleCooldown) {
      ui.adminToggleCooldown.disabled = !missionActive;
      ui.adminToggleCooldown.textContent = state.adminNoCooldown ? '◷ Ativar recarga das habilidades' : '∞ Desativar recarga das habilidades';
      ui.adminToggleCooldown.setAttribute('aria-pressed', String(state.adminNoCooldown));
    }
  }
  function clearCurrentWaveForAdmin() {
    if (!isDeveloperProfile() || state.dailyChallenge || !['playing', 'paused'].includes(state.mode)) return;
    if (state.mode === 'playing') {
      cancelAnimationFrame(state.raf);
      state.keys.clear(); state.pointer.active = false; releaseAnalog();
    }
    state.enemySpawn = 0;
    state.waveKills = state.enemiesRequired;
    state.miniBossTimer = 0;
    state.miniBossSpawned = true;
    state.bossSpawned = true;
    state.enemies.slice().forEach((enemy) => defeatEnemy(enemy, true));
    state.enemies = [];
    state.enemyBullets = [];
    state.bullets = [];
    state.waveKills = state.enemiesRequired;
    if (ui.settingsModal) ui.settingsModal.hidden = true;
    syncAudioVisibility();
    toast('ONDA LIMPA · ESCOLHA UMA MELHORIA');
    openUpgrade();
  }
  function removeAllBuffs() {
    state.upgrades = {};
    state.player.damage = 1;
    state.player.speed = 260;
    state.player.fireRate = .34;
    state.player.spread = 1;
    state.maxLives = 6;
    state.lives = Math.min(state.lives, 3);
    state.shields = 0;
    state.tempShields = 0;
    state.abilityCooldown = 0;
    state.abilityBaseCooldown = currentSkin().cooldown;
    state.abilityPower = 1;
    state.slowTime = 0;
    state.scoreMultiplier = 1;
    state.magnet = 105;
    state.pierce = 0;
    state.critChance = 0;
    state.armorChance = 0;
    state.regenLevel = 0;
    state.regenTimer = 24;
    state.drones = 0;
    state.droneCooldown = 0;
    state.blastRadius = 0;
    state.bossDamageBonus = 0;
    state.bonusShots = 0;
    state.lowHullBoost = 0;
    state.salvageHeal = 0;
    state.singularityRadius = 235;
    state.singularityDuration = 6.5;
    state.reflectTime = 0;
    state.reflectContacts = new Set();
    state.reflectDamageBonus = 0;
    state.reflectDurationBonus = 0;
    state.eclipseDecoy = null;
    state.eclipseDecoyCooldown = 0;
    state.dinoRoarBonus = 0;
    state.dinoRoarRangeBonus = 0;
    state.dinoStampedeCharges = 3;
    state.dinoStampedeRecharge = 0;
    state.dinoStampedeExtra = 0;
    state.dinoStampedeDamageBonus = 0;
    state.eclipseTime = 0;
    state.eclipsePhase = 'idle';
    state.eclipseHitCooldowns = [];
    state.eclipseCutTimer = 0;
    state.eclipseDurationBonus = 0;
    state.eclipseCutBonus = 0;
    state.eclipseCutDamage = 0;
    state.eclipseImpactCooldown = 0;
    state.endlessDamage = 0;
    state.endlessSpeed = 0;
    state.effects = [];
    state.bullets = [];
    state.adminBuffsActive = false;
    window.CV_GAME_AUDIO?.stopSpecialMusic();
    if (ui.eclipseVideo) ui.eclipseVideo.pause();
    if (ui.eclipseCutscene) ui.eclipseCutscene.hidden = true;
  }
  function toggleAdminBuffs() {
    if (!isDeveloperProfile() || state.dailyChallenge || !['paused', 'upgrade'].includes(state.mode)) return;
    if (state.adminBuffsActive) removeAllBuffs();
    else grantAllUpgrades();
    updateHud();
    updateAbilityButton();
    updateAdminToolsUI();
    toast(state.adminBuffsActive ? 'TODOS OS BUFFS ATIVADOS' : 'BUFFS REMOVIDOS');
  }
  function toggleAdminCooldown() {
    if (!isDeveloperProfile() || state.dailyChallenge || !['paused', 'upgrade'].includes(state.mode)) return;
    state.adminNoCooldown = !state.adminNoCooldown;
    if (state.adminNoCooldown) state.abilityCooldown = 0;
    updateAbilityButton();
    updateAdminToolsUI();
    toast(state.adminNoCooldown ? 'HABILIDADES SEM RECARGA' : 'RECARGA DAS HABILIDADES ATIVADA');
  }
  window.addEventListener('cv-games-profile-change', updateAdminToolsUI);
  function refreshDeviceSizing() {
    state.mobileSizing = detectMobileDevice();
    updateDeviceTypeUI();
    resize();
  }
  window.addEventListener('cv-input-capabilities-change', updateControlUI);
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
    refreshDeviceSizing();
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
    window.CV_GAME_AUDIO?.stopSpecialMusic();
    if (ui.eclipseVideo) { ui.eclipseVideo.pause(); ui.eclipseVideo.removeAttribute('src'); ui.eclipseVideo.load(); }
    if (ui.eclipseCutscene) { ui.eclipseCutscene.hidden = true; ui.eclipseCutscene.setAttribute('aria-hidden', 'true'); }
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
    updateAdminToolsUI();
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
  ui.eclipseSkipCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    try { localStorage.setItem(eclipseSkipVideoKey, String(checkbox.checked)); } catch { /* A preferência vale para esta sessão. */ }
    ui.eclipseSkipCheckboxes.forEach((item) => { item.checked = checkbox.checked; });
  }));
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
  ui.eclipseQ?.addEventListener('click', activateSecondaryAbility);
  ui.favorite?.addEventListener('click', toggleFavorite);
  window.addEventListener('keydown', (event) => {
    if (state.eclipsePhase === 'cinematic') { event.preventDefault(); return; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.code === 'KeyF' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && isDeveloperProfile() && !state.dailyChallenge && ['playing', 'paused'].includes(state.mode) && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) {
      event.preventDefault(); clearCurrentWaveForAdmin(); return;
    }
    if (event.code === 'Escape' && ui.missionSetupModal && !ui.missionSetupModal.hidden) { closeMissionSetup(); return; }
    if (event.code === 'Escape' && ui.exitModal && !ui.exitModal.hidden) { closeExitConfirmation(); return; }
    if (event.code === 'Escape' && ui.settingsModal && !ui.settingsModal.hidden) { closeSettings(); return; }
    if (event.code === 'Escape' && ui.shipModal && !ui.shipModal.hidden) { closeShips(); return; }
    if (event.code === 'Escape' && ui.achievementsModal && !ui.achievementsModal.hidden) { closeAchievements(); return; }
    if (event.code === 'Escape' && ui.dailySummaryModal && !ui.dailySummaryModal.hidden) { closeDailySummary(); return; }
    if (event.code === 'Escape' || event.code === 'KeyP') { if (state.mode === 'playing' || state.mode === 'paused') pauseGame(); }
    if (event.code === 'Enter' && ['intro', 'gameover'].includes(state.mode) && (!ui.shipModal || ui.shipModal.hidden) && !event.target.closest('button,[role="dialog"],input,select,textarea')) openMissionSetup();
    if (event.code === 'KeyE' && !event.repeat) activateAbility();
    if (event.code === 'KeyQ' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) activateSecondaryAbility();
    if (state.controlMode === 'keys') state.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => { state.keys.delete(event.code); });
  window.addEventListener('blur', () => { state.keys.clear(); state.pointer.active = false; releaseAnalog(); if (state.mode === 'playing' && state.eclipsePhase !== 'cinematic') pauseGame(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.eclipsePhase === 'cinematic' && ui.eclipseVideo?.paused) ui.eclipseVideo.play()?.catch?.(() => {});
  });
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
  createDeviceIndicators(); createAdminTools(); updateDeviceTypeUI(); renderSkinPicker(); updateEquippedShip(); updateControlUI(); updatePerformanceModeUI(); updateHud(); updateFavorite(); resize(); setMode('intro'); draw(0); refreshLeaderboard();
})();
