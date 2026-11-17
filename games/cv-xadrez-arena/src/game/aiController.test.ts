import test from 'node:test';
import assert from 'node:assert/strict';
import { ChessMatchEngine } from './chessRules';
import { MAX_PUNCHES_PER_SEQUENCE, squareToWorld, type AiDifficulty } from './constants';
import {
  completePendingPromotion,
  createWorldPhysics,
  stepWorldPhysics,
  verifyWorldIntegrity,
  type CharacterInput,
  type PhysicsEvent,
} from './physics';
import { AiOpponentController } from './aiController';

const IDLE_INPUT: CharacterInput = {
  moveForward: 0,
  moveRight: 0,
  jumpPressed: false,
  jumpHeld: false,
  sprintHeld: false,
  leftHandHeld: false,
  rightHandHeld: false,
};

test('physical AI opponent walks, grabs, carries, and legally completes a move across all 4 difficulty levels', () => {
  for (const difficulty of [1, 2, 3, 4] as AiDifficulty[]) {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');

    const outcome = engine.tryMove('e2', 'e4');
    assert.equal(outcome.accepted, true);
    const e2Pawn = world.pieces.get(outcome.movedPieceId!)!;
    const e4Pos = squareToWorld('e4');
    e2Pawn.originSquare = 'e4';
    e2Pawn.x = e4Pos.x;
    e2Pawn.z = e4Pos.z;
    assert.equal(engine.getTurn(), 'b');

    let sawApproaching = false;
    let sawGrabbed = false;
    let sawCarrying = false;
    let completed = false;
    const initialBX = world.characters.b.x;
    const initialBZ = world.characters.b.z;

    for (let step = 0; step < 500; step++) {
      const aiInput = ai.step(world, engine, difficulty, 0, 0.025, () => 0.5);
      if (ai.phase === 'approaching') sawApproaching = true;
      if (ai.phase === 'carrying') sawCarrying = true;
      if (world.characters.b.leftHand.grabbedPieceId || world.characters.b.rightHand.grabbedPieceId) {
        sawGrabbed = true;
      }

      const events = stepWorldPhysics(
        world,
        engine,
        { w: IDLE_INPUT, b: aiInput },
        0,
        0.025,
      );

      if (events.some((e) => e.type === 'release_valid' && e.color === 'b')) {
        completed = true;
        break;
      }
    }

    assert.equal(sawApproaching, true, `Level ${difficulty} AI must physically walk toward piece`);
    assert.equal(sawGrabbed, true, `Level ${difficulty} AI must physically grab its piece`);
    assert.equal(sawCarrying, true, `Level ${difficulty} AI must physically carry its piece`);
    assert.equal(completed, true, `Level ${difficulty} AI must complete its legal move`);
    assert.equal(engine.getTurn(), 'w', 'Turn must return to human (White) after AI move');
    assert.ok(
      Math.hypot(world.characters.b.x - initialBX, world.characters.b.z - initialBZ) > 0.2,
      'AI character must have physically moved on the board',
    );
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }
});

