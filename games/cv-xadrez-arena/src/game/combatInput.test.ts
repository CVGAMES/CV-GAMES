import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatInputProcessor } from './combatInput';
import { GRAPPLE_CHORD_WINDOW_SEC } from './constants';

test('simultaneous LMB + RMB press triggers grappleHeld without firing any punch', () => {
  const proc = new CombatInputProcessor();
  const res = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: true,
      rightJustPressed: true,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );

  assert.equal(res.grappleHeld, true);
  assert.equal(res.leftPunchPressed, false);
  assert.equal(res.rightPunchPressed, false);
});

test('delayed second button within 85ms chord window enters grapple without triggering punch', () => {
  const proc = new CombatInputProcessor();

  const frame1 = proc.step(
    {
      leftHeld: true,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(frame1.leftPunchPressed, false);
  assert.equal(frame1.leftHandHeld, false, 'Suppress initial hold during chord window');
  assert.equal(frame1.grappleHeld, false);

  const frame2 = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: true,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.025,
  );
  assert.equal(frame2.grappleHeld, true);
  assert.equal(frame2.leftPunchPressed, false);
  assert.equal(frame2.rightPunchPressed, false);

  // Releasing one button ends grapple cleanly without a trailing punch
  const frame3 = proc.step(
    {
      leftHeld: false,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: true,
    },
    0.016,
  );
  assert.equal(frame3.grappleHeld, false);
  assert.equal(frame3.leftPunchPressed, false);
  assert.equal(frame3.rightPunchPressed, false);
});

test('quick single LMB tap fires punch immediately on release without waiting full chord window', () => {
  const proc = new CombatInputProcessor();

  const down = proc.step(
    {
      leftHeld: true,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(down.leftPunchPressed, false);

  const up = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(up.leftPunchPressed, true);
  assert.equal(up.grappleHeld, false);
});

test('single held RMB past chord window fires punch cleanly and preserves hold for piece grabbing', () => {
  const proc = new CombatInputProcessor();

  proc.step(
    {
      leftHeld: false,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: true,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );

  const afterWindow = proc.step(
    {
      leftHeld: false,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    GRAPPLE_CHORD_WINDOW_SEC + 0.01,
  );
  assert.equal(afterWindow.rightPunchPressed, true);
  assert.equal(afterWindow.rightHandHeld, true);
  assert.equal(afterWindow.grappleHeld, false);
});

test('when already carrying a chess piece, holding both buttons immediately supports two-hand chess grip instead of grappling', () => {
  const proc = new CombatInputProcessor();
  const res = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: true,
      alreadyCarryingPiece: true,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(res.grappleHeld, false);
  assert.equal(res.leftHandHeld, true);
  assert.equal(res.rightHandHeld, true);
  assert.equal(res.rightPunchPressed, true);
});

test('same-frame completed fast clicks (down+up before simulation tick) never disappear and never double-punch', () => {
  const proc = new CombatInputProcessor();

  // Ultra-fast LMB tap completed before tick arrives
  const leftFast = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: false,
      leftJustReleased: true,
      rightJustReleased: false,
      bothHeldSinceLastTick: false,
      leftPressedAtMs: 100,
      nowMs: 118,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(leftFast.leftPunchPressed, true, 'Fast single LMB tap must trigger left punch');
  assert.equal(leftFast.rightPunchPressed, false);
  assert.equal(leftFast.grappleHeld, false);

  // Next idle tick must NOT fire a duplicate punch
  const idleAfter = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      leftJustReleased: false,
      rightJustReleased: false,
      bothHeldSinceLastTick: false,
      nowMs: 134,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(idleAfter.leftPunchPressed, false, 'Must never produce accidental double punch');

  // Ultra-fast RMB tap completed before tick arrives
  const rightFast = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: true,
      leftJustReleased: false,
      rightJustReleased: true,
      bothHeldSinceLastTick: false,
      rightPressedAtMs: 200,
      nowMs: 215,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(rightFast.rightPunchPressed, true, 'Fast single RMB tap must trigger right punch');
  assert.equal(rightFast.leftPunchPressed, false);
});

test('low FPS clamped dt still triggers held single punch using DOM timestamps without waiting extra frames', () => {
  const proc = new CombatInputProcessor();

  // At 8 FPS (125ms elapsed since mousedown, clamped dt = 0.05s), held LMB already passed 85ms window
  const frame1 = proc.step(
    {
      leftHeld: true,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: false,
      leftPressedAtMs: 1000,
      nowMs: 1120,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.05,
  );
  assert.equal(frame1.leftPunchPressed, true, 'Real-time elapsed > 85ms must trigger immediately even with clamped dt');
  assert.equal(frame1.leftHandHeld, true);
  assert.equal(frame1.grappleHeld, false);

  // Still holding on next low-FPS tick -> no duplicate punch
  const frame2 = proc.step(
    {
      leftHeld: true,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      leftPressedAtMs: 1000,
      nowMs: 1240,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.05,
  );
  assert.equal(frame2.leftPunchPressed, false);
});

test('chord release followed immediately by fresh LMB click does not swallow the new punch', () => {
  const proc = new CombatInputProcessor();

  const grapple = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: true,
      rightJustPressed: true,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(grapple.grappleHeld, true);

  // Both released and LMB immediately re-clicked before next frame
  const freshClick = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: false,
      leftJustReleased: true,
      rightJustReleased: true,
      bothHeldSinceLastTick: false,
      alreadyCarryingPiece: false,
      alreadyGrappling: true,
    },
    0.016,
  );
  assert.equal(freshClick.grappleHeld, false);
  assert.equal(freshClick.leftPunchPressed, true);
});

test('prioritizeChessPiece suppresses grapple chord so LMB+RMB two-hand piece grip works near pieces', () => {
  const proc = new CombatInputProcessor();
  const res = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: true,
      rightJustPressed: true,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      prioritizeChessPiece: true,
    },
    0.016,
  );
  assert.equal(res.grappleHeld, false);
  assert.equal(res.leftHandHeld, true);
  assert.equal(res.rightHandHeld, true);
});

test('DOM event queue preserves rapid L/R clicks between low-FPS frames without dropping or doubling punches', () => {
  const proc = new CombatInputProcessor();

  // Simulate 2 FPS: LMB tap at t=0, RMB tap at t=200ms, 2nd LMB tap at t=360ms all before next tick at t=420ms
  proc.recordMouseDown('left', 1000);
  proc.recordMouseUp('left', 1015);

  proc.recordMouseDown('right', 1200);
  proc.recordMouseUp('right', 1218);

  proc.recordMouseDown('left', 1360);
  proc.recordMouseUp('left', 1378);

  // Frame 1 substep 0 (both hands ready)
  const sub0 = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: true,
      rightJustPressed: true,
      nowMs: 1420,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: true,
      canPunchRight: true,
    },
    0.035,
  );
  assert.equal(sub0.leftPunchPressed, true, 'First queued LMB click fires immediately');
  assert.equal(sub0.rightPunchPressed, true, 'Queued RMB click fires immediately');
  assert.equal(sub0.grappleHeld, false, 'Sequential non-overlapping clicks must NEVER become a grapple');

  // While left hand is on cooldown, 2nd LMB waits cleanly
  const subWait = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 1420,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: false,
      canPunchRight: false,
    },
    0.035,
  );
  assert.equal(subWait.leftPunchPressed, false);

  // Once left hand cooldown finishes on a later substep, 2nd LMB click fires cleanly
  const subReady = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 1420,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: true,
      canPunchRight: false,
    },
    0.035,
  );
  assert.equal(subReady.leftPunchPressed, true, 'Second rapid LMB click preserved across low-FPS frame');

  // No more clicks -> idle, zero double punches
  const idle = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 1450,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: true,
      canPunchRight: true,
    },
    0.035,
  );
  assert.equal(idle.leftPunchPressed, false);
  assert.equal(idle.rightPunchPressed, false);
});

