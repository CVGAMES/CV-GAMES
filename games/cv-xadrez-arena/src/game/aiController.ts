import {
  AI_COMBAT_PROFILES,
  BOARD_WALK_HALF,
  CHARACTER_RADIUS,
  GRAPPLE_MAX_RANGE,
  PIECE_COLLISION_RADIUS,
  PUNCH_COOLDOWN,
  PUNCH_MAX_CENTER_DIST,
  SQUARE_SIZE,
  squareToWorld,
  type AiDifficulty,
  type PieceType,
  type PlayerColor,
} from './constants';
import { chooseBestMove, type AiMoveChoice } from './chessAi';
import type { ChessMatchEngine } from './chessRules';
import type { CharacterInput, PiecePhysicsState, WorldPhysicsState } from './physics';
import { normalizeAngle } from './cameraMath';

interface ChessAiSearchResponse {
  id: number;
  choice: AiMoveChoice | null;
  error?: string;
}

export type AiExecutionPhase =
  | 'idle'
  | 'thinking'
  | 'approaching'
  | 'grabbing'
  | 'carrying'
  | 'placing'
  | 'combat_approach'
  | 'combat_attack'
  | 'combat_grapple';

export interface PlannedAiMove {
  from: string;
  to: string;
  san: string;
  pieceId: string;
  promotion?: Exclude<PieceType, 'p' | 'k'>;
}

const IDLE_INPUT: CharacterInput = {
  moveForward: 0,
  moveRight: 0,
  jumpPressed: false,
  jumpHeld: false,
  sprintHeld: false,
  leftHandHeld: false,
  rightHandHeld: false,
  leftPunchPressed: false,
  rightPunchPressed: false,
};

function worldDirToCameraRelativeInput(
  dirX: number,
  dirZ: number,
  cameraYaw: number,
): { moveForward: number; moveRight: number } {
  const refForwardX = -Math.sin(cameraYaw);
  const refForwardZ = -Math.cos(cameraYaw);
  const refRightX = -refForwardZ;
  const refRightZ = refForwardX;

  const moveForward = dirX * refForwardX + dirZ * refForwardZ;
  const moveRight = dirX * refRightX + dirZ * refRightZ;
  return {
    moveForward: Math.max(-1, Math.min(1, moveForward)),
    moveRight: Math.max(-1, Math.min(1, moveRight)),
  };
}


function clampToBoard(v: number): number {
  return Math.max(-BOARD_WALK_HALF + 0.5, Math.min(BOARD_WALK_HALF - 0.5, v));
}

function computeAvoidanceSteering(
  charX: number,
  charZ: number,
  targetX: number,
  targetZ: number,
  world: WorldPhysicsState,
  ignorePieceId: string,
  avoidOpponentColor?: PlayerColor,
): { x: number; z: number; blockedAhead: boolean } {
  const toX = targetX - charX;
  const toZ = targetZ - charZ;
  const distToTarget = Math.hypot(toX, toZ);
  if (distToTarget < 1e-4) {
    return { x: 0, z: 0, blockedAhead: false };
  }

  const desiredX = toX / distToTarget;
  const desiredZ = toZ / distToTarget;

  let steerX = desiredX;
  let steerZ = desiredZ;
  let blockedAhead = false;

  // Avoid standing chess pieces along the path
  for (const piece of world.pieces.values()) {
    if (piece.captured || piece.fallingFromDrop || piece.id === ignorePieceId) continue;
    const dx = charX - piece.x;
    const dz = charZ - piece.z;
    const dist = Math.hypot(dx, dz);
    const safeRad = CHARACTER_RADIUS + PIECE_COLLISION_RADIUS[piece.type] + 0.72;
    if (dist < safeRad && dist > 1e-4) {
      const awayX = dx / dist;
      const awayZ = dz / dist;
      const weight = ((safeRad - dist) / safeRad) * 1.85;
      // Add perpendicular tangential component so character slides around rather than stopping dead
      const cross = awayX * desiredZ - awayZ * desiredX;
      const sideSign = cross >= 0 ? 1 : -1;
      const tangX = -awayZ * sideSign;
      const tangZ = awayX * sideSign;

      steerX += (awayX * 0.65 + tangX * 0.9) * weight;
      steerZ += (awayZ * 0.65 + tangZ * 0.9) * weight;
      if (-(awayX * desiredX + awayZ * desiredZ) > 0.45) {
        blockedAhead = true;
      }
    }
  }

  // Optionally avoid colliding head-on with human character when carrying/navigating chess pieces
  if (avoidOpponentColor) {
    const opp = world.characters[avoidOpponentColor];
    const dxO = charX - opp.x;
    const dzO = charZ - opp.z;
    const distO = Math.hypot(dxO, dzO);
    const safeCharDist = CHARACTER_RADIUS * 2.8;
    if (distO < safeCharDist && distO > 1e-4) {
      const awayX = dxO / distO;
      const awayZ = dzO / distO;
      const weight = ((safeCharDist - distO) / safeCharDist) * 1.4;
      const tangX = -awayZ;
      const tangZ = awayX;
      steerX += (awayX * 0.5 + tangX * 0.85) * weight;
      steerZ += (awayZ * 0.5 + tangZ * 0.85) * weight;
    }
  }

  const len = Math.hypot(steerX, steerZ);
  if (len > 1e-4) {
    steerX /= len;
    steerZ /= len;
  } else {
    steerX = desiredX;
    steerZ = desiredZ;
  }

  return { x: steerX, z: steerZ, blockedAhead };
}

