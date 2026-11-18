import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CombatInputProcessor } from './combatInput';
import {
  BOARD_PLAYABLE_HALF,
  BOARD_SURFACE_Y,
  FILES,
  MAX_PUNCHES_PER_SEQUENCE,
  PIECE_LABELS,
  RANKS,
  SNAP_RADIUS,
  SQUARE_SIZE,
  findNearestSquare,
  squareToWorld,
  type AiDifficulty,
  type CameraMode,
  type GamePhase,
  type PieceType,
  type PlayerColor,
} from './constants';
import { CV_OFFICIAL_LOGO_URL } from '../components/CvBrandMark';
import { ChessMatchEngine, type ChessStatus, type MoveHistoryEntry } from './chessRules';
import { AiOpponentController, type AiExecutionPhase } from './aiController';
import {
  completePendingPromotion,
  createWorldPhysics,
  evaluateGrabVsGrapplePriority,
  setCameraMode,
  stepWorldPhysics,
  verifyWorldIntegrity,
  type CharacterInput,
  type PendingPromotion,
  type PhysicsEvent,
  type WorldPhysicsState,
} from './physics';
import {
  buildCharacterRig,
  buildChessPieceGroup,
  buildChessboardArena,
  createSharedAssets,
  updateCharacterRigAnimation,
  type CharacterRig,
  type SharedAssets,
} from './models';
import { soundFX } from './sound';
import {
  CHAR_CAM_MAX_DIST,
  CHAR_CAM_MIN_DIST,
  applyMouseLookDelta,
  clampValue,
  computeThirdPersonCameraPosition,
} from './cameraMath';
import { resolveGraphicsProfile, type GraphicsQuality } from './settings';
import {
  advanceLoadingStage,
  createInitialLoadingState,
  failLoadingState,
  type LoadingProgressState,
} from './loadingProgress';

export interface PlayerCombatHud {
  punchesRemaining: number;
  cooldownSeconds: number;
  energyPercent: number;
  isGrappling: boolean;
  isGrabbed: boolean;
  strugglePercent: number;
  glovesActive: boolean;
}

export interface HudSnapshot {
  status: ChessStatus;
  humanColor: PlayerColor;
  cameraMode: CameraMode;
  carryingInfo: {
    color: PlayerColor;
    pieceLabel: string;
    fromSquare: string;
    targetSquare: string;
    isValidTarget: boolean;
    twoHandGrip: boolean;
  } | null;
  toastMessage: string | null;
  pendingPromotion: PendingPromotion | null;
  capturedByWhite: number; // Black pieces captured
  capturedByBlack: number; // White pieces captured
  capturedByHuman: number;
  capturedByAi: number;
  focusTarget: 'auto' | 'w' | 'b';
  mouseLocked: boolean;
  nativePointerLocked: boolean;
  aiPhase: AiExecutionPhase;
  moveHistory: MoveHistoryEntry[];
  combat: {
    w: PlayerCombatHud;
    b: PlayerCombatHud;
    human: PlayerCombatHud;
    ai: PlayerCombatHud;
  };
}

export interface ArenaController {
  resetMatch: (nextHumanColor?: PlayerColor, options?: { lockMouse?: boolean }) => void;
  enableMouseLock: (requestNativePointerLock?: boolean) => void;
  unlockMouseLock: () => void;
  toggleMouseLock: () => void;
  toggleObserverMode: () => void;
  setObserverMode: (mode: CameraMode) => void;
  cycleFocusTarget: () => void;
  choosePromotion: (pieceType: Exclude<PieceType, 'p' | 'k'>) => void;
  reinitialize: () => void;
}

interface ChessArenaProps {
  phase: GamePhase;
  difficulty: AiDifficulty;
  humanColor: PlayerColor;
  cameraSensitivity: number;
  mouseLockSensitivity: number;
  graphicsQuality: GraphicsQuality;
  onLoadingProgress?: (state: LoadingProgressState) => void;
  onSceneReady?: () => void;
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onGameOver: (snapshot: HudSnapshot) => void;
  onPauseRequest: () => void;
  controllerRef: React.MutableRefObject<ArenaController | null>;
}

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _dummy = new THREE.Object3D();

const MENU_BG_COLOR = new THREE.Color(0x060b18);
const GAME_BG_COLOR = new THREE.Color(0x0f172a);
const MENU_RIM_COLOR = new THREE.Color(0x22d3ee);
const GAME_RIM_COLOR = new THREE.Color(0x60a5fa);

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
}

function isMenuShowcasePhase(phase: GamePhase): boolean {
  return (
    phase === 'loading' ||
    phase === 'menu' ||
    phase === 'mode' ||
    phase === 'difficulty' ||
    phase === 'howto' ||
    phase === 'settings'
  );
}

function yieldInitFrame(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    // Never depend on window focus or requestAnimationFrame throttling to complete loading
    const timer = window.setTimeout(finish, 20);
    if (typeof requestAnimationFrame === 'function' && document.visibilityState === 'visible') {
      requestAnimationFrame(() => {
        window.clearTimeout(timer);
        finish();
      });
    }
  });
}

function preloadBrandLogo(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(resolve, 1500);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.src = url;
  });
}

