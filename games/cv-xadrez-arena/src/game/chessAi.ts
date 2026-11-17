import { Chess, type Move, type PieceSymbol } from 'chess.js';
import type { AiDifficulty, PieceType, PlayerColor } from './constants';

export interface AiMoveChoice {
  from: string;
  to: string;
  san: string;
  promotion?: Exclude<PieceType, 'p' | 'k'>;
  score: number;
  nodesSearched: number;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const MATE_SCORE = 100000;

// Piece-square tables from White's perspective (rank 8 at index 0 .. rank 1 at index 7)
const PAWN_PST = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 27, 27, 10, 5, 5,
  0, 0, 0, 24, 24, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -22, -22, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 12, 16, 16, 12, 0, -30,
  -30, 5, 16, 22, 22, 16, 5, -30,
  -30, 0, 16, 22, 22, 16, 0, -30,
  -30, 6, 12, 16, 16, 12, 6, -30,
  -40, -20, 0, 6, 6, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_PST = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 8, 12, 12, 8, 0, -10,
  -10, 6, 6, 12, 12, 6, 6, -10,
  -10, 0, 12, 12, 12, 12, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 6, 0, 0, 0, 0, 6, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_PST = [
  0, 0, 0, 0, 0, 0, 0, 0,
  8, 14, 14, 14, 14, 14, 14, 8,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 0, 6, 6, 0, 0, 0,
];

const QUEEN_PST = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -5, 0, 5, 5, 5, 5, 0, -5,
  0, 0, 5, 5, 5, 5, 0, -5,
  -10, 5, 5, 5, 5, 5, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const KING_MID_PST = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

const KING_END_PST = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -30, 0, 0, 0, 0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50,
];

function getPstBonus(type: PieceSymbol, color: PlayerColor, r: number, f: number, isEndgame: boolean): number {
  const row = color === 'w' ? r : 7 - r;
  const idx = row * 8 + f;
  switch (type) {
    case 'p':
      return PAWN_PST[idx];
    case 'n':
      return KNIGHT_PST[idx];
    case 'b':
      return BISHOP_PST[idx];
    case 'r':
      return ROOK_PST[idx];
    case 'q':
      return QUEEN_PST[idx];
    case 'k':
      return isEndgame ? KING_END_PST[idx] : KING_MID_PST[idx];
  }
}

/**
 * Evaluates board from the perspective of `perspectiveColor` (positive = good for perspectiveColor).
 */
