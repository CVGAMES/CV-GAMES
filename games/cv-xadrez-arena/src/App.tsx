import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Expand,
  History,
  Home,
  Minimize2,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CvBrandMark } from './components/CvBrandMark';
import { LoadingScreen } from './components/LoadingScreen';
import type { GameSettings } from './components/SettingsScreen';
import type { ArenaController, HudSnapshot } from './game/ChessArena';
import {
  AI_DIFFICULTIES,
  AI_DIFFICULTY_STORAGE_KEY,
  MAX_PUNCHES_PER_SEQUENCE,
  PUNCH_SEQUENCE_COOLDOWN,
  SETTINGS_STORAGE_KEY,
  type AiDifficulty,
  type GamePhase,
  type PieceType,
  type PlayerColor,
} from './game/constants';
import {
  createInitialLoadingState,
  failLoadingState,
  type LoadingProgressState,
} from './game/loadingProgress';
import { normalizeGameSettings } from './game/settings';
import { soundFX } from './game/sound';

const ChessArena = lazy(() => import('./game/ChessArena'));
const MainMenuScreen = lazy(() =>
  import('./components/MainMenuScreen').then((m) => ({ default: m.MainMenuScreen })),
);
const ModeSelectScreen = lazy(() =>
  import('./components/ModeSelectScreen').then((m) => ({ default: m.ModeSelectScreen })),
);
const DifficultyScreen = lazy(() =>
  import('./components/DifficultyScreen').then((m) => ({ default: m.DifficultyScreen })),
);
const HowToPlayScreen = lazy(() =>
  import('./components/HowToPlayScreen').then((m) => ({ default: m.HowToPlayScreen })),
);
const SettingsScreen = lazy(() =>
  import('./components/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);
const MoveHistoryPanel = lazy(() =>
  import('./components/MoveHistoryPanel').then((m) => ({ default: m.MoveHistoryPanel })),
);

class ArenaErrorBoundary extends Component<
  { onError: (message: string) => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    this.props.onError(
      error?.message || 'Falha ao carregar o módulo 3D da arena.',
    );
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function createInitialHud(humanColor: PlayerColor, mouseLocked = false): HudSnapshot {
  return {
    status: {
      turn: 'w',
      inCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      isGameOver: false,
      winner: null,
      outcomeText: humanColor === 'w' ? 'Sua vez' : 'Vez do computador',
      moveNumber: 1,
      lastMoveSan: null,
      checkedKing: null,
    },
    humanColor,
    cameraMode: 'character',
    carryingInfo: null,
    toastMessage: null,
    pendingPromotion: null,
    capturedByWhite: 0,
    capturedByBlack: 0,
    capturedByHuman: 0,
    capturedByAi: 0,
    focusTarget: humanColor,
    mouseLocked,
    nativePointerLocked: false,
    aiPhase: 'idle',
    moveHistory: [],
    combat: {
      w: {
        punchesRemaining: MAX_PUNCHES_PER_SEQUENCE,
        cooldownSeconds: 0,
        energyPercent: 100,
        isGrappling: false,
        isGrabbed: false,
        strugglePercent: 0,
        glovesActive: true,
      },
      b: {
        punchesRemaining: MAX_PUNCHES_PER_SEQUENCE,
        cooldownSeconds: 0,
        energyPercent: 100,
        isGrappling: false,
        isGrabbed: false,
        strugglePercent: 0,
        glovesActive: true,
      },
      human: {
        punchesRemaining: MAX_PUNCHES_PER_SEQUENCE,
        cooldownSeconds: 0,
        energyPercent: 100,
        isGrappling: false,
        isGrabbed: false,
        strugglePercent: 0,
        glovesActive: true,
      },
      ai: {
        punchesRemaining: MAX_PUNCHES_PER_SEQUENCE,
        cooldownSeconds: 0,
        energyPercent: 100,
        isGrappling: false,
        isGrabbed: false,
        strugglePercent: 0,
        glovesActive: true,
      },
    },
  };
}

const PROMOTION_OPTIONS: Array<{ type: Exclude<PieceType, 'p' | 'k'>; label: string; glyph: string }> = [
  { type: 'q', label: 'Dama', glyph: '♕' },
  { type: 'r', label: 'Torre', glyph: '♖' },
  { type: 'b', label: 'Bispo', glyph: '♗' },
  { type: 'n', label: 'Cavalo', glyph: '♘' },
];

function loadInitialDifficulty(): AiDifficulty {
  if (typeof window === 'undefined') return 2;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramDiff = Number(params.get('difficulty'));
    if (paramDiff >= 1 && paramDiff <= 4) {
      return paramDiff as AiDifficulty;
    }
    const saved = Number(window.localStorage.getItem(AI_DIFFICULTY_STORAGE_KEY));
    if (saved >= 1 && saved <= 4) {
      return saved as AiDifficulty;
    }
  } catch {
    // Ignore storage restrictions inside sandboxed iframes
  }
  return 2;
}

function saveDifficultyLocally(level: AiDifficulty): void {
  try {
    window.localStorage.setItem(AI_DIFFICULTY_STORAGE_KEY, String(level));
  } catch {
    // Ignore storage restrictions inside sandboxed iframes
  }
}

function loadInitialSettings(): GameSettings {
  const defaultShowControls = typeof window !== 'undefined' ? window.innerWidth >= 640 : true;
  if (typeof window === 'undefined') {
    return normalizeGameSettings(null, defaultShowControls);
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return normalizeGameSettings(null, defaultShowControls);
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return normalizeGameSettings(parsed, defaultShowControls);
  } catch {
    return normalizeGameSettings(null, defaultShowControls);
  }
}

function saveSettingsLocally(settings: GameSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage restrictions inside sandboxed iframes
  }
}

function pickRandomHumanColor(): PlayerColor {
  return Math.random() < 0.5 ? 'w' : 'b';
}

function loadInitialHumanColor(): PlayerColor {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('color');
    if (forced === 'w' || forced === 'b') {
      return forced;
    }
  }
  return pickRandomHumanColor();
}

