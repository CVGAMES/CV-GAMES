import { Chess, type Square, type PieceSymbol } from 'chess.js';
import { FILES, RANKS, type PieceType, type PlayerColor } from './constants';

export interface ChessPieceRecord {
  id: string;
  color: PlayerColor;
  type: PieceType;
  square: string;
  captured: boolean;
}

export interface MoveOutcome {
  accepted: boolean;
  from: string;
  to: string;
  san?: string;
  movedPieceId?: string;
  capturedPieceId?: string;
  capturedSquare?: string;
  rookMove?: {
    pieceId: string;
    from: string;
    to: string;
  };
  promotedTo?: PieceType;
  needsPromotion?: boolean;
}

export interface MoveHistoryEntry {
  ply: number;
  moveNumber: number;
  color: PlayerColor;
  piece: PieceType;
  from: string;
  to: string;
  san: string;
  promotion?: Exclude<PieceType, 'p' | 'k'>;
  captured?: PieceType;
}

export interface CheckedKingInfo {
  color: PlayerColor;
  square: string;
  isCheckmate: boolean;
}

export interface ChessStatus {
  turn: PlayerColor;
  inCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  winner: PlayerColor | null;
  outcomeText: string;
  moveNumber: number;
  lastMoveSan: string | null;
  checkedKing: CheckedKingInfo | null;
}

