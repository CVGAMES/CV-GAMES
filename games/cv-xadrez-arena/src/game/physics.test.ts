import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_PLAYABLE_HALF,
  BOARD_WALK_HALF,
  MAX_PUNCHES_PER_SEQUENCE,
  SQUARE_SIZE,
  findNearestSquare,
  squareToWorld,
} from './constants';
import { ChessMatchEngine } from './chessRules';
import {
  completePendingPromotion,
  createWorldPhysics,
  evaluateDroppedPieceLanding,
  evaluateGrabVsGrapplePriority,
  setCameraMode,
  stepWorldPhysics,
  verifyWorldIntegrity,
  type CharacterInput,
  type PhysicsEvent,
} from './physics';

const IDLE_INPUT: CharacterInput = {
  moveForward: 0,
  moveRight: 0,
  jumpPressed: false,
  jumpHeld: false,
  sprintHeld: false,
  leftHandHeld: false,
  rightHandHeld: false,
};

test('squareToWorld and findNearestSquare map coordinates accurately with off-center forgiveness', () => {
  const e4 = squareToWorld('e4');
  const exact = findNearestSquare(e4.x, e4.z);
  assert.equal(exact.square, 'e4');
  assert.equal(exact.distance, 0);

  const offCenter = findNearestSquare(e4.x + 1.2, e4.z - 0.9);
  assert.equal(offCenter.square, 'e4');
  assert.ok(offCenter.distance < SQUARE_SIZE * 0.62);
});

test('character cannot walk off playable chessboard and stays grounded under gravity', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  for (let i = 0; i < 120; i++) {
    stepWorldPhysics(
      world,
      engine,
      {
        w: { ...IDLE_INPUT, moveForward: 1, sprintHeld: true },
        b: IDLE_INPUT,
      },
      0,
      0.03,
    );
  }

  assert.ok(world.characters.w.z >= -BOARD_WALK_HALF - 0.001);
  assert.ok(world.characters.w.x <= BOARD_WALK_HALF + 0.001);
  assert.equal(world.characters.w.y, 0);
  assert.equal(world.characters.w.grounded, true);
});

test('character physically approaches, grabs, carries, and registers move ONLY upon release', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.6;
  world.characters.w.yaw = Math.PI;

  for (let i = 0; i < 20; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }

  const grabbedId = world.characters.w.leftHand.grabbedPieceId;
  assert.ok(grabbedId, 'Left hand should grab white pawn on e2');
  assert.equal(engine.getTurn(), 'w');

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.4;
  for (let i = 0; i < 30; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  assert.equal(engine.getTurn(), 'w');

  const piece = world.pieces.get(grabbedId)!;
  piece.x = e4Pos.x + 0.7;
  piece.z = e4Pos.z - 0.5;

  const events = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, leftHandHeld: false }, b: IDLE_INPUT },
    0,
    0.025,
  );

  assert.ok(events.some((e) => e.type === 'release_valid' && e.to === 'e4'));
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('e4')?.id, grabbedId);
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('releasing a piece on an invalid square rejects move, returns piece, and preserves turn', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e5Pos = squareToWorld('e5');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;

  for (let i = 0; i < 15; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const grabbedId = world.characters.w.rightHand.grabbedPieceId!;
  assert.ok(grabbedId);

  const piece = world.pieces.get(grabbedId)!;
  piece.x = e5Pos.x;
  piece.z = e5Pos.z;

  const events = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, rightHandHeld: false }, b: IDLE_INPUT },
    0,
    0.025,
  );

  assert.ok(events.some((e) => e.type === 'release_invalid'));
  assert.equal(engine.getTurn(), 'w');
  assert.equal(piece.originSquare, 'e2');
  assert.deepEqual(piece.settlingTarget, { x: e2Pos.x, y: 0, z: e2Pos.z });
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('white character cannot grab black piece', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e7Pos = squareToWorld('e7');

  world.characters.w.x = e7Pos.x;
  world.characters.w.z = e7Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;

  const events = [];
  for (let i = 0; i < 15; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
        0,
        0.025,
      ),
    );
  }

  assert.equal(world.characters.w.leftHand.grabbedPieceId, null);
  assert.ok(events.some((e) => e.type === 'wrong_color'));
});

test('switching to observer mode safely releases carried piece to origin without changing turn or sitting', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const d2Pos = squareToWorld('d2');

  world.characters.w.x = d2Pos.x;
  world.characters.w.z = d2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;

  for (let i = 0; i < 15; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const grabbedId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(grabbedId);

  const switchEvents: PhysicsEvent[] = [];
  setCameraMode(world, 'observer', switchEvents);

  assert.equal(world.cameraMode, 'observer');
  assert.equal(world.characters.w.leftHand.grabbedPieceId, null);
  assert.equal(engine.getTurn(), 'w');
  assert.equal(world.pieces.get(grabbedId)?.originSquare, 'd2');

  const prevX = world.characters.w.x;
  for (let i = 0; i < 30; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, moveForward: 1 }, b: { ...IDLE_INPUT, moveRight: 1 } },
      0,
      0.03,
    );
  }
  assert.equal('sitBlend' in world.characters.w, false);
  assert.equal('sitBlend' in world.characters.b, false);
  assert.equal(world.characters.w.y, 0);
  assert.equal(world.characters.w.x, prevX);
});

test('single-hand punch applies push/rotation/stumble, missed swings consume 1 charge, and off-balance opponents can fall', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  assert.equal(world.characters.w.punchesRemaining, MAX_PUNCHES_PER_SEQUENCE);
  assert.equal(world.characters.b.punchesRemaining, MAX_PUNCHES_PER_SEQUENCE);
  assert.equal(MAX_PUNCHES_PER_SEQUENCE, 6);

  world.characters.w.x = 0;
  world.characters.w.z = 5;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -5;
  world.characters.b.yaw = 0;

  let events: PhysicsEvent[] = [];
  for (let i = 0; i < 12; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          b: IDLE_INPUT,
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(events.some((e) => e.type === 'punch_swing' && e.color === 'w'));
  assert.equal(events.some((e) => e.type === 'punch_hit'), false);
  assert.equal(world.characters.w.punchesRemaining, 5, 'Every valid punch attempt must consume 1 charge even if it misses');
  assert.equal(world.characters.w.comboHits, 0);

  for (let i = 0; i < 20; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.03);
  }

  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;
  const initialYawB = world.characters.b.yaw;

  events = [];
  for (let i = 0; i < 8; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 },
          b: IDLE_INPUT,
        },
        0,
        0.025,
      ),
    );
  }
  const hitEv = events.find((e) => e.type === 'punch_hit' && e.color === 'b');
  assert.ok(hitEv);
  assert.equal(hitEv.knockdown, false);
  assert.equal(hitEv.combo, false);
  assert.equal(world.characters.w.punchesRemaining, 4);
  assert.equal(world.characters.b.punchesRemaining, 6, 'P2 punch count must stay independent');
  assert.ok(world.characters.b.stumbleTimer > 0);
  assert.ok(world.characters.b.vz < -1.0 && world.characters.b.vz > -7.5);
  assert.notEqual(world.characters.b.yaw, initialYawB);

  const engine2 = new ChessMatchEngine();
  const world2 = createWorldPhysics(engine2);
  world2.characters.w.x = 0;
  world2.characters.w.z = 1.0;
  world2.characters.w.yaw = Math.PI;
  world2.characters.b.x = 0;
  world2.characters.b.z = -0.7;
  world2.characters.b.yaw = 0;
  world2.characters.b.balance = 0.25;

  const fallEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 8; i++) {
    fallEvents.push(
      ...stepWorldPhysics(
        world2,
        engine2,
        {
          w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          b: IDLE_INPUT,
        },
        0,
        0.025,
      ),
    );
  }
  assert.equal(fallEvents.find((e) => e.type === 'punch_hit')?.knockdown, true);
  assert.equal(world2.characters.b.isKnockedDown, true);
});

