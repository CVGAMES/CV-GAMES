export const SQUARE_SIZE = 4.0;
export const BOARD_SQUARES = 8;
export const BOARD_PLAYABLE_HALF = (BOARD_SQUARES * SQUARE_SIZE) / 2; // 16.0
export const BOARD_RIM_WIDTH = 1.6;
export const BOARD_WALK_HALF = BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH - 0.55; // 17.05
export const BOARD_SURFACE_Y = 0;

export const SNAP_RADIUS = SQUARE_SIZE * 0.62; // 2.48 units forgiving square snap radius

export const CHARACTER_RADIUS = 0.58;
export const CHARACTER_HEIGHT = 3.35;
export const CHARACTER_REACH_RANGE = 2.65;
export const HAND_GRAB_RADIUS = 1.15;

export const GRAVITY = 28.0;
export const JUMP_SPEED = 10.2;
export const WALK_SPEED = 7.4;
export const SPRINT_SPEED = 11.4;

export const MAX_PUNCHES_PER_SEQUENCE = 6;
export const PUNCH_SEQUENCE_COOLDOWN = 10.0;
export const MAX_COMBAT_ENERGY = 100;
export const ENERGY_PER_PUNCH = MAX_COMBAT_ENERGY / MAX_PUNCHES_PER_SEQUENCE;

export const GRAPPLE_CHORD_WINDOW_SEC = 0.085;
export const GRAPPLE_MIN_START_ENERGY = 12;
export const GRAPPLE_INIT_ENERGY_COST = 4;
export const GRAPPLE_ENERGY_DRAIN_PER_SEC = 22;
export const GRAPPLE_RESIST_DRAIN_EXTRA = 8;
export const GRAPPLE_MAX_RANGE = 2.65;
export const GRAPPLE_HOLD_DISTANCE = 1.48;
export const GRAPPLE_MAX_STRETCH = 3.1;
export const GRAPPLE_DRAG_SPEED = WALK_SPEED * 0.68;
export const GRAPPLE_ESCAPE_TAP_GAIN = 0.23;
export const GRAPPLE_ESCAPE_TAP_COOLDOWN = 0.12;
export const GRAPPLE_ESCAPE_IMMUNITY_SEC = 0.85;

export const PUNCH_DURATION = 0.28;
export const PUNCH_WINDUP_END = 0.24;
export const PUNCH_ACTIVE_END = 0.07;
export const PUNCH_COOLDOWN = 0.32;
export const PUNCH_REACH = 2.65;
export const PUNCH_HIT_RADIUS = 1.05;
export const PUNCH_MAX_CENTER_DIST = 3.55;
export const PUNCH_MIN_FORWARD_DOT = 0.05;

export const SINGLE_PUNCH_KNOCKBACK = 4.8;
export const SECOND_PUNCH_KNOCKBACK = 6.4;
export const COMBO_PUNCH_KNOCKBACK = 11.8;
export const COMBO_WINDOW = 3.5;
export const COMBO_COOLDOWN = 0.5;
export const PUSH_REACTION_COOLDOWN = 0.36;

export const STUN_STUMBLE_DURATION = 0.42;
export const STUN_FALL_DURATION = 1.45;
export const STUN_KNOCKDOWN_DURATION = 2.25;
export const KNOCKDOWN_POST_PROTECTION = 1.0;

export const DROP_SQUARE_TOLERANCE = SQUARE_SIZE * 0.45; // 1.80 units inside 4.0x4.0 square

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PlayerColor = 'w' | 'b';
export type CameraMode = 'character' | 'observer';
export type GamePhase =
  | 'loading'
  | 'menu'
  | 'mode'
  | 'difficulty'
  | 'howto'
  | 'settings'
  | 'playing'
  | 'paused'
  | 'gameover';

export const PIECE_COLLISION_RADIUS: Record<PieceType, number> = {
  p: 0.54,
  n: 0.64,
  b: 0.60,
  r: 0.64,
  q: 0.72,
  k: 0.76,
};

export const PIECE_HEIGHT: Record<PieceType, number> = {
  p: 1.65,
  n: 2.15,
  b: 2.35,
  r: 2.0,
  q: 2.75,
  k: 3.05,
};