/**
 * Drives the AI-controlled character autonomously:
 * 1) On AI's chess turn: prioritizes physically walking, grabbing, carrying, and legally placing chess pieces.
 * 2) On Human's chess turn: performs controlled, difficulty-balanced combat decisions (approaching, punching, pushing)
 *    using the exact same 5-punch / 10-second cooldown and hitbox physics as the human player.
 */
export class AiOpponentController {
  public phase: AiExecutionPhase = 'idle';
  public plannedMove: PlannedAiMove | null = null;
  public aiColor: PlayerColor = 'b';
  private thinkTimer = 0;
  private phaseTimer = 0;
  private jumpCooldown = 0;
  private chessAiWorker: Worker | null = null;
  private chessAiRequestId = 0;
  private chessAiSearchFen: string | null = null;
  private chessAiSearchDifficulty: AiDifficulty = 1;
  private chessAiSearchPending = false;
  private chessAiSearchResult: { fen: string; choice: AiMoveChoice | null } | null = null;
  private chessAiSearchRng: (() => number) | null = null;

  // Combat state machine fields
  private combatRestTimer = 3.5;
  private combatReactionTimer = 0;
  private combatBurstRemaining = 0;
  private combatBurstTimer = 0;
  private combatNextSide: 'left' | 'right' = 'left';
  private combatEngageTimer = 0;
  private combatWillGrapple = false;
  private grappleHoldTimer = 0;
  private grappleDragAngle = 0;

  constructor(aiColor: PlayerColor = 'b') {
    this.aiColor = aiColor;
  }

  setAiColor(color: PlayerColor): void {
    this.aiColor = color;
  }

  private clearChessSearch(terminateWorker = false): void {
    if (this.chessAiSearchPending || this.chessAiSearchFen || this.chessAiSearchResult) {
      this.chessAiRequestId += 1;
    }
    this.chessAiSearchFen = null;
    this.chessAiSearchPending = false;
    this.chessAiSearchResult = null;
    this.chessAiSearchRng = null;
    if (terminateWorker) {
      this.chessAiWorker?.terminate();
      this.chessAiWorker = null;
    }
  }

  private fallbackChessSearch(fen: string, difficulty: AiDifficulty, rng: () => number): void {
    this.chessAiSearchPending = false;
    this.chessAiSearchResult = {
      fen,
      choice: chooseBestMove(fen, difficulty, rng),
    };
  }

  private startChessSearch(fen: string, difficulty: AiDifficulty, rng: () => number): void {
    this.chessAiRequestId += 1;
    const requestId = this.chessAiRequestId;
    this.chessAiSearchFen = fen;
    this.chessAiSearchDifficulty = difficulty;
    this.chessAiSearchPending = true;
    this.chessAiSearchResult = null;
    this.chessAiSearchRng = rng;

    if (typeof Worker === 'undefined') {
      this.fallbackChessSearch(fen, difficulty, rng);
      return;
    }

    try {
      if (!this.chessAiWorker) {
        const worker = new Worker(new URL('./chessAiWorker.ts', import.meta.url), {
          type: 'module',
        });
        worker.addEventListener('message', (event: MessageEvent<ChessAiSearchResponse>) => {
          if (this.chessAiWorker !== worker || event.data.id !== this.chessAiRequestId) return;
          this.chessAiSearchPending = false;
          if (event.data.error) {
            console.warn('A busca da IA falhou no worker; usando o modo de compatibilidade.', event.data.error);
            this.fallbackChessSearch(
              this.chessAiSearchFen ?? fen,
              this.chessAiSearchDifficulty,
              this.chessAiSearchRng ?? Math.random,
            );
            return;
          }
          this.chessAiSearchResult = {
            fen: this.chessAiSearchFen ?? fen,
            choice: event.data.choice,
          };
        });
        worker.addEventListener('error', () => {
          if (this.chessAiWorker !== worker) return;
          const searchFen = this.chessAiSearchFen;
          const searchDifficulty = this.chessAiSearchDifficulty;
          const searchRng = this.chessAiSearchRng ?? Math.random;
          worker.terminate();
          this.chessAiWorker = null;
          if (searchFen) this.fallbackChessSearch(searchFen, searchDifficulty, searchRng);
        });
        this.chessAiWorker = worker;
      }

      this.chessAiWorker.postMessage({
        id: requestId,
        fen,
        difficulty,
        randomSeed: Math.floor(rng() * 0x1_0000_0000) >>> 0,
      });
    } catch (error) {
      console.warn('Não foi possível iniciar o worker da IA; usando o modo de compatibilidade.', error);
      this.fallbackChessSearch(fen, difficulty, rng);
    }
  }

