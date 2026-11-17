import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOADING_STAGES,
  advanceLoadingStage,
  createInitialLoadingState,
  failLoadingState,
} from './loadingProgress';

test('loadingProgress traverses all 7 real stages before reaching 100% ready state', () => {
  let state = createInitialLoadingState();
  assert.equal(state.ready, false);
  assert.equal(state.error, null);
  assert.equal(state.stageLabel, 'Inicializando o jogo...');
  assert.ok(state.progress < 100);

  const expectedStages = [
    'Inicializando o jogo...',
    'Carregando modelos 3D...',
    'Preparando o tabuleiro...',
    'Carregando personagens...',
    'Inicializando física...',
    'Preparando inteligência artificial...',
    'Finalizando configurações...',
  ];

  const nonReadyStages = LOADING_STAGES.filter((s) => s.id !== 'ready');
  assert.deepEqual(
    nonReadyStages.map((s) => s.label),
    expectedStages,
  );

  let prevProgress = state.progress;
  for (const stage of nonReadyStages.slice(1)) {
    state = advanceLoadingStage(state, stage.id);
    assert.equal(state.ready, false);
    assert.ok(state.progress > prevProgress, `${stage.id} must advance progress monotonically`);
    assert.ok(state.progress < 100, 'progress must remain < 100 until ready stage');
    prevProgress = state.progress;
  }

  state = advanceLoadingStage(state, 'ready');
  assert.equal(state.ready, true);
  assert.equal(state.progress, 100);
  assert.equal(state.stageLabel, 'Arena pronta!');
  assert.equal(state.error, null);
});

test('failLoadingState prevents 100% completion and resets cleanly on retry', () => {
  let state = createInitialLoadingState();
  state = advanceLoadingStage(state, 'prepare_board');
  const failed = failLoadingState(state, 'WebGL indisponível');

  assert.equal(failed.ready, false);
  assert.ok(failed.progress < 100);
  assert.equal(failed.error, 'WebGL indisponível');

  const retried = createInitialLoadingState();
  assert.equal(retried.error, null);
  assert.equal(retried.ready, false);
  assert.equal(retried.stageId, 'init_game');
});
