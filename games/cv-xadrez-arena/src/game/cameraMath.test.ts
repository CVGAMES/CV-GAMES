import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAR_CAM_MAX_PITCH,
  CHAR_CAM_MIN_PITCH,
  applyMouseLookDelta,
  computeThirdPersonCameraPosition,
} from './cameraMath';

test('applyMouseLookDelta rotates yaw smoothly and clamps pitch within vertical limits', () => {
  const start = { yaw: 0, pitch: 0.58 };
  const turnedRight = applyMouseLookDelta(start, 25, 0);
  assert.ok(turnedRight.yaw < 0);
  assert.equal(turnedRight.pitch, 0.58);

  const turnedLeft = applyMouseLookDelta(start, -25, 0);
  assert.ok(turnedLeft.yaw > 0);

  // Huge spike is clamped to +/-60 per step
  const spiked = applyMouseLookDelta(start, 500, 0);
  const maxStep = applyMouseLookDelta(start, 60, 0);
  assert.equal(spiked.yaw, maxStep.yaw);

  // Pitch never exceeds upper or lower bounds
  let high = start;
  for (let i = 0; i < 40; i++) high = applyMouseLookDelta(high, 0, 60);
  assert.equal(high.pitch, CHAR_CAM_MAX_PITCH);

  let low = start;
  for (let i = 0; i < 40; i++) low = applyMouseLookDelta(low, 0, -60);
  assert.equal(low.pitch, CHAR_CAM_MIN_PITCH);
});

test('computeThirdPersonCameraPosition orbits focus and never clips below board', () => {
  const focus = { x: 2, y: 1.85, z: -3 };
  const posDefault = computeThirdPersonCameraPosition(focus, 0, 0.58, 16.5);
  assert.ok(Math.abs(posDefault.x - focus.x) < 1e-6);
  assert.ok(posDefault.z > focus.z);
  assert.ok(posDefault.y > focus.y);

  const posSide = computeThirdPersonCameraPosition(focus, Math.PI / 2, 0.58, 16.5);
  assert.ok(posSide.x > focus.x);
  assert.ok(Math.abs(posSide.z - focus.z) < 1e-4);

  const posLow = computeThirdPersonCameraPosition({ x: 0, y: 0.2, z: 0 }, 0, 0.01, 8.0);
  assert.ok(posLow.y >= 1.35);
});