export function evaluateBoard(
  chess: Chess,
  perspectiveColor: PlayerColor,
  difficulty: AiDifficulty,
): number {
  if (chess.isCheckmate()) {
    return chess.turn() === perspectiveColor ? -MATE_SCORE : MATE_SCORE;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  const board = chess.board();
  let nonKingMaterial = 0;
  let score = 0;

  let whiteBishops = 0;
  let blackBishops = 0;
  const whitePawnFiles = new Uint8Array(8);
  const blackPawnFiles = new Uint8Array(8);
  let whiteKingPos: { r: number; f: number } | null = null;
  let blackKingPos: { r: number; f: number } | null = null;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (!cell) continue;
      if (cell.type !== 'k') {
        nonKingMaterial += PIECE_VALUES[cell.type];
      } else {
        if (cell.color === 'w') whiteKingPos = { r, f };
        else blackKingPos = { r, f };
      }
      if (cell.type === 'b') {
        if (cell.color === 'w') whiteBishops += 1;
        else blackBishops += 1;
      }
      if (cell.type === 'p') {
        if (cell.color === 'w') whitePawnFiles[f] += 1;
        else blackPawnFiles[f] += 1;
      }
    }
  }

  const isEndgame = nonKingMaterial <= 2600;
  const usePst = difficulty >= 2;
  const useAdvancedPositional = difficulty >= 3;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (!cell) continue;

      let pieceScore = PIECE_VALUES[cell.type];
      if (usePst) {
        pieceScore += getPstBonus(cell.type, cell.color, r, f, isEndgame);
      }

      if (useAdvancedPositional) {
        // Rook on open or semi-open file
        if (cell.type === 'r') {
          const ownPawns = cell.color === 'w' ? whitePawnFiles[f] : blackPawnFiles[f];
          const enemyPawns = cell.color === 'w' ? blackPawnFiles[f] : whitePawnFiles[f];
          if (ownPawns === 0 && enemyPawns === 0) {
            pieceScore += 22;
          } else if (ownPawns === 0) {
            pieceScore += 11;
          }
        }
        // Doubled pawn penalty
        if (cell.type === 'p') {
          const ownCount = cell.color === 'w' ? whitePawnFiles[f] : blackPawnFiles[f];
          if (ownCount > 1) {
            pieceScore -= 10;
          }
          // Passed pawn bonus (difficulty 4 extra precision)
          if (difficulty === 4) {
            let blockedByEnemy = false;
            const enemyColor = cell.color === 'w' ? 'b' : 'w';
            const step = cell.color === 'w' ? -1 : 1;
            for (let rr = r + step; rr >= 0 && rr < 8; rr += step) {
              for (let ff = Math.max(0, f - 1); ff <= Math.min(7, f + 1); ff++) {
                const blocker = board[rr][ff];
                if (blocker && blocker.type === 'p' && blocker.color === enemyColor) {
                  blockedByEnemy = true;
                  break;
                }
              }
              if (blockedByEnemy) break;
            }
            if (!blockedByEnemy) {
              const advancement = cell.color === 'w' ? 7 - r : r;
              pieceScore += advancement * 8;
            }
          }
        }
      }

      score += cell.color === perspectiveColor ? pieceScore : -pieceScore;
    }
  }

  if (useAdvancedPositional) {
    // Bishop pair bonus
    if (whiteBishops >= 2) score += perspectiveColor === 'w' ? 30 : -30;
    if (blackBishops >= 2) score += perspectiveColor === 'b' ? 30 : -30;

    // King safety pawn shield in middlegame
    if (!isEndgame) {
      if (whiteKingPos && whiteKingPos.r === 7) {
        let shield = 0;
        for (let df = -1; df <= 1; df++) {
          const ff = whiteKingPos.f + df;
          if (ff >= 0 && ff < 8 && board[6][ff]?.type === 'p' && board[6][ff]?.color === 'w') {
            shield += 12;
          }
        }
        score += perspectiveColor === 'w' ? shield : -shield;
      }
      if (blackKingPos && blackKingPos.r === 0) {
        let shield = 0;
        for (let df = -1; df <= 1; df++) {
          const ff = blackKingPos.f + df;
          if (ff >= 0 && ff < 8 && board[1][ff]?.type === 'p' && board[1][ff]?.color === 'b') {
            shield += 12;
          }
        }
        score += perspectiveColor === 'b' ? shield : -shield;
      }
    }

    // Check pressure bonus
    if (chess.inCheck()) {
      score += chess.turn() === perspectiveColor ? -28 : 28;
    }
  }

  return score;
}

function scoreMoveForOrdering(move: Move): number {
  let s = 0;
  if (move.captured) {
    // MVV-LVA: prioritize capturing high-value pieces with low-value pieces
    s += 10 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece] + 1000;
  }
  if (move.promotion) {
    s += PIECE_VALUES[move.promotion] + 800;
  }
  if (move.san.includes('+')) {
    s += 140;
  }
  if (move.san === 'O-O' || move.san === 'O-O-O') {
    s += 90;
  }
  return s;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));
}

interface SearchContext {
  perspective: PlayerColor;
  difficulty: AiDifficulty;
  nodes: number;
  deadlineMs: number;
  aborted: boolean;
}