test('6-punch limit across mixed hand combinations triggers 10s cooldown ONLY after 6th hit and auto-restores all 6 punches', () => {
  const sequences: Array<ReadonlyArray<'left' | 'right'>> = [
    ['left', 'left', 'left', 'left', 'left', 'left'],
    ['right', 'right', 'right', 'right', 'right', 'right'],
    ['left', 'right', 'left', 'right', 'left', 'right'],
    ['right', 'left', 'right', 'left', 'right', 'left'],
  ];

  for (const seq of sequences) {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);

    for (let stepIdx = 0; stepIdx < 6; stepIdx++) {
      const hand = seq[stepIdx];
      // Reset knockdown/stun cleanly before punches so opponent can be struck 6 times
      world.characters.b.isKnockedDown = false;
      world.characters.b.stunTimer = 0;
      world.characters.b.balance = 1.0;
      world.characters.w.x = 0;
      world.characters.w.z = 1.0;
      world.characters.w.yaw = Math.PI;
      world.characters.b.x = 0;
      world.characters.b.z = -0.8;
      world.characters.b.yaw = 0;

      const hitEvents: PhysicsEvent[] = [];
      for (let i = 0; i < 8; i++) {
        hitEvents.push(
          ...stepWorldPhysics(
            world,
            engine,
            {
              w: {
                ...IDLE_INPUT,
                leftPunchPressed: hand === 'left' && i === 0,
                leftHandHeld: hand === 'left' && i === 0,
                rightPunchPressed: hand === 'right' && i === 0,
                rightHandHeld: hand === 'right' && i === 0,
              },
              b: IDLE_INPUT,
            },
            0,
            0.025,
          ),
        );
      }

      const ev = hitEvents.find((e) => e.type === 'punch_hit' && e.color === 'b');
      assert.ok(ev, `${seq.join('-')} step ${stepIdx + 1} should hit`);
      assert.equal(world.characters.w.punchesRemaining, 5 - stepIdx);

      if (stepIdx === 2) {
        assert.equal(ev.combo, true, `${seq.join('-')} 3rd hit triggers combo knockdown`);
        assert.equal(ev.knockdown, true);
        assert.equal(world.characters.w.punchesRemaining, 3);
        assert.equal(world.characters.w.punchSequenceCooldown, 0);
      }

      if (stepIdx < 5) {
        assert.equal(world.characters.w.punchSequenceCooldown, 0);
        // Wait 0.65s so pushCooldown (0.36s) and per-hand cooldown (0.55s) expire
        for (let i = 0; i < 26; i++) {
          stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
        }
      } else {
        // 6th punch: 0 remaining + immediate 10-second cooldown!
        assert.equal(world.characters.w.punchesRemaining, 0);
        assert.ok(
          world.characters.w.punchSequenceCooldown > 9.5,
          '10-second cooldown must start immediately after 6th punch',
        );
      }
    }

    // Wait 3s for defender to recover; neither hand of P1 can bypass cooldown!
    for (let i = 0; i < 120; i++) {
      stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    }
    assert.ok(world.characters.w.punchSequenceCooldown > 6.5);

    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.8;
    world.characters.b.yaw = 0;

    const blockedEvents: PhysicsEvent[] = [];
    for (let i = 0; i < 10; i++) {
      blockedEvents.push(
        ...stepWorldPhysics(
          world,
          engine,
          {
            w: {
              ...IDLE_INPUT,
              leftPunchPressed: i === 0,
              leftHandHeld: i === 0,
              rightPunchPressed: i === 2,
              rightHandHeld: i === 2,
            },
            b: IDLE_INPUT,
          },
          0,
          0.025,
        ),
      );
    }
    assert.equal(
      blockedEvents.some((e) => e.type === 'punch_swing' && e.color === 'w'),
      false,
      'P1 must not punch with either hand during 10s recharge',
    );
    assert.equal(blockedEvents.some((e) => e.type === 'punch_hit' && e.color === 'b'), false);

    // P2 remains completely independent with 6 punches
    assert.equal(world.characters.b.punchesRemaining, 6);
    assert.equal(world.characters.b.punchSequenceCooldown, 0);
    const p2Events: PhysicsEvent[] = [];
    for (let i = 0; i < 8; i++) {
      p2Events.push(
        ...stepWorldPhysics(
          world,
          engine,
          {
            w: IDLE_INPUT,
            b: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          },
          0,
          0.025,
        ),
      );
    }
    assert.ok(p2Events.some((e) => e.type === 'punch_hit' && e.color === 'w'));
    assert.equal(world.characters.b.punchesRemaining, 5);

    // Wait remaining cooldown so full 10s finishes -> all 6 punches restore for P1
    for (let i = 0; i < 360; i++) {
      stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.03);
    }
    assert.equal(world.characters.w.punchSequenceCooldown, 0);
    assert.equal(world.characters.w.punchesRemaining, 6);
    assert.equal(world.characters.w.combatEnergy, 100);
  }
});

