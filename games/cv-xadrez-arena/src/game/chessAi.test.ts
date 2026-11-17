import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { chooseBestMove } from './chessAi';
import type { AiDifficulty } from './constants';

const ALL_LEVELS: AiDifficulty[] = [1, 2, 3, 4];

test('all 4 AI difficulty levels return strictly legal moves and obey check/gameover rules', () => {
  const fens = [
    new Chess().fen(), // Opening
    'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', // Ruy Lopez/Italian setup
    '4r2k/8/8/8/8/8/4N3/4K3 w - - 0 1', // White in check/pin scenario
  ];

  for (const fen of fens) {
    const chess = new Chess(fen);
    const legalSans = new Set(chess.moves());
    for (const lvl of ALL_LEVELS) {
      const choice = chooseBestMove(fen, lvl, () => 0.5);
      assert.ok(choice, `Level ${lvl} must return a move for ${fen}`);
      assert.ok(legalSans.has(choice.san), `Level ${lvl} move ${choice.san} must be legal`);
    }
  }

  // Checkmate returns null
  const mateFen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
  for (const lvl of ALL_LEVELS) {
    assert.equal(chooseBestMove(mateFen, lvl), null);
  }
});

test('levels 2, 3, and 4 immediately spot mate-in-1', () => {
  // Black to move: Qh4# is mate in 1
  const fen = 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2';
  for (const lvl of [2, 3, 4] as AiDifficulty[]) {
    const choice = chooseBestMove(fen, lvl, () => 0.5);
    assert.ok(choice);
    assert.equal(choice.san, 'Qh4#', `Level ${lvl} must find Qh4# mate-in-1`);
  }
});

test('levels 3 and 4 avoid blundering a free queen and capture undefended material', () => {
  // Black queen on d5 is attacked by White knight on c3? No, let's test Black to move:
  // White rook on e4 is completely undefended and Black queen on d5 can take it,
  // while moving Qc5 walks onto an attacked square by b4 pawn.
  // Better: Black to move has a free White Queen on d4 vs poisoned captures.
  // Black rook on d2 attacks undefended White Queen on d4; White King safely on g1
  const freeQueenFen = '4k3/8/8/8/3Q4/8/3r4/6K1 b - - 0 1';
  for (const lvl of [2, 3, 4] as AiDifficulty[]) {
    const choice = chooseBestMove(freeQueenFen, lvl, () => 0.5);
    assert.ok(choice);
    assert.equal(choice.to, 'd4', `Level ${lvl} should capture the undefended White Queen`);
  }
});

test('higher difficulty levels (3 & 4) show stronger tactical play than Level 1', () => {
  // Position where Black can win a rook via a 2-move tactic or avoid losing material,
  // while Level 1 with mistake-making rng picks a suboptimal move.
  // Black king g8, Black rook d8, Black bishop g7; White king g1, White rook a1, White queen e2, White pawn b2.
  // Wait: simpler clear tactical test — White queen on d4 is defended by e3 pawn,
  // while White rook on a1 is undefended and Black bishop on g7 can capture Ra1 (Bxa1).
  const tacticalFen = '4k3/6b1/8/8/3Q4/4P3/5PPP/R5K1 b - - 0 1';
  const lvl1Choice = chooseBestMove(tacticalFen, 1, () => 0.25); // triggers Level 1 suboptimal pool
  const lvl4Choice = chooseBestMove(tacticalFen, 4, () => 0.5);

  assert.ok(lvl1Choice);
  assert.ok(lvl4Choice);
  assert.equal(lvl4Choice.san, 'Bxd4', 'Level 4 captures the undefended Queen on d4');
  // Even if Level 1 sees a capture, with rng=0.25 (<0.35) it chooses from suboptimal pool
  assert.notEqual(lvl1Choice.san, 'Bxd4');

  // Verify node search work increases strictly from Level 1 -> Level 4
  const openingFen = new Chess().fen();
  const c1 = chooseBestMove(openingFen, 1, () => 0.5)!;
  const c2 = chooseBestMove(openingFen, 2, () => 0.5)!;
  const c3 = chooseBestMove(openingFen, 3, () => 0.5)!;
  const c4 = chooseBestMove(openingFen, 4, () => 0.5)!;
  assert.ok(c2.nodesSearched > c1.nodesSearched);
  assert.ok(c3.nodesSearched > c2.nodesSearched);
  assert.ok(c4.nodesSearched >= c3.nodesSearched);
});

test('AI chooses a valid promotion piece when promoting a pawn', () => {
  const promoFen = '4K3/8/8/8/8/8/p7/4k3 b - - 0 1';
  for (const lvl of ALL_LEVELS) {
    const choice = chooseBestMove(promoFen, lvl, () => 0.5);
    assert.ok(choice);
    if (choice.to === 'a1') {
      assert.ok(choice.promotion, 'Promotion move must include promotion piece type');
    }
  }
});