export class ChessMatchEngine {
  private chess: Chess;
  private piecesBySquare: Map<string, ChessPieceRecord>;
  private piecesById: Map<string, ChessPieceRecord>;
  private lastMoveSan: string | null = null;
  private halfMovesCompleted = 0;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.piecesBySquare = new Map();
    this.piecesById = new Map();
    this.syncFromBoard();
  }

  private syncFromBoard(): void {
    this.piecesBySquare.clear();
    this.piecesById.clear();
    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = board[r][f];
        if (!cell) continue;
        const square = `${FILES[f]}${RANKS[7 - r]}`;
        const id = `${cell.color}_${cell.type}_${square}`;
        const rec: ChessPieceRecord = {
          id,
          color: cell.color as PlayerColor,
          type: cell.type as PieceType,
          square,
          captured: false,
        };
        this.piecesBySquare.set(square, rec);
        this.piecesById.set(id, rec);
      }
    }
  }

  reset(): void {
    this.chess.reset();
    this.lastMoveSan = null;
    this.halfMovesCompleted = 0;
    this.syncFromBoard();
  }

  getAllPieces(): ChessPieceRecord[] {
    return Array.from(this.piecesById.values());
  }

  getPieceAt(square: string): ChessPieceRecord | undefined {
    return this.piecesBySquare.get(square);
  }

  getPieceById(id: string): ChessPieceRecord | undefined {
    return this.piecesById.get(id);
  }

  getTurn(): PlayerColor {
    return this.chess.turn() as PlayerColor;
  }

  getFen(): string {
    return this.chess.fen();
  }

  getHistory(): string[] {
    return this.chess.history();
  }

  getDetailedHistory(): MoveHistoryEntry[] {
    const verbose = this.chess.history({ verbose: true });
    return verbose.map((m, idx) => ({
      ply: idx + 1,
      moveNumber: Math.floor(idx / 2) + 1,
      color: m.color as PlayerColor,
      piece: m.piece as PieceType,
      from: m.from,
      to: m.to,
      san: m.san,
      promotion: m.promotion as Exclude<PieceType, 'p' | 'k'> | undefined,
      captured: m.captured as PieceType | undefined,
    }));
  }

  verifyIntegrity(): boolean {
    const board = this.chess.board();
    let activeCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = board[r][f];
        const sq = `${FILES[f]}${RANKS[7 - r]}`;
        const tracked = this.piecesBySquare.get(sq);
        if (!cell) {
          if (tracked) return false;
        } else {
          activeCount += 1;
          if (!tracked || tracked.captured || tracked.square !== sq) return false;
          if (tracked.color !== cell.color || tracked.type !== cell.type) return false;
        }
      }
    }
    if (this.piecesBySquare.size !== activeCount) return false;
    let uncapturedInIdMap = 0;
    for (const rec of this.piecesById.values()) {
      if (!rec.captured) {
        uncapturedInIdMap += 1;
        if (this.piecesBySquare.get(rec.square) !== rec) return false;
      } else if (rec.square !== '') {
        return false;
      }
    }
    return uncapturedInIdMap === activeCount;
  }

  getLegalTargets(fromSquare: string): string[] {
    const piece = this.piecesBySquare.get(fromSquare);
    if (!piece || piece.color !== this.getTurn() || this.chess.isGameOver()) {
      return [];
    }
    const moves = this.chess.moves({ square: fromSquare as Square, verbose: true });
    const seen = new Set<string>();
    for (const m of moves) {
      seen.add(m.to);
    }
    return Array.from(seen);
  }

  needsPromotion(fromSquare: string, toSquare: string): boolean {
    const piece = this.piecesBySquare.get(fromSquare);
    if (!piece || piece.type !== 'p' || piece.color !== this.getTurn()) {
      return false;
    }
    const targetRank = toSquare[1];
    if (
      (piece.color === 'w' && targetRank !== '8') ||
      (piece.color === 'b' && targetRank !== '1')
    ) {
      return false;
    }
    const legal = this.chess.moves({ square: fromSquare as Square, verbose: true });
    return legal.some((m) => m.to === toSquare && Boolean(m.promotion));
  }

  canMove(fromSquare: string, toSquare: string): boolean {
    if (this.chess.isGameOver()) return false;
    const legal = this.chess.moves({ square: fromSquare as Square, verbose: true });
    return legal.some((m) => m.to === toSquare);
  }

  tryMove(
    fromSquare: string,
    toSquare: string,
    promotion?: Exclude<PieceType, 'p' | 'k'>,
  ): MoveOutcome {
    if (this.chess.isGameOver()) {
      return { accepted: false, from: fromSquare, to: toSquare };
    }

    const movingPiece = this.piecesBySquare.get(fromSquare);
    if (!movingPiece || movingPiece.color !== this.getTurn()) {
      return { accepted: false, from: fromSquare, to: toSquare };
    }

    if (!promotion && this.needsPromotion(fromSquare, toSquare)) {
      return {
        accepted: false,
        from: fromSquare,
        to: toSquare,
        movedPieceId: movingPiece.id,
        needsPromotion: true,
      };
    }

    let moveResult;
    try {
      moveResult = this.chess.move({
        from: fromSquare as Square,
        to: toSquare as Square,
        promotion: promotion as PieceSymbol | undefined,
      });
    } catch {
      return { accepted: false, from: fromSquare, to: toSquare };
    }

    if (!moveResult) {
      return { accepted: false, from: fromSquare, to: toSquare };
    }

    this.lastMoveSan = moveResult.san;
    this.halfMovesCompleted += 1;

    let capturedPieceId: string | undefined;
    let capturedSquare: string | undefined;

    // Handle capture (including en passant)
    if (moveResult.captured) {
      if (moveResult.isEnPassant()) {
        const capRank = movingPiece.color === 'w' ? '5' : '4';
        capturedSquare = `${toSquare[0]}${capRank}`;
      } else {
        capturedSquare = toSquare;
      }
      const capturedRec = this.piecesBySquare.get(capturedSquare);
      if (capturedRec) {
        capturedRec.captured = true;
        capturedRec.square = '';
        capturedPieceId = capturedRec.id;
        this.piecesBySquare.delete(capturedSquare);
      }
    }

    // Move the primary piece in our registry
    this.piecesBySquare.delete(fromSquare);
    movingPiece.square = toSquare;
    if (moveResult.promotion) {
      movingPiece.type = moveResult.promotion as PieceType;
    }
    this.piecesBySquare.set(toSquare, movingPiece);

    // Handle castling rook movement
    let rookMove: MoveOutcome['rookMove'];
    if (moveResult.isKingsideCastle() || moveResult.isQueensideCastle()) {
      const rank = movingPiece.color === 'w' ? '1' : '8';
      const rookFrom = moveResult.isKingsideCastle() ? `h${rank}` : `a${rank}`;
      const rookTo = moveResult.isKingsideCastle() ? `f${rank}` : `d${rank}`;
      const rookRec = this.piecesBySquare.get(rookFrom);
      if (rookRec) {
        this.piecesBySquare.delete(rookFrom);
        rookRec.square = rookTo;
        this.piecesBySquare.set(rookTo, rookRec);
        rookMove = {
          pieceId: rookRec.id,
          from: rookFrom,
          to: rookTo,
        };
      }
    }

    return {
      accepted: true,
      from: fromSquare,
      to: toSquare,
      san: moveResult.san,
      movedPieceId: movingPiece.id,
      capturedPieceId,
      capturedSquare,
      rookMove,
      promotedTo: moveResult.promotion as PieceType | undefined,
    };
  }

  getCheckedKingSquare(): CheckedKingInfo | null {
    const inCheck = this.chess.inCheck();
    const isCheckmate = this.chess.isCheckmate();
    if (!inCheck && !isCheckmate) {
      return null;
    }
    const checkedColor = this.getTurn();
    for (const rec of this.piecesById.values()) {
      if (!rec.captured && rec.color === checkedColor && rec.type === 'k') {
        return {
          color: checkedColor,
          square: rec.square,
          isCheckmate,
        };
      }
    }
    return null;
  }

  getStatus(humanColor: PlayerColor = 'w'): ChessStatus {
    const turn = this.getTurn();
    const inCheck = this.chess.inCheck();
    const isCheckmate = this.chess.isCheckmate();
    const isStalemate = this.chess.isStalemate();
    const isDraw = this.chess.isDraw();
    const isGameOver = this.chess.isGameOver();
    const checkedKing = this.getCheckedKingSquare();

    let winner: PlayerColor | null = null;
    let outcomeText = turn === humanColor ? 'Sua vez' : 'Vez do computador';

    if (isCheckmate) {
      winner = turn === 'w' ? 'b' : 'w';
      outcomeText =
        winner === humanColor ? 'Xeque-mate — Você venceu!' : 'Xeque-mate — Computador venceu';
    } else if (isStalemate) {
      outcomeText = 'Afogamento — Empate';
    } else if (this.chess.isThreefoldRepetition()) {
      outcomeText = 'Empate por repetição';
    } else if (this.chess.isInsufficientMaterial()) {
      outcomeText = 'Empate — Material insuficiente';
    } else if (isDraw) {
      outcomeText = 'Empate — Regra dos 50 lances';
    } else if (inCheck) {
      outcomeText = turn === humanColor ? 'Você está em xeque!' : 'Computador em xeque!';
    }

    return {
      turn,
      inCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      isGameOver,
      winner,
      outcomeText,
      moveNumber: Math.floor(this.halfMovesCompleted / 2) + 1,
      lastMoveSan: this.lastMoveSan,
      checkedKing,
    };
  }
}