test('improved punch hitbox: connects slightly off-axis near punching hand, rejects from behind/far, and blocks behind large chess obstacle', () => {
  // 1) Lateral close-range punch aligned toward punching hand side connects
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    // White faces -Z (yaw = Math.PI). Right hand is at +X side (+0.52), Left hand at -X side (-0.52).
    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    // Place Black slightly to White's right side (+0.95 X, -0.75 Z)
    world.characters.b.x = 0.95;
    world.characters.b.z = -0.75;
    world.characters.b.yaw = 0;

    const events: PhysicsEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        ...stepWorldPhysics(
          world,
          engine,
          { w: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 }, b: IDLE_INPUT },
          0,
          0.025,
        ),
      );
    }
    assert.ok(
      events.some((e) => e.type === 'punch_hit' && e.color === 'b'),
      'Right-hand punch should connect when opponent is slightly to the right side at close range',
    );
  }

  // 2) Opponent behind attacker must NOT get hit
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    world.characters.w.x = 0;
    world.characters.w.z = 0;
    world.characters.w.yaw = Math.PI; // facing -Z
    world.characters.b.x = 0;
    world.characters.b.z = 1.35; // behind White (+Z)
    world.characters.b.yaw = 0;

    const events: PhysicsEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        ...stepWorldPhysics(
          world,
          engine,
          { w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 }, b: IDLE_INPUT },
          0,
          0.025,
        ),
      );
    }
    assert.equal(
      events.some((e) => e.type === 'punch_hit'),
      false,
      'Punch must not hit opponent standing behind attacker',
    );
  }

  // 3) Opponent too far apart must remain safe (dodgeable)
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    world.characters.w.x = 0;
    world.characters.w.z = 2.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -1.6; // center distance 3.6 > PUNCH_MAX_CENTER_DIST (3.25)
    world.characters.b.yaw = 0;

    const events: PhysicsEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        ...stepWorldPhysics(
          world,
          engine,
          { w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 }, b: IDLE_INPUT },
          0,
          0.025,
        ),
      );
    }
    assert.equal(
      events.some((e) => e.type === 'punch_hit'),
      false,
      'Punch must not hit opponent outside max balanced range',
    );
  }

  // 4) Large chess piece obstacle (Queen on d4) between attacker and defender blocks the punch
  {
    const engine = new ChessMatchEngine('4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const d4 = squareToWorld('d4');
    world.characters.w.x = d4.x;
    world.characters.w.z = d4.z + 1.25;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = d4.x;
    world.characters.b.z = d4.z - 1.25;
    world.characters.b.yaw = 0;

    const events: PhysicsEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        ...stepWorldPhysics(
          world,
          engine,
          { w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 }, b: IDLE_INPUT },
          0,
          0.025,
        ),
      );
    }
    assert.equal(
      events.some((e) => e.type === 'punch_hit'),
      false,
      'Large chess piece directly between characters must block punch',
    );
  }
});

test('missing mid-sequence resets consecutive combo streak and still consumes 1 punch charge', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;

  for (let i = 0; i < 8; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  assert.equal(world.characters.w.punchesRemaining, 5);
  assert.equal(world.characters.w.comboHits, 1);

  world.characters.b.z = -6.0;
  for (let i = 0; i < 16; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  assert.equal(world.characters.w.punchesRemaining, 4);
  assert.equal(world.characters.w.comboHits, 0);
});

test('two-hand grip protection keeps piece attached on 1st and 2nd punches and releases cleanly on 3rd punch with chess validation', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;

  for (let i = 0; i < 20; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }

  const pawnId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(pawnId);
  assert.equal(world.characters.w.rightHand.grabbedPieceId, pawnId, 'Both hands must grip the same piece');
  const pawn = world.pieces.get(pawnId)!;
  assert.equal(pawn.heldHands, 2);

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.48;
  pawn.x = e4Pos.x;
  pawn.z = e4Pos.z;
  pawn.vx = 0;
  pawn.vz = 0;

  for (const hitIdx of [1, 2]) {
    world.characters.w.x = e4Pos.x;
    world.characters.w.z = e4Pos.z + 1.48;
    world.characters.b.x = e4Pos.x + 1.65;
    world.characters.b.z = e4Pos.z + 1.48;
    world.characters.b.yaw = -Math.PI / 2;

    const evs: PhysicsEvent[] = [];
    for (let i = 0; i < 8; i++) {
      evs.push(
        ...stepWorldPhysics(
          world,
          engine,
          {
            w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
            b: {
              ...IDLE_INPUT,
              leftPunchPressed: hitIdx === 1 && i === 0,
              leftHandHeld: hitIdx === 1 && i === 0,
              rightPunchPressed: hitIdx === 2 && i === 0,
              rightHandHeld: hitIdx === 2 && i === 0,
            },
          },
          0,
          0.025,
        ),
      );
    }
    assert.ok(evs.some((e) => e.type === 'punch_hit' && e.color === 'w'));
    assert.equal(evs.some((e) => e.type === 'combat_drop'), false, `Hit ${hitIdx} must NOT drop two-hand held piece`);
    assert.equal(world.characters.w.leftHand.grabbedPieceId, pawnId);
    assert.equal(world.characters.w.rightHand.grabbedPieceId, pawnId);
    assert.equal(pawn.heldBy, 'w');
    assert.equal(pawn.heldHands, 2);
    assert.equal(world.characters.w.twoHandHitsTaken, hitIdx);

    for (let i = 0; i < 18; i++) {
      stepWorldPhysics(
        world,
        engine,
        { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
        0,
        0.025,
      );
    }
    pawn.x = e4Pos.x;
    pawn.z = e4Pos.z;
    pawn.vx = 0;
    pawn.vz = 0;
  }

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.48;
  world.characters.b.x = e4Pos.x + 1.65;
  world.characters.b.z = e4Pos.z + 1.48;
  world.characters.b.yaw = -Math.PI / 2;

  const thirdHitEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 40; i++) {
    thirdHitEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
          b: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(thirdHitEvents.some((e) => e.type === 'punch_hit' && e.color === 'w' && e.knockdown === true));
  assert.ok(thirdHitEvents.some((e) => e.type === 'combat_drop' && e.pieceId === pawnId));
  assert.equal(world.characters.w.leftHand.grabbedPieceId, null);
  assert.equal(world.characters.w.rightHand.grabbedPieceId, null);
  assert.equal(pawn.heldBy, null);
  assert.equal(pawn.heldHands, 0);
  assert.ok(thirdHitEvents.some((e) => e.type === 'release_valid' && e.from === 'e2' && e.to === 'e4'));
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('e4')?.id, pawnId);
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('two-hand grip protection does NOT activate for one-hand carry and releases immediately if a hand lets go', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e5Pos = squareToWorld('e5');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 20; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const pawnId = world.characters.w.leftHand.grabbedPieceId!;
  const pawn = world.pieces.get(pawnId)!;
  assert.equal(pawn.heldHands, 2);

  stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: false }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(world.characters.w.rightHand.grabbedPieceId, null);
  assert.equal(pawn.heldHands, 1);

  world.characters.w.x = e5Pos.x;
  world.characters.w.z = e5Pos.z + 1.48;
  pawn.x = e5Pos.x;
  pawn.z = e5Pos.z;
  pawn.vx = 0;
  pawn.vz = 0;

  world.characters.b.x = e5Pos.x + 1.65;
  world.characters.b.z = e5Pos.z + 1.48;
  world.characters.b.yaw = -Math.PI / 2;

  const events: PhysicsEvent[] = [];
  for (let i = 0; i < 40; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftHandHeld: true },
          b: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(events.some((e) => e.type === 'combat_drop' && e.pieceId === pawnId));
  assert.ok(events.some((e) => e.type === 'release_invalid'));
  assert.equal(pawn.originSquare, 'e2');
  assert.equal(engine.getTurn(), 'w');
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('Scenario 12: two players punching each other simultaneously trade hits fairly', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  world.characters.w.x = 0;
  world.characters.w.z = 0.9;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.9;
  world.characters.b.yaw = 0;

  const events: PhysicsEvent[] = [];
  for (let i = 0; i < 8; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          b: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 },
        },
        0,
        0.025,
      ),
    );
  }

  assert.ok(events.some((e) => e.type === 'punch_hit' && e.color === 'b'));
  assert.ok(events.some((e) => e.type === 'punch_hit' && e.color === 'w'));
  assert.ok(world.characters.w.stumbleTimer > 0);
  assert.ok(world.characters.b.stumbleTimer > 0);
});