export default function App() {
  useEffect(() => {
    document.getElementById('startup-loader')?.remove();
  }, []);

  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [phase, setPhase] = useState<GamePhase>(() => (isAutostart ? 'playing' : 'loading'));
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgressState>(
    createInitialLoadingState,
  );
  const [settingsReturnPhase, setSettingsReturnPhase] = useState<'menu' | 'paused'>('menu');
  const [difficulty, setDifficulty] = useState<AiDifficulty>(loadInitialDifficulty);
  const [settings, setSettings] = useState<GameSettings>(loadInitialSettings);
  const [humanColor, setHumanColor] = useState<PlayerColor>(loadInitialHumanColor);
  const [hud, setHud] = useState<HudSnapshot>(() => createInitialHud(humanColor, isAutostart));
  const [controlsCollapsed, setControlsCollapsed] = useState(() => !settings.showControlsBar);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [colorBanner, setColorBanner] = useState<PlayerColor | null>(() =>
    isAutostart ? humanColor : null,
  );
  const [arenaMountKey, setArenaMountKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);

  const controllerRef = useRef<ArenaController | null>(null);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setFullscreenAvailable(Boolean(document.fullscreenEnabled));
    };

    updateFullscreenState();
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn('Não foi possível alterar o modo de tela cheia.', error);
    }
  }, []);

  useEffect(() => {
    soundFX.setMuted(settings.muted);
    soundFX.setVolumes(settings.masterVolume, settings.sfxVolume);
  }, [settings.muted, settings.masterVolume, settings.sfxVolume]);

  useEffect(() => {
    document.body.dataset.state = phase;
    if (phase !== 'playing') {
      setHistoryOpen(false);
    }
  }, [phase]);

  useEffect(() => {
    document.body.dataset.difficulty = String(difficulty);
  }, [difficulty]);

  useEffect(() => {
    document.body.dataset.humanColor = humanColor;
  }, [humanColor]);

  useEffect(() => {
    document.body.dataset.cameraMode = hud.cameraMode;
    document.body.dataset.turn = hud.status.turn;
    document.body.dataset.inCheck = hud.status.inCheck ? 'true' : 'false';
    document.body.dataset.isCheckmate = hud.status.isCheckmate ? 'true' : 'false';
    document.body.dataset.checkedKingSquare = hud.status.checkedKing?.square ?? '';
    document.body.dataset.checkedKingColor = hud.status.checkedKing?.color ?? '';
    document.body.dataset.aiPhase = hud.aiPhase;
    document.body.dataset.mouseLocked = hud.mouseLocked ? 'true' : 'false';
    document.body.dataset.nativePointerLocked = hud.nativePointerLocked ? 'true' : 'false';
    document.body.dataset.moveCount = String(hud.moveHistory.length);
    document.body.dataset.p1Punches = String(hud.combat.human.punchesRemaining);
    document.body.dataset.p1Cooldown = String(hud.combat.human.cooldownSeconds);
    document.body.dataset.p1Energy = String(hud.combat.human.energyPercent);
    document.body.dataset.p1Grappling = hud.combat.human.isGrappling ? 'true' : 'false';
    document.body.dataset.p1Grabbed = hud.combat.human.isGrabbed ? 'true' : 'false';
    document.body.dataset.p1Gloves = hud.combat.human.glovesActive ? 'active' : 'cooldown';
    document.body.dataset.p2Punches = String(hud.combat.ai.punchesRemaining);
    document.body.dataset.p2Cooldown = String(hud.combat.ai.cooldownSeconds);
    document.body.dataset.p2Energy = String(hud.combat.ai.energyPercent);
    document.body.dataset.p2Grappling = hud.combat.ai.isGrappling ? 'true' : 'false';
    document.body.dataset.p2Gloves = hud.combat.ai.glovesActive ? 'active' : 'cooldown';
  }, [
    hud.cameraMode,
    hud.status.turn,
    hud.status.inCheck,
    hud.status.isCheckmate,
    hud.status.checkedKing,
    hud.aiPhase,
    hud.mouseLocked,
    hud.nativePointerLocked,
    hud.moveHistory.length,
    hud.combat.human.punchesRemaining,
    hud.combat.human.cooldownSeconds,
    hud.combat.human.energyPercent,
    hud.combat.human.isGrappling,
    hud.combat.human.isGrabbed,
    hud.combat.human.glovesActive,
    hud.combat.ai.punchesRemaining,
    hud.combat.ai.cooldownSeconds,
    hud.combat.ai.energyPercent,
    hud.combat.ai.isGrappling,
    hud.combat.ai.glovesActive,
  ]);

  // Hide the opening color announcement automatically as soon as the first legal move is completed
  useEffect(() => {
    if (colorBanner && hud.moveHistory.length >= 1) {
      setColorBanner(null);
    }
  }, [colorBanner, hud.moveHistory.length]);

  const handleUpdateSettings = useCallback((next: GameSettings) => {
    const normalized = normalizeGameSettings(next, next.showControlsBar);
    setSettings(normalized);
    saveSettingsLocally(normalized);
    soundFX.setMuted(normalized.muted);
    soundFX.setVolumes(normalized.masterVolume, normalized.sfxVolume);
    setControlsCollapsed(!normalized.showControlsBar);
  }, []);

  const handleSelectDifficulty = useCallback((level: AiDifficulty) => {
    setDifficulty(level);
    saveDifficultyLocally(level);
  }, []);

  const beginMatchWithRandomColor = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    saveDifficultyLocally(difficulty);
    const nextColor = pickRandomHumanColor();
    setHumanColor(nextColor);
    setHud(createInitialHud(nextColor, true));
    setHistoryOpen(false);
    setColorBanner(nextColor);
    controllerRef.current?.resetMatch(nextColor, { lockMouse: true });
    setPhase('playing');
  }, [difficulty]);

  const returnToMainMenu = useCallback(() => {
    setColorBanner(null);
    setHistoryOpen(false);
    controllerRef.current?.resetMatch(humanColor, { lockMouse: false });
    setPhase('menu');
  }, [humanColor]);

  const toggleMute = useCallback(() => {
    handleUpdateSettings({ ...settings, muted: !settings.muted });
  }, [handleUpdateSettings, settings]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase === 'difficulty' && e.code === 'Enter') {
        e.preventDefault();
        beginMatchWithRandomColor();
        return;
      }
      if (phase === 'paused' && e.code === 'Escape') {
        e.preventDefault();
        setPhase('playing');
        return;
      }
      if (phase === 'playing' && !e.repeat) {
        if (e.code === 'Tab') {
          e.preventDefault();
          setHistoryOpen((prev) => !prev);
        } else if (e.code === 'KeyM') {
          toggleMute();
        } else if (e.code === 'KeyH') {
          setControlsCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, beginMatchWithRandomColor, toggleMute]);

  const handleLoadingProgress = useCallback((state: LoadingProgressState) => {
    setLoadingProgress(state);
    if (state.ready && !state.error && !isAutostart) {
      void import('./components/MainMenuScreen');
    }
  }, [isAutostart]);

  const handleArenaLoadError = useCallback((message: string) => {
    setLoadingProgress((prev) => failLoadingState(prev, message));
  }, []);

  const handleRetryLoading = useCallback(() => {
    setLoadingProgress(createInitialLoadingState());
    if (controllerRef.current) {
      controllerRef.current.reinitialize();
    } else {
      setArenaMountKey((k) => k + 1);
    }
  }, []);

  const handleHudUpdate = useCallback((snapshot: HudSnapshot) => {
    setHud(snapshot);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setPhase((prev) => (prev === 'loading' ? 'menu' : prev));
  }, []);

  const handleGameOver = useCallback((snapshot: HudSnapshot) => {
    setHud(snapshot);
    setHistoryOpen(false);
    setPhase('gameover');
  }, []);

  const handlePauseRequest = useCallback(() => {
    setPhase('paused');
  }, []);

  const isNativeLockedInCharMode = phase === 'playing' && hud.nativePointerLocked;
  const activeDifficultyInfo = AI_DIFFICULTIES[difficulty];
  const aiColor: PlayerColor = hud.humanColor === 'w' ? 'b' : 'w';
  const humanColorLabel = hud.humanColor === 'w' ? 'Brancas' : 'Pretas';

  const aiActivityLabel =
    hud.status.turn === aiColor && !hud.status.isGameOver
      ? hud.aiPhase === 'thinking'
        ? 'IA pensando…'
        : hud.aiPhase === 'approaching' ||
            hud.aiPhase === 'grabbing' ||
            hud.aiPhase === 'carrying' ||
            hud.aiPhase === 'placing'
          ? 'IA jogando…'
          : null
      : null;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#060b18] text-[#f5f2eb] ${
        isNativeLockedInCharMode ? 'cursor-none' : ''
      }`}
    >
      {/* Canvas 3D isolado (carregamento sob demanda com ErrorBoundary) */}
      <ArenaErrorBoundary key={arenaMountKey} onError={handleArenaLoadError}>
        <Suspense fallback={null}>
          <ChessArena
            phase={phase}
            difficulty={difficulty}
            humanColor={humanColor}
            cameraSensitivity={settings.cameraSensitivity}
            mouseLockSensitivity={settings.mouseLockSensitivity}
            graphicsQuality={settings.graphicsQuality}
            onLoadingProgress={handleLoadingProgress}
            onHudUpdate={handleHudUpdate}
            onGameOver={handleGameOver}
            onPauseRequest={handlePauseRequest}
            controllerRef={controllerRef}
          />
        </Suspense>
      </ArenaErrorBoundary>

      {/* TELA 1: CARREGAMENTO */}
      {phase === 'loading' && (
        <LoadingScreen
          loadingState={loadingProgress}
          onRetry={handleRetryLoading}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* TELA 2: MENU PRINCIPAL */}
      {phase === 'menu' && (
        <Suspense fallback={null}>
          <MainMenuScreen
            onPlayNow={() => setPhase('mode')}
            onHowToPlay={() => setPhase('howto')}
            onSettings={() => {
              setSettingsReturnPhase('menu');
              setPhase('settings');
            }}
          />
        </Suspense>
      )}

      {/* TELA 3: SELEÇÃO DE MODO DE JOGO */}
      {phase === 'mode' && (
        <Suspense fallback={null}>
          <ModeSelectScreen
            onSelectVsComputer={() => setPhase('difficulty')}
            onBack={() => setPhase('menu')}
          />
        </Suspense>
      )}

      {/* TELA 4: SELEÇÃO DE DIFICULDADE */}
      {phase === 'difficulty' && (
        <Suspense fallback={null}>
          <DifficultyScreen
            difficulty={difficulty}
            onSelectDifficulty={handleSelectDifficulty}
            onStartMatch={beginMatchWithRandomColor}
            onBack={() => setPhase('mode')}
          />
        </Suspense>
      )}

      {/* TELA: COMO JOGAR */}
      {phase === 'howto' && (
        <Suspense fallback={null}>
          <HowToPlayScreen onBack={() => setPhase('menu')} />
        </Suspense>
      )}

      {/* TELA: CONFIGURAÇÕES */}
      {phase === 'settings' && (
        <Suspense fallback={null}>
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBack={() => setPhase(settingsReturnPhase)}
            backLabel={settingsReturnPhase === 'paused' ? 'Voltar para Pausa' : 'Voltar ao Menu'}
          />
        </Suspense>
      )}

      {/* TELA 5: HUD DE PARTIDA */}
      {phase === 'playing' && (
        <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4 md:p-5">
          {/* Bloco Superior: Status + Botões + Avisos Centrais em fluxo (sem sobreposição) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2 sm:gap-4 min-w-0">
            <div className="flex flex-col items-start gap-2 min-w-0 flex-1">
              <div className="pointer-events-auto max-w-full flex flex-wrap items-center gap-x-2.5 gap-y-1 md:gap-3.5 bg-[rgba(10,16,34,0.92)] border border-[#06b6d4]/30 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg">
                <div className="hidden xl:flex items-center pr-2 border-r border-white/10">
                  <span className="font-display text-xs font-extrabold tracking-wider text-[#22d3ee]">
                    CV XADREZ ARENA 3D
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border ${
                      hud.status.turn === 'w'
                        ? 'bg-[#f5f2eb] border-[#22d3ee]'
                        : 'bg-[#1e2433] border-[#e05d44]'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-semibold text-sm md:text-base whitespace-nowrap ${
                      hud.status.inCheck ? 'text-[#f87171]' : 'text-white'
                    }`}
                  >
                    {hud.status.outcomeText}
                  </span>
                </div>

                <span className="text-[#475569]" aria-hidden="true">·</span>

                <div className="text-xs font-medium text-[#a78bfa] whitespace-nowrap">
                  Nível {difficulty}: {activeDifficultyInfo.name}
                </div>

                <span className="text-[#475569]" aria-hidden="true">·</span>

                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="pointer-lock-toggle-btn"
                  data-hud-interactive="true"
                  title={
                    hud.nativePointerLocked
                      ? 'Clique ou pressione ESC/CTRL para destravar o mouse'
                      : 'Clique na arena ou pressione CTRL para travar a mira'
                  }
                  onClick={(e) => {
                    e.currentTarget.blur();
                    controllerRef.current?.toggleMouseLock();
                  }}
                  className={`text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    hud.nativePointerLocked
                      ? 'text-[#38bdf8] border-[#06b6d4]/40 bg-[#0e1932] hover:border-[#22d3ee]'
                      : 'text-[#cbd5e1] border-white/15 bg-[#121a33] hover:border-[#06b6d4]/50'
                  }`}
                >
                  {hud.nativePointerLocked
                    ? 'Mira travada · ESC/CTRL destrava'
                    : hud.mouseLocked
                      ? 'Mira livre · Travar [Ctrl]'
                      : 'Câmera solta · Travar [Ctrl]'}
                </button>
              </div>

              {/* Indicadores discretos de combate (6 cargas para socos/agarrões / recarga 10s) */}
              <div className="pointer-events-none flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'p1', label: 'Você', swatch: '#06b6d4', data: hud.combat.human },
                    { id: 'p2', label: 'Computador', swatch: '#e05d44', data: hud.combat.ai },
                  ] as const
                ).map(({ id, label, swatch, data }) => {
                  const recharging = data.cooldownSeconds > 0;
                  const punchLabel = recharging
                    ? `RECARGA ${data.cooldownSeconds}s (0/${MAX_PUNCHES_PER_SEQUENCE})`
                    : `${data.punchesRemaining}/${MAX_PUNCHES_PER_SEQUENCE} SOCOS`;
                  const chargesPercent = Math.max(
                    0,
                    Math.min(100, (data.punchesRemaining / MAX_PUNCHES_PER_SEQUENCE) * 100),
                  );
                  const barWidth = recharging
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          ((PUNCH_SEQUENCE_COOLDOWN - data.cooldownSeconds) /
                            PUNCH_SEQUENCE_COOLDOWN) *
                            100,
                        ),
                      )
                    : chargesPercent;
                  return (
                    <div
                      key={id}
                      data-testid={`combat-hud-${id}`}
                      aria-label={`${label} ${
                        recharging
                          ? `em recarga ${data.cooldownSeconds} segundos, 0 de ${MAX_PUNCHES_PER_SEQUENCE} cargas`
                          : `${data.punchesRemaining} de ${MAX_PUNCHES_PER_SEQUENCE} cargas`
                      }${data.isGrappling ? ', agarrão ativo' : ''}`}
                      className={`relative overflow-hidden flex items-center gap-2 bg-[rgba(10,16,34,0.88)] border rounded-lg px-2.5 py-1 text-[11px] text-[#e2e8f0] shadow-sm ${
                        data.isGrappling
                          ? 'border-[#a78bfa]/75'
                          : data.isGrabbed
                            ? 'border-[#fbbf24]/75'
                            : 'border-white/10'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-xs shrink-0"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-white">{label}</span>
                      <span className="flex items-center gap-0.5" aria-hidden="true">
                        {[0, 1, 2, 3, 4, 5].map((slot) => {
                          const active = !recharging && slot < data.punchesRemaining;
                          return (
                            <span
                              key={slot}
                              className={`w-1.5 h-2 rounded-[2px] border transition-colors ${
                                active
                                  ? 'border-transparent'
                                  : 'border-white/25 bg-transparent'
                              }`}
                              style={active ? { backgroundColor: swatch } : undefined}
                            />
                          );
                        })}
                      </span>
                      <span
                        className={`font-mono-tabular whitespace-nowrap ${
                          recharging ? 'text-[#fbbf24] font-semibold' : 'text-[#cbd5e1]'
                        }`}
                      >
                        {punchLabel}
                      </span>
                      {data.isGrappling && (
                        <>
                          <span className="text-[#475569]" aria-hidden="true">·</span>
                          <span className="font-mono-tabular font-semibold text-[#a78bfa] whitespace-nowrap">
                            AGARRÃO
                          </span>
                        </>
                      )}
                      <span
                        className="absolute left-0 bottom-0 h-[2px] transition-all duration-150"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: recharging
                            ? '#fbbf24'
                            : data.isGrappling
                              ? '#a78bfa'
                              : swatch,
                          opacity: recharging ? 0.9 : 0.72,
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  );
                })}

                {aiActivityLabel && (
                  <div
                    data-testid="ai-activity-indicator"
                    className="bg-[rgba(37,99,235,0.88)] border border-[#38bdf8]/50 rounded-lg px-2.5 py-1 text-[11px] font-medium text-white shadow-sm whitespace-nowrap"
                  >
                    {aiActivityLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Controles Utilitários (Histórico + Som + Pausar) */}
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                tabIndex={-1}
                data-testid="game-fullscreen-btn"
                data-hud-interactive="true"
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia'}
                title={fullscreenAvailable ? (isFullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia') : 'Tela cheia indisponível neste navegador'}
                disabled={!fullscreenAvailable}
                onClick={(e) => {
                  e.currentTarget.blur();
                  void toggleFullscreen();
                }}
                className="pointer-events-auto inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-[rgba(10,16,34,0.92)] text-white border border-white/15 hover:border-[#06b6d4]/70 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span>
              </button>

              <div className={`${isNativeLockedInCharMode ? 'pointer-events-none' : 'pointer-events-auto'} flex items-center gap-1.5 sm:gap-2 shrink-0`}>
              <button
                type="button"
                tabIndex={-1}
                data-testid="history-toggle-btn"
                aria-label="Abrir ou fechar histórico da partida"
                title="Histórico da partida [TAB]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setHistoryOpen((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-[rgba(10,16,34,0.92)] border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  historyOpen
                    ? 'border-[#22d3ee] text-[#22d3ee]'
                    : 'border-white/15 text-white hover:border-[#06b6d4]/70'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label={settings.muted ? 'Ativar som' : 'Silenciar som'}
                title={settings.muted ? 'Ativar som [M]' : 'Silenciar som [M]'}
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleMute();
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-[rgba(10,16,34,0.92)] text-white border border-white/15 hover:border-[#06b6d4]/70 transition-colors cursor-pointer shrink-0"
              >
                {settings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="pause-btn"
                aria-label="Pausar partida"
                title="Pausar partida [Esc]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setPhase('paused');
                }}
                className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2.5 rounded-xl bg-[rgba(10,16,34,0.92)] text-white border border-white/15 hover:border-[#06b6d4]/70 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pausar</span>
              </button>
              </div>
            </div>
          </div>

            {/* Anúncio Inicial de Cor + Instrução de Pointer Lock + Feedback Central em fluxo */}
            <div className="flex flex-col items-center gap-1.5 pointer-events-none px-2 mx-auto w-full max-w-xl">
              {hud.mouseLocked && !hud.nativePointerLocked && hud.cameraMode === 'character' && !hud.pendingPromotion && (
                <div
                  data-testid="pointer-lock-hint"
                  className="bg-[rgba(10,16,34,0.88)] border border-[#22d3ee]/50 rounded-xl px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] text-[#22d3ee] shadow-md uppercase"
                >
                  CLIQUE PARA ATIVAR A CÂMERA
                </div>
              )}

              {colorBanner && (
                <div
                  data-testid="color-announcement"
                  className="bg-[#0e1529] border-2 border-[#06b6d4] rounded-2xl px-4 py-2.5 shadow-[0_14px_40px_rgba(6,182,212,0.3)] text-center cv-animate-in"
                >
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
                    CV XADREZ ARENA 3D · SORTEIO DE CORES
                  </div>
                  <div className="font-display text-sm sm:text-lg font-extrabold text-white mt-0.5">
                    {colorBanner === 'w'
                      ? 'Você jogará com as peças brancas.'
                      : 'Você jogará com as peças pretas.'}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#94a3b8] mt-0.5">
                    {colorBanner === 'w'
                      ? 'Você faz o primeiro lance da partida.'
                      : 'O computador faz o primeiro lance da partida.'}
                  </div>
                </div>
              )}

              {hud.combat.human.isGrabbed && (
                <div
                  data-testid="grabbed-escape-prompt"
                  className="bg-[rgba(14,21,41,0.95)] border border-[#fbbf24]/70 rounded-xl px-4 py-2 text-center shadow-lg w-full max-w-sm"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                    Você foi agarrado! Pressione ESPAÇO repetidamente
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#060b18] border border-white/10 overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#fbbf24] to-[#22d3ee] transition-all duration-100"
                      style={{ width: `${Math.max(4, Math.min(100, hud.combat.human.strugglePercent))}%` }}
                    />
                  </div>
                </div>
              )}

              {!hud.combat.human.isGrabbed && !colorBanner && hud.toastMessage && (
                <div className="bg-[rgba(10,16,34,0.92)] border border-white/15 rounded-xl px-4 py-1.5 text-xs md:text-sm text-[#e2e8f0] shadow-md text-center">
                  {hud.toastMessage}
                </div>
              )}
            </div>
          </div>

          {historyOpen && (
            <Suspense fallback={null}>
              <MoveHistoryPanel
                moves={hud.moveHistory}
                status={hud.status}
                difficulty={difficulty}
                humanColor={hud.humanColor}
                capturedByWhite={hud.capturedByWhite}
                capturedByBlack={hud.capturedByBlack}
                capturedByHuman={hud.capturedByHuman}
                capturedByAi={hud.capturedByAi}
                onClose={() => setHistoryOpen(false)}
              />
            </Suspense>
          )}

          {/* Guia Compacto de Controles do Jogador (Rodapé retrátil) */}
          <div className="flex flex-col items-start md:items-center">
            <button
              type="button"
              tabIndex={-1}
              aria-expanded={!controlsCollapsed}
              onClick={(e) => {
                e.currentTarget.blur();
                setControlsCollapsed((prev) => !prev);
              }}
              className={`${isNativeLockedInCharMode ? 'pointer-events-none' : 'pointer-events-auto'} inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[rgba(10,16,34,0.92)] border border-b-0 border-[#06b6d4]/30 text-[11px] font-medium text-[#38bdf8] hover:text-white cursor-pointer`}
            >
              {controlsCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Mostrar controles [H]</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Ocultar controles [H]</span>
                </>
              )}
            </button>

            {!controlsCollapsed && (
              <div className="pointer-events-auto bg-[rgba(10,16,34,0.94)] border border-[#06b6d4]/30 rounded-xl px-4 py-2.5 shadow-xl max-w-5xl">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#22d3ee] mb-1.5 text-left md:text-center">
                  CONTROLES DO JOGADOR
                </div>
                <div className="flex flex-wrap items-center justify-start md:justify-center gap-x-3.5 gap-y-1 text-xs text-[#e2e8f0]">
                  <span><strong className="text-white">WASD</strong> – Mover / Arrastar</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">Mouse</strong> – Câmera</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">Botão esq / dir</strong> – Mão / Soco</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">Botão esq + dir</strong> – Agarrar oponente</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">SHIFT</strong> – Correr</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">ESPAÇO</strong> – Pular / Escapar</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">CTRL</strong> – Travar mira</span>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span><strong className="text-white">TAB</strong> – Histórico</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE PROMOÇÃO DE PEÃO */}
      {phase === 'playing' && hud.pendingPromotion && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4">
          <div className="bg-[#0e1529] border border-[#06b6d4]/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-white mb-1">
              Promover Peão
            </h2>
            <p className="text-sm text-[#cbd5e1] mb-5">
              Escolha a nova peça para a casa {hud.pendingPromotion.to}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PROMOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => controllerRef.current?.choosePromotion(opt.type)}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#16203c] hover:bg-[#0891b2] border border-white/10 hover:border-[#22d3ee] text-white font-medium transition-colors cursor-pointer"
                >
                  <span className="text-2xl leading-none">{opt.glyph}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAUSA */}
      {phase === 'paused' && (
        <div data-testid="pause-modal" className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0e1529] border border-[#06b6d4]/35 rounded-3xl p-7 max-w-sm w-full shadow-2xl cv-animate-in">
            <div className="mb-4 flex items-center justify-between gap-3">
              <CvBrandMark compact />
              <button
                type="button"
                data-testid="pause-fullscreen-btn"
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia'}
                title={fullscreenAvailable ? (isFullscreen ? 'Sair da tela cheia' : 'Ativar tela cheia') : 'Tela cheia indisponível neste navegador'}
                disabled={!fullscreenAvailable}
                onClick={() => void toggleFullscreen()}
                className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-[#121a33] hover:bg-[#192547] text-white border border-[#1e2d4d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                <span className="hidden sm:inline text-xs">{isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span>
              </button>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-1">
              Jogo Pausado
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mb-6">
              CV XADREZ ARENA 3D · Você ({humanColorLabel}) · Lance {hud.status.moveNumber} · Nível {difficulty}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                data-testid="pause-resume-btn"
                onClick={() => setPhase('playing')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white font-bold tracking-wide transition-all cursor-pointer"
              >
                CONTINUAR
              </button>
              <button
                type="button"
                data-testid="pause-restart-btn"
                onClick={beginMatchWithRandomColor}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#121a33] hover:bg-[#192547] text-white font-semibold text-sm border border-[#1e2d4d] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#22d3ee]" />
                <span>REINICIAR PARTIDA</span>
              </button>
              <button
                type="button"
                data-testid="pause-settings-btn"
                onClick={() => {
                  setSettingsReturnPhase('paused');
                  setPhase('settings');
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#121a33] hover:bg-[#192547] text-white font-semibold text-sm border border-[#1e2d4d] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#a78bfa]" />
                <span>CONFIGURAÇÕES</span>
              </button>
              <button
                type="button"
                data-testid="pause-menu-btn"
                onClick={returnToMainMenu}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-[#cbd5e1] font-medium text-sm transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>VOLTAR AO MENU PRINCIPAL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FIM DE JOGO (VITÓRIA / DERROTA / EMPATE) */}
      {phase === 'gameover' && (
        <div data-testid="gameover-modal" className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-[#0e1529] border border-[#06b6d4]/45 rounded-3xl p-8 max-w-md w-full shadow-2xl cv-animate-in">
            <div className="flex items-center justify-between gap-2 mb-4">
              <CvBrandMark compact />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a78bfa]">
                CV XADREZ ARENA 3D
              </span>
            </div>

            <h2 className="font-display text-3xl font-extrabold text-white mb-1">
              {hud.status.outcomeText}
            </h2>
            <p className="text-sm text-[#cbd5e1] mb-6">
              {hud.status.isCheckmate
                ? hud.status.winner === hud.humanColor
                  ? `Vitória com as peças ${humanColorLabel}! Você derrotou o computador no Nível ${difficulty} (${activeDifficultyInfo.name}).`
                  : `Derrota no Nível ${difficulty} (${activeDifficultyInfo.name}). O computador deu xeque-mate.`
                : 'A partida terminou empatada.'}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#121a33] border border-[#1e2d4d] rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-wider text-[#94a3b8]">Lances</div>
                <div className="text-xl font-semibold font-mono-tabular text-white mt-0.5">
                  {hud.status.moveNumber}
                </div>
              </div>
              <div className="bg-[#121a33] border border-[#1e2d4d] rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-wider text-[#94a3b8]">Suas capturas</div>
                <div className="text-xl font-semibold font-mono-tabular text-[#22d3ee] mt-0.5">
                  {hud.capturedByHuman}
                </div>
              </div>
              <div className="bg-[#121a33] border border-[#1e2d4d] rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-wider text-[#94a3b8]">Capturas da IA</div>
                <div className="text-xl font-semibold font-mono-tabular text-[#e05d44] mt-0.5">
                  {hud.capturedByAi}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                data-start="true"
                onClick={beginMatchWithRandomColor}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white font-display font-bold tracking-wide transition-all cursor-pointer"
              >
                JOGAR NOVAMENTE
              </button>
              <button
                type="button"
                onClick={() => {
                  controllerRef.current?.resetMatch(humanColor, { lockMouse: false });
                  setPhase('difficulty');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#121a33] hover:bg-[#192547] text-[#e2e8f0] font-medium text-sm border border-[#1e2d4d] transition-colors cursor-pointer"
              >
                Escolher Dificuldade
              </button>
              <button
                type="button"
                onClick={returnToMainMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-[#94a3b8] hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
