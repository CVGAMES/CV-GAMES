/*
 * Catálogo estático do CV GAMES.
 * Os destinos originais são preservados. A ordem de "populares" é editorial
 * nesta fase e poderá usar estatísticas reais quando houver uma fonte confiável.
 * pcFraco recebe true somente para jogos 2D/simples com indicação razoável;
 * os demais ficam false até uma revisão manual de requisitos.
 */
window.CV_GAMES_CATALOG = [
  {
    id: 'tuxocide', title: 'Tuxocide', category: 'Ação', categoryKey: 'acao',
    description: 'Jogo de ação online com Tux.', tags: ['acao', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'tuxocide.html', image: 'CV GAMES/tuxocide/favicon_xm7QEs1.png', fallback: '🎮',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: true, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'super-mario', title: 'Super Mario', category: 'Aventura', categoryKey: 'aventura',
    description: 'Aventura clássica de plataforma com Mario.', tags: ['aventura', 'plataforma', 'classico', 'online', 'leve'],
    type: 'Jogo online', platform: 'Navegador', href: 'mario.html', image: 'https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png', fallback: '🍄',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'subway-surfers', title: 'Subway Surfers', category: 'Arcade', categoryKey: 'arcade',
    description: 'Corrida sem fim pelos trilhos em estilo arcade.', tags: ['arcade', 'corrida', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://subwaysurfers76.github.io/', image: 'CV GAMES/subwar sufres/140607483-332a70eb-05ba-44d3-b1e7-b6d3a9036597.png', fallback: '🏃',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: false, multiplayer: false
  },
  {
    id: 'fnaf', title: "Five Nights at Freddy's", category: 'Terror', categoryKey: 'terror',
    description: 'Sobreviva a uma noite de terror com animatrônicos.', tags: ['fnaf', 'terror', 'suspense', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://dorukyum.github.io/FNAF-Web/', image: 'CV GAMES/five night/capsule_616x353.jpg', fallback: '👻',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: false, multiplayer: false
  },
  {
    id: 'flappy-bird', title: 'Flappy Bird', category: 'Arcade', categoryKey: 'arcade',
    description: 'Desvie dos canos em um desafio arcade rápido.', tags: ['arcade', 'online', 'leve'],
    type: 'Jogo online', platform: 'Navegador', href: 'flappy.html', image: 'CV GAMES/Flappy Bird/Flappy_Bird_icon.png', fallback: '🐦',
    rating: 4, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'angry-birds', title: 'Angry Birds', category: 'Arcade', categoryKey: 'arcade',
    description: 'Arremesse os pássaros e derrube as estruturas neste clássico de física.', tags: ['arcade', 'fisica', 'online', 'passaros'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://lrusso.github.io/AngryBirds/AngryBirds.htm', image: 'CV GAMES/angybird/angbird.png', fallback: '🐦',
    rating: 5, addedAt: '2026-09-26', featured: true, recent: true, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'bad-ice-cream', title: 'Bad Ice Cream', category: 'Arcade', categoryKey: 'arcade',
    description: 'Explore labirintos e encare desafios neste jogo arcade de visual retrô.', tags: ['arcade', 'labirinto', 'puzzle', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://badicecream.org/', image: 'CV GAMES/bad ice cream/bad-ice-cream.png', fallback: '🍦',
    rating: 4, addedAt: '2026-09-26', featured: false, recent: true, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: 'minecraft', title: 'Minecraft', category: 'Aventura', categoryKey: 'aventura',
    description: 'Explore e construa em uma aventura de blocos.', tags: ['aventura', 'construcao', 'blocos', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://eaglercraft.com/', image: 'CV GAMES/eaglrcraft 1/minecraft-header.jpg', fallback: '⛏️',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: false, multiplayer: false
  },
  {
    id: 'minecraft-2', title: 'Minecraft 2', category: 'Aventura', categoryKey: 'aventura',
    description: 'Outra versão online para explorar mundos de blocos.', tags: ['aventura', 'construcao', 'blocos', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'Minecraft2.html', image: 'CV GAMES/earglecraf2/gaming-1b33d39b9f2ddc21.webp', fallback: '⛏️',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: true, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'slow-roads', title: 'Slow Roads', category: 'Corrida', categoryKey: 'corrida',
    description: 'Dirija por estradas abertas em uma experiência de corrida.', tags: ['corrida', 'carro', 'online'],
    type: 'Jogo online', platform: 'Navegador', href: 'slowroads.html', image: 'CV GAMES/slosrids/slowroads_hero_1.jpg', fallback: '🏎️',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: true, popular: true, pcFraco: false, multiplayer: false
  },
  {
    id: 'fnf', title: "Friday Night Funkin'", category: 'Arcade', categoryKey: 'arcade',
    description: 'Desafio musical de ritmo com comandos rápidos.', tags: ['arcade', 'musica', 'ritmo', 'online', 'leve'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://fridaynightfunkin-fnf.github.io/', image: 'CV GAMES/fnf/512x512bb.jpg', fallback: '🎵',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'stickman-hook', title: 'Stickman Hook', category: 'Ação', categoryKey: 'acao',
    description: 'Balance pelo cenário usando o gancho do Stickman.', tags: ['acao', 'arcade', 'online', 'leve'],
    type: 'Jogo online', platform: 'Navegador', href: 'https://sites.google.com/view/wdbgr/other/stickman-hook?pli=1&authuser=0', image: 'CV GAMES/stick/15911-stickman-hook-pro-512x384.avif', fallback: '🪝',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'moto-x3m', title: 'Moto X3M', category: 'Corrida', categoryKey: 'corrida',
    description: 'Corrida de moto com pistas cheias de obstáculos.', tags: ['corrida', 'moto', 'online', 'leve'],
    type: 'Jogo online', href: 'https://moto3xmbike.github.io/', image: 'CV GAMES/MOTO/Screenshot_1.png', fallback: '🏍️',
    rating: 4, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'ninja-fruit', title: 'Ninja Fruit', category: 'Ação', categoryKey: 'acao',
    description: 'Corte frutas em um desafio rápido de ação.', tags: ['acao', 'frutas', 'online'],
    type: 'Jogo online', href: 'https://ubg98.github.io/fruit-ninja-unblocked.html', image: 'CV GAMES/jinja/unnamed.png', fallback: '🥷',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'geometry-jump', title: 'Geometry Jump', category: 'Arcade', categoryKey: 'arcade',
    description: 'Salte por desafios de ritmo em uma corrida geométrica.', tags: ['arcade', 'ritmo', 'online', 'leve'],
    type: 'Jogo online', href: 'https://ubg98.github.io/geometry-jump-unblocked.html', image: 'CV GAMES/geo/GeometryDash.webp', fallback: '🔺',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'rocket-soccer-derby', title: 'Rocket Soccer Derby', category: 'Esportes', categoryKey: 'esportes',
    description: 'Futebol com carros em partidas de ação.', tags: ['esportes', 'futebol', 'carro', 'online'],
    type: 'Jogo online', href: 'https://rocket-soccerderby.github.io/', image: 'CV GAMES/car/unnamed.png', fallback: '⚽',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'murder', title: 'Murder', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Jogo de mistério e decisões rápidas.', tags: ['puzzle', 'misterio', 'online', 'leve'],
    type: 'Jogo online', href: 'https://murdergame.github.io/', image: 'CV GAMES/murder/unnamed (1).png', fallback: '🕵️',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: 'drive-mad', title: 'Drive Mad', category: 'Corrida', categoryKey: 'corrida',
    description: 'Supere obstáculos em pistas malucas de carro.', tags: ['corrida', 'carro', 'online'],
    type: 'Jogo online', href: 'https://ducky443747.github.io/games/DriveMad/', image: 'CV GAMES/drive yar/unnamed.png', fallback: '🚗',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: false, multiplayer: false
  },
  {
    id: 'red-ball-4', title: 'Red Ball 4', category: 'Aventura', categoryKey: 'aventura',
    description: 'Aventura de plataforma com uma bola vermelha.', tags: ['aventura', 'plataforma', 'online', 'leve'],
    type: 'Jogo online', href: 'https://red-ball.gitlab.io/', image: 'CV GAMES/bal/red-ball-4.png', fallback: '🔴',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: '8-ball-pool', title: '8 Ball Pool', category: 'Esportes', categoryKey: 'esportes',
    description: 'Partidas de sinuca online.', tags: ['esportes', 'sinuca', 'online'],
    type: 'Jogo online', href: 'https://8ballpool.com/game', image: 'CV GAMES/ball/8-ball-pool.png', fallback: '🎱',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'stack-ball', title: 'Stack Ball', category: 'Arcade', categoryKey: 'arcade',
    description: 'Desafio arcade de quebrar e empilhar plataformas.', tags: ['arcade', 'online', 'leve'],
    type: 'Jogo online', href: 'https://ubg365.github.io/stack-ball/', image: 'CV GAMES/stake ball/unnamed.jpg', fallback: '🟣',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: 'eugenes-life', title: "Eugene's Life", category: 'Aventura', categoryKey: 'aventura',
    description: 'Aventura online protagonizada por Eugene.', tags: ['aventura', 'online'],
    type: 'Jogo online', href: 'https://poppyplaytimegames.github.io/play/eugenes-life.html', image: 'CV GAMES/eugenes/maxresdefault.jpg', fallback: '🌟',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: true, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'we-become', title: 'We Become What We Behold', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Experiência interativa de escolhas e observação.', tags: ['puzzle', 'interativo', 'online', 'leve'],
    type: 'Jogo online', href: 'https://webecomewhatwebehold.gitlab.io/#', image: 'CV GAMES/we become/header.jpg', fallback: '📺',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: true, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: 'among-us', title: 'Among Us', category: 'Multiplayer', categoryKey: 'multiplayer',
    description: 'Descubra o impostor em partidas com outras pessoas.', tags: ['multiplayer', 'social', 'online'],
    type: 'Jogo online', href: 'https://freezenova-unblocked.github.io/projects/among-us/index.html', image: 'CV GAMES/among us/apps.14626.13589262686196899.12354b81-d410-4255-b6aa-9f9a68a694ae.jpg', fallback: '👨🚀',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: true, popular: true, pcFraco: false, multiplayer: true
  },
  {
    id: 'fireboy-watergirl', title: 'Fireboy and Watergirl', category: 'Aventura', categoryKey: 'aventura',
    description: 'Aventura de plataforma com desafios de elementos.', tags: ['aventura', 'plataforma', 'online', 'leve'],
    type: 'Jogo online', href: 'https://amhooman.github.io/fireboywatergirl/game.html', image: 'CV GAMES/fire and warer/cover-1586285142530.avif', fallback: '🔥',
    rating: 5, addedAt: '2026-01-15', featured: true, recent: false, popular: true, pcFraco: true, multiplayer: false
  },
  {
    id: 'elastic-man', title: 'Elastic Man', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Experiência interativa com física elástica.', tags: ['puzzle', 'interativo', 'online'],
    type: 'Jogo online', href: 'https://elasticman.gitlab.io/', image: 'CV GAMES/elastic/RickandMortyElasticMan.webp', fallback: '🌀',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: false, multiplayer: false
  },
  {
    id: 'mr-bullet', title: 'Mr Bullet', category: 'Ação', categoryKey: 'acao',
    description: 'Ação com tiros e desafios de mira.', tags: ['acao', 'tiro', 'online', 'leve'],
    type: 'Jogo online', href: 'https://wowksies.github.io/kivro-Game-Library/MrBullet/index.html', image: 'CV GAMES/mr bullet/88a34001de0d5ec326ac979aad7d7eeb76fe712877addcd03867d2b200764a48_200.webp', fallback: '🎯',
    rating: 4, addedAt: '2026-01-15', featured: false, recent: false, popular: false, pcFraco: true, multiplayer: false
  },
  {
    id: 'cv-dodge', title: 'CV DEFESA ORBITAL', category: 'Estratégia', categoryKey: 'estrategia',
    description: 'Construa torres, evolua sua defesa e proteja o núcleo de ondas de inimigos neste jogo de estratégia original do CV GAMES.', tags: ['estrategia', 'defesa de torres', 'tower defense', 'ondas', 'chefes', 'cv defesa orbital', 'cv games'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-dodge/index.html', image: 'games/cv-dodge/cover.svg', fallback: '✦',
    rating: 5, addedAt: '2026-08-20', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: false, exclusivo: true
  },
  {
    id: 'cv-neon-breaker', title: 'CV NEON BREAKER', category: 'Arcade', categoryKey: 'arcade',
    description: 'Destrua blocos, mantenha a esfera em jogo e avance pelas fases neste arcade original do CV GAMES.', tags: ['arcade', 'blocos', 'neon', 'cv neon breaker', 'cv games', 'leve'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-neon-breaker/index.html', image: 'games/cv-neon-breaker/cover.svg', fallback: '🧱',
    rating: 5, addedAt: '2026-08-21', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: false, exclusivo: true
  },
  {
    id: 'cv-turbo-circuit', title: 'CV TURBO CIRCUIT', category: 'Corrida', categoryKey: 'corrida',
    description: 'Corra em circuitos vistos de cima, dispute o pódio contra quatro pilotos robôs e avance por cinco etapas cada vez mais difíceis.', tags: ['corrida', 'carros', 'campeonato', 'robôs', 'analógico', 'teclado', 'cv turbo circuit', 'cv games'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-turbo-circuit/index.html', image: 'games/cv-turbo-circuit/cover.svg', fallback: '🏎️',
    rating: 5, addedAt: '2026-10-06', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: false, exclusivo: true
  },
  {
    id: 'nexus-rota-zero', title: 'NEXUS: Rota Zero', category: 'Aventura', categoryKey: 'aventura',
    description: 'Aventura sci-fi interativa com decisões, minigames e vários finais.', tags: ['aventura', 'ficcao cientifica', 'terror', 'historia', 'minigames', 'narrativo'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/nexus-rota-zero/index.html', image: 'games/nexus-rota-zero/img/nexus-hero-v2.png', fallback: '🚚',
    rating: 5, addedAt: '2026-09-24', featured: true, recent: true, popular: false, pcFraco: false, multiplayer: false, exclusivo: true
  },
  {
    id: 'cv-starfall', title: 'CV STARFALL', category: 'Ação', categoryKey: 'acao',
    description: 'Pilote sua nave, sobreviva a ondas cósmicas, escolha melhorias e enfrente guardiões.', tags: ['acao', 'arcade', 'espaco', 'nave', 'sobrevivencia', 'ondas', 'melhorias', 'cv starfall'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-starfall/index.html', image: 'games/cv-starfall/cover.svg', fallback: '🚀',
    rating: 5, addedAt: '2026-09-24', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: false, exclusivo: true
  },
  {
    id: 'cv-xadrez', title: 'CV XADREZ', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Jogue xadrez com outra pessoa no mesmo dispositivo, com regras completas, histórico e tabuleiro giratório.', tags: ['xadrez', 'chess', 'estrategia', 'tabuleiro', '2 jogadores', 'multiplayer local', 'cv xadrez'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-xadrez/index.html', image: 'games/cv-xadrez/cover.svg', fallback: '♟️',
    rating: 5, addedAt: '2026-09-24', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: true, exclusivo: true
  },
  {
    id: 'cv-damas', title: 'CV DAMAS', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Desafie outra pessoa no mesmo dispositivo com capturas obrigatórias, jogadas em sequência e coroação das peças.', tags: ['damas', 'checkers', 'estrategia', 'tabuleiro', '2 jogadores', 'multiplayer local', 'cv damas'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-damas/index.html', image: 'games/cv-damas/cover.svg', fallback: '●',
    rating: 5, addedAt: '2026-10-05', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: true, exclusivo: true
  },
  {
    id: 'cv-jogo-da-velha', title: 'CV JOGO DA VELHA', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Desafie outra pessoa no mesmo dispositivo, complete três símbolos em linha e acompanhe o placar.', tags: ['jogo da velha', 'tic tac toe', '2 jogadores', 'multiplayer local', 'estrategia', 'cv jogo da velha'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-jogo-da-velha/index.html', image: 'games/cv-jogo-da-velha/cover.svg', fallback: '⭕',
    rating: 5, addedAt: '2026-09-24', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: true, exclusivo: true
  },
  {
    id: 'cv-quadrados', title: 'CV QUADRADOS', category: 'Puzzle', categoryKey: 'puzzle',
    description: 'Conecte pontos, complete quadrados e dispute o maior território em um tabuleiro 5×5 para dois jogadores.', tags: ['quadrados', 'dots and boxes', 'pontos e caixas', '2 jogadores', 'multiplayer local', 'estrategia', 'cv quadrados'],
    type: 'Jogo online', platform: 'Navegador', href: 'games/cv-quadrados/index.html', image: 'games/cv-quadrados/cover.svg', fallback: '▦',
    rating: 5, addedAt: '2026-09-24', featured: true, recent: true, popular: false, pcFraco: true, multiplayer: true, exclusivo: true
  }
];