test('Scenario 1 & 11: punching carrier drops piece over a LEGAL square (e2 -> e4) and commits the move upon landing', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 15; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const pawnId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(pawnId);
  const pawn = world.pieces.get(pawnId)!;

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.48;
  pawn.x = e4Pos.x;
  pawn.z = e4Pos.z;
  pawn.vx = 0;
  pawn.vz = 0;

  world.characters.b.x = e4Pos.x + 1.7;
  world.characters.b.z = e4Pos.z + 1.48;
  world.characters.b.yaw = -Math.PI / 2;

  const events: PhysicsEvent[] = [];
  for (let i = 0; i < 40; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftHandHeld: true },
          b: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
        },
        0,
        0.025,
      ),
    );
  }

  assert.ok(events.some((e) => e.type === 'combat_drop' && e.pieceId === pawnId));
  assert.ok(events.some((e) => e.type === 'release_valid' && e.from === 'e2' && e.to === 'e4'));
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('e4')?.id, pawnId);
  assert.deepEqual(engine.getHistory(), ['e4']);
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('Scenarios 2, 3, 4, 5, 6, 7, 8, 9: strict chess rule validation rejects every illegal combat drop and restores origin', () => {
  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e2')!;
    const e5 = squareToWorld('e5');
    pawn.x = e5.x;
    pawn.z = e5.z;
    pawn.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(pawn, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(engine.getTurn(), 'w');
    assert.equal(pawn.originSquare, 'e2');
    assert.equal(engine.getHistory().length, 0);
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const knight = Array.from(world.pieces.values()).find((p) => p.originSquare === 'b1')!;
    const b3 = squareToWorld('b3');
    knight.x = b3.x;
    knight.z = b3.z;
    knight.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(knight, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(knight.originSquare, 'b1');
    assert.equal(engine.getTurn(), 'w');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const bishop = Array.from(world.pieces.values()).find((p) => p.originSquare === 'f1')!;
    const c4 = squareToWorld('c4');
    bishop.x = c4.x;
    bishop.z = c4.z;
    bishop.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(bishop, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(bishop.originSquare, 'f1');
    assert.equal(engine.getTurn(), 'w');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/R3K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const rook = Array.from(world.pieces.values()).find((p) => p.originSquare === 'a1')!;
    const c3 = squareToWorld('c3');
    rook.x = c3.x;
    rook.z = c3.z;
    rook.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(rook, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(rook.originSquare, 'a1');
    assert.equal(engine.getTurn(), 'w');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const blackPawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e7')!;
    const e5 = squareToWorld('e5');
    blackPawn.x = e5.x;
    blackPawn.z = e5.z;
    blackPawn.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(blackPawn, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(blackPawn.originSquare, 'e7');
    assert.equal(engine.getTurn(), 'w');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine();
    const world = createWorldPhysics(engine);
    const pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e2')!;
    pawn.x = BOARD_PLAYABLE_HALF + 2.0;
    pawn.z = 0;
    pawn.y = -0.45;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(pawn, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid' && e.to === 'offboard'));
    assert.equal(pawn.originSquare, 'e2');

    pawn.x = 0.0;
    pawn.z = 0.0;
    pawn.y = 0;
    const eventsBetween: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(pawn, world, engine, eventsBetween);
    assert.ok(eventsBetween.some((e) => e.type === 'release_invalid'));
    assert.equal(pawn.originSquare, 'e2');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  {
    const engine = new ChessMatchEngine('4r2k/8/8/8/8/8/4N3/4K3 w - - 0 1');
    const world = createWorldPhysics(engine);
    const knight = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e2')!;
    const c3 = squareToWorld('c3');
    knight.x = c3.x;
    knight.z = c3.z;
    knight.y = 0;
    const events: PhysicsEvent[] = [];
    evaluateDroppedPieceLanding(knight, world, engine, events);
    assert.ok(events.some((e) => e.type === 'release_invalid'));
    assert.equal(knight.originSquare, 'e2');
    assert.equal(engine.getTurn(), 'w');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }
});

test('Scenario 10: pawn dropped on final rank via combat triggers promotion modal and commits promoted piece', () => {
  const engine = new ChessMatchEngine('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  const world = createWorldPhysics(engine);
  const a7Pos = squareToWorld('a7');
  const a8Pos = squareToWorld('a8');

  world.characters.w.x = a7Pos.x;
  world.characters.w.z = a7Pos.z + 1.4;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 15; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const pawnId = world.characters.w.leftHand.grabbedPieceId!;
  const pawn = world.pieces.get(pawnId)!;
  world.characters.w.z = a8Pos.z + 1.4;
  pawn.x = a8Pos.x;
  pawn.z = a8Pos.z;
  pawn.vx = 0;
  pawn.vz = 0;

  world.characters.b.x = a8Pos.x + 1.7;
  world.characters.b.z = a8Pos.z + 1.4;
  world.characters.b.yaw = -Math.PI / 2;

  const events: PhysicsEvent[] = [];
  for (let i = 0; i < 40; i++) {
    events.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftHandHeld: true },
          b: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 },
        },
        0,
        0.025,
      ),
    );
  }

  assert.ok(events.some((e) => e.type === 'promotion_needed' && e.to === 'a8'));
  assert.ok(world.pendingPromotion);
  assert.equal(engine.getTurn(), 'w');

  const promoEvents: PhysicsEvent[] = [];
  const ok = completePendingPromotion(world, engine, 'q', promoEvents);
  assert.equal(ok, true);
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('a8')?.type, 'q');
  assert.equal(pawn.type, 'q');
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('P1 punch cooldown (0/6 punches left, 10s timer) never blocks grabbing, two-hand carrying, placing, or invalid rollback', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  // 1. P1 lands 6 punches (L -> R -> L -> R -> L -> R) on P2 to trigger the 10-second punch cooldown
  for (let p = 0; p < 6; p++) {
    world.characters.b.isKnockedDown = false;
    world.characters.b.stunTimer = 0;
    world.characters.b.balance = 1.0;
    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.8;
    world.characters.b.yaw = 0;

    const useRight = p % 2 === 1;
    for (let i = 0; i < 16; i++) {
      stepWorldPhysics(
        world,
        engine,
        {
          w: {
            ...IDLE_INPUT,
            leftPunchPressed: !useRight && i === 0,
            leftHandHeld: !useRight && i < 6,
            rightPunchPressed: useRight && i === 0,
            rightHandHeld: useRight && i < 6,
          },
          b: IDLE_INPUT,
        },
        0,
        0.025,
      );
    }

    for (let i = 0; i < 16; i++) {
      stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    }
  }

  assert.equal(world.characters.w.punchesRemaining, 0);
  assert.ok(world.characters.w.punchSequenceCooldown > 8.5);

  // Move P2 out of the way and let P1 immediately grab e2 pawn with BOTH hands while still on cooldown
  world.characters.b.x = 0;
  world.characters.b.z = -9;
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');
  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;

  for (let i = 0; i < 18; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }

  const e2PawnId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(e2PawnId, 'P1 left hand must grab e2 pawn immediately during 10s punch cooldown');
  assert.equal(
    world.characters.w.rightHand.grabbedPieceId,
    e2PawnId,
    'P1 right hand must also grab e2 pawn immediately during 10s punch cooldown',
  );
  const e2Pawn = world.pieces.get(e2PawnId)!;
  assert.equal(e2Pawn.heldBy, 'w');
  assert.equal(e2Pawn.heldHands, 2);

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.45;
  e2Pawn.x = e4Pos.x;
  e2Pawn.z = e4Pos.z;
  e2Pawn.vx = 0;
  e2Pawn.vz = 0;

  const placeEvents = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, leftHandHeld: false, rightHandHeld: false }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.ok(placeEvents.some((e) => e.type === 'release_valid' && e.from === 'e2' && e.to === 'e4'));
  assert.equal(engine.getTurn(), 'b');
  assert.equal(engine.getPieceAt('e4')?.id, e2PawnId);

  const e7Pos = squareToWorld('e7');
  const e5Pos = squareToWorld('e5');
  world.characters.b.x = e7Pos.x;
  world.characters.b.z = e7Pos.z - 1.5;
  world.characters.b.yaw = 0;
  world.characters.b.stunTimer = 0;
  world.characters.b.isKnockedDown = false;
  for (let i = 0; i < 16; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: IDLE_INPUT, b: { ...IDLE_INPUT, leftHandHeld: true } },
      0,
      0.025,
    );
  }
  const e7PawnId = world.characters.b.leftHand.grabbedPieceId!;
  assert.ok(e7PawnId);
  const e7Pawn = world.pieces.get(e7PawnId)!;
  e7Pawn.x = e5Pos.x;
  e7Pawn.z = e5Pos.z;
  stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.equal(engine.getTurn(), 'w');
  assert.ok(world.characters.w.punchSequenceCooldown > 6.5, 'P1 must still be on punch cooldown');

  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;
  const punchBlockedEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 10; i++) {
    punchBlockedEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: {
            ...IDLE_INPUT,
            leftPunchPressed: i === 0,
            leftHandHeld: i === 0,
            rightPunchPressed: i === 2,
            rightHandHeld: i === 2,
          },
          b: IDLE_INPUT,
        },
        0,
        0.025,
      ),
    );
  }
  assert.equal(punchBlockedEvents.some((e) => e.type === 'punch_swing' && e.color === 'w'), false);

  const d2Pos = squareToWorld('d2');
  const d4Pos = squareToWorld('d4');
  const d5Pos = squareToWorld('d5');
  world.characters.w.x = d2Pos.x;
  world.characters.w.z = d2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 16; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const d2PawnId = world.characters.w.rightHand.grabbedPieceId!;
  assert.ok(d2PawnId, 'P1 right hand must grab d2 pawn during cooldown');
  const d2Pawn = world.pieces.get(d2PawnId)!;
  d2Pawn.x = d5Pos.x;
  d2Pawn.z = d5Pos.z;
  const invalidEvents = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.ok(invalidEvents.some((e) => e.type === 'release_invalid'));
  assert.equal(d2Pawn.originSquare, 'd2');
  assert.equal(engine.getTurn(), 'w');

  for (let i = 0; i < 20; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  }
  for (let i = 0; i < 16; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  assert.equal(world.characters.w.leftHand.grabbedPieceId, d2PawnId);
  assert.equal(world.characters.w.rightHand.grabbedPieceId, d2PawnId);
  d2Pawn.x = d4Pos.x;
  d2Pawn.z = d4Pos.z;
  const legalEvents2 = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.ok(legalEvents2.some((e) => e.type === 'release_valid' && e.from === 'd2' && e.to === 'd4'));
  assert.equal(engine.getTurn(), 'b');
  assert.equal(verifyWorldIntegrity(world, engine), true);

  for (let i = 0; i < 450; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.03);
  }
  assert.equal(world.characters.w.punchSequenceCooldown, 0);
  assert.equal(world.characters.w.punchesRemaining, 6);
});