  reset(aiColor?: PlayerColor, initialCombatDelay = 3.2): void {
    this.clearChessSearch(true);
    if (aiColor) {
      this.aiColor = aiColor;
    }
    this.phase = 'idle';
    this.plannedMove = null;
    this.thinkTimer = 0;
    this.phaseTimer = 0;
    this.jumpCooldown = 0;
    this.combatRestTimer = initialCombatDelay;
    this.combatReactionTimer = 0;
    this.combatBurstRemaining = 0;
    this.combatBurstTimer = 0;
    this.combatNextSide = 'left';
    this.combatEngageTimer = 0;
    this.combatWillGrapple = false;
    this.grappleHoldTimer = 0;
    this.grappleDragAngle = 0;
  }

  dispose(): void {
    this.clearChessSearch(true);
  }

  getPendingPromotionChoice(): Exclude<PieceType, 'p' | 'k'> {
    return this.plannedMove?.promotion ?? 'q';
  }

  private resetChessTurnState(): void {
    this.clearChessSearch();
    this.plannedMove = null;
    this.thinkTimer = 0;
    this.phaseTimer = 0;
    if (
      this.phase === 'thinking' ||
      this.phase === 'approaching' ||
      this.phase === 'grabbing' ||
      this.phase === 'carrying' ||
      this.phase === 'placing'
    ) {
      this.phase = 'idle';
    }
  }