function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  qDepth: number,
  ctx: SearchContext,
): number {
  ctx.nodes += 1;
  if (ctx.nodes % 256 === 0 && Date.now() >= ctx.deadlineMs) {
    ctx.aborted = true;
    return evaluateBoard(chess, ctx.perspective, ctx.difficulty);
  }

  if (chess.isGameOver()) {
    return evaluateBoard(chess, ctx.perspective, ctx.difficulty);
  }

  const standPat = evaluateBoard(chess, ctx.perspective, ctx.difficulty);
  const maximizing = chess.turn() === ctx.perspective;

  if (qDepth <= 0) {
    return standPat;
  }

  if (maximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const allMoves = chess.moves({ verbose: true });
  const tacticalMoves = orderMoves(
    allMoves.filter((m) => Boolean(m.captured) || Boolean(m.promotion)),
  );

  for (const m of tacticalMoves) {
    chess.move(m);
    const val = quiescence(chess, alpha, beta, qDepth - 1, ctx);
    chess.undo();
    if (ctx.aborted) return standPat;

    if (maximizing) {
      if (val >= beta) return beta;
      if (val > alpha) alpha = val;
    } else {
      if (val <= alpha) return alpha;
      if (val < beta) beta = val;
    }
  }

  return maximizing ? alpha : beta;
}

function alphabeta(
  chess: Chess,
  depth: number,
  plyFromRoot: number,
  alpha: number,
  beta: number,
  qMaxDepth: number,
  ctx: SearchContext,
): number {
  ctx.nodes += 1;
  if (ctx.nodes % 256 === 0 && Date.now() >= ctx.deadlineMs) {
    ctx.aborted = true;
    return evaluateBoard(chess, ctx.perspective, ctx.difficulty);
  }

  if (chess.isCheckmate()) {
    // Prefer faster mates & delay losses
    return chess.turn() === ctx.perspective
      ? -MATE_SCORE + plyFromRoot
      : MATE_SCORE - plyFromRoot;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  if (depth <= 0) {
    if (qMaxDepth > 0) {
      return quiescence(chess, alpha, beta, qMaxDepth, ctx);
    }
    return evaluateBoard(chess, ctx.perspective, ctx.difficulty);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));
  const maximizing = chess.turn() === ctx.perspective;

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const val = alphabeta(chess, depth - 1, plyFromRoot + 1, alpha, beta, qMaxDepth, ctx);
      chess.undo();
      if (ctx.aborted) return best === -Infinity ? evaluateBoard(chess, ctx.perspective, ctx.difficulty) : best;
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      chess.move(m);
      const val = alphabeta(chess, depth - 1, plyFromRoot + 1, alpha, beta, qMaxDepth, ctx);
      chess.undo();
      if (ctx.aborted) return best === Infinity ? evaluateBoard(chess, ctx.perspective, ctx.difficulty) : best;
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
    return best;
  }
}

function countNonKingPieces(chess: Chess): number {
  const board = chess.board();
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const c = board[r][f];
      if (c && c.type !== 'k') count += 1;
    }
  }
  return count;
}

/**
 * Selects a strictly legal chess move tailored to the requested AI difficulty level (1..4).
 */