test('P2 punch cooldown never blocks chess grabbing, two-hand grip protection, or legal move placement', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');
  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 16; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const e2Pawn = world.pieces.get(world.characters.w.leftHand.grabbedPieceId!)!;
  e2Pawn.x = e4Pos.x;
  e2Pawn.z = e4Pos.z;
  stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.equal(engine.getTurn(), 'b');

  // P2 (Black) lands 6 punches (R -> L -> R -> L -> R -> L) on P1 -> enters 10s cooldown
  for (let p = 0; p < 6; p++) {
    world.characters.w.isKnockedDown = false;
    world.characters.w.stunTimer = 0;
    world.characters.w.balance = 1.0;
    world.characters.w.x = 0;
    world.characters.w.z = 0.8;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -1.0;
    world.characters.b.yaw = 0;

    const useRight = p % 2 === 0;
    for (let i = 0; i < 16; i++) {
      stepWorldPhysics(
        world,
        engine,
        {
          w: IDLE_INPUT,
          b: {
            ...IDLE_INPUT,
            leftPunchPressed: !useRight && i === 0,
            leftHandHeld: !useRight && i < 6,
            rightPunchPressed: useRight && i === 0,
            rightHandHeld: useRight && i < 6,
          },
        },
        0,
        0.025,
      );
    }
    for (let i = 0; i < 16; i++) {
      stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    }
  }

  assert.equal(world.characters.b.punchesRemaining, 0);
  assert.ok(world.characters.b.punchSequenceCooldown > 8.5);

  const e7Pos = squareToWorld('e7');
  const e5Pos = squareToWorld('e5');
  world.characters.b.x = e7Pos.x;
  world.characters.b.z = e7Pos.z - 1.5;
  world.characters.b.yaw = 0;

  for (let i = 0; i < 18; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: IDLE_INPUT, b: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true } },
      0,
      0.025,
    );
  }
  const e7PawnId = world.characters.b.leftHand.grabbedPieceId!;
  assert.ok(e7PawnId, 'P2 must grab e7 pawn immediately while on 10s punch cooldown');
  assert.equal(world.characters.b.rightHand.grabbedPieceId, e7PawnId);
  const e7Pawn = world.pieces.get(e7PawnId)!;
  assert.equal(e7Pawn.heldHands, 2);

  world.characters.w.stunTimer = 0;
  world.characters.w.isKnockedDown = false;
  world.characters.w.x = e5Pos.x + 1.65;
  world.characters.w.z = e5Pos.z - 1.48;
  world.characters.w.yaw = -Math.PI / 2;
  world.characters.b.x = e5Pos.x;
  world.characters.b.z = e5Pos.z - 1.48;
  e7Pawn.x = e5Pos.x;
  e7Pawn.z = e5Pos.z;
  e7Pawn.vx = 0;
  e7Pawn.vz = 0;

  const hitEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 10; i++) {
    hitEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          b: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(hitEvents.some((e) => e.type === 'punch_hit' && e.color === 'b'));
  assert.equal(hitEvents.some((e) => e.type === 'combat_drop'), false);
  assert.equal(world.characters.b.leftHand.grabbedPieceId, e7PawnId);
  assert.equal(world.characters.b.rightHand.grabbedPieceId, e7PawnId);

  e7Pawn.x = e5Pos.x;
  e7Pawn.z = e5Pos.z;
  e7Pawn.vx = 0;
  e7Pawn.vz = 0;
  const releaseEvents = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.ok(releaseEvents.some((e) => e.type === 'release_valid' && e.from === 'e7' && e.to === 'e5'));
  assert.equal(engine.getTurn(), 'w');
  assert.equal(verifyWorldIntegrity(world, engine), true);
  assert.ok(world.characters.b.punchSequenceCooldown > 6.0);

  for (let i = 0; i < 460; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.03);
  }
  assert.equal(world.characters.b.punchSequenceCooldown, 0);
  assert.equal(world.characters.b.punchesRemaining, 6);
});

