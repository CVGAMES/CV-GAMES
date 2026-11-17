import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGameSettings, resolveGraphicsProfile } from './settings';
import { computeEffectiveGain } from './sound';

test('normalizeGameSettings clamps numeric bounds and preserves backwards compatibility', () => {
  const legacyOnly = normalizeGameSettings({
    muted: true,
    cameraSensitivity: 1.45,
    showControlsBar: false,
  });
  assert.equal(legacyOnly.muted, true);
  assert.equal(legacyOnly.masterVolume, 1.0);
  assert.equal(legacyOnly.sfxVolume, 1.0);
  assert.equal(legacyOnly.cameraSensitivity, 1.45);
  assert.equal(legacyOnly.mouseLockSensitivity, 1.0);
  assert.equal(legacyOnly.graphicsQuality, 'high');
  assert.equal(legacyOnly.showControlsBar, false);

  const clamped = normalizeGameSettings({
    masterVolume: 5,
    sfxVolume: -2,
    cameraSensitivity: 99,
    mouseLockSensitivity: 0.1,
    graphicsQuality: 'invalid' as never,
  });
  assert.equal(clamped.masterVolume, 1);
  assert.equal(clamped.sfxVolume, 0);
  assert.equal(clamped.cameraSensitivity, 1.8);
  assert.equal(clamped.mouseLockSensitivity, 0.5);
  assert.equal(clamped.graphicsQuality, 'high');
});

test('resolveGraphicsProfile scales pixelRatio and shadows cleanly across low/medium/high and software GL', () => {
  assert.deepEqual(resolveGraphicsProfile('low', 2, false), {
    pixelRatio: 1,
    shadowsEnabled: false,
  });
  assert.deepEqual(resolveGraphicsProfile('medium', 2, false), {
    pixelRatio: 1.5,
    shadowsEnabled: true,
  });
  assert.deepEqual(resolveGraphicsProfile('high', 3, false), {
    pixelRatio: 2,
    shadowsEnabled: true,
  });
  assert.deepEqual(resolveGraphicsProfile('high', 2, true), {
    pixelRatio: 1,
    shadowsEnabled: false,
  });
});

test('computeEffectiveGain respects muted flag, masterVolume, and sfxVolume', () => {
  assert.equal(computeEffectiveGain(0.2, true, 1, 1), 0);
  assert.equal(computeEffectiveGain(0.2, false, 0, 1), 0);
  assert.equal(computeEffectiveGain(0.2, false, 1, 0), 0);
  assert.ok(Math.abs(computeEffectiveGain(0.2, false, 0.5, 0.5) - 0.05) < 1e-6);
});