test('AI playing as White opens the first move cleanly when human is assigned Black', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const ai = new AiOpponentController('w');

  assert.equal(engine.getTurn(), 'w');
  let completed = false;
  for (let step = 0; step < 500; step++) {
    const aiInput = ai.step(world, engine, 2, Math.PI, 0.025, () => 0.5);
    const events = stepWorldPhysics(
      world,
      engine,
      { w: aiInput, b: IDLE_INPUT },
      Math.PI,
      0.025,
    );
    if (events.some((e) => e.type === 'release_valid' && e.color === 'w')) {
      completed = true;
      break;
    }
  }

  assert.equal(completed, true, 'White AI must physically complete opening move');
  assert.equal(engine.getTurn(), 'b', 'Turn must advance to Black (human)');
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('AI engages in occasional controlled combat during human turn, respects 6-punch/10s cooldown, and scales by difficulty', () => {
  // Level 4 AI vs nearby human on empty center board -> engages and punches, stops cleanly on cooldown
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');

    world.characters.w.x = 0;
    world.characters.w.z = 2.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -1.5;
    world.characters.b.yaw = 0;

    let aiPunchHits = 0;
    let aiCooldownTriggered = false;
    for (let step = 0; step < 900; step++) {
      // Keep human relatively near the center so AI gets fair opportunities without human fleeing across board
      if (Math.hypot(world.characters.w.x, world.characters.w.z - 1.5) > 2.5) {
        world.characters.w.x = 0;
        world.characters.w.z = 1.5;
        world.characters.w.vx = 0;
        world.characters.w.vz = 0;
      }
      const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.65);
      const events = stepWorldPhysics(
        world,
        engine,
        { w: IDLE_INPUT, b: aiInput },
        0,
        0.025,
      );
      if (events.some((e) => e.type === 'punch_hit' && e.color === 'w')) {
        aiPunchHits++;
      }
      if (world.characters.b.punchSequenceCooldown > 0) {
        aiCooldownTriggered = true;
      }
      if (aiPunchHits >= MAX_PUNCHES_PER_SEQUENCE && aiCooldownTriggered) {
        break;
      }
    }

    assert.ok(aiPunchHits >= 1, 'Level 4 AI should land punches on nearby human');
    assert.ok(
      world.characters.b.punchesRemaining <= MAX_PUNCHES_PER_SEQUENCE &&
        world.characters.b.punchesRemaining >= 0,
    );
  }

  // Level 1 AI attacks significantly less often than Level 4 AI over the same window
  const runCombatCount = (difficulty: AiDifficulty) => {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');

    world.characters.w.x = 0;
    world.characters.w.z = 1.2;
    world.characters.b.x = 0;
    world.characters.b.z = -1.2;

    let swings = 0;
    for (let step = 0; step < 600; step++) {
      world.characters.w.x = 0;
      world.characters.w.z = 1.0;
      world.characters.w.isKnockedDown = false;
      world.characters.w.stunTimer = 0;
      const aiInput = ai.step(world, engine, difficulty, 0, 0.025, () => 0.65);
      const events = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: aiInput }, 0, 0.025);
      if (
        events.some(
          (e) => (e.type === 'punch_swing' || e.type === 'grapple_start') && e.color === 'b',
        )
      ) {
        swings++;
      }
    }
    return swings;
  };

  const level1Swings = runCombatCount(1);
  const level4Swings = runCombatCount(4);
  assert.ok(
    level1Swings < level4Swings,
    `Level 1 AI swings (${level1Swings}) must be lower than Level 4 (${level4Swings})`,
  );
  assert.ok(level4Swings < 25, `Level 4 AI must not spam punches constantly (got ${level4Swings})`);
});

test('AI physically grapples and drags human during human turn, resists when grabbed, and abandons grapple when chess turn arrives', () => {
  // 1. Level 4 AI initiates grapple when close on human turn and releases immediately when AI turn begins
  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');

    world.characters.w.x = 0;
    world.characters.w.z = 1.2;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.6;
    world.characters.b.yaw = 0;

    let sawAiGrapple = false;
    let aiPunchSwingsBeforeGrapple = 0;
    for (let step = 0; step < 260; step++) {
      // Deterministic roll 0.4 triggers grapple choice cleanly without Level 4 pre-grapple jab
      const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.4);
      const events = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: aiInput }, 0, 0.025);
      aiPunchSwingsBeforeGrapple += events.filter((e) => e.type === 'punch_swing' && e.color === 'b').length;
      if (events.some((e) => e.type === 'grapple_start' && e.color === 'b')) {
        sawAiGrapple = true;
        break;
      }
    }
    assert.equal(sawAiGrapple, true, 'AI must be able to grab human during human turn');
    assert.equal(aiPunchSwingsBeforeGrapple, 0);
    assert.equal(world.characters.b.punchesRemaining, 5, 'AI valid grab must consume exactly 1 charge (6 -> 5)');
    assert.equal(ai.phase, 'combat_grapple');

    // Now switch turn to Black -> AI immediately abandons grapple and moves to chess phase
    const moveRes = engine.tryMove('e2', 'e4');
    assert.equal(moveRes.accepted, true);
    const e4Pos = squareToWorld('e4');
    const e2Pawn = world.pieces.get(moveRes.movedPieceId!)!;
    e2Pawn.originSquare = 'e4';
    e2Pawn.x = e4Pos.x;
    e2Pawn.z = e4Pos.z;

    const turnStartInput = ai.step(world, engine, 4, 0, 0.025, () => 0.5);
    assert.equal(Boolean(turnStartInput.grappleHeld), false, 'AI must release grapple when its chess turn begins');
    assert.notEqual(ai.phase, 'combat_grapple');
  }

  // 1b. AI obeys 6-charge / 10s cooldown when grappling repeatedly and cannot bypass it
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');
    world.characters.b.punchesRemaining = 1;

    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.6;
    world.characters.b.yaw = 0;

    let sawLastChargeGrapple = false;
    for (let step = 0; step < 260; step++) {
      const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.02);
      const events = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: aiInput }, 0, 0.025);
      if (events.some((e) => e.type === 'grapple_start' && e.color === 'b')) {
        sawLastChargeGrapple = true;
        break;
      }
    }
    assert.equal(sawLastChargeGrapple, true, 'AI with 1 charge remaining can initiate 1 final grapple');
    assert.equal(world.characters.b.punchesRemaining, 0);
    assert.ok(world.characters.b.punchSequenceCooldown > 9.0, 'AI must enter 10s cooldown after 6th charge');

    // Release hold and verify AI cannot start any new grapple or punch during cooldown
    world.characters.b.grappleTargetColor = null;
    world.characters.w.grabbedByColor = null;
    world.characters.w.grappleEscapeCooldown = 0;
    for (let step = 0; step < 80; step++) {
      const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.02);
      const events = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: aiInput }, 0, 0.025);
      assert.equal(
        events.some((e) => (e.type === 'grapple_start' || e.type === 'punch_swing') && e.color === 'b'),
        false,
        'AI must not grapple or punch while in cooldown',
      );
    }
  }

  // 2. When human grabs Level 4 AI, AI resists and escapes
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/P7/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const ai = new AiOpponentController('b');

    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.7;
    world.characters.b.yaw = 0;

    let escaped = false;
    for (let step = 0; step < 120; step++) {
      const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.1);
      const events = stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true },
          b: aiInput,
        },
        0,
        0.025,
      );
      if (events.some((e) => e.type === 'grapple_break' && e.targetColor === 'b')) {
        escaped = true;
        break;
      }
    }
    assert.equal(escaped, true, 'Grabbed AI must actively resist and break free');
  }
});