test('expanded punch hitbox hits defender holding a piece in front across piece barrier without hitting piece alone', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  // Move pawn onto center and have Black hold it directly between White and Black
  const e7Pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e7')!;
  e7Pawn.x = 0;
  e7Pawn.z = -1.5;

  world.characters.b.x = 0;
  world.characters.b.z = -3.0;
  world.characters.b.yaw = 0; // faces +Z toward piece & White

  // Advance turn to Black so Black can hold e7 pawn cleanly
  const openMove = engine.tryMove('e2', 'e4');
  assert.equal(openMove.accepted, true);
  const wPawn = world.pieces.get(openMove.movedPieceId!)!;
  const e4 = squareToWorld('e4');
  wPawn.originSquare = 'e4';
  wPawn.x = e4.x;
  wPawn.z = e4.z;

  for (let i = 0; i < 14; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: { ...IDLE_INPUT, leftHandHeld: true } }, 0, 0.025);
  }
  assert.equal(world.characters.b.leftHand.grabbedPieceId, e7Pawn.id);

  // White punches from front across the held piece (center distance ~2.85, angled slightly off-center)
  world.characters.w.x = 0.55;
  world.characters.w.z = -0.25;
  world.characters.w.yaw = Math.PI + 0.25;

  const frontEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 8; i++) {
    frontEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftPunchPressed: i === 0, leftHandHeld: i === 0 },
          b: { ...IDLE_INPUT, leftHandHeld: true },
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(
    frontEvents.some((e) => e.type === 'punch_hit' && e.color === 'b'),
    'Punch must connect on defender torso even when defender holds a piece between them',
  );
  assert.ok(
    frontEvents.some((e) => e.type === 'combat_drop' && e.color === 'b'),
    'Single-hand carried piece must drop when defender is struck',
  );

  // Swinging at a standalone chess piece with opponent far away must NOT count as a punch_hit
  const d2Pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'd2')!;
  const d2Pos = squareToWorld('d2');
  world.characters.b.x = 0;
  world.characters.b.z = -12;
  world.characters.w.x = d2Pos.x;
  world.characters.w.z = d2Pos.z + 1.2;
  world.characters.w.yaw = Math.PI;
  world.characters.w.leftHand.punchCooldown = 0;
  world.characters.w.pushCooldown = 0;

  const pieceOnlyEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 8; i++) {
    pieceOnlyEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        { w: { ...IDLE_INPUT, rightPunchPressed: i === 0, rightHandHeld: i === 0 }, b: IDLE_INPUT },
        0,
        0.025,
      ),
    );
  }
  assert.equal(
    pieceOnlyEvents.some((e) => e.type === 'punch_hit'),
    false,
    'Swinging at an unheld chess piece without opponent body must not register as a punch_hit',
  );
  assert.ok(d2Pawn);
});

test('10-second punch sequence cooldown finishes precisely around 10 seconds', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  world.characters.w.punchesRemaining = 0;
  world.characters.w.punchSequenceCooldown = 10.0;

  // After 9.5s cooldown must still be active
  for (let i = 0; i < 380; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  }
  assert.ok(world.characters.w.punchSequenceCooldown > 0.3);
  assert.equal(world.characters.w.punchesRemaining, 0);

  // After 10.2s total cooldown must complete and restore all 6 punches
  for (let i = 0; i < 30; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  }
  assert.equal(world.characters.w.punchSequenceCooldown, 0);
  assert.equal(world.characters.w.punchesRemaining, 6);
});

test('grappling consumes exactly 1 punch charge per valid grab, holds without per-frame drain, and ignores missed grabs', () => {
  const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  const world = createWorldPhysics(engine);

  // 1a. Far out-of-range grab attempt consumes 0 charges
  world.characters.w.x = 0;
  world.characters.w.z = 6.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -6.0;
  world.characters.b.yaw = 0;

  const farMissedEvents = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(farMissedEvents.some((e) => e.type === 'grapple_start'), false);
  assert.equal(world.characters.w.punchesRemaining, 6, 'Far out-of-range grapple attempt must consume 0 charges');
  assert.equal(world.characters.w.grappleTargetColor, null);

  // 1b. Near-miss out-of-range grab attempt (dist = 3.2 > GRAPPLE_MAX_RANGE) emits grapple_attempt and consumes 0 charges
  stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  world.characters.w.x = 0;
  world.characters.w.z = 1.6;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -1.6;
  world.characters.b.yaw = 0;

  const missedEvents = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.ok(missedEvents.some((e) => e.type === 'grapple_attempt' && e.color === 'w'));
  assert.equal(missedEvents.some((e) => e.type === 'grapple_start'), false);
  assert.equal(world.characters.w.punchesRemaining, 6, 'Near-miss out-of-range grapple attempt must consume 0 charges');
  assert.equal(world.characters.w.grappleTargetColor, null);

  // Reset to neutral, then move into valid grabbing range
  stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;

  // 2. First valid grab consumes exactly 1 charge (6 -> 5)
  const startEvents = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.ok(startEvents.some((e) => e.type === 'grapple_start' && e.color === 'w'));
  assert.equal(world.characters.w.grappleTargetColor, 'b');
  assert.equal(world.characters.b.grabbedByColor, 'w');
  assert.equal(world.characters.w.punchesRemaining, 5, 'First valid grab must consume 1 charge (6 -> 5)');

  const initialBZ = world.characters.b.z;
  // 3. Holding and dragging for 60 frames consumes 0 additional charges and does not auto-break from energy drain
  for (let i = 0; i < 60; i++) {
    stepWorldPhysics(
      world,
      engine,
      {
        w: { ...IDLE_INPUT, moveForward: -1, grappleHeld: true, leftHandHeld: true, rightHandHeld: true },
        b: IDLE_INPUT,
      },
      0,
      0.025,
    );
  }
  assert.ok(world.characters.b.z > initialBZ + 0.8, 'Opponent must be physically dragged with attacker');
  assert.equal(world.characters.w.grappleTargetColor, 'b', 'Hold must remain active without continuous energy drain');
  assert.equal(world.characters.w.punchesRemaining, 5, 'Continuing to hold must NOT consume extra charges');

  // 4. Release grip cleanly (still 5 charges)
  const relEvents = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.ok(relEvents.some((e) => e.type === 'grapple_release' && e.color === 'w'));
  assert.equal(world.characters.w.grappleTargetColor, null);
  assert.equal(world.characters.b.grabbedByColor, null);
  assert.equal(world.characters.w.punchesRemaining, 5);

  // 5. Re-position & grab a second time -> consumes another 1 charge (5 -> 4)
  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;
  const secondGrabEvents = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.ok(secondGrabEvents.some((e) => e.type === 'grapple_start' && e.color === 'w'));
  assert.equal(world.characters.w.punchesRemaining, 4, 'Second valid grab must consume 1 more charge (5 -> 4)');
});