export const PIECE_WEIGHT: Record<PieceType, number> = {
  p: 0.8,
  n: 1.0,
  b: 1.0,
  r: 1.15,
  q: 1.3,
  k: 1.35,
};

export const PIECE_LABELS: Record<PieceType, string> = {
  p: 'Peão',
  n: 'Cavalo',
  b: 'Bispo',
  r: 'Torre',
  q: 'Dama',
  k: 'Rei',
};

export type AiDifficulty = 1 | 2 | 3 | 4;

export interface AiDifficultyInfo {
  level: AiDifficulty;
  name: string;
  shortDesc: string;
  playStyleDesc: string;
  comparisonSummary: string;
  searchDepthLabel: string;
  tacticalFocus: string;
  precisionLabel: string;
  combatProfileLabel: string;
}

export interface AiCombatProfile {
  minIntervalSec: number;
  maxIntervalSec: number;
  reactionDelaySec: number;
  aggression: number; // 0..1 chance to engage when opportunity arises
  engageDistance: number; // max range to consider approaching player on human turn
  maxBurstPunches: number; // 1..3 max punches in a single engagement burst
  mistakeRate: number; // 0..1 chance to whiff / hesitate
  interruptCarryChance: number; // 0..1 chance to intercept when human carries a piece
  strafeSpeedScale: number; // approach speed factor when engaging
  grappleChance: number; // 0..1 probability of choosing a grapple over punches when close
  grappleHoldMinSec: number;
  grappleHoldMaxSec: number;
  grappleResistanceRate: number; // passive + active resistance rate per second when grabbed
}

export const AI_COMBAT_PROFILES: Record<AiDifficulty, AiCombatProfile> = {
  1: {
    minIntervalSec: 7.5,
    maxIntervalSec: 12.0,
    reactionDelaySec: 0.62,
    aggression: 0.24,
    engageDistance: 5.0,
    maxBurstPunches: 1,
    mistakeRate: 0.35,
    interruptCarryChance: 0.15,
    strafeSpeedScale: 0.78,
    grappleChance: 0.12,
    grappleHoldMinSec: 0.7,
    grappleHoldMaxSec: 1.3,
    grappleResistanceRate: 0.14,
  },
  2: {
    minIntervalSec: 4.5,
    maxIntervalSec: 7.5,
    reactionDelaySec: 0.36,
    aggression: 0.52,
    engageDistance: 7.5,
    maxBurstPunches: 2,
    mistakeRate: 0.15,
    interruptCarryChance: 0.42,
    strafeSpeedScale: 0.9,
    grappleChance: 0.28,
    grappleHoldMinSec: 1.1,
    grappleHoldMaxSec: 2.0,
    grappleResistanceRate: 0.24,
  },
  3: {
    minIntervalSec: 3.0,
    maxIntervalSec: 5.2,
    reactionDelaySec: 0.20,
    aggression: 0.74,
    engageDistance: 10.5,
    maxBurstPunches: 3,
    mistakeRate: 0.05,
    interruptCarryChance: 0.68,
    strafeSpeedScale: 1.0,
    grappleChance: 0.44,
    grappleHoldMinSec: 1.5,
    grappleHoldMaxSec: 2.6,
    grappleResistanceRate: 0.34,
  },
  4: {
    minIntervalSec: 2.4,
    maxIntervalSec: 4.2,
    reactionDelaySec: 0.12,
    aggression: 0.86,
    engageDistance: 13.5,
    maxBurstPunches: 3,
    mistakeRate: 0.0,
    interruptCarryChance: 0.85,
    strafeSpeedScale: 1.0,
    grappleChance: 0.54,
    grappleHoldMinSec: 1.8,
    grappleHoldMaxSec: 3.0,
    grappleResistanceRate: 0.42,
  },
};

export const AI_DIFFICULTY_STORAGE_KEY = 'cv_xadrez_arena_ai_difficulty';
export const SETTINGS_STORAGE_KEY = 'cv_xadrez_arena_settings';

