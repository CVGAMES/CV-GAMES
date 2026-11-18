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
  const mahoragaFormWaveLimit = 5;
  const mahoragaFormCooldownDuration = 45;
  const favoritesKey = 'cv-games-favorites';
  const eclipseSprite = new Image();
  eclipseSprite.src = new URL('eclipse-ship.png', document.baseURI).href;
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
    stage: $('[data-stage]'), overlay: $('[data-main-overlay]'), title: $('[data-overlay-title]'), copy: $('[data-overlay-copy]'), start: $('[data-start]'), missionSetupModal: $('[data-mission-setup]'), exitModal: $('[data-exit-confirmation]'), stop: $('[data-stop-mission]'), audio: $('[data-game-audio]'), eclipseCutscene: $('[data-eclipse-cutscene]'), eclipseVideo: $('[data-eclipse-video]'), megumiCutscene: $('[data-megumi-cutscene]'),
    wave: $('[data-wave]'), score: $('[data-score]'), lives: $('[data-lives]'), shields: $('[data-shields]'), healthFill: $('[data-health-fill]'), best: $('[data-best]'), overlayBest: $('[data-overlay-best]'),
    zone: $('[data-zone]'), timer: $('[data-timer]'), upgrade: $('[data-upgrade]'), upgradeOptions: $('[data-upgrade-options]'), pause: $('[data-pause]'), pauseIcon: $('[data-pause-icon]'), pauseLabel: $('[data-pause-label]'), abilityWrap: $('.starfall-primary-ability-wrap'), ability: $('[data-ability]'), abilityCooldown: $('[data-ability-cooldown]'), eclipseQWrap: $('[data-eclipse-q-wrap]'), eclipseQ: $('[data-eclipse-q]'), eclipseQCooldown: $('[data-eclipse-q-cooldown]'), panel: $('[data-fullscreen-root]'), hud: $('.starfall-hud'), status: $('[data-status]'), toast: $('[data-toast]'), favorite: $('[data-game-favorite]'),
    skinPicker: $('[data-skin-picker]'), equippedShip: $('[data-equipped-ship]'), secretUnlockDialog: $('[data-secret-unlock-dialog]'), secretUnlockForm: $('[data-secret-unlock-form]'), secretUnlockInput: $('[data-secret-unlock-input]'), secretUnlockError: $('[data-secret-unlock-error]'), eclipseSkipOptions: Array.from(document.querySelectorAll('[data-eclipse-skip-option]')), eclipseSkipCheckboxes: Array.from(document.querySelectorAll('[data-eclipse-skip-video]')),
    shipModal: $('[data-ship-modal]'), shipDetailsDialog: $('[data-ship-details-dialog]'), shipDetailsKicker: $('[data-ship-details-kicker]'), shipDetailsTitle: $('[data-ship-details-title]'), shipDetailsSummary: $('[data-ship-details-summary]'), shipDetailsList: $('[data-ship-details-list]'), shipDetailsCooldowns: $('[data-ship-details-cooldowns]'), settingsModal: $('[data-settings-modal]'),
    damageCounterOptions: $('[data-damage-counter-option]'), damageCounterCheckbox: $('[data-damage-counter]'), editDamageCounter: $('[data-edit-damage-counter]'), damageCounterEditor: $('[data-damage-counter-editor]'), saveDamageCounter: $('[data-save-damage-counter]'), cancelDamageCounter: $('[data-cancel-damage-counter]'), fireToggle: $('[data-fire-toggle]'), settingsSyncStatus: $('[data-settings-sync-status]'), performanceModeButtons: Array.from(document.querySelectorAll('[data-performance-mode]')), mahoragaAwakening: $('[data-mahoraga-awakening]'), mahoragaAwakeningType: $('[data-mahoraga-awakening-type]'), mahoragaAwakeningBuff: $('[data-mahoraga-awakening-buff]'), mahoragaReadout: $('[data-mahoraga-readout]'), megumiFormTimer: $('[data-megumi-form-timer]'), mahoragaReturn: $('[data-mahoraga-return]'),
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
    { id: 'aurora', name: 'Aurora', color: '#7df7e8', accent: '#bffff5', ability: 'Explosão Nova', abilityShort: 'NOVA', cooldown: 22, cooldownQ: 24, shape: 'classic', description: 'E libera uma Explosão Nova mais ampla e poderosa. Com Q ativo, ela espalha o dano entre os inimigos ligados. Elo Estelar conecta até dez alvos por até nove segundos.' },
    { id: 'training', name: 'Ferrum', color: '#aeb5c0', accent: '#282d36', ability: '', abilityShort: '', cooldown: 0, cooldownQ: 0, shape: 'training', noAbilities: true, description: 'Nave de treino sem habilidades E ou Q. Move-se 10% mais devagar e recebe metade do dano.' },
    { id: 'aegis', name: 'Aegis', color: '#72bdff', accent: '#c9eaff', ability: 'Barreira Aegis', abilityShort: 'BARREIRA', cooldown: 25, cooldownQ: 30, shape: 'shield', unlockWave: 10, description: 'E cria uma barreira que absorve três impactos. Q invoca Órbitas Sentinelas: fragmentos orbitais interceptam tiros e os convertem em projéteis teleguiados; os fragmentos intactos são lançados contra inimigos ao final.' },
    { id: 'chronos', name: 'Chronos', color: '#c897ff', accent: '#efd5ff', ability: 'Dobra Temporal', abilityShort: 'TEMPO', cooldown: 22, cooldownQ: 24, shape: 'ring', unlockWave: 20, description: 'E desacelera fortemente inimigos e projéteis por mais tempo. Q cria Ecos do Futuro que repetem os disparos após curto atraso, com dano aumentado.' },
    { id: 'tempest', name: 'Tempestade', color: '#87aaff', accent: '#d5dcff', ability: 'Poço Negro', abilityShort: 'POÇO NEGRO', cooldown: 30, cooldownQ: 24, shape: 'wing', unlockWave: 30, description: 'E dispara um Poço Negro maior e duradouro que puxa inimigos e causa dano repetido. Q libera a Maré Reversa, que causa dano, empurra inimigos e desvia tiros próximos; começa com quatro cargas, ampliáveis até seis. As cargas só recarregam juntas depois que todas forem usadas.' },
    { id: 'flashblade', name: 'Flashblade', color: '#ffc86e', accent: '#fff0b4', ability: 'Corte Flash', abilityShort: 'CORTE', cooldown: 22, cooldownQ: 24, shape: 'blade', unlockWave: 40, description: 'E lança uma lâmina veloz que persegue alvos, ricocheteia e causa dano aumentado. Q acelera a nave em 2,6× e deixa rastros cortantes por até nove segundos.' },
    { id: 'redshift', name: 'Bastião Rubro', color: '#d83a2e', accent: '#ffd06a', ability: 'Escudo de Retorno', abilityShort: 'RETORNO', cooldown: 30, cooldownQ: 28, shape: 'reflector', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'cypher'], description: 'E reflete projéteis. Q cria um Perímetro de Cerco móvel por 6 segundos; inimigos que cruzam os feixes recebem dano.' },
    { id: 'eclipse', name: 'Eclipse', color: '#a879ff', accent: '#e8dcff', ability: 'Expansão de Domínio', abilityShort: 'DOMÍNIO', cooldown: 30, shape: 'eclipse', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'nys'], description: 'E: abre o Santuário Malevolente com cortes por 10 segundos. Q: Paradoxo Absoluto distorce o espaço, desacelera e interrompe inimigos próximos; ao colapsar, sentencia os alvos conforme o tempo que ficaram presos.' },
    { id: 'saurion', name: 'Saurion', color: '#42d66e', accent: '#d4ff72', ability: 'Rugido de Garras', abilityShort: 'RUGIDO', cooldown: 28, cooldownQ: 32, shape: 'dino', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'adm', 'yago k'], description: 'E: duas cargas de Rugido atordoam uma grande área e soltam garras fortalecidas com mais frequência. Q causa dano extra aos alvos marcados.' },
    { id: 'prisma', name: 'Prisma Real', color: '#59e9f2', accent: '#ffe29a', ability: 'Núcleo Prisma', abilityShort: 'PRISMA', cooldown: 28, cooldownQ: 28, shape: 'prism', secret: true, ownerOnly: true, description: 'Nave secreta da conta educvv. Configure uma habilidade para E e outra para Q no Arquivo de Ecos, aberto pela tecla G. Esta nave não envia resultados ao placar.' },
    { id: 'mahoraga', name: 'Mahoraga', color: '#c9d0cf', accent: '#e4c477', ability: 'Adaptação Divina', abilityShort: 'ADAPTAÇÃO', cooldown: 14, cooldownQ: 12, shape: 'mahoraga', hiddenFromHangar: true, description: 'Forma interna da Umbra. E cria um escudo por 3 segundos que reduz até 90% do dano. Cinco impactos do mesmo tipo concedem resistência a essa categoria por cinco ondas; cada tipo se adapta separadamente até 70%. Repetir um tipo já adaptado fortalece temporariamente o dano.' },
    { id: 'megumi', name: 'Umbra', color: '#373448', accent: '#a99acb', ability: 'Ritual Umbral', abilityShort: 'UMBRAL', cooldown: 20, cooldownQ: 45, shape: 'megumi', secret: true, allowedProfiles: ['educvv dev', 'educvv dev1', 'felype j'], description: 'Nave secreta. E sorteia uma técnica sombria: Fuga dos Coelhos, Ocultação nas Sombras ou explosão elétrica de Nue. O ícone mostra a variação; a recarga do E cai de 20 para 15 segundos com cinco melhorias. Q invoca o Guardião com a cutscene; a forma Mahoraga dura cinco ondas completas e, ao terminar, entra em recarga de 45 segundos.' }
  ];
  const secondaryAbilityNames = Object.freeze({ aurora:'Elo Estelar', aegis:'Órbitas Sentinelas', chronos:'Ecos do Futuro', tempest:'Maré Reversa', flashblade:'Rastro de Ruptura', redshift:'Perímetro de Cerco', eclipse:'Paradoxo Absoluto', saurion:'Estouro da Manada', prisma:'Dobra de Horizonte', mahoraga:'Espada da Exterminação', megumi:'Ritual do Guardião' });
  const megumiTechniques = Object.freeze({
    rabbits:{ id:'rabbits', name:'Fuga dos Coelhos', short:'COELHOS', icon:'🐇', description:'Cinco shikigami-armadilha se espalham, atiram e atraem inimigos.' },
    shadow:{ id:'shadow', name:'Ocultação nas Sombras', short:'SOMBRA', icon:'◑', description:'Fica invisível, dispara projéteis sombrios, atravessa as bordas e recolhe recursos.' },
    nue:{ id:'nue', name:'Nue · Explosão Elétrica', short:'NUE', icon:'⚡', description:'Invoca uma descarga elétrica que explode em área e atinge inimigos próximos.' }
  });
  let megumiCutsceneTimer = 0;
  const shipAbilityDetails = Object.freeze({
    aurora: { e:'A Explosão Nova causa mais dano em uma área maior ao redor da nave; sua recarga é de 22 segundos.', q:'Conecta até dez alvos por 7 segundos, com pulsos a cada 0,78s. Contra um chefe sozinho, concentra os pulsos nele. Cada vida perdida pela nave durante o Elo causa 2 de dano a cada alvo conectado. Melhorias prolongam a duração até 9s e aumentam o dano dos pulsos até 3; a recarga cai de 24s para 18s.' },
    aegis: { e:'A Barreira Aegis absorve três impactos e protege a nave enquanto estiver ativa.', q:'Três sentinelas orbitam por 6 segundos. Cada uma pode interceptar um tiro comum e convertê-lo em um disparo teleguiado. A nave fica protegida; fragmentos que sobrarem atacam os inimigos ao final. Melhorias chegam a 8s, cinco sentinelas e dano 5; a recarga cai de 30s para 24s.' },
    chronos: { e:'A Dobra Temporal desacelera fortemente inimigos e projéteis em toda a arena por 7,2 segundos, criando espaço para atacar e esquivar.', q:'Ecos repetem os disparos da nave após 0,30s. Melhorias aumentam a duração de 6s para 8s e o dano dos ecos de 70% para 100%; a recarga cai de 24s para 18s.' },
    tempest: { e:'O Poço Negro é disparado na direção da nave e curva suavemente conforme ela se move. A singularidade puxa inimigos de uma área ampliada e causa mais dano repetido durante 8,5 segundos.', q:'A Maré Reversa afasta inimigos, causa mais dano, desvia tiros comuns em 40% das vezes e redireciona alguns contra os adversários. Também protege a nave por um instante. Começa com quatro cargas, pode chegar a seis; ao gastar todas, recupera o conjunto após 24s, ou 18s com melhorias.' },
    flashblade: { e:'O Corte Flash lança uma lâmina mais rápida e forte, com perseguição mais precisa e ricochetes frequentes; sua recarga é de 22 segundos.', q:'A nave acelera em 2,6× por 6 segundos e deixa barreiras de luz no trajeto. Cada rastro dura até 9s, fere e desvia inimigos e destrói tiros que o atingem; melhorias reforçam o dano.' },
    redshift: { e:'O Escudo de Retorno reflete projéteis que atingem a nave durante a proteção. Melhorias aumentam duração e dano e reduzem a recarga.', q:'O Perímetro de Cerco acompanha a nave com feixes cortantes. Inimigos que cruzam as linhas recebem dano. Melhorias ampliam a duração de 6s para 8s e podem reduzir a recarga de 28s para 22s.' },
    eclipse: { e:'A Expansão de Domínio inicia com uma abertura cinematográfica e transforma a arena em um santuário. Os cortes cobrem a área por 10 segundos; a nave fica invulnerável durante o efeito e por alguns segundos ao final. Se for ativado durante o Paradoxo, os cortes são reforçados por 3 segundos nos inimigos atingidos pelo Q: +15% contra inimigos comuns e +8% contra chefes. O Q continua ativo normalmente.', q:'Paradoxo Absoluto abre uma distorção espacial que cobre a arena inteira. Inimigos em toda a tela ficam cada vez mais lentos e sofrem pulsos que interrompem movimento e ataques por breves instantes. Quando o campo colapsa, todos os alvos marcados recebem uma Sentença: o dano aumenta conforme o tempo que cada um permaneceu na distorção. Se usar E antes do fim, o Santuário fortalece os cortes por 3 segundos nos alvos atingidos pelo Q sem encerrar o campo; ele continua e aplica a Sentença no fim normal. Melhorias ampliam ainda mais o alcance e a duração, reforçam a supressão e o golpe final, ou reduzem a recarga.' },
    saurion: { e:'O Rugido de Garras tem duas cargas. Atinge uma área maior, atordoa por mais tempo e marca os inimigos; garras mais fortes atingem com maior frequência.', q:'Invoca raptores em até três cargas. Eles perseguem os inimigos, priorizam alvos marcados e causam dano extra. Melhorias fortalecem as investidas e reduzem a recarga de cada carga.' },
    prisma: { e:'O Núcleo Prisma concentra luz diante da nave e libera uma onda de impacto. Inimigos próximos recebem dano e são afastados; chefes resistem parcialmente ao empurrão. Melhorias ampliam o raio, o dano e reduzem a recarga. Você também pode escolher outra habilidade no Arquivo de Ecos.', q:'A Dobra de Horizonte grava a posição da nave por 4 segundos. Ative novamente para retornar ao ponto marcado, ganhar proteção breve e liberar uma onda de chegada que causa dano e desorganiza inimigos próximos. Melhorias ampliam a janela até 6 segundos e fortalecem a onda. O espaço Q também pode receber outra habilidade escolhida.' },
    mahoraga: { e:'Adaptação Divina · escudo de 3s que reduz até 90% do dano recebido. Cada impacto preenche um dos 8 segmentos da roda. Cinco golpes iguais adaptam a nave contra aquele tipo por cinco ondas; cada categoria se adapta separadamente e evolui até 70%. Repetir uma adaptação concede dano extra temporário. Recarga de 14s.', q:'Espada da Exterminação · envia um talho curvo que atravessa a arena em uma faixa, destrói os tiros que cruza e atinge até oito inimigos. Causa 20 de dano no primeiro alvo e 10 nos seguintes, com dano reduzido contra chefes; as marcas ampliam em 10% o próximo golpe. Recarga de 12s.' },
    megumi: { e:'A cada uso, a nave sorteia uma técnica: Fuga dos Coelhos cria cinco iscas armadas que atraem inimigos; Ocultação nas Sombras deixa você invisível, permite atravessar as bordas, mantém seus tiros sombrios e deixa você recolher recursos; Nue libera uma explosão elétrica em área. O ícone mostra a próxima técnica. Recarga de 20 segundos, reduzida até 15 segundos com cinco melhorias.', q:'Invoca o Guardião com uma cutscene sombria. Depois do ritual, a forma Mahoraga dura cinco ondas completas e concede uma vida extra. Ao retornar à Umbra, inicia uma recarga de 45 segundos antes de poder invocar novamente.' }
  });
  const shipCodeById = Object.freeze({ aurora:1, aegis:2, chronos:3, tempest:4, flashblade:5, redshift:6, eclipse:7, saurion:8, prisma:9, training:10, mahoraga:11, megumi:12 });
 