  private stepCombatDuringHumanTurn(
    world: WorldPhysicsState,
    difficulty: AiDifficulty,
    cameraYaw: number,
    dt: number,
    rng: () => number,
  ): CharacterInput {
    const profile = AI_COMBAT_PROFILES[difficulty];
    const aiChar = world.characters[this.aiColor];
    const humanColor: PlayerColor = this.aiColor === 'w' ? 'b' : 'w';
    const humanChar = world.characters[humanColor];

    // Update combat timers
    this.combatRestTimer = Math.max(0, this.combatRestTimer - dt);
    this.combatBurstTimer = Math.max(0, this.combatBurstTimer - dt);

    // If AI is currently actively grappling the human, maintain drag until hold timer or energy limit
    if (aiChar.grappleTargetColor === humanColor) {
      this.phase = 'combat_grapple';
      this.grappleHoldTimer -= dt;
      if (this.grappleHoldTimer <= 0) {
        this.phase = 'idle';
        this.combatWillGrapple = false;
        this.combatRestTimer =
          profile.minIntervalSec +
          rng() * (profile.maxIntervalSec - profile.minIntervalSec);
        return IDLE_INPUT;
      }

      // Drag human toward AI's side / away from human's pieces smoothly avoiding obstacles
      const dragTargetX = Math.max(-12, Math.min(12, Math.sin(this.grappleDragAngle) * 9));
      const dragTargetZ = this.aiColor === 'b' ? -8.5 : 8.5;
      const steer = computeAvoidanceSteering(
        aiChar.x,
        aiChar.z,
        dragTargetX,
        dragTargetZ,
        world,
        '',
        undefined,
      );
      const rel = worldDirToCameraRelativeInput(steer.x, steer.z, cameraYaw);
      return {
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        jumpPressed: false,
        jumpHeld: false,
        sprintHeld: false,
        leftHandHeld: true,
        rightHandHeld: true,
        grappleHeld: true,
      };
    }

    // If AI is out of punches/energy or on 10s recharge, wait calmly near its side of the board
    if (aiChar.punchesRemaining <= 0 || aiChar.punchSequenceCooldown > 0) {
      this.phase = 'idle';
      this.combatBurstRemaining = 0;
      this.combatEngageTimer = 0;
      this.combatWillGrapple = false;
      return this.stepPatrolWait(aiChar, world, cameraYaw, humanColor);
    }

    // If human is currently knocked down, don't camp/spam over them; back off into rest cooldown
    if (humanChar.isKnockedDown || humanChar.stunTimer > 0.35) {
      if (
        this.phase === 'combat_approach' ||
        this.phase === 'combat_attack' ||
        this.phase === 'combat_grapple'
      ) {
        this.phase = 'idle';
        this.combatBurstRemaining = 0;
        this.combatWillGrapple = false;
        this.combatRestTimer =
          profile.minIntervalSec +
          rng() * (profile.maxIntervalSec - profile.minIntervalSec);
      }
      return this.stepPatrolWait(aiChar, world, cameraYaw, humanColor);
    }

    const dxH = humanChar.x - aiChar.x;
    const dzH = humanChar.z - aiChar.z;
    const distToHuman = Math.hypot(dxH, dzH);
    const humanCarrying = Boolean(
      humanChar.leftHand.grabbedPieceId || humanChar.rightHand.grabbedPieceId,
    );

    // Check if human is looking away / distracted (Level 4 exploits this intelligently)
    const humanFwdX = Math.sin(humanChar.yaw);
    const humanFwdZ = Math.cos(humanChar.yaw);
    const toAiFromHumanDot =
      distToHuman > 1e-4
        ? ((-dxH / distToHuman) * humanFwdX + (-dzH / distToHuman) * humanFwdZ)
        : 1;
    const humanDistracted = toAiFromHumanDot < 0.25 || humanCarrying;

    // Decide whether to initiate a combat engagement if currently idle
    if (this.phase === 'idle') {
      if (this.combatRestTimer > 0) {
        return this.stepPatrolWait(aiChar, world, cameraYaw, humanColor);
      }

      const effectiveRange = humanCarrying
        ? profile.engageDistance + 3.5
        : profile.engageDistance;
      if (distToHuman > effectiveRange) {
        return this.stepPatrolWait(aiChar, world, cameraYaw, humanColor);
      }

      let triggerChance = profile.aggression;
      if (humanCarrying) {
        triggerChance = Math.max(triggerChance, profile.interruptCarryChance);
      }
      if (difficulty === 4 && humanDistracted) {
        triggerChance = Math.min(0.95, triggerChance + 0.15);
      }
      if (distToHuman <= 2.9) {
        triggerChance = Math.min(0.95, triggerChance + 0.2);
      }

      if (rng() > triggerChance) {
        // Decide not to engage right now; check again after a short pause
        this.combatRestTimer = 1.6 + rng() * 1.8;
        return IDLE_INPUT;
      }

      this.phase = 'combat_approach';
      this.combatReactionTimer = profile.reactionDelaySec * (0.75 + rng() * 0.5);
      const maxBurst = Math.min(aiChar.punchesRemaining, profile.maxBurstPunches);
      this.combatBurstRemaining =
        maxBurst <= 1 ? 1 : 1 + Math.floor(rng() * maxBurst);
      if (humanCarrying && difficulty >= 3) {
        this.combatBurstRemaining = Math.min(aiChar.punchesRemaining, 3);
      }

      // Decide whether this engagement uses grappling (scaled by difficulty & available combat charges)
      const canGrapple =
        aiChar.punchesRemaining > 0 &&
        aiChar.punchSequenceCooldown <= 0 &&
        humanChar.grappleEscapeCooldown <= 0;
      let grappleRollChance = profile.grappleChance;
      if (humanCarrying && difficulty >= 3) {
        grappleRollChance = Math.min(0.75, grappleRollChance + 0.18);
      }
      this.combatWillGrapple = canGrapple && rng() < grappleRollChance;
      this.grappleHoldTimer =
        profile.grappleHoldMinSec +
        rng() * (profile.grappleHoldMaxSec - profile.grappleHoldMinSec);
      this.grappleDragAngle = (rng() - 0.5) * 2.2;

      this.combatEngageTimer = 0;
      this.combatNextSide = rng() < 0.5 ? 'left' : 'right';
    }

    // Reaction delay before moving/punching/grappling
    if (this.combatReactionTimer > 0) {
      this.combatReactionTimer = Math.max(0, this.combatReactionTimer - dt);
      return IDLE_INPUT;
    }

    this.combatEngageTimer += dt;
    // Never chase forever; abort engagement if taking too long so AI doesn't obsess over combat
    if (this.combatEngageTimer > 4.2 || (!this.combatWillGrapple && this.combatBurstRemaining <= 0)) {
      this.phase = 'idle';
      this.combatBurstRemaining = 0;
      this.combatWillGrapple = false;
      this.combatRestTimer =
        profile.minIntervalSec +
        rng() * (profile.maxIntervalSec - profile.minIntervalSec);
      return IDLE_INPUT;
    }

    // Attempt grapple if chosen and within grappling range
    if (
      this.combatWillGrapple &&
      distToHuman <= GRAPPLE_MAX_RANGE - 0.15 &&
      aiChar.punchesRemaining > 0 &&
      aiChar.punchSequenceCooldown <= 0 &&
      humanChar.grappleEscapeCooldown <= 0
    ) {
      this.phase = 'combat_grapple';
      const aimAngle = Math.atan2(dxH, dzH);
      const yawError = Math.abs(normalizeAngle(aimAngle - aiChar.yaw));
      const rel = worldDirToCameraRelativeInput(
        (dxH / (distToHuman || 1)) * (yawError > 0.3 ? 0.5 : 0.25),
        (dzH / (distToHuman || 1)) * (yawError > 0.3 ? 0.5 : 0.25),
        cameraYaw,
      );

      // Extra Difícil (Lvl 4) may throw one quick punch before locking the grab if close
      if (difficulty === 4 && this.combatBurstRemaining > 0 && aiChar.punchesRemaining >= 4 && rng() < 0.35) {
        this.combatBurstRemaining = 0;
        return {
          ...IDLE_INPUT,
          moveForward: rel.moveForward,
          moveRight: rel.moveRight,
          leftHandHeld: true,
          leftPunchPressed: true,
        };
      }

      return {
        ...IDLE_INPUT,
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        leftHandHeld: true,
        rightHandHeld: true,
        grappleHeld: true,
      };
    }

    const desiredStrikeDist = 1.85;
    if (!this.combatWillGrapple && distToHuman <= PUNCH_MAX_CENTER_DIST - 0.55) {
      this.phase = 'combat_attack';

      // Face the human before striking (with occasional misaim on lower difficulties)
      const aimAngle = Math.atan2(dxH, dzH);
      const yawError = Math.abs(normalizeAngle(aimAngle - aiChar.yaw));

      // Step closer / align toward human
      const moveScale = distToHuman > desiredStrikeDist ? 0.85 : yawError > 0.35 ? 0.35 : 0.08;
      const steerDirX = distToHuman > 1e-4 ? (dxH / distToHuman) * moveScale : 0;
      const steerDirZ = distToHuman > 1e-4 ? (dzH / distToHuman) * moveScale : 0;
      const rel = worldDirToCameraRelativeInput(steerDirX, steerDirZ, cameraYaw);

      const handReady =
        this.combatNextSide === 'left'
          ? aiChar.leftHand.punchCooldown <= 0 && aiChar.leftHand.punchTimer <= 0
          : aiChar.rightHand.punchCooldown <= 0 && aiChar.rightHand.punchTimer <= 0;

      if (
        this.combatBurstTimer <= 0 &&
        handReady &&
        yawError < 0.72 &&
        aiChar.punchesRemaining > 0 &&
        aiChar.punchSequenceCooldown <= 0
      ) {
        // Occasional mistake at Level 1-2: hesitate or swing slightly out of optimal timing
        const makeMistake = rng() < profile.mistakeRate;
        if (makeMistake) {
          this.combatBurstTimer = 0.55;
          if (rng() < 0.45) {
            this.combatBurstRemaining -= 1;
            return IDLE_INPUT;
          }
        }

        const useLeft = this.combatNextSide === 'left';
        this.combatNextSide = useLeft ? 'right' : 'left';
        this.combatBurstRemaining -= 1;
        this.combatBurstTimer = PUNCH_COOLDOWN + (difficulty <= 2 ? 0.24 : 0.08);

        if (this.combatBurstRemaining <= 0) {
          // Schedule next rest period after completing this burst
          this.combatRestTimer =
            profile.minIntervalSec +
            rng() * (profile.maxIntervalSec - profile.minIntervalSec);
        }

        return {
          moveForward: rel.moveForward,
          moveRight: rel.moveRight,
          jumpPressed: false,
          jumpHeld: false,
          sprintHeld: false,
          leftHandHeld: useLeft,
          rightHandHeld: !useLeft,
          leftPunchPressed: useLeft,
          rightPunchPressed: !useLeft,
        };
      }

      return {
        ...IDLE_INPUT,
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
      };
    }

    // Approach human smoothly around chess pieces
    this.phase = 'combat_approach';
    const steer = computeAvoidanceSteering(
      aiChar.x,
      aiChar.z,
      humanChar.x,
      humanChar.z,
      world,
      '',
      undefined,
    );
    const rel = worldDirToCameraRelativeInput(
      steer.x * profile.strafeSpeedScale,
      steer.z * profile.strafeSpeedScale,
      cameraYaw,
    );
    const speed = Math.hypot(aiChar.vx, aiChar.vz);
    const shouldJump =
      (steer.blockedAhead || (this.combatEngageTimer > 1.4 && speed < 1.2)) &&
      aiChar.grounded &&
      this.jumpCooldown <= 0;
    if (shouldJump) this.jumpCooldown = 1.0;

    return {
      moveForward: rel.moveForward,
      moveRight: rel.moveRight,
      jumpPressed: shouldJump,
      jumpHeld: shouldJump,
      sprintHeld: difficulty >= 3 && distToHuman > 5.0,
      leftHandHeld: false,
      rightHandHeld: false,
    };
  }