test('DOM event queue rejects accidental micro-bounce (<55ms) on same button and handles simultaneous grapple chord cleanly', () => {
  const proc = new CombatInputProcessor();

  // Single LMB click at t=100ms, followed by accidental 40ms hardware bounce at t=140ms
  proc.recordMouseDown('left', 100);
  proc.recordMouseUp('left', 110);
  proc.recordMouseDown('left', 140);
  proc.recordMouseUp('left', 150);

  const first = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 160,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: true,
      canPunchRight: true,
    },
    0.016,
  );
  assert.equal(first.leftPunchPressed, true);

  const bounceCheck = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 500,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
      canPunchLeft: true,
      canPunchRight: true,
    },
    0.016,
  );
  assert.equal(bounceCheck.leftPunchPressed, false, 'Accidental micro-bounce must not fire duplicate punch');

  // Simultaneous LMB + RMB overlap via DOM triggers grapple without punches
  proc.recordMouseDown('left', 1000);
  proc.recordMouseDown('right', 1030);
  const grapple = proc.step(
    {
      leftHeld: true,
      rightHeld: true,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 1035,
      alreadyCarryingPiece: false,
      alreadyGrappling: false,
    },
    0.016,
  );
  assert.equal(grapple.grappleHeld, true);
  assert.equal(grapple.leftPunchPressed, false);
  assert.equal(grapple.rightPunchPressed, false);

  proc.recordMouseUp('left', 1400);
  proc.recordMouseUp('right', 1410);
  const released = proc.step(
    {
      leftHeld: false,
      rightHeld: false,
      leftJustPressed: false,
      rightJustPressed: false,
      nowMs: 1420,
      alreadyCarryingPiece: false,
      alreadyGrappling: true,
    },
    0.016,
  );
  assert.equal(released.grappleHeld, false);
  assert.equal(released.leftPunchPressed, false);
  assert.equal(released.rightPunchPressed, false);
});

test('6 ultra-fast LMB clicks 90ms apart fire all 6 punches sequentially across low-FPS substeps without dropping', () => {
  const proc = new CombatInputProcessor();
  for (let i = 0; i < 6; i++) {
    const t = 1000 + i * 90;
    proc.recordMouseDown('left', t);
    proc.recordMouseUp('left', t + 15);
  }

  let fired = 0;
  let simTime = 1.6;
  let lastPunchSimTime = -1;
  // Simulate slow frames (600ms wall-clock apart) stepping substeps
  for (let frame = 0; frame < 8; frame++) {
    const nowMs = 1600 + frame * 650;
    for (let sub = 0; sub < 12; sub++) {
      simTime += 0.035;
      const canPunchLeft = lastPunchSimTime < 0 || simTime - lastPunchSimTime >= 0.32;
      const out = proc.step(
        {
          leftHeld: false,
          rightHeld: false,
          leftJustPressed: false,
          rightJustPressed: false,
          nowMs,
          alreadyCarryingPiece: false,
          alreadyGrappling: false,
          canPunchLeft,
          canPunchRight: true,
          inSequenceCooldown: fired >= 6,
        },
        0.035,
      );
      if (out.leftPunchPressed) {
        fired += 1;
        lastPunchSimTime = simTime;
      }
    }
  }
  assert.equal(fired, 6, 'All 6 fast clicks 90ms apart must trigger 6 punches cleanly');
});