test('6 valid grapples (or combined punches + grapples) trigger 10s cooldown blocking combat while preserving chess moves', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  // Use 6 valid grapples (each followed by release)
  for (let g = 1; g <= 6; g++) {
    world.characters.w.x = 0;
    world.characters.w.z = 1.0;
    world.characters.w.yaw = Math.PI;
    world.characters.b.x = 0;
    world.characters.b.z = -0.8;
    world.characters.b.yaw = 0;
    world.characters.b.grappleEscapeCooldown = 0;

    const grabEvents = stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
    assert.ok(grabEvents.some((e) => e.type === 'grapple_start' && e.color === 'w'), `Grab #${g} must connect`);
    assert.equal(world.characters.w.punchesRemaining, 6 - g);

    // Hold for 1 frame, then release
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  }

  assert.equal(world.characters.w.punchesRemaining, 0);
  assert.ok(world.characters.w.punchSequenceCooldown > 9.0, 'Using all 6 charges via grapples must start 10s cooldown');

  // During cooldown: neither grappling nor punching can trigger
  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;

  const blockedGrapple = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(blockedGrapple.some((e) => e.type === 'grapple_start'), false, 'Cannot grapple during 10s cooldown');
  assert.equal(world.characters.w.grappleTargetColor, null);

  const blockedPunch = stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, leftPunchPressed: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(blockedPunch.some((e) => e.type === 'punch_swing'), false, 'Cannot punch during 10s cooldown');

  // Normal chess piece interactions remain available during cooldown!
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');
  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.3;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 8; i++) {
    stepWorldPhysics(world, engine, { w: { ...IDLE_INPUT, leftHandHeld: true }, b: IDLE_INPUT }, 0, 0.025);
  }
  const heldId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(heldId, 'Must still be able to grab own chess piece during combat cooldown');
  const heldPiece = world.pieces.get(heldId)!;
  heldPiece.x = e4Pos.x;
  heldPiece.z = e4Pos.z;
  const moveEvs = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  assert.ok(moveEvs.some((e) => e.type === 'release_valid' && e.from === 'e2' && e.to === 'e4'));

  // Wait out remaining ~10s cooldown -> all 6 charges restore cleanly
  for (let i = 0; i < 420; i++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  }
  assert.equal(world.characters.w.punchSequenceCooldown, 0);
  assert.equal(world.characters.w.punchesRemaining, 6);

  // Mixing 4 punches + 2 grabs consumes all 6 charges and triggers 10s cooldown
  world.characters.w.punchesRemaining = 2;
  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;
  world.characters.b.grappleEscapeCooldown = 0;

  // Grab #1 (2 -> 1)
  stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(world.characters.w.punchesRemaining, 1);
  // Release
  stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
  // Grab #2 (1 -> 0 -> cooldown)
  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(world.characters.w.punchesRemaining, 0);
  assert.ok(world.characters.w.punchSequenceCooldown > 9.0);
  // Release immediately and spam grab/release repeatedly -> cooldown cannot be bypassed
  for (let spam = 0; spam < 6; spam++) {
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    const spamEvs = stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
    assert.equal(spamEvs.some((e) => e.type === 'grapple_start'), false);
    assert.equal(world.characters.w.grappleTargetColor, null);
  }
});

test('grabbed character can resist with WASD and escape by pressing SPACE repeatedly', () => {
  const engine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  const world = createWorldPhysics(engine);

  world.characters.w.x = 0;
  world.characters.w.z = 1.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -0.8;
  world.characters.b.yaw = 0;

  stepWorldPhysics(
    world,
    engine,
    { w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
    0,
    0.025,
  );
  assert.equal(world.characters.b.grabbedByColor, 'w');

  let escaped = false;
  for (let i = 0; i < 60; i++) {
    const evs = stepWorldPhysics(
      world,
      engine,
      {
        w: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true },
        b: { ...IDLE_INPUT, moveForward: -1, jumpPressed: i % 6 === 0 },
      },
      0,
      0.025,
    );
    if (evs.some((e) => e.type === 'grapple_break' && e.targetColor === 'b')) {
      escaped = true;
      break;
    }
  }
  assert.equal(escaped, true, 'Victim repeatedly pressing SPACE while resisting must break free');
  assert.equal(world.characters.w.grappleTargetColor, null);
  assert.equal(world.characters.b.grabbedByColor, null);
  assert.ok(world.characters.b.stumbleTimer > 0);
});

test('grappling an opponent holding a piece with two hands preserves two-hand grip initially and drops cleanly if dragged continuously', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');
  const e4Pos = squareToWorld('e4');

  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.5;
  world.characters.w.yaw = Math.PI;
  for (let i = 0; i < 18; i++) {
    stepWorldPhysics(
      world,
      engine,
      { w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true }, b: IDLE_INPUT },
      0,
      0.025,
    );
  }
  const pawnId = world.characters.w.leftHand.grabbedPieceId!;
  assert.ok(pawnId);
  const pawn = world.pieces.get(pawnId)!;
  assert.equal(pawn.heldHands, 2);

  world.characters.w.x = e4Pos.x;
  world.characters.w.z = e4Pos.z + 1.48;
  pawn.x = e4Pos.x;
  pawn.z = e4Pos.z;
  world.characters.b.x = e4Pos.x + 1.4;
  world.characters.b.z = e4Pos.z + 1.48;
  world.characters.b.yaw = -Math.PI / 2;

  // Initial grab preserves 2-hand piece grip
  stepWorldPhysics(
    world,
    engine,
    {
      w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
      b: { ...IDLE_INPUT, grappleHeld: true, leftHandHeld: true, rightHandHeld: true },
    },
    0,
    0.025,
  );
  assert.equal(world.characters.w.grabbedByColor, 'b');
  assert.equal(world.characters.w.leftHand.grabbedPieceId, pawnId);
  assert.equal(world.characters.w.rightHand.grabbedPieceId, pawnId);

  // Sustained drag eventually shakes loose the two-hand carried piece and validates chess placement
  const dropEvents: PhysicsEvent[] = [];
  for (let i = 0; i < 55; i++) {
    dropEvents.push(
      ...stepWorldPhysics(
        world,
        engine,
        {
          w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
          b: { ...IDLE_INPUT, moveRight: 1, grappleHeld: true, leftHandHeld: true, rightHandHeld: true },
        },
        0,
        0.025,
      ),
    );
  }
  assert.ok(dropEvents.some((e) => e.type === 'combat_drop' && e.pieceId === pawnId));
  assert.equal(verifyWorldIntegrity(world, engine), true);
});