export const AI_DIFFICULTIES: Record<AiDifficulty, AiDifficultyInfo> = {
  1: {
    level: 1,
    name: 'Fácil',
    shortDesc: 'Ritmo leve e acessível para quem está aprendendo ou quer se divertir com a física.',
    playStyleDesc:
      'Prioriza o xadrez com lances simples e erros ocasionais. Em combate, ataca ou agarra raramente com intervalos longos e dá mais espaço para você jogar.',
    comparisonSummary: 'Busca rasa (1 lance) e combate/agarrão ocasional com reação lenta.',
    searchDepthLabel: 'Análise básica (1 lance)',
    tacticalFocus: 'Movimentos simples sem cálculo profundo',
    precisionLabel: 'Deslizes ocasionais',
    combatProfileLabel: 'Raramente ataca ou agarra',
  },
  2: {
    level: 2,
    name: 'Médio',
    shortDesc: 'Equilíbrio entre desafio tático no tabuleiro e disputas físicas moderadas.',
    playStyleDesc:
      'Analisa táticas básicas, protege peças e faz boas capturas. Em combate, usa socos e agarrões moderados quando você se aproxima.',
    comparisonSummary: 'Busca de 2 lances e ataques/agarrões moderados quando há oportunidade.',
    searchDepthLabel: 'Análise tática (2 lances)',
    tacticalFocus: 'Proteção de peças e capturas diretas',
    precisionLabel: 'Equilibrada',
    combatProfileLabel: 'Socos e agarrões ocasionais',
  },
  3: {
    level: 3,
    name: 'Difícil',
    shortDesc: 'Oponente disciplinado que calcula combinações e contesta jogadas com timing.',
    playStyleDesc:
      'Calcula vários lances à frente, busca ameaças de mate e explora brechas físicas. Usa sequências de socos e agarrões estratégicos para interromper suas jogadas.',
    comparisonSummary: 'Busca de 3 lances + extensão e combinações táticas de socos e agarrão.',
    searchDepthLabel: 'Cálculo avançado (3 lances)',
    tacticalFocus: 'Segurança do rei, combinações e ameaças de mate',
    precisionLabel: 'Alta disciplina tática',
    combatProfileLabel: 'Combos e agarrões estratégicos',
  },
  4: {
    level: 4,
    name: 'Extra Difícil',
    shortDesc: 'Desafio máximo com avaliação posicional profunda e pressão física inteligente.',
    playStyleDesc:
      'Prioriza sempre os melhores lances de xadrez e aproveita quando você está distraído ou carregando uma peça, combinando socos e agarrões com precisão máxima.',
    comparisonSummary: 'Poda alfa-beta profunda (3–4+ lances) e pressão física calculada.',
    searchDepthLabel: 'Força máxima (3–4+ lances)',
    tacticalFocus: 'Quiescência, controle posicional e busca de mate',
    precisionLabel: 'Determinística máxima',
    combatProfileLabel: 'Pressão calculada (socos + agarrão)',
  },
};

/**
 * Converts algebraic square (e.g. 'e2') to world XZ center on the chessboard.
 * White is at +Z (ranks 1 & 2), Black is at -Z (ranks 7 & 8).
 * File 'a' is -X, File 'h' is +X.
 */
export function squareToWorld(square: string): { x: number; z: number } {
  const fileIdx = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rankIdx = RANKS.indexOf(square[1] as (typeof RANKS)[number]);
  if (fileIdx === -1 || rankIdx === -1) {
    return { x: 0, z: 0 };
  }
  const x = (fileIdx - 3.5) * SQUARE_SIZE;
  const z = (3.5 - rankIdx) * SQUARE_SIZE;
  return { x, z };
}

/**
 * Finds the nearest of the 64 chess squares for a given world XZ position.
 */
export function findNearestSquare(x: number, z: number): {
  square: string;
  centerX: number;
  centerZ: number;
  distance: number;
} {
  const rawFile = Math.round(x / SQUARE_SIZE + 3.5);
  const rawRank = Math.round(3.5 - z / SQUARE_SIZE);
  const fileIdx = Math.max(0, Math.min(7, rawFile));
  const rankIdx = Math.max(0, Math.min(7, rawRank));
  const square = `${FILES[fileIdx]}${RANKS[rankIdx]}`;
  const center = squareToWorld(square);
  const dx = x - center.x;
  const dz = z - center.z;
  return {
    square,
    centerX: center.x,
    centerZ: center.z,
    distance: Math.hypot(dx, dz),
  };
}