  private stepPatrolWait(
    aiChar: WorldPhysicsState['characters']['w'],
    world: WorldPhysicsState,
    cameraYaw: number,
    humanColor: PlayerColor,
  ): CharacterInput {
    // Stay reasonably poised on AI's home half of the board without drifting endlessly
    const homeZ = this.aiColor === 'b' ? -6.0 : 6.0;
    const dxHome = 0 - aiChar.x;
    const dzHome = homeZ - aiChar.z;
    const distHome = Math.hypot(dxHome, dzHome);
    if (distHome > 6.5) {
      const steer = computeAvoidanceSteering(
        aiChar.x,
        aiChar.z,
        0,
        homeZ,
        world,
        '',
        humanColor,
      );
      const rel = worldDirToCameraRelativeInput(steer.x * 0.6, steer.z * 0.6, cameraYaw);
      return {
        ...IDLE_INPUT,
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
      };
    }
    return IDLE_INPUT;
  }

  step(
    world: WorldPhysicsState,
    engine: ChessMatchEngine,
    difficulty: AiDifficulty,
    cameraYaw: number,
    dt: number,
    rng: () => number = Math.random,
  ): CharacterInput {
    this.jumpCooldown = Math.max(0, this.jumpCooldown - dt);

    if (engine.getStatus().isGameOver || world.cameraMode !== 'character') {
      if (this.phase !== 'idle') {
        this.resetChessTurnState();
        this.phase = 'idle';
      }
      return IDLE_INPUT;
    }

    // If pawn promotion modal state is open, pause AI inputs cleanly
    if (world.pendingPromotion) {
      return IDLE_INPUT;
    }

    const aiChar = world.characters[this.aiColor];
    const humanColor: PlayerColor = this.aiColor === 'w' ? 'b' : 'w';
    const humanChar = world.characters[humanColor];

    // If AI is currently grabbed by the human, resist and struggle proportionally to difficulty!
    if (aiChar.grabbedByColor) {
      const profile = AI_COMBAT_PROFILES[difficulty];
      const dxAway = aiChar.x - humanChar.x;
      const dzAway = aiChar.z - humanChar.z;
      const dist = Math.hypot(dxAway, dzAway) || 1;
      const rel = worldDirToCameraRelativeInput(
        (dxAway / dist) * (difficulty >= 2 ? 0.9 : 0.4),
        (dzAway / dist) * (difficulty >= 2 ? 0.9 : 0.4),
        cameraYaw,
      );
      const holdingPiece = Boolean(
        aiChar.leftHand.grabbedPieceId || aiChar.rightHand.grabbedPieceId,
      );
      return {
        ...IDLE_INPUT,
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        leftHandHeld: holdingPiece,
        rightHandHeld: holdingPiece,
        grappleResistBoost: profile.grappleResistanceRate,
      };
    }

    // Wait out any residual stun/stumble
    if (aiChar.stunTimer > 0 || aiChar.stumbleTimer > 0) {
      const holdingPiece = Boolean(
        aiChar.leftHand.grabbedPieceId || aiChar.rightHand.grabbedPieceId,
      );
      return {
        ...IDLE_INPUT,
        leftHandHeld: holdingPiece,
        rightHandHeld: holdingPiece,
      };
    }

    // When it is NOT AI's chess turn, run controlled difficulty-balanced combat behavior
    if (engine.getTurn() !== this.aiColor) {
      this.resetChessTurnState();
      return this.stepCombatDuringHumanTurn(world, difficulty, cameraYaw, dt, rng);
    }

    // On AI's chess turn: chess move ALWAYS takes top priority!
    if (
      this.phase === 'idle' ||
      this.phase === 'combat_approach' ||
      this.phase === 'combat_attack' ||
      this.phase === 'combat_grapple'
    ) {
      this.combatWillGrapple = false;
      this.phase = 'thinking';
      this.plannedMove = null;
      this.thinkTimer = difficulty === 1 ? 0.45 : difficulty === 2 ? 0.5 : 0.55;
      this.phaseTimer = 0;
      return IDLE_INPUT;
    }

    this.phaseTimer += dt;

    if (this.phase === 'thinking') {
      this.thinkTimer -= dt;
      // Wait for board pieces to settle from the human's move before computing & moving
      let anySettling = false;
      for (const p of world.pieces.values()) {
        if (p.settlingTarget || p.fallingFromDrop) {
          anySettling = true;
          break;
        }
      }
      if (this.thinkTimer > 0 || anySettling) {
        return IDLE_INPUT;
      }

      const fen = engine.getFen();
      if (this.chessAiSearchFen !== fen) {
        this.clearChessSearch();
        this.startChessSearch(fen, difficulty, rng);
        return IDLE_INPUT;
      }
      if (this.chessAiSearchPending || !this.chessAiSearchResult) {
        return IDLE_INPUT;
      }

      const choice = this.chessAiSearchResult.choice;
      this.chessAiSearchResult = null;
      this.chessAiSearchFen = null;
      this.chessAiSearchRng = null;
      if (!choice) {
        this.resetChessTurnState();
        return IDLE_INPUT;
      }

      const pieceRec = engine.getPieceAt(choice.from);
      const piecePhys = pieceRec ? world.pieces.get(pieceRec.id) : undefined;
      if (!pieceRec || !piecePhys || piecePhys.captured) {
        this.resetChessTurnState();
        return IDLE_INPUT;
      }

      this.plannedMove = {
        from: choice.from,
        to: choice.to,
        san: choice.san,
        pieceId: pieceRec.id,
        promotion: choice.promotion,
      };
      this.phase = 'approaching';
      this.phaseTimer = 0;
      return IDLE_INPUT;
    }

    if (!this.plannedMove) {
      this.resetChessTurnState();
      return IDLE_INPUT;
    }

    const targetPiece: PiecePhysicsState | undefined = world.pieces.get(this.plannedMove.pieceId);
    if (!targetPiece || targetPiece.captured) {
      this.resetChessTurnState();
      return IDLE_INPUT;
    }

    if (this.phase === 'approaching') {
      const toCenter = squareToWorld(this.plannedMove.to);
      // Stand behind the piece relative to the destination square so carrying starts naturally facing forward
      const toDestX = toCenter.x - targetPiece.x;
      const toDestZ = toCenter.z - targetPiece.z;
      const toDestLen = Math.hypot(toDestX, toDestZ) || 1;
      const dirX = toDestX / toDestLen;
      const dirZ = toDestZ / toDestLen;

      const approachX = clampToBoard(targetPiece.x - dirX * 1.38);
      const approachZ = clampToBoard(targetPiece.z - dirZ * 1.38);

      const distToPiece = Math.hypot(targetPiece.x - aiChar.x, targetPiece.z - aiChar.z);
      const distToApproach = Math.hypot(approachX - aiChar.x, approachZ - aiChar.z);

      // Occasional quick defensive punch if human blocks right in front of AI while approaching (Lvl 2+)
      const humanChar = world.characters[humanColor];
      const dxH = humanChar.x - aiChar.x;
      const dzH = humanChar.z - aiChar.z;
      const distToHuman = Math.hypot(dxH, dzH);
      if (
        difficulty >= 2 &&
        distToHuman < 2.25 &&
        !humanChar.isKnockedDown &&
        humanChar.stunTimer <= 0 &&
        aiChar.punchesRemaining > 0 &&
        aiChar.punchSequenceCooldown <= 0 &&
        aiChar.leftHand.punchCooldown <= 0 &&
        this.combatRestTimer <= 0 &&
        rng() < AI_COMBAT_PROFILES[difficulty].aggression * 0.35
      ) {
        this.combatRestTimer = AI_COMBAT_PROFILES[difficulty].minIntervalSec;
        const relH = worldDirToCameraRelativeInput(dxH / (distToHuman || 1), dzH / (distToHuman || 1), cameraYaw);
        return {
          moveForward: relH.moveForward * 0.3,
          moveRight: relH.moveRight * 0.3,
          jumpPressed: false,
          jumpHeld: false,
          sprintHeld: false,
          leftHandHeld: true,
          rightHandHeld: false,
          leftPunchPressed: true,
          rightPunchPressed: false,
        };
      }

      // Transition to grabbing once close enough to the piece and facing toward it
      if (distToApproach < 0.72 || (distToPiece <= 1.85 && distToApproach < 1.15)) {
        this.phase = 'grabbing';
        this.phaseTimer = 0;
        return IDLE_INPUT;
      }

      // Anti-stuck recovery if path is crowded for too long
      if (this.phaseTimer > 6.5) {
        aiChar.x = approachX;
        aiChar.z = approachZ;
        aiChar.vx = 0;
        aiChar.vz = 0;
        this.phase = 'grabbing';
        this.phaseTimer = 0;
        return IDLE_INPUT;
      }

      const steer = computeAvoidanceSteering(
        aiChar.x,
        aiChar.z,
        approachX,
        approachZ,
        world,
        targetPiece.id,
        humanColor,
      );
      const rel = worldDirToCameraRelativeInput(steer.x, steer.z, cameraYaw);
      const speed = Math.hypot(aiChar.vx, aiChar.vz);
      const shouldJump =
        (steer.blockedAhead || (this.phaseTimer > 1.8 && speed < 1.4)) &&
        aiChar.grounded &&
        this.jumpCooldown <= 0;
      if (shouldJump) this.jumpCooldown = 0.9;

      return {
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        jumpPressed: shouldJump,
        jumpHeld: shouldJump,
        sprintHeld: distToApproach > 5.0,
        leftHandHeld: false,
        rightHandHeld: false,
      };
    }

    if (this.phase === 'grabbing') {
      const dx = targetPiece.x - aiChar.x;
      const dz = targetPiece.z - aiChar.z;
      const dist = Math.hypot(dx, dz) || 1;
      const desiredYaw = Math.atan2(dx, dz);
      const yawDiff = Math.abs(normalizeAngle(desiredYaw - aiChar.yaw));

      const leftGrabbed = aiChar.leftHand.grabbedPieceId === targetPiece.id;
      const rightGrabbed = aiChar.rightHand.grabbedPieceId === targetPiece.id;

      if (leftGrabbed && rightGrabbed) {
        this.phase = 'carrying';
        this.phaseTimer = 0;
        return {
          ...IDLE_INPUT,
          leftHandHeld: true,
          rightHandHeld: true,
        };
      }

      // If at least one hand grabbed and we waited a beat for the second hand, proceed carrying
      if ((leftGrabbed || rightGrabbed) && this.phaseTimer > 0.38) {
        this.phase = 'carrying';
        this.phaseTimer = 0;
        return {
          ...IDLE_INPUT,
          leftHandHeld: leftGrabbed,
          rightHandHeld: rightGrabbed,
        };
      }

      // Safety repositioning if too far or blocked while trying to grab
      if (this.phaseTimer > 2.4 && !leftGrabbed && !rightGrabbed) {
        const dirX = dx / dist;
        const dirZ = dz / dist;
        aiChar.x = clampToBoard(targetPiece.x - dirX * 1.25);
        aiChar.z = clampToBoard(targetPiece.z - dirZ * 1.25);
        aiChar.yaw = desiredYaw;
      }

      // Apply subtle alignment step toward piece so character yaw smoothly faces it while reaching
      const stepScale = dist > 1.48 ? 0.55 : yawDiff > 0.14 ? 0.22 : 0;
      const rel =
        stepScale > 0
          ? worldDirToCameraRelativeInput((dx / dist) * stepScale, (dz / dist) * stepScale, cameraYaw)
          : { moveForward: 0, moveRight: 0 };

      return {
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        jumpPressed: false,
        jumpHeld: false,
        sprintHeld: false,
        leftHandHeld: true,
        rightHandHeld: true,
      };
    }

    if (this.phase === 'carrying') {
      const leftHolding = aiChar.leftHand.grabbedPieceId === targetPiece.id;
      const rightHolding = aiChar.rightHand.grabbedPieceId === targetPiece.id;

      // If piece somehow slipped before arriving, go back to approaching
      if (!leftHolding && !rightHolding) {
        this.phase = 'approaching';
        this.phaseTimer = 0;
        return IDLE_INPUT;
      }

      const toCenter = squareToWorld(this.plannedMove.to);
      const pieceToTargetX = toCenter.x - targetPiece.x;
      const pieceToTargetZ = toCenter.z - targetPiece.z;
      const pieceDist = Math.hypot(pieceToTargetX, pieceToTargetZ);

      // Ready to release cleanly over the legal target square!
      if (pieceDist <= 0.68 && Math.hypot(targetPiece.vx, targetPiece.vz) < 6.5) {
        this.phase = 'placing';
        this.phaseTimer = 0;
        return {
          ...IDLE_INPUT,
          leftHandHeld: leftHolding,
          rightHandHeld: rightHolding,
        };
      }

      // Compute stand position so carried piece (held 1.48 units ahead of aiChar) aligns onto toCenter
      const charToDestX = toCenter.x - aiChar.x;
      const charToDestZ = toCenter.z - aiChar.z;
      const charToDestLen = Math.hypot(charToDestX, charToDestZ) || 1;
      const approachDirX = charToDestX / charToDestLen;
      const approachDirZ = charToDestZ / charToDestLen;

      const standX = clampToBoard(toCenter.x - approachDirX * 1.44);
      const standZ = clampToBoard(toCenter.z - approachDirZ * 1.44);

      // Watchdog anti-stuck guarantee
      if (this.phaseTimer > 7.5) {
        aiChar.x = standX;
        aiChar.z = standZ;
        aiChar.yaw = Math.atan2(approachDirX, approachDirZ);
        aiChar.vx = 0;
        aiChar.vz = 0;
        targetPiece.x = toCenter.x;
        targetPiece.z = toCenter.z;
        targetPiece.vx = 0;
        targetPiece.vz = 0;
        this.phase = 'placing';
        this.phaseTimer = 0;
        return {
          ...IDLE_INPUT,
          leftHandHeld: leftHolding,
          rightHandHeld: rightHolding,
        };
      }

      // When very close to target, steer precisely toward stand point without obstacle repulsion jitter
      let moveDirX: number;
      let moveDirZ: number;
      let blockedAhead = false;

      if (pieceDist < SQUARE_SIZE * 0.75) {
        const dx = standX - aiChar.x;
        const dz = standZ - aiChar.z;
        const dLen = Math.hypot(dx, dz) || 1;
        moveDirX = (dx / dLen) * Math.min(1, dLen * 1.1);
        moveDirZ = (dz / dLen) * Math.min(1, dLen * 1.1);
      } else {
        const steer = computeAvoidanceSteering(
          aiChar.x,
          aiChar.z,
          standX,
          standZ,
          world,
          targetPiece.id,
          humanColor,
        );
        moveDirX = steer.x;
        moveDirZ = steer.z;
        blockedAhead = steer.blockedAhead;
      }

      const rel = worldDirToCameraRelativeInput(moveDirX, moveDirZ, cameraYaw);
      const speed = Math.hypot(aiChar.vx, aiChar.vz);
      const shouldJump =
        (blockedAhead || (this.phaseTimer > 2.2 && speed < 1.2 && pieceDist > 2.5)) &&
        aiChar.grounded &&
        this.jumpCooldown <= 0;
      if (shouldJump) this.jumpCooldown = 1.0;

      return {
        moveForward: rel.moveForward,
        moveRight: rel.moveRight,
        jumpPressed: shouldJump,
        jumpHeld: shouldJump,
        sprintHeld: pieceDist > 5.0,
        leftHandHeld: leftHolding,
        rightHandHeld: rightHolding,
      };
    }

    if (this.phase === 'placing') {
      // Release both hands to drop piece onto destination square
      this.resetChessTurnState();
      this.phase = 'idle';
      return {
        ...IDLE_INPUT,
        leftHandHeld: false,
        rightHandHeld: false,
      };
    }

    return IDLE_INPUT;
  }
}
