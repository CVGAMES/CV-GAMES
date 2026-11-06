(function () {
  'use strict';

  const gameId = 'cv-starfall';
  const bestKey = 'cv-games-cv-starfall-best';
  const bestWaveKey = 'cv-games-cv-starfall-best-wave';
  const setupCompleteKey = 'cv-games-cv-starfall-setup-complete';
  const prismAbilityChoiceKey = 'cv-games-cv-starfall-prism-choice';
  const controlModeKey = 'cv-games-cv-starfall-control';
  const performanceModeKey = 'cv-games-cv-starfall-performance';
  const eclipseSkipVideoKey = 'cv-games-cv-starfall-eclipse-skip-video';
  const auroraDamageCounterKey = 'cv-games-cv-starfall-aurora-damage-counter';
  const secretShipUnlockKey = 'cv-games-cv-starfall-secret-ships-v1';
  const secretShipPasscode = '12345678';
  const prismaShipPasscode = 'cvgames.com.br';
  const dailyBestPrefix = 'cv-games-cv-starfall-daily:';
  const achievementStoragePrefix = 'cv-games-cv-starfall-achievements:';
  const nicknameSettingsPrefix = 'cv-games-cv-starfall-settings-v1:';
  const missionCheckpointPrefix = 'cv-games-cv-starfall-checkpoint-v1:';
  const nicknameRankBestWavePrefix = 'cv-games-cv-starfall-rank-best-wave:';
  const nicknameCompletedWavePrefix = 'cv-games-cv-starfall-completed-wave:';
  const nicknameSettingsMigrationKey = 'cv-games-cv-starfall-settings-migrated-v2';
  const defaultDamageCounterPosition = Object.freeze({ x: .89, y: .53 });
  const defaultNicknameSettings = Object.freeze({ damageCounterEnabled: true, eclipseSkipVideo: false });
  const favoritesKey = 'cv-games-favorites';
  const eclipseSprite = new Image();
  eclipseSprite.src = new URL('eclipse-ship.png', document.baseURI).href;
  const saurionRaptorSprite = new Image();
  saurionRaptorSprite.src = new URL('saurion-raptor-skill.png', document.baseURI).href;
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
    zone: $('[data-zone]'), timer: $('[data-timer]'), upgrade: $('[data-upgrade]'), upgradeOptions: $('[data-upgrade-options]'), pause: $('[data-pause]'), pauseIcon: $('[data-pause-icon]'), pauseLabel: $('[data-pause-label]'), abilityWrap: $('.starfall-primary-ability-wrap'), ability: $('[data-ability]'), abilityCooldown: $('[data-ability-cooldown]'), eclipseQWrap: $('[data-eclipse-q-wrap]'), eclipseQ: $('[data-eclipse-q]'), eclipseQCooldown: $('[data-eclipse-q-cooldown]'), panel: $('[data-fullscreen-root]'), hud: $('.starfall-hud'), status: $('[data-status]'), toast: $('[data-toast]'), favorite: $('[data-game-favorite]'),
    skinPicker: $('[data-skin-picker]'), equippedShip: $('[data-equipped-ship]'), secretUnlockDialog: $('[data-secret-unlock-dialog]'), secretUnlockForm: $('[data-secret-unlock-form]'), secretUnlockInput: $('[data-secret-unlock-input]'), secretUnlockError: $('[data-secret-unlock-error]'), eclipseSkipOptions: Array.from(document.querySelectorAll('[data-eclipse-skip-option]')), eclipseSkipCheckboxes: Array.from(document.querySelectorAll('[data-eclipse-skip-video]')),
    shipModal: $('[data-ship-modal]'), shipDetailsDialog: $('[data-ship-details-dialog]'), shipDetailsKicker: $('[data-ship-details-kicker]'), shipDetailsTitle: $('[data-ship-details-title]'), shipDetailsSummary: $('[data-ship-details-summary]'), shipDetailsList: $('[data-ship-details-list]'), shipDetailsCooldowns: $('[data-ship-details-cooldowns]'), settingsModal: $('[data-settings-modal]'),
    damageCounterOptions: $('[data-damage-counter-option]'), damageCounterCheckbox: $('[data-damage-counter]'), damageCounterEditor: $('[data-damage-counter-editor]'), editDamageCounter: $('[data-edit-damage-counter]'), saveDamageCounter: $('[data-save-damage-counter]'), cancelDamageCounter: $('[data-cancel-damage-counter]'), settingsSyncStatus: $('[data-settings-sync-status]'), performanceModeButtons: Array.from(document.querySelectorAll('[data-performance-mode]')),
    deviceTypeIndicators: [], adminTools: null, adminClearWave: null, adminToggleBuffs: null, adminToggleCooldown: null, achievementsModal: $('[data-achievements-modal]'), achievementsList: $('[data-achievements-list]'), achievementsCount: $('[data-achievement-count]'), dailyStart: $('[data-start-daily]'), dailyRecord: $('[data-daily-record]'),
    dailySummaryModal: $('[data-daily-summary-modal]'), dailySummaryStart: $('[data-start-daily-again]'), dailySummaryDate: $('[data-daily-summary-date]'), dailySummaryResult: $('[data-daily-summary-result]'), dailySummaryRecord: $('[data-daily-summary-record]'), dailySummaryDetails: $('[data-daily-summary-details]'), runSummary: $('[data-run-summary]'), joystick: $('[data-joystick]'), joystickNub: $('[data-joystick-nub]'), controlHint: $('[data-control-hint]'),
    rankList: $('[data-rank-list]'), rankStatus: $('[data-rank-status]'), rankDialog: $('[data-rank-dialog]'), rankDialogTitle: $('[data-rank-dialog-title]'), rankDialogKicker: $('[data-rank-dialog-kicker]'), rankDialogSummary: $('[data-rank-dialog-summary]'), rankDetailOverview: $('[data-rank-detail-overview]'), rankDetailSections: $('[data-rank-detail-sections]'), authorizedPilots: $('[data-authorized-pilots]'), authorizedPilotList: $('[data-authorized-pilot-list]'), copyAuthorizedPilots: $('[data-copy-authorized-pilots]'), authorizedPilotsStatus: $('[data-authorized-pilots-status]')
  };
  ui.prismWheel = $('[data-prism-wheel]');
  ui.prismRankNotice = $('[data-prism-rank-notice]');
  ui.checkpointModal = $('[data-checkpoint-modal]');
  ui.checkpointSummary = $('[data-checkpoint-summary]');
  ui.prismAbilityList = $('[data-prism-ability-list]');
  ui.prismWheelStatus = $('[data-prism-wheel-status]');
  ui.prismSelectWrap = $('[data-prism-select-wrap]');
  ui.prismSelect = $('[data-prism-select]');
  const skins = [
    { id: 'aurora', name: 'Aurora', color: '#7df7e8', accent: '#bffff5', ability: 'Explosão Nova', abilityShort: 'NOVA', cooldown: 25, cooldownQ: 28, shape: 'classic', description: 'E cria uma explosão ampla. Com Q ativo, a Nova espalha o mesmo dano para os demais inimigos ligados se atingir um deles. Q conecta cinco alvos, ampliáveis até oito; cada vida perdida pela nave causa 2 de dano aos inimigos conectados.' },
    { id: 'aegis', name: 'Aegis', color: '#72bdff', accent: '#c9eaff', ability: 'Barreira Aegis', abilityShort: 'BARREIRA', cooldown: 25, cooldownQ: 30, shape: 'shield', unlockWave: 10, description: 'E cria uma barreira que absorve três impactos. Q invoca Órbitas Sentinelas: fragmentos orbitais interceptam tiros e os convertem em projéteis teleguiados; os fragmentos intactos são lançados contra inimigos ao final.' },
    { id: 'chronos', name: 'Chronos', color: '#c897ff', accent: '#efd5ff', ability: 'Dobra Temporal', abilityShort: 'TEMPO', cooldown: 25, cooldownQ: 28, shape: 'ring', unlockWave: 20, description: 'E desacelera inimigos e projéteis. Q cria Ecos do Futuro: os disparos são repetidos com atraso e dano reduzido.' },
    { id: 'tempest', name: 'Tempestade', color: '#87aaff', accent: '#d5dcff', ability: 'Poço Negro', abilityShort: 'POÇO NEGRO', cooldown: 34, cooldownQ: 28, shape: 'wing', unlockWave: 30, description: 'E dispara um Poço Negro que curva suavemente na direção do movimento da nave. Q libera a Maré Reversa, que causa dano leve, empurra inimigos e desvia tiros próximos; alguns são lançados contra os inimigos. Começa com três cargas, ampliáveis até cinco.' },
    { id: 'flashblade', name: 'Flashblade', color: '#ffc86e', accent: '#fff0b4', ability: 'Corte Flash', abilityShort: 'CORTE', cooldown: 25, cooldownQ: 26, shape: 'blade', unlockWave: 40, description: 'E lança uma lâmina que curva e ricocheteia. Q acelera a nave e cria barreiras cortantes pelo trajeto por 5 segundos.' },
    { id: 'redshift', name: 'Bastião Rubro', color: '#d83a2e', accent: '#ffd06a', ability: 'Escudo de Retorno', abilityShort: 'RETORNO', cooldown: 30, cooldownQ: 28, shape: 'reflector', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'cypher'], description: 'E reflete projéteis. Q cria um Perímetro de Cerco móvel por 6 segundos; inimigos que cruzam os feixes recebem dano.' },
    { id: 'eclipse', name: 'Eclipse', color: '#a879ff', accent: '#e8dcff', ability: 'Expansão de Domínio', abilityShort: 'DOMÍNIO', cooldown: 30, shape: 'eclipse', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'nys'], description: 'E: abre o Domínio Eclipse com cortes por 10 segundos. Q: cria uma Isca Umbral móvel por 4 segundos; ela atrai disparos, tenta desviar e dispara tiros leves e espaçados. Melhorias podem prolongar sua duração.' },
    { id: 'saurion', name: 'Saurion', color: '#42d66e', accent: '#d4ff72', ability: 'Rugido de Garras', abilityShort: 'RUGIDO', cooldown: 28, cooldownQ: 32, shape: 'dino', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'adm', 'yago k'], description: 'E: atordoa uma grande área; três garras leves reaparecem a cada 2 segundos por 15 segundos. Q causa dano extra aos alvos marcados.' },
    { id: 'prisma', name: 'Prisma Real', color: '#59e9f2', accent: '#ffe29a', ability: 'Núcleo Prisma', abilityShort: 'PRISMA', cooldown: 28, cooldownQ: 28, shape: 'prism', secret: true, ownerOnly: true, description: 'Nave secreta da conta educvv. Configure uma habilidade para E e outra para Q no Arquivo de Ecos, aberto pela tecla G. Esta nave não envia resultados ao placar.' }
  ];
  const secondaryAbilityNames = Object.freeze({ aurora:'Elo Estelar', aegis:'Órbitas Sentinelas', chronos:'Ecos do Futuro', tempest:'Maré Reversa', flashblade:'Rastro de Ruptura', redshift:'Perímetro de Cerco', eclipse:'Isca Umbral', saurion:'Estouro da Manada', prisma:'Dobra de Horizonte' });
  const shipAbilityDetails = Object.freeze({
    aurora: { e:'Explosão Nova atinge uma grande área ao redor da nave. Com o Elo Estelar ativo, se a explosão atingir um inimigo ligado, os demais recebem o mesmo dano.', q:'Conecta cinco alvos por 5 segundos, com pulsos a cada 0,78s. Contra um chefe sozinho, concentra os pulsos nele. Cada vida perdida pela nave durante o Elo causa 2 de dano a cada alvo conectado. Melhorias ampliam a conexão para até oito alvos, prolongam a duração até 7s e aumentam o dano dos pulsos para 2,4; a recarga cai de 28s para 22s.' },
    aegis: { e:'A Barreira Aegis absorve três impactos e protege a nave enquanto estiver ativa.', q:'Três sentinelas orbitam por 6 segundos. Cada uma pode interceptar um tiro comum e convertê-lo em um disparo teleguiado. A nave fica protegida; fragmentos que sobrarem atacam os inimigos ao final. Melhorias chegam a 8s, cinco sentinelas e dano 5; a recarga cai de 30s para 24s.' },
    chronos: { e:'A Dobra Temporal desacelera os inimigos e seus projéteis para abrir espaço e facilitar a esquiva.', q:'Ecos repetem os disparos da nave após 0,42s. Melhorias aumentam a duração de 4s para 6s e o dano dos ecos de 40% para 70%; a recarga pode cair de 28s para 22s.' },
    tempest: { e:'O Poço Negro é disparado na direção da nave e curva suavemente conforme ela se move. A singularidade puxa inimigos próximos e causa dano repetido.', q:'A Maré Reversa afasta inimigos, causa dano leve, desvia tiros comuns e redireciona alguns contra os adversários. Também protege a nave por um instante. Começa com três cargas, pode chegar a cinco e recupera uma carga a cada 28s, ou 22s com melhorias.' },
    flashblade: { e:'O Corte Flash lança uma lâmina veloz que persegue alvos, ricocheteia nas bordas e causa dano ao cruzar os inimigos.', q:'A nave acelera em 2,2× por 5 segundos e deixa barreiras de luz no trajeto. Os rastros duram até 7s, ferem e desviam inimigos a cada contato e destroem tiros que os atingem; melhorias prolongam e fortalecem o efeito.' },
    redshift: { e:'O Escudo de Retorno reflete projéteis que atingem a nave durante a proteção. Melhorias aumentam duração e dano e reduzem a recarga.', q:'O Perímetro de Cerco acompanha a nave com feixes cortantes. Inimigos que cruzam as linhas recebem dano. Melhorias ampliam a duração de 6s para 8s e podem reduzir a recarga de 28s para 22s.' },
    eclipse: { e:'A Expansão de Domínio inicia com uma abertura cinematográfica e transforma a arena em um santuário. Os cortes cobrem a área por 10 segundos; a nave fica invulnerável durante o efeito e por alguns segundos ao final.', q:'A Isca Umbral cria uma cópia móvel por cerca de 4 segundos. Ela cruza a arena em velocidade próxima à da nave, um pouco menor; inimigos miram nela enquanto desvia e dispara um tiro leve a cada 0,9 segundo. Esses disparos causam menos dano que os da nave. Melhorias podem prolongar o efeito e melhorar seus desvios.' },
    saurion: { e:'O Rugido de Garras atordoa uma grande área e marca os inimigos. Três cortes leves reaparecem a cada 2 segundos por 15 segundos; os alvos marcados recebem dano extra do Q.', q:'Invoca raptores em até três cargas. Eles perseguem os inimigos, priorizam alvos marcados e causam dano extra. Melhorias fortalecem as investidas e reduzem a recarga de cada carga.' },
    prisma: { e:'O Núcleo Prisma concentra luz diante da nave e libera uma onda de impacto. Inimigos próximos recebem dano e são afastados; chefes resistem parcialmente ao empurrão. Melhorias ampliam o raio, o dano e reduzem a recarga. Você também pode escolher outra habilidade no Arquivo de Ecos.', q:'A Dobra de Horizonte grava a posição da nave por 4 segundos. Ative novamente para retornar ao ponto marcado, ganhar proteção breve e liberar uma onda de chegada que causa dano e desorganiza inimigos próximos. Melhorias ampliam a janela até 6 segundos e fortalecem a onda. O espaço Q também pode receber outra habilidade escolhida.' }
  });
  const shipCodeById = Object.freeze({ aurora:1, aegis:2, chronos:3, tempest:4, flashblade:5, redshift:6, eclipse:7, saurion:8, prisma:9 });
  const shipIdByCode = Object.freeze(Object.fromEntries(Object.entries(shipCodeById).map(([id, code]) => [code, id])));
  let secretShipUnlocks = readSecretShipUnlocks();
  let pendingSecretShipId = null;
  let accountUnlockedShipIds = new Set();
  let accountShipProgressLoaded = false;
  let accountShipWriteChain = Promise.resolve();
  let settingsSyncChain = Promise.resolve();
  let settingsMutationRevision = 0;
  const starfallAchievements = [
    { id: 'first-flight', icon: '🚀', title: 'Primeiro voo', description: 'Comece sua primeira missão.', metric: 'missionsStarted', target: 1, unit: 'missão' },
    { id: 'guardian-hunter', icon: '👾', title: 'Caçador de guardiões', description: 'Derrote um chefe principal.', metric: 'bossesDefeated', target: 1, unit: 'chefe' },
    { id: 'clean-orbit', icon: '🛡️', title: 'Órbita perfeita', description: 'Conclua uma onda sem perder vidas.', metric: 'cleanWaves', target: 1, unit: 'onda limpa' },
    { id: 'daily-pilot', icon: '📅', title: 'Piloto diário', description: 'Termine um Desafio Diário.', metric: 'dailyRunsFinished', target: 1, unit: 'desafio' },
    { id: 'planet-hopper', icon: '🪐', title: 'Viajante galáctico', description: 'Alcance a onda 15.', metric: 'bestWaveReached', target: 15, unit: 'ondas' },
    { id: 'star-legend', icon: '🌌', title: 'Lenda das estrelas', description: 'Alcance a onda 50.', metric: 'bestWaveReached', target: 50, unit: 'ondas' },
    { id: 'ability-collector', icon: '✨', title: 'Mestre das naves', description: 'Use a habilidade de cada nave disponível para este perfil.', metric: 'abilityShips', target: abilityShipsTarget(), unit: 'naves' }
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
  const mobileEntityScale = .66;
  const particleLimit = () => state.performanceMode === 'light' ? 110 : state.mobileSizing ? 240 : Infinity;
  const initialNicknameSettings = readNicknameSettings();
  const state = {
    auroraLink: null, auroraLinkCooldown: 0, auroraLinkDurationBonus: 0, auroraLinkTargetBonus: 0, auroraLinkDamageBonus: 0,
    damageCounterEnabled: initialNicknameSettings.damageCounterEnabled, damageCounterPosition: initialNicknameSettings.damageCounterPosition, damageCounterTotal: 0, damageCounterLastHit: 0, damageCounterIdle: 0, damageCounterPopups: [], damageCounterEditing: false, damageCounterDragging: false, damageCounterEditStart: null, damageCounterEditorHadMenu: false,
    eclipseSkipVideoEnabled: initialNicknameSettings.eclipseSkipVideo,
    shipEWasCooling: false, shipQWasCooling: false, shipQChargeCount: null,
    prismAbilityChoices: { e:'aurora:e', q:'aurora:q' }, prismAbilitySlot:'e', prismDispatchSkinId:'', prismDispatchSlot:'', prismQCooldown:0, prismHorizonAnchor:null, prismHorizonWindowBonus:0, prismHorizonDamageBonus:0, prismCoreRangeBonus:0, prismCoreDamageBonus:0, prismCooldownBonus:0, prismWheelWasPlaying:false,
    aegisOrbit: null, aegisOrbitCooldown: 0, aegisOrbitDurationBonus: 0, aegisOrbitCountBonus: 0, aegisOrbitDamageBonus: 0,
    tempestTideCharges: 3, tempestTideChargeBonus: 0, tempestTideDamageBonus: 0, tempestTideSweepBonus: 0,
    chronosEcho: null, chronosEchoQueue: [], chronosEchoCooldown: 0, chronosEchoDurationBonus: 0, chronosEchoDamageBonus: 0,
    mode: 'intro', lastTime: 0, raf: 0, width: 800, height: 560, dpr: 1,
    score: 0, best: readBest(), bestCompletedWave: readBestWave(), wave: 1, lives: 3, maxLives: 6, shields: 0, tempShields: 0, invulnerable: 0, elapsed: 0,
    shotCooldown: 0, waveGrace: 0, enemySpawn: 0, powerSpawn: 0, waveKills: 0,
    enemiesRequired: 6, bossWave: false, bossSpawned: false, miniBossTimer: 0, miniBossSpawned: false,
    keys: new Set(), bullets: [], enemyBullets: [], enemies: [], particles: [], pickups: [], stars: [], effects: [],
    selectedSkin: readSkin(), controlMode: adaptControlMode(initialNicknameSettings.controlMode), savedControlMode: initialNicknameSettings.controlMode, performanceMode: initialNicknameSettings.performanceMode, preferencesConfigured: initialNicknameSettings.setupComplete, mobileSizing: detectedMobileDevice, upgrades: {}, abilityCooldown: 0, abilityBaseCooldown: 0, abilityPower: 1, adminNoCooldown: false, adminBuffsActive: false,
    slowTime: 0, lastBossType: '', magnet: 105, pierce: 0, critChance: 0, armorChance: 0, regenLevel: 0, regenTimer: 24, drones: 0, droneCooldown: 0,
    blastRadius: 0, bossDamageBonus: 0, bonusShots: 0, lowHullBoost: 0, salvageHeal: 0, singularityRadius: 235, singularityDuration: 6.5, tempestTideCooldown: 0, tempestTideRadiusBonus: 0, tempestTideForceBonus: 0, reflectTime: 0, reflectContacts: new Set(), reflectDamageBonus: 0, reflectDurationBonus: 0, redshiftPerimeter: null, redshiftPerimeterCooldown: 0, redshiftPerimeterDurationBonus: 0, redshiftPerimeterDamageBonus: 0, redshiftPerimeterRangeBonus: 0, flashTrail: null, flashTrailCooldown: 0, flashTrailDurationBonus: 0, flashTrailDamageBonus: 0, flashTrailDensity: 0, flashTrailContacts: new Set(), eclipseTime: 0, eclipsePhase: 'idle', eclipseCutTimer: 0, eclipseDurationBonus: 0, eclipseCutBonus: 0, eclipseCutDamage: 0, eclipseHitCooldowns: [], eclipseImpactCooldown: 0, eclipseDecoy: null, eclipseDecoyCooldown: 0, eclipseDecoyAI: 0, eclipseDecoyDurationBonus: 0, eclipseDecoyChaos: 0, dinoRoarBonus: 0, dinoRoarRangeBonus: 0, dinoStampedeCharges: 3, dinoStampedeRecharge: 0, dinoStampedeExtra: 0, dinoStampedeDamageBonus: 0, endlessDamage: 0, endlessSpeed: 0,
    player: { x: 400, y: 460, radius: detectedMobileDevice ? 13 * mobileEntityScale : 13, speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, moveAngle: -Math.PI / 2, color: '#7df7e8' },
    pointer: { active: false, pointerId: null, x: 0, y: 0 }, analog: { active: false, x: 0, y: 0 },
    dailyChallenge: false, pendingDailyChallenge: false, challengeDate: '', dailyBestScore: 0, skinBeforeDaily: '', randomStreams: null, exitReturnFocus: null, exitWasPlaying: false,
    waveDamageTaken: false, achievementProgress: null
  };
  try {
    const savedPrismChoice = localStorage.getItem(prismAbilityChoiceKey);
    if (savedPrismChoice) {
      let parsed; try { parsed = JSON.parse(savedPrismChoice); } catch { parsed = savedPrismChoice; }
      const valid = (choice) => { const [shipId,key] = String(choice || '').split(':'); return skins.some((skin) => skin.id === shipId) && ['e','q'].includes(key); };
      if (parsed && typeof parsed === 'object') {
        if (valid(parsed.e)) state.prismAbilityChoices.e = parsed.e;
        if (valid(parsed.q)) state.prismAbilityChoices.q = parsed.q;
      } else {
        const [shipId,key] = String(parsed || savedPrismChoice).split(':');
        if (skins.some((skin) => skin.id === shipId) && ['e','q'].includes(key)) state.prismAbilityChoices[key] = shipId + ':' + key;
      }
    }
  } catch { /* A escolha padrão continua disponível. */ }
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
    ,{ id:'tempestTideRadius', icon:'◉', name:'Maré Ampliada', description:'Aumenta o alcance da Maré Reversa em 30 unidades.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideRadius')<3, apply:()=>{state.tempestTideRadiusBonus=Math.min(90,state.tempestTideRadiusBonus+30);} }
    ,{ id:'tempestTideForce', icon:'↗', name:'Repulsão Vetorial', description:'Aumenta o impulso que afasta os inimigos. Chefes recebem um empurrão menor.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideForce')<3, apply:()=>{state.tempestTideForceBonus=Math.min(240,state.tempestTideForceBonus+80);} }
    ,{ id:'tempestTideCapacity', icon:'✦', name:'Reservatório de Maré', description:'Adiciona uma carga à Maré Reversa, até cinco cargas.', max:2, available:()=>currentSkin().id==='tempest'&&state.tempestTideChargeBonus<2, apply:()=>{state.tempestTideChargeBonus=Math.min(2,state.tempestTideChargeBonus+1);state.tempestTideCharges=Math.min(3+state.tempestTideChargeBonus,state.tempestTideCharges+1);} }
    ,{ id:'tempestTideDamage', icon:'✹', name:'Ruptura de Pressão', description:'Aumenta o dano leve do pulso em 1 por nível. Chefes recebem dano reduzido.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideDamage')<3, apply:()=>{state.tempestTideDamageBonus=Math.min(3,state.tempestTideDamageBonus+1);} }
    ,{ id:'tempestTideSweep', icon:'〰', name:'Corrente Defletora', description:'Prolonga a curva defensiva e o rastreamento dos projéteis de contra-ataque.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideSweep')<3, apply:()=>{state.tempestTideSweepBonus=Math.min(.36,state.tempestTideSweepBonus+.12);} }
    ,{ id:'tempestTideCooldown', icon:'⟳', name:'Ressonância de Maré', description:'Reduz em 2 segundos o tempo para recuperar uma carga, de 28 até 22 segundos.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideCooldown')<3, apply:()=>{state.tempestTideCooldown=Math.max(0,state.tempestTideCooldown-2);} }
    ,{ id:'chronosEchoDuration', icon:'◷', name:'Janela Estendida', description:'Prolonga os Ecos do Futuro em 1 segundo, até 6 segundos.', max:2, available:()=>currentSkin().id==='chronos'&&state.chronosEchoDurationBonus<2, apply:()=>{state.chronosEchoDurationBonus=Math.min(2,state.chronosEchoDurationBonus+1);} }
    ,{ id:'chronosEchoDamage', icon:'✦', name:'Ressonância Duplicada', description:'Aumenta o dano dos ecos em 10 pontos percentuais, de 40% até 70%.', max:3, available:()=>currentSkin().id==='chronos'&&state.chronosEchoDamageBonus<.3, apply:()=>{state.chronosEchoDamageBonus=Math.min(.3,state.chronosEchoDamageBonus+.1);} }
    ,{ id:'chronosEchoCooldown', icon:'⟳', name:'Compasso Acelerado', description:'Reduz em 2 segundos a recarga do Q, de 28 até 22 segundos.', max:3, available:()=>currentSkin().id==='chronos'&&upgradeLevel('chronosEchoCooldown')<3, apply:()=>{state.chronosEchoCooldown=Math.max(0,state.chronosEchoCooldown-2);} }
    ,{ id:'aegisOrbitDuration', icon:'◷', name:'Vigília Prolongada', description:'Prolonga as Órbitas Sentinelas em 1 segundo, até 8 segundos.', max:2, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitDurationBonus<2, apply:()=>{state.aegisOrbitDurationBonus=Math.min(2,state.aegisOrbitDurationBonus+1);} }
    ,{ id:'aegisOrbitCount', icon:'✦', name:'Fragmentos Extras', description:'Invoca mais um fragmento sentinela, até cinco.', max:2, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitCountBonus<2, apply:()=>{state.aegisOrbitCountBonus=Math.min(2,state.aegisOrbitCountBonus+1);} }
    ,{ id:'aegisOrbitDamage', icon:'☄', name:'Núcleo de Retorno', description:'Aumenta em 1 o dano dos projéteis convertidos, de 2 até 5.', max:3, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitDamageBonus<3, apply:()=>{state.aegisOrbitDamageBonus=Math.min(3,state.aegisOrbitDamageBonus+1);} }
    ,{ id:'aegisOrbitCooldown', icon:'⟳', name:'Ciclo Guardião', description:'Reduz em 2 segundos a recarga do Q, de 30 até 24 segundos.', max:3, available:()=>currentSkin().id==='aegis'&&upgradeLevel('aegisOrbitCooldown')<3, apply:()=>{state.aegisOrbitCooldown=Math.max(0,state.aegisOrbitCooldown-2);} }
    ,{ id:'auroraLinkDuration', icon:'◷', name:'Aurora Duradoura', description:'Prolonga o Elo Estelar em 1 segundo, até 7 segundos.', max:2, available:()=>currentSkin().id==='aurora'&&state.auroraLinkDurationBonus<2, apply:()=>{state.auroraLinkDurationBonus=Math.min(2,state.auroraLinkDurationBonus+1);} }
    ,{ id:'auroraLinkTargets', icon:'✧', name:'Constelação Ampliada', description:'Adiciona um alvo aos saltos do Elo Estelar, até oito inimigos.', max:3, available:()=>currentSkin().id==='aurora'&&state.auroraLinkTargetBonus<3, apply:()=>{state.auroraLinkTargetBonus=Math.min(3,state.auroraLinkTargetBonus+1);} }
    ,{ id:'auroraLinkDamage', icon:'☄', name:'Fótons Intensos', description:'Aumenta em 0,4 o dano de cada pulso do Elo Estelar.', max:3, available:()=>currentSkin().id==='aurora'&&state.auroraLinkDamageBonus<1.2, apply:()=>{state.auroraLinkDamageBonus=Math.min(1.2,state.auroraLinkDamageBonus+.4);} }
    ,{ id:'auroraLinkCooldown', icon:'⟳', name:'Ressonância Boreal', description:'Reduz em 2 segundos a recarga do Q, de 28 até 22 segundos.', max:3, available:()=>currentSkin().id==='aurora'&&upgradeLevel('auroraLinkCooldown')<3, apply:()=>{state.auroraLinkCooldown=Math.max(0,state.auroraLinkCooldown-2);} }
    ,{ id:'returnCore', icon:'⟲', name:'Núcleo de contra-ataque', description:'Aumenta o dano, prolonga o escudo refletor e reduz sua recarga.', max:4, available:()=>currentSkin().id==='redshift'&&upgradeLevel('returnCore')<4, apply:()=>{state.reflectDamageBonus=Math.min(.9,state.reflectDamageBonus+.23);state.reflectDurationBonus=Math.min(2,state.reflectDurationBonus+.5);state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1.25);} }
    ,{ id:'redshiftPerimeterDuration', icon:'◷', name:'Cerco Prolongado', description:'Aumenta em 1 segundo a duração do Perímetro de Cerco, até 8 segundos.', max:2, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterDurationBonus<2, apply:()=>{state.redshiftPerimeterDurationBonus=Math.min(2,state.redshiftPerimeterDurationBonus+1);} }
    ,{ id:'redshiftPerimeterDamage', icon:'✹', name:'Fios Cortantes', description:'Aumenta em 1,5 o dano causado quando um inimigo cruza os feixes.', max:3, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterDamageBonus<4.5, apply:()=>{state.redshiftPerimeterDamageBonus=Math.min(4.5,state.redshiftPerimeterDamageBonus+1.5);} }
    ,{ id:'redshiftPerimeterRange', icon:'△', name:'Âncoras Expansivas', description:'Amplia o triângulo do perímetro em 15 unidades por nível.', max:3, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterRangeBonus<45, apply:()=>{state.redshiftPerimeterRangeBonus=Math.min(45,state.redshiftPerimeterRangeBonus+15);} }
    ,{ id:'redshiftPerimeterCooldown', icon:'⟳', name:'Ressonância Rubra', description:'Reduz em 2 segundos a recarga do Q, até 22 segundos.', max:3, available:()=>currentSkin().id==='redshift'&&upgradeLevel('redshiftPerimeterCooldown')<3, apply:()=>{state.redshiftPerimeterCooldown=Math.max(0,state.redshiftPerimeterCooldown-2);} }
    ,{ id:'flashTrailDuration', icon:'◷', name:'Rastro Persistente', description:'Aumenta em 1 segundo a duração dos rastros, até 7 segundos.', max:2, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDurationBonus<2, apply:()=>{state.flashTrailDurationBonus=Math.min(2,state.flashTrailDurationBonus+1);} }
    ,{ id:'flashTrailDamage', icon:'✦', name:'Fio Residual', description:'Aumenta em 0,7 o dano de cada corte deixado no caminho.', max:3, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDamageBonus<2.1, apply:()=>{state.flashTrailDamageBonus=Math.min(2.1,state.flashTrailDamageBonus+.7);} }
    ,{ id:'flashTrailDensity', icon:'〰', name:'Passagem Dupla', description:'Deixa rastros mais próximos e aumenta levemente a largura dos cortes.', max:3, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDensity<3, apply:()=>{state.flashTrailDensity=Math.min(3,state.flashTrailDensity+1);} }
    ,{ id:'flashTrailCooldown', icon:'⟳', name:'Cadência Vetorial', description:'Reduz em 2 segundos a recarga do Q, até 22 segundos.', max:2, available:()=>currentSkin().id==='flashblade'&&upgradeLevel('flashTrailCooldown')<2, apply:()=>{state.flashTrailCooldown=Math.max(0,state.flashTrailCooldown-2);} }
    ,{ id:'eclipseVeil', icon:'✧', name:'Manto de eclipse', description:'Prolonga a sequência e amplia o alcance dos cortes.', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseVeil')<4, apply:()=>{state.eclipseDurationBonus=Math.min(2.2,state.eclipseDurationBonus+.55);state.eclipseCutBonus=Math.min(36,state.eclipseCutBonus+9);} }
    ,{ id:'eclipseCooldown', icon:'◷', name:'Ressonador do domínio', description:'Reduz a recarga da Eclipse em 1 segundo, até o mínimo de 25 segundos.', max:5, available:()=>currentSkin().id==='eclipse'&&state.abilityBaseCooldown>25, apply:()=>{state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1);state.abilityCooldown=Math.max(0,state.abilityCooldown-1);} }
    ,{ id:'eclipseDamage', icon:'⚔', name:'Fio do domínio', description:'Aumenta o dano de cada corte em 0,25 (até +1,00).', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseDamage')<4, apply:()=>{state.eclipseCutDamage=Math.min(1,state.eclipseCutDamage+.25);} }
    ,{ id:'eclipseDecoyAI', icon:'◉', name:'Instinto da Isca', description:'A Isca Umbral percebe projéteis mais cedo e desvia com mais agilidade.', max:4, available:()=>currentSkin().id==='eclipse'&&state.eclipseDecoyAI<4, apply:()=>{state.eclipseDecoyAI=Math.min(4,state.eclipseDecoyAI+1);} }
    ,{ id:'eclipseDecoyDuration', icon:'◷', name:'Eco Persistente', description:'Aumenta em 1 segundo a duração da Isca Umbral, até 6 segundos.', max:2, available:()=>currentSkin().id==='eclipse'&&state.eclipseDecoyDurationBonus<2, apply:()=>{state.eclipseDecoyDurationBonus=Math.min(2,state.eclipseDecoyDurationBonus+1);} }
    ,{ id:'eclipseDecoyChaos', icon:'⤨', name:'Trajetória Caótica', description:'A Isca Umbral muda de direção com mais frequência e em ângulos mais imprevisíveis.', max:3, available:()=>currentSkin().id==='eclipse'&&state.eclipseDecoyChaos<3, apply:()=>{state.eclipseDecoyChaos=Math.min(3,state.eclipseDecoyChaos+1);} }
    ,{ id:'dinoFangs', icon:'〰', name:'Ressonância jurássica', description:'Aumenta o dano das garras e o alcance do Rugido de Garras.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoFangs')<4, apply:()=>{state.dinoRoarBonus+=4;state.dinoRoarRangeBonus+=18;} }
    ,{ id:'dinoStampede', icon:'🐾', name:'Manada ancestral', description:'Adiciona um raptor ao Estouro da Manada e fortalece a investida.', max:2, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoStampede')<2, apply:()=>{state.dinoStampedeExtra+=1;state.dinoStampedeDamageBonus+=2.5;} }
    ,{ id:'dinoResonance', icon:'◷', name:'Ressonância fóssil', description:'Reduz em 2 segundos o intervalo de recarga entre as cargas de Q, até 24 segundos.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoResonance')<4, apply:()=>{state.dinoStampedeRecharge=Math.max(0,state.dinoStampedeRecharge-2);} }
    ,{ id:'prismCoreRange', icon:'◎', name:'Prisma de longo alcance', description:'Amplia o raio do Núcleo Prisma em 35 unidades por nível.', max:3, available:()=>currentSkin().id==='prisma'&&state.prismCoreRangeBonus<105, apply:()=>{state.prismCoreRangeBonus=Math.min(105,state.prismCoreRangeBonus+35);} }
    ,{ id:'prismCoreDamage', icon:'✧', name:'Refração concentrada', description:'Aumenta em 2 o dano do Núcleo Prisma por nível.', max:4, available:()=>currentSkin().id==='prisma'&&state.prismCoreDamageBonus<8, apply:()=>{state.prismCoreDamageBonus=Math.min(8,state.prismCoreDamageBonus+2);} }
    ,{ id:'prismHorizonWindow', icon:'⌖', name:'Âncora ampliada', description:'Estende a janela para retornar pela Dobra de Horizonte em 1 segundo, até 6 segundos.', max:2, available:()=>currentSkin().id==='prisma'&&state.prismHorizonWindowBonus<2, apply:()=>{state.prismHorizonWindowBonus=Math.min(2,state.prismHorizonWindowBonus+1);} }
    ,{ id:'prismHorizonDamage', icon:'✹', name:'Pulso de retorno', description:'Aumenta em 2 o dano da onda liberada ao retornar pela Dobra de Horizonte.', max:3, available:()=>currentSkin().id==='prisma'&&state.prismHorizonDamageBonus<6, apply:()=>{state.prismHorizonDamageBonus=Math.min(6,state.prismHorizonDamageBonus+2);} }
    ,{ id:'prismCooldown', icon:'⟳', name:'Ressonância real', description:'Reduz em 2 segundos a recarga compartilhada das habilidades escolhidas, até 20 segundos.', max:4, available:()=>currentSkin().id==='prisma'&&state.prismCooldownBonus<4, apply:()=>{state.prismCooldownBonus=Math.min(4,state.prismCooldownBonus+1);state.abilityBaseCooldown=prismCooldownDuration();state.abilityCooldown=Math.min(state.abilityCooldown,state.abilityBaseCooldown);} }
    ,{ id:'prismResonance', icon:'◇', name:'Espectro refinado', description:'Fortalece em 12% as habilidades próprias e copiadas da Prisma Real, até 36%.', max:3, available:()=>currentSkin().id==='prisma'&&upgradeLevel('prismResonance')<3, apply:()=>{state.abilityPower=Math.min(2.5,state.abilityPower+.12);} }
    ,{ id:'salvageHeal', icon:'✚', name:'Recuperação de destroços', description:'Inimigos destruídos podem liberar energia de reparo.', max:4, available:()=>state.salvageHeal<4, apply:()=>{state.salvageHeal+=1;} }
    ,{ id:'endlessDamage', icon:'✹', name:'Núcleo adaptativo', description:'Reforço repetível com ganho decrescente e limite seguro de dano.', max:0, stack:true, available:()=>state.endlessDamage<1.24, apply:()=>{state.endlessDamage=Math.min(1.25,state.endlessDamage + .11 / (1 + upgradeLevel('endlessDamage') * .14));} }
    ,{ id:'endlessSpeed', icon:'➤', name:'Impulso de longo curso', description:'Aumenta a mobilidade aos poucos, com velocidade máxima controlada.', max:0, stack:true, available:()=>state.endlessSpeed<118, apply:()=>{state.endlessSpeed=Math.min(120,state.endlessSpeed + 8 / (1 + upgradeLevel('endlessSpeed') * .12));} }
  ];

  function readBest() { try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); } catch { return 0; } }
  function readBestWave() { try { return Math.max(0, Number(localStorage.getItem(bestWaveKey)) || 0); } catch { return 0; } }
  function profileNickname() { return String(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'); }
  function normalizeRankNickname(value) { return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR'); }
  function rankBestWaveKey(nickname = profileNickname()) { return nicknameRankBestWavePrefix + encodeURIComponent(nickname || 'jogador'); }
  function readNicknameRankBestWave(nickname = profileNickname()) {
    try { return Math.max(0, Number(localStorage.getItem(rankBestWaveKey(nickname))) || 0); } catch { return 0; }
  }
  function saveNicknameRankBestWave(nickname, wave) {
    const normalized = normalizeRankNickname(nickname);
    if (!normalized) return;
    try { localStorage.setItem(rankBestWaveKey(normalized), String(Math.max(readNicknameRankBestWave(normalized), Math.floor(Number(wave) || 0)))); } catch { /* O recorde online continua disponível mesmo sem armazenamento local. */ }
  }
  function completedWaveKey(nickname = profileNickname()) { return nicknameCompletedWavePrefix + encodeURIComponent(nickname || 'jogador'); }
  function readNicknameCompletedWave(nickname = profileNickname()) {
    try { return Math.max(0, Number(localStorage.getItem(completedWaveKey(nickname))) || 0); } catch { return 0; }
  }
  function saveNicknameCompletedWave(nickname, wave) {
    const normalized = normalizeRankNickname(nickname);
    if (!normalized) return;
    try { localStorage.setItem(completedWaveKey(normalized), String(Math.max(readNicknameCompletedWave(normalized), Math.floor(Number(wave) || 0)))); } catch { /* O progresso local principal continua disponível. */ }
  }
  function readProfileResumeWave(nickname = profileNickname()) {
    return Math.max(readNicknameRankBestWave(nickname), readNicknameCompletedWave(nickname));
  }
  function missionCheckpointKey(nickname = profileNickname()) { return missionCheckpointPrefix + encodeURIComponent(nickname || 'jogador'); }
  function readMissionCheckpoint() {
    try {
      const checkpoint = JSON.parse(localStorage.getItem(missionCheckpointKey()) || 'null');
      if (!checkpoint || checkpoint.version !== 1 || !Number.isFinite(Number(checkpoint.wave)) || Number(checkpoint.wave) < 1 || !skins.some((skin) => skin.id === checkpoint.shipId)) return null;
      return checkpoint;
    } catch { return null; }
  }
  function clearMissionCheckpoint(nickname = profileNickname()) {
    try { localStorage.removeItem(missionCheckpointKey(nickname)); } catch { /* A missão pode continuar sem armazenamento local. */ }
  }
  function saveMissionCheckpoint() {
    if (state.dailyChallenge || !['playing', 'paused'].includes(state.mode)) return false;
    const nickname = profileNickname();
    const previous = readMissionCheckpoint();
    const bestWave = readProfileResumeWave(nickname);
    const targetWave = Math.max(1, state.wave, bestWave, Number(previous?.wave) || 0);
    if (previous && Number(previous.wave) > Math.max(state.wave, bestWave)) return true;
    const numericState = {};
    Object.entries(state).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value) && !['lastTime', 'raf', 'width', 'height', 'dpr'].includes(key)) numericState[key] = value;
    });
    const checkpoint = {
      version:1, nickname:nickname || 'jogador', savedAt:Date.now(), wave:targetWave,
      bestCompletedWave:Math.max(bestWave, readNicknameCompletedWave(nickname)), score:Math.max(0, state.score), elapsed:Math.max(0, state.elapsed),
      shipId:currentSkin().id, lastBossType:state.lastBossType, stats:numericState, upgrades:{ ...state.upgrades },
      player:{ xRatio:state.width ? state.player.x / state.width : .5, yRatio:state.height ? state.player.y / state.height : .78,
        speed:state.player.speed, damage:state.player.damage, fireRate:state.player.fireRate, spread:state.player.spread,
        angle:state.player.angle, moveAngle:state.player.moveAngle }
    };
    try { localStorage.setItem(missionCheckpointKey(nickname), JSON.stringify(checkpoint)); return true; } catch { return false; }
  }
  function readSecretShipUnlocks() {
    try {
      const saved = JSON.parse(localStorage.getItem(secretShipUnlockKey) || '[]');
      return new Set(Array.isArray(saved) ? saved.filter((id) => id === '*' || skins.some((skin) => skin.secret && skin.id === id)) : []);
    } catch { return new Set(); }
  }
  function hasSecretShipAccess(skin) {
    if (skin.id === 'prisma') return accountShipProgressLoaded || secretShipUnlocks.has('prisma');
    if (skin.ownerOnly) return accountShipProgressLoaded;
    return Array.isArray(skin.allowedProfiles) && skin.allowedProfiles.includes(profileNickname())
      || secretShipUnlocks.has('*') || secretShipUnlocks.has(skin.id)
      || accountShipProgressLoaded && accountUnlockedShipIds.has(skin.id);
  }
  function displayRankNickname(value) {
    const nickname = normalizeRankNickname(value);
    return window.CV_STARFALL_SUPABASE?.displayNicknames?.[nickname] || String(value || 'Piloto');
  }
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
  function achievementTarget(definition) { return definition.id === 'ability-collector' ? abilityShipsTarget() : definition.target; }
  function reconcileAbilityCollectorAchievement() {
    const definition = starfallAchievements.find((item) => item.id === 'ability-collector');
    if (!definition || !state.achievementProgress) return;
    if (achievementValue(definition) < achievementTarget(definition) && state.achievementProgress.unlocked[definition.id]) {
      delete state.achievementProgress.unlocked[definition.id];
      saveAchievementProgress();
    }
    renderAchievements();
  }
  function renderAchievements() {
    if (!state.achievementProgress) state.achievementProgress = readAchievementProgress();
    const unlockedCount = starfallAchievements.filter((item) => achievementValue(item) >= achievementTarget(item)).length;
    if (ui.achievementsCount) ui.achievementsCount.textContent = `${unlockedCount}/${starfallAchievements.length}`;
    if (!ui.achievementsList) return;
    ui.achievementsList.replaceChildren();
    starfallAchievements.forEach((definition) => {
      const target = achievementTarget(definition);
      const value = Math.min(target, achievementValue(definition));
      const unlocked = value >= target;
      const card = document.createElement('article'); card.className = 'starfall-achievement' + (unlocked ? ' is-unlocked' : '');
      const icon = document.createElement('span'); icon.className = 'starfall-achievement-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = unlocked ? definition.icon : '🔒';
      const body = document.createElement('span'); body.className = 'starfall-achievement-copy';
      const title = document.createElement('strong'); title.textContent = definition.title;
      const description = document.createElement('small'); description.textContent = definition.description;
      const progress = document.createElement('span'); progress.className = 'starfall-achievement-progress'; progress.textContent = unlocked ? 'Conquista desbloqueada' : `${value}/${target} ${definition.unit}`;
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
      if (achievementValue(definition) < achievementTarget(definition) || progress.unlocked[definition.id]) continue;
      const record = Date.now(); progress.unlocked[definition.id] = record;
      window.dispatchEvent(new CustomEvent('cv-games-achievement-unlocked', { detail: { icon: definition.icon, title: definition.title, description: definition.description, unlockedAt: record } }));
    }
    saveAchievementProgress();
    renderAchievements();
  }
  function isDeveloperProfile() { return ['educvv dev', 'educvv dev1'].includes(profileNickname()); }
  function isAllShipsProfile() { return profileNickname() === 'adm'; }
  function abilityShipsTarget() { return skins.filter((skin) => !skin.secret || isAllShipsProfile() || hasSecretShipAccess(skin)).length; }
  function isAllUpgradesProfile() { return profileNickname() === 'educvv dev1'; }
  function hasDeveloperPerks() { return isDeveloperProfile() && !state.dailyChallenge && state.adminNoCooldown; }
  function shipCooldownSummary(skin) {
    if (hasDeveloperPerks()) return 'sem recarga';
    if (skin.id === 'prisma') return 'E e Q configuráveis no Arquivo de Ecos (G) · recarga própria até 20s · missão fora do placar';
    if (skin.id === 'eclipse') return 'E 30s→25s com melhorias · Q 24s';
    if (skin.id === 'chronos') return 'E 25s · Q 28s→22s · ecos 40%→70% por 4→6s';
    if (skin.id === 'aurora') return 'E 25s · Q 28s→22s · 5→8 alvos por 5→7s';
    if (skin.id === 'aegis') return 'E 25s · Q 30s→24s · 3→5 sentinelas por 6→8s';
    if (skin.id === 'redshift') return 'E 30s→25s · Q 28s→22s · duração do Q até 8s';
    if (skin.id === 'flashblade') return 'E 25s · Q 26s→22s · impulso 2,2× · barreiras 7s';
    if (skin.id === 'tempest') return 'E 34s · Q com 3→5 cargas · recarga de 28s→22s por carga';
    if (skin.id === 'saurion') return 'E ' + skin.cooldown + 's→22s · Q 3 cargas · ' + skin.cooldownQ + 's→24s por carga';
    return 'recarga ' + skin.cooldown + 's';
  }
  function skinUnlocked(skin) {
    if (skin.ownerOnly) return hasSecretShipAccess(skin);
    if (isAllShipsProfile()) return true;
    if (skin.secret) return hasSecretShipAccess(skin);
    if (accountShipProgressLoaded && accountUnlockedShipIds.has(skin.id)) return true;
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
  function defaultControlMode() { return detectedMobileDevice ? 'analog' : 'keys'; }
  function validControlMode(mode) { return ['keys','touch','analog'].includes(mode); }
  function adaptControlMode(mode) { return detectedMobileDevice && mode === 'keys' ? 'analog' : validControlMode(mode) ? mode : defaultControlMode(); }
  function readControlMode() { try { const mode=localStorage.getItem(controlModeKey); return validControlMode(mode)?mode:defaultControlMode(); } catch { return defaultControlMode(); } }
  function readPerformanceMode() { try { return localStorage.getItem(performanceModeKey) === 'light' ? 'light' : 'normal'; } catch { return 'normal'; } }
  function currentSkin() {
    if (state.prismDispatchSkinId) {
      const dispatched = skins.find((skin) => skin.id === state.prismDispatchSkinId);
      if (dispatched) return dispatched;
    }
    const selected = skins.find((skin) => skin.id === state.selectedSkin);
    return selected && skinUnlocked(selected) ? selected : skins[0];
  }
  function prismChoiceParts(choice = state.prismAbilityChoices[state.prismAbilitySlot]) {
    const [shipId, key] = String(choice || 'aurora:e').split(':');
    return { shipId: skins.some((skin) => skin.id === shipId) ? shipId : 'aurora', key: key === 'q' ? 'q' : 'e' };
  }
  function prismChoiceName(choice = state.prismAbilityChoices[state.prismAbilitySlot]) {
    const { shipId, key } = prismChoiceParts(choice);
    const skin = skins.find((item) => item.id === shipId) || skins[0];
    return key === 'q' ? secondaryAbilityNames[shipId] : skin.ability;
  }
  function setPrismChoice(choice, slot = state.prismAbilitySlot) {
    if (!['e','q'].includes(slot)) return;
    state.prismAbilityChoices[slot] = choice;
    try { localStorage.setItem(prismAbilityChoiceKey, JSON.stringify(state.prismAbilityChoices)); } catch { /* As escolhas ficam nesta sessão. */ }
  }
  function setPrismAbilitySlot(slot) {
    if (!['e','q'].includes(slot)) return;
    state.prismAbilitySlot = slot;
    document.querySelectorAll('[data-prism-slot]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.prismSlot === slot)));
  }
  function abilitySourceIs(id) {
    if (currentSkin().id === id) return true;
    return state.selectedSkin === 'prisma' && ['e','q'].some((slot) => prismChoiceParts(state.prismAbilityChoices[slot]).shipId === id);
  }
  function shipUpgradeActive(id, key) {
    if (currentSkin().id === id) return true;
    if (currentSkin().id !== 'prisma') return false;
    return ['e','q'].some((slot) => { const choice = prismChoiceParts(state.prismAbilityChoices[slot]); return choice.shipId === id && (!key || choice.key === key); });
  }
  function prismCooldownDuration() {
    return Math.max(18, Math.min(state.abilityBaseCooldown || 28, 28 - state.prismCooldownBonus * 2));
  }
  function saveBest() { try { localStorage.setItem(bestKey, String(state.best)); } catch { /* Recorde mantido nesta sessão. */ } }
  function saveBestWave() { try { localStorage.setItem(bestWaveKey, String(state.bestCompletedWave)); } catch { /* Desbloqueios mantidos nesta sessão. */ } }
  function unlockedShipsAtWave(bestWave) {
    const result = new Set(['aurora']);
    skins.forEach((skin) => {
      const unlocked = skin.ownerOnly ? hasSecretShipAccess(skin) : isAllShipsProfile()
        || (skin.secret ? hasSecretShipAccess(skin)
          : isDeveloperProfile() || !skin.unlockWave || bestWave >= skin.unlockWave);
      if (unlocked) result.add(skin.id);
    });
    return result;
  }
  function clearAccountShipProgress() {
    accountUnlockedShipIds = new Set();
    accountShipProgressLoaded = false;
    state.bestCompletedWave = readBestWave();
    state.selectedSkin = readSkin();
    renderSkinPicker(); updateEquippedShip(); updateHud();
  }
  async function persistAccountShipProgress() {
    if (!accountShipProgressLoaded || !window.CV_GAMES_AUTH?.client) return;
    accountShipWriteChain = accountShipWriteChain.then(async () => {
      const session = await window.CV_GAMES_AUTH.getOwnerSession();
      if (!session?.user?.id) return;
      accountUnlockedShipIds = new Set([...accountUnlockedShipIds, ...unlockedShipsAtWave(Math.max(readBestWave(), state.bestCompletedWave))]);
      const unlockedCodes = [...accountUnlockedShipIds].map((id) => shipCodeById[id]).filter(Number.isInteger).sort((a, b) => a - b);
      const selectedCode = shipCodeById[state.selectedSkin] || 1;
      const { error } = await window.CV_GAMES_AUTH.client.from('starfall_profiles').upsert({
        user_id: session.user.id,
        unlocked_ships: unlockedCodes,
        selected_ship: selectedCode,
        best_completed_wave: Math.max(readBestWave(), state.bestCompletedWave),
        updated_at: new Date().toISOString()
      }, { onConflict:'user_id' });
      if (error) throw error;
    }).catch(() => {});
    return accountShipWriteChain;
  }
  async function loadAccountShipProgress() {
    const auth = window.CV_GAMES_AUTH;
    if (!auth?.client) { clearAccountShipProgress(); return; }
    let session;
    try { session = await auth.getOwnerSession(); } catch { session = null; }
    if (!session?.user?.id) { clearAccountShipProgress(); return; }
    try {
      const { data, error } = await auth.client.from('starfall_profiles')
        .select('unlocked_ships,selected_ship,best_completed_wave')
        .eq('user_id', session.user.id).maybeSingle();
      if (error) throw error;
      const cloudIds = new Set((data?.unlocked_ships || []).map((code) => shipIdByCode[Number(code)]).filter(Boolean));
      const bestWave = Math.max(readBestWave(), state.bestCompletedWave, Number(data?.best_completed_wave) || 0);
      saveNicknameCompletedWave('educvv', Number(data?.best_completed_wave) || 0);
      state.bestCompletedWave = bestWave;
      accountShipProgressLoaded = true;
      accountUnlockedShipIds = new Set([...cloudIds, ...unlockedShipsAtWave(bestWave)]);
      const cloudSelected = data ? shipIdByCode[Number(data.selected_ship)] : '';
      const localSelected = state.selectedSkin;
      state.selectedSkin = cloudSelected && accountUnlockedShipIds.has(cloudSelected)
        ? cloudSelected
        : accountUnlockedShipIds.has(localSelected) ? localSelected : 'aurora';
      try { localStorage.setItem('cv-games-cv-starfall-skin', state.selectedSkin); } catch { /* A escolha vale nesta sessão. */ }
      renderSkinPicker(); updateEquippedShip(); updateHud();
      await persistAccountShipProgress();
    } catch {
      accountUnlockedShipIds = new Set();
      accountShipProgressLoaded = false;
      state.bestCompletedWave = readBestWave();
      state.selectedSkin = readSkin();
      renderSkinPicker(); updateEquippedShip(); updateHud();
    }
  }
  function updateEquippedShip() {
    if (!ui.equippedShip) return;
    const skin = currentSkin();
    const silhouettes = { classic: 'M20 3 L34 35 L20 28 L6 35 Z', blade: 'M20 2 L24 16 L36 33 L20 27 L4 33 L16 16 Z', wing: 'M20 2 L25 16 L37 30 L25 27 L20 38 L15 27 L3 30 L15 16 Z', shield: 'M20 2 L32 17 L29 32 L20 37 L11 32 L8 17 Z', ring: 'M20 3 L34 35 L20 28 L6 35 Z', reflector: 'M20 2 L33 10 L37 23 L28 34 L20 38 L12 34 L3 23 L7 10 Z', prism: 'M20 2 L34 13 L30 31 L20 38 L10 31 L6 13 Z' };
    ui.equippedShip.style.setProperty('--skin-color', skin.color);
    const equippedIcon = skin.shape === 'eclipse'
      ? '<span class="starfall-equipped-icon starfall-eclipse-sprite" aria-hidden="true"></span>'
      : skin.shape === 'dino' ? '<span class="starfall-equipped-icon starfall-dino-icon starfall-dino-image-wrap" aria-hidden="true"><img src="saurion-raptor-skill.png" alt=""></span>'
      : skin.shape === 'prism' ? '<span class="starfall-equipped-icon starfall-prism-icon" aria-hidden="true">◇</span>'
      : '<svg class="starfall-equipped-icon" viewBox="0 0 40 40" aria-hidden="true"><path d="' + silhouettes[skin.shape] + '" fill="' + skin.color + '" stroke="' + skin.accent + '" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="3.3" ry="6" fill="#f1ffff"/><path d="M15 31 L20 38 L25 31" fill="' + skin.accent + '"/>' + (skin.shape === 'ring' ? '<ellipse cx="20" cy="21" rx="17" ry="8" fill="none" stroke="' + skin.accent + '" stroke-width="1.2"/>' : skin.shape === 'reflector' ? '<path d="M3 17 Q20 1 37 17" fill="none" stroke="' + skin.accent + '" stroke-width="2"/>' : '') + '</svg>';
    ui.equippedShip.innerHTML = equippedIcon + '<span><strong>Nave equipada: ' + skin.name + '</strong><small>' + skin.ability + ' · ' + shipCooldownSummary(skin) + '</small></span>';
    updateEclipseSkipOption();
    updateAbilityButton();
  }
  function normalizeDamageCounterPosition(position) {
    const rawX = Number(position?.x); const rawY = Number(position?.y);
    return {
      x: Math.max(.16, Math.min(.96, Number.isFinite(rawX) && rawX !== 0 ? rawX : defaultDamageCounterPosition.x)),
      y: Math.max(.12, Math.min(.88, Number.isFinite(rawY) && rawY !== 0 ? rawY : defaultDamageCounterPosition.y))
    };
  }
  function nicknameSettingsStorageKey(nickname = profileNickname()) {
    return nicknameSettingsPrefix + encodeURIComponent(nickname || 'jogador');
  }
  function profileSetupStorageKey(nickname = profileNickname()) {
    return setupCompleteKey + ':' + encodeURIComponent(nickname || 'jogador');
  }
  function readNicknameSettings(nickname = profileNickname()) {
    const readProfileSetup = () => {
      try { return localStorage.getItem(profileSetupStorageKey(nickname)) === 'true'; } catch { return false; }
    };
    let saved = null;
    try {
      const parsed = JSON.parse(localStorage.getItem(nicknameSettingsStorageKey(nickname)) || 'null');
      if (parsed && typeof parsed === 'object') saved = parsed;
    } catch { /* Recupera as preferências padrão se o armazenamento local estiver indisponível. */ }
    const migrated = {
      damageCounterEnabled: typeof saved?.damageCounterEnabled === 'boolean' ? saved.damageCounterEnabled : defaultNicknameSettings.damageCounterEnabled,
      eclipseSkipVideo: typeof saved?.eclipseSkipVideo === 'boolean' ? saved.eclipseSkipVideo : defaultNicknameSettings.eclipseSkipVideo,
      damageCounterPosition: normalizeDamageCounterPosition(saved?.damageCounterPosition),
      controlMode: validControlMode(saved?.controlMode) ? saved.controlMode : defaultControlMode(),
      performanceMode: ['normal','light'].includes(saved?.performanceMode) ? saved.performanceMode : 'normal',
      setupComplete: typeof saved?.setupComplete === 'boolean' ? saved.setupComplete : readProfileSetup()
    };
    try {
      if (localStorage.getItem(nicknameSettingsMigrationKey) !== 'true') {
        if (typeof saved?.damageCounterEnabled !== 'boolean') migrated.damageCounterEnabled = readLegacySetting(auroraDamageCounterKey, defaultNicknameSettings.damageCounterEnabled);
        if (typeof saved?.eclipseSkipVideo !== 'boolean') migrated.eclipseSkipVideo = readLegacySetting(eclipseSkipVideoKey, defaultNicknameSettings.eclipseSkipVideo);
        if (!validControlMode(saved?.controlMode)) migrated.controlMode = readControlMode();
        if (!['normal','light'].includes(saved?.performanceMode)) migrated.performanceMode = readPerformanceMode();
        migrated.setupComplete = migrated.setupComplete || (localStorage.getItem(setupCompleteKey) === 'true'
          && localStorage.getItem(controlModeKey) !== null && localStorage.getItem(performanceModeKey) !== null);
        localStorage.setItem(nicknameSettingsStorageKey(nickname), JSON.stringify(migrated));
        localStorage.setItem(nicknameSettingsMigrationKey, 'true');
      }
    } catch { /* As preferências ainda ficam disponíveis na sessão. */ }
    return migrated;
  }
  function readLegacySetting(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === 'true';
    } catch { return fallback; }
  }
  function writeNicknameSettingsLocally(nickname = profileNickname()) {
    try {
      localStorage.setItem(nicknameSettingsStorageKey(nickname), JSON.stringify({
        damageCounterEnabled: state.damageCounterEnabled,
        eclipseSkipVideo: state.eclipseSkipVideoEnabled,
        damageCounterPosition: normalizeDamageCounterPosition(state.damageCounterPosition),
        controlMode: state.savedControlMode,
        performanceMode: state.performanceMode,
        setupComplete: state.preferencesConfigured
      }));
      localStorage.setItem(controlModeKey, state.controlMode);
      localStorage.setItem(performanceModeKey, state.performanceMode);
      localStorage.setItem(profileSetupStorageKey(nickname), String(state.preferencesConfigured));
    } catch { /* As escolhas continuam valendo nesta sessão. */ }
  }
  function settingsNicknameIsAllowed(nickname) {
    const names = (window.CV_STARFALL_SUPABASE?.settingsNicknames || window.CV_STARFALL_SUPABASE?.allowedNicknames || []).map(normalizeRankNickname);
    return Boolean(nickname && names.includes(normalizeRankNickname(nickname)));
  }
  function updateSettingsSyncStatus(message) {
    if (ui.settingsSyncStatus) ui.settingsSyncStatus.textContent = message;
  }
  function saveNicknameSettings() {
    const nickname = profileNickname();
    const normalizedNickname = normalizeRankNickname(nickname);
    const revision = ++settingsMutationRevision;
    const payload = {
      nickname: normalizedNickname,
      damage_counter_enabled: state.damageCounterEnabled,
      damage_counter_x: state.damageCounterPosition.x,
      damage_counter_y: state.damageCounterPosition.y,
      eclipse_skip_video: state.eclipseSkipVideoEnabled,
      control_mode: state.savedControlMode,
      performance_mode: state.performanceMode,
      setup_complete: state.preferencesConfigured,
      updated_at: new Date().toISOString()
    };
    writeNicknameSettingsLocally(nickname);
    if (!settingsNicknameIsAllowed(normalizedNickname) || !window.CV_GAMES_AUTH?.client) {
      updateSettingsSyncStatus('Preferências salvas neste aparelho.');
      return Promise.resolve();
    }
    updateSettingsSyncStatus('Sincronizando preferências do perfil…');
    settingsSyncChain = settingsSyncChain.then(async () => {
      const auth = window.CV_GAMES_AUTH;
      if (normalizedNickname === 'educvv' && !(await auth.getOwnerSession())?.user?.id) throw new Error('A conta educvv precisa estar conectada.');
      const { error } = await auth.client.from('starfall_settings').upsert(payload, { onConflict:'nickname' });
      if (error) throw error;
      if (profileNickname() === normalizedNickname && settingsMutationRevision === revision) updateSettingsSyncStatus('Preferências sincronizadas para ' + displayRankNickname(normalizedNickname) + '.');
    }).catch(() => {
      if (profileNickname() === normalizedNickname && settingsMutationRevision === revision) updateSettingsSyncStatus('Preferências salvas neste aparelho; sincronização indisponível.');
    });
    return settingsSyncChain;
  }
  async function loadNicknameSettings() {
    const nickname = profileNickname();
    const normalizedNickname = normalizeRankNickname(nickname);
    const revision = settingsMutationRevision;
    const local = readNicknameSettings(nickname);
    state.damageCounterEnabled = local.damageCounterEnabled;
    state.eclipseSkipVideoEnabled = local.eclipseSkipVideo;
    state.damageCounterPosition = local.damageCounterPosition;
    state.savedControlMode = local.controlMode;
    state.controlMode = adaptControlMode(local.controlMode);
    state.performanceMode = local.performanceMode;
    state.preferencesConfigured = local.setupComplete;
    updateEclipseSkipOption(); updateAbilityButton(); updateControlUI(); updatePerformanceModeUI();
    const localParticleLimit = particleLimit();
    if (state.particles.length > localParticleLimit) state.particles.splice(0, state.particles.length - localParticleLimit);
    resize();
    if (state.mode !== 'playing') draw(performance.now());
    if (!settingsNicknameIsAllowed(normalizedNickname) || !window.CV_GAMES_AUTH?.client) {
      updateSettingsSyncStatus('Preferências salvas neste aparelho.');
      return;
    }
    try {
      if (normalizedNickname === 'educvv' && !(await window.CV_GAMES_AUTH.getOwnerSession())?.user?.id) return;
      const { data, error } = await window.CV_GAMES_AUTH.client.from('starfall_settings')
        .select('damage_counter_enabled,damage_counter_x,damage_counter_y,eclipse_skip_video,control_mode,performance_mode,setup_complete')
        .eq('nickname', normalizedNickname).maybeSingle();
      if (error) throw error;
      if (profileNickname() !== normalizedNickname || settingsMutationRevision !== revision) return;
      if (!data) { saveNicknameSettings(); return; }
      state.damageCounterEnabled = Boolean(data.damage_counter_enabled);
      state.eclipseSkipVideoEnabled = Boolean(data.eclipse_skip_video);
      state.damageCounterPosition = normalizeDamageCounterPosition({ x:data.damage_counter_x, y:data.damage_counter_y });
      state.savedControlMode = validControlMode(data.control_mode) ? data.control_mode : local.controlMode;
      state.controlMode = adaptControlMode(state.savedControlMode);
      state.performanceMode = data.performance_mode === 'light' ? 'light' : 'normal';
      state.preferencesConfigured = Boolean(data.setup_complete || local.setupComplete);
      const syncPreviouslyConfigured = local.setupComplete && !data.setup_complete;
      writeNicknameSettingsLocally(nickname);
      updateEclipseSkipOption(); updateAbilityButton(); updateControlUI(); updatePerformanceModeUI(); resize();
      if (syncPreviouslyConfigured) saveNicknameSettings();
      else updateSettingsSyncStatus('Preferências sincronizadas para ' + displayRankNickname(normalizedNickname) + '.');
      if (state.mode !== 'playing') draw(performance.now());
    } catch {
      updateSettingsSyncStatus('Preferências salvas neste aparelho; sincronização indisponível.');
    }
  }
  function updateEclipseSkipOption() {
    const shouldShow = currentSkin().id === 'eclipse';
    ui.eclipseSkipOptions.forEach((option) => { option.hidden = !shouldShow; });
    ui.eclipseSkipCheckboxes.forEach((checkbox) => { checkbox.checked = state.eclipseSkipVideoEnabled; });
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
  function colorRgbTriplet(color) {
    const hex = String(color || '').replace('#', '');
    if (!/^[\da-f]{6}$/i.test(hex)) return '98,215,196';
    return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(',');
  }
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
    if (ui.damageCounterCheckbox) ui.damageCounterCheckbox.checked = state.damageCounterEnabled;
    if (ui.prismSelectWrap) ui.prismSelectWrap.hidden = skin.id !== 'prisma' || !['playing','paused'].includes(state.mode);
    if (skin.id === 'prisma') { updatePrismAbilityButton(); return; }
    const showAbility = ['playing', 'paused'].includes(state.mode);
    const ready = state.abilityCooldown <= 0;
    const eclipseIntro = skin.id === 'eclipse' && state.eclipsePhase === 'cinematic';
    const eclipseActive = skin.id === 'eclipse' && state.eclipsePhase === 'active';
    const active = eclipseIntro || eclipseActive;
    if (ui.abilityWrap) ui.abilityWrap.hidden = !showAbility;
    if (ui.ability) {
      ui.ability.classList.remove('is-prisma');
      ui.ability.style.setProperty('--ship-color', skin.color);
      ui.ability.style.setProperty('--ship-accent', skin.accent);
      ui.ability.style.setProperty('--ship-color-rgb', colorRgbTriplet(skin.color));
      ui.ability.style.setProperty('--ship-accent-rgb', colorRgbTriplet(skin.accent));
      ui.ability.disabled = state.mode !== 'playing' || eclipseIntro || eclipseActive || (!ready && !active);
      ui.ability.setAttribute('aria-pressed', String(active));
      ui.ability.textContent = '✦';
      ui.ability.setAttribute('aria-label', eclipseIntro ? 'Abertura da Expansão de Domínio em andamento' : eclipseActive ? 'Santuário ativo por mais ' + Math.ceil(state.eclipseTime) + ' segundos' : ready ? 'Usar habilidade ' + skin.ability + ' · tecla E' : skin.ability + ' recarregando: ' + Math.ceil(state.abilityCooldown) + ' segundos');
      const eCountdown = !hasDeveloperPerks() && state.abilityCooldown > 0
        ? String(Math.ceil(state.abilityCooldown))
        : eclipseActive ? String(Math.ceil(state.eclipseTime)) : '';
      if (ui.abilityCooldown) {
        ui.abilityCooldown.textContent = eCountdown;
        ui.abilityCooldown.hidden = !eCountdown;
      }
      ui.ability.classList.toggle('is-counting', Boolean(eCountdown));
      ui.ability.title = skin.ability + ' · tecla E · ' + (hasDeveloperPerks() ? 'sem recarga: ' : '') + skin.description;
    }
    if (ui.eclipseQWrap && ui.eclipseQ) {
      const isAurora = skin.id === 'aurora';
      const isAegis = skin.id === 'aegis';
      const isEclipse = skin.id === 'eclipse';
      const isChronos = skin.id === 'chronos';
      const isSaurion = skin.id === 'saurion';
      const isRedshift = skin.id === 'redshift';
      const isFlashblade = skin.id === 'flashblade';
      const isTempest = skin.id === 'tempest';
      ui.eclipseQWrap.style.setProperty('--ship-accent', skin.accent);
      const showQ = (isAurora || isAegis || isEclipse || isChronos || isSaurion || isRedshift || isFlashblade || isTempest) && ['playing', 'paused'].includes(state.mode);
      const auroraLinkTime = auroraLinkDuration();
      const auroraLinkCooldown = auroraLinkCooldownDuration();
      const auroraLinkTargets = auroraLinkMaxTargets();
      const auroraLinkDamage = auroraLinkPulseDamage();
      const aegisOrbitTime = aegisOrbitDuration();
      const aegisOrbitCooldown = aegisOrbitCooldownDuration();
      const aegisOrbitCount = aegisOrbitMaxCount();
      const aegisOrbitRemaining = state.aegisOrbit ? state.aegisOrbit.fragments.filter(Boolean).length : aegisOrbitCount;
      const chronosEchoTime = chronosEchoDuration();
      const chronosEchoCooldown = chronosEchoCooldownDuration();
      const decoyDuration = 4 + state.eclipseDecoyDurationBonus;
      const perimeterDuration = 6 + state.redshiftPerimeterDurationBonus;
      const perimeterCooldown = Math.max(22, 28 - upgradeLevel('redshiftPerimeterCooldown') * 2);
      const trailDuration = 5 + state.flashTrailDurationBonus;
      const trailCooldown = Math.max(22, 26 - upgradeLevel('flashTrailCooldown') * 2);
      const tempestTideCooldown = tempestTideCooldownDuration();
      const tempestTideCharges = hasDeveloperPerks() ? tempestTideMaxCharges() : state.tempestTideCharges;
      const tempestTideMax = tempestTideMaxCharges();
      const stampedeRemaining = state.effects.reduce((remaining, effect) => effect.type === 'dino-raptor' ? Math.max(remaining, effect.life) : remaining, 0);
      const tideRemaining = state.effects.reduce((remaining, effect) => effect.type === 'tempest-tide' ? Math.max(remaining, effect.life) : remaining, 0);
      const qActive = isAurora ? Boolean(state.auroraLink && state.auroraLink.life > 0) : isAegis ? Boolean(state.aegisOrbit && state.aegisOrbit.life > 0) : isEclipse ? Boolean(state.eclipseDecoy && state.eclipseDecoy.life > 0) : isChronos ? Boolean(state.chronosEcho && state.chronosEcho.life > 0) : isRedshift ? Boolean(state.redshiftPerimeter && state.redshiftPerimeter.life > 0) : isFlashblade ? Boolean(state.flashTrail && state.flashTrail.life > 0) : isTempest ? tideRemaining > 0 : isSaurion && stampedeRemaining > 0;
      const qCooldown = isAurora ? state.auroraLinkCooldown : isAegis ? state.aegisOrbitCooldown : isEclipse ? state.eclipseDecoyCooldown : isChronos ? state.chronosEchoCooldown : isRedshift ? state.redshiftPerimeterCooldown : isFlashblade ? state.flashTrailCooldown : isTempest ? state.tempestTideCooldown : state.dinoStampedeRecharge;
      const dinoCharges = hasDeveloperPerks() ? 3 : state.dinoStampedeCharges;
      const qReady = hasDeveloperPerks() || (isTempest && state.tempestTideCharges > 0) || ((isAurora || isAegis || isEclipse || isChronos || isRedshift || isFlashblade) && qCooldown <= 0) || (isSaurion && dinoCharges > 0);
      ui.eclipseQWrap.hidden = !showQ;
      ui.eclipseQ.disabled = !showQ || state.mode !== 'playing' || (isEclipse && state.eclipsePhase !== 'idle') || ((isAurora || isAegis || isEclipse || isChronos || isRedshift || isFlashblade) && qActive) || !qReady;
      ui.eclipseQ.textContent = isAurora ? '✴' : isAegis ? '⬡' : isEclipse ? '◉' : isChronos ? '◷' : isRedshift ? '△' : isFlashblade ? '✧' : isTempest ? '↗' : '✦';
      ui.eclipseQ.classList.toggle('is-aurora', isAurora);
      ui.eclipseQ.classList.toggle('is-aegis', isAegis);
      ui.eclipseQ.classList.toggle('is-chronos', isChronos);
      ui.eclipseQ.classList.toggle('is-saurion', isSaurion);
      ui.eclipseQ.classList.toggle('is-redshift', isRedshift);
      ui.eclipseQ.classList.toggle('is-flashblade', isFlashblade);
      ui.eclipseQ.classList.toggle('is-tempest', isTempest);
      ui.eclipseQ.classList.remove('is-prisma');
      ui.eclipseQ.setAttribute('aria-pressed', String(qActive));
      const qLabel = qActive && isAurora ? 'Elo Estelar ativo por mais ' + Math.ceil(state.auroraLink.life) + ' segundos · até ' + auroraLinkTargets + ' alvos · cada vida perdida causa 2 de dano aos alvos vinculados'
        : qActive && isAegis ? 'Órbitas Sentinelas protegem a nave por mais ' + Math.ceil(state.aegisOrbit.life) + ' segundos · ' + aegisOrbitRemaining + ' fragmentos restantes'
        : qActive && isEclipse ? 'Isca Umbral ativa por mais ' + Math.ceil(state.eclipseDecoy.life) + ' segundos'
        : qActive && isChronos ? 'Eco do Futuro ativo por mais ' + Math.ceil(state.chronosEcho.life) + ' segundos'
        : qActive && isRedshift ? 'Perímetro de Cerco ativo por mais ' + Math.ceil(state.redshiftPerimeter.life) + ' segundos'
          : qActive && isFlashblade ? 'Rastro de Ruptura ativo por mais ' + Math.ceil(state.flashTrail.life) + ' segundos'
            : qActive && isTempest ? 'Maré Reversa ativa · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas'
              : !qReady ? isAurora ? 'Elo Estelar recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isAegis ? 'Órbitas Sentinelas recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isEclipse ? 'Isca Umbral recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isChronos ? 'Eco do Futuro recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isRedshift ? 'Perímetro de Cerco recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isFlashblade ? 'Rastro de Ruptura recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isTempest ? 'Maré Reversa recarregando; próxima carga em ' + Math.ceil(qCooldown) + ' segundos' : 'Estouro da Manada sem cargas; próxima em ' + Math.ceil(qCooldown) + ' segundos'
                : isAurora ? 'Ativar Elo Estelar · tecla Q · feixes saltam por ' + auroraLinkTime + 's entre até ' + auroraLinkTargets + ' alvos · cada vida perdida causa 2 de dano aos alvos conectados' : isAegis ? 'Ativar Órbitas Sentinelas · tecla Q · ' + aegisOrbitCount + ' fragmentos por ' + aegisOrbitTime + 's; cada um intercepta um tiro e dispara contra um inimigo' : isEclipse ? 'Ativar Isca Umbral · tecla Q · cópia móvel por ' + decoyDuration + ' segundos; dispara tiros leves e espaçados' : isChronos ? 'Ativar Eco do Futuro · tecla Q · repete os disparos após 0,42s com ' + Math.round((.4 + state.chronosEchoDamageBonus) * 100) + '% do dano' : isRedshift ? 'Ativar Perímetro de Cerco · tecla Q · campo por ' + perimeterDuration + ' segundos' : isFlashblade ? 'Ativar Rastro de Ruptura · tecla Q · impulso rápido e barreiras cortantes por ' + trailDuration + ' segundos' : isTempest ? 'Ativar Maré Reversa · tecla Q · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas; dano leve, empurrão e tiros desviados; alguns atingem inimigos' : 'Ativar Estouro da Manada · tecla Q · ' + (hasDeveloperPerks() ? 'usos ilimitados' : dinoCharges + ' cargas restantes');
      ui.eclipseQ.setAttribute('aria-label', qLabel);
      ui.eclipseQ.title = isAurora ? 'Elo Estelar · Q · pulsos a cada 0,78s · até ' + auroraLinkTargets + ' alvos · cada vida perdida pela nave causa 2 de dano aos alvos conectados · dano do pulso ' + auroraLinkDamage.toFixed(1).replace('.', ',') + ' · duração ' + auroraLinkTime + 's · recarga ' + auroraLinkCooldown + 's'
        : isAegis ? 'Órbitas Sentinelas · Q · proteção do núcleo · fragmentos intactos atacam ao final · ' + aegisOrbitCount + ' fragmentos · duração ' + aegisOrbitTime + 's · dano convertido ' + (2 + state.aegisOrbitDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + aegisOrbitCooldown + 's'
        : isEclipse ? 'Isca Umbral · Q · cópia móvel por ' + decoyDuration + 's, rota imprevisível, desvio e disparos leves a cada 0,9s · recarga de 24s'
        : isChronos ? 'Eco do Futuro · Q · ecos repetem os disparos após 0,42s · duração ' + chronosEchoTime + 's · dano ' + Math.round((.4 + state.chronosEchoDamageBonus) * 100) + '% · recarga de ' + chronosEchoCooldown + 's'
        : isRedshift ? 'Perímetro de Cerco · Q · ' + perimeterDuration + 's · dano ' + (4 + state.redshiftPerimeterDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + perimeterCooldown + 's'
          : isFlashblade ? 'Rastro de Ruptura · Q · impulso 2,2× · barreiras duram 7s · dano ' + (2 + state.flashTrailDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + trailCooldown + 's'
            : isTempest ? 'Maré Reversa · Q · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas · alcance ' + Math.round(mobileSize(245 + state.tempestTideRadiusBonus)) + ' · dano leve, empurra, desvia tiros comuns e redireciona alguns contra inimigos · recupera 1 carga a cada ' + tempestTideCooldown + 's'
              : 'Estouro da Manada · 3 cargas · Q · recarga de ' + Math.max(24, skin.cooldownQ - upgradeLevel('dinoResonance') * 2) + 's por carga';
      const qActiveRemaining = isAurora ? state.auroraLink?.life || 0
        : isAegis ? state.aegisOrbit?.life || 0
          : isEclipse ? state.eclipseDecoy?.life || 0
            : isChronos ? state.chronosEcho?.life || 0
              : isRedshift ? state.redshiftPerimeter?.life || 0
                : isFlashblade ? state.flashTrail?.life || 0
                  : isTempest ? tideRemaining
                    : isSaurion ? stampedeRemaining : 0;
      const qCountdown = !hasDeveloperPerks() && qCooldown > 0
        ? String(Math.ceil(qCooldown))
        : qActive && qActiveRemaining > 0 ? String(Math.ceil(qActiveRemaining)) : '';
      if (ui.eclipseQCooldown) {
        ui.eclipseQCooldown.textContent = qCountdown;
        ui.eclipseQCooldown.hidden = !qCountdown;
      }
      ui.eclipseQ.classList.toggle('is-counting', Boolean(qCountdown));
    }
  }
  function prismAbilityGlyph(choice = state.prismAbilityChoices.e) {
    const { shipId, key } = prismChoiceParts(choice);
    if (shipId === 'prisma') return key === 'q' ? '⌖' : '✧';
    const glyphs = { aurora:{ e:'✴', q:'✧' }, aegis:{ e:'⬡', q:'⬡' }, chronos:{ e:'◷', q:'◌' }, tempest:{ e:'◉', q:'↗' }, flashblade:{ e:'✧', q:'〰' }, redshift:{ e:'◈', q:'△' }, eclipse:{ e:'◉', q:'◌' }, saurion:{ e:'〰', q:'🐾' } };
    return glyphs[shipId]?.[key] || '✧';
  }
  function updatePrismAbilityButton() {
    const show = ['playing', 'paused'].includes(state.mode);
    const skin = skins.find((item) => item.id === 'prisma');
    if (ui.abilityWrap) ui.abilityWrap.hidden = !show;
    if (ui.ability) {
      const choice = prismChoiceParts(state.prismAbilityChoices.e);
      const selectedName = prismChoiceName(state.prismAbilityChoices.e);
      const horizonReturning = choice.key === 'q' && Boolean(state.prismHorizonAnchor?.life > 0);
      const canUse = state.mode === 'playing' && prismChoiceCanActivate('e');
      const active = prismChoiceActive('e');
      const countdown = horizonReturning ? String(Math.ceil(state.prismHorizonAnchor.life)) : !hasDeveloperPerks() && prismSlotCooldown('e') > 0 ? String(Math.ceil(prismSlotCooldown('e'))) : '';
      ui.ability.style.setProperty('--ship-color', skin.color);
      ui.ability.style.setProperty('--ship-accent', skin.accent);
      ui.ability.style.setProperty('--ship-color-rgb', colorRgbTriplet(skin.color));
      ui.ability.style.setProperty('--ship-accent-rgb', colorRgbTriplet(skin.accent));
      ui.ability.classList.add('is-prisma');
      ui.ability.disabled = !canUse;
      ui.ability.textContent = prismAbilityGlyph();
      ui.ability.setAttribute('aria-pressed', String(active));
      ui.ability.setAttribute('aria-label', horizonReturning ? 'Retornar pela Dobra de Horizonte · ' + Math.ceil(state.prismHorizonAnchor.life) + ' segundos restantes' : canUse ? 'Ativar ' + selectedName + ' · tecla E' : selectedName + ' recarregando: ' + Math.ceil(prismSlotCooldown('e')) + ' segundos');
      if (ui.abilityCooldown) { ui.abilityCooldown.textContent = countdown; ui.abilityCooldown.hidden = !countdown; }
      ui.ability.classList.toggle('is-counting', Boolean(countdown));
      ui.ability.title = selectedName + ' · habilidade E · pressione G para escolher.';
    }
    if (ui.eclipseQWrap && ui.eclipseQ) {
      const qChoice = prismChoiceParts(state.prismAbilityChoices.q);
      const qName = prismChoiceName(state.prismAbilityChoices.q);
      const qCanUse = state.mode === 'playing' && prismChoiceCanActivate('q');
      const qActive = prismChoiceActive('q');
      const qTimer = prismSlotCooldown('q');
      const qCountdown = !hasDeveloperPerks() && qTimer > 0 ? String(Math.ceil(qTimer)) : '';
      ui.eclipseQWrap.hidden = !show;
      ui.eclipseQ.classList.remove('is-aurora','is-aegis','is-chronos','is-saurion','is-redshift','is-flashblade','is-tempest');
      ui.eclipseQ.classList.add('is-prisma');
      ui.eclipseQ.textContent = prismAbilityGlyph(state.prismAbilityChoices.q);
      ui.eclipseQ.disabled = !qCanUse || state.eclipsePhase === 'cinematic';
      ui.eclipseQ.setAttribute('aria-pressed', String(qActive));
      ui.eclipseQ.setAttribute('aria-label', qCanUse ? 'Ativar ' + qName + ' · tecla Q' : qName + ' recarregando: ' + Math.ceil(qTimer) + ' segundos');
      ui.eclipseQ.title = qName + ' · habilidade Q · pressione G para escolher.';
      if (ui.eclipseQCooldown) { ui.eclipseQCooldown.textContent = qCountdown; ui.eclipseQCooldown.hidden = !qCountdown; }
      ui.eclipseQ.classList.toggle('is-counting', Boolean(qCountdown));
    }
    if (ui.prismSelectWrap) ui.prismSelectWrap.hidden = !show;
    if (ui.prismSelect) ui.prismSelect.disabled = !show || state.eclipsePhase === 'cinematic';
  }
  function openSecretShipUnlock(shipId = null) {
    pendingSecretShipId = shipId;
    const prismaUnlock = shipId === 'prisma';
    const title = $('#secret-unlock-title');
    const copy = ui.secretUnlockDialog?.querySelector('.starfall-secret-dialog-card > p:nth-of-type(2)');
    if (title) title.textContent = prismaUnlock ? 'Desbloquear Prisma Real' : 'Desbloquear naves secretas';
    if (copy) copy.textContent = prismaUnlock
      ? 'Digite o código para liberar a Prisma Real neste aparelho.'
      : 'Digite o código temporário para liberar as naves secretas neste aparelho.';
    if (ui.secretUnlockInput) ui.secretUnlockInput.inputMode = prismaUnlock ? 'text' : 'numeric';
    if (ui.secretUnlockDialog?.showModal) {
      ui.secretUnlockError.hidden = true;
      ui.secretUnlockInput.value = '';
      ui.secretUnlockDialog.showModal();
      ui.secretUnlockInput.focus();
      return;
    }
    const entered = window.prompt(prismaUnlock ? 'Digite o código para liberar a Prisma Real:' : 'Digite o código temporário para liberar as naves secretas:');
    const valid = prismaUnlock ? String(entered || '').trim().toLowerCase() === prismaShipPasscode : entered === secretShipPasscode;
    if (!valid) { if (entered !== null) window.alert('Código incorreto.'); pendingSecretShipId = null; return; }
    grantSecretShipUnlock(shipId);
  }
  function grantSecretShipUnlock(shipId) {
    if (shipId === 'prisma') secretShipUnlocks.add('prisma');
    else secretShipUnlocks = new Set(['*']);
    try { localStorage.setItem(secretShipUnlockKey, JSON.stringify([...secretShipUnlocks])); } catch { /* A liberação vale nesta sessão. */ }
    pendingSecretShipId = null;
    renderSkinPicker(); updateEquippedShip(); updateControlUI(); persistAccountShipProgress(); reconcileAbilityCollectorAchievement();
  }
  function closeSecretShipUnlock() {
    if (ui.secretUnlockDialog?.open) ui.secretUnlockDialog.close();
    pendingSecretShipId = null;
    if (ui.shipModal && !ui.shipModal.hidden) ui.skinPicker?.querySelector('.starfall-skin-card.is-secret')?.focus();
  }
  function submitSecretShipUnlock(event) {
    event.preventDefault();
    const shipId = pendingSecretShipId;
    const entered = ui.secretUnlockInput.value;
    const valid = shipId === 'prisma'
      ? entered.trim().toLowerCase() === prismaShipPasscode
      : entered === secretShipPasscode;
    if (!valid) {
      ui.secretUnlockError.hidden = false;
      ui.secretUnlockInput.focus();
      ui.secretUnlockInput.select();
      return;
    }
    grantSecretShipUnlock(shipId);
    ui.secretUnlockInput.value = '';
    ui.secretUnlockError.hidden = true;
    ui.secretUnlockDialog.close();
    ui.status.textContent = shipId === 'prisma' ? 'Prisma Real liberada neste aparelho.' : 'Naves secretas liberadas neste aparelho.';
  }
  function openShipDetails(skin) {
    if (!ui.shipDetailsDialog || !ui.shipDetailsList) return;
    ui.shipDetailsKicker.textContent = skin.secret ? 'NAVE SECRETA · DOSSIÊ DE HABILIDADES' : 'DOSSIÊ DE HABILIDADES';
    ui.shipDetailsTitle.textContent = skin.name;
    ui.shipDetailsSummary.textContent = 'Habilidade E: ' + skin.ability + ' · Habilidade Q: ' + secondaryAbilityNames[skin.id];
    ui.shipDetailsList.replaceChildren();
    for (const [label, abilityName, copy] of [
      ['HABILIDADE E', skin.ability, shipAbilityDetails[skin.id].e],
      ['HABILIDADE Q', secondaryAbilityNames[skin.id], shipAbilityDetails[skin.id].q]
    ]) {
      const detail = document.createElement('section'); detail.className = 'starfall-rank-detail-card starfall-ship-detail-card';
      const kicker = document.createElement('small'); kicker.className = 'starfall-ship-detail-key'; kicker.textContent = label;
      const heading = document.createElement('h3'); heading.textContent = abilityName;
      const description = document.createElement('p'); description.textContent = copy;
      detail.append(kicker, heading, description); ui.shipDetailsList.append(detail);
    }
    ui.shipDetailsCooldowns.textContent = 'Recargas e melhorias · ' + shipCooldownSummary(skin);
    if (typeof ui.shipDetailsDialog.showModal === 'function') ui.shipDetailsDialog.showModal();
    else ui.shipDetailsDialog.setAttribute('open', '');
  }
  function renderSkinPicker() {
    if (!ui.skinPicker) return;
    ui.skinPicker.replaceChildren();
    skins.forEach((skin) => {
      const unlocked = skinUnlocked(skin);
      const concealed = Boolean(skin.ownerOnly && !unlocked);
      const card = document.createElement('article');
      card.className = 'starfall-skin-card' + (skin.id === state.selectedSkin ? ' is-selected' : '') + (skin.secret ? ' is-secret' : '') + (!unlocked ? ' is-locked' : '');
      card.style.setProperty('--skin-color', skin.color);
      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'starfall-skin-select';
      select.setAttribute('aria-pressed', String(skin.id === state.selectedSkin));
      select.setAttribute('aria-label', concealed ? 'Nave secreta indisponível' : unlocked ? (skin.id === state.selectedSkin ? 'Nave equipada: ' : 'Equipar nave ') + skin.name : skin.secret ? 'Abrir desbloqueio da nave secreta ' + skin.name : skin.name + ' · desbloqueia na onda ' + skin.unlockWave);
      select.disabled = !unlocked && (!skin.secret || (skin.ownerOnly && skin.id !== 'prisma'));
      const icon = document.createElement('span');
      icon.className = 'starfall-skin-icon' + (concealed ? ' starfall-prism-icon is-concealed' : skin.shape === 'eclipse' ? ' starfall-eclipse-sprite' : skin.shape === 'dino' ? ' starfall-dino-icon starfall-dino-image-wrap' : skin.shape === 'prism' ? ' starfall-prism-icon' : '');
      icon.setAttribute('aria-hidden', 'true');
      if (concealed) icon.textContent = '?';
      else if (skin.shape === 'dino') { const image = document.createElement('img'); image.src = 'saurion-raptor-skill.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape !== 'eclipse') icon.textContent = skin.shape === 'reflector' ? '◈' : skin.shape === 'prism' ? '◇' : '✦';
      const name = document.createElement('strong'); name.textContent = concealed ? 'NAVE DESCONHECIDA' : skin.name;
      const primary = document.createElement('span'); primary.className = 'starfall-skin-skill'; primary.innerHTML = '<kbd>E</kbd><span>' + (concealed ? 'SINAL SELADO' : skin.ability) + '</span>';
      const secondary = document.createElement('span'); secondary.className = 'starfall-skin-skill'; secondary.innerHTML = '<kbd>Q</kbd><span>' + (concealed ? 'SINAL SELADO' : secondaryAbilityNames[skin.id]) + '</span>';
      const status = document.createElement('small');
      status.className = 'starfall-skin-status';
      status.textContent = concealed ? 'ACESSO RESTRITO' : unlocked ? skin.id === state.selectedSkin ? skin.id === 'prisma' ? 'EQUIPADA · FORA DO PLACAR' : 'EQUIPADA' : 'EQUIPAR' : skin.secret ? 'SECRETA · LIBERAR' : 'DESBLOQUEIA NA ONDA ' + skin.unlockWave;
      select.append(icon, name, primary, secondary, status);
      select.addEventListener('click', () => {
        if (skin.ownerOnly && skin.id !== 'prisma' && !skinUnlocked(skin)) return;
        if (skin.secret && !skinUnlocked(skin)) { openSecretShipUnlock(skin.id); return; }
        if (!skinUnlocked(skin) || state.mode === 'playing' || state.mode === 'upgrade') return;
        state.selectedSkin = skin.id;
        try { localStorage.setItem('cv-games-cv-starfall-skin', skin.id); } catch { /* A escolha vale para esta sessão. */ }
        renderSkinPicker();
        updateEquippedShip();
        updateControlUI();
        persistAccountShipProgress();
        ui.copy.textContent = skin.id === 'prisma'
          ? 'Prisma Real equipada: nave especial de teste. As missões com ela não são enviadas ao Top 10; seus recordes continuam salvos neste aparelho.'
          : 'Cada nave tem habilidades especiais. Use E e Q para ativá-las; abra Naves e Habilidades e selecione Ver detalhes para conhecer cada poder.';
        closeShips();
        if (skin.id === 'prisma' && ui.prismRankNotice) {
          ui.prismRankNotice.hidden = false;
          syncAudioVisibility();
          ui.prismRankNotice.querySelector('[data-close-prism-rank-notice]')?.focus();
        }
      });
      const details = document.createElement('button');
      details.type = 'button'; details.className = 'starfall-skin-details-trigger'; details.textContent = concealed ? 'Arquivo selado' : 'Ver detalhes';
      details.disabled = concealed;
      details.setAttribute('aria-label', concealed ? 'Detalhes da nave secreta indisponíveis' : 'Ver detalhes das habilidades da nave ' + skin.name);
      details.addEventListener('click', () => { if (!concealed) openShipDetails(skin); });
      card.append(select, details);
      ui.skinPicker.append(card);
    });
  }
  function makeStars() {
    const count = state.performanceMode === 'light' ? 34 : 100;
    state.stars = Array.from({ length: count }, () => ({ x: visualRandom(0, state.width), y: visualRandom(0, state.height), z: visualRandom(.25, 1), phase: visualRandom(0, 7) }));
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dprLimit = state.performanceMode === 'light' ? 1 : state.mobileSizing ? 1.35 : 2;
    state.dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
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
    state.player = { x: state.width / 2, y: state.height * .78, radius: mobileSize(13), speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, moveAngle: -Math.PI / 2, color: skin.color, accent: skin.accent, shape: skin.shape };
    state.upgrades = {}; state.abilityCooldown = 0; state.abilityBaseCooldown = skin.cooldown; state.abilityPower = 1; state.slowTime = 0; state.adminNoCooldown = isDeveloperProfile(); state.adminBuffsActive = false;
    state.prismDispatchSkinId = ''; state.prismDispatchSlot = ''; state.prismQCooldown = 0; state.prismHorizonAnchor = null; state.prismHorizonWindowBonus = 0; state.prismHorizonDamageBonus = 0; state.prismCoreRangeBonus = 0; state.prismCoreDamageBonus = 0; state.prismCooldownBonus = 0;
    state.scoreMultiplier = 1; state.magnet = 105; state.pierce = 0; state.critChance = 0; state.armorChance = 0; state.regenLevel = 0; state.regenTimer = 24; state.drones = 0; state.droneCooldown = 0; state.lastBossType = '';
    state.blastRadius = 0; state.bossDamageBonus = 0; state.bonusShots = 0; state.lowHullBoost = 0; state.salvageHeal = 0; state.singularityRadius = 235; state.singularityDuration = 6.5; state.tempestTideCooldown = 0; state.tempestTideRadiusBonus = 0; state.tempestTideForceBonus = 0; state.reflectTime = 0; state.reflectContacts = new Set(); state.reflectDamageBonus = 0; state.reflectDurationBonus = 0; state.redshiftPerimeter = null; state.redshiftPerimeterCooldown = 0; state.redshiftPerimeterDurationBonus = 0; state.redshiftPerimeterDamageBonus = 0; state.redshiftPerimeterRangeBonus = 0; state.flashTrail = null; state.flashTrailCooldown = 0; state.flashTrailDurationBonus = 0; state.flashTrailDamageBonus = 0; state.flashTrailDensity = 0; state.flashTrailContacts = new Set(); state.eclipseTime = 0; state.eclipsePhase = 'idle'; state.eclipseCutTimer = 0; state.eclipseDurationBonus = 0; state.eclipseCutBonus = 0; state.eclipseCutDamage = 0; state.eclipseHitCooldowns = []; state.eclipseImpactCooldown = 0; state.eclipseDecoy = null; state.eclipseDecoyCooldown = 0; state.eclipseDecoyAI = 0; state.eclipseDecoyDurationBonus = 0; state.eclipseDecoyChaos = 0; state.dinoRoarBonus = 0; state.dinoRoarRangeBonus = 0; state.dinoStampedeCharges = 3; state.dinoStampedeRecharge = 0; state.dinoStampedeExtra = 0; state.dinoStampedeDamageBonus = 0; state.endlessDamage = 0; state.endlessSpeed = 0;
    state.waveDamageTaken = false;
    state.auroraLink = null; state.auroraLinkCooldown = 0; state.auroraLinkDurationBonus = 0; state.auroraLinkTargetBonus = 0; state.auroraLinkDamageBonus = 0; state.damageCounterTotal = 0; state.damageCounterLastHit = 0; state.damageCounterIdle = 0; state.damageCounterPopups = [];
    state.shipEWasCooling = false; state.shipQWasCooling = false; state.shipQChargeCount = skin.id === 'tempest' ? state.tempestTideCharges : skin.id === 'saurion' ? state.dinoStampedeCharges : null;
    state.aegisOrbit = null; state.aegisOrbitCooldown = 0; state.aegisOrbitDurationBonus = 0; state.aegisOrbitCountBonus = 0; state.aegisOrbitDamageBonus = 0;
    state.tempestTideCharges = 3; state.tempestTideChargeBonus = 0; state.tempestTideDamageBonus = 0; state.tempestTideSweepBonus = 0;
    state.chronosEcho = null; state.chronosEchoQueue = []; state.chronosEchoCooldown = 0; state.chronosEchoDurationBonus = 0; state.chronosEchoDamageBonus = 0;
    if (isAllUpgradesProfile() && !state.dailyChallenge) grantAllUpgrades();
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    if (ui.runSummary) { ui.runSummary.hidden = true; ui.runSummary.replaceChildren(); }
    renderSkinPicker();
    updateEquippedShip();
    updateHud();
  }
  function restoreMissionCheckpoint(checkpoint) {
    if (!checkpoint) return;
    const profileBestWave = readProfileResumeWave();
    const beforeBestWave = Math.max(state.bestCompletedWave, readBestWave(), profileBestWave);
    Object.entries(checkpoint.stats || {}).forEach(([key, value]) => {
      if (key in state && typeof state[key] === 'number' && Number.isFinite(Number(value)) && !['width', 'height', 'dpr', 'lastTime', 'raf'].includes(key)) state[key] = Number(value);
    });
    state.bestCompletedWave = Math.max(beforeBestWave, Number(checkpoint.bestCompletedWave) || 0);
    state.wave = Math.max(1, Number(checkpoint.wave) || 1, profileBestWave);
    state.score = Math.max(0, Number(checkpoint.score) || 0);
    state.elapsed = Math.max(0, Number(checkpoint.elapsed) || 0);
    if (typeof checkpoint.lastBossType === 'string') state.lastBossType = checkpoint.lastBossType;
    state.upgrades = Object.fromEntries(Object.entries(checkpoint.upgrades || {}).filter(([, level]) => Number(level) > 0).map(([id, level]) => [id, Math.floor(Number(level))]));
    const player = checkpoint.player || {};
    state.player = {
      ...state.player,
      x:clamp((Number(player.xRatio) || .5) * state.width, state.player.radius, state.width - state.player.radius),
      y:clamp((Number(player.yRatio) || .78) * state.height, state.player.radius, state.height - state.player.radius),
      speed:Math.max(80, Number(player.speed) || state.player.speed), damage:Math.max(.1, Number(player.damage) || state.player.damage),
      fireRate:Math.max(.08, Number(player.fireRate) || state.player.fireRate), spread:Math.max(1, Math.floor(Number(player.spread) || state.player.spread)),
      angle:Number.isFinite(Number(player.angle)) ? Number(player.angle) : state.player.angle,
      moveAngle:Number.isFinite(Number(player.moveAngle)) ? Number(player.moveAngle) : state.player.moveAngle,
      color:currentSkin().color, accent:currentSkin().accent, shape:currentSkin().shape
    };
    state.auroraLink = null; state.aegisOrbit = null; state.chronosEcho = null; state.chronosEchoQueue = [];
    state.prismHorizonAnchor = null; state.redshiftPerimeter = null; state.flashTrail = null;
    state.eclipseDecoy = null; state.eclipsePhase = 'idle'; state.eclipseTime = 0; state.eclipseCutTimer = 0;
    state.reflectTime = 0; state.reflectContacts = new Set(); state.flashTrailContacts = new Set();
    state.damageCounterPopups = []; state.damageCounterIdle = 0; state.shipEWasCooling = false; state.shipQWasCooling = false;
    saveBestWave();
    renderSkinPicker(); updateEquippedShip(); updateHud();
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
  function startGame(dailyChallenge = false, checkpoint = null) {
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
    if (checkpoint && !dailyChallenge) {
      const savedSkin = skins.find((skin) => skin.id === checkpoint.shipId);
      if (savedSkin && skinUnlocked(savedSkin)) state.selectedSkin = savedSkin.id;
    }
    resetGame();
    if (checkpoint && !dailyChallenge) restoreMissionCheckpoint(checkpoint);
    else if (!dailyChallenge) clearMissionCheckpoint();
    setMode('playing');
    if (checkpoint && !dailyChallenge) {
      beginNextWave();
      ui.status.textContent = `Missão retomada na onda ${state.wave}. A onda começa novamente com seus pontos e melhorias guardados.`;
      toast(`MISSÃO RETOMADA · ONDA ${state.wave}`);
    } else {
      ui.status.textContent = state.dailyChallenge ? `Desafio diário de ${formatChallengeDate(state.challengeDate)}. Boa sorte, piloto!` : isAllUpgradesProfile() ? 'Missão iniciada com todos os upgrades disponíveis.' : 'Missão iniciada. Sobreviva à primeira onda!';
      if (state.dailyChallenge) toast('DESAFIO DIÁRIO · NAVE AURORA');
      else if (isAllUpgradesProfile()) toast('UPGRADES MÁXIMOS EQUIPADOS');
      recordAchievementEvent('mission');
      recordAchievementEvent('wave', state.wave);
      if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    }
    state.lastTime = performance.now();
    state.raf = requestAnimationFrame(frame);
  }
  function pauseGame() {
    if (state.mode === 'playing') {
      state.keys.clear(); state.pointer.active = false; releaseAnalog();
      setMode('paused'); ui.title.textContent = 'Missão pausada'; ui.copy.textContent = 'Respire fundo. Sua nave está segura por enquanto.';
      ui.start.textContent = '▶ RETOMAR MISSÃO';
      const saved = saveMissionCheckpoint();
      ui.status.textContent = state.dailyChallenge ? 'Desafio pausado.' : saved ? 'Missão salva neste aparelho. Você pode retomá-la depois.' : 'Jogo pausado.';
      cancelAnimationFrame(state.raf);
    } else if (state.mode === 'paused') {
      setMode('playing'); ui.status.textContent = 'Missão retomada.'; state.lastTime = performance.now(); state.raf = requestAnimationFrame(frame);
    }
  }
  function finishGame() {
    if (state.mode === 'gameover') return;
    if (!state.dailyChallenge) clearMissionCheckpoint();
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
        recarga: state.player.fireRate.toFixed(2) + 's', recarga_habilidade: state.abilityBaseCooldown.toFixed(1) + 's', disparos: state.player.spread + state.bonusShots,
        drones: state.drones, perfuracao: state.pierce, chance_critica: Math.round(state.critChance * 100) + '%',
        escudos: state.shields, vida_maxima: state.maxLives, reparo_dest: Math.round(state.salvageHeal * 3.5) + '%',
        explosao: state.blastRadius, dano_chefe: Math.round(state.bossDamageBonus * 100) + '%', buraco_negro: currentSkin().id === 'tempest' ? Math.round(state.singularityRadius) : 0,
        melhorias: Object.values(state.upgrades).reduce((sum, value) => sum + value, 0),
        reforco_adaptativo: Math.round(state.endlessDamage * 100) + '%', impulso_extra: Math.round(state.endlessSpeed), magnetismo: Math.round(state.magnet),
        melhorias_detalhadas: upgradeList.filter((upgrade) => upgradeLevel(upgrade.id) > 0).map((upgrade) => ({ id: upgrade.id, nome: upgrade.name, icone: upgrade.icon, nivel: upgradeLevel(upgrade.id) }))
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
    } else if (run.ship_id === 'prisma') {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Missão com a Prisma Real: não conta para o placar. Seu recorde local foi guardado.';
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
    state.damageCounterTotal = 0; state.damageCounterLastHit = 0; state.damageCounterIdle = 0; state.damageCounterPopups = [];
    if (!state.waveDamageTaken) recordAchievementEvent('clean-wave');
    recordAchievementEvent('wave', completedWave);
    if (state.wave > state.bestCompletedWave) { state.bestCompletedWave = state.wave; saveBestWave(); renderSkinPicker(); persistAccountShipProgress(); }
    saveNicknameCompletedWave(profileNickname(), completedWave);
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
    const maxParticles = particleLimit();
    for (let i = 0; i < particleCount && state.particles.length < maxParticles; i++) {
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
      const shot = { x: state.player.x + Math.cos(direction) * mobileSize(13), y: state.player.y + Math.sin(direction) * mobileSize(13), vx: Math.cos(direction) * 510, vy: Math.sin(direction) * 510, r: mobileSize(critical ? 5 : 3.5), damage: state.player.damage * (1 + state.endlessDamage) * (critical ? 2 : 1), pierce: state.pierce, hit: [], assistTarget: bossAssist ? target : null, color: critical ? '#ffe38a' : currentSkin().accent };
      state.bullets.push(shot);
      queueChronosEcho(shot);
    }
    tone(420, .035, 'square', .01);
  }
  function fireEclipseDecoyAt(decoy, target) {
    if (!decoy || !target) return;
    const angle = Math.atan2(target.y - decoy.y, target.x - decoy.x);
    const speed = mobileSize(455);
    state.bullets.push({
      x: decoy.x + Math.cos(angle) * mobileSize(12),
      y: decoy.y + Math.sin(angle) * mobileSize(12),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: mobileSize(2.8),
      damage: Math.max(.25, state.player.damage * .42),
      pierce: 0,
      hit: [],
      color: '#d8bdff',
      eclipseDecoyShot: true
    });
  }
  function queueChronosEcho(shot) {
    if (!abilitySourceIs('chronos') || !state.chronosEcho || state.chronosEcho.life <= 0 || state.chronosEchoQueue.length >= 420) return;
    const echoBullet = { ...shot, damage: shot.damage * (.4 + state.chronosEchoDamageBonus), color: '#d6c4ff', hit: [], chronosEchoShot: true };
    state.chronosEchoQueue.push({ delay: .42, bullet: echoBullet });
  }
  function enemyAimTarget() {
    return abilitySourceIs('eclipse') && state.eclipseDecoy?.life > 0 ? state.eclipseDecoy : state.player;
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
  function reflectAuroraLinkDamage(livesLost) {
    const ability = state.auroraLink;
    if (!abilitySourceIs('aurora') || !ability || ability.life <= 0 || livesLost <= 0) return;
    const linked = ability.targets?.filter((enemy) => enemy && !enemy.dead) || [];
    if (!linked.length) return;
    const reflectedDamage = Math.floor(livesLost) * 2;
    for (let index = 0; index < linked.length; index++) {
      const enemy = linked[index];
      const x1 = state.player.x; const y1 = state.player.y;
      const dx = enemy.x - x1; const dy = enemy.y - y1;
      const length = Math.hypot(dx, dy) || 1;
      const bend = (index % 2 ? 1 : -1) * Math.min(18, length * .08);
      const damageBeforeBossBonus = enemy.kind === 'boss' ? reflectedDamage / (1 + state.bossDamageBonus) : reflectedDamage;
      damageEnemy(enemy, damageBeforeBossBonus, true);
      state.effects.push({ type: 'aurora-link', x1, y1, x2: enemy.x, y2: enemy.y, cx: (x1 + enemy.x) / 2 - dy / length * bend, cy: (y1 + enemy.y) / 2 + dx / length * bend, life: .3, total: .3, phase: index });
      state.effects.push({ type: 'aurora-link-node', x: enemy.x, y: enemy.y, life: .3, total: .3, phase: index });
      burst(enemy.x, enemy.y, '#eafffb', enemy.kind === 'boss' ? 5 : 3, 44);
    }
  }
  function damagePlayer(amount = 1) {
    if (state.eclipsePhase === 'active' || state.invulnerable > 0 || state.mode !== 'playing' || (abilitySourceIs('aegis') && state.aegisOrbit?.life > 0)) return;
    if (randomUnit('combat') < state.armorChance) { state.invulnerable = .28; toast('BLINDAGEM REATIVA'); tone(480, .1, 'triangle', .025); return; }
    let remaining = Math.max(1, Math.floor(amount));
    const tempUsed = Math.min(state.tempShields, remaining); state.tempShields -= tempUsed; remaining -= tempUsed;
    const regularUsed = Math.min(state.shields, remaining); state.shields -= regularUsed; remaining -= regularUsed;
    if (remaining === 0) { state.invulnerable = .82; toast(tempUsed ? 'BARREIRA AEGIS ABSORVEU O IMPACTO' : 'ESCUDO ABSORVEU O IMPACTO'); tone(680, .18, 'triangle', .04); updateHud(); return; }
    if (tempUsed || regularUsed) toast('IMPACTO ROMPEU SEUS ESCUDOS');
    if (state.drones > 0 && state.lives - remaining <= 0) {
      const livesBeforeSave = state.lives;
      sacrificeDrone();
      state.lives = 1;
      reflectAuroraLinkDamage(Math.max(0, livesBeforeSave - state.lives));
      state.invulnerable = 1.35;
      burst(state.player.x, state.player.y, currentSkin().color, 24, 170);
      updateHud();
      return;
    }
    state.waveDamageTaken = true;
    const livesBeforeHit = state.lives;
    state.lives = Math.max(0, state.lives - remaining);
    reflectAuroraLinkDamage(Math.max(0, livesBeforeHit - state.lives));
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
    const appliedDamage = Math.min(Math.max(0, enemy.hp), Math.max(0, amount));
    recordDamageCounter(appliedDamage, enemy);
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
  function recordDamageCounter(amount, enemy) {
    if (!state.damageCounterEnabled || amount <= 0) return;
    state.damageCounterTotal += amount;
    state.damageCounterLastHit = amount;
    state.damageCounterIdle = 0;
    const offset = state.damageCounterPopups.length;
    state.damageCounterPopups.push({
      x: enemy.x + ((offset % 3) - 1) * mobileSize(8),
      y: enemy.y - enemy.r - Math.floor(offset / 3 % 3) * mobileSize(7),
      amount,
      life: .9,
      total: .9
    });
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
  function finishEclipseDecoy() {
    const decoy = state.eclipseDecoy;
    if (!decoy) return;
    state.eclipseDecoy = null;
    const radius = mobileSize(92);
    state.effects.push({ type: 'eclipse-decoy-burst', x: decoy.x, y: decoy.y, radius, life: .42, total: .42 });
    burst(decoy.x, decoy.y, '#bd91ff', 18, 120);
    burst(decoy.x, decoy.y, '#f2e8ff', 9, 76);
    for (const enemy of state.enemies) {
      if (!enemy.dead && distance(enemy, decoy) <= radius + enemy.r * .35) damageEnemy(enemy, 1.6, true);
    }
    tone(470, .11, 'triangle', .027);
    updateAbilityButton();
  }
  function eclipseDecoyCruiseSpeed() {
    const ai = clamp(state.eclipseDecoyAI || 0, 0, 4);
    const playerSpeed = state.player?.speed || 260;
    return mobileSize(playerSpeed * .84 + ai * 2);
  }
  function updateEclipseDecoy(dt) {
    const decoy = state.eclipseDecoy;
    if (!decoy || !abilitySourceIs('eclipse')) return;
    decoy.life = Math.max(0, decoy.life - dt);
    if (decoy.life <= 0) { finishEclipseDecoy(); return; }

    const ai = clamp(state.eclipseDecoyAI || 0, 0, 4);
    const margin = Math.min(mobileSize(38), state.width * .12, state.height * .12);
    const minX = margin; const maxX = Math.max(minX, state.width - margin);
    const minY = margin; const maxY = Math.max(minY, state.height - margin);
    const chaos = clamp(state.eclipseDecoyChaos || 0, 0, 3);
    decoy.turnTimer = Math.max(0, (decoy.turnTimer || 0) - dt);
    if (decoy.turnTimer <= 0) {
      const turnRange = 1.3 + chaos * .45;
      let turn = random(-turnRange, turnRange, 'ability');
      if (randomUnit('ability') < .12 + chaos * .06) turn += (turn < 0 ? -1 : 1) * random(1.2, 2.35, 'ability');
      decoy.turnTarget = decoy.heading + turn;
      decoy.turnTimer = random(.42 - chaos * .045, .94 - chaos * .06, 'ability');
    }
    const desiredTurn = Math.atan2(Math.sin(decoy.turnTarget - decoy.heading), Math.cos(decoy.turnTarget - decoy.heading));
    const turnSpeed = 1.55 + chaos * .24 + ai * .1;
    decoy.heading += clamp(desiredTurn, -turnSpeed * dt, turnSpeed * dt);

    let dodgeX = 0; let dodgeY = 0;
    const horizon = .4 + ai * .12;
    const awareness = mobileSize(60 + ai * 28);
    for (const bullet of state.enemyBullets) {
      if (bullet.dead || bullet.reflected) continue;
      const rx = bullet.x - decoy.x; const ry = bullet.y - decoy.y;
      const rvx = bullet.vx - decoy.vx; const rvy = bullet.vy - decoy.vy;
      const relativeSpeedSq = rvx * rvx + rvy * rvy;
      if (relativeSpeedSq < 1) continue;
      const impactTime = -(rx * rvx + ry * rvy) / relativeSpeedSq;
      if (impactTime < 0 || impactTime > horizon) continue;
      const nearX = rx + rvx * impactTime; const nearY = ry + rvy * impactTime;
      const closest = Math.hypot(nearX, nearY);
      const safeDistance = state.player.radius * .82 + bullet.r + mobileSize(8 + ai * 4);
      const detectDistance = awareness + safeDistance;
      if (closest >= detectDistance) continue;
      const weight = clamp((detectDistance - closest) / detectDistance, .12, 1) * (1 - impactTime / (horizon * 1.35));
      const awayLength = Math.hypot(nearX, nearY) || 1;
      dodgeX -= nearX / awayLength * weight;
      dodgeY -= nearY / awayLength * weight;
    }

    if (decoy.x < minX + awareness * .55) dodgeX += .55;
    if (decoy.x > maxX - awareness * .55) dodgeX -= .55;
    if (decoy.y < minY + awareness * .55) dodgeY += .55;
    if (decoy.y > maxY - awareness * .55) dodgeY -= .55;
    const dodgeLength = Math.hypot(dodgeX, dodgeY);
    if (dodgeLength > 0) { dodgeX /= dodgeLength; dodgeY /= dodgeLength; }

    const playerSpeed = state.player?.speed || 260;
    const roamSpeed = eclipseDecoyCruiseSpeed();
    const evadeSpeed = mobileSize(playerSpeed * (.12 + ai * .035)) * Math.min(1, dodgeLength);
    let targetVx = Math.cos(decoy.heading) * roamSpeed + dodgeX * evadeSpeed;
    let targetVy = Math.sin(decoy.heading) * roamSpeed + dodgeY * evadeSpeed;
    const targetSpeed = Math.hypot(targetVx, targetVy);
    const speedLimit = mobileSize(playerSpeed * .92);
    if (targetSpeed > speedLimit) { targetVx *= speedLimit / targetSpeed; targetVy *= speedLimit / targetSpeed; }
    const turnRate = (3.4 + ai * 1.25) * dt;
    decoy.vx += (targetVx - decoy.vx) * Math.min(1, turnRate);
    decoy.vy += (targetVy - decoy.vy) * Math.min(1, turnRate);
    decoy.x += decoy.vx * dt;
    decoy.y += decoy.vy * dt;
    if (decoy.x < minX || decoy.x > maxX) { decoy.x = clamp(decoy.x, minX, maxX); decoy.vx *= -.78; decoy.heading = Math.atan2(decoy.vy, decoy.vx); decoy.turnTarget = decoy.heading + random(-1.25, 1.25, 'ability'); decoy.turnTimer = random(.16, .38, 'ability'); }
    if (decoy.y < minY || decoy.y > maxY) { decoy.y = clamp(decoy.y, minY, maxY); decoy.vy *= -.78; decoy.heading = Math.atan2(decoy.vy, decoy.vx); decoy.turnTarget = decoy.heading + random(-1.25, 1.25, 'ability'); decoy.turnTimer = random(.16, .38, 'ability'); }
    decoy.angle = Math.atan2(decoy.vy, decoy.vx);
    decoy.fireTimer = Math.max(0, (decoy.fireTimer ?? .35) - dt);
    if (decoy.fireTimer <= 0) {
      const target = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(decoy, a) - distance(decoy, b))[0] || null;
      if (target) {
        fireEclipseDecoyAt(decoy, target);
        decoy.fireTimer = .9;
      } else decoy.fireTimer = .2;
    }
  }
  function activateEclipseDecoy() {
    if (currentSkin().id !== 'eclipse' || state.mode !== 'playing' || state.eclipsePhase !== 'idle' || state.eclipseDecoy?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.eclipseDecoyCooldown > 0) return;
    recordAchievementEvent('ship-ability', 'eclipse');
    const heading = state.player.angle ?? -Math.PI / 2;
    const roamSpeed = eclipseDecoyCruiseSpeed();
    const duration = 4 + state.eclipseDecoyDurationBonus;
    state.eclipseDecoy = { x: state.player.x, y: state.player.y, angle: heading, heading, turnTarget: heading + random(-1.4, 1.4, 'ability'), turnTimer: random(.18, .52, 'ability'), fireTimer: .35, vx: Math.cos(heading) * roamSpeed, vy: Math.sin(heading) * roamSpeed, life: duration, total: duration };
    state.eclipseDecoyCooldown = developerProfile ? 0 : 24;
    burst(state.player.x, state.player.y, '#bd91ff', 24, 120);
    burst(state.player.x, state.player.y, '#f2e8ff', 9, 70);
    toast('ISCA UMBRAL · CÓPIA MÓVEL · ' + duration + 's');
    tone(310, .13, 'sine', .035);
    updateAbilityButton();
  }
  function dinoStampedeCooldownDuration() {
    const source = state.selectedSkin === 'prisma' && ['e','q'].some((slot) => {
      const choice = prismChoiceParts(state.prismAbilityChoices[slot]);
      return choice.shipId === 'saurion' && choice.key === 'q';
    })
      ? skins.find((skin) => skin.id === 'saurion') : currentSkin();
    return Math.max(24, source.cooldownQ - upgradeLevel('dinoResonance') * 2);
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
  function prismAbilityBusy() {
    return Boolean(state.prismHorizonAnchor?.life > 0 || state.auroraLink?.life > 0 || state.aegisOrbit?.life > 0
      || state.eclipsePhase === 'cinematic' || state.eclipsePhase === 'active' || state.eclipseDecoy?.life > 0
      || state.chronosEcho?.life > 0 || state.slowTime > 0 || state.reflectTime > 0
      || state.redshiftPerimeter?.life > 0 || state.flashTrail?.life > 0
      || state.effects.some((effect) => effect.life > 0 && ['blade','singularity-shot','tempest-tide','dino-raptor'].includes(effect.type))
      || state.enemies.some((enemy) => !enemy.dead && enemy.dinoCutMark > 0));
  }
  function prismSlotCooldown(slot) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (key === 'q' && shipId === 'tempest') return state.tempestTideCharges > 0 ? 0 : state.tempestTideCooldown;
    if (key === 'q' && shipId === 'saurion') return state.dinoStampedeCharges > 0 ? 0 : state.dinoStampedeRecharge;
    return slot === 'q' ? state.prismQCooldown : state.abilityCooldown;
  }
  function setPrismSlotCooldown(slot, value) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (key === 'q' && (shipId === 'tempest' || shipId === 'saurion')) return;
    if (slot === 'q') state.prismQCooldown = value;
    else state.abilityCooldown = value;
  }
  function prismChoiceActive(slot) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (shipId === 'prisma') return key === 'q' ? Boolean(state.prismHorizonAnchor?.life > 0) : state.effects.some((effect) => effect.type === 'prism-core-wave' && effect.life > 0);
    if (key === 'e') return shipId === 'eclipse' ? ['cinematic','active'].includes(state.eclipsePhase)
      : shipId === 'aegis' ? state.tempShields > 0
        : shipId === 'chronos' ? state.slowTime > 0
          : shipId === 'redshift' ? state.reflectTime > 0 : false;
    if (shipId === 'aurora') return Boolean(state.auroraLink?.life > 0);
    if (shipId === 'aegis') return Boolean(state.aegisOrbit?.life > 0);
    if (shipId === 'eclipse') return Boolean(state.eclipseDecoy?.life > 0);
    if (shipId === 'chronos') return Boolean(state.chronosEcho?.life > 0);
    if (shipId === 'redshift') return Boolean(state.redshiftPerimeter?.life > 0);
    if (shipId === 'flashblade') return Boolean(state.flashTrail?.life > 0);
    if (shipId === 'tempest') return state.effects.some((effect) => effect.type === 'tempest-tide' && effect.life > 0);
    if (shipId === 'saurion') return state.effects.some((effect) => effect.type === 'dino-raptor' && effect.life > 0);
    return false;
  }
  function prismChoiceCanActivate(slot = 'e') {
    if (state.mode !== 'playing') return false;
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    const returning = shipId === 'prisma' && key === 'q' && state.prismHorizonAnchor?.life > 0;
    if (returning) return true;
    if (!hasDeveloperPerks() && prismSlotCooldown(slot) > 0) return false;
    if (shipId === 'prisma') return true;
    if (key === 'e') return shipId !== 'eclipse' || state.eclipsePhase === 'idle';
    if (shipId === 'aurora') return !state.auroraLink?.life;
    if (shipId === 'aegis') return !state.aegisOrbit?.life;
    if (shipId === 'eclipse') return !state.eclipseDecoy?.life && state.eclipsePhase === 'idle';
    if (shipId === 'chronos') return !state.chronosEcho?.life;
    if (shipId === 'redshift') return !state.redshiftPerimeter?.life;
    if (shipId === 'flashblade') return !state.flashTrail?.life;
    if (shipId === 'tempest') return state.tempestTideCharges > 0;
    if (shipId === 'saurion') return state.dinoStampedeCharges > 0;
    return true;
  }
  function prismChoiceIcon(skin, key) {
    if (skin.id === 'prisma') return key === 'q' ? '⌖' : '✧';
    return ({ aurora:{e:'✴',q:'✧'}, aegis:{e:'⬡',q:'⬡'}, chronos:{e:'◷',q:'◌'}, tempest:{e:'◉',q:'↗'}, flashblade:{e:'✧',q:'〰'}, redshift:{e:'◈',q:'△'}, eclipse:{e:'◉',q:'◌'}, saurion:{e:'〰',q:'🐾'} })[skin.id]?.[key] || '✦';
  }
  function renderPrismWheel() {
    if (!ui.prismAbilityList) return;
    ui.prismAbilityList.replaceChildren();
    const slot = state.prismAbilitySlot;
    const selected = state.prismAbilityChoices[slot];
    const lockedByActivePower = prismAbilityBusy();
    if (ui.prismWheelStatus) ui.prismWheelStatus.textContent = lockedByActivePower
      ? 'Uma habilidade está ativa. Aguarde o efeito terminar para alterar suas escolhas.'
      : 'Escolha o poder do espaço ' + slot.toUpperCase() + '. Depois configure o outro espaço, se quiser.';
    document.querySelectorAll('[data-prism-slot]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.prismSlot === slot)));
    skins.forEach((skin) => {
      const group = document.createElement('section');
      group.className = 'starfall-prism-ship-group' + (skin.id === 'prisma' ? ' is-native' : '');
      const heading = document.createElement('h3'); heading.textContent = skin.id === 'prisma' ? 'PRISMA REAL · PODERES PRÓPRIOS' : skin.name;
      group.append(heading);
      for (const key of ['e','q']) {
        const choice = skin.id + ':' + key;
        const name = key === 'q' ? secondaryAbilityNames[skin.id] : skin.ability;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'starfall-prism-option' + (selected === choice ? ' is-selected' : '');
        button.style.setProperty('--echo-color', skin.color);
        button.disabled = lockedByActivePower && selected !== choice;
        button.setAttribute('aria-pressed', String(selected === choice));
        button.setAttribute('aria-label', 'Escolher ' + name + ' da nave ' + skin.name + ' para usar com ' + slot.toUpperCase());
        const glyph = document.createElement('span'); glyph.className = 'starfall-prism-option-glyph'; glyph.textContent = prismChoiceIcon(skin, key);
        const keys = document.createElement('small'); keys.textContent = key.toUpperCase() + ' · ' + skin.name;
        const title = document.createElement('strong'); title.textContent = name;
        button.append(glyph, keys, title);
        button.addEventListener('click', () => {
          if (lockedByActivePower && selected !== choice) return;
          setPrismChoice(choice, slot);
          renderPrismWheel();
          updateAbilityButton();
          toast('HABILIDADE ' + slot.toUpperCase() + ' · ' + name.toLocaleUpperCase('pt-BR'));
        });
        group.append(button);
      }
      ui.prismAbilityList.append(group);
    });
  }
  function openPrismWheel() {
    if (!ui.prismWheel || currentSkin().id !== 'prisma' || !['playing','paused'].includes(state.mode)) return;
    state.prismWheelWasPlaying = state.mode === 'playing';
    if (state.prismWheelWasPlaying) pauseGame();
    if (ui.overlay) ui.overlay.hidden = true;
    renderPrismWheel();
    ui.prismWheel.hidden = false;
    syncAudioVisibility();
    ui.prismWheel.querySelector('[data-close-prism-wheel]')?.focus();
  }
  function closePrismWheel() {
    if (!ui.prismWheel || ui.prismWheel.hidden) return;
    ui.prismWheel.hidden = true;
    const resume = state.prismWheelWasPlaying;
    state.prismWheelWasPlaying = false;
    if (resume && state.mode === 'paused') {
      setMode('playing');
      ui.status.textContent = 'Missão retomada.';
      state.lastTime = performance.now();
      state.raf = requestAnimationFrame(frame);
    } else if (state.mode === 'paused' && ui.overlay) ui.overlay.hidden = false;
    syncAudioVisibility();
    updateAbilityButton();
    ui.prismSelect?.focus({ preventScroll:true });
  }
  function prismCopiedEffect(skinId) {
    const source = skins.find((skin) => skin.id === skinId) || skins[0];
    state.effects.push({ type:'prism-echo', x:state.player.x, y:state.player.y, color:source.color, life:.58, total:.58 });
  }
  function pushPrismPulse(enemy, originX, originY, strength = 1, stun = .3) {
    const angle = Math.atan2(enemy.y - originY, enemy.x - originX);
    enemy.tempestRepulse = { time: .42, total: .42, vx: Math.cos(angle) * (185 * strength), vy: Math.sin(angle) * (185 * strength), spin: (enemy.x < originX ? -1 : 1) * 2.1 };
    enemy.prismStun = Math.max(enemy.prismStun || 0, enemy.kind === 'boss' ? stun * .45 : stun);
  }
  function activatePrismCore() {
    const slot = state.prismDispatchSlot || 'e';
    if (state.mode !== 'playing' || (!hasDeveloperPerks() && prismSlotCooldown(slot) > 0)) return;
    const radius = mobileSize(205 + state.prismCoreRangeBonus);
    setPrismSlotCooldown(slot, hasDeveloperPerks() ? 0 : prismCooldownDuration());
    state.effects.push({ type:'prism-core-wave', x:state.player.x, y:state.player.y, radius:0, maxRadius:radius, life:.82, total:.82 });
    state.effects.push({ type:'prism-core-flash', x:state.player.x, y:state.player.y, life:.34, total:.34 });
    let hitCount = 0;
    for (const enemy of state.enemies) {
      const gap = distance(state.player, enemy);
      if (enemy.dead || gap > radius + enemy.r) continue;
      const power = 7 + state.prismCoreDamageBonus;
      damageEnemy(enemy, power * state.abilityPower * (enemy.kind === 'boss' ? .62 : 1), true);
      pushPrismPulse(enemy, state.player.x, state.player.y, enemy.kind === 'boss' ? .36 : 1, .42);
      burst(enemy.x, enemy.y, enemy.kind === 'boss' ? '#ffe29a' : '#59e9f2', enemy.kind === 'boss' ? 7 : 4, 90);
      hitCount++;
    }
    burst(state.player.x, state.player.y, '#59e9f2', 38, 230);
    burst(state.player.x, state.player.y, '#ffe29a', 18, 155);
    recordAchievementEvent('ship-ability', 'prisma');
    toast(hitCount ? 'NÚCLEO PRISMA · ' + hitCount + ' ALVOS' : 'NÚCLEO PRISMA · ONDA DE IMPACTO');
    tone(520, .24, 'sine', .045);
    updateAbilityButton();
  }
  function activatePrismHorizon() {
    if (state.mode !== 'playing') return;
    if (state.prismHorizonAnchor?.life > 0) {
      const anchor = state.prismHorizonAnchor;
      state.player.x = clamp(anchor.x, state.player.radius + 3, state.width - state.player.radius - 3);
      state.player.y = clamp(anchor.y, state.player.radius + 3, state.height - state.player.radius - 3);
      state.prismHorizonAnchor = null;
      state.invulnerable = Math.max(state.invulnerable, .62);
      const radius = mobileSize(150);
      state.effects.push({ type:'prism-return-wave', x:state.player.x, y:state.player.y, radius:0, maxRadius:radius, life:.68, total:.68 });
      let hitCount = 0;
      for (const enemy of state.enemies) {
        if (enemy.dead || distance(state.player, enemy) > radius + enemy.r) continue;
        damageEnemy(enemy, (4 + state.prismHorizonDamageBonus) * state.abilityPower * (enemy.kind === 'boss' ? .58 : 1), true);
        pushPrismPulse(enemy, state.player.x, state.player.y, enemy.kind === 'boss' ? .3 : .78, .28);
        burst(enemy.x, enemy.y, '#ffe29a', 4, 72);
        hitCount++;
      }
      burst(state.player.x, state.player.y, '#59e9f2', 24, 145);
      burst(state.player.x, state.player.y, '#ffffff', 11, 96);
      toast('DOBRA DE HORIZONTE · RETORNO' + (hitCount ? ' · ' + hitCount + ' ALVOS' : ''));
      tone(690, .16, 'triangle', .04);
      updateAbilityButton();
      return;
    }
    const slot = state.prismDispatchSlot || 'e';
    if (!hasDeveloperPerks() && prismSlotCooldown(slot) > 0) return;
    const duration = 4 + state.prismHorizonWindowBonus;
    state.prismHorizonAnchor = { x:state.player.x, y:state.player.y, life:duration, total:duration };
    setPrismSlotCooldown(slot, hasDeveloperPerks() ? 0 : prismCooldownDuration());
    state.effects.push({ type:'prism-anchor-start', x:state.player.x, y:state.player.y, life:.46, total:.46 });
    burst(state.player.x, state.player.y, '#ffe29a', 13, 84);
    toast('PONTO DE RETORNO MARCADO · ' + duration + 's');
    tone(780, .12, 'sine', .035);
    updateAbilityButton();
  }
  function activatePrismAbilityChoice(slot = 'e') {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    const isHorizonReturn = shipId === 'prisma' && key === 'q' && state.prismHorizonAnchor?.life > 0;
    if (!prismChoiceCanActivate(slot)) { updateAbilityButton(); return; }
    const previousECooldown = state.abilityCooldown;
    const previousQCooldown = state.prismQCooldown;
    state.prismDispatchSlot = slot;
    if (shipId === 'prisma') {
      if (key === 'q') activatePrismHorizon();
      else activatePrismCore();
    } else {
      state.prismDispatchSkinId = shipId;
      state.abilityCooldown = 0;
      if (key === 'e') activateAbility();
      else {
        const qCooldownFields = {
          aurora:'auroraLinkCooldown', aegis:'aegisOrbitCooldown', eclipse:'eclipseDecoyCooldown',
          chronos:'chronosEchoCooldown', redshift:'redshiftPerimeterCooldown', flashblade:'flashTrailCooldown',
          tempest:'tempestTideCooldown', saurion:'dinoStampedeRecharge'
        };
        const cooldownField = qCooldownFields[shipId];
        if (cooldownField) state[cooldownField] = 0;
        activateSecondaryAbility();
        if (cooldownField && shipId !== 'tempest' && shipId !== 'saurion') state[cooldownField] = 0;
      }
      state.prismDispatchSkinId = '';
      if (slot === 'q') state.abilityCooldown = previousECooldown;
      if (slot === 'e') state.prismQCooldown = previousQCooldown;
      if (!hasDeveloperPerks() && !isHorizonReturn) setPrismSlotCooldown(slot, prismCooldownDuration());
      if (!isHorizonReturn) prismCopiedEffect(shipId);
    }
    state.prismDispatchSlot = '';
    updateAbilityButton();
  }
  function activateSecondaryAbility() {
    if (currentSkin().id === 'prisma' && !state.prismDispatchSkinId) { activatePrismAbilityChoice('q'); return; }
    if (currentSkin().id === 'aurora') activateAuroraLink();
    else if (currentSkin().id === 'aegis') activateAegisOrbit();
    else if (currentSkin().id === 'eclipse') activateEclipseDecoy();
    else if (currentSkin().id === 'chronos') activateChronosEcho();
    else if (currentSkin().id === 'redshift') activateRedshiftPerimeter();
    else if (currentSkin().id === 'flashblade') activateFlashTrail();
    else if (currentSkin().id === 'saurion') activateDinoStampede();
    else if (currentSkin().id === 'tempest') activateTempestTide();
  }
  function auroraLinkDuration() { return Math.min(7, 5 + state.auroraLinkDurationBonus); }
  function auroraLinkMaxTargets() { return Math.min(8, 5 + state.auroraLinkTargetBonus); }
  function auroraLinkPulseDamage() { return 1.2 + state.auroraLinkDamageBonus; }
  function auroraLinkCooldownDuration() { return Math.max(22, 28 - upgradeLevel('auroraLinkCooldown') * 2); }
  function auroraLinkChain() {
    const first = nearestEnemy();
    if (!first) return [];
    const chain = [first];
    const reach = Math.max(mobileSize(230), state.width * .34);
    while (chain.length < auroraLinkMaxTargets()) {
      const from = chain[chain.length - 1];
      const next = state.enemies.filter((enemy) => !enemy.dead && !chain.includes(enemy))
        .map((enemy) => ({ enemy, gap: distance(from, enemy) }))
        .filter((entry) => entry.gap <= reach)
        .sort((a, b) => a.gap - b.gap)[0]?.enemy;
      if (!next) break;
      chain.push(next);
    }
    return chain;
  }
  function emitAuroraLinkPulse() {
    const chain = auroraLinkChain();
    if (state.auroraLink) state.auroraLink.targets = chain;
    if (!chain.length) return;
    for (let index = 0; index < chain.length; index++) {
      const enemy = chain[index];
      if (enemy.dead) continue;
      const bossScale = enemy.kind === 'boss' ? .72 : 1;
      damageEnemy(enemy, auroraLinkPulseDamage() * state.abilityPower * bossScale, true);
      state.effects.push({ type: 'aurora-link-node', x: enemy.x, y: enemy.y, life: .25, total: .25, phase: index });
      burst(enemy.x, enemy.y, index % 2 ? '#bffff5' : '#7df7e8', enemy.kind === 'boss' ? 5 : 3, 48);
      if (index > 0) {
        const from = chain[index - 1];
        const dx = enemy.x - from.x; const dy = enemy.y - from.y;
        const bend = ((index % 2) ? 1 : -1) * Math.min(22, Math.hypot(dx, dy) * .12);
        state.effects.push({ type: 'aurora-link', x1: from.x, y1: from.y, x2: enemy.x, y2: enemy.y, cx: (from.x + enemy.x) / 2 - dy / (Math.hypot(dx, dy) || 1) * bend, cy: (from.y + enemy.y) / 2 + dx / (Math.hypot(dx, dy) || 1) * bend, life: .34, total: .34, phase: index });
      }
    }
    tone(740, .06, 'sine', .014);
  }
  function activateAuroraLink() {
    if (currentSkin().id !== 'aurora' || state.mode !== 'playing' || state.auroraLink?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.auroraLinkCooldown > 0) return;
    const duration = auroraLinkDuration();
    state.auroraLink = { life: duration, total: duration, pulseTimer: .08, targets: auroraLinkChain() };
    state.auroraLinkCooldown = developerProfile ? 0 : auroraLinkCooldownDuration();
    state.effects.push({ type: 'aurora-link-start', x: state.player.x, y: state.player.y, life: .5, total: .5, phase: 0 });
    state.effects.push({ type: 'aurora-link-wave', x: state.player.x, y: state.player.y, radius: Math.hypot(state.width, state.height) * 1.08, life: 1.12, total: 1.12, phase: 0 });
    burst(state.player.x, state.player.y, '#7df7e8', 16, 92);
    burst(state.player.x, state.player.y, '#bffff5', 8, 68);
    recordAchievementEvent('ship-ability', 'aurora');
    toast('ELO ESTELAR · ATÉ ' + auroraLinkMaxTargets() + ' ALVOS');
    tone(610, .17, 'sine', .035);
    updateAbilityButton();
  }
  function advanceAuroraLink(dt) {
    if (hasDeveloperPerks()) state.auroraLinkCooldown = 0;
    else state.auroraLinkCooldown = Math.max(0, state.auroraLinkCooldown - dt);
    if (!state.auroraLink) return;
    state.auroraLink.life = Math.max(0, state.auroraLink.life - dt);
    state.auroraLink.pulseTimer -= dt;
    while (state.auroraLink && state.auroraLink.life > 0 && state.auroraLink.pulseTimer <= 0) {
      emitAuroraLinkPulse();
      state.auroraLink.pulseTimer += .78;
    }
    if (state.auroraLink?.life <= 0) {
      state.auroraLink = null;
      updateAbilityButton();
    }
  }
  function shipRechargeIcon(which, skin = currentSkin()) {
    if (which !== 'q') return '✦';
    return ({ aurora:'✴', aegis:'⬡', eclipse:'◉', chronos:'◷', tempest:'↗', flashblade:'✧', redshift:'△', saurion:'✦' })[skin.id] || '✦';
  }
  function shipQRechargeState(skin = currentSkin()) {
    if (skin.id === 'aurora') return { cooldown: state.auroraLinkCooldown, charges: null };
    if (skin.id === 'aegis') return { cooldown: state.aegisOrbitCooldown, charges: null };
    if (skin.id === 'eclipse') return { cooldown: state.eclipseDecoyCooldown, charges: null };
    if (skin.id === 'chronos') return { cooldown: state.chronosEchoCooldown, charges: null };
    if (skin.id === 'tempest') return { cooldown: state.tempestTideCooldown, charges: state.tempestTideCharges };
    if (skin.id === 'flashblade') return { cooldown: state.flashTrailCooldown, charges: null };
    if (skin.id === 'redshift') return { cooldown: state.redshiftPerimeterCooldown, charges: null };
    if (skin.id === 'saurion') return { cooldown: state.dinoStampedeRecharge, charges: state.dinoStampedeCharges };
    return { cooldown: 0, charges: null };
  }
  function showShipRechargeFlash(which, iconOffsetX = 0, skin = currentSkin()) {
    state.effects.push({ type: 'skill-ready', icon: shipRechargeIcon(which, skin), iconOffsetX, color: skin.color, followShip: true, x: state.player.x, y: state.player.y, life: 1.15, total: 1.15 });
    burst(state.player.x, state.player.y, currentSkin().color, 10, 74);
    burst(state.player.x, state.player.y, '#effffb', 5, 48);
  }
  function checkShipRechargeReadiness() {
    const skin = currentSkin();
    const qState = shipQRechargeState(skin);
    if (hasDeveloperPerks()) {
      state.shipEWasCooling = false;
      state.shipQWasCooling = false;
      state.shipQChargeCount = qState.charges;
      return;
    }
    if (state.mode !== 'playing') return;
    const eCooling = state.abilityCooldown > 0;
    const qCooling = qState.cooldown > 0;
    const eReadyNow = state.shipEWasCooling && !eCooling;
    const qReadyNow = qState.charges == null
      ? state.shipQWasCooling && !qCooling
      : state.shipQChargeCount != null && qState.charges > state.shipQChargeCount;
    const simultaneous = eReadyNow && qReadyNow;
    if (eReadyNow) showShipRechargeFlash('e', simultaneous ? -13 : 0, skin);
    if (qReadyNow) showShipRechargeFlash('q', simultaneous ? 13 : 0, skin);
    state.shipEWasCooling = eCooling;
    state.shipQWasCooling = qCooling;
    state.shipQChargeCount = qState.charges;
  }
  function aegisOrbitDuration() { return Math.min(8, 6 + state.aegisOrbitDurationBonus); }
  function aegisOrbitMaxCount() { return Math.min(5, 3 + state.aegisOrbitCountBonus); }
  function aegisOrbitCooldownDuration() { return Math.max(24, 30 - upgradeLevel('aegisOrbitCooldown') * 2); }
  function aegisOrbitPoints(orbit = state.aegisOrbit) {
    if (!orbit || !state.player) return [];
    const count = orbit.fragments.length;
    const radius = state.player.radius + mobileSize(22);
    return orbit.fragments.map((active, index) => ({
      active,
      index,
      x: state.player.x + Math.cos(orbit.angle + index * Math.PI * 2 / count) * radius,
      y: state.player.y + Math.sin(orbit.angle + index * Math.PI * 2 / count) * radius
    }));
  }
  function activateAegisOrbit() {
    if (currentSkin().id !== 'aegis' || state.mode !== 'playing' || state.aegisOrbit?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.aegisOrbitCooldown > 0) return;
    const duration = aegisOrbitDuration();
    const count = aegisOrbitMaxCount();
    state.aegisOrbit = { life: duration, total: duration, angle: -Math.PI / 2, fragments: Array.from({ length: count }, () => true) };
    state.aegisOrbitCooldown = developerProfile ? 0 : aegisOrbitCooldownDuration();
    state.effects.push({ type: 'aegis-orbit-start', x: state.player.x, y: state.player.y, life: .48, total: .48 });
    burst(state.player.x, state.player.y, '#72bdff', 15, 86);
    burst(state.player.x, state.player.y, '#e8f8ff', 7, 62);
    recordAchievementEvent('ship-ability', 'aegis');
    toast('ÓRBITAS SENTINELAS · ' + count + ' FRAGMENTOS · ' + duration + 's');
    tone(480, .18, 'triangle', .04);
    updateAbilityButton();
  }
  function advanceAegisOrbit(dt) {
    if (hasDeveloperPerks()) state.aegisOrbitCooldown = 0;
    else state.aegisOrbitCooldown = Math.max(0, state.aegisOrbitCooldown - dt);
    if (!state.aegisOrbit) return;
    const orbit = state.aegisOrbit;
    orbit.life = Math.max(0, orbit.life - dt);
    orbit.angle += dt * 2.35;
    if (orbit.life <= 0) {
      const remaining = aegisOrbitPoints(orbit).filter((point) => point.active);
      for (const point of remaining) {
        state.effects.push({ type: 'aegis-orbit-release', x: point.x, y: point.y, life: .36, total: .36 });
        launchAegisSentinel(point);
      }
      if (remaining.length) {
        tone(560, .16, 'triangle', .03);
        toast('SENTINELAS REMANESCENTES · ATAQUE FINAL');
      }
      state.aegisOrbit = null;
      updateAbilityButton();
    }
  }
  function launchAegisSentinel(point) {
    const target = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(point, a) - distance(point, b))[0] || null;
    if (!target) return false;
    const angle = Math.atan2(target.y - point.y, target.x - point.x);
    const speed = 485;
    state.bullets.push({ x: point.x, y: point.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: mobileSize(4.5), damage: (2 + state.aegisOrbitDamageBonus) * state.abilityPower, pierce: 0, hit: [], assistTarget: target, color: '#a8e5ff', aegisSentinelShot: true });
    return true;
  }
  function interceptWithAegisOrbit(bullet) {
    if (!abilitySourceIs('aegis') || !state.aegisOrbit || bullet.dead || bullet.explosive || bullet.reflected) return false;
    const orbit = state.aegisOrbit;
    const orbitRadius = state.player.radius + mobileSize(22);
    let point = null;
    let nearestDistance = bullet.r + mobileSize(8);
    for (let index = 0; index < orbit.fragments.length; index++) {
      if (!orbit.fragments[index]) continue;
      const angle = orbit.angle + index * Math.PI * 2 / orbit.fragments.length;
      const x = state.player.x + Math.cos(angle) * orbitRadius;
      const y = state.player.y + Math.sin(angle) * orbitRadius;
      const gap = Math.hypot(bullet.x - x, bullet.y - y);
      if (gap < nearestDistance) { nearestDistance = gap; point = { index, x, y }; }
    }
    if (!point) return false;
    orbit.fragments[point.index] = false;
    bullet.dead = true;
    burst(point.x, point.y, '#a8e5ff', 10, 88);
    burst(point.x, point.y, '#f4fcff', 4, 50);
    state.effects.push({ type: 'aegis-orbit-intercept', x: point.x, y: point.y, life: .34, total: .34 });
    launchAegisSentinel(point);
    tone(690, .055, 'sine', .016);
    updateAbilityButton();
    return true;
  }
  function chronosEchoDuration() { return Math.min(6, 4 + state.chronosEchoDurationBonus); }
  function chronosEchoCooldownDuration() { return Math.max(22, 28 - upgradeLevel('chronosEchoCooldown') * 2); }
  function activateChronosEcho() {
    if (currentSkin().id !== 'chronos' || state.mode !== 'playing' || state.chronosEcho?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.chronosEchoCooldown > 0) return;
    const duration = chronosEchoDuration();
    state.chronosEcho = { life: duration, total: duration };
    state.chronosEchoCooldown = developerProfile ? 0 : chronosEchoCooldownDuration();
    state.effects.push({ type: 'chronos-echo-start', x: state.player.x, y: state.player.y, life: .58, total: .58, phase: random(0, Math.PI * 2, 'ability') });
    burst(state.player.x, state.player.y, '#c897ff', 18, 95);
    burst(state.player.x, state.player.y, '#efd5ff', 9, 72);
    recordAchievementEvent('ship-ability', 'chronos');
    toast('ECO DO FUTURO · DISPAROS DUPLICADOS POR ' + duration + 's');
    tone(520, .2, 'sine', .04);
    updateAbilityButton();
  }
  function advanceChronosEcho(dt) {
    if (hasDeveloperPerks()) state.chronosEchoCooldown = 0;
    else state.chronosEchoCooldown = Math.max(0, state.chronosEchoCooldown - dt);
    if (state.chronosEcho) {
      state.chronosEcho.life = Math.max(0, state.chronosEcho.life - dt);
      if (state.chronosEcho.life <= 0) state.chronosEcho = null;
    }
    const pending = [];
    for (const echo of state.chronosEchoQueue) {
      echo.delay -= dt;
      if (echo.delay <= 0) {
        state.bullets.push(echo.bullet);
        state.effects.push({ type: 'chronos-echo-flash', x: echo.bullet.x, y: echo.bullet.y, life: .24, total: .24 });
      } else pending.push(echo);
    }
    state.chronosEchoQueue = pending;
  }
  function tempestTideCooldownDuration() {
    return Math.max(22, 28 - upgradeLevel('tempestTideCooldown') * 2);
  }
  function tempestTideMaxCharges() { return 3 + state.tempestTideChargeBonus; }
  function advanceTempestTideRecharge(dt) {
    const maxCharges = tempestTideMaxCharges();
    if (hasDeveloperPerks()) { state.tempestTideCharges = maxCharges; state.tempestTideCooldown = 0; return; }
    state.tempestTideCharges = clamp(state.tempestTideCharges, 0, maxCharges);
    if (state.tempestTideCharges >= maxCharges) { state.tempestTideCooldown = 0; return; }
    state.tempestTideCooldown = Math.max(0, state.tempestTideCooldown - dt);
    if (state.tempestTideCooldown <= 0) {
      state.tempestTideCharges = Math.min(maxCharges, state.tempestTideCharges + 1);
      state.tempestTideCooldown = state.tempestTideCharges < maxCharges ? tempestTideCooldownDuration() : 0;
    }
  }
  function sweepTempestBullet(bullet, center) {
    if (!bullet || bullet.dead || bullet.reflected || bullet.explosive) return false;
    const dx = bullet.x - center.x; const dy = bullet.y - center.y;
    const d = Math.hypot(dx, dy);
    const awayAngle = d > .001 ? Math.atan2(dy, dx) : Math.atan2(-bullet.vy, -bullet.vx);
    const cross = dx * bullet.vy - dy * bullet.vx;
    const side = cross >= 0 ? 1 : -1;
    const duration = .48 + state.tempestTideSweepBonus;
    const targets = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(bullet, a) - distance(bullet, b));
    if (targets.length && randomUnit('ability') < .28) {
      bullet.reflected = true;
      bullet.reflectLife = 1.8 + state.tempestTideSweepBonus;
      bullet.tempestTideTargeted = true;
      bullet.tempestTideTarget = targets[0];
      bullet.damage = clamp(Math.max(1.45, (bullet.damage || 1) * .62 + state.tempestTideDamageBonus * .2), 1.45, 3.2);
      bullet.color = '#b6f7ff';
      bullet.r = mobileSize(clamp(bullet.r || 5, 4, 7));
      bullet.explosive = false; bullet.exploded = false; bullet.fuse = null; bullet.blastRadius = 0; bullet.bounces = 0;
      return true;
    }
    bullet.tempestTideSweep = { targetAngle: awayAngle + side * .42, time: duration, total: duration };
    return true;
  }
  function activateTempestTide() {
    if (currentSkin().id !== 'tempest' || state.mode !== 'playing') return;
    const developerProfile = hasDeveloperPerks();
    const maxCharges = tempestTideMaxCharges();
    if (!developerProfile && state.tempestTideCharges <= 0) return;
    const radius = mobileSize(245 + state.tempestTideRadiusBonus);
    const center = { x: state.player.x, y: state.player.y };
    if (developerProfile) { state.tempestTideCharges = maxCharges; state.tempestTideCooldown = 0; }
    else {
      const wasFull = state.tempestTideCharges >= maxCharges;
      state.tempestTideCharges = Math.max(0, state.tempestTideCharges - 1);
      if (wasFull) state.tempestTideCooldown = tempestTideCooldownDuration();
    }
    state.invulnerable = Math.max(state.invulnerable, .28);
    state.effects.push({ type: 'tempest-tide', x: center.x, y: center.y, radius, life: .68, total: .68, phase: random(0, Math.PI * 2, 'ability') });
    let deflectedShots = 0; let counterShots = 0;
    for (const bullet of state.enemyBullets) {
      if (Math.hypot(bullet.x - center.x, bullet.y - center.y) <= radius + bullet.r && sweepTempestBullet(bullet, center)) {
        deflectedShots++;
        if (bullet.tempestTideTargeted) counterShots++;
      }
    }
    let affectedEnemies = 0;
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - center.x; const dy = enemy.y - center.y;
      const d = Math.hypot(dx, dy);
      if (d > radius + enemy.r) continue;
      const boss = enemy.kind === 'boss' && !enemy.isMiniBoss;
      const miniBoss = enemy.kind === 'boss' && enemy.isMiniBoss;
      const damageScale = boss ? .35 : miniBoss ? .68 : 1;
      damageEnemy(enemy, (2.4 + state.tempestTideDamageBonus) * damageScale * state.abilityPower, true);
      affectedEnemies++;
      burst(enemy.x, enemy.y, '#d5dcff', boss ? 5 : 4, boss ? 54 : 70);
      if (enemy.dead) continue;
      const angle = d > .001 ? Math.atan2(dy, dx) : random(0, Math.PI * 2, 'ability');
      const baseImpulse = boss ? 210 : miniBoss ? 360 : 540;
      const forceScale = boss ? .38 : miniBoss ? .68 : 1;
      const speed = baseImpulse + state.tempestTideForceBonus * forceScale;
      const edgeFactor = clamp(1.12 - d / (radius + enemy.r), .58, 1.12);
      const duration = boss ? .36 : .48;
      enemy.tempestRepulse = {
        vx: Math.cos(angle) * speed * edgeFactor,
        vy: Math.sin(angle) * speed * edgeFactor,
        spin: random(-1.5, 1.5, 'ability'), time: duration, total: duration
      };
      burst(enemy.x, enemy.y, '#87aaff', boss ? 7 : 5, boss ? 70 : 96);
    }
    burst(center.x, center.y, '#87aaff', 22, 135);
    burst(center.x, center.y, '#d5dcff', 12, 92);
    recordAchievementEvent('ship-ability', 'tempest');
    toast('MARÉ REVERSA · ' + deflectedShots + ' TIROS · ' + counterShots + ' CONTRA-ATAQUES');
    tone(220, .24, 'sine', .045);
    updateAbilityButton();
  }
  function flashTrailCooldownDuration() {
    return Math.max(22, 26 - upgradeLevel('flashTrailCooldown') * 2);
  }
  function activateFlashTrail() {
    if (currentSkin().id !== 'flashblade' || state.mode !== 'playing' || state.flashTrail?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.flashTrailCooldown > 0) return;
    const duration = 5 + state.flashTrailDurationBonus;
    state.flashTrail = { life: duration, total: duration, lastX: state.player.x, lastY: state.player.y, recordTimer: 0 };
    state.flashTrailCooldown = developerProfile ? 0 : flashTrailCooldownDuration();
    state.flashTrailContacts = new Set();
    recordAchievementEvent('ship-ability', 'flashblade');
    burst(state.player.x, state.player.y, '#ffc86e', 18, 115);
    burst(state.player.x, state.player.y, '#fff0b4', 8, 74);
    toast('RASTRO DE RUPTURA · IMPULSO 2,2× · ' + duration + 's');
    tone(690, .1, 'triangle', .035);
    updateAbilityButton();
  }
  function updateFlashTrail(dt) {
    const field = state.flashTrail;
    if (!field) return;
    field.life = Math.max(0, field.life - dt);
    field.recordTimer -= dt;
    const moved = Math.hypot(state.player.x - field.lastX, state.player.y - field.lastY);
    if (field.life > 0 && field.recordTimer <= 0) {
      const density = state.flashTrailDensity;
      if (moved >= mobileSize(8)) {
        state.effects.push({
          type: 'flash-trail', x1: field.lastX, y1: field.lastY, x2: state.player.x, y2: state.player.y,
          width: mobileSize(3.3 + density * .65), damage: (2 + state.flashTrailDamageBonus) * state.abilityPower,
          life: 7, total: 7, phase: random(0, Math.PI * 2, 'ability')
        });
      }
      field.lastX = state.player.x; field.lastY = state.player.y;
      field.recordTimer = Math.max(.13, .22 - density * .03);
    }
    if (field.life <= 0) { state.flashTrail = null; updateAbilityButton(); }
  }
  function redshiftPerimeterCooldownDuration() {
    return Math.max(22, 28 - upgradeLevel('redshiftPerimeterCooldown') * 2);
  }
  function redshiftPerimeterVertices(field = state.redshiftPerimeter) {
    if (!field) return [];
    const radius = mobileSize(135 + state.redshiftPerimeterRangeBonus);
    return [0, 1, 2].map((index) => {
      const angle = field.rotation - Math.PI / 2 + index * Math.PI * 2 / 3;
      return { x: state.player.x + Math.cos(angle) * radius, y: state.player.y + Math.sin(angle) * radius };
    });
  }
  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x; const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1) : 0;
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  }
  function steerEffectVector(effect, targetAngle, turnRate, dt) {
    const speed = Math.hypot(effect.vx, effect.vy);
    if (speed < .001) return;
    const currentAngle = Math.atan2(effect.vy, effect.vx);
    const difference = Math.atan2(Math.sin(targetAngle - currentAngle), Math.cos(targetAngle - currentAngle));
    const nextAngle = currentAngle + clamp(difference, -turnRate * dt, turnRate * dt);
    effect.vx = Math.cos(nextAngle) * speed;
    effect.vy = Math.sin(nextAngle) * speed;
    effect.angle = nextAngle;
  }
  function deflectEnemyFromFlashTrail(enemy, effect) {
    const dx = effect.x2 - effect.x1; const dy = effect.y2 - effect.y1;
    const length = Math.hypot(dx, dy) || 1;
    let nx = -dy / length; let ny = dx / length;
    const midX = (effect.x1 + effect.x2) / 2; const midY = (effect.y1 + effect.y2) / 2;
    if ((enemy.x - midX) * nx + (enemy.y - midY) * ny < 0) { nx *= -1; ny *= -1; }
    const tx = dx / length; const ty = dy / length;
    const slide = random(-82, 82, 'ability');
    const duration = random(.42, .58, 'ability');
    enemy.flashTrailDisorient = {
      time: duration, total: duration,
      vx: nx * 250 + tx * slide, vy: ny * 250 + ty * slide,
      turn: random(-.72, .72, 'ability'), spin: random(-1.15, 1.15, 'ability')
    };
  }
  function destroyEnemyShotAtFlashTrail(bullet) {
    if (!bullet || bullet.dead || bullet.reflected) return false;
    const barrier = state.effects.find((effect) => effect.type === 'flash-trail' && effect.life > 0
      && distanceToSegment(bullet, { x: effect.x1, y: effect.y1 }, { x: effect.x2, y: effect.y2 }) <= bullet.r + effect.width);
    if (!barrier) return false;
    bullet.dead = true;
    burst(bullet.x, bullet.y, '#ffc86e', 4, 52);
    burst(bullet.x, bullet.y, '#fff5d3', 2, 38);
    return true;
  }
  function activateRedshiftPerimeter() {
    if (!abilitySourceIs('redshift') || state.mode !== 'playing' || state.redshiftPerimeter?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.redshiftPerimeterCooldown > 0) return;
    const duration = 6 + state.redshiftPerimeterDurationBonus;
    state.redshiftPerimeter = { life: duration, total: duration, rotation: random(0, Math.PI * 2, 'ability'), hitCooldowns: [] };
    state.redshiftPerimeterCooldown = developerProfile ? 0 : redshiftPerimeterCooldownDuration();
    recordAchievementEvent('ship-ability', 'redshift');
    burst(state.player.x, state.player.y, '#d83a2e', 22, 125);
    burst(state.player.x, state.player.y, '#ffd06a', 10, 82);
    toast('PERÍMETRO DE CERCO · ' + duration + 's');
    tone(190, .16, 'sawtooth', .035);
    updateAbilityButton();
  }
  function updateRedshiftPerimeter(dt) {
    const field = state.redshiftPerimeter;
    if (!field || !abilitySourceIs('redshift')) return;
    field.life = Math.max(0, field.life - dt);
    if (field.life <= 0) { state.redshiftPerimeter = null; updateAbilityButton(); return; }
    field.rotation += dt * .48;
    for (const hit of field.hitCooldowns) hit.time -= dt;
    field.hitCooldowns = field.hitCooldowns.filter((hit) => hit.time > 0 && !hit.enemy.dead);
    const vertices = redshiftPerimeterVertices(field);
    const beamReach = mobileSize(9);
    for (const enemy of state.enemies) {
      if (enemy.dead || field.hitCooldowns.some((hit) => hit.enemy === enemy)) continue;
      let nearestBeam = Infinity;
      for (let index = 0; index < vertices.length; index++) {
        nearestBeam = Math.min(nearestBeam, distanceToSegment(enemy, vertices[index], vertices[(index + 1) % vertices.length]));
      }
      if (nearestBeam > enemy.r * .7 + beamReach) continue;
      damageEnemy(enemy, (4 + state.redshiftPerimeterDamageBonus) * state.abilityPower, true);
      field.hitCooldowns.push({ enemy, time: .72 });
      burst(enemy.x, enemy.y, '#d83a2e', 7, 88);
      burst(enemy.x, enemy.y, '#ffd06a', 4, 64);
    }
  }
  function damageAuroraNova(radius) {
    const enemies = state.enemies.filter((enemy) => !enemy.dead);
    const hits = [];
    for (const enemy of enemies) {
      const gap = distance(state.player, enemy);
      if (gap < radius + enemy.r) hits.push({ enemy, damage: (33 + Math.max(0, radius - gap) * .1) * state.abilityPower });
    }
    const ability = state.auroraLink;
    const linked = ability?.life > 0 ? (ability.targets || []).filter((enemy) => enemy && !enemy.dead) : [];
    const linkedSet = new Set(linked);
    const hitSet = new Set(hits.map((hit) => hit.enemy));
    const source = hits.filter((hit) => linkedSet.has(hit.enemy)).sort((a, b) => b.damage - a.damage)[0] || null;
    const sharedDamage = source?.damage || 0;
    for (const hit of hits) {
      const damage = linkedSet.has(hit.enemy) ? Math.max(hit.damage, sharedDamage) : hit.damage;
      damageEnemy(hit.enemy, damage, true);
    }
    if (source && sharedDamage > 0) {
      for (let index = 0; index < linked.length; index++) {
        const target = linked[index];
        if (target === source.enemy || target.dead) continue;
        if (!hitSet.has(target)) damageEnemy(target, sharedDamage, true);
        const dx = target.x - source.enemy.x; const dy = target.y - source.enemy.y;
        const length = Math.hypot(dx, dy) || 1;
        const bend = (index % 2 ? 1 : -1) * Math.min(20, length * .08);
        state.effects.push({ type: 'aurora-link', x1: source.enemy.x, y1: source.enemy.y, x2: target.x, y2: target.y, cx: (source.enemy.x + target.x) / 2 - dy / length * bend, cy: (source.enemy.y + target.y) / 2 + dx / length * bend, life: .48, total: .48, phase: index });
        state.effects.push({ type: 'aurora-link-node', x: target.x, y: target.y, life: .36, total: .36, phase: index });
      }
    }
  }
  function activateAbility() {
    if (currentSkin().id === 'prisma' && !state.prismDispatchSkinId) { activatePrismAbilityChoice('e'); return; }
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
      startEclipseCinematic(state.eclipseSkipVideoEnabled);
    } else if (skin.id === 'aurora') {
      const radius = mobileSize(285);
      state.effects.push({ type: 'nova', x: state.player.x, y: state.player.y, radius: 0, maxRadius: radius, life: .95, total: .95 });
      damageAuroraNova(radius);
      burst(state.player.x, state.player.y, skin.color, 76, 310); burst(state.player.x, state.player.y, '#ffffff', 28, 190); toast('EXPLOSÃO NOVA');
    } else if (skin.id === 'flashblade') {
      const angle = state.player.angle || -Math.PI / 2;
      state.effects.push({ type: 'blade', x: state.player.x, y: state.player.y, vx: Math.cos(angle) * 730, vy: Math.sin(angle) * 730, angle, turnTimer: .12, life: 9.4, total: 9.4, bounces: 0, damage: 14 * state.abilityPower, hitCooldowns: [], trail: [{ x: state.player.x, y: state.player.y }] });
      burst(state.player.x, state.player.y, skin.color, 34, 195); toast('CORTE FLASH · TRAJETÓRIA INSTÁVEL');
    } else if (skin.id === 'tempest') {
      const angle = state.player.moveAngle ?? state.player.angle ?? -Math.PI / 2;
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
    state.damageCounterIdle = Math.min(3.2, state.damageCounterIdle + dt);
    for (const popup of state.damageCounterPopups) { popup.life -= dt; popup.y -= mobileSize(22) * dt; }
    state.damageCounterPopups = state.damageCounterPopups.filter((popup) => popup.life > 0);
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.waveGrace = Math.max(0, state.waveGrace - dt);
    state.shotCooldown -= dt;
    state.powerSpawn -= dt;
    state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    state.prismQCooldown = Math.max(0, state.prismQCooldown - dt);
    if (state.prismHorizonAnchor) {
      state.prismHorizonAnchor.life = Math.max(0, state.prismHorizonAnchor.life - dt);
      if (state.prismHorizonAnchor.life <= 0) {
        const expired = state.prismHorizonAnchor;
        state.prismHorizonAnchor = null;
        state.effects.push({ type:'prism-anchor-fade', x:expired.x, y:expired.y, life:.42, total:.42 });
        updateAbilityButton();
      }
    }
    state.eclipseDecoyCooldown = Math.max(0, state.eclipseDecoyCooldown - dt);
    state.redshiftPerimeterCooldown = Math.max(0, state.redshiftPerimeterCooldown - dt);
    state.flashTrailCooldown = Math.max(0, state.flashTrailCooldown - dt);
    advanceTempestTideRecharge(dt);
    advanceDinoStampedeRecharge(dt);
    advanceAuroraLink(dt);
      advanceAegisOrbit(dt);
    updateEclipseDecoy(dt);
    advanceChronosEcho(dt);
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
      state.player.moveAngle = Math.atan2(dy, dx);
      state.player.angle = Math.round(Math.atan2(dy, dx) / eighthTurn) * eighthTurn;
    }
    const norm = Math.hypot(dx, dy) || 1;
    const hullSpeed = state.lives <= 2 ? 1 + state.lowHullBoost * .12 : 1;
    const flashbladeDash = abilitySourceIs('flashblade') && state.flashTrail?.life > 0;
    const normalMoveSpeed = Math.min(525, state.player.speed + state.endlessSpeed);
    const moveSpeed = normalMoveSpeed * (flashbladeDash ? 2.2 : 1);
    state.player.x = clamp(state.player.x + (dx / norm) * moveSpeed * hullSpeed * dt, 17, state.width - 17);
    state.player.y = clamp(state.player.y + (dy / norm) * moveSpeed * hullSpeed * dt, 17, state.height - 17);
    updateFlashTrail(dt);
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
      if (bullet.dead || destroyEnemyShotAtFlashTrail(bullet)) continue;
      reflectIncomingBullet(bullet);
      if (bullet.reflected) {
        if (bullet.tempestTideTargeted) {
          let target = bullet.tempestTideTarget;
          if (!target || target.dead) {
            target = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(bullet, a) - distance(bullet, b))[0] || null;
            bullet.tempestTideTarget = target;
          }
          if (target) steerEffectVector(bullet, Math.atan2(target.y - bullet.y, target.x - bullet.x), 4.8, dt);
        }
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
      const tideSweep = bullet.tempestTideSweep;
      if (tideSweep && tideSweep.time > 0) {
        tideSweep.time = Math.max(0, tideSweep.time - dt);
        const speed = Math.hypot(bullet.vx, bullet.vy) || 300;
        const currentAngle = Math.atan2(bullet.vy, bullet.vx);
        const difference = Math.atan2(Math.sin(tideSweep.targetAngle - currentAngle), Math.cos(tideSweep.targetAngle - currentAngle));
        const nextAngle = currentAngle + clamp(difference, -5.2 * dt, 5.2 * dt);
        bullet.vx = Math.cos(nextAngle) * speed; bullet.vy = Math.sin(nextAngle) * speed;
        if (tideSweep.time <= 0) bullet.tempestTideSweep = null;
      }
      if (bullet.fuse != null) { bullet.fuse -= dt * slowFactor; if (bullet.fuse <= 0) { explodeBullet(bullet); continue; } }
      bullet.x += bullet.vx * dt * slowFactor; bullet.y += bullet.vy * dt * slowFactor;
      if (interceptWithAegisOrbit(bullet)) continue;
      const decoy = state.eclipseDecoy;
      if (decoy && abilitySourceIs('eclipse') && Math.hypot(bullet.x - decoy.x, bullet.y - decoy.y) < bullet.r + state.player.radius * .9) {
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
    for (const bullet of state.enemyBullets) {
      destroyEnemyShotAtFlashTrail(bullet);
    }
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const aimTarget = enemyAimTarget();
      let angle = Math.atan2(aimTarget.y - enemy.y, aimTarget.x - enemy.x);
      const flashTrailDisorient = enemy.flashTrailDisorient;
      if (flashTrailDisorient && flashTrailDisorient.time > 0) {
        flashTrailDisorient.time = Math.max(0, flashTrailDisorient.time - dt);
        const stagger = flashTrailDisorient.time / flashTrailDisorient.total;
        angle += flashTrailDisorient.turn * stagger;
        enemy.x += flashTrailDisorient.vx * dt * stagger;
        enemy.y += flashTrailDisorient.vy * dt * stagger;
        enemy.angle += flashTrailDisorient.spin * dt * stagger;
      } else if (flashTrailDisorient) enemy.flashTrailDisorient = null;
      const tempestRepulse = enemy.tempestRepulse;
      if (tempestRepulse && tempestRepulse.time > 0) {
        tempestRepulse.time = Math.max(0, tempestRepulse.time - dt);
        const impulse = tempestRepulse.time / tempestRepulse.total;
        enemy.x = clamp(enemy.x + tempestRepulse.vx * dt * impulse, enemy.r, state.width - enemy.r);
        enemy.y = clamp(enemy.y + tempestRepulse.vy * dt * impulse, enemy.r, state.height - enemy.r);
        enemy.angle += tempestRepulse.spin * dt * impulse;
      } else if (tempestRepulse) enemy.tempestRepulse = null;
      const frozenByEclipse = state.eclipsePhase === 'cinematic';
      enemy.dinoStun = Math.max(0, (enemy.dinoStun || 0) - dt);
      enemy.prismStun = Math.max(0, (enemy.prismStun || 0) - dt);
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
      const stunnedByDino = enemy.dinoStun > 0 || enemy.prismStun > 0;
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
    updateRedshiftPerimeter(dt);
    for (const bullet of state.bullets) {
      for (const enemy of state.enemies) {
        if (bullet.dead || enemy.dead || (bullet.hit && bullet.hit.includes(enemy))) continue;
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r * .72) {
          damageEnemy(enemy, bullet.damage, false); burst(bullet.x, bullet.y, bullet.color, 4, 56);
          if (state.blastRadius > 0 && !bullet.eclipseDecoyShot) state.enemies.forEach((nearby) => { if (nearby !== enemy && !nearby.dead && distance(enemy, nearby) < state.blastRadius + nearby.r) damageEnemy(nearby, bullet.damage * .45, true); });
          if (bullet.pierce > 0) { bullet.pierce--; bullet.hit = bullet.hit || []; bullet.hit.push(enemy); }
          else bullet.dead = true;
          break;
        }
      }
    }
    state.bullets = state.bullets.filter(b => !b.dead);
    state.enemies = state.enemies.filter(e => !e.dead && e.y > -100 && e.y < state.height + 100 && e.x > -100 && e.x < state.width + 100);
    for (const bullet of state.enemyBullets) if (!bullet.dead && !bullet.reflected && !(bullet.tempestTideSweep?.time > 0) && Math.hypot(bullet.x - state.player.x, bullet.y - state.player.y) < bullet.r + state.player.radius * .7) {
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
          state.prismQCooldown = Math.max(0, state.prismQCooldown - 8);
          const selectedSources = currentSkin().id === 'prisma'
            ? ['e','q'].map((slot) => prismChoiceParts(state.prismAbilityChoices[slot]))
            : [{ shipId:currentSkin().id, key:'q' }];
          for (const { shipId, key } of selectedSources) {
            if (key !== 'q') continue;
            if (shipId === 'aurora') state.auroraLinkCooldown = Math.max(0, state.auroraLinkCooldown - 8);
            if (shipId === 'eclipse') state.eclipseDecoyCooldown = Math.max(0, state.eclipseDecoyCooldown - 8);
            if (shipId === 'aegis') state.aegisOrbitCooldown = Math.max(0, state.aegisOrbitCooldown - 8);
            if (shipId === 'redshift') state.redshiftPerimeterCooldown = Math.max(0, state.redshiftPerimeterCooldown - 8);
            if (shipId === 'flashblade') state.flashTrailCooldown = Math.max(0, state.flashTrailCooldown - 8);
            if (shipId === 'tempest') { state.tempestTideCooldown = Math.max(0, state.tempestTideCooldown - 8); advanceTempestTideRecharge(0); }
            if (shipId === 'chronos') state.chronosEchoCooldown = Math.max(0, state.chronosEchoCooldown - 8);
            if (shipId === 'saurion') advanceDinoStampedeRecharge(8);
          }
          toast('CARGA DE HABILIDADE −8s');
        }
        else { state.shields = Math.min(4, state.shields + 1); toast('ESCUDO DE ENERGIA +1'); }
        const color = pickup.kind === 'repair' ? '#76ffae' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff';
        burst(pickup.x, pickup.y, color, 14, 90); tone(780, .17, 'sine', .04); updateHud();
      }
    }
    state.pickups = state.pickups.filter(p => !p.dead && p.life > 0);
    const activeEffects = [];
    const previousFlashTrailContacts = state.flashTrailContacts;
    const currentFlashTrailContacts = new Set();
    for (const effect of state.effects) {
      effect.life -= dt;
      if (effect.type === 'flash-trail' && effect.life > 0) {
        for (const enemy of state.enemies) {
          if (enemy.dead || distanceToSegment(enemy, { x: effect.x1, y: effect.y1 }, { x: effect.x2, y: effect.y2 }) > enemy.r * .7 + effect.width) continue;
          const alreadyInContact = previousFlashTrailContacts.has(enemy) || currentFlashTrailContacts.has(enemy);
          currentFlashTrailContacts.add(enemy);
          if (alreadyInContact) continue;
          damageEnemy(enemy, effect.damage, true);
          if (!enemy.dead) deflectEnemyFromFlashTrail(enemy, effect);
          burst(enemy.x, enemy.y, '#ffc86e', 7, 82);
          burst(enemy.x, enemy.y, '#fff0b4', 4, 54);
        }
      } else if (effect.type === 'dino-raptor') {
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
        if (state.particles.length < particleLimit() && visualRandomUnit() < dt * 16) state.particles.push({ x: effect.x + visualRandom(-12, 12), y: effect.y + visualRandom(-12, 12), vx: visualRandom(-32, 32), vy: visualRandom(-32, 32), life: .34, maxLife: .34, r: mobileSize(visualRandom(2, 4)), color: visualRandomUnit() < .5 ? '#d4ff72' : '#50e884' });
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
        if (state.particles.length < particleLimit() && visualRandomUnit() < dt * (state.performanceMode === 'light' ? 7 : 22)) state.particles.push({ x: effect.x, y: effect.y, vx: visualRandom(-30, 30), vy: visualRandom(-30, 30), life: .28, maxLife: .28, r: mobileSize(visualRandom(2, 4)), color: visualRandomUnit() < .5 ? '#fff7d5' : '#ffc86e' });
      } else if (effect.type === 'singularity-shot') {
        steerEffectVector(effect, state.player.moveAngle ?? state.player.angle ?? -Math.PI / 2, 1.18, dt);
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        if (effect.x < 12 || effect.x > state.width - 12 || effect.y < 12 || effect.y > state.height - 12) { effect.x = clamp(effect.x, 12, state.width - 12); effect.y = clamp(effect.y, 12, state.height - 12); effect.life = 0; }
        if (state.particles.length < particleLimit() && visualRandomUnit() < dt * (state.performanceMode === 'light' ? 9 : 28)) state.particles.push({ x: effect.x + visualRandom(-5, 5), y: effect.y + visualRandom(-5, 5), vx: visualRandom(-55, 55), vy: visualRandom(-55, 55), life: .38, maxLife: .38, r: mobileSize(visualRandom(1.5, 3)), color: visualRandomUnit() < .5 ? '#8ef6ff' : '#c19cff' });
        const hit = state.enemies.find((enemy) => !enemy.dead && distance(effect, enemy) < enemy.r + mobileSize(13));
        if (hit) { damageEnemy(hit, 24 * state.abilityPower, true); effect.life = 0; }
        if (effect.life <= 0) {
          effect.type = 'blackhole'; effect.life = state.singularityDuration; effect.total = state.singularityDuration; effect.radius = mobileSize(state.singularityRadius); effect.damageClock = .2;
          effect.vx *= .45; effect.vy *= .45; effect.targetAngle = Math.atan2(effect.vy, effect.vx); effect.moveTimer = .55;
          burst(effect.x, effect.y, '#b99aff', 34, 210); burst(effect.x, effect.y, '#7df7e8', 20, 130);
          toast('POÇO NEGRO ATIVO');
        }
      } else if (effect.type === 'blackhole') {
        effect.moveTimer -= dt;
        if (effect.moveTimer <= 0) {
          const cluster = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(effect, a) - distance(effect, b)).slice(0, 5);
          let targetX = random(20, state.width - 20, 'ability'), targetY = random(20, state.height - 20, 'ability');
          if (cluster.length) { targetX = cluster.reduce((sum, enemy) => sum + enemy.x, 0) / cluster.length; targetY = cluster.reduce((sum, enemy) => sum + enemy.y, 0) / cluster.length; }
          effect.targetAngle = Math.atan2(targetY - effect.y, targetX - effect.x) + random(-.5, .5, 'ability');
          effect.moveTimer = random(.55, .95, 'ability');
        }
        const currentAngle = Math.atan2(effect.vy, effect.vx);
        const playerAngle = state.player.moveAngle ?? state.player.angle ?? -Math.PI / 2;
        const enemyTurn = Math.atan2(Math.sin((effect.targetAngle ?? currentAngle) - currentAngle), Math.cos((effect.targetAngle ?? currentAngle) - currentAngle));
        const shipTurn = Math.atan2(Math.sin(playerAngle - currentAngle), Math.cos(playerAngle - currentAngle));
        const curvedTurn = enemyTurn * .58 + shipTurn * .42;
        const nextAngle = currentAngle + clamp(curvedTurn, -1.25 * dt, 1.25 * dt);
        const holeSpeed = Math.hypot(effect.vx, effect.vy) || 155;
        effect.vx = Math.cos(nextAngle) * holeSpeed; effect.vy = Math.sin(nextAngle) * holeSpeed;
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
      } else if (effect.type === 'nova' || effect.type === 'prism-core-wave' || effect.type === 'prism-return-wave') effect.radius = effect.maxRadius * (1 - effect.life / effect.total);
      if (effect.life > 0) activeEffects.push(effect);
    }
    state.flashTrailContacts = currentFlashTrailContacts;
    state.effects = activeEffects;
    state.enemies = state.enemies.filter(e => !e.dead);
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    state.pickups = state.pickups.filter(p => !p.dead);
    for (const p of state.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985; p.vy *= .985; p.life -= dt; }
    state.particles = state.particles.filter(p => p.life > 0);
    const maxParticles = particleLimit();
    if (state.particles.length > maxParticles) state.particles.splice(0, state.particles.length - maxParticles);
    if (state.mode === 'playing' && state.waveKills >= state.enemiesRequired && state.enemies.length === 0 && (state.miniBossSpawned || state.miniBossTimer <= 0)) openUpgrade();
    if (Math.floor(state.elapsed) !== Math.floor(state.elapsed - dt)) updateHud();
    checkShipRechargeReadiness();
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
    if (ship.shape === 'prism') {
      const pulse = .84 + Math.sin(performance.now() / 58) * .16;
      const flame = ctx.createLinearGradient(0, size * .72, 0, size * 2.05);
      flame.addColorStop(0, 'rgba(255,226,154,.95)'); flame.addColorStop(.34, 'rgba(89,233,242,.78)'); flame.addColorStop(1, 'rgba(89,233,242,0)');
      ctx.fillStyle = flame; ctx.globalAlpha *= pulse;
      ctx.beginPath(); ctx.moveTo(-size * .28, size * .62); ctx.lineTo(0, size * (1.95 + pulse * .14)); ctx.lineTo(size * .28, size * .62); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = alpha; ctx.shadowColor = ship.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .8;
      const hull = ctx.createLinearGradient(-size, -size, size, size);
      hull.addColorStop(0, '#efffff'); hull.addColorStop(.3, ship.accent); hull.addColorStop(.62, ship.color); hull.addColorStop(1, '#187c9b');
      ctx.fillStyle = hull; ctx.strokeStyle = '#f5ffff'; ctx.lineWidth = Math.max(1, size * .09);
      ctx.beginPath(); ctx.moveTo(0, -size * 1.62); ctx.lineTo(size * .48, -size * .42); ctx.lineTo(size * 1.08, size * .58); ctx.lineTo(size * .38, size * .4); ctx.lineTo(0, size * .94); ctx.lineTo(-size * .38, size * .4); ctx.lineTo(-size * 1.08, size * .58); ctx.lineTo(-size * .48, -size * .42); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.moveTo(0, -size * 1.3); ctx.lineTo(size * .23, -size * .36); ctx.lineTo(0, size * .2); ctx.lineTo(-size * .23, -size * .36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ship.accent; ctx.lineWidth = Math.max(1, size * .055);
      ctx.beginPath(); ctx.moveTo(0, -size * 1.22); ctx.lineTo(0, size * .72); ctx.moveTo(-size * .62, -size * .08); ctx.lineTo(0, size * .22); ctx.lineTo(size * .62, -size * .08); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = ship.accent; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .6;
      ctx.beginPath(); ctx.arc(0, -size * .06, size * .16, 0, Math.PI * 2); ctx.fill();
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
    if (enemy.prismStun > 0) {
      ctx.save(); ctx.globalAlpha = .52 + Math.sin(performance.now() / 56 + enemy.y) * .16;
      ctx.strokeStyle = '#8efaff'; ctx.shadowColor = '#ffe29a'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 9;
      ctx.lineWidth = mobileSize(1.6); ctx.setLineDash([mobileSize(2), mobileSize(5)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(11), -performance.now() / 380, Math.PI * 2 - performance.now() / 380); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
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
  function drawAuroraLinkTrails(timestamp) {
    const ability = state.auroraLink;
    const targets = ability?.targets?.filter((enemy) => enemy && !enemy.dead) || [];
    if (!ability || ability.life <= 0 || !targets.length) return;
    const points = [{ x: state.player.x, y: state.player.y }, ...targets];
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let index = 1; index < points.length; index++) {
      const from = points[index - 1];
      const to = points[index];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      const bend = Math.sin(timestamp / 520 + index * 1.7) * Math.min(10, length * .025);
      const cx = (from.x + to.x) / 2 - dy / length * bend;
      const cy = (from.y + to.y) / 2 + dx / length * bend;
      const breath = .82 + Math.sin(timestamp / 430 + index) * .12;
      ctx.globalAlpha = breath * .2;
      ctx.strokeStyle = '#51d9c9';
      ctx.lineWidth = mobileSize(4.2);
      if (state.performanceMode !== 'light') { ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = mobileSize(10); }
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(cx, cy, to.x, to.y); ctx.stroke();
      ctx.globalAlpha = breath * .4;
      ctx.strokeStyle = '#eafffb';
      ctx.lineWidth = mobileSize(1.15);
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(cx, cy, to.x, to.y); ctx.stroke();
      ctx.globalAlpha = breath * .28;
      ctx.strokeStyle = '#a7fff1';
      ctx.lineWidth = mobileSize(.8);
      ctx.setLineDash([mobileSize(2), mobileSize(13)]);
      ctx.lineDashOffset = -timestamp / 42;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(cx, cy, to.x, to.y); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const enemy of targets) {
      ctx.globalAlpha = .23 + Math.sin(timestamp / 260 + enemy.x * .01) * .04;
      ctx.strokeStyle = '#bffff5';
      ctx.lineWidth = mobileSize(1.1);
      ctx.shadowColor = '#7df7e8';
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(7);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(5), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
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
    for (const b of state.bullets) {
      if (b.eclipseDecoyShot || b.chronosEchoShot || b.aegisSentinelShot) { ctx.strokeStyle = b.eclipseDecoyShot ? 'rgba(216,189,255,.68)' : b.aegisSentinelShot ? 'rgba(168,229,255,.82)' : 'rgba(214,196,255,.76)'; ctx.lineWidth = Math.max(1, b.r * .7); ctx.beginPath(); ctx.moveTo(b.x - b.vx * .035, b.y - b.vy * .035); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const b of state.enemyBullets) {
      const swept = b.tempestTideSweep?.time > 0;
      ctx.fillStyle = swept ? '#e7eeff' : b.color; ctx.shadowColor = swept || b.tempestTideTargeted ? '#87aaff' : b.color;
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : swept || b.tempestTideTargeted ? 12 : 10;
      if (b.tempestTideTargeted) { ctx.strokeStyle = '#d9faff'; ctx.lineWidth = Math.max(1, b.r * .55); ctx.beginPath(); ctx.moveTo(b.x - b.vx * .035, b.y - b.vy * .035); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const enemy of state.enemies) drawEnemy(enemy);
    for (const p of state.particles) { ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    drawAuroraLinkTrails(timestamp);
    const eclipseActive = abilitySourceIs('eclipse') && state.eclipsePhase === 'active';
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
      if (effect.type === 'skill-ready') {
        const progress = 1 - alpha;
        const x = effect.followShip ? state.player.x : effect.x;
        const y = effect.followShip ? state.player.y : effect.y;
        const pulse = .82 + Math.sin(timestamp / 58) * .18;
        const radius = state.player.radius + mobileSize(9 + progress * 32);
        ctx.save(); ctx.translate(x, y);
        ctx.globalAlpha = alpha * .34 * pulse; ctx.fillStyle = effect.color;
        ctx.font = '900 ' + mobileSize(42) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = effect.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        ctx.fillText(effect.icon, effect.iconOffsetX || 0, 0);
        ctx.globalAlpha = alpha * .62 * pulse; ctx.strokeStyle = effect.color;
        ctx.lineWidth = mobileSize(2.4); ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .34; ctx.strokeStyle = '#effffb'; ctx.lineWidth = mobileSize(1.15);
        ctx.setLineDash([mobileSize(3), mobileSize(7)]); ctx.lineDashOffset = -timestamp / 24;
        ctx.beginPath(); ctx.arc(0, 0, radius + mobileSize(7), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      } else if (effect.type === 'aurora-link-start' || effect.type === 'aurora-link-node') {
        const progress = 1 - alpha;
        const radius = mobileSize(effect.type === 'aurora-link-start' ? 16 + progress * 56 : 4 + progress * 20);
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * .82;
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = mobileSize(14); }
        ctx.strokeStyle = '#eafffb'; ctx.lineWidth = mobileSize(effect.type === 'aurora-link-start' ? 2.5 : 1.8);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha *= .64; ctx.strokeStyle = '#55dccc'; ctx.lineWidth = mobileSize(1.2);
        ctx.setLineDash([mobileSize(4), mobileSize(7)]); ctx.lineDashOffset = -timestamp * .045 + (effect.phase || 0);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .72, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      } else if (effect.type === 'aurora-link-wave') {
        const progress = 1 - alpha;
        const radius = mobileSize(20) + effect.radius * progress;
        const spread = mobileSize(42 + progress * 34);
        const glow = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, radius - spread), effect.x, effect.y, radius);
        glow.addColorStop(0, 'rgba(125,247,232,0)');
        glow.addColorStop(.72, 'rgba(125,247,232,0)');
        glow.addColorStop(.9, 'rgba(125,247,232,.055)');
        glow.addColorStop(1, 'rgba(234,255,251,0)');
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * progress) * .92;
        ctx.fillStyle = glow; ctx.fillRect(0, 0, state.width, state.height);
        ctx.lineWidth = mobileSize(3.2); ctx.strokeStyle = 'rgba(191,255,245,.36)';
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = mobileSize(17); }
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha *= .5; ctx.lineWidth = mobileSize(1.25); ctx.strokeStyle = '#f0fffc'; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, Math.max(0, radius - mobileSize(12)), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'aurora-link') {
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = alpha * .46; ctx.strokeStyle = '#51d9c9'; ctx.lineWidth = mobileSize(5);
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = mobileSize(13); }
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.quadraticCurveTo(effect.cx, effect.cy, effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = alpha * .94; ctx.strokeStyle = '#edfffb'; ctx.lineWidth = mobileSize(1.7); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.quadraticCurveTo(effect.cx, effect.cy, effect.x2, effect.y2); ctx.stroke();
        const spark = (timestamp / 280 + effect.phase * .21) % 1;
        const inverse = 1 - spark;
        const sx = inverse * inverse * effect.x1 + 2 * inverse * spark * effect.cx + spark * spark * effect.x2;
        const sy = inverse * inverse * effect.y1 + 2 * inverse * spark * effect.cy + spark * spark * effect.y2;
        ctx.globalAlpha = alpha; ctx.fillStyle = '#fff'; ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(11);
        ctx.beginPath(); ctx.arc(sx, sy, mobileSize(2.4), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'aegis-orbit-start' || effect.type === 'aegis-orbit-intercept' || effect.type === 'aegis-orbit-release') {
        const progress = 1 - alpha;
        const isStart = effect.type === 'aegis-orbit-start';
        const radius = mobileSize(isStart ? 18 + progress * 52 : effect.type === 'aegis-orbit-release' ? 7 + progress * 28 : 5 + progress * 18);
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * (isStart ? .8 : .95);
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#72bdff'; ctx.shadowBlur = mobileSize(14); }
        ctx.strokeStyle = '#effbff'; ctx.lineWidth = mobileSize(isStart ? 2.8 : 2.1);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha *= .7; ctx.strokeStyle = '#72bdff'; ctx.lineWidth = mobileSize(1.4);
        ctx.setLineDash([mobileSize(4), mobileSize(6)]); ctx.lineDashOffset = -timestamp * .05;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .72, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      } else if (effect.type === 'chronos-echo-start' || effect.type === 'chronos-echo-flash') {
        const progress = 1 - alpha;
        const baseRadius = effect.type === 'chronos-echo-start' ? mobileSize(20 + progress * 68) : mobileSize(4 + progress * 18);
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * .82; ctx.lineCap = 'round';
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#c897ff'; ctx.shadowBlur = mobileSize(13); }
        ctx.strokeStyle = '#efd5ff'; ctx.lineWidth = mobileSize(effect.type === 'chronos-echo-start' ? 2.8 : 1.8);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, baseRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha *= .62; ctx.strokeStyle = '#87aaff'; ctx.lineWidth = mobileSize(1.2);
        ctx.setLineDash([mobileSize(4), mobileSize(7)]); ctx.lineDashOffset = timestamp / -55 + (effect.phase || 0);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, baseRadius * .74, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      } else if (effect.type === 'tempest-tide') {
        const progress = 1 - alpha;
        const waveRadius = effect.radius * (.1 + progress * .9);
        const waveAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * .88;
        ctx.save(); ctx.lineCap = 'round';
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#83aaff'; ctx.shadowBlur = mobileSize(20); }
        for (let ring = 0; ring < 3; ring++) {
          const radius = waveRadius * (1 - ring * .075);
          ctx.globalAlpha = waveAlpha * (ring === 0 ? .78 : .48 - ring * .08);
          ctx.strokeStyle = ring === 1 ? '#e8efff' : ring === 2 ? '#c2d2ff' : '#7fa6ff';
          ctx.lineWidth = mobileSize(ring === 0 ? 5 : 2.2);
          ctx.setLineDash(ring === 0 ? [] : [mobileSize(8), mobileSize(13)]);
          ctx.lineDashOffset = timestamp / (ring === 2 ? 70 : -95) + effect.phase * 10;
          ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.setLineDash([]); ctx.shadowBlur = 0;
        const core = clamp(1 - progress * 3.4, 0, 1);
        ctx.globalAlpha = core * .48; ctx.fillStyle = '#d5e2ff';
        ctx.beginPath(); ctx.arc(effect.x, effect.y, mobileSize(22 + progress * 30), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'flash-trail') {
        const fade = clamp(effect.life / effect.total, 0, 1);
        const visibility = clamp(fade * 3.2, 0, 1);
        const pulse = .83 + Math.sin(timestamp / 115 + effect.phase) * .17;
        const dx = effect.x2 - effect.x1; const dy = effect.y2 - effect.y1;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = visibility * .26 * pulse; ctx.strokeStyle = '#ff8a21'; ctx.lineWidth = effect.width * 3.2;
        ctx.shadowColor = '#ffae38'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22);
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = visibility * .88 * pulse; ctx.strokeStyle = '#ffbf4d'; ctx.lineWidth = effect.width * 1.45;
        ctx.shadowColor = '#ffd36b'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = visibility * .96; ctx.strokeStyle = '#fff5cf'; ctx.lineWidth = Math.max(mobileSize(1.1), effect.width * .36); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = visibility * .72 * pulse; ctx.strokeStyle = '#fffbe9'; ctx.lineWidth = Math.max(mobileSize(.7), effect.width * .12);
        ctx.setLineDash([mobileSize(3), mobileSize(12)]); ctx.lineDashOffset = -timestamp / 38;
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke(); ctx.setLineDash([]);
        const sparkProgress = (timestamp / 900 + effect.phase) % 1;
        for (const position of [sparkProgress, 1 - sparkProgress]) {
          const sx = effect.x1 + dx * position; const sy = effect.y1 + dy * position;
          ctx.globalAlpha = visibility * .94 * pulse; ctx.fillStyle = '#fff9df';
          ctx.shadowColor = '#ffc34f'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
          ctx.beginPath(); ctx.arc(sx, sy, mobileSize(1.7 + pulse * .55), 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0; ctx.globalAlpha = visibility * .9; ctx.fillStyle = '#ffe693';
        for (const point of [{ x: effect.x1, y: effect.y1 }, { x: effect.x2, y: effect.y2 }]) {
          ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(1.8), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      } else if (effect.type === 'eclipse-decoy-burst') {
        const progress = 1 - alpha;
        const radius = effect.radius * (.25 + progress * .75);
        ctx.save(); ctx.globalAlpha = alpha * (1 - progress * .25);
        const glow = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        glow.addColorStop(0, 'rgba(244,231,255,.38)'); glow.addColorStop(.42, 'rgba(180,133,255,.2)'); glow.addColorStop(1, 'rgba(180,133,255,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e6d4ff'; ctx.lineWidth = mobileSize(4 * alpha + 1); ctx.shadowColor = '#b58aff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = mobileSize(1.5); ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .82, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'prism-echo') {
        const progress = 1 - alpha;
        const radius = mobileSize(20 + progress * 58);
        ctx.save(); ctx.globalAlpha = alpha * .8; ctx.lineWidth = mobileSize(2.2);
        ctx.strokeStyle = effect.color || '#59e9f2'; ctx.shadowColor = '#59e9f2'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(17);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, -.2 + progress * 1.3, Math.PI * 1.65 + progress * 1.3); ctx.stroke();
        ctx.strokeStyle = '#ffe29a'; ctx.lineWidth = mobileSize(1.1); ctx.shadowBlur = 0;
        for (let ray = 0; ray < 4; ray++) {
          const angle = ray * Math.PI / 2 + progress * .75;
          const inner = mobileSize(12); const outer = radius + mobileSize(8);
          ctx.beginPath(); ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner); ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'prism-core-wave' || effect.type === 'prism-return-wave') {
        const returning = effect.type === 'prism-return-wave';
        const progress = 1 - alpha;
        const radius = effect.radius;
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, progress * 1.12)) * .82 + alpha * .12;
        const glow = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, radius - mobileSize(44)), effect.x, effect.y, radius + mobileSize(10));
        glow.addColorStop(0, 'rgba(89,233,242,0)'); glow.addColorStop(.72, returning ? 'rgba(255,226,154,.04)' : 'rgba(89,233,242,.07)');
        glow.addColorStop(.93, returning ? 'rgba(255,226,154,.28)' : 'rgba(89,233,242,.25)'); glow.addColorStop(1, 'rgba(255,255,255,.5)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius + mobileSize(10), 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = mobileSize(returning ? 3.8 : 5); ctx.strokeStyle = returning ? '#ffe29a' : '#59e9f2';
        ctx.shadowColor = returning ? '#ffe29a' : '#59e9f2'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha *= .72; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = mobileSize(1.3); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, Math.max(0, radius - mobileSize(8)), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'prism-core-flash' || effect.type === 'prism-anchor-start' || effect.type === 'prism-anchor-fade') {
        const progress = 1 - alpha; const radius = mobileSize(16 + progress * (effect.type === 'prism-core-flash' ? 78 : 42));
        ctx.save(); ctx.globalAlpha = alpha * (effect.type === 'prism-anchor-fade' ? .55 : .92);
        ctx.strokeStyle = effect.type === 'prism-anchor-fade' ? '#ffe29a' : '#59e9f2'; ctx.lineWidth = mobileSize(2.2);
        ctx.shadowColor = '#ffe29a'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = mobileSize(1); ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .72, .25, Math.PI * 1.7); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'nova') {
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
        if (saurionRaptorSprite.complete && saurionRaptorSprite.naturalWidth) {
          const spriteHeight = mobileSize(effect.size * 1.85);
          const spriteWidth = spriteHeight * saurionRaptorSprite.naturalWidth / saurionRaptorSprite.naturalHeight;
          const pulse = 1 + Math.sin(timestamp / 72 + effect.y * .02) * .035;
          ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.globalAlpha = fade * .96;
          ctx.shadowColor = '#52ff22'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
          ctx.beginPath(); ctx.ellipse(0, 0, spriteWidth * .49, spriteHeight * .48, 0, 0, Math.PI * 2); ctx.clip();
          ctx.drawImage(saurionRaptorSprite, -spriteWidth * pulse / 2, -spriteHeight * pulse / 2, spriteWidth * pulse, spriteHeight * pulse);
          ctx.restore();
        } else {
          const jawOpen = .28 + Math.sin(timestamp / 75 + effect.y) * .2;
          drawDinoHead(effect.x, effect.y, effect.size, effect.angle, jawOpen, timestamp, fade * .96, { color: '#42d66e', accent: '#d4ff72' });
        }
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
        const slashPulse = .84 + Math.sin(timestamp / 72 + effect.angle) * .16;
        const slashAlpha = Math.min(1, alpha * 1.8);
        ctx.save(); ctx.globalAlpha = slashAlpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (effect.trail.length > 1) {
          const drawBladeTrail = () => {
            ctx.beginPath(); ctx.moveTo(effect.trail[0].x, effect.trail[0].y);
            effect.trail.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
          };
          ctx.globalAlpha = slashAlpha * .28 * slashPulse; ctx.strokeStyle = '#ff8a21';
          ctx.shadowColor = '#ffae38'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
          ctx.lineWidth = mobileSize(5.5); drawBladeTrail(); ctx.stroke();
          ctx.globalAlpha = slashAlpha * .86 * slashPulse; ctx.strokeStyle = '#ffc86e';
          ctx.shadowColor = '#ffd36b'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
          ctx.lineWidth = mobileSize(2.5); drawBladeTrail(); ctx.stroke();
          ctx.globalAlpha = slashAlpha * .96; ctx.strokeStyle = '#fff5d3'; ctx.shadowBlur = 0;
          ctx.lineWidth = mobileSize(1); drawBladeTrail(); ctx.stroke();
          ctx.globalAlpha = slashAlpha * .72 * slashPulse; ctx.strokeStyle = '#fffbe9';
          ctx.setLineDash([mobileSize(3), mobileSize(11)]); ctx.lineDashOffset = -timestamp / 35;
          ctx.lineWidth = mobileSize(.8); drawBladeTrail(); ctx.stroke(); ctx.setLineDash([]);
          const sparkIndex = Math.floor(timestamp / 42) % effect.trail.length;
          const spark = effect.trail[sparkIndex];
          ctx.globalAlpha = slashAlpha * .92; ctx.fillStyle = '#fff9df'; ctx.shadowColor = '#ffc34f';
          ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
          ctx.beginPath(); ctx.arc(spark.x, spark.y, mobileSize(2), 0, Math.PI * 2); ctx.fill();
        }
        ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle);
        ctx.globalAlpha = slashAlpha * .34 * slashPulse; ctx.strokeStyle = '#ff8a21'; ctx.shadowColor = '#ffae38';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22); ctx.lineWidth = mobileSize(13);
        ctx.beginPath(); ctx.moveTo(-mobileSize(34), mobileSize(5)); ctx.quadraticCurveTo(0, -mobileSize(15), mobileSize(36), 0); ctx.stroke();
        ctx.globalAlpha = slashAlpha * .96 * slashPulse; ctx.strokeStyle = '#ffc86e'; ctx.shadowColor = '#ffd36b';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14); ctx.lineWidth = mobileSize(6);
        ctx.beginPath(); ctx.moveTo(-mobileSize(32), mobileSize(4)); ctx.quadraticCurveTo(0, -mobileSize(13), mobileSize(36), 0); ctx.stroke();
        ctx.globalAlpha = slashAlpha; ctx.strokeStyle = '#fff7dd'; ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(2);
        ctx.beginPath(); ctx.moveTo(-mobileSize(30), mobileSize(3)); ctx.quadraticCurveTo(0, -mobileSize(10), mobileSize(34), 0); ctx.stroke();
        ctx.globalAlpha = slashAlpha * .86; ctx.fillStyle = '#fff9df'; ctx.shadowColor = '#ffc34f';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        ctx.beginPath(); ctx.arc(mobileSize(30), 0, mobileSize(2.6 + slashPulse), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
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
    const perimeter = state.redshiftPerimeter;
    if (perimeter && abilitySourceIs('redshift')) {
      const vertices = redshiftPerimeterVertices(perimeter);
      const fade = clamp(perimeter.life / .55, 0, 1);
      const pulse = .72 + Math.sin(timestamp / 115) * .12;
      ctx.save();
      ctx.globalAlpha = fade * .055;
      ctx.fillStyle = '#d83a2e';
      ctx.beginPath(); vertices.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = fade * pulse; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = '#d83a2e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(16);
      ctx.strokeStyle = '#631d26'; ctx.lineWidth = mobileSize(8);
      ctx.beginPath(); vertices.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = '#d83a2e'; ctx.lineWidth = mobileSize(4.2);
      ctx.beginPath(); vertices.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = fade * (.58 + Math.sin(timestamp / 90) * .12);
      ctx.strokeStyle = '#ffd06a'; ctx.lineWidth = mobileSize(1.35); ctx.setLineDash([mobileSize(10), mobileSize(9)]); ctx.lineDashOffset = -timestamp * .045;
      ctx.beginPath(); vertices.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      vertices.forEach((point) => {
        const anchorPulse = 1 + Math.sin(timestamp / 95 + point.x * .01) * .12;
        ctx.globalAlpha = fade * .42; ctx.fillStyle = '#ffd06a'; ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(11 * anchorPulse), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = fade; ctx.fillStyle = '#d83a2e'; ctx.strokeStyle = '#ffd06a'; ctx.lineWidth = mobileSize(2.2);
        ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(6.5 * anchorPulse), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff1c6'; ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(2), 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
    const horizonAnchor = state.prismHorizonAnchor;
    if (horizonAnchor && currentSkin().id === 'prisma') {
      const pulse = .78 + Math.sin(timestamp / 125) * .12;
      const radius = mobileSize(13 + Math.sin(timestamp / 180) * 2);
      ctx.save(); ctx.globalAlpha = .68 * pulse; ctx.lineWidth = mobileSize(1.8);
      ctx.strokeStyle = '#ffe29a'; ctx.shadowColor = '#59e9f2'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
      ctx.setLineDash([mobileSize(4), mobileSize(5)]); ctx.lineDashOffset = -timestamp * .025;
      ctx.beginPath(); ctx.arc(horizonAnchor.x, horizonAnchor.y, radius + mobileSize(6), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#59e9f2'; ctx.beginPath(); ctx.arc(horizonAnchor.x, horizonAnchor.y, radius * .54, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff5d4'; ctx.beginPath(); ctx.arc(horizonAnchor.x, horizonAnchor.y, mobileSize(2.4), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    const decoy = state.eclipseDecoy;
    if (decoy && abilitySourceIs('eclipse')) {
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
    const chronosEchoActive = abilitySourceIs('chronos') && state.chronosEcho?.life > 0;
    if (!eclipseActive && chronosEchoActive && (state.invulnerable <= 0 || Math.floor(timestamp / 90) % 2 === 0)) {
      const trailOffset = mobileSize(5 + Math.sin(timestamp / 75) * 2.5);
      drawShip(state.player.x - Math.cos(state.player.angle) * trailOffset, state.player.y - Math.sin(state.player.angle) * trailOffset, state.player.radius * .9, currentSkin(), state.player.angle, .28);
      if (state.performanceMode !== 'light') drawShip(state.player.x - Math.cos(state.player.angle) * trailOffset * 2, state.player.y - Math.sin(state.player.angle) * trailOffset * 2, state.player.radius * .82, currentSkin(), state.player.angle, .13);
    }
    if (!eclipseActive && (state.invulnerable <= 0 || Math.floor(timestamp / 90) % 2 === 0)) drawShip(state.player.x, state.player.y, state.player.radius, currentSkin(), state.player.angle);
    if (!eclipseActive && (state.shields || state.tempShields)) { ctx.strokeStyle = `rgba(110,190,255,${.3 + Math.sin(timestamp / 150) * .12})`; ctx.lineWidth = mobileSize(2 + Math.min(3, state.tempShields)); ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(9 + state.tempShields * 2), 0, Math.PI * 2); ctx.stroke(); }
    const aegisOrbit = abilitySourceIs('aegis') && state.aegisOrbit?.life > 0 ? state.aegisOrbit : null;
    if (!eclipseActive && aegisOrbit) {
      const points = aegisOrbitPoints(aegisOrbit);
      const fade = clamp(aegisOrbit.life / .5, 0, 1);
      const orbitRadius = state.player.radius + mobileSize(22);
      const corePulse = .76 + Math.sin(timestamp / 82) * .12;
      ctx.save(); ctx.globalAlpha = .11 * corePulse; ctx.fillStyle = '#72bdff';
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(8), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .62 * corePulse; ctx.strokeStyle = '#d8f6ff'; ctx.lineWidth = mobileSize(1.6);
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(8), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .2 * fade; ctx.strokeStyle = '#b9e9ff'; ctx.lineWidth = mobileSize(1.2);
      ctx.setLineDash([mobileSize(3), mobileSize(7)]); ctx.lineDashOffset = -timestamp * .025;
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, orbitRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      for (const point of points) {
        if (!point.active) continue;
        const pulse = .9 + Math.sin(timestamp / 105 + point.index) * .1;
        ctx.globalAlpha = fade * .32; ctx.fillStyle = '#72bdff';
        ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(13 * pulse), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = fade; ctx.shadowColor = '#72bdff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        ctx.fillStyle = '#d8f6ff'; ctx.strokeStyle = '#72bdff'; ctx.lineWidth = mobileSize(2);
        ctx.beginPath(); ctx.moveTo(point.x, point.y - mobileSize(8 * pulse)); ctx.lineTo(point.x + mobileSize(6 * pulse), point.y); ctx.lineTo(point.x, point.y + mobileSize(8 * pulse)); ctx.lineTo(point.x - mobileSize(6 * pulse), point.y); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = fade * .9; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(point.x, point.y, mobileSize(1.7), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    if (!eclipseActive) for (let i = 0; i < state.drones; i++) { const a = timestamp / 800 + i * Math.PI * 2 / state.drones; ctx.fillStyle = '#eafaff'; ctx.shadowColor = currentSkin().color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12); ctx.beginPath(); ctx.arc(state.player.x + Math.cos(a) * mobileSize(39), state.player.y + Math.sin(a) * mobileSize(39), mobileSize(5), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    drawDamageCounter(timestamp);
  }
  function drawDamageCounter(timestamp) {
    const canShow = state.damageCounterEnabled && ['playing', 'paused', 'upgrade'].includes(state.mode) && state.damageCounterTotal > 0;
    if (!canShow && !state.damageCounterEditing) return;
    const scale = state.mobileSizing ? .86 : 1;
    const idle = canShow ? state.damageCounterIdle : 0;
    const fade = state.damageCounterEditing ? 1 : 1 - clamp((idle - 2) / .85, 0, 1);
    if (fade <= 0) return;
    const position = normalizeDamageCounterPosition(state.damageCounterPosition);
    const x = state.width * position.x;
    const y = state.height * position.y - Math.min(18 * scale, Math.max(0, idle - 2) * 22 * scale);
    const number = (value) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, mobileSize(3)); ctx.strokeStyle = 'rgba(3, 10, 19, .92)';
    ctx.font = '900 ' + Math.max(11, 14 * scale) + 'px system-ui';
    ctx.fillStyle = '#fff4f2';
    const latest = state.damageCounterLastHit > 0 ? '+' + number(state.damageCounterLastHit) + ' DMG' : state.damageCounterEditing ? 'ARRASTE PARA MOVER' : '';
    if (latest) { ctx.strokeText(latest, x, y - 24 * scale); ctx.fillText(latest, x, y - 24 * scale); }
    ctx.font = '800 ' + Math.max(8, 9 * scale) + 'px system-ui';
    ctx.fillStyle = '#9bb7c6';
    ctx.strokeText('DANO TOTAL', x, y - 8 * scale);
    ctx.fillText('DANO TOTAL', x, y - 8 * scale);
    ctx.font = '950 ' + Math.max(18, 25 * scale) + 'px system-ui';
    ctx.lineWidth = Math.max(3, mobileSize(4));
    ctx.fillStyle = '#eafffb';
    ctx.shadowColor = '#55dccc'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
    const total = number(state.damageCounterTotal);
    ctx.strokeText(total, x, y + 13 * scale);
    ctx.fillText(total, x, y + 13 * scale);
    ctx.shadowBlur = 0;
    if (!state.damageCounterEditing) for (const popup of state.damageCounterPopups) {
      const alpha = clamp(popup.life / popup.total, 0, 1);
      const rise = (1 - alpha) * mobileSize(20);
      const label = '+' + number(popup.amount);
      ctx.globalAlpha = alpha * fade;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 ' + Math.max(10, 14 * scale) + 'px system-ui';
      ctx.lineWidth = Math.max(2, mobileSize(3)); ctx.strokeStyle = 'rgba(8, 13, 23, .96)';
      ctx.fillStyle = '#fff4f2';
      ctx.strokeText(label, popup.x, popup.y - rise);
      ctx.fillText(label, popup.x, popup.y - rise);
      ctx.font = '900 ' + Math.max(7, 8 * scale) + 'px system-ui';
      ctx.fillStyle = '#ff8d91';
      ctx.strokeText('DMG', popup.x, popup.y - rise + mobileSize(11));
      ctx.fillText('DMG', popup.x, popup.y - rise + mobileSize(11));
    }
    ctx.restore();
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
    if (count) count.textContent = String(window.CV_GAMES_COUNT_VISIBLE_FAVORITES?.() ?? favorites.size);
  }
  function toggleFavorite() {
    const favorites = readFavorites(); if (favorites.has(gameId)) favorites.delete(gameId); else favorites.add(gameId);
    try { localStorage.setItem(favoritesKey, JSON.stringify([...favorites])); window.dispatchEvent(new Event('cv-games-favorites-change')); } catch { /* Favoritos são opcionais. */ }
    updateFavorite();
  }
  function supabaseConfig() { const config = window.CV_STARFALL_SUPABASE || {}; return config.url && (config.publicKey || config.anonKey) ? config : null; }
  function supabaseHeaders(config, accessToken = '') {
    const key = config.publicKey || config.anonKey;
    const headers = { apikey: key };
    if (accessToken) headers.Authorization = 'Bearer ' + accessToken;
    else if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
    return headers;
  }
  function authorizedNickname(session) {
    const nickname = profileNickname();
    const names = (window.CV_STARFALL_SUPABASE?.allowedNicknames || ['educvv']).map(normalizeRankNickname);
    if (!nickname || !names.includes(nickname)) return '';
    if (nickname === 'educvv') return window.CV_GAMES_AUTH?.isOwner?.(session?.user) ? 'educvv' : '';
    return nickname;
  }
  function renderAuthorizedPilots() {
    if (!ui.authorizedPilots) return;
    const visible = isDeveloperProfile();
    ui.authorizedPilots.hidden = !visible;
    if (!visible || !ui.authorizedPilotList) return;
    const names = window.CV_STARFALL_SUPABASE?.rosterNicknames || [];
    ui.authorizedPilotList.replaceChildren(...names.map((nickname) => {
      const item = document.createElement('li');
      item.textContent = nickname;
      return item;
    }));
  }
  function handleProfileChange() {
    if (state.damageCounterEditing) finishDamageCounterEdit(false);
    const selected = currentSkin();
    if (selected.secret && !hasSecretShipAccess(selected)) {
      state.selectedSkin = 'aurora';
      try { localStorage.setItem('cv-games-cv-starfall-skin', 'aurora'); } catch { /* A nave inicial vale nesta sessão. */ }
    }
    renderSkinPicker();
    updateEquippedShip();
    updateControlUI();
    renderAuthorizedPilots();
    updateAdminToolsUI();
    reconcileAbilityCollectorAchievement();
    loadNicknameSettings();
  }
  async function copyAuthorizedPilots() {
    const names = window.CV_STARFALL_SUPABASE?.rosterNicknames || [];
    if (!names.length || !ui.authorizedPilotsStatus) return;
    try {
      await navigator.clipboard.writeText(names.join('\n'));
      ui.authorizedPilotsStatus.textContent = 'Lista copiada.';
    } catch {
      ui.authorizedPilotsStatus.textContent = 'Selecione os apelidos na lista para copiá-los.';
    }
  }
  function renderLeaderboard(rows) {
    if (!ui.rankList) return;
    ui.rankList.replaceChildren();
    const symbols = ['★', '✦', '✧'];
    for (let index = 0; index < 10; index += 1) {
      const row = rows[index];
      const position = index + 1;
      const item = document.createElement('li');
      item.className = `starfall-rank-item starfall-rank-place-${position}${row ? '' : ' is-empty'}`;
      const rank = document.createElement('strong');
      rank.className = 'starfall-rank-medal';
      rank.setAttribute('role', 'img');
      rank.setAttribute('aria-label', position === 4 ? '4º lugar, SUB 1' : position === 5 ? '5º lugar, SUB 2' : `${position}º lugar`);
      if (position <= 3) {
        const star = document.createElement('span'); star.className = 'starfall-rank-star'; star.setAttribute('aria-hidden', 'true'); star.textContent = symbols[index];
        const place = document.createElement('small'); place.textContent = String(position);
        rank.append(star, place);
      } else if (position === 4 || position === 5) {
        const subrank = document.createElement('span'); subrank.className = 'starfall-rank-subrank'; subrank.textContent = position === 4 ? 'SUB 1' : 'SUB 2';
        rank.append(subrank);
      } else rank.textContent = String(position);

      const body = document.createElement('div'); body.className = 'starfall-rank-body';
      const name = document.createElement('strong'); name.className = 'starfall-rank-nickname'; name.textContent = row ? displayRankNickname(row.nickname) : 'Vaga disponível';
      const wave = document.createElement('span'); wave.className = 'starfall-rank-wave'; wave.textContent = row ? `Onda ${Number(row.wave) || 1}` : 'Aguardando piloto';
      body.append(name, wave);
      item.append(rank, body);

      if (row) {
        const inspect = document.createElement('button');
        inspect.type = 'button'; inspect.className = 'starfall-rank-inspect'; inspect.textContent = 'Ver detalhes';
        inspect.setAttribute('aria-label', `Ver detalhes do recorde de ${displayRankNickname(row.nickname)}`);
        inspect.addEventListener('click', () => showRankDetails(row, position));
        item.append(inspect);
      }
      ui.rankList.append(item);
    }
  }
  function makeRankMetric(label, value, icon) {
    const tile = document.createElement('div'); tile.className = 'starfall-rank-metric';
    const symbol = document.createElement('span'); symbol.className = 'starfall-rank-metric-icon'; symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = icon;
    const copy = document.createElement('span'); copy.className = 'starfall-rank-metric-copy';
    const caption = document.createElement('small'); caption.textContent = label;
    const result = document.createElement('strong'); result.textContent = String(value);
    copy.append(caption, result); tile.append(symbol, copy); return tile;
  }
  function makeRankSvgElement(tag, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
    return element;
  }
  function makeRankShipModel(shipId) {
    const skin = skins.find((item) => item.id === shipId) || skins[0];
    if (skin.shape === 'eclipse') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image';
      image.src = 'eclipse-ship.png'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
      return image;
    }
    if (skin.shape === 'dino') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image starfall-rank-saurion-image';
      image.src = 'saurion-raptor-skill.png'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
      return image;
    }
    const svg = makeRankSvgElement('svg', { class:'starfall-rank-ship-model', viewBox:'0 0 100 110', 'aria-hidden':'true' });
    const add = (tag, attributes) => svg.append(makeRankSvgElement(tag, attributes));
    const hulls = {
      classic:'M50 6 L84 86 L50 68 L16 86 Z',
      blade:'M50 5 L59 37 L88 85 L50 70 L12 85 L41 37 Z',
      wing:'M50 6 L62 36 L90 77 L63 70 L50 98 L37 70 L10 77 L38 36 Z',
      shield:'M50 6 L82 37 L75 79 L50 97 L25 79 L18 37 Z',
      ring:'M50 6 L84 86 L50 68 L16 86 Z',
      reflector:'M50 5 L72 22 L88 47 L75 78 L60 71 L50 96 L40 71 L25 78 L12 47 L28 22 Z',
      prism:'M50 4 L82 25 L74 70 L50 97 L26 70 L18 25 Z'
    };
    add('path', { d:hulls[skin.shape] || hulls.classic, fill:skin.color, stroke:skin.accent, 'stroke-width':3, 'stroke-linejoin':'round' });
    if (skin.shape === 'prism') {
      add('path', { d:'M50 10 L68 29 L64 67 L50 83 L36 67 L32 29 Z', fill:'#123749', stroke:'#baffff', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('path', { d:'M50 12 L50 78 M31 30 L68 30 M35 66 L65 66', fill:'none', stroke:'#ffe29a', 'stroke-width':2, 'stroke-linecap':'round', opacity:.9 });
      add('path', { d:'M39 84 L50 103 L61 84', fill:'#59e9f2', stroke:'#ffe29a', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('ellipse', { cx:50, cy:44, rx:5, ry:9, fill:'#f5ffff', opacity:.95 });
      return svg;
    }
    add('ellipse', { cx:50, cy:45, rx:8, ry:18, fill:'#f1ffff', opacity:.94 });
    add('path', { d:'M40 76 L50 96 L60 76', fill:skin.accent, opacity:.95 });
    if (skin.shape === 'ring') add('ellipse', { cx:50, cy:55, rx:44, ry:19, fill:'none', stroke:skin.accent, 'stroke-width':2.5, opacity:.85 });
    if (skin.shape === 'reflector') add('path', { d:'M14 43 Q50 9 86 43', fill:'none', stroke:skin.accent, 'stroke-width':4, 'stroke-linecap':'round' });
    return svg;
  }
  function makeRankShipMetric(row) {
    const tile = document.createElement('div'); tile.className = 'starfall-rank-metric starfall-rank-ship-metric';
    const art = document.createElement('span'); art.className = 'starfall-rank-metric-icon starfall-rank-ship-art'; art.append(makeRankShipModel(row.ship_id));
    const copy = document.createElement('span'); copy.className = 'starfall-rank-metric-copy';
    const caption = document.createElement('small'); caption.textContent = 'Nave utilizada';
    const result = document.createElement('strong'); result.textContent = row.ship_name || 'Nave';
    copy.append(caption, result); tile.append(art, copy); return tile;
  }
  function makeRankDetailCard(title, icon, entries) {
    const card = document.createElement('section'); card.className = 'starfall-rank-detail-card';
    const heading = document.createElement('h3');
    const symbol = document.createElement('span'); symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = icon;
    const label = document.createElement('span'); label.textContent = title;
    heading.append(symbol, label); card.append(heading);
    const list = document.createElement('div'); list.className = 'starfall-rank-detail-list';
    entries.forEach(([name, value]) => {
      const entry = document.createElement('div'); entry.className = 'starfall-rank-detail-entry';
      const caption = document.createElement('span'); caption.textContent = name;
      const result = document.createElement('strong'); result.textContent = String(value);
      entry.append(caption, result); list.append(entry);
    });
    card.append(list); return card;
  }
  function showRankDetails(row, position) {
    if (!ui.rankDialog) return;
    const buff = row.buff_summary && typeof row.buff_summary === 'object' ? row.buff_summary : {};
    const value = (key, fallback) => buff[key] === undefined || buff[key] === null || buff[key] === '' ? fallback : buff[key];
    ui.rankDialogKicker.textContent = `RELATÓRIO DE PILOTO · ${position}º LUGAR`;
    ui.rankDialogTitle.textContent = displayRankNickname(row.nickname);
    ui.rankDialogSummary.textContent = `Onda ${Number(row.wave) || 1} · ${Number(row.score || 0).toLocaleString('pt-BR')} pontos · ${formatTime(Number(row.elapsed_seconds) || 0)}`;
    ui.rankDetailOverview.replaceChildren(
      makeRankShipMetric(row),
      makeRankMetric('Onda alcançada', Number(row.wave) || 1, '🌌'),
      makeRankMetric('Pontuação', Number(row.score || 0).toLocaleString('pt-BR'), '✦'),
      makeRankMetric('Tempo de missão', formatTime(Number(row.elapsed_seconds) || 0), '◷')
    );

    const sections = [];
    const upgradeCategories = [
      { title:'Canhões e ataque', icon:'✹', ids:['damage','rapid','spread','pierce','critical','volley','bossDamage','blast'] },
      { title:'Defesa da nave', icon:'🛡️', ids:['repair','shield','armor','regen','drone','lifeSupport','salvageHeal'] },
      { title:'Habilidades especiais', icon:'✦', ids:['cooldown','power','gravityWell','auroraLinkDuration','auroraLinkTargets','auroraLinkDamage','auroraLinkCooldown','aegisOrbitDuration','aegisOrbitCount','aegisOrbitDamage','aegisOrbitCooldown','chronosEchoDuration','chronosEchoDamage','chronosEchoCooldown','tempestTideRadius','tempestTideForce','tempestTideCapacity','tempestTideDamage','tempestTideSweep','tempestTideCooldown','returnCore','redshiftPerimeterDuration','redshiftPerimeterDamage','redshiftPerimeterRange','redshiftPerimeterCooldown','flashTrailDuration','flashTrailDamage','flashTrailDensity','flashTrailCooldown','eclipseVeil','eclipseCooldown','eclipseDamage','eclipseDecoyAI','eclipseDecoyDuration','eclipseDecoyChaos','dinoFangs','dinoStampede','dinoResonance'] },
      { title:'Mobilidade e recursos', icon:'➤', ids:['speed','lowHull','magnet','bounty','endlessDamage','endlessSpeed'] }
    ];
    const detailedUpgrades = Array.isArray(buff.melhorias_detalhadas) ? buff.melhorias_detalhadas : [];
    upgradeCategories.forEach((category) => {
      const upgrades = detailedUpgrades.filter((upgrade) => category.ids.includes(upgrade.id));
      if (!upgrades.length) return;
      const card = document.createElement('section'); card.className = 'starfall-rank-detail-card starfall-rank-upgrade-card';
      const heading = document.createElement('h3');
      const symbol = document.createElement('span'); symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = category.icon;
      const label = document.createElement('span'); label.textContent = category.title;
      heading.append(symbol, label); card.append(heading);
      const chips = document.createElement('div'); chips.className = 'starfall-rank-upgrade-list';
      upgrades.forEach((upgrade) => {
        const chip = document.createElement('div'); chip.className = 'starfall-rank-upgrade-chip';
        const icon = document.createElement('span'); icon.className = 'starfall-rank-upgrade-icon'; icon.textContent = upgrade.icone || '✦';
        const name = document.createElement('strong'); name.textContent = upgrade.nome || upgrade.id;
        const level = document.createElement('small'); level.textContent = `Nível ${Number(upgrade.nivel) || 1}`;
        chip.append(icon, name, level); chips.append(chip);
      });
      card.append(chips); sections.push(card);
    });
    if (!detailedUpgrades.length) {
      const note = document.createElement('p'); note.className = 'starfall-rank-detail-empty';
      note.textContent = 'A lista de melhorias por nome não foi registrada nesta missão. Os atributos finais continuam disponíveis abaixo.';
      sections.push(note);
    }
    sections.push(
      makeRankDetailCard('Combate', '⚔', [
        ['Dano por disparo', value('dano','1.00')], ['Disparos por salva', value('disparos','1')], ['Intervalo de tiro', value('recarga','0.34s')],
        ['Dano contra chefes', value('dano_chefe','0%')], ['Chance crítica', value('chance_critica','0%')], ['Perfuração', value('perfuracao','0')]
      ]),
      makeRankDetailCard('Defesa', '🛡️', [
        ['Vida máxima', value('vida_maxima','6')], ['Escudos restantes', value('escudos','0')], ['Drones auxiliares', value('drones','0')], ['Reparo de destroços', value('reparo_dest','0%')]
      ]),
      makeRankDetailCard('Habilidade e recursos', '✦', [
        ['Recarga da habilidade', value('recarga_habilidade','—')], ['Raio de plasma', value('explosao','0')],
        ['Raio do poço negro', Number(value('buraco_negro',0)) ? `${value('buraco_negro',0)} px` : 'Não utilizado'],
        ['Núcleo adaptativo', value('reforco_adaptativo','0%')], ['Impulso extra', `+${value('impulso_extra','0')}`], ['Alcance do ímã', value('magnetismo','—')], ['Total de melhorias', value('melhorias','0')]
      ])
    );
    ui.rankDetailSections.replaceChildren(...sections);
    if (!ui.rankDialog.open) ui.rankDialog.showModal();
  }
  async function refreshLeaderboard() {
    const config = supabaseConfig();
    if (!config) { if (ui.rankStatus) ui.rankStatus.textContent = 'Aguardando configuração do Supabase'; renderLeaderboard([]); return; }
    try {
      const url = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores?select=nickname,wave,score,elapsed_seconds,ship_id,ship_name,buff_summary&order=wave.desc,score.desc&limit=10';
      const response = await fetch(url, { headers: supabaseHeaders(config) });
      if (!response.ok) throw new Error('Ranking indisponível');
      const rows = await response.json();
      const myRank = rows.find((row) => normalizeRankNickname(row.nickname) === profileNickname());
      if (myRank) {
        saveNicknameRankBestWave(profileNickname(), myRank.wave);
        state.bestCompletedWave = Math.max(state.bestCompletedWave, readNicknameRankBestWave());
        saveBestWave();
      }
      renderLeaderboard(rows);
    if (ui.rankStatus) ui.rankStatus.textContent = 'Placar compartilhado';
    } catch {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Placar indisponível agora';
      renderLeaderboard([]);
    }
  }
  async function submitRun(run) {
    if (run?.ship_id === 'prisma') {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Missão com a Prisma Real: não conta para o placar.';
      return;
    }
    const config = supabaseConfig();
    if (!config) { if (ui.rankStatus) ui.rankStatus.textContent = 'Configure o Supabase para publicar recordes'; return; }
    let session = null;
    try { session = await window.CV_GAMES_AUTH?.getOwnerSession?.() || null; } catch { session = null; }
    const nickname = authorizedNickname(session);
    if (!nickname) {
      if (ui.rankStatus) ui.rankStatus.textContent = profileNickname() === 'educvv'
        ? 'Entre na conta educvv pelo Perfil para publicar seu recorde.'
        : 'Este apelido não está autorizado para o placar.';
      return;
    }
    if (nickname === 'educvv' && !session?.access_token) { if (ui.rankStatus) ui.rankStatus.textContent = 'Entre na conta educvv pelo Perfil para publicar seu recorde.'; return; }
    const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores';
    const headers = supabaseHeaders(config, nickname === 'educvv' ? session.access_token : '');
    try {
      const read = await fetch(base + '?select=wave,score&nickname=eq.' + encodeURIComponent(nickname) + '&limit=1', { headers });
      if (!read.ok) throw new Error('Não foi possível consultar o recorde.');
      const previous = (await read.json())[0];
      if (previous) saveNicknameRankBestWave(nickname, previous.wave);
      saveNicknameRankBestWave(nickname, run.wave);
      const better = !previous || run.wave > previous.wave || (run.wave === previous.wave && run.score > previous.score);
      if (!better) { if (ui.rankStatus) ui.rankStatus.textContent = 'Seu melhor resultado continua no placar'; return; }
      run.nickname = nickname;
      const response = await fetch(base + '?on_conflict=nickname', {
        method: 'POST',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(run)
      });
      if (!response.ok) throw new Error('Não foi possível salvar o recorde.');
      state.bestCompletedWave = Math.max(state.bestCompletedWave, readNicknameRankBestWave(nickname));
      saveBestWave();
      if (ui.rankStatus) ui.rankStatus.textContent = 'Recorde de ' + displayRankNickname(nickname) + ' publicado';
    } catch {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Não foi possível salvar o recorde';
    }
  }
  function updateControlUI() {
    document.querySelectorAll('[data-control-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.controlMode === state.controlMode)));
    if (ui.joystick && !state.analog.active) ui.joystick.hidden = true;
    const hardwareInputDetected = document.documentElement.classList.contains('cv-hardware-input-detected');
    const isAurora = currentSkin().id === 'aurora';
    const isAegis = currentSkin().id === 'aegis';
    const isEclipse = currentSkin().id === 'eclipse';
    const isChronos = currentSkin().id === 'chronos';
    const isSaurion = currentSkin().id === 'saurion';
    const isRedshift = currentSkin().id === 'redshift';
    const isFlashblade = currentSkin().id === 'flashblade';
    const isTempest = currentSkin().id === 'tempest';
    const isPrisma = currentSkin().id === 'prisma';
    const abilityInstruction = isPrisma ? 'E e Q ativam poderes escolhidos · G abre o Arquivo de Ecos' : isAurora ? 'E cria a Explosão Nova · Q encadeia feixes entre inimigos' : isAegis ? 'E absorve impactos · Q converte tiros interceptados em projéteis teleguiados' : isEclipse ? 'E abre o Domínio · Q ativa a Isca Umbral móvel' : isChronos ? 'E desacelera o tempo · Q repete os disparos com ecos temporais' : isSaurion ? 'E libera o Rugido de Garras · Q com 3 cargas chama raptores que perseguem inimigos marcados' : isRedshift ? 'E reflete projéteis · Q ativa o Perímetro de Cerco' : isFlashblade ? 'E lança o Corte Flash · Q deixa rastros cortantes no trajeto' : isTempest ? 'E guia o Poço Negro suavemente pelo movimento · Q afasta inimigos próximos' : 'ativa a habilidade';
    if (ui.controlHint) ui.controlHint.textContent = state.controlMode === 'keys'
      ? hardwareInputDetected ? 'WASD ou setas movem · ' + abilityInstruction + ' · disparo automático.' : 'Disparo automático · controles configuráveis.'
      : state.controlMode === 'touch' ? 'Toque e arraste na arena para mover · ' + (isAurora || isAegis || isEclipse || isChronos || isSaurion || isRedshift || isFlashblade || isTempest || isPrisma ? 'botões das habilidades E e Q.' : 'use o botão da habilidade.')
        : 'Toque em qualquer ponto da arena e arraste o analógico translúcido · solte para ocultar.' + (isAurora || isAegis || isEclipse || isChronos || isSaurion || isRedshift || isFlashblade || isTempest || isPrisma ? ' Botões E e Q ativam as habilidades.' : '');
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
  window.addEventListener('cv-games-profile-change', handleProfileChange);
  function refreshDeviceSizing() {
    state.mobileSizing = detectMobileDevice();
    const maxParticles = particleLimit();
    if (state.particles.length > maxParticles) state.particles.splice(0, state.particles.length - maxParticles);
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
    if (ui.missionSetupModal?.hidden) state.preferencesConfigured = true;
    try { localStorage.setItem(performanceModeKey, mode); } catch { /* Preferência vale para a sessão. */ }
    saveNicknameSettings();
    const maxParticles = particleLimit();
    if (state.particles.length > maxParticles) state.particles.splice(0, state.particles.length - maxParticles);
    updatePerformanceModeUI();
    resize();
    if (ui.missionSetupModal?.hidden && ui.settingsModal?.hidden) toast(mode === 'light' ? 'MODO LEVE ATIVADO' : 'MODO NORMAL ATIVADO');
  }
  function syncAudioVisibility() {
    if (!ui.audio) return;
    const modalOpen = [ui.missionSetupModal, ui.exitModal, ui.settingsModal, ui.shipModal, ui.prismWheel, ui.prismRankNotice, ui.checkpointModal, ui.achievementsModal, ui.dailySummaryModal]
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
    if (state.preferencesConfigured) { startGame(dailyChallenge); return; }
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
    state.preferencesConfigured = true;
    saveNicknameSettings();
    if (ui.missionSetupModal) ui.missionSetupModal.hidden = true;
    syncAudioVisibility();
    startGame(dailyChallenge);
  }
  function openSavedMissionPrompt(checkpoint) {
    if (!ui.checkpointModal) { startGame(false, checkpoint); return; }
    checkpoint.wave = Math.max(Number(checkpoint.wave) || 1, readProfileResumeWave());
    const ship = skins.find((item) => item.id === checkpoint.shipId) || skins[0];
    if (ui.checkpointSummary) ui.checkpointSummary.textContent = `Onda ${checkpoint.wave} · ${formatTime(checkpoint.elapsed)} · ${Number(checkpoint.score).toLocaleString('pt-BR')} pontos · ${ship.name}. Seus pontos e melhorias estão guardados; a onda salva recomeça do início.`;
    ui.checkpointModal.hidden = false;
    syncAudioVisibility();
    ui.checkpointModal.querySelector('[data-resume-saved-mission]')?.focus();
  }
  function closeSavedMissionPrompt() {
    if (!ui.checkpointModal || ui.checkpointModal.hidden) return;
    ui.checkpointModal.hidden = true;
    syncAudioVisibility();
    ui.start?.focus({ preventScroll:true });
  }
  function beginMissionFlow() {
    if (!['intro', 'gameover'].includes(state.mode)) return;
    const checkpoint = readMissionCheckpoint();
    if (checkpoint) { openSavedMissionPrompt(checkpoint); return; }
    openMissionSetup();
  }
  function resumeSavedMission() {
    const checkpoint = readMissionCheckpoint();
    if (!checkpoint) { closeSavedMissionPrompt(); openMissionSetup(); return; }
    checkpoint.wave = Math.max(Number(checkpoint.wave) || 1, readProfileResumeWave());
    if (ui.checkpointModal) ui.checkpointModal.hidden = true;
    syncAudioVisibility();
    startGame(false, checkpoint);
  }
  function startFreshMissionFromPrompt() {
    clearMissionCheckpoint();
    if (ui.checkpointModal) ui.checkpointModal.hidden = true;
    syncAudioVisibility();
    openMissionSetup();
  }
  function createExitChoiceButton(attribute, label, variant) {
    const actions = ui.exitModal?.querySelector('.starfall-setup-actions');
    if (!actions) return null;
    let button = actions.querySelector(`[${attribute}]`);
    if (button) return button;
    button = document.createElement('button');
    button.type = 'button'; button.className = `button ${variant}`; button.setAttribute(attribute, ''); button.textContent = label;
    actions.append(button);
    return button;
  }
  function saveAndExitMission() {
    const saved = saveMissionCheckpoint();
    if (!saved) {
      const copy = ui.exitModal?.querySelector('h2 + p');
      if (copy) copy.textContent = 'Não foi possível guardar a missão neste aparelho. Você ainda pode continuar jogando ou finalizar.';
      return;
    }
    if (ui.exitModal) ui.exitModal.hidden = true;
    state.exitWasPlaying = false; state.exitReturnFocus = null;
    syncAudioVisibility();
    returnToMenu();
  }
  function finalizeMissionFromExit() {
    if (ui.exitModal) ui.exitModal.hidden = true;
    state.exitWasPlaying = false; state.exitReturnFocus = null;
    syncAudioVisibility();
    finishGame();
  }
  function openExitConfirmation() {
    if (!ui.exitModal) { returnToMenu(); return; }
    state.exitReturnFocus = document.activeElement;
    state.exitWasPlaying = ['playing', 'paused'].includes(state.mode);
    if (state.mode === 'playing') pauseGame();
    const activeMission = ['playing', 'paused', 'upgrade'].includes(state.mode);
    const canSaveMission = ['playing', 'paused'].includes(state.mode);
    const saveButton = createExitChoiceButton('data-save-and-exit', 'SALVAR E SAIR', 'button-secondary');
    const finalizeButton = createExitChoiceButton('data-finalize-from-exit', 'FINALIZAR MISSÃO', 'button-primary');
    if (saveButton) saveButton.hidden = !canSaveMission || state.dailyChallenge;
    if (finalizeButton) finalizeButton.hidden = !activeMission;
    const confirmButton = ui.exitModal.querySelector('[data-confirm-exit]');
    if (confirmButton) confirmButton.hidden = activeMission;
    const cancelButton = ui.exitModal.querySelector('[data-cancel-exit]');
    if (cancelButton) cancelButton.textContent = activeMission ? 'CONTINUAR MISSÃO' : 'CANCELAR';
    const copy = ui.exitModal.querySelector('h2 + p');
    if (copy) copy.textContent = activeMission
      ? state.dailyChallenge ? 'Você pode continuar o desafio ou encerrá-lo agora.' : 'A missão já é salva ao pausar. Escolha se quer guardá-la para depois ou encerrar agora.'
      : 'Deseja voltar ao menu?';
    if (saveButton) saveButton.onclick = saveAndExitMission;
    if (finalizeButton) finalizeButton.onclick = finalizeMissionFromExit;
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
    if (ui.secretUnlockDialog?.open) ui.secretUnlockDialog.close();
    [ui.missionSetupModal, ui.exitModal, ui.checkpointModal, ui.settingsModal, ui.shipModal, ui.achievementsModal, ui.dailySummaryModal]
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
  function beginDamageCounterEdit() {
    state.damageCounterEditStart = { ...state.damageCounterPosition };
    state.damageCounterEditing = true;
    state.damageCounterDragging = false;
    state.damageCounterEditorHadMenu = Boolean(ui.overlay && !ui.overlay.hidden);
    if (ui.settingsModal) ui.settingsModal.hidden = true;
    if (state.damageCounterEditorHadMenu && ui.overlay) ui.overlay.hidden = true;
    if (ui.damageCounterEditor) ui.damageCounterEditor.hidden = false;
    canvas.style.cursor = 'grab';
    syncAudioVisibility();
    draw(performance.now());
  }
  function finishDamageCounterEdit(save) {
    if (!state.damageCounterEditing) return;
    if (save) {
      state.damageCounterPosition = normalizeDamageCounterPosition(state.damageCounterPosition);
      saveNicknameSettings();
    } else if (state.damageCounterEditStart) state.damageCounterPosition = { ...state.damageCounterEditStart };
    state.damageCounterEditing = false;
    state.damageCounterDragging = false;
    state.damageCounterEditStart = null;
    if (ui.damageCounterEditor) ui.damageCounterEditor.hidden = true;
    if (ui.overlay) ui.overlay.hidden = !['intro', 'gameover', 'paused'].includes(state.mode);
    canvas.style.cursor = '';
    syncAudioVisibility();
    draw(performance.now());
  }
  function closeSettings() { if (ui.settingsModal) ui.settingsModal.hidden = true; syncAudioVisibility(); }
  function openShips() {
    if (!['intro', 'gameover'].includes(state.mode)) return;
    if (ui.shipModal) ui.shipModal.hidden = false;
    syncAudioVisibility();
    ui.shipModal?.querySelector('[data-close-ships]')?.focus();
  }
  function closeShips() { if (ui.shipModal) ui.shipModal.hidden = true; syncAudioVisibility(); }
  function closePrismRankNotice() {
    if (!ui.prismRankNotice || ui.prismRankNotice.hidden) return;
    ui.prismRankNotice.hidden = true;
    syncAudioVisibility();
    $('[data-open-ships]')?.focus({ preventScroll:true });
  }
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
    state.savedControlMode = state.controlMode;
    if (ui.missionSetupModal?.hidden) state.preferencesConfigured = true;
    try { localStorage.setItem(controlModeKey, state.controlMode); } catch { /* Preferência vale para a sessão. */ }
    state.keys.clear(); state.pointer.active = false; releaseAnalog(); updateControlUI();
    saveNicknameSettings();
  }));
  ui.performanceModeButtons.forEach((button) => button.addEventListener('click', () => setPerformanceMode(button.dataset.performanceMode)));
  $('[data-open-settings]')?.addEventListener('click', openSettings);
  $('[data-open-ships]')?.addEventListener('click', openShips);
  ui.prismSelect?.addEventListener('click', openPrismWheel);
  document.querySelectorAll('[data-prism-slot]').forEach((button) => button.addEventListener('click', () => { setPrismAbilitySlot(button.dataset.prismSlot); renderPrismWheel(); }));
  document.querySelectorAll('[data-close-prism-wheel]').forEach((button) => button.addEventListener('click', closePrismWheel));
  ui.prismWheel?.addEventListener('click', (event) => { if (event.target === ui.prismWheel) closePrismWheel(); });
  document.querySelectorAll('[data-close-prism-rank-notice]').forEach((button) => button.addEventListener('click', closePrismRankNotice));
  ui.prismRankNotice?.addEventListener('click', (event) => { if (event.target === ui.prismRankNotice) closePrismRankNotice(); });
  ui.eclipseSkipCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    state.eclipseSkipVideoEnabled = checkbox.checked;
    ui.eclipseSkipCheckboxes.forEach((item) => { item.checked = checkbox.checked; });
    saveNicknameSettings();
  }));
  ui.damageCounterCheckbox?.addEventListener('change', () => {
    state.damageCounterEnabled = ui.damageCounterCheckbox.checked;
    if (!state.damageCounterEnabled) state.damageCounterPopups = [];
    saveNicknameSettings();
    draw(performance.now());
  });
  ui.editDamageCounter?.addEventListener('click', beginDamageCounterEdit);
  ui.saveDamageCounter?.addEventListener('click', () => finishDamageCounterEdit(true));
  ui.cancelDamageCounter?.addEventListener('click', () => finishDamageCounterEdit(false));
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
  $('[data-close-ship-details]')?.addEventListener('click', () => ui.shipDetailsDialog?.close());
  ui.shipDetailsDialog?.addEventListener('click', (event) => { if (event.target === ui.shipDetailsDialog) ui.shipDetailsDialog.close(); });
  document.querySelectorAll('[data-secret-unlock-close]').forEach((button) => button.addEventListener('click', closeSecretShipUnlock));
  ui.secretUnlockForm?.addEventListener('submit', submitSecretShipUnlock);
  ui.secretUnlockDialog?.addEventListener('click', (event) => { if (event.target === ui.secretUnlockDialog) closeSecretShipUnlock(); });
  ui.secretUnlockDialog?.addEventListener('cancel', () => { ui.secretUnlockError.hidden = true; });
  document.querySelectorAll('[data-close-achievements]').forEach((button) => button.addEventListener('click', closeAchievements));
  $('[data-close-rank-dialog]')?.addEventListener('click', () => ui.rankDialog?.close());
  ui.rankDialog?.addEventListener('click', (event) => { if (event.target === ui.rankDialog) ui.rankDialog.close(); });
  ui.copyAuthorizedPilots?.addEventListener('click', copyAuthorizedPilots);
  document.querySelectorAll('[data-close-daily-summary]').forEach((button) => button.addEventListener('click', closeDailySummary));
  ui.dailySummaryStart?.addEventListener('click', () => openMissionSetup(true));
  document.querySelectorAll('[data-close-checkpoint]').forEach((button) => button.addEventListener('click', closeSavedMissionPrompt));
  $('[data-resume-saved-mission]')?.addEventListener('click', resumeSavedMission);
  $('[data-start-fresh-mission]')?.addEventListener('click', startFreshMissionFromPrompt);
  ui.checkpointModal?.addEventListener('click', (event) => { if (event.target === ui.checkpointModal) closeSavedMissionPrompt(); });
  ui.start.addEventListener('click', () => state.mode === 'paused' ? pauseGame() : beginMissionFlow());
  ui.pause.addEventListener('click', pauseGame);
  function bindAbilityControl(button, activate) {
    if (!button) return;
    let touchActivationAt = 0;
    button.addEventListener('pointerdown', (event) => {
      if (!event.pointerType || event.pointerType === 'mouse') return;
      event.preventDefault();
      touchActivationAt = performance.now();
      activate();
    }, { passive:false });
    button.addEventListener('click', (event) => {
      if (event.detail > 0 && touchActivationAt > 0 && performance.now() - touchActivationAt < 800) return;
      activate();
    });
  }
  bindAbilityControl(ui.ability, activateAbility);
  bindAbilityControl(ui.eclipseQ, activateSecondaryAbility);
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
    if (event.code === 'Escape' && ui.prismRankNotice && !ui.prismRankNotice.hidden) { closePrismRankNotice(); return; }
    if (event.code === 'Escape' && ui.checkpointModal && !ui.checkpointModal.hidden) { closeSavedMissionPrompt(); return; }
    if (event.code === 'Escape' && ui.prismWheel && !ui.prismWheel.hidden) { closePrismWheel(); return; }
    if (event.code === 'Escape' && ui.shipDetailsDialog?.open) { ui.shipDetailsDialog.close(); return; }
    if (event.code === 'Escape' && ui.shipModal && !ui.shipModal.hidden) { closeShips(); return; }
    if (event.code === 'Escape' && ui.achievementsModal && !ui.achievementsModal.hidden) { closeAchievements(); return; }
    if (event.code === 'Escape' && ui.dailySummaryModal && !ui.dailySummaryModal.hidden) { closeDailySummary(); return; }
    if (ui.prismWheel && !ui.prismWheel.hidden && ['KeyE','KeyQ','KeyG','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code)) { event.preventDefault(); return; }
    if (event.code === 'Escape' || event.code === 'KeyP') { if (state.mode === 'playing' || state.mode === 'paused') pauseGame(); }
    if (event.code === 'Enter' && ['intro', 'gameover'].includes(state.mode) && (!ui.shipModal || ui.shipModal.hidden) && !event.target.closest('button,[role="dialog"],input,select,textarea')) beginMissionFlow();
    if (event.code === 'KeyG' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) openPrismWheel();
    if (event.code === 'KeyE' && !event.repeat) activateAbility();
    if (event.code === 'KeyQ' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) activateSecondaryAbility();
    if (state.controlMode === 'keys') state.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => { state.keys.delete(event.code); });
  window.addEventListener('blur', () => { state.keys.clear(); state.pointer.active = false; releaseAnalog(); if (state.mode === 'playing' && state.eclipsePhase !== 'cinematic') pauseGame(); });
  window.addEventListener('pagehide', () => { if (state.mode === 'playing' && state.eclipsePhase !== 'cinematic') pauseGame(); else if (state.mode === 'paused') saveMissionCheckpoint(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing' && state.eclipsePhase !== 'cinematic') {
      pauseGame();
      ui.status.textContent = 'Missão pausada ao sair da página.';
    }
    if (!document.hidden && state.eclipsePhase === 'cinematic' && ui.eclipseVideo?.paused) ui.eclipseVideo.play()?.catch?.(() => {});
  });
  function moveDamageCounterWithPointer(event) {
    if (!state.damageCounterDragging) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    state.damageCounterPosition = normalizeDamageCounterPosition({ x:(event.clientX - rect.left) / rect.width, y:(event.clientY - rect.top) / rect.height });
    draw(performance.now());
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (state.damageCounterEditing) {
      const rect = canvas.getBoundingClientRect();
      const pointX = event.clientX - rect.left; const pointY = event.clientY - rect.top;
      const counterX = state.width * state.damageCounterPosition.x; const counterY = state.height * state.damageCounterPosition.y;
      if (pointX >= counterX - 178 && pointX <= counterX + 10 && pointY >= counterY - 49 && pointY <= counterY + 34) {
        event.preventDefault(); canvas.setPointerCapture(event.pointerId);
        state.damageCounterDragging = true; canvas.style.cursor = 'grabbing'; moveDamageCounterWithPointer(event);
      }
      return;
    }
    if (state.mode !== 'playing' || !['touch', 'analog'].includes(state.controlMode)) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    if (state.controlMode === 'touch') { pointerPosition(event); state.pointer.pointerId = event.pointerId; state.pointer.active = true; return; }
    const rect = ui.stage.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    state.analog.active = true; state.analog.pointerId = event.pointerId; state.analog.originX = x; state.analog.originY = y;
    ui.joystick.style.left = x + 'px'; ui.joystick.style.top = y + 'px'; ui.joystick.hidden = false; ui.joystick.classList.add('is-active');
    moveAnalog(event);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (state.damageCounterDragging) { moveDamageCounterWithPointer(event); return; }
    if (state.pointer.active && state.controlMode === 'touch' && state.pointer.pointerId === event.pointerId) pointerPosition(event);
  });
  function moveAnalog(event) {
    if (!state.analog.active || state.analog.pointerId !== event.pointerId) return;
    const rect = ui.stage.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const max = 54;
    const dx = x - state.analog.originX; const dy = y - state.analog.originY; const length = Math.hypot(dx, dy); const scale = length > max ? max / length : 1;
    state.analog.x = dx * scale / max; state.analog.y = dy * scale / max;
    ui.joystickNub.style.left = 'calc(50% + ' + (state.analog.x * max) + 'px)'; ui.joystickNub.style.top = 'calc(50% + ' + (state.analog.y * max) + 'px)';
  }
  canvas.addEventListener('pointermove', moveAnalog);
  canvas.addEventListener('pointerup', (event) => { if (state.pointer.pointerId === event.pointerId) { state.pointer.active = false; state.pointer.pointerId = null; } if (state.damageCounterDragging) { state.damageCounterDragging = false; canvas.style.cursor = 'grab'; } if (state.analog.pointerId === event.pointerId) releaseAnalog(); });
  canvas.addEventListener('pointercancel', (event) => { if (state.pointer.pointerId === event.pointerId) { state.pointer.active = false; state.pointer.pointerId = null; } if (state.damageCounterDragging) { state.damageCounterDragging = false; canvas.style.cursor = 'grab'; } if (state.analog.pointerId === event.pointerId) releaseAnalog(); });
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);
  document.addEventListener('webkitfullscreenchange', resize);
  document.addEventListener('cv-games-fullscreenchange', resize);
  state.achievementProgress = readAchievementProgress();
  renderAchievements(); updateDailyChallengeInfo();
  window.CV_GAMES_AUTH?.client?.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') window.setTimeout(() => { loadAccountShipProgress(); loadNicknameSettings(); }, 0);
    if (event === 'SIGNED_OUT') window.setTimeout(() => { clearAccountShipProgress(); loadNicknameSettings(); }, 0);
  });
  createDeviceIndicators(); createAdminTools(); updateDeviceTypeUI(); renderSkinPicker(); renderAuthorizedPilots(); updateEquippedShip(); updateControlUI(); updatePerformanceModeUI(); updateHud(); updateFavorite(); resize(); setMode('intro'); draw(0); refreshLeaderboard(); loadAccountShipProgress(); loadNicknameSettings();
})();
