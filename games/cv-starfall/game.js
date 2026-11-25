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
  const legacySecretShipUnlockKey = 'cv-games-cv-starfall-secret-ships-v1';
  const secretShipUnlockPrefix = 'cv-games-cv-starfall-secret-ships-v2:';
  const secretShipUnlockMigrationKey = 'cv-games-cv-starfall-secret-ships-v1-migrated';
  const dailyBestPrefix = 'cv-games-cv-starfall-daily:';
  const championshipProgressPrefix = 'cv-games-cv-starfall-championship-v1:';
  const championshipStartAt = Date.parse('2026-12-01T03:00:00.000Z');
  const championshipEndAt = Date.parse('2027-01-01T03:00:00.000Z');
  const championshipRewardShipIds = Object.freeze([
    'aurora', 'training', 'aegis', 'chronos', 'tempest', 'flashblade',
    'redshift', 'eclipse', 'saurion', 'megumi', 'flamestorm'
  ]);
  const achievementStoragePrefix = 'cv-games-cv-starfall-achievements:';
  const nicknameSettingsPrefix = 'cv-games-cv-starfall-settings-v1:';
  const missionCheckpointPrefix = 'cv-games-cv-starfall-checkpoint-v1:';
  const nicknameRankBestWavePrefix = 'cv-games-cv-starfall-rank-best-wave:';
  const nicknameCompletedWavePrefix = 'cv-games-cv-starfall-completed-wave:';
  const nicknameSettingsMigrationKey = 'cv-games-cv-starfall-settings-migrated-v2';
  const defaultDamageCounterPosition = Object.freeze({ x: .89, y: .53 });
  const defaultNicknameSettings = Object.freeze({ damageCounterEnabled: true, eclipseSkipVideo: false, selectedShip: '', unlockedSecretShips: [] });
  const mahoragaFormWaveLimit = 5;
  const mahoragaFormCooldownDuration = 45;
  const favoritesKey = 'cv-games-favorites';
  const eclipseSprite = new Image();
  eclipseSprite.src = new URL('eclipse-ship.png', document.baseURI).href;
  const auroraShipSprite = new Image();
  auroraShipSprite.src = new URL('aurora-ship.png', document.baseURI).href;
  const ferrumShipSprite = new Image();
  ferrumShipSprite.src = new URL('ferrum-ship.png?v=2', document.baseURI).href;
  const ferrumArmoredSprite = new Image();
  ferrumArmoredSprite.src = new URL('ferrum-armored.png', document.baseURI).href;
  const FERRUM_PLATE_DAMAGE = 16;
  const FERRUM_MAX_PRESSURE = 4 * FERRUM_PLATE_DAMAGE;
  const FERRUM_RAM_USES = 5;
  const FERRUM_E_USES = 3;
  const FERRUM_HIT_PRESSURE = 2;
  const vultureShipSprite = new Image();
  vultureShipSprite.src = new URL('vulture-ship.png', document.baseURI).href;
  const vultureEvolutionSprite = new Image();
  vultureEvolutionSprite.src = new URL('vulture-evolution.png', document.baseURI).href;
  const vultureScrapSprites = Array.from({ length:5 }, (_, index) => {
    const image = new Image();
    image.src = new URL('vulture-scrap-' + (index + 1) + '.png', document.baseURI).href;
    return image;
  });
  const umbraShipSprite = new Image();
  umbraShipSprite.src = new URL('umbra-ship.png', document.baseURI).href;
  const mahoragaShipSprite = new Image();
  mahoragaShipSprite.src = new URL('mahoraga-ship.png', document.baseURI).href;
  const mahoragaAdaptationAudio = new Audio(new URL('mahoraga-adapting.mp3', document.baseURI).href);
  mahoragaAdaptationAudio.preload = 'auto';
  mahoragaAdaptationAudio.volume = .72;
  const mahoragaAdaptationIcon = new Image();
  mahoragaAdaptationIcon.src = new URL('mahoraga-adaptation-icon.png', document.baseURI).href;
  mahoragaAdaptationIcon.className = 'starfall-adaptation-skill-icon';
  mahoragaAdaptationIcon.alt = '';
  const flameStormNormalSprite = new Image();
  flameStormNormalSprite.src = new URL('flamestorm-ship-normal.jpeg', document.baseURI).href;
  const flameStormBlazedSprite = new Image();
  flameStormBlazedSprite.src = new URL('flamestorm-ship-blazed.jpeg', document.baseURI).href;
  const flameStormVortexSprite = new Image();
  flameStormVortexSprite.src = new URL('flamestorm-vortex-active.png', document.baseURI).href;
  const flameStormVortexIcon = '⟳';
  const flameStormBoostIcon = '➤';
  const flameStormDashFrames = [new Image(), new Image()];
  flameStormDashFrames[0].src = new URL('flamestorm-e-frame-1.png', document.baseURI).href;
  flameStormDashFrames[1].src = new URL('flamestorm-e-frame-2.png', document.baseURI).href;
  const tigrumRaptorSprite = new Image();
  tigrumRaptorSprite.src = new URL('tigrum-q-roar.png', document.baseURI).href;
  const saurionShipFrames = Array.from({ length: 6 }, (_, index) => {
    const frame = new Image();
    frame.src = new URL('saurion-frame-' + (index + 1) + '.png', document.baseURI).href;
    return frame;
  });
  const saurionBiteSprite = new Image();
  saurionBiteSprite.src = new URL('saurion-bite-frames.png', document.baseURI).href;
  const saurionDinoSprites = Object.fromEntries([
    ['spinosaurus', 'dino-spinosaurus.png'], ['triceratops', 'dino-triceratops.png'],
    ['titanosaur', 'dino-sauropod.png'], ['tyrannosaurus', 'dino-tyrannosaurus.png'],
    ['carnotaurus', 'dino-carnotaurus.png'], ['ankylosaurus', 'dino-ankylosaurus.png'],
    ['therizinosaurus', 'dino-therizinosaurus.png'], ['parasaurolophus', 'dino-parasaurolophus.png']
  ].map(([id, path]) => { const image = new Image(); image.src = new URL(path, document.baseURI).href; return [id, image]; }));
  const eclipseShrineSprite = new Image();
  eclipseShrineSprite.src = new URL('eclipse-shrine.png', document.baseURI).href;
  const eclipseDomainVideoUrl = new URL('../../CV GAMES/sprite nave sprites/video começo esnpnação de dominio.mp4', document.baseURI).href;
  const eclipseDomainMusicUrl = new URL('../../CV GAMES/sprite nave sprites/audio music apara fundo depois que video acabar.m4a', document.baseURI).href;
  const canvas = document.querySelector('[data-game-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const $ = (selector) => document.querySelector(selector);
  const ui = {
    ferrumMeter: $('[data-ferrum-meter]'), ferrumPlates: document.querySelectorAll('[data-ferrum-plate]'),
    ferrumReadout: $('[data-ferrum-readout]'), ferrumUlt: $('[data-ferrum-ult]'),
    stage: $('[data-stage]'), overlay: $('[data-main-overlay]'), title: $('[data-overlay-title]'), copy: $('[data-overlay-copy]'), start: $('[data-start]'), missionSetupModal: $('[data-mission-setup]'), exitModal: $('[data-exit-confirmation]'), stop: $('[data-stop-mission]'), audio: $('[data-game-audio]'), eclipseCutscene: $('[data-eclipse-cutscene]'), eclipseVideo: $('[data-eclipse-video]'), megumiCutscene: $('[data-megumi-cutscene]'),
    wave: $('[data-wave]'), score: $('[data-score]'), lives: $('[data-lives]'), shields: $('[data-shields]'), healthFill: $('[data-health-fill]'), best: $('[data-best]'), overlayBest: $('[data-overlay-best]'),
    zone: $('[data-zone]'), timer: $('[data-timer]'), upgrade: $('[data-upgrade]'), upgradeOptions: $('[data-upgrade-options]'), pause: $('[data-pause]'), pauseIcon: $('[data-pause-icon]'), pauseLabel: $('[data-pause-label]'), abilityWrap: $('.starfall-primary-ability-wrap'), ability: $('[data-ability]'), abilityCooldown: $('[data-ability-cooldown]'), eclipseQWrap: $('[data-eclipse-q-wrap]'), eclipseQ: $('[data-eclipse-q]'), eclipseQCooldown: $('[data-eclipse-q-cooldown]'), vultureUlt: $('[data-vulture-ult]'), auroraUlt: $('[data-aurora-ult]'), auroraUltMeter: $('[data-aurora-ult-meter]'), auroraUltCount: $('[data-aurora-ult-count]'), auroraUltSegments: Array.from(document.querySelectorAll('[data-aurora-ult-segment]')), panel: $('[data-fullscreen-root]'), hud: $('.starfall-hud'), status: $('[data-status]'), toast: $('[data-toast]'), favorite: $('[data-game-favorite]'),
    skinPicker: $('[data-skin-picker]'), equippedShip: $('[data-equipped-ship]'), secretUnlockDialog: $('[data-secret-unlock-dialog]'), secretUnlockForm: $('[data-secret-unlock-form]'), secretUnlockInput: $('[data-secret-unlock-input]'), secretUnlockError: $('[data-secret-unlock-error]'), eclipseSkipOptions: Array.from(document.querySelectorAll('[data-eclipse-skip-option]')), eclipseSkipCheckboxes: Array.from(document.querySelectorAll('[data-eclipse-skip-video]')),
    shipModal: $('[data-ship-modal]'), shipDetailsDialog: $('[data-ship-details-dialog]'), shipDetailsKicker: $('[data-ship-details-kicker]'), shipDetailsTitle: $('[data-ship-details-title]'), shipDetailsSummary: $('[data-ship-details-summary]'), shipDetailsList: $('[data-ship-details-list]'), shipDetailsCooldowns: $('[data-ship-details-cooldowns]'), saurionDinosOpen: $('[data-saurion-dinos-open]'), saurionDinoCatalog: $('[data-saurion-dino-catalog]'), saurionDinoList: $('[data-saurion-dino-list]'), saurionDinoInfo: $('[data-saurion-dino-info]'), saurionDinoName: $('[data-saurion-dino-name]'), saurionDinoRole: $('[data-saurion-dino-role]'), saurionDinoDescription: $('[data-saurion-dino-description]'), settingsModal: $('[data-settings-modal]'),
    damageCounterOptions: $('[data-damage-counter-option]'), damageCounterCheckbox: $('[data-damage-counter]'), editDamageCounter: $('[data-edit-damage-counter]'), damageCounterEditor: $('[data-damage-counter-editor]'), saveDamageCounter: $('[data-save-damage-counter]'), cancelDamageCounter: $('[data-cancel-damage-counter]'), fireToggle: $('[data-fire-toggle]'), saurionCommand: $('[data-saurion-command]'), saurionSummonPicker: $('[data-saurion-summon-picker]'), saurionSummonPickerSkill: $('[data-saurion-picker-skill]'), settingsSyncStatus: $('[data-settings-sync-status]'), performanceModeButtons: Array.from(document.querySelectorAll('[data-performance-mode]')), mahoragaAwakening: $('[data-mahoraga-awakening]'), mahoragaAwakeningType: $('[data-mahoraga-awakening-type]'), mahoragaAwakeningBuff: $('[data-mahoraga-awakening-buff]'), mahoragaReadout: $('[data-mahoraga-readout]'), megumiFormTimer: $('[data-megumi-form-timer]'), mahoragaReturn: $('[data-mahoraga-return]'),
    deviceTypeIndicators: [], adminTools: null, adminClearWave: null, adminToggleBuffs: null, adminToggleCooldown: null, achievementsModal: $('[data-achievements-modal]'), achievementsList: $('[data-achievements-list]'), achievementsCount: $('[data-achievement-count]'), dailyStart: $('[data-start-daily]'), dailyRecord: $('[data-daily-record]'),
    dailySummaryModal: $('[data-daily-summary-modal]'), dailySummaryStart: $('[data-start-daily-again]'), dailySummaryDate: $('[data-daily-summary-date]'), dailySummaryResult: $('[data-daily-summary-result]'), dailySummaryRecord: $('[data-daily-summary-record]'), dailySummaryDetails: $('[data-daily-summary-details]'), runSummary: $('[data-run-summary]'), joystick: $('[data-joystick]'), joystickNub: $('[data-joystick-nub]'), controlHint: $('[data-control-hint]'),
    rankList: $('[data-rank-list]'), rankStatus: $('[data-rank-status]'), rankAdminPanel: $('[data-rank-admin]'), rankAdminReset: $('[data-rank-reset]'), rankAdminStatus: $('[data-rank-admin-status]'), rankDialog: $('[data-rank-dialog]'), rankDialogTitle: $('[data-rank-dialog-title]'), rankDialogKicker: $('[data-rank-dialog-kicker]'), rankDialogSummary: $('[data-rank-dialog-summary]'), rankDetailOverview: $('[data-rank-detail-overview]'), rankDetailSections: $('[data-rank-detail-sections]'), authorizedPilots: $('[data-authorized-pilots]'), authorizedPilotList: $('[data-authorized-pilot-list]'), copyAuthorizedPilots: $('[data-copy-authorized-pilots]'), authorizedPilotsStatus: $('[data-authorized-pilots-status]'), vultureScrapHud: $('[data-vulture-scrap-hud]'), vultureScrapCount: $('[data-vulture-scrap-count]'), vultureScrapFill: $('[data-vulture-scrap-fill]'), vultureScrapLabel: $('[data-vulture-scrap-label]'), vultureChargeMeter: $('[data-vulture-charge-meter]'), vultureChargeLabel: $('[data-vulture-charge-label]')
  };
  let rankAdminSessionActive = false;
  let rankAdminBusy = false;
  let pendingSaurionSummonKey = '';
  ui.prismWheel = $('[data-prism-wheel]');
  ui.prismRankNotice = $('[data-prism-rank-notice]');
  ui.checkpointModal = $('[data-checkpoint-modal]');
  ui.checkpointSummary = $('[data-checkpoint-summary]');
  ui.pilotNicknameModal = $('[data-pilot-nickname-modal]');
  ui.pilotNicknameForm = $('[data-pilot-nickname-form]');
  ui.pilotNicknameInput = $('[data-pilot-nickname-input]');
  ui.pilotNicknameFeedback = $('[data-pilot-nickname-feedback]');
  ui.pilotNicknameConfirm = $('[data-confirm-pilot-nickname]');
  ui.prismAbilityList = $('[data-prism-ability-list]');
  ui.prismWheelStatus = $('[data-prism-wheel-status]');
  ui.prismSelectWrap = $('[data-prism-select-wrap]');
  ui.prismSelect = $('[data-prism-select]');
  const championshipUi = {
    modal: $('[data-championship-modal]'), open: $('[data-start-daily]'), close: $('[data-close-championship]'),
    status: $('[data-championship-status]'), countdown: $('[data-championship-countdown]'), missions: $('[data-championship-missions]'),
    coins: $('[data-championship-coins]'), resetCountdown: $('[data-daily-reset-countdown]'), progressCount: $('[data-championship-progress-count]'), progressBar: $('[data-championship-progress-bar]'),
    bonus: $('[data-championship-bonus]'), start: $('[data-start-championship-run]'), spin: $('[data-spin-championship]'), spinBundle: $('[data-spin-championship-bundle]'),
    wheel: $('[data-championship-wheel]'), prizeArt: $('[data-championship-prize-art]'), prizeName: $('[data-championship-prize-name]'), prizeDetail: $('[data-championship-prize-detail]'), prizeRarity: $('[data-championship-prize-rarity]'), result: $('[data-championship-result]'),
    rank: $('[data-championship-rank]'), sync: $('[data-championship-sync]'), classicDaily: $('[data-start-classic-daily]')
  };
  const skins = [
    { id: 'aurora', name: 'Aurora', color: '#7df7e8', accent: '#bffff5', ability: 'Explosão Nova', abilityShort: 'NOVA', cooldown: 22, cooldownQ: 24, shape: 'classic', description: 'E libera uma Explosão Nova mais ampla e poderosa. Q conecta até dez alvos por até nove segundos. Acertos efetivos de Q e E carregam seis segmentos; com a barra cheia, G ativa a Coroa da Hipernova por 8 segundos, ligando todos os inimigos à constelação.' },
    { id: 'training', name: 'Ferrum', color: '#aeb5c0', accent: '#282d36', ability: '', abilityShort: '', cooldown: 0, cooldownQ: 0, shape: 'training', noAbilities: true, description: 'Quatro placas ativam a forma do Aríete: cinco investidas Q e três Contrachoques E, sem recarga por tempo. Move-se 10% mais devagar e recebe metade do dano.' },
    { id: 'aegis', name: 'Aegis', color: '#72bdff', accent: '#c9eaff', ability: 'Barreira Aegis', abilityShort: 'BARREIRA', cooldown: 30, cooldownQ: 36, shape: 'shield', unlockWave: 10, description: 'E concede uma carga temporária de escudo por 9 segundos. Q invoca até quatro Órbitas Sentinelas: cada fragmento intercepta um tiro e o converte em projétil teleguiado; os fragmentos intactos são lançados contra inimigos ao final.' },
    { id: 'chronos', name: 'Chronos', color: '#c897ff', accent: '#efd5ff', ability: 'Dobra Temporal', abilityShort: 'TEMPO', cooldown: 22, cooldownQ: 24, shape: 'ring', unlockWave: 20, description: 'E desacelera fortemente inimigos e projéteis por mais tempo. Q cria Ecos do Futuro que repetem os disparos após curto atraso, com dano aumentado.' },
    { id: 'tempest', name: 'Tempestade', color: '#87aaff', accent: '#d5dcff', ability: 'Poço Negro', abilityShort: 'POÇO NEGRO', cooldown: 30, cooldownQ: 24, shape: 'wing', unlockWave: 30, description: 'E dispara um Poço Negro maior e duradouro que puxa inimigos e causa dano repetido. Q libera a Maré Reversa, que causa dano, empurra inimigos e desvia tiros próximos; começa com quatro cargas, ampliáveis até seis. As cargas só recarregam juntas depois que todas forem usadas.' },
    { id: 'flashblade', name: 'Flashblade', color: '#ffc86e', accent: '#fff0b4', ability: 'Corte Flash', abilityShort: 'CORTE', cooldown: 22, cooldownQ: 24, shape: 'blade', unlockWave: 40, description: 'E lança uma lâmina veloz que persegue alvos, ricocheteia e causa dano aumentado. Q acelera a nave em 2,6× e deixa rastros cortantes por até nove segundos.' },
    { id: 'redshift', name: 'Bastião Rubro', color: '#d83a2e', accent: '#ffd06a', ability: 'Escudo de Retorno', abilityShort: 'RETORNO', cooldown: 30, cooldownQ: 28, shape: 'reflector', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'cypher'], description: 'E reflete projéteis. Q cria um Perímetro de Cerco móvel por 6 segundos; inimigos que cruzam os feixes recebem dano.' },
    { id: 'eclipse', name: 'Eclipse', color: '#a879ff', accent: '#e8dcff', ability: 'Expansão de Domínio', abilityShort: 'DOMÍNIO', cooldown: 30, shape: 'eclipse', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'nys'], description: 'E: abre o Santuário Malevolente com cortes por 10 segundos. Q: Paradoxo Absoluto distorce o espaço, desacelera e interrompe inimigos próximos; ao colapsar, sentencia os alvos conforme o tempo que ficaram presos.' },
    { id: 'saurion', name: 'Tigrum', color: '#f28a28', accent: '#ffd18a', ability: 'Rugido de Garras', abilityShort: 'RUGIDO', cooldown: 28, cooldownQ: 32, shape: 'dino', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'adm', 'yago k'], description: 'E: duas cargas de Rugido atordoam uma grande área e soltam garras fortalecidas com mais frequência. Q dispara três investidas de energia com forma de tigre; melhorias acrescentam investidas e reduzem a recarga de 32s até 24s.' },
    { id: 'saurion-primal', name: 'Saurion', color: '#55df35', accent: '#c6ff6b', ability: 'Chamado Primal', abilityShort: 'CHAMADO', cooldown: 40, cooldownQ: 40, shape: 'saurion-primal', secret: true, profileRestricted: true, allowedProfiles: ['educvv dev1', 'educvv dev', 'yago k'], description: 'Nave especial verde. E e Q invocam dinossauros diferentes do arsenal; cada habilidade tem sua própria recarga de 40 segundos e as duas criaturas podem ficar em campo ao mesmo tempo.' },
    { id: 'prisma', name: 'Prisma Real', color: '#59e9f2', accent: '#ffe29a', ability: 'Núcleo Prisma', abilityShort: 'PRISMA', cooldown: 28, cooldownQ: 28, shape: 'prism', secret: true, ownerOnly: true, description: 'Nave secreta da conta educvv. Configure uma habilidade para E e outra para Q no Arquivo de Ecos, aberto pela tecla G. Esta nave não envia resultados ao placar.' },
    { id: 'mahoraga', name: 'Mahoraga', color: '#c9d0cf', accent: '#e4c477', ability: 'Adaptação Divina', abilityShort: 'ADAPTAÇÃO', cooldown: 14, cooldownQ: 12, shape: 'mahoraga', hiddenFromHangar: true, description: 'Forma interna da Umbra. E cria um escudo por 3 segundos que reduz até 70% do dano. Cinco impactos do mesmo tipo concedem resistência a essa categoria por cinco ondas; cada tipo se adapta separadamente até 55%. Repetir um tipo já adaptado fortalece temporariamente o dano.' },
    { id: 'megumi', name: 'Umbra', color: '#373448', accent: '#a99acb', ability: 'Ritual Umbral', abilityShort: 'UMBRAL', cooldown: 20, cooldownQ: 45, shape: 'megumi', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'felype j'], description: 'Nave secreta. E sorteia uma técnica sombria: Fuga dos Coelhos, Ocultação nas Sombras ou explosão elétrica de Nue. O ícone mostra a variação; a recarga do E cai de 20 para 15 segundos com cinco melhorias. Q invoca o Guardião com a cutscene; a forma Mahoraga dura cinco ondas completas e, ao terminar, entra em recarga de 45 segundos.' },
    { id: 'flamestorm', name: 'Flame Storm', color: '#ff302e', accent: '#ffd0cb', ability: 'Propulsão Infernal', abilityShort: 'PROPULSÃO', cooldown: 18, cooldownQ: 24, shape: 'flamestorm', secret: true, profileRestricted: true, allowedProfiles: ['storm', 'educvv dev', 'educvv dev1'], description: 'Nave especial. E: avança por 5 segundos com impulso flamejante e fica intangível, rebate nas paredes e aceita correções de direção; os dois quadros de fogo ocupam o lugar da nave e o rastro fere inimigos. A recarga do E cai de 18 para 15 segundos com três Condensadores. Q: cria um vórtice carmesim por 5 segundos, puxa inimigos e absorve tiros próximos após atraí-los; a nave fica invulnerável durante o vórtice e por 0,7s após ele terminar.' },
    { id: 'vulture', name: 'Vulture', color: '#ff7133', accent: '#ffbd67', ability: 'Dobra Espacial', abilityShort: 'DOBRA', cooldown: 24, cooldownQ: 24, shape: 'vulture', secret: true, description: 'Os tiros automáticos mantêm o ritmo normal enquanto a energia carrega. Ao usar Q, o míssil soma a carga acumulada e recebe dano adicional proporcional às sucatas; com 8 sucatas, Q consome as 8 e lança um míssil mais forte. Segure Q para absorver 3 sucatas e recuperar 1 escudo. E mantém três dobras. G gasta 8 sucatas: a forma ascendente dura 10s com Q carregado e E ampliado; depois, o campo final segura os inimigos por 6s antes da explosão.' }
  ];
  const secondaryAbilityNames = Object.freeze({ training:'Investida Ferrum', aurora:'Elo Estelar', aegis:'Órbitas Sentinelas', chronos:'Ecos do Futuro', tempest:'Maré Reversa', flashblade:'Rastro de Ruptura', redshift:'Perímetro de Cerco', eclipse:'Paradoxo Absoluto', saurion:'Investida do Tigre', 'saurion-primal':'Arsenal Jurássico', prisma:'Dobra de Horizonte', mahoraga:'Espada da Exterminação', megumi:'Ritual do Guardião', flamestorm:'Vórtice Carmesim', vulture:'Míssil gravitacional / Absorção' });
  const megumiTechniques = Object.freeze({
    rabbits:{ id:'rabbits', name:'Fuga dos Coelhos', short:'COELHOS', icon:'🐇', description:'Cinco shikigami-armadilha se espalham, atiram e atraem inimigos.' },
    shadow:{ id:'shadow', name:'Ocultação nas Sombras', short:'SOMBRA', icon:'◑', description:'Fica invisível, dispara projéteis sombrios, atravessa as bordas e recolhe recursos.' },
    nue:{ id:'nue', name:'Nue · Explosão Elétrica', short:'NUE', icon:'⚡', description:'Invoca uma descarga elétrica que explode em área e atinge inimigos próximos.' }
  });
  let megumiCutsceneTimer = 0;
  const shipAbilityDetails = Object.freeze({
    aurora: { e:'Explosão Nova · causa dano em uma área ao redor da nave. Um acerto efetivo carrega um segmento do G; durante a Coroa da Hipernova, E converge as estrelas restantes na área atingida para a finalização. Com carga parcial do G, toque E duas vezes rapidamente: a segunda ativação consome as cargas, empurra os inimigos e redireciona tiros próximos em direções aleatórias; essa variação não causa dano direto. Recarga: 22s.', q:'Elo Estelar · conecta até dez alvos por 7s e pulsa a cada 0,78s. Contra um chefe sozinho, concentra os pulsos nele. Cada vida perdida pela Aurora durante o Elo causa 2 de dano a cada alvo conectado. Melhorias prolongam a duração até 9s, elevam o dano dos pulsos até 3 e reduzem a recarga de 24s para 18s. Acertos efetivos carregam o G; durante a ult, o Elo guia os disparos das estrelas pelos alvos conectados.' },
    aegis: { e:'A Barreira Aegis concede uma carga temporária de escudo por 9 segundos. A recarga vai de 30s a 27s com melhorias.', q:'Três sentinelas orbitam por 5 segundos. Cada uma intercepta um tiro comum e o converte em um disparo teleguiado; as restantes atacam ao final. O Q não concede invulnerabilidade contínua. Melhorias chegam a 6s, quatro sentinelas e dano 5; a recarga cai de 36s para 33s.' },
    chronos: { e:'A Dobra Temporal desacelera fortemente inimigos e projéteis em toda a arena por 7,2 segundos, criando espaço para atacar e esquivar.', q:'Ecos repetem os disparos da nave após 0,30s. Melhorias aumentam a duração de 6s para 8s e o dano dos ecos de 70% para 85%; a recarga cai de 24s para 18s.' },
    tempest: { e:'O Poço Negro é disparado na direção da nave e curva suavemente conforme ela se move. A singularidade puxa inimigos por 7 segundos e causa dano periódico reduzido; melhorias prolongam a duração até 10s.', q:'A Maré Reversa afasta inimigos, causa mais dano, desvia tiros comuns em 40% das vezes e redireciona alguns contra os adversários. Também protege a nave por um instante. Começa com quatro cargas, pode chegar a seis; ao gastar todas, recupera o conjunto após 24s, ou 18s com melhorias.' },
    flashblade: { e:'O Corte Flash persegue alvos e ricocheteia. Dano e tempo ativo foram ajustados para limitar acertos repetidos; recarga de 22 segundos.', q:'A nave acelera em 2,6× por 6 segundos e deixa barreiras de luz no trajeto. Cada rastro dura até 9s, fere e desvia inimigos e destrói tiros que o atingem; melhorias reforçam o dano.' },
    redshift: { e:'O Escudo de Retorno reflete projéteis que atingem a nave durante a proteção. Melhorias aumentam duração e dano e reduzem a recarga.', q:'O Perímetro de Cerco acompanha a nave com feixes cortantes. Inimigos que cruzam as linhas recebem dano. Melhorias ampliam a duração de 6s para 8s e podem reduzir a recarga de 28s para 22s.' },
    eclipse: { e:'A Expansão de Domínio inicia com uma abertura cinematográfica e transforma a arena em um santuário. Os cortes cobrem a área por 10 segundos; a nave fica invulnerável durante o efeito e por alguns segundos ao final. Se for ativado durante o Paradoxo, os cortes são reforçados por 3 segundos nos inimigos atingidos pelo Q: +15% contra inimigos comuns e +8% contra chefes. O Q continua ativo normalmente.', q:'Paradoxo Absoluto abre uma distorção espacial que cobre a arena inteira. Inimigos em toda a tela ficam cada vez mais lentos e sofrem pulsos que interrompem movimento e ataques por breves instantes. Quando o campo colapsa, todos os alvos marcados recebem uma Sentença: o dano aumenta conforme o tempo que cada um permaneceu na distorção. Se usar E antes do fim, o Santuário fortalece os cortes por 3 segundos nos alvos atingidos pelo Q sem encerrar o campo; ele continua e aplica a Sentença no fim normal. Melhorias ampliam ainda mais o alcance e a duração, reforçam a supressão e o golpe final, ou reduzem a recarga.' },
    saurion: { e:'O Rugido de Garras tem duas cargas. Atinge uma área maior, atordoa por mais tempo e marca os inimigos; garras mais fortes atingem com maior frequência.', q:'Dispara três investidas de energia com forma de tigre. Elas perseguem inimigos, priorizam alvos marcados e causam dano extra. Melhorias acrescentam duas investidas e reduzem o intervalo de cada carga de 32s até 24s.' },
    prisma: { e:'O Núcleo Prisma concentra luz diante da nave e libera uma onda de impacto. Inimigos próximos recebem dano e são afastados; chefes resistem parcialmente ao empurrão. Melhorias ampliam o raio, o dano e reduzem a recarga. Você também pode escolher outra habilidade no Arquivo de Ecos.', q:'A Dobra de Horizonte grava a posição da nave por 4 segundos. Ative novamente para retornar ao ponto marcado, ganhar proteção breve e liberar uma onda de chegada que causa dano e desorganiza inimigos próximos. Melhorias ampliam a janela até 6 segundos e fortalecem a onda. O espaço Q também pode receber outra habilidade escolhida.' },
    mahoraga: { e:'Adaptação Divina · escudo de 3s que reduz até 70% do dano recebido. Cada impacto preenche um dos 8 segmentos da roda. Cinco golpes iguais adaptam a nave contra aquele tipo por cinco ondas; cada categoria se adapta separadamente e evolui até 55%. Repetir uma adaptação concede dano extra temporário. Recarga de 14s.', q:'Espada da Exterminação · envia um talho curvo que atravessa a arena em uma faixa, destrói os tiros que cruza e atinge até oito inimigos. Causa 20 de dano no primeiro alvo e 10 nos seguintes, com dano reduzido contra chefes; as marcas ampliam em 10% o próximo golpe. Recarga de 12s.' },
    megumi: { e:'A cada uso, a nave sorteia uma técnica: Fuga dos Coelhos cria cinco iscas armadas que atraem inimigos; Ocultação nas Sombras deixa você invisível, permite atravessar as bordas, mantém seus tiros sombrios e deixa você recolher recursos; Nue libera uma explosão elétrica em área. O ícone mostra a próxima técnica. Recarga de 20 segundos, reduzida até 15 segundos com cinco melhorias.', q:'Invoca o Guardião com uma cutscene sombria. Depois do ritual, a forma Mahoraga dura cinco ondas completas e concede uma vida extra. Ao retornar à Umbra, inicia uma recarga de 45 segundos antes de poder invocar novamente.' },
    flamestorm: { e:'Propulsão Infernal · avanço flamejante e intangível por 5 segundos, com ricochetes e controle de direção. O tempo de intangibilidade permanece inalterado. Recarga de 18s, reduzida até 15s.', q:'Vórtice Carmesim · dura 5 segundos, puxa inimigos e absorve tiros próximos após 0,52s. A nave mantém os 5,7 segundos de invulnerabilidade já existentes. O Núcleo Carmesim amplia levemente raio e dano. Recarga de 24s, reduzida até 18s.' },
    'saurion-primal': { e:'Chamado Primal · escolha um dinossauro entre oito aliados. O E tem recarga própria de 40 segundos e pode coexistir com uma criatura diferente invocada pelo Q.', q:'Arsenal Jurássico · escolha outro dinossauro do arsenal, com ataques e funções próprios. O Q tem recarga própria de 40 segundos; a mesma espécie não pode ocupar Q e E ao mesmo tempo.' },
    vulture: { e:'Dobra Espacial · tem 3 cargas; cada uso teleporta na direção do movimento, deixa a nave camuflada por 2s e faz inimigos perderem o alvo e pararem de atirar. As cargas voltam juntas em 22–24s. Na forma ascendente, o alcance aumenta 1,8× e atravessar inimigos causa 24 de dano (15 em chefes), com atordoamento breve.', q:'Míssil Gravitacional · os tiros automáticos continuam normais. A energia do canhão se carrega até 100% em 3s e se soma ao dano do Q. Toque Q uma vez para disparar com a energia guardada; toque duas vezes em até 0,75s para somar a energia do primeiro disparo e consumir toda a sucata disponível, ganhando 2,5 de dano por peça (até +20). Com 8 sucatas e a contagem ativa, um toque lança o míssil carregado e consome as 8. Segure Q por meio segundo para absorver 3 sucatas e recuperar 1 escudo, se houver espaço; recarga da absorção: 3,2s.' }
  });
  const saurionCreatures = Object.freeze([
    { id:'spinosaurus', name:'Espinossauro', role:'controle e caça', radius:30, visualScale:5, duration:22, attack:2, kind:'spino' },
    { id:'triceratops', name:'Tricerátops', role:'aríete e provocação', radius:33, visualScale:5, duration:22, attack:2, kind:'trike' },
    { id:'titanosaur', name:'Titanossauro', role:'suporte e ondas sísmicas', radius:39, visualScale:5.55, duration:22, attack:6, kind:'titan' },
    { id:'tyrannosaurus', name:'Tiranossauro Rex', role:'dano focado e fúria', radius:34, visualScale:5.25, duration:22, attack:1.5, kind:'rex' },
    { id:'carnotaurus', name:'Carnotauro', role:'perseguição e investida', radius:29, visualScale:4.55, duration:22, attack:.5, kind:'carno' },
    { id:'ankylosaurus', name:'Anquilossauro', role:'defesa e impacto', radius:33, visualScale:4.95, duration:22, attack:2.8, kind:'ankyl' },
    { id:'therizinosaurus', name:'Terizinossauro', role:'garras em área', radius:30, visualScale:4.8, duration:22, attack:2.2, kind:'theri' },
    { id:'parasaurolophus', name:'Parassaurolofo', role:'apoio e pressão sonora', radius:29, visualScale:4.65, duration:22, attack:1.1, kind:'parasaur' }
  ]);
  const saurionDinoGuides = Object.freeze({
    spino: { role:'Controle frontal · acompanha a nave', description:'Ao ser invocado, solta uma onda que empurra e atordoa os inimigos próximos; perseguidores também recuam por alguns instantes. Depois, usa garras em um arco à sua frente para atingir vários alvos e uma mordida mais forte em um inimigo dentro do triângulo frontal.' },
    trike: { role:'Aríete · provoca e abre caminho', description:'A chegada provoca os inimigos por 25 segundos. O Tricerátops não segue a nave: mira no inimigo mais próximo do jogador, avança em linha reta e causa dano de atropelamento. Quando termina a arrancada, fica parado e usa os chifres para se defender até preparar outro avanço.' },
    titan: { role:'Suporte pesado · segue lentamente', description:'A invocação cria uma onda sísmica que empurra, atordoa e fere os inimigos. O Titanossauro caminha bem devagar atrás da nave, causa dano ao passar por cima, bate a cauda em uma área à sua frente e pisa no chão para criar outra onda de choque ao redor.' },
    rex: { role:'Predador · persegue o alvo mais resistente', description:'O rugido inicial assusta os inimigos e reduz sua cadência de ataque por 25 segundos. O Rex persegue o inimigo com mais vida e o morde individualmente. Enquanto ele estiver em campo, pressione Z uma vez para aumentar o dano e a cadência da nave em 25% por 15 segundos.' },
    carno: { role:'Perseguidor veloz · caça o mais rápido', description:'Na chegada, desacelera os inimigos próximos e aumenta a cadência de tiro da nave por 15 segundos. Depois, persegue o inimigo mais veloz, morde um alvo por vez e pode usar X para fazer uma investida curta que atropela os inimigos no caminho.' },
    ankyl: { role:'Protetor · acompanha logo atrás', description:'O Anquilossauro fica voltado para a nave e concede um escudo ao ser invocado, se houver espaço. Seu corpo causa dano por contato e ele pode interceptar projéteis próximos sacrificando a própria vida. A cauda bate no chão e cria uma onda de choque em área.' },
    theri: { role:'Caçador livre · garras em área', description:'O Terizinossauro se solta e persegue os inimigos próximos. Quando alcança o alcance de ataque, golpeia com as garras e causa dano a todos os inimigos ao redor, em vez de focar apenas um alvo.' },
    parasaur: { role:'Apoio · combate próximo', description:'O Parassaurolofo acompanha a nave e ataca individualmente os inimigos que chegam perto. Nesta versão ele não tem uma habilidade sonora especial separada; sua função atual é apoiar com ataques próximos.' }
  });
  const shipCodeById = Object.freeze({ aurora:1, aegis:2, chronos:3, tempest:4, flashblade:5, redshift:6, eclipse:7, saurion:8, prisma:9, training:10, mahoraga:11, megumi:12, flamestorm:13, 'saurion-primal':14, vulture:15 });
  const shipIdByCode = Object.freeze(Object.fromEntries(Object.entries(shipCodeById).map(([id, code]) => [code, id])));
  let secretShipUnlocks = readSecretShipUnlocks();
  let pendingSecretShipId = null;
  let prismaAccountAuthorized = false;
  let accountUnlockedShipIds = new Set();
  let accountShipProgressLoaded = false;
  let accountShipWriteChain = Promise.resolve();
  let settingsSyncChain = Promise.resolve();
  let nicknameSettingsLoadPromise = Promise.resolve();
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
    aurora: { name: 'Aurora', color: '#7df7e8', attackCooldown: 1.02 },
    meteor: { name: 'Colosso de Cinzas', color: '#ff925f', attackCooldown:1.1 },
    drone: { name: 'Mãe de Enxame', color: '#ff5fa4', attackCooldown:.76 },
    brute: { name: 'Titã Âmbar', color: '#ffcf69', attackCooldown:1.1 },
    hunter: { name: 'Espectro Roxo', color: '#b68aff', attackCooldown:.92 },
    prism: { name: 'Prisma Rebote', color: '#71eaff', attackCooldown:.86 },
    storm: { name: 'Arconte de Íons', color: '#67e8ff', attackCooldown:1.02 },
    mine: { name: 'Semeador de Minas', color: '#ffad68', attackCooldown:1.42 },
    lancer: { name: 'Lança Solar', color: '#ffe27a', attackCooldown:.94 },
    mirror: { name: 'Espelho Fraturado', color: '#d0a0ff', attackCooldown:1.12 },
    rift: { name: 'Rasgo Dimensional', color: '#ff79cf', attackCooldown:1.02 }
  };
  const auroraBossDefaults = Object.freeze({ eCooldown:22, eRadius:360, qCooldown:24, qDuration:7, qTargets:8, qPulseInterval:.78, qPulseDamage:1.8, eOpeningDelay:2.8, qOpeningDelay:4.8 });
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
  const MAX_TOTAL_SHIELDS = 7;
  const MAX_REGULAR_SHIELDS = 4;
  const VULTURE_CANNON_CHARGE_SECONDS = 3;
  const VULTURE_Q_DOUBLE_TAP_MS = 750;
  const VULTURE_ULT_POWER_SECONDS = 10;
  const VULTURE_ULT_COLLAPSE_SECONDS = 6;
  const AURORA_E_DOUBLE_TAP_MS = 560;
  const state = {
    ferrumPressure: 0, ferrumRam: null, ferrumRamCharges: 0, ferrumECharges: 0, ferrumCountershock: null,
    auroraLink: null, auroraLinkCooldown: 0, auroraLinkDurationBonus: 0, auroraLinkTargetBonus: 0, auroraLinkDamageBonus: 0, auroraUltCharge: 0, auroraUlt: null, auroraEFirstTapAt: 0, auroraEFirstTapCharge: 0,
    damageCounterEnabled: initialNicknameSettings.damageCounterEnabled, damageCounterPosition: initialNicknameSettings.damageCounterPosition, damageCounterTotal: 0, damageCounterLastHit: 0, damageCounterIdle: 0, damageCounterPopups: [], damageCounterEditing: false, damageCounterDragging: false, damageCounterEditStart: null, damageCounterEditorHadMenu: false, trainingDamageRemainder: 0,
    eclipseSkipVideoEnabled: initialNicknameSettings.eclipseSkipVideo,
    shipEWasCooling: false, shipQWasCooling: false, shipQChargeCount: null,
    mahoragaParryWindow: 0, mahoragaParryCooldown: 0, mahoragaShieldHitCooldown: 0, mahoragaResistanceType: '', mahoragaResistanceUntilWave: 0, mahoragaResistancePower: 0, mahoragaCycleStartWave: 1, mahoragaWheelSegments: 0, mahoragaWheelReady: false, mahoragaAdaptationVisualTime: 0, mahoragaSlashCooldown: 0, mahoragaSlashCooldownBonus: 0, mahoragaProgress: {}, mahoragaAdaptationLevels: {}, mahoragaAdaptationWaves: {}, mahoragaDamageRemainders: {}, mahoragaLastType: '', mahoragaDuplicateBuffTime: 0, mahoragaDuplicateBuffBonus: 0, mahoragaReviveUsed: false,
    megumiTechnique:'rabbits', megumiSummonCooldown:0, megumiTransformed:false, megumiFormWavesRemaining:0, megumiSummonPhase:'idle', megumiTransformSource:'', megumiCloakTime:0, megumiCloakLastX:0, megumiCloakLastY:0, megumiRabbits:[],
    prismAbilityChoices: { e:'aurora:e', q:'aurora:q' }, prismAbilitySlot:'e', prismDispatchSkinId:'', prismDispatchSlot:'', prismQCooldown:0, prismHorizonAnchor:null, prismHorizonWindowBonus:0, prismHorizonDamageBonus:0, prismCoreRangeBonus:0, prismCoreDamageBonus:0, prismCooldownBonus:0, prismWheelWasPlaying:false,
    aegisOrbit: null, aegisOrbitCooldown: 0, aegisOrbitDurationBonus: 0, aegisOrbitCountBonus: 0, aegisOrbitDamageBonus: 0, aegisBarrierCharges: 0, aegisBarrierTime: 0,
    tempestTideCharges: 4, tempestTideChargeBonus: 0, tempestTideDamageBonus: 0, tempestTideSweepBonus: 0,
    saurionSummonCooldownE: 0, saurionSummonCooldownQ: 0, saurionSummons: [], saurionPlayerBuffTime: 0, saurionPlayerDamageBuff: 0, saurionPlayerFireRateBuff: 0,
    flameStormQCooldown: 0, flameStormQIntangible: 0, flameStormDash: null,
    vultureQCooldown: 0, vultureCannonCharge: 0, vultureQLastTapAt:0, vultureQStoredEnergyCharge:0, vultureCloakTime: 0, vultureEvolutionTime: 0, vultureUltPowerTime:0, vultureUltPhase:'idle', vultureUltPulseCooldown:0, vultureAbsorbCooldown:0, vultureFoldCharges:3, vultureFoldRecharge:0, vultureQPressStartedAt:0, vultureQPressSource:'', vultureQPressPointerId:null, vultureQPressHoldTriggered:false, vultureFoldRangeBonus: 0, vulturePulseRadiusBonus: 0, vulturePulseDamageBonus: 0, vultureScrap:0, vultureOverloadCountdown:0, vultureOverloadTime:0, vultureVulnerableTime:0, vultureVulnerableHitCooldown:0,
    chronosEcho: null, chronosEchoQueue: [], chronosEchoCooldown: 0, chronosEchoDurationBonus: 0, chronosEchoDamageBonus: 0,
    mode: 'intro', lastTime: 0, raf: 0, width: 800, height: 560, dpr: 1,
    score: 0, best: readBest(), bestCompletedWave: readBestWave(), wave: 1, lives: 3, maxLives: 6, shields: 0, tempShields: 0, invulnerable: 0, elapsed: 0, missionStartedAt: 0, waveStartedAt: 0, waveEndedAt: 0,
    shotCooldown: 0, waveGrace: 0, enemySpawn: 0, powerSpawn: 0, waveKills: 0,
    enemiesRequired: 6, bossWave: false, bossSpawned: false, miniBossTimer: 0, miniBossSpawned: false,
    keys: new Set(), bullets: [], enemyBullets: [], enemies: [], particles: [], pickups: [], stars: [], effects: [],
    selectedSkin: readSkin(initialNicknameSettings.selectedShip), controlMode: adaptControlMode(initialNicknameSettings.controlMode), savedControlMode: initialNicknameSettings.controlMode, performanceMode: initialNicknameSettings.performanceMode, preferencesConfigured: initialNicknameSettings.setupComplete, mobileSizing: detectedMobileDevice, upgrades: {}, abilityCooldown: 0, abilityBaseCooldown: 0, abilityPower: 1, adminNoCooldown: false, adminBuffsActive: false, automaticFireEnabled: true,
    slowTime: 0, lastBossType: '', magnet: 105, pierce: 0, critChance: 0, armorChance: 0, regenLevel: 0, regenTimer: 24, drones: 0, droneCooldown: 0,
    blastRadius: 0, bossDamageBonus: 0, bonusShots: 0, lowHullBoost: 0, salvageHeal: 0, singularityRadius: 300, singularityDuration: 7, tempestTideCooldown: 0, tempestTideRadiusBonus: 0, tempestTideForceBonus: 0, reflectTime: 0, reflectContacts: new Set(), reflectDamageBonus: 0, reflectDurationBonus: 0, redshiftPerimeter: null, redshiftPerimeterCooldown: 0, redshiftPerimeterDurationBonus: 0, redshiftPerimeterDamageBonus: 0, redshiftPerimeterRangeBonus: 0, flashTrail: null, flashTrailCooldown: 0, flashTrailDurationBonus: 0, flashTrailDamageBonus: 0, flashTrailDensity: 0, flashTrailContacts: new Set(), eclipseTime: 0, eclipsePhase: 'idle', eclipseCutTimer: 0, eclipseDurationBonus: 0, eclipseCutBonus: 0, eclipseCutDamage: 0, eclipseHitCooldowns: [], eclipseImpactCooldown: 0, eclipseParadox: null, eclipseParadoxCooldown: 0, eclipseParadoxDurationBonus: 0, eclipseParadoxRadiusBonus: 0, eclipseParadoxSuppressBonus: 0, eclipseParadoxDamageBonus: 0, eclipseParadoxCooldownBonus: 0, dinoRoarBonus: 0, dinoRoarRangeBonus: 0, dinoRoarCharges: 2, dinoRoarRecharge: 0, dinoStampedeCharges: 3, dinoStampedeRecharge: 0, dinoStampedeExtra: 0, dinoStampedeDamageBonus: 0, endlessDamage: 0, endlessSpeed: 0,
    player: { x: 400, y: 460, radius: detectedMobileDevice ? 13 * mobileEntityScale : 13, speed: 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, moveAngle: -Math.PI / 2, color: '#7df7e8' },
    pointer: { active: false, pointerId: null, x: 0, y: 0 }, analog: { active: false, x: 0, y: 0 },
    dailyChallenge: false, pendingDailyChallenge: false, challengeDate: '', dailyBestScore: 0, skinBeforeDaily: '', randomStreams: null, exitReturnFocus: null, exitWasPlaying: false,
    championshipRun: false, pendingChampionshipRun: false, championshipBestWave: 0,
    waveDamageTaken: false, enemyDamageRemainders: {}, salvageHealsThisWave: 0, lastSalvageHealWave: 0, lastRepairUpgradeWave: 0, achievementProgress: null
  };
  try {
    const savedPrismChoice = localStorage.getItem(prismAbilityChoiceKey);
    if (savedPrismChoice) {
      let parsed; try { parsed = JSON.parse(savedPrismChoice); } catch { parsed = savedPrismChoice; }
      const valid = (choice) => { const [shipId,key] = String(choice || '').split(':'); return skins.some((skin) => skin.id === shipId && !skin.noAbilities && !skin.hiddenFromHangar && (!skin.profileRestricted || hasSecretShipAccess(skin))) && ['e','q'].includes(key); };
      if (parsed && typeof parsed === 'object') {
        if (valid(parsed.e)) state.prismAbilityChoices.e = parsed.e;
        if (valid(parsed.q)) state.prismAbilityChoices.q = parsed.q;
      } else {
        const [shipId,key] = String(parsed || savedPrismChoice).split(':');
        if (skins.some((skin) => skin.id === shipId && !skin.noAbilities && !skin.hiddenFromHangar && (!skin.profileRestricted || hasSecretShipAccess(skin))) && ['e','q'].includes(key)) state.prismAbilityChoices[key] = shipId + ':' + key;
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
  function totalShieldCount() { return state.shields + state.tempShields; }
  function canRestoreShield() {
    return totalShieldCount() < MAX_TOTAL_SHIELDS
      && (state.shields < MAX_REGULAR_SHIELDS || state.tempShields < 4);
  }
  function restoreOneShield() {
    if (totalShieldCount() >= MAX_TOTAL_SHIELDS) return false;
    if (state.shields < MAX_REGULAR_SHIELDS) state.shields++;
    else if (state.tempShields < 4) state.tempShields++;
    else return false;
    return true;
  }
  function cooldownUpgradeCanHelp() {
    const shipId = currentSkin().id;
    if (shipId === 'training' || upgradeLevel('cooldown') >= 5) return false;
    if (shipId === 'mahoraga') return state.mahoragaSlashCooldownBonus < 5;
    if (shipId === 'prisma') return state.prismCooldownBonus < 5;
    if (shipId === 'megumi' || shipId === 'flamestorm') return true;
    if (shipId === 'saurion') return upgradeLevel('cooldown') < 4;
    const minimum = shipId === 'eclipse' ? 25 : shipId === 'aegis' ? 27 : 22;
    return state.abilityBaseCooldown > minimum + .001 || state.abilityCooldown > .001;
  }
  const upgradeDescriptionForShip = (upgrade) => upgrade.id === 'cooldown' && currentSkin().id === 'flamestorm'
    ? 'Reduz a recarga do E de 18s até 15s e a do Q de 24s até 18s com cinco Condensadores; também corta 4s da recarga atual.'
    : upgrade.id === 'cooldown' && currentSkin().id === 'vulture'
      ? 'Reduz a recarga do E de 24s até 22s e também corta 4s da recarga atual.'
    : upgrade.id === 'cooldown' && currentSkin().id === 'saurion'
      ? 'Reduz a recarga do E em 1s por nível, de 16s até 12s. A recarga do Q é reduzida separadamente pelo Instinto Predador.'
      : upgrade.description;
  function enemyUpgradeLevel() {
    const investedLevels = Object.values(state.upgrades).reduce((total, level) => total + level, 0);
    return Math.min(12, Math.floor(investedLevels / 5));
  }
  function lateWavePressure() { return Math.max(0, state.wave - 40); }
  function enemyWaveHpScale() { return 1 + lateWavePressure() * .026; }
  function enemyWaveSpeedScale() { return 1 + lateWavePressure() * .002; }
  function enemyWaveProjectileScale() { return 1 + lateWavePressure() * .006; }
  function enemyWaveFireRateScale() { return Math.max(.52, 1 - lateWavePressure() * .006); }
  function enemyWaveDamageScale() { return 1 + lateWavePressure() * .026; }
  function wavePickupChance() { return Math.max(.12, 1 - lateWavePressure() * .014); }
  function enemyUpgradeHpScale() { return 1 + enemyUpgradeLevel() * .022; }
  function enemyUpgradeSpeedScale() { return 1 + enemyUpgradeLevel() * .006; }
  function enemyUpgradeAttackScale() { return 1 + enemyUpgradeLevel() * .008; }
  function enemyUpgradeFireRateScale() { return Math.max(.88, 1 - enemyUpgradeLevel() * .01); }
  const upgradeList = [
    { id:'damage', icon:'✹', name:'Núcleo de impacto', description:'Aumenta moderadamente o dano por disparo.', max:8, available:()=>state.player.damage<2.35&&upgradeLevel('damage')<8, apply:()=>{state.player.damage=Math.min(2.35,state.player.damage+.17);} },
    { id:'speed', icon:'➤', name:'Propulsores vetoriais', description:'Aumenta a velocidade da nave.', max:5, available:()=>state.player.speed<405&&upgradeLevel('speed')<5, apply:()=>{state.player.speed=Math.min(405,state.player.speed*1.1);} },
    { id:'rapid', icon:'⚡', name:'Recarga cinética', description:'Reduz o intervalo entre disparos.', max:7, available:()=>upgradeLevel('rapid')<7, apply:()=>{state.player.fireRate=Math.max(.19,state.player.fireRate*.93);} },
    { id:'spread', icon:'✦', name:'Canhões laterais', description:'Adiciona um disparo ao leque da nave, até seis disparos combinados.', max:4, available:()=>state.player.spread<5&&state.player.spread+state.bonusShots<6, apply:()=>{state.player.spread=Math.min(5,state.player.spread+1);} },
    { id:'repair', icon:'♥', name:'Reparo de casco', description:'Recupera uma vida e concede proteção breve.', max:0, available:()=>state.lives<state.maxLives&&(state.wave<=40||state.wave-state.lastRepairUpgradeWave>=8), apply:()=>{state.lives=Math.min(state.maxLives,state.lives+1);state.invulnerable=.8;state.lastRepairUpgradeWave=state.wave;} },
    { id:'shield', icon:'⬡', name:'Escudo de energia', description:'Recupera uma carga de escudo, respeitando o limite total de sete.', max:4, available:()=>upgradeLevel('shield')<4&&canRestoreShield(), apply:()=>{restoreOneShield();} },
    { id:'pierce', icon:'⌁', name:'Projétil perfurante', description:'Cada tiro atravessa mais um inimigo.', max:3, available:()=>state.pierce<3, apply:()=>{state.pierce+=1;} },
    { id:'critical', icon:'✧', name:'Mira de precisão', description:'Aumenta a chance de causar dano crítico, até 32%.', max:4, available:()=>state.critChance<.32, apply:()=>{state.critChance=Math.min(.32,state.critChance+.08);} },
    { id:'drone', icon:'◈', name:'Drone auxiliar', description:'Um satélite ataca inimigos próximos e pode se sacrificar para salvar a nave.', max:3, available:()=>state.drones<3, apply:()=>{state.drones+=1;} },
    { id:'magnet', icon:'⌖', name:'Ímã gravitacional', description:'Atrai recursos de mais longe.', max:5, available:()=>upgradeLevel('magnet')<5, apply:()=>{state.magnet=Math.min(315,state.magnet+42);} },
    { id:'cooldown', icon:'◷', name:'Condensador', description:'Reduz a recarga da habilidade especial.', max:5, available:cooldownUpgradeCanHelp, apply:()=>{if(currentSkin().id==='mahoraga')state.mahoragaSlashCooldownBonus=Math.min(5,state.mahoragaSlashCooldownBonus+1);else if(currentSkin().id==='prisma')state.prismCooldownBonus=Math.min(5,state.prismCooldownBonus+1);else if(currentSkin().id==='megumi')state.abilityBaseCooldown=megumiTechniqueCooldownDuration(1);else if(currentSkin().id==='flamestorm')state.abilityBaseCooldown=Math.max(15,state.abilityBaseCooldown-1);else if(currentSkin().id==='saurion'){state.dinoRoarRecharge=Math.max(0,state.dinoRoarRecharge-1);}else{const minimum=currentSkin().id==='eclipse'?25:currentSkin().id==='aegis'?27:22;state.abilityBaseCooldown=Math.max(minimum,state.abilityBaseCooldown*.9);}if(currentSkin().id!=='saurion')state.abilityCooldown=Math.max(0,state.abilityCooldown-4);} },
    { id:'power', icon:'✴', name:'Amplificador de núcleo', description:'Fortalece a habilidade especial.', max:4, available:()=>currentSkin().id!=='training'&&upgradeLevel('power')<4, apply:()=>{state.abilityPower=Math.min(2,state.abilityPower+.2);} },
    { id:'armor', icon:'⬟', name:'Blindagem reativa', description:'Chance de anular um impacto recebido.', max:4, available:()=>state.armorChance<.32, apply:()=>{state.armorChance=Math.min(.32,state.armorChance+.08);} },
    { id:'regen', icon:'✚', name:'Nanorreparadores', description:'Recupera uma vida periodicamente.', max:3, available:()=>state.regenLevel<3, apply:()=>{state.regenLevel+=1;} },
    { id:'bounty', icon:'◇', name:'Contrato de caça', description:'Aumenta os pontos obtidos por inimigo.', max:5, available:()=>upgradeLevel('bounty')<5, apply:()=>{state.scoreMultiplier=(state.scoreMultiplier||1)+.12;} }
    ,{ id:'volley', icon:'✣', name:'Salva auxiliar', description:'Adiciona disparos extras ao seu leque, até seis disparos combinados.', max:3, available:()=>state.bonusShots<3&&state.player.spread+state.bonusShots<6, apply:()=>{state.bonusShots+=1;} }
    ,{ id:'blast', icon:'✺', name:'Munição de plasma', description:'Seus tiros atingem inimigos próximos ao alvo.', max:4, available:()=>state.blastRadius<56, apply:()=>{state.blastRadius=Math.min(56,state.blastRadius+14);} }
    ,{ id:'bossDamage', icon:'☄', name:'Rompedor de guardiões', description:'Aumenta o dano causado aos chefes, até 45%.', max:3, available:()=>state.bossDamageBonus<.45, apply:()=>{state.bossDamageBonus=Math.min(.45,state.bossDamageBonus+.15);} }
    ,{ id:'lowHull', icon:'⚑', name:'Protocolo de emergência', description:'Ganha velocidade quando restam duas vidas ou menos.', max:3, available:()=>state.lowHullBoost<3, apply:()=>{state.lowHullBoost+=1;} }
    ,{ id:'lifeSupport', icon:'♥+', name:'Casco reforçado', description:'Aumenta o máximo de vida e recupera uma unidade.', max:3, available:()=>state.maxLives<9, apply:()=>{state.maxLives=Math.min(9,state.maxLives+1);state.lives=Math.min(state.maxLives,state.lives+1);} }
    ,{ id:'gravityWell', icon:'🌀', name:'Poço gravitacional', description:'Amplia e prolonga o buraco negro da Tempestade.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('gravityWell')<3, apply:()=>{state.singularityRadius+=40;state.singularityDuration+=1;} }
    ,{ id:'tempestTideRadius', icon:'◉', name:'Maré Ampliada', description:'Aumenta o alcance da Maré Reversa em 30 unidades, até quatro vezes.', max:4, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideRadius')<4, apply:()=>{state.tempestTideRadiusBonus=Math.min(120,state.tempestTideRadiusBonus+30);} }
    ,{ id:'tempestTideForce', icon:'↗', name:'Repulsão Vetorial', description:'Aumenta o impulso que afasta os inimigos. Chefes recebem um empurrão menor.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideForce')<3, apply:()=>{state.tempestTideForceBonus=Math.min(240,state.tempestTideForceBonus+80);} }
    ,{ id:'tempestTideCapacity', icon:'✦', name:'Reservatório de Maré', description:'Adiciona uma carga à Maré Reversa, até seis cargas.', max:2, available:()=>currentSkin().id==='tempest'&&state.tempestTideChargeBonus<2, apply:()=>{state.tempestTideChargeBonus=Math.min(2,state.tempestTideChargeBonus+1);state.tempestTideCharges=Math.min(4+state.tempestTideChargeBonus,state.tempestTideCharges+1);} }
    ,{ id:'tempestTideDamage', icon:'✹', name:'Ruptura de Pressão', description:'Aumenta o dano leve do pulso em 1 por nível. Chefes recebem dano reduzido.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideDamage')<3, apply:()=>{state.tempestTideDamageBonus=Math.min(3,state.tempestTideDamageBonus+1);} }
    ,{ id:'tempestTideSweep', icon:'〰', name:'Corrente Defletora', description:'Prolonga a curva defensiva e o rastreamento dos projéteis de contra-ataque.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideSweep')<3, apply:()=>{state.tempestTideSweepBonus=Math.min(.36,state.tempestTideSweepBonus+.12);} }
    ,{ id:'tempestTideCooldown', icon:'⟳', name:'Ressonância de Maré', description:'Reduz em 2 segundos a recarga do conjunto de cargas, de 24 até 18 segundos.', max:3, available:()=>currentSkin().id==='tempest'&&upgradeLevel('tempestTideCooldown')<3, apply:()=>{state.tempestTideCooldown=Math.max(0,state.tempestTideCooldown-2);} }
    ,{ id:'chronosEchoDuration', icon:'◷', name:'Janela Estendida', description:'Prolonga os Ecos do Futuro em 1 segundo, até 8 segundos.', max:2, available:()=>currentSkin().id==='chronos'&&state.chronosEchoDurationBonus<2, apply:()=>{state.chronosEchoDurationBonus=Math.min(2,state.chronosEchoDurationBonus+1);} }
    ,{ id:'chronosEchoDamage', icon:'✦', name:'Ressonância Duplicada', description:'Aumenta o dano dos ecos em 5 pontos percentuais, de 70% até 85%.', max:3, available:()=>currentSkin().id==='chronos'&&state.chronosEchoDamageBonus<.15, apply:()=>{state.chronosEchoDamageBonus=Math.min(.15,state.chronosEchoDamageBonus+.05);} }
    ,{ id:'chronosEchoCooldown', icon:'⟳', name:'Compasso Acelerado', description:'Reduz em 2 segundos a recarga do Q, de 24 até 18 segundos.', max:3, available:()=>currentSkin().id==='chronos'&&upgradeLevel('chronosEchoCooldown')<3, apply:()=>{state.chronosEchoCooldown=Math.max(0,state.chronosEchoCooldown-2);} }
    ,{ id:'aegisOrbitDuration', icon:'◷', name:'Vigília Prolongada', description:'Prolonga as Órbitas Sentinelas em 1 segundo, até 6 segundos.', max:1, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitDurationBonus<1, apply:()=>{state.aegisOrbitDurationBonus=Math.min(1,state.aegisOrbitDurationBonus+1);} }
    ,{ id:'aegisOrbitCount', icon:'✦', name:'Fragmentos Extras', description:'Invoca mais um fragmento sentinela, até quatro.', max:1, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitCountBonus<1, apply:()=>{state.aegisOrbitCountBonus=Math.min(1,state.aegisOrbitCountBonus+1);} }
    ,{ id:'aegisOrbitDamage', icon:'☄', name:'Núcleo de Retorno', description:'Aumenta em 1 o dano dos projéteis convertidos, de 2 até 5.', max:3, available:()=>currentSkin().id==='aegis'&&state.aegisOrbitDamageBonus<3, apply:()=>{state.aegisOrbitDamageBonus=Math.min(3,state.aegisOrbitDamageBonus+1);} }
    ,{ id:'aegisOrbitCooldown', icon:'⟳', name:'Ciclo Guardião', description:'Reduz em 1 segundo a recarga do Q, de 36 até 33 segundos.', max:3, available:()=>currentSkin().id==='aegis'&&upgradeLevel('aegisOrbitCooldown')<3, apply:()=>{state.aegisOrbitCooldown=Math.max(0,state.aegisOrbitCooldown-1);} }
    ,{ id:'auroraLinkDuration', icon:'◷', name:'Aurora Duradoura', description:'Prolonga o Elo Estelar em 1 segundo, até 9 segundos.', max:2, available:()=>currentSkin().id==='aurora'&&state.auroraLinkDurationBonus<2, apply:()=>{state.auroraLinkDurationBonus=Math.min(2,state.auroraLinkDurationBonus+1);} }
    ,{ id:'auroraLinkTargets', icon:'✧', name:'Constelação Ampliada', description:'Adiciona um alvo aos saltos do Elo Estelar, até dez inimigos.', max:2, available:()=>currentSkin().id==='aurora'&&state.auroraLinkTargetBonus<2, apply:()=>{state.auroraLinkTargetBonus=Math.min(2,state.auroraLinkTargetBonus+1);} }
    ,{ id:'auroraLinkDamage', icon:'☄', name:'Fótons Intensos', description:'Aumenta em 0,4 o dano de cada pulso do Elo Estelar.', max:3, available:()=>currentSkin().id==='aurora'&&state.auroraLinkDamageBonus<1.2, apply:()=>{state.auroraLinkDamageBonus=Math.min(1.2,state.auroraLinkDamageBonus+.4);} }
    ,{ id:'auroraLinkCooldown', icon:'⟳', name:'Ressonância Boreal', description:'Reduz em 2 segundos a recarga do Q, de 24 até 18 segundos.', max:3, available:()=>currentSkin().id==='aurora'&&upgradeLevel('auroraLinkCooldown')<3, apply:()=>{state.auroraLinkCooldown=Math.max(0,state.auroraLinkCooldown-2);} }
    ,{ id:'returnCore', icon:'⟲', name:'Núcleo de contra-ataque', description:'Aumenta o dano, prolonga o escudo refletor e reduz sua recarga.', max:4, available:()=>currentSkin().id==='redshift'&&upgradeLevel('returnCore')<4, apply:()=>{state.reflectDamageBonus=Math.min(.9,state.reflectDamageBonus+.23);state.reflectDurationBonus=Math.min(2,state.reflectDurationBonus+.5);state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1.25);} }
    ,{ id:'redshiftPerimeterDuration', icon:'◷', name:'Cerco Prolongado', description:'Aumenta em 1 segundo a duração do Perímetro de Cerco, até 8 segundos.', max:2, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterDurationBonus<2, apply:()=>{state.redshiftPerimeterDurationBonus=Math.min(2,state.redshiftPerimeterDurationBonus+1);} }
    ,{ id:'redshiftPerimeterDamage', icon:'✹', name:'Fios Cortantes', description:'Aumenta em 1,5 o dano causado quando um inimigo cruza os feixes.', max:3, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterDamageBonus<4.5, apply:()=>{state.redshiftPerimeterDamageBonus=Math.min(4.5,state.redshiftPerimeterDamageBonus+1.5);} }
    ,{ id:'redshiftPerimeterRange', icon:'△', name:'Âncoras Expansivas', description:'Amplia o triângulo do perímetro em 15 unidades por nível.', max:3, available:()=>currentSkin().id==='redshift'&&state.redshiftPerimeterRangeBonus<45, apply:()=>{state.redshiftPerimeterRangeBonus=Math.min(45,state.redshiftPerimeterRangeBonus+15);} }
    ,{ id:'redshiftPerimeterCooldown', icon:'⟳', name:'Ressonância Rubra', description:'Reduz em 2 segundos a recarga do Q, até 22 segundos.', max:3, available:()=>currentSkin().id==='redshift'&&upgradeLevel('redshiftPerimeterCooldown')<3, apply:()=>{state.redshiftPerimeterCooldown=Math.max(0,state.redshiftPerimeterCooldown-2);} }
    ,{ id:'flashTrailDuration', icon:'◷', name:'Rastro Persistente', description:'Aumenta em 1 segundo a duração do Rastro de Ruptura, até 9 segundos.', max:3, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDurationBonus<3, apply:()=>{state.flashTrailDurationBonus=Math.min(3,state.flashTrailDurationBonus+1);} }
    ,{ id:'flashTrailDamage', icon:'✦', name:'Fio Residual', description:'Aumenta em 0,7 o dano de cada corte deixado no caminho.', max:3, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDamageBonus<2.1, apply:()=>{state.flashTrailDamageBonus=Math.min(2.1,state.flashTrailDamageBonus+.7);} }
    ,{ id:'flashTrailDensity', icon:'〰', name:'Passagem Dupla', description:'Deixa rastros mais próximos e aumenta a largura dos cortes.', max:4, available:()=>currentSkin().id==='flashblade'&&state.flashTrailDensity<4, apply:()=>{state.flashTrailDensity=Math.min(4,state.flashTrailDensity+1);} }
    ,{ id:'flashTrailCooldown', icon:'⟳', name:'Cadência Vetorial', description:'Reduz em 2 segundos a recarga do Q, de 24 até 18 segundos.', max:3, available:()=>currentSkin().id==='flashblade'&&upgradeLevel('flashTrailCooldown')<3, apply:()=>{state.flashTrailCooldown=Math.max(0,state.flashTrailCooldown-2);} }
    ,{ id:'eclipseVeil', icon:'✧', name:'Manto de eclipse', description:'Prolonga a sequência e amplia o alcance dos cortes.', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseVeil')<4, apply:()=>{state.eclipseDurationBonus=Math.min(2.2,state.eclipseDurationBonus+.55);state.eclipseCutBonus=Math.min(36,state.eclipseCutBonus+9);} }
    ,{ id:'eclipseCooldown', icon:'◷', name:'Ressonador do domínio', description:'Reduz a recarga da Eclipse em 1 segundo, até o mínimo de 25 segundos.', max:5, available:()=>currentSkin().id==='eclipse'&&state.abilityBaseCooldown>25, apply:()=>{state.abilityBaseCooldown=Math.max(25,state.abilityBaseCooldown-1);state.abilityCooldown=Math.max(0,state.abilityCooldown-1);} }
    ,{ id:'eclipseDamage', icon:'⚔', name:'Fio do domínio', description:'Aumenta o dano de cada corte em 0,25 (até +1,00).', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseDamage')<4, apply:()=>{state.eclipseCutDamage=Math.min(1,state.eclipseCutDamage+.25);} }
    ,{ id:'eclipseParadoxDuration', icon:'◷', name:'Paradoxo Prolongado', description:'Mantém a distorção ativa por mais 1 segundo, até 7 segundos.', max:2, available:()=>currentSkin().id==='eclipse'&&state.eclipseParadoxDurationBonus<2, apply:()=>{state.eclipseParadoxDurationBonus=Math.min(2,state.eclipseParadoxDurationBonus+1);} }
    ,{ id:'eclipseParadoxRadius', icon:'⦿', name:'Horizonte Distorcido', description:'Amplia o raio do Paradoxo Absoluto em 24 unidades por nível.', max:3, available:()=>currentSkin().id==='eclipse'&&state.eclipseParadoxRadiusBonus<72, apply:()=>{state.eclipseParadoxRadiusBonus=Math.min(72,state.eclipseParadoxRadiusBonus+24);} }
    ,{ id:'eclipseParadoxSuppress', icon:'⊗', name:'Supressão Temporal', description:'Aumenta a frequência dos pulsos; chefes sofrem interrupções mais curtas.', max:4, available:()=>currentSkin().id==='eclipse'&&state.eclipseParadoxSuppressBonus<4, apply:()=>{state.eclipseParadoxSuppressBonus=Math.min(4,state.eclipseParadoxSuppressBonus+1);} }
    ,{ id:'eclipseParadoxSentence', icon:'⚖', name:'Sentença Irrevogável', description:'Aumenta o dano do colapso em 0,8 por nível.', max:4, available:()=>currentSkin().id==='eclipse'&&state.eclipseParadoxDamageBonus<3.2, apply:()=>{state.eclipseParadoxDamageBonus=Math.min(3.2,state.eclipseParadoxDamageBonus+.8);} }
    ,{ id:'eclipseParadoxCooldown', icon:'⟳', name:'Paradoxo Acelerado', description:'Reduz a recarga do Q em 2 segundos por nível, de 26 até 18 segundos.', max:4, available:()=>currentSkin().id==='eclipse'&&upgradeLevel('eclipseParadoxCooldown')<4, apply:()=>{state.eclipseParadoxCooldownBonus=Math.min(4,state.eclipseParadoxCooldownBonus+1);state.eclipseParadoxCooldown=Math.max(0,state.eclipseParadoxCooldown-2);} }
    ,{ id:'flameStormDashCore', icon:'🔥', name:'Combustão Vetorial', description:'Aumenta em 0,4 o dano do rastro do E por nível, até três níveis.', max:3, available:()=>currentSkin().id==='flamestorm'&&upgradeLevel('flameStormDashCore')<3, apply:()=>{} }
    ,{ id:'flameStormVortexCore', icon:'🌀', name:'Núcleo Carmesim', description:'Amplia o raio do Q em 12 unidades e aumenta levemente seu dano, até três níveis.', max:3, available:()=>currentSkin().id==='flamestorm'&&upgradeLevel('flameStormVortexCore')<3, apply:()=>{} }
    ,{ id:'dinoFangs', icon:'〰', name:'Garras do Predador', description:'Aumenta o dano das garras e o alcance do Rugido de Garras.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoFangs')<4, apply:()=>{state.dinoRoarBonus+=5;state.dinoRoarRangeBonus+=24;} }
    ,{ id:'dinoStampede', icon:'🐅', name:'Investida da Matilha', description:'Adiciona uma investida de tigre ao Q e fortalece o dano.', max:2, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoStampede')<2, apply:()=>{state.dinoStampedeExtra+=1;state.dinoStampedeDamageBonus+=1.25;} }
    ,{ id:'dinoResonance', icon:'◷', name:'Instinto Predador', description:'Reduz em 2s a recarga de cada carga do Q, de 32s até 24s. Nunca aumenta uma recarga que já está contando.', max:4, available:()=>currentSkin().id==='saurion'&&upgradeLevel('dinoResonance')<4, apply:()=>{const nextDuration=Math.max(24,32-(upgradeLevel('dinoResonance')+1)*2);if(state.dinoStampedeRecharge>0)state.dinoStampedeRecharge=Math.min(state.dinoStampedeRecharge,nextDuration);} }
    ,{ id:'prismCoreRange', icon:'◎', name:'Prisma de longo alcance', description:'Amplia o raio do Núcleo Prisma em 35 unidades por nível.', max:3, available:()=>currentSkin().id==='prisma'&&state.prismCoreRangeBonus<105, apply:()=>{state.prismCoreRangeBonus=Math.min(105,state.prismCoreRangeBonus+35);} }
    ,{ id:'prismCoreDamage', icon:'✧', name:'Refração concentrada', description:'Aumenta em 2 o dano do Núcleo Prisma por nível.', max:4, available:()=>currentSkin().id==='prisma'&&state.prismCoreDamageBonus<8, apply:()=>{state.prismCoreDamageBonus=Math.min(8,state.prismCoreDamageBonus+2);} }
    ,{ id:'prismHorizonWindow', icon:'⌖', name:'Âncora ampliada', description:'Estende a janela para retornar pela Dobra de Horizonte em 1 segundo, até 6 segundos.', max:2, available:()=>currentSkin().id==='prisma'&&state.prismHorizonWindowBonus<2, apply:()=>{state.prismHorizonWindowBonus=Math.min(2,state.prismHorizonWindowBonus+1);} }
    ,{ id:'prismHorizonDamage', icon:'✹', name:'Pulso de retorno', description:'Aumenta em 2 o dano da onda liberada ao retornar pela Dobra de Horizonte.', max:3, available:()=>currentSkin().id==='prisma'&&state.prismHorizonDamageBonus<6, apply:()=>{state.prismHorizonDamageBonus=Math.min(6,state.prismHorizonDamageBonus+2);} }
    ,{ id:'prismCooldown', icon:'⟳', name:'Ressonância real', description:'Reduz em 2 segundos a recarga compartilhada das habilidades escolhidas, até 20 segundos.', max:4, available:()=>currentSkin().id==='prisma'&&state.prismCooldownBonus<4, apply:()=>{state.prismCooldownBonus=Math.min(4,state.prismCooldownBonus+1);state.abilityBaseCooldown=prismCooldownDuration();state.abilityCooldown=Math.min(state.abilityCooldown,state.abilityBaseCooldown);} }
    ,{ id:'prismResonance', icon:'◇', name:'Espectro refinado', description:'Fortalece em 12% as habilidades próprias e copiadas da Prisma Real, até 36%.', max:3, available:()=>currentSkin().id==='prisma'&&upgradeLevel('prismResonance')<3, apply:()=>{state.abilityPower=Math.min(2.5,state.abilityPower+.12);} }
    ,{ id:'vultureFoldRange', icon:'⌖', name:'Dobra de longo alcance', description:'Aumenta a distância da Dobra Espacial em 50 unidades por nível, até três vezes.', max:3, available:()=>currentSkin().id==='vulture'&&upgradeLevel('vultureFoldRange')<3, apply:()=>{state.vultureFoldRangeBonus=Math.min(150,state.vultureFoldRangeBonus+50);} }
    ,{ id:'vulturePulseRadius', icon:'◎', name:'Campo de compressão', description:'Aumenta o raio do impacto do Míssil Gravitacional em 12 unidades por nível, até três níveis.', max:3, available:()=>currentSkin().id==='vulture'&&upgradeLevel('vulturePulseRadius')<3, apply:()=>{state.vulturePulseRadiusBonus=Math.min(36,state.vulturePulseRadiusBonus+12);} }
    ,{ id:'vulturePulseDamage', icon:'✦', name:'Núcleo devorador', description:'Aumenta em 2 o dano do Míssil Gravitacional e do disparo forçado por nível, até três níveis.', max:3, available:()=>currentSkin().id==='vulture'&&upgradeLevel('vulturePulseDamage')<3, apply:()=>{state.vulturePulseDamageBonus=Math.min(6,state.vulturePulseDamageBonus+2);} }
    ,{ id:'vulturePulseCooldown', icon:'⟳', name:'Míssil de ciclo rápido', description:'Reduz a recarga do míssil Q em 0,25s por nível, de 3s até 2,25s.', max:3, available:()=>currentSkin().id==='vulture'&&upgradeLevel('vulturePulseCooldown')<3, apply:()=>{state.vultureQCooldown=Math.min(state.vultureQCooldown,Math.max(2.25,3-(upgradeLevel('vulturePulseCooldown')+1)*.25));} }
    ,{ id:'salvageHeal', icon:'✚', name:'Recuperação de destroços', description:'Inimigos destruídos podem liberar energia de reparo.', max:4, available:()=>state.salvageHeal<4, apply:()=>{state.salvageHeal+=1;} }
    ,{ id:'endlessDamage', icon:'✹', name:'Núcleo adaptativo', description:'Reforço repetível com ganho decrescente, limitado a +60% de dano.', max:0, stack:true, available:()=>state.endlessDamage<.6, apply:()=>{state.endlessDamage=Math.min(.6,state.endlessDamage + .11 / (1 + upgradeLevel('endlessDamage') * .14));} }
    ,{ id:'endlessSpeed', icon:'➤', name:'Impulso de longo curso', description:'Aumenta a mobilidade aos poucos, com velocidade máxima controlada.', max:0, stack:true, available:()=>state.endlessSpeed<118, apply:()=>{state.endlessSpeed=Math.min(120,state.endlessSpeed + 8 / (1 + upgradeLevel('endlessSpeed') * .12));} }
    ,{ id:'ferrumCharge', icon:'◈', name:'Reator de pressão', description:'Ganha 20% mais pressão por dano. O dano causado é ajustado pela vida do alvo para manter o ritmo nas ondas altas.', max:3, available:()=>currentSkin().id==='training'&&upgradeLevel('ferrumCharge')<3, apply:()=>{} }
    ,{ id:'ferrumDashRange', icon:'➤', name:'Aríete de longo curso', description:'Aumenta em cerca de 100 unidades a distância de cada investida Q, até três níveis.', max:3, available:()=>currentSkin().id==='training'&&upgradeLevel('ferrumDashRange')<3, apply:()=>{} }
  ];

  function upgradeCanBeOffered(upgrade) {
    const maximum = Number(upgrade.max);
    const currentLevel = upgrade.id === 'drone' ? state.drones : upgradeLevel(upgrade.id);
    if (Number.isFinite(maximum) && maximum > 0 && currentLevel >= maximum) return false;
    return typeof upgrade.available === 'function' && upgrade.available();
  }
  function upgradeTheme(upgrade) {
    const id = upgrade.id;
    if (['repair','lifeSupport','regen','salvageHeal'].includes(id)) return 'health';
    if (['shield','armor','aegisOrbitDuration','aegisOrbitCount','aegisOrbitDamage','aegisOrbitCooldown','returnCore','mahoragaAdaptation','mahoragaGuard'].includes(id)) return 'defense';
    if (['speed','lowHull','endlessSpeed','flashTrailDuration','flashTrailDensity','flameStormDashCore','vultureFoldRange','ferrumDashRange'].includes(id)) return 'mobility';
    if (['bounty','magnet','endlessDamage'].includes(id)) return 'reward';
    if (['damage','rapid','spread','pierce','critical','drone','volley','blast','bossDamage','flameStormVortexCore','dinoFangs','dinoStampede','dinoResonance','vulturePulseDamage','vulturePulseRadius'].includes(id)) return 'offense';
    if (id === 'ferrumCharge') return 'ability';
    return 'ability';
  }
  function upgradeProgressLabel(upgrade, nextLevel) {
    const maximum = Number(upgrade.max);
    if (Number.isFinite(maximum) && maximum > 0) {
      const currentLevel = upgrade.id === 'drone' ? state.drones : upgradeLevel(upgrade.id);
      return `${currentLevel}/${maximum} → ${nextLevel}/${maximum}`;
    }
    return upgrade.stack ? `Nível ${nextLevel}` : '';
  }
  function createUpgradeCard(upgrade) {
    const button = document.createElement('button');
    const currentLevel = upgrade.id === 'drone' ? state.drones : upgradeLevel(upgrade.id);
    const nextLevel = currentLevel + 1;
    const maximum = Number(upgrade.max);
    const finalLevel = Number.isFinite(maximum) && maximum > 0 && nextLevel === maximum;
    button.type = 'button';
    button.className = `starfall-upgrade-card${finalLevel ? ' is-final-level' : ''}`;
    if (finalLevel) button.dataset.upgradeTheme = upgradeTheme(upgrade);
    const progress = upgradeProgressLabel(upgrade, nextLevel);
    button.innerHTML = `<span class="starfall-upgrade-icon" aria-hidden="true">${upgrade.icon}</span><strong>${upgrade.name}${progress ? ` · ${progress}` : ''}</strong>${finalLevel ? '<span class="starfall-upgrade-final-badge">ÚLTIMO NÍVEL</span>' : ''}<span>${upgradeDescriptionForShip(upgrade)}</span>`;
    return button;
  }
  function applyUpgradeChoice(upgrade) {
    if (state.mode !== 'upgrade' || !upgradeCanBeOffered(upgrade)) return false;
    upgrade.apply();
    state.upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
    return true;
  }

  function readBest() { try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); } catch { return 0; } }
  function readBestWave() { try { return Math.max(0, Number(localStorage.getItem(bestWaveKey)) || 0); } catch { return 0; } }
  let selectedPilotNickname = '';
  let pendingPilotNicknameAction = null;
  let pendingUnauthorizedNickname = '';
  let testProfileSessionShipUnlocks = new Set();
  const starfallPilotNicknameKey = 'cv-games-cv-starfall-pilot-nickname';
  function profileNickname() { return normalizeRankNickname(window.CV_GAMES_PROFILE?.getProfile?.()?.nickname || ''); }
  function rankNickname() { return normalizeRankNickname(selectedPilotNickname || profileNickname()); }
  function isTestProfile(nickname = rankNickname()) { return normalizeRankNickname(nickname) === 'teste'; }
  function isScoreAdminProfile() { return profileNickname() === 'poder'; }
  function isGenericPlayerProfile() { return !profileNickname() || profileNickname() === 'jogador'; }
  function normalizeRankNickname(value) {
    const nickname = String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
    return nickname === 'geovanagamer099' ? 'storm' : nickname;
  }
  function isAuthorizedPilotNickname(nickname) {
    const allowed = (window.CV_STARFALL_SUPABASE?.allowedNicknames || ['educvv']).map(normalizeRankNickname);
    const normalized = normalizeRankNickname(nickname);
    if (normalized === 'educvv' && profileNickname() !== 'educvv') return false;
    return Boolean(normalized && allowed.includes(normalized));
  }
  function readSavedPilotNickname() {
    try { return normalizeRankNickname(localStorage.getItem(starfallPilotNicknameKey) || ''); } catch { return ''; }
  }
  function updatePilotNicknameFeedback() {
    if (!ui.pilotNicknameInput || !ui.pilotNicknameFeedback) return false;
    const nickname = normalizeRankNickname(ui.pilotNicknameInput.value);
    pendingUnauthorizedNickname = '';
    ui.pilotNicknameConfirm.textContent = 'CONFIRMAR NICK';
    if (!nickname) {
      ui.pilotNicknameFeedback.className = 'starfall-pilot-nickname-feedback is-empty';
      ui.pilotNicknameFeedback.textContent = 'Digite o nome, apelido ou nick que vai usar.';
      return false;
    }
    if (isAuthorizedPilotNickname(nickname)) {
      ui.pilotNicknameFeedback.className = 'starfall-pilot-nickname-feedback is-authorized';
      ui.pilotNicknameFeedback.textContent = '✓ NICK AUTORIZADO · sua pontuação pode entrar no TOP 10.';
      return true;
    }
    ui.pilotNicknameFeedback.className = 'starfall-pilot-nickname-feedback is-unauthorized';
    ui.pilotNicknameFeedback.textContent = 'Esse nick pode jogar normalmente; ele não está autorizado para o TOP 10.';
    return false;
  }
  function requestPilotNickname(action) {
    if (!isGenericPlayerProfile() || !ui.pilotNicknameModal || !ui.pilotNicknameForm) {
      selectedPilotNickname = profileNickname();
      action?.();
      return;
    }
    pendingPilotNicknameAction = action;
    ui.pilotNicknameInput.value = readSavedPilotNickname();
    updatePilotNicknameFeedback();
    ui.pilotNicknameModal.hidden = false;
    syncAudioVisibility();
    ui.pilotNicknameInput.focus();
  }
  function closePilotNicknamePrompt() {
    if (ui.pilotNicknameModal) ui.pilotNicknameModal.hidden = true;
    pendingPilotNicknameAction = null;
    pendingUnauthorizedNickname = '';
    syncAudioVisibility();
    ui.start?.focus({ preventScroll:true });
  }
  async function confirmPilotNickname(event) {
    event.preventDefault();
    const nickname = normalizeRankNickname(ui.pilotNicknameInput?.value);
    if (!nickname) {
      updatePilotNicknameFeedback();
      ui.pilotNicknameInput?.focus();
      return;
    }
    const authorized = isAuthorizedPilotNickname(nickname);
    if (!authorized && pendingUnauthorizedNickname !== nickname) {
      pendingUnauthorizedNickname = nickname;
      ui.pilotNicknameFeedback.className = 'starfall-pilot-nickname-feedback is-unauthorized';
      ui.pilotNicknameFeedback.textContent = 'Confirme para continuar: este nick não é autorizado e sua pontuação não será enviada ao ranking.';
      ui.pilotNicknameConfirm.textContent = 'CONTINUAR SEM RANK';
      return;
    }
    const profileApi = window.CV_GAMES_PROFILE;
    const enteredNickname = profileApi?.sanitizeNickname?.(ui.pilotNicknameInput.value)
      || String(ui.pilotNicknameInput.value || '').replace(/\s+/g, ' ').trim();
    selectedPilotNickname = nickname;
    try { localStorage.setItem(starfallPilotNicknameKey, nickname); } catch { /* O nick continua nesta sessão. */ }
    ui.pilotNicknameConfirm.disabled = true;
    ui.pilotNicknameConfirm.textContent = 'SALVANDO PERFIL…';
    ui.pilotNicknameFeedback.className = authorized
      ? 'starfall-pilot-nickname-feedback is-authorized'
      : 'starfall-pilot-nickname-feedback is-unauthorized';
    ui.pilotNicknameFeedback.textContent = 'Salvando o nick no perfil e carregando as preferências do Starfall…';
    try {
      if (profileApi?.saveProfile) {
        const currentProfile = profileApi.getProfile?.() || {};
        profileApi.saveProfile({ ...currentProfile, nickname:enteredNickname });
        selectedPilotNickname = '';
        await nicknameSettingsLoadPromise;
      }
      if (ui.rankStatus) ui.rankStatus.textContent = authorized
        ? '✓ Nick autorizado para o TOP 10: ' + displayRankNickname(nickname) + '.'
        : 'Nick ' + displayRankNickname(nickname) + ' não autorizado; esta pontuação não será enviada ao ranking.';
      pendingPilotNicknameAction = null;
      pendingUnauthorizedNickname = '';
      returnToMenu();
      if (ui.status) ui.status.textContent = 'Nick salvo. Escolha sua nave e inicie a missão quando quiser.';
    } finally {
      ui.pilotNicknameConfirm.disabled = false;
      ui.pilotNicknameConfirm.textContent = 'CONFIRMAR NICK';
    }
  }
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
    if (!isDeveloperProfile()) return null;
    try {
      const checkpoint = JSON.parse(localStorage.getItem(missionCheckpointKey()) || 'null');
      if (!checkpoint || checkpoint.version !== 1 || !Number.isFinite(Number(checkpoint.wave)) || Number(checkpoint.wave) < 1 || !skins.some((skin) => skin.id === checkpoint.shipId)) return null;
      return checkpoint;
    } catch { return null; }
  }
  function clearMissionCheckpoint(nickname = profileNickname()) {
    if (!isDeveloperProfile()) return;
    try { localStorage.removeItem(missionCheckpointKey(nickname)); } catch { /* A missão pode continuar sem armazenamento local. */ }
  }
  function saveMissionCheckpoint() {
    if (!isDeveloperProfile() || state.dailyChallenge || state.championshipRun || !['playing', 'paused'].includes(state.mode)) return false;
    const nickname = profileNickname();
    const previous = readMissionCheckpoint();
    const bestWave = readProfileResumeWave(nickname);
    const targetWave = Math.max(1, state.wave, bestWave, Number(previous?.wave) || 0);
    if (previous && Number(previous.wave) > Math.max(state.wave, bestWave)) return true;
    const numericState = {};
      Object.entries(state).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value) && !['lastTime', 'raf', 'width', 'height', 'dpr', 'megumiSummonCooldown', 'megumiFormWavesRemaining', 'megumiCloakTime', 'mahoragaAdaptationVisualTime'].includes(key)) numericState[key] = value;
    });
    const checkpoint = {
      version:1, nickname:nickname || 'jogador', savedAt:Date.now(), wave:targetWave,
      bestCompletedWave:Math.max(bestWave, readNicknameCompletedWave(nickname)), score:Math.max(0, state.score), elapsed:Math.max(0, state.elapsed),
      shipId:state.selectedSkin, lastBossType:state.lastBossType, stats:numericState, upgrades:{ ...state.upgrades },
      megumiTransformed:state.megumiTransformed,
      megumiFormWavesRemaining:state.megumiFormWavesRemaining,
      megumiSummonCooldown:state.megumiSummonCooldown,
      mahoraga:{ cycleStartWave:state.mahoragaCycleStartWave, progress:{ ...state.mahoragaProgress }, adaptationLevels:{ ...state.mahoragaAdaptationLevels }, adaptationWaves:{ ...state.mahoragaAdaptationWaves }, damageRemainders:{ ...state.mahoragaDamageRemainders }, lastType:state.mahoragaLastType, wheelSegments:state.mahoragaWheelSegments, wheelReady:state.mahoragaWheelReady, resistanceType:state.mahoragaResistanceType, resistanceUntilWave:state.mahoragaResistanceUntilWave, resistancePower:state.mahoragaResistancePower, duplicateBuffTime:state.mahoragaDuplicateBuffTime, duplicateBuffBonus:state.mahoragaDuplicateBuffBonus, reviveUsed:state.mahoragaReviveUsed },
      player:{ xRatio:state.width ? state.player.x / state.width : .5, yRatio:state.height ? state.player.y / state.height : .78,
        speed:state.player.speed, damage:state.player.damage, fireRate:state.player.fireRate, spread:state.player.spread,
        angle:state.player.angle, moveAngle:state.player.moveAngle }
    };
    try { localStorage.setItem(missionCheckpointKey(nickname), JSON.stringify(checkpoint)); return true; } catch { return false; }
  }
  function secretShipUnlockStorageKey(nickname = profileNickname()) {
    return secretShipUnlockPrefix + encodeURIComponent(nickname || 'jogador');
  }
  function saveSecretShipUnlocks(nickname = profileNickname()) {
    try { localStorage.setItem(secretShipUnlockStorageKey(nickname), JSON.stringify([...secretShipUnlocks])); return true; }
    catch { return false; }
  }
  function readSecretShipUnlocks(nickname = profileNickname()) {
    try {
      const profileKey = secretShipUnlockStorageKey(nickname);
      const savedForProfile = localStorage.getItem(profileKey);
      if (savedForProfile !== null) {
        const saved = JSON.parse(savedForProfile);
        return new Set(Array.isArray(saved) ? saved.filter((id) => skins.some((skin) => skin.secret && skin.id === id)) : []);
      }
      if (localStorage.getItem(secretShipUnlockMigrationKey) === '1') return new Set();
      const legacy = JSON.parse(localStorage.getItem(legacySecretShipUnlockKey) || '[]');
      const migrated = new Set(Array.isArray(legacy)
        ? legacy.includes('*')
          ? skins.filter((skin) => skin.secret && skin.id !== 'prisma').map((skin) => skin.id)
          : legacy.filter((id) => skins.some((skin) => skin.secret && skin.id === id))
        : []);
      localStorage.setItem(profileKey, JSON.stringify([...migrated]));
      localStorage.setItem(secretShipUnlockMigrationKey, '1');
      return migrated;
    } catch { return new Set(); }
  }
  function hasSecretShipAccess(skin) {
    if (skin.id === 'prisma') return prismaAccountAuthorized && profileNickname() === 'educvv';
    if (skin.profileRestricted) return Array.isArray(skin.allowedProfiles) && skin.allowedProfiles.includes(profileNickname());
    return Array.isArray(skin.allowedProfiles) && skin.allowedProfiles.includes(profileNickname())
      || secretShipUnlocks.has(skin.id)
      || accountShipProgressLoaded && accountUnlockedShipIds.has(skin.id);
  }
  function displayRankNickname(value) {
    const nickname = normalizeRankNickname(value);
    const displayName = window.CV_STARFALL_SUPABASE?.displayNicknames?.[nickname] || nickname || 'Piloto';
    return displayName.toLocaleUpperCase('pt-BR');
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
    const now = Date.now();
    ui.dailyRecord.textContent = isTestProfile()
      ? 'Perfil de teste ativo: missões e roleta CV Coin liberadas; o progresso não entra no Top 10.'
      : now >= championshipEndAt
      ? `Campeonato encerrado em ${championshipEndDisplayDateTime()} · placar final disponível no menu de missões.`
      : championshipIsOpenNow(now)
        ? `Campeonato aberto até ${championshipEndDisplayDateTime()} · complete missões e concorra no Top 10.`
        : `Missões diárias do campeonato começam em ${championshipLocalDateTime(championshipStartAt)}.`;
  }
  const championshipMissions = Object.freeze([
    { id:'kills', title:'Derrube 10 inimigos', detail:'Destrua inimigos durante uma missão do campeonato.', target:10, unit:'inimigos', reward:25 },
    { id:'waves', title:'Complete 3 ondas', detail:'Conclua ondas inteiras. Cada nova onda conta uma vez.', target:3, unit:'ondas', reward:35 },
    { id:'score', title:'Marque 5.000 pontos', detail:'Some pontos derrotando inimigos e chefes.', target:5000, unit:'pontos', reward:40 }
  ]);
  function championshipIsOpenNow(now = Date.now()) { return now >= championshipStartAt && now < championshipEndAt; }
  function championshipAccessOpen(now = Date.now()) { return isTestProfile() || championshipIsOpenNow(now); }
  function championshipLocalDateTime(timestamp) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone:'America/Sao_Paulo', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).format(new Date(timestamp));
  }
  function championshipEndDisplayDateTime() { return championshipLocalDateTime(championshipEndAt - 60_000); }
  function championshipCountdown(timestamp, now = Date.now()) {
    const seconds = Math.max(0, Math.ceil((timestamp - now) / 1000));
    const days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60), rest = seconds % 60;
    return [days ? `${days}d` : '', `${String(hours).padStart(2,'0')}h`, `${String(minutes).padStart(2,'0')}m`, `${String(rest).padStart(2,'0')}s`].filter(Boolean).join(' ');
  }
  function nextDailyResetAt(now = Date.now()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone:'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(now));
    const value = (type) => Number(parts.find((part) => part.type === type)?.value) || 0;
    return Date.UTC(value('year'), value('month') - 1, value('day') + 1, 3);
  }
  function championshipProgressKey(nickname = rankNickname()) { return championshipProgressPrefix + encodeURIComponent(nickname || 'jogador'); }
  function emptyChampionshipProgress(nickname = rankNickname()) {
    return { nickname:nickname || 'jogador', missionDate:saoPauloDateKey(), kills:0, waves:0, score:0, claimed:[], cvCoins:0, unlockedShips:[], bonusDate:'' };
  }
  function readChampionshipProgress(nickname = rankNickname()) {
    const fallback = emptyChampionshipProgress(nickname);
    try {
      const saved = JSON.parse(localStorage.getItem(championshipProgressKey(nickname)) || 'null');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback;
      const savedCoins = Object.prototype.hasOwnProperty.call(saved, 'cvCoins')
        ? Number(saved.cvCoins)
        : Number(saved.tickets || 0) * 50;
      const walletCoins = window.CV_GAMES_WALLET?.getBalance?.(nickname) || 0;
      return {
        ...fallback, ...saved, nickname:nickname || 'jogador',
        kills:Math.max(0, Math.min(10, Math.floor(Number(saved.kills) || 0))),
        waves:Math.max(0, Math.min(3, Math.floor(Number(saved.waves) || 0))),
        score:Math.max(0, Math.min(5000, Math.floor(Number(saved.score) || 0))),
        cvCoins:Math.max(0, Math.min(10000000, Math.floor(Math.max(Number(savedCoins) || 0, Number(walletCoins) || 0)))),
        claimed:Array.isArray(saved.claimed) ? saved.claimed.filter((id) => championshipMissions.some((mission) => mission.id === id)) : [],
        unlockedShips:isTestProfile(nickname) ? [] : Array.isArray(saved.unlockedShips) ? saved.unlockedShips.filter((id) => championshipRewardShipIds.includes(id)) : []
      };
    } catch { return fallback; }
  }
  function campaignShipUnlockKey(nickname = rankNickname()) { return championshipProgressPrefix + 'ships:' + encodeURIComponent(nickname || 'jogador'); }
  function readCampaignShipUnlocks(nickname = rankNickname()) {
    if (isTestProfile(nickname)) {
      try { localStorage.removeItem(campaignShipUnlockKey(nickname)); } catch { /* Os desbloqueios de teste só existem nesta sessão. */ }
      return new Set(testProfileSessionShipUnlocks);
    }
    try { const ids = JSON.parse(localStorage.getItem(campaignShipUnlockKey(nickname)) || '[]'); return new Set(Array.isArray(ids) ? ids.filter((id) => championshipRewardShipIds.includes(id)) : []); }
    catch { return new Set(); }
  }
  function isCampaignShipUnlocked(shipId, nickname = rankNickname()) { return readCampaignShipUnlocks(nickname).has(shipId); }
  function saveCampaignShipUnlocks(ids, nickname = rankNickname()) {
    const safeIds = [...new Set(ids)].filter((id) => championshipRewardShipIds.includes(id));
    if (isTestProfile(nickname)) { testProfileSessionShipUnlocks = new Set(safeIds); return true; }
    try { localStorage.setItem(campaignShipUnlockKey(nickname), JSON.stringify(safeIds)); return true; } catch { return false; }
  }
  let championshipProgress = readChampionshipProgress();
  let championshipCloudSaveTimer = 0;
  let championshipCloudReady = false;
  function applyChampionshipProfileBonus(progress) {
    const nickname = normalizeRankNickname(progress.nickname || rankNickname());
    const hasProfileShip = skins.some((skin) => Array.isArray(skin.allowedProfiles) && skin.allowedProfiles.includes(nickname));
    if (hasProfileShip && progress.bonusDate !== progress.missionDate) {
      progress.kills = Math.min(10, progress.kills + 1);
      progress.waves = Math.min(3, progress.waves + 1);
      progress.score = Math.min(5000, progress.score + 250);
      progress.bonusDate = progress.missionDate;
    }
    return hasProfileShip;
  }
  function resetChampionshipDailyProgress(progress) {
    const today = saoPauloDateKey();
    if (progress.missionDate !== today) {
      progress.missionDate = today; progress.kills = 0; progress.waves = 0; progress.score = 0; progress.claimed = []; progress.bonusDate = '';
    }
    applyChampionshipProfileBonus(progress);
    return progress;
  }
  function writeChampionshipProgressLocal() {
    const nick = championshipProgress.nickname || rankNickname() || 'jogador';
    championshipProgress.nickname = nick;
    championshipProgress.unlockedShips = isTestProfile(nick)
      ? []
      : [...new Set([...(championshipProgress.unlockedShips || []), ...readCampaignShipUnlocks(nick)])];
    championshipProgress.cvCoins = Math.max(0, Math.min(10000000, Math.floor(Number(championshipProgress.cvCoins) || 0)));
    championshipProgress.coinVersion = 1;
    championshipProgress.tickets = 0;
    try { localStorage.setItem(championshipProgressKey(nick), JSON.stringify(championshipProgress)); } catch { /* O progresso da rodada continua nesta sessão. */ }
    window.CV_GAMES_WALLET?.setBalance?.(championshipProgress.cvCoins, nick);
  }
  function scheduleChampionshipCloudSave() {
    writeChampionshipProgressLocal();
    if (championshipCloudSaveTimer) clearTimeout(championshipCloudSaveTimer);
    championshipCloudSaveTimer = setTimeout(() => { championshipCloudSaveTimer = 0; void saveChampionshipProgressCloud(); }, 700);
  }
  async function championshipPilotNickname() {
    let session = null;
    try { session = await window.CV_GAMES_AUTH?.getOwnerSession?.() || null; } catch { session = null; }
    return authorizedNickname(session);
  }
  async function championshipHeaders(config, nickname) {
    if (nickname !== 'educvv') return supabaseHeaders(config);
    try {
      const session = await window.CV_GAMES_AUTH?.getOwnerSession?.();
      if (session?.access_token && window.CV_GAMES_AUTH?.isOwner?.(session.user)) return supabaseHeaders(config, session.access_token);
    } catch { /* Sem sessão de dono, o RLS rejeita corretamente o envio deste nick. */ }
    return supabaseHeaders(config);
  }
  async function saveChampionshipProgressCloud() {
    const config = supabaseConfig();
    if (!config || !championshipCloudReady || isTestProfile(championshipProgress.nickname) || Date.now() < championshipStartAt || Date.now() >= championshipEndAt) return;
    const nickname = await championshipPilotNickname();
    if (!nickname) return;
    const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_championship_progress';
    const row = {
      nickname, mission_date:championshipProgress.missionDate, kills:championshipProgress.kills,
      waves:championshipProgress.waves, score:championshipProgress.score, claimed:championshipProgress.claimed,
      tickets:0, cv_coins:championshipProgress.cvCoins, unlocked_ships:[...new Set([...(championshipProgress.unlockedShips || []), ...readCampaignShipUnlocks(nickname)])],
      bonus_date:championshipProgress.bonusDate || null, updated_at:new Date().toISOString()
    };
    try {
      const headers = await championshipHeaders(config, nickname);
      const response = await fetch(base + '?on_conflict=nickname', { method:'POST', headers:Object.assign({}, headers, { 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates,return=minimal' }), body:JSON.stringify(row), keepalive:true });
      if (!response.ok && championshipUi.sync) championshipUi.sync.textContent = 'Progresso salvo neste aparelho; sincronização do campeonato indisponível.';
    } catch { if (championshipUi.sync) championshipUi.sync.textContent = 'Progresso salvo neste aparelho; sem conexão com o campeonato.'; }
  }
  async function loadChampionshipProgress() {
    const nickname = rankNickname() || 'jogador';
    championshipProgress = readChampionshipProgress(nickname);
    resetChampionshipDailyProgress(championshipProgress);
    const config = supabaseConfig();
    const authorized = await championshipPilotNickname();
    championshipCloudReady = Boolean(config && authorized);
    if (config && authorized) {
      const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_championship_progress?select=nickname,mission_date,kills,waves,score,claimed,tickets,cv_coins,unlocked_ships,bonus_date&nickname=eq.' + encodeURIComponent(authorized) + '&limit=1';
      try {
        const response = await fetch(base, { headers:supabaseHeaders(config) });
        if (response.ok) {
          const remote = (await response.json())[0];
          if (remote) {
            const localDate = championshipProgress.missionDate;
            const remoteDate = String(remote.mission_date || '');
            const sameDay = remoteDate === localDate;
            championshipProgress = {
              ...championshipProgress, nickname:authorized,
              missionDate:localDate,
              kills:sameDay ? Math.max(championshipProgress.kills, Number(remote.kills) || 0) : championshipProgress.kills,
              waves:sameDay ? Math.max(championshipProgress.waves, Number(remote.waves) || 0) : championshipProgress.waves,
              score:sameDay ? Math.max(championshipProgress.score, Number(remote.score) || 0) : championshipProgress.score,
              claimed:sameDay ? [...new Set([...championshipProgress.claimed, ...(Array.isArray(remote.claimed) ? remote.claimed : [])])] : championshipProgress.claimed,
              cvCoins:Math.max(championshipProgress.cvCoins, Number(remote.cv_coins) || 0),
              unlockedShips:isTestProfile(authorized) ? [] : [...new Set([...championshipProgress.unlockedShips, ...(Array.isArray(remote.unlocked_ships) ? remote.unlocked_ships : [])])],
              bonusDate:sameDay ? String(remote.bonus_date || championshipProgress.bonusDate) : championshipProgress.bonusDate
            };
            saveCampaignShipUnlocks(championshipProgress.unlockedShips, authorized);
          }
          if (championshipUi.sync) championshipUi.sync.textContent = 'Progresso sincronizado para este apelido.';
        } else if (championshipUi.sync) championshipUi.sync.textContent = 'Migração do campeonato pendente; usando progresso deste aparelho.';
      } catch { if (championshipUi.sync) championshipUi.sync.textContent = 'Sem conexão; usando progresso deste aparelho.'; }
    } else if (championshipUi.sync) championshipUi.sync.textContent = 'Progresso salvo neste aparelho; o nick não publica no placar.';
    resetChampionshipDailyProgress(championshipProgress);
    writeChampionshipProgressLocal();
    renderSkinPicker(); updateEquippedShip(); updateHud();
    renderChampionshipMenu();
    await refreshChampionshipRanking();
  }
  function championshipRewardPool() {
    return championshipRewardShipIds
      .map((id) => skins.find((skin) => skin.id === id))
      .filter((skin) => skin && !isCampaignShipUnlocked(skin.id));
  }
  function renderChampionshipShip(skin, className = 'starfall-championship-ship-art') {
    const art = document.createElement('span');
    art.className = className;
    art.style.setProperty('--skin-color', skin.color);
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = hangarShipSvg(skin);
    return art;
  }
  function setChampionshipPrize(skin, revealed = false) {
    if (!championshipUi.prizeArt || !championshipUi.prizeName) return;
    championshipUi.prizeArt.replaceChildren();
    if (!skin) {
      championshipUi.prizeName.textContent = 'Todas as naves foram liberadas';
      if (championshipUi.prizeDetail) championshipUi.prizeDetail.textContent = 'Complete as missões para receber CV Coins e acompanhar as próximas recompensas.';
      if (championshipUi.prizeRarity) championshipUi.prizeRarity.textContent = 'HANGAR COMPLETO';
      return;
    }
    championshipUi.prizeArt.append(renderChampionshipShip(skin));
    championshipUi.prizeName.textContent = skin.name;
    if (championshipUi.prizeDetail) championshipUi.prizeDetail.textContent = revealed
      ? `${skin.ability || 'Nave especial'} · liberada no hangar.`
      : `${skin.ability || 'Nave especial'} · pode sair no sorteio.`;
    if (championshipUi.prizeRarity) championshipUi.prizeRarity.textContent = revealed ? 'NAVE DESBLOQUEADA' : 'NAVE DE RECOMPENSA';
  }
  function renderChampionshipWheel(pool, selectedIndex = null, force = false) {
    if (!championshipUi.wheel || championshipUi.wheel.dataset.spinning && !force) return;
    championshipUi.wheel.replaceChildren();
    championshipUi.wheel.classList.remove('is-spinning');
    if (!pool.length) {
      const empty = document.createElement('span');
      empty.className = 'starfall-championship-wheel-prompt';
      empty.textContent = 'Todas as naves sorteáveis já estão no seu hangar.';
      championshipUi.wheel.append(empty);
      setChampionshipPrize(null);
      return;
    }
    const colors = ['#173f9a', '#192b70', '#0f337f', '#252b79', '#123e79', '#1e347c', '#0e4687', '#282b75'];
    const slice = 360 / pool.length;
    const stops = pool.map((_, index) => `${colors[index % colors.length]} ${index * slice}deg ${(index + 1) * slice}deg`).join(', ');
    const rotor = document.createElement('div');
    rotor.className = 'starfall-championship-wheel-rotor';
    rotor.style.background = `conic-gradient(from -90deg, ${stops})`;
    pool.forEach((skin, index) => {
      const angle = index * slice + slice / 2;
      const sector = document.createElement('span');
      sector.className = 'starfall-championship-wheel-sector';
      sector.style.setProperty('--wheel-angle', `${angle}deg`);
      sector.style.setProperty('--wheel-counter-angle', `${-angle}deg`);
      sector.append(renderChampionshipShip(skin));
      const label = document.createElement('small'); label.textContent = skin.name;
      sector.append(label);
      rotor.append(sector);
    });
    championshipUi.wheel.append(rotor);
    if (selectedIndex !== null && selectedIndex >= 0 && selectedIndex < pool.length) {
      const stopAt = 360 * 5 - (selectedIndex * slice + slice / 2);
      requestAnimationFrame(() => { rotor.style.transform = `rotate(${stopAt}deg)`; });
    }
  }
  function renderChampionshipMenu() {
    if (!championshipUi.modal || !championshipUi.missions) return;
    const now = Date.now();
    const testProfile = isTestProfile(championshipProgress.nickname);
    const open = testProfile || championshipIsOpenNow(now);
    const ended = !testProfile && now >= championshipEndAt;
    if (championshipUi.status) championshipUi.status.textContent = testProfile ? 'MODO DE TESTE · MISSÕES E ROLETA ATIVAS' : ended ? 'CAMPEONATO ENCERRADO' : open ? 'CAMPEONATO EM ANDAMENTO' : 'CAMPEONATO PREPARADO';
    if (championshipUi.countdown) championshipUi.countdown.textContent = testProfile
      ? 'Acesso liberado para testar as missões e a roleta. O perfil teste não entra no Top 10.'
      : ended
      ? `Encerrado em ${championshipEndDisplayDateTime()} · horário de Brasília`
      : open ? `Termina em ${championshipCountdown(championshipEndAt, now)} · ${championshipEndDisplayDateTime()}`
        : `Começa em ${championshipCountdown(championshipStartAt, now)} · ${championshipLocalDateTime(championshipStartAt)} (horário de Brasília)`;
    const hasBonus = applyChampionshipProfileBonus(championshipProgress);
    if (championshipUi.bonus) championshipUi.bonus.textContent = testProfile ? 'Perfil de teste: CV Coins infinitas; desbloqueios da roleta duram apenas até atualizar a página.' : hasBonus ? 'Bônus de perfil: +1 inimigo, +1 onda e +250 pontos de progresso por dia.' : 'As mesmas missões e recompensas ficam disponíveis para todos os pilotos.';
    const completedCount = championshipMissions.filter((mission) => championshipProgress.claimed.includes(mission.id)).length;
    const coinBalance = window.CV_GAMES_WALLET
      ? window.CV_GAMES_WALLET.getBalance(championshipProgress.nickname)
      : Math.max(0, Number(championshipProgress.cvCoins) || 0);
    championshipProgress.cvCoins = coinBalance;
    if (championshipUi.coins) championshipUi.coins.textContent = coinBalance.toLocaleString('pt-BR');
    if (championshipUi.progressCount) championshipUi.progressCount.textContent = `${completedCount}/${championshipMissions.length}`;
    if (championshipUi.progressBar) { championshipUi.progressBar.max = championshipMissions.length; championshipUi.progressBar.value = completedCount; }
    if (championshipUi.resetCountdown) championshipUi.resetCountdown.textContent = championshipCountdown(nextDailyResetAt(now), now);
    championshipUi.missions.replaceChildren(...championshipMissions.map((mission) => {
      const progress = Math.min(mission.target, Number(championshipProgress[mission.id]) || 0);
      const claimed = championshipProgress.claimed.includes(mission.id);
      const card = document.createElement('article');
      card.className = 'starfall-championship-mission' + (claimed ? ' is-complete' : '');
      const title = document.createElement('strong'); title.textContent = mission.title;
      const detail = document.createElement('small'); detail.textContent = testProfile ? 'Conte em qualquer partida do perfil de teste.' : mission.detail;
      const meter = document.createElement('progress'); meter.max = mission.target; meter.value = progress; meter.setAttribute('aria-label', `${mission.title}: ${progress} de ${mission.target}`);
      const label = document.createElement('span'); label.textContent = claimed ? `✓ concluída · +${mission.reward} CV Coins` : `${progress.toLocaleString('pt-BR')} / ${mission.target.toLocaleString('pt-BR')} ${mission.unit}`;
      const reward = document.createElement('span'); reward.className = 'starfall-championship-mission-reward';
      const coin = document.createElement('img'); coin.src = '../../img/cv-coin.png'; coin.alt = '';
      const amount = document.createElement('span'); amount.textContent = `+${mission.reward}`;
      reward.append(coin, amount);
      card.append(title, detail, meter, label, reward);
      return card;
    }));
    if (championshipUi.start) {
      championshipUi.start.disabled = !open;
      championshipUi.start.textContent = testProfile ? '▶ JOGAR MISSÃO DE TESTE' : ended ? 'CAMPEONATO ENCERRADO' : open ? '▶ JOGAR MISSÃO DO CAMPEONATO' : 'ABRE ÀS 00:00';
    }
    const pool = championshipRewardPool();
    const oneSpinCost = 50;
    const bundleCount = Math.min(10, pool.length);
    const bundleCost = Math.ceil(bundleCount * 45);
    const wheelIsSpinning = Boolean(championshipUi.wheel?.dataset.spinning);
    if (championshipUi.spin) {
      championshipUi.spin.disabled = !open || wheelIsSpinning || coinBalance < oneSpinCost || !pool.length;
      championshipUi.spin.textContent = pool.length ? `1 GIRO · ${oneSpinCost} CV COINS` : 'NENHUMA NAVE DISPONÍVEL';
      championshipUi.spin.hidden = ended;
    }
    if (championshipUi.spinBundle) {
      championshipUi.spinBundle.hidden = ended || bundleCount < 2;
      championshipUi.spinBundle.disabled = !open || wheelIsSpinning || bundleCount < 2 || coinBalance < bundleCost;
      championshipUi.spinBundle.textContent = bundleCount >= 2 ? `ATÉ ${bundleCount} GIROS · ${bundleCost} CV COINS` : 'SEM NAVES PARA GIRAR';
    }
    renderChampionshipWheel(pool);
    if (pool.length && !championshipUi.prizeRarity?.textContent.includes('DESBLOQUEADA')) setChampionshipPrize(pool[0]);
  }
  function updateChampionshipMission(metric, amount) {
    if ((!state.championshipRun && !isTestProfile()) || !championshipAccessOpen()) return;
    resetChampionshipDailyProgress(championshipProgress);
    const mission = championshipMissions.find((item) => item.id === metric);
    if (!mission || !Number.isFinite(Number(amount))) return;
    const before = Math.max(0, Number(championshipProgress[metric]) || 0);
    championshipProgress[metric] = Math.min(mission.target, before + Math.max(0, Number(amount)));
    const newlyCompleted = championshipMissions.filter((item) => !championshipProgress.claimed.includes(item.id) && championshipProgress[item.id] >= item.target);
    newlyCompleted.forEach((item) => {
      championshipProgress.claimed.push(item.id);
      championshipProgress.cvCoins = Math.min(10000000, (Number(championshipProgress.cvCoins) || 0) + item.reward);
      toast(`MISSÃO DIÁRIA CONCLUÍDA · +${item.reward} CV COINS`);
    });
    if (championshipProgress[metric] !== before || newlyCompleted.length) {
      scheduleChampionshipCloudSave();
      if (championshipUi.modal && !championshipUi.modal.hidden) renderChampionshipMenu();
    }
  }
  async function openChampionshipMenu() {
    if (!['intro','gameover'].includes(state.mode) || !championshipUi.modal) return;
    championshipUi.modal.hidden = false;
    syncAudioVisibility();
    await loadChampionshipProgress();
    championshipUi.modal.querySelector('[data-close-championship]')?.focus();
  }
  function closeChampionshipMenu() {
    if (!championshipUi.modal) return;
    championshipUi.modal.hidden = true;
    syncAudioVisibility();
    championshipUi.open?.focus({ preventScroll:true });
  }
  function beginChampionshipMission() {
    if (!championshipAccessOpen()) { renderChampionshipMenu(); return; }
    if (currentSkin().id === 'prisma') { toast('A PRISMA REAL NÃO CONTA NO CAMPEONATO · EQUIPE OUTRA NAVE'); return; }
    if (championshipUi.modal) championshipUi.modal.hidden = true;
    syncAudioVisibility();
    if (isGenericPlayerProfile() && !selectedPilotNickname) requestPilotNickname(() => openMissionSetup(false, true));
    else openMissionSetup(false, true);
  }
  async function spinChampionshipWheel(drawAll = false) {
    if (!championshipAccessOpen() || !championshipUi.wheel || championshipUi.wheel.dataset.spinning) return;
    const remaining = championshipRewardPool();
    if (!remaining.length) { renderChampionshipMenu(); return; }
    const drawCount = drawAll ? Math.min(10, remaining.length) : 1;
    const price = drawAll ? Math.ceil(drawCount * 45) : 50;
    const nickname = rankNickname() || championshipProgress.nickname;
    const wallet = window.CV_GAMES_WALLET;
    const balance = wallet ? wallet.getBalance(nickname) : Math.max(0, Number(championshipProgress.cvCoins) || 0);
    if (balance < price) { toast(`SALDO INSUFICIENTE · PRECISA DE ${price} CV COINS`); return; }
    if (wallet && !wallet.spendCoins(price, nickname)) { toast(`SALDO INSUFICIENTE · PRECISA DE ${price} CV COINS`); return; }
    championshipProgress.cvCoins = wallet ? wallet.getBalance(nickname) : balance - price;
    championshipProgress.nickname = nickname;
    championshipUi.wheel.dataset.spinning = '1';
    if (championshipUi.spin) championshipUi.spin.disabled = true;
    if (championshipUi.spinBundle) championshipUi.spinBundle.disabled = true;
    scheduleChampionshipCloudSave();
    const winners = [];
    for (let draw = 0; draw < drawCount && remaining.length; draw++) {
      const selectedIndex = Math.floor(Math.random() * remaining.length);
      const chosen = remaining[selectedIndex];
      renderChampionshipWheel(remaining, selectedIndex, true);
      await new Promise((resolve) => setTimeout(resolve, 3350));
      remaining.splice(selectedIndex, 1);
      const unlocked = readCampaignShipUnlocks(championshipProgress.nickname);
      unlocked.add(chosen.id);
      if (isTestProfile(championshipProgress.nickname)) {
        saveCampaignShipUnlocks(unlocked, championshipProgress.nickname);
      } else {
        championshipProgress.unlockedShips = [...new Set([...(championshipProgress.unlockedShips || []), chosen.id])];
        saveCampaignShipUnlocks(unlocked, championshipProgress.nickname);
      }
      winners.push(chosen);
      if (draw + 1 < drawCount && remaining.length) {
        renderChampionshipWheel(remaining, null, true);
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }
    delete championshipUi.wheel.dataset.spinning;
    renderSkinPicker(); updateEquippedShip(); updateControlUI();
    renderChampionshipMenu();
    const lastWinner = winners[winners.length - 1];
    setChampionshipPrize(lastWinner, true);
    if (championshipUi.result) championshipUi.result.textContent = winners.length === 1
      ? `${lastWinner.name} foi liberada e saiu da roleta. Custo: ${price} CV Coins.`
      : `${winners.length} naves liberadas sem repetição: ${winners.map((skin) => skin.name).join(', ')}. Custo: ${price} CV Coins.`;
    scheduleChampionshipCloudSave();
  }
  async function refreshChampionshipRanking() {
    if (!championshipUi.rank) return;
    const config = supabaseConfig();
    if (!config) { championshipUi.rank.textContent = 'Placar do campeonato indisponível até configurar o Supabase.'; return; }
    try {
      const url = config.url.replace(/\/$/, '') + '/rest/v1/starfall_championship_scores?select=nickname,wave,score,ship_name&order=wave.desc,score.desc,updated_at.asc&limit=10';
      const response = await fetch(url, { headers:supabaseHeaders(config) });
      if (!response.ok) throw new Error('Ranking do campeonato indisponível.');
      const rows = await response.json();
      championshipUi.rank.replaceChildren();
      if (!rows.length) { championshipUi.rank.textContent = 'Ainda não há resultados no campeonato.'; return; }
      rows.forEach((row, index) => {
        const item = document.createElement('li');
        const pilot = document.createElement('strong'); pilot.textContent = `${index + 1}. ${displayRankNickname(row.nickname)}`;
        const detail = document.createElement('span'); detail.textContent = `Onda ${row.wave} · ${Number(row.score).toLocaleString('pt-BR')} pts · ${row.ship_name || 'Nave'}`;
        item.append(pilot, detail); championshipUi.rank.append(item);
      });
    } catch { championshipUi.rank.textContent = 'Placar compartilhado aguardando a migração do campeonato no Supabase.'; }
  }
  let championshipScoreQueue = Promise.resolve();
  function queueChampionshipScore(run) {
    championshipScoreQueue = championshipScoreQueue.then(() => submitChampionshipScore(run)).then(() => refreshChampionshipRanking()).catch(() => {});
    return championshipScoreQueue;
  }
  async function submitChampionshipScore(run) {
    if (isTestProfile() || !championshipIsOpenNow() || run?.ship_id === 'prisma') return;
    const config = supabaseConfig();
    if (!config) return;
    const nickname = await championshipPilotNickname();
    if (!nickname) return;
    const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_championship_scores';
    const headers = await championshipHeaders(config, nickname);
    try {
      const read = await fetch(base + '?select=wave,score&nickname=eq.' + encodeURIComponent(nickname) + '&limit=1', { headers, keepalive:true });
      if (!read.ok) return;
      const previous = (await read.json())[0];
      const better = !previous || run.wave > previous.wave || (run.wave === previous.wave && run.score > previous.score);
      if (!better) return;
      const row = { nickname, wave:run.wave, score:run.score, elapsed_seconds:run.elapsed_seconds, ship_id:run.ship_id, ship_name:run.ship_name, updated_at:new Date().toISOString() };
      await fetch(base + '?on_conflict=nickname', { method:'POST', headers:Object.assign({}, headers, { 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates,return=minimal' }), body:JSON.stringify(row), keepalive:true });
    } catch { /* A missão continua mesmo se o placar estiver offline. */ }
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
  function abilityShipsTarget() { return skins.filter((skin) => !skin.noAbilities && !skin.hiddenFromHangar && (!skin.secret || isAllShipsProfile() || hasSecretShipAccess(skin))).length; }
  function isAllUpgradesProfile() { return profileNickname() === 'educvv dev1'; }
  function hasDeveloperPerks() { return isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun && state.adminNoCooldown; }
  function shipCooldownSummary(skin) {
    if (skin.id === 'training') return 'G Aríete · 4 placas · 5 Q + 3 E · sem recarga';
    if (skin.id === 'mahoraga') return 'E: escudo 3s, −70% · adapta tipos diferentes por 5 ondas, até −55%';
    if (skin.id === 'megumi') return 'Ritual Umbral · E 3 variações · 20s→15s · Q Mahoraga 5 ondas +1 vida · recarga 45s';
    if (skin.id === 'flamestorm') return 'Propulsão Infernal · E 18s→15s · dash 5s · Q 24s→18s · vórtice 5s';
    if (skin.id === 'vulture') return 'Tiros automáticos · Q 3s soma energia e sucata · E 3 cargas · G Ult com 8 sucatas';
    if (skin.id === 'saurion-primal') return 'E 40s · Q 40s · até 2 dinossauros diferentes por 22s';
    if (hasDeveloperPerks()) return 'sem recarga';
    if (skin.id === 'prisma') return 'E e Q configuráveis no Arquivo de Ecos (G) · recarga própria até 20s · missão fora do placar';
    if (skin.id === 'eclipse') return 'E 30s→25s com melhorias · Q Paradoxo Absoluto 26s→18s';
    if (skin.id === 'chronos') return 'E 22s · Q 24s→18s · ecos 70%→85% por 6→8s';
    if (skin.id === 'aurora') return 'E 22s · Q 24s→18s · 8→10 alvos por 7→9s · pulso até 3';
    if (skin.id === 'aegis') return 'E 30s→27s · 1 carga de escudo temporária por 9s · Q 36s→33s · 3→4 sentinelas por 5→6s';
    if (skin.id === 'redshift') return 'E 30s→25s · Q 28s→22s · duração do Q até 8s';
    if (skin.id === 'flashblade') return 'E 22s · Q 24s→18s · impulso 2,6× · rastros até 9s';
    if (skin.id === 'tempest') return 'E 30s · Q com 4→6 cargas · recarga total de 24s→18s após esgotar';
    if (skin.id === 'saurion') return 'E 2 cargas · recuperação de até 16s por carga · Q 3 cargas · ' + skin.cooldownQ + 's→24s por carga';
    return 'recarga ' + skin.cooldown + 's';
  }
  function skinUnlocked(skin) {
    if (skin.hiddenFromHangar) return false;
    if (isTestProfile() && championshipRewardShipIds.includes(skin.id)) return isCampaignShipUnlocked(skin.id);
    if (skin.profileRestricted) return hasSecretShipAccess(skin);
    if (isCampaignShipUnlocked(skin.id)) return true;
    if (skin.id === 'megumi') return hasSecretShipAccess(skin);
    if (skin.ownerOnly) return hasSecretShipAccess(skin);
    if (isAllShipsProfile()) return true;
    if (skin.secret) return hasSecretShipAccess(skin);
    if (accountShipProgressLoaded && accountUnlockedShipIds.has(skin.id)) return true;
    return isDeveloperProfile() || !skin.unlockWave || Math.max(readBestWave(), state.bestCompletedWave) >= skin.unlockWave;
  }
  function synchronizedShipId(value) {
    const id = value === 'mahoraga' ? 'megumi' : String(value || '');
    const skin = skins.find((item) => item.id === id);
    return skin && !skin.ownerOnly && !skin.hiddenFromHangar ? id : '';
  }
  function synchronizedSpecialShipIds(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(synchronizedShipId).filter((id) => {
      const skin = skins.find((item) => item.id === id);
      return skin?.secret && !skin.ownerOnly && !skin.profileRestricted;
    }))];
  }
  function readSkin(preferredId = '') {
    try {
      const savedId = preferredId || localStorage.getItem('cv-games-cv-starfall-skin');
      const id = savedId === 'mahoraga' ? 'megumi' : savedId === 'eclipse09' ? 'vulture' : savedId;
      if (savedId !== id && id) { try { localStorage.setItem('cv-games-cv-starfall-skin', id); } catch { /* A forma interna migra somente nesta sessão. */ } }
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
    if (state.megumiTransformed && ['megumi','prisma'].includes(state.megumiTransformSource)) return skins.find((skin) => skin.id === 'mahoraga');
    if (state.prismDispatchSkinId) {
      const dispatched = skins.find((skin) => skin.id === state.prismDispatchSkinId);
      if (dispatched) return dispatched;
    }
    const selected = skins.find((skin) => skin.id === state.selectedSkin);
    return selected && skinUnlocked(selected) ? selected : skins[0];
  }
  function megumiTechnique(id = state.megumiTechnique) { return megumiTechniques[id] || megumiTechniques.rabbits; }
  function rollMegumiTechnique(previousId = '') {
    const options = Object.keys(megumiTechniques).filter((id) => id !== previousId);
    return options[Math.floor(randomUnit('ability') * options.length)] || 'rabbits';
  }
  function megumiShadowCloakActive() { return state.megumiCloakTime > 0; }
  function vultureCloakActive() { return currentSkin().id === 'vulture' && state.vultureCloakTime > 0; }
  function prismChoiceParts(choice = state.prismAbilityChoices[state.prismAbilitySlot]) {
    const [shipId, key] = String(choice || 'aurora:e').split(':');
    return { shipId: skins.some((skin) => skin.id === shipId && !skin.noAbilities && !skin.hiddenFromHangar && (!skin.profileRestricted || skinUnlocked(skin))) ? shipId : 'aurora', key: key === 'q' ? 'q' : 'e' };
  }
  function prismChoiceName(choice = state.prismAbilityChoices[state.prismAbilitySlot]) {
    const { shipId, key } = prismChoiceParts(choice);
    const skin = skins.find((item) => item.id === shipId) || skins[0];
    return key === 'q' ? secondaryAbilityNames[shipId] : skin.ability;
  }
  function setPrismChoice(choice, slot = state.prismAbilitySlot) {
    if (!['e','q'].includes(slot)) return;
    const [shipId, key] = String(choice || '').split(':');
    if (!skins.some((skin) => skin.id === shipId && !skin.noAbilities && !skin.hiddenFromHangar && (!skin.profileRestricted || skinUnlocked(skin))) || !['e','q'].includes(key)) return;
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
  function mahoragaAdaptationActive() {
    const skin = currentSkin();
    const choice = prismChoiceParts(state.prismAbilityChoices.e);
    return skin.id === 'mahoraga' || (skin.id === 'prisma' && choice.shipId === 'mahoraga' && choice.key === 'e');
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
      if (skin.hiddenFromHangar || skin.id === 'prisma') return;
      if (isTestProfile() && championshipRewardShipIds.includes(skin.id)) return;
      const unlocked = skin.profileRestricted ? hasSecretShipAccess(skin) : skin.ownerOnly ? hasSecretShipAccess(skin) : isAllShipsProfile()
        || (skin.secret ? hasSecretShipAccess(skin)
          : isDeveloperProfile() || !skin.unlockWave || bestWave >= skin.unlockWave);
      if (unlocked) result.add(skin.id);
    });
    return result;
  }
  function clearAccountShipProgress() {
    accountUnlockedShipIds = new Set();
    accountShipProgressLoaded = false;
    prismaAccountAuthorized = false;
    state.bestCompletedWave = readBestWave();
    state.selectedSkin = readSkin();
    if (state.selectedSkin === 'prisma') {
      state.selectedSkin = 'aurora';
      try { localStorage.setItem('cv-games-cv-starfall-skin', 'aurora'); } catch { /* A nave inicial vale nesta sessão. */ }
    }
    renderSkinPicker(); updateEquippedShip(); updateHud();
  }
  async function persistAccountShipProgress() {
    if (!accountShipProgressLoaded || !window.CV_GAMES_AUTH?.client) return;
    accountShipWriteChain = accountShipWriteChain.then(async () => {
      const session = await window.CV_GAMES_AUTH.getOwnerSession();
      if (!session?.user?.id) return;
      accountUnlockedShipIds = new Set([...accountUnlockedShipIds, ...unlockedShipsAtWave(Math.max(readBestWave(), state.bestCompletedWave))]);
      if (hasSecretShipAccess(skins.find((skin) => skin.id === 'flamestorm'))) accountUnlockedShipIds.add('flamestorm');
      const unlockedCodes = [...accountUnlockedShipIds].filter((id) => {
        const ship = skins.find((skin) => skin.id === id);
        return ship && !ship.hiddenFromHangar && !ship.ownerOnly;
      }).map((id) => shipCodeById[id]).filter(Number.isInteger).sort((a, b) => a - b);
      const selectedCode = currentSkin().ownerOnly ? 1 : shipCodeById[state.selectedSkin] || 1;
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
    prismaAccountAuthorized = profileNickname() === 'educvv';
    try {
      const { data, error } = await auth.client.from('starfall_profiles')
        .select('unlocked_ships,selected_ship,best_completed_wave')
        .eq('user_id', session.user.id).maybeSingle();
      if (error) throw error;
      const cloudIds = new Set((data?.unlocked_ships || []).map((code) => shipIdByCode[Number(code)]).filter((id) => {
        const ship = skins.find((skin) => skin.id === id);
        return ship && !ship.hiddenFromHangar && (!ship.ownerOnly || hasSecretShipAccess(ship)) && (!ship.profileRestricted || hasSecretShipAccess(ship));
      }));
      const bestWave = Math.max(readBestWave(), state.bestCompletedWave, Number(data?.best_completed_wave) || 0);
      saveNicknameCompletedWave('educvv', Number(data?.best_completed_wave) || 0);
      state.bestCompletedWave = bestWave;
      accountShipProgressLoaded = true;
      accountUnlockedShipIds = new Set([...cloudIds, ...unlockedShipsAtWave(bestWave)]);
      if (hasSecretShipAccess(skins.find((skin) => skin.id === 'flamestorm'))) accountUnlockedShipIds.add('flamestorm');
      const rawCloudSelected = data ? shipIdByCode[Number(data.selected_ship)] : '';
      const cloudSelected = rawCloudSelected === 'mahoraga' ? 'megumi' : rawCloudSelected;
      const localSelected = state.selectedSkin;
      state.selectedSkin = cloudSelected && (accountUnlockedShipIds.has(cloudSelected) || cloudSelected === 'prisma' && hasSecretShipAccess(skins.find((skin) => skin.id === 'prisma')))
        ? cloudSelected
        : accountUnlockedShipIds.has(localSelected) || localSelected === 'prisma' && hasSecretShipAccess(skins.find((skin) => skin.id === 'prisma')) ? localSelected : 'aurora';
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
  function bastiaoShipSvg(color, accent) {
    return '<svg class="starfall-redshift-ship-sprite" viewBox="0 0 48 54" aria-hidden="true" focusable="false">'
      + '<path d="M24 2.3 L32.12 15.32 L41.36 22.32 L35.2 34.92 L27.78 30.72 L24 38.28 L20.22 30.72 L12.8 34.92 L6.64 22.32 L15.88 15.32 Z" fill="' + color + '" stroke="' + accent + '" stroke-width="1.9" stroke-linejoin="round"/>'
      + '<ellipse cx="24" cy="22.88" rx="3.78" ry="7.28" fill="#f1ffff"/>'
      + '<path d="M18.12 32.12 L24 48 L29.88 32.12 Z" fill="' + accent + '"/>'
      + '</svg>';
  }

  function hangarShipSvg(skin) {
    if (skin.shape === 'training') {
      return '<svg class="starfall-hangar-ship-sprite starfall-ferrum-sprite" viewBox="448 212 532 594" aria-hidden="true" focusable="false">'
        + '<image href="ferrum-ship.png?v=2" x="0" y="0" width="1427" height="1102" preserveAspectRatio="none"/>'
        + '</svg>';
    }
    const points = {
      classic:[[0,-1.45],[.92,1],[0,.56],[-.92,1]],
      shield:[[0,-1.48],[1,-.15],[.72,.86],[0,1.08],[-.72,.86],[-1,-.15]],
      ring:[[0,-1.45],[.92,1],[0,.56],[-.92,1]],
      wing:[[0,-1.5],[.5,-.25],[1.25,.65],[.34,.42],[0,1],[-.34,.42],[-1.25,.65],[-.5,-.25]],
      blade:[[0,-1.65],[.34,-.22],[1.12,.8],[0,.43],[-1.12,.8],[-.34,-.22]]
    };
    const path = (points[skin.shape] || points.classic).map(([x,y],index) => `${index ? 'L' : 'M'}${(26 + x * 16).toFixed(2)} ${(30 + y * 16).toFixed(2)}`).join(' ') + ' Z';
    const ring = skin.shape === 'ring' ? '<ellipse cx="26" cy="30" rx="19.52" ry="9.28" fill="none" stroke="' + skin.accent + '" stroke-width="2"/>' : '';
    return '<svg class="starfall-hangar-ship-sprite" viewBox="0 0 52 60" aria-hidden="true" focusable="false">'
      + '<path d="' + path + '" fill="' + skin.color + '" stroke="' + skin.accent + '" stroke-width="2" stroke-linejoin="round"/>'
      + '<ellipse cx="26" cy="28.72" rx="4.32" ry="8.32" fill="#f1ffff"/>'
      + '<path d="M19.28 39.28 L26 52.4 L32.72 39.28 Z" fill="' + skin.accent + '"/>'
      + ring
      + '</svg>';
  }

  function updateEquippedShip() {
    if (!ui.equippedShip) return;
    const skin = currentSkin();
    ui.panel?.classList.toggle('is-vulture-hud', skin.id === 'vulture');
    ui.panel?.classList.toggle('is-aurora-hud', skin.id === 'aurora');
    ui.panel?.classList.toggle('is-ferrum-hud', skin.id === 'training');
    const silhouettes = { classic: 'M20 3 L34 35 L20 28 L6 35 Z', blade: 'M20 2 L24 16 L36 33 L20 27 L4 33 L16 16 Z', wing: 'M20 2 L25 16 L37 30 L25 27 L20 38 L15 27 L3 30 L15 16 Z', shield: 'M20 2 L32 17 L29 32 L20 37 L11 32 L8 17 Z', ring: 'M20 3 L34 35 L20 28 L6 35 Z', reflector: 'M20 2 L33 10 L37 23 L28 34 L20 38 L12 34 L3 23 L7 10 Z', prism: 'M20 2 L34 13 L30 31 L20 38 L10 31 L6 13 Z', training: 'M20 2 L25 12 L38 28 L29 27 L25 36 L20 32 L15 36 L11 27 L2 28 L15 12 Z', megumi:'M20 2 L27 15 L37 27 L27 25 L23 36 L20 31 L17 36 L13 25 L3 27 L13 15 Z', mahoraga: 'M20 10 L23 13 L30 14 L36 18 L33 22 L29 20 L28 26 L24 25 L22 33 L20 36 L18 33 L16 25 L12 26 L11 20 L7 22 L4 18 L10 14 L17 13 Z' };
    ui.equippedShip.style.setProperty('--skin-color', skin.color);
    const equippedIcon = skin.shape === 'eclipse'
      ? '<span class="starfall-equipped-icon starfall-eclipse-sprite" aria-hidden="true"></span>'
      : skin.shape === 'training' ? '<span class="starfall-equipped-icon starfall-training-icon starfall-ferrum-equipped-icon" aria-hidden="true">' + hangarShipSvg(skin) + '</span>'
      : skin.id === 'aurora' ? '<span class="starfall-equipped-icon starfall-aurora-icon" aria-hidden="true"><img src="aurora-ship.png" alt=""></span>'
      : skin.shape === 'saurion-primal' ? '<span class="starfall-equipped-icon starfall-saurion-icon" aria-hidden="true"><img src="saurion-frame-1.png" alt=""></span>'
      : skin.shape === 'dino' ? '<span class="starfall-equipped-icon starfall-dino-icon starfall-dino-image-wrap starfall-tigrum-icon" aria-hidden="true"><img src="tigrum-q-roar.png" alt=""></span>'
      : skin.shape === 'prism' ? '<span class="starfall-equipped-icon starfall-prism-icon" aria-hidden="true">◇</span>'
      : skin.shape === 'megumi' ? '<span class="starfall-equipped-icon starfall-umbra-icon" aria-hidden="true"><img src="umbra-ship.png" alt=""></span>'
      : skin.shape === 'flamestorm' ? '<span class="starfall-equipped-icon starfall-flamestorm-icon" aria-hidden="true"><img src="flamestorm-icon.png" alt=""></span>'
      : skin.shape === 'vulture' ? '<span class="starfall-equipped-icon starfall-vulture-icon" aria-hidden="true"><img src="vulture-ship.png" alt=""></span>'
      : skin.shape === 'mahoraga' ? '<span class="starfall-equipped-icon starfall-mahoraga-sprite" aria-hidden="true"><img src="mahoraga-ship.png" alt=""></span>'
      : skin.shape === 'reflector' ? '<span class="starfall-equipped-icon starfall-redshift-icon" aria-hidden="true">' + bastiaoShipSvg(skin.color,skin.accent) + '</span>'
      : '<svg class="starfall-equipped-icon' + (skin.shape === 'mahoraga' ? ' starfall-mahoraga-icon' : skin.shape === 'megumi' ? ' starfall-megumi-icon' : skin.shape === 'training' ? ' starfall-training-icon' : '') + '" viewBox="0 0 40 40" aria-hidden="true"><path d="' + silhouettes[skin.shape] + '" fill="' + skin.color + '" stroke="' + skin.accent + '" stroke-width="1.5"/><ellipse cx="20" cy="19" rx="3.3" ry="6" fill="#f1ffff"/><path d="M15 31 L20 38 L25 31" fill="' + skin.accent + '"/>' + (skin.shape === 'ring' ? '<ellipse cx="20" cy="21" rx="17" ry="8" fill="none" stroke="' + skin.accent + '" stroke-width="1.2"/>' : skin.shape === 'reflector' ? '<path d="M3 17 Q20 1 37 17" fill="none" stroke="' + skin.accent + '" stroke-width="2"/>' : skin.shape === 'mahoraga' ? '<circle cx="20" cy="5" r="5" fill="#2b343e" stroke="#e4c477" stroke-width="1.2"/><path d="M20 0V10M15 5H25M16.5 1.5L23.5 8.5M23.5 1.5L16.5 8.5" stroke="#f4ecdb" stroke-width=".9"/><circle cx="20" cy="5" r="1.5" fill="#e4c477"/>' : skin.shape === 'megumi' ? '<circle cx="20" cy="5" r="5" fill="#211a2f" stroke="#c4b2e8" stroke-width="1"/><path d="M20 0V10M15 5H25M16.5 1.5L23.5 8.5M23.5 1.5L16.5 8.5" stroke="#eee6ff" stroke-width=".7"/><circle cx="20" cy="5" r="1.5" fill="#c4b2e8"/>' : '') + '</svg>';
    ui.equippedShip.innerHTML = equippedIcon + '<span><strong>Nave equipada: ' + skin.name + '</strong><small>' + (skin.noAbilities ? 'Casco reforçado · ' : skin.ability + ' · ') + shipCooldownSummary(skin) + '</small></span>';
    updateEclipseSkipOption();
    updateAbilityButton();
    updateAuroraUltHud();
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
      selectedShip: synchronizedShipId(saved?.selectedShip),
      unlockedSecretShips: synchronizedSpecialShipIds(saved?.unlockedSecretShips),
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
        selectedShip: synchronizedShipId(state.selectedSkin),
        unlockedSecretShips: synchronizedSpecialShipIds([...secretShipUnlocks]),
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
  function applyNicknameShipSettings(nickname, selectedShip, unlockedShips) {
    const remoteUnlocks = synchronizedSpecialShipIds(unlockedShips);
    const mergedUnlocks = new Set([...secretShipUnlocks, ...remoteUnlocks]);
    if (mergedUnlocks.size !== secretShipUnlocks.size) {
      secretShipUnlocks = mergedUnlocks;
      saveSecretShipUnlocks(nickname);
    }
    const id = synchronizedShipId(selectedShip);
    const skin = skins.find((item) => item.id === id);
    if (!skin || !skinUnlocked(skin)) return;
    state.selectedSkin = id;
    try { localStorage.setItem('cv-games-cv-starfall-skin', id); } catch { /* A escolha fica nesta sessão. */ }
    renderSkinPicker(); updateEquippedShip(); updateControlUI(); updateHud();
  }
  function settingsNicknameIsAllowed(nickname) {
    const names = (window.CV_STARFALL_SUPABASE?.settingsNicknames || window.CV_STARFALL_SUPABASE?.allowedNicknames || []).map(normalizeRankNickname);
    return Boolean(nickname && names.includes(normalizeRankNickname(nickname)));
  }
  function updateSettingsSyncStatus(message) {
    if (ui.settingsSyncStatus) ui.settingsSyncStatus.textContent = message;
  }
  function isMissingShipSettingsColumns(error) {
    return Boolean(error && (error.code === '42703' || error.code === 'PGRST204'
      || /selected_ship|unlocked_special_ships/i.test(String(error.message || error.details || ''))));
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
    const selectedShip = synchronizedShipId(state.selectedSkin);
    if (selectedShip) payload.selected_ship = selectedShip;
    payload.unlocked_special_ships = synchronizedSpecialShipIds([...secretShipUnlocks]);
    writeNicknameSettingsLocally(nickname);
    if (!settingsNicknameIsAllowed(normalizedNickname) || !window.CV_GAMES_AUTH?.client) {
      updateSettingsSyncStatus('Preferências salvas neste aparelho.');
      return Promise.resolve();
    }
    updateSettingsSyncStatus('Sincronizando preferências do perfil…');
    settingsSyncChain = settingsSyncChain.then(async () => {
      const auth = window.CV_GAMES_AUTH;
      if (normalizedNickname === 'educvv' && !(await auth.getOwnerSession())?.user?.id) throw new Error('A conta educvv precisa estar conectada.');
      let { error } = await auth.client.from('starfall_settings').upsert(payload, { onConflict:'nickname' });
      if (error && isMissingShipSettingsColumns(error)) {
        const legacyPayload = { ...payload };
        delete legacyPayload.selected_ship;
        delete legacyPayload.unlocked_special_ships;
        ({ error } = await auth.client.from('starfall_settings').upsert(legacyPayload, { onConflict:'nickname' }));
      }
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
    applyNicknameShipSettings(nickname, local.selectedShip, local.unlockedSecretShips);
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
      let { data, error } = await window.CV_GAMES_AUTH.client.from('starfall_settings')
        .select('damage_counter_enabled,damage_counter_x,damage_counter_y,eclipse_skip_video,control_mode,performance_mode,setup_complete,selected_ship,unlocked_special_ships')
        .eq('nickname', normalizedNickname).maybeSingle();
      if (error && isMissingShipSettingsColumns(error)) {
        ({ data, error } = await window.CV_GAMES_AUTH.client.from('starfall_settings')
          .select('damage_counter_enabled,damage_counter_x,damage_counter_y,eclipse_skip_video,control_mode,performance_mode,setup_complete')
          .eq('nickname', normalizedNickname).maybeSingle());
      }
      if (error) throw error;
      if (profileNickname() !== normalizedNickname || settingsMutationRevision !== revision) return;
      if (!data) { saveNicknameSettings(); return; }
      applyNicknameShipSettings(nickname, data.selected_ship, data.unlocked_special_ships);
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
    updateFerrumHud();
    document.body.dataset.cvStarfallState = mode;
    document.documentElement.classList.toggle('cv-game-active', ['playing', 'paused', 'upgrade', 'gameover'].includes(mode));
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
    updateAuroraUltHud();
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
    updateFerrumHud();
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
    updateVultureChargeMeter();
    updateVultureScrapHud();
    updateAuroraUltHud();
  }
  function updateVultureChargeMeter() {
    if (!ui.vultureChargeMeter) return;
    const isVulture = currentSkin().id === 'vulture';
    const visible = isVulture && ['playing','paused','upgrade'].includes(state.mode);
    const charge = clamp((state.vultureCannonCharge || 0) / VULTURE_CANNON_CHARGE_SECONDS, 0, 1);
    const scrapBoost = state.vultureScrap >= 8 && state.vultureOverloadCountdown > 0;
    const percent = Math.floor(charge * 100);
    ui.vultureChargeMeter.hidden = !visible;
    ui.vultureChargeMeter.style.setProperty('--cannon-charge', (charge * 100) + '%');
    ui.vultureChargeMeter.classList.toggle('is-ready', charge >= .99);
    ui.vultureChargeMeter.classList.toggle('is-scrap-boosted', scrapBoost);
    ui.vultureChargeMeter.setAttribute('aria-valuenow', String(percent));
    if (ui.vultureChargeLabel) ui.vultureChargeLabel.textContent = (charge >= .99 ? 'ENERGIA DO Q · 100%' : 'ENERGIA DO Q · ' + percent + '%') + (scrapBoost ? ' · 8 SUCATAS' : '');
    ui.vultureChargeMeter.setAttribute('aria-label', 'Energia acumulada para o Q: ' + percent + '%' + (scrapBoost ? ' · as 8 sucatas também aumentam o dano' : ''));
  }
  function updateVultureScrapHud() {
    if (!ui.vultureScrapHud) return;
    const isVulture = currentSkin().id === 'vulture';
    const show = isVulture && ['playing','paused','upgrade'].includes(state.mode);
    ui.vultureScrapHud.hidden = !show;
    if (!show) return;
    const count = Math.min(8, state.vultureScrap || 0);
    const overloadShot = state.vultureOverloadTime > 0;
    const vulnerable = state.vultureVulnerableTime > 0;
    const countdownActive = count >= 8 && state.vultureOverloadCountdown > 0;
    const countdownSeconds = Math.ceil(state.vultureOverloadCountdown);
    const overloaded = overloadShot || vulnerable;
    const shownCount = overloadShot ? 8 : count;
    ui.vultureScrapCount.textContent = shownCount + '/8';
    ui.vultureScrapFill.style.width = (shownCount / 8 * 66) + '%';
    ui.vultureScrapLabel.textContent = state.vultureUltPhase === 'power' ? 'FORMA ASCENDENTE · ' + Math.ceil(state.vultureUltPowerTime) + 's' : state.vultureUltPhase === 'collapse' ? 'COLAPSO FINAL · ' + Math.ceil(state.vultureEvolutionTime) + 's' : overloadShot ? 'SOBRECARGA · DISPARO' : vulnerable ? 'NÚCLEO VULNERÁVEL' : countdownActive ? 'ULT OU DISPARO EM ' + countdownSeconds + 's' : count >= 6 ? 'NÚCLEO CARREGANDO' : 'SUCATA · Q DUPLO USA / SEGURE ABSORVE';
    const timer = ui.vultureScrapHud.querySelector('[data-vulture-scrap-timer]');
    if (timer) { timer.hidden = !countdownActive; timer.textContent = countdownActive ? countdownSeconds + 's' : ''; }
    ui.vultureScrapHud.setAttribute('aria-label', 'Sucata da Vulture: ' + count + ' de 8 · ' + ui.vultureScrapLabel.textContent);
    ui.vultureScrapHud.classList.toggle('is-overloaded', overloaded);
    ui.vultureScrapHud.classList.toggle('is-countdown', countdownActive);
    ui.vultureScrapHud.classList.toggle('is-charged', count >= 6 && !overloaded);
    ui.stage?.classList.toggle('starfall-vulture-overloaded', overloaded);
    if (ui.vultureUlt) {
      const ultVisible = isVulture && count >= 8 && state.vultureOverloadCountdown > 0 && state.vultureEvolutionTime <= 0 && state.vultureOverloadTime <= 0;
      ui.vultureUlt.hidden = !ultVisible;
      ui.vultureUlt.disabled = !ultVisible || state.mode !== 'playing';
      ui.vultureUlt.classList.toggle('is-ready', ultVisible && state.mode === 'playing');
      ui.vultureUlt.setAttribute('aria-label', 'Ativar Devoradora de Estrelas · gastar 8 sucatas · forma ativa por 10 segundos e campo final por 6 segundos · tecla G');
    }
  }
  function updateFerrumHud() {
    const visible = currentSkin().id === 'training' && state.mode === 'playing';
    ui.ferrumMeter.hidden = !visible;
    const chargedUses = state.ferrumRamCharges > 0;
    const transformed = Boolean(state.ferrumRam);
    const ready = state.ferrumPressure >= FERRUM_MAX_PRESSURE;
    ui.ferrumUlt.hidden = !(visible && !chargedUses && !transformed && ready);
    ui.ferrumUlt.disabled = ui.ferrumUlt.hidden;
    if (!visible) return;
    const plates = transformed ? 4 : Math.floor(state.ferrumPressure / FERRUM_PLATE_DAMAGE);
    ui.ferrumPlates.forEach((plate, index) => plate.classList.toggle('is-lit', index < plates));
    const readout = transformed
      ? state.ferrumRam?.phase === 'dash'
        ? 'FORMA ATIVA · INVESTIDA · ' + state.ferrumRamCharges + '/' + FERRUM_RAM_USES + ' Q · E ' + state.ferrumECharges + '/' + FERRUM_E_USES
        : 'FORMA ATIVA · ' + state.ferrumRamCharges + '/' + FERRUM_RAM_USES + ' Q · E ' + state.ferrumECharges + '/' + FERRUM_E_USES
      : 'Pressão ' + plates + '/4';
    if (ui.ferrumReadout.textContent !== readout) ui.ferrumReadout.textContent = readout;
    ui.ferrumUlt.title = 'G · Ativar forma do Aríete de Aço · 5 investidas Q e 3 Contrachoques E';
    ui.ferrumUlt.setAttribute('aria-label', 'Ativar forma do Aríete de Aço · 5 investidas Q e 3 Contrachoques E');
  }
  function ferrumReferenceTargetHealth(enemy) {
    if (enemy?.kind === 'boss') return enemy.isMiniBoss ? 7 : 18;
    return ({ meteor:2, drone:3, hunter:3, brute:8, ricochet:4 })[enemy?.kind] || 3;
  }
  function addFerrumPressure(amount, enemy = null) {
    if (currentSkin().id !== 'training' || state.mode !== 'playing' || state.ferrumRam || state.ferrumRamCharges > 0 || state.ferrumPressure >= FERRUM_MAX_PRESSURE || amount <= 0) return;
    const previousPlates = Math.floor(state.ferrumPressure / FERRUM_PLATE_DAMAGE);
    const targetHealth = Math.max(1, enemy?.maxHp || enemy?.hp || 1);
    const normalizedDamage = enemy ? amount * ferrumReferenceTargetHealth(enemy) / targetHealth : amount;
    const pressureGain = normalizedDamage * (1 + Math.min(3, upgradeLevel('ferrumCharge')) * .2);
    state.ferrumPressure = Math.min(FERRUM_MAX_PRESSURE, state.ferrumPressure + pressureGain);
    if (Math.floor(state.ferrumPressure / FERRUM_PLATE_DAMAGE) !== previousPlates) {
      updateFerrumHud();
      if (state.ferrumPressure === FERRUM_MAX_PRESSURE) toast('ARÍETE DE AÇO · G DISPONÍVEL');
    }
  }
  function updateAuroraUltHud() {
    const isAurora = currentSkin().id === 'aurora';
    const show = isAurora && ['playing','paused','upgrade'].includes(state.mode);
    if (ui.auroraUltMeter) ui.auroraUltMeter.hidden = !show;
    if (!show) {
      if (ui.auroraUlt) ui.auroraUlt.hidden = true;
      return;
    }
    const charge = clamp(state.auroraUltCharge || 0, 0, 6);
    const active = Boolean(state.auroraUlt);
    const ready = charge >= 6 && !active;
    const buttonVisible = ready || active;
    ui.auroraUltSegments.forEach((segment, index) => {
      const fill = clamp(charge - index, 0, 1);
      segment.style.setProperty('--charge-fill', (fill * 100) + '%');
      segment.classList.toggle('is-filled', fill >= 1);
      segment.classList.toggle('is-partial', fill > 0 && fill < 1);
    });
    const chargeText = Number.isInteger(charge) ? String(charge) : charge.toFixed(1).replace('.', ',');
    if (ui.auroraUltCount) ui.auroraUltCount.textContent = chargeText + '/6';
    ui.auroraUltMeter?.classList.toggle('is-charged', ready);
    ui.auroraUltMeter?.classList.toggle('is-active', active);
    if (ui.auroraUlt) {
      ui.auroraUlt.hidden = !buttonVisible;
      ui.auroraUlt.disabled = !ready || active || state.mode !== 'playing';
      ui.auroraUlt.classList.toggle('is-ready', ready && state.mode === 'playing');
      ui.auroraUlt.classList.toggle('is-active', active);
      ui.auroraUlt.setAttribute('aria-label', active ? 'Coroa da Hipernova ativa · ' + Math.ceil(state.auroraUlt.life) + ' segundos restantes' : ready ? 'Ativar Coroa da Hipernova · tecla G' : 'Coroa da Hipernova · carga ' + chargeText + ' de 6');
      const activeMarks = active ? state.auroraUlt.markedTargets.filter((entry) => entry.enemy && !entry.enemy.dead && entry.expiresAt > state.elapsed).length : 0;
      ui.auroraUlt.title = active ? 'Coroa da Hipernova · ' + Math.ceil(state.auroraUlt.life) + 's restantes · ' + state.auroraUlt.constellationTargets.length + ' inimigos ligados · ' + activeMarks + ' marcados · use E para convergir as estrelas' : ready ? 'G · Coroa da Hipernova · liga todos os inimigos por 8 segundos; finalize com E ou aguarde a hipernova' : 'Coroa da Hipernova · tiros básicos carregam lentamente; Q e E carregam mais';
    }
  }
  function updateMahoragaFormControls() {
    const active = state.megumiTransformed && ['playing', 'paused', 'upgrade'].includes(state.mode);
    if (ui.megumiFormTimer) {
      ui.megumiFormTimer.hidden = !active;
      const waves = Math.max(0, state.megumiFormWavesRemaining);
      const label = 'MAHORAGA · ' + waves + (waves === 1 ? ' ONDA RESTANTE' : ' ONDAS RESTANTES') + ' · VOLTAR: G';
      if (active && ui.megumiFormTimer.textContent !== label) ui.megumiFormTimer.textContent = label;
    }
    if (ui.mahoragaReturn) {
      ui.mahoragaReturn.hidden = !active;
      ui.mahoragaReturn.disabled = !active;
      ui.mahoragaReturn.setAttribute('aria-pressed', String(active));
      ui.mahoragaReturn.setAttribute('aria-label', active ? 'Voltar para a nave normal antes do limite de cinco ondas · tecla G' : 'Voltar para a nave normal');
    }
  }
  function updateAbilityButton() {
    updateMahoragaFormControls();
    const skin = currentSkin();
    if (ui.mahoragaReadout) {
      const showMahoragaReadout = mahoragaAdaptationActive() && ['playing', 'paused'].includes(state.mode);
      ui.mahoragaReadout.hidden = !showMahoragaReadout;
      if (showMahoragaReadout) {
        const type = state.mahoragaLastType;
        const progress = type ? state.mahoragaProgress[type] || 0 : 0;
        const adaptations = activeMahoragaAdaptations().map((adaptedType) => mahoragaAttackName(adaptedType) + ' −' + Math.round(mahoragaResistanceFor(adaptedType) * 100) + '% · O' + (state.mahoragaAdaptationWaves[adaptedType] + 4)).join(' | ');
        const resistance = adaptations ? ' · ADAPTADO: ' + adaptations : '';
        const shield = state.mahoragaParryWindow > 0 ? ' · ESCUDO −70% ' + Math.ceil(state.mahoragaParryWindow) + 's' : '';
        const progressCopy = type ? ' · ' + mahoragaAttackName(type) + ' ' + progress + '/5' : '';
        const wheel = state.mahoragaWheelReady ? 'RODA COMPLETA · PRÓXIMO E ESPECIAL' : 'RODA ' + state.mahoragaWheelSegments + '/8';
        const duplicateBuff = state.mahoragaDuplicateBuffTime > 0 ? ' · DANO +' + Math.round(state.mahoragaDuplicateBuffBonus * 100) + '% ' + Math.ceil(state.mahoragaDuplicateBuffTime) + 's' : '';
        const copy = wheel + progressCopy + resistance + shield + duplicateBuff;
        if (ui.mahoragaReadout.textContent !== copy) ui.mahoragaReadout.textContent = copy;
      }
    }
    if (ui.damageCounterCheckbox) ui.damageCounterCheckbox.checked = state.damageCounterEnabled;
    const inMission = ['playing', 'paused', 'upgrade'].includes(state.mode);
    if (ui.fireToggle) {
      ui.fireToggle.hidden = !inMission;
      ui.fireToggle.setAttribute('aria-pressed', String(state.automaticFireEnabled));
      ui.fireToggle.textContent = state.automaticFireEnabled ? '✦ AUTO' : '✦ TIROS OFF';
      ui.fireToggle.title = state.automaticFireEnabled ? 'Desativar disparo automático · tecla R' : 'Ativar disparo automático · tecla R';
      ui.fireToggle.setAttribute('aria-label', ui.fireToggle.title);
    }
    updateVultureChargeMeter();
    if (ui.prismSelectWrap) ui.prismSelectWrap.hidden = skin.id !== 'prisma' || !['playing','paused'].includes(state.mode);
    if (skin.noAbilities) {
      if (ui.prismSelectWrap) ui.prismSelectWrap.hidden = true;
      const ferrumActive = skin.id === 'training' && Boolean(state.ferrumRam) && (state.ferrumRamCharges > 0 || state.ferrumRam.phase === 'dash');
      const showFerrumQ = ferrumActive && ['playing', 'paused'].includes(state.mode);
      const showFerrumE = skin.id === 'training' && ((ferrumActive && state.ferrumECharges > 0) || Boolean(state.ferrumCountershock)) && ['playing', 'paused'].includes(state.mode);
      if (ui.abilityWrap) ui.abilityWrap.hidden = !showFerrumE;
      if (ui.abilityCooldown) {
        ui.abilityCooldown.textContent = state.ferrumCountershock ? Math.ceil(state.ferrumCountershock.time) + 's' : state.ferrumECharges + '/' + FERRUM_E_USES;
        ui.abilityCooldown.hidden = !showFerrumE;
      }
      if (ui.ability) {
        ui.ability.classList.remove('is-mahoraga','is-megumi','is-flamestorm','is-vulture','is-saurion-primal');
        ui.ability.classList.toggle('is-ferrum', showFerrumE);
        ui.ability.style.setProperty('--ship-color', skin.color);
        ui.ability.style.setProperty('--ship-accent', skin.accent);
        ui.ability.textContent = '⬡';
        ui.ability.disabled = !showFerrumE || state.mode !== 'playing' || !ferrumActive || state.ferrumRam?.phase !== 'transformed' || state.ferrumECharges <= 0 || Boolean(state.ferrumCountershock);
        ui.ability.setAttribute('aria-pressed', String(Boolean(state.ferrumCountershock)));
        const eLabel = state.ferrumCountershock
          ? 'Contrachoque ativo · ' + state.ferrumCountershock.blocked + '/3 tiros bloqueados · ' + state.ferrumECharges + '/' + FERRUM_E_USES + ' usos restantes · ' + Math.ceil(state.ferrumCountershock.time) + 's'
          : 'Contrachoque de Aço · ' + state.ferrumECharges + '/' + FERRUM_E_USES + ' usos · sem recarga';
        ui.ability.title = eLabel;
        ui.ability.setAttribute('aria-label', eLabel);
      }
      if (ui.eclipseQWrap) {
        ui.eclipseQWrap.hidden = !showFerrumQ;
        ui.eclipseQWrap.style.setProperty('--ship-color', skin.color);
        ui.eclipseQWrap.style.setProperty('--ship-accent', skin.accent);
      }
      if (ui.eclipseQ) {
        ui.eclipseQ.classList.remove('is-aurora','is-aegis','is-chronos','is-tigrum','is-saurion-primal','is-redshift','is-flashblade','is-tempest','is-mahoraga','is-megumi','is-flamestorm','is-vulture','is-prisma');
        ui.eclipseQ.classList.toggle('is-ferrum', showFerrumQ);
        ui.eclipseQ.textContent = '➤';
        ui.eclipseQ.disabled = !showFerrumQ || state.mode !== 'playing' || state.ferrumRam?.phase !== 'transformed' || state.ferrumRamCharges <= 0;
        ui.eclipseQ.setAttribute('aria-pressed', String(ferrumActive));
        const qLabel = state.ferrumRam?.phase === 'dash'
          ? 'Investida da Ferrum em andamento · ' + state.ferrumRamCharges + ' investidas restantes'
          : 'Aríete de Aço · lançar investida Q · ' + state.ferrumRamCharges + ' de 5 restantes';
        ui.eclipseQ.title = qLabel;
        ui.eclipseQ.setAttribute('aria-label', qLabel);
      }
      if (ui.eclipseQCooldown) {
        ui.eclipseQCooldown.textContent = state.ferrumRamCharges + '/5';
        ui.eclipseQCooldown.hidden = !showFerrumQ;
      }
      if (ui.eclipseQWrap && !showFerrumQ) ui.eclipseQ.classList.remove('is-ferrum');
      return;
    }
    if (skin.id === 'prisma') { updatePrismAbilityButton(); return; }
    const showAbility = ['playing', 'paused'].includes(state.mode);
    const isMahoraga = skin.id === 'mahoraga';
    const isMegumi = skin.id === 'megumi';
    const isFlameStorm = skin.id === 'flamestorm';
    const isVulture = skin.id === 'vulture';
    const isAurora = skin.id === 'aurora';
    const megumiE = megumiTechnique();
    const isSaurion = skin.id === 'saurion';
    const isPrimalSaurion = skin.id === 'saurion-primal';
    const isSaurionDevReplace = isPrimalSaurion && isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun;
    const saurionESummon = isPrimalSaurion ? saurionSummonForSlot('e') : null;
    const auroraRepulseWindow = isAurora && !state.auroraUlt && state.auroraUltCharge > 0 && state.auroraUltCharge < 6 && state.auroraEFirstTapAt > 0 && state.auroraEFirstTapCharge > 0 && state.auroraEFirstTapCharge < 6 && performance.now() - state.auroraEFirstTapAt <= AURORA_E_DOUBLE_TAP_MS;
    const ready = isMahoraga ? state.mahoragaParryCooldown <= 0 : isPrimalSaurion ? (state.saurionSummonCooldownE <= 0 || (isSaurionDevReplace && Boolean(saurionESummon))) && (!saurionESummon || isSaurionDevReplace) : isSaurion ? state.dinoRoarCharges > 0 : isVulture ? state.vultureFoldCharges > 0 && (state.vultureEvolutionTime <= 0 || vultureUltPowerActive()) : skin.id === 'aurora' ? state.abilityCooldown <= 0 || auroraRepulseWindow : state.abilityCooldown <= 0;
    const eclipseIntro = skin.id === 'eclipse' && state.eclipsePhase === 'cinematic';
    const eclipseActive = skin.id === 'eclipse' && state.eclipsePhase === 'active';
    const active = eclipseIntro || eclipseActive || (isMahoraga && state.mahoragaParryWindow > 0) || (isMegumi && state.megumiSummonPhase === 'cinematic') || (isFlameStorm && state.flameStormDash?.life > 0) || (isVulture && state.vultureCloakTime > 0) || Boolean(saurionESummon);
    if (ui.abilityWrap) ui.abilityWrap.hidden = !showAbility;
    if (ui.ability) {
      ui.ability.classList.remove('is-prisma');
      ui.ability.classList.remove('is-ferrum');
      ui.ability.classList.toggle('is-mahoraga', isMahoraga);
      ui.ability.classList.toggle('is-megumi', isMegumi);
      ui.ability.classList.toggle('is-flamestorm', isFlameStorm);
      ui.ability.classList.toggle('is-vulture', isVulture);
      ui.ability.classList.toggle('is-saurion-primal', isPrimalSaurion);
      ui.ability.style.setProperty('--ship-color', skin.color);
      ui.ability.style.setProperty('--ship-accent', skin.accent);
      ui.ability.style.setProperty('--ship-color-rgb', colorRgbTriplet(skin.color));
      ui.ability.style.setProperty('--ship-accent-rgb', colorRgbTriplet(skin.accent));
      ui.ability.disabled = state.mode !== 'playing' || eclipseIntro || eclipseActive || state.megumiSummonPhase === 'cinematic' || (isPrimalSaurion && !ready) || (isVulture && (vultureUltCollapseActive() || !ready)) || (!isVulture && !ready && !active);
      ui.ability.setAttribute('aria-pressed', String(active));
      if (isMahoraga) {
        if (ui.ability.firstChild !== mahoragaAdaptationIcon) ui.ability.replaceChildren(mahoragaAdaptationIcon);
      } else if (isFlameStorm) {
        ui.ability.textContent = flameStormBoostIcon;
      } else if (isPrimalSaurion) {
        ui.ability.textContent = '🐾';
      } else {
      ui.ability.textContent = isMegumi ? megumiE.icon : isVulture ? '⌖' : '✦';
      }
       ui.ability.setAttribute('aria-label', isVulture ? vultureUltCollapseActive() ? 'Dobra bloqueada durante o colapso final · ' + Math.ceil(state.vultureEvolutionTime) + 's' : vultureUltPowerActive() ? ready ? 'Propulsão Ascendente · E ampliado, causa dano ao atravessar inimigos · ' + state.vultureFoldCharges + ' usos · ' + Math.ceil(state.vultureUltPowerTime) + 's restantes' : 'Propulsão Ascendente recarregando: ' + Math.ceil(state.vultureFoldRecharge) + ' segundos' : state.vultureFoldCharges > 0 ? (active ? 'Camuflagem Cósmica ativa · ' : '') + 'Dobra Espacial · ' + state.vultureFoldCharges + ' de 3 usos restantes · tecla E' : 'Dobra Espacial recarregando: ' + Math.ceil(state.vultureFoldRecharge) + ' segundos' : isMahoraga ? state.mahoragaParryWindow > 0 ? 'Adaptação Divina ativa: escudo por ' + Math.ceil(state.mahoragaParryWindow) + ' segundos, reduz 70% do dano' : ready ? 'Ativar Adaptação Divina · escudo de 3 segundos e redução de 70% do dano · tecla E' : 'Adaptação Divina recarregando: ' + state.mahoragaParryCooldown.toFixed(1).replace('.', ',') + ' segundos' : isMegumi ? state.megumiSummonPhase === 'cinematic' ? 'Ritual de Mahoraga em andamento' : 'Próxima variação de E: ' + megumiE.name + ' · ' + megumiE.description + ' · tecla E' : isFlameStorm ? state.flameStormDash?.life > 0 ? 'Propulsão Infernal ativa por ' + state.flameStormDash.life.toFixed(1).replace('.', ',') + ' segundos · intangível, rebate nas bordas e permite corrigir a direção' : ready ? 'Ativar Propulsão Infernal · avanço flamejante e intangível por 5 segundos, com ricochete e direção controlável · tecla E' : 'Propulsão Infernal recarregando: ' + Math.ceil(state.abilityCooldown) + ' segundos' : isPrimalSaurion ? saurionESummon ? saurionESummon.name + ' ativo · ' + Math.ceil(saurionESummon.life) + 's' : ready ? 'Escolher dinossauro para o espaço E · recarga própria de 40s' : 'Chamado Primal recarrega em ' + Math.ceil(state.saurionSummonCooldownE) + 's' : eclipseIntro ? 'Abertura da Expansão de Domínio em andamento' : state.eclipseParadox?.life > 0 ? 'Ativar o Santuário para reforçar os cortes por 3 segundos sem encerrar o Paradoxo · tecla E' : eclipseActive ? 'Santuário ativo por mais ' + Math.ceil(state.eclipseTime) + ' segundos' : ready ? 'Usar habilidade ' + skin.ability + ' · tecla E' : skin.ability + ' recarregando: ' + Math.ceil(state.abilityCooldown) + ' segundos');
      const eCountdown = isAurora && auroraRepulseWindow
        ? '↯'
        : isMegumi
        ? state.abilityCooldown > 0 ? String(Math.ceil(state.abilityCooldown)) : megumiE.short
        : isMahoraga
        ? state.mahoragaParryWindow > 0 ? String(Math.ceil(state.mahoragaParryWindow)) : state.mahoragaParryCooldown > 0 ? state.mahoragaParryCooldown.toFixed(1).replace('.', ',') : state.mahoragaWheelReady ? '8/8' : ''
        : isFlameStorm && state.flameStormDash?.life > 0 ? state.flameStormDash.life.toFixed(1).replace('.', ',')
        : isVulture ? state.vultureFoldCharges > 0 ? state.vultureFoldCharges + '/3' : String(Math.ceil(state.vultureFoldRecharge))
        : isPrimalSaurion ? saurionESummon ? String(Math.ceil(saurionESummon.life)) : state.saurionSummonCooldownE > 0 ? String(Math.ceil(state.saurionSummonCooldownE)) : ''
        : isSaurion
        ? state.dinoRoarCharges > 0 ? String(state.dinoRoarCharges) : String(Math.ceil(state.dinoRoarRecharge))
        : !hasDeveloperPerks() && state.abilityCooldown > 0 ? String(Math.ceil(state.abilityCooldown))
        : eclipseActive ? String(Math.ceil(state.eclipseTime)) : '';
      if (ui.abilityCooldown) {
        ui.abilityCooldown.textContent = eCountdown;
        ui.abilityCooldown.hidden = !eCountdown;
      }
      ui.ability.classList.toggle('is-counting', Boolean(eCountdown));
      ui.ability.title = skin.ability + ' · tecla E · ' + (isMahoraga ? 'Escudo de 3s, −70% dano; adapta tipos diferentes por cinco ondas até 55%, com reforço temporário ao repetir uma adaptação. ' : isMegumi ? 'Próxima técnica: ' + megumiE.name + ' · ' + megumiE.description + ' · ' : isFlameStorm ? 'Dash flamejante e intangível por 5s, com ricochetes nas bordas e direção ajustável; os quadros de fogo substituem a nave. ' : isVulture && vultureUltPowerActive() ? 'Propulsão Ascendente · E alcança 1,8× mais longe e causa 24 de dano ao atravessar inimigos (15 em chefes). ' : isVulture ? 'Dobra Espacial · 3 usos seguidos por recarga · cada uso teleporta e deixa a nave invisível por 2s; inimigos perdem o alvo e param de atirar. ' : isPrimalSaurion ? 'E escolhe uma criatura e tem recarga independente de 40s; ela pode ficar em campo junto de outra espécie invocada pelo Q. ' : isSaurion ? 'Duas cargas; recupera uma a cada ' + Math.ceil(dinoRoarCooldownDuration()) + 's. ' : hasDeveloperPerks() ? 'sem recarga: ' : '') + skin.description;
      if (isAurora && auroraRepulseWindow) {
        ui.ability.title = 'E duplo · toque novamente agora para empurrar inimigos e redirecionar tiros; sem dano direto.';
        ui.ability.setAttribute('aria-label', 'E duplo disponível · empurrar inimigos e redirecionar tiros por até ' + Math.ceil((AURORA_E_DOUBLE_TAP_MS - (performance.now() - state.auroraEFirstTapAt)) / 1000 * 10) / 10 + ' segundos');
      } else if (isAurora) {
        ui.ability.title += ' · Com 1 a 5 cargas parciais da ult, pressione E duas vezes rapidamente para empurrar inimigos e desviar tiros.';
      }
    }
    if (ui.eclipseQWrap && ui.eclipseQ) {
      const isAurora = skin.id === 'aurora';
      const isAegis = skin.id === 'aegis';
      const isEclipse = skin.id === 'eclipse';
      const isChronos = skin.id === 'chronos';
      const isSaurion = skin.id === 'saurion';
      const isPrimalSaurion = skin.id === 'saurion-primal';
      const isRedshift = skin.id === 'redshift';
      const isFlashblade = skin.id === 'flashblade';
      const isTempest = skin.id === 'tempest';
      const isMahoraga = skin.id === 'mahoraga';
      const isMegumi = skin.id === 'megumi';
      const isFlameStorm = skin.id === 'flamestorm';
      const isVulture = skin.id === 'vulture';
      ui.eclipseQ.classList.remove('is-ferrum');
      const vulturePowerPhase = isVulture && vultureUltPowerActive();
      const vultureCollapsePhase = isVulture && vultureUltCollapseActive();
      ui.eclipseQWrap.style.setProperty('--ship-accent', skin.accent);
      ui.eclipseQWrap.style.setProperty('--ship-color', skin.color);
      const showQ = (isAurora || isAegis || isEclipse || isChronos || isSaurion || isPrimalSaurion || isRedshift || isFlashblade || isTempest || isMahoraga || isMegumi || isFlameStorm || isVulture) && ['playing', 'paused'].includes(state.mode);
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
      const paradoxDuration = eclipseParadoxDuration();
      const paradoxCooldown = eclipseParadoxCooldownDuration();
      const perimeterDuration = 6 + state.redshiftPerimeterDurationBonus;
      const perimeterCooldown = Math.max(22, 28 - upgradeLevel('redshiftPerimeterCooldown') * 2);
      const trailDuration = flashTrailDuration();
      const trailCooldown = flashTrailCooldownDuration();
      const tempestTideCooldown = tempestTideCooldownDuration();
      const tempestTideCharges = hasDeveloperPerks() ? tempestTideMaxCharges() : state.tempestTideCharges;
      const tempestTideMax = tempestTideMaxCharges();
      const stampedeRemaining = state.effects.reduce((remaining, effect) => effect.type === 'dino-raptor' ? Math.max(remaining, effect.life) : remaining, 0);
      const tideRemaining = state.effects.reduce((remaining, effect) => effect.type === 'tempest-tide' ? Math.max(remaining, effect.life) : remaining, 0);
      const saurionQSummon = isPrimalSaurion ? saurionSummonForSlot('q') : null;
      const qActive = isPrimalSaurion ? Boolean(saurionQSummon) : isAurora ? Boolean(state.auroraLink && state.auroraLink.life > 0) : isAegis ? Boolean(state.aegisOrbit && state.aegisOrbit.life > 0) : isEclipse ? Boolean(state.eclipseParadox?.life > 0) : isChronos ? Boolean(state.chronosEcho && state.chronosEcho.life > 0) : isRedshift ? Boolean(state.redshiftPerimeter && state.redshiftPerimeter.life > 0) : isFlashblade ? Boolean(state.flashTrail && state.flashTrail.life > 0) : isTempest ? tideRemaining > 0 : isSaurion ? stampedeRemaining > 0 : isFlameStorm ? state.effects.some((effect) => effect.type === 'flamestorm-vortex' && effect.life > 0) : isVulture && state.effects.some((effect) => ['vulture-pulse','vulture-horizon-shot','vulture-absorb-field'].includes(effect.type) && effect.life > 0);
      const vultureComboReady = isVulture && vultureQDoubleTapAvailable();
      const qCooldown = isPrimalSaurion ? state.saurionSummonCooldownQ : isAurora ? state.auroraLinkCooldown : isAegis ? state.aegisOrbitCooldown : isEclipse ? state.eclipseParadoxCooldown : isChronos ? state.chronosEchoCooldown : isRedshift ? state.redshiftPerimeterCooldown : isFlashblade ? state.flashTrailCooldown : isTempest ? state.tempestTideCooldown : isMahoraga ? state.mahoragaSlashCooldown : isMegumi ? state.megumiSummonCooldown : isFlameStorm ? state.flameStormQCooldown : isVulture ? (vultureComboReady ? 0 : state.vultureQCooldown) : state.dinoStampedeRecharge;
      const dinoCharges = hasDeveloperPerks() ? 3 : state.dinoStampedeCharges;
       const vultureAbsorptionReady = state.vultureScrap >= 3 && state.vultureAbsorbCooldown <= 0 && canRestoreShield();
      const vultureChargedReady = state.vultureScrap >= 8 && state.vultureOverloadCountdown > 0;
      const vultureEnergyBonus = Math.round(18 * clamp((state.vultureCannonCharge || 0) / VULTURE_CANNON_CHARGE_SECONDS, 0, 1));
      const vultureScrapBonus = Math.round(2.5 * clamp(state.vultureScrap, 0, 8));
      const qReady = isVulture ? state.vultureOverloadTime <= 0 && (vulturePowerPhase ? qCooldown <= 0 : !vultureCollapsePhase && (vultureChargedReady || vultureComboReady || qCooldown <= 0 || vultureAbsorptionReady)) : isPrimalSaurion ? (qCooldown <= 0 || (isSaurionDevReplace && Boolean(saurionQSummon))) && (!saurionQSummon || isSaurionDevReplace) : (hasDeveloperPerks() && !isMegumi) || (isTempest && state.tempestTideCharges > 0) || ((isAurora || isAegis || isEclipse || isChronos || isRedshift || isFlashblade || isMahoraga || isMegumi || isFlameStorm) && qCooldown <= 0) || (isSaurion && dinoCharges > 0);
      ui.eclipseQWrap.hidden = !showQ;
      ui.eclipseQ.disabled = !showQ || state.mode !== 'playing' || vultureCollapsePhase || state.megumiSummonPhase === 'cinematic' || (isEclipse && state.eclipsePhase !== 'idle') || ((isAurora || isAegis || isEclipse || isChronos || isRedshift || isFlashblade || isFlameStorm || isVulture) && qActive && !vultureComboReady) || !qReady;
      if (isFlameStorm) ui.eclipseQ.textContent = flameStormVortexIcon;
      else ui.eclipseQ.textContent = isSaurion ? '' : isPrimalSaurion ? '🦖' : isAurora ? '✴' : isAegis ? '⬡' : isEclipse ? '⊗' : isChronos ? '◷' : isRedshift ? '△' : isFlashblade ? '✧' : isTempest ? '↗' : isMahoraga ? '斬' : isMegumi ? '召' : isVulture ? '✹' : '✦';
      ui.eclipseQ.classList.toggle('is-aurora', isAurora);
      ui.eclipseQ.classList.toggle('is-aegis', isAegis);
      ui.eclipseQ.classList.toggle('is-chronos', isChronos);
      ui.eclipseQ.classList.toggle('is-tigrum', isSaurion);
      ui.eclipseQ.classList.toggle('is-saurion-primal', isPrimalSaurion);
      ui.eclipseQ.classList.toggle('is-redshift', isRedshift);
      ui.eclipseQ.classList.toggle('is-flashblade', isFlashblade);
      ui.eclipseQ.classList.toggle('is-tempest', isTempest);
      ui.eclipseQ.classList.toggle('is-mahoraga', isMahoraga);
      ui.eclipseQ.classList.toggle('is-megumi', isMegumi);
      ui.eclipseQ.classList.toggle('is-flamestorm', isFlameStorm);
      ui.eclipseQ.classList.toggle('is-vulture', isVulture);
      ui.eclipseQ.classList.remove('is-prisma');
      ui.eclipseQ.setAttribute('aria-pressed', String(qActive));
      const qLabel = vultureCollapsePhase ? 'Colapso da Devoradora de Estrelas · Q bloqueado até a explosão · ' + Math.ceil(state.vultureEvolutionTime) + 's'
         : vulturePowerPhase && qActive ? 'Míssil de 8 sucatas em voo · forma ascendente por ' + Math.ceil(state.vultureUltPowerTime) + 's'
         : vulturePowerPhase ? qCooldown > 0 ? 'Míssil reforçado recarregando: ' + Math.ceil(qCooldown) + 's · forma ascendente por ' + Math.ceil(state.vultureUltPowerTime) + 's' : 'Q dispara sempre com carga equivalente a 8 sucatas · forma ascendente por ' + Math.ceil(state.vultureUltPowerTime) + 's'
       : isVulture && state.vultureEvolutionTime > 0 ? 'Devoradora de Estrelas em andamento · ' + Math.ceil(state.vultureEvolutionTime) + 's'
         : isVulture && vultureComboReady ? 'Toque Q novamente agora para lançar um míssil combinado com toda a sucata disponível'
       : isVulture && qActive ? 'Míssil ou absorção da Vulture em andamento'
         : isVulture && vultureChargedReady ? 'Q: míssil carregado · segure Q: absorver sucata · G: forma ativa por 10s e campo final por 6s · sobrecarga em ' + Math.ceil(state.vultureOverloadCountdown) + 's'
        : isVulture && qCooldown > 0 ? 'Míssil recarregando: ' + Math.ceil(qCooldown) + 's · segure Q para absorver se houver 3 sucatas e espaço de escudo'
        : isVulture && vultureAbsorptionReady ? 'Q dispara com energia · toque duas vezes em até 0,75s para consumir sucata e reforçar · segure para absorver 3 sucatas e recuperar 1 escudo'
        : isVulture && state.vultureScrap >= 3 && !canRestoreShield() ? 'Escudos no limite · toque Q duas vezes para consumir sucata e reforçar o míssil'
        : isVulture ? 'Míssil Gravitacional · Q soma +' + vultureEnergyBonus + ' de energia · toque duas vezes em até 0,75s para consumir sucata e somar até +' + vultureScrapBonus + ' de dano · recarga ' + vulturePulseCooldownDuration() + 's'
        : isPrimalSaurion && qActive ? saurionQSummon.name + ' ativo pelo Q · ' + Math.ceil(saurionQSummon.life) + 's'
        : isPrimalSaurion && !qReady ? 'Arsenal Jurássico recarrega em ' + Math.ceil(qCooldown) + ' segundos'
        : isPrimalSaurion ? 'Escolher dinossauro para o espaço Q · recarga própria de 40s; pode coexistir com uma espécie diferente no E'
        : isMegumi && state.megumiSummonPhase === 'cinematic' ? 'Ritual do Guardião em andamento'
        : isMegumi && !qReady ? 'Ritual do Guardião recarregando: ' + Math.ceil(qCooldown) + ' segundos'
        : isMegumi ? 'Invocar o Guardião · tecla Q · cutscene e transformação por 5 ondas com uma vida extra · recarga de 45s depois que ela termina'
        : qActive && isAurora ? 'Elo Estelar ativo por mais ' + Math.ceil(state.auroraLink.life) + ' segundos · até ' + auroraLinkTargets + ' alvos · cada vida perdida causa 2 de dano aos alvos vinculados'
        : qActive && isAegis ? 'Órbitas Sentinelas protegem a nave por mais ' + Math.ceil(state.aegisOrbit.life) + ' segundos · ' + aegisOrbitRemaining + ' fragmentos restantes'
        : qActive && isEclipse ? 'Paradoxo Absoluto ativo por mais ' + Math.ceil(state.eclipseParadox.life) + ' segundos · campo continua ativo · E reforça os cortes por 3 segundos'
        : qActive && isChronos ? 'Eco do Futuro ativo por mais ' + Math.ceil(state.chronosEcho.life) + ' segundos'
        : qActive && isRedshift ? 'Perímetro de Cerco ativo por mais ' + Math.ceil(state.redshiftPerimeter.life) + ' segundos'
          : qActive && isFlashblade ? 'Rastro de Ruptura ativo por mais ' + Math.ceil(state.flashTrail.life) + ' segundos'
        : qActive && isTempest ? 'Maré Reversa ativa · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas'
        : qActive && isSaurion ? 'Investida do Tigre ativa · ' + dinoCharges + '/3 cargas restantes'
               : qActive && isFlameStorm ? 'Vórtice Carmesim ativo por mais ' + Math.ceil(state.effects.find((effect) => effect.type === 'flamestorm-vortex')?.life || 0) + ' segundos · invulnerável · atrai inimigos, absorve tiros e interrompe disparos de chefes no campo'
               : !qReady ? isMahoraga ? 'Espada da Exterminação recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isAurora ? 'Elo Estelar recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isAegis ? 'Órbitas Sentinelas recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isEclipse ? 'Paradoxo Absoluto recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isChronos ? 'Eco do Futuro recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isRedshift ? 'Perímetro de Cerco recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isFlashblade ? 'Rastro de Ruptura recarregando: ' + Math.ceil(qCooldown) + ' segundos' : isTempest ? 'Maré Reversa recarregando todas as cargas: ' + Math.ceil(qCooldown) + ' segundos' : isFlameStorm ? 'Vórtice Carmesim recarregando: ' + Math.ceil(qCooldown) + ' segundos' : 'Investida do Tigre recarregando; próxima carga em ' + Math.ceil(qCooldown) + ' segundos'
                : isFlameStorm ? 'Ativar Vórtice Carmesim · tecla Q · campo por 5s, absorve tiros puxados e impede chefes dentro da área de disparar; mantém a nave intangível por 0,7s após o fim'
                : isMahoraga ? 'Espada da Exterminação · tecla Q · talho mundial em onda atravessa a arena, destrói tiros e atinge até oito alvos; 20 de dano no primeiro, 10 nos seguintes e dano reduzido contra chefes'
                   : isAurora ? 'Ativar Elo Estelar · tecla Q · feixes saltam por ' + auroraLinkTime + 's entre até ' + auroraLinkTargets + ' alvos · cada vida perdida causa 2 de dano aos alvos conectados' : isAegis ? 'Ativar Órbitas Sentinelas · tecla Q · ' + aegisOrbitCount + ' fragmentos por ' + aegisOrbitTime + 's; cada um intercepta um tiro e dispara contra um inimigo' : isEclipse ? 'Ativar Paradoxo Absoluto · tecla Q · distorção por toda a tela durante ' + paradoxDuration + 's; desacelera, interrompe ataques e sentencia os alvos no colapso · recarga ' + paradoxCooldown + 's' : isChronos ? 'Ativar Eco do Futuro · tecla Q · repete os disparos após 0,30s com ' + Math.round((.7 + state.chronosEchoDamageBonus) * 100) + '% do dano' : isRedshift ? 'Ativar Perímetro de Cerco · tecla Q · campo por ' + perimeterDuration + ' segundos' : isFlashblade ? 'Ativar Rastro de Ruptura · tecla Q · impulso de 2,6× e rastros por ' + trailDuration + ' segundos' : isTempest ? 'Ativar Maré Reversa · tecla Q · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas; dano e alcance ampliados, empurrão e 40% de chance de desviar tiros' : 'Ativar Investida do Tigre · tecla Q · ' + (hasDeveloperPerks() ? 'usos ilimitados' : dinoCharges + ' cargas restantes');
      ui.eclipseQ.setAttribute('aria-label', qLabel);
       ui.eclipseQ.title = isVulture ? vultureCollapsePhase ? 'Colapso final: inimigos são puxados e suprimidos durante 6s; Q retorna após a explosão' : vulturePowerPhase ? 'Forma Ascendente por 10s: Q usa carga equivalente a 8 sucatas e recarrega em 2s · E também fica ampliado · depois há o campo final de 6s' : vultureComboReady ? 'Q novamente em até ' + (VULTURE_Q_DOUBLE_TAP_MS / 1000).toFixed(2).replace('.', ',') + 's: o míssil soma a energia do primeiro Q e consome toda a sucata atual' : state.vultureScrap >= 8 ? 'Q dispara o míssil carregado: consome 8 sucatas e soma energia acumulada · segure Q absorve 3 sucatas e recupera 1 escudo · G: forma ativa 10s + campo final 6s · sobrecarga em ' + Math.ceil(state.vultureOverloadCountdown) + 's' : 'Q dispara o míssil com energia acumulada · toque Q duas vezes em até 0,75s para consumir a sucata disponível e somar 2,5 de dano por peça (até +20) · segure Q por meio segundo absorve 3 sucatas e recupera 1 escudo · recarga ' + vulturePulseCooldownDuration() + 's'
        : isSaurion ? 'Investida do Tigre · Q · três cargas; projéteis de energia em forma de tigre perseguem e atingem inimigos · recarga de ' + dinoStampedeCooldownDuration() + 's por carga'
         : isPrimalSaurion ? 'Arsenal Jurássico · Q · escolha um dinossauro; pode coexistir com uma espécie diferente invocada pelo E · recarga própria 40s'
        : isMegumi ? 'Ritual do Guardião · Q · cutscene de invocação · forma Mahoraga por cinco ondas com uma vida extra · recarga de 45s depois que termina'
        : isFlameStorm ? 'Vórtice Carmesim · Q · invulnerabilidade, atração, absorção de tiros e supressão de chefes por 5s · recarga de ' + flameStormVortexCooldownDuration() + 's'
        : isMahoraga ? 'Espada da Exterminação · Q · onda de corte atravessa a tela e destrói tiros no trajeto · até oito alvos, 20 de dano no primeiro e 10 nos seguintes; chefes recebem 72% do dano · marca aumenta o próximo golpe em 10% · recarga ' + mahoragaSlashCooldownDuration() + 's'
        : isAurora ? 'Elo Estelar · Q · pulsos a cada 0,78s · até ' + auroraLinkTargets + ' alvos · cada vida perdida pela nave causa 2 de dano aos alvos conectados · dano do pulso ' + auroraLinkDamage.toFixed(1).replace('.', ',') + ' · duração ' + auroraLinkTime + 's · recarga ' + auroraLinkCooldown + 's'
        : isAegis ? 'Órbitas Sentinelas · Q · proteção do núcleo · fragmentos intactos atacam ao final · ' + aegisOrbitCount + ' fragmentos · duração ' + aegisOrbitTime + 's · dano convertido ' + (2 + state.aegisOrbitDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + aegisOrbitCooldown + 's'
        : isEclipse ? 'Paradoxo Absoluto · Q · distorção em toda a tela por ' + paradoxDuration + 's · lentidão progressiva, pulsos de supressão e Sentença proporcional ao tempo no campo · raio ' + Math.round(eclipseParadoxRadius()) + ' · dano máximo ' + (7 + state.eclipseParadoxDamageBonus).toFixed(1).replace('.', ',') + ' · combo com E: +15% por 3s (+8% em chefes); Q continua ativo · recarga de ' + paradoxCooldown + 's'
        : isChronos ? 'Eco do Futuro · Q · ecos repetem os disparos após 0,30s · duração ' + chronosEchoTime + 's · dano ' + Math.round((.7 + state.chronosEchoDamageBonus) * 100) + '% · recarga de ' + chronosEchoCooldown + 's'
        : isRedshift ? 'Perímetro de Cerco · Q · ' + perimeterDuration + 's · dano ' + (4 + state.redshiftPerimeterDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + perimeterCooldown + 's'
          : isFlashblade ? 'Rastro de Ruptura · Q · impulso 2,6× · rastros até 9s · dano ' + (3 + state.flashTrailDamageBonus).toFixed(1).replace('.', ',') + ' · recarga de ' + trailCooldown + 's'
             : isTempest ? 'Maré Reversa · Q · ' + tempestTideCharges + '/' + tempestTideMax + ' cargas · alcance ' + Math.round(mobileSize(280 + state.tempestTideRadiusBonus)) + ' · dano ' + (3.2 + state.tempestTideDamageBonus).toFixed(1).replace('.', ',') + ' · 40% de chance de desviar tiros e redirecionar alguns contra inimigos · recarrega todas em ' + tempestTideCooldown + 's após esgotar'
                : 'Investida do Tigre · 3 cargas · Q · recarga de ' + dinoStampedeCooldownDuration() + 's por carga';
       const qActiveRemaining = isVulture ? state.effects.reduce((remaining, effect) => ['vulture-pulse','vulture-horizon-shot','vulture-absorb-field'].includes(effect.type) ? Math.max(remaining, effect.life) : remaining, 0) : isPrimalSaurion ? saurionQSummon?.life || 0 : isAurora ? state.auroraLink?.life || 0
        : isAegis ? state.aegisOrbit?.life || 0
          : isEclipse ? state.eclipseParadox?.life || 0
            : isChronos ? state.chronosEcho?.life || 0
              : isRedshift ? state.redshiftPerimeter?.life || 0
                : isFlashblade ? state.flashTrail?.life || 0
                  : isTempest ? tideRemaining
          : isSaurion ? stampedeRemaining : isFlameStorm && qActive ? state.effects.find((effect) => effect.type === 'flamestorm-vortex')?.life || 0 : 0;
      const qCountdown = qActive && isEclipse && qActiveRemaining > 0
        ? String(Math.ceil(qActiveRemaining))
        : isTempest
        ? tempestTideCharges > 0 ? tempestTideCharges + '/' + tempestTideMax : String(Math.ceil(qCooldown))
        : isVulture && vultureChargedReady ? String(Math.ceil(state.vultureOverloadCountdown)) + 's'
        : isVulture && vultureAbsorptionReady && qCooldown > 0 ? 'SEGURE'
        : (!hasDeveloperPerks() || isMegumi) && qCooldown > 0
        ? String(Math.ceil(qCooldown))
        : qActive && qActiveRemaining > 0 ? String(Math.ceil(qActiveRemaining)) : '';
      if (ui.eclipseQCooldown) {
        ui.eclipseQCooldown.textContent = qCountdown;
        ui.eclipseQCooldown.hidden = !qCountdown;
      }
      ui.eclipseQ.classList.toggle('is-counting', Boolean(qCountdown));
    }
    if (ui.saurionCommand) {
      const summon = skin.id === 'saurion-primal' ? saurionSummons().find((active) => active.kind === 'rex' && !active.rageUsed) || saurionSummons().find((active) => active.kind === 'carno') : null;
      const command = summon?.kind === 'rex' ? 'z' : summon?.kind === 'carno' ? 'x' : '';
      ui.saurionCommand.hidden = !command || !showAbility || command === 'z' && summon.rageUsed;
      ui.saurionCommand.disabled = state.mode !== 'playing' || command === 'x' && summon.commandCooldown > 0;
      ui.saurionCommand.textContent = command === 'z' ? 'Z · FÚRIA' : command === 'x' ? summon.commandCooldown > 0 ? 'X · ' + Math.ceil(summon.commandCooldown) + 's' : 'X · INVESTIDA' : '';
      ui.saurionCommand.setAttribute('aria-label', command === 'z' ? 'Ativar rugido de fúria do Tiranossauro · tecla Z' : 'Ativar investida do Carnotauro · tecla X');
    }
  }
  function prismAbilityGlyph(choice = state.prismAbilityChoices.e) {
    const { shipId, key } = prismChoiceParts(choice);
    if (shipId === 'prisma') return key === 'q' ? '⌖' : '✧';
    const glyphs = { aurora:{ e:'✴', q:'✧' }, aegis:{ e:'⬡', q:'⬡' }, chronos:{ e:'◷', q:'◌' }, tempest:{ e:'◉', q:'↗' }, flashblade:{ e:'✧', q:'〰' }, redshift:{ e:'◈', q:'△' }, eclipse:{ e:'◉', q:'◌' }, saurion:{ e:'〰', q:'🐾' }, 'saurion-primal':{ e:'🐾', q:'🦖' }, mahoraga:{ e:'☸', q:'斬' }, megumi:{ e:'影', q:'召' }, flamestorm:{ e:'🔥', q:'🌀' } };
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
      const canUse = state.mode === 'playing' && state.megumiSummonPhase !== 'cinematic' && prismChoiceCanActivate('e');
      const active = prismChoiceActive('e');
      const countdown = horizonReturning ? String(Math.ceil(state.prismHorizonAnchor.life)) : !hasDeveloperPerks() && prismSlotCooldown('e') > 0 ? String(Math.ceil(prismSlotCooldown('e'))) : '';
      ui.ability.style.setProperty('--ship-color', skin.color);
      ui.ability.style.setProperty('--ship-accent', skin.accent);
      ui.ability.style.setProperty('--ship-color-rgb', colorRgbTriplet(skin.color));
      ui.ability.style.setProperty('--ship-accent-rgb', colorRgbTriplet(skin.accent));
      ui.ability.classList.add('is-prisma');
      ui.ability.classList.remove('is-mahoraga','is-megumi','is-flamestorm');
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
      const qCanUse = state.mode === 'playing' && state.megumiSummonPhase !== 'cinematic' && prismChoiceCanActivate('q');
      const qActive = prismChoiceActive('q');
      const qTimer = prismSlotCooldown('q');
      const qCountdown = !hasDeveloperPerks() && qTimer > 0 ? String(Math.ceil(qTimer)) : '';
      ui.eclipseQWrap.hidden = !show;
      ui.eclipseQ.classList.remove('is-aurora','is-aegis','is-chronos','is-tigrum','is-redshift','is-flashblade','is-tempest','is-mahoraga','is-megumi','is-flamestorm');
      ui.eclipseQ.classList.add('is-prisma');
      ui.eclipseQ.textContent = prismAbilityGlyph(state.prismAbilityChoices.q);
      ui.eclipseQ.disabled = !qCanUse || state.eclipsePhase === 'cinematic' || state.megumiSummonPhase === 'cinematic';
      ui.eclipseQ.setAttribute('aria-pressed', String(qActive));
      ui.eclipseQ.setAttribute('aria-label', qCanUse ? 'Ativar ' + qName + ' · tecla Q' : qName + ' recarregando: ' + Math.ceil(qTimer) + ' segundos');
      ui.eclipseQ.title = qName + ' · habilidade Q · pressione G para escolher.';
      if (ui.eclipseQCooldown) { ui.eclipseQCooldown.textContent = qCountdown; ui.eclipseQCooldown.hidden = !qCountdown; }
      ui.eclipseQ.classList.toggle('is-counting', Boolean(qCountdown));
    }
    if (ui.prismSelectWrap) ui.prismSelectWrap.hidden = !show;
    if (ui.prismSelect) ui.prismSelect.disabled = !show || state.eclipsePhase === 'cinematic' || state.megumiSummonPhase === 'cinematic';
  }
  function openSecretShipUnlock(shipId = null) {
    pendingSecretShipId = shipId;
    const prismaUnlock = shipId === 'prisma';
    const title = $('#secret-unlock-title');
    const copy = ui.secretUnlockDialog?.querySelector('.starfall-secret-dialog-card > p:nth-of-type(2)');
    if (!prismaUnlock) return;
    if (title) title.textContent = 'Desbloquear Prisma Real';
    if (copy) copy.textContent = 'A Prisma Real exige uma sessão Supabase autorizada e o perfil educvv. Entre pela página Perfil e depois verifique o acesso aqui.';
    const secretLabel = ui.secretUnlockDialog?.querySelector('.starfall-secret-label');
    if (secretLabel) secretLabel.hidden = true;
    if (ui.secretUnlockInput) ui.secretUnlockInput.hidden = true;
    const submit = ui.secretUnlockForm?.querySelector('[type="submit"]');
    if (submit) submit.textContent = 'VERIFICAR ACESSO';
    if (ui.secretUnlockDialog?.showModal) {
      ui.secretUnlockError.hidden = true;
      ui.secretUnlockDialog.showModal();
      return;
    }
    void verifyPrismaAccountAccess();
  }
  async function verifyPrismaAccountAccess() {
    const auth = window.CV_GAMES_AUTH;
    let session = null;
    try { session = await auth?.getOwnerSession?.(); } catch { session = null; }
    prismaAccountAuthorized = Boolean(profileNickname() === 'educvv' && session?.user?.id && auth?.isOwner?.(session.user));
    if (!prismaAccountAuthorized) {
      if (ui.secretUnlockError) {
        ui.secretUnlockError.textContent = 'Acesso restrito. Entre na conta Supabase autorizada e selecione o perfil educvv.';
        ui.secretUnlockError.hidden = false;
      }
      return false;
    }
    grantSecretShipUnlock('prisma');
    if (ui.secretUnlockDialog?.open) ui.secretUnlockDialog.close();
    if (ui.status) ui.status.textContent = 'Acesso à Prisma Real verificado pela conta autorizada.';
    return true;
  }
  function grantSecretShipUnlock(shipId) {
    if (!skins.some((skin) => skin.secret && skin.id === shipId)) return;
    const restrictedSkin = skins.find((skin) => skin.id === shipId);
    if (shipId === 'prisma' && (!prismaAccountAuthorized || profileNickname() !== 'educvv')) return;
    if (restrictedSkin?.profileRestricted && !hasSecretShipAccess(restrictedSkin)) return;
    if (shipId !== 'prisma') {
      secretShipUnlocks.add(shipId);
      saveSecretShipUnlocks();
      saveNicknameSettings();
    }
    if (shipId !== 'prisma' && accountShipProgressLoaded) accountUnlockedShipIds.add(shipId);
    pendingSecretShipId = null;
    renderSkinPicker(); updateEquippedShip(); updateControlUI(); persistAccountShipProgress(); reconcileAbilityCollectorAchievement();
  }
  function closeSecretShipUnlock() {
    if (ui.secretUnlockDialog?.open) ui.secretUnlockDialog.close();
    pendingSecretShipId = null;
    if (ui.shipModal && !ui.shipModal.hidden) ui.skinPicker?.querySelector('.starfall-skin-card.is-secret')?.focus();
  }
  async function submitSecretShipUnlock(event) {
    event.preventDefault();
    if (pendingSecretShipId !== 'prisma') return;
    if (ui.secretUnlockError) {
      ui.secretUnlockError.textContent = 'Verificando sessão autorizada…';
      ui.secretUnlockError.hidden = false;
    }
    if (await verifyPrismaAccountAccess() && ui.secretUnlockError) ui.secretUnlockError.hidden = true;
  }
  function openShipDetails(skin) {
    if (!ui.shipDetailsDialog || !ui.shipDetailsList) return;
    if (ui.saurionDinosOpen) {
      ui.saurionDinosOpen.hidden = skin.id !== 'saurion-primal';
      ui.saurionDinosOpen.setAttribute('aria-expanded', 'false');
    }
    if (ui.saurionDinoCatalog) ui.saurionDinoCatalog.hidden = true;
    if (ui.saurionDinoInfo) ui.saurionDinoInfo.hidden = true;
    if (skin.noAbilities) {
      ui.shipDetailsKicker.textContent = 'NAVE DE TREINO · DOSSIÊ DO CASCO';
      ui.shipDetailsTitle.textContent = skin.name;
      ui.shipDetailsSummary.textContent = 'Forma do Aríete no G · 5 investidas Q · 3 usos E · habilidades sem recarga por tempo.';
      ui.shipDetailsList.replaceChildren();
      for (const [label, headingText, copy] of [
        ['PROTEÇÃO', 'Blindagem Ferrum', 'Todo dano recebido é reduzido pela metade. Frações são acumuladas para que impactos pequenos também sejam mitigados ao longo da partida.'],
        ['G', 'Forma do Aríete de Aço', 'Cada 16 de dano causado acende uma placa, inclusive contra chefes; receber um acerto também acrescenta pressão. Com quatro placas, G ativa a forma transformada e libera cinco investidas Q e três usos de E. A forma dura enquanto ainda houver investidas Q.'],
        ['Q', 'Investida Ferrum', 'Pressione Q para lançar uma investida longa na direção apontada. Ela atravessa inimigos e chefes, atingindo cada alvo uma vez; causa 10 de dano e empurra sobreviventes leves para os lados. Contra chefes, o dano segue limitado a 8% da vida máxima por acerto. Q usa cargas, sem recarga por tempo.'],
        ['E', 'Contrachoque de Aço', 'A forma do G concede três usos de E, sem recarga por tempo. Cada uso mantém a proa erguida por 1,15 segundo e bloqueia até três projéteis comuns frontais; ao final, uma onda sem dano empurra inimigos próximos e redireciona tiros comuns. Chefes recebem empurrão menor.'],
        ['IMPACTO', 'Abrir passagem', 'Cada inimigo na trajetória sofre um acerto de 10 de dano. Sobreviventes são empurrados para os lados. Ao atingir um chefe, a Ferrum recua e o dano é limitado a 8% da vida máxima dele.'],
        ['CONTROLE', 'Propulsores de treino', 'A velocidade inicial é 10% menor que a das outras naves. Melhorias de velocidade continuam disponíveis durante a missão.'],
        ['MELHORIAS', 'Reforços de Ferrum', 'Os suprimentos podem ampliar o magnetismo para coletar itens mais cedo, acelerar os tiros automáticos, carregar G com menos dano e aumentar o alcance do Q. E e Q usam cargas e não recebem recarga por tempo.'],
        ['PLACAR', 'Elegível para o ranking', 'Resultados com a Ferrum contam normalmente para o placar.']
      ]) {
        const detail = document.createElement('section'); detail.className = 'starfall-rank-detail-card starfall-ship-detail-card';
        const kicker = document.createElement('small'); kicker.className = 'starfall-ship-detail-key'; kicker.textContent = label;
        const heading = document.createElement('h3'); heading.textContent = headingText;
        const description = document.createElement('p'); description.textContent = copy;
        detail.append(kicker, heading, description); ui.shipDetailsList.append(detail);
      }
      ui.shipDetailsCooldowns.textContent = 'Casco reforçado · 50% menos dano recebido';
      if (typeof ui.shipDetailsDialog.showModal === 'function') ui.shipDetailsDialog.showModal();
      else ui.shipDetailsDialog.setAttribute('open', '');
      return;
    }
    ui.shipDetailsKicker.textContent = skin.secret ? 'NAVE SECRETA · DOSSIÊ DE HABILIDADES' : 'DOSSIÊ DE HABILIDADES';
    ui.shipDetailsTitle.textContent = skin.name;
    ui.shipDetailsSummary.textContent = skin.id === 'vulture'
      ? 'E: Dobra Espacial · Q: Míssil Gravitacional e absorção · G: Devoradora de Estrelas'
      : 'Habilidade E: ' + skin.ability + ' · Habilidade Q: ' + secondaryAbilityNames[skin.id];
    ui.shipDetailsList.replaceChildren();
    const abilityDetails = [
      ['HABILIDADE E', skin.ability, shipAbilityDetails[skin.id].e],
      ['HABILIDADE Q', secondaryAbilityNames[skin.id], shipAbilityDetails[skin.id].q]
    ];
    if (skin.id === 'aurora') abilityDetails.push([
      'ULTIMATE · G', 'Coroa da Hipernova',
      'Acerte inimigos com E ou Q para carregar seis segmentos. Com a barra cheia, G ativa a constelação por 8 segundos: seis estrelas orbitam a Aurora, linhas conectam a nave a todos os inimigos e feixes atingem os alvos, saltando pelos inimigos ligados pelo Q. Use E durante a ult para fazer as estrelas restantes convergirem na Explosão Nova; se não usar, a constelação termina com uma hipernova própria. A habilidade não concede invulnerabilidade e o dano contra chefes tem limite. A carga parcial também permite a variação de E descrita acima.'
    ]);
    if (skin.id === 'vulture') abilityDetails.push([
      'ULTIMATE · G', 'Devoradora de Estrelas',
      'Consome 8 sucatas e transforma a nave. Nos primeiros 10s você pode se mover, disparar normalmente, usar Q com carga equivalente a 8 sucatas sem gastar outras e usar E com 1,8× de alcance e dano ao cruzar inimigos. Depois, começa o Colapso: por 6s o campo acompanha a nave, puxa e desacelera os inimigos e impede seus ataques. Você ainda pode se mover durante o campo; no fim, ele explode e causa 28 de dano em inimigos comuns e 18 em chefes. A forma reduz em 35% o dano recebido.'
    ]);
    for (const [label, abilityName, copy] of abilityDetails) {
      const detail = document.createElement('section'); detail.className = 'starfall-rank-detail-card starfall-ship-detail-card';
      const kicker = document.createElement('small'); kicker.className = 'starfall-ship-detail-key'; kicker.textContent = label;
      const heading = document.createElement('h3'); heading.textContent = abilityName;
      const description = document.createElement('p'); description.textContent = copy;
      detail.append(kicker, heading, description); ui.shipDetailsList.append(detail);
    }
    if (skin.id === 'vulture') {
      const resource = document.createElement('section'); resource.className = 'starfall-rank-detail-card starfall-ship-detail-card starfall-vulture-lore';
      const kicker = document.createElement('small'); kicker.className = 'starfall-ship-detail-key'; kicker.textContent = 'PASSIVA · RECURSO';
      const heading = document.createElement('h3'); heading.textContent = 'Sucata e sobrecarga';
      const description = document.createElement('p'); description.textContent = 'Inimigos podem soltar cinco tipos visuais de destroço; todos contam como a mesma sucata. Guarde até 8 peças. Ao chegar a 8, começa uma contagem de 10s para escolher entre o míssil carregado do Q e a Ultimate G. Se o tempo acabar sem gastar a carga, a nave dispara à força, perde os escudos e fica brevemente imobilizada e vulnerável. Melhorias próprias aumentam o alcance do E, o raio e dano do Q e reduzem sua recarga.';
      resource.append(kicker, heading, description); ui.shipDetailsList.append(resource);
    }
    ui.shipDetailsCooldowns.textContent = 'Recargas e melhorias · ' + shipCooldownSummary(skin);
    if (skin.id === 'saurion-primal') renderSaurionDinoCatalog();
    if (skin.id === 'vulture') {
      const lore = document.createElement('section'); lore.className = 'starfall-rank-detail-card starfall-ship-detail-card starfall-vulture-lore';
      const kicker = document.createElement('small'); kicker.className = 'starfall-ship-detail-key'; kicker.textContent = 'ORIGEM';
      const heading = document.createElement('h3'); heading.textContent = 'Astra Vulture · O Devorador de Estrelas';
      const description = document.createElement('p'); description.textContent = 'Uma caçadora experimental que absorve destroços para alimentar seus escudos e o núcleo gravitacional. Quando o núcleo acumula sucata demais, a nave evolui e libera um disparo carregado, mas fica exposta durante a sobrecarga. “Quando as estrelas caem, nós encontramos o caminho.”';
      lore.append(kicker, heading, description); ui.shipDetailsList.append(lore);
    }
    if (typeof ui.shipDetailsDialog.showModal === 'function') ui.shipDetailsDialog.showModal();
    else ui.shipDetailsDialog.setAttribute('open', '');
  }
  function renderSaurionDinoCatalog() {
    if (!ui.saurionDinoList) return;
    ui.saurionDinoList.replaceChildren();
    for (const creature of saurionCreatures) {
      const guide = saurionDinoGuides[creature.kind];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'starfall-saurion-dino-option';
      button.setAttribute('aria-pressed', 'false');
      const image = document.createElement('img');
      image.src = saurionDinoSprites[creature.id]?.src || '';
      image.alt = '';
      image.loading = 'lazy';
      const name = document.createElement('span');
      name.textContent = creature.name;
      button.append(image, name);
      button.addEventListener('click', () => {
        ui.saurionDinoList.querySelectorAll('.starfall-saurion-dino-option').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
        if (ui.saurionDinoRole) ui.saurionDinoRole.textContent = guide.role;
        if (ui.saurionDinoName) ui.saurionDinoName.textContent = creature.name;
        if (ui.saurionDinoDescription) ui.saurionDinoDescription.textContent = guide.description;
        if (ui.saurionDinoInfo) ui.saurionDinoInfo.hidden = false;
      });
      ui.saurionDinoList.append(button);
    }
  }
  function renderSkinPicker() {
    if (!ui.skinPicker) return;
    ui.skinPicker.replaceChildren();
    const pickerSkins = [...skins].sort((a, b) => Number(Boolean(a.ownerOnly)) - Number(Boolean(b.ownerOnly)));
    pickerSkins.forEach((skin) => {
      if (skin.hiddenFromHangar) return;
      if (skin.profileRestricted && !skinUnlocked(skin)) return;
      const unlocked = skinUnlocked(skin);
      const concealed = Boolean(skin.ownerOnly && !unlocked);
      const card = document.createElement('article');
      card.className = 'starfall-skin-card' + (skin.id === state.selectedSkin ? ' is-selected' : '') + (skin.secret ? ' is-secret' : '') + (!unlocked ? ' is-locked' : '');
      card.style.setProperty('--skin-color', skin.color);
      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'starfall-skin-select';
      select.setAttribute('aria-pressed', String(skin.id === state.selectedSkin));
      select.setAttribute('aria-label', concealed ? 'Nave secreta indisponível' : unlocked ? (skin.id === state.selectedSkin ? 'Nave equipada: ' : 'Equipar nave ') + skin.name : skin.ownerOnly ? 'Abrir acesso restrito da nave ' + skin.name : skin.secret ? 'Nave especial bloqueada; use o botão Desbloquear para ' + skin.name : skin.name + ' · desbloqueia na onda ' + skin.unlockWave);
      select.disabled = !unlocked && !skin.ownerOnly;
      const icon = document.createElement('span');
      const usesHangarHull = ['classic','training','shield','ring','wing','blade'].includes(skin.shape);
      icon.className = 'starfall-skin-icon' + (concealed ? ' starfall-prism-icon is-concealed' : skin.shape === 'eclipse' ? ' starfall-eclipse-sprite' : skin.id === 'aurora' ? ' starfall-aurora-icon' : skin.shape === 'saurion-primal' ? ' starfall-saurion-icon' : skin.shape === 'dino' ? ' starfall-dino-icon starfall-dino-image-wrap' : skin.shape === 'prism' ? ' starfall-prism-icon' : skin.shape === 'training' ? ' starfall-training-icon' : skin.shape === 'mahoraga' ? ' starfall-mahoraga-icon' : skin.shape === 'megumi' ? ' starfall-umbra-icon' : skin.shape === 'reflector' ? ' starfall-redshift-icon' : '') + (usesHangarHull ? ' starfall-hangar-hull-icon' : '');
      icon.setAttribute('aria-hidden', 'true');
      if (concealed) icon.textContent = '?';
      else if (skin.id === 'aurora') { const image = document.createElement('img'); image.src = 'aurora-ship.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'saurion-primal') { const image = document.createElement('img'); image.src = 'saurion-frame-1.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'vulture') { icon.classList.add('starfall-vulture-icon'); const image = document.createElement('img'); image.src = 'vulture-ship.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'dino') { icon.classList.add('starfall-tigrum-icon'); const image = document.createElement('img'); image.src = 'tigrum-q-roar.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'megumi') { const image = document.createElement('img'); image.src = 'umbra-ship.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'flamestorm') { icon.classList.add('starfall-flamestorm-icon'); const image = document.createElement('img'); image.src = 'flamestorm-icon.png'; image.alt = ''; icon.append(image); }
      else if (skin.shape === 'mahoraga') icon.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 22L31 26L38 30L34 35L30 33L29 40L26 39L24 47L22 39L19 40L18 33L14 35L10 30L17 26Z" fill="#c9d0cf" stroke="#39434c" stroke-width="1.8" stroke-linejoin="round"/><circle cx="24" cy="12" r="9.5" fill="#29333d" stroke="#e4c477" stroke-width="1.8"/><circle cx="24" cy="12" r="6.2" fill="none" stroke="#eee7d8" stroke-width="1"/><path d="M24 4V20M16 12H32M18.4 6.4L29.6 17.6M29.6 6.4L18.4 17.6" fill="none" stroke="#f2ebdc" stroke-width="1.3" stroke-linecap="round"/><g fill="#e4c477" stroke="#f7efdc" stroke-width=".7"><circle cx="24" cy="1.5" r="1.7"/><circle cx="31.4" cy="4.6" r="1.7"/><circle cx="34.5" cy="12" r="1.7"/><circle cx="31.4" cy="19.4" r="1.7"/><circle cx="24" cy="22.5" r="1.7"/><circle cx="16.6" cy="19.4" r="1.7"/><circle cx="13.5" cy="12" r="1.7"/><circle cx="16.6" cy="4.6" r="1.7"/></g></svg>';
      else if (skin.shape === 'reflector') icon.innerHTML = bastiaoShipSvg(skin.color,skin.accent);
      else if (usesHangarHull) icon.innerHTML = hangarShipSvg(skin);
      else if (skin.shape !== 'eclipse') icon.textContent = skin.shape === 'reflector' ? '◈' : skin.shape === 'prism' ? '◇' : skin.shape === 'training' ? '⬢' : skin.shape === 'mahoraga' ? '☸' : skin.shape === 'megumi' ? '影' : '✦';
      const name = document.createElement('strong'); name.textContent = concealed ? 'NAVE DESCONHECIDA' : skin.name;
      const primary = document.createElement('span'); primary.className = 'starfall-skin-skill' + (skin.noAbilities ? ' starfall-skin-training-note' : '');
       if (skin.noAbilities) primary.textContent = 'G · Forma Aríete · Q 5 cargas · E 3 cargas';
      else primary.innerHTML = '<kbd>E</kbd><span>' + (concealed ? 'SINAL SELADO' : skin.ability) + '</span>';
      const secondary = skin.noAbilities ? null : document.createElement('span');
      if (secondary) { secondary.className = 'starfall-skin-skill'; secondary.innerHTML = '<kbd>Q</kbd><span>' + (concealed ? 'SINAL SELADO' : secondaryAbilityNames[skin.id]) + '</span>'; }
      const status = document.createElement('small');
      status.className = 'starfall-skin-status';
      status.textContent = concealed ? 'ACESSO RESTRITO' : unlocked ? skin.id === state.selectedSkin ? skin.id === 'prisma' ? 'EQUIPADA · FORA DO TOP 10' : 'EQUIPADA' : 'EQUIPAR' : skin.secret ? skin.id === 'prisma' ? 'NAVE ESPECIAL · RESTRITA' : 'NAVE ESPECIAL' : 'DESBLOQUEIA NA ONDA ' + skin.unlockWave;
      select.append(icon, name, primary);
      if (secondary) select.append(secondary);
      select.append(status);
      select.addEventListener('click', () => {
        if (skin.ownerOnly && !skinUnlocked(skin)) { openSecretShipUnlock(skin.id); return; }
        if (skin.secret && !skinUnlocked(skin)) return;
        if (!skinUnlocked(skin) || state.mode === 'playing' || state.mode === 'upgrade') return;
        state.selectedSkin = skin.id;
        try { localStorage.setItem('cv-games-cv-starfall-skin', skin.id); } catch { /* A escolha vale para esta sessão. */ }
        saveNicknameSettings();
        renderSkinPicker();
        updateEquippedShip();
        updateControlUI();
        persistAccountShipProgress();
        ui.copy.textContent = skin.id === 'prisma'
          ? 'Prisma Real equipada: nave especial de teste. As missões com ela não são enviadas ao Top 10; seus recordes continuam salvos neste aparelho.'
          : skin.id === 'megumi' ? 'Umbra equipada: nave secreta elegível para o ranking do CV STARFALL.'
          : skin.noAbilities ? 'Ferrum equipada · G libera 5 investidas Q e 3 usos E, sem recarga por tempo. Buffs podem ampliar a coleta, a cadência de tiro, a carga do G e o alcance do Q.'
            : 'Cada nave tem habilidades especiais. Use E e Q para ativá-las; abra Naves e Habilidades e selecione Ver detalhes para conhecer cada poder.';
        closeShips();
        if (skin.id === 'prisma' && ui.prismRankNotice) {
          const kicker = ui.prismRankNotice.querySelector('.starfall-kicker');
          const icon = ui.prismRankNotice.querySelector('.starfall-prism-rank-notice-icon');
          const heading = ui.prismRankNotice.querySelector('#prism-rank-notice-title');
          const copy = ui.prismRankNotice.querySelector('#prism-rank-notice-copy');
          if (kicker) kicker.textContent = 'PRISMA REAL · NAVE ESPECIAL';
          if (icon) icon.textContent = '◇';
          if (heading) heading.textContent = 'Esta nave não conta no Top 10';
          if (copy) copy.textContent = 'Missões jogadas com a Prisma Real não são enviadas ao placar público. Seu resultado continua salvo localmente neste aparelho.';
          ui.prismRankNotice.hidden = false;
          syncAudioVisibility();
          ui.prismRankNotice.querySelector('[data-close-prism-rank-notice]')?.focus();
        }
      });
      let specialUnlock = null;
      if (skin.secret && !skin.profileRestricted && !unlocked && skin.id !== 'prisma') {
        specialUnlock = document.createElement('button');
        specialUnlock.type = 'button';
        specialUnlock.className = 'starfall-special-unlock';
        specialUnlock.textContent = 'DESBLOQUEAR';
        specialUnlock.setAttribute('aria-label', 'Desbloquear nave especial ' + skin.name + ' para este perfil');
        specialUnlock.addEventListener('click', () => {
          grantSecretShipUnlock(skin.id);
          ui.status.textContent = skin.name + ' desbloqueada e salva no perfil.';
        });
      }
      const details = document.createElement('button');
      details.type = 'button'; details.className = 'starfall-skin-details-trigger'; details.textContent = concealed ? 'Arquivo selado' : 'Ver detalhes';
      details.disabled = concealed;
      details.setAttribute('aria-label', concealed ? 'Detalhes da nave secreta indisponíveis' : skin.noAbilities ? 'Ver detalhes da nave ' + skin.name : 'Ver detalhes das habilidades da nave ' + skin.name);
      details.addEventListener('click', () => { if (!concealed) openShipDetails(skin); });
      card.append(select, details);
      if (specialUnlock) card.append(specialUnlock);
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
    state.ferrumPressure = 0;
    state.ferrumRam = null;
    state.ferrumRamCharges = 0;
    state.ferrumECharges = 0;
    state.ferrumCountershock = null;
    if (megumiCutsceneTimer) window.clearTimeout(megumiCutsceneTimer);
    megumiCutsceneTimer = 0;
    state.megumiTechnique = rollMegumiTechnique(''); state.megumiSummonCooldown = 0; state.megumiTransformed = false; state.megumiFormWavesRemaining = 0; state.megumiSummonPhase = 'idle'; state.megumiTransformSource = ''; state.megumiCloakTime = 0; state.megumiRabbits = [];
    ui.stage?.classList.remove('starfall-megumi-shadow-veil');
    ui.stage?.classList.remove('starfall-vulture-cloaked');
    ui.stage?.classList.remove('starfall-vulture-overloaded');
    if (ui.megumiFormTimer) ui.megumiFormTimer.hidden = true;
    if (ui.pause) ui.pause.disabled = false;
    if (ui.stop) ui.stop.disabled = false;
    if (ui.megumiCutscene) { ui.megumiCutscene.hidden = true; ui.megumiCutscene.setAttribute('aria-hidden', 'true'); }
    state.score = 0; state.wave = 1; state.lives = 3; state.maxLives = 6; state.shields = 0; state.tempShields = 0; state.invulnerable = 1.4; state.elapsed = 0; state.missionStartedAt = Date.now(); state.waveStartedAt = state.missionStartedAt; state.waveEndedAt = 0; state.lastRepairUpgradeWave = 0; state.salvageHealsThisWave = 0; state.lastSalvageHealWave = 0;
    state.shotCooldown = 0; state.automaticFireEnabled = true; state.waveGrace = .45; state.enemySpawn = .22; state.powerSpawn = 8; state.waveKills = 0; state.enemyDamageRemainders = {};
    state.enemiesRequired = 9; state.bossWave = false; state.bossSpawned = false; state.miniBossTimer = 0; state.miniBossSpawned = false;
    state.bullets = []; state.enemyBullets = []; state.enemies = []; state.particles = []; state.pickups = []; state.effects = [];
    const skin = currentSkin();
    state.trainingDamageRemainder = 0;
    state.player = { x: state.width / 2, y: state.height * .78, radius: mobileSize(13), speed: skin.id === 'training' ? 234 : 260, damage: 1, fireRate: .34, spread: 1, angle: -Math.PI / 2, moveAngle: -Math.PI / 2, color: skin.color, accent: skin.accent, shape: skin.shape };
    state.upgrades = {}; state.abilityCooldown = 0; state.abilityBaseCooldown = skin.cooldown; state.abilityPower = 1; state.slowTime = 0; state.adminNoCooldown = isDeveloperProfile(); state.adminBuffsActive = false;
    state.flameStormQCooldown = 0; state.flameStormQIntangible = 0; state.flameStormDash = null;
    state.vultureQCooldown = 0; state.vultureCannonCharge = 0; state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0; state.vultureCloakTime = 0; state.vultureEvolutionTime = 0; state.vultureUltPowerTime = 0; state.vultureUltPhase = 'idle'; state.vultureUltPulseCooldown = 0; state.vultureAbsorbCooldown = 0; state.vultureFoldCharges = 3; state.vultureFoldRecharge = 0; state.vultureQPressStartedAt = 0; state.vultureQPressSource = ''; state.vultureQPressPointerId = null; state.vultureQPressHoldTriggered = false; state.vultureFoldRangeBonus = 0; state.vulturePulseRadiusBonus = 0; state.vulturePulseDamageBonus = 0; state.vultureScrap = 0; state.vultureOverloadCountdown = 0; state.vultureOverloadTime = 0; state.vultureVulnerableTime = 0; state.vultureVulnerableHitCooldown = 0;
    state.mahoragaParryWindow = 0; state.mahoragaParryCooldown = 0; state.mahoragaShieldHitCooldown = 0; state.mahoragaResistanceType = ''; state.mahoragaResistanceUntilWave = 0; state.mahoragaResistancePower = 0; state.mahoragaCycleStartWave = state.wave; state.mahoragaWheelSegments = 0; state.mahoragaWheelReady = false; state.mahoragaAdaptationVisualTime = 0; state.mahoragaSlashCooldown = 0; state.mahoragaSlashCooldownBonus = 0; state.mahoragaProgress = {}; state.mahoragaAdaptationLevels = {}; state.mahoragaAdaptationWaves = {}; state.mahoragaDamageRemainders = {}; state.mahoragaLastType = ''; state.mahoragaDuplicateBuffTime = 0; state.mahoragaDuplicateBuffBonus = 0; state.mahoragaReviveUsed = false;
    if (mahoragaAwakeningTimer) window.clearTimeout(mahoragaAwakeningTimer);
    if (ui.mahoragaAwakening) { ui.mahoragaAwakening.hidden = true; ui.mahoragaAwakening.classList.remove('is-visible'); }
    state.prismDispatchSkinId = ''; state.prismDispatchSlot = ''; state.prismQCooldown = 0; state.prismHorizonAnchor = null; state.prismHorizonWindowBonus = 0; state.prismHorizonDamageBonus = 0; state.prismCoreRangeBonus = 0; state.prismCoreDamageBonus = 0; state.prismCooldownBonus = 0;
    state.scoreMultiplier = 1; state.magnet = 105; state.pierce = 0; state.critChance = 0; state.armorChance = 0; state.regenLevel = 0; state.regenTimer = 24; state.drones = 0; state.droneCooldown = 0; state.lastBossType = '';
    state.blastRadius = 0; state.bossDamageBonus = 0; state.bonusShots = 0; state.lowHullBoost = 0; state.salvageHeal = 0; state.singularityRadius = 300; state.singularityDuration = 7; state.tempestTideCooldown = 0; state.tempestTideRadiusBonus = 0; state.tempestTideForceBonus = 0; state.reflectTime = 0; state.reflectContacts = new Set(); state.reflectDamageBonus = 0; state.reflectDurationBonus = 0; state.redshiftPerimeter = null; state.redshiftPerimeterCooldown = 0; state.redshiftPerimeterDurationBonus = 0; state.redshiftPerimeterDamageBonus = 0; state.redshiftPerimeterRangeBonus = 0; state.flashTrail = null; state.flashTrailCooldown = 0; state.flashTrailDurationBonus = 0; state.flashTrailDamageBonus = 0; state.flashTrailDensity = 0; state.flashTrailContacts = new Set(); state.eclipseTime = 0; state.eclipsePhase = 'idle'; state.eclipseCutTimer = 0; state.eclipseDurationBonus = 0; state.eclipseCutBonus = 0; state.eclipseCutDamage = 0; state.eclipseHitCooldowns = []; state.eclipseImpactCooldown = 0; state.eclipseParadox = null; state.eclipseParadoxCooldown = 0; state.eclipseParadoxDurationBonus = 0; state.eclipseParadoxRadiusBonus = 0; state.eclipseParadoxSuppressBonus = 0; state.eclipseParadoxDamageBonus = 0; state.eclipseParadoxCooldownBonus = 0; state.dinoRoarBonus = 0; state.dinoRoarRangeBonus = 0; state.dinoRoarCharges = 2; state.dinoRoarRecharge = 0; state.dinoStampedeCharges = 3; state.dinoStampedeRecharge = 0; state.dinoStampedeExtra = 0; state.dinoStampedeDamageBonus = 0; state.saurionSummonCooldownE = 0; state.saurionSummonCooldownQ = 0; state.saurionSummons = []; state.saurionPlayerBuffTime = 0; state.saurionPlayerDamageBuff = 0; state.saurionPlayerFireRateBuff = 0; state.endlessDamage = 0; state.endlessSpeed = 0;
    state.waveDamageTaken = false;
    state.auroraLink = null; state.auroraLinkCooldown = 0; state.auroraLinkDurationBonus = 0; state.auroraLinkTargetBonus = 0; state.auroraLinkDamageBonus = 0; state.auroraUltCharge = 0; state.auroraUlt = null; state.auroraEFirstTapAt = 0; state.auroraEFirstTapCharge = 0; state.damageCounterTotal = 0; state.damageCounterLastHit = 0; state.damageCounterIdle = 0; state.damageCounterPopups = [];
    state.shipEWasCooling = false; state.shipQWasCooling = false; state.shipQChargeCount = skin.id === 'tempest' ? 4 : skin.id === 'saurion' ? 3 : null;
    state.aegisOrbit = null; state.aegisOrbitCooldown = 0; state.aegisOrbitDurationBonus = 0; state.aegisOrbitCountBonus = 0; state.aegisOrbitDamageBonus = 0; state.aegisBarrierCharges = 0; state.aegisBarrierTime = 0;
    state.tempestTideCharges = 4; state.tempestTideChargeBonus = 0; state.tempestTideDamageBonus = 0; state.tempestTideSweepBonus = 0;
    state.chronosEcho = null; state.chronosEchoQueue = []; state.chronosEchoCooldown = 0; state.chronosEchoDurationBonus = 0; state.chronosEchoDamageBonus = 0;
    if (isAllUpgradesProfile() && !state.dailyChallenge && !state.championshipRun) grantAllUpgrades();
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    if (ui.runSummary) { ui.runSummary.hidden = true; ui.runSummary.replaceChildren(); }
    renderSkinPicker();
    updateEquippedShip();
    updateHud();
  }
  function restoreMissionCheckpoint(checkpoint) {
    if (!isDeveloperProfile() || !checkpoint) return;
    const profileBestWave = readProfileResumeWave();
    const beforeBestWave = Math.max(state.bestCompletedWave, readBestWave(), profileBestWave);
    Object.entries(checkpoint.stats || {}).forEach(([key, value]) => {
      if (key in state && typeof state[key] === 'number' && Number.isFinite(Number(value)) && !['width', 'height', 'dpr', 'lastTime', 'raf'].includes(key)) state[key] = Number(value);
    });
    state.bestCompletedWave = Math.max(beforeBestWave, Number(checkpoint.bestCompletedWave) || 0);
    state.wave = Math.max(1, Number(checkpoint.wave) || 1, profileBestWave);
    state.waveStartedAt = Date.now(); state.waveEndedAt = 0;
    state.score = Math.max(0, Number(checkpoint.score) || 0);
    state.elapsed = Math.max(0, Number(checkpoint.elapsed) || 0);
    state.megumiTransformed = checkpoint.megumiTransformed === true && state.selectedSkin === 'megumi';
    state.megumiFormWavesRemaining = state.megumiTransformed ? clamp(Math.floor(Number(checkpoint.megumiFormWavesRemaining) || mahoragaFormWaveLimit), 1, mahoragaFormWaveLimit) : 0;
    state.megumiSummonCooldown = Math.max(0, Number(checkpoint.megumiSummonCooldown) || 0);
    state.megumiTransformSource = state.megumiTransformed ? 'megumi' : '';
    state.megumiSummonPhase = state.megumiTransformed ? 'active' : 'idle';
    if (typeof checkpoint.lastBossType === 'string') state.lastBossType = checkpoint.lastBossType;
    state.upgrades = Object.fromEntries(Object.entries(checkpoint.upgrades || {}).filter(([, level]) => Number(level) > 0).map(([id, level]) => [id, Math.floor(Number(level))]));
    state.shields = clamp(Math.floor(Number(state.shields) || 0), 0, MAX_REGULAR_SHIELDS);
    state.tempShields = clamp(Math.floor(Number(state.tempShields) || 0), 0, Math.min(4, MAX_TOTAL_SHIELDS - state.shields));
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
    state.eclipseParadox = null; state.eclipsePhase = 'idle'; state.eclipseTime = 0; state.eclipseCutTimer = 0;
    state.reflectTime = 0; state.reflectContacts = new Set(); state.flashTrailContacts = new Set();
    state.damageCounterPopups = []; state.damageCounterIdle = 0; state.shipEWasCooling = false; state.shipQWasCooling = false;
    state.mahoragaParryWindow = 0; state.mahoragaParryCooldown = 0; state.mahoragaShieldHitCooldown = 0; state.mahoragaResistanceType = ''; state.mahoragaResistanceUntilWave = 0; state.mahoragaResistancePower = 0; state.mahoragaCycleStartWave = state.wave; state.mahoragaWheelSegments = 0; state.mahoragaWheelReady = false; state.mahoragaAdaptationVisualTime = 0; state.mahoragaSlashCooldown = 0; state.mahoragaSlashCooldownBonus = 0; state.mahoragaProgress = {}; state.mahoragaAdaptationLevels = {}; state.mahoragaAdaptationWaves = {}; state.mahoragaDamageRemainders = {}; state.mahoragaLastType = ''; state.mahoragaDuplicateBuffTime = 0; state.mahoragaDuplicateBuffBonus = 0; state.mahoragaReviveUsed = false;
    const validMahoragaTypes = new Set(Object.keys(mahoragaAttackNames));
    const restoreMahoragaMap = (source, maximum, allowFractions = false) => Object.fromEntries(Object.entries(source || {}).filter(([type, value]) => validMahoragaTypes.has(type) && Number.isFinite(Number(value)) && Number(value) > 0).map(([type, value]) => [type, allowFractions ? Math.max(0, Math.min(.999, Number(value))) : Math.min(maximum, Math.floor(Number(value)))]));
    state.mahoragaProgress = restoreMahoragaMap(checkpoint.mahoraga?.progress, 4);
    state.mahoragaAdaptationLevels = restoreMahoragaMap(checkpoint.mahoraga?.adaptationLevels, 3);
    state.mahoragaAdaptationWaves = restoreMahoragaMap(checkpoint.mahoraga?.adaptationWaves, Math.max(1, state.wave));
    state.mahoragaDamageRemainders = restoreMahoragaMap(checkpoint.mahoraga?.damageRemainders, 1, true);
    state.mahoragaLastType = validMahoragaTypes.has(checkpoint.mahoraga?.lastType) ? checkpoint.mahoraga.lastType : '';
    state.mahoragaWheelSegments = Math.min(8, Math.max(0, Math.floor(Number(checkpoint.mahoraga?.wheelSegments) || 0)));
    state.mahoragaWheelReady = checkpoint.mahoraga?.wheelReady === true || state.mahoragaWheelSegments >= 8;
    state.mahoragaResistanceType = validMahoragaTypes.has(checkpoint.mahoraga?.resistanceType) ? checkpoint.mahoraga.resistanceType : '';
    state.mahoragaCycleStartWave = Math.max(1, Math.floor(Number(checkpoint.mahoraga?.cycleStartWave) || state.wave));
    Object.keys(state.mahoragaAdaptationLevels).forEach((type) => {
      if (state.wave > (state.mahoragaAdaptationWaves[type] || 0) + 4) {
        delete state.mahoragaAdaptationLevels[type]; delete state.mahoragaAdaptationWaves[type]; delete state.mahoragaDamageRemainders[type]; delete state.mahoragaProgress[type];
      }
    });
    state.mahoragaDuplicateBuffTime = state.megumiTransformed ? clamp(Number(checkpoint.mahoraga?.duplicateBuffTime) || 0, 0, 10) : 0;
    state.mahoragaDuplicateBuffBonus = state.megumiTransformed ? clamp(Number(checkpoint.mahoraga?.duplicateBuffBonus) || 0, 0, .6) : 0;
    state.mahoragaReviveUsed = state.megumiTransformed && checkpoint.mahoraga?.reviveUsed === true;
    syncMahoragaResistanceSummary(state.mahoragaResistanceType);
    updateMahoragaFormControls();
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
        if (!upgradeCanBeOffered(upgrade)) continue;
        upgrade.apply();
        state.upgrades[upgrade.id] = upgradeLevel(upgrade.id) + 1;
        changed = true;
      }
    }
    state.shields = Math.min(MAX_REGULAR_SHIELDS, MAX_TOTAL_SHIELDS - state.tempShields);
    state.lives = state.maxLives;
  }
  function startGame(dailyChallenge = false, checkpoint = null, championshipRun = false) {
    if (!isDeveloperProfile()) checkpoint = null;
    if (!['intro', 'gameover'].includes(state.mode)) return;
    refreshDeviceSizing();
    cancelAnimationFrame(state.raf);
    if (ui.dailySummaryModal) ui.dailySummaryModal.hidden = true;
    syncAudioVisibility();
    state.championshipRun = Boolean(championshipRun && championshipAccessOpen());
    state.championshipBestWave = 0;
    state.pendingChampionshipRun = false;
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
      ui.status.textContent = state.dailyChallenge ? `Desafio diário de ${formatChallengeDate(state.challengeDate)}. Boa sorte, piloto!` : state.championshipRun ? 'Missão do campeonato iniciada. Complete objetivos e concorra no placar do evento!' : isAllUpgradesProfile() ? 'Missão iniciada com todos os upgrades disponíveis.' : 'Missão iniciada. Sobreviva à primeira onda!';
      if (state.dailyChallenge) toast('DESAFIO DIÁRIO · NAVE AURORA');
      else if (state.championshipRun) toast('CAMPEONATO · MISSÕES DIÁRIAS ATIVAS');
      else if (isAllUpgradesProfile()) toast('UPGRADES MÁXIMOS EQUIPADOS');
      recordAchievementEvent('mission');
      recordAchievementEvent('wave', state.wave);
      if (window.CV_GAMES_STATS?.recordPlay) window.CV_GAMES_STATS.recordPlay(gameId);
    }
    state.lastTime = performance.now();
    state.raf = requestAnimationFrame(frame);
  }
  function pauseGame() {
    if (state.megumiSummonPhase === 'cinematic') return;
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
  function createRunRecord(wave = state.wave) {
    return {
      wave:Math.max(1, Math.floor(Number(wave) || state.wave)), score:state.score, elapsed_seconds:Math.floor(state.elapsed),
      wave_started_at:new Date(state.waveStartedAt || Date.now()).toISOString(), wave_ended_at:new Date(state.waveEndedAt || Date.now()).toISOString(), updated_at:new Date().toISOString(),
      ship_id:state.selectedSkin, ship_name:(skins.find((skin) => skin.id === state.selectedSkin) || currentSkin()).name,
      buff_summary: {
        dano:(state.player.damage * (1 + state.endlessDamage)).toFixed(2), velocidade:Math.round(Math.min(525, state.player.speed + state.endlessSpeed)),
        recarga:state.player.fireRate.toFixed(2) + 's', recarga_habilidade:state.abilityBaseCooldown.toFixed(1) + 's', disparos:state.player.spread + state.bonusShots,
        drones:state.drones, perfuracao:state.pierce, chance_critica:Math.round(state.critChance * 100) + '%',
        escudos:state.shields, vida_maxima:state.maxLives, reparo_dest:Math.round(state.salvageHeal * 3.5) + '%',
        explosao:state.blastRadius, dano_chefe:Math.round(state.bossDamageBonus * 100) + '%', buraco_negro:currentSkin().id === 'tempest' ? Math.round(state.singularityRadius) : 0,
        melhorias:Object.values(state.upgrades).reduce((sum, value) => sum + value, 0),
        reforco_adaptativo:Math.round(state.endlessDamage * 100) + '%', impulso_extra:Math.round(state.endlessSpeed), magnetismo:Math.round(state.magnet),
        melhorias_detalhadas:upgradeList.filter((upgrade) => upgradeLevel(upgrade.id) > 0).map((upgrade) => ({ id:upgrade.id, nome:upgrade.name, icone:upgrade.icon, nivel:upgradeLevel(upgrade.id) }))
      }
    };
  }
  function finishGame() {
    if (state.mode === 'gameover') return;
    const championshipRun = state.championshipRun;
    state.waveEndedAt = Date.now();
    state.megumiTransformed = false; state.megumiFormWavesRemaining = 0; state.megumiTransformSource = ''; state.megumiSummonPhase = 'idle'; state.megumiCloakTime = 0; state.megumiRabbits = []; state.mahoragaAdaptationVisualTime = 0;
    ui.stage?.classList.remove('starfall-megumi-shadow-veil');
    if (ui.megumiFormTimer) ui.megumiFormTimer.hidden = true;
    if (ui.megumiCutscene) { ui.megumiCutscene.hidden = true; ui.megumiCutscene.setAttribute('aria-hidden', 'true'); }
    if (!state.dailyChallenge) clearMissionCheckpoint();
    setMode('gameover');
    const dailyRun = state.dailyChallenge;
    const completedChampionshipWave = Math.max(0, state.championshipBestWave);
    const newRecord = !dailyRun && !championshipRun && state.score > state.best;
    if (newRecord) { state.best = state.score; saveBest(); }
    updateHud();
    ui.title.textContent = dailyRun ? 'DESAFIO CONCLUÍDO' : championshipRun ? 'FIM DA RODADA DO CAMPEONATO' : newRecord ? 'NOVO RECORDE!' : 'A missão acabou.';
    ui.copy.textContent = dailyRun
      ? `Desafio de ${formatChallengeDate(state.challengeDate)}: você chegou à onda ${state.wave}, marcou ${state.score} pontos e sobreviveu por ${formatTime(state.elapsed)}.`
      : championshipRun ? `Rodada do campeonato: você concluiu ${completedChampionshipWave} ondas, marcou ${state.score} pontos e sobreviveu por ${formatTime(state.elapsed)}.`
        : `Você chegou à onda ${state.wave}, marcou ${state.score} pontos e sobreviveu por ${formatTime(state.elapsed)}.`;
    ui.start.textContent = '↻ TENTAR DE NOVO';
    ui.status.textContent = dailyRun ? 'Seu resultado diário foi guardado neste dispositivo.' : championshipRun ? 'A rodada foi encerrada; o resultado do campeonato foi atualizado.' : 'Nave perdida. Uma nova missão pode começar quando quiser.';
    const run = createRunRecord(championshipRun ? Math.max(1, state.championshipBestWave) : state.wave);
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
    } else if (championshipRun) {
      if (state.championshipBestWave > 0 && run.ship_id !== 'prisma') queueChampionshipScore(run);
      if (ui.rankStatus) ui.rankStatus.textContent = state.championshipBestWave > 0 ? 'Resultado enviado para o campeonato.' : 'Conclua ao menos uma onda para entrar no placar do campeonato.';
      state.championshipRun = false;
      state.championshipBestWave = 0;
    } else if (run.ship_id === 'prisma') {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Missão com a Prisma Real: não conta para o placar. Seu recorde local foi guardado.';
    } else queueRunSubmission(run);
    tone(newRecord ? 520 : 170, .3, newRecord ? 'triangle' : 'sawtooth', .05);
    if (dailyRun && state.skinBeforeDaily) {
      state.selectedSkin = state.skinBeforeDaily;
      state.skinBeforeDaily = '';
      renderSkinPicker();
      updateEquippedShip();
    }
  }
  function chooseUpgradeOffers(limit = 3) {
    const availableUpgrades = upgradeList.filter(upgradeCanBeOffered);
    const choices = [];
    while (availableUpgrades.length && choices.length < limit) {
      const weights = availableUpgrades.map((upgrade) => currentSkin().id === 'training' && ['rapid','magnet','ferrumCharge','ferrumDashRange'].includes(upgrade.id) ? 3 : upgrade.id === 'spread' || upgrade.id === 'volley' ? 1.7 : 1);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let roll = randomUnit('upgrades') * totalWeight;
      let selectedIndex = 0;
      for (; selectedIndex < weights.length - 1; selectedIndex++) {
        roll -= weights[selectedIndex];
        if (roll < 0) break;
      }
      choices.push(availableUpgrades.splice(selectedIndex, 1)[0]);
    }
    return choices;
  }
  function openFerrumBuffChoice() {
    if (!ui.upgrade || !ui.upgradeOptions) return false;
    const choices = chooseUpgradeOffers(3);
    if (!choices.length) return false;
    const kicker = ui.upgrade.querySelector('.starfall-kicker');
    const heading = ui.upgrade.querySelector('h2');
    const copy = ui.upgrade.querySelector(':scope > p:not(.starfall-kicker)');
    if (kicker) kicker.textContent = 'SUPRIMENTO FERRUM';
    if (heading) heading.textContent = 'Escolha um reforço';
    if (copy) copy.textContent = 'A carga virou uma melhoria. E/Q da Ferrum usam cargas, sem recarga por tempo; procure mais coleta, tiros rápidos, carga para o G ou alcance de Q.';
    ui.upgradeOptions.replaceChildren();
    setMode('upgrade');
    ui.status.textContent = 'Escolha um reforço encontrado na carga de treino.';
    for (const upgrade of choices) {
      const button = createUpgradeCard(upgrade);
      button.addEventListener('click', () => {
        if (!applyUpgradeChoice(upgrade)) return;
        if (kicker) kicker.textContent = 'SINAL DE REABASTECIMENTO';
        if (heading) heading.textContent = 'Escolha sua melhoria';
        if (copy) copy.textContent = 'Uma decisão muda sua próxima onda.';
        updateHud();
        toast('SUPRIMENTO FERRUM · ' + upgrade.name.toLocaleUpperCase('pt-BR'));
        setMode('playing'); ui.status.textContent = `Onda ${state.wave}. Boa sorte, piloto.`;
        state.lastTime = performance.now(); state.raf = requestAnimationFrame(frame);
      });
      ui.upgradeOptions.append(button);
    }
    tone(640, .2, 'triangle', .04);
    return true;
  }
  function collectFerrumCharge() {
    const reward = randomUnit('loot');
    if (reward >= .68 && openFerrumBuffChoice()) return 'SUPRIMENTO · ESCOLHA UM REFORÇO';
    const prefersLife = reward < .34;
    const hasLifeRoom = state.lives < state.maxLives;
    const hasShieldRoom = canRestoreShield();
    if ((prefersLife && hasLifeRoom) || (!hasShieldRoom && hasLifeRoom)) {
      state.lives = Math.min(state.maxLives, state.lives + 1);
      return 'CARGA FERRUM · +1 VIDA';
    }
    if (hasShieldRoom) {
      restoreOneShield();
      return 'CARGA FERRUM · +1 ESCUDO';
    }
    if (state.tempShields < 4 && totalShieldCount() < MAX_TOTAL_SHIELDS) {
      state.tempShields += 1;
      return 'CARGA FERRUM · +1 BARREIRA TEMPORÁRIA';
    }
    state.score += 250;
    return 'CARGA FERRUM · +250 PONTOS';
  }
  function openUpgrade() {
    const completedWave = state.wave;
    state.waveEndedAt = Date.now();
    const kicker = ui.upgrade.querySelector('.starfall-kicker');
    const heading = ui.upgrade.querySelector('h2');
    const copy = ui.upgrade.querySelector(':scope > p:not(.starfall-kicker)');
    if (kicker) kicker.textContent = 'SINAL DE REABASTECIMENTO';
    if (heading) heading.textContent = 'Escolha sua melhoria';
    if (copy) copy.textContent = 'Uma decisão muda sua próxima onda.';
    state.damageCounterTotal = 0; state.damageCounterLastHit = 0; state.damageCounterIdle = 0; state.damageCounterPopups = [];
    if (!state.waveDamageTaken) recordAchievementEvent('clean-wave');
    recordAchievementEvent('wave', completedWave);
    if (state.wave > state.bestCompletedWave) { state.bestCompletedWave = state.wave; saveBestWave(); renderSkinPicker(); persistAccountShipProgress(); }
    saveNicknameCompletedWave(rankNickname(), completedWave);
    if (state.championshipRun) {
      state.championshipBestWave = Math.max(state.championshipBestWave, completedWave);
      if (state.selectedSkin !== 'prisma') queueChampionshipScore(createRunRecord(completedWave));
    } else if (!state.dailyChallenge && state.selectedSkin !== 'prisma') queueRunSubmission(createRunRecord(completedWave));
    if (state.championshipRun || isTestProfile()) updateChampionshipMission('waves', 1);
    setMode('upgrade');
    state.wave += 1;
    if (state.megumiTransformed) {
      state.megumiFormWavesRemaining = Math.max(0, state.megumiFormWavesRemaining - 1);
      if (state.megumiFormWavesRemaining === 0) deactivateMahoragaForm({ expired:true });
      else updateMahoragaFormControls();
    }
    updateMahoragaAdaptationForWave();
    if (Math.floor((state.wave - 1) / 15) !== Math.floor((state.wave - 2) / 15)) toast('NOVO PLANETA: ' + currentZone().name.toUpperCase());
    updateHud();
    ui.status.textContent = 'Escolha uma melhoria antes da próxima onda.';
    const choices = chooseUpgradeOffers(3);
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
      const button = createUpgradeCard(upgrade);
      button.addEventListener('click', () => {
        if (!applyUpgradeChoice(upgrade)) return;
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
    state.waveStartedAt = Date.now(); state.waveEndedAt = 0;
    state.enemiesRequired = 10 + Math.floor(state.wave * 1.75) + Math.floor(state.wave / 10) * 2;
    state.waveKills = 0; state.bossWave = state.wave % 10 === 0 || state.wave === 15; state.bossSpawned = false;
    const waveInCycle = state.wave % 10;
    state.miniBossSpawned = false; state.miniBossTimer = !state.bossWave && (waveInCycle === 4 || waveInCycle === 8) ? 3.5 : 0;
    state.enemySpawn = .31; state.waveGrace = .4; state.powerSpawn = 7.5;
    state.waveDamageTaken = false; state.salvageHealsThisWave = 0;
    recordAchievementEvent('wave', state.wave);
    const auroraWave = state.wave === 15;
    ui.status.textContent = auroraWave ? `Onda ${state.wave}: Aurora se aproxima!` : state.bossWave ? `Onda ${state.wave}: sinal de guardião detectado!` : `Onda ${state.wave}: novos inimigos se aproximam.`;
    if (state.bossWave && !auroraWave) toast(`GUARDIÃO NA ONDA ${state.wave}`);
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
    if (state.wave >= 2 && roll > .32) kind = 'drone';
    if (state.wave >= 3 && roll > .66) kind = 'hunter';
    if (state.wave >= 6 && roll > .855) kind = 'brute';
    if (state.wave >= 4 && roll > .985 && !state.enemies.some((enemy) => enemy.kind === 'ricochet' && !enemy.dead)) kind = 'ricochet';
    const tier = Math.floor((state.wave - 1) / 10);
    const multiplier = Math.min(2.45, 1 + (state.wave - 1) * .025 + tier * .08) * enemyUpgradeSpeedScale() * enemyWaveSpeedScale();
    const hpScale = (1 + tier * .68 + Math.floor((state.wave - 1) / 20) * .36) * enemyUpgradeHpScale() * enemyWaveHpScale();
    const config = {
      meteor: { r: random(15, 23, 'enemy') + Math.min(8, tier), hp: Math.ceil((2 + Math.floor(state.wave / 8)) * hpScale), speed: random(64, 92, 'enemy') * multiplier, score: 85, color: '#f6a26f' },
      drone: { r: 16 + Math.min(5, tier), hp: Math.ceil((3 + Math.floor(state.wave / 6)) * hpScale), speed: random(88, 116, 'enemy') * multiplier, score: 145, color: '#ff5fa4', shoot: random(.88, 1.3, 'attack') },
      hunter: { r: 14 + Math.min(4, tier), hp: Math.ceil((3 + Math.floor(state.wave / 5)) * hpScale), speed: Math.min(280, random(145, 170, 'enemy') * (1 + Math.min(state.wave - 1, 28) * .026)) * enemyUpgradeSpeedScale() * enemyWaveSpeedScale(), score: 185, color: '#b68aff' },
      brute: { r: 26 + Math.min(8, tier * 2), hp: Math.ceil((8 + Math.floor(state.wave / 3)) * hpScale), speed: 49 * multiplier, score: 280, color: '#ffcf69', shoot: 1.55 },
      ricochet: { r: 17 + Math.min(6, tier), hp: Math.ceil((4 + Math.floor(state.wave / 6)) * hpScale), speed: random(72, 98, 'enemy') * multiplier, score: 210, color: '#71eaff', shoot: random(.95, 1.5, 'attack') }
    }[kind];
    config.r = mobileSize(config.r);
    state.enemies.push({ ...pos, ...config, kind, maxHp: config.hp, cooldown: config.shoot || 0, spin: random(-2, 2, 'enemy'), angle: random(0, 7, 'enemy'), ramCooldown: 0, hitFlash: 0 });
  }
  function selectBossType(isMini = false) {
    if (!isMini && state.wave === 15) return 'aurora';
    if (!isMini && state.wave === 10) return 'drone';
    const types = Object.keys(bossTypes).filter((type) => type !== 'aurora');
    const options = state.lastBossType && types.length > 1
      ? types.filter((type) => type !== state.lastBossType)
      : types;
    return options[Math.floor(randomUnit('boss') * options.length)] || 'drone';
  }
  function spawnBoss(isMini = false) {
    if (!isMini) {
      if (state.bossSpawned) return;
      state.bossSpawned = true;
    }
    const bossType = selectBossType(isMini);
    if (!isMini) state.lastBossType = bossType;
    const tier = Math.floor((state.wave - 1) / 10);
    const hp = isMini
      ? Math.round(Math.min(18, 5 + tier * 2) * enemyUpgradeHpScale())
      : Math.round((115 + state.wave * 9 + Math.pow(state.wave / 5, 2) * 15 + tier * 55) * .72 * enemyUpgradeHpScale() * enemyWaveHpScale());
    const boss = bossTypes[bossType];
    const radius = isMini ? random(21, 26, 'boss') : bossType === 'brute' || bossType === 'mine' ? 47 : 40;
    state.enemies.push({
      x: random(state.width * .3, state.width * .7, 'boss'), y: isMini ? -30 : -55,
      r: mobileSize(radius), hp, maxHp: hp,
      speed: (isMini ? 43 + Math.min(24, tier * 2) : 66 + Math.min(44, tier * 5)) * enemyUpgradeSpeedScale() * enemyWaveSpeedScale(),
      score: isMini ? 350 + state.wave * 35 : 1900 + state.wave * 180,
      color: boss.color, kind: 'boss', bossType, bossName: (isMini ? 'Mini-chefe ' : '') + boss.name,
      isMiniBoss: isMini, phase: 1, cooldown: isMini ? 2.25 : .72,
      angle: 0, spin: .35, ramCooldown: 0, dashTime: 0, dashCooldown: 2.2, hitFlash: 0,
      drift: random(0, Math.PI * 2, 'boss'),
      auroraECooldown: bossType === 'aurora' ? auroraBossDefaults.eOpeningDelay : 0,
      auroraEWarning: 0, auroraEWarningX: 0, auroraEWarningY: 0,
      auroraQCooldown: bossType === 'aurora' ? auroraBossDefaults.qOpeningDelay : 0,
      auroraQActive: 0, auroraQPulseTimer: 0, auroraQWarning: 0,
      auroraQSequenceRemaining: 0, auroraQSequenceTotal: 0, auroraQAttempt: 0, auroraQSequenceTimer: 0,
      auroraQWarningTotal: 0, auroraQWarningRadius: 0, auroraQTargetX: 0, auroraQTargetY: 0, auroraReflectionCooldown: 0,
      auroraUltUses: 0, auroraUltLastPhase: 0, auroraUltWarning: 0, auroraUltWarningTotal: 0,
      auroraUltTargetX: 0, auroraUltTargetY: 0, auroraUltRadius: 0, auroraUltActive: 0, auroraUltActiveTotal: 0, auroraUltPulseTimer: 0, auroraUltHitCooldown: 0, auroraUltHits: 0,
      auroraMoveTimer: 0, auroraMoveMode: 'roam', auroraChaseAngle: 0,
      auroraTargetX: state.width / 2, auroraTargetY: state.height / 2,
      auroraDodgeScanTimer: 0, auroraDodgeCooldown: 0, auroraDodgeTime: 0,
      auroraDodgeX: 0, auroraDodgeY: 0, auroraDodgeSide: 1
    });
    toast(bossType === 'aurora' && !isMini ? 'ENFRENTE AURORA' : (isMini ? 'MINI-CHEFE: ' : '') + boss.name.toUpperCase());
    if (!isMini) tone(90, .7, 'sawtooth', .045);
  }
  function spawnPickup(x, y, kind) {
    const pickupKind = kind || (randomUnit('loot') < .06 ? 'charge' : randomUnit('loot') > .5 ? 'repair' : 'shield');
    state.pickups.push({ x, y, kind: pickupKind, r: mobileSize(11), life: 10, spin: 0 });
  }
  function spawnBossRewards(enemy) {
    spawnPickup(enemy.x - mobileSize(13), enemy.y, 'charge');
    const recoveryKinds = [];
    if (state.lives < state.maxLives) recoveryKinds.push('repair');
    if (canRestoreShield()) recoveryKinds.push('shield');
    const recoveryChance = Math.max(.2, .92 - lateWavePressure() * .012);
    if (recoveryKinds.length && randomUnit('loot') < recoveryChance) {
      const index = Math.floor(randomUnit('loot') * recoveryKinds.length);
      spawnPickup(enemy.x + mobileSize(13), enemy.y, recoveryKinds[index]);
    }
  }
  function collectPickup(pickup) {
    if (!pickup || pickup.dead) return false;
    pickup.dead = true;
    if (pickup.kind === 'vulture-scrap' && currentSkin().id === 'vulture') {
      state.vultureScrap = Math.min(8, state.vultureScrap + 1);
      const image = vultureScrapSprites[pickup.scrapType];
      const colors = ['#ff7133','#ff9f52','#d9c2b8','#ffb244','#7e727a'];
      burst(pickup.x, pickup.y, colors[pickup.scrapType] || '#ff8a3d', 9, 70);
      if (image?.complete && image.naturalWidth) state.effects.push({ type:'vulture-scrap-collect', x:pickup.x, y:pickup.y, image, life:.4, total:.4 });
      if (state.vultureScrap >= 8 && state.vultureOverloadCountdown <= 0) {
        state.vultureOverloadCountdown = 10;
        toast('NÚCLEO NO LIMITE · 10s PARA USAR Q OU G');
        tone(540, .24, 'sawtooth', .045);
        updateHud();
      }
      else { tone(740 + state.vultureScrap * 18, .12, 'triangle', .04); updateHud(); }
      return true;
    }
    if (pickup.kind === 'repair') { state.lives = Math.min(state.maxLives, state.lives + 1); toast('CASCO REPARADO +1 VIDA'); }
    else if (pickup.kind === 'charge') {
      if (currentSkin().id === 'training') {
        toast(collectFerrumCharge());
      } else {
        state.abilityCooldown = Math.max(0, state.abilityCooldown - 8);
        state.prismQCooldown = Math.max(0, state.prismQCooldown - 8);
        const selectedSources = currentSkin().id === 'prisma'
          ? ['e','q'].map((slot) => prismChoiceParts(state.prismAbilityChoices[slot]))
          : [{ shipId:currentSkin().id, key:'q' }];
        for (const { shipId, key } of selectedSources) {
          if (key !== 'q') continue;
          if (shipId === 'aurora') state.auroraLinkCooldown = Math.max(0, state.auroraLinkCooldown - 8);
          if (shipId === 'eclipse') state.eclipseParadoxCooldown = Math.max(0, state.eclipseParadoxCooldown - 8);
          if (shipId === 'aegis') state.aegisOrbitCooldown = Math.max(0, state.aegisOrbitCooldown - 8);
          if (shipId === 'redshift') state.redshiftPerimeterCooldown = Math.max(0, state.redshiftPerimeterCooldown - 8);
          if (shipId === 'flashblade') state.flashTrailCooldown = Math.max(0, state.flashTrailCooldown - 8);
          if (shipId === 'tempest') { state.tempestTideCooldown = Math.max(0, state.tempestTideCooldown - 8); advanceTempestTideRecharge(0); }
          if (shipId === 'chronos') state.chronosEchoCooldown = Math.max(0, state.chronosEchoCooldown - 8);
          if (shipId === 'saurion') advanceDinoStampedeRecharge(8);
        }
        toast('CARGA DE HABILIDADE −8s');
      }
    } else { const restored = restoreOneShield(); toast(restored ? 'ESCUDO DE ENERGIA +1' : 'ESCUDOS NO LIMITE · +0'); }
    const color = pickup.kind === 'repair' ? '#76ffae' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff';
    burst(pickup.x, pickup.y, color, 14, 90); tone(780, .17, 'sine', .04); updateHud();
    return true;
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
  function nearestEnemyFrom(source) {
    return state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(source, a) - distance(source, b))[0] || null;
  }
  function fireAt(target) {
    if (!target || vultureUltCollapseActive()) return;
    const angle = Math.atan2(target.y - state.player.y, target.x - state.player.x);
    const totalShots = state.player.spread + state.bonusShots;
    const mahoragaDamageBuff = mahoragaAdaptationActive() ? 1 + state.mahoragaDuplicateBuffBonus : 1;
    const saurionDamageBuff = currentSkin().id === 'saurion-primal' && state.saurionPlayerBuffTime > 0 ? 1 + state.saurionPlayerDamageBuff : 1;
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
      const regularShotColor = megumiShadowCloakActive() ? '#8c78b7' : currentSkin().id === 'training' ? '#f2f5fb' : currentSkin().accent;
      const shot = { x: state.player.x + Math.cos(direction) * mobileSize(13), y: state.player.y + Math.sin(direction) * mobileSize(13), vx: Math.cos(direction) * 510, vy: Math.sin(direction) * 510, r: mobileSize(critical ? 5 : 3.5), damage: state.player.damage * (1 + state.endlessDamage) * mahoragaDamageBuff * saurionDamageBuff * (critical ? 2 : 1), pierce: state.pierce, hit: [], assistTarget: bossAssist ? target : null, color: currentSkin().id === 'vulture' ? critical ? '#fff0a6' : '#ffad55' : megumiShadowCloakActive() ? critical ? '#d7c8f4' : regularShotColor : critical ? '#ffe38a' : regularShotColor, megumiShadowShot:megumiShadowCloakActive(), vultureEnergyShot:currentSkin().id === 'vulture', playerPrimaryShot:true, charge:0 };
      state.bullets.push(shot);
      queueChronosEcho(shot);
    }
    tone(420, .035, 'square', .01);
  }
  function queueChronosEcho(shot) {
    if (!abilitySourceIs('chronos') || !state.chronosEcho || state.chronosEcho.life <= 0 || state.chronosEchoQueue.length >= 420) return;
    const echoBullet = { ...shot, damage: shot.damage * (.7 + state.chronosEchoDamageBonus), color: '#d6c4ff', hit: [], chronosEchoShot: true };
    state.chronosEchoQueue.push({ delay: .30, bullet: echoBullet });
  }
  function enemyAimTarget(enemy = null) {
    if (megumiShadowCloakActive()) return { x:state.megumiCloakLastX, y:state.megumiCloakLastY };
    if (vultureCloakActive()) {
      if (enemy && (!enemy.vultureSearchTarget || distance(enemy, enemy.vultureSearchTarget) < mobileSize(24))) {
        const margin = mobileSize(42);
        enemy.vultureSearchTarget = {
          x:random(margin, Math.max(margin, state.width - margin), 'attack'),
          y:random(margin, Math.max(margin, state.height - margin), 'attack')
        };
      }
      return enemy?.vultureSearchTarget || { x:state.width * .5, y:state.height * .5 };
    }
    const rabbit = state.megumiRabbits.filter((shikigami) => shikigami.life > 0).sort((a, b) => distance(enemy || state.player, a) - distance(enemy || state.player, b))[0];
    if (rabbit) return rabbit;
    const saurionDecoy = currentSkin().id === 'saurion-primal' ? saurionSummons().find((summon) => summon.kind === 'trike' && summon.provokeTime > 0) : null;
    if (currentSkin().id === 'saurion-primal' && saurionDecoy?.kind === 'trike' && saurionDecoy.provokeTime > 0) return saurionDecoy;
    return state.player;
  }
  function enemyFire(enemy) {
    if (megumiShadowCloakActive() || vultureCloakActive()) return;
    const vultureField = activeVultureUltField();
    if (vultureField && distance(enemy, vultureField) <= vultureField.radius + enemy.r) return;
    const vortex = state.effects.find((effect) => effect.type === 'flamestorm-vortex' && effect.life > 0);
    if (vortex && (enemy.kind === 'boss' || enemy.isMiniBoss) && distance(enemy, vortex) <= vortex.radius + enemy.r) return;
    const target = enemyAimTarget(enemy);
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const shot = (a, speed, r, extras = {}) => {
      const scaledSpeed = speed * enemyUpgradeAttackScale() * enemyWaveProjectileScale();
      state.enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.r * .35, vx: Math.cos(a) * scaledSpeed, vy: Math.sin(a) * scaledSpeed, r: mobileSize(r || 5), color: enemy.color, source: enemy, ...extras });
    };
    if (enemy.isMiniBoss) {
      const speed = Math.min(285, 175 + state.wave * 1.35);
      if (enemy.bossType === 'prism') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .24, speed, 5, { bounces: 1, damage: 1 });
      } else if (enemy.bossType === 'brute') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .2, speed * .82, 5, { damage: 1 });
      } else if (enemy.bossType === 'storm') {
        for (let i = -2; i <= 2; i++) shot(angle + i * .25, speed * .9, 4, { damage: 1 });
      } else if (enemy.bossType === 'mine') {
        shot(angle, speed * .62, 6, { explosive:true, fuse:1.45, blastRadius:58, damage:1 });
      } else if (enemy.bossType === 'lancer') {
        shot(angle, speed * 1.38, 5, { damage:1 });
      } else if (enemy.bossType === 'mirror') {
        for (let i = -1; i <= 1; i++) shot(angle + i * .3, speed * .92, 4, { bounces:2, damage:1 });
      } else if (enemy.bossType === 'rift') {
        shot(angle, speed * .9, 5, { homingTime:1, turnRate:1.8, damage:1 });
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
      } else if (enemy.kind === 'drone') {
        const speed = Math.min(360, 210 + state.wave * 2.8);
        for (let spread = -1; spread <= 1; spread++) shot(angle + spread * .12, speed, 5, { damage: 1 });
      } else shot(angle, Math.min(360, 210 + state.wave * 2.8), 5, { damage: 1 });
      tone(150, .06, 'sawtooth', .012); return;
    }
    const phase = enemy.phase || 1;
    const speedScale = 1 + (phase - 1) * .12;
    const bossShot = (a, speed, r, extras = {}) => shot(a, speed * speedScale, r, { damage: phase >= 4 ? 3 : phase >= 3 ? 2 : 1, ...extras });
    if (phase >= 4) {
      const now = performance.now() / 1000;
      if (enemy.bossType === 'aurora') {
        const count = 12;
        for (let i = 0; i < count; i++) bossShot(now * .5 + i * Math.PI * 2 / count, 190 + state.wave * .3, 5, { damage: 3 });
        for (let i = -2; i <= 2; i++) bossShot(angle + i * .14, 270 + state.wave * .4, 5, { damage: 3 });
      } else if (enemy.bossType === 'meteor') {
        const count = 20;
        for (let i = 0; i < count; i++) bossShot(now * .7 + i * Math.PI * 2 / count, 172 + state.wave * .35, 6, { damage:3 });
        for (let i = -1; i <= 1; i++) bossShot(angle + i * .12, 285 + state.wave * .45, 7, { damage:3 });
      } else if (enemy.bossType === 'drone') {
        for (let i = -5; i <= 5; i++) bossShot(angle + i * .13, 276 + state.wave * .45, 5, { damage:3 });
        bossShot(angle - .035, 330 + state.wave * .55, 5, { damage:3 });
        bossShot(angle + .035, 330 + state.wave * .55, 5, { damage:3 });
      } else if (enemy.bossType === 'brute') {
        for (let i = -4; i <= 4; i++) bossShot(angle + i * .18, 190 + state.wave * .35, i === 0 ? 8 : 6, { damage:3 });
        for (let i = -1; i <= 1; i++) bossShot(angle + i * .3, 255 + state.wave * .4, 6, { bounces:1, damage:3 });
      } else if (enemy.bossType === 'hunter') {
        for (let i = -3; i <= 3; i++) bossShot(angle + i * .075, 305 + state.wave * .6, 6, { damage:3 });
        bossShot(angle - .22, 265 + state.wave * .5, 5, { damage:3 });
        bossShot(angle + .22, 265 + state.wave * .5, 5, { damage:3 });
      } else if (enemy.bossType === 'prism') {
        const count = 14;
        for (let i = 0; i < count; i++) bossShot(now * .42 + i * Math.PI * 2 / count, 215 + state.wave * .35, 6, { bounces:2, damage:3 });
      } else if (enemy.bossType === 'storm') {
        const count = 9;
        for (let arm = 0; arm < 2; arm++) for (let i = 0; i < count; i++) {
          bossShot(now * .58 + arm * Math.PI + i * Math.PI * 2 / count, 190 + state.wave * .35, 5, { damage:3 });
        }
      } else if (enemy.bossType === 'mine') {
        for (let i = -3; i <= 3; i++) bossShot(angle + i * .24, 108 + state.wave * .3, 7, { explosive:true, fuse:1.45, blastRadius:104, damage:3 });
      } else if (enemy.bossType === 'lancer') {
        for (let i = -3; i <= 3; i++) bossShot(angle + i * .055, 355 + state.wave * .65, 6, { damage:3 });
      } else if (enemy.bossType === 'mirror') {
        for (let i = -5; i <= 5; i++) bossShot(angle + Math.sin(now * .8) * .12 + i * .17, 188 + state.wave * .35, 5, { bounces:2, damage:3 });
      } else if (enemy.bossType === 'rift') {
        for (let i = -2; i <= 2; i++) bossShot(angle + i * .16, 190 + state.wave * .35, 6, { homingTime:2.15, turnRate:1.65, damage:3 });
      }
      tone(125, .1, 'sawtooth', .02); return;
    }
    if (enemy.bossType === 'aurora') {
      const spread = phase >= 3 ? 2 : phase === 2 ? 1 : 0;
      for (let i = -spread; i <= spread; i++) bossShot(angle + i * .19, 245 + state.wave * .38, 5);
      if (phase >= 2) {
        bossShot(angle - .08, 295 + state.wave * .3, 4);
        bossShot(angle + .08, 295 + state.wave * .3, 4);
      }
    } else if (enemy.bossType === 'meteor') {
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
    } else if (enemy.bossType === 'prism') {
      const count = phase >= 3 ? 8 : phase === 2 ? 6 : 4;
      const start = performance.now() / 1000;
      for (let i = 0; i < count; i++) bossShot(start + i * Math.PI * 2 / count, 230 + state.wave, 6, { bounces: 1 });
    } else if (enemy.bossType === 'storm') {
      const count = phase >= 3 ? 7 : phase === 2 ? 6 : 5;
      const start = performance.now() / 1450 + enemy.drift;
      for (let arm = 0; arm < 2; arm++) for (let i = 0; i < count; i++) {
        bossShot(start + arm * Math.PI + i * Math.PI * 2 / count, 205 + state.wave, 5);
      }
    } else if (enemy.bossType === 'mine') {
      const count = phase >= 3 ? 5 : phase === 2 ? 4 : 3;
      const blastRadius = phase >= 3 ? 92 : 76;
      for (let i = 0; i < count; i++) {
        const offset = i - (count - 1) / 2;
        bossShot(angle + offset * .29, 118 + state.wave * .55, 7, { explosive:true, fuse:1.55, blastRadius, damage:phase >= 3 ? 2 : 1 });
      }
    } else if (enemy.bossType === 'lancer') {
      const count = phase >= 3 ? 5 : phase === 2 ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const offset = i - (count - 1) / 2;
        bossShot(angle + offset * .075, 385 + state.wave * 1.35, 6, { damage:phase >= 3 ? 2 : 1 });
      }
    } else if (enemy.bossType === 'mirror') {
      const count = phase >= 3 ? 9 : phase === 2 ? 7 : 5;
      const offset = Math.sin(performance.now() / 430) * .2;
      for (let i = 0; i < count; i++) {
        const spread = i - (count - 1) / 2;
        bossShot(angle + offset + spread * .22, 195 + state.wave, 5, { bounces:phase >= 3 ? 2 : 1 });
      }
    } else if (enemy.bossType === 'rift') {
      const count = phase >= 3 ? 3 : phase === 2 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const offset = i - (count - 1) / 2;
        bossShot(angle + offset * .2, 205 + state.wave, 6, { homingTime:phase >= 3 ? 2 : 1.6, turnRate:phase >= 3 ? 2.35 : 1.85, damage:phase >= 3 ? 2 : 1 });
      }
    }
    tone(150, .06, 'sawtooth', .012);
  }
  function updateAuroraBossMovement(enemy, dt, slowFactor) {
    enemy.auroraMoveTimer = Math.max(0, enemy.auroraMoveTimer - dt);
    enemy.auroraDodgeCooldown = Math.max(0, enemy.auroraDodgeCooldown - dt);
    enemy.auroraDodgeScanTimer = Math.max(0, enemy.auroraDodgeScanTimer - dt);
    enemy.auroraDodgeTime = Math.max(0, enemy.auroraDodgeTime - dt);
    const margin = mobileSize(enemy.r * 1.35);

    if (enemy.auroraMoveTimer <= 0) {
      enemy.auroraMoveMode = randomUnit('boss') < .38 ? 'chase' : 'roam';
      enemy.auroraMoveTimer = random(2.1, 3.6, 'boss');
      enemy.auroraChaseAngle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x) + random(-1.1, 1.1, 'boss');
      enemy.auroraTargetX = random(margin, Math.max(margin, state.width - margin), 'boss');
      enemy.auroraTargetY = random(margin, Math.max(margin, state.height - margin), 'boss');
    }

    if (enemy.auroraMoveMode === 'chase') {
      enemy.auroraChaseAngle += dt * .35;
      const orbit = mobileSize(150);
      enemy.auroraTargetX = clamp(state.player.x + Math.cos(enemy.auroraChaseAngle) * orbit, margin, Math.max(margin, state.width - margin));
      enemy.auroraTargetY = clamp(state.player.y + Math.sin(enemy.auroraChaseAngle) * orbit, margin, Math.max(margin, state.height - margin));
    }

    if (enemy.auroraDodgeScanTimer <= 0 && enemy.auroraDodgeCooldown <= 0) {
      enemy.auroraDodgeScanTimer = .14;
      let threat = null;
      let closestApproach = Infinity;
      for (const bullet of state.bullets) {
        if (bullet.dead) continue;
        const vx = bullet.vx || 0, vy = bullet.vy || 0;
        const speedSquared = vx * vx + vy * vy;
        if (speedSquared < 1) continue;
        const rx = enemy.x - bullet.x, ry = enemy.y - bullet.y;
        const travel = clamp((rx * vx + ry * vy) / speedSquared, 0, .72);
        if (travel <= .025) continue;
        const gap = Math.hypot(rx - vx * travel, ry - vy * travel);
        if (gap < enemy.r + bullet.r + mobileSize(24) && gap < closestApproach) {
          threat = bullet;
          closestApproach = gap;
        }
      }
      if (threat) {
        const speed = Math.hypot(threat.vx, threat.vy) || 1;
        enemy.auroraDodgeSide *= -1;
        const side = enemy.auroraDodgeSide;
        enemy.auroraDodgeX = clamp(enemy.x - threat.vy / speed * mobileSize(155) * side, margin, Math.max(margin, state.width - margin));
        enemy.auroraDodgeY = clamp(enemy.y + threat.vx / speed * mobileSize(155) * side, margin, Math.max(margin, state.height - margin));
        enemy.auroraDodgeTime = .72;
        enemy.auroraDodgeCooldown = 1.05;
        enemy.auroraMoveMode = 'dodge';
        burst(enemy.x, enemy.y, '#bffff5', 5, 56);
      }
    }

    const target = enemy.auroraDodgeTime > 0
      ? { x: enemy.auroraDodgeX, y: enemy.auroraDodgeY }
      : { x: enemy.auroraTargetX, y: enemy.auroraTargetY };
    const dx = target.x - enemy.x, dy = target.y - enemy.y;
    const gap = Math.hypot(dx, dy);
    if (gap > mobileSize(8)) {
      const move = Math.min(gap, enemy.speed * 1.78 * dt * slowFactor);
      enemy.x += dx / gap * move;
      enemy.y += dy / gap * move;
      enemy.angle = Math.atan2(dy, dx);
    }
  }
  function updateAuroraBossSkills(enemy, dt) {
    if (enemy.kind !== 'boss' || enemy.isMiniBoss || enemy.bossType !== 'aurora') return;
    const phase = clamp(enemy.phase || 1, 1, 4);
    const tuning = [
      { qWarning:1.18, qRadius:56, qDuration:3.6, qCooldown:18, qPulse:.92, qDamage:.85, qAttempts:2, ultRadius:150, ultWarning:1.22, ultDuration:1.8 },
      { qWarning:.96, qRadius:68, qDuration:4.2, qCooldown:15, qPulse:.8, qDamage:1, qAttempts:3, ultRadius:185, ultWarning:1.02, ultDuration:2 },
      { qWarning:.72, qRadius:84, qDuration:4.8, qCooldown:12, qPulse:.68, qDamage:1.15, qAttempts:4, ultRadius:220, ultWarning:.78, ultDuration:2.35 },
      { qWarning:.5, qRadius:104, qDuration:5.5, qCooldown:9.5, qPulse:.58, qDamage:1.3, qAttempts:5, ultRadius:258, ultWarning:.58, ultDuration:2.7 }
    ][phase - 1];
    enemy.auroraECooldown = Math.max(0, (enemy.auroraECooldown || 0) - dt);
    if (enemy.auroraEWarning > 0) {
      enemy.auroraEWarning = Math.max(0, enemy.auroraEWarning - dt);
      if (enemy.auroraEWarning === 0) {
        const center = { x: enemy.auroraEWarningX, y: enemy.auroraEWarningY };
        const radius = mobileSize(auroraBossDefaults.eRadius);
        state.effects.push({ type: 'nova', x: center.x, y: center.y, radius: 0, maxRadius: radius, color: '#7df7e8', bossAurora: true, life: .95, total: .95 });
        burst(center.x, center.y, '#7df7e8', 76, 310);
        burst(center.x, center.y, '#ffffff', 28, 190);
        if (distance(state.player, center) <= radius + state.player.radius) damagePlayer(1, 'boss-aurora');
      }
    } else if (enemy.auroraECooldown <= 0) {
      enemy.auroraEWarning = .92;
      enemy.auroraEWarningX = enemy.x;
      enemy.auroraEWarningY = enemy.y;
      enemy.auroraECooldown = auroraBossDefaults.eCooldown;
      toast('AURORA · EXPLOSÃO NOVA');
      tone(360, .18, 'triangle', .035);
    }

    enemy.auroraQCooldown = Math.max(0, (enemy.auroraQCooldown || 0) - dt);
    enemy.auroraReflectionCooldown = Math.max(0, (enemy.auroraReflectionCooldown || 0) - dt);
    if (enemy.auroraQSequenceRemaining > 0 && enemy.auroraQWarning <= 0) {
      enemy.auroraQSequenceTimer = Math.max(0, enemy.auroraQSequenceTimer - dt);
      if (enemy.auroraQSequenceTimer <= 0) {
        enemy.auroraQSequenceRemaining--;
        enemy.auroraQAttempt++;
        enemy.auroraQWarning = tuning.qWarning;
        enemy.auroraQWarningTotal = tuning.qWarning;
        enemy.auroraQWarningRadius = mobileSize(tuning.qRadius);
        enemy.auroraQTargetX = state.player.x;
        enemy.auroraQTargetY = state.player.y;
        toast('AURORA · ELO ESTELAR · TENTATIVA ' + enemy.auroraQAttempt + '/' + enemy.auroraQSequenceTotal + ' · SAIA DA ÁREA');
        tone(520, .18, 'triangle', .03);
      }
    }
    if (enemy.auroraQWarning > 0) {
      enemy.auroraQWarning = Math.max(0, enemy.auroraQWarning - dt);
      if (enemy.auroraQWarning === 0) {
        if (distance(state.player, { x:enemy.auroraQTargetX, y:enemy.auroraQTargetY }) <= enemy.auroraQWarningRadius + state.player.radius) {
          if (enemy.auroraQActive <= 0) {
            enemy.auroraQActive = tuning.qDuration;
            enemy.auroraQPulseTimer = .08;
          }
          state.effects.push({ type: 'aurora-link-start', x: enemy.auroraQTargetX, y: enemy.auroraQTargetY, life: .5, total: .5, phase: 0 });
          state.effects.push({ type: 'aurora-link-wave', x: enemy.auroraQTargetX, y: enemy.auroraQTargetY, radius: Math.hypot(state.width, state.height) * 1.08, life: 1.12, total: 1.12, phase: 0 });
          burst(enemy.auroraQTargetX, enemy.auroraQTargetY, '#7df7e8', 16, 92);
          burst(enemy.auroraQTargetX, enemy.auroraQTargetY, '#bffff5', 8, 68);
          toast('ELO ESTELAR · VINCULADO');
          tone(610, .17, 'sine', .035);
        } else {
          toast('ELO ESTELAR · DESVIADO');
        }
        if (enemy.auroraQSequenceRemaining > 0) enemy.auroraQSequenceTimer = .38;
        else enemy.auroraQCooldown = tuning.qCooldown;
      }
    }
    if (enemy.auroraQActive > 0) {
      enemy.auroraQActive = Math.max(0, enemy.auroraQActive - dt);
      enemy.auroraQPulseTimer -= dt;
      if (enemy.auroraQActive > 0 && enemy.auroraQPulseTimer <= 0) {
        enemy.auroraQPulseTimer += tuning.qPulse;
        const from = { x: enemy.x, y: enemy.y };
        const target = { x: state.player.x, y: state.player.y };
        for (let index = 0; index < auroraBossDefaults.qTargets; index++) {
          const nodeAngle = index * Math.PI / 4 + performance.now() / 1700;
          const nodeRadius = mobileSize(12 + (index % 2) * 7);
          const x2 = target.x + Math.cos(nodeAngle) * nodeRadius;
          const y2 = target.y + Math.sin(nodeAngle) * nodeRadius;
          const dx = x2 - from.x, dy = y2 - from.y;
          const length = Math.hypot(dx, dy) || 1;
          const bend = (index % 2 ? 1 : -1) * Math.min(mobileSize(22), length * .06);
          state.effects.push({ type: 'aurora-link', x1: from.x, y1: from.y, x2, y2, cx: (from.x + x2) / 2 - dy / length * bend, cy: (from.y + y2) / 2 + dx / length * bend, life: .38, total: .38, phase: index });
        }
        state.effects.push({ type: 'aurora-link-node', x: target.x, y: target.y, life: .42, total: .42, phase: 0 });
        state.effects.push({ type: 'aurora-link-wave', x: target.x, y: target.y, radius: mobileSize(54), life: .46, total: .46, phase: 0 });
        if (distance(from, target) <= mobileSize(560) + state.player.radius) damagePlayer(tuning.qDamage, 'boss-aurora');
      }
    } else if (!enemy.auroraQWarning && enemy.auroraQCooldown <= 0 && enemy.auroraQSequenceRemaining <= 0 && enemy.auroraQActive <= 0) {
      enemy.auroraQSequenceRemaining = tuning.qAttempts;
      enemy.auroraQSequenceTotal = tuning.qAttempts;
      enemy.auroraQAttempt = 0;
      enemy.auroraQSequenceTimer = 0;
    }

    const ultimatePhase = phase >= 4 ? 4 : phase >= 2 ? 2 : 0;
    if (ultimatePhase && enemy.auroraUltUses < 2 && ultimatePhase > enemy.auroraUltLastPhase && enemy.auroraUltWarning <= 0 && enemy.auroraUltActive <= 0 && enemy.auroraQActive <= 0 && enemy.auroraQWarning <= 0 && enemy.auroraQSequenceRemaining <= 0 && enemy.auroraEWarning <= 0) {
      enemy.auroraUltLastPhase = ultimatePhase;
      enemy.auroraUltUses++;
      enemy.auroraUltWarning = tuning.ultWarning;
      enemy.auroraUltWarningTotal = tuning.ultWarning;
      enemy.auroraUltTargetX = state.player.x;
      enemy.auroraUltTargetY = state.player.y;
      enemy.auroraUltRadius = mobileSize(tuning.ultRadius);
      enemy.auroraUltHits = 0;
      enemy.auroraUltHitCooldown = 0;
      state.effects.push({ type:'aurora-crown-start', x:enemy.auroraUltTargetX, y:enemy.auroraUltTargetY, life:.72, total:.72, phase:1 });
      toast('AURORA · COROA DA HIPERNOVA · SAIA DA CONSTELAÇÃO');
      tone(760, .2, 'triangle', .035);
    }
    if (enemy.auroraUltWarning > 0) {
      enemy.auroraUltWarning = Math.max(0, enemy.auroraUltWarning - dt);
      if (enemy.auroraUltWarning === 0) {
        enemy.auroraUltActive = tuning.ultDuration;
        enemy.auroraUltActiveTotal = tuning.ultDuration;
        enemy.auroraUltPulseTimer = .26;
        auroraBossRepulseShots(enemy, enemy.auroraUltRadius * 1.2, { x:enemy.auroraUltTargetX, y:enemy.auroraUltTargetY });
        state.effects.push({ type:'aurora-repulse-wave', x:enemy.auroraUltTargetX, y:enemy.auroraUltTargetY, radius:0, maxRadius:enemy.auroraUltRadius, life:.64, total:.64, color:'#c2a6ff' });
        burst(enemy.auroraUltTargetX, enemy.auroraUltTargetY, '#c2a6ff', 28, 175);
        burst(enemy.auroraUltTargetX, enemy.auroraUltTargetY, '#eaffff', 16, 125);
        toast('CONSTELAÇÃO DE AURORA · DESVIE DOS FEIXES');
      }
    }
    if (enemy.auroraUltActive > 0) {
      enemy.auroraUltActive = Math.max(0, enemy.auroraUltActive - dt);
      enemy.auroraUltPulseTimer -= dt;
      enemy.auroraUltHitCooldown = Math.max(0, enemy.auroraUltHitCooldown - dt);
      if (enemy.auroraUltPulseTimer <= 0) {
        enemy.auroraUltPulseTimer += phase >= 4 ? .58 : .82;
        state.effects.push({ type:'aurora-crown-burst', x:enemy.auroraUltTargetX, y:enemy.auroraUltTargetY, radius:enemy.auroraUltRadius, life:.36, total:.36, phase:1 });
        if (enemy.auroraUltHits < 2 && enemy.auroraUltHitCooldown <= 0 && distance(state.player, { x:enemy.auroraUltTargetX, y:enemy.auroraUltTargetY }) <= enemy.auroraUltRadius + state.player.radius) {
          damagePlayer(phase >= 4 ? 2 : 1, 'boss-aurora');
          enemy.auroraUltHits++;
          enemy.auroraUltHitCooldown = .95;
        }
      }
    }
  }
  function auroraBossRepulseShots(enemy, radius, center = enemy) {
    let redirected = 0;
    for (const bullet of state.bullets) {
      if (bullet.dead || (bullet.auroraRepulseLock || 0) > state.elapsed || distance(center, bullet) > radius) continue;
      const angle = random(0, Math.PI * 2, 'boss');
      const speed = clamp(Math.hypot(bullet.vx, bullet.vy) * 1.02, 250, 520);
      bullet.vx = Math.cos(angle) * speed;
      bullet.vy = Math.sin(angle) * speed;
      bullet.assistTarget = null;
      bullet.auroraRepulseLock = state.elapsed + 1.5;
      bullet.color = '#c2a6ff';
      redirected++;
    }
    if (redirected) burst(center.x, center.y, '#c2a6ff', Math.min(18, redirected * 3), 118);
    return redirected;
  }
  function activateAuroraRepulse() {
    if (currentSkin().id !== 'aurora' || state.mode !== 'playing' || state.auroraUltCharge <= 0 || state.auroraUltCharge >= 6) return false;
    const chargeCost = Math.min(5, Math.floor(state.auroraUltCharge));
    if (chargeCost <= 0) return false;
    state.auroraUltCharge = 0;
    const origin = { x:state.player.x, y:state.player.y };
    const radius = mobileSize(270 + chargeCost * 18);
    let pushed = 0, deflected = 0;
    state.effects.push({ type:'aurora-repulse-wave', x:origin.x, y:origin.y, radius:0, maxRadius:radius, life:.64, total:.64, color:'#80f3ff' });
    for (const enemy of state.enemies) {
      if (enemy.dead || distance(origin, enemy) > radius + enemy.r) continue;
      const dx = enemy.x - origin.x, dy = enemy.y - origin.y;
      const gap = Math.hypot(dx, dy) || 1;
      const scatter = random(-.24, .24, 'ability');
      const angle = Math.atan2(dy || -1, dx || 1) + scatter;
      const chargeScale = .82 + chargeCost * .07;
      const strength = mobileSize(((enemy.kind === 'boss' ? 74 : 128) + (1 - clamp(gap / radius, 0, 1)) * (enemy.kind === 'boss' ? 36 : 78)) * chargeScale);
      enemy.x = clamp(enemy.x + Math.cos(angle) * strength, enemy.r + 8, state.width - enemy.r - 8);
      enemy.y = clamp(enemy.y + Math.sin(angle) * strength, enemy.r + 8, state.height - enemy.r - 8);
      state.effects.push({ type:'aurora-link-node', x:enemy.x, y:enemy.y, life:.3, total:.3, phase:pushed });
      burst(enemy.x, enemy.y, pushed % 2 ? '#c2a6ff' : '#80f3ff', 5, 66);
      pushed++;
    }
    for (const bullet of state.enemyBullets) {
      if (bullet.dead || bullet.reflected || distance(origin, bullet) > radius + bullet.r) continue;
      const angle = random(0, Math.PI * 2, 'ability');
      const speed = clamp(Math.hypot(bullet.vx, bullet.vy) * 1.04, 250, 520);
      bullet.vx = Math.cos(angle) * speed;
      bullet.vy = Math.sin(angle) * speed;
      bullet.reflected = true;
      bullet.reflectLife = 2.2 + chargeCost * .18;
      bullet.damage = Math.min(6, Math.max(1, bullet.damage || 1));
      bullet.color = '#8cf1ff';
      bullet.explosive = false;
      bullet.exploded = false;
      bullet.fuse = null;
      bullet.blastRadius = 0;
      bullet.bounces = 0;
      burst(bullet.x, bullet.y, '#c2faff', 3, 44);
      deflected++;
    }
    state.auroraEFirstTapAt = 0;
    state.auroraEFirstTapCharge = 0;
    burst(origin.x, origin.y, '#8cf1ff', 22, 138);
    burst(origin.x, origin.y, '#d7c5ff', 12, 102);
    toast('ELO REBATIDO · ' + chargeCost + ' CARGAS GASTAS · ' + pushed + ' EMPURRADOS · ' + deflected + ' TIROS DESVIADOS');
    tone(430, .18, 'triangle', .035);
    updateAuroraUltHud();
    updateAbilityButton();
    return true;
  }
  function explodeBullet(bullet) {
    if (bullet.exploded) return;
    bullet.exploded = true; bullet.dead = true;
    const radius = mobileSize(bullet.blastRadius || 78);
    burst(bullet.x, bullet.y, '#ffbd67', 26, 165); burst(bullet.x, bullet.y, '#fff1b4', 13, 105);
    if (!megumiShadowCloakActive() && distance(bullet, state.player) < radius + state.player.radius && state.reflectTime <= 0) damagePlayer(bullet.damage || 2, mahoragaAttackType(bullet));
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
  let mahoragaAwakeningTimer = 0;
  const mahoragaAttackNames = Object.freeze({
    projectile:'PROJÉTEIS COMUNS', explosive:'EXPLOSÕES', ricochet:'TIROS RICOCHETE', impact:'COLISÕES',
    'boss-meteor':'COLOSSO DE CINZAS', 'boss-drone':'MÃE DE ENXAME', 'boss-brute':'TITÃ ÂMBAR', 'boss-hunter':'ESPECTRO ROXO', 'boss-prism':'PRISMA REBOTE',
    'boss-storm':'ARCONTE DE ÍONS', 'boss-mine':'SEMEADOR DE MINAS', 'boss-lancer':'LANÇA SOLAR', 'boss-mirror':'ESPELHO FRATURADO', 'boss-rift':'RASGO DIMENSIONAL', 'boss-aurora':'AURORA'
  });
  function mahoragaAttackType(attack, fallback = 'projectile') {
    const source = attack?.source || attack;
    if (source?.kind === 'boss' && source.bossType) return 'boss-' + source.bossType;
    if (attack?.explosive) return 'explosive';
    if (attack?.bounces > 0) return 'ricochet';
    return fallback;
  }
  function mahoragaAttackName(type) { return mahoragaAttackNames[type] || 'ATAQUES CÓSMICOS'; }
  function showMahoragaAdaptation(type, reduction, untilWave, special = false) {
    if (!ui.mahoragaAwakening) return;
    if (mahoragaAwakeningTimer) window.clearTimeout(mahoragaAwakeningTimer);
    if (ui.mahoragaAwakeningType) ui.mahoragaAwakeningType.textContent = mahoragaAttackName(type);
    const adaptationLevel = state.mahoragaAdaptationLevels[type] || 0;
    if (ui.mahoragaAwakeningBuff) ui.mahoragaAwakeningBuff.textContent = (special ? 'ESPECIAL · ' : 'NÍVEL ' + adaptationLevel + '/3 · ') + '−' + Math.round(reduction * 100) + '% · ATÉ ONDA ' + untilWave;
    ui.mahoragaAwakening.hidden = false;
    ui.mahoragaAwakening.classList.remove('is-visible');
    void ui.mahoragaAwakening.offsetWidth;
    ui.mahoragaAwakening.classList.add('is-visible');
    mahoragaAwakeningTimer = window.setTimeout(() => {
      if (!ui.mahoragaAwakening) return;
      ui.mahoragaAwakening.classList.remove('is-visible');
      ui.mahoragaAwakening.hidden = true;
    }, 2900);
  }
  function activeMahoragaAdaptations() {
    return Object.keys(state.mahoragaAdaptationLevels).filter((type) => mahoragaAttackNames[type]
      && (state.mahoragaAdaptationLevels[type] || 0) > 0
      && state.mahoragaAdaptationWaves[type] > 0
      && state.mahoragaAdaptationWaves[type] + 4 >= state.wave);
  }
  function mahoragaResistanceFor(type) {
    const attackType = mahoragaAttackNames[type] ? type : 'projectile';
    const startWave = state.mahoragaAdaptationWaves[attackType] || 0;
    if (!startWave || state.wave > startWave + 4 || !(state.mahoragaAdaptationLevels[attackType] > 0)) return 0;
    const level = Math.min(3, Math.max(state.mahoragaAdaptationLevels[attackType], 1 + Math.floor((state.wave - startWave) / 2)));
    return [0, .25, .4, .55][level];
  }
  function syncMahoragaResistanceSummary(preferredType = '') {
    const active = activeMahoragaAdaptations();
    const type = active.includes(preferredType) ? preferredType : active.includes(state.mahoragaLastType) ? state.mahoragaLastType : active[active.length - 1] || '';
    state.mahoragaResistanceType = type;
    state.mahoragaResistancePower = type ? mahoragaResistanceFor(type) : 0;
    state.mahoragaResistanceUntilWave = type ? state.mahoragaAdaptationWaves[type] + 4 : 0;
  }
  function grantMahoragaResistance(type, special = false) {
    const attackType = mahoragaAttackNames[type] ? type : 'projectile';
    const alreadyAdapted = mahoragaResistanceFor(attackType) > 0;
    state.mahoragaLastType = attackType;
    state.mahoragaProgress[attackType] = 0;
    if (alreadyAdapted) {
      state.mahoragaDuplicateBuffBonus = Math.min(.6, state.mahoragaDuplicateBuffBonus + .2);
      state.mahoragaDuplicateBuffTime = 10;
      syncMahoragaResistanceSummary(attackType);
      const reduction = mahoragaResistanceFor(attackType);
      state.mahoragaAdaptationVisualTime = 3;
      playMahoragaAdaptationSound();
      showMahoragaAdaptation(attackType, reduction, state.mahoragaAdaptationWaves[attackType] + 4, true);
      state.effects.push({ type:'mahoraga-adaptation', x:state.player.x, y:state.player.y, life:.9, total:.9, color:'#e4c477' });
      toast('ADAPTAÇÃO REPETIDA · ' + mahoragaAttackName(attackType) + ' MANTIDA · +20% DANO POR 10s');
      tone(560, .32, 'sawtooth', .05);
      updateHud();
      return { advanced:false, duplicate:true, level:state.mahoragaAdaptationLevels[attackType] || 1 };
    }
    state.mahoragaAdaptationLevels[attackType] = 1;
    state.mahoragaAdaptationWaves[attackType] = state.wave;
    state.mahoragaDamageRemainders[attackType] = 0;
    syncMahoragaResistanceSummary(attackType);
    state.mahoragaAdaptationVisualTime = 3;
    playMahoragaAdaptationSound();
    showMahoragaAdaptation(attackType, mahoragaResistanceFor(attackType), state.wave + 4, special);
    state.effects.push({ type:'mahoraga-adaptation', x:state.player.x, y:state.player.y, life:.9, total:.9, color:'#e4c477' });
    toast((special ? 'ADAPTAÇÃO ESPECIAL' : 'NOVA ADAPTAÇÃO') + ' · ' + mahoragaAttackName(attackType) + ' · −30% ATÉ ONDA ' + (state.wave + 4));
    tone(560, .32, 'sawtooth', .05);
    updateHud();
    return { advanced:true, duplicate:false, level:1 };
  }
  function advanceMahoragaAdaptation(type, special = false) {
    return grantMahoragaResistance(type, special);
  }
  function resetMahoragaAdaptationCycle() {
    state.mahoragaResistanceType = '';
    state.mahoragaResistanceUntilWave = 0;
    state.mahoragaResistancePower = 0;
    state.mahoragaWheelSegments = 0;
    state.mahoragaWheelReady = false;
    state.mahoragaProgress = {};
    state.mahoragaAdaptationLevels = {};
    state.mahoragaAdaptationWaves = {};
    state.mahoragaDamageRemainders = {};
    state.mahoragaLastType = '';
    state.mahoragaAdaptationVisualTime = 0;
    state.mahoragaDuplicateBuffTime = 0;
    state.mahoragaDuplicateBuffBonus = 0;
    state.mahoragaCycleStartWave = state.wave;
  }
  function updateMahoragaAdaptationForWave() {
    const oldLevels = { ...state.mahoragaAdaptationLevels };
    Object.keys(state.mahoragaAdaptationLevels).forEach((type) => {
      const startWave = state.mahoragaAdaptationWaves[type] || 0;
      if (!startWave || state.wave > startWave + 4) {
        delete state.mahoragaAdaptationLevels[type];
        delete state.mahoragaAdaptationWaves[type];
        delete state.mahoragaDamageRemainders[type];
        delete state.mahoragaProgress[type];
        return;
      }
      state.mahoragaAdaptationLevels[type] = Math.min(3, 1 + Math.floor((state.wave - startWave) / 2));
    });
    syncMahoragaResistanceSummary();
    const advanced = Object.keys(state.mahoragaAdaptationLevels).some((type) => state.mahoragaAdaptationLevels[type] > (oldLevels[type] || 0));
    if (advanced) toast('ADAPTAÇÕES EVOLUÍRAM · RESISTÊNCIA MÁXIMA DE 55%');
    if (Object.keys(oldLevels).length && !activeMahoragaAdaptations().length) toast('ADAPTAÇÕES EXPIRARAM · NOVO CICLO DISPONÍVEL');
  }
  function recordMahoragaHit(type) {
    const attackType = mahoragaAttackNames[type] ? type : 'projectile';
    state.mahoragaLastType = attackType;
    if (!state.mahoragaWheelReady) {
      state.mahoragaWheelSegments = Math.min(8, state.mahoragaWheelSegments + 1);
      if (state.mahoragaWheelSegments >= 8) {
        state.mahoragaWheelReady = true;
        toast('RODA COMPLETA · O PRÓXIMO E CONCEDE ADAPTAÇÃO ESPECIAL');
        tone(840, .2, 'triangle', .055);
      }
    }
    const progress = Math.min(5, (state.mahoragaProgress[attackType] || 0) + 1);
    if (progress >= 5) {
      state.mahoragaProgress[attackType] = 0;
      advanceMahoragaAdaptation(attackType);
    } else {
      state.mahoragaProgress[attackType] = progress;
      burst(state.player.x, state.player.y, '#f1d38a', 6, 72);
      tone(680, .06, 'triangle', .025);
    }
    updateHud();
  }
  function damagePlayer(amount = 1, attackType = 'projectile') {
    if ((currentSkin().id === 'training' && state.ferrumRam?.phase === 'dash') || megumiShadowCloakActive() || vultureCloakActive() || (currentSkin().id === 'flamestorm' && (state.flameStormDash?.life > 0 || state.flameStormQIntangible > 0))) return;
    const isMahoraga = mahoragaAdaptationActive();
    const mahoragaShieldActive = isMahoraga && state.mahoragaParryWindow > 0;
    const vultureVulnerable = currentSkin().id === 'vulture' && state.vultureVulnerableTime > 0;
    if ((!mahoragaShieldActive && !vultureVulnerable && state.invulnerable > 0) || (isMahoraga && state.mahoragaShieldHitCooldown > 0) || state.mode !== 'playing') return;
    if (vultureVulnerable && state.vultureVulnerableHitCooldown > 0) return;
    if (vultureVulnerable) state.vultureVulnerableHitCooldown = .42;
    if (abilitySourceIs('flashblade') && state.flashTrail?.life > 0) {
      // Cancel only the active dash. Trail segments are separate world effects and expire normally.
      state.flashTrail = null;
      updateAbilityButton();
      toast('RASTRO DE RUPTURA INTERROMPIDO PELO IMPACTO');
    }
    if (!vultureVulnerable && randomUnit('combat') < state.armorChance) { state.invulnerable = .28; toast('BLINDAGEM REATIVA'); tone(480, .1, 'triangle', .025); return; }
    if (isMahoraga) recordMahoragaHit(attackType);
    const vultureUltimateGuard = currentSkin().id === 'vulture' && state.vultureEvolutionTime > 0;
    const scaledIncomingAmount = Math.max(0, amount) * enemyWaveDamageScale() * (vultureVulnerable ? 1.35 : 1) * (vultureUltimateGuard ? .65 : 1);
    let remaining;
    const adaptationReduction = isMahoraga ? mahoragaResistanceFor(attackType) : 0;
    const matchingResistance = isMahoraga && adaptationReduction > 0;
    if (isMahoraga && (mahoragaShieldActive || matchingResistance)) {
      let mitigated = scaledIncomingAmount;
      const totalReduction = Math.max(mahoragaShieldActive ? .7 : 0, matchingResistance ? adaptationReduction : 0);
      mitigated *= 1 - Math.min(.7, totalReduction);
      mitigated += state.mahoragaDamageRemainders[attackType] || 0;
      remaining = Math.floor(mitigated);
      state.mahoragaDamageRemainders[attackType] = mitigated - remaining;
      if (remaining <= 0) {
        if (mahoragaShieldActive) state.mahoragaShieldHitCooldown = .42;
        burst(state.player.x, state.player.y, '#e4c477', 5, 42);
        updateHud();
        return;
      }
    } else if (isMahoraga) remaining = Math.max(1, Math.floor(scaledIncomingAmount));
    else {
      const damageKey = String(attackType || 'projectile');
      const accumulated = scaledIncomingAmount + (state.enemyDamageRemainders[damageKey] || 0);
      const wholeDamage = Math.floor(accumulated);
      state.enemyDamageRemainders[damageKey] = accumulated - wholeDamage;
      remaining = Math.max(1, wholeDamage);
    }
    if (currentSkin().id === 'training') {
      const mitigated = remaining * .5 + state.trainingDamageRemainder;
      remaining = Math.floor(mitigated);
      state.trainingDamageRemainder = mitigated - remaining;
      if (remaining === 0) {
        state.invulnerable = .82;
        burst(state.player.x, state.player.y, '#aeb5c0', 8, 54);
        updateHud();
        return;
      }
    }
    addFerrumPressure(FERRUM_HIT_PRESSURE);
    const tempUsed = Math.min(state.tempShields, remaining); state.tempShields -= tempUsed; remaining -= tempUsed;
    if (tempUsed && state.aegisBarrierCharges > 0) {
      state.aegisBarrierCharges = Math.max(0, state.aegisBarrierCharges - tempUsed);
      if (state.aegisBarrierCharges === 0) state.aegisBarrierTime = 0;
    }
    const regularUsed = Math.min(state.shields, remaining); state.shields -= regularUsed; remaining -= regularUsed;
    if (remaining === 0) { if (mahoragaShieldActive) state.mahoragaShieldHitCooldown = .42; else state.invulnerable = .82; toast(tempUsed ? 'BARREIRA AEGIS ABSORVEU O IMPACTO' : 'ESCUDO ABSORVEU O IMPACTO'); tone(680, .18, 'triangle', .04); updateHud(); return; }
    if (tempUsed || regularUsed) toast('IMPACTO ROMPEU SEUS ESCUDOS');
    if (state.drones > 0 && state.lives - remaining <= 0) {
      const livesBeforeSave = state.lives;
      sacrificeDrone();
      state.lives = 1;
      reflectAuroraLinkDamage(Math.max(0, livesBeforeSave - state.lives));
      if (mahoragaShieldActive) state.mahoragaShieldHitCooldown = .42;
      else state.invulnerable = vultureVulnerable ? 0 : 1.35;
      burst(state.player.x, state.player.y, currentSkin().color, 24, 170);
      updateHud();
      return;
    }
    state.waveDamageTaken = true;
    const livesBeforeHit = state.lives;
    state.lives = Math.max(0, state.lives - remaining);
    reflectAuroraLinkDamage(Math.max(0, livesBeforeHit - state.lives));
    if (mahoragaShieldActive) state.mahoragaShieldHitCooldown = .42;
    else state.invulnerable = vultureVulnerable ? 0 : 1.35;
    burst(state.player.x, state.player.y, '#ff6687', 22, 160); tone(120, .23, 'sawtooth', .05); updateHud();
    if (state.lives <= 0) {
      if (state.megumiTransformed && !state.mahoragaReviveUsed) {
        state.lives = 1;
        state.mahoragaReviveUsed = true;
        deactivateMahoragaForm({ deathReturn:true });
        state.invulnerable = 1.6;
        toast('ÚLTIMO ELO · MAHORAGA RECUOU · 1 VIDA RESTANTE');
        updateHud();
        return;
      }
      finishGame();
    }
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
    bullet.damage = Math.min(10, Math.max(2, (bullet.damage || 1) * (1 + state.abilityPower * .42 + state.reflectDamageBonus)));
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
    const earnedScore = Math.round(enemy.score * (state.scoreMultiplier || 1));
    state.score += earnedScore;
    updateChampionshipMission('kills', 1);
    updateChampionshipMission('score', earnedScore);
    state.waveKills += enemy.kind === 'boss' ? (enemy.isMiniBoss ? 2 : state.enemiesRequired) : 1;
    burst(enemy.x, enemy.y, enemy.color, enemy.kind === 'boss' ? 44 : 15, enemy.kind === 'boss' ? 220 : 110);
    const salvageChance = state.salvageHeal * .035 * Math.max(.06, 1 - lateWavePressure() * .015);
    const salvageWaveLimit = state.wave > 40 ? 1 : Infinity;
    const salvageCooldownReady = state.wave <= 40 || state.wave - state.lastSalvageHealWave >= 3;
    if (state.salvageHeal > 0 && salvageCooldownReady && state.salvageHealsThisWave < salvageWaveLimit && state.lives < state.maxLives && randomUnit('loot') < salvageChance) { state.lives++; state.salvageHealsThisWave++; state.lastSalvageHealWave = state.wave; toast('DESTROÇOS RECICLADOS · +1 VIDA'); }
    if (enemy.kind === 'boss' && !enemy.isMiniBoss) {
      recordAchievementEvent('boss');
      spawnBossRewards(enemy);
      toast(enemy.bossName.toUpperCase() + ' DESTRUÍDO');
    } else if (enemy.isMiniBoss) {
      spawnPickup(enemy.x, enemy.y, 'charge'); toast('MINI-CHEFE DESTRUÍDO');
    } else if (randomUnit('loot') < Math.max(.006, .1 * Math.max(.06, 1 - lateWavePressure() * .015))) spawnPickup(enemy.x, enemy.y);
    if (currentSkin().id === 'vulture') {
      const scrapDrops = enemy.kind === 'boss' ? (enemy.isMiniBoss ? 2 : 3) : randomUnit('loot') < Math.max(.1, .2 - lateWavePressure() * .0008) ? 1 : 0;
      for (let index = 0; index < scrapDrops; index++) {
        spawnVultureScrapPickup(enemy.x + random(-mobileSize(26), mobileSize(26), 'loot'), enemy.y + random(-mobileSize(22), mobileSize(22), 'loot'));
      }
    }
    updateHud();
  }
  function damageEnemy(enemy, amount, fromAbility, source = 'player') {
    if (!enemy || enemy.dead) return;
    if (abilitySourceIs('mahoraga') && enemy.mahoragaMarkBonus > 0) {
      amount *= 1 + enemy.mahoragaMarkBonus;
      enemy.mahoragaMarkBonus = 0;
      enemy.mahoragaMarkTime = 0;
    }
    if (enemy.kind === 'boss') amount *= 1 + state.bossDamageBonus;
    if (enemy.kind === 'boss' && !enemy.isMiniBoss && enemy.phase < 4 && enemy.hp > 0 && enemy.hp - amount <= 0) amount = Math.min(amount, Math.max(0, enemy.hp - enemy.maxHp * .15));
    const appliedDamage = Math.min(Math.max(0, enemy.hp), Math.max(0, amount));
    if (source === 'player' && appliedDamage > 0) addFerrumPressure(appliedDamage, enemy);
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora' && enemy.auroraQActive > 0 && appliedDamage > 0 && enemy.auroraReflectionCooldown <= 0) {
      enemy.auroraReflectionCooldown = 1.12;
      const dx = state.player.x - enemy.x, dy = state.player.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      const bend = Math.min(mobileSize(24), length * .06);
      state.effects.push({ type:'aurora-link', x1:enemy.x, y1:enemy.y, x2:state.player.x, y2:state.player.y, cx:(enemy.x + state.player.x) / 2 - dy / length * bend, cy:(enemy.y + state.player.y) / 2 + dx / length * bend, life:.4, total:.4, phase:0 });
      state.effects.push({ type:'aurora-link-node', x:state.player.x, y:state.player.y, life:.42, total:.42, phase:0 });
      burst(state.player.x, state.player.y, '#bffff5', 5, 56);
      damagePlayer(1, 'boss-aurora');
    }
    recordDamageCounter(appliedDamage, enemy);
    enemy.hp -= amount;
    enemy.hitFlash = .12;
    if (enemy.kind === 'boss' && !enemy.isMiniBoss && enemy.hp > 0) {
      const ratio = enemy.hp / enemy.maxHp;
      const nextPhase = ratio <= .16 ? 4 : ratio <= .32 ? 3 : ratio <= .66 ? 2 : 1;
      if (nextPhase > (enemy.phase || 1)) {
        enemy.phase = nextPhase; enemy.cooldown = nextPhase === 4 ? .55 : .18;
        burst(enemy.x, enemy.y, enemy.color, nextPhase === 4 ? 72 : 30 + nextPhase * 8, nextPhase === 4 ? 310 : 190);
        if (nextPhase === 4) tone(92, .65, 'sawtooth', .045);
        toast(enemy.bossName.toUpperCase() + (nextPhase === 4 ? ' · TRIUNFO · FORMA FINAL' : ' · FASE ' + nextPhase));
         if (currentSkin().id === 'vulture' && randomUnit('loot') < .88) spawnVultureScrapPickup(enemy.x + random(-mobileSize(20), mobileSize(20), 'loot'), enemy.y + random(-mobileSize(18), mobileSize(18), 'loot'));
      }
    }
    if (currentSkin().id === 'vulture' && enemy.kind === 'boss' && !enemy.isMiniBoss && enemy.hp > 0) {
      if (state.elapsed >= (enemy.vultureScrapDropAt || 0)) {
        enemy.vultureScrapDropAt = state.elapsed + 1.15;
        if (randomUnit('loot') < .28) spawnVultureScrapPickup(enemy.x + random(-mobileSize(24), mobileSize(24), 'loot'), enemy.y + random(-mobileSize(18), mobileSize(18), 'loot'));
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
    state.invulnerable = Math.max(state.invulnerable, 1.5);
    toast('PROTEÇÃO DO DOMÍNIO · 1,5s');
    updateAbilityButton();
  }
  function beginEclipseSpecial() {
    if (state.eclipsePhase !== 'cinematic') return;
    if (ui.eclipseVideo) ui.eclipseVideo.pause();
    if (ui.eclipseCutscene) { ui.eclipseCutscene.hidden = true; ui.eclipseCutscene.setAttribute('aria-hidden', 'true'); }
    state.eclipsePhase = 'active';
    state.eclipseTime = Math.min(10.3, 10 + state.eclipseDurationBonus + Math.max(0, state.abilityPower - 1) * .7);
    state.invulnerable = Math.max(state.invulnerable, 3);
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
        const paradoxSlashBonus = enemy.eclipseParadoxComboTime > 0 ? enemy.kind === 'boss' ? .08 : .15 : 0;
        damageEnemy(enemy, (2.5 + state.eclipseCutDamage) * state.abilityPower * (1 + paradoxSlashBonus), true);
        state.eclipseHitCooldowns.push({ enemy, time: .55 });
        burst(nearestX, nearestY, '#fffafa', 5, 82);
      }
      for (const pickup of state.pickups) {
        if (pickup.dead) continue;
        const projection = clamp(((pickup.x - x1) * lineX + (pickup.y - y1) * lineY) / lineLengthSquared, 0, 1);
        const nearestX = x1 + lineX * projection; const nearestY = y1 + lineY * projection;
        if (Math.hypot(pickup.x - nearestX, pickup.y - nearestY) <= pickup.r + width + mobileSize(2)) collectPickup(pickup);
      }
    }
  }
  function eclipseParadoxDuration() { return 5 + state.eclipseParadoxDurationBonus; }
  function eclipseParadoxRadius() { return Math.hypot(Math.max(1, state.width), Math.max(1, state.height)) + mobileSize(state.eclipseParadoxRadiusBonus); }
  function eclipseParadoxCooldownDuration() { return Math.max(18, 26 - state.eclipseParadoxCooldownBonus * 2); }
  function finishEclipseParadox() {
    const field = state.eclipseParadox;
    if (!field) return;
    state.eclipseParadox = null;
    state.effects.push({ type:'eclipse-paradox-collapse', x:field.x, y:field.y, radius:field.radius, life:.72, total:.72 });
    burst(field.x, field.y, '#b58aff', 28, 185);
    burst(field.x, field.y, '#fff4ff', 12, 132);
    let sentenced = 0;
    for (const [enemy, exposure] of field.exposure) {
      if (enemy.dead) continue;
      const holdRatio = clamp(exposure / field.total, 0, 1);
      const bossScale = enemy.kind === 'boss' ? enemy.isMiniBoss ? .72 : .58 : 1;
      const sentenceDamage = (2.8 + holdRatio * 4.2 + state.eclipseParadoxDamageBonus) * state.abilityPower * bossScale;
      damageEnemy(enemy, sentenceDamage, true);
      if (!enemy.dead) {
        enemy.eclipseParadoxMarked = enemy.eclipseParadoxComboTime > 0 ? enemy.eclipseParadoxComboTime / 3 : 0;
        burst(enemy.x, enemy.y, '#d8bbff', 7, 118);
      }
      sentenced++;
    }
    toast('PARADOXO ABSOLUTO · SENTENÇA · ' + sentenced + ' ALVOS');
    tone(105, .4, 'sawtooth', .06);
    updateAbilityButton();
  }
  function empowerEclipseParadoxTargets() {
    const field = state.eclipseParadox;
    if (!field || field.life <= 0) return 0;
    field.comboTime = 3;
    let targets = 0;
    for (const [enemy, exposure] of field.exposure) {
      if (enemy.dead || exposure <= 0) continue;
      enemy.eclipseParadoxComboTime = 3;
      enemy.eclipseParadoxMarked = 1;
      targets++;
    }
    toast('SANTUÁRIO SINCRONIZADO · Q CONTINUA ATIVO · CORTES REFORÇADOS POR 3s · ' + targets + ' ALVOS');
    return targets;
  }
  function updateEclipseParadox(dt) {
    const field = state.eclipseParadox;
    if (!field) return;
    field.life = Math.max(0, field.life - dt);
    field.age += dt;
    field.pulseTimer -= dt;
    field.comboTime = Math.max(0, (field.comboTime || 0) - dt);
    for (const enemy of state.enemies) {
      if (enemy.dead || Math.hypot(enemy.x - field.x, enemy.y - field.y) > field.radius + enemy.r) continue;
      const exposure = Math.min(field.total, (field.exposure.get(enemy) || 0) + dt);
      field.exposure.set(enemy, exposure);
      enemy.eclipseParadoxMarked = Math.max(enemy.eclipseParadoxMarked || 0, exposure / field.total);
      if (field.comboTime > 0) enemy.eclipseParadoxComboTime = Math.max(enemy.eclipseParadoxComboTime || 0, field.comboTime);
    }
    if (field.pulseTimer <= 0) {
      const suppressionBase = .2 + state.eclipseParadoxSuppressBonus * .045;
      let interrupted = 0;
      for (const enemy of state.enemies) {
        if (enemy.dead || Math.hypot(enemy.x - field.x, enemy.y - field.y) > field.radius + enemy.r) continue;
        const suppression = enemy.kind === 'boss'
          ? Math.min(.16, .1 + state.eclipseParadoxSuppressBonus * .015)
          : suppressionBase;
        enemy.eclipseParadoxSuppression = Math.max(enemy.eclipseParadoxSuppression || 0, suppression);
        enemy.cooldown = Math.max(enemy.cooldown || 0, .34);
        if (enemy.kind === 'boss' && enemy.bossType === 'hunter' && !enemy.isMiniBoss) {
          enemy.dashTime = 0;
          enemy.dashCooldown = Math.max(enemy.dashCooldown || 0, .48);
        }
        interrupted++;
      }
      if (interrupted) state.effects.push({ type:'eclipse-paradox-pulse', x:field.x, y:field.y, radius:field.radius, life:.42, total:.42 });
      field.pulseTimer = Math.max(.62, .96 - state.eclipseParadoxSuppressBonus * .075);
    }
    if (field.life <= 0) finishEclipseParadox();
  }
  function activateEclipseParadox() {
    if (currentSkin().id !== 'eclipse' || state.mode !== 'playing' || state.eclipsePhase !== 'idle' || state.eclipseParadox?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.eclipseParadoxCooldown > 0) return;
    recordAchievementEvent('ship-ability', 'eclipse');
    const duration = eclipseParadoxDuration();
    const field = { x:state.player.x, y:state.player.y, radius:eclipseParadoxRadius(), life:duration, total:duration, age:0, pulseTimer:.28, comboTime:0, exposure:new Map() };
    state.eclipseParadox = field;
    state.eclipseParadoxCooldown = developerProfile ? 0 : eclipseParadoxCooldownDuration();
    burst(field.x, field.y, '#b58aff', 22, 126);
    burst(field.x, field.y, '#fff4ff', 9, 76);
    toast('PARADOXO ABSOLUTO · CAMPO DE DISTORÇÃO · ' + duration + 's');
    tone(240, .2, 'sine', .05);
    updateAbilityButton();
  }
  function dinoStampedeCooldownDuration() {
    const source = state.selectedSkin === 'prisma' && ['e','q'].some((slot) => {
      const choice = prismChoiceParts(state.prismAbilityChoices[slot]);
      return choice.shipId === 'saurion' && choice.key === 'q';
    })
      ? skins.find((skin) => skin.id === 'saurion') : currentSkin();
    const configuredBase = Number.isFinite(source?.cooldownQ) ? source.cooldownQ : 32;
    return Math.max(24, configuredBase - upgradeLevel('dinoResonance') * 2);
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
        life: .32, total: .32, color: claw === 0 ? '#fff0ce' : '#ff8a28'
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
    const bossDamageLedger = new Map();
    for (let index = 0; index < count; index++) {
      const lanePosition = index / Math.max(1, count - 1);
      const y = index === 0 ? clamp(state.player.y, 34, state.height - 34) : clamp(state.height * (.2 + lanePosition * .6) + random(-state.height * .04, state.height * .04, 'ability'), 34, state.height - 34);
      const fromLeft = index === 0 && mainBoss ? mainBoss.x >= state.player.x : randomUnit('ability') < .5;
      const x = fromLeft ? -75 : state.width + 75;
      const target = index === 0 && mainBoss ? mainBoss : nearestDinoTarget(x, y, false);
      const angle = target ? Math.atan2(target.y - y, target.x - x) : fromLeft ? 0 : Math.PI;
      const life = 2.65;
      state.effects.push({ type: 'dino-raptor', x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, angle, turnRate: 5.1, target, size: mobileSize(34), radius: mobileSize(36), damage: (8 + state.dinoStampedeDamageBonus) * state.abilityPower, bossDamageLedger, life, total: life, hit: [] });
    }
    burst(state.player.x, state.player.y, '#f28a28', 30, 160);
    burst(state.player.x, state.player.y, '#ffe3a0', 9, 100);
    toast('INVESTIDA DO TIGRE · ' + count + ' INVESTIDAS · ' + (developerProfile ? '∞' : state.dinoStampedeCharges + '/3') + ' CARGAS');
    tone(125, .28, 'sawtooth', .045);
    updateAbilityButton();
  }
  function prismAbilityBusy() {
    return Boolean(state.prismHorizonAnchor?.life > 0 || state.auroraLink?.life > 0 || state.aegisOrbit?.life > 0
      || state.eclipsePhase === 'cinematic' || state.eclipsePhase === 'active' || state.eclipseParadox?.life > 0
      || state.chronosEcho?.life > 0 || state.slowTime > 0 || state.reflectTime > 0
      || state.redshiftPerimeter?.life > 0 || state.flashTrail?.life > 0
      || state.effects.some((effect) => effect.life > 0 && ['blade','singularity-shot','tempest-tide','dino-raptor'].includes(effect.type))
      || state.enemies.some((enemy) => !enemy.dead && enemy.dinoCutMark > 0));
  }
  function prismSlotCooldown(slot) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (shipId === 'mahoraga') return key === 'q' ? state.mahoragaSlashCooldown : state.mahoragaParryCooldown;
    if (key === 'q' && shipId === 'tempest') return state.tempestTideCharges > 0 ? 0 : state.tempestTideCooldown;
    if (key === 'q' && shipId === 'saurion') return state.dinoStampedeCharges > 0 ? 0 : state.dinoStampedeRecharge;
    return slot === 'q' ? state.prismQCooldown : state.abilityCooldown;
  }
  function setPrismSlotCooldown(slot, value) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (shipId === 'mahoraga') { if (key === 'q') state.mahoragaSlashCooldown = value; else state.mahoragaParryCooldown = value; return; }
    if (key === 'q' && (shipId === 'tempest' || shipId === 'saurion')) return;
    if (slot === 'q') state.prismQCooldown = value;
    else state.abilityCooldown = value;
  }
  function prismChoiceActive(slot) {
    const { shipId, key } = prismChoiceParts(state.prismAbilityChoices[slot]);
    if (shipId === 'prisma') return key === 'q' ? Boolean(state.prismHorizonAnchor?.life > 0) : state.effects.some((effect) => effect.type === 'prism-core-wave' && effect.life > 0);
    if (key === 'e') return shipId === 'mahoraga' ? state.mahoragaParryWindow > 0
      : shipId === 'eclipse' ? ['cinematic','active'].includes(state.eclipsePhase)
      : shipId === 'aegis' ? state.tempShields > 0
        : shipId === 'chronos' ? state.slowTime > 0
          : shipId === 'redshift' ? state.reflectTime > 0 : false;
    if (shipId === 'aurora') return Boolean(state.auroraLink?.life > 0);
    if (shipId === 'aegis') return Boolean(state.aegisOrbit?.life > 0);
    if (shipId === 'eclipse') return Boolean(state.eclipseParadox?.life > 0);
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
    const selectedShip = skins.find((skin) => skin.id === shipId);
    if (!selectedShip || selectedShip.profileRestricted && !hasSecretShipAccess(selectedShip)) return false;
    const returning = shipId === 'prisma' && key === 'q' && state.prismHorizonAnchor?.life > 0;
    if (returning) return true;
    if (!hasDeveloperPerks() && prismSlotCooldown(slot) > 0) return false;
    if (shipId === 'prisma') return true;
    if (key === 'e') return shipId === 'mahoraga' ? state.mahoragaParryWindow <= 0 && state.mahoragaParryCooldown <= 0 : shipId !== 'eclipse' || state.eclipsePhase === 'idle';
    if (shipId === 'aurora') return !state.auroraLink?.life;
    if (shipId === 'aegis') return !state.aegisOrbit?.life;
    if (shipId === 'eclipse') return !state.eclipseParadox?.life && state.eclipsePhase === 'idle';
    if (shipId === 'chronos') return !state.chronosEcho?.life;
    if (shipId === 'redshift') return !state.redshiftPerimeter?.life;
    if (shipId === 'flashblade') return !state.flashTrail?.life;
    if (shipId === 'tempest') return state.tempestTideCharges > 0;
    if (shipId === 'saurion') return state.dinoStampedeCharges > 0;
    if (shipId === 'megumi') return state.megumiSummonCooldown <= 0;
    return true;
  }
  function prismChoiceIcon(skin, key) {
    if (skin.id === 'prisma') return key === 'q' ? '⌖' : '✧';
    return ({ aurora:{e:'✴',q:'✧'}, aegis:{e:'⬡',q:'⬡'}, chronos:{e:'◷',q:'◌'}, tempest:{e:'◉',q:'↗'}, flashblade:{e:'✧',q:'〰'}, redshift:{e:'◈',q:'△'}, eclipse:{e:'◉',q:'◌'}, saurion:{e:'〰',q:'🐾'}, mahoraga:{e:'☸',q:'斬'}, megumi:{e:'影',q:'召'}, flamestorm:{e:'🔥',q:'🌀'} })[skin.id]?.[key] || '✦';
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
      if (skin.noAbilities || skin.hiddenFromHangar || skin.profileRestricted && !hasSecretShipAccess(skin)) return;
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
    if (state.megumiSummonPhase === 'cinematic') return;
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
          aurora:'auroraLinkCooldown', aegis:'aegisOrbitCooldown', eclipse:'eclipseParadoxCooldown',
          chronos:'chronosEchoCooldown', redshift:'redshiftPerimeterCooldown', flashblade:'flashTrailCooldown',
          tempest:'tempestTideCooldown', saurion:'dinoStampedeRecharge', flamestorm:'flameStormQCooldown'
        };
        const cooldownField = qCooldownFields[shipId];
        if (cooldownField) state[cooldownField] = 0;
        activateSecondaryAbility();
        if (cooldownField && shipId !== 'tempest' && shipId !== 'saurion') state[cooldownField] = 0;
      }
      state.prismDispatchSkinId = '';
      if (slot === 'q') state.abilityCooldown = previousECooldown;
      if (slot === 'e') state.prismQCooldown = previousQCooldown;
      if (!hasDeveloperPerks() && !isHorizonReturn) setPrismSlotCooldown(slot, shipId === 'mahoraga' ? key === 'q' ? mahoragaSlashCooldownDuration() : 14 : shipId === 'megumi' && key === 'q' ? 45 : prismCooldownDuration());
      if (!isHorizonReturn) prismCopiedEffect(shipId);
    }
    state.prismDispatchSlot = '';
    updateAbilityButton();
  }
  function activateSecondaryAbility() {
    if (currentSkin().id === 'training') { activateFerrumInvestida(); return; }
    if (currentSkin().noAbilities) return;
    if (currentSkin().id === 'prisma' && !state.prismDispatchSkinId) { activatePrismAbilityChoice('q'); return; }
    if (currentSkin().id === 'mahoraga') { activateMahoragaWorldSlash(); return; }
    if (currentSkin().id === 'megumi') { startMegumiSummon(); return; }
    if (currentSkin().id === 'aurora') activateAuroraLink();
    else if (currentSkin().id === 'aegis') activateAegisOrbit();
    else if (currentSkin().id === 'eclipse') activateEclipseParadox();
    else if (currentSkin().id === 'chronos') activateChronosEcho();
    else if (currentSkin().id === 'redshift') activateRedshiftPerimeter();
    else if (currentSkin().id === 'flashblade') activateFlashTrail();
    else if (currentSkin().id === 'saurion') activateDinoStampede();
    else if (currentSkin().id === 'saurion-primal') openSaurionSummonPicker('q');
    else if (currentSkin().id === 'tempest') activateTempestTide();
    else if (currentSkin().id === 'flamestorm') activateFlameStormVortex();
    else if (currentSkin().id === 'vulture') activateVultureQ();
  }
  function vultureUltPowerActive() { return currentSkin().id === 'vulture' && state.vultureUltPhase === 'power' && state.vultureEvolutionTime > 0; }
  function vultureUltCollapseActive() { return currentSkin().id === 'vulture' && state.vultureUltPhase === 'collapse' && state.vultureEvolutionTime > 0; }
  function vultureFoldCooldownDuration() { return Math.max(22, Math.min(24, Number(state.abilityBaseCooldown) || 24)); }
  function vulturePulseCooldownDuration() { return Math.max(2.25, 3 - upgradeLevel('vulturePulseCooldown') * .25); }
  function vulturePulseRadius() { return mobileSize(74 + state.vulturePulseRadiusBonus); }
  function activateVultureFold() {
    const empowered = vultureUltPowerActive();
    if (currentSkin().id !== 'vulture' || state.mode !== 'playing' || vultureUltCollapseActive() || (state.vultureEvolutionTime > 0 && !empowered) || state.vultureFoldCharges <= 0) return false;
    state.vultureFoldCharges--;
    if (state.vultureFoldCharges <= 0) {
      if (hasDeveloperPerks()) state.vultureFoldCharges = 3;
      else state.vultureFoldRecharge = vultureFoldCooldownDuration();
    }
    const angle = Number.isFinite(state.player.moveAngle) ? state.player.moveAngle : Number.isFinite(state.player.angle) ? state.player.angle : -Math.PI / 2;
    const start = { x:state.player.x, y:state.player.y };
    const range = Math.min(mobileSize((285 + state.vultureFoldRangeBonus) * (empowered ? 1.8 : 1)), Math.hypot(state.width, state.height) * .78);
    state.player.x = clamp(state.player.x + Math.cos(angle) * range, state.player.radius + 8, state.width - state.player.radius - 8);
    state.player.y = clamp(state.player.y + Math.sin(angle) * range, state.player.radius + 8, state.height - state.player.radius - 8);
    state.vultureCloakTime = 2;
    state.effects.push({ type:'vulture-fold', x:start.x, y:start.y, life:.42, total:.42, color:'#ff7133' });
    state.effects.push({ type:'vulture-fold', x:state.player.x, y:state.player.y, life:.5, total:.5, color:'#ffd16c' });
    if (empowered) {
      const end = { x:state.player.x, y:state.player.y };
      state.effects.push({ type:'vulture-fold-strike', x1:start.x, y1:start.y, x2:end.x, y2:end.y, width:mobileSize(24), life:.42, total:.42 });
      for (const enemy of state.enemies) {
        if (enemy.dead || distanceToSegment(enemy, start, end) > enemy.r + mobileSize(20)) continue;
        damageEnemy(enemy, enemy.kind === 'boss' ? 15 : 24, true);
        if (!enemy.dead) enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .55 : .9);
        burst(enemy.x, enemy.y, '#ff9d3f', enemy.kind === 'boss' ? 14 : 10, 125);
      }
      burst((start.x + end.x) / 2, (start.y + end.y) / 2, '#ffe5a2', 18, 170);
    }
    burst(start.x, start.y, '#ff7133', 12, 125);
    burst(state.player.x, state.player.y, '#ffd16c', 16, 145);
    toast(empowered ? 'PROPULSÃO ASCENDENTE · ALCANCE E IMPACTO AMPLIADOS' : 'DOBRA ESPACIAL · CAMUFLAGEM CÓSMICA');
    updateAbilityButton();
    return true;
  }
  function vultureTargets() {
    return state.enemies.filter((enemy) => !enemy.dead)
      .sort((a, b) => (a.kind === 'boss' ? -1 : 0) - (b.kind === 'boss' ? -1 : 0) || distance(state.player, a) - distance(state.player, b));
  }
  function vultureQDoubleTapAvailable() {
    return currentSkin().id === 'vulture' && state.mode === 'playing' && state.vultureScrap > 0 && state.vultureQLastTapAt > 0 && performance.now() - state.vultureQLastTapAt <= VULTURE_Q_DOUBLE_TAP_MS && state.vultureEvolutionTime <= 0 && state.vultureOverloadTime <= 0;
  }
  function fireVultureGravityShot({ forced = false, charged = false, combo = false, energyCharge = 0, scrapCharge = 0 } = {}) {
    const target = vultureTargets()[0] || null;
    const aimAngle = target
      ? Math.atan2(target.y - state.player.y, target.x - state.player.x)
      : Number.isFinite(state.player.moveAngle) ? state.player.moveAngle : state.player.angle || -Math.PI / 2;
    const empowered = forced || charged || combo;
     const energyBonus = 18 * clamp(energyCharge, 0, 1);
     const scrapBonus = 2.5 * clamp(scrapCharge, 0, 8);
     const shotDamage = (charged ? 50 : forced ? 32 : 13) + energyBonus + scrapBonus;
     state.effects.push({ type:'vulture-horizon-shot', x:state.player.x + Math.cos(aimAngle) * mobileSize(18), y:state.player.y + Math.sin(aimAngle) * mobileSize(18), angle:aimAngle, target, hit:false, forced, charged:empowered, damage:shotDamage + state.vulturePulseDamageBonus, impactRadius:vulturePulseRadius() * (empowered ? 1.5 : 1), life:.82, total:.82 });
    state.effects.push({ type:'vulture-pulse', x:state.player.x, y:state.player.y, radius:0, maxRadius:mobileSize(empowered ? 125 : 85), life:empowered ? .48 : .35, total:empowered ? .48 : .35 });
    burst(state.player.x, state.player.y, '#ff7133', empowered ? 30 : 18, empowered ? 190 : 125);
    burst(state.player.x, state.player.y, '#ffd16c', empowered ? 16 : 8, 95);
    if (forced) toast('SOBRECARGA · MÍSSIL GRAVITACIONAL FORÇADO');
    else if (charged) toast('MÍSSIL CARREGADO · 8 SUCATAS · +' + Math.round(energyBonus + scrapBonus) + ' DE DANO EXTRA');
    else if (combo) toast('Q DUPLO · MÍSSIL REFORÇADO · −' + scrapCharge + ' SUCATAS · +' + Math.round(energyBonus + scrapBonus) + ' DE DANO');
    else toast('MÍSSIL GRAVITACIONAL · +' + Math.round(energyBonus + scrapBonus) + ' DE ENERGIA/SUCATA');
    tone(empowered ? 105 : 165, empowered ? .4 : .25, 'sawtooth', .05);
  }
  function triggerVultureOverload() {
    const energyCharge = clamp((state.vultureCannonCharge || 0) / VULTURE_CANNON_CHARGE_SECONDS, 0, 1);
    const scrapCharge = state.vultureScrap;
    state.vultureScrap = 0;
    state.vultureCannonCharge = 0;
    state.vultureOverloadCountdown = 0;
    state.vultureQPressStartedAt = 0; state.vultureQPressSource = ''; state.vultureQPressPointerId = null; state.vultureQPressHoldTriggered = false;
    state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    state.shields = 0;
    state.tempShields = 0;
    state.aegisBarrierCharges = 0;
    state.aegisBarrierTime = 0;
    state.vultureOverloadTime = 1.8;
    state.vultureVulnerableTime = 2.6;
    state.vultureVulnerableHitCooldown = 0;
    state.vultureCloakTime = 0;
    state.invulnerable = 0;
    fireVultureGravityShot({ forced:true, energyCharge, scrapCharge });
    state.vultureQCooldown = hasDeveloperPerks() ? 0 : vulturePulseCooldownDuration();
    updateHud();
  }
  function activateVultureQ() {
    const doubleTap = vultureQDoubleTapAvailable();
    const empoweredPhase = vultureUltPowerActive();
    const hasFullCharge = state.vultureScrap >= 8 && state.vultureOverloadCountdown > 0;
    if (currentSkin().id !== 'vulture' || state.mode !== 'playing' || vultureUltCollapseActive() || (state.vultureEvolutionTime > 0 && !empoweredPhase) || (empoweredPhase ? state.vultureQCooldown > 0 : !hasFullCharge && !doubleTap && state.vultureQCooldown > 0) || state.vultureOverloadTime > 0 || (!empoweredPhase && !doubleTap && state.effects.some((effect) => effect.type === 'vulture-horizon-shot' && effect.life > 0))) return;
    const currentEnergyCharge = clamp((state.vultureCannonCharge || 0) / VULTURE_CANNON_CHARGE_SECONDS, 0, 1);
    const energyCharge = doubleTap ? Math.max(currentEnergyCharge, state.vultureQStoredEnergyCharge || 0) : currentEnergyCharge;
    const scrapCharge = state.vultureScrap;
    if (empoweredPhase) {
      fireVultureGravityShot({ charged:true, energyCharge, scrapCharge:8 });
      state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    } else if (hasFullCharge) {
      fireVultureGravityShot({ charged:true, energyCharge, scrapCharge });
      state.vultureScrap = 0;
      state.vultureOverloadCountdown = 0;
      state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    } else if (doubleTap) {
      fireVultureGravityShot({ combo:true, energyCharge, scrapCharge });
      state.vultureScrap = 0;
      state.vultureOverloadCountdown = 0;
      state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    } else {
      fireVultureGravityShot({ energyCharge, scrapCharge:0 });
      state.vultureQLastTapAt = performance.now();
      state.vultureQStoredEnergyCharge = energyCharge;
    }
    state.vultureCannonCharge = 0;
    state.vultureQCooldown = empoweredPhase ? 2 : hasDeveloperPerks() ? 0 : vulturePulseCooldownDuration();
    recordAchievementEvent('ship-ability', 'vulture');
    updateHud();
  }
  function activateVultureAbsorption() {
    if (currentSkin().id !== 'vulture' || state.mode !== 'playing' || state.vultureEvolutionTime > 0 || state.vultureOverloadTime > 0) return false;
    if (state.vultureAbsorbCooldown > 0) { toast('ABSORÇÃO RECARREGANDO · ' + Math.ceil(state.vultureAbsorbCooldown) + 's'); return false; }
    if (state.vultureScrap < 3) { toast('ABSORÇÃO INDISPONÍVEL · PRECISA DE 3 SUCATAS'); return false; }
    if (!canRestoreShield()) { toast('ESCUDOS NO LIMITE · SUCATA PRESERVADA'); return false; }
    state.vultureScrap -= 3;
    state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    restoreOneShield();
    if (state.vultureScrap < 8) state.vultureOverloadCountdown = 0;
    state.vultureAbsorbCooldown = 3.2;
    state.effects.push({ type:'vulture-absorb-field', x:state.player.x, y:state.player.y, radius:0, maxRadius:mobileSize(128), rotation:0, life:.82, total:.82 });
    burst(state.player.x, state.player.y, '#ff9a45', 20, 135);
    burst(state.player.x, state.player.y, '#ffe0a0', 9, 72);
    toast('ABSORÇÃO DE DESTROÇOS · −3 SUCATAS · +1 ESCUDO');
    tone(620, .22, 'triangle', .05);
    updateHud();
    return true;
  }
  function beginVultureQPress(source, pointerId = null) {
    if (currentSkin().id !== 'vulture' || state.mode !== 'playing' || vultureUltCollapseActive() || (state.vultureEvolutionTime > 0 && !vultureUltPowerActive()) || state.vultureOverloadTime > 0 || state.vultureQPressStartedAt) return false;
    state.vultureQPressStartedAt = performance.now();
    state.vultureQPressSource = source;
    state.vultureQPressPointerId = pointerId;
    state.vultureQPressHoldTriggered = false;
    return true;
  }
  function finishVultureQPress(source, pointerId = null, allowTap = true) {
    if (!state.vultureQPressStartedAt || state.vultureQPressSource !== source || (source === 'pointer' && state.vultureQPressPointerId !== pointerId)) return false;
    const held = state.vultureQPressHoldTriggered || performance.now() - state.vultureQPressStartedAt >= 460;
    const holdTriggered = state.vultureQPressHoldTriggered;
    state.vultureQPressStartedAt = 0; state.vultureQPressSource = ''; state.vultureQPressPointerId = null; state.vultureQPressHoldTriggered = false;
    if (!held && allowTap) activateVultureQ();
    else if (held && !holdTriggered && allowTap) { if (vultureUltPowerActive()) activateVultureQ(); else activateVultureAbsorption(); }
    updateAbilityButton();
    return true;
  }
  function updateVultureQPress() {
    if (!state.vultureQPressStartedAt || state.vultureQPressHoldTriggered || performance.now() - state.vultureQPressStartedAt < 460) return;
    if (vultureUltPowerActive()) return;
    state.vultureQPressHoldTriggered = true;
    activateVultureAbsorption();
    updateAbilityButton();
  }
  function activateVultureUltimate() {
    if (currentSkin().id !== 'vulture' || state.mode !== 'playing' || state.vultureScrap < 8 || state.vultureOverloadCountdown <= 0 || state.vultureOverloadTime > 0 || state.vultureEvolutionTime > 0) return;
    state.vultureScrap = 0;
    state.vultureQLastTapAt = 0; state.vultureQStoredEnergyCharge = 0;
    state.vultureOverloadCountdown = 0;
    state.vultureCloakTime = 0;
    state.vultureEvolutionTime = VULTURE_ULT_POWER_SECONDS + VULTURE_ULT_COLLAPSE_SECONDS;
    state.vultureUltPowerTime = VULTURE_ULT_POWER_SECONDS;
    state.vultureUltPhase = 'power';
    state.vultureUltPulseCooldown = .35;
    state.vultureFoldCharges = 3;
    state.vultureFoldRecharge = 0;
    state.vultureQCooldown = 0;
    state.vultureQPressStartedAt = 0; state.vultureQPressSource = ''; state.vultureQPressPointerId = null; state.vultureQPressHoldTriggered = false;
    state.effects.push({ type:'vulture-transform', x:state.player.x, y:state.player.y, followPlayer:true, rotation:0, life:2.05, total:2.05 });
    burst(state.player.x, state.player.y, '#ff8b35', 58, 245);
    burst(state.player.x, state.player.y, '#ffe0a0', 30, 175);
    toast('DEVORADORA DE ESTRELAS · FORMA ASCENDENTE POR 10s');
    tone(86, .58, 'sawtooth', .055);
    recordAchievementEvent('ship-ability', 'vulture');
    updateHud();
  }
  function beginVultureCollapse() {
    if (state.vultureUltPhase !== 'power' || state.vultureEvolutionTime <= 0) return;
    state.vultureUltPhase = 'collapse';
    state.vultureUltPowerTime = 0;
    state.vultureQPressStartedAt = 0; state.vultureQPressSource = ''; state.vultureQPressPointerId = null; state.vultureQPressHoldTriggered = false;
    state.vultureCloakTime = 0;
    state.effects.push({ type:'vulture-ult-field', x:state.player.x, y:state.player.y, radius:Math.min(state.width, state.height) * .62, pulseCooldown:.25, rotation:0, life:VULTURE_ULT_COLLAPSE_SECONDS, total:VULTURE_ULT_COLLAPSE_SECONDS });
    burst(state.player.x, state.player.y, '#ff9e3d', 34, 205);
    burst(state.player.x, state.player.y, '#fff0bc', 18, 142);
    toast('CAMPO DE COLAPSO · MOVA-SE POR 6s');
    tone(74, .5, 'sawtooth', .05);
    updateHud();
  }
  function activeVultureUltField() {
    if (currentSkin().id !== 'vulture' || !vultureUltCollapseActive()) return null;
    return state.effects.find((effect) => effect.type === 'vulture-ult-field' && effect.life > 0) || null;
  }
  function finishVultureUltimate() {
    if (currentSkin().id !== 'vulture') return;
    state.vultureUltPhase = 'idle';
    state.vultureUltPowerTime = 0;
    state.vultureEvolutionTime = 0;
    const field = state.effects.find((effect) => effect.type === 'vulture-ult-field');
    const origin = field || state.player;
    const radius = Math.min(state.width, state.height) * .62;
    state.effects.push({ type:'vulture-ult-burst', x:origin.x, y:origin.y, radius, life:1.05, total:1.05 });
    for (const enemy of state.enemies) {
      if (enemy.dead || distance(origin, enemy) > radius + enemy.r) continue;
       damageEnemy(enemy, enemy.kind === 'boss' ? 18 : 28, true);
    }
    burst(origin.x, origin.y, '#ffe0a0', 44, 275);
    burst(origin.x, origin.y, '#ff7330', 30, 235);
    toast('DEVORADORA DE ESTRELAS · EXPLOSÃO FINAL');
    tone(72, .46, 'sawtooth', .05);
    updateHud();
  }
  function spawnVultureScrapPickup(x, y) {
    if (currentSkin().id !== 'vulture' || state.vultureScrap >= 8 || state.vultureEvolutionTime > 0) return;
    const scrapType = Math.floor(randomUnit('loot') * vultureScrapSprites.length);
    state.pickups.push({ x, y, kind:'vulture-scrap', scrapType, r:mobileSize(13), life:18, spin:random(-.35,.35,'loot') });
  }
  function flameStormVortexCooldownDuration() { return Math.max(18, 24 - upgradeLevel('cooldown') * 1.2); }
  function flameStormVortexRadius() { return mobileSize(265 + upgradeLevel('flameStormVortexCore') * 12); }
  function flameStormVortexPulseDamage() { return 3.4 + upgradeLevel('flameStormVortexCore') * .15; }
  function flameStormVortexVisualOpacity(effect) {
    const elapsed = effect.total - effect.life;
    const fadeDuration = Math.min(.85, effect.total);
    const fadeStart = effect.total - fadeDuration;
    return elapsed <= fadeStart ? 1 : clamp((effect.total - elapsed) / fadeDuration, 0, 1);
  }
  function activateFlameStormVortex() {
    if (currentSkin().id !== 'flamestorm' || state.mode !== 'playing' || state.flameStormQCooldown > 0 || state.effects.some((effect) => effect.type === 'flamestorm-vortex' && effect.life > 0)) return;
    const skin = currentSkin();
    state.flameStormQCooldown = hasDeveloperPerks() ? 0 : flameStormVortexCooldownDuration();
    state.flameStormQIntangible = 5.7;
    state.invulnerable = Math.max(state.invulnerable, state.flameStormQIntangible);
    state.effects.push({ type:'flamestorm-vortex', x:state.player.x, y:state.player.y, life:5, total:5, radius:flameStormVortexRadius(), damageClock:.08, rotation:0 });
    burst(state.player.x, state.player.y, '#ff2c32', 48, 235);
    burst(state.player.x, state.player.y, '#ffc07a', 22, 155);
    recordAchievementEvent('ship-ability', skin.id);
    toast('VÓRTICE CARMESIM · INIMIGOS E TIROS ATRAÍDOS');
    tone(118, .36, 'sawtooth', .045);
    updateAbilityButton();
  }
  function activateFlameStormBoost() {
    if (currentSkin().id !== 'flamestorm' || state.mode !== 'playing' || state.abilityCooldown > 0 || state.flameStormDash?.life > 0) return;
    const skin = currentSkin();
    const angle = Number.isFinite(state.player.angle) ? state.player.angle : -Math.PI / 2;
    state.flameStormDash = { life:5, total:5, angle };
    state.abilityCooldown = hasDeveloperPerks() ? 0 : state.abilityBaseCooldown || skin.cooldown;
    state.effects.push({ type:'flamestorm-trail', x:state.player.x, y:state.player.y, life:5.3, total:5.3, width:mobileSize(7), damage:(7.5 + upgradeLevel('flameStormDashCore') * .4) * state.abilityPower, points:[{ x:state.player.x, y:state.player.y }], hitCooldowns:new Map(), ownerDash:state.flameStormDash });
    burst(state.player.x, state.player.y, '#ff312e', 24, 185);
    burst(state.player.x, state.player.y, '#ffd07b', 14, 125);
    recordAchievementEvent('ship-ability', skin.id);
    toast('PROPULSÃO INFERNAL · 5s · INTANGÍVEL · RICOCHETE E DIREÇÃO CONTROLÁVEL');
    tone(196, .24, 'sawtooth', .05);
    updateAbilityButton();
  }
  function deactivateMahoragaForm({ expired = false, deathReturn = false } = {}) {
    if (!state.megumiTransformed || !['playing','paused','upgrade'].includes(state.mode)) return false;
    const originalShip = skins.find((skin) => skin.id === (state.megumiTransformSource === 'prisma' ? 'prisma' : 'megumi')) || skins[0];
    state.megumiTransformed = false;
    state.megumiFormWavesRemaining = 0;
    state.megumiSummonCooldown = mahoragaFormCooldownDuration;
    state.megumiTransformSource = '';
    state.megumiSummonPhase = 'idle';
    state.mahoragaParryWindow = 0;
    state.mahoragaParryCooldown = 0;
    state.mahoragaShieldHitCooldown = 0;
    state.mahoragaAdaptationVisualTime = 0;
    resetMahoragaAdaptationCycle();
    state.player.color = originalShip.color; state.player.accent = originalShip.accent; state.player.shape = originalShip.shape;
    toast(deathReturn ? 'MAHORAGA PROTEGEU SUA ÚLTIMA VIDA · 1 VIDA · RECARGA 45s' : expired ? 'MAHORAGA RECUA · LIMITE DE 5 ONDAS · RECARGA 45s' : 'NAVE NORMAL RESTAURADA · RECARGA 45s');
    updateEquippedShip(); updateControlUI(); updateHud();
    return true;
  }
  function startMegumiSummon() {
    if (state.mode !== 'playing' || state.megumiSummonPhase === 'cinematic' || state.megumiSummonCooldown > 0) return;
    recordAchievementEvent('ship-ability', 'megumi');
    state.megumiSummonCooldown = 0;
    state.megumiFormWavesRemaining = 0;
    state.megumiSummonPhase = 'cinematic';
    state.megumiTransformSource = state.selectedSkin === 'prisma' ? 'prisma' : 'megumi';
    state.megumiTransformed = false;
    state.keys.clear(); state.pointer.active = false; releaseAnalog();
    if (ui.pause) ui.pause.disabled = true;
    if (ui.stop) ui.stop.disabled = true;
    cancelAnimationFrame(state.raf); state.raf = 0;
    if (ui.megumiCutscene) { ui.megumiCutscene.hidden = false; ui.megumiCutscene.setAttribute('aria-hidden', 'false'); }
    tone(72, .52, 'sawtooth', .06);
    updateAbilityButton();
    megumiCutsceneTimer = window.setTimeout(() => {
      megumiCutsceneTimer = 0;
      if (state.megumiSummonPhase !== 'cinematic' || state.mode !== 'playing') return;
      if (ui.megumiCutscene) { ui.megumiCutscene.hidden = true; ui.megumiCutscene.setAttribute('aria-hidden', 'true'); }
      state.megumiSummonPhase = 'active';
      state.megumiTransformed = true;
      state.megumiFormWavesRemaining = mahoragaFormWaveLimit;
      resetMahoragaAdaptationCycle();
      state.mahoragaReviveUsed = false;
      playMahoragaAdaptationSound();
      state.abilityCooldown = 0;
      state.mahoragaParryCooldown = 0; state.mahoragaParryWindow = 0; state.mahoragaShieldHitCooldown = 0; state.mahoragaSlashCooldown = 0;
      if (ui.pause) ui.pause.disabled = false;
      if (ui.stop) ui.stop.disabled = false;
      burst(state.player.x, state.player.y, '#b99bdd', 38, 210);
      burst(state.player.x, state.player.y, '#f1ecff', 16, 150);
      toast('MAHORAGA DESPERTO · 5 ONDAS · 1 VIDA EXTRA · G OU BOTÃO PARA VOLTAR');
      tone(440, .36, 'triangle', .055);
      updateAbilityButton(); updateEquippedShip(); updateControlUI(); updateHud();
      state.lastTime = performance.now();
      state.raf = requestAnimationFrame(frame);
    }, 2550);
  }
  function activateMegumiTechnique() {
    if (state.mode !== 'playing' || state.megumiSummonPhase === 'cinematic') return;
    if (!hasDeveloperPerks() && state.abilityCooldown > 0) return;
    const technique = megumiTechnique();
    recordAchievementEvent('ship-ability', 'megumi');
    state.abilityCooldown = hasDeveloperPerks() ? 0 : megumiTechniqueCooldownDuration();
    if (technique.id === 'rabbits') {
      const strengths = [2.6, 1.9, 1.45, 1.05, .72];
      state.megumiRabbits = Array.from({ length: 5 }, (_, index) => {
        const angle = random(-Math.PI, Math.PI, 'ability');
        const radius = random(18, 58, 'ability');
        return { x:clamp(state.player.x + Math.cos(angle) * radius, 20, state.width - 20), y:clamp(state.player.y + Math.sin(angle) * radius, 20, state.height - 20), angle:random(-Math.PI, Math.PI, 'ability'), speed:random(105, 190, 'ability'), turn:random(.7, 1.8, 'ability'), turnTimer:random(.35, 1.2, 'ability'), fireCooldown:random(.05, .5, 'ability'), life:7.5, total:7.5, damage:strengths[index] * state.abilityPower, index };
      });
      burst(state.player.x, state.player.y, '#c6b0ee', 30, 160);
      toast('FUGA DOS COELHOS · 5 ISCAS ARMADAS');
      tone(640, .15, 'triangle', .04);
    } else if (technique.id === 'shadow') {
      state.megumiCloakTime = 6.5;
      state.megumiCloakLastX = state.player.x; state.megumiCloakLastY = state.player.y;
      ui.stage?.classList.add('starfall-megumi-shadow-veil');
      state.enemyBullets.forEach((bullet) => { if (!bullet.reflected) bullet.dead = true; });
      burst(state.player.x, state.player.y, '#8f78bd', 26, 135);
      state.effects.push({ type:'megumi-shadow-burst', x:state.player.x, y:state.player.y, radius:mobileSize(390), life:.8, total:.8 });
      toast('OCULTAÇÃO NAS SOMBRAS · INVISÍVEL · ATRAVESSE AS BORDAS');
      tone(180, .28, 'sine', .05);
    } else {
      const radius = mobileSize(365);
      state.effects.push({ type:'megumi-nue-wave', x:state.player.x, y:state.player.y, radius, life:.88, total:.88 });
      let hitCount = 0;
      for (const enemy of state.enemies) {
        if (enemy.dead || distance(state.player, enemy) > radius + enemy.r) continue;
        const damage = (30 + Math.min(10, state.wave * .25)) * state.abilityPower;
        damageEnemy(enemy, damage, true); hitCount++;
        state.effects.push({ type:'megumi-nue-bolt', x1:state.player.x, y1:state.player.y, x2:enemy.x, y2:enemy.y, seed:randomUnit('ability'), life:.45, total:.45 });
        burst(enemy.x, enemy.y, '#b9f4ff', enemy.kind === 'boss' ? 16 : 9, enemy.kind === 'boss' ? 150 : 105);
      }
      state.enemyBullets.forEach((bullet) => { if (!bullet.reflected && distance(state.player, bullet) < radius) bullet.dead = true; });
      burst(state.player.x, state.player.y, '#89dcff', 56, 270); burst(state.player.x, state.player.y, '#f5faff', 22, 195);
      toast('NUE · DESCARGA ELÉTRICA · ' + hitCount + ' ALVOS');
      tone(940, .3, 'sawtooth', .055);
    }
    state.megumiTechnique = rollMegumiTechnique(technique.id);
    updateAbilityButton();
  }
  function activateMahoragaAdaptation() {
    if (state.mahoragaParryCooldown > 0) return;
    recordAchievementEvent('ship-ability', 'mahoraga');
    state.mahoragaParryWindow = 3;
    state.mahoragaParryCooldown = 14;
    state.mahoragaAdaptationVisualTime = 3;
    burst(state.player.x, state.player.y, '#f1d38a', 20, 135);
    burst(state.player.x, state.player.y, '#eef3ee', 12, 92);
    let specialAdaptation = false;
    if (state.mahoragaWheelReady) {
      const adaptedType = state.mahoragaLastType || 'projectile';
      state.mahoragaWheelReady = false;
      state.mahoragaWheelSegments = 0;
      advanceMahoragaAdaptation(adaptedType, true);
      specialAdaptation = true;
    }
    updateAbilityButton();
    toast(specialAdaptation ? 'ADAPTAÇÃO DIVINA · ESCUDO 3s · ' + mahoragaAttackName(state.mahoragaResistanceType) + ' −' + Math.round(state.mahoragaResistancePower * 100) + '% ATÉ ONDA ' + state.mahoragaResistanceUntilWave : 'ADAPTAÇÃO DIVINA · ESCUDO 3s · −70% DE DANO');
    tone(720, .12, 'triangle', .045);
  }
  function playMahoragaAdaptationSound() {
    try {
      mahoragaAdaptationAudio.pause();
      mahoragaAdaptationAudio.currentTime = 0;
      const playback = mahoragaAdaptationAudio.play();
      if (playback?.catch) playback.catch(() => {});
    } catch { /* A reprodução pode estar bloqueada pelo navegador. */ }
  }
  function activateMahoragaWorldSlash() {
    if (state.mode !== 'playing' || (state.mahoragaSlashCooldown > 0 && !hasDeveloperPerks())) return;
    state.mahoragaSlashCooldown = hasDeveloperPerks() ? 0 : mahoragaSlashCooldownDuration();
    const angle = state.player.angle ?? -Math.PI / 2;
    const directionX = Math.cos(angle); const directionY = Math.sin(angle);
    const edgeDistances = [
      directionX > .0001 ? (state.width - state.player.x) / directionX : directionX < -.0001 ? state.player.x / -directionX : Infinity,
      directionY > .0001 ? (state.height - state.player.y) / directionY : directionY < -.0001 ? state.player.y / -directionY : Infinity
    ];
    const originOffset = state.player.radius * 1.05;
    const maxTravel = Math.max(mobileSize(70), Math.min(...edgeDistances) - originOffset + mobileSize(26));
    const waveWidth = mobileSize(40);
    state.effects.push({
      type:'mahoraga-world-wave', x:state.player.x, y:state.player.y, angle, originOffset, curveDepth:mobileSize(76),
      travel:0, maxTravel, elapsed:0, travelDuration:.54, waveWidth,
      halfSpan:Math.hypot(state.width, state.height) * 1.1,
      life:.88, total:.88, hitEnemies:new Set(), maxTargets:8, targetsHit:0, markedTargets:0, destroyedBullets:0, completed:false
    });
    burst(state.player.x + directionX * originOffset, state.player.y + directionY * originOffset, '#fff5d9', 14, 120);
    burst(state.player.x, state.player.y, '#f1d38a', 28, 210);
    toast('ESPADA DA EXTERMINAÇÃO · TALHO MUNDIAL A CAMINHO');
    tone(110, .48, 'sawtooth', .07);
    updateAbilityButton();
  }
  function mahoragaSlashCooldownDuration() {
    const prismBonus = state.selectedSkin === 'prisma' ? state.prismCooldownBonus : state.mahoragaSlashCooldownBonus;
    return Math.max(8, 12 - prismBonus);
  }
  function megumiTechniqueCooldownDuration(additionalCooldownUpgrades = 0) {
    const cooldownUpgrades = Math.min(5, upgradeLevel('cooldown') + additionalCooldownUpgrades);
    return Math.max(15, 20 - cooldownUpgrades);
  }
  function auroraLinkDuration() { return Math.min(9, 7 + state.auroraLinkDurationBonus); }
  function auroraLinkMaxTargets() { return Math.min(10, 8 + state.auroraLinkTargetBonus); }
  function auroraLinkPulseDamage() { return 1.8 + state.auroraLinkDamageBonus; }
  function auroraLinkCooldownDuration() { return Math.max(18, 24 - upgradeLevel('auroraLinkCooldown') * 2); }
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
    const hasEffectiveHit = chain.some((enemy) => enemy && !enemy.dead && enemy.hp > 0);
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
    if (hasEffectiveHit && state.auroraLink && !state.auroraLink.ultChargeAwarded) {
      state.auroraLink.ultChargeAwarded = true;
      gainAuroraUltCharge();
    }
    tone(740, .06, 'sine', .014);
  }
  function activateAuroraLink() {
    if (currentSkin().id !== 'aurora' || state.mode !== 'playing' || state.auroraLink?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.auroraLinkCooldown > 0) return;
    const duration = auroraLinkDuration();
    const targets = auroraLinkChain();
    state.auroraLink = { life: duration, total: duration, pulseTimer: .08, targets, ultChargeAwarded: false };
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
  function activateFerrumRam() {
    if (currentSkin().id !== 'training' || state.mode !== 'playing') return;
    if (state.ferrumRam || state.ferrumRamCharges > 0 || state.ferrumPressure < FERRUM_MAX_PRESSURE) return;
    state.ferrumPressure = 0;
    state.ferrumRamCharges = FERRUM_RAM_USES;
    state.ferrumRam = { phase:'transformed', blocks:0 };
    state.ferrumECharges = FERRUM_E_USES;
    state.ferrumCountershock = null;
    tone(735, .052, 'square', .023);
    tone(1120, .14, 'triangle', .035);
    state.effects.push({ type:'ferrum-transformation', x:state.player.x, y:state.player.y, life:1.15, total:1.15, followPlayer:true, rotation:0 });
    burst(state.player.x, state.player.y, '#d6e3ef', 22, 125);
    burst(state.player.x, state.player.y, '#ffffff', 12, 72);
    toast('FERRUM TRANSFORMADA · 5 Q · 3 E · SEM RECARGA');
    updateFerrumHud();
    updateAbilityButton();
  }
  function activateFerrumInvestida() {
    if (currentSkin().id !== 'training' || state.mode !== 'playing' || state.ferrumRam?.phase !== 'transformed' || state.ferrumRamCharges <= 0) return;
    state.ferrumRamCharges -= 1;
    state.ferrumRam = { phase:'dash', angle:state.player.angle, time:.62, hit:new Set(), blocks:0 };
    tone(105, .17, 'sawtooth', .035);
    updateFerrumHud();
    updateAbilityButton();
  }
  function finishFerrumDash() {
    state.ferrumRam = state.ferrumRamCharges > 0 ? { phase:'transformed', blocks:0 } : null;
    updateFerrumHud();
    updateAbilityButton();
  }

  function activateFerrumCountershock() {
    if (currentSkin().id !== 'training' || state.mode !== 'playing' || state.ferrumRam?.phase !== 'transformed' || state.ferrumRamCharges <= 0 || state.ferrumECharges <= 0 || state.ferrumCountershock) return;
    state.ferrumECharges -= 1;
    state.ferrumCountershock = { time:1.15, total:1.15, blocked:0 };
    updateFerrumHud();
    state.effects.push({ type:'ferrum-countershock-guard', life:1.15, total:1.15, followPlayer:true });
    burst(state.player.x, state.player.y, '#e5edf6', 12, 86);
    tone(410, .12, 'triangle', .035);
    toast('CONTRACHOQUE DE AÇO · ' + state.ferrumECharges + '/' + FERRUM_E_USES + ' USOS RESTANTES');
    updateAbilityButton();
  }

  function finishFerrumCountershock() {
    const player = state.player;
    const radius = mobileSize(205);
    state.ferrumCountershock = null;
    updateFerrumHud();
    state.effects.push({ type:'ferrum-countershock-wave', x:player.x, y:player.y, radius, life:.48, total:.48 });
    let pushed = 0;
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - player.x, dy = enemy.y - player.y;
      const gap = Math.hypot(dx, dy);
      if (gap > radius + enemy.r) continue;
      const angle = gap > .001 ? Math.atan2(dy, dx) : random(0, Math.PI * 2, 'ability');
      const distanceScale = clamp(1 - gap / (radius + enemy.r), .35, 1);
      const massScale = enemy.kind === 'boss' ? .24 : enemy.isMiniBoss ? .48 : 1;
      const shove = mobileSize(118) * distanceScale * massScale;
      enemy.x = clamp(enemy.x + Math.cos(angle) * shove, enemy.r, state.width - enemy.r);
      enemy.y = clamp(enemy.y + Math.sin(angle) * shove, enemy.r, state.height - enemy.r);
      enemy.ramCooldown = Math.max(enemy.ramCooldown || 0, .65);
      burst(enemy.x, enemy.y, '#dce8f5', enemy.kind === 'boss' ? 5 : 3, 48);
      pushed++;
    }
    let deflected = 0;
    for (const bullet of state.enemyBullets) {
      if (bullet.dead || bullet.reflected || bullet.explosive || bullet.fuse != null || bullet.bounces > 0 || bullet.turnRate || bullet.homingTime > 0) continue;
      if (distance(bullet, player) > radius + bullet.r) continue;
      const target = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(bullet, a) - distance(bullet, b))[0];
      const radial = Math.atan2(bullet.y - player.y, bullet.x - player.x);
      const aimed = target ? Math.atan2(target.y - bullet.y, target.x - bullet.x) : radial;
      const angle = aimed + (randomUnit('ability') - .5) * .72;
      const speed = clamp(Math.hypot(bullet.vx, bullet.vy) || 300, 260, 440);
      bullet.vx = Math.cos(angle) * speed;
      bullet.vy = Math.sin(angle) * speed;
      bullet.damage = Math.min(3, Math.max(1, bullet.damage || 1));
      bullet.color = '#e1ebf5';
      bullet.reflected = true;
      bullet.reflectLife = 1.8;
      bullet.explosive = false;
      bullet.fuse = null;
      bullet.blastRadius = 0;
      bullet.bounces = 0;
      bullet.tempestTideSweep = null;
      bullet.tempestTideTargeted = false;
      deflected++;
    }
    tone(185, .22, 'sawtooth', .045);
    toast('CONTRACHOQUE · ' + pushed + ' INIMIGOS AFASTADOS · ' + deflected + ' TIROS DESVIADOS');
    updateAbilityButton();
  }

  function advanceFerrumCountershock(dt) {
    const shield = state.ferrumCountershock;
    if (!shield) return;
    const secondsShown = Math.ceil(shield.time);
    shield.time = Math.max(0, shield.time - dt);
    if (shield.time <= 0) finishFerrumCountershock();
    else if (Math.ceil(shield.time) !== secondsShown) updateAbilityButton();
  }

  // First contact along a swept path, in units of distance from its start.
  function ferrumContactDistance(x, y, dirX, dirY, travel, target, radius) {
    const dx = target.x - x, dy = target.y - y;
    const forward = dx * dirX + dy * dirY;
    const side = dx * dirY - dy * dirX;
    if (Math.abs(side) > radius) return Infinity;
    const halfChord = Math.sqrt(Math.max(0, radius * radius - side * side));
    if (forward + halfChord < 0 || forward - halfChord > travel) return Infinity;
    return Math.max(0, forward - halfChord);
  }

  function blockFerrumCountershockShot(bullet, travelTime) {
    const shield = state.ferrumCountershock;
    if (!shield || shield.blocked >= 3 || bullet.explosive || bullet.fuse != null || bullet.bounces > 0 || bullet.turnRate || bullet.homingTime > 0 || bullet.reflected) return false;
    const speed = Math.hypot(bullet.vx, bullet.vy);
    if (!speed) return false;
    const player = state.player;
    const dirX = bullet.vx / speed, dirY = bullet.vy / speed;
    const hit = ferrumContactDistance(bullet.x, bullet.y, dirX, dirY, speed * travelTime, player, player.radius * 1.85 + bullet.r);
    if (!Number.isFinite(hit)) return false;
    const x = bullet.x + dirX * hit, y = bullet.y + dirY * hit;
    const rx = x - player.x, ry = y - player.y;
    const facing = rx * Math.cos(player.angle) + ry * Math.sin(player.angle);
    if (facing < Math.hypot(rx, ry) * .55 || rx * dirX + ry * dirY >= 0) return false;
    bullet.dead = true;
    shield.blocked++;
    burst(x, y, '#edf5ff', 7, 82);
    tone(530 + shield.blocked * 95, .055, 'triangle', .026);
    updateAbilityButton();
    return true;
  }

  function advanceFerrumDash(dt) {
    const ram = state.ferrumRam;
    const player = state.player;
    const dirX = Math.cos(ram.angle), dirY = Math.sin(ram.angle);
    const startX = player.x, startY = player.y;
    const travel = mobileSize(1120 + Math.min(3, upgradeLevel('ferrumDashRange')) * 161.3) * Math.min(ram.time, dt);
    const wallX = dirX > 0 ? state.width - 17 : 17;
    const wallY = dirY > 0 ? state.height - 17 : 17;
    const step = Math.max(0, Math.min(travel, dirX ? (wallX - startX) / dirX : Infinity, dirY ? (wallY - startY) / dirY : Infinity));
    const contacts = [];
    for (const enemy of state.enemies) {
      if (enemy.dead || ram.hit.has(enemy)) continue;
      const entry = ferrumContactDistance(startX, startY, dirX, dirY, step, enemy, enemy.r + player.radius);
      if (Number.isFinite(entry)) contacts.push({ enemy, entry });
    }
    player.angle = player.moveAngle = ram.angle;
    for (const { enemy, entry } of contacts.sort((a, b) => a.entry - b.entry)) {
      ram.hit.add(enemy);
      const boss = enemy.kind === 'boss';
      const damage = 10 + 4 * ram.blocks;
      const impactX = startX + dirX * (entry + player.radius);
      const impactY = startY + dirY * (entry + player.radius);
      state.effects.push({ type:'ferrum-impact', x:impactX, y:impactY, angle:ram.angle, life:.28, total:.28 });
      burst(impactX, impactY, '#f3f8ff', boss ? 18 : 8, 110);
      damageEnemy(enemy, boss ? Math.min(damage, enemy.maxHp * .08 / (1 + state.bossDamageBonus)) : damage, true, 'ram');
      if (boss) {
        enemy.ramCooldown = Math.max(enemy.ramCooldown || 0, .9);
        continue;
      }
      if (!enemy.dead) {
        const side = (enemy.y - startY) * dirX - (enemy.x - startX) * dirY >= 0 ? 1 : -1;
        const shove = enemy.r + player.radius + mobileSize(18);
        enemy.x = clamp(enemy.x - side * dirY * shove, enemy.r, state.width - enemy.r);
        enemy.y = clamp(enemy.y + side * dirX * shove, enemy.r, state.height - enemy.r);
        enemy.ramCooldown = Math.max(enemy.ramCooldown || 0, .45);
      }
    }
    player.x = startX + dirX * step;
    player.y = startY + dirY * step;
    ram.time -= dt;
    if (ram.time <= 0 || step < travel) {
      finishFerrumDash();
    }
  }
  function gainAuroraUltCharge(amount = 1) {
    if (currentSkin().id !== 'aurora' || state.mode !== 'playing' || state.auroraUlt || state.auroraUltCharge >= 6 || !(amount > 0)) return;
    const previousCharge = state.auroraUltCharge;
    state.auroraUltCharge = Math.min(6, previousCharge + amount);
    updateAuroraUltHud();
    if (previousCharge < 6 && state.auroraUltCharge >= 6) toast('COROA DA HIPERNOVA · G DISPONÍVEL');
  }
  function activateAuroraUltimate() {
    if (currentSkin().id !== 'aurora' || state.mode !== 'playing' || state.auroraUlt || state.auroraUltCharge < 6) return;
    state.auroraUltCharge = 0;
    state.auroraEFirstTapAt = 0;
    state.auroraEFirstTapCharge = 0;
    const constellationTargets = state.enemies.filter((enemy) => !enemy.dead && enemy.hp > 0);
    constellationTargets.forEach((enemy, index) => { enemy.auroraUltAnchor = index % 6; });
    state.auroraUlt = {
      life: 8, total: 8, pulseTimer: .3, hudRefresh: 0, orbitAngle: -Math.PI / 2,
      stars: Array.from({ length: 6 }, (_, index) => ({ index, fired: false })),
      hitCounts: [], markedTargets: [], constellationTargets,
      convergenceArea: null, converging: false, convergenceStarCount: 0
    };
    state.effects.push({ type:'aurora-crown-start', x:state.player.x, y:state.player.y, life:1.1, total:1.1, phase:0 });
    burst(state.player.x, state.player.y, '#7df7e8', 30, 158);
    burst(state.player.x, state.player.y, '#c2a6ff', 22, 128);
    recordAchievementEvent('ship-ability', 'aurora');
    toast('COROA DA HIPERNOVA · SEIS ESTRELAS ATIVAS');
    tone(880, .2, 'sine', .04);
    updateAuroraUltHud();
  }
  function auroraUltimateStarPosition(ultimate, index) {
    const angle = ultimate.orbitAngle + index * Math.PI / 3 + Math.sin(state.elapsed * .58 + index * 1.9) * .16;
    const radiusX = Math.max(mobileSize(76), Math.min(state.width * .38, mobileSize(360)));
    const radiusY = Math.max(mobileSize(62), Math.min(state.height * .36, mobileSize(250)));
    const drift = .88 + Math.sin(state.elapsed * .9 + index * 1.7) * .12;
    const margin = mobileSize(18);
    return {
      x: clamp(state.player.x + Math.cos(angle) * radiusX * drift, margin, state.width - margin),
      y: clamp(state.player.y + Math.sin(angle) * radiusY * drift, margin, state.height - margin)
    };
  }
  function auroraUltimateHitCount(ultimate, enemy) {
    return ultimate.hitCounts.find((entry) => entry.enemy === enemy)?.count || 0;
  }
  function dealAuroraUltimateDamage(ultimate, enemy, requestedDamage) {
    if (!enemy || enemy.dead || enemy.hp <= 0 || requestedDamage <= 0) return 0;
    const record = ultimate.hitCounts.find((entry) => entry.enemy === enemy);
    let damage = requestedDamage;
    if (enemy.kind === 'boss') {
      const damageSoFar = record?.damage || 0;
      const bossBudget = Math.max(1, (enemy.maxHp || enemy.hp) * .16);
      const remaining = Math.max(0, bossBudget - damageSoFar);
      damage = Math.min(damage, remaining / Math.max(.01, 1 + state.bossDamageBonus));
    }
    if (damage <= 0) return 0;
    const before = enemy.hp;
    damageEnemy(enemy, damage, true);
    const dealt = Math.max(0, before - Math.max(0, enemy.hp));
    if (dealt <= 0) return 0;
    if (record) { record.count++; record.damage = (record.damage || 0) + dealt; }
    else ultimate.hitCounts.push({ enemy, count: 1, damage: dealt });
    const mark = ultimate.markedTargets.find((entry) => entry.enemy === enemy);
    if (mark) mark.expiresAt = state.elapsed + 3.6;
    else ultimate.markedTargets.push({ enemy, expiresAt: state.elapsed + 3.6 });
    enemy.auroraUltSlowTime = Math.max(enemy.auroraUltSlowTime || 0, .8);
    return dealt;
  }
  function auroraUltimateCandidates(ultimate) {
    const linked = state.auroraLink?.life > 0 ? (state.auroraLink.targets || []).filter((enemy) => enemy && !enemy.dead) : [];
    return state.enemies.filter((enemy) => {
      if (enemy.dead || enemy.hp <= 0) return false;
      if (ultimate.convergenceArea && distance(enemy, ultimate.convergenceArea) > ultimate.convergenceArea.radius + enemy.r) return false;
      const hits = auroraUltimateHitCount(ultimate, enemy);
      if (enemy.kind === 'boss') {
        const damageSoFar = ultimate.hitCounts.find((entry) => entry.enemy === enemy)?.damage || 0;
        return damageSoFar < (enemy.maxHp || enemy.hp) * .16;
      }
      return hits < (ultimate.converging ? 2 : 1);
    }).sort((a, b) => {
      const aLinked = linked.includes(a), bLinked = linked.includes(b);
      if (aLinked !== bLinked) return aLinked ? -1 : 1;
      const hitGap = auroraUltimateHitCount(ultimate, a) - auroraUltimateHitCount(ultimate, b);
      return hitGap || distance(state.player, a) - distance(state.player, b);
    });
  }
  function fireAuroraUltimateStar(ultimate) {
    const star = ultimate.stars.find((entry) => !entry.fired);
    const candidates = auroraUltimateCandidates(ultimate);
    const enemy = candidates[0];
    if (!star || !enemy) return false;
    const origin = auroraUltimateStarPosition(ultimate, star.index);
    const qLinks = state.auroraLink?.life > 0 ? (state.auroraLink.targets || []).filter((target) => target && !target.dead) : [];
    const candidateSet = new Set(candidates);
    const path = [enemy];
    const firstLinkIndex = qLinks.indexOf(enemy);
    if (firstLinkIndex >= 0) {
      for (let offset = 1; offset < qLinks.length && path.length < 3; offset++) {
        const next = qLinks[(firstLinkIndex + offset) % qLinks.length];
        if (candidateSet.has(next) && !path.includes(next)) path.push(next);
      }
    }
    let from = origin;
    path.forEach((target, hop) => {
      const beamDamage = (target.kind === 'boss' ? 11 : 14) * state.abilityPower * Math.pow(.58, hop);
      dealAuroraUltimateDamage(ultimate, target, beamDamage);
      state.effects.push({ type:'aurora-ult-beam', x1:from.x, y1:from.y, x2:target.x, y2:target.y, life:.42, total:.42, phase:star.index * 3 + hop });
      state.effects.push({ type:'aurora-link-node', x:target.x, y:target.y, life:.34, total:.34, phase:star.index + hop });
      burst(target.x, target.y, hop % 2 ? '#c2a6ff' : '#bffff5', target.kind === 'boss' ? 7 : 5, 68);
      from = target;
    });
    star.fired = true;
    burst(origin.x, origin.y, '#c2a6ff', 4, 42);
    return true;
  }
  function convergeAuroraUltimate(radius, hitCount) {
    const ultimate = state.auroraUlt;
    if (!ultimate || hitCount <= 0) return;
    ultimate.converging = true;
    ultimate.convergenceArea = { x:state.player.x, y:state.player.y, radius };
    ultimate.convergenceStarCount = ultimate.stars.filter((star) => !star.fired).length;
    ultimate.pulseTimer = Math.min(ultimate.pulseTimer, .03);
    ultimate.life = Math.min(ultimate.life, .95);
    state.effects.push({ type:'aurora-crown-start', x:state.player.x, y:state.player.y, life:.5, total:.5, phase:1 });
    toast('EXPLOSÃO NOVA · COROA CONVERGINDO');
  }
  function finishAuroraUltimate() {
    const ultimate = state.auroraUlt;
    if (!ultimate) return;
    const activeMarks = ultimate.markedTargets.filter((entry) => entry.enemy && !entry.enemy.dead && entry.expiresAt > state.elapsed);
    const area = ultimate.convergenceArea;
    const markedInFinish = activeMarks.filter((entry) => !area || distance(entry.enemy, area) <= area.radius + entry.enemy.r).length;
    const markedScale = Math.min(10, markedInFinish);
    const starBonus = area ? ultimate.convergenceStarCount : 0;
    const finalDamage = (58 + markedScale * 2.8 + starBonus * 2.4) * state.abilityPower;
    const center = area || state.player;
    const finalRadius = Math.min(Math.hypot(state.width, state.height) * .9, mobileSize(470 + markedScale * 22 + starBonus * 34));
    const targets = area
      ? state.enemies.filter((enemy) => !enemy.dead && enemy.hp > 0 && distance(enemy, area) <= Math.max(area.radius, finalRadius) + enemy.r)
      : ultimate.constellationTargets.filter((enemy) => enemy && !enemy.dead && enemy.hp > 0);
    state.effects.push({ type:'nova', x:center.x, y:center.y, radius:0, maxRadius:finalRadius, color:'#8cf1ff', life:1.06, total:1.06 });
    state.effects.push({ type:'aurora-crown-burst', x:center.x, y:center.y, radius:finalRadius, life:1.12, total:1.12, phase:area ? 1 : 0 });
    state.effects.push({ type:'aurora-link-wave', x:center.x, y:center.y, radius:finalRadius, life:.76, total:.76, phase:0 });
    for (let index = 0; index < targets.length; index++) {
      const enemy = targets[index];
      dealAuroraUltimateDamage(ultimate, enemy, finalDamage);
      state.effects.push({ type:'aurora-link-node', x:enemy.x, y:enemy.y, life:.55, total:.55, phase:index });
      burst(enemy.x, enemy.y, index % 2 ? '#c2a6ff' : '#bffff5', enemy.kind === 'boss' ? 10 : 7, 124);
    }
    burst(center.x, center.y, '#7df7e8', 32, 188);
    burst(center.x, center.y, '#f5f7ff', 18, 136);
    state.auroraUlt = null;
    toast(area ? 'HIPERNOVA · EXPLOSÃO CONVERGIDA' : 'HIPERNOVA · CONSTELAÇÃO CONVERGIDA');
    tone(520, .42, 'sine', .05);
    updateAuroraUltHud();
  }
  function advanceAuroraUltimate(dt) {
    const ultimate = state.auroraUlt;
    if (!ultimate) return;
    ultimate.constellationTargets = state.enemies.filter((enemy) => !enemy.dead && enemy.hp > 0);
    ultimate.constellationTargets.forEach((enemy, index) => {
      if (!Number.isInteger(enemy.auroraUltAnchor)) enemy.auroraUltAnchor = index % 6;
    });
    // The stars travel around a broad path for the full ult, then rush inward
    // when E converges the constellation.
    ultimate.orbitAngle += dt * (ultimate.converging ? 5.2 : .92);
    ultimate.life = Math.max(0, ultimate.life - dt);
    ultimate.hudRefresh -= dt;
    if (ultimate.hudRefresh <= 0) { updateAuroraUltHud(); ultimate.hudRefresh += .25; }
    ultimate.pulseTimer -= dt;
    while (ultimate.life > 0 && ultimate.pulseTimer <= 0) {
      const fired = fireAuroraUltimateStar(ultimate);
      ultimate.pulseTimer += ultimate.converging ? .14 : .88;
      if (!fired) break;
      if (ultimate.converging && ultimate.stars.every((star) => star.fired)) ultimate.life = Math.min(ultimate.life, .42);
    }
    if (ultimate.life <= 0) finishAuroraUltimate();
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
    return ({ aurora:'✴', aegis:'⬡', eclipse:'◉', chronos:'◷', tempest:'↗', flashblade:'✧', redshift:'△', saurion:'✦', flamestorm:'🌀', vulture:'✧' })[skin.id] || '✦';
  }
  function shipQRechargeState(skin = currentSkin()) {
    if (skin.id === 'aurora') return { cooldown: state.auroraLinkCooldown, charges: null };
    if (skin.id === 'aegis') return { cooldown: state.aegisOrbitCooldown, charges: null };
    if (skin.id === 'eclipse') return { cooldown: state.eclipseParadoxCooldown, charges: null };
    if (skin.id === 'chronos') return { cooldown: state.chronosEchoCooldown, charges: null };
    if (skin.id === 'tempest') return { cooldown: state.tempestTideCooldown, charges: state.tempestTideCharges };
    if (skin.id === 'flashblade') return { cooldown: state.flashTrailCooldown, charges: null };
    if (skin.id === 'redshift') return { cooldown: state.redshiftPerimeterCooldown, charges: null };
    if (skin.id === 'saurion') return { cooldown: state.dinoStampedeRecharge, charges: state.dinoStampedeCharges };
    if (skin.id === 'flamestorm') return { cooldown: state.flameStormQCooldown, charges: null };
    if (skin.id === 'vulture') return { cooldown: state.vultureQCooldown, charges: null };
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
    const eCooling = skin.id === 'saurion' ? state.dinoRoarCharges <= 0 : state.abilityCooldown > 0;
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
  function aegisOrbitDuration() { return Math.min(6, 5 + state.aegisOrbitDurationBonus); }
  function aegisOrbitMaxCount() { return Math.min(4, 3 + state.aegisOrbitCountBonus); }
  function aegisOrbitCooldownDuration() { return Math.max(33, 36 - upgradeLevel('aegisOrbitCooldown')); }
  function advanceAegisBarrier(dt) {
    if (state.aegisBarrierCharges <= 0) return;
    state.aegisBarrierTime = Math.max(0, state.aegisBarrierTime - dt);
    if (state.aegisBarrierTime > 0) return;
    state.tempShields = Math.max(0, state.tempShields - state.aegisBarrierCharges);
    state.aegisBarrierCharges = 0;
    toast('BARREIRA AEGIS EXPIRADA');
    updateHud();
  }
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
  function chronosEchoDuration() { return Math.min(8, 6 + state.chronosEchoDurationBonus); }
  function chronosEchoCooldownDuration() { return Math.max(18, 24 - upgradeLevel('chronosEchoCooldown') * 2); }
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
    return Math.max(18, 24 - upgradeLevel('tempestTideCooldown') * 2);
  }
  function tempestTideMaxCharges() { return 4 + state.tempestTideChargeBonus; }
  function advanceTempestTideRecharge(dt) {
    const maxCharges = tempestTideMaxCharges();
    if (hasDeveloperPerks()) { state.tempestTideCharges = maxCharges; state.tempestTideCooldown = 0; return; }
    state.tempestTideCharges = clamp(state.tempestTideCharges, 0, maxCharges);
    if (state.tempestTideCharges > 0) { state.tempestTideCooldown = 0; return; }
    state.tempestTideCooldown = Math.max(0, state.tempestTideCooldown - dt);
    if (state.tempestTideCooldown <= 0) {
      state.tempestTideCharges = maxCharges;
      state.tempestTideCooldown = 0;
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
    if (targets.length && randomUnit('ability') < .4) {
      bullet.reflected = true;
      bullet.reflectLife = 1.8 + state.tempestTideSweepBonus;
      bullet.tempestTideTargeted = true;
      bullet.tempestTideTarget = targets[0];
      bullet.damage = clamp(Math.max(1.8, (bullet.damage || 1) * .75 + state.tempestTideDamageBonus * .3), 1.8, 4.5);
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
    const radius = mobileSize(280 + state.tempestTideRadiusBonus);
    const center = { x: state.player.x, y: state.player.y };
    if (developerProfile) { state.tempestTideCharges = maxCharges; state.tempestTideCooldown = 0; }
    else {
      state.tempestTideCharges = Math.max(0, state.tempestTideCharges - 1);
      if (state.tempestTideCharges === 0) state.tempestTideCooldown = tempestTideCooldownDuration();
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
      damageEnemy(enemy, (3.2 + state.tempestTideDamageBonus) * damageScale * state.abilityPower, true);
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
  function flashTrailDuration() { return Math.min(9, 6 + state.flashTrailDurationBonus); }
  function flashTrailCooldownDuration() {
    return Math.max(18, 24 - upgradeLevel('flashTrailCooldown') * 2);
  }
  function activateFlashTrail() {
    if (currentSkin().id !== 'flashblade' || state.mode !== 'playing' || state.flashTrail?.life > 0) return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.flashTrailCooldown > 0) return;
    const duration = flashTrailDuration();
    state.flashTrail = { life: duration, total: duration, lastX: state.player.x, lastY: state.player.y, recordTimer: 0 };
    state.flashTrailCooldown = developerProfile ? 0 : flashTrailCooldownDuration();
    state.flashTrailContacts = new Set();
    recordAchievementEvent('ship-ability', 'flashblade');
    burst(state.player.x, state.player.y, '#ffc86e', 18, 115);
    burst(state.player.x, state.player.y, '#fff0b4', 8, 74);
    toast('RASTRO DE RUPTURA · IMPULSO 2,6× · ' + duration + 's');
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
          width: mobileSize(3.8 + density * .75), damage: (3 + state.flashTrailDamageBonus) * state.abilityPower,
          life: 9, total: 9, phase: random(0, Math.PI * 2, 'ability')
        });
      }
      field.lastX = state.player.x; field.lastY = state.player.y;
      field.recordTimer = Math.max(.1, .22 - density * .03);
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
      damageEnemy(enemy, (4 + state.redshiftPerimeterDamageBonus) * state.abilityPower * (enemy.kind === 'boss' ? .75 : 1), true);
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
      if (gap < radius + enemy.r) hits.push({ enemy, damage: (45 + Math.max(0, radius - gap) * .13) * state.abilityPower });
    }
    const ability = state.auroraLink;
    const linked = ability?.life > 0 ? (ability.targets || []).filter((enemy) => enemy && !enemy.dead) : [];
    const linkedSet = new Set(linked);
    const hitSet = new Set(hits.map((hit) => hit.enemy));
    const source = hits.filter((hit) => linkedSet.has(hit.enemy)).sort((a, b) => b.damage - a.damage)[0] || null;
    const sharedDamage = source?.damage || 0;
    for (const hit of hits) {
      const damage = linkedSet.has(hit.enemy) ? Math.max(hit.damage, sharedDamage) : hit.damage;
      damageEnemy(hit.enemy, damage * (hit.enemy.kind === 'boss' ? .72 : 1), true);
    }
    if (source && sharedDamage > 0) {
      for (let index = 0; index < linked.length; index++) {
        const target = linked[index];
        if (target === source.enemy || target.dead) continue;
        if (!hitSet.has(target)) damageEnemy(target, sharedDamage * (target.kind === 'boss' ? .72 : 1), true);
        const dx = target.x - source.enemy.x; const dy = target.y - source.enemy.y;
        const length = Math.hypot(dx, dy) || 1;
        const bend = (index % 2 ? 1 : -1) * Math.min(20, length * .08);
        state.effects.push({ type: 'aurora-link', x1: source.enemy.x, y1: source.enemy.y, x2: target.x, y2: target.y, cx: (source.enemy.x + target.x) / 2 - dy / length * bend, cy: (source.enemy.y + target.y) / 2 + dx / length * bend, life: .48, total: .48, phase: index });
        state.effects.push({ type: 'aurora-link-node', x: target.x, y: target.y, life: .36, total: .36, phase: index });
      }
    }
    return hits.map((hit) => hit.enemy);
  }
  function dinoRoarCooldownDuration() {
    if (currentSkin().id === 'saurion') return Math.max(12, 16 - Math.min(4, upgradeLevel('cooldown')));
    return Math.max(12, Math.round((state.abilityBaseCooldown || currentSkin().cooldown || 28) * .58));
  }
  function advanceDinoRoarRecharge(dt) {
    const maxCharges = 2;
    if (hasDeveloperPerks()) { state.dinoRoarCharges = maxCharges; state.dinoRoarRecharge = 0; return; }
    state.dinoRoarCharges = clamp(state.dinoRoarCharges, 0, maxCharges);
    if (state.dinoRoarCharges >= maxCharges) { state.dinoRoarRecharge = 0; return; }
    state.dinoRoarRecharge = Math.max(0, state.dinoRoarRecharge - dt);
    if (state.dinoRoarRecharge <= 0) {
      state.dinoRoarCharges = Math.min(maxCharges, state.dinoRoarCharges + 1);
      state.dinoRoarRecharge = state.dinoRoarCharges < maxCharges ? dinoRoarCooldownDuration() : 0;
    }
  }
  function activateSaurionRoar() {
    if (currentSkin().id !== 'saurion' || state.mode !== 'playing') return;
    const developerProfile = hasDeveloperPerks();
    if (!developerProfile && state.dinoRoarCharges <= 0) return;
    if (developerProfile) { state.dinoRoarCharges = 2; state.dinoRoarRecharge = 0; }
    else {
      if (state.dinoRoarCharges >= 2) state.dinoRoarRecharge = dinoRoarCooldownDuration();
      state.dinoRoarCharges = Math.max(0, state.dinoRoarCharges - 1);
    }
    const radius = mobileSize(560 + state.dinoRoarRangeBonus);
    state.effects.push({ type: 'dino-roar', x: state.player.x, y: state.player.y, radius, life: .92, total: .92 });
    let clearedBullets = 0;
    for (const bullet of state.enemyBullets) {
      if (bullet.dead || bullet.reflected) continue;
      if (distance(state.player, bullet) <= radius) {
        bullet.dead = true; clearedBullets++;
        burst(bullet.x, bullet.y, '#ff9b32', 5, 70);
      }
    }
    let markedTargets = 0;
    for (const enemy of state.enemies) {
      if (enemy.dead || distance(state.player, enemy) > radius + enemy.r) continue;
      const boss = enemy.kind === 'boss';
      enemy.dinoStun = Math.max(enemy.dinoStun || 0, boss ? .7 : 2);
      enemy.dinoCutMark = 15;
      enemy.dinoClawBursts = 7;
      enemy.dinoClawTimer = .1;
      markedTargets++;
      burst(enemy.x, enemy.y, '#f28a28', boss ? 6 : 4, boss ? 92 : 72);
    }
    burst(state.player.x, state.player.y, '#f28a28', 34, 260);
    burst(state.player.x, state.player.y, '#ffe3a0', 12, 150);
    const roarSummary = ['RUGIDO DE GARRAS', state.dinoRoarCharges + '/2 CARGAS'];
    if (markedTargets) roarSummary.push(markedTargets + ' ALVOS MARCADOS');
    if (clearedBullets) roarSummary.push(clearedBullets + ' PROJÉTEIS DESFEITOS');
    recordAchievementEvent('ship-ability', 'saurion');
    toast(roarSummary.join(' · '));
    tone(92, .38, 'sawtooth', .04);
    updateAbilityButton();
  }
  function openSaurionSummonPicker(key) {
    const slot = key === 'q' ? 'q' : 'e';
    const sameSlotSummon = saurionSummonForSlot(slot);
    const devReplace = isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun;
    if (currentSkin().id !== 'saurion-primal' || state.mode !== 'playing' || (sameSlotSummon && !devReplace)) return;
    const cooldownKey = key === 'q' ? 'saurionSummonCooldownQ' : 'saurionSummonCooldownE';
    if (state[cooldownKey] > 0 && !(devReplace && sameSlotSummon)) return;
    pendingSaurionSummonKey = key;
    const otherSummon = saurionSummonForSlot(slot === 'q' ? 'e' : 'q');
    if (ui.saurionSummonPickerSkill) ui.saurionSummonPickerSkill.textContent = devReplace
      ? 'Invocação pela habilidade ' + key.toUpperCase() + (sameSlotSummon ? ' · modo dev: a nova criatura substituirá ' + sameSlotSummon.name : '') + (otherSummon ? ' · a outra habilidade mantém ' + otherSummon.name : '')
      : 'Invocação pela habilidade ' + key.toUpperCase() + ' · recarga própria de 40 segundos' + (otherSummon ? ' · ' + otherSummon.name + ' já está em campo e não pode ser repetido' : ' · Q e E podem manter criaturas diferentes em campo');
    document.querySelectorAll('[data-saurion-summon-choice]').forEach((button) => {
      const alreadySummoned = !devReplace && otherSummon?.id === button.dataset.saurionSummonChoice;
      button.disabled = Boolean(alreadySummoned);
      button.title = alreadySummoned ? otherSummon.name + ' já está invocado pela habilidade ' + otherSummon.slot.toUpperCase() : '';
    });
    if (ui.saurionSummonPicker) {
      ui.saurionSummonPicker.hidden = false;
      ui.saurionSummonPicker.querySelector('[data-saurion-summon-choice]:not(:disabled)')?.focus();
    }
  }
  function saurionSummons() { return Array.isArray(state.saurionSummons) ? state.saurionSummons : []; }
  function saurionSummonForSlot(slot) { return saurionSummons().find((summon) => summon.slot === slot) || null; }
  function closeSaurionSummonPicker() {
    pendingSaurionSummonKey = '';
    if (ui.saurionSummonPicker) ui.saurionSummonPicker.hidden = true;
  }
  function summonSaurionCreature(key, creatureId) {
    if (currentSkin().id !== 'saurion-primal' || state.mode !== 'playing') return;
    const slot = key === 'q' ? 'q' : 'e';
    const devReplace = isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun;
    const sameSlotSummon = saurionSummonForSlot(slot);
    if (sameSlotSummon && !devReplace) { toast('A HABILIDADE ' + slot.toUpperCase() + ' JÁ TEM UMA CRIATURA EM CAMPO'); return; }
    const otherSummon = saurionSummonForSlot(slot === 'q' ? 'e' : 'q');
    if (otherSummon?.id === creatureId && !devReplace) { toast(otherSummon.name.toUpperCase() + ' JÁ ESTÁ EM CAMPO PELA HABILIDADE ' + otherSummon.slot.toUpperCase()); return; }
    const cooldownKey = key === 'q' ? 'saurionSummonCooldownQ' : 'saurionSummonCooldownE';
    if (state[cooldownKey] > 0 && !(devReplace && sameSlotSummon)) return;
    const availableCreatures = devReplace ? saurionCreatures : saurionCreatures.filter((item) => item.id !== otherSummon?.id);
    const creature = availableCreatures.find((item) => item.id === creatureId) || availableCreatures[Math.floor(randomUnit('ability') * availableCreatures.length)];
    const summon = {
      ...creature, slot,
      x:sameSlotSummon?.x ?? (creature.kind === 'ankyl' ? state.player.x - Math.cos(state.player.moveAngle ?? state.player.angle) * mobileSize(30) : state.player.x + (slot === 'q' ? -1 : 1) * mobileSize(66)),
      y:sameSlotSummon?.y ?? (creature.kind === 'ankyl' ? state.player.y - Math.sin(state.player.moveAngle ?? state.player.angle) * mobileSize(30) : state.player.y - mobileSize(62)),
      angle:creature.kind === 'ankyl' ? (state.player.moveAngle ?? state.player.angle) : -Math.PI / 2,
      life:creature.duration, total:creature.duration, hp:creature.kind === 'titan' ? 56 : creature.kind === 'trike' ? 44 : creature.kind === 'rex' ? 38 : creature.kind === 'ankyl' ? 40 : 30,
      attackCooldown:.65, stompCooldown:6, tailCooldown:creature.kind === 'spino' ? 2.5 : creature.kind === 'titan' ? 1.1 : creature.kind === 'ankyl' ? 2.2 : 10, rushCooldown:creature.kind === 'trike' ? .15 : 1.8,
      provokeTime:0, fearTime:0, dashTime:0, dashDirection:1, dashHit:new Set(), trampleCooldowns:new Map(), tailPose:0, commandCooldown:0, rageUsed:false
    };
    summon.maxHp = summon.hp;
    if (sameSlotSummon) {
      burst(sameSlotSummon.x, sameSlotSummon.y, '#b9ff80', 16, 145);
      state.saurionSummons = saurionSummons().filter((active) => active !== sameSlotSummon);
    }
    state.saurionSummons.push(summon);
    state[cooldownKey] = 40;
    if (summon.kind === 'ankyl' && restoreOneShield()) {
      state.effects.push({ type:'saurion-ankyl-shield', x:state.player.x, y:state.player.y, radius:0, maxRadius:mobileSize(72), followPlayer:true, life:.72, total:.72 });
      updateHud();
      toast('ANQUILOSSAURO · ESCUDO +1');
    }
    burst(summon.x, summon.y, '#7dff3f', 34, 210);
    burst(summon.x, summon.y, '#d4ff8a', 14, 130);
    for (const enemy of state.enemies) {
      if (enemy.dead || distance(summon, enemy) > mobileSize(410) + enemy.r) continue;
      enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .35 : .62);
      const angle = Math.atan2(enemy.y - summon.y, enemy.x - summon.x);
      enemy.tempestRepulse = { time:.48, total:.48, vx:Math.cos(angle) * 145, vy:Math.sin(angle) * 145, spin:(enemy.x < summon.x ? -1 : 1) * 1.3 };
      if (summon.kind === 'spino') enemy.saurionFearTime = Math.max(enemy.saurionFearTime || 0, 2.2);
      if (summon.kind === 'trike') { enemy.saurionTauntTime = Math.max(enemy.saurionTauntTime || 0, 25); summon.provokeTime = 25; }
      if (summon.kind === 'rex') {
        enemy.saurionFearTime = Math.max(enemy.saurionFearTime || 0, 25);
        enemy.saurionAttackSlowTime = Math.max(enemy.saurionAttackSlowTime || 0, 25);
        enemy.saurionAttackSlowFactor = .85;
      }
      if (summon.kind === 'carno') {
        enemy.saurionFearTime = Math.max(enemy.saurionFearTime || 0, 4);
        enemy.saurionSlowTime = Math.max(enemy.saurionSlowTime || 0, 25);
      }
      if (summon.kind === 'titan') applySaurionDamage(enemy, .10, .025);
    }
    if (summon.kind === 'rex' || summon.kind === 'carno') {
      state.saurionPlayerBuffTime = Math.max(state.saurionPlayerBuffTime, 15);
      state.saurionPlayerDamageBuff = summon.kind === 'rex' ? .12 : 0;
      state.saurionPlayerFireRateBuff = summon.kind === 'rex' ? .18 : .14;
    }
    recordAchievementEvent('ship-ability', 'saurion-primal');
    toast(devReplace
      ? 'DEV · ' + (sameSlotSummon ? sameSlotSummon.name.toUpperCase() + ' SUBSTITUÍDO POR ' : '') + creature.name.toUpperCase() + ' · TOQUE ' + key.toUpperCase() + ' PARA TROCAR ENQUANTO ESTIVER EM CAMPO'
      : creature.name.toUpperCase() + ' · ' + creature.role.toUpperCase() + ' · ' + key.toUpperCase() + ' RECARREGA EM 40s');
    tone(126, .42, 'sawtooth', .045);
    updateAbilityButton();
  }
  function applySaurionDamage(enemy, fraction, bossCap = .028) {
    if (!enemy || enemy.dead) return;
    const maxHp = Math.max(1, enemy.maxHp || enemy.hp || 1);
    const damage = enemy.kind === 'boss' ? Math.min(maxHp * fraction, maxHp * bossCap) : Math.max(1, maxHp * fraction);
    const previousHp = enemy.hp;
    const biteX = enemy.x;
    const biteY = enemy.y - mobileSize(3);
    damageEnemy(enemy, damage, true);
    if (Number.isFinite(previousHp) && enemy.hp < previousHp) {
      const width = clamp(enemy.r * 3.1, mobileSize(42), mobileSize(88));
      state.effects.push({ type:'saurion-bite', x:biteX, y:biteY, width, height:width * .829, life:.3, total:.3 });
    }
  }
  function isEnemyInSaurionArc(summon, enemy, range, halfAngle) {
    const dx = enemy.x - summon.x;
    const dy = enemy.y - summon.y;
    if (Math.hypot(dx, dy) > mobileSize(range) + enemy.r) return false;
    const direction = Math.atan2(dy, dx);
    const difference = Math.atan2(Math.sin(direction - summon.angle), Math.cos(direction - summon.angle));
    return Math.abs(difference) <= halfAngle;
  }
  function isEnemyInSaurionBiteTriangle(summon, enemy, range, halfAngle) {
    const dx = enemy.x - summon.x;
    const dy = enemy.y - summon.y;
    const forward = dx * Math.cos(summon.angle) + dy * Math.sin(summon.angle);
    const sideways = Math.abs(-dx * Math.sin(summon.angle) + dy * Math.cos(summon.angle));
    return forward > 0 && forward <= mobileSize(range) + enemy.r && sideways <= forward * Math.tan(halfAngle) + enemy.r;
  }
  function distanceToSaurionSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const progress = lengthSquared > 0 ? clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1) : 0;
    return Math.hypot(point.x - (start.x + dx * progress), point.y - (start.y + dy * progress));
  }
  function updateSaurionSummon(dt) {
    state.saurionSummonCooldownE = Math.max(0, state.saurionSummonCooldownE - dt);
    state.saurionSummonCooldownQ = Math.max(0, state.saurionSummonCooldownQ - dt);
    state.saurionPlayerBuffTime = Math.max(0, state.saurionPlayerBuffTime - dt);
    if (state.saurionPlayerBuffTime <= 0) { state.saurionPlayerDamageBuff = 0; state.saurionPlayerFireRateBuff = 0; }
    if (currentSkin().id !== 'saurion-primal') return;
    for (const summon of saurionSummons().slice()) {
    summon.life -= dt;
    summon.attackCooldown -= dt;
    summon.biteCooldown = Math.max(0, (summon.biteCooldown || 0) - dt);
    summon.rushCooldown -= dt;
    summon.stompCooldown -= dt;
    summon.tailCooldown -= dt;
    summon.commandCooldown = Math.max(0, summon.commandCooldown - dt);
    summon.provokeTime = Math.max(0, summon.provokeTime - dt);
    summon.fearTime = Math.max(0, summon.fearTime - dt);
    if (summon.life <= 0 || summon.hp <= 0) {
      burst(summon.x, summon.y, summon.hp <= 0 ? '#b5ff70' : '#79e543', 20, 145);
      if (summon.hp <= 0) toast(summon.name.toUpperCase() + ' VOLTOU À MANADA');
      state.saurionSummons = saurionSummons().filter((active) => active !== summon);
      updateAbilityButton();
      continue;
    }
    const targets = state.enemies.filter((enemy) => !enemy.dead).sort((a, b) => distance(summon, a) - distance(summon, b));
    const target = summon.kind === 'carno'
      ? [...targets].sort((a, b) => (b.speed || 0) - (a.speed || 0))[0]
      : summon.kind === 'rex'
        ? [...targets].sort((a, b) => (b.hp || b.maxHp || 0) - (a.hp || a.maxHp || 0) || (b.maxHp || 0) - (a.maxHp || 0))[0]
        : summon.kind === 'trike'
        ? [...targets].sort((a, b) => distance(state.player, a) - distance(state.player, b))[0]
        : targets[0];
    const playerHeading = Number.isFinite(state.player.moveAngle) ? state.player.moveAngle : state.player.angle;
    const titanTrailDistance = mobileSize(138);
    const titanSideOffset = (summon.slot === 'q' ? -1 : 1) * mobileSize(32);
    const ankylTrailDistance = mobileSize(30);
    const titanScreenMargin = mobileSize(Math.max(summon.radius, summon.radius * (summon.visualScale || 5.55) * .48));
    const followX = summon.kind === 'titan'
      ? clamp(state.player.x - Math.cos(playerHeading) * titanTrailDistance + Math.sin(playerHeading) * titanSideOffset, titanScreenMargin, state.width - titanScreenMargin)
      : summon.kind === 'ankyl'
        ? state.player.x - Math.cos(playerHeading) * ankylTrailDistance
        : state.player.x + Math.cos(state.elapsed * 1.7 + .5) * mobileSize(50) + (summon.slot === 'q' ? -1 : 1) * mobileSize(68);
    const followY = summon.kind === 'titan'
      ? clamp(state.player.y - Math.sin(playerHeading) * titanTrailDistance - Math.cos(playerHeading) * titanSideOffset, titanScreenMargin, state.height - titanScreenMargin)
      : summon.kind === 'ankyl'
        ? state.player.y - Math.sin(playerHeading) * ankylTrailDistance
        : state.player.y - mobileSize(50) + Math.sin(state.elapsed * 2.1) * mobileSize(15);
    const previousSummonX = summon.x;
    const previousSummonY = summon.y;
    if ((summon.kind === 'trike' || summon.kind === 'carno') && summon.dashTime > 0) {
      const previousX = summon.x;
      const previousY = summon.y;
      const summonRadius = mobileSize(summon.radius);
      if (summon.kind === 'trike') {
        const dashSpeed = mobileSize(690);
        summon.x = clamp(summon.x + Math.cos(summon.dashAngle || summon.angle) * dashSpeed * dt, summonRadius, state.width - summonRadius);
        summon.y = clamp(summon.y + Math.sin(summon.dashAngle || summon.angle) * dashSpeed * dt, summonRadius, state.height - summonRadius);
      } else {
        summon.x = clamp(summon.x + Math.cos(summon.dashAngle || summon.angle) * mobileSize(620) * dt, summonRadius, state.width - summonRadius);
        summon.y = clamp(summon.y + Math.sin(summon.dashAngle || summon.angle) * mobileSize(620) * dt, summonRadius, state.height - summonRadius);
      }
      summon.dashTime -= dt;
      for (const enemy of targets) {
        const rushHalfLength = mobileSize(summon.radius * (summon.kind === 'trike' ? 1.25 : 1.65));
        const rushBodyWidth = mobileSize(summon.radius * (summon.kind === 'trike' ? .82 : .64));
        const dashAngle = summon.dashAngle || summon.angle;
        const hitDuringRush = distanceToSaurionSegment(enemy, {
          x:previousX - Math.cos(dashAngle) * rushHalfLength,
          y:previousY - Math.sin(dashAngle) * rushHalfLength
        }, {
          x:summon.x + Math.cos(dashAngle) * rushHalfLength,
          y:summon.y + Math.sin(dashAngle) * rushHalfLength
        }) <= rushBodyWidth + enemy.r;
        if (summon.dashHit.has(enemy) || !hitDuringRush) continue;
        summon.dashHit.add(enemy);
        applySaurionDamage(enemy, summon.kind === 'carno' ? .10 : enemy.kind === 'boss' || enemy.kind === 'brute' ? .5 : 1, summon.kind === 'carno' ? .012 : .035);
        enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .4 : .85);
        burst((previousX + summon.x) / 2, summon.y, '#a5ff54', 8, 105);
      }
      if (summon.kind === 'trike' && (summon.x <= summonRadius + 1 || summon.x >= state.width - summonRadius - 1 || summon.y <= summonRadius + 1 || summon.y >= state.height - summonRadius - 1)) summon.dashTime = 0;
      if (summon.dashTime <= 0) { summon.dashHit.clear(); if (summon.kind === 'trike') summon.rushCooldown = 5; else summon.commandCooldown = 4; }
    } else {
      if (summon.kind !== 'trike') {
        if ((summon.kind === 'carno' || summon.kind === 'rex' || summon.kind === 'theri') && target) {
          const dx = target.x - summon.x;
          const dy = target.y - summon.y;
          const distanceToTarget = Math.hypot(dx, dy) || 1;
          summon.angle = Math.atan2(dy, dx);
          const stoppingDistance = mobileSize(summon.kind === 'carno' ? 82 : summon.kind === 'rex' ? 92 : 105) + target.r;
          const pursuitSpeed = summon.kind === 'carno' ? 345 : summon.kind === 'rex' ? 225 : 245;
          const step = Math.min(Math.max(0, distanceToTarget - stoppingDistance), mobileSize(pursuitSpeed) * dt);
          summon.x = clamp(summon.x + dx / distanceToTarget * step, mobileSize(summon.radius), state.width - mobileSize(summon.radius));
          summon.y = clamp(summon.y + dy / distanceToTarget * step, mobileSize(summon.radius), state.height - mobileSize(summon.radius));
        } else if (summon.kind !== 'carno' && summon.kind !== 'rex' && summon.kind !== 'theri') {
          const speed = summon.kind === 'titan' ? 1.35 : summon.kind === 'ankyl' ? 5.4 : 3.1;
          summon.x += (followX - summon.x) * Math.min(1, dt * speed);
          summon.y += (followY - summon.y) * Math.min(1, dt * speed);
        }
      }
      const titanMoveX = summon.x - previousSummonX;
      const titanMoveY = summon.y - previousSummonY;
      if (summon.kind === 'titan' && Math.hypot(titanMoveX, titanMoveY) > mobileSize(1)) summon.angle = Math.atan2(titanMoveY, titanMoveX);
      else if (summon.kind === 'ankyl') summon.angle = playerHeading;
      else if (target) summon.angle = Math.atan2(target.y - summon.y, target.x - summon.x);
      else summon.angle = -Math.PI / 2;
    }
    if (summon.kind === 'titan') {
      const movedX = summon.x - previousSummonX;
      const movedY = summon.y - previousSummonY;
      const travelAngle = Math.hypot(movedX, movedY) > mobileSize(1) ? Math.atan2(movedY, movedX) : summon.angle;
      const bodyHalfLength = mobileSize(summon.radius * 2.15);
      const bodyWidth = mobileSize(summon.radius * .68);
      const bodyStart = { x:previousSummonX - Math.cos(travelAngle) * bodyHalfLength, y:previousSummonY - Math.sin(travelAngle) * bodyHalfLength };
      const bodyEnd = { x:summon.x + Math.cos(travelAngle) * bodyHalfLength, y:summon.y + Math.sin(travelAngle) * bodyHalfLength };
      for (const enemy of targets) {
        const cooldown = Math.max(0, (summon.trampleCooldowns.get(enemy) || 0) - dt);
        if (cooldown <= 0 && distanceToSaurionSegment(enemy, bodyStart, bodyEnd) <= bodyWidth + enemy.r) {
          summon.trampleCooldowns.set(enemy, 1.5);
          applySaurionDamage(enemy, enemy.kind === 'boss' ? .06 : .75, .012);
          enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .22 : .38);
          const angle = Math.atan2(enemy.y - summon.y, enemy.x - summon.x);
          enemy.tempestRepulse = { time:.24, total:.24, vx:Math.cos(angle) * 115, vy:Math.sin(angle) * 115, spin:0 };
          burst(enemy.x, enemy.y, '#b4d96c', 5, 72);
        } else if (cooldown > 0) summon.trampleCooldowns.set(enemy, cooldown);
      }
    }
    if (summon.kind === 'ankyl') {
      const bodyHalfLength = mobileSize(summon.radius * 2.05);
      const bodyWidth = mobileSize(summon.radius * .78);
      const bodyStart = { x:summon.x - Math.cos(summon.angle) * bodyHalfLength, y:summon.y - Math.sin(summon.angle) * bodyHalfLength };
      const bodyEnd = { x:summon.x + Math.cos(summon.angle) * bodyHalfLength, y:summon.y + Math.sin(summon.angle) * bodyHalfLength };
      for (const enemy of targets) {
        const cooldown = Math.max(0, (summon.trampleCooldowns.get(enemy) || 0) - dt);
        if (cooldown <= 0 && distanceToSaurionSegment(enemy, bodyStart, bodyEnd) <= bodyWidth + enemy.r) {
          summon.trampleCooldowns.set(enemy, 1.15);
          applySaurionDamage(enemy, .42, .024);
          enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .1 : .2);
          burst(enemy.x, enemy.y, '#a9c953', 6, 78);
        } else if (cooldown > 0) summon.trampleCooldowns.set(enemy, cooldown);
      }
    }
    if (summon.kind === 'trike' && summon.dashTime <= 0 && target && summon.rushCooldown <= 0) {
      summon.dashAngle = Math.atan2(target.y - summon.y, target.x - summon.x);
      summon.angle = summon.dashAngle;
      summon.dashTime = clamp((distance(summon, target) + mobileSize(summon.radius * 1.35)) / mobileSize(690), .28, 1.6);
      summon.dashHit.clear();
      burst(summon.x, summon.y, '#a5ff54', 12, 125);
    }
    if (summon.kind === 'titan' && summon.stompCooldown <= 0 && targets.some((enemy) => distance(summon, enemy) <= mobileSize(235) + enemy.r)) {
      summon.stompCooldown = 6;
      state.effects.push({ type:'saurion-summon-wave', x:summon.x, y:summon.y, radius:0, maxRadius:mobileSize(235), life:.56, total:.56, color:'#c69a68' });
      for (const enemy of targets) if (distance(summon, enemy) < mobileSize(235) + enemy.r) {
        applySaurionDamage(enemy, .10, .022);
        enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .25 : .5);
      }
    }
    if (summon.kind === 'ankyl' && summon.tailCooldown <= 0) {
      const tailLength = mobileSize(summon.radius * 2.05);
      const tailX = summon.x - Math.cos(summon.angle) * tailLength;
      const tailY = summon.y - Math.sin(summon.angle) * tailLength;
      const shockRadius = mobileSize(220);
      const tailTargets = targets.filter((enemy) => distance({ x:tailX, y:tailY }, enemy) <= shockRadius + enemy.r);
      if (tailTargets.length) {
        summon.tailCooldown = 8.5;
        summon.tailPose = .42;
        state.effects.push({ type:'saurion-ankyl-shockwave', x:tailX, y:tailY, radius:0, maxRadius:shockRadius, hit:new Set(), life:.74, total:.74 });
        burst(tailX, tailY, '#d5b66d', 18, 165);
      }
    }
    if (summon.kind === 'spino') {
      const clawRange = 188;
      const clawHalfAngle = Math.PI * .34;
      if (summon.attackCooldown <= 0) {
        const clawTargets = targets.filter((enemy) => isEnemyInSaurionArc(summon, enemy, clawRange, clawHalfAngle));
        if (clawTargets.length) {
          summon.attackCooldown = 1.35;
          summon.tailPose = .3;
          state.effects.push({ type:'saurion-spino-claw', x:summon.x, y:summon.y, angle:summon.angle, radius:mobileSize(clawRange), life:.32, total:.32 });
          clawTargets.forEach((enemy) => {
            applySaurionDamage(enemy, .2, .02);
            enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .12 : .2);
          });
          burst(summon.x + Math.cos(summon.angle) * mobileSize(72), summon.y + Math.sin(summon.angle) * mobileSize(72), '#b4d96c', 12, 120);
        }
      }
      if (summon.biteCooldown <= 0) {
        const biteTarget = targets.find((enemy) => isEnemyInSaurionBiteTriangle(summon, enemy, 96, Math.PI / 7));
        if (biteTarget) {
          summon.biteCooldown = 2.2;
          applySaurionDamage(biteTarget, .44, .045);
          biteTarget.dinoStun = Math.max(biteTarget.dinoStun || 0, biteTarget.kind === 'boss' ? .2 : .35);
          burst(biteTarget.x, biteTarget.y, '#d5efb0', 10, 112);
        }
      }
    } else if (summon.kind === 'trike' && summon.dashTime <= 0 && summon.attackCooldown <= 0 && targets.length) {
      const hornTargets = targets.filter((enemy) => isEnemyInSaurionBiteTriangle(summon, enemy, 142, Math.PI / 5));
      if (hornTargets.length) {
        summon.attackCooldown = 1.05;
        state.effects.push({ type:'saurion-trike-horns', x:summon.x, y:summon.y, angle:summon.angle, radius:mobileSize(142), life:.3, total:.3 });
        for (const enemy of hornTargets) {
          applySaurionDamage(enemy, enemy.kind === 'boss' || enemy.kind === 'brute' ? .055 : .16, .012);
          enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .1 : .24);
          const angle = Math.atan2(enemy.y - summon.y, enemy.x - summon.x);
          enemy.tempestRepulse = { time:.18, total:.18, vx:Math.cos(angle) * 92, vy:Math.sin(angle) * 92, spin:0 };
        }
        burst(summon.x + Math.cos(summon.angle) * mobileSize(70), summon.y + Math.sin(summon.angle) * mobileSize(70), '#f1bf86', 8, 95);
      } else summon.attackCooldown = .18;
    } else if (summon.kind === 'titan' && summon.tailCooldown <= 0 && targets.length) {
      const tailArea = { ...summon, angle:summon.angle + Math.PI };
      const tailTargets = targets.filter((enemy) => isEnemyInSaurionBiteTriangle(tailArea, enemy, 250, Math.PI / 4));
      if (tailTargets.length) {
        summon.tailCooldown = 10;
        summon.attackCooldown = .55;
        summon.tailPose = .42;
        state.effects.push({ type:'saurion-titan-tail', x:summon.x, y:summon.y, angle:tailArea.angle, radius:mobileSize(250), life:.42, total:.42 });
        for (const enemy of tailTargets) {
          applySaurionDamage(enemy, .75, .035);
          enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .18 : .32);
          const angle = Math.atan2(enemy.y - summon.y, enemy.x - summon.x);
          enemy.tempestRepulse = { time:.22, total:.22, vx:Math.cos(angle) * 100, vy:Math.sin(angle) * 100, spin:0 };
        }
        burst(summon.x + Math.cos(tailArea.angle) * mobileSize(155), summon.y + Math.sin(tailArea.angle) * mobileSize(155), '#d6ad77', 13, 135);
      }
    } else if (summon.kind !== 'trike' && summon.kind !== 'titan' && summon.kind !== 'ankyl' && summon.attackCooldown <= 0 && targets.length) {
      const carnoBiteOrigin = summon.kind === 'carno'
        ? { x:summon.x + Math.cos(summon.angle) * mobileSize(48), y:summon.y + Math.sin(summon.angle) * mobileSize(48) }
        : summon.kind === 'rex'
          ? { x:summon.x + Math.cos(summon.angle) * mobileSize(58), y:summon.y + Math.sin(summon.angle) * mobileSize(58) }
        : summon;
      const biteRange = summon.kind === 'carno' ? 165 : summon.kind === 'rex' ? 155 : summon.kind === 'theri' ? 175 : 145;
      const nearby = targets.filter((enemy) => distance(carnoBiteOrigin, enemy) <= mobileSize(biteRange) + enemy.r);
      if (summon.kind === 'rex') nearby.sort((a, b) => (b.hp || b.maxHp || 0) - (a.hp || a.maxHp || 0) || (b.maxHp || 0) - (a.maxHp || 0));
      const prey = nearby[0];
      if (prey) {
        const cooldown = summon.kind === 'carno' ? .5 : summon.kind === 'rex' ? 1.5 : summon.kind === 'ankyl' ? 2.8 : summon.kind === 'theri' ? 2.2 : 2;
        summon.attackCooldown = cooldown;
        if (summon.kind === 'theri') {
          summon.tailPose = .38;
          state.effects.push({ type:'saurion-theri-claw', x:summon.x, y:summon.y, angle:summon.angle, radius:mobileSize(biteRange), life:.42, total:.42 });
          for (const enemy of nearby) {
            applySaurionDamage(enemy, .22, .02);
            enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .08 : .12);
          }
          burst(summon.x, summon.y, '#d7b5ff', Math.min(18, 8 + nearby.length * 2), 135);
          continue;
        }
        if (summon.kind === 'rex') {
          applySaurionDamage(prey, .28, .03);
          if (prey.kind === 'boss' || prey.kind === 'brute') {
            prey.saurionAttackSlowTime = Math.max(prey.saurionAttackSlowTime || 0, 5);
            prey.saurionAttackSlowFactor = .5;
            const angle = Math.atan2(prey.y - summon.y, prey.x - summon.x);
            prey.tempestRepulse = { time:.34, total:.34, vx:Math.cos(angle) * 150, vy:Math.sin(angle) * 150, spin:1.1 };
          }
        }
        else if (summon.kind === 'carno') applySaurionDamage(prey, .20, .008);
        else applySaurionDamage(prey, .2, .012);
        summon.tailPose = .28;
        burst(prey.x, prey.y, '#8dff4b', 7, 105);
      }
    }
    summon.tailPose = Math.max(0, summon.tailPose - dt);
    }
  }
  function activateSaurionCommand(summon = saurionSummons().find((active) => active.kind === 'rex' && !active.rageUsed) || saurionSummons().find((active) => active.kind === 'carno')) {
    if (currentSkin().id !== 'saurion-primal' || state.mode !== 'playing' || !summon) return;
    if (summon.kind === 'rex' && !summon.rageUsed) {
      summon.rageUsed = true;
      state.saurionPlayerBuffTime = 15;
      state.saurionPlayerDamageBuff = .25;
      state.saurionPlayerFireRateBuff = .25;
      state.effects.push({ type:'saurion-summon-wave', x:state.player.x, y:state.player.y, radius:0, maxRadius:mobileSize(180), life:.56, total:.56, color:'#b4ff61' });
      toast('RUGIDO DE FÚRIA · DANO E CADÊNCIA +25% · 15s');
      burst(summon.x, summon.y, '#b4ff61', 17, 145);
      tone(88, .42, 'sawtooth', .05);
    } else if (summon.kind === 'carno' && summon.commandCooldown <= 0) {
      summon.dashTime = .42;
      const target = nearestEnemyFrom(summon);
      summon.dashAngle = target ? Math.atan2(target.y - summon.y, target.x - summon.x) : summon.angle;
      summon.commandCooldown = 4.42;
      summon.attackCooldown = Math.min(summon.attackCooldown, .1);
      toast('CARNOTAURO · INVESTIDA CURTA');
      burst(summon.x, summon.y, '#a4ff48', 12, 130);
      tone(180, .18, 'sawtooth', .035);
    }
    updateAbilityButton();
  }
  function activateAbility() {
    if (currentSkin().id === 'training') { activateFerrumCountershock(); return; }
    if (currentSkin().noAbilities) return;
    if (currentSkin().id === 'prisma' && !state.prismDispatchSkinId) { activatePrismAbilityChoice('e'); return; }
    const developerProfile = hasDeveloperPerks();
    if (state.mode !== 'playing') return;
    const skin = currentSkin();
    if (skin.id === 'aurora' && !state.auroraUlt && state.auroraUltCharge > 0 && state.auroraUltCharge < 6 && state.auroraEFirstTapAt > 0) {
      const elapsedSinceTap = performance.now() - state.auroraEFirstTapAt;
      if (elapsedSinceTap <= AURORA_E_DOUBLE_TAP_MS && state.auroraEFirstTapCharge > 0 && state.auroraEFirstTapCharge < 6) {
        activateAuroraRepulse();
        return;
      }
      if (elapsedSinceTap > AURORA_E_DOUBLE_TAP_MS) {
        state.auroraEFirstTapAt = 0;
        state.auroraEFirstTapCharge = 0;
      }
    }
    if (skin.id === 'vulture') {
      if (vultureUltCollapseActive() || (state.vultureEvolutionTime > 0 && !vultureUltPowerActive())) return;
      if (activateVultureFold()) recordAchievementEvent('ship-ability', 'vulture');
      updateAbilityButton();
      return;
    }
    if (skin.id === 'mahoraga') {
      activateMahoragaAdaptation();
      return;
    }
    if (skin.id === 'megumi') {
      activateMegumiTechnique();
      return;
    }
    if (skin.id === 'saurion') {
      activateSaurionRoar();
      return;
    }
    if (skin.id === 'saurion-primal') {
      openSaurionSummonPicker('e');
      return;
    }
    if (skin.id === 'flamestorm') {
      activateFlameStormBoost();
      return;
    }
    if (!developerProfile && state.abilityCooldown > 0) return;
    if (skin.id === 'eclipse' && state.eclipsePhase !== 'idle') return;
    const eclipseComboActive = skin.id === 'eclipse' && state.eclipseParadox?.life > 0;
    if (eclipseComboActive) empowerEclipseParadoxTargets();
    recordAchievementEvent('ship-ability', skin.id);
    state.abilityCooldown = developerProfile ? 0 : state.abilityBaseCooldown || skin.cooldown;
    if (skin.id === 'eclipse') {
      const duration = Math.min(10.3, 10 + state.eclipseDurationBonus + Math.max(0, state.abilityPower - 1) * .7);
      state.eclipseTime = duration;
      startEclipseCinematic(state.eclipseSkipVideoEnabled);
    } else if (skin.id === 'aurora') {
      const chargeBeforeNova = clamp(state.auroraUltCharge || 0, 0, 6);
      state.auroraEFirstTapAt = chargeBeforeNova > 0 && chargeBeforeNova < 6 ? performance.now() : 0;
      state.auroraEFirstTapCharge = chargeBeforeNova;
      const radius = mobileSize(360);
      state.effects.push({ type: 'nova', x: state.player.x, y: state.player.y, radius: 0, maxRadius: radius, life: .95, total: .95 });
      const novaHits = damageAuroraNova(radius);
      if (novaHits.length) gainAuroraUltCharge();
      burst(state.player.x, state.player.y, skin.color, 76, 310); burst(state.player.x, state.player.y, '#ffffff', 28, 190); toast('EXPLOSÃO NOVA');
      if (novaHits.length) convergeAuroraUltimate(radius, novaHits.length);
    } else if (skin.id === 'flashblade') {
      const angle = state.player.angle || -Math.PI / 2;
      state.effects.push({ type: 'blade', x: state.player.x, y: state.player.y, vx: Math.cos(angle) * 850, vy: Math.sin(angle) * 850, angle, turnTimer: .1, life: 8, total: 8, bounces: 0, damage: 13 * state.abilityPower, hitCooldowns: [], trail: [{ x: state.player.x, y: state.player.y }] });
      burst(state.player.x, state.player.y, skin.color, 34, 195); toast('CORTE FLASH · TRAJETÓRIA INSTÁVEL');
    } else if (skin.id === 'tempest') {
      const angle = state.player.moveAngle ?? state.player.angle ?? -Math.PI / 2;
      state.effects.push({ type: 'singularity-shot', x: state.player.x + Math.cos(angle) * 18, y: state.player.y + Math.sin(angle) * 18, vx: Math.cos(angle) * 470, vy: Math.sin(angle) * 470, angle, life: .72, total: .72 });
      toast('SINGULARIDADE DISPARADA');
    } else if (skin.id === 'chronos') {
      state.slowTime = 7.2; state.effects.push({ type: 'chronos', life: 7.2, total: 7.2 }); toast('TEMPO DOBRADO · CAMPO AMPLIADO');
    } else if (skin.id === 'aegis') {
      const canAddTemporaryShield = state.tempShields < 4 && totalShieldCount() < MAX_TOTAL_SHIELDS;
      if (canAddTemporaryShield) {
        state.tempShields += 1;
        state.aegisBarrierCharges += 1;
        state.aegisBarrierTime = 9;
      }
      state.effects.push({ type: 'aegis', life: 9, total: 9 });
      toast(canAddTemporaryShield ? 'BARREIRA AEGIS · 1 CARGA · 9s' : 'ESCUDOS NO LIMITE · BARREIRA VISUAL ATIVA');
      updateHud();
    } else if (skin.id === 'redshift') {
      const duration = Math.min(10, 8 + state.reflectDurationBonus);
      state.reflectTime = duration;
      state.reflectContacts = new Set();
      state.effects.push({ type: 'reflect-shield', life: duration, total: duration });
      burst(state.player.x, state.player.y, skin.color, 42, 210); burst(state.player.x, state.player.y, skin.accent, 18, 145);
      toast('ESCUDO DE RETORNO · ' + duration.toFixed(1).replace('.', ',') + 's');
    }
    updateAbilityButton();
    if (skin.id === 'saurion') tone(92, .38, 'sawtooth', .04);
    else if (skin.id !== 'eclipse') tone(740, .22, 'triangle', .05);
  }
  function update(dt) {
    if (state.megumiSummonPhase === 'cinematic' || state.damageCounterEditing || (ui.saurionSummonPicker && !ui.saurionSummonPicker.hidden)) return;
    state.elapsed += dt;
    state.damageCounterIdle = Math.min(3.2, state.damageCounterIdle + dt);
    for (const popup of state.damageCounterPopups) { popup.life -= dt; popup.y -= mobileSize(22) * dt; }
    state.damageCounterPopups = state.damageCounterPopups.filter((popup) => popup.life > 0);
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.flameStormQIntangible = Math.max(0, state.flameStormQIntangible - dt);
    state.vultureCloakTime = Math.max(0, state.vultureCloakTime - dt);
    if (state.vultureFoldCharges < 3 && state.vultureFoldRecharge > 0) {
      state.vultureFoldRecharge = Math.max(0, state.vultureFoldRecharge - dt);
      if (state.vultureFoldRecharge <= 0) state.vultureFoldCharges = 3;
    }
    const vultureEvolutionWasActive = state.vultureEvolutionTime > 0;
    state.vultureEvolutionTime = Math.max(0, state.vultureEvolutionTime - dt);
    if (state.vultureUltPhase === 'power') {
      state.vultureUltPowerTime = Math.max(0, state.vultureUltPowerTime - dt);
      if (state.vultureUltPowerTime <= 0 && state.vultureEvolutionTime > 0) beginVultureCollapse();
    }
    state.vultureAbsorbCooldown = Math.max(0, state.vultureAbsorbCooldown - dt);
    if (vultureEvolutionWasActive && state.vultureEvolutionTime <= 0) finishVultureUltimate();
    state.vultureOverloadTime = Math.max(0, state.vultureOverloadTime - dt);
    state.vultureVulnerableTime = Math.max(0, state.vultureVulnerableTime - dt);
    state.vultureVulnerableHitCooldown = Math.max(0, state.vultureVulnerableHitCooldown - dt);
    advanceFerrumCountershock(dt);
    if (currentSkin().id === 'vulture' && state.vultureScrap >= 8 && state.mode === 'playing') {
      state.vultureOverloadCountdown = Math.max(0, state.vultureOverloadCountdown - dt);
      if (state.vultureOverloadCountdown <= 0) triggerVultureOverload();
    } else if (state.vultureScrap < 8) state.vultureOverloadCountdown = 0;
    updateVultureQPress();
    state.mahoragaAdaptationVisualTime = Math.max(0, state.mahoragaAdaptationVisualTime - dt);
    state.mahoragaShieldHitCooldown = Math.max(0, state.mahoragaShieldHitCooldown - dt);
    state.mahoragaDuplicateBuffTime = Math.max(0, state.mahoragaDuplicateBuffTime - dt);
    if (state.mahoragaDuplicateBuffTime <= 0) state.mahoragaDuplicateBuffBonus = 0;
    for (const enemy of state.enemies) {
      if (enemy.mahoragaMarkTime > 0) {
        enemy.mahoragaMarkTime = Math.max(0, enemy.mahoragaMarkTime - dt);
        if (enemy.mahoragaMarkTime === 0) enemy.mahoragaMarkBonus = 0;
      }
      if (enemy.eclipseParadoxComboTime > 0) {
        enemy.eclipseParadoxComboTime = Math.max(0, enemy.eclipseParadoxComboTime - dt);
        enemy.eclipseParadoxMarked = enemy.eclipseParadoxComboTime / 3;
      }
    }
    state.waveGrace = Math.max(0, state.waveGrace - dt);
    state.shotCooldown -= dt;
    state.powerSpawn -= dt;
    state.abilityCooldown = Math.max(0, state.abilityCooldown - dt);
    state.flameStormQCooldown = hasDeveloperPerks() ? 0 : Math.max(0, state.flameStormQCooldown - dt);
    state.megumiSummonCooldown = Math.max(0, state.megumiSummonCooldown - dt);
    if (state.megumiCloakTime > 0) {
      state.megumiCloakTime = Math.max(0, state.megumiCloakTime - dt);
      if (state.megumiCloakTime === 0) toast('A SOMBRA SE DISSIPA');
    }
    ui.stage?.classList.toggle('starfall-megumi-shadow-veil', megumiShadowCloakActive());
    ui.stage?.classList.toggle('starfall-vulture-cloaked', vultureCloakActive());
    updateVultureScrapHud();
    state.mahoragaSlashCooldown = Math.max(0, state.mahoragaSlashCooldown - dt);
    state.mahoragaParryWindow = Math.max(0, state.mahoragaParryWindow - dt);
    state.mahoragaParryCooldown = Math.max(0, state.mahoragaParryCooldown - dt);
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
    state.eclipseParadoxCooldown = Math.max(0, state.eclipseParadoxCooldown - dt);
    state.vultureQCooldown = hasDeveloperPerks() && !vultureUltPowerActive() ? 0 : Math.max(0, state.vultureQCooldown - dt);
    state.redshiftPerimeterCooldown = Math.max(0, state.redshiftPerimeterCooldown - dt);
    state.flashTrailCooldown = Math.max(0, state.flashTrailCooldown - dt);
    advanceTempestTideRecharge(dt);
    advanceDinoStampedeRecharge(dt);
    advanceDinoRoarRecharge(dt);
    advanceAuroraLink(dt);
    advanceAuroraUltimate(dt);
    advanceAegisOrbit(dt);
    advanceAegisBarrier(dt);
    updateEclipseParadox(dt);
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
      if (state.regenTimer <= 0) { state.lives++; state.regenTimer = Math.max(16, 32 - state.regenLevel * 4) * (1 + Math.min(2.5, lateWavePressure() * .025)); toast('NANORREPARO +1 VIDA'); updateHud(); }
    }
    let dx = 0; let dy = 0;
    if (state.eclipsePhase === 'active') {
      state.pointer.active = false;
      if (state.analog.active) releaseAnalog();
      state.player.x = state.width / 2;
      state.player.y = state.height / 2;
    } else {
      if (state.keys.has('ArrowLeft') || state.keys.has('KeyA')) dx -= 1;
      if (state.keys.has('ArrowRight') || state.keys.has('KeyD')) dx += 1;
      if (state.keys.has('ArrowUp') || state.keys.has('KeyW')) dy -= 1;
      if (state.keys.has('ArrowDown') || state.keys.has('KeyS')) dy += 1;
      if (state.pointer.active) {
        const pointerDistance = Math.hypot(state.pointer.x - state.player.x, state.pointer.y - state.player.y);
        if (pointerDistance > 8) { dx += (state.pointer.x - state.player.x) / pointerDistance; dy += (state.pointer.y - state.player.y) / pointerDistance; }
      }
      if (state.analog.active) { dx += state.analog.x; dy += state.analog.y; }
      const inputLength = Math.hypot(dx, dy);
      if (inputLength > 1) { dx /= inputLength; dy /= inputLength; }
    }
    if (currentSkin().id === 'vulture' && state.vultureOverloadTime > 0) { dx = 0; dy = 0; state.pointer.active = false; }
    const flameStormDash = currentSkin().id === 'flamestorm' && state.flameStormDash?.life > 0 ? state.flameStormDash : null;
    const flameStormDashActive = Boolean(flameStormDash);
    if (flameStormDashActive) {
      if (Math.hypot(dx, dy) > .08) {
        const desiredAngle = Math.atan2(dy, dx);
        const turnDelta = Math.atan2(Math.sin(desiredAngle - flameStormDash.angle), Math.cos(desiredAngle - flameStormDash.angle));
        flameStormDash.angle += clamp(turnDelta, -2.25 * dt, 2.25 * dt);
      }
      dx = Math.cos(flameStormDash.angle); dy = Math.sin(flameStormDash.angle);
      state.player.moveAngle = flameStormDash.angle;
      state.player.angle = flameStormDash.angle;
    } else if (dx !== 0 || dy !== 0) {
      // Quantiza a direção do movimento em oito ângulos de 45 graus.
      const eighthTurn = Math.PI / 4;
      state.player.moveAngle = Math.atan2(dy, dx);
      state.player.angle = Math.round(Math.atan2(dy, dx) / eighthTurn) * eighthTurn;
    }
    const norm = Math.hypot(dx, dy) || 1;
    const hullSpeed = state.lives <= 2 ? 1 + state.lowHullBoost * .12 : 1;
    const flashbladeDash = abilitySourceIs('flashblade') && state.flashTrail?.life > 0;
    const normalMoveSpeed = Math.min(525, state.player.speed + state.endlessSpeed);
    const moveSpeed = normalMoveSpeed * (flameStormDashActive ? 2.65 : flashbladeDash ? 2.6 : 1);
    if (state.ferrumRam?.phase === 'dash') {
      advanceFerrumDash(dt);
    } else if (flameStormDashActive) {
      const minX = 17 + Math.min(state.player.radius * 2.8, state.width * .18);
      const minY = 17 + Math.min(state.player.radius * 4, state.height * .18);
      const maxX = Math.max(minX, state.width - minX), maxY = Math.max(minY, state.height - minY);
      let nextX = state.player.x + dx * moveSpeed * hullSpeed * dt;
      let nextY = state.player.y + dy * moveSpeed * hullSpeed * dt;
      let bounced = false;
      if (nextX < minX || nextX > maxX) { nextX = clamp(nextX, minX, maxX); flameStormDash.angle = Math.PI - flameStormDash.angle; bounced = true; }
      if (nextY < minY || nextY > maxY) { nextY = clamp(nextY, minY, maxY); flameStormDash.angle = -flameStormDash.angle; bounced = true; }
      state.player.x = nextX; state.player.y = nextY;
      if (bounced) {
        state.player.angle = flameStormDash.angle; state.player.moveAngle = flameStormDash.angle;
        burst(state.player.x, state.player.y, '#ff4934', 8, 84);
        burst(state.player.x, state.player.y, '#ffd58c', 4, 52);
      }
    } else if (megumiShadowCloakActive()) {
      const minX = 17, minY = 17, spanX = Math.max(1, state.width - 34), spanY = Math.max(1, state.height - 34);
      state.player.x = minX + ((state.player.x - minX + (dx / norm) * moveSpeed * hullSpeed * dt) % spanX + spanX) % spanX;
      state.player.y = minY + ((state.player.y - minY + (dy / norm) * moveSpeed * hullSpeed * dt) % spanY + spanY) % spanY;
    } else {
      state.player.x = clamp(state.player.x + (dx / norm) * moveSpeed * hullSpeed * dt, 17, state.width - 17);
      state.player.y = clamp(state.player.y + (dy / norm) * moveSpeed * hullSpeed * dt, 17, state.height - 17);
    }
    if (flameStormDashActive) {
      flameStormDash.life = Math.max(0, flameStormDash.life - dt);
      const trail = state.effects.find((effect) => effect.type === 'flamestorm-trail' && effect.ownerDash === flameStormDash);
      if (trail) {
        trail.points.push({ x:state.player.x, y:state.player.y });
        const maxTrailLength = mobileSize(150);
        let keptLength = 0;
        for (let index = trail.points.length - 1; index > 0; index--) {
          const from = trail.points[index - 1];
          const to = trail.points[index];
          const segmentLength = Math.hypot(to.x - from.x, to.y - from.y);
          if (keptLength + segmentLength > maxTrailLength) {
            const remaining = maxTrailLength - keptLength;
            const fraction = segmentLength > 0 ? remaining / segmentLength : 0;
            const trailStart = { x:to.x + (from.x - to.x) * fraction, y:to.y + (from.y - to.y) * fraction };
            trail.points.splice(0, index);
            trail.points.unshift(trailStart);
            break;
          }
          keptLength += segmentLength;
        }
      }
      if (flameStormDash.life <= 0) state.flameStormDash = null;
    }
    updateSaurionSummon(dt);
    for (const rabbit of state.megumiRabbits) {
      rabbit.life -= dt; rabbit.turnTimer -= dt;
      if (rabbit.turnTimer <= 0) { rabbit.angle += random(-rabbit.turn, rabbit.turn, 'ability'); rabbit.turnTimer = random(.35, 1.1, 'ability'); }
      rabbit.x += Math.cos(rabbit.angle) * rabbit.speed * dt; rabbit.y += Math.sin(rabbit.angle) * rabbit.speed * dt;
      if (rabbit.x < 18 || rabbit.x > state.width - 18) { rabbit.angle = Math.PI - rabbit.angle; rabbit.x = clamp(rabbit.x, 18, state.width - 18); }
      if (rabbit.y < 18 || rabbit.y > state.height - 18) { rabbit.angle = -rabbit.angle; rabbit.y = clamp(rabbit.y, 18, state.height - 18); }
      rabbit.fireCooldown -= dt;
      const prey = nearestEnemyFrom(rabbit);
      if (prey && rabbit.fireCooldown <= 0) {
        const shotAngle = Math.atan2(prey.y - rabbit.y, prey.x - rabbit.x);
        state.bullets.push({ x:rabbit.x + Math.cos(shotAngle) * 9, y:rabbit.y + Math.sin(shotAngle) * 9, vx:Math.cos(shotAngle) * 465, vy:Math.sin(shotAngle) * 465, r:mobileSize(3), damage:rabbit.damage, pierce:0, hit:[], assistTarget:prey.kind === 'boss' && !prey.isMiniBoss ? prey : null, color:rabbit.index === 0 ? '#f1d5ff' : '#a891cf', megumiRabbitShot:true });
        rabbit.fireCooldown = random(.58, 1.05, 'ability');
      }
    }
    state.megumiRabbits = state.megumiRabbits.filter((rabbit) => rabbit.life > 0);
    updateFlashTrail(dt);
    updateEclipseCuts(dt);
    const isVulture = currentSkin().id === 'vulture';
    if (isVulture) {
      if (!vultureUltCollapseActive() && state.vultureOverloadTime <= 0) {
        state.vultureCannonCharge = Math.min(VULTURE_CANNON_CHARGE_SECONDS, state.vultureCannonCharge + dt);
        if (state.automaticFireEnabled && state.eclipsePhase !== 'active' && state.shotCooldown <= 0 && state.enemies.length) {
          fireAt(nearestEnemy());
          state.shotCooldown = Math.max(.13, state.player.fireRate);
        }
      }
      updateVultureChargeMeter();
    } else if (state.automaticFireEnabled && state.eclipsePhase !== 'active' && state.shotCooldown <= 0 && state.enemies.length) {
      fireAt(nearestEnemy());
      state.shotCooldown = Math.max(.13, state.player.fireRate * (currentSkin().id === 'saurion-primal' && state.saurionPlayerBuffTime > 0 ? 1 - state.saurionPlayerFireRateBuff : 1));
    }
    if (!state.bossWave && state.waveKills < state.enemiesRequired && state.waveGrace <= 0) {
      state.enemySpawn -= dt;
      if (state.enemySpawn <= 0 && state.enemies.length < Math.min(24, 12 + Math.floor(state.wave * .3))) { spawnEnemy(); state.enemySpawn = Math.max(.34, .72 - Math.min(state.wave, 40) * .006 - Math.floor((Math.min(state.wave, 40) - 1) / 10) * .025) * random(.78, .98, 'spawnTimer'); }
    }
    if (state.bossWave && !state.bossSpawned) { state.enemySpawn -= dt; if (state.enemySpawn <= 0) spawnBoss(); }
    if (state.miniBossTimer > 0 && !state.miniBossSpawned) {
      state.miniBossTimer -= dt;
      if (state.miniBossTimer <= 0) { state.miniBossSpawned = true; spawnBoss(true); }
    }
    if (state.powerSpawn <= 0 && state.wave > 1) {
      if (randomUnit('loot') < wavePickupChance()) spawnPickup(random(30, state.width - 30, 'loot'), random(40, state.height - 40, 'loot'));
      state.powerSpawn = random(13, 20, 'spawnTimer') * (1 + Math.min(2, lateWavePressure() * .018));
    }
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
    const slowFactor = state.slowTime > 0 ? .28 : 1;
    const flameStormVortex = currentSkin().id === 'flamestorm'
      ? state.effects.find((effect) => effect.type === 'flamestorm-vortex' && effect.life > 0)
      : null;
    for (const bullet of state.enemyBullets) {
      if (bullet.dead || destroyEnemyShotAtFlashTrail(bullet)) continue;
      if (blockFerrumCountershockShot(bullet, dt * slowFactor)) continue;
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
      if (bullet.homingTime > 0) {
        bullet.homingTime = Math.max(0, bullet.homingTime - dt * slowFactor);
        const target = bullet.source && !bullet.source.dead ? enemyAimTarget(bullet.source) : state.player;
        const speed = Math.hypot(bullet.vx, bullet.vy) || 240;
        const currentAngle = Math.atan2(bullet.vy, bullet.vx);
        const targetAngle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
        const difference = Math.atan2(Math.sin(targetAngle - currentAngle), Math.cos(targetAngle - currentAngle));
        const nextAngle = currentAngle + clamp(difference, -(bullet.turnRate || 1.8) * dt, (bullet.turnRate || 1.8) * dt);
        bullet.vx = Math.cos(nextAngle) * speed; bullet.vy = Math.sin(nextAngle) * speed;
      }
      if (flameStormVortex && distance(bullet, flameStormVortex) <= flameStormVortex.radius + bullet.r) {
        bullet.flameStormVortexPull = Math.min(.52, (bullet.flameStormVortexPull || 0) + dt);
        if (bullet.flameStormVortexPull >= .52) {
          burst(flameStormVortex.x, flameStormVortex.y, '#ff3049', 3, 42);
          bullet.dead = true;
          continue;
        }
      } else if (bullet.flameStormVortexPull) bullet.flameStormVortexPull = 0;
      if (bullet.fuse != null) { bullet.fuse -= dt * slowFactor; if (bullet.fuse <= 0) { explodeBullet(bullet); continue; } }
      bullet.x += bullet.vx * dt * slowFactor; bullet.y += bullet.vy * dt * slowFactor;
      if (interceptWithAegisOrbit(bullet)) continue;
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
    const vultureUltField = activeVultureUltField();
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const insideVultureUlt = Boolean(vultureUltField && distance(enemy, vultureUltField) <= vultureUltField.radius + enemy.r);
      const aimTarget = enemyAimTarget(enemy);
      let angle = Math.atan2(aimTarget.y - enemy.y, aimTarget.x - enemy.x);
      enemy.saurionFearTime = Math.max(0, (enemy.saurionFearTime || 0) - dt);
      enemy.saurionTauntTime = Math.max(0, (enemy.saurionTauntTime || 0) - dt);
      enemy.saurionSlowTime = Math.max(0, (enemy.saurionSlowTime || 0) - dt);
      enemy.saurionAttackSlowTime = Math.max(0, (enemy.saurionAttackSlowTime || 0) - dt);
      const saurionFear = currentSkin().id === 'saurion-primal' && enemy.saurionFearTime > 0 ? saurionSummons().filter((summon) => summon.kind === 'rex' || summon.kind === 'carno' || summon.kind === 'spino').sort((a, b) => distance(enemy, a) - distance(enemy, b))[0] || null : null;
      if (saurionFear) angle = Math.atan2(enemy.y - saurionFear.y, enemy.x - saurionFear.x);
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
      enemy.auroraUltSlowTime = Math.max(0, (enemy.auroraUltSlowTime || 0) - dt);
      enemy.eclipseParadoxSuppression = Math.max(0, (enemy.eclipseParadoxSuppression || 0) - dt);
      const paradoxField = state.eclipseParadox;
      const insideParadox = Boolean(paradoxField && Math.hypot(enemy.x - paradoxField.x, enemy.y - paradoxField.y) <= paradoxField.radius + enemy.r);
      const paradoxExposure = insideParadox ? paradoxField.exposure.get(enemy) || 0 : 0;
      const paradoxSlowLimit = enemy.kind === 'boss' ? .42 : .68;
      const enemySlowFactor = slowFactor * (insideParadox ? 1 - paradoxSlowLimit * clamp(paradoxExposure / Math.min(2.2, paradoxField.total), 0, 1) : 1) * (insideVultureUlt ? enemy.kind === 'boss' ? .12 : .08 : 1) * (saurionFear ? .76 : 1) * (currentSkin().id === 'saurion-primal' && enemy.saurionSlowTime > 0 ? .82 : 1) * (enemy.auroraUltSlowTime > 0 ? .72 : 1);
      enemy.dinoCutMark = Math.max(0, (enemy.dinoCutMark || 0) - dt);
      if (enemy.dinoCutMark > 0 && (enemy.dinoClawBursts || 0) > 0) {
        enemy.dinoClawTimer = Math.max(0, (enemy.dinoClawTimer || 0) - dt);
        if (enemy.dinoClawTimer <= 0) {
          emitDinoClawSet(enemy);
          const clawDamage = (1 + state.dinoRoarBonus * .02) * state.abilityPower * (enemy.kind === 'boss' ? 1.35 : 1);
          damageEnemy(enemy, clawDamage, true);
          burst(enemy.x, enemy.y, '#ff9b35', enemy.kind === 'boss' ? 6 : 4, 96);
          enemy.dinoClawBursts--;
          enemy.dinoClawTimer = .9;
          if (enemy.dead) continue;
        }
      }
      const stunnedByDino = enemy.dinoStun > 0 || enemy.prismStun > 0;
      const stunnedByParadox = enemy.eclipseParadoxSuppression > 0;
      if (frozenByEclipse || stunnedByDino || stunnedByParadox) {
        enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
      } else {
        enemy.angle += enemy.spin * dt;
        enemy.ramCooldown = Math.max(0, (enemy.ramCooldown || 0) - dt);
        enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
        if (enemy.kind === 'boss') {
          if (enemy.bossType === 'aurora' && !enemy.isMiniBoss) {
            updateAuroraBossMovement(enemy, dt, enemySlowFactor);
          } else {
            enemy.drift += dt * enemySlowFactor * (.65 + (enemy.phase || 1) * .12);
          if (enemy.bossType === 'hunter' && !enemy.isMiniBoss && enemy.dashTime > 0 && !insideVultureUlt && !vultureCloakActive()) {
              enemy.x += Math.cos(angle) * 300 * dt * enemySlowFactor; enemy.y += Math.sin(angle) * 300 * dt * enemySlowFactor; enemy.dashTime -= dt * enemySlowFactor;
            } else {
              const targetY = 112 + Math.sin(enemy.drift * .8) * Math.min(35, state.height * .045);
              enemy.y += clamp(targetY - enemy.y, -enemy.speed * dt * enemySlowFactor, enemy.speed * dt * enemySlowFactor);
              const targetX = state.width / 2 + Math.sin(enemy.drift * (enemy.bossType === 'prism' ? 1.7 : 1.1)) * Math.min(state.width * .34, 260);
              enemy.x += clamp(targetX - enemy.x, -enemy.speed * (1 + (enemy.phase - 1) * .12) * dt * enemySlowFactor, enemy.speed * (1 + (enemy.phase - 1) * .12) * dt * enemySlowFactor);
              if (enemy.bossType === 'hunter' && !enemy.isMiniBoss && !insideVultureUlt && !vultureCloakActive()) {
                enemy.x += Math.cos(angle) * 36 * dt * enemySlowFactor;
                enemy.dashCooldown -= dt * enemySlowFactor;
                if (enemy.dashCooldown <= 0) { enemy.dashTime = .45; enemy.dashCooldown = Math.max(2.1, 3.8 - enemy.phase * .3); toast('INVESTIDA DO ESPECTRO'); }
              }
            }
          }
        } else {
          const speed = enemy.kind === 'hunter' || enemy.kind === 'ricochet' ? enemy.speed : enemy.speed * .82;
          enemy.x += Math.cos(angle) * speed * dt * enemySlowFactor; enemy.y += Math.sin(angle) * speed * dt * enemySlowFactor;
        }
        if (insideVultureUlt || vultureCloakActive()) enemy.cooldown = Math.max(enemy.cooldown || 0, .7);
        else if (enemy.cooldown) {
          enemy.cooldown -= dt * enemySlowFactor * (currentSkin().id === 'saurion-primal' && enemy.saurionAttackSlowTime > 0 ? enemy.saurionAttackSlowFactor || .85 : 1);
          if (enemy.cooldown <= 0 && enemy.y > 0 && enemy.y < state.height - 25) {
            enemyFire(enemy);
            const baseCooldown = enemy.kind === 'boss'
              ? (enemy.isMiniBoss ? random(2.1, 2.7, 'attack') : Math.max(.5, (bossTypes[enemy.bossType]?.attackCooldown || 1.1) * (1 - (enemy.phase - 1) * .1)))
              : enemy.kind === 'drone' ? random(.88, 1.35, 'attack')
                : enemy.kind === 'brute' || enemy.kind === 'ricochet' ? random(1.05, 1.55, 'attack') : random(1.45, 2.35, 'attack');
            enemy.cooldown = baseCooldown * enemyUpgradeFireRateScale() * enemyWaveFireRateScale();
          }
        }
      }
      if (enemy.kind === 'boss' && enemy.bossType === 'aurora' && !insideVultureUlt && !vultureCloakActive()) updateAuroraBossSkills(enemy, dt);
      const purpleHunter = enemy.kind === 'hunter';
      const purpleBoss = enemy.kind === 'boss' && enemy.bossType === 'hunter';
      if ((purpleHunter || purpleBoss) && (insideVultureUlt || vultureCloakActive())) {
        enemy.hunterFuse = null;
        enemy.hunterFuseTotal = null;
      } else if (purpleHunter || purpleBoss) {
        const hunterDistance = distance(state.player, enemy);
        const triggerRadius = mobileSize(purpleBoss ? 266 : 150);
        const fuseDuration = purpleBoss ? 1.15 : .72;
        enemy.hunterExplosionCooldown = Math.max(0, (enemy.hunterExplosionCooldown || 0) - dt);
        if (enemy.hunterExplosionCooldown <= 0 && hunterDistance <= triggerRadius) {
          if (enemy.hunterFuse == null) { enemy.hunterFuse = fuseDuration; enemy.hunterFuseTotal = fuseDuration; }
          enemy.hunterFuse -= dt * enemySlowFactor;
          if (enemy.hunterFuse <= 0) {
            const blastRadius = mobileSize(purpleBoss ? 250 : 170);
            state.effects.push({ type: 'hunter-explosion', x: enemy.x, y: enemy.y, radius: blastRadius, isBossExplosion: purpleBoss, life: .26, total: .26 });
            burst(enemy.x, enemy.y, purpleBoss ? '#c07cff' : '#ff583b', purpleBoss ? 52 : 36, purpleBoss ? 330 : 260);
            burst(enemy.x, enemy.y, purpleBoss ? '#f5d6ff' : '#ffd080', purpleBoss ? 26 : 18, purpleBoss ? 230 : 175);
            if (hunterDistance <= blastRadius + state.player.radius) damagePlayer(purpleBoss ? 3 : 1, mahoragaAttackType(enemy, 'impact'));
            enemy.hunterExplosionCooldown = purpleBoss ? 5.2 : 3.6;
            enemy.hunterFuse = null; enemy.hunterFuseTotal = null;
            if (purpleHunter) { damageEnemy(enemy, enemy.hp, true, 'self'); continue; }
          }
        } else if (hunterDistance > triggerRadius + mobileSize(38) || enemy.hunterExplosionCooldown > 0) {
          enemy.hunterFuse = null; enemy.hunterFuseTotal = null;
        }
      }
      if (distance(state.player, enemy) < state.player.radius + enemy.r * .75) {
        if ((state.invulnerable > 0 && !(currentSkin().id === 'vulture' && state.vultureVulnerableTime > 0)) || stunnedByDino || stunnedByParadox || megumiShadowCloakActive() || vultureCloakActive() || flameStormDashActive || state.flameStormQIntangible > 0 || state.ferrumRam?.phase === 'dash') continue;
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
        if (enemy.ramCooldown <= 0) {
          if (enemy.kind === 'hunter' && enemy.hunterFuse > 0) { enemy.ramCooldown = .16; continue; }
          damagePlayer(enemy.kind === 'boss' && enemy.phase >= 4 ? 3 : enemy.kind === 'boss' && enemy.phase >= 2 ? 2 : 1, mahoragaAttackType(enemy, 'impact'));
          const separation = enemy.r + state.player.radius + (enemy.kind === 'hunter' ? 12 : 8);
          enemy.x = clamp(state.player.x - Math.cos(angle) * separation, enemy.r, state.width - enemy.r);
          enemy.y = clamp(state.player.y - Math.sin(angle) * separation, enemy.r, state.height - enemy.r);
          if (enemy.kind === 'hunter') {
            enemy.ramCooldown = 1.2;
            burst(enemy.x, enemy.y, enemy.color, 8, 90);
          } else enemy.ramCooldown = enemy.kind === 'boss' ? .9 : .62;
        }
      }
    }
    updateRedshiftPerimeter(dt);
    for (const bullet of state.bullets) {
      for (const enemy of state.enemies) {
        if (bullet.dead || enemy.dead || (bullet.hit && bullet.hit.includes(enemy))) continue;
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r * .72) {
          damageEnemy(enemy, bullet.damage, false); burst(bullet.x, bullet.y, bullet.color, 4, 56);
          if (bullet.playerPrimaryShot && currentSkin().id === 'aurora') gainAuroraUltCharge(.035);
          if (state.blastRadius > 0) state.enemies.forEach((nearby) => { if (nearby !== enemy && !nearby.dead && distance(enemy, nearby) < state.blastRadius + nearby.r) damageEnemy(nearby, bullet.damage * .45, true); });
          if (bullet.pierce > 0) { bullet.pierce--; bullet.hit = bullet.hit || []; bullet.hit.push(enemy); }
          else bullet.dead = true;
          break;
        }
      }
    }
    state.bullets = state.bullets.filter(b => !b.dead);
    state.enemies = state.enemies.filter(e => !e.dead && e.y > -100 && e.y < state.height + 100 && e.x > -100 && e.x < state.width + 100);
    const saurionInterceptions = currentSkin().id === 'saurion-primal' ? saurionSummons() : [];
    if (saurionInterceptions.length) for (const bullet of state.enemyBullets) {
      if (bullet.dead || bullet.reflected) continue;
      const saurionInterception = saurionInterceptions.find((summon) => summon.kind === 'ankyl'
        ? distance(bullet, state.player) < bullet.r + state.player.radius + mobileSize(18)
        : distance(bullet, summon) < bullet.r + mobileSize(summon.radius) * .68);
      if (!saurionInterception) continue;
      bullet.dead = true;
      saurionInterception.hp -= Math.max(1, bullet.damage || 1);
      burst(bullet.x, bullet.y, '#9eff58', 4, 62);
    }
    for (const bullet of state.enemyBullets) if (!bullet.dead && !bullet.reflected && !flameStormDashActive && state.flameStormQIntangible <= 0 && !(bullet.tempestTideSweep?.time > 0) && Math.hypot(bullet.x - state.player.x, bullet.y - state.player.y) < bullet.r + state.player.radius * .7) {
      if (reflectIncomingBullet(bullet)) continue;
      if (bullet.explosive && (state.invulnerable <= 0 || (currentSkin().id === 'vulture' && state.vultureVulnerableTime > 0))) explodeBullet(bullet);
      else if (bullet.explosive) { bullet.dead = true; burst(bullet.x, bullet.y, '#ffb54a', 10, 115); }
      else { bullet.dead = true; if (!megumiShadowCloakActive()) damagePlayer(bullet.damage || 1, mahoragaAttackType(bullet)); }
    }
    state.enemyBullets = state.enemyBullets.filter(b => !b.dead);
    state.droneCooldown -= dt;
    if (state.drones && state.droneCooldown <= 0 && !vultureUltCollapseActive()) {
      state.droneCooldown = .42;
      for (let i = 0; i < state.drones; i++) {
        const angle = performance.now() / 800 + i * Math.PI * 2 / state.drones;
        const satellite = { x: state.player.x + Math.cos(angle) * mobileSize(39), y: state.player.y + Math.sin(angle) * mobileSize(39) };
        const enemy = state.enemies.find((target) => !target.dead && distance(satellite, target) < target.r + 11);
        if (enemy) damageEnemy(enemy, .85, true);
      }
    }
    for (const pickup of state.pickups) {
      if (state.mode !== 'playing') break;
      if (pickup.dead) continue;
      pickup.life -= dt; pickup.spin += dt * 3;
      const angle = Math.atan2(state.player.y - pickup.y, state.player.x - pickup.x);
      if (distance(state.player, pickup) < state.magnet) { const pull = 96 + state.magnet * .15; pickup.x += Math.cos(angle) * pull * dt; pickup.y += Math.sin(angle) * pull * dt; }
      if (distance(state.player, pickup) < state.player.radius + pickup.r) {
        collectPickup(pickup);
        if (state.mode !== 'playing') {
          state.pickups = state.pickups.filter((item) => !item.dead && item.life > 0);
          return;
        }
      }
    }
    state.pickups = state.pickups.filter(p => !p.dead && p.life > 0);
    const activeEffects = [];
    const previousFlashTrailContacts = state.flashTrailContacts;
    const currentFlashTrailContacts = new Set();
    for (const effect of state.effects) {
      effect.life -= dt;
      if (effect.type === 'saurion-ankyl-shockwave' && effect.life > 0) {
        const previousRadius = effect.radius || 0;
        effect.radius = effect.maxRadius * clamp(1 - effect.life / effect.total, 0, 1);
        if (!(effect.hit instanceof Set)) effect.hit = new Set();
        for (const enemy of state.enemies) {
          if (enemy.dead || effect.hit.has(enemy)) continue;
          const distanceFromCrater = distance(effect, enemy);
          if (distanceFromCrater > effect.radius + enemy.r || distanceFromCrater + enemy.r < previousRadius) continue;
          effect.hit.add(enemy);
          applySaurionDamage(enemy, .32, .024);
          enemy.dinoStun = Math.max(enemy.dinoStun || 0, enemy.kind === 'boss' ? .16 : .36);
          const angle = Math.atan2(enemy.y - effect.y, enemy.x - effect.x);
          enemy.tempestRepulse = { time:.28, total:.28, vx:Math.cos(angle) * 145, vy:Math.sin(angle) * 145, spin:0 };
          burst(enemy.x, enemy.y, '#d5b66d', 5, 76);
        }
      } else if (effect.type === 'saurion-ankyl-shield' && effect.life > 0) {
        if (effect.followPlayer) { effect.x = state.player.x; effect.y = state.player.y; }
        effect.radius = effect.maxRadius * clamp(1 - effect.life / effect.total, 0, 1);
      } else if (effect.type === 'vulture-pulse' && effect.life > 0) {
        effect.radius = effect.maxRadius * clamp(1 - effect.life / effect.total, 0, 1);
      } else if (effect.type === 'vulture-absorb-field' && effect.life > 0) {
        effect.x = state.player.x; effect.y = state.player.y; effect.rotation += dt * 4.4;
        effect.radius = effect.maxRadius * (1 - effect.life / effect.total);
      } else if (effect.type === 'vulture-ult-field' && effect.life > 0 && state.vultureEvolutionTime > 0) {
        effect.x = state.player.x; effect.y = state.player.y; effect.rotation += dt * 1.15;
        for (const enemy of state.enemies) {
          if (enemy.dead) continue;
          const dx = state.player.x - enemy.x, dy = state.player.y - enemy.y, d = Math.hypot(dx, dy) || 1;
          if (d > effect.radius + enemy.r) continue;
          const safeDistance = state.player.radius + enemy.r + mobileSize(82);
          const forceScale = enemy.kind === 'boss' ? .72 : 1;
          const pushOut = d < safeDistance;
          const strength = pushOut
            ? Math.min(26, (safeDistance - d) * .8) * forceScale * dt
            : Math.min(12, 2 + (d - safeDistance) * .045) * forceScale * dt;
          const pullDirection = pushOut ? -1 : 1;
          enemy.x = clamp(enemy.x + dx / d * strength * pullDirection, enemy.r, state.width - enemy.r);
          enemy.y = clamp(enemy.y + dy / d * strength * pullDirection, enemy.r, state.height - enemy.r);
        }
        state.vultureUltPulseCooldown -= dt;
        if (state.vultureUltPulseCooldown <= 0) {
          state.vultureUltPulseCooldown = .88;
          for (const enemy of state.enemies) {
            if (enemy.dead || distance(state.player, enemy) > effect.radius + enemy.r) continue;
            damageEnemy(enemy, enemy.kind === 'boss' ? 1.35 : 2.35, true);
            burst(enemy.x, enemy.y, '#ffad4a', enemy.kind === 'boss' ? 5 : 3, enemy.kind === 'boss' ? 68 : 44);
          }
        }
      } else if (effect.type === 'vulture-horizon-shot' && effect.life > 0 && !effect.hit) {
        if (!effect.target || effect.target.dead) effect.target = state.enemies.filter((enemy) => !enemy.dead && distance(effect, enemy) < mobileSize(650)).sort((a, b) => (a.kind === 'boss' ? -1 : 0) - (b.kind === 'boss' ? -1 : 0) || distance(effect, a) - distance(effect, b))[0] || null;
        if (effect.target) effect.angle = Math.atan2(effect.target.y - effect.y, effect.target.x - effect.x);
        const speed = mobileSize(effect.charged ? 1120 : 900);
        effect.x += Math.cos(effect.angle) * speed * dt;
        effect.y += Math.sin(effect.angle) * speed * dt;
        const hit = effect.target && !effect.target.dead && distance(effect, effect.target) <= effect.target.r + mobileSize(12) ? effect.target : null;
        if (hit) {
          damageEnemy(hit, effect.damage * (hit.kind === 'boss' ? (effect.forced ? .72 : .62) : 1), true);
          effect.hit = true; effect.life = Math.min(effect.life, .16);
          const impactRadius = effect.impactRadius || mobileSize(74);
          state.effects.push({ type:'vulture-impact', x:hit.x, y:hit.y, life:.38, total:.38, radius:impactRadius });
          for (const nearby of state.enemies) {
            if (nearby === hit || nearby.dead || distance(hit, nearby) > impactRadius + nearby.r) continue;
            damageEnemy(nearby, effect.damage * (nearby.kind === 'boss' ? .18 : .42), true);
          }
          burst(hit.x, hit.y, effect.charged ? '#ffc45d' : '#ff8738', hit.kind === 'boss' ? 24 : 16, hit.kind === 'boss' ? 210 : 155);
        }
        if (effect.x < 8 || effect.x > state.width - 8 || effect.y < 8 || effect.y > state.height - 8) effect.life = 0;
        if (state.particles.length < particleLimit() && visualRandomUnit() < dt * 19) state.particles.push({ x:effect.x, y:effect.y, vx:visualRandom(-22,22), vy:visualRandom(-22,22), life:.24, maxLife:.24, r:mobileSize(2.5), color:visualRandomUnit() < .5 ? '#ff7133' : '#ffd16c' });
      } else if (effect.type === 'flamestorm-vortex' && effect.life > 0) {
        effect.x = state.player.x; effect.y = state.player.y; effect.rotation += dt * 8.2; effect.damageClock -= dt;
        for (const enemy of state.enemies) {
          if (enemy.dead) continue;
          const dx = effect.x - enemy.x, dy = effect.y - enemy.y, d = Math.hypot(dx, dy) || 1;
          if (d > effect.radius + enemy.r) continue;
          const pull = (250 + clamp(1 - d / effect.radius, 0, 1) * 410) * (enemy.kind === 'boss' ? .42 : 1) * dt;
          enemy.x = clamp(enemy.x + dx / d * pull, enemy.r, state.width - enemy.r);
          enemy.y = clamp(enemy.y + dy / d * pull, enemy.r, state.height - enemy.r);
          enemy.angle += dt * (enemy.kind === 'boss' ? 2.4 : 5.2);
        }
        if (effect.damageClock <= 0) {
          effect.damageClock = .44;
          for (const enemy of state.enemies) {
            if (enemy.dead || distance(effect, enemy) > effect.radius + enemy.r) continue;
            const damage = flameStormVortexPulseDamage() * state.abilityPower * (enemy.kind === 'boss' ? .55 : 1);
            damageEnemy(enemy, damage, true);
            burst(enemy.x, enemy.y, '#ff4b34', enemy.kind === 'boss' ? 7 : 4, enemy.kind === 'boss' ? 86 : 55);
          }
        }
      } else if (effect.type === 'flamestorm-trail' && effect.life > 0) {
        for (const [enemy, cooldown] of effect.hitCooldowns) {
          if (enemy.dead || cooldown <= dt) effect.hitCooldowns.delete(enemy);
          else effect.hitCooldowns.set(enemy, cooldown - dt);
        }
        for (const enemy of state.enemies) {
          if (enemy.dead || effect.hitCooldowns.has(enemy)) continue;
          let pathDistance = Infinity;
          if (effect.points.length === 1) pathDistance = distance(enemy, effect.points[0]);
          else for (let index = 1; index < effect.points.length; index++) pathDistance = Math.min(pathDistance, distanceToSegment(enemy, effect.points[index - 1], effect.points[index]));
          if (pathDistance > effect.width + enemy.r) continue;
          damageEnemy(enemy, effect.damage * (enemy.kind === 'boss' ? .58 : 1), true);
          effect.hitCooldowns.set(enemy, .34);
          burst(enemy.x, enemy.y, '#ff4931', 5, 66);
          burst(enemy.x, enemy.y, '#ffd27a', 3, 42);
        }
      } else if (effect.type === 'flash-trail' && effect.life > 0) {
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
      } else if (effect.type === 'mahoraga-world-wave' && !effect.completed) {
        const previousTravel = effect.travel;
        effect.elapsed += dt;
        effect.travel = effect.maxTravel * clamp(effect.elapsed / effect.travelDuration, 0, 1);
        if (effect.travel > previousTravel) {
          const directionX = Math.cos(effect.angle); const directionY = Math.sin(effect.angle);
          const sideX = -directionY; const sideY = directionX;
          const bandStart = Math.max(0, previousTravel - effect.waveWidth * .5);
          const bandEnd = effect.travel + effect.waveWidth * .5;
          const targets = [];
          for (const enemy of state.enemies) {
            if (enemy.dead || effect.hitEnemies.has(enemy)) continue;
            const dx = enemy.x - effect.x; const dy = enemy.y - effect.y;
            const along = dx * directionX + dy * directionY;
            const signedAcross = dx * sideX + dy * sideY;
            const across = Math.abs(signedAcross);
            const bow = Math.cos(clamp(signedAcross / effect.halfSpan, -1, 1) * Math.PI * .5) * effect.curveDepth;
            const relativeAlong = along - effect.originOffset - bow;
            if (relativeAlong + enemy.r < bandStart || relativeAlong - enemy.r > bandEnd || across > effect.halfSpan + enemy.r) continue;
            targets.push({ enemy, along });
          }
          targets.sort((a, b) => a.along - b.along);
          for (const { enemy } of targets) {
            if (effect.targetsHit >= effect.maxTargets) break;
            effect.hitEnemies.add(enemy);
            const rawDamage = effect.targetsHit === 0 ? 20 : 10;
            const bossScale = enemy.kind === 'boss' ? .72 : 1;
            damageEnemy(enemy, rawDamage * Math.max(1, state.abilityPower) * bossScale, true);
            effect.targetsHit++;
            if (!enemy.dead) { enemy.mahoragaMarkBonus = .1; enemy.mahoragaMarkTime = 6; effect.markedTargets++; }
            burst(enemy.x, enemy.y, effect.targetsHit === 1 ? '#fff8e8' : '#e4c477', enemy.kind === 'boss' ? 11 : 7, enemy.kind === 'boss' ? 145 : 92);
          }
          for (const bullet of state.enemyBullets) {
            if (bullet.dead || bullet.reflected) continue;
            const dx = bullet.x - effect.x; const dy = bullet.y - effect.y;
            const along = dx * directionX + dy * directionY;
            const signedAcross = dx * sideX + dy * sideY;
            const across = Math.abs(signedAcross);
            const bow = Math.cos(clamp(signedAcross / effect.halfSpan, -1, 1) * Math.PI * .5) * effect.curveDepth;
            const relativeAlong = along - effect.originOffset - bow;
            if (relativeAlong + bullet.r < bandStart || relativeAlong - bullet.r > bandEnd || across > effect.halfSpan + bullet.r) continue;
            bullet.dead = true;
            effect.destroyedBullets++;
            if (effect.destroyedBullets <= 12) burst(bullet.x, bullet.y, '#e8d19c', 3, 45);
          }
        }
        if (effect.travel >= effect.maxTravel && !effect.completed) {
          effect.completed = true;
          if (effect.targetsHit || effect.destroyedBullets) toast('CORTE MUNDIAL · ' + effect.targetsHit + ' ALVOS · ' + effect.destroyedBullets + ' TIROS DESTRUÍDOS');
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
          let raptorDamage = effect.damage * (markedBySaurion ? 1.12 : 1);
          if (enemy.kind === 'boss') {
            const ledger = effect.bossDamageLedger || (effect.bossDamageLedger = new Map());
            const alreadyDealt = ledger.get(enemy) || 0;
            raptorDamage = Math.min(raptorDamage, Math.max(0, enemy.maxHp * .24 - alreadyDealt));
            if (raptorDamage > 0) { damageEnemy(enemy, raptorDamage, true); ledger.set(enemy, alreadyDealt + raptorDamage); }
          } else damageEnemy(enemy, raptorDamage, true);
          effect.hit.push(enemy);
          if (effect.type === 'dino-raptor') effect.target = null;
          burst(effect.x, effect.y, markedBySaurion ? '#ffe1a0' : '#ff9a35', markedBySaurion ? 14 : 10, markedBySaurion ? 130 : 105);
          burst(effect.x, effect.y, '#fff0d2', 5, 72);
        }
        if (state.particles.length < particleLimit() && visualRandomUnit() < dt * 16) state.particles.push({ x: effect.x + visualRandom(-12, 12), y: effect.y + visualRandom(-12, 12), vx: visualRandom(-32, 32), vy: visualRandom(-32, 32), life: .34, maxLife: .34, r: mobileSize(visualRandom(2, 4)), color: visualRandomUnit() < .5 ? '#ffbd55' : '#c95420' });
        if (effect.x < -100 || effect.x > state.width + 100 || effect.y < -100 || effect.y > state.height + 100) effect.life = 0;
      } else if (effect.type === 'blade') {
        effect.turnTimer -= dt;
        if (effect.turnTimer <= 0) {
          const target = state.enemies.filter((enemy) => !enemy.dead)
            .sort((a, b) => distance(effect, a) - distance(effect, b))[0];
          if (target) {
            const targetAngle = Math.atan2(target.y - effect.y, target.x - effect.x);
            const difference = Math.atan2(Math.sin(targetAngle - effect.angle), Math.cos(targetAngle - effect.angle));
          effect.angle += difference * .9 + random(-.2, .2, 'ability');
        } else effect.angle += random(-1.05, 1.05, 'ability');
        const speed = random(820, 990, 'ability');
          effect.vx = Math.cos(effect.angle) * speed; effect.vy = Math.sin(effect.angle) * speed;
          effect.turnTimer = random(.12, .22, 'ability');
        }
        const bladeStart = { x: effect.x, y: effect.y };
        effect.x += effect.vx * dt; effect.y += effect.vy * dt;
        let bounced = false;
        if (effect.x < 7 || effect.x > state.width - 7) { effect.x = clamp(effect.x, 7, state.width - 7); effect.angle = Math.PI - effect.angle + random(-.52, .52, 'ability'); bounced = true; }
        if (effect.y < 7 || effect.y > state.height - 7) { effect.y = clamp(effect.y, 7, state.height - 7); effect.angle = -effect.angle + random(-.52, .52, 'ability'); bounced = true; }
        if (bounced) {
          effect.bounces++; const speed = random(780, 930, 'ability'); effect.vx = Math.cos(effect.angle) * speed; effect.vy = Math.sin(effect.angle) * speed;
          effect.turnTimer = random(.1, .18, 'ability'); burst(effect.x, effect.y, '#fff3ba', 12, 135); burst(effect.x, effect.y, '#ffc86e', 9, 100);
        }
        const previous = effect.trail[effect.trail.length - 1];
        if (!previous || Math.hypot(effect.x - previous.x, effect.y - previous.y) > 9) effect.trail.push({ x: effect.x, y: effect.y });
        if (effect.trail.length > (state.performanceMode === 'light' ? 10 : 24)) effect.trail.shift();
        effect.hitCooldowns = (effect.hitCooldowns || []).filter((entry) => { entry.time -= dt; return entry.time > 0 && !entry.enemy.dead; });
        for (const enemy of state.enemies) {
          const cooling = effect.hitCooldowns.some((entry) => entry.enemy === enemy);
          const hitDistance = enemy.kind === 'boss' && !bounced
            ? distanceToSegment(enemy, bladeStart, effect)
            : Math.hypot(effect.x - enemy.x, effect.y - enemy.y);
          const hitReach = enemy.r + mobileSize(enemy.kind === 'boss' ? 36 : 25);
          if (!enemy.dead && !cooling && hitDistance < hitReach) {
            let bladeDamage = effect.damage;
            if (enemy.kind === 'boss') {
              const bossMaxHp = Number.isFinite(enemy.maxHp) && enemy.maxHp > 0 ? enemy.maxHp : Math.max(1, enemy.hp);
              const bossDamageMultiplier = Math.max(.01, 1 + state.bossDamageBonus);
              bladeDamage = Math.min(bladeDamage * .3, Math.max(.1, bossMaxHp * .0075) / bossDamageMultiplier);
              if (!(bladeDamage > 0)) continue;
            }
            damageEnemy(enemy, bladeDamage, true); effect.hitCooldowns.push({ enemy, time: enemy.kind === 'boss' ? .42 : .5 });
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
        if (hit) { damageEnemy(hit, 32 * state.abilityPower * (hit.kind === 'boss' ? .75 : 1), true); effect.life = 0; }
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
            const pull = (160 + (1 - d / effect.radius) * 340) * dt;
            enemy.x += dxHole / (d || 1) * pull; enemy.y += dyHole / (d || 1) * pull;
          }
        }
        if (effect.damageClock <= 0) {
          effect.damageClock = .32;
          state.enemies.forEach((enemy) => {
            if (enemy.dead || distance(effect, enemy) >= effect.radius) return;
            damageEnemy(enemy, 4 * state.abilityPower * (enemy.kind === 'boss' ? .65 : 1), true);
          });
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
      } else if (effect.type === 'nova' || effect.type === 'prism-core-wave' || effect.type === 'prism-return-wave' || effect.type === 'saurion-summon-wave' || effect.type === 'aurora-repulse-wave') effect.radius = effect.maxRadius * (1 - effect.life / effect.total);
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
      aura.addColorStop(0, 'rgba(255,151,44,.22)'); aura.addColorStop(.58, 'rgba(207,82,23,.13)'); aura.addColorStop(1, 'rgba(63,24,16,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.65, size * 1.85, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const armor = ctx.createLinearGradient(-size, -size, size, size);
    armor.addColorStop(0, '#211514'); armor.addColorStop(.35, color); armor.addColorStop(.72, '#aa4b1d'); armor.addColorStop(1, '#281412');
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#743417'; ctx.strokeStyle = accent; ctx.lineWidth = size * .055;
      ctx.beginPath(); ctx.moveTo(side * size * .48, -size * .48); ctx.lineTo(side * size * 1.02, -size * .94); ctx.lineTo(side * size * .86, -size * .28); ctx.lineTo(side * size * 1.24, size * .02); ctx.lineTo(side * size * .61, size * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffb74a'; ctx.beginPath(); ctx.moveTo(side * size * .73, -size * .58); ctx.lineTo(side * size * .96, -size * .8); ctx.lineTo(side * size * .85, -size * .39); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = armor; ctx.strokeStyle = accent; ctx.lineWidth = size * .075; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .32;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.38); ctx.quadraticCurveTo(size * .78, -size * 1.16, size * .72, -size * .48); ctx.lineTo(size * .92, -size * .08); ctx.quadraticCurveTo(size * .73, size * .28, size * .35, size * .27); ctx.lineTo(0, size * .1); ctx.lineTo(-size * .35, size * .27); ctx.quadraticCurveTo(-size * .73, size * .28, -size * .92, -size * .08); ctx.lineTo(-size * .72, -size * .48); ctx.quadraticCurveTo(-size * .78, -size * 1.16, 0, -size * 1.38); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#171113'; ctx.beginPath(); ctx.moveTo(-size * .66, size * .02); ctx.quadraticCurveTo(0, size * .27, size * .66, size * .02); ctx.lineTo(size * .48, size * (.34 + jawOpen * .2)); ctx.quadraticCurveTo(0, size * (.48 + jawOpen * .45), -size * .48, size * (.34 + jawOpen * .2)); ctx.closePath(); ctx.fill();
    const jaw = ctx.createLinearGradient(0, size * .18, 0, size * 1.03);
    jaw.addColorStop(0, accent); jaw.addColorStop(.32, '#e87825'); jaw.addColorStop(1, '#713018');
    ctx.fillStyle = jaw; ctx.strokeStyle = '#ffd18a'; ctx.lineWidth = size * .045;
    ctx.beginPath(); ctx.moveTo(-size * .58, size * (.28 + jawOpen * .18)); ctx.quadraticCurveTo(0, size * (.44 + jawOpen * .38), size * .58, size * (.28 + jawOpen * .18)); ctx.lineTo(size * .42, size * (.79 + jawOpen * .4)); ctx.quadraticCurveTo(0, size * (.98 + jawOpen * .48), -size * .42, size * (.79 + jawOpen * .4)); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#f4ffd4'; ctx.beginPath(); ctx.moveTo(side * size * .48, size * .08); ctx.lineTo(side * size * .31, size * .08); ctx.lineTo(side * size * .42, size * (.33 + jawOpen * .12)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(side * size * .34, size * (.38 + jawOpen * .2)); ctx.lineTo(side * size * .2, size * (.38 + jawOpen * .2)); ctx.lineTo(side * size * .3, size * (.54 + jawOpen * .25)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#180f11'; ctx.beginPath(); ctx.ellipse(side * size * .43, -size * .34, size * .22, size * .16, side * -.16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffc14d'; ctx.shadowColor = '#ff8a28'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .18; ctx.beginPath(); ctx.ellipse(side * size * .45, -size * .34, size * .09, size * .08 * pulse, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff9a35'; ctx.beginPath(); ctx.ellipse(side * size * .3, -size * .56, size * .075, size * .055, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#ffc468'; ctx.globalAlpha *= .8; ctx.lineWidth = size * .035; ctx.beginPath(); ctx.moveTo(-size * .28, -size * .91); ctx.quadraticCurveTo(0, -size * 1.02, size * .28, -size * .91); ctx.stroke();
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
      aura.addColorStop(0, 'rgba(255,132,35,.2)'); aura.addColorStop(.62, 'rgba(189,69,22,.09)'); aura.addColorStop(1, 'rgba(49,22,17,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, 0, size * 1.9, size * 2.05, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    // Twin ion thrusters establish the rear and give the silhouette a clear fighter-ship profile.
    for (const side of [-1, 1]) {
      const engineX = side * size * .47;
      const flameLength = size * (1.18 + Math.sin(timestamp / 48 + side) * .13);
      const flame = ctx.createLinearGradient(engineX, size * .62, engineX, size * .62 + flameLength);
      flame.addColorStop(0, 'rgba(255,231,161,.98)'); flame.addColorStop(.26, 'rgba(255,151,43,.86)'); flame.addColorStop(.72, 'rgba(201,72,24,.48)'); flame.addColorStop(1, 'rgba(50,20,18,0)');
      ctx.fillStyle = flame; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .38;
      ctx.beginPath(); ctx.moveTo(engineX - size * .14, size * .48); ctx.quadraticCurveTo(engineX - size * .21, size * 1.08, engineX, size * .62 + flameLength); ctx.quadraticCurveTo(engineX + size * .21, size * 1.08, engineX + size * .14, size * .48); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1b1215'; ctx.strokeStyle = accent; ctx.lineWidth = size * .07;
      ctx.beginPath(); ctx.rect(engineX - size * .18, size * .43, size * .36, size * .37); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffc253'; ctx.globalAlpha *= pulse; ctx.beginPath(); ctx.ellipse(engineX, size * .61, size * .075, size * .13, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= pulse;
    }

    // Swept, armored wings with small claw-like tips keep the dinosaur theme while reading as a ship.
    const wing = ctx.createLinearGradient(0, -size * .65, 0, size * .72);
    wing.addColorStop(0, '#ffd078'); wing.addColorStop(.28, color); wing.addColorStop(.72, '#a5481d'); wing.addColorStop(1, '#1a1114');
    for (const side of [-1, 1]) {
      ctx.fillStyle = wing; ctx.strokeStyle = accent; ctx.lineWidth = size * .055;
      ctx.beginPath(); ctx.moveTo(side * size * .23, -size * .57); ctx.quadraticCurveTo(side * size * .72, -size * .48, side * size * 1.2, -size * .04); ctx.lineTo(side * size * 1.34, size * .38); ctx.lineTo(side * size * 1.05, size * .28); ctx.lineTo(side * size * 1.17, size * .73); ctx.lineTo(side * size * .66, size * .51); ctx.quadraticCurveTo(side * size * .39, size * .39, side * size * .25, size * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.moveTo(side * size * .23, -size * .57); ctx.quadraticCurveTo(side * size * .72, -size * .48, side * size * 1.2, -size * .04); ctx.lineTo(side * size * 1.34, size * .38); ctx.lineTo(side * size * 1.05, size * .28); ctx.lineTo(side * size * 1.17, size * .73); ctx.lineTo(side * size * .66, size * .51); ctx.quadraticCurveTo(side * size * .39, size * .39, side * size * .25, size * .18); ctx.closePath(); ctx.clip();
      ctx.globalAlpha = baseAlpha * .82; ctx.strokeStyle = '#171114'; ctx.lineWidth = size * .105;
      for (let stripe = 0; stripe < 3; stripe++) { const x = .43 + stripe * .2, y = -.29 + stripe * .17; ctx.beginPath(); ctx.moveTo(side * size * x, size * y); ctx.lineTo(side * size * (x + .2), size * (y + .19)); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = '#ffbf59'; ctx.globalAlpha = baseAlpha * .84;
      ctx.beginPath(); ctx.moveTo(side * size * 1.02, size * .26); ctx.lineTo(side * size * 1.34, size * .38); ctx.lineTo(side * size * 1.17, size * .73); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = baseAlpha * .72; ctx.strokeStyle = '#ffe0a0'; ctx.lineWidth = size * .035;
      ctx.beginPath(); ctx.moveTo(side * size * .44, -size * .27); ctx.quadraticCurveTo(side * size * .84, size * .02, side * size * 1.05, size * .47); ctx.stroke();
      ctx.globalAlpha = baseAlpha;
      ctx.fillStyle = '#171114'; ctx.beginPath(); ctx.ellipse(side * size * .76, size * .13, size * .12, size * .07, side * .18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .12; ctx.beginPath(); ctx.arc(side * size * .76, size * .13, size * .045, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }

    // Central armored fuselage: pointed nose, cockpit and a short row of dorsal plates.
    ctx.globalAlpha = baseAlpha;
    const hull = ctx.createLinearGradient(-size * .46, -size, size * .46, size * .92);
    hull.addColorStop(0, '#ffe1a0'); hull.addColorStop(.2, color); hull.addColorStop(.56, '#a9491c'); hull.addColorStop(1, '#1d1114');
    ctx.fillStyle = hull; ctx.strokeStyle = accent; ctx.lineWidth = size * .075; ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .28;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.55); ctx.lineTo(size * .3, -size * .93); ctx.lineTo(size * .42, -size * .31); ctx.lineTo(size * .34, size * .48); ctx.lineTo(size * .19, size * .82); ctx.lineTo(0, size * 1.02); ctx.lineTo(-size * .19, size * .82); ctx.lineTo(-size * .34, size * .48); ctx.lineTo(-size * .42, -size * .31); ctx.lineTo(-size * .3, -size * .93); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, -size * 1.55); ctx.lineTo(size * .3, -size * .93); ctx.lineTo(size * .42, -size * .31); ctx.lineTo(size * .34, size * .48); ctx.lineTo(size * .19, size * .82); ctx.lineTo(0, size * 1.02); ctx.lineTo(-size * .19, size * .82); ctx.lineTo(-size * .34, size * .48); ctx.lineTo(-size * .42, -size * .31); ctx.lineTo(-size * .3, -size * .93); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = '#171114'; ctx.lineWidth = size * .105; ctx.lineCap = 'round';
    for (let stripe = 0; stripe < 4; stripe++) { const y = -.79 + stripe * .34; ctx.beginPath(); ctx.moveTo(-size * .34, size * y); ctx.lineTo(-size * .12, size * (y + .23)); ctx.moveTo(size * .34, size * y); ctx.lineTo(size * .12, size * (y + .23)); ctx.stroke(); }
    ctx.restore();

    // The nose has a raptor-mask brow; the inset canopy remains visibly cockpit-like.
    ctx.fillStyle = '#191115'; ctx.strokeStyle = '#ffb94f'; ctx.lineWidth = size * .045;
    ctx.beginPath(); ctx.moveTo(0, -size * 1.24); ctx.quadraticCurveTo(size * .25, -size * .9, size * .2, -size * .52); ctx.quadraticCurveTo(0, -size * .37, -size * .2, -size * .52); ctx.quadraticCurveTo(-size * .25, -size * .9, 0, -size * 1.24); ctx.closePath(); ctx.fill(); ctx.stroke();
    const canopy = ctx.createLinearGradient(0, -size * 1.12, 0, -size * .51);
    canopy.addColorStop(0, '#ffe5aa'); canopy.addColorStop(.18, '#ff9a35'); canopy.addColorStop(.55, '#6b2c1d'); canopy.addColorStop(1, '#1b1115');
    ctx.fillStyle = canopy; ctx.beginPath(); ctx.moveTo(0, -size * 1.12); ctx.quadraticCurveTo(size * .16, -size * .88, size * .13, -size * .58); ctx.quadraticCurveTo(0, -size * .46, -size * .13, -size * .58); ctx.quadraticCurveTo(-size * .16, -size * .88, 0, -size * 1.12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,225,160,.92)'; ctx.lineWidth = size * .025; ctx.beginPath(); ctx.moveTo(-size * .09, -size * .96); ctx.quadraticCurveTo(0, -size * .89, size * .08, -size * .75); ctx.stroke();

    // Amber eyes, dark stripes and swept fins give the hull its Tigrum identity.
    for (const side of [-1, 1]) {
      ctx.globalAlpha = baseAlpha; ctx.fillStyle = '#181014'; ctx.beginPath(); ctx.ellipse(side * size * .29, -size * .67, size * .115, size * .075, side * -.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffc253'; ctx.shadowColor = '#ff8a28'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .14; ctx.beginPath(); ctx.ellipse(side * size * .3, -size * .67, size * .052, size * .046 * pulse, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffb64b'; ctx.beginPath(); ctx.moveTo(side * size * .16, size * .08); ctx.lineTo(side * size * .35, size * .31); ctx.lineTo(side * size * .16, size * .27); ctx.closePath(); ctx.fill();
    }
    for (let plate = 0; plate < 4; plate++) {
      const y = -size * .18 + plate * size * .2;
      const plateSize = size * (.14 - plate * .012);
      ctx.globalAlpha = baseAlpha; ctx.fillStyle = plate % 2 ? '#9d471e' : '#ffc15d'; ctx.strokeStyle = '#211417'; ctx.lineWidth = size * .025;
      ctx.beginPath(); ctx.moveTo(-plateSize, y + plateSize * .5); ctx.lineTo(0, y - plateSize); ctx.lineTo(plateSize, y + plateSize * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,175,68,.82)'; ctx.beginPath(); ctx.ellipse(0, size * .59, size * .1, size * .19, 0, 0, Math.PI * 2); ctx.fill();
  }
  function drawShipThrusterTrails(size, timestamp, glowColor, coreColor) {
    const baseAlpha = ctx.globalAlpha;
    const nozzles = [
      { x:0, y:1.18, width:.24, length:1.58, phase:0 },
      { x:-.42, y:.98, width:.15, length:1.2, phase:1.2 },
      { x:.42, y:.98, width:.15, length:1.2, phase:2.5 },
      { x:-.84, y:.76, width:.1, length:.9, phase:3.8 },
      { x:.84, y:.76, width:.1, length:.9, phase:5.1 }
    ];
    if (state.performanceMode === 'light') nozzles.length = 3;
    for (const nozzle of nozzles) {
      const pulse = .72 + .28 * Math.sin(timestamp / 58 + nozzle.phase);
      const length = size * nozzle.length * (.76 + pulse * .42);
      const width = size * nozzle.width * (.8 + pulse * .34);
      const startY = size * nozzle.y;
      const plume = ctx.createLinearGradient(nozzle.x * size, startY, nozzle.x * size, startY + length);
      plume.addColorStop(0, coreColor);
      plume.addColorStop(.15, glowColor);
      plume.addColorStop(.52, glowColor);
      plume.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.globalAlpha = baseAlpha * (.68 + pulse * .27);
      ctx.fillStyle = plume; ctx.shadowColor = glowColor; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(nozzle.x * size - width * .5, startY);
      ctx.quadraticCurveTo(nozzle.x * size - width * .66, startY + length * .44, nozzle.x * size, startY + length);
      ctx.quadraticCurveTo(nozzle.x * size + width * .66, startY + length * .44, nozzle.x * size + width * .5, startY);
      ctx.closePath(); ctx.fill();
      const innerLength = length * .72, innerWidth = width * .32;
      const inner = ctx.createLinearGradient(nozzle.x * size, startY, nozzle.x * size, startY + innerLength);
      inner.addColorStop(0, '#ffffff'); inner.addColorStop(.28, coreColor); inner.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = baseAlpha * (.72 + pulse * .28); ctx.fillStyle = inner; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(nozzle.x * size - innerWidth * .5, startY);
      ctx.quadraticCurveTo(nozzle.x * size - innerWidth * .58, startY + innerLength * .4, nozzle.x * size, startY + innerLength);
      ctx.quadraticCurveTo(nozzle.x * size + innerWidth * .58, startY + innerLength * .4, nozzle.x * size + innerWidth * .5, startY);
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  function drawMahoragaShipLocal(size, color, accent, timestamp) {
    if (mahoragaShipSprite.complete && mahoragaShipSprite.naturalWidth) {
      const spriteWidth = size * 3.9;
      const spriteHeight = spriteWidth * mahoragaShipSprite.naturalHeight / mahoragaShipSprite.naturalWidth;
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = accent; ctx.shadowBlur = 0;
      ctx.drawImage(mahoragaShipSprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
      ctx.restore();
    } else {
      ctx.save(); ctx.lineJoin = 'round';
      ctx.fillStyle = color; ctx.strokeStyle = accent; ctx.lineWidth = Math.max(1.3, size * .075);
      ctx.beginPath(); ctx.moveTo(0, -size * 1.34); ctx.lineTo(size * .46, -size * .4); ctx.lineTo(size * 1.16, size * .54); ctx.lineTo(size * .55, size * .38); ctx.lineTo(size * .2, size * .82); ctx.lineTo(0, size * 1.02); ctx.lineTo(-size * .2, size * .82); ctx.lineTo(-size * .55, size * .38); ctx.lineTo(-size * 1.16, size * .54); ctx.lineTo(-size * .46, -size * .4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#202732'; ctx.beginPath(); ctx.moveTo(0, -size * .94); ctx.lineTo(size * .14, -size * .27); ctx.lineTo(0, size * .25); ctx.lineTo(-size * .14, -size * .27); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    drawShipThrusterTrails(size, timestamp, '#ddc58f', '#fffdf5');
  }
  function drawSaurionSummon(timestamp) {
    const summons = currentSkin().id === 'saurion-primal' ? saurionSummons() : [];
    for (const summon of summons) {
      const image = saurionDinoSprites[summon.id];
      const fade = clamp(summon.life / .5, 0, 1);
      ctx.save(); ctx.translate(summon.x, summon.y); ctx.rotate((summon.angle ?? -Math.PI / 2) - Math.PI / 2);
      const height = mobileSize(summon.radius * (summon.visualScale || 4.6));
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade;
      if (image?.complete && image.naturalWidth) {
        const width = height * image.naturalWidth / image.naturalHeight;
        ctx.globalAlpha = fade * .98; ctx.filter = summon.kind === 'titan' ? 'brightness(1.34) saturate(1.18)' : 'brightness(1.12) saturate(1.1)';
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        ctx.filter = 'none'; ctx.fillStyle = '#2c4c21'; ctx.strokeStyle = '#a2ff56'; ctx.lineWidth = mobileSize(2);
        ctx.beginPath(); ctx.moveTo(0, -height * .48); ctx.lineTo(height * .25, height * .3); ctx.lineTo(0, height * .48); ctx.lineTo(-height * .25, height * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (summon.tailPose > 0) {
        ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fade * clamp(summon.tailPose / (summon.kind === 'ankyl' ? .42 : .28), 0, 1);
        ctx.strokeStyle = summon.kind === 'ankyl' ? '#e6c981' : '#d8ff8d'; ctx.lineWidth = mobileSize(summon.kind === 'ankyl' ? 4 : 3);
        ctx.shadowColor = summon.kind === 'ankyl' ? '#b08c4e' : '#72ec3e';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
        if (summon.kind === 'ankyl') {
          ctx.beginPath(); ctx.moveTo(-height * .27, height * .43); ctx.quadraticCurveTo(0, height * .75, height * .27, height * .43); ctx.stroke();
          ctx.globalAlpha *= .66; ctx.lineWidth = mobileSize(1.5); ctx.beginPath(); ctx.moveTo(-height * .35, height * .37); ctx.quadraticCurveTo(0, height * .68, height * .35, height * .37); ctx.stroke();
        } else { ctx.beginPath(); ctx.arc(0, 0, height * .58, -.95, 1.2); ctx.stroke(); }
      }
      ctx.restore();
      if (summon.hp < summon.maxHp) {
        const width = mobileSize(48), y = summon.y - mobileSize(summon.radius + 8);
        ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(summon.x - width / 2, y, width, mobileSize(4));
        ctx.fillStyle = '#8cff4d'; ctx.fillRect(summon.x - width / 2, y, width * clamp(summon.hp / summon.maxHp, 0, 1), mobileSize(4));
      }
    }
  }
  function drawShip(x, y, size, skin, angle = -Math.PI / 2, alpha = 1) {
    const ship = skin && typeof skin === 'object' ? skin : currentSkin();
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); ctx.globalAlpha = alpha;
    if (ship.shape === 'vulture') {
      const now = performance.now();
      const evolved = state.vultureEvolutionTime > 0 && vultureEvolutionSprite.complete && vultureEvolutionSprite.naturalWidth;
      const sprite = evolved ? vultureEvolutionSprite : vultureShipSprite;
      const spriteHeight = size * (evolved ? 5.1 : 9.1);
      const spriteWidth = spriteHeight * (sprite.naturalWidth || 1) / (sprite.naturalHeight || 1);
      drawShipThrusterTrails(size * (evolved ? 1.18 : .98), now, '#ff7133', '#ffd16c');
      if (sprite.complete && sprite.naturalWidth) {
        ctx.globalAlpha = alpha * (evolved ? .97 : .9);
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowBlur = 0;
        ctx.drawImage(sprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
        ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#171221'; ctx.strokeStyle = ship.accent; ctx.lineWidth = Math.max(1.5, size * .1);
        ctx.beginPath(); ctx.moveTo(0, -size * 1.4); ctx.lineTo(size, size * .52); ctx.lineTo(0, size * .8); ctx.lineTo(-size, size * .52); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (!evolved && state.vultureCannonCharge > .04) {
        const charge = clamp(state.vultureCannonCharge / VULTURE_CANNON_CHARGE_SECONDS, 0, 1);
        const pulse = .82 + Math.sin(now / 74) * .18;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (const side of [-1, 1]) {
          const orbX = side * size * 1.43;
          const orbY = -size * 1.1;
          const radius = mobileSize(2.4 + charge * 4.4) * pulse;
          const glow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, radius * 2.8);
          glow.addColorStop(0, 'rgba(255,250,207,.98)');
          glow.addColorStop(.24, 'rgba(255,177,74,.92)');
          glow.addColorStop(1, 'rgba(255,92,38,0)');
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(orbX, orbY, radius * 2.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff1ad';
          ctx.beginPath(); ctx.arc(orbX, orbY, Math.max(1.2, radius * .34), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    if (ship.id === 'aurora' && auroraShipSprite.complete && auroraShipSprite.naturalWidth) {
      const now = performance.now();
      const jetPulse = .82 + .18 * Math.sin(now / 62);
      const jetStart = size * 1.17;
      const jetLength = size * (.88 + jetPulse * .34);
      const jetWidth = size * (.2 + jetPulse * .055);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * .76;
      ctx.shadowColor = '#58eaff';
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .26;
      const jet = ctx.createLinearGradient(0, jetStart, 0, jetStart + jetLength);
      jet.addColorStop(0, 'rgba(236,255,255,.92)');
      jet.addColorStop(.18, 'rgba(82,235,255,.86)');
      jet.addColorStop(.58, 'rgba(71,151,255,.55)');
      jet.addColorStop(.88, 'rgba(158,111,255,.2)');
      jet.addColorStop(1, 'rgba(100,183,255,0)');
      ctx.fillStyle = jet;
      ctx.beginPath();
      ctx.moveTo(-jetWidth * .5, jetStart);
      ctx.quadraticCurveTo(-jetWidth * .58, jetStart + jetLength * .42, 0, jetStart + jetLength);
      ctx.quadraticCurveTo(jetWidth * .58, jetStart + jetLength * .42, jetWidth * .5, jetStart);
      ctx.closePath();
      ctx.fill();

      const coreLength = jetLength * .76;
      const core = ctx.createLinearGradient(0, jetStart, 0, jetStart + coreLength);
      core.addColorStop(0, 'rgba(255,255,255,.96)');
      core.addColorStop(.28, 'rgba(183,250,255,.86)');
      core.addColorStop(1, 'rgba(96,199,255,0)');
      ctx.globalAlpha = alpha * (.52 + jetPulse * .1);
      ctx.shadowBlur = 0;
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.moveTo(-jetWidth * .13, jetStart);
      ctx.quadraticCurveTo(-jetWidth * .16, jetStart + coreLength * .42, 0, jetStart + coreLength);
      ctx.quadraticCurveTo(jetWidth * .16, jetStart + coreLength * .42, jetWidth * .13, jetStart);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const spriteHeight = size * 3.7;
      const spriteWidth = spriteHeight * .94;
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowBlur = 0;
      ctx.drawImage(auroraShipSprite, auroraShipSprite.naturalWidth * .30, auroraShipSprite.naturalHeight * .19, auroraShipSprite.naturalWidth * .40, auroraShipSprite.naturalHeight * .58, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      return;
    }
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
    if (ship.shape === 'saurion-primal') {
      const now = performance.now();
      for (const side of [-1, 1]) {
        const engineX = side * size * .38;
        const length = size * (.38 + .07 * Math.sin(now / 66 + side));
        const flame = ctx.createLinearGradient(engineX, size * .78, engineX, size * .78 + length);
        flame.addColorStop(0, 'rgba(226,255,164,.86)'); flame.addColorStop(.28, 'rgba(125,255,54,.76)'); flame.addColorStop(1, 'rgba(51,190,34,0)');
        ctx.globalAlpha = alpha * .68; ctx.fillStyle = flame;
        ctx.beginPath(); ctx.moveTo(engineX - size * .11, size * .75); ctx.quadraticCurveTo(engineX - size * .15, size * .94, engineX, size * .78 + length); ctx.quadraticCurveTo(engineX + size * .15, size * .94, engineX + size * .11, size * .75); ctx.closePath(); ctx.fill();
      }
      const frame = saurionShipFrames[Math.floor(now / 120) % saurionShipFrames.length];
      if (frame?.complete && frame.naturalWidth) {
        const spriteSize = size * 3.5;
        ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'screen'; ctx.shadowBlur = 0;
        ctx.drawImage(frame, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
      } else {
        ctx.globalAlpha = alpha; ctx.fillStyle = '#193f20'; ctx.strokeStyle = ship.accent; ctx.lineWidth = Math.max(1.4, size * .08);
        ctx.beginPath(); ctx.moveTo(0, -size * 1.5); ctx.lineTo(size * .95, size * .52); ctx.lineTo(0, size * .82); ctx.lineTo(-size * .95, size * .52); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (ship.shape === 'dino') {
      drawDinoShipLocal(size, ship.color, ship.accent, performance.now());
      ctx.restore();
      return;
    }
    if (ship.shape === 'megumi') {
      if (umbraShipSprite.complete && umbraShipSprite.naturalWidth) {
        const spriteWidth = size * 3.6, spriteHeight = spriteWidth * umbraShipSprite.naturalHeight / umbraShipSprite.naturalWidth;
        ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = ship.accent; ctx.shadowBlur = 0;
        ctx.drawImage(umbraShipSprite, -spriteWidth / 2, -spriteHeight / 2 - size * .21, spriteWidth, spriteHeight);
        ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
      } else {
        ctx.globalAlpha = alpha; ctx.shadowColor = ship.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .55;
        ctx.fillStyle = '#211b30'; ctx.strokeStyle = ship.accent; ctx.lineWidth = Math.max(1.4, size * .09);
        ctx.beginPath(); ctx.moveTo(0, -size * 1.22); ctx.lineTo(size * .43, -size * .3); ctx.lineTo(size * 1.02, size * .44); ctx.lineTo(size * .34, size * .32); ctx.lineTo(0, size * .76); ctx.lineTo(-size * .34, size * .32); ctx.lineTo(-size * 1.02, size * .44); ctx.lineTo(-size * .43, -size * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.fillStyle = '#c7b5eb'; ctx.beginPath(); ctx.moveTo(0, -size * 1.02); ctx.lineTo(size * .19, -size * .28); ctx.lineTo(0, size * .12); ctx.lineTo(-size * .19, -size * .28); ctx.closePath(); ctx.fill();
      }
      drawShipThrusterTrails(size, performance.now(), '#a584f4', '#f6f0ff');
      ctx.restore();
      return;
    }
    if (ship.shape === 'flamestorm') {
      ctx.scale(1.12, 1.12);
      const dash = currentSkin().id === 'flamestorm' ? state.flameStormDash : null;
      if (dash?.life > 0) {
        const frameIndex = Math.floor((dash.total - dash.life) * 12) % flameStormDashFrames.length;
        const frame = flameStormDashFrames[frameIndex];
        if (frame.complete && frame.naturalWidth) {
          const imageHeight = size * 8.5;
          const imageWidth = imageHeight * frame.naturalWidth / frame.naturalHeight;
          ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha * .98; ctx.shadowBlur = 0;
          ctx.drawImage(frame, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
          ctx.restore();
          return;
        }
      }
      if (state.effects.some((effect) => effect.type === 'flamestorm-vortex' && effect.life > .42)) {
        ctx.restore();
        return;
      }
      const pulse = .88 + .12 * Math.sin(performance.now() / 64);
      ctx.globalCompositeOperation = 'screen';
      for (const side of [-1, 1]) {
        const flameLength = size * .78 * pulse;
        const flame = ctx.createLinearGradient(side * size * .42, size * 1.1, side * size * .42, size * 1.1 + flameLength);
        flame.addColorStop(0, 'rgba(255,197,122,.86)');
        flame.addColorStop(.2, 'rgba(255,103,42,.96)'); flame.addColorStop(.62, 'rgba(255,39,35,.78)'); flame.addColorStop(1, 'rgba(164,22,40,0)');
        ctx.fillStyle = flame; ctx.beginPath(); ctx.moveTo(side * size * .42 - size * .16, size * 1.1); ctx.quadraticCurveTo(side * size * .42 - size * .25, size * 1.1 + flameLength * .58, side * size * .42, size * 1.1 + flameLength); ctx.quadraticCurveTo(side * size * .42 + size * .25, size * 1.1 + flameLength * .58, side * size * .42 + size * .16, size * 1.1); ctx.closePath(); ctx.fill();
      }
      if (flameStormNormalSprite.complete && flameStormNormalSprite.naturalWidth) {
        const spriteWidth = size * 3.42, spriteHeight = spriteWidth * flameStormNormalSprite.naturalHeight / flameStormNormalSprite.naturalWidth;
        ctx.save(); ctx.rotate(Math.PI / 2); ctx.globalCompositeOperation = 'screen'; ctx.shadowBlur = 0;
        ctx.filter = 'saturate(1.38) brightness(1.2) contrast(1.12)';
        ctx.drawImage(flameStormNormalSprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
        ctx.restore();
      } else {
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#24151d'; ctx.strokeStyle = ship.accent; ctx.lineWidth = Math.max(1.5, size * .09);
        ctx.beginPath(); ctx.moveTo(0, -size * 1.55); ctx.lineTo(size * .82, size * .55); ctx.lineTo(0, size * .96); ctx.lineTo(-size * .82, size * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (ship.shape === 'mahoraga') {
      drawMahoragaShipLocal(size, ship.color, ship.accent, performance.now());
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
    if (ship.shape === 'training') {
      const thrusterPulse = .9 + .1 * Math.sin(performance.now() / 82);
      const ram = state.ferrumRam;
      const ferrumThrusters = [
        { x:-.16, length:1.24, width:.23 },
        { x:.16, length:1.24, width:.23 }
      ];
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowColor = '#cbd3dc';
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * .16;
      for (const nozzle of ferrumThrusters) {
        const x = nozzle.x * size;
        const startY = size * 1.48;
        const length = size * nozzle.length * thrusterPulse * (ram?.phase === 'dash' ? 2.6 : 1);
        const width = size * nozzle.width * (.94 + thrusterPulse * .06);
        const flame = ctx.createLinearGradient(x, startY, x, startY + length);
        flame.addColorStop(0, 'rgba(247,249,252,.68)');
        flame.addColorStop(.2, 'rgba(207,214,222,.54)');
        flame.addColorStop(.56, 'rgba(148,159,172,.3)');
        flame.addColorStop(1, 'rgba(112,124,139,0)');
        ctx.globalAlpha = alpha * (.46 + thrusterPulse * .1);
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(x - width * .42, startY);
        ctx.quadraticCurveTo(x - width * .52, startY + length * .4, x, startY + length);
        ctx.quadraticCurveTo(x + width * .52, startY + length * .4, x + width * .42, startY);
        ctx.closePath();
        ctx.fill();

        const coreLength = length * .7;
        const core = ctx.createLinearGradient(x, startY, x, startY + coreLength);
        core.addColorStop(0, 'rgba(255,255,255,.76)');
        core.addColorStop(.34, 'rgba(236,240,245,.48)');
        core.addColorStop(1, 'rgba(169,180,194,0)');
        ctx.globalAlpha = alpha * (.34 + thrusterPulse * .1);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.moveTo(x - width * .13, startY);
        ctx.quadraticCurveTo(x - width * .16, startY + coreLength * .42, x, startY + coreLength);
        ctx.quadraticCurveTo(x + width * .16, startY + coreLength * .42, x + width * .13, startY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      if (ram && ferrumArmoredSprite.complete && ferrumArmoredSprite.naturalWidth) {
        const slide = 1;
        const scaleX = size * 3.5 / 532, scaleY = size * 3.9 / 594;
        if (slide < 1 && ferrumShipSprite.complete && ferrumShipSprite.naturalWidth) {
          ctx.drawImage(ferrumShipSprite, 448, 212, 532, 594, -266 * scaleX, -297 * scaleY, 532 * scaleX, 594 * scaleY);
        }
        ctx.globalAlpha = alpha * slide;
        ctx.shadowBlur = 0;
        const gap = (1 - slide) ** 2 * size * .7;
        // The two images share the same engine anchor; keep the longer armored nose in frame.
        for (let half = 0; half < 2; half++) {
          const x = half * 266;
          ctx.drawImage(ferrumArmoredSprite, 448 + x, 170, 266, 636,
            (x - 266) * scaleX + (half ? gap : -gap), -339 * scaleY, 266 * scaleX, 636 * scaleY);
        }
      } else if (ferrumShipSprite.complete && ferrumShipSprite.naturalWidth) {
        ctx.shadowBlur = 0;
        ctx.drawImage(ferrumShipSprite, 448, 212, 532, 594, -size * 1.75, -size * 1.95, size * 3.5, size * 3.9);
      } else {
        ctx.fillStyle = '#aeb5c0'; ctx.strokeStyle = '#242932'; ctx.lineWidth = Math.max(1.5, size * .1);
        ctx.beginPath(); ctx.moveTo(0, -size * 1.58); ctx.lineTo(size * .42, -size * .62); ctx.lineTo(size * 1.22, size * .48); ctx.lineTo(size * .55, size * .33); ctx.lineTo(size * .34, size * .82); ctx.lineTo(0, size * .62); ctx.lineTo(-size * .34, size * .82); ctx.lineTo(-size * .55, size * .33); ctx.lineTo(-size * 1.22, size * .48); ctx.lineTo(-size * .42, -size * .62); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
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
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora') {
      // Reuses Aurora's player ship sprite, drawn at boss scale after restoring the enemy transform.
    } else if (enemy.kind === 'boss' && enemy.bossType === 'drone') {
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
    } else if (enemy.kind === 'boss' && enemy.bossType === 'storm') {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const r = enemy.r * (i % 2 ? .48 : 1.16); const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, enemy.r * .3, 0, Math.PI * 2); ctx.stroke();
    } else if (enemy.kind === 'boss' && enemy.bossType === 'mine') {
      ctx.beginPath(); ctx.rect(-enemy.r * .68, -enemy.r * .68, enemy.r * 1.36, enemy.r * 1.36); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff2d6'; ctx.beginPath(); ctx.arc(0, 0, enemy.r * .35, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff2d6'; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.arc(Math.cos(a) * enemy.r * .92, Math.sin(a) * enemy.r * .92, enemy.r * .1, 0, Math.PI * 2); ctx.fill(); }
    } else if (enemy.kind === 'boss' && enemy.bossType === 'lancer') {
      ctx.beginPath(); ctx.moveTo(0, -enemy.r * 1.55); ctx.lineTo(enemy.r * .42, -enemy.r * .18); ctx.lineTo(enemy.r * .2, enemy.r * 1.15); ctx.lineTo(0, enemy.r * .78); ctx.lineTo(-enemy.r * .2, enemy.r * 1.15); ctx.lineTo(-enemy.r * .42, -enemy.r * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff7c8'; ctx.beginPath(); ctx.moveTo(0, -enemy.r); ctx.lineTo(0, enemy.r * .8); ctx.stroke();
    } else if (enemy.kind === 'boss' && enemy.bossType === 'mirror') {
      ctx.beginPath(); ctx.moveTo(0, -enemy.r * 1.15); ctx.lineTo(enemy.r * .84, 0); ctx.lineTo(0, enemy.r * 1.15); ctx.lineTo(-enemy.r * .84, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff4ff'; ctx.beginPath(); ctx.moveTo(-enemy.r * .55, -enemy.r * .55); ctx.lineTo(enemy.r * .55, enemy.r * .55); ctx.moveTo(enemy.r * .55, -enemy.r * .55); ctx.lineTo(-enemy.r * .55, enemy.r * .55); ctx.stroke();
    } else if (enemy.kind === 'boss' && enemy.bossType === 'rift') {
      ctx.beginPath(); ctx.arc(0, 0, enemy.r * .82, -.35, Math.PI * 1.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, enemy.r * .48, Math.PI * .62, Math.PI * 2.48); ctx.stroke();
      ctx.fillStyle = '#fff1fb'; ctx.beginPath(); ctx.arc(0, 0, enemy.r * .2, 0, Math.PI * 2); ctx.fill();
    } else if (enemy.kind === 'boss') {
      ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const r = enemy.r * (i % 2 ? .87 : 1.2); const px = Math.cos(a) * r; const py = Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff3f7'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = enemy.color; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(0, -enemy.r * 1.15); ctx.lineTo(enemy.r, enemy.r * .85); ctx.lineTo(0, enemy.r * .46); ctx.lineTo(-enemy.r, enemy.r * .85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(-3, -2, 6, 4);
    }
    ctx.restore();
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora') {
      const auroraSkin = skins.find((skin) => skin.id === 'aurora');
      drawShip(enemy.x, enemy.y, enemy.r * 1.12, auroraSkin, enemy.angle, 1);
    }
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora' && enemy.auroraEWarning > 0) {
      const radius = mobileSize(auroraBossDefaults.eRadius);
      const warning = clamp(enemy.auroraEWarning / .92, 0, 1);
      const pulse = .62 + Math.sin(performance.now() / 55) * .2;
      ctx.save(); ctx.globalAlpha = (.34 + (1 - warning) * .46) * pulse;
      ctx.strokeStyle = '#bafff5'; ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
      ctx.lineWidth = mobileSize(2.6 + (1 - warning) * 1.8); ctx.setLineDash([mobileSize(10), mobileSize(8)]);
      ctx.lineDashOffset = -performance.now() / 25;
      ctx.beginPath(); ctx.arc(enemy.auroraEWarningX, enemy.auroraEWarningY, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha *= .72; ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(1.2);
      ctx.beginPath(); ctx.arc(enemy.auroraEWarningX, enemy.auroraEWarningY, radius * .94, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora' && enemy.auroraQWarning > 0) {
      const radius = enemy.auroraQWarningRadius || mobileSize(72);
      const warning = clamp(enemy.auroraQWarning / (enemy.auroraQWarningTotal || .72), 0, 1);
      const pulse = .68 + Math.sin(performance.now() / 48) * .24;
      ctx.save(); ctx.globalAlpha = (.42 + (1 - warning) * .48) * pulse;
      ctx.fillStyle = 'rgba(125,247,232,.08)'; ctx.beginPath(); ctx.arc(enemy.auroraQTargetX, enemy.auroraQTargetY, radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#eafffb'; ctx.shadowColor = '#7df7e8'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
      ctx.lineWidth = mobileSize(2.6); ctx.setLineDash([mobileSize(6), mobileSize(4)]); ctx.lineDashOffset = -performance.now() / 18;
      ctx.beginPath(); ctx.arc(enemy.auroraQTargetX, enemy.auroraQTargetY, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(1.5);
      ctx.beginPath(); ctx.moveTo(enemy.auroraQTargetX - radius * .42, enemy.auroraQTargetY); ctx.lineTo(enemy.auroraQTargetX + radius * .42, enemy.auroraQTargetY);
      ctx.moveTo(enemy.auroraQTargetX, enemy.auroraQTargetY - radius * .42); ctx.lineTo(enemy.auroraQTargetX, enemy.auroraQTargetY + radius * .42); ctx.stroke();
      ctx.fillStyle = '#eafffb'; ctx.font = '800 ' + mobileSize(10) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('ELO ' + (enemy.auroraQAttempt || 1) + '/' + (enemy.auroraQSequenceTotal || 1), enemy.auroraQTargetX, enemy.auroraQTargetY - radius - mobileSize(6));
      ctx.restore();
    }
    if (enemy.kind === 'boss' && enemy.bossType === 'aurora' && (enemy.auroraUltWarning > 0 || enemy.auroraUltActive > 0)) {
      const centerX = enemy.auroraUltTargetX, centerY = enemy.auroraUltTargetY;
      const radius = enemy.auroraUltRadius || mobileSize(150);
      const warning = enemy.auroraUltWarning > 0 ? clamp(enemy.auroraUltWarning / (enemy.auroraUltWarningTotal || 1), 0, 1) : 0;
      const activeRatio = enemy.auroraUltActive > 0 ? clamp(enemy.auroraUltActive / (enemy.auroraUltActiveTotal || 1), 0, 1) : 0;
      const pulse = .78 + Math.sin(performance.now() / 58) * .18;
      ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = enemy.auroraUltWarning > 0 ? (.38 + (1 - warning) * .48) * pulse : (.35 + activeRatio * .18) * pulse;
      ctx.fillStyle = 'rgba(152,116,255,.09)'; ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d6c2ff'; ctx.shadowColor = '#b38bff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(17);
      ctx.lineWidth = mobileSize(enemy.auroraUltWarning > 0 ? 3.4 : 2.2); ctx.setLineDash(enemy.auroraUltWarning > 0 ? [mobileSize(8), mobileSize(5)] : [mobileSize(4), mobileSize(7)]);
      ctx.lineDashOffset = -performance.now() / 17; ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      if (enemy.auroraUltActive > 0) {
        const rotation = performance.now() / 700;
        let previous = null;
        for (let star = 0; star < 6; star++) {
          const angle = rotation + star * Math.PI / 3;
          const orbitRadius = radius * (.7 + Math.sin(performance.now() / 190 + star) * .025);
          const x = centerX + Math.cos(angle) * orbitRadius, y = centerY + Math.sin(angle) * orbitRadius;
          ctx.globalAlpha = .72; ctx.strokeStyle = star % 2 ? '#c2a6ff' : '#a8f9ff'; ctx.lineWidth = mobileSize(1.25);
          ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(x, y); if (previous) { ctx.moveTo(previous.x, previous.y); ctx.lineTo(x, y); } ctx.stroke();
          ctx.fillStyle = '#f5fbff'; ctx.shadowColor = star % 2 ? '#c2a6ff' : '#7df7e8'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
          ctx.beginPath(); ctx.arc(x, y, mobileSize(4.3), 0, Math.PI * 2); ctx.fill(); previous = { x, y };
        }
        if (previous) { const firstAngle = rotation; const first = { x:centerX + Math.cos(firstAngle) * radius * .7, y:centerY + Math.sin(firstAngle) * radius * .7 }; ctx.beginPath(); ctx.moveTo(previous.x, previous.y); ctx.lineTo(first.x, first.y); ctx.stroke(); }
      } else {
        ctx.globalAlpha = .85; ctx.strokeStyle = '#f0e9ff'; ctx.lineWidth = mobileSize(2);
        const cross = radius * .22; ctx.beginPath(); ctx.moveTo(centerX - cross, centerY); ctx.lineTo(centerX + cross, centerY); ctx.moveTo(centerX, centerY - cross); ctx.lineTo(centerX, centerY + cross); ctx.stroke();
      }
      ctx.restore();
    }
    if ((enemy.kind === 'hunter' || (enemy.kind === 'boss' && enemy.bossType === 'hunter')) && enemy.hunterFuse > 0) {
      const bossFuse = enemy.kind === 'boss';
      const fuse = clamp(enemy.hunterFuse / (enemy.hunterFuseTotal || (bossFuse ? 1.15 : .72)), 0, 1);
      const pulse = .76 + Math.sin(performance.now() / (64 * fuse + 18)) * .2;
      ctx.save(); ctx.globalAlpha = (.48 + (1 - fuse) * .42) * pulse;
      ctx.strokeStyle = bossFuse ? (fuse < .35 ? '#fff4ff' : '#d7a0ff') : (fuse < .35 ? '#fff1b2' : '#ff7455');
      ctx.shadowColor = bossFuse ? '#bd70ff' : '#ff392f';
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
      ctx.lineWidth = mobileSize(2.2 + (1 - fuse) * 1.8);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(8 + (1 - fuse) * 9), -performance.now() / 180, Math.PI * 1.72 - performance.now() / 180); ctx.stroke();
      if (bossFuse) {
        ctx.globalAlpha *= .7; ctx.strokeStyle = '#d7a0ff'; ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(1.5);
        ctx.setLineDash([mobileSize(7), mobileSize(6)]);
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, mobileSize(250), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = bossFuse ? '#f0d4ff' : '#ffd27a'; ctx.shadowBlur = 0;
      for (let spark = 0; spark < 3; spark++) {
        const angle = performance.now() / 150 + spark * Math.PI * 2 / 3;
        ctx.beginPath(); ctx.arc(enemy.x + Math.cos(angle) * (enemy.r + mobileSize(12)), enemy.y + Math.sin(angle) * (enemy.r + mobileSize(12)), mobileSize(1.8 + (1 - fuse)), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    if (enemy.kind === 'boss' && !enemy.isMiniBoss && enemy.phase >= 4) {
      ctx.save();
      ctx.globalAlpha = .58 + Math.sin(performance.now() / 110) * .16;
      ctx.strokeStyle = enemy.color; ctx.shadowColor = enemy.color;
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 16;
      ctx.lineWidth = mobileSize(2.4);
      ctx.setLineDash([mobileSize(7), mobileSize(4)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(12) + Math.sin(performance.now() / 180) * mobileSize(3), performance.now() / 500, performance.now() / 500 + Math.PI * 1.72); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (enemy.dinoCutMark > 0) {
      ctx.save(); ctx.globalAlpha = clamp(enemy.dinoCutMark / .8, .3, .82);
      ctx.strokeStyle = '#ffad45'; ctx.shadowColor = '#e76220'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 8;
      ctx.lineWidth = mobileSize(1.4); ctx.setLineDash([mobileSize(3), mobileSize(6)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(5), performance.now() / 500, performance.now() / 500 + Math.PI * 1.55); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (enemy.mahoragaMarkTime > 0) {
      ctx.save(); ctx.globalAlpha = clamp(enemy.mahoragaMarkTime / 1.2, .42, .92);
      ctx.strokeStyle = '#a6ff8f'; ctx.fillStyle = '#c7ffb8'; ctx.shadowColor = '#72fb65';
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 9; ctx.lineWidth = mobileSize(1.7);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(6), -performance.now() / 650, Math.PI * 1.55 - performance.now() / 650); ctx.stroke();
      ctx.translate(enemy.x, enemy.y - enemy.r - mobileSize(7)); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-mobileSize(2.3), -mobileSize(2.3), mobileSize(4.6), mobileSize(4.6));
      ctx.restore();
    }
    if (enemy.dinoStun > 0) {
      ctx.save(); ctx.globalAlpha = .58 + Math.sin(performance.now() / 65 + enemy.x) * .16;
      ctx.strokeStyle = '#ffd17a'; ctx.shadowColor = '#ee7626'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 10;
      ctx.lineWidth = mobileSize(1.5); ctx.setLineDash([mobileSize(4), mobileSize(4)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(8), 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#ffc15a';
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
  function drawAuroraUltimate(timestamp) {
    const ultimate = state.auroraUlt;
    if (!ultimate || ultimate.life <= 0) return;
    const pulse = .78 + Math.sin(timestamp / 115) * .16;
    ctx.save();
    ctx.lineCap = 'round';
    const starPoints = ultimate.stars.map((star) => auroraUltimateStarPosition(ultimate, star.index));
    const center = { x:state.player.x, y:state.player.y };
    // Each moving star is connected to its neighbors, making one continuous
    // constellation instead of six separate effects.
    for (let index = 0; index < starPoints.length; index++) {
      const from = starPoints[index], to = starPoints[(index + 1) % starPoints.length];
      ctx.globalAlpha = .3 + Math.sin(timestamp / 210 + index) * .07;
      ctx.strokeStyle = index % 2 ? '#bd9cff' : '#61edff';
      ctx.lineWidth = mobileSize(1.45);
      ctx.setLineDash([mobileSize(5), mobileSize(8)]);
      ctx.lineDashOffset = -timestamp / 30 - index * 2;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      const flow = (timestamp / 1250 + index * .19) % 1;
      ctx.globalAlpha = .7;
      ctx.fillStyle = '#f4ffff';
      ctx.beginPath(); ctx.arc(from.x + (to.x - from.x) * flow, from.y + (to.y - from.y) * flow, mobileSize(1.55), 0, Math.PI * 2); ctx.fill();
    }
    // Six fine tethers converge at Aurora's center so the constellation reads
    // as one spell anchored to the ship.
    starPoints.forEach((point, index) => {
      ctx.globalAlpha = .27 + Math.sin(timestamp / 190 + index * .8) * .06;
      ctx.strokeStyle = index % 2 ? '#c2a6ff' : '#7df7e8';
      ctx.lineWidth = mobileSize(1.15);
      ctx.setLineDash([mobileSize(4), mobileSize(8)]);
      ctx.lineDashOffset = timestamp / 34 + index;
      ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = .7 + Math.sin(timestamp / 100) * .13;
    ctx.strokeStyle = '#bffcff';
    ctx.lineWidth = mobileSize(1.35);
    ctx.shadowColor = '#7df7e8';
    ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(11);
    ctx.beginPath(); ctx.arc(center.x, center.y, mobileSize(8 + Math.sin(timestamp / 120) * 1.4), 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f2ffff';
    ctx.beginPath(); ctx.arc(center.x, center.y, mobileSize(2.4), 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    const network = ultimate.constellationTargets.filter((enemy) => enemy && !enemy.dead && enemy.hp > 0);
    network.forEach((enemy, index) => {
      let anchor = 0, nearestDistance = Infinity;
      for (let starIndex = 0; starIndex < starPoints.length; starIndex++) {
        const dxToStar = enemy.x - starPoints[starIndex].x, dyToStar = enemy.y - starPoints[starIndex].y;
        const candidateDistance = dxToStar * dxToStar + dyToStar * dyToStar;
        if (candidateDistance < nearestDistance) { nearestDistance = candidateDistance; anchor = starIndex; }
      }
      const source = starPoints[anchor];
      const dx = enemy.x - source.x, dy = enemy.y - source.y;
      const length = Math.hypot(dx, dy) || 1;
      const bend = Math.sin(timestamp / 310 + index * .73) * Math.min(mobileSize(27), length * .045);
      const cx = (source.x + enemy.x) / 2 - dy / length * bend;
      const cy = (source.y + enemy.y) / 2 + dx / length * bend;
      ctx.globalAlpha = .46 + Math.sin(timestamp / 170 + index) * .08;
      ctx.strokeStyle = anchor % 2 ? '#b994ff' : '#63e8ff';
      ctx.lineWidth = mobileSize(1.4);
      ctx.setLineDash([mobileSize(5), mobileSize(8)]);
      ctx.lineDashOffset = -timestamp / 24 - index * 2;
      ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.quadraticCurveTo(cx, cy, enemy.x, enemy.y); ctx.stroke();
      const mote = (timestamp / 760 + index * .173) % 1, inverse = 1 - mote;
      const moteX = inverse * inverse * source.x + 2 * inverse * mote * cx + mote * mote * enemy.x;
      const moteY = inverse * inverse * source.y + 2 * inverse * mote * cy + mote * mote * enemy.y;
      ctx.globalAlpha = .58 + Math.sin(timestamp / 90 + index) * .18;
      ctx.fillStyle = '#f3fdff';
      ctx.beginPath(); ctx.arc(moteX, moteY, mobileSize(1.8), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .45 + Math.sin(timestamp / 140 + index) * .12;
      ctx.strokeStyle = anchor % 2 ? '#eadbff' : '#c6faff';
      ctx.lineWidth = mobileSize(1.1);
      ctx.setLineDash([mobileSize(2), mobileSize(4)]);
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(5), timestamp / 620 + index, timestamp / 620 + index + Math.PI * 1.15); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = .68 + Math.sin(timestamp / 125 + index) * .12;
      ctx.fillStyle = '#f7ffff';
      if (state.performanceMode !== 'light') { ctx.shadowColor = anchor % 2 ? '#c2a6ff' : '#7df7e8'; ctx.shadowBlur = mobileSize(8); }
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, mobileSize(2.3), 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    const marks = ultimate.markedTargets.filter((entry) => entry.enemy && !entry.enemy.dead && entry.expiresAt > state.elapsed);
    let previous = { x:state.player.x, y:state.player.y };
    marks.forEach((entry, index) => {
      const enemy = entry.enemy;
      const markLife = clamp((entry.expiresAt - state.elapsed) / 3.6, 0, 1);
      const bend = Math.sin(timestamp / 360 + index) * Math.min(mobileSize(24), distance(previous, enemy) * .09);
      const dx = enemy.x - previous.x, dy = enemy.y - previous.y, length = Math.hypot(dx, dy) || 1;
      const cx = (previous.x + enemy.x) / 2 - dy / length * bend;
      const cy = (previous.y + enemy.y) / 2 + dx / length * bend;
      ctx.globalAlpha = .24 * markLife;
      ctx.strokeStyle = index % 2 ? '#c2a6ff' : '#7df7e8';
      ctx.lineWidth = mobileSize(1.1);
      ctx.setLineDash([mobileSize(3), mobileSize(6)]);
      ctx.beginPath(); ctx.moveTo(previous.x, previous.y); ctx.quadraticCurveTo(cx, cy, enemy.x, enemy.y); ctx.stroke();
      ctx.globalAlpha = .68 * markLife;
      ctx.setLineDash([mobileSize(2), mobileSize(4)]);
      ctx.lineDashOffset = -timestamp / 31;
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(8), timestamp / 900 + index, timestamp / 900 + index + Math.PI * 1.55); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f5fbff';
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, mobileSize(2.1), 0, Math.PI * 2); ctx.fill();
      previous = enemy;
    });
    ultimate.stars.forEach((star) => {
      const point = auroraUltimateStarPosition(ultimate, star.index);
      const faded = star.fired ? .2 : 1;
      const radius = mobileSize((star.fired ? 2.4 : 4.1) + Math.sin(timestamp / 95 + star.index) * .65);
      ctx.globalAlpha = pulse * faded;
      if (state.performanceMode !== 'light') { ctx.shadowColor = star.index % 2 ? '#c2a6ff' : '#7df7e8'; ctx.shadowBlur = mobileSize(star.fired ? 3 : 12); }
      ctx.fillStyle = star.index % 2 ? '#e6d7ff' : '#efffff';
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - radius * 1.75);
      ctx.lineTo(point.x + radius * .34, point.y - radius * .34);
      ctx.lineTo(point.x + radius * 1.55, point.y);
      ctx.lineTo(point.x + radius * .34, point.y + radius * .34);
      ctx.lineTo(point.x, point.y + radius * 1.75);
      ctx.lineTo(point.x - radius * .34, point.y + radius * .34);
      ctx.lineTo(point.x - radius * 1.55, point.y);
      ctx.lineTo(point.x - radius * .34, point.y - radius * .34);
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }
  function drawMahoragaWheel(x, y, radius, rotation, alpha, filledSegments = 0, ready = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(231,211,166,.84)';
    ctx.lineWidth = Math.max(1, radius * .055);
    ctx.shadowColor = '#e4c477';
    ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(7);
    ctx.beginPath(); ctx.arc(0, 0, radius * .78, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(184,155,98,.82)';
    ctx.lineWidth = Math.max(.8, radius * .035);
    ctx.beginPath(); ctx.arc(0, 0, radius * .48, 0, Math.PI * 2); ctx.stroke();
    for (let spoke = 0; spoke < 8; spoke++) {
      const angle = spoke * Math.PI / 4;
      const nodeX = Math.cos(angle) * radius * .91;
      const nodeY = Math.sin(angle) * radius * .91;
      const filled = spoke < filledSegments;
      ctx.strokeStyle = filled ? '#f5df9b' : 'rgba(127,132,133,.7)';
      ctx.lineWidth = Math.max(.9, radius * .045);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(nodeX, nodeY); ctx.stroke();
      ctx.fillStyle = filled ? (ready ? '#b9f5aa' : '#e4c477') : '#343b3b'; ctx.strokeStyle = filled ? '#fff4d8' : 'rgba(205,211,205,.7)';
      ctx.lineWidth = Math.max(.7, radius * .035);
      ctx.beginPath(); ctx.arc(nodeX, nodeY, radius * .105, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = ready ? '#31402f' : '#293139'; ctx.strokeStyle = ready ? '#caffb4' : '#f0dfbc';
    ctx.lineWidth = Math.max(1, radius * .055);
    ctx.beginPath(); ctx.arc(0, 0, radius * .18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e4c477'; ctx.strokeStyle = '#fff4d8';
    ctx.lineWidth = Math.max(.6, radius * .025);
    ctx.beginPath(); ctx.arc(0, 0, radius * .085, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawEclipseParadoxField(timestamp) {
    const field = state.eclipseParadox;
    if (!field) return;
    const intro = clamp(field.age / .42, 0, 1);
    const collapse = clamp(field.life / .7, 0, 1);
    const radius = field.radius * (.12 + .88 * (1 - Math.pow(1 - intro, 3))) * (.22 + .78 * collapse);
    const lightMode = state.performanceMode === 'light';
    const rotation = timestamp / 1150;
    ctx.save();
    ctx.globalAlpha = .72 * clamp(field.life / .45, .18, 1);
    const haze = ctx.createRadialGradient(field.x, field.y, radius * .06, field.x, field.y, Math.max(1, radius));
    haze.addColorStop(0, 'rgba(25,12,45,.22)');
    haze.addColorStop(.52, 'rgba(62,28,103,.19)');
    haze.addColorStop(.84, 'rgba(119,77,180,.12)');
    haze.addColorStop(1, 'rgba(122,85,176,0)');
    ctx.fillStyle = haze;
    ctx.beginPath(); ctx.arc(field.x, field.y, radius, 0, Math.PI * 2); ctx.fill();
    if (!lightMode) { ctx.shadowColor = '#b58aff'; ctx.shadowBlur = mobileSize(18); }
    ctx.strokeStyle = 'rgba(207,176,255,.72)'; ctx.lineWidth = mobileSize(1.8);
    ctx.setLineDash([mobileSize(7), mobileSize(5)]); ctx.lineDashOffset = -rotation * 19;
    ctx.beginPath(); ctx.arc(field.x, field.y, radius * .96, rotation, rotation + Math.PI * 1.94); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(236,222,255,.36)'; ctx.lineWidth = mobileSize(1);
    ctx.beginPath(); ctx.ellipse(field.x, field.y, radius * .73, radius * .73, -rotation * .62, 0, Math.PI * 2); ctx.stroke();
    const spokes = lightMode ? 6 : 12;
    ctx.lineWidth = mobileSize(1.1);
    for (let index = 0; index < spokes; index++) {
      const angle = rotation + index * Math.PI * 2 / spokes;
      const inner = radius * (.32 + (index % 2) * .08);
      ctx.globalAlpha = .2 + .16 * Math.sin(timestamp / 180 + index);
      ctx.strokeStyle = index % 3 === 0 ? '#fff4ff' : '#c8a8ff';
      ctx.beginPath();
      ctx.moveTo(field.x + Math.cos(angle) * inner, field.y + Math.sin(angle) * inner);
      ctx.lineTo(field.x + Math.cos(angle + .08 * Math.sin(timestamp / 240 + index)) * radius * .92, field.y + Math.sin(angle + .08 * Math.sin(timestamp / 240 + index)) * radius * .92);
      ctx.stroke();
    }
    ctx.globalAlpha = .8; ctx.strokeStyle = 'rgba(243,230,255,.62)'; ctx.lineWidth = mobileSize(1.4);
    ctx.setLineDash([mobileSize(2), mobileSize(7)]); ctx.lineDashOffset = rotation * 26;
    ctx.beginPath(); ctx.arc(field.x, field.y, radius * .48, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function draw(timestamp) {
    ctx.clearRect(0, 0, state.width, state.height);
    const zone = currentZone();
    const bg = ctx.createLinearGradient(0, 0, state.width, state.height); bg.addColorStop(0, zone.colors[0]); bg.addColorStop(1, zone.colors[1]); ctx.fillStyle = bg; ctx.fillRect(0, 0, state.width, state.height);
    for (const star of state.stars) { star.y += star.z * .13; if (star.y > state.height) { star.y = 0; star.x = visualRandom(0, state.width); } const twinkle = state.performanceMode === 'light' ? .72 : .45 + .45 * Math.sin(timestamp / 600 + star.phase); ctx.fillStyle = `rgba(${zone.stars},${twinkle * star.z})`; ctx.fillRect(star.x, star.y, star.z * 1.5, star.z * 1.5); }
    ctx.strokeStyle = 'rgba(129,160,255,.045)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(state.width / 2, 0); ctx.lineTo(state.width / 2, state.height); ctx.moveTo(0, state.height / 2); ctx.lineTo(state.width, state.height / 2); ctx.stroke();
    drawEclipseParadoxField(timestamp);
    for (const pickup of state.pickups) {
      if (pickup.kind === 'vulture-scrap') {
        const sprite = vultureScrapSprites[pickup.scrapType];
        ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(pickup.spin * .35);
        ctx.shadowColor = '#ff813e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
        if (sprite?.complete && sprite.naturalWidth) { const size = mobileSize(30); ctx.drawImage(sprite, -size / 2, -size / 2, size, size); }
        else { ctx.fillStyle = '#ff813e'; ctx.beginPath(); ctx.arc(0, 0, pickup.r * .72, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      } else {
        const color = pickup.kind === 'repair' ? '#72ffad' : pickup.kind === 'charge' ? '#ffe38a' : '#75bdff'; ctx.save(); ctx.translate(pickup.x, pickup.y); ctx.rotate(pickup.spin); ctx.shadowColor = color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(16); ctx.strokeStyle = color; ctx.lineWidth = mobileSize(2); ctx.beginPath(); ctx.moveTo(0, -pickup.r); ctx.lineTo(pickup.r, 0); ctx.lineTo(0, pickup.r); ctx.lineTo(-pickup.r, 0); ctx.closePath(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.font = 'bold ' + mobileSize(12) + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pickup.kind === 'repair' ? '+' : pickup.kind === 'charge' ? '◷' : '⬡', 0, 0); ctx.restore();
      }
    }
    for (const b of state.bullets) {
      if (b.vultureEnergyShot) {
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(angle);
        const trail = ctx.createLinearGradient(-b.r * 4.2, 0, b.r * .4, 0);
        trail.addColorStop(0, 'rgba(255,83,35,0)'); trail.addColorStop(.64, 'rgba(255,123,45,.5)'); trail.addColorStop(1, 'rgba(255,225,133,.95)');
        ctx.strokeStyle = trail; ctx.lineWidth = Math.max(2, b.r * .88); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-b.r * 4.2, 0); ctx.lineTo(0, 0); ctx.stroke();
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r * 1.9);
        glow.addColorStop(0, '#fffbd8'); glow.addColorStop(.32, b.color); glow.addColorStop(1, 'rgba(255,110,36,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, b.r * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff9d4'; ctx.beginPath(); ctx.ellipse(0, 0, b.r * .8, b.r * .52, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        continue;
      }
      if (b.chronosEchoShot || b.aegisSentinelShot || b.megumiShadowShot || b.megumiRabbitShot) { ctx.strokeStyle = b.megumiShadowShot || b.megumiRabbitShot ? 'rgba(192,168,231,.7)' : b.aegisSentinelShot ? 'rgba(168,229,255,.82)' : 'rgba(214,196,255,.76)'; ctx.lineWidth = Math.max(1, b.r * .7); ctx.beginPath(); ctx.moveTo(b.x - b.vx * .035, b.y - b.vy * .035); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 12; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    const flameStormVortexVisual = currentSkin().id === 'flamestorm'
      ? state.effects.find((effect) => effect.type === 'flamestorm-vortex' && effect.life > 0)
      : null;
    for (const b of state.enemyBullets) {
      const swept = b.tempestTideSweep?.time > 0;
      let visualX = b.x; let visualY = b.y;
      if (flameStormVortexVisual && (b.flameStormVortexPull || 0) > 0) {
        const dx = b.x - flameStormVortexVisual.x; const dy = b.y - flameStormVortexVisual.y;
        const bulletDistance = Math.hypot(dx, dy);
        if (bulletDistance <= flameStormVortexVisual.radius + b.r) {
          const progress = clamp((b.flameStormVortexPull || 0) / .52, 0, 1);
          const sourceAngle = Math.atan2(dy, dx);
          const spiralAngle = sourceAngle + progress * 3.4 + Math.sin(timestamp / 115 + b.x * .013) * .12;
          const pullStrength = .2 + progress * .8;
          const visualRadius = Math.max(mobileSize(4), bulletDistance * (1 - pullStrength * .86));
          visualX = flameStormVortexVisual.x + Math.cos(spiralAngle) * visualRadius;
          visualY = flameStormVortexVisual.y + Math.sin(spiralAngle) * visualRadius;
          ctx.save(); ctx.globalAlpha = (.28 - progress * .1) * clamp(flameStormVortexVisual.life / .4, 0, 1);
          ctx.strokeStyle = swept ? 'rgba(197,236,255,.58)' : 'rgba(255,74,85,.62)';
          ctx.lineWidth = Math.max(1, b.r * .42); ctx.shadowColor = swept ? '#8ddfff' : '#ff3049';
          ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(5);
          ctx.beginPath(); ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(flameStormVortexVisual.x + Math.cos(spiralAngle - .28) * visualRadius * 1.45, flameStormVortexVisual.y + Math.sin(spiralAngle - .28) * visualRadius * 1.45, visualX, visualY);
          ctx.stroke(); ctx.restore();
        }
      }
      ctx.fillStyle = swept ? '#e7eeff' : b.color; ctx.shadowColor = swept || b.tempestTideTargeted ? '#87aaff' : b.color;
      ctx.shadowBlur = state.performanceMode === 'light' ? 0 : swept || b.tempestTideTargeted ? 12 : 10;
      if (b.tempestTideTargeted) { ctx.strokeStyle = '#d9faff'; ctx.lineWidth = Math.max(1, b.r * .55); ctx.beginPath(); ctx.moveTo(visualX - b.vx * .035, visualY - b.vy * .035); ctx.lineTo(visualX, visualY); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(visualX, visualY, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const enemy of state.enemies) drawEnemy(enemy);
    for (const enemy of state.enemies) {
      if (enemy.dead || !(enemy.eclipseParadoxMarked > 0)) continue;
      const mark = clamp(enemy.eclipseParadoxMarked, .1, 1);
      ctx.save(); ctx.globalAlpha = .3 + mark * .58; ctx.strokeStyle = '#d8bbff'; ctx.lineWidth = mobileSize(1.4 + mark); ctx.shadowColor = '#b58aff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(10);
      ctx.setLineDash([mobileSize(3), mobileSize(4)]); ctx.lineDashOffset = -timestamp / 35;
      ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.r + mobileSize(7 + mark * 5), timestamp / 900, timestamp / 900 + Math.PI * (1 + mark)); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    }
    const megumiSkin = skins.find((skin) => skin.id === 'megumi');
    for (const rabbit of state.megumiRabbits) {
      const fade = clamp(rabbit.life / .55, 0, 1); const pulse = .78 + Math.sin(timestamp / 95 + rabbit.index) * .16;
      ctx.save(); ctx.globalAlpha = fade * .48 * pulse; ctx.strokeStyle = '#c5afe9'; ctx.lineWidth = mobileSize(1.5); ctx.setLineDash([mobileSize(3), mobileSize(4)]); ctx.beginPath(); ctx.arc(rabbit.x, rabbit.y, state.player.radius * .92 + mobileSize(7), -timestamp / 240 + rabbit.index, Math.PI * 2 - timestamp / 240 + rabbit.index); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      drawShip(rabbit.x, rabbit.y, state.player.radius * (.72 + (rabbit.index === 0 ? .16 : 0)), megumiSkin, rabbit.angle, fade * (rabbit.index === 0 ? .96 : .68));
    }
    drawSaurionSummon(timestamp);
    for (const p of state.particles) { ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    drawAuroraLinkTrails(timestamp);
    drawAuroraUltimate(timestamp);
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
      if (effect.type === 'ferrum-transformation') {
        const progress = 1 - alpha;
        const x = effect.followPlayer ? state.player.x : effect.x;
        const y = effect.followPlayer ? state.player.y : effect.y;
        const size = mobileSize(state.player.radius);
        const radius = size * (1.7 + progress * 6.4);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(progress * .72);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * (.62 + Math.sin(timestamp / 45) * .12);
        const core = ctx.createRadialGradient(0, 0, size * .2, 0, 0, radius);
        core.addColorStop(0, 'rgba(255,255,255,.72)');
        core.addColorStop(.18, 'rgba(224,237,252,.38)');
        core.addColorStop(.55, 'rgba(159,183,213,.12)');
        core.addColorStop(1, 'rgba(159,183,213,0)');
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = '#e5f1ff';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * 1.4;
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = size * (1.65 + progress * (3.1 + ring * 1.05));
          ctx.globalAlpha = alpha * (.88 - ring * .16);
          ctx.strokeStyle = ring === 1 ? '#ffffff' : ring === 2 ? '#a8b8cc' : '#e4edf8';
          ctx.lineWidth = mobileSize(ring === 0 ? 2.8 : 1.5);
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, timestamp / (ring === 1 ? -360 : 290) + ring, timestamp / (ring === 1 ? -360 : 290) + ring + Math.PI * (ring === 1 ? 1.55 : 1.76));
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        for (let plate = 0; plate < 4; plate++) {
          ctx.save();
          ctx.rotate(plate * Math.PI / 2);
          const slide = size * (4.5 * (1 - progress) + 1.12);
          ctx.translate(slide, 0);
          ctx.globalAlpha = alpha * (.78 + progress * .22);
          ctx.fillStyle = 'rgba(196,211,231,.4)';
          ctx.strokeStyle = plate % 2 ? '#f8fbff' : '#aab8ca';
          ctx.lineWidth = mobileSize(1.6);
          ctx.beginPath();
          ctx.moveTo(size * .08, -size * .92);
          ctx.lineTo(size * 1.42, -size * .46);
          ctx.lineTo(size * 1.68, 0);
          ctx.lineTo(size * 1.42, size * .46);
          ctx.lineTo(size * .08, size * .92);
          ctx.lineTo(-size * .24, size * .48);
          ctx.lineTo(-size * .24, -size * .48);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.restore();
        }
        ctx.globalAlpha = alpha * Math.max(0, 1 - progress * 1.7);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#eef6ff';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : size * 2.2;
        ctx.beginPath(); ctx.arc(0, 0, size * (.72 + progress * .4), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'ferrum-countershock-guard') {
        const x = effect.followPlayer ? state.player.x : effect.x;
        const y = effect.followPlayer ? state.player.y : effect.y;
        const size = mobileSize(state.player.radius);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(state.player.angle);
        ctx.globalAlpha = alpha * (.78 + Math.sin(timestamp / 52) * .12);
        ctx.shadowColor = '#dceaff';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(17);
        ctx.fillStyle = 'rgba(204,222,244,.18)';
        ctx.strokeStyle = '#f1f7ff';
        ctx.lineWidth = mobileSize(2.6);
        ctx.beginPath();
        ctx.moveTo(size * .48, -size * 1.28);
        ctx.arc(size * .48, 0, size * 1.28, -1.18, 1.18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,.82)';
        ctx.lineWidth = mobileSize(1.1);
        ctx.beginPath();
        ctx.moveTo(size * .58, -size * .91);
        ctx.lineTo(size * 1.13, 0);
        ctx.lineTo(size * .58, size * .91);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'ferrum-countershock-wave') {
        const progress = 1 - alpha;
        const radius = mobileSize(18 + effect.radius * progress);
        ctx.save();
        ctx.globalAlpha = alpha * .9;
        ctx.strokeStyle = '#e6effb';
        ctx.lineWidth = mobileSize(4 * alpha + 1);
        ctx.shadowColor = '#c6d9f3';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(20);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(246,250,255,.72)';
        ctx.lineWidth = mobileSize(1.5);
        for (let ray = 0; ray < 8; ray++) {
          const angle = ray * Math.PI / 4 + progress * .22;
          const inner = radius * .83;
          const outer = radius + mobileSize(13 * alpha);
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
          ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'ferrum-impact') {
        const radius = mobileSize(9 + (1 - alpha) * 34);
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.angle);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#e5f3ff';
        ctx.lineWidth = mobileSize(1 + 2 * alpha);
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-radius * .35, -radius);
        ctx.lineTo(radius * .52, 0);
        ctx.lineTo(-radius * .35, radius);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'vulture-transform') {
        const progress = 1 - alpha;
        const radius = mobileSize(34 + progress * 210);
        const centerX = effect.followPlayer ? state.player.x : effect.x;
        const centerY = effect.followPlayer ? state.player.y : effect.y;
        const flash = Math.sin(Math.min(1, progress * 1.12) * Math.PI);
        ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(effect.rotation + progress * 1.15); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * (.45 + flash * .55);
        const halo = ctx.createRadialGradient(0, 0, mobileSize(5), 0, 0, radius);
        halo.addColorStop(0, 'rgba(255,250,218,.92)'); halo.addColorStop(.12, 'rgba(255,191,74,.68)'); halo.addColorStop(.4, 'rgba(255,106,36,.28)'); halo.addColorStop(1, 'rgba(255,62,24,0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = '#ff8735'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(30);
        for (let ring = 0; ring < 3; ring++) {
          const ringProgress = clamp(progress * 1.32 - ring * .19, 0, 1);
          const ringRadius = mobileSize(18 + ringProgress * (142 + ring * 32));
          ctx.globalAlpha = alpha * (.9 - ring * .19) * (ringProgress > .96 ? (1 - ringProgress) * 20 : 1);
          ctx.strokeStyle = ring === 1 ? '#fff0bd' : ring === 2 ? '#ff6e2e' : '#ffc65f';
          ctx.lineWidth = mobileSize(ring === 0 ? 4 : 2.3);
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, timestamp / (ring % 2 ? -260 : 210) + ring, timestamp / (ring % 2 ? -260 : 210) + ring + Math.PI * (ring === 1 ? 1.82 : 1.48));
          ctx.stroke();
        }
        ctx.setLineDash([mobileSize(7), mobileSize(9)]); ctx.lineDashOffset = -timestamp / 15;
        ctx.globalAlpha = alpha * .72; ctx.strokeStyle = '#fff0bd'; ctx.lineWidth = mobileSize(1.8);
        ctx.beginPath(); ctx.arc(0, 0, radius * .68, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let ray = 0; ray < 16; ray++) {
          const angle = ray * Math.PI / 8 + timestamp / (ray % 2 ? 260 : -310);
          const inner = radius * (.18 + (ray % 3) * .035);
          const outer = radius * (.77 + (ray % 4) * .075);
          ctx.globalAlpha = alpha * (.52 + (ray % 3) * .13);
          ctx.strokeStyle = ray % 3 === 0 ? '#fff1bd' : ray % 2 ? '#ff7130' : '#ffc65f';
          ctx.lineWidth = mobileSize(ray % 4 === 0 ? 3 : 1.7);
          ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
        }
        for (let shard = 0; shard < 10; shard++) {
          const angle = shard * Math.PI / 5 - timestamp / 290;
          const shardRadius = radius * (.48 + progress * .43);
          const size = mobileSize(5 + (shard % 3) * 2);
          const sx = Math.cos(angle) * shardRadius, sy = Math.sin(angle) * shardRadius;
          ctx.globalAlpha = alpha * (.68 + (shard % 2) * .2); ctx.fillStyle = shard % 2 ? '#fff0bd' : '#ff7432';
          ctx.beginPath(); ctx.moveTo(sx, sy - size * 1.8); ctx.lineTo(sx + size, sy); ctx.lineTo(sx, sy + size * 1.8); ctx.lineTo(sx - size, sy); ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = alpha * (.72 + flash * .28); ctx.fillStyle = '#fff5d5'; ctx.shadowColor = '#ff9d38'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(42);
        ctx.beginPath(); ctx.arc(0, 0, mobileSize(13 + flash * 18), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'vulture-scrap-collect') {
        const size = mobileSize(24 + (1 - alpha) * 18);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha; ctx.shadowColor = '#ff813e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
        if (effect.image?.complete && effect.image.naturalWidth) ctx.drawImage(effect.image, effect.x - size / 2, effect.y - size / 2, size, size);
        else { ctx.fillStyle = '#ff813e'; ctx.beginPath(); ctx.arc(effect.x, effect.y, size * .3, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      } else if (effect.type === 'vulture-absorb-field') {
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.rotation); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * .82; ctx.strokeStyle = '#ffad55'; ctx.shadowColor = '#ff813e'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(15); ctx.lineWidth = mobileSize(2.4);
        ctx.beginPath(); ctx.arc(0, 0, effect.radius, -.18, Math.PI * 1.62); ctx.stroke();
        ctx.globalAlpha = alpha * .52; ctx.strokeStyle = '#ffe4a8'; ctx.lineWidth = mobileSize(1.2); ctx.setLineDash([mobileSize(3), mobileSize(5)]); ctx.lineDashOffset = -effect.rotation * 18;
        ctx.beginPath(); ctx.arc(0, 0, effect.radius * .72, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let shard = 0; shard < 5; shard++) { const angle = shard * Math.PI * .4 + effect.rotation * 1.7; const inner = effect.radius * .38, outer = effect.radius * .92; ctx.globalAlpha = alpha * .58; ctx.strokeStyle = shard % 2 ? '#ff853a' : '#ffe0a0'; ctx.lineWidth = mobileSize(1.3); ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke(); }
        ctx.restore();
      } else if (effect.type === 'vulture-ult-field' && state.vultureEvolutionTime > 0) {
        const fade = clamp(effect.life / .7, 0, 1); const pulse = .9 + Math.sin(timestamp / 110) * .1;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.rotation); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = fade * pulse;
        ctx.strokeStyle = '#ff8735'; ctx.shadowColor = '#ff9b39'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(24); ctx.lineWidth = mobileSize(3.2);
        ctx.beginPath(); ctx.arc(0, 0, effect.radius, timestamp / 900, timestamp / 900 + Math.PI * 1.65); ctx.stroke();
        ctx.globalAlpha = fade * .72; ctx.strokeStyle = '#ffe3a0'; ctx.lineWidth = mobileSize(1.4); ctx.setLineDash([mobileSize(8), mobileSize(10)]); ctx.lineDashOffset = -timestamp / 22;
        ctx.beginPath(); ctx.arc(0, 0, effect.radius * .84, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = fade * .22; const fieldGlow = ctx.createRadialGradient(0, 0, effect.radius * .25, 0, 0, effect.radius); fieldGlow.addColorStop(0, 'rgba(255,169,67,.02)'); fieldGlow.addColorStop(1, 'rgba(255,115,43,.32)'); ctx.fillStyle = fieldGlow; ctx.beginPath(); ctx.arc(0, 0, effect.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'vulture-ult-burst') {
        const progress = 1 - alpha;
        const radius = effect.radius * (.08 + progress * .92);
        const flash = Math.pow(alpha, 2.4);
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = flash * .3; ctx.fillStyle = '#ffd17a'; ctx.fillRect(0, 0, state.width, state.height);
        ctx.translate(effect.x, effect.y);
        const coreRadius = mobileSize(22) + effect.radius * .28 * (1 - progress);
        const core = ctx.createRadialGradient(0, 0, mobileSize(2), 0, 0, coreRadius);
        core.addColorStop(0, 'rgba(255,255,225,.98)'); core.addColorStop(.18, 'rgba(255,220,125,.94)'); core.addColorStop(.48, 'rgba(255,135,45,.62)'); core.addColorStop(1, 'rgba(255,76,30,0)');
        ctx.globalAlpha = alpha * .88; ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, coreRadius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = '#ff8c36'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(30);
        for (let ring = 0; ring < 3; ring++) {
          const ringProgress = clamp((progress - ring * .16) / .78, 0, 1);
          const ringRadius = effect.radius * (.08 + ringProgress * .92);
          ctx.globalAlpha = alpha * (1 - ringProgress) * (.92 - ring * .18);
          ctx.strokeStyle = ring === 1 ? '#fff1c4' : ring === 2 ? '#ff7130' : '#ffd779';
          ctx.lineWidth = mobileSize(ring === 0 ? 5 : ring === 1 ? 3 : 2);
          ctx.beginPath(); ctx.arc(0, 0, ringRadius, timestamp / (ring === 1 ? -270 : 210) + ring, timestamp / (ring === 1 ? -270 : 210) + ring + Math.PI * (ring === 1 ? 1.82 : 2)); ctx.stroke();
        }
        ctx.globalAlpha = alpha * .72; ctx.strokeStyle = '#ff8a35'; ctx.lineWidth = mobileSize(2);
        ctx.setLineDash([mobileSize(8), mobileSize(11)]); ctx.lineDashOffset = -timestamp / 14;
        ctx.beginPath(); ctx.arc(0, 0, radius * .78, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let ray = 0; ray < 24; ray++) {
          const angle = ray * Math.PI / 12 + timestamp / (ray % 2 ? 460 : -520);
          const inner = radius * (.12 + (ray % 3) * .025);
          const outer = radius * (.82 + (ray % 4) * .075);
          ctx.globalAlpha = alpha * (.34 + (ray % 3) * .12);
          ctx.strokeStyle = ray % 4 === 0 ? '#fff2ce' : ray % 2 ? '#ff6a2c' : '#ffc65c';
          ctx.lineWidth = mobileSize(ray % 4 === 0 ? 3 : 1.5);
          ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
        }
        for (let shard = 0; shard < 14; shard++) {
          const angle = shard * Math.PI / 7 - timestamp / 330;
          const shardRadius = radius * (.3 + ((shard * 7) % 11) / 16);
          const size = mobileSize(4 + (shard % 3) * 2);
          const sx = Math.cos(angle) * shardRadius, sy = Math.sin(angle) * shardRadius;
          ctx.globalAlpha = alpha * (.55 + (shard % 2) * .24); ctx.fillStyle = shard % 2 ? '#fff0bd' : '#ff7432';
          ctx.beginPath(); ctx.moveTo(sx, sy - size * 1.7); ctx.lineTo(sx + size, sy); ctx.lineTo(sx, sy + size * 1.7); ctx.lineTo(sx - size, sy); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      } else if (effect.type === 'vulture-fold') {
        const foldProgress = 1 - alpha;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * .82; ctx.strokeStyle = effect.color; ctx.shadowColor = effect.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(15);
        ctx.lineWidth = mobileSize(2.5); ctx.beginPath(); ctx.ellipse(0, 0, mobileSize(12 + foldProgress * 32), mobileSize(23 + foldProgress * 14), foldProgress * 2.2, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .36; ctx.lineWidth = mobileSize(1); ctx.beginPath(); ctx.ellipse(0, 0, mobileSize(7 + foldProgress * 20), mobileSize(15 + foldProgress * 8), -foldProgress * 2.5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'vulture-fold-strike') {
        const progress = 1 - alpha;
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = alpha * .86; ctx.shadowColor = '#ff8a38'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22);
        const beam = ctx.createLinearGradient(effect.x1, effect.y1, effect.x2, effect.y2);
        beam.addColorStop(0, '#ffeab1'); beam.addColorStop(.45, '#ff7b31'); beam.addColorStop(1, '#fff1c5');
        ctx.strokeStyle = beam; ctx.lineWidth = effect.width * (1 - progress * .42); ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = alpha * .72; ctx.strokeStyle = '#fff4ce'; ctx.lineWidth = mobileSize(2.3); ctx.setLineDash([mobileSize(9), mobileSize(7)]); ctx.lineDashOffset = timestamp / 12;
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.lineTo(effect.x2, effect.y2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      } else if (effect.type === 'vulture-pulse') {
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha * .22;
        const glow = ctx.createRadialGradient(effect.x, effect.y, effect.radius * .65, effect.x, effect.y, effect.radius);
        glow.addColorStop(0, 'rgba(255,155,45,0)'); glow.addColorStop(.72, 'rgba(255,155,45,.05)'); glow.addColorStop(1, 'rgba(255,113,51,.28)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha * .8; ctx.strokeStyle = '#ffd16c'; ctx.shadowColor = '#ff7133'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(17);
        ctx.lineWidth = mobileSize(3.2 * alpha + 1); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .45; ctx.strokeStyle = '#ffcc7a'; ctx.lineWidth = mobileSize(1.1); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * .94, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'vulture-horizon-shot') {
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * (effect.charged ? .9 : .58); ctx.fillStyle = effect.charged ? '#ffb62e' : '#ff7133'; ctx.shadowColor = effect.charged ? '#ffe27a' : '#ff9c38'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(effect.charged ? 30 : 14);
        ctx.beginPath(); ctx.moveTo(mobileSize(effect.charged ? 34 : 25), 0); ctx.lineTo(-mobileSize(effect.charged ? 18 : 14), -mobileSize(effect.charged ? 11 : 7)); ctx.lineTo(-mobileSize(10), 0); ctx.lineTo(-mobileSize(effect.charged ? 18 : 14), mobileSize(effect.charged ? 11 : 7)); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = alpha; ctx.fillStyle = '#fff2cf'; ctx.beginPath(); ctx.arc(0, 0, mobileSize(effect.charged ? 9.5 : 5.5), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha * .82; ctx.strokeStyle = '#ffca5c'; ctx.lineWidth = mobileSize(effect.charged ? 2.8 : 1.8); ctx.beginPath(); ctx.moveTo(-mobileSize(6), 0); ctx.lineTo(-mobileSize(effect.charged ? 52 : 29), 0); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'vulture-impact') {
        const impactRadius = effect.radius * (1 - alpha * .55);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha * .8; ctx.strokeStyle = '#ffe0a0'; ctx.shadowColor = '#ff7133'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(13); ctx.lineWidth = mobileSize(2.5);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, impactRadius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'saurion-summon-wave') {
        ctx.save(); ctx.globalAlpha = alpha * .6; ctx.strokeStyle = effect.color || '#8bff4b'; ctx.lineWidth = mobileSize(2.3); ctx.shadowColor = effect.color || '#8bff4b';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .11; ctx.fillStyle = effect.color || '#8bff4b'; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (effect.type === 'saurion-ankyl-shield') {
        const pulse = .82 + Math.sin(timestamp / 75) * .12;
        const shieldRadius = state.player.radius + mobileSize(12) + effect.radius * .22;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = alpha * .48 * pulse; ctx.strokeStyle = '#c6da83'; ctx.lineWidth = mobileSize(3);
        ctx.shadowColor = '#a8c95d'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        ctx.beginPath(); ctx.arc(0, 0, shieldRadius, -Math.PI * .9, Math.PI * .9); ctx.stroke();
        ctx.globalAlpha = alpha * .68; ctx.strokeStyle = '#eff4cf'; ctx.lineWidth = mobileSize(1.2);
        for (let plate = 0; plate < 5; plate++) {
          const angle = (plate / 5) * Math.PI * 2 + timestamp / 700;
          ctx.beginPath(); ctx.arc(0, 0, shieldRadius, angle, angle + Math.PI * .2); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'saurion-ankyl-shockwave') {
        const progress = 1 - alpha;
        const reach = Math.max(mobileSize(8), effect.radius);
        const crackAlpha = clamp(alpha * 1.35, 0, 1);
        ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = alpha * .42; ctx.strokeStyle = '#e1c27b'; ctx.lineWidth = mobileSize(3.2);
        ctx.shadowColor = '#c39a59'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(13);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, reach, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .78; ctx.strokeStyle = '#302d23'; ctx.lineWidth = mobileSize(4.5); ctx.shadowBlur = 0;
        const crackCount = state.performanceMode === 'light' ? 9 : 15;
        for (let crack = 0; crack < crackCount; crack++) {
          const angle = crack / crackCount * Math.PI * 2 + .13;
          const startRadius = reach * (.1 + ((crack * 7) % 4) * .018);
          const middleRadius = reach * (.47 + Math.sin(crack * 2.1) * .045);
          const endRadius = reach * (.84 + ((crack * 3) % 4) * .035);
          const bend = Math.sin(crack * 5.7 + progress * 2) * reach * .045;
          const nx = -Math.sin(angle), ny = Math.cos(angle);
          const sx = effect.x + Math.cos(angle) * startRadius;
          const sy = effect.y + Math.sin(angle) * startRadius;
          const mx = effect.x + Math.cos(angle) * middleRadius + nx * bend;
          const my = effect.y + Math.sin(angle) * middleRadius + ny * bend;
          const ex = effect.x + Math.cos(angle) * endRadius - nx * bend * .35;
          const ey = effect.y + Math.sin(angle) * endRadius - ny * bend * .35;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.globalAlpha = crackAlpha * .84; ctx.strokeStyle = '#d6b973'; ctx.lineWidth = mobileSize(1.35);
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
          if (crack % 2 === 0) {
            const branchAngle = angle + (crack % 4 === 0 ? 1 : -1) * (.32 + (crack % 3) * .08);
            const branchX = mx + Math.cos(branchAngle) * reach * .28;
            const branchY = my + Math.sin(branchAngle) * reach * .28;
            ctx.globalAlpha = alpha * .72; ctx.strokeStyle = '#302d23'; ctx.lineWidth = mobileSize(3.1);
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(branchX, branchY); ctx.stroke();
            ctx.globalAlpha = crackAlpha * .8; ctx.strokeStyle = '#d6b973'; ctx.lineWidth = mobileSize(1.15);
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(branchX, branchY); ctx.stroke();
          }
        }
        ctx.globalAlpha = alpha * .42; ctx.strokeStyle = '#e1c27b'; ctx.lineWidth = mobileSize(1.8);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, reach * .97, 0, Math.PI * 2); ctx.stroke();
        const impactFlash = clamp(1 - progress * 5, 0, 1);
        ctx.globalAlpha = impactFlash * .5; ctx.fillStyle = '#f3d898'; ctx.beginPath(); ctx.arc(effect.x, effect.y, mobileSize(16 + progress * 28), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'flamestorm-vortex') {
        const vortexOpacity = flameStormVortexVisualOpacity(effect);
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = vortexOpacity * .9; ctx.rotate(effect.rotation);
        if (flameStormVortexSprite.complete && flameStormVortexSprite.naturalWidth) {
          const size = effect.radius * 2.18;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(flameStormVortexSprite, -size / 2, -size / 2, size, size);
          ctx.globalCompositeOperation = 'screen';
        } else {
          for (let arm = 0; arm < 4; arm++) { ctx.beginPath(); ctx.arc(0, 0, effect.radius * (.34 + arm * .16), arm * Math.PI * .5, arm * Math.PI * .5 + Math.PI * 1.42); ctx.strokeStyle = arm % 2 ? '#ffb164' : '#ff283d'; ctx.lineWidth = mobileSize(10 - arm); ctx.stroke(); }
        }
        ctx.rotate(-effect.rotation * 1.8); ctx.globalAlpha = vortexOpacity * .6; ctx.strokeStyle = '#ff493b'; ctx.lineWidth = mobileSize(2.4); ctx.shadowColor = '#ff342d'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(15);
        ctx.beginPath(); ctx.arc(0, 0, effect.radius * (.91 + .035 * Math.sin(timestamp / 80)), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = vortexOpacity * .45; ctx.strokeStyle = '#ffd08a'; ctx.lineWidth = mobileSize(1.2); ctx.beginPath(); ctx.arc(0, 0, effect.radius * .76, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'flamestorm-trail') {
        if (effect.points.length > 1) {
          ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          for (const [width, color, opacity] of [[effect.width * 2, 'rgba(13,7,13,.84)', .62], [effect.width * 1.15, 'rgba(116,8,29,.88)', .82], [effect.width * .48, 'rgba(244,35,53,.9)', .92]]) {
            ctx.globalAlpha = alpha * opacity; ctx.strokeStyle = color; ctx.lineWidth = width;
            ctx.shadowColor = '#b8132b'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(4);
            ctx.beginPath(); effect.points.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }); ctx.stroke();
          }
          ctx.restore();
        }
      } else if (effect.type === 'eclipse-paradox-pulse') {
        const progress = 1 - alpha; const pulseRadius = effect.radius * (.28 + progress * .74);
        ctx.save(); ctx.globalAlpha = alpha * .72; ctx.lineCap = 'round'; ctx.strokeStyle = '#d9c2ff'; ctx.shadowColor = '#a56cff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
        ctx.lineWidth = mobileSize(4 * alpha + 1); ctx.beginPath(); ctx.arc(effect.x, effect.y, pulseRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .36; ctx.strokeStyle = '#fff5ff'; ctx.lineWidth = mobileSize(1.1); ctx.beginPath(); ctx.arc(effect.x, effect.y, pulseRadius * .91, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'eclipse-paradox-collapse') {
        const progress = 1 - alpha; const radius = effect.radius * (.08 + progress * .92);
        ctx.save(); ctx.globalAlpha = alpha * .12; ctx.fillStyle = '#d8c1ff'; ctx.fillRect(0, 0, state.width, state.height);
        ctx.translate(effect.x, effect.y); ctx.globalAlpha = alpha * .8; ctx.strokeStyle = '#d8bbff'; ctx.shadowColor = '#b58aff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(24);
        ctx.lineWidth = mobileSize(3 * alpha + 1); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.rotate(-timestamp / 90); ctx.globalAlpha = alpha * .7; ctx.strokeStyle = '#fff5ff'; ctx.lineWidth = mobileSize(1.4);
        for (let ray = 0; ray < 8; ray++) { const angle = ray * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * radius * .72, Math.sin(angle) * radius * .72); ctx.lineTo(Math.cos(angle) * radius * 1.08, Math.sin(angle) * radius * 1.08); ctx.stroke(); }
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, mobileSize(55 * alpha + 2)); core.addColorStop(0, 'rgba(255,248,255,.98)'); core.addColorStop(.28, 'rgba(181,138,255,.86)'); core.addColorStop(1, 'rgba(88,39,145,0)');
        ctx.globalAlpha = alpha; ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, mobileSize(55 * alpha + 2), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (effect.type === 'skill-ready') {
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
      } else if (effect.type === 'megumi-shadow-burst') {
        const progress = 1 - alpha; const radius = effect.radius * progress;
        ctx.save(); ctx.globalAlpha = alpha * .6; const veil = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, Math.max(1, radius)); veil.addColorStop(0, 'rgba(12,8,22,.08)'); veil.addColorStop(.72, 'rgba(25,16,42,.56)'); veil.addColorStop(1, 'rgba(14,10,25,0)'); ctx.fillStyle = veil; ctx.fillRect(0, 0, state.width, state.height); ctx.restore();
      } else if (effect.type === 'megumi-nue-wave') {
        const progress = 1 - alpha; const radius = effect.radius * progress;
        ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * .92; ctx.strokeStyle = '#b7efff'; ctx.shadowColor = '#6abfff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(24); ctx.lineWidth = mobileSize(7 * alpha + 2); ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = mobileSize(1.5); ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .9, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'megumi-nue-bolt') {
        const dx = effect.x2 - effect.x1, dy = effect.y2 - effect.y1, length = Math.hypot(dx, dy) || 1, sideX = -dy / length, sideY = dx / length;
        ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.strokeStyle = '#a8eaff'; ctx.shadowColor = '#6bc7ff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18); ctx.lineWidth = mobileSize(4);
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); for (let point = 1; point < 10; point++) { const progress = point / 10, offset = Math.sin(point * 17.31 + effect.seed * 31) * mobileSize(17); ctx.lineTo(effect.x1 + dx * progress + sideX * offset, effect.y1 + dy * progress + sideY * offset); } ctx.lineTo(effect.x2, effect.y2); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(1.4); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'mahoraga-world-wave') {
        const dx = Math.cos(effect.angle); const dy = Math.sin(effect.angle);
        const sideX = -dy; const sideY = dx;
        const fade = clamp(effect.life / effect.total, 0, 1);
        const front = effect.originOffset + effect.travel;
        const span = effect.halfSpan;
        const curveDepth = effect.curveDepth;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const trail of [mobileSize(24), mobileSize(12), 0]) {
          const isCore = trail === 0;
          ctx.beginPath();
          for (let point = 0; point <= 28; point++) {
            const t = point / 28;
            const across = (t * 2 - 1) * span;
            const bow = Math.cos((t * 2 - 1) * Math.PI * .5) * curveDepth;
            const fracture = Math.sin(t * Math.PI * 8 + effect.elapsed * 13) * mobileSize(2) * Math.sin(Math.PI * t);
            const along = front - trail + bow + fracture;
            const x = effect.x + dx * along + sideX * across;
            const y = effect.y + dy * along + sideY * across;
            if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = isCore ? '#fffdf4' : trail === mobileSize(12) ? '#e4c477' : '#d8d5c8';
          ctx.globalAlpha = fade * (isCore ? 1 : trail === mobileSize(12) ? .72 : .35);
          ctx.lineWidth = mobileSize(isCore ? 5.5 : trail === mobileSize(12) ? 3 : 1.6);
          if (state.performanceMode !== 'light') { ctx.shadowColor = isCore ? '#fff5df' : '#e4c477'; ctx.shadowBlur = mobileSize(isCore ? 24 : 12); }
          ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'mahoraga-adaptation') {
        const progress = 1 - alpha;
        const radius = mobileSize(24 + progress * 170);
        const wheelAlpha = Math.sin(Math.PI * clamp(progress, 0, 1)) * .74;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(-timestamp / 300); ctx.globalAlpha = wheelAlpha;
        ctx.strokeStyle = '#e4c477'; ctx.lineWidth = mobileSize(3); ctx.shadowColor = '#f1eadb'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(18);
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#f1eadb'; ctx.lineWidth = mobileSize(1.5); ctx.beginPath(); ctx.arc(0, 0, radius * .72, 0, Math.PI * 2); ctx.stroke();
        for (let spoke = 0; spoke < 8; spoke++) { const a = spoke * Math.PI / 4; const x = Math.cos(a) * radius; const y = Math.sin(a) * radius; ctx.beginPath(); ctx.moveTo(Math.cos(a) * radius * .2, Math.sin(a) * radius * .2); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = '#e4c477'; ctx.beginPath(); ctx.arc(x, y, mobileSize(3.5), 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#e4c477'; ctx.beginPath(); ctx.arc(0, 0, mobileSize(8), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      } else if (effect.type === 'aurora-crown-start') {
        const progress = 1 - alpha;
        const radius = mobileSize((effect.phase ? 26 : 18) + progress * (effect.phase ? 118 : 168));
        const fade = Math.sin(Math.PI * clamp(progress, 0, 1));
        ctx.save(); ctx.globalAlpha = fade * (effect.phase ? .72 : .9); ctx.lineCap = 'round';
        const glow = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        glow.addColorStop(0, 'rgba(228,250,255,.18)'); glow.addColorStop(.28, 'rgba(125,247,232,.12)'); glow.addColorStop(.68, 'rgba(194,166,255,.08)'); glow.addColorStop(1, 'rgba(194,166,255,0)');
        ctx.fillStyle = glow; ctx.fillRect(effect.x - radius, effect.y - radius, radius * 2, radius * 2);
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#8deaff'; ctx.shadowBlur = mobileSize(14); }
        ctx.strokeStyle = 'rgba(224,246,255,.78)'; ctx.lineWidth = mobileSize(2.3);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .82, timestamp / 430, timestamp / 430 + Math.PI * 1.65); ctx.stroke();
        ctx.strokeStyle = 'rgba(194,166,255,.68)'; ctx.lineWidth = mobileSize(1.2);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .58, -timestamp / 510, -timestamp / 510 + Math.PI * 1.5); ctx.stroke();
        for (let ray = 0; ray < 6; ray++) {
          const angle = timestamp / 650 + ray * Math.PI / 3;
          ctx.globalAlpha = fade * (effect.phase ? .38 : .55);
          ctx.strokeStyle = ray % 2 ? '#c2a6ff' : '#bffff5';
          ctx.lineWidth = mobileSize(1.25);
          ctx.beginPath(); ctx.moveTo(effect.x + Math.cos(angle) * radius * .18, effect.y + Math.sin(angle) * radius * .18); ctx.lineTo(effect.x + Math.cos(angle) * radius, effect.y + Math.sin(angle) * radius); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'aurora-crown-burst') {
        const progress = 1 - alpha;
        const radius = Math.max(1, effect.radius * (.2 + progress * .8));
        const fade = Math.sin(Math.PI * clamp(progress, 0, 1));
        ctx.save(); ctx.globalAlpha = fade * .72; ctx.lineCap = 'round';
        const glow = ctx.createRadialGradient(effect.x, effect.y, mobileSize(3), effect.x, effect.y, radius);
        glow.addColorStop(0, 'rgba(249,253,255,.78)'); glow.addColorStop(.12, 'rgba(165,240,255,.44)'); glow.addColorStop(.42, 'rgba(125,247,232,.18)'); glow.addColorStop(.72, 'rgba(164,128,255,.1)'); glow.addColorStop(1, 'rgba(112,91,255,0)');
        ctx.fillStyle = glow; ctx.fillRect(effect.x - radius, effect.y - radius, radius * 2, radius * 2);
        if (state.performanceMode !== 'light') { ctx.shadowColor = '#9feaff'; ctx.shadowBlur = mobileSize(20); }
        for (let ring = 0; ring < 4; ring++) {
          const ringRadius = radius * (1 - ring * .16);
          ctx.globalAlpha = fade * (.6 - ring * .1);
          ctx.strokeStyle = ring === 1 || ring === 3 ? '#c2a6ff' : '#dffaff';
          ctx.lineWidth = mobileSize(ring === 0 ? 3.4 : ring === 2 ? 2 : 1.2);
          ctx.beginPath(); ctx.arc(effect.x, effect.y, ringRadius, timestamp / (ring + 1) * .001, timestamp / (ring + 1) * .001 + Math.PI * (1.5 + ring * .15)); ctx.stroke();
        }
        ctx.setLineDash([mobileSize(4), mobileSize(8)]); ctx.lineDashOffset = -timestamp / 18;
        ctx.globalAlpha = fade * .56; ctx.strokeStyle = '#effaff'; ctx.lineWidth = mobileSize(1.2);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .72, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let ray = 0; ray < 24; ray++) {
          const angle = ray * Math.PI / 12 + timestamp / 1800;
          const inner = radius * (.22 + (ray % 3) * .05), outer = radius * (.72 + (ray % 4) * .07);
          ctx.globalAlpha = fade * (ray % 4 === 0 ? .62 : .3);
          ctx.strokeStyle = ray % 2 ? '#c2a6ff' : '#dffaff'; ctx.lineWidth = mobileSize(ray % 4 === 0 ? 1.9 : 1);
          ctx.beginPath(); ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner); ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer); ctx.stroke();
        }
        ctx.globalAlpha = fade * .92;
        ctx.fillStyle = '#fbffff';
        ctx.shadowColor = '#adf6ff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(22);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, mobileSize(12), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = '#f6fcff'; ctx.lineWidth = mobileSize(2.3);
        for (let spoke = 0; spoke < 8; spoke++) {
          const angle = spoke * Math.PI / 4 + timestamp / 540;
          ctx.beginPath(); ctx.moveTo(effect.x + Math.cos(angle) * mobileSize(17), effect.y + Math.sin(angle) * mobileSize(17)); ctx.lineTo(effect.x + Math.cos(angle) * radius * .42, effect.y + Math.sin(angle) * radius * .42); ctx.stroke();
        }
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
      } else if (effect.type === 'aurora-ult-beam') {
        const dx = effect.x2 - effect.x1, dy = effect.y2 - effect.y1;
        const length = Math.hypot(dx, dy) || 1;
        const bend = Math.sin(timestamp / 90 + effect.phase) * Math.min(mobileSize(22), length * .06);
        const cx = (effect.x1 + effect.x2) / 2 - dy / length * bend;
        const cy = (effect.y1 + effect.y2) / 2 + dx / length * bend;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = alpha * .5; ctx.strokeStyle = effect.phase % 2 ? '#b994ff' : '#57eaff'; ctx.lineWidth = mobileSize(7);
        if (state.performanceMode !== 'light') { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = mobileSize(16); }
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.quadraticCurveTo(cx, cy, effect.x2, effect.y2); ctx.stroke();
        ctx.globalAlpha = alpha * .98; ctx.strokeStyle = '#f6ffff'; ctx.lineWidth = mobileSize(1.8); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(effect.x1, effect.y1); ctx.quadraticCurveTo(cx, cy, effect.x2, effect.y2); ctx.stroke();
        const spark = clamp((timestamp / 230 + effect.phase * .17) % 1, 0, 1), inverse = 1 - spark;
        const sx = inverse * inverse * effect.x1 + 2 * inverse * spark * cx + spark * spark * effect.x2;
        const sy = inverse * inverse * effect.y1 + 2 * inverse * spark * cy + spark * spark * effect.y2;
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#8deaff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(8);
        ctx.beginPath(); ctx.arc(sx, sy, mobileSize(2.7), 0, Math.PI * 2); ctx.fill();
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
      } else if (effect.type === 'hunter-explosion') {
        const progress = 1 - alpha;
        const radius = effect.radius * (.78 + progress * .22);
        ctx.save(); ctx.globalAlpha = alpha * .76;
        const blast = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, radius);
        blast.addColorStop(0, effect.isBossExplosion ? 'rgba(255,245,255,.84)' : 'rgba(255,245,205,.72)');
        blast.addColorStop(.22, effect.isBossExplosion ? 'rgba(211,131,255,.58)' : 'rgba(255,119,65,.48)');
        blast.addColorStop(.64, effect.isBossExplosion ? 'rgba(122,55,190,.34)' : 'rgba(193,35,58,.24)');
        blast.addColorStop(1, effect.isBossExplosion ? 'rgba(49,14,80,0)' : 'rgba(80,16,47,0)');
        ctx.fillStyle = blast; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = effect.isBossExplosion ? '#edc8ff' : '#ff9d69';
        ctx.shadowColor = effect.isBossExplosion ? '#bd70ff' : '#ff493c';
        ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(effect.isBossExplosion ? 28 : 18);
        ctx.lineWidth = mobileSize((effect.isBossExplosion ? 8 : 5) * alpha + 1); ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#fff2c7'; ctx.shadowBlur = 0; ctx.lineWidth = mobileSize(1.6);
        ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * .72, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'aurora-repulse-wave') {
        const progress = 1 - alpha;
        const radius = effect.radius || effect.maxRadius * progress;
        const waveAlpha = Math.sin(Math.PI * clamp(progress, 0, 1));
        ctx.save(); ctx.globalAlpha = waveAlpha * .62; ctx.lineCap = 'round';
        const glow = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, radius - mobileSize(52)), effect.x, effect.y, radius);
        glow.addColorStop(0, 'rgba(120,236,255,0)'); glow.addColorStop(.72, 'rgba(120,236,255,0)'); glow.addColorStop(.9, 'rgba(147,128,255,.12)'); glow.addColorStop(1, 'rgba(197,246,255,.4)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = effect.color || '#80f3ff'; ctx.shadowColor = effect.color || '#80f3ff'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(19);
        for (let ring = 0; ring < 3; ring++) {
          ctx.globalAlpha = waveAlpha * (.72 - ring * .16); ctx.lineWidth = mobileSize(ring === 0 ? 3.2 : 1.5);
          ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * (1 - ring * .09), timestamp / 480 + ring, timestamp / 480 + ring + Math.PI * (1.46 + ring * .1)); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'saurion-bite') {
        if (saurionBiteSprite.complete && saurionBiteSprite.naturalWidth && saurionBiteSprite.naturalHeight) {
          const columns = 6; const rows = 3; const frames = columns * rows;
          const frameWidth = saurionBiteSprite.naturalWidth / columns;
          const frameHeight = saurionBiteSprite.naturalHeight / rows;
          const frame = Math.min(frames - 1, Math.floor((1 - alpha) * frames));
          const sourceX = (frame % columns) * frameWidth;
          const sourceY = Math.floor(frame / columns) * frameHeight;
          ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(alpha * 2.8, 0, 1);
          ctx.drawImage(saurionBiteSprite, sourceX, sourceY, frameWidth, frameHeight, effect.x - effect.width / 2, effect.y - effect.height / 2, effect.width, effect.height);
          ctx.restore();
        }
      } else if (effect.type === 'saurion-spino-claw') {
        const progress = 1 - alpha;
        const fade = clamp(Math.min(progress * 6 + .2, alpha * 3.5), 0, 1);
        const reach = effect.radius * (.58 + progress * .42);
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let claw = 0; claw < 4; claw++) {
          const spread = (claw / 3 - .5) * reach * .72;
          const startX = reach * (.22 + Math.abs(claw - 1.5) * .035);
          const endX = reach * (.9 - Math.abs(claw - 1.5) * .08);
          ctx.beginPath(); ctx.moveTo(startX, spread + reach * .09);
          ctx.quadraticCurveTo((startX + endX) * .54, spread - reach * .06, endX, spread - reach * .17);
          ctx.globalAlpha = fade * .28; ctx.strokeStyle = '#1c281b'; ctx.lineWidth = mobileSize(10); ctx.stroke();
          ctx.globalAlpha = fade * .8; ctx.strokeStyle = '#a7bd92'; ctx.lineWidth = mobileSize(4.2); ctx.stroke();
          ctx.globalAlpha = fade * .72; ctx.strokeStyle = '#edf6d8'; ctx.lineWidth = mobileSize(1.25); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'saurion-theri-claw') {
        const progress = 1 - alpha;
        const fade = clamp(Math.min(progress * 6 + .16, alpha * 3.8), 0, 1);
        const reach = effect.radius * (.58 + progress * .42);
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle + progress * .12);
        ctx.globalAlpha = fade * .2; ctx.strokeStyle = '#b783eb'; ctx.lineWidth = mobileSize(2.2);
        ctx.beginPath(); ctx.arc(0, 0, reach * (.83 + progress * .12), 0, Math.PI * 2); ctx.stroke();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let claw = 0; claw < 8; claw++) {
          const angle = claw / 8 * Math.PI * 2;
          const inner = reach * .2;
          const outer = reach * (.82 + (claw % 2) * .08);
          const bend = (claw % 2 ? 1 : -1) * reach * .075;
          const startX = Math.cos(angle) * inner; const startY = Math.sin(angle) * inner;
          const endX = Math.cos(angle) * outer; const endY = Math.sin(angle) * outer;
          const middleX = Math.cos(angle) * (inner + outer) * .5 - Math.sin(angle) * bend;
          const middleY = Math.sin(angle) * (inner + outer) * .5 + Math.cos(angle) * bend;
          ctx.beginPath(); ctx.moveTo(startX, startY); ctx.quadraticCurveTo(middleX, middleY, endX, endY);
          ctx.globalAlpha = fade * .3; ctx.strokeStyle = '#30213d'; ctx.lineWidth = mobileSize(9); ctx.stroke();
          ctx.globalAlpha = fade * .82; ctx.strokeStyle = '#aa83c9'; ctx.lineWidth = mobileSize(4.1); ctx.stroke();
          ctx.globalAlpha = fade * .78; ctx.strokeStyle = '#f0ddff'; ctx.lineWidth = mobileSize(1.35); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'saurion-trike-horns') {
        const progress = 1 - alpha;
        const fade = clamp(Math.min(progress * 5 + .15, alpha * 3.2), 0, 1);
        const reach = effect.radius * (.72 + progress * .28);
        const halfAngle = Math.PI / 5;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle);
        ctx.globalAlpha = fade * .2;
        const hornWave = ctx.createRadialGradient(0, 0, reach * .15, 0, 0, reach);
        hornWave.addColorStop(0, 'rgba(255,220,170,.02)'); hornWave.addColorStop(.72, 'rgba(236,151,96,.2)'); hornWave.addColorStop(1, 'rgba(255,226,178,.48)');
        ctx.fillStyle = hornWave; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, reach, -halfAngle, halfAngle); ctx.closePath(); ctx.fill();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = '#f3b777'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12);
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(reach * .22, side * reach * .045); ctx.quadraticCurveTo(reach * .62, side * reach * .18, reach * .98, side * reach * .36);
          ctx.globalAlpha = fade * .3; ctx.strokeStyle = '#522e26'; ctx.lineWidth = mobileSize(9); ctx.stroke();
          ctx.globalAlpha = fade * .86; ctx.strokeStyle = '#d97955'; ctx.lineWidth = mobileSize(4); ctx.stroke();
          ctx.globalAlpha = fade * .8; ctx.strokeStyle = '#ffe0b1'; ctx.lineWidth = mobileSize(1.4); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'saurion-titan-tail') {
        const progress = 1 - alpha;
        const fade = clamp(Math.min(progress * 4.8 + .2, alpha * 3.2), 0, 1);
        const reach = effect.radius * (.78 + progress * .22);
        const halfAngle = Math.PI / 4;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle);
        ctx.globalAlpha = fade * .19;
        const tailSweep = ctx.createRadialGradient(0, 0, reach * .2, 0, 0, reach);
        tailSweep.addColorStop(0, 'rgba(195,151,99,.02)'); tailSweep.addColorStop(.8, 'rgba(195,151,99,.18)'); tailSweep.addColorStop(1, 'rgba(255,226,174,.48)');
        ctx.fillStyle = tailSweep; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, reach, -halfAngle, halfAngle); ctx.closePath(); ctx.fill();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = '#d7b17a'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
        for (let lash = -1; lash <= 1; lash++) {
          const side = lash * reach * .2;
          const startX = reach * .3;
          const endX = reach * (.86 - Math.abs(lash) * .04);
          ctx.beginPath(); ctx.moveTo(startX, side * .38); ctx.quadraticCurveTo(reach * .64, side * 1.35, endX, side * 1.5);
          ctx.globalAlpha = fade * .26; ctx.strokeStyle = '#49382a'; ctx.lineWidth = mobileSize(11 - Math.abs(lash) * 2); ctx.stroke();
          ctx.globalAlpha = fade * .86; ctx.strokeStyle = lash === 0 ? '#e4c18b' : '#b89162'; ctx.lineWidth = mobileSize(lash === 0 ? 4 : 2.7); ctx.stroke();
          ctx.globalAlpha = fade * .76; ctx.strokeStyle = '#fff0d1'; ctx.lineWidth = mobileSize(1.2); ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'nova') {
        const novaColor = effect.color || currentSkin().color;
        ctx.save(); ctx.globalAlpha = alpha; const nova = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, effect.radius - mobileSize(40)), effect.x, effect.y, effect.radius); nova.addColorStop(0, 'rgba(125,247,232,.02)'); nova.addColorStop(.82, 'rgba(125,247,232,.09)'); nova.addColorStop(1, 'rgba(255,255,255,.35)'); ctx.fillStyle = nova; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = novaColor; ctx.lineWidth = mobileSize(8); ctx.shadowColor = novaColor; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(34); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = mobileSize(2); ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * .92, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'dino-roar') {
        const progress = 1 - alpha;
        const waveRadius = effect.radius * (.08 + progress * .92);
        const waveAlpha = Math.sin(Math.PI * Math.min(1, progress * 1.08)) * .8 + alpha * .14;
        ctx.save();
        const wave = ctx.createRadialGradient(effect.x, effect.y, Math.max(0, waveRadius - mobileSize(56)), effect.x, effect.y, waveRadius);
        wave.addColorStop(0, 'rgba(24,14,16,0)'); wave.addColorStop(.76, 'rgba(186,75,27,.07)'); wave.addColorStop(.94, 'rgba(244,119,35,.22)'); wave.addColorStop(1, 'rgba(255,211,138,.54)');
        ctx.globalAlpha = waveAlpha; ctx.fillStyle = wave;
        ctx.beginPath(); ctx.arc(effect.x, effect.y, waveRadius, 0, Math.PI * 2); ctx.fill();
        ctx.lineCap = 'round'; ctx.shadowColor = '#f07925'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(20);
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = waveRadius * (1 - ring * .11);
          ctx.globalAlpha = waveAlpha * (.9 - ring * .22); ctx.strokeStyle = ring === 1 ? '#171114' : ring === 2 ? '#ffe1a0' : '#f28a28'; ctx.lineWidth = mobileSize(ring === 0 ? 4 : 2);
          ctx.beginPath(); ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2); ctx.stroke();
        }
        const coreFlash = clamp(1 - progress * 4.5, 0, 1);
        ctx.shadowBlur = 0; ctx.globalAlpha = coreFlash * .52; ctx.fillStyle = '#ffe1a0';
        ctx.beginPath(); ctx.arc(effect.x, effect.y, mobileSize(18 + progress * 32), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = waveAlpha * .2; ctx.fillStyle = '#181114';
        ctx.beginPath(); ctx.arc(effect.x, effect.y, waveRadius * .62, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'dino-claw') {
        const fade = Math.min(1, (1 - alpha) * 9, alpha * 2.4);
        const dx = effect.x2 - effect.x1; const dy = effect.y2 - effect.y1; const length = Math.hypot(dx, dy) || 1;
        const ux = dx / length; const uy = dy / length; const nx = -uy; const ny = ux;
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = fade * .62; ctx.strokeStyle = '#171114'; ctx.shadowColor = '#ed7122'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 11;
        ctx.lineWidth = effect.width * 3.2; strokeDinoClawPath(effect);
        ctx.globalAlpha = fade * .9; ctx.strokeStyle = effect.color; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 8;
        ctx.lineWidth = effect.width * 1.9; strokeDinoClawPath(effect);
        ctx.globalAlpha = fade; ctx.strokeStyle = '#fff0ce'; ctx.shadowColor = '#ff9a35'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : 5;
        ctx.lineWidth = effect.width * .58; strokeDinoClawPath(effect);
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffbd55'; ctx.globalAlpha = fade * .8;
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
        trail.addColorStop(0, 'rgba(255,219,140,.78)'); trail.addColorStop(.22, 'rgba(255,136,34,.55)'); trail.addColorStop(.56, 'rgba(24,15,17,.42)'); trail.addColorStop(1, 'rgba(83,35,20,0)');
        ctx.globalAlpha = fade * .78; ctx.fillStyle = trail; ctx.shadowColor = '#ef7222'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(15);
        ctx.beginPath(); ctx.moveTo(-effect.size * .3, effect.size * .48); ctx.quadraticCurveTo(-effect.size * .18, effect.size * 1.85, 0, effect.size * 3.05); ctx.quadraticCurveTo(effect.size * .18, effect.size * 1.85, effect.size * .3, effect.size * .48); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        ctx.globalAlpha = fade * .72; ctx.strokeStyle = '#ffe1a0'; ctx.lineWidth = mobileSize(1.7);
        ctx.beginPath(); ctx.ellipse(0, effect.size * .32, effect.size * .95, effect.size * .3, timestamp / 190 + effect.y * .01, .15, Math.PI * 1.78); ctx.stroke();
        ctx.globalAlpha = fade * .42; ctx.strokeStyle = '#181114'; ctx.lineWidth = mobileSize(1.3);
        ctx.beginPath(); ctx.ellipse(0, effect.size * .58, effect.size * .7, effect.size * .23, -timestamp / 240 - effect.x * .01, Math.PI, Math.PI * 2.72); ctx.stroke();
        for (let spark = 0; spark < 3; spark++) {
          const orbit = timestamp / 155 + spark * Math.PI * 2 / 3 + effect.y * .02;
          const sx = Math.cos(orbit) * effect.size * (.42 + spark * .08);
          const sy = effect.size * (.9 + spark * .57) + Math.sin(orbit) * effect.size * .17;
          ctx.globalAlpha = fade * (.55 - spark * .1); ctx.fillStyle = spark === 0 ? '#fff0ce' : '#ff9a35';
          ctx.beginPath(); ctx.arc(sx, sy, mobileSize(1.8 + spark * .45), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        if (tigrumRaptorSprite.complete && tigrumRaptorSprite.naturalWidth) {
          const spriteHeight = mobileSize(effect.size * 1.85);
          const spriteWidth = spriteHeight * tigrumRaptorSprite.naturalWidth / tigrumRaptorSprite.naturalHeight;
          const pulse = 1 + Math.sin(timestamp / 72 + effect.y * .02) * .035;
          ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.globalAlpha = fade * .96;
          ctx.filter = 'none';
          ctx.shadowColor = '#ff8a28'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(14);
          ctx.beginPath(); ctx.ellipse(0, 0, spriteWidth * .49, spriteHeight * .48, 0, 0, Math.PI * 2); ctx.clip();
          ctx.drawImage(tigrumRaptorSprite, -spriteWidth * pulse / 2, -spriteHeight * pulse / 2, spriteWidth * pulse, spriteHeight * pulse);
          ctx.restore();
        } else {
          ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle); ctx.globalAlpha = fade * .96;
          ctx.font = '900 ' + mobileSize(effect.size * 1.65) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.shadowColor = '#ff8a28'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(12); ctx.fillText('🐅', 0, 0); ctx.restore();
        }
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
    const chronosEchoActive = abilitySourceIs('chronos') && state.chronosEcho?.life > 0;
    if (!eclipseActive && chronosEchoActive && (state.invulnerable <= 0 || Math.floor(timestamp / 90) % 2 === 0)) {
      const trailOffset = mobileSize(5 + Math.sin(timestamp / 75) * 2.5);
      drawShip(state.player.x - Math.cos(state.player.angle) * trailOffset, state.player.y - Math.sin(state.player.angle) * trailOffset, state.player.radius * .9, currentSkin(), state.player.angle, .28);
      if (state.performanceMode !== 'light') drawShip(state.player.x - Math.cos(state.player.angle) * trailOffset * 2, state.player.y - Math.sin(state.player.angle) * trailOffset * 2, state.player.radius * .82, currentSkin(), state.player.angle, .13);
    }
    const adaptingMahoraga = currentSkin().id === 'mahoraga';
    if (adaptingMahoraga) {
      const wheelRadius = mobileSize(state.player.radius * 2.55);
      const celebrating = state.mahoragaAdaptationVisualTime > 0;
      const wheelFade = celebrating ? clamp(state.mahoragaAdaptationVisualTime / 3, 0, 1) : 1;
      const wheelPulse = state.mahoragaWheelReady || state.mahoragaParryWindow > 0 ? .92 + Math.sin(timestamp / 115) * .08 : 1;
      const rotationSpeed = state.mahoragaWheelReady ? 250 : state.mahoragaParryWindow > 0 || celebrating ? 400 : 8200;
      const idleAlpha = state.mahoragaWheelReady ? .54 : state.mahoragaParryWindow > 0 ? .43 : .24;
      drawMahoragaWheel(state.player.x, state.player.y, wheelRadius, timestamp / rotationSpeed, idleAlpha * wheelFade * wheelPulse, state.mahoragaWheelSegments, state.mahoragaWheelReady);
    }
    const playerSkin = currentSkin();
    const flameStormQActive = playerSkin.id === 'flamestorm' && state.flameStormQIntangible > 0;
    const keepMegumiVisible = playerSkin.id === 'megumi';
    const playerDrawSize = playerSkin.id === 'aurora' ? state.player.radius * 1.1 : state.player.radius;
    if (!eclipseActive && !megumiShadowCloakActive() && !vultureCloakActive() && (state.invulnerable <= 0 || adaptingMahoraga || keepMegumiVisible || flameStormQActive || Math.floor(timestamp / 90) % 2 === 0)) drawShip(state.player.x, state.player.y, playerDrawSize, playerSkin, state.player.angle);
    if (currentSkin().id === 'mahoraga' && state.mahoragaParryWindow > 0) {
      const windowRatio = clamp(state.mahoragaParryWindow / 3, 0, 1);
      ctx.save(); ctx.globalAlpha = .46 + Math.sin(timestamp / 130) * .12; ctx.strokeStyle = '#f7e5bb'; ctx.lineWidth = mobileSize(2.4);
      ctx.shadowColor = '#e4c477'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(17);
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(12 + (1 - windowRatio) * 12), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (currentSkin().id === 'mahoraga' && state.invulnerable > 0) {
      const guardPulse = .48 + Math.sin(timestamp / 95) * .16;
      ctx.save(); ctx.globalAlpha = guardPulse; ctx.strokeStyle = '#e4c477'; ctx.lineWidth = mobileSize(2.2);
      ctx.shadowColor = '#f1d38a'; ctx.shadowBlur = state.performanceMode === 'light' ? 0 : mobileSize(16);
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(21), timestamp / 780, Math.PI * 1.78 + timestamp / 780); ctx.stroke();
      ctx.globalAlpha *= .62; ctx.setLineDash([mobileSize(2.5), mobileSize(5)]); ctx.lineWidth = mobileSize(1.2);
      ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.radius + mobileSize(26), -timestamp / 940, Math.PI * 1.55 - timestamp / 940); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
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
  async function refreshRankAdminAccess() {
    const isPowerProfile = isScoreAdminProfile();
    if (ui.rankAdminPanel) ui.rankAdminPanel.hidden = !isPowerProfile;
    rankAdminSessionActive = false;
    if (!isPowerProfile) return;
    try {
      const session = await window.CV_GAMES_AUTH?.getPowerSession?.();
      rankAdminSessionActive = Boolean(session?.access_token && window.CV_GAMES_AUTH?.isScoreAdmin?.(session.user));
    } catch { rankAdminSessionActive = false; }
    if (ui.rankAdminReset) ui.rankAdminReset.disabled = !rankAdminSessionActive || rankAdminBusy;
    if (ui.rankAdminStatus && !rankAdminBusy) {
      const awaitingLogin = !rankAdminSessionActive || !ui.rankAdminStatus.textContent || ui.rankAdminStatus.textContent.startsWith('Entre na conta');
      if (awaitingLogin) ui.rankAdminStatus.textContent = rankAdminSessionActive
        ? 'Conta Poder autenticada. Use as setas para reorganizar o Top 10.'
        : 'Entre na conta autorizada do perfil Poder pela página Perfil para habilitar estas ações.';
    }
  }
  async function callRankAdminRpc(functionName, payload) {
    if (!isScoreAdminProfile()) throw new Error('Selecione o perfil Poder para administrar o placar.');
    const config = supabaseConfig();
    if (!config) throw new Error('O placar ainda não está configurado.');
    const session = await window.CV_GAMES_AUTH?.getPowerSession?.({ refreshIfClaimsChanged:true });
    if (!session?.access_token || !window.CV_GAMES_AUTH?.isScoreAdmin?.(session.user)) throw new Error('Entre na conta autenticada do perfil Poder.');
    const response = await fetch(config.url.replace(/\/$/, '') + '/rest/v1/rpc/' + functionName, {
      method:'POST',
      headers:Object.assign({}, supabaseHeaders(config, session.access_token), { 'Content-Type':'application/json' }),
      body:JSON.stringify(payload)
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      let reason = detail;
      try { const parsed = JSON.parse(detail); reason = parsed.message || parsed.details || parsed.hint || detail; } catch { /* Mantém a mensagem de texto enviada pelo Supabase. */ }
      throw new Error(`Supabase (${response.status}): ${String(reason || 'confira a migração e a sessão autenticada.').slice(0, 220)}`);
    }
    return response;
  }
  async function moveLeaderboardScore(nickname, direction) {
    if (!rankAdminSessionActive || rankAdminBusy || ![-1, 1].includes(direction)) return;
    rankAdminBusy = true;
    await refreshRankAdminAccess();
    if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = 'Atualizando a posição…';
    try {
      await callRankAdminRpc('starfall_admin_move_score', { p_nickname:nickname, p_direction:direction });
      await refreshLeaderboard();
      if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = 'Posição de ' + displayRankNickname(nickname) + ' atualizada.';
    } catch (error) {
      if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = error?.message || 'Não foi possível mover este piloto.';
    } finally {
      rankAdminBusy = false;
      await refreshRankAdminAccess();
      await refreshLeaderboard();
    }
  }
  async function resetLeaderboard() {
    if (!rankAdminSessionActive || rankAdminBusy) return;
    const confirmAction = window.CV_GAMES_DIALOG?.confirm;
    const confirmed = typeof confirmAction === 'function'
      ? await confirmAction({ title:'Zerar o placar do CV STARFALL?', message:'Todos os recordes compartilhados serão apagados. Essa ação não pode ser desfeita.', confirmText:'Zerar placar', cancelText:'Cancelar', tone:'danger' })
      : window.confirm?.('Apagar todos os recordes compartilhados do CV STARFALL? Essa ação não pode ser desfeita.') === true;
    if (!confirmed) return;
    rankAdminBusy = true;
    await refreshRankAdminAccess();
    if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = 'Apagando os recordes…';
    try {
      const response = await callRankAdminRpc('starfall_admin_reset_scores', {});
      const deleted = await response.json();
      await refreshLeaderboard();
      if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = 'Placar zerado. Registros removidos: ' + (Number(deleted) || 0) + '.';
    } catch (error) {
      if (ui.rankAdminStatus) ui.rankAdminStatus.textContent = error?.message || 'Não foi possível zerar o placar.';
    } finally {
      rankAdminBusy = false;
      await refreshRankAdminAccess();
      await refreshLeaderboard();
    }
  }
  function authorizedNickname(session) {
    const nickname = rankNickname();
    const names = (window.CV_STARFALL_SUPABASE?.allowedNicknames || ['educvv']).map(normalizeRankNickname);
    if (!nickname || !names.includes(nickname)) return '';
    if (nickname === 'educvv') return window.CV_GAMES_AUTH?.isOwner?.(session?.user) ? 'educvv' : '';
    return nickname;
  }
  function renderAuthorizedPilots() {
    if (!ui.authorizedPilots) return;
    const visible = isDeveloperProfile() || profileNickname() === 'lista';
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
    selectedPilotNickname = '';
    prismaAccountAuthorized = false;
    if (state.damageCounterEditing) finishDamageCounterEdit(false);
    secretShipUnlocks = readSecretShipUnlocks();
    if (!isDeveloperProfile()) {
      if (ui.checkpointModal) ui.checkpointModal.hidden = true;
      ui.exitModal?.querySelector('[data-save-and-exit]')?.remove();
    }
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
    void refreshLeaderboard();
    void loadAccountShipProgress();
    reconcileAbilityCollectorAchievement();
    nicknameSettingsLoadPromise = loadNicknameSettings();
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
        const actions = document.createElement('div');
        actions.className = 'starfall-rank-actions';
        const inspect = document.createElement('button');
        inspect.type = 'button'; inspect.className = 'starfall-rank-inspect'; inspect.textContent = 'Ver detalhes';
        inspect.setAttribute('aria-label', `Ver detalhes do recorde de ${displayRankNickname(row.nickname)}`);
        inspect.addEventListener('click', () => showRankDetails(row, position));
        actions.append(inspect);
        if (rankAdminSessionActive) {
          const moves = document.createElement('span'); moves.className = 'starfall-rank-admin-moves';
          const up = document.createElement('button'); up.type = 'button'; up.textContent = '↑'; up.title = 'Subir ' + displayRankNickname(row.nickname) + ' uma posição';
          up.setAttribute('aria-label', up.title); up.disabled = rankAdminBusy || index === 0;
          up.addEventListener('click', () => moveLeaderboardScore(row.nickname, -1));
          const down = document.createElement('button'); down.type = 'button'; down.textContent = '↓'; down.title = 'Descer ' + displayRankNickname(row.nickname) + ' uma posição';
          down.setAttribute('aria-label', down.title); down.disabled = rankAdminBusy || index === rows.length - 1;
          down.addEventListener('click', () => moveLeaderboardScore(row.nickname, 1));
          moves.append(up, down); actions.append(moves);
        }
        item.append(actions);
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
    if (skin.shape === 'training') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image starfall-rank-ferrum-image';
      image.src = 'ferrum-ship.png?v=2'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
      return image;
    }
    if (skin.shape === 'eclipse') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image';
      image.src = 'eclipse-ship.png'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
      return image;
    }
    if (skin.shape === 'flamestorm') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image starfall-rank-flamestorm-image';
      image.src = 'flamestorm-ship-normal.jpeg'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
      return image;
    }
    if (skin.shape === 'dino') {
      const image = document.createElement('img');
      image.className = 'starfall-rank-ship-model starfall-rank-ship-image starfall-rank-tigrum-image';
      image.src = 'tigrum-q-roar.png'; image.alt = ''; image.setAttribute('aria-hidden', 'true');
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
      prism:'M50 4 L82 25 L74 70 L50 97 L26 70 L18 25 Z',
      training:'M50 5 L62 29 L91 72 L72 68 L63 94 L50 85 L37 94 L28 68 L9 72 L38 29 Z',
      megumi:'M50 5 L65 31 L89 66 L66 60 L57 92 L50 79 L43 92 L34 60 L11 66 L35 31 Z',
      mahoraga:'M50 30 L59 36 L70 37 L88 45 L94 53 L84 61 L77 56 L73 71 L63 68 L57 89 L50 96 L43 89 L37 68 L27 71 L23 56 L16 61 L6 53 L12 45 L30 37 L41 36 Z'
    };
    add('path', { d:hulls[skin.shape] || hulls.classic, fill:skin.color, stroke:skin.accent, 'stroke-width':3, 'stroke-linejoin':'round' });
    if (skin.shape === 'prism') {
      add('path', { d:'M50 10 L68 29 L64 67 L50 83 L36 67 L32 29 Z', fill:'#123749', stroke:'#baffff', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('path', { d:'M50 12 L50 78 M31 30 L68 30 M35 66 L65 66', fill:'none', stroke:'#ffe29a', 'stroke-width':2, 'stroke-linecap':'round', opacity:.9 });
      add('path', { d:'M39 84 L50 103 L61 84', fill:'#59e9f2', stroke:'#ffe29a', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('ellipse', { cx:50, cy:44, rx:5, ry:9, fill:'#f5ffff', opacity:.95 });
      return svg;
    }
    if (skin.shape === 'training') {
      add('path', { d:'M50 12 L59 36 L56 69 L50 78 L44 69 L41 36 Z', fill:'#252a32', stroke:'#d5d9e0', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('path', { d:'M15 51 L36 58 L31 69 L13 66 Z M85 51 L64 58 L69 69 L87 66 Z', fill:'#333943', stroke:'#171b20', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('ellipse', { cx:50, cy:35, rx:5, ry:10, fill:'#dce1e8', opacity:.96 });
      add('path', { d:'M38 78 L50 101 L62 78', fill:'#555e6c', stroke:'#21262e', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('path', { d:'M22 54 L34 58 M78 54 L66 58', fill:'none', stroke:'#d6dbe3', 'stroke-width':2, 'stroke-linecap':'round' });
      return svg;
    }
    if (skin.shape === 'mahoraga') {
      add('path', { d:'M50 34 L63 39 L67 56 L60 69 L50 77 L40 69 L33 56 L37 39 Z', fill:'#77838a', stroke:'#39434c', 'stroke-width':2, 'stroke-linejoin':'round' });
      add('path', { d:'M39 44 Q50 39 61 44M39 52Q50 58 61 52M42 61Q50 66 58 61', fill:'none', stroke:'#e4c477', 'stroke-width':1.8, 'stroke-linecap':'round' });
      add('path', { d:'M50 31 L54 35 L50 39 L46 35 Z', fill:'#303a44', stroke:'#f2ead8', 'stroke-width':1.4 });
      add('circle', { cx:50, cy:15, r:12.5, fill:'#29333d', stroke:'#e4c477', 'stroke-width':2.5 });
      add('circle', { cx:50, cy:15, r:8.5, fill:'none', stroke:'#eee8dc', 'stroke-width':1.5 });
      add('path', { d:'M50 6.5V23.5M41.5 15H58.5M43.9 8.9L56.1 21.1M56.1 8.9L43.9 21.1', fill:'none', stroke:'#eee8dc', 'stroke-width':1.7, 'stroke-linecap':'round' });
      add('circle', { cx:50, cy:15, r:3, fill:'#e4c477', stroke:'#fff4dd', 'stroke-width':1 });
      for (const node of [[50,1.5],[59.5,5.5],[63.5,15],[59.5,24.5],[50,28.5],[40.5,24.5],[36.5,15],[40.5,5.5]]) add('circle', { cx:node[0], cy:node[1], r:2, fill:'#e4c477', stroke:'#f7efdc', 'stroke-width':.8 });
      return svg;
    }
    if (skin.shape === 'megumi') {
      add('path', { d:'M50 32 L61 37 L67 58 L58 72 L50 77 L42 72 L33 58 L39 37 Z', fill:'#211b30', stroke:'#bca8df', 'stroke-width':2.2, 'stroke-linejoin':'round' });
      add('path', { d:'M42 44 L50 52 L58 44 M40 59 L50 66 L60 59', fill:'none', stroke:'#d5c7ee', 'stroke-width':2, 'stroke-linecap':'round' });
      add('circle', { cx:50, cy:15, r:14, fill:'#211a2f', stroke:'#c4b2e8', 'stroke-width':2.5 });
      add('circle', { cx:50, cy:15, r:9.4, fill:'none', stroke:'#eee6ff', 'stroke-width':1.4 });
      add('path', { d:'M50 5.5V24.5M40.5 15H59.5M43.3 8.3L56.7 21.7M56.7 8.3L43.3 21.7', fill:'none', stroke:'#eee6ff', 'stroke-width':1.5, 'stroke-linecap':'round' });
      add('circle', { cx:50, cy:15, r:2.8, fill:'#c4b2e8' });
      for (const node of [[50,0.5],[60,5],[64.5,15],[60,25],[50,29.5],[40,25],[35.5,15],[40,5]]) add('circle', { cx:node[0], cy:node[1], r:1.8, fill:'#c4b2e8', stroke:'#f4eeff', 'stroke-width':.7 });
      add('path', { d:'M40 76 L50 98 L60 76', fill:'#6c587f', stroke:'#c4b2e8', 'stroke-width':2 });
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
  function formatRankTimestamp(value) {
    if (!value) return 'Não registrado';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return 'Não registrado';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'medium' }).format(date);
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

    const sections = [makeRankDetailCard('Horários da onda', '◷', [
      ['Início da onda', formatRankTimestamp(row.wave_started_at)],
      ['Fim da onda / derrota', formatRankTimestamp(row.wave_ended_at)]
    ])];
    const upgradeCategories = [
      { title:'Canhões e ataque', icon:'✹', ids:['damage','rapid','spread','pierce','critical','volley','bossDamage','blast'] },
      { title:'Defesa da nave', icon:'🛡️', ids:['repair','shield','armor','regen','drone','lifeSupport','salvageHeal'] },
      { title:'Habilidades especiais', icon:'✦', ids:['cooldown','power','gravityWell','auroraLinkDuration','auroraLinkTargets','auroraLinkDamage','auroraLinkCooldown','aegisOrbitDuration','aegisOrbitCount','aegisOrbitDamage','aegisOrbitCooldown','chronosEchoDuration','chronosEchoDamage','chronosEchoCooldown','tempestTideRadius','tempestTideForce','tempestTideCapacity','tempestTideDamage','tempestTideSweep','tempestTideCooldown','returnCore','redshiftPerimeterDuration','redshiftPerimeterDamage','redshiftPerimeterRange','redshiftPerimeterCooldown','flashTrailDuration','flashTrailDamage','flashTrailDensity','flashTrailCooldown','eclipseVeil','eclipseCooldown','eclipseDamage','eclipseParadoxDuration','eclipseParadoxRadius','eclipseParadoxSuppress','eclipseParadoxSentence','eclipseParadoxCooldown','dinoFangs','dinoStampede','dinoResonance','vultureFoldRange','vulturePulseRadius','vulturePulseDamage','vulturePulseCooldown'] },
      { title:'Chama Carmesim', icon:'🔥', ids:['flameStormDashCore','flameStormVortexCore'] },
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
    await refreshRankAdminAccess();
    const config = supabaseConfig();
    if (!config) { if (ui.rankStatus) ui.rankStatus.textContent = 'Aguardando configuração do Supabase'; renderLeaderboard([]); return; }
    try {
      const url = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores?select=nickname,wave,score,elapsed_seconds,ship_id,ship_name,buff_summary,wave_started_at,wave_ended_at,rank_order&order=rank_order.asc.nullslast,wave.desc,score.desc&limit=11';
      const response = await fetch(url, { headers: supabaseHeaders(config) });
      if (!response.ok) throw new Error('Ranking indisponível');
      const rows = await response.json();
      const myRank = rows.find((row) => normalizeRankNickname(row.nickname) === rankNickname());
      if (myRank) {
        saveNicknameRankBestWave(rankNickname(), myRank.wave);
        state.bestCompletedWave = Math.max(state.bestCompletedWave, readNicknameRankBestWave(rankNickname()));
        saveBestWave();
      }
      renderLeaderboard(rows);
    if (ui.rankStatus) ui.rankStatus.textContent = 'Placar compartilhado';
    } catch {
      if (ui.rankStatus) ui.rankStatus.textContent = 'Placar indisponível agora';
      renderLeaderboard([]);
    }
  }
  let rankSubmissionQueue = Promise.resolve();
  function queueRunSubmission(run) {
    rankSubmissionQueue = rankSubmissionQueue.then(() => submitRun(run)).then(() => refreshLeaderboard()).catch(() => {});
    return rankSubmissionQueue;
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
      if (ui.rankStatus) ui.rankStatus.textContent = rankNickname() === 'educvv'
        ? 'Entre na conta educvv pelo Perfil para publicar seu recorde.'
        : 'Este apelido não está autorizado para o placar.';
      return;
    }
    if (nickname === 'educvv' && !session?.access_token) { if (ui.rankStatus) ui.rankStatus.textContent = 'Entre na conta educvv pelo Perfil para publicar seu recorde.'; return; }
    const base = config.url.replace(/\/$/, '') + '/rest/v1/starfall_scores';
    const headers = supabaseHeaders(config, nickname === 'educvv' ? session.access_token : '');
    try {
      const read = await fetch(base + '?select=wave,score&nickname=eq.' + encodeURIComponent(nickname) + '&limit=1', { headers, keepalive:true });
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
        body: JSON.stringify(run), keepalive:true
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
    const isAurora = currentSkin().id === 'aurora';
    const isAegis = currentSkin().id === 'aegis';
    const isEclipse = currentSkin().id === 'eclipse';
    const isChronos = currentSkin().id === 'chronos';
    const isSaurion = currentSkin().id === 'saurion';
    const isPrimalSaurion = currentSkin().id === 'saurion-primal';
    const isRedshift = currentSkin().id === 'redshift';
    const isFlashblade = currentSkin().id === 'flashblade';
    const isTempest = currentSkin().id === 'tempest';
    const isMahoraga = currentSkin().id === 'mahoraga';
    const isPrisma = currentSkin().id === 'prisma';
    const isTraining = currentSkin().id === 'training';
    const isMegumi = currentSkin().id === 'megumi';
    const isVulture = currentSkin().id === 'vulture';
    const abilityInstruction = isTraining ? 'G ativa a forma · Q 5 investidas · E 3 contrachoques · sem recarga' : isPrisma ? 'E/Q habilidades · G abre Arquivo de Ecos' : isMahoraga ? 'E adaptação · Q Corte Mundial · G volta à Umbra' : isMegumi ? 'E técnica sombria · Q invoca Mahoraga · G volta à forma normal' : isVulture ? 'Q míssil soma energia · toque duas vezes para consumir sucata · segure Q absorve · E dobra · G Ult com 8 sucatas' : isAurora ? 'E Explosão Nova · Q Elo Estelar · G Coroa da Hipernova' : isAegis ? 'E barreira · Q Órbitas Sentinelas' : isEclipse ? 'E Santuário · Q Paradoxo Absoluto' : isChronos ? 'E dobra temporal · Q Ecos' : isPrimalSaurion ? 'E Chamado Primal · Q Arsenal Jurássico · Z fúria do Rex · X investida do Carnotauro' : isSaurion ? 'E Rugido · Q Investida do Tigre' : isRedshift ? 'E reflete projéteis · Q Perímetro' : isFlashblade ? 'E Corte Flash · Q Impulso' : isTempest ? 'E Poço Negro · Q Maré Reversa' : 'habilidade E';
    const moveInstruction = state.controlMode === 'keys' ? 'WASD/setas' : state.controlMode === 'touch' ? 'toque e arraste' : 'analógico virtual';
    const testHint = isTraining && isDeveloperProfile() ? ' · V carrega as quatro placas do Aríete de Aço'
      : isAurora && isDeveloperProfile() ? ' · V completa as seis cargas da ult'
      : isPrimalSaurion && isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun ? ' · modo dev: Q/E substitui o dinossauro da habilidade'
      : isVulture && profileNickname() === 'educvv dev' ? ' · V adiciona 8 sucatas para teste' : '';
    if (ui.controlHint) ui.controlHint.textContent = moveInstruction + ' ou WASD/setas movem · ' + abilityInstruction + ' · R liga/desliga os tiros automáticos' + testHint + '.';
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
    const isAllowed = isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun;
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
    if (!isDeveloperProfile() || state.dailyChallenge || state.championshipRun || !['playing', 'paused'].includes(state.mode)) return;
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
    state.player.speed = currentSkin().id === 'training' ? 234 : 260;
    state.player.fireRate = .34;
    state.player.spread = 1;
    state.maxLives = 6;
    state.lives = Math.min(state.lives, 3);
    state.shields = 0;
    state.tempShields = 0;
    state.abilityCooldown = 0;
    state.mahoragaParryWindow = 0; state.mahoragaParryCooldown = 0; state.mahoragaShieldHitCooldown = 0; state.mahoragaResistanceType = ''; state.mahoragaResistanceUntilWave = 0; state.mahoragaResistancePower = 0; state.mahoragaCycleStartWave = state.wave; state.mahoragaWheelSegments = 0; state.mahoragaWheelReady = false; state.mahoragaAdaptationVisualTime = 0; state.mahoragaSlashCooldown = 0; state.mahoragaSlashCooldownBonus = 0; state.mahoragaProgress = {}; state.mahoragaAdaptationLevels = {}; state.mahoragaAdaptationWaves = {}; state.mahoragaDamageRemainders = {}; state.mahoragaLastType = '';
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
    state.singularityRadius = 300;
    state.singularityDuration = 7;
    state.reflectTime = 0;
    state.reflectContacts = new Set();
    state.reflectDamageBonus = 0;
    state.reflectDurationBonus = 0;
    state.eclipseParadox = null;
    state.eclipseParadoxCooldown = 0;
    state.eclipseParadoxDurationBonus = 0;
    state.eclipseParadoxRadiusBonus = 0;
    state.eclipseParadoxSuppressBonus = 0;
    state.eclipseParadoxDamageBonus = 0;
    state.eclipseParadoxCooldownBonus = 0;
    state.dinoRoarBonus = 0;
    state.dinoRoarRangeBonus = 0;
    state.dinoRoarCharges = 2;
    state.dinoRoarRecharge = 0;
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
    if (!isDeveloperProfile() || state.dailyChallenge || state.championshipRun || !['paused', 'upgrade'].includes(state.mode)) return;
    if (state.adminBuffsActive) removeAllBuffs();
    else grantAllUpgrades();
    updateHud();
    updateAbilityButton();
    updateAdminToolsUI();
    toast(state.adminBuffsActive ? 'TODOS OS BUFFS ATIVADOS' : 'BUFFS REMOVIDOS');
  }
  function toggleAdminCooldown() {
    if (!isDeveloperProfile() || state.dailyChallenge || state.championshipRun || !['paused', 'upgrade'].includes(state.mode)) return;
    state.adminNoCooldown = !state.adminNoCooldown;
    if (state.adminNoCooldown) state.abilityCooldown = 0;
    updateAbilityButton();
    updateAdminToolsUI();
    toast(state.adminNoCooldown ? 'HABILIDADES SEM RECARGA' : 'RECARGA DAS HABILIDADES ATIVADA');
  }
  window.addEventListener('cv-games-profile-change', handleProfileChange);
  window.addEventListener('cv-games-wallet-change', (event) => {
    const nickname = normalizeRankNickname(championshipProgress.nickname || rankNickname());
    const changedNickname = normalizeRankNickname(event.detail?.nickname || '');
    if (!changedNickname || changedNickname !== nickname) return;
    const balance = Math.max(0, Math.min(10000000, Math.floor(Number(event.detail?.balance) || 0)));
    if (balance === Number(championshipProgress.cvCoins || 0)) return;
    championshipProgress.cvCoins = balance;
    writeChampionshipProgressLocal();
    if (championshipCloudReady && !isTestProfile(nickname)) scheduleChampionshipCloudSave();
    if (championshipUi.modal && !championshipUi.modal.hidden) renderChampionshipMenu();
  });
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
    const modalOpen = [ui.missionSetupModal, ui.exitModal, ui.settingsModal, ui.shipModal, ui.prismWheel, ui.prismRankNotice, ui.checkpointModal, ui.achievementsModal, ui.dailySummaryModal, championshipUi.modal, ui.pilotNicknameModal]
      .some((modal) => modal && !modal.hidden);
    ui.audio.classList.toggle('is-menu-hidden', modalOpen);
    if (modalOpen) {
      const audioToggle = ui.audio.querySelector('[data-audio-toggle]');
      const audioPanel = ui.audio.querySelector('[data-audio-panel]');
      if (audioPanel) audioPanel.hidden = true;
      audioToggle?.setAttribute('aria-expanded', 'false');
    }
  }
  function openMissionSetup(dailyChallenge = false, championshipRun = false) {
    if (!['intro', 'gameover'].includes(state.mode) || !ui.missionSetupModal) return;
    refreshDeviceSizing();
    if (state.preferencesConfigured) { startGame(dailyChallenge, null, championshipRun); return; }
    state.pendingDailyChallenge = dailyChallenge;
    state.pendingChampionshipRun = championshipRun;
    ui.missionSetupModal.hidden = false;
    syncAudioVisibility();
    ui.missionSetupModal.querySelector('[data-confirm-mission-setup]')?.focus();
  }
  function closeMissionSetup() {
    if (!ui.missionSetupModal) return;
    ui.missionSetupModal.hidden = true;
    const dailyChallenge = state.pendingDailyChallenge;
    const championshipRun = state.pendingChampionshipRun;
    state.pendingDailyChallenge = false;
    state.pendingChampionshipRun = false;
    syncAudioVisibility();
    const returnTarget = ui.dailySummaryModal && !ui.dailySummaryModal.hidden
      ? ui.dailySummaryStart
      : championshipRun ? championshipUi.open : dailyChallenge ? ui.dailyStart : ui.start;
    returnTarget?.focus();
  }
  function confirmMissionSetup() {
    const dailyChallenge = state.pendingDailyChallenge;
    const championshipRun = state.pendingChampionshipRun;
    state.pendingDailyChallenge = false;
    state.pendingChampionshipRun = false;
    state.preferencesConfigured = true;
    saveNicknameSettings();
    if (ui.missionSetupModal) ui.missionSetupModal.hidden = true;
    syncAudioVisibility();
    startGame(dailyChallenge, null, championshipRun);
  }
  function openSavedMissionPrompt(checkpoint) {
    if (!isDeveloperProfile()) { openMissionSetup(); return; }
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
    requestPilotNickname(() => {
      const checkpoint = readMissionCheckpoint();
      if (checkpoint) { openSavedMissionPrompt(checkpoint); return; }
      openMissionSetup();
    });
  }
  function resumeSavedMission() {
    if (!isDeveloperProfile()) { closeSavedMissionPrompt(); openMissionSetup(); return; }
    const checkpoint = readMissionCheckpoint();
    if (!checkpoint) { closeSavedMissionPrompt(); openMissionSetup(); return; }
    checkpoint.wave = Math.max(Number(checkpoint.wave) || 1, readProfileResumeWave());
    if (ui.checkpointModal) ui.checkpointModal.hidden = true;
    syncAudioVisibility();
    startGame(false, checkpoint);
  }
  function startFreshMissionFromPrompt() {
    if (!isDeveloperProfile()) { closeSavedMissionPrompt(); openMissionSetup(); return; }
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
    if (!isDeveloperProfile()) return;
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
    const canSaveMission = isDeveloperProfile() && ['playing', 'paused'].includes(state.mode) && !state.dailyChallenge && !state.championshipRun;
    let saveButton = null;
    if (canSaveMission) saveButton = createExitChoiceButton('data-save-and-exit', 'SALVAR E SAIR', 'button-secondary');
    else ui.exitModal.querySelector('[data-save-and-exit]')?.remove();
    const finalizeButton = createExitChoiceButton('data-finalize-from-exit', 'FINALIZAR MISSÃO', 'button-primary');
    if (saveButton) saveButton.hidden = false;
    if (finalizeButton) finalizeButton.hidden = !activeMission;
    const confirmButton = ui.exitModal.querySelector('[data-confirm-exit]');
    if (confirmButton) confirmButton.hidden = activeMission;
    const cancelButton = ui.exitModal.querySelector('[data-cancel-exit]');
    if (cancelButton) cancelButton.textContent = activeMission ? 'CONTINUAR MISSÃO' : 'CANCELAR';
    const copy = ui.exitModal.querySelector('h2 + p');
    if (copy) copy.textContent = activeMission
      ? state.dailyChallenge ? 'Você pode continuar o desafio ou encerrá-lo agora.' : isDeveloperProfile() ? 'A missão já é salva ao pausar. Escolha se quer guardá-la para depois ou encerrar agora.' : 'Você pode continuar jogando ou finalizar esta missão agora.'
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
    state.pendingChampionshipRun = false;
    state.championshipRun = false;
    state.championshipBestWave = 0;
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
    [ui.missionSetupModal, ui.exitModal, ui.checkpointModal, ui.settingsModal, ui.shipModal, ui.achievementsModal, ui.dailySummaryModal, championshipUi.modal, ui.pilotNicknameModal]
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
  document.querySelectorAll('[data-close-saurion-picker]').forEach((button) => button.addEventListener('click', closeSaurionSummonPicker));
  document.querySelectorAll('[data-saurion-summon-choice]').forEach((button) => button.addEventListener('click', () => {
    const key = pendingSaurionSummonKey;
    const creatureId = button.dataset.saurionSummonChoice;
    closeSaurionSummonPicker();
    if (key) summonSaurionCreature(key, creatureId);
  }));
  ui.saurionSummonPicker?.addEventListener('click', (event) => { if (event.target === ui.saurionSummonPicker) closeSaurionSummonPicker(); });
  ui.eclipseSkipCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    state.eclipseSkipVideoEnabled = checkbox.checked;
    ui.eclipseSkipCheckboxes.forEach((item) => { item.checked = checkbox.checked; });
    saveNicknameSettings();
  }));
  ui.damageCounterCheckbox?.addEventListener('change', () => {
    state.damageCounterEnabled = ui.damageCounterCheckbox.checked;
    if (!state.damageCounterEnabled) state.damageCounterPopups = [];
    saveNicknameSettings();
    updateAbilityButton();
    draw(performance.now());
  });
  ui.editDamageCounter?.addEventListener('click', beginDamageCounterEdit);
  ui.saveDamageCounter?.addEventListener('click', () => finishDamageCounterEdit(true));
  ui.cancelDamageCounter?.addEventListener('click', () => finishDamageCounterEdit(false));
  $('[data-open-achievements]')?.addEventListener('click', openAchievements);
  ui.pilotNicknameForm?.addEventListener('submit', confirmPilotNickname);
  ui.pilotNicknameInput?.addEventListener('input', updatePilotNicknameFeedback);
  document.querySelectorAll('[data-cancel-pilot-nickname]').forEach((button) => button.addEventListener('click', closePilotNicknamePrompt));
  ui.dailyStart?.addEventListener('click', () => { void openChampionshipMenu(); });
  championshipUi.close?.addEventListener('click', closeChampionshipMenu);
  championshipUi.start?.addEventListener('click', beginChampionshipMission);
  championshipUi.spin?.addEventListener('click', () => { void spinChampionshipWheel(); });
  championshipUi.spinBundle?.addEventListener('click', () => { void spinChampionshipWheel(true); });
  championshipUi.classicDaily?.addEventListener('click', () => { closeChampionshipMenu(); requestPilotNickname(() => openMissionSetup(true)); });
  championshipUi.modal?.addEventListener('click', (event) => { if (event.target === championshipUi.modal) closeChampionshipMenu(); });
  window.setInterval(() => { updateDailyChallengeInfo(); if (championshipUi.modal && !championshipUi.modal.hidden) renderChampionshipMenu(); }, 1000);
  document.querySelectorAll('[data-close-mission-setup]').forEach((button) => button.addEventListener('click', closeMissionSetup));
  $('[data-confirm-mission-setup]')?.addEventListener('click', confirmMissionSetup);
  ui.stop?.addEventListener('click', openExitConfirmation);
  $('[data-exit-from-menu]')?.addEventListener('click', openExitConfirmation);
  document.querySelectorAll('[data-cancel-exit]').forEach((button) => button.addEventListener('click', closeExitConfirmation));
  $('[data-confirm-exit]')?.addEventListener('click', returnToMenu);
  document.querySelectorAll('[data-close-settings]').forEach((button) => button.addEventListener('click', closeSettings));
  document.querySelectorAll('[data-close-ships]').forEach((button) => button.addEventListener('click', closeShips));
  $('[data-close-ship-details]')?.addEventListener('click', () => ui.shipDetailsDialog?.close());
  ui.saurionDinosOpen?.addEventListener('click', () => {
    if (!ui.saurionDinoCatalog) return;
    ui.saurionDinoCatalog.hidden = false;
    ui.saurionDinosOpen.setAttribute('aria-expanded', 'true');
    ui.saurionDinoCatalog.scrollIntoView({ block:'nearest', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  $('[data-saurion-dinos-back]')?.addEventListener('click', () => {
    if (ui.saurionDinoCatalog) ui.saurionDinoCatalog.hidden = true;
    ui.saurionDinosOpen?.setAttribute('aria-expanded', 'false');
    ui.saurionDinosOpen?.focus();
  });
  ui.shipDetailsDialog?.addEventListener('click', (event) => { if (event.target === ui.shipDetailsDialog) ui.shipDetailsDialog.close(); });
  document.querySelectorAll('[data-secret-unlock-close]').forEach((button) => button.addEventListener('click', closeSecretShipUnlock));
  ui.secretUnlockForm?.addEventListener('submit', submitSecretShipUnlock);
  ui.secretUnlockDialog?.addEventListener('click', (event) => { if (event.target === ui.secretUnlockDialog) closeSecretShipUnlock(); });
  ui.secretUnlockDialog?.addEventListener('cancel', () => { ui.secretUnlockError.hidden = true; });
  document.querySelectorAll('[data-close-achievements]').forEach((button) => button.addEventListener('click', closeAchievements));
  $('[data-close-rank-dialog]')?.addEventListener('click', () => ui.rankDialog?.close());
  ui.rankDialog?.addEventListener('click', (event) => { if (event.target === ui.rankDialog) ui.rankDialog.close(); });
  ui.rankAdminReset?.addEventListener('click', resetLeaderboard);
  ui.copyAuthorizedPilots?.addEventListener('click', copyAuthorizedPilots);
  document.querySelectorAll('[data-close-daily-summary]').forEach((button) => button.addEventListener('click', closeDailySummary));
  ui.dailySummaryStart?.addEventListener('click', () => requestPilotNickname(() => openMissionSetup(true)));
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
  function bindVultureAwareQControl(button) {
    if (!button) return;
    let touchActivationAt = 0;
    let suppressVultureClickUntil = 0;
    button.addEventListener('pointerdown', (event) => {
      if (currentSkin().id === 'vulture') {
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        if (beginVultureQPress('pointer', event.pointerId)) {
          try { button.setPointerCapture(event.pointerId); } catch { /* O toque pode perder a captura ao trocar de tela. */ }
        }
        return;
      }
      if (!event.pointerType || event.pointerType === 'mouse') return;
      event.preventDefault();
      touchActivationAt = performance.now();
      activateSecondaryAbility();
    }, { passive:false });
    button.addEventListener('pointerup', (event) => {
      if (currentSkin().id !== 'vulture') return;
      if (finishVultureQPress('pointer', event.pointerId)) suppressVultureClickUntil = performance.now() + 800;
    });
    button.addEventListener('pointercancel', (event) => {
      if (currentSkin().id === 'vulture') finishVultureQPress('pointer', event.pointerId, false);
    });
    button.addEventListener('click', (event) => {
      if (currentSkin().id === 'vulture') {
        if (event.detail > 0 && performance.now() < suppressVultureClickUntil) return;
        activateVultureQ();
        return;
      }
      if (event.detail > 0 && touchActivationAt > 0 && performance.now() - touchActivationAt < 800) return;
      activateSecondaryAbility();
    });
  }
  function toggleAutomaticFire() {
    if (!['playing', 'paused', 'upgrade'].includes(state.mode)) return;
    state.automaticFireEnabled = !state.automaticFireEnabled;
    toast(state.automaticFireEnabled ? 'DISPARO AUTOMÁTICO ATIVADO · R' : 'DISPARO AUTOMÁTICO PAUSADO · R');
    updateAbilityButton();
  }
  bindAbilityControl(ui.ability, activateAbility);
  bindVultureAwareQControl(ui.eclipseQ);
  bindAbilityControl(ui.saurionCommand, activateSaurionCommand);
  ui.vultureUlt?.addEventListener('click', activateVultureUltimate);
  ui.auroraUlt?.addEventListener('click', activateAuroraUltimate);
  ui.ferrumUlt.addEventListener('click', activateFerrumRam);
  ui.mahoragaReturn?.addEventListener('click', () => deactivateMahoragaForm());
  ui.fireToggle?.addEventListener('click', toggleAutomaticFire);
  ui.favorite?.addEventListener('click', toggleFavorite);
  window.addEventListener('keydown', (event) => {
    const textEntryTarget = event.target.closest?.('input,textarea,select,[contenteditable="true"]');
    if (textEntryTarget && event.code !== 'Escape') return;
    if (ui.saurionSummonPicker && !ui.saurionSummonPicker.hidden) {
      if (event.code === 'Escape') { event.preventDefault(); closeSaurionSummonPicker(); }
      return;
    }
    if (event.code === 'Escape' && ui.pilotNicknameModal && !ui.pilotNicknameModal.hidden) { event.preventDefault(); closePilotNicknamePrompt(); return; }
    const editableTarget = event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]');
    if (state.eclipsePhase === 'cinematic' || state.megumiSummonPhase === 'cinematic') { event.preventDefault(); return; }
    if (!editableTarget && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.code === 'KeyF' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && isDeveloperProfile() && !state.dailyChallenge && !state.championshipRun && ['playing', 'paused'].includes(state.mode) && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) {
      event.preventDefault(); clearCurrentWaveForAdmin(); return;
    }
    const chargeShortcut = event.code === 'KeyV' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && state.mode === 'playing' && !editableTarget;
    if (chargeShortcut && isDeveloperProfile() && currentSkin().id === 'training' && !state.ferrumRam && state.ferrumRamCharges <= 0) {
      event.preventDefault();
      state.ferrumPressure = FERRUM_MAX_PRESSURE;
      updateFerrumHud();
      toast('TESTE FERRUM · ARÍETE DE AÇO CARREGADO');
      tone(880, .18, 'triangle', .04);
      return;
    }
    if (chargeShortcut && isDeveloperProfile() && currentSkin().id === 'aurora') {
      event.preventDefault(); state.auroraUltCharge = 6; updateAuroraUltHud(); toast('TESTE AURORA · COROA DA HIPERNOVA CARREGADA'); tone(880, .18, 'sine', .04); return;
    }
    if (chargeShortcut && profileNickname() === 'educvv dev' && currentSkin().id === 'vulture' && !state.dailyChallenge && !state.championshipRun && state.vultureEvolutionTime <= 0 && state.vultureOverloadTime <= 0) {
      event.preventDefault(); state.vultureScrap = 8; state.vultureOverloadCountdown = 10; updateHud(); toast('TESTE VULTURE · 8 SUCATAS · Q OU G EM 10s'); tone(540, .2, 'sawtooth', .04); return;
    }
    if (event.code === 'KeyR' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !editableTarget && ['playing', 'paused', 'upgrade'].includes(state.mode)) {
      event.preventDefault(); toggleAutomaticFire(); return;
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
    if (event.code === 'KeyG' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) {
      if (currentSkin().id === 'vulture') { event.preventDefault(); activateVultureUltimate(); return; }
      if (currentSkin().id === 'aurora') { event.preventDefault(); activateAuroraUltimate(); return; }
      if (currentSkin().id === 'training') { event.preventDefault(); activateFerrumRam(); return; }
      if (deactivateMahoragaForm()) { event.preventDefault(); return; }
      openPrismWheel();
    }
    if (event.code === 'KeyE' && !event.repeat) activateAbility();
    if (event.code === 'KeyQ' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]')) {
      if (currentSkin().id === 'vulture') { event.preventDefault(); beginVultureQPress('keyboard'); }
      else activateSecondaryAbility();
    }
    if ((event.code === 'KeyZ' || event.code === 'KeyX') && !event.repeat && !editableTarget && currentSkin().id === 'saurion-primal') {
      const commandSummon = event.code === 'KeyZ' ? saurionSummons().find((summon) => summon.kind === 'rex') : saurionSummons().find((summon) => summon.kind === 'carno');
      const commandReady = Boolean(commandSummon && (event.code === 'KeyX' ? commandSummon.commandCooldown <= 0 : !commandSummon.rageUsed));
      if (commandReady) { event.preventDefault(); activateSaurionCommand(commandSummon); }
    }
    if (!editableTarget && state.mode === 'playing' && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(event.code)) state.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => { state.keys.delete(event.code); if (event.code === 'KeyQ') finishVultureQPress('keyboard'); });
  window.addEventListener('blur', () => { finishVultureQPress('keyboard', null, false); finishVultureQPress('pointer', state.vultureQPressPointerId, false); state.keys.clear(); state.pointer.active = false; releaseAnalog(); if (state.mode === 'playing' && state.eclipsePhase !== 'cinematic' && state.megumiSummonPhase !== 'cinematic') pauseGame(); });
  window.addEventListener('pagehide', () => { if (state.mode === 'playing' && state.eclipsePhase !== 'cinematic' && state.megumiSummonPhase !== 'cinematic') pauseGame(); else if (state.mode === 'paused') saveMissionCheckpoint(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing' && state.eclipsePhase !== 'cinematic' && state.megumiSummonPhase !== 'cinematic') {
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
    if (event === 'SIGNED_IN') window.setTimeout(() => { loadAccountShipProgress(); nicknameSettingsLoadPromise = loadChampionshipProgress().then(() => loadNicknameSettings()); void refreshLeaderboard(); }, 0);
    if (event === 'SIGNED_OUT') window.setTimeout(() => { clearAccountShipProgress(); nicknameSettingsLoadPromise = loadChampionshipProgress().then(() => loadNicknameSettings()); void refreshLeaderboard(); }, 0);
  });
  createDeviceIndicators(); createAdminTools(); updateDeviceTypeUI(); renderSkinPicker(); renderAuthorizedPilots(); updateEquippedShip(); updateControlUI(); updatePerformanceModeUI(); updateHud(); updateFavorite(); resize(); setMode('intro'); draw(0); refreshLeaderboard(); loadAccountShipProgress(); nicknameSettingsLoadPromise = loadChampionshipProgress().then(() => loadNicknameSettings());
})();
