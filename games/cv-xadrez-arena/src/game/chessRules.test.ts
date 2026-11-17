import test from 'node:test';
import assert from 'node:assert/strict';
import { ChessMatchEngine } from './chessRules';

test('initial chess board has 32 pieces and starts on white turn', () => {
  const engine = new ChessMatchEngine();
  assert.equal(engine.getAllPieces().length, 32);
  assert.equal(engine.getTurn(), 'w');
  const status = engine.getStatus();
  assert.equal(status.isGameOver, false);
  assert.equal(status.outcomeText, 'Sua vez');
});

test('legal move advances turn and updates piece registry; illegal move rejects without changing turn', () => {
  const engine = new ChessMatchEngine();
  const invalid = engine.tryMove('e2', 'e5');
  assert.equal(invalid.accepted, false);
  assert.equal(engine.getTurn(), 'w');

  const valid = engine.tryMove('e2', 'e4');
  assert.equal(valid.accepted, true);
  assert.equal(valid.san, 'e4');
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('e2'), undefined);
  assert.equal(engine.getPieceAt('e4')?.color, 'w');
  assert.equal(engine.getPieceAt('e4')?.type, 'p');
});

test('en passant capture removes enemy pawn on adjacent file', () => {
  const engine = new ChessMatchEngine();
  assert.equal(engine.tryMove('e2', 'e4').accepted, true);
  assert.equal(engine.tryMove('a7', 'a6').accepted, true);
  assert.equal(engine.tryMove('e4', 'e5').accepted, true);
  assert.equal(engine.tryMove('d7', 'd5').accepted, true);

  const ep = engine.tryMove('e5', 'd6');
  assert.equal(ep.accepted, true);
  assert.equal(ep.capturedSquare, 'd5');
  assert.ok(ep.capturedPieceId);
  assert.equal(engine.getPieceAt('d5'), undefined);
  assert.equal(engine.getPieceAt('d6')?.color, 'w');
});

test('castling moves both king and rook', () => {
  const engine = new ChessMatchEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  const castle = engine.tryMove('e1', 'g1');
  assert.equal(castle.accepted, true);
  assert.ok(castle.rookMove);
  assert.equal(castle.rookMove.from, 'h1');
  assert.equal(castle.rookMove.to, 'f1');
  assert.equal(engine.getPieceAt('g1')?.type, 'k');
  assert.equal(engine.getPieceAt('f1')?.type, 'r');
});