test('6 missed punches consume all 6 charges and trigger 10s cooldown cleanly', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);

  // Far apart so all 6 punches miss completely
  world.characters.w.x = 0;
  world.characters.w.z = 6.0;
  world.characters.w.yaw = Math.PI;
  world.characters.b.x = 0;
  world.characters.b.z = -6.0;

  for (let p = 0; p < 6; p++) {
    const side = p % 2 === 0 ? 'left' : 'right';
    stepWorldPhysics(
      world,
      engine,
      {
        w: {
          ...IDLE_INPUT,
          leftPunchPressed: side === 'left',
          rightPunchPressed: side === 'right',
        },
        b: IDLE_INPUT,
      },
      0,
      0.025,
    );
    assert.equal(world.characters.w.punchesRemaining, 5 - p);
    for (let i = 0; i < 24; i++) {
      stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    }
  }

  assert.equal(world.characters.w.punchesRemaining, 0);
  assert.ok(world.characters.w.punchSequenceCooldown > 6.0);
});

test('chess piece interaction is prioritized over grappling near movable pieces, and holding a piece never activates grappling', () => {
  const engine = new ChessMatchEngine();
  const world = createWorldPhysics(engine);
  const e2Pos = squareToWorld('e2');

  // White stands right behind e2 pawn while Black happens to be just inside grapple range behind/beside
  world.characters.w.x = e2Pos.x;
  world.characters.w.z = e2Pos.z + 1.35;
  world.characters.w.yaw = Math.PI; // facing e2 pawn (-Z)
  world.characters.b.x = e2Pos.x + 1.75;
  world.characters.b.z = e2Pos.z + 2.4; // dist ~ 2.04m <= GRAPPLE_MAX_RANGE, off to side/behind

  const decision1 = evaluateGrabVsGrapplePriority(world.characters.w, world, engine);
  assert.equal(decision1.hasGrabbablePiece, true);
  assert.equal(decision1.prioritizeChessPiece, true);

  // Holding both LMB+RMB near e2 grabs the chess piece instead of grappling Black
  for (let i = 0; i < 8; i++) {
    stepWorldPhysics(
      world,
      engine,
      {
        w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true },
        b: IDLE_INPUT,
      },
      0,
      0.025,
    );
  }
  assert.equal(world.characters.w.grappleTargetColor, null, 'Must NOT grapple while grabbing chess piece');
  assert.equal(world.characters.b.grabbedByColor, null);
  assert.ok(world.characters.w.leftHand.grabbedPieceId, 'Must grab chess piece cleanly');
  assert.equal(world.characters.w.punchesRemaining, 6, 'Prioritized chess grab must not waste punch charges');

  // Even if opponent steps right in front while White holds a piece, holding a piece NEVER starts grappling
  world.characters.b.x = world.characters.w.x;
  world.characters.b.z = world.characters.w.z - 1.5;
  const decisionHolding = evaluateGrabVsGrapplePriority(world.characters.w, world, engine);
  assert.equal(decisionHolding.prioritizeChessPiece, true);

  stepWorldPhysics(
    world,
    engine,
    {
      w: { ...IDLE_INPUT, leftHandHeld: true, rightHandHeld: true, grappleHeld: true },
      b: IDLE_INPUT,
    },
    0,
    0.025,
  );
  assert.equal(world.characters.w.grappleTargetColor, null);
  assert.equal(verifyWorldIntegrity(world, engine), true);

  // Conversely, when opponent is directly in front and closer than any piece, grappling triggers clearly
  const engineOpen = new ChessMatchEngine('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1');
  const worldOpen = createWorldPhysics(engineOpen);
  worldOpen.characters.w.x = e2Pos.x;
  worldOpen.characters.w.z = e2Pos.z + 2.3;
  worldOpen.characters.w.yaw = Math.PI;
  worldOpen.characters.b.x = e2Pos.x;
  worldOpen.characters.b.z = e2Pos.z + 0.8; // 1.5m directly ahead (closer than e2 at 2.3m)
  const decisionClearGrapple = evaluateGrabVsGrapplePriority(worldOpen.characters.w, worldOpen, engineOpen);
  assert.equal(decisionClearGrapple.clearGrappleIntent, true);
  assert.equal(decisionClearGrapple.prioritizeChessPiece, false);
});

test('special chess moves (castling, en passant, capture) and draw/checkmate preserve full physics integrity', () => {
  // 1) Castling through physics release
  {
    const engine = new ChessMatchEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
    const world = createWorldPhysics(engine);
    const e1King = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e1')!;
    const g1Pos = squareToWorld('g1');
    e1King.x = g1Pos.x;
    e1King.z = g1Pos.z;
    const evs: PhysicsEvent[] = [];
    const h1Rook = Array.from(world.pieces.values()).find((p) => p.originSquare === 'h1')!;
    stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    assert.ok(h1Rook);
    // Grab & release e1 King onto g1
    world.characters.w.x = g1Pos.x;
    world.characters.w.z = g1Pos.z + 1.4;
    world.characters.w.yaw = Math.PI;
    world.characters.w.leftHand.grabbedPieceId = e1King.id;
    e1King.heldBy = 'w';
    e1King.heldHands = 1;
    evs.push(...stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025));
    assert.ok(evs.some((e) => e.type === 'release_valid' && e.from === 'e1' && e.to === 'g1'));
    assert.equal(h1Rook.originSquare, 'f1');
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  // 2) En passant capture through physics release
  {
    const engine = new ChessMatchEngine('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
    assert.equal(engine.tryMove('d7', 'd5').accepted, true);
    const world = createWorldPhysics(engine);
    const e5Pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'e5')!;
    const d5Pawn = Array.from(world.pieces.values()).find((p) => p.originSquare === 'd5')!;
    const d6Pos = squareToWorld('d6');
    e5Pawn.x = d6Pos.x;
    e5Pawn.z = d6Pos.z;
    e5Pawn.heldBy = 'w';
    e5Pawn.heldHands = 1;
    world.characters.w.leftHand.grabbedPieceId = e5Pawn.id;
    const evs = stepWorldPhysics(world, engine, { w: IDLE_INPUT, b: IDLE_INPUT }, 0, 0.025);
    assert.ok(evs.some((e) => e.type === 'capture' && e.pieceId === d5Pawn.id));
    assert.equal(d5Pawn.captured, true);
    assert.equal(verifyWorldIntegrity(world, engine), true);
  }

  // 3) Draw (insufficient material) detection
  {
    const drawEngine = new ChessMatchEngine('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    const st = drawEngine.getStatus('w');
    assert.equal(st.isDraw, true);
    assert.equal(st.isGameOver, true);
  }
});