test('human combat punches connect against AI holding a piece and AI recovers to complete its move', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const ai = new AiOpponentController('b');

  const outcome = engine.tryMove('e2', 'e4');
  const e2Pawn = world.pieces.get(outcome.movedPieceId!)!;
  const e4Pos = squareToWorld('e4');
  e2Pawn.originSquare = 'e4';
  e2Pawn.x = e4Pos.x;
  e2Pawn.z = e4Pos.z;

  let sawHumanPunchHitWhileAiCarrying = false;
  let completed = false;
  for (let step = 0; step < 500; step++) {
    const aiInput = ai.step(world, engine, 2, 0, 0.025, () => 0.5);
    const aiIsCarrying = Boolean(
      world.characters.b.leftHand.grabbedPieceId || world.characters.b.rightHand.grabbedPieceId,
    );

    if (aiIsCarrying && !sawHumanPunchHitWhileAiCarrying) {
      // Aim human directly toward AI's torso from the side/front to land one crisp punch
      world.characters.w.x = world.characters.b.x + 1.5;
      world.characters.w.z = world.characters.b.z;
      world.characters.w.yaw = -Math.PI / 2;
    }

    const events: PhysicsEvent[] = stepWorldPhysics(
      world,
      engine,
      {
        w: {
          ...IDLE_INPUT,
          leftPunchPressed: aiIsCarrying && !sawHumanPunchHitWhileAiCarrying,
          leftHandHeld: aiIsCarrying && !sawHumanPunchHitWhileAiCarrying,
        },
        b: aiInput,
      },
      0,
      0.025,
    );

    if (aiIsCarrying && events.some((e) => e.type === 'punch_hit' && e.color === 'b')) {
      sawHumanPunchHitWhileAiCarrying = true;
      // Step human back so AI can finish recovering cleanly
      world.characters.w.x = 0;
      world.characters.w.z = 8;
    }

    if (events.some((e) => e.type === 'release_valid' && e.color === 'b')) {
      completed = true;
      break;
    }
  }

  assert.equal(
    sawHumanPunchHitWhileAiCarrying,
    true,
    'Human must be able to land a punch on the AI while AI is holding a piece',
  );
  assert.equal(completed, true, 'AI must recover cleanly and complete its legal move');
  assert.equal(engine.getTurn(), 'w');
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('AI pawn promotion resolves automatically without human modal', () => {
  const engine = new ChessMatchEngine('4k3/8/8/8/8/8/p7/4K3 b - - 0 1');
  const world = createWorldPhysics(engine);
  const ai = new AiOpponentController('b');

  let promoted = false;
  for (let step = 0; step < 500; step++) {
    const aiInput = ai.step(world, engine, 4, 0, 0.025, () => 0.5);
    const events = stepWorldPhysics(
      world,
      engine,
      { w: IDLE_INPUT, b: aiInput },
      0,
      0.025,
    );
    if (world.pendingPromotion && world.pendingPromotion.color === 'b') {
      const promoEvs: PhysicsEvent[] = [];
      const ok = completePendingPromotion(world, engine, ai.getPendingPromotionChoice(), promoEvs);
      assert.equal(ok, true);
      promoted = true;
      break;
    }
    if (events.some((e) => e.type === 'release_valid' && e.color === 'b')) {
      break;
    }
  }

  assert.equal(promoted, true, 'AI pawn reaching rank 1 must trigger and auto-complete promotion');
  assert.equal(engine.getTurn(), 'w');
  assert.equal(verifyWorldIntegrity(world, engine), true);
});