test('pawn promotion prompts when no promotion piece provided and upgrades piece when confirmed', () => {
  const engine = new ChessMatchEngine('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  const prompt = engine.tryMove('a7', 'a8');
  assert.equal(prompt.accepted, false);
  assert.equal(prompt.needsPromotion, true);
  assert.equal(engine.getTurn(), 'w');

  const promoted = engine.tryMove('a7', 'a8', 'q');
  assert.equal(promoted.accepted, true);
  assert.equal(promoted.promotedTo, 'q');
  assert.equal(engine.getPieceAt('a8')?.type, 'q');
  assert.equal(engine.getTurn(), 'b');
});

test('checkmate detection works (Fools Mate)', () => {
  const engine = new ChessMatchEngine();
  assert.equal(engine.tryMove('f2', 'f3').accepted, true);
  assert.equal(engine.tryMove('e7', 'e5').accepted, true);
  assert.equal(engine.tryMove('g2', 'g4').accepted, true);
  assert.equal(engine.tryMove('d8', 'h4').accepted, true);

  const status = engine.getStatus();
  assert.equal(status.isCheckmate, true);
  assert.equal(status.isGameOver, true);
  assert.equal(status.winner, 'b');
  assert.equal(engine.verifyIntegrity(), true);
});

test('stalemate detection, check-resolution enforcement, and castling-through-check rejection', () => {
  // Stalemate position: Black king on h8, White queen on f7, White king on f6
  const stale = new ChessMatchEngine('7k/5Q2/5K2/8/8/8/8/8 b - - 0 1');
  const stStatus = stale.getStatus();
  assert.equal(stStatus.isStalemate, true);
  assert.equal(stStatus.isGameOver, true);
  assert.equal(stStatus.winner, null);

  // Must resolve check: White king on e1 is in check from Black rook on e8; moving a2->a3 must be rejected
  const checkEngine = new ChessMatchEngine('4r2k/8/8/8/8/8/P7/4K3 w - - 0 1');
  assert.equal(checkEngine.tryMove('a2', 'a3').accepted, false);
  assert.equal(checkEngine.tryMove('e1', 'd1').accepted, true);
  assert.equal(checkEngine.verifyIntegrity(), true);

  // Castling through attacked f1 square must be rejected
  const castleCheck = new ChessMatchEngine('5r1k/8/8/8/8/8/8/R3K2R w KQ - 0 1');
  assert.equal(castleCheck.tryMove('e1', 'g1').accepted, false);
  assert.equal(castleCheck.verifyIntegrity(), true);
});

test('getStatus adapts turn and checkmate messages when human plays Black', () => {
  const engine = new ChessMatchEngine();
  assert.equal(engine.getStatus('b').outcomeText, 'Vez do computador');
  assert.equal(engine.tryMove('f2', 'f3').accepted, true);
  assert.equal(engine.getStatus('b').outcomeText, 'Sua vez');
  assert.equal(engine.tryMove('e7', 'e5').accepted, true);
  assert.equal(engine.tryMove('g2', 'g4').accepted, true);
  assert.equal(engine.tryMove('d8', 'h4').accepted, true);

  const mateStatus = engine.getStatus('b');
  assert.equal(mateStatus.isCheckmate, true);
  assert.equal(mateStatus.winner, 'b');
  assert.equal(mateStatus.outcomeText, 'Xeque-mate — Você venceu!');
});

test('getDetailedHistory records only completed legal moves chronologically and excludes illegal attempts', () => {
  const engine = new ChessMatchEngine();
  assert.deepEqual(engine.getDetailedHistory(), []);

  // Illegal move is rejected and excluded from history
  assert.equal(engine.tryMove('e2', 'e5').accepted, false);
  assert.equal(engine.getDetailedHistory().length, 0);

  // Legal moves by White & Black
  assert.equal(engine.tryMove('e2', 'e4').accepted, true);
  assert.equal(engine.tryMove('e7', 'e5').accepted, true);
  assert.equal(engine.tryMove('g1', 'f3').accepted, true);
  assert.equal(engine.tryMove('b8', 'c6').accepted, true);

  const history = engine.getDetailedHistory();
  assert.equal(history.length, 4);
  assert.deepEqual(
    history.map((h) => ({
      moveNumber: h.moveNumber,
      color: h.color,
      piece: h.piece,
      from: h.from,
      to: h.to,
    })),
    [
      { moveNumber: 1, color: 'w', piece: 'p', from: 'e2', to: 'e4' },
      { moveNumber: 1, color: 'b', piece: 'p', from: 'e7', to: 'e5' },
      { moveNumber: 2, color: 'w', piece: 'n', from: 'g1', to: 'f3' },
      { moveNumber: 2, color: 'b', piece: 'n', from: 'b8', to: 'c6' },
    ],
  );

  // Incomplete pawn promotion attempt must NOT enter history until confirmed
  const promoEngine = new ChessMatchEngine('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  assert.equal(promoEngine.tryMove('a7', 'a8').needsPromotion, true);
  assert.equal(promoEngine.getDetailedHistory().length, 0);
  assert.equal(promoEngine.tryMove('a7', 'a8', 'q').accepted, true);
  assert.equal(promoEngine.getDetailedHistory()[0]?.promotion, 'q');
});

test('getCheckedKingSquare tracks White/Black check, check resolution, king escape, and checkmate', () => {
  // Initial board: no king in check
  const engine = new ChessMatchEngine();
  assert.equal(engine.getCheckedKingSquare(), null);
  assert.equal(engine.getStatus('w').checkedKing, null);

  // Put Black king in check on e8 (White rook e1 -> e7+ on open board)
  const checkBlackEngine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4R2K w - - 0 1');
  assert.equal(checkBlackEngine.getCheckedKingSquare(), null);
  assert.equal(checkBlackEngine.tryMove('e1', 'e7').accepted, true);
  assert.deepEqual(checkBlackEngine.getCheckedKingSquare(), {
    color: 'b',
    square: 'e8',
    isCheckmate: false,
  });
  assert.deepEqual(checkBlackEngine.getStatus('w').checkedKing, {
    color: 'b',
    square: 'e8',
    isCheckmate: false,
  });

  // Black king moves out of check -> highlight clears immediately
  assert.equal(checkBlackEngine.tryMove('e8', 'f8').accepted, true);
  assert.equal(checkBlackEngine.getCheckedKingSquare(), null);
  assert.equal(checkBlackEngine.getStatus('w').checkedKing, null);

  // Put White king on e1 in check from Black rook on e8, then escape to d1
  const checkWhiteEngine = new ChessMatchEngine('4r2k/8/8/8/8/8/8/4K3 w - - 0 1');
  assert.deepEqual(checkWhiteEngine.getCheckedKingSquare(), {
    color: 'w',
    square: 'e1',
    isCheckmate: false,
  });
  assert.equal(checkWhiteEngine.tryMove('e1', 'd1').accepted, true);
  assert.equal(checkWhiteEngine.getCheckedKingSquare(), null);

  // Checkmate preserves checkedKing square with isCheckmate = true (Fool's Mate -> White king on e1)
  const mateEngine = new ChessMatchEngine();
  assert.equal(mateEngine.tryMove('f2', 'f3').accepted, true);
  assert.equal(mateEngine.tryMove('e7', 'e5').accepted, true);
  assert.equal(mateEngine.tryMove('g2', 'g4').accepted, true);
  assert.equal(mateEngine.tryMove('d8', 'h4').accepted, true);
  assert.deepEqual(mateEngine.getCheckedKingSquare(), {
    color: 'w',
    square: 'e1',
    isCheckmate: true,
  });
});