export function ChessArena({
  phase,
  difficulty,
  humanColor,
  cameraSensitivity,
  mouseLockSensitivity,
  graphicsQuality,
  onLoadingProgress,
  onSceneReady,
  onHudUpdate,
  onGameOver,
  onPauseRequest,
  controllerRef,
}: ChessArenaProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<GamePhase>(phase);
  const difficultyRef = useRef<AiDifficulty>(difficulty);
  const humanColorRef = useRef<PlayerColor>(humanColor);
  const sensitivityRef = useRef<number>(cameraSensitivity);
  const mouseLockSensRef = useRef<number>(mouseLockSensitivity);
  const graphicsQualityRef = useRef<GraphicsQuality>(graphicsQuality);
  const applyGraphicsRef = useRef<((quality: GraphicsQuality) => void) | null>(null);
  const callbacksRef = useRef({
    onLoadingProgress,
    onSceneReady,
    onHudUpdate,
    onGameOver,
    onPauseRequest,
  });
  const [initAttempt, setInitAttempt] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase !== 'playing') {
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // Ignore exit errors
        }
      }
      document.body.style.cursor = '';
    }
  }, [phase]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    humanColorRef.current = humanColor;
  }, [humanColor]);

  useEffect(() => {
    sensitivityRef.current = cameraSensitivity;
  }, [cameraSensitivity]);

  useEffect(() => {
    mouseLockSensRef.current = mouseLockSensitivity;
  }, [mouseLockSensitivity]);

  useEffect(() => {
    graphicsQualityRef.current = graphicsQuality;
    applyGraphicsRef.current?.(graphicsQuality);
  }, [graphicsQuality]);

  useEffect(() => {
    callbacksRef.current = {
      onLoadingProgress,
      onSceneReady,
      onHudUpdate,
      onGameOver,
      onPauseRequest,
    };
  }, [onLoadingProgress, onSceneReady, onHudUpdate, onGameOver, onPauseRequest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let contextLost = false;
    let pendingLoopKind: 'none' | 'raf' | 'timeout' = 'none';
    let frameId = 0;
    const clearScheduledTick = () => {
      if (pendingLoopKind === 'raf') {
        cancelAnimationFrame(frameId);
      } else if (pendingLoopKind === 'timeout') {
        window.clearTimeout(frameId);
      }
      pendingLoopKind = 'none';
      frameId = 0;
    };
    let renderer: THREE.WebGLRenderer | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let assets: SharedAssets | null = null;
    let cleanupListeners: (() => void) | null = null;
    let aiController: AiOpponentController | null = null;

    let loadState = createInitialLoadingState();
    const emitLoadState = (next: LoadingProgressState) => {
      loadState = next;
      callbacksRef.current.onLoadingProgress?.(next);
    };
    emitLoadState(loadState);

    const runInitPipeline = async () => {
      try {
        // STAGE 1: Inicializando o jogo...
        const logoReadyPromise = preloadBrandLogo(CV_OFFICIAL_LOGO_URL);

        const isSoftwareGl = (() => {
          const probe = document.createElement('canvas');
          const gl = probe.getContext('webgl2') || probe.getContext('webgl');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param));
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        })();

        const initialProfile = resolveGraphicsProfile(
          graphicsQualityRef.current,
          window.devicePixelRatio || 1,
          isSoftwareGl,
        );

        renderer = new THREE.WebGLRenderer({
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
        });
        const glCtx = renderer.getContext();
        if (!glCtx) {
          throw new Error('Contexto gráfico WebGL indisponível neste navegador.');
        }

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.setPixelRatio(isSoftwareGl ? 0.65 : initialProfile.pixelRatio);
        renderer.setSize(
          container.clientWidth || window.innerWidth,
          container.clientHeight || window.innerHeight,
        );
        renderer.shadowMap.enabled = initialProfile.shadowsEnabled;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.setAttribute('data-testid', 'chess-canvas');
        container.appendChild(renderer.domElement);
        const canvas = renderer.domElement;

        await logoReadyPromise;
        if (disposed) return;

        emitLoadState(advanceLoadingStage(loadState, 'load_models'));
        await yieldInitFrame();
        if (disposed || !renderer) return;

    const scene = new THREE.Scene();
    const bgColor = MENU_BG_COLOR.clone();
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor.getHex(), 0.0115);

    const camera = new THREE.PerspectiveCamera(
      48,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.2,
      220,
    );

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    // 3. Balanced 3-Point Warm/Cool + CV GAMES Cyan/Navy Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.25);
    keyLight.position.set(18, 30, 16);
    keyLight.castShadow = initialProfile.shadowsEnabled;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 4;
    keyLight.shadow.camera.far = 75;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    applyGraphicsRef.current = (nextQuality: GraphicsQuality) => {
      if (!renderer) return;
      const next = resolveGraphicsProfile(nextQuality, window.devicePixelRatio || 1, isSoftwareGl);
      renderer.setPixelRatio(isSoftwareGl ? 0.65 : next.pixelRatio);
      renderer.setSize(
        container.clientWidth || window.innerWidth,
        container.clientHeight || window.innerHeight,
      );
      renderer.shadowMap.enabled = next.shadowsEnabled;
      renderer.shadowMap.needsUpdate = true;
      keyLight.castShadow = next.shadowsEnabled;
    };

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 0.95);
    rimLight.position.set(-22, 16, -20);
    scene.add(rimLight);

    // STAGE 2: Shared Assets
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    assets = createSharedAssets(maxAnisotropy);
    const localAssets = assets;

    emitLoadState(advanceLoadingStage(loadState, 'prepare_board'));
    await yieldInitFrame();
    if (disposed || !renderer) return;

    // STAGE 3: Board & Pieces
    const boardGroup = buildChessboardArena(localAssets, maxAnisotropy, !isSoftwareGl);
    scene.add(boardGroup);

    const engine = new ChessMatchEngine();
    let world: WorldPhysicsState = createWorldPhysics(engine);

    const pieceMeshes = new Map<string, THREE.Group>();
    const rebuildAllPieceMeshes = () => {
      for (const mesh of pieceMeshes.values()) {
        scene.remove(mesh);
      }
      pieceMeshes.clear();
      for (const piece of world.pieces.values()) {
        const mesh = buildChessPieceGroup(piece.type, piece.color, localAssets, !isSoftwareGl);
        mesh.position.set(piece.x, piece.y, piece.z);
        scene.add(mesh);
        pieceMeshes.set(piece.id, mesh);
      }
    };
    rebuildAllPieceMeshes();

    emitLoadState(advanceLoadingStage(loadState, 'load_characters'));
    await yieldInitFrame();
    if (disposed || !renderer) return;

    // STAGE 4: Team-matched White and Black character rigs with compact red boxing gloves
    const whiteRig: CharacterRig = buildCharacterRig('w', localAssets, !isSoftwareGl);
    const blackRig: CharacterRig = buildCharacterRig('b', localAssets, !isSoftwareGl);
    scene.add(whiteRig.root, blackRig.root);

    emitLoadState(advanceLoadingStage(loadState, 'init_physics'));
    await yieldInitFrame();
    if (disposed || !renderer) return;

    if (!verifyWorldIntegrity(world, engine)) {
      throw new Error('Falha na verificação inicial da física e do tabuleiro.');
    }

    emitLoadState(advanceLoadingStage(loadState, 'prepare_ai'));
    await yieldInitFrame();
    if (disposed || !renderer) return;

    const currentAiController = new AiOpponentController(humanColorRef.current === 'w' ? 'b' : 'w');
    aiController = currentAiController;
    if (engine.getStatus(humanColorRef.current).isGameOver) {
      throw new Error('Estado inicial inválido da inteligência artificial.');
    }

    // 5. Legal Move Pad Highlights & Drop Target Ring
    const squarePadGeo = new THREE.RingGeometry(1.1, 1.55, 24);
    squarePadGeo.rotateX(-Math.PI / 2);
    const legalPadMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const activeValidMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const activeInvalidMat = new THREE.MeshBasicMaterial({
      color: 0xf87171,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    localAssets.disposables.push(squarePadGeo, legalPadMat, activeValidMat, activeInvalidMat);

    const legalSquarePads = new Map<string, THREE.Mesh>();
    for (const r of RANKS) {
      for (const f of FILES) {
        const sq = `${f}${r}`;
        const pos = squareToWorld(sq);
        const pad = new THREE.Mesh(squarePadGeo, legalPadMat);
        pad.position.set(pos.x, 0.025, pos.z);
        pad.visible = false;
        scene.add(pad);
        legalSquarePads.set(sq, pad);
      }
    }

    const dropPreviewGeo = new THREE.RingGeometry(1.42, 1.78, 32);
    dropPreviewGeo.rotateX(-Math.PI / 2);
    const dropPreviewMesh = new THREE.Mesh(dropPreviewGeo, activeValidMat);
    dropPreviewMesh.position.y = 0.035;
    dropPreviewMesh.visible = false;
    scene.add(dropPreviewMesh);
    localAssets.disposables.push(dropPreviewGeo);

    // Red check / checkmate highlight on chessboard floor + king base ring
    const checkSquareFillGeo = new THREE.PlaneGeometry(SQUARE_SIZE - 0.1, SQUARE_SIZE - 0.1);
    checkSquareFillGeo.rotateX(-Math.PI / 2);
    const checkSquareFillMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const checkBaseRingGeo = new THREE.RingGeometry(0.84, 1.32, 32);
    checkBaseRingGeo.rotateX(-Math.PI / 2);
    const checkBaseRingMat = new THREE.MeshBasicMaterial({
      color: 0xff2b2b,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const checkHighlightGroup = new THREE.Group();
    const checkSquareFillMesh = new THREE.Mesh(checkSquareFillGeo, checkSquareFillMat);
    checkSquareFillMesh.position.y = 0.02;
    const checkBaseRingMesh = new THREE.Mesh(checkBaseRingGeo, checkBaseRingMat);
    checkBaseRingMesh.position.y = 0.03;
    checkHighlightGroup.add(checkSquareFillMesh, checkBaseRingMesh);
    checkHighlightGroup.visible = false;
    scene.add(checkHighlightGroup);
    localAssets.disposables.push(
      checkSquareFillGeo,
      checkSquareFillMat,
      checkBaseRingGeo,
      checkBaseRingMat,
    );

    // 6. Pooled Particle Ring Buffer (Zero-GC InstancedMesh)
    const PARTICLE_COUNT = 48;
    const particleGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xf3e8d2,
      roughness: 0.7,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);
    localAssets.disposables.push(particleGeo, particleMat);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      active: false,
      x: 0,
      y: -10,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.4,
      scale: 1,
    }));
    let particleCursor = 0;

    const spawnBurst = (x: number, y: number, z: number, count: number, speed = 4.2) => {
      for (let i = 0; i < count; i++) {
        const p = particles[particleCursor];
        particleCursor = (particleCursor + 1) % PARTICLE_COUNT;
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const s = speed * (0.5 + Math.random() * 0.7);
        p.active = true;
        p.x = x;
        p.y = y + 0.12;
        p.z = z;
        p.vx = Math.cos(angle) * s;
        p.vy = 2.2 + Math.random() * 3.5;
        p.vz = Math.sin(angle) * s;
        p.life = 0;
        p.maxLife = 0.32 + Math.random() * 0.25;
        p.scale = 0.7 + Math.random() * 0.65;
      }
    };

    // 7. Camera & Input State
    const focusTarget: 'auto' | 'w' | 'b' = 'w';
    const initialYaw = humanColorRef.current === 'b' ? Math.PI : 0;
    let targetCharCamYaw = initialYaw;
    let targetCharCamPitch = 0.58;
    let charCamYaw = initialYaw;
    let charCamPitch = 0.58;
    let charCamDist = 16.5;
    const charCamFocus = new THREE.Vector3(0, 1.5, humanColorRef.current === 'b' ? -6.0 : 6.0);

    const obsPos = new THREE.Vector3(0, 16, 24);
    let obsYaw = 0;
    let obsPitch = -0.58;
    let titleOrbitAngle = 0.38;

    const keysDown = new Set<string>();
    const justPressed = new Set<string>();
    const combatInput = new CombatInputProcessor();
    let lmbHeld = false;
    let rmbHeld = false;
    let lmbJustPressed = false;
    let rmbJustPressed = false;
    let lmbJustReleased = false;
    let rmbJustReleased = false;
    let bothHeldSinceLastTick = false;
    let lmbPressedAtMs: number | null = null;
    let rmbPressedAtMs: number | null = null;
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;
    // Start active matches with Mouse Lock activated by default
    let mouseLocked = phaseRef.current === 'playing';
    let nativePointerLocked = false;
    let pointerLockWarmupEvents = 0;
    let pointerLockIgnoreUntilMs = 0;

    let toastMessage: string | null = null;
    let toastTimer = 0;
    const setToast = (msg: string, duration = 2.1) => {
      toastMessage = msg;
      toastTimer = duration;
      hudDirty = true;
    };

    let lastCarriedPieceId: string | null = null;
    let lastTargetSquareKey = '';
    let cachedLegalTargets = new Set<string>();
    let hudDirty = true;
    let lastCombatHudKey = '';

    const toPlayerCombatHud = (c: PlayerColor): PlayerCombatHud => {
      const ch = world.characters[c];
      return {
        punchesRemaining: ch.punchesRemaining,
        cooldownSeconds: Math.ceil(ch.punchSequenceCooldown),
        energyPercent: Math.round(ch.combatEnergy),
        isGrappling: ch.grappleTargetColor !== null,
        isGrabbed: ch.grabbedByColor !== null,
        strugglePercent: Math.round(ch.grappleStruggleMeter * 100),
        glovesActive: ch.punchesRemaining > 0 && ch.punchSequenceCooldown <= 0,
      };
    };

    const buildHudSnapshot = (): HudSnapshot => {
      const hColor = humanColorRef.current;
      const aColor: PlayerColor = hColor === 'w' ? 'b' : 'w';
      const status = engine.getStatus(hColor);

      const wHud = toPlayerCombatHud('w');
      const bHud = toPlayerCombatHud('b');

      const capturedByWhite = world.capturedCount.b;
      const capturedByBlack = world.capturedCount.w;

      return {
        status,
        humanColor: hColor,
        cameraMode: world.cameraMode,
        carryingInfo: null,
        toastMessage,
        pendingPromotion: world.pendingPromotion?.color === hColor ? world.pendingPromotion : null,
        capturedByWhite,
        capturedByBlack,
        capturedByHuman: hColor === 'w' ? capturedByWhite : capturedByBlack,
        capturedByAi: aColor === 'w' ? capturedByWhite : capturedByBlack,
        focusTarget,
        mouseLocked,
        nativePointerLocked,
        aiPhase: currentAiController.phase,
        moveHistory: engine.getDetailedHistory(),
        combat: {
          w: wHud,
          b: bHud,
          human: hColor === 'w' ? wHud : bHud,
          ai: aColor === 'w' ? wHud : bHud,
        },
      };
    };

    const emitHud = (force = false) => {
      const hColor = humanColorRef.current;
      const wCh = world.characters.w;
      const bCh = world.characters.b;
      const combatKey = `${hColor}|${wCh.punchesRemaining}:${Math.ceil(
        wCh.punchSequenceCooldown,
      )}:${Math.round(wCh.combatEnergy)}:${wCh.grappleTargetColor ?? ''}:${wCh.grabbedByColor ?? ''}:${Math.round(
        wCh.grappleStruggleMeter * 20,
      )}|${bCh.punchesRemaining}:${Math.ceil(
        bCh.punchSequenceCooldown,
      )}:${Math.round(bCh.combatEnergy)}:${bCh.grappleTargetColor ?? ''}:${bCh.grabbedByColor ?? ''}:${Math.round(
        bCh.grappleStruggleMeter * 20,
      )}|${currentAiController.phase}|${mouseLocked ? 1 : 0}:${nativePointerLocked ? 1 : 0}`;
      if (combatKey !== lastCombatHudKey) {
        lastCombatHudKey = combatKey;
        hudDirty = true;
      }

      if (!force && !hudDirty) return;
      hudDirty = false;
      callbacksRef.current.onHudUpdate(buildHudSnapshot());
    };

    const handlePhysicsEvents = (events: PhysicsEvent[]) => {
      const hColor = humanColorRef.current;
      for (const ev of events) {
        if (ev.type === 'jump') {
          soundFX.playJump();
          spawnBurst(ev.x ?? 0, 0, ev.z ?? 0, 5, 2.5);
        } else if (ev.type === 'land') {
          soundFX.playLand();
          spawnBurst(ev.x ?? 0, 0, ev.z ?? 0, 6, 3.0);
        } else if (ev.type === 'grab') {
          soundFX.playGrab();
          hudDirty = true;
        } else if (ev.type === 'release_valid') {
          soundFX.playPlaceValid();
          spawnBurst(ev.x ?? 0, 0, ev.z ?? 0, 12, 4.4);
          hudDirty = true;
          const st = engine.getStatus(hColor);
          if (st.isGameOver) {
            if (st.winner === hColor) {
              soundFX.playVictory();
            } else {
              soundFX.playDefeat();
            }
            callbacksRef.current.onGameOver(buildHudSnapshot());
          }
        } else if (ev.type === 'release_invalid') {
          soundFX.playPlaceInvalid();
          hudDirty = true;
        } else if (ev.type === 'capture') {
          soundFX.playCapture();
          spawnBurst(ev.x ?? 0, 0.6, ev.z ?? 0, 16, 6.0);
          hudDirty = true;
        } else if (ev.type === 'wrong_color' || ev.type === 'wrong_turn') {
          // Visual feedback is handled directly on the 3D board without technical text overlays
        } else if (ev.type === 'promotion_needed') {
          if (ev.color === hColor) {
            releaseMouseLock(false);
          }
          hudDirty = true;
        } else if (ev.type === 'punch_swing') {
          soundFX.playPunchSwing();
          hudDirty = true;
        } else if (ev.type === 'punch_hit') {
          soundFX.playPunchHit(Boolean(ev.knockdown || ev.combo));
          const burstCount = ev.combo ? 18 : ev.knockdown ? 12 : 6;
          const burstSpeed = ev.combo ? 6.2 : ev.knockdown ? 4.8 : 3.2;
          spawnBurst(ev.x ?? 0, 1.4, ev.z ?? 0, burstCount, burstSpeed);
          hudDirty = true;
        } else if (ev.type === 'combat_drop') {
          hudDirty = true;
        } else if (ev.type === 'grapple_attempt') {
          soundFX.playPunchSwing();
        } else if (ev.type === 'grapple_start') {
          soundFX.playGrappleGrab();
          spawnBurst(ev.x ?? 0, 1.35, ev.z ?? 0, 8, 3.2);
          hudDirty = true;
        } else if (ev.type === 'grapple_break') {
          soundFX.playGrappleBreak();
          spawnBurst(ev.x ?? 0, 1.35, ev.z ?? 0, 12, 4.2);
          hudDirty = true;
        } else if (ev.type === 'grapple_release') {
          hudDirty = true;
        }
      }
    };

    const applyCursorVisibility = (locked: boolean) => {
      canvas.style.cursor = locked ? 'none' : '';
      document.body.style.cursor = nativePointerLocked ? 'none' : '';
    };

    const requestBrowserPointerLock = () => {
      try {
        const res = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (res && typeof res.catch === 'function') {
          res.catch(() => {
            nativePointerLocked = false;
            hudDirty = true;
            emitHud(true);
          });
        }
      } catch {
        nativePointerLocked = false;
      }
    };

    const acquireMouseLock = (options?: { silentToast?: boolean; requestNative?: boolean; bypassPhaseCheck?: boolean }) => {
      const silentToast = options?.silentToast ?? false;
      const requestNative = options?.requestNative ?? true;
      const bypassPhaseCheck = options?.bypassPhaseCheck ?? false;
      if (
        (!bypassPhaseCheck && phaseRef.current !== 'playing') ||
        world.cameraMode !== 'character' ||
        world.pendingPromotion?.color === humanColorRef.current
      ) {
        return;
      }
      mouseLocked = true;
      nativePointerLocked = document.pointerLockElement === canvas;
      pointerLockWarmupEvents = nativePointerLocked ? 2 : 0;
      pointerLockIgnoreUntilMs = performance.now() + 90;
      lastPointerX = null;
      lastPointerY = null;
      applyCursorVisibility(true);
      if (!silentToast) {
        setToast('Mira travada — Mova o mouse para girar a câmera (ESC ou CTRL para destravar)', 2.0);
      }
      hudDirty = true;
      emitHud(true);

      if (requestNative && document.pointerLockElement !== canvas) {
        requestBrowserPointerLock();
      }
    };

    const releaseMouseLock = (showToast = true) => {
      const wasLocked = mouseLocked || nativePointerLocked || document.pointerLockElement === canvas;
      mouseLocked = false;
      nativePointerLocked = false;
      pointerLockWarmupEvents = 0;
      pointerLockIgnoreUntilMs = performance.now() + 80;
      lastPointerX = null;
      lastPointerY = null;
      applyCursorVisibility(false);
      if (document.pointerLockElement === canvas) {
        try {
          document.exitPointerLock?.();
        } catch {
          // Ignore exitPointerLock errors
        }
      }
      if (wasLocked) {
        if (showToast) {
          setToast('Mira destravada — Controles da tela liberados', 1.5);
        }
        hudDirty = true;
        emitHud(true);
      }
    };

    const toggleObserver = () => {
      if (world.cameraMode !== 'character') {
        const evs: PhysicsEvent[] = [];
        setCameraMode(world, 'character', evs);
        handlePhysicsEvents(evs);
        hudDirty = true;
        emitHud(true);
      }
    };

    const swapPromotedPieceMesh = (
      pieceId: string,
      pieceType: Exclude<PieceType, 'p' | 'k'>,
      color: PlayerColor,
    ) => {
      const oldMesh = pieceMeshes.get(pieceId);
      if (oldMesh) {
        scene.remove(oldMesh);
      }
      const newMesh = buildChessPieceGroup(pieceType, color, localAssets, !isSoftwareGl);
      const pState = world.pieces.get(pieceId);
      if (pState) {
        newMesh.position.set(pState.x, pState.y, pState.z);
      }
      scene.add(newMesh);
      pieceMeshes.set(pieceId, newMesh);
    };

    controllerRef.current = {
      resetMatch: (nextHumanColor?: PlayerColor, options?: { lockMouse?: boolean }) => {
        const hColor = nextHumanColor ?? humanColorRef.current;
        humanColorRef.current = hColor;
        const aColor: PlayerColor = hColor === 'w' ? 'b' : 'w';
        const lockMouse = options?.lockMouse ?? true;

        engine.reset();
        world = createWorldPhysics(engine);
        currentAiController.reset(aColor);
        combatInput.reset();
        keysDown.clear();
        justPressed.clear();
        lmbHeld = false;
        rmbHeld = false;
        lmbJustPressed = false;
        rmbJustPressed = false;
        lmbJustReleased = false;
        rmbJustReleased = false;
        bothHeldSinceLastTick = false;
        lmbPressedAtMs = null;
        rmbPressedAtMs = null;
        rebuildAllPieceMeshes();
        lastCarriedPieceId = null;
        lastTargetSquareKey = '';
        cachedLegalTargets.clear();
        for (const pad of legalSquarePads.values()) pad.visible = false;
        dropPreviewMesh.visible = false;
        checkHighlightGroup.visible = false;

        const startYaw = hColor === 'b' ? Math.PI : 0;
        const startZ = hColor === 'b' ? -6.0 : 6.0;
        targetCharCamYaw = startYaw;
        targetCharCamPitch = 0.58;
        charCamYaw = startYaw;
        charCamPitch = 0.58;
        charCamDist = 16.5;
        charCamFocus.set(0, 1.5, startZ);

        // Position gameplay camera immediately behind player so first frame is properly framed
        const desired = computeThirdPersonCameraPosition(
          charCamFocus,
          charCamYaw,
          charCamPitch,
          charCamDist,
        );
        camera.position.set(desired.x, desired.y, desired.z);
        camera.lookAt(charCamFocus);

        toastMessage = null;
        if (lockMouse) {
          acquireMouseLock({ silentToast: true, requestNative: true, bypassPhaseCheck: true });
        } else {
          releaseMouseLock(false);
        }
        hudDirty = true;
        emitHud(true);
      },
      enableMouseLock: (requestNativePointerLock = true) => {
        acquireMouseLock({
          silentToast: true,
          requestNative: requestNativePointerLock,
          bypassPhaseCheck: true,
        });
      },
      unlockMouseLock: () => {
        releaseMouseLock(true);
      },
      toggleMouseLock: () => {
        if (nativePointerLocked || document.pointerLockElement === canvas) {
          releaseMouseLock(true);
        } else {
          acquireMouseLock({ silentToast: false, requestNative: true });
        }
      },
      toggleObserverMode: () => toggleObserver(),
      setObserverMode: () => toggleObserver(),
      cycleFocusTarget: () => {},
      choosePromotion: (pieceType: Exclude<PieceType, 'p' | 'k'>) => {
        const pending = world.pendingPromotion;
        if (!pending) return;
        const evs: PhysicsEvent[] = [];
        const ok = completePendingPromotion(world, engine, pieceType, evs);
        if (ok) {
          swapPromotedPieceMesh(pending.pieceId, pieceType, pending.color);
          handlePhysicsEvents(evs);
          emitHud(true);
        }
      },
      reinitialize: () => {
        setInitAttempt((n) => n + 1);
      },
    };

    // 8. Input Listeners
    const onPointerLockChange = () => {
      const lockedToCanvas = document.pointerLockElement === canvas;
      if (lockedToCanvas) {
        nativePointerLocked = true;
        mouseLocked = true;
        pointerLockWarmupEvents = 2;
        pointerLockIgnoreUntilMs = performance.now() + 140;
        lastPointerX = null;
        lastPointerY = null;
        applyCursorVisibility(true);
        hudDirty = true;
        emitHud(true);
      } else if (nativePointerLocked) {
        nativePointerLocked = false;
        mouseLocked = false;
        pointerLockWarmupEvents = 0;
        pointerLockIgnoreUntilMs = performance.now() + 80;
        lastPointerX = null;
        lastPointerY = null;
        applyCursorVisibility(false);
        hudDirty = true;
        emitHud(true);
      }
    };

    const onPointerLockError = () => {
      nativePointerLocked = false;
      pointerLockWarmupEvents = 0;
      hudDirty = true;
      emitHud(true);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return;

      if (e.code === 'Escape') {
        e.preventDefault();
        if (mouseLocked || document.pointerLockElement === canvas) {
          releaseMouseLock(true);
          return;
        }
        keysDown.clear();
        combatInput.reset();
        lmbHeld = false;
        rmbHeld = false;
        lmbJustPressed = false;
        rmbJustPressed = false;
        callbacksRef.current.onPauseRequest();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
      }

      if (!e.repeat) {
        justPressed.add(e.code);
        if (
          (e.code === 'ControlLeft' || e.code === 'ControlRight') &&
          world.cameraMode === 'character' &&
          !world.pendingPromotion
        ) {
          e.preventDefault();
          if (mouseLocked || document.pointerLockElement === canvas) {
            releaseMouseLock(true);
          } else {
            acquireMouseLock({ silentToast: false, requestNative: true });
          }
        }
      }
      keysDown.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
    };

    const onBlurOrHide = () => {
      keysDown.clear();
      justPressed.clear();
      combatInput.reset();
      lmbHeld = false;
      rmbHeld = false;
      lmbJustPressed = false;
      rmbJustPressed = false;
      lmbJustReleased = false;
      rmbJustReleased = false;
      bothHeldSinceLastTick = false;
      lmbPressedAtMs = null;
      rmbPressedAtMs = null;
      lastPointerX = null;
      lastPointerY = null;
      if (mouseLocked || nativePointerLocked) {
        releaseMouseLock(false);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (phaseRef.current !== 'playing') return;
      const nowMs = performance.now();
      if (e.button === 0) {
        lmbHeld = true;
        lmbJustPressed = true;
        lmbPressedAtMs = nowMs;
        if (rmbHeld) bothHeldSinceLastTick = true;
        combatInput.recordMouseDown('left', nowMs);
      }
      if (e.button === 2) {
        rmbHeld = true;
        rmbJustPressed = true;
        rmbPressedAtMs = nowMs;
        if (lmbHeld) bothHeldSinceLastTick = true;
        combatInput.recordMouseDown('right', nowMs);
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      if (
        mouseLocked &&
        world.cameraMode === 'character' &&
        !world.pendingPromotion &&
        document.pointerLockElement !== canvas
      ) {
        requestBrowserPointerLock();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const nowMs = performance.now();
      if (e.button === 0) {
        lmbHeld = false;
        lmbJustReleased = true;
        combatInput.recordMouseUp('left', nowMs);
      }
      if (e.button === 2) {
        rmbHeld = false;
        rmbJustReleased = true;
        combatInput.recordMouseUp('right', nowMs);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (phaseRef.current !== 'playing') return;

      const isNativeLocked = document.pointerLockElement === canvas;
      if (!isNativeLocked && e.target instanceof Element && e.target.closest('button, [data-hud-interactive]')) {
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        return;
      }

      const nowMs = performance.now();
      let dx = 0;
      let dy = 0;

      if (isNativeLocked) {
        dx = e.movementX || 0;
        dy = e.movementY || 0;
        if (pointerLockWarmupEvents > 0) {
          pointerLockWarmupEvents -= 1;
          if (Math.hypot(dx, dy) > 20 || nowMs < pointerLockIgnoreUntilMs) {
            return;
          }
        }
        if (nowMs < pointerLockIgnoreUntilMs && Math.hypot(dx, dy) > 30) {
          return;
        }
        // Discard anomalous browser focus/warp jumps during native pointer lock
        if (Math.hypot(dx, dy) > 220) {
          return;
        }
      } else {
        if (lastPointerX === null || lastPointerY === null) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
          return;
        }
        dx = e.clientX - lastPointerX;
        dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        if (dx === 0 && dy === 0 && (e.movementX || e.movementY)) {
          dx = e.movementX || 0;
          dy = e.movementY || 0;
        }
        if (nowMs < pointerLockIgnoreUntilMs && Math.hypot(dx, dy) > 40) {
          return;
        }
        dx = clampValue(dx, -85, 85);
        dy = clampValue(dy, -85, 85);
      }

      if (world.cameraMode === 'character') {
        if (!mouseLocked && !isNativeLocked) {
          return;
        }
        const baseSens = sensitivityRef.current || 1.0;
        const lockSens = mouseLockSensRef.current || 1.0;
        const sens = mouseLocked || isNativeLocked ? baseSens * lockSens : baseSens;
        const nextOrbit = applyMouseLookDelta(
          { yaw: targetCharCamYaw, pitch: targetCharCamPitch },
          dx,
          dy,
          0.0042 * sens,
          0.0036 * sens,
        );
        targetCharCamYaw = nextOrbit.yaw;
        targetCharCamPitch = nextOrbit.pitch;
      } else {
        dx = clampValue(dx, -60, 60);
        dy = clampValue(dy, -60, 60);
        if (rmbHeld || isNativeLocked) {
          obsYaw -= dx * 0.0048;
          obsPitch = THREE.MathUtils.clamp(obsPitch - dy * 0.0042, -1.48, 1.48);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (phaseRef.current !== 'playing') return;
      e.preventDefault();
      if (world.cameraMode === 'character') {
        charCamDist = clampValue(charCamDist + e.deltaY * 0.012, CHAR_CAM_MIN_DIST, CHAR_CAM_MAX_DIST);
      } else {
        const cosP = Math.cos(obsPitch);
        const lookX = -Math.sin(obsYaw) * cosP;
        const lookY = Math.sin(obsPitch);
        const lookZ = -Math.cos(obsYaw) * cosP;
        const zoomStep = -e.deltaY * 0.02;
        obsPos.x = THREE.MathUtils.clamp(obsPos.x + lookX * zoomStep, -48, 48);
        obsPos.y = THREE.MathUtils.clamp(obsPos.y + lookY * zoomStep, 1.4, 42);
        obsPos.z = THREE.MathUtils.clamp(obsPos.z + lookZ * zoomStep, -48, 48);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer?.setSize(w, h);
      renderer?.render(scene, camera);
    };

    emitLoadState(advanceLoadingStage(loadState, 'finalize_settings'));
    await yieldInitFrame();
    if (disposed || !renderer) return;

    let lastTime = performance.now();
    let elapsed = 0;

    const scheduleNextTick = () => {
      if (disposed || contextLost) return;
      if (pendingLoopKind !== 'none') return;
      if (!isSoftwareGl && document.visibilityState === 'hidden') return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        pendingLoopKind = 'raf';
        frameId = requestAnimationFrame(tick);
      }
    };

    const ensureLoopActive = () => {
      if (disposed || contextLost) return;
      lastTime = performance.now();
      scheduleNextTick();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onBlurOrHide();
        if (!isSoftwareGl) {
          clearScheduledTick();
        }
      } else {
        ensureLoopActive();
      }
    };

    const onWindowFocus = () => {
      ensureLoopActive();
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      clearScheduledTick();
    };

    const onContextRestored = () => {
      contextLost = false;
      ensureLoopActive();
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlurOrHide);
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onResize);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    cleanupListeners = () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlurOrHide);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);

      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      applyCursorVisibility(false);
      if (document.pointerLockElement === canvas) {
        try {
          document.exitPointerLock?.();
        } catch {
          // Ignore exit errors
        }
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    if (phaseRef.current === 'playing') {
      const desired = computeThirdPersonCameraPosition(
        charCamFocus,
        charCamYaw,
        charCamPitch,
        charCamDist,
      );
      camera.position.set(desired.x, desired.y, desired.z);
      camera.lookAt(charCamFocus);
      applyCursorVisibility(mouseLocked);
    } else {
      camera.position.set(Math.sin(titleOrbitAngle) * 28.5, 15.0, Math.cos(titleOrbitAngle) * 28.5);
      camera.lookAt(0, 1.2, 0);
    }

    emitHud(true);

    // 9. Simulation & Render Loop (paced via afterDraw on software WebGL)
    function afterDraw(cb: () => void) {
      if (!renderer || disposed || contextLost) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed || contextLost) {
          pendingLoopKind = 'none';
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          pendingLoopKind = 'timeout';
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          pendingLoopKind = 'timeout';
          frameId = window.setTimeout(cb, 16);
        }
      };
      pendingLoopKind = 'timeout';
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      pendingLoopKind = 'none';
      if (disposed || contextLost) return;
      const now = performance.now();
      const rawDt = Math.max(0.001, (now - lastTime) / 1000);
      lastTime = now;
      const dt = Math.min(rawDt, 0.75);
      elapsed += dt;

      if (toastTimer > 0) {
        toastTimer -= dt;
        if (toastTimer <= 0) {
          toastMessage = null;
          hudDirty = true;
        }
      }

      const curPhase = phaseRef.current;
      const inMenuShowcase = isMenuShowcasePhase(curPhase);

      // Smoothly transition atmosphere between dark-navy cyan menu showcase and active match
      const targetBg = inMenuShowcase ? MENU_BG_COLOR : GAME_BG_COLOR;
      bgColor.lerp(targetBg, 1 - Math.exp(-4.0 * dt));
      (scene.background as THREE.Color).copy(bgColor);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(bgColor);
      }
      rimLight.color.lerp(inMenuShowcase ? MENU_RIM_COLOR : GAME_RIM_COLOR, 1 - Math.exp(-4.0 * dt));

      const hColor = humanColorRef.current;
      const aColor: PlayerColor = hColor === 'w' ? 'b' : 'w';
      currentAiController.setAiColor(aColor);

      if (inMenuShowcase) {
        // Slowly rotate camera smoothly around vertical axis of the 3D chessboard
        titleOrbitAngle += dt * 0.14;
        camera.position.set(
          Math.sin(titleOrbitAngle) * 28.5,
          15.0 + Math.sin(elapsed * 0.35) * 0.6,
          Math.cos(titleOrbitAngle) * 28.5,
        );
        camera.lookAt(0, 1.2, 0);
      } else if (curPhase === 'playing') {
        const activeRefYaw = world.cameraMode === 'character' ? charCamYaw : obsYaw;
        const subSteps = Math.max(1, Math.min(22, Math.ceil(dt / 0.035)));
        const subDt = dt / subSteps;

        const moveForward = (keysDown.has('KeyW') ? 1 : 0) - (keysDown.has('KeyS') ? 1 : 0);
        const moveRight = (keysDown.has('KeyD') ? 1 : 0) - (keysDown.has('KeyA') ? 1 : 0);
        const jumpPressedOnce = justPressed.has('Space');
        const jumpHeld = keysDown.has('Space');
        const sprintHeld = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');

        const firstLmbJustPressed = lmbJustPressed;
        const firstRmbJustPressed = rmbJustPressed;
        const firstLmbJustReleased = lmbJustReleased;
        const firstRmbJustReleased = rmbJustReleased;
        const firstBothHeld = bothHeldSinceLastTick;

        justPressed.clear();
        lmbJustPressed = false;
        rmbJustPressed = false;
        lmbJustReleased = false;
        rmbJustReleased = false;
        bothHeldSinceLastTick = false;

        for (let stepIdx = 0; stepIdx < subSteps; stepIdx++) {
          const isFirstSubstep = stepIdx === 0;
          const hChar = world.characters[hColor];
          const grabVsGrapple = evaluateGrabVsGrapplePriority(hChar, world, engine);
          const canPunchNow =
            !world.pendingPromotion &&
            !hChar.isKnockedDown &&
            hChar.stunTimer <= 0 &&
            hChar.punchSequenceCooldown <= 0 &&
            hChar.punchesRemaining > 0;
          const resolvedCombat = combatInput.step(
            {
              leftHeld: lmbHeld,
              rightHeld: rmbHeld,
              leftJustPressed: isFirstSubstep ? firstLmbJustPressed : false,
              rightJustPressed: isFirstSubstep ? firstRmbJustPressed : false,
              leftJustReleased: isFirstSubstep ? firstLmbJustReleased : false,
              rightJustReleased: isFirstSubstep ? firstRmbJustReleased : false,
              bothHeldSinceLastTick: isFirstSubstep ? firstBothHeld : false,
              leftPressedAtMs: lmbPressedAtMs,
              rightPressedAtMs: rmbPressedAtMs,
              nowMs: now,
              alreadyCarryingPiece: Boolean(
                hChar.leftHand.grabbedPieceId || hChar.rightHand.grabbedPieceId,
              ),
              alreadyGrappling: hChar.grappleTargetColor !== null,
              prioritizeChessPiece: grabVsGrapple.prioritizeChessPiece,
              canPunchLeft:
                canPunchNow &&
                !hChar.leftHand.grabbedPieceId &&
                hChar.leftHand.punchCooldown <= 0 &&
                hChar.leftHand.punchTimer <= 0,
              canPunchRight:
                canPunchNow &&
                !hChar.rightHand.grabbedPieceId &&
                hChar.rightHand.punchCooldown <= 0 &&
                hChar.rightHand.punchTimer <= 0,
              inSequenceCooldown: hChar.punchSequenceCooldown > 0,
            },
            subDt,
          );

          const p1Input: CharacterInput = {
            moveForward,
            moveRight,
            jumpPressed: isFirstSubstep ? jumpPressedOnce : false,
            jumpHeld,
            sprintHeld,
            leftHandHeld: resolvedCombat.leftHandHeld,
            rightHandHeld: resolvedCombat.rightHandHeld,
            leftPunchPressed: resolvedCombat.leftPunchPressed,
            rightPunchPressed: resolvedCombat.rightPunchPressed,
            grappleHeld: resolvedCombat.grappleHeld,
          };

          const aiInput: CharacterInput = currentAiController.step(
            world,
            engine,
            difficultyRef.current,
            activeRefYaw,
            subDt,
          );

          const events = stepWorldPhysics(
            world,
            engine,
            {
              w: hColor === 'w' ? p1Input : aiInput,
              b: hColor === 'b' ? p1Input : aiInput,
            },
            activeRefYaw,
            subDt,
          );
          handlePhysicsEvents(events);
        }

        // If AI's pawn reached the final rank, resolve promotion automatically
        if (world.pendingPromotion && world.pendingPromotion.color === aColor) {
          const pending = world.pendingPromotion;
          const promoType = currentAiController.getPendingPromotionChoice();
          const promoEvs: PhysicsEvent[] = [];
          const ok = completePendingPromotion(world, engine, promoType, promoEvs);
          if (ok) {
            swapPromotedPieceMesh(pending.pieceId, promoType, pending.color);
            handlePhysicsEvents(promoEvs);
          }
        }

        // Footstep sound when either character walks on the board
        if (
          world.cameraMode === 'character' &&
          ((world.characters.w.grounded && world.characters.w.speedRatio > 0.35) ||
            (world.characters.b.grounded && world.characters.b.speedRatio > 0.35))
        ) {
          soundFX.playStep();
        }

        // Camera update follows human player's character
        if (world.cameraMode === 'character') {
          const rotDamp = 1 - Math.exp(-22.0 * dt);
          charCamYaw += (targetCharCamYaw - charCamYaw) * rotDamp;
          charCamPitch += (targetCharCamPitch - charCamPitch) * rotDamp;

          const targetChar = world.characters[hColor];

          const damp = 1 - Math.exp(-7.5 * dt);
          _vec3A.set(targetChar.x, targetChar.y + 1.85, targetChar.z);
          charCamFocus.lerp(_vec3A, damp);

          const desired = computeThirdPersonCameraPosition(
            charCamFocus,
            charCamYaw,
            charCamPitch,
            charCamDist,
          );
          _vec3B.set(desired.x, desired.y, desired.z);
          camera.position.lerp(_vec3B, 1 - Math.exp(-12.0 * dt));
          camera.lookAt(charCamFocus);
        } else {
          const cosP = Math.cos(obsPitch);
          const fwdX = -Math.sin(obsYaw);
          const fwdZ = -Math.cos(obsYaw);
          const rightX = Math.cos(obsYaw);
          const rightZ = -Math.sin(obsYaw);

          const moveF = (keysDown.has('KeyW') ? 1 : 0) - (keysDown.has('KeyS') ? 1 : 0);
          const moveR = (keysDown.has('KeyD') ? 1 : 0) - (keysDown.has('KeyA') ? 1 : 0);
          const moveY = (keysDown.has('KeyE') ? 1 : 0) - (keysDown.has('KeyQ') ? 1 : 0);
          const flySpeed = keysDown.has('ShiftLeft') ? 32 : 19;

          obsPos.x += (fwdX * moveF + rightX * moveR) * flySpeed * dt;
          obsPos.z += (fwdZ * moveF + rightZ * moveR) * flySpeed * dt;
          obsPos.y += moveY * flySpeed * dt;

          obsPos.x = THREE.MathUtils.clamp(obsPos.x, -48, 48);
          obsPos.y = THREE.MathUtils.clamp(obsPos.y, 1.4, 42);
          obsPos.z = THREE.MathUtils.clamp(obsPos.z, -48, 48);

          camera.position.lerp(obsPos, 1 - Math.exp(-14.0 * dt));
          _vec3A.set(
            camera.position.x - Math.sin(obsYaw) * cosP * 10,
            camera.position.y + Math.sin(obsPitch) * 10,
            camera.position.z - Math.cos(obsYaw) * cosP * 10,
          );
          camera.lookAt(_vec3A);
        }
      }

      // Sync 3D character rigs (team appearance strictly follows White and Black chess colors)
      updateCharacterRigAnimation(whiteRig, world.characters.w, elapsed);
      updateCharacterRigAnimation(blackRig, world.characters.b, elapsed);

      let activeCarriedPieceId: string | null = null;
      for (const piece of world.pieces.values()) {
        const mesh = pieceMeshes.get(piece.id);
        if (!mesh) continue;
        mesh.position.set(piece.x, piece.y, piece.z);
        mesh.rotation.set(piece.tiltX, 0, piece.tiltZ);

        const shadowDisc = mesh.userData.shadowDisc as THREE.Mesh | undefined;
        if (shadowDisc) {
          shadowDisc.position.y = Math.max(0.015, BOARD_SURFACE_Y - piece.y + 0.015);
          const s = Math.max(0.4, 1 - Math.max(0, piece.y) * 0.16);
          shadowDisc.scale.setScalar(s * (piece.type === 'k' ? 1.1 : 0.85));
        }

        if (piece.heldBy) {
          activeCarriedPieceId = piece.id;
        }
      }

      // Update legal destination pads & drop target preview ring
      if (activeCarriedPieceId !== lastCarriedPieceId) {
        lastCarriedPieceId = activeCarriedPieceId;
        cachedLegalTargets.clear();
        for (const pad of legalSquarePads.values()) pad.visible = false;
        if (activeCarriedPieceId) {
          const carried = world.pieces.get(activeCarriedPieceId);
          if (carried) {
            const targets = engine.getLegalTargets(carried.originSquare);
            for (const sq of targets) {
              cachedLegalTargets.add(sq);
              const pad = legalSquarePads.get(sq);
              if (pad) pad.visible = true;
            }
          }
        }
        hudDirty = true;
      }

      if (activeCarriedPieceId) {
        const carried = world.pieces.get(activeCarriedPieceId);
        if (carried) {
          const nearest = findNearestSquare(carried.x, carried.z);
          const inRange =
            nearest.distance <= SNAP_RADIUS &&
            Math.abs(carried.x) <= BOARD_PLAYABLE_HALF + 0.8 &&
            Math.abs(carried.z) <= BOARD_PLAYABLE_HALF + 0.8;
          if (inRange) {
            dropPreviewMesh.visible = true;
            dropPreviewMesh.position.set(nearest.centerX, 0.035, nearest.centerZ);
            const legal =
              nearest.square !== carried.originSquare &&
              cachedLegalTargets.has(nearest.square);
            dropPreviewMesh.material = legal ? activeValidMat : activeInvalidMat;
            const sqKey = `${carried.id}:${nearest.square}:${legal ? 1 : 0}`;
            if (sqKey !== lastTargetSquareKey) {
              lastTargetSquareKey = sqKey;
              hudDirty = true;
            }
          } else {
            dropPreviewMesh.visible = false;
            if (lastTargetSquareKey !== '') {
              lastTargetSquareKey = '';
              hudDirty = true;
            }
          }
        }
      } else {
        dropPreviewMesh.visible = false;
        if (lastTargetSquareKey !== '') {
          lastTargetSquareKey = '';
        }
      }

      // Highlight king square + base in red whenever a king is in check or checkmate
      const checkedKing = engine.getCheckedKingSquare();
      if (checkedKing) {
        const kPos = squareToWorld(checkedKing.square);
        checkHighlightGroup.position.set(kPos.x, 0, kPos.z);
        checkHighlightGroup.visible = true;
        const pulse = checkedKing.isCheckmate ? 1 : 0.78 + 0.22 * Math.sin(elapsed * 5.2);
        checkSquareFillMat.opacity = checkedKing.isCheckmate ? 0.52 : 0.36 * pulse;
        checkBaseRingMat.opacity = checkedKing.isCheckmate ? 0.96 : 0.74 + 0.2 * pulse;
      } else {
        checkHighlightGroup.visible = false;
      }

      // Update pooled particles in-place
      let anyParticle = false;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        if (!p.active) {
          _dummy.position.set(0, -50, 0);
          _dummy.scale.setScalar(0.001);
          _dummy.updateMatrix();
          particleMesh.setMatrixAt(i, _dummy.matrix);
          continue;
        }
        anyParticle = true;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.vy -= 14 * dt;
        p.x += p.vx * dt;
        p.y = Math.max(0.05, p.y + p.vy * dt);
        p.z += p.vz * dt;
        const fade = 1 - p.life / p.maxLife;
        _dummy.position.set(p.x, p.y, p.z);
        _dummy.rotation.set(p.life * 4, p.life * 3, 0);
        _dummy.scale.setScalar(p.scale * fade);
        _dummy.updateMatrix();
        particleMesh.setMatrixAt(i, _dummy.matrix);
      }
      if (anyParticle) {
        particleMesh.instanceMatrix.needsUpdate = true;
      }

      emitHud(false);
      renderer?.render(scene, camera);

      scheduleNextTick();
    }

    // Verify all essential systems are active before declaring 100% ready
    const systemsReady =
      Boolean(renderer) &&
      Boolean(scene) &&
      Boolean(camera) &&
      Boolean(boardGroup) &&
      pieceMeshes.size >= 32 &&
      Boolean(whiteRig) &&
      Boolean(blackRig) &&
      verifyWorldIntegrity(world, engine) &&
      Boolean(aiController) &&
      world.characters.w.punchesRemaining === MAX_PUNCHES_PER_SEQUENCE &&
      Boolean(cleanupListeners);
    if (!systemsReady) {
      throw new Error('Nem todos os sistemas da arena 3D foram inicializados corretamente.');
    }

    // Initial render guarantees GPU/WebGL resources are drawn before announcing 100% ready
    updateCharacterRigAnimation(whiteRig, world.characters.w, elapsed);
    updateCharacterRigAnimation(blackRig, world.characters.b, elapsed);
    renderer.render(scene, camera);

    emitLoadState(advanceLoadingStage(loadState, 'ready'));
    callbacksRef.current.onSceneReady?.();

    scheduleNextTick();
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Falha ao carregar os recursos 3D da arena.';
        emitLoadState(failLoadingState(loadState, message));
        controllerRef.current = {
          resetMatch: () => {},
          enableMouseLock: () => {},
          unlockMouseLock: () => {},
          toggleMouseLock: () => {},
          toggleObserverMode: () => {},
          setObserverMode: () => {},
          cycleFocusTarget: () => {},
          choosePromotion: () => {},
          reinitialize: () => setInitAttempt((n) => n + 1),
        };
      }
    };

    void runInitPipeline();

    return () => {
      disposed = true;
      clearScheduledTick();
      cleanupListeners?.();
      aiController?.dispose();

      envRT?.dispose();
      if (assets) {
        for (const d of assets.disposables) {
          d.dispose();
        }
      }
      if (renderer) {
        const domEl = renderer.domElement;
        renderer.dispose();
        if (domEl.parentElement === container) {
          container.removeChild(domEl);
        }
      }
      applyGraphicsRef.current = null;
      controllerRef.current = null;
    };
  }, [controllerRef, initAttempt]);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full" />;
}

export default ChessArena;
