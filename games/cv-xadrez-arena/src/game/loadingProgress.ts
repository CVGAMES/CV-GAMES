export type LoadingStageId =
  | 'init_game'
  | 'load_models'
  | 'prepare_board'
  | 'load_characters'
  | 'init_physics'
  | 'prepare_ai'
  | 'finalize_settings'
  | 'ready';

export interface LoadingStageMeta {
  id: LoadingStageId;
  label: string;
  progress: number;
}

export const LOADING_STAGES: readonly LoadingStageMeta[] = [
  { id: 'init_game', label: 'Inicializando o jogo...', progress: 8 },
  { id: 'load_models', label: 'Carregando modelos 3D...', progress: 24 },
  { id: 'prepare_board', label: 'Preparando o tabuleiro...', progress: 42 },
  { id: 'load_characters', label: 'Carregando personagens...', progress: 58 },
  { id: 'init_physics', label: 'Inicializando física...', progress: 74 },
  { id: 'prepare_ai', label: 'Preparando inteligência artificial...', progress: 88 },
  { id: 'finalize_settings', label: 'Finalizando configurações...', progress: 96 },
  { id: 'ready', label: 'Arena pronta!', progress: 100 },
] as const;

export interface LoadingProgressState {
  stageId: LoadingStageId;
  stageLabel: string;
  progress: number;
  ready: boolean;
  error: string | null;
}

const STAGE_LOOKUP = new Map<LoadingStageId, LoadingStageMeta>(
  LOADING_STAGES.map((stage) => [stage.id, stage]),
);

export function createInitialLoadingState(): LoadingProgressState {
  const first = LOADING_STAGES[0];
  return {
    stageId: first.id,
    stageLabel: first.label,
    progress: first.progress,
    ready: false,
    error: null,
  };
}

export function advanceLoadingStage(
  prev: LoadingProgressState,
  stageId: LoadingStageId,
  customLabel?: string,
): LoadingProgressState {
  const meta = STAGE_LOOKUP.get(stageId) ?? LOADING_STAGES[0];
  const isReady = stageId === 'ready';
  const nextProgress = isReady
    ? 100
    : Math.max(prev.error ? 0 : prev.progress, Math.min(99, meta.progress));

  return {
    stageId,
    stageLabel: customLabel ?? meta.label,
    progress: nextProgress,
    ready: isReady,
    error: null,
  };
}

export function failLoadingState(
  prev: LoadingProgressState,
  errorMessage: string,
): LoadingProgressState {
  return {
    stageId: prev.stageId,
    stageLabel: prev.stageLabel,
    progress: Math.min(prev.progress, 96),
    ready: false,
    error: errorMessage.trim() || 'Erro ao inicializar os recursos da arena 3D.',
  };
}