export function chooseBestMove(
  fen: string,
  difficulty: AiDifficulty,
  rng: () => number = Math.random,
): AiMoveChoice | null {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const perspective = chess.turn() as PlayerColor;
  const ordered = orderMoves(legalMoves);

  // Instant mate-in-1 check for Levels 2, 3, 4 (Level 1 may still miss quiet mates unless lucky)
  if (difficulty >= 2) {
    for (const m of ordered) {
      chess.move(m);
      const isMate = chess.isCheckmate();
      chess.undo();
      if (isMate) {
        return {
          from: m.from,
          to: m.to,
          san: m.san,
          promotion: m.promotion as Exclude<PieceType, 'p' | 'k'> | undefined,
          score: MATE_SCORE - 1,
          nodesSearched: ordered.length,
        };
      }
    }
  }

  // LEVEL 1 – FÁCIL: shallow 1-ply evaluation with beginner mistakes & occasional random moves
  if (difficulty === 1) {
    const scored = legalMoves.map((m) => {
      chess.move(m);
      let s = evaluateBoard(chess, perspective, 1);
      chess.undo();
      // Do not strongly prioritize captures; add noticeable beginner noise
      if (m.captured) s -= 35;
      s += (rng() - 0.5) * 260;
      return { move: m, score: s };
    });
    scored.sort((a, b) => b.score - a.score);

    // 35% chance to pick a casual mid-ranked legal move instead of the best 1-ply move
    let picked = scored[0];
    if (scored.length > 2 && rng() < 0.35) {
      const poolEnd = Math.min(scored.length, Math.max(2, Math.ceil(scored.length * 0.55)));
      const idx = Math.floor(rng() * poolEnd);
      picked = scored[idx];
    }

    return {
      from: picked.move.from,
      to: picked.move.to,
      san: picked.move.san,
      promotion: picked.move.promotion as Exclude<PieceType, 'p' | 'k'> | undefined,
      score: picked.score,
      nodesSearched: legalMoves.length,
    };
  }

  // Configure search depth & quiescence per difficulty
  const pieceCount = countNonKingPieces(chess);
  let targetDepth = 2;
  let qDepth = 0;
  let timeBudgetMs = 140;

  if (difficulty === 2) {
    targetDepth = 2;
    qDepth = 0;
    timeBudgetMs = 120;
  } else if (difficulty === 3) {
    targetDepth = 3;
    qDepth = 1;
    timeBudgetMs = 220;
  } else {
    // Level 4 – Extra Difícil: deeper iterative search + quiescence
    targetDepth = pieceCount <= 12 ? 4 : 3;
    qDepth = 4;
    timeBudgetMs = 420;
  }

  const deadlineMs = Date.now() + timeBudgetMs;
  let totalNodes = 0;
  let movePool = ordered;
  let bestCompletedCandidates: Array<{ move: Move; score: number }> = [];

  for (let depth = 1; depth <= targetDepth; depth++) {
    const ctx: SearchContext = {
      perspective,
      difficulty,
      nodes: 0,
      deadlineMs,
      aborted: false,
    };

    const iterCandidates: Array<{ move: Move; score: number }> = [];
    let alpha = -Infinity;
    const beta = Infinity;
    const iterQDepth = depth >= 3 || depth === targetDepth ? qDepth : 0;

    for (const m of movePool) {
      chess.move(m);
      const val = alphabeta(chess, depth - 1, 1, alpha, beta, iterQDepth, ctx);
      chess.undo();

      if (ctx.aborted && bestCompletedCandidates.length > 0) {
        // Discard partial score from an aborted search when a full prior iteration exists
        break;
      }

      iterCandidates.push({ move: m, score: val });
      if (val > alpha) {
        alpha = val;
      }

      if (ctx.aborted) {
        break;
      }
    }

    totalNodes += ctx.nodes;

    if (!ctx.aborted && iterCandidates.length > 0) {
      iterCandidates.sort((a, b) => b.score - a.score);
      bestCompletedCandidates = iterCandidates;
      movePool = iterCandidates.map((c) => c.move);
    } else if (bestCompletedCandidates.length === 0 && iterCandidates.length > 0) {
      iterCandidates.sort((a, b) => b.score - a.score);
      bestCompletedCandidates = iterCandidates;
      break;
    } else {
      break;
    }

    if (Date.now() >= deadlineMs) {
      break;
    }
  }

  const candidates = bestCompletedCandidates;
  let chosen = candidates[0];

  // Level 2 occasionally chooses between top 2 close moves so it feels natural rather than robotic
  if (difficulty === 2 && candidates.length >= 2) {
    const gap = candidates[0].score - candidates[1].score;
    if (gap <= 40 && rng() < 0.3) {
      chosen = candidates[1];
    }
  }

  // Level 3 breaks exact ties slightly for variety; Level 4 picks strictly best evaluated move
  if (difficulty === 3 && candidates.length >= 2 && candidates[0].score - candidates[1].score <= 5) {
    if (rng() < 0.25) chosen = candidates[1];
  }

  return {
    from: chosen.move.from,
    to: chosen.move.to,
    san: chosen.move.san,
    promotion: chosen.move.promotion as Exclude<PieceType, 'p' | 'k'> | undefined,
    score: chosen.score,
    nodesSearched: totalNodes,
  };
}
