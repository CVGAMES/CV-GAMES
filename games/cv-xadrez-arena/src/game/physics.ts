import {
  BOARD_PLAYABLE_HALF,
  BOARD_RIM_WIDTH,
  BOARD_SURFACE_Y,
  BOARD_WALK_HALF,
  CHARACTER_RADIUS,
  CHARACTER_REACH_RANGE,
  COMBO_PUNCH_KNOCKBACK,
  COMBO_WINDOW,
  DROP_SQUARE_TOLERANCE,
  ENERGY_PER_PUNCH,
  GRAVITY,
  GRAPPLE_DRAG_SPEED,
  GRAPPLE_ESCAPE_IMMUNITY_SEC,
  GRAPPLE_ESCAPE_TAP_COOLDOWN,
  GRAPPLE_ESCAPE_TAP_GAIN,
  GRAPPLE_HOLD_DISTANCE,
  GRAPPLE_MAX_RANGE,
  GRAPPLE_MAX_STRETCH,
  HAND_GRAB_RADIUS,
  JUMP_SPEED,
  KNOCKDOWN_POST_PROTECTION,
  MAX_COMBAT_ENERGY,
  MAX_PUNCHES_PER_SEQUENCE,
  PIECE_COLLISION_RADIUS,
  PIECE_HEIGHT,
  PIECE_WEIGHT,
  PUNCH_ACTIVE_END,
  PUNCH_COOLDOWN,
  PUNCH_DURATION,
  PUNCH_HIT_RADIUS,
  PUNCH_MAX_CENTER_DIST,
  PUNCH_MIN_FORWARD_DOT,
  PUNCH_REACH,
  PUNCH_SEQUENCE_COOLDOWN,
  PUNCH_WINDUP_END,
  PUSH_REACTION_COOLDOWN,
  SECOND_PUNCH_KNOCKBACK,
  SINGLE_PUNCH_KNOCKBACK,
  SNAP_RADIUS,
  SPRINT_SPEED,
  SQUARE_SIZE,
  STUN_FALL_DURATION,
  STUN_KNOCKDOWN_DURATION,
  STUN_STUMBLE_DURATION,
  WALK_SPEED,
  findNearestSquare,
  squareToWorld,
  type CameraMode,
  type PieceType,
  type PlayerColor,
} from './constants';
import type { ChessMatchEngine, MoveOutcome } from './chessRules';
import { normalizeAngle } from './cameraMath';

export interface HandState {
  reaching: boolean;
  reachBlend: number;
  grabbedPieceId: string | null;
  worldX: number;
  worldY: number;
  worldZ: number;
  punchTimer: number;
  punchCooldown: number;
  punchHitRegistered: boolean;
  prevHeld: boolean;
}

export interface CharacterPhysicsState {
  color: PlayerColor;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  walkCycle: number;
  speedRatio: number;
  leanPitch: number;
  leanRoll: number;
  squashY: number;
  balance: number;
  stumbleTimer: number;
  stumbleTwist: number;
  stunTimer: number;
  pushCooldown: number;
  knockdownProtectionTimer: number;
  isKnockedDown: boolean;
  knockdownBlend: number;
  hitFlashTimer: number;
  comboLastHand: 'left' | 'right' | null;
  comboTimer: number;
  comboHits: number;
  comboTargetColor: PlayerColor | null;
  strongComboCooldown: number;
  combatEnergy: number;
  energyRegenDelay: number;
  punchesRemaining: number;
  punchSequenceCooldown: number;
  grappleTargetColor: PlayerColor | null;
  grabbedByColor: PlayerColor | null;
  grappleDuration: number;
  grappleAttemptTimer: number;
  grappleStruggleMeter: number;
  grappleEscapeCooldown: number;
  grappleTapCooldown: number;
  grappleBreakAnimTimer: number;
  twoHandPieceId: string | null;
  twoHandHitsTaken: number;
  leftHand: HandState;
  rightHand: HandState;
}

export interface PiecePhysicsState {
  id: string;
  color: PlayerColor;
  type: PieceType;
  originSquare: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tiltX: number;
  tiltZ: number;
  heldBy: PlayerColor | null;
  heldHands: number;
  fallingFromDrop: boolean;
  settlingTarget: { x: number; y: number; z: number } | null;
  captured: boolean;
  capturedSlotIndex: number;
}

export interface CharacterInput {
  moveForward: number; // -1..+1 along reference forward
  moveRight: number;   // -1..+1 along reference right
  jumpPressed: boolean;
  jumpHeld: boolean;
  sprintHeld: boolean;
  leftHandHeld: boolean;
  rightHandHeld: boolean;
  leftPunchPressed?: boolean;
  rightPunchPressed?: boolean;
  grappleHeld?: boolean;
  grappleResistBoost?: number;
}

export interface PhysicsEvent {
  type:
    | 'jump'
    | 'land'
    | 'grab'
    | 'release_valid'
    | 'release_invalid'
    | 'capture'
    | 'wrong_turn'
    | 'wrong_color'
    | 'promotion_needed'
    | 'punch_swing'
    | 'punch_hit'
    | 'combat_drop'
    | 'stun_recover'
    | 'grapple_attempt'
    | 'grapple_start'
    | 'grapple_release'
    | 'grapple_break';
  color?: PlayerColor;
  targetColor?: PlayerColor;
  pieceId?: string;
  from?: string;
  to?: string;
  san?: string;
  x?: number;
  z?: number;
  side?: 'left' | 'right';
  knockdown?: boolean;
  combo?: boolean;
  outcome?: MoveOutcome;
}

export interface PendingPromotion {
  pieceId: string;
  color: PlayerColor;
  from: string;
  to: string;
}

export interface WorldPhysicsState {
  characters: Record<PlayerColor, CharacterPhysicsState>;
  pieces: Map<string, PiecePhysicsState>;
  cameraMode: CameraMode;
  pendingPromotion: PendingPromotion | null;
  capturedCount: Record<PlayerColor, number>;
}

function createInitialCharacter(color: PlayerColor): CharacterPhysicsState {
  // Spawn on the open center-ish ranks facing across the board so both sides and pieces are clearly reachable
  const isWhite = color === 'w';
  const startX = isWhite ? 0 : 0;
  const startZ = isWhite ? 6.0 : -6.0;
  const startYaw = isWhite ? Math.PI : 0; // White faces -Z (toward center & black), Black faces +Z
  return {
    color,
    x: startX,
    y: BOARD_SURFACE_Y,
    z: startZ,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: startYaw,
    grounded: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    walkCycle: 0,
    speedRatio: 0,
    leanPitch: 0,
    leanRoll: 0,
    squashY: 1,
    balance: 1.0,
    stumbleTimer: 0,
    stumbleTwist: 0,
    stunTimer: 0,
    pushCooldown: 0,
    knockdownProtectionTimer: 0,
    isKnockedDown: false,
    knockdownBlend: 0,
    hitFlashTimer: 0,
    comboLastHand: null,
    comboTimer: 0,
    comboHits: 0,
    comboTargetColor: null,
    strongComboCooldown: 0,
    combatEnergy: MAX_COMBAT_ENERGY,
    energyRegenDelay: 0,
    punchesRemaining: MAX_PUNCHES_PER_SEQUENCE,
    punchSequenceCooldown: 0,
    grappleTargetColor: null,
    grabbedByColor: null,
    grappleDuration: 0,
    grappleAttemptTimer: 0,
    grappleStruggleMeter: 0,
    grappleEscapeCooldown: 0,
    grappleTapCooldown: 0,
    grappleBreakAnimTimer: 0,
    twoHandPieceId: null,
    twoHandHitsTaken: 0,
    leftHand: {
      reaching: false,
      reachBlend: 0,
      grabbedPieceId: null,
      worldX: startX - 0.55,
      worldY: 1.5,
      worldZ: startZ,
      punchTimer: 0,
      punchCooldown: 0,
      punchHitRegistered: false,
      prevHeld: false,
    },
    rightHand: {
      reaching: false,
      reachBlend: 0,
      grabbedPieceId: null,
      worldX: startX + 0.55,
      worldY: 1.5,
      worldZ: startZ,
      punchTimer: 0,
      punchCooldown: 0,
      punchHitRegistered: false,
      prevHeld: false,
    },
  };
}

export function createWorldPhysics(engine: ChessMatchEngine): WorldPhysicsState {
  const pieces = new Map<string, PiecePhysicsState>();
  for (const rec of engine.getAllPieces()) {
    const pos = squareToWorld(rec.square);
    pieces.set(rec.id, {
      id: rec.id,
      color: rec.color,
      type: rec.type,
      originSquare: rec.square,
      x: pos.x,
      y: BOARD_SURFACE_Y,
      z: pos.z,
      vx: 0,
      vy: 0,
      vz: 0,
      tiltX: 0,
      tiltZ: 0,
      heldBy: null,
      heldHands: 0,
      fallingFromDrop: false,
      settlingTarget: null,
      captured: false,
      capturedSlotIndex: 0,
    });
  }

  return {
    characters: {
      w: createInitialCharacter('w'),
      b: createInitialCharacter('b'),
    },
    pieces,
    cameraMode: 'character',
    pendingPromotion: null,
    capturedCount: { w: 0, b: 0 },
  };
}


function dampValue(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function hasAnyFallingDropPiece(world: WorldPhysicsState): boolean {
  for (const piece of world.pieces.values()) {
    if (piece.fallingFromDrop) return true;
  }
  return false;
}

/**
 * Safely releases any piece currently held by either character (or mid-drop) back to its original square,
 * without registering a move or changing the chess turn.
 */
export function releaseAllHeldPiecesToOrigin(
  world: WorldPhysicsState,
  events: PhysicsEvent[] = [],
): void {
  for (const color of ['w', 'b'] as const) {
    const char = world.characters[color];
    const heldIds = new Set<string>();
    if (char.leftHand.grabbedPieceId) heldIds.add(char.leftHand.grabbedPieceId);
    if (char.rightHand.grabbedPieceId) heldIds.add(char.rightHand.grabbedPieceId);

    char.leftHand.grabbedPieceId = null;
    char.leftHand.reaching = false;
    char.rightHand.grabbedPieceId = null;
    char.rightHand.reaching = false;
    char.twoHandPieceId = null;
    char.twoHandHitsTaken = 0;

    for (const id of heldIds) {
      const piece = world.pieces.get(id);
      if (!piece) continue;
      piece.heldBy = null;
      piece.heldHands = 0;
      piece.fallingFromDrop = false;
      const orig = squareToWorld(piece.originSquare);
      piece.settlingTarget = { x: orig.x, y: BOARD_SURFACE_Y, z: orig.z };
      events.push({
        type: 'release_invalid',
        color,
        pieceId: id,
        from: piece.originSquare,
        to: piece.originSquare,
      });
    }
  }

  for (const piece of world.pieces.values()) {
    if (piece.fallingFromDrop) {
      piece.fallingFromDrop = false;
      piece.vx = 0;
      piece.vy = 0;
      piece.vz = 0;
      const orig = squareToWorld(piece.originSquare);
      piece.settlingTarget = { x: orig.x, y: BOARD_SURFACE_Y, z: orig.z };
      events.push({
        type: 'release_invalid',
        color: piece.color,
        pieceId: piece.id,
        from: piece.originSquare,
        to: piece.originSquare,
      });
    }
  }
}

export function computePunchesFromEnergy(combatEnergy: number): number {
  const clamped = Math.max(0, Math.min(MAX_COMBAT_ENERGY, combatEnergy));
  return Math.max(
    0,
    Math.min(MAX_PUNCHES_PER_SEQUENCE, Math.floor((clamped + 1e-4) / ENERGY_PER_PUNCH)),
  );
}

function syncCombatEnergyFromCharges(char: CharacterPhysicsState): void {
  char.combatEnergy = Math.round(
    (Math.max(0, Math.min(MAX_PUNCHES_PER_SEQUENCE, char.punchesRemaining)) /
      MAX_PUNCHES_PER_SEQUENCE) *
      MAX_COMBAT_ENERGY,
  );
}

function triggerCombatCooldown(char: CharacterPhysicsState): void {
  char.punchesRemaining = 0;
  char.punchSequenceCooldown = PUNCH_SEQUENCE_COOLDOWN;
  char.comboHits = 0;
  char.comboTimer = 0;
  char.comboLastHand = null;
  char.comboTargetColor = null;
  syncCombatEnergyFromCharges(char);
}

export function endGrapplePair(
  world: WorldPhysicsState,
  grabberColor: PlayerColor,
  reason: 'release' | 'break' | 'energy_depleted',
  events: PhysicsEvent[] = [],
): void {
  const grabber = world.characters[grabberColor];
  const victimColor = grabber.grappleTargetColor;
  if (!victimColor) return;
  const victim = world.characters[victimColor];

  grabber.grappleTargetColor = null;
  grabber.grappleDuration = 0;
  grabber.leftHand.reaching = false;
  grabber.rightHand.reaching = false;

  if (victim.grabbedByColor === grabberColor) {
    victim.grabbedByColor = null;
  }
  victim.grappleStruggleMeter = 0;
  victim.grappleTapCooldown = 0;

  const dx = victim.x - grabber.x;
  const dz = victim.z - grabber.z;
  const dist = Math.hypot(dx, dz) || 1;
  const nx = dx / dist;
  const nz = dz / dist;

  if (reason === 'break') {
    victim.grappleEscapeCooldown = GRAPPLE_ESCAPE_IMMUNITY_SEC;
    victim.grappleBreakAnimTimer = 0.36;
    victim.stumbleTimer = Math.max(victim.stumbleTimer, 0.24);
    victim.vx += nx * 3.4;
    victim.vz += nz * 3.4;

    grabber.grappleBreakAnimTimer = 0.42;
    grabber.stumbleTimer = Math.max(grabber.stumbleTimer, 0.34);
    grabber.vx -= nx * 3.2;
    grabber.vz -= nz * 3.2;

    events.push({
      type: 'grapple_break',
      color: grabberColor,
      targetColor: victimColor,
      x: victim.x,
      z: victim.z,
    });
  } else if (reason === 'energy_depleted') {
    grabber.combatEnergy = 0;
    grabber.energyRegenDelay = 0.9;
    grabber.grappleBreakAnimTimer = 0.28;

    victim.grappleBreakAnimTimer = 0.28;
    victim.stumbleTimer = Math.max(victim.stumbleTimer, 0.22);
    victim.vx += nx * 1.8;
    victim.vz += nz * 1.8;

    events.push({
      type: 'grapple_break',
      color: grabberColor,
      targetColor: victimColor,
      x: victim.x,
      z: victim.z,
    });
  } else {
    grabber.energyRegenDelay = Math.max(grabber.energyRegenDelay, 0.45);
    victim.grappleBreakAnimTimer = 0.28;
    victim.stumbleTimer = Math.max(victim.stumbleTimer, 0.22);
    victim.vx += nx * 1.8;
    victim.vz += nz * 1.8;

    events.push({
      type: 'grapple_release',
      color: grabberColor,
      targetColor: victimColor,
      x: victim.x,
      z: victim.z,
    });
  }
}

export function setCameraMode(
  world: WorldPhysicsState,
  nextMode: CameraMode,
  events: PhysicsEvent[] = [],
): void {
  if (world.cameraMode === nextMode) return;
  world.cameraMode = nextMode;
  if (nextMode === 'observer') {
    endGrapplePair(world, 'w', 'release', events);
    endGrapplePair(world, 'b', 'release', events);
    releaseAllHeldPiecesToOrigin(world, events);
    for (const color of ['w', 'b'] as const) {
      const c = world.characters[color];
      c.vx = 0;
      c.vz = 0;
      c.speedRatio = 0;
      c.jumpBufferTimer = 0;
      c.grappleAttemptTimer = 0;
      c.leftHand.punchTimer = 0;
      c.rightHand.punchTimer = 0;
      c.leftHand.prevHeld = false;
      c.rightHand.prevHeld = false;
    }
  }
}

export function getCapturedTrayPosition(
  capturedColor: PlayerColor,
  slotIndex: number,
): { x: number; y: number; z: number } {
  // Place captured pieces neatly on a wooden side ledge beside the board
  const row = Math.floor(slotIndex / 8);
  const col = slotIndex % 8;
  const sideSign = capturedColor === 'w' ? -1 : 1; // White captured pieces go to left ledge, Black to right ledge
  const x = sideSign * (BOARD_WALK_HALF + 2.4 + row * 1.85);
  const z = (col - 3.5) * 2.15;
  return { x, y: -0.25, z };
}

function findGrabbablePieceForCharacter(
  char: CharacterPhysicsState,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  handSide: 'left' | 'right',
  events: PhysicsEvent[],
  emitBlockedEvents = true,
): PiecePhysicsState | null {
  if (world.pendingPromotion || hasAnyFallingDropPiece(world)) return null;

  const forwardX = Math.sin(char.yaw);
  const forwardZ = Math.cos(char.yaw);
  // In +Z forward / +Y up right-handed space, character's LEFT is (+cos(yaw), -sin(yaw))
  const leftX = Math.cos(char.yaw);
  const leftZ = -Math.sin(char.yaw);
  const sideOffset = handSide === 'left' ? 0.45 : -0.45;

  const handAnchorX = char.x + forwardX * 1.15 + leftX * sideOffset;
  const handAnchorZ = char.z + forwardZ * 1.15 + leftZ * sideOffset;

  let bestPiece: PiecePhysicsState | null = null;
  let bestDist = Infinity;
  let blockedReason: 'wrong_turn' | 'wrong_color' | null = null;

  for (const piece of world.pieces.values()) {
    if (piece.captured || piece.fallingFromDrop) continue;
    if (piece.settlingTarget) {
      const orig = squareToWorld(piece.originSquare);
      if (Math.hypot(piece.x - orig.x, piece.z - orig.z) > 0.4) continue;
    }
    const dx = piece.x - handAnchorX;
    const dz = piece.z - handAnchorZ;
    const dy = (piece.y + PIECE_HEIGHT[piece.type] * 0.4) - (char.y + 1.45);
    const distXZ = Math.hypot(dx, dz);
    const dist3D = Math.hypot(dx, dy * 0.65, dz);

    // Must be within character physical reach range and roughly in front/beside the character
    const toPieceX = piece.x - char.x;
    const toPieceZ = piece.z - char.z;
    const charDist = Math.hypot(toPieceX, toPieceZ);
    if (charDist > CHARACTER_REACH_RANGE + PIECE_COLLISION_RADIUS[piece.type] + 0.35) continue;
    if (charDist > 0.25) {
      const forwardDot = (toPieceX * forwardX + toPieceZ * forwardZ) / charDist;
      if (forwardDot < -0.25) continue;
    }
    if (distXZ > HAND_GRAB_RADIUS + PIECE_COLLISION_RADIUS[piece.type] + 0.85) continue;

    if (piece.color !== char.color) {
      blockedReason = 'wrong_color';
      continue;
    }
    if (engine.getTurn() !== char.color) {
      blockedReason = 'wrong_turn';
      continue;
    }
    // Don't let opponent grab, and allow grabbing a piece already held by our own other hand!
    if (piece.heldBy && piece.heldBy !== char.color) continue;

    if (dist3D < bestDist) {
      bestDist = dist3D;
      bestPiece = piece;
    }
  }

  if (!bestPiece && blockedReason && emitBlockedEvents) {
    events.push({ type: blockedReason, color: char.color });
  }

  return bestPiece;
}

export interface GrabVsGrappleDecision {
  hasGrabbablePiece: boolean;
  opponentInGrappleRange: boolean;
  prioritizeChessPiece: boolean;
  clearGrappleIntent: boolean;
}

/**
 * Resolves ambiguity when both a movable chess piece and the opponent are within reach:
 * - Already holding a chess piece NEVER triggers grappling.
 * - A grabbable chess piece in reach takes priority unless the player is clearly aiming
 *   directly at an eligible opponent closer / better-aligned than the piece.
 */
export function evaluateGrabVsGrapplePriority(
  char: CharacterPhysicsState,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
): GrabVsGrappleDecision {
  if (char.grappleTargetColor !== null) {
    return {
      hasGrabbablePiece: false,
      opponentInGrappleRange: true,
      prioritizeChessPiece: false,
      clearGrappleIntent: true,
    };
  }

  if (char.leftHand.grabbedPieceId || char.rightHand.grabbedPieceId) {
    return {
      hasGrabbablePiece: true,
      opponentInGrappleRange: false,
      prioritizeChessPiece: true,
      clearGrappleIntent: false,
    };
  }

  const oppColor: PlayerColor = char.color === 'w' ? 'b' : 'w';
  const opp = world.characters[oppColor];
  const fwdX = Math.sin(char.yaw);
  const fwdZ = Math.cos(char.yaw);

  const dxOpp = opp.x - char.x;
  const dzOpp = opp.z - char.z;
  const oppDist = Math.hypot(dxOpp, dzOpp);
  const oppDot = oppDist > 1e-4 ? (dxOpp * fwdX + dzOpp * fwdZ) / oppDist : 1;
  const oppEligible =
    oppDist <= GRAPPLE_MAX_RANGE &&
    (oppDot >= -0.2 || oppDist <= 1.65) &&
    !opp.isKnockedDown &&
    !opp.grabbedByColor &&
    !opp.grappleTargetColor &&
    opp.grappleEscapeCooldown <= 0 &&
    char.punchSequenceCooldown <= 0 &&
    char.punchesRemaining > 0;

  let bestPiece: PiecePhysicsState | null = null;
  let bestPieceDist = Infinity;
  let bestPieceDot = -1;

  if (!world.pendingPromotion && !hasAnyFallingDropPiece(world) && engine.getTurn() === char.color) {
    for (const side of ['left', 'right'] as const) {
      const cand = findGrabbablePieceForCharacter(char, world, engine, side, [], false);
      if (!cand) continue;
      const dxP = cand.x - char.x;
      const dzP = cand.z - char.z;
      const dP = Math.hypot(dxP, dzP);
      const dotP = dP > 1e-4 ? (dxP * fwdX + dzP * fwdZ) / dP : 1;
      if (dP < bestPieceDist) {
        bestPieceDist = dP;
        bestPiece = cand;
        bestPieceDot = dotP;
      }
    }
  }

  if (!bestPiece) {
    return {
      hasGrabbablePiece: false,
      opponentInGrappleRange: oppEligible,
      prioritizeChessPiece: false,
      clearGrappleIntent: oppEligible,
    };
  }

  if (!oppEligible) {
    return {
      hasGrabbablePiece: true,
      opponentInGrappleRange: false,
      prioritizeChessPiece: true,
      clearGrappleIntent: false,
    };
  }

  // Both piece and opponent are reachable: require clear alignment & proximity advantage toward opponent to override piece interaction
  const clearlyGrappling =
    oppDot >= 0.45 &&
    (oppDist < bestPieceDist - 0.15 || (oppDot > bestPieceDot + 0.25 && oppDist <= bestPieceDist + 0.25));

  return {
    hasGrabbablePiece: true,
    opponentInGrappleRange: true,
    prioritizeChessPiece: !clearlyGrappling,
    clearGrappleIntent: clearlyGrappling,
  };
}

function rollbackPieceToOrigin(
  piece: PiecePhysicsState,
  toLabel: string,
  events: PhysicsEvent[],
): void {
  const orig = squareToWorld(piece.originSquare);
  piece.settlingTarget = { x: orig.x, y: BOARD_SURFACE_Y, z: orig.z };
  events.push({
    type: 'release_invalid',
    color: piece.color,
    pieceId: piece.id,
    from: piece.originSquare,
    to: toLabel,
  });
}

function commitOrRollbackSquarePlacement(
  piece: PiecePhysicsState,
  targetSquare: string,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  events: PhysicsEvent[],
): void {
  const logicalPiece = engine.getPieceById(piece.id);
  if (
    !logicalPiece ||
    logicalPiece.captured ||
    logicalPiece.square !== piece.originSquare ||
    piece.color !== engine.getTurn() ||
    targetSquare === piece.originSquare
  ) {
    rollbackPieceToOrigin(piece, targetSquare, events);
    return;
  }

  // Check if promotion choice is needed before committing move
  if (engine.needsPromotion(piece.originSquare, targetSquare)) {
    const targetCenter = squareToWorld(targetSquare);
    piece.settlingTarget = {
      x: targetCenter.x,
      y: BOARD_SURFACE_Y,
      z: targetCenter.z,
    };
    world.pendingPromotion = {
      pieceId: piece.id,
      color: piece.color,
      from: piece.originSquare,
      to: targetSquare,
    };
    events.push({
      type: 'promotion_needed',
      color: piece.color,
      pieceId: piece.id,
      from: piece.originSquare,
      to: targetSquare,
    });
    return;
  }

  const outcome = engine.tryMove(piece.originSquare, targetSquare);
  if (outcome.accepted) {
    applyAcceptedMoveToPhysics(piece, outcome, world, events);
  } else {
    rollbackPieceToOrigin(piece, targetSquare, events);
  }
}

export function evaluatePieceRelease(
  piece: PiecePhysicsState,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  events: PhysicsEvent[],
): void {
  const insideBoard =
    Math.abs(piece.x) <= BOARD_PLAYABLE_HALF + 0.65 &&
    Math.abs(piece.z) <= BOARD_PLAYABLE_HALF + 0.65;
  const nearest = findNearestSquare(piece.x, piece.z);
  const withinSquare = insideBoard && nearest.distance <= SNAP_RADIUS;

  if (!withinSquare || nearest.square === piece.originSquare) {
    rollbackPieceToOrigin(piece, insideBoard ? nearest.square : 'offboard', events);
    return;
  }

  commitOrRollbackSquarePlacement(piece, nearest.square, world, engine, events);
}

/**
 * Strictly validates a combat-dropped piece upon hitting the ground/board.
 * Case A: Cleanly inside a legal destination square -> commit move (or prompt promotion).
 * Case B: Lands on a square that violates any chess rule -> rollback to originSquare.
 * Case C: Lands outside the playable 8x8 board or ambiguously between squares -> rollback to originSquare.
 */
export function evaluateDroppedPieceLanding(
  piece: PiecePhysicsState,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  events: PhysicsEvent[],
): void {
  piece.fallingFromDrop = false;
  piece.vx = 0;
  piece.vy = 0;
  piece.vz = 0;
  if (
    Math.abs(piece.x) <= BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH &&
    Math.abs(piece.z) <= BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH
  ) {
    piece.y = Math.max(BOARD_SURFACE_Y, piece.y);
  }

  const insidePlayable =
    Math.abs(piece.x) <= BOARD_PLAYABLE_HALF + 0.05 &&
    Math.abs(piece.z) <= BOARD_PLAYABLE_HALF + 0.05;
  const nearest = findNearestSquare(piece.x, piece.z);
  const cleanlyInsideSquare =
    insidePlayable &&
    Math.abs(piece.x - nearest.centerX) <= DROP_SQUARE_TOLERANCE &&
    Math.abs(piece.z - nearest.centerZ) <= DROP_SQUARE_TOLERANCE;

  if (!cleanlyInsideSquare || nearest.square === piece.originSquare) {
    rollbackPieceToOrigin(piece, cleanlyInsideSquare ? nearest.square : 'offboard', events);
    return;
  }

  commitOrRollbackSquarePlacement(piece, nearest.square, world, engine, events);
}

export function completePendingPromotion(
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  promotionType: Exclude<PieceType, 'p' | 'k'>,
  events: PhysicsEvent[],
): boolean {
  const pending = world.pendingPromotion;
  if (!pending) return false;
  const piece = world.pieces.get(pending.pieceId);
  if (!piece) {
    world.pendingPromotion = null;
    return false;
  }
  const outcome = engine.tryMove(pending.from, pending.to, promotionType);
  world.pendingPromotion = null;
  if (outcome.accepted) {
    piece.type = promotionType;
    applyAcceptedMoveToPhysics(piece, outcome, world, events);
    return true;
  } else {
    const orig = squareToWorld(piece.originSquare);
    piece.settlingTarget = { x: orig.x, y: BOARD_SURFACE_Y, z: orig.z };
    return false;
  }
}

function applyAcceptedMoveToPhysics(
  piece: PiecePhysicsState,
  outcome: MoveOutcome,
  world: WorldPhysicsState,
  events: PhysicsEvent[],
): void {
  const targetPos = squareToWorld(outcome.to);
  piece.originSquare = outcome.to;
  piece.settlingTarget = { x: targetPos.x, y: BOARD_SURFACE_Y, z: targetPos.z };

  if (outcome.capturedPieceId) {
    const capPiece = world.pieces.get(outcome.capturedPieceId);
    if (capPiece) {
      capPiece.captured = true;
      const slot = world.capturedCount[capPiece.color];
      world.capturedCount[capPiece.color] += 1;
      capPiece.capturedSlotIndex = slot;
      const tray = getCapturedTrayPosition(capPiece.color, slot);
      capPiece.settlingTarget = tray;
      // Knock-up velocity for dramatic capture arc
      capPiece.vy = 9.5;
      capPiece.vx = (tray.x - capPiece.x) * 2.2;
      capPiece.vz = (tray.z - capPiece.z) * 2.2;
      events.push({
        type: 'capture',
        color: piece.color,
        pieceId: capPiece.id,
        x: targetPos.x,
        z: targetPos.z,
      });
    }
  }

  if (outcome.rookMove) {
    const rook = world.pieces.get(outcome.rookMove.pieceId);
    if (rook) {
      const rookTarget = squareToWorld(outcome.rookMove.to);
      rook.originSquare = outcome.rookMove.to;
      rook.vy = 5.5;
      rook.settlingTarget = { x: rookTarget.x, y: BOARD_SURFACE_Y, z: rookTarget.z };
    }
  }

  events.push({
    type: 'release_valid',
    color: piece.color,
    pieceId: piece.id,
    from: outcome.from,
    to: outcome.to,
    san: outcome.san,
    x: targetPos.x,
    z: targetPos.z,
    outcome,
  });
}

export function getTwoHandHeldPiece(
  char: CharacterPhysicsState,
  world: WorldPhysicsState,
): PiecePhysicsState | null {
  const leftId = char.leftHand.grabbedPieceId;
  const rightId = char.rightHand.grabbedPieceId;
  if (!leftId || !rightId || leftId !== rightId) return null;
  const piece = world.pieces.get(leftId);
  if (!piece || piece.captured || piece.heldBy !== char.color) return null;
  if (!char.leftHand.reaching || !char.rightHand.reaching) return null;
  return piece;
}

function syncTwoHandGripTracking(char: CharacterPhysicsState, world: WorldPhysicsState): void {
  const twoHandPiece = getTwoHandHeldPiece(char, world);
  const currentId = twoHandPiece ? twoHandPiece.id : null;
  if (currentId !== char.twoHandPieceId) {
    char.twoHandPieceId = currentId;
    char.twoHandHitsTaken = 0;
  }
}

function releaseHeldPieceFromHit(
  char: CharacterPhysicsState,
  world: WorldPhysicsState,
  knockX: number,
  knockZ: number,
  events: PhysicsEvent[],
): void {
  const heldIds = new Set<string>();
  if (char.leftHand.grabbedPieceId) heldIds.add(char.leftHand.grabbedPieceId);
  if (char.rightHand.grabbedPieceId) heldIds.add(char.rightHand.grabbedPieceId);

  char.leftHand.grabbedPieceId = null;
  char.leftHand.reaching = false;
  char.leftHand.reachBlend = 0;
  char.rightHand.grabbedPieceId = null;
  char.rightHand.reaching = false;
  char.rightHand.reachBlend = 0;
  char.twoHandPieceId = null;
  char.twoHandHitsTaken = 0;

  for (const id of heldIds) {
    const piece = world.pieces.get(id);
    if (!piece) continue;
    piece.heldBy = null;
    piece.heldHands = 0;
    piece.settlingTarget = null;
    piece.fallingFromDrop = true;
    piece.vx = Math.max(-5.0, Math.min(5.0, piece.vx * 0.35 + knockX * 2.2));
    piece.vz = Math.max(-5.0, Math.min(5.0, piece.vz * 0.35 + knockZ * 2.2));
    piece.vy = Math.max(1.8, Math.min(4.2, piece.vy * 0.3 + 2.2));
    piece.y = Math.max(piece.y, BOARD_SURFACE_Y + 0.55);
    events.push({
      type: 'combat_drop',
      color: char.color,
      pieceId: piece.id,
      from: piece.originSquare,
      x: piece.x,
      z: piece.z,
    });
  }
}

function maintainHeldHandsDuringReaction(
  char: CharacterPhysicsState,
  input: CharacterInput,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  events: PhysicsEvent[],
  dt: number,
): void {
  const handPairs: Array<{ hand: HandState; heldInput: boolean }> = [
    { hand: char.leftHand, heldInput: input.leftHandHeld },
    { hand: char.rightHand, heldInput: input.rightHandHeld },
  ];

  for (const { hand, heldInput } of handPairs) {
    hand.punchTimer = 0;
    hand.prevHeld = heldInput;
    if (hand.grabbedPieceId) {
      if (heldInput) {
        hand.reaching = true;
        hand.reachBlend = dampValue(hand.reachBlend, 1, 12.0, dt);
      } else {
        const releasedId = hand.grabbedPieceId;
        hand.grabbedPieceId = null;
        hand.reaching = false;
        hand.reachBlend = dampValue(hand.reachBlend, 0, 12.0, dt);
        const stillHeldByOther =
          char.leftHand.grabbedPieceId === releasedId ||
          char.rightHand.grabbedPieceId === releasedId;
        const piece = world.pieces.get(releasedId);
        if (piece && !stillHeldByOther) {
          piece.heldBy = null;
          piece.heldHands = 0;
          evaluatePieceRelease(piece, world, engine, events);
        }
      }
    } else {
      hand.reaching = false;
      hand.reachBlend = dampValue(hand.reachBlend, 0, 12.0, dt);
    }
  }
  syncTwoHandGripTracking(char, world);
}

function stepCharacter(
  char: CharacterPhysicsState,
  input: CharacterInput,
  refForwardX: number,
  refForwardZ: number,
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  dt: number,
  events: PhysicsEvent[],
): void {
  const isObserver = world.cameraMode === 'observer';

  if (isObserver || world.pendingPromotion) {
    // Decelerate to rest cleanly
    char.vx = dampValue(char.vx, 0, 12.0, dt);
    char.vz = dampValue(char.vz, 0, 12.0, dt);
    char.speedRatio = dampValue(char.speedRatio, 0, 10.0, dt);
    char.leanPitch = dampValue(char.leanPitch, 0, 10.0, dt);
    char.leanRoll = dampValue(char.leanRoll, 0, 10.0, dt);
    char.squashY = dampValue(char.squashY, 1, 14.0, dt);
    char.knockdownBlend = dampValue(char.knockdownBlend, 0, 12.0, dt);
    char.stumbleTwist = dampValue(char.stumbleTwist, 0, 12.0, dt);
    char.stunTimer = 0;
    char.stumbleTimer = 0;
    char.isKnockedDown = false;
    char.hitFlashTimer = Math.max(0, char.hitFlashTimer - dt);
    char.leftHand.reaching = false;
    char.rightHand.reaching = false;
    char.leftHand.punchTimer = 0;
    char.rightHand.punchTimer = 0;
    char.leftHand.prevHeld = false;
    char.rightHand.prevHeld = false;
    char.leftHand.reachBlend = dampValue(char.leftHand.reachBlend, 0, 12.0, dt);
    char.rightHand.reachBlend = dampValue(char.rightHand.reachBlend, 0, 12.0, dt);
    if (!char.grounded) {
      char.vy -= GRAVITY * dt;
      char.y += char.vy * dt;
      if (char.y <= BOARD_SURFACE_Y) {
        char.y = BOARD_SURFACE_Y;
        char.vy = 0;
        char.grounded = true;
      }
    }
    return;
  }

  // Cooldown, combo window & reaction timers always tick down during active play
  char.pushCooldown = Math.max(0, char.pushCooldown - dt);
  char.knockdownProtectionTimer = Math.max(0, char.knockdownProtectionTimer - dt);
  char.strongComboCooldown = Math.max(0, char.strongComboCooldown - dt);
  char.hitFlashTimer = Math.max(0, char.hitFlashTimer - dt);
  char.grappleAttemptTimer = Math.max(0, char.grappleAttemptTimer - dt);
  char.grappleEscapeCooldown = Math.max(0, char.grappleEscapeCooldown - dt);
  char.grappleTapCooldown = Math.max(0, char.grappleTapCooldown - dt);
  char.grappleBreakAnimTimer = Math.max(0, char.grappleBreakAnimTimer - dt);
  char.energyRegenDelay = Math.max(0, char.energyRegenDelay - dt);
  char.stumbleTwist = dampValue(char.stumbleTwist, 0, 8.5, dt);
  char.leftHand.punchCooldown = Math.max(0, char.leftHand.punchCooldown - dt);
  char.rightHand.punchCooldown = Math.max(0, char.rightHand.punchCooldown - dt);

  if (char.punchSequenceCooldown > 0) {
    char.punchSequenceCooldown = Math.max(0, char.punchSequenceCooldown - dt);
    if (char.punchSequenceCooldown === 0) {
      char.punchesRemaining = MAX_PUNCHES_PER_SEQUENCE;
      char.comboHits = 0;
      char.comboLastHand = null;
      char.comboTargetColor = null;
      char.comboTimer = 0;
    }
  } else if (char.punchesRemaining <= 0) {
    triggerCombatCooldown(char);
  }
  syncCombatEnergyFromCharges(char);

  if (char.comboTimer > 0) {
    char.comboTimer = Math.max(0, char.comboTimer - dt);
    if (char.comboTimer === 0) {
      char.comboHits = 0;
      char.comboLastHand = null;
      char.comboTargetColor = null;
    }
  }

  // If this character is currently grabbed by the opponent, handle physical struggle & resistance
  if (char.grabbedByColor) {
    const grabber = world.characters[char.grabbedByColor];
    const refRightX = -refForwardZ;
    const refRightZ = refForwardX;
    let resistX = refForwardX * input.moveForward + refRightX * input.moveRight;
    let resistZ = refForwardZ * input.moveForward + refRightZ * input.moveRight;
    const resistLen = Math.hypot(resistX, resistZ);
    if (resistLen > 1e-4) {
      resistX /= Math.max(1, resistLen);
      resistZ /= Math.max(1, resistLen);
      // Player resistance pushes back gently and slowly builds escape meter
      char.vx += resistX * 6.5 * dt;
      char.vz += resistZ * 6.5 * dt;
      char.grappleStruggleMeter = Math.min(1.0, char.grappleStruggleMeter + 0.14 * dt);
    }

    if (input.jumpPressed && char.grappleTapCooldown <= 0) {
      char.grappleTapCooldown = GRAPPLE_ESCAPE_TAP_COOLDOWN;
      char.grappleStruggleMeter = Math.min(1.0, char.grappleStruggleMeter + GRAPPLE_ESCAPE_TAP_GAIN);
      char.stumbleTwist = (Math.random() < 0.5 ? -1 : 1) * 0.45;
      char.squashY = 0.88;
    }

    if (input.grappleResistBoost && input.grappleResistBoost > 0) {
      char.grappleStruggleMeter = Math.min(
        1.0,
        char.grappleStruggleMeter + input.grappleResistBoost * dt,
      );
    }

    char.vx = dampValue(char.vx, 0, 7.0, dt);
    char.vz = dampValue(char.vz, 0, 7.0, dt);
    char.speedRatio = Math.min(0.85, Math.hypot(char.vx, char.vz) / WALK_SPEED);
    char.walkCycle += Math.hypot(char.vx, char.vz) * dt * 2.4;

    const toGrabberX = grabber.x - char.x;
    const toGrabberZ = grabber.z - char.z;
    if (Math.hypot(toGrabberX, toGrabberZ) > 0.1) {
      const faceYaw = Math.atan2(toGrabberX, toGrabberZ);
      const diff = normalizeAngle(faceYaw - char.yaw);
      char.yaw = normalizeAngle(char.yaw + diff * (1 - Math.exp(-8.0 * dt)));
    }

    char.leanPitch = dampValue(char.leanPitch, -0.22, 10.0, dt);
    char.leanRoll = dampValue(char.leanRoll, Math.sin(char.grappleStruggleMeter * 22) * 0.16, 10.0, dt);
    char.squashY = dampValue(char.squashY, 1.0, 12.0, dt);
    char.knockdownBlend = dampValue(char.knockdownBlend, 0, 12.0, dt);

    maintainHeldHandsDuringReaction(char, input, world, engine, events, dt);

    // If victim has a two-hand grip on a chess piece while being dragged for too long, safely drop & validate it
    const twoHandPiece = getTwoHandHeldPiece(char, world);
    if (twoHandPiece && grabber.grappleDuration >= 0.75) {
      const dx = char.x - grabber.x;
      const dz = char.z - grabber.z;
      const d = Math.hypot(dx, dz) || 1;
      releaseHeldPieceFromHit(char, world, dx / d, dz / d, events);
    }

    char.vy -= GRAVITY * dt;
    char.x += char.vx * dt;
    char.z += char.vz * dt;
    char.y += char.vy * dt;
    if (char.y <= BOARD_SURFACE_Y) {
      char.y = BOARD_SURFACE_Y;
      char.vy = 0;
      char.grounded = true;
    } else {
      char.grounded = false;
    }
    char.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.x));
    char.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.z));
    return;
  }

  if (char.stunTimer > 0) {
    char.stunTimer = Math.max(0, char.stunTimer - dt);
    if (char.stunTimer === 0) {
      char.isKnockedDown = false;
      char.balance = 0.85;
      events.push({ type: 'stun_recover', color: char.color, x: char.x, z: char.z });
    }

    // Lower floor friction immediately after knockdown so opponent slides briefly before settling
    const slidingPhase = char.isKnockedDown && char.stunTimer > 0.75;
    const floorDrag = char.grounded ? (slidingPhase ? 2.6 : 7.0) : 1.8;
    char.vx = dampValue(char.vx, 0, floorDrag, dt);
    char.vz = dampValue(char.vz, 0, floorDrag, dt);
    char.speedRatio = dampValue(char.speedRatio, 0, 8.0, dt);
    char.leanPitch = dampValue(char.leanPitch, char.isKnockedDown ? -0.45 : -0.32, 10.0, dt);
    char.leanRoll = dampValue(char.leanRoll, 0, 8.0, dt);
    char.squashY = dampValue(char.squashY, 1.0, 12.0, dt);

    // Smoothly stand back up during final 0.6s of knockdown recovery
    const targetKd = char.isKnockedDown
      ? char.stunTimer <= 0.6
        ? char.stunTimer / 0.6
        : 1.0
      : 0;
    char.knockdownBlend = dampValue(char.knockdownBlend, targetKd, 12.0, dt);

    maintainHeldHandsDuringReaction(char, input, world, engine, events, dt);

    const wasGrounded = char.grounded;
    char.vy -= GRAVITY * dt;
    char.x += char.vx * dt;
    char.z += char.vz * dt;
    char.y += char.vy * dt;
    if (char.y <= BOARD_SURFACE_Y) {
      char.y = BOARD_SURFACE_Y;
      if (!wasGrounded && char.vy < -3.0) {
        char.squashY = 0.78;
        events.push({ type: 'land', color: char.color, x: char.x, z: char.z });
      }
      char.vy = 0;
      char.grounded = true;
    } else {
      char.grounded = false;
    }

    char.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.x));
    char.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.z));
    return;
  }

  if (char.stumbleTimer > 0) {
    char.stumbleTimer = Math.max(0, char.stumbleTimer - dt);
    char.vx = dampValue(char.vx, 0, char.grounded ? 5.8 : 2.0, dt);
    char.vz = dampValue(char.vz, 0, char.grounded ? 5.8 : 2.0, dt);
    char.speedRatio = dampValue(char.speedRatio, 0, 8.0, dt);
    char.leanPitch = dampValue(char.leanPitch, -0.30, 10.0, dt);
    char.leanRoll = dampValue(char.leanRoll, 0, 8.0, dt);
    char.squashY = dampValue(char.squashY, 1.0, 12.0, dt);
    char.knockdownBlend = dampValue(char.knockdownBlend, 0, 12.0, dt);

    maintainHeldHandsDuringReaction(char, input, world, engine, events, dt);

    char.vy -= GRAVITY * dt;
    char.x += char.vx * dt;
    char.z += char.vz * dt;
    char.y += char.vy * dt;
    if (char.y <= BOARD_SURFACE_Y) {
      char.y = BOARD_SURFACE_Y;
      char.vy = 0;
      char.grounded = true;
    } else {
      char.grounded = false;
    }

    char.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.x));
    char.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.z));
    return;
  }

  // Recover physical balance smoothly when standing steady
  char.balance = Math.min(1.0, char.balance + dt * 0.36);
  char.knockdownBlend = dampValue(char.knockdownBlend, 0, 10.0, dt);

  // Camera-relative right vector on XZ plane: cross(forward, up) = (-forwardZ, 0, forwardX)
  const refRightX = -refForwardZ;
  const refRightZ = refForwardX;

  let wishX = refForwardX * input.moveForward + refRightX * input.moveRight;
  let wishZ = refForwardZ * input.moveForward + refRightZ * input.moveRight;
  const wishLen = Math.hypot(wishX, wishZ);
  if (wishLen > 1e-4) {
    wishX /= Math.max(1, wishLen);
    wishZ /= Math.max(1, wishLen);
  }

  // Weight penalty when carrying a piece or dragging an opponent
  const heldPieceId = char.leftHand.grabbedPieceId || char.rightHand.grabbedPieceId;
  const heldPiece = heldPieceId ? world.pieces.get(heldPieceId) : undefined;
  let carrySpeedFactor = 1.0;
  if (heldPiece) {
    const bothHands =
      char.leftHand.grabbedPieceId === heldPiece.id &&
      char.rightHand.grabbedPieceId === heldPiece.id;
    const weight = PIECE_WEIGHT[heldPiece.type];
    carrySpeedFactor = bothHands ? 0.94 - (weight - 0.8) * 0.08 : 0.82 - (weight - 0.8) * 0.1;
  }

  const isGrappling = char.grappleTargetColor !== null;
  let maxSpeed = (input.sprintHeld ? SPRINT_SPEED : WALK_SPEED) * carrySpeedFactor;
  if (isGrappling && char.grappleTargetColor) {
    const victim = world.characters[char.grappleTargetColor];
    const activeResist =
      Math.hypot(victim.vx, victim.vz) > 0.3 && victim.grappleStruggleMeter > 0.04 ? 0.14 : 0;
    const resistancePenalty =
      1 - Math.min(0.45, victim.grappleStruggleMeter * 0.28 + activeResist);
    maxSpeed = GRAPPLE_DRAG_SPEED * resistancePenalty;
  }
  const targetVx = wishX * maxSpeed;
  const targetVz = wishZ * maxSpeed;

  const accelLambda = char.grounded ? (isGrappling ? 10.5 : 14.0) : 5.5;
  const prevVx = char.vx;
  const prevVz = char.vz;
  char.vx = dampValue(char.vx, targetVx, accelLambda, dt);
  char.vz = dampValue(char.vz, targetVz, accelLambda, dt);

  const horizSpeed = Math.hypot(char.vx, char.vz);
  char.speedRatio = Math.min(1.4, horizSpeed / WALK_SPEED);

  // Rotate character toward opponent while grappling, otherwise toward movement direction
  if (isGrappling && char.grappleTargetColor) {
    const victim = world.characters[char.grappleTargetColor];
    const toVicX = victim.x - char.x;
    const toVicZ = victim.z - char.z;
    if (Math.hypot(toVicX, toVicZ) > 0.05) {
      const desiredYaw = Math.atan2(toVicX, toVicZ);
      const diff = normalizeAngle(desiredYaw - char.yaw);
      char.yaw = normalizeAngle(char.yaw + diff * (1 - Math.exp(-14.0 * dt)));
    }
  } else if (wishLen > 0.1) {
    const desiredYaw = Math.atan2(wishX, wishZ);
    const diff = normalizeAngle(desiredYaw - char.yaw);
    char.yaw = normalizeAngle(char.yaw + diff * (1 - Math.exp(-12.0 * dt)));
  }

  // Funny Human: Fall Flat wobble lean proportional to acceleration & speed
  const ax = (char.vx - prevVx) / Math.max(dt, 0.001);
  const az = (char.vz - prevVz) / Math.max(dt, 0.001);
  const forwardX = Math.sin(char.yaw);
  const forwardZ = Math.cos(char.yaw);
  const rightX = Math.cos(char.yaw);
  const rightZ = -Math.sin(char.yaw);
  const fwdAccel = ax * forwardX + az * forwardZ;
  const sideAccel = ax * rightX + az * rightZ;
  const targetPitch = Math.max(-0.28, Math.min(0.28, horizSpeed * 0.022 + fwdAccel * 0.004));
  const targetRoll = Math.max(-0.24, Math.min(0.24, -sideAccel * 0.005));
  char.leanPitch = dampValue(char.leanPitch, targetPitch, 10.0, dt);
  char.leanRoll = dampValue(char.leanRoll, targetRoll, 10.0, dt);

  // Coyote time & jump buffering
  if (char.grounded) {
    char.coyoteTimer = 0.11;
  } else {
    char.coyoteTimer = Math.max(0, char.coyoteTimer - dt);
  }
  if (input.jumpPressed) {
    char.jumpBufferTimer = 0.12;
  } else {
    char.jumpBufferTimer = Math.max(0, char.jumpBufferTimer - dt);
  }

  if (char.jumpBufferTimer > 0 && char.coyoteTimer > 0) {
    char.vy = JUMP_SPEED;
    char.grounded = false;
    char.coyoteTimer = 0;
    char.jumpBufferTimer = 0;
    char.squashY = 1.22;
    events.push({ type: 'jump', color: char.color, x: char.x, z: char.z });
  }

  // Variable jump height cut when released early
  if (!input.jumpHeld && char.vy > 3.5) {
    char.vy *= Math.pow(0.45, dt * 14);
  }

  // Gravity & vertical integration
  const wasGrounded = char.grounded;
  char.vy -= GRAVITY * dt;
  char.x += char.vx * dt;
  char.z += char.vz * dt;
  char.y += char.vy * dt;

  if (char.y <= BOARD_SURFACE_Y) {
    char.y = BOARD_SURFACE_Y;
    if (!wasGrounded && char.vy < -3.0) {
      char.squashY = 0.76;
      events.push({ type: 'land', color: char.color, x: char.x, z: char.z });
    }
    char.vy = 0;
    char.grounded = true;
  } else {
    char.grounded = false;
  }

  char.squashY = dampValue(char.squashY, 1.0, 14.0, dt);

  // Advance distance-synced walk cycle
  if (char.grounded && horizSpeed > 0.2) {
    char.walkCycle += horizSpeed * dt * 2.1;
  }

  // Board boundary clamping (never fall off the chessboard)
  char.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.x));
  char.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.z));

  // If grappling opponent or attempting a close-range grapple, keep both hands dedicated to the grip
  if (isGrappling) {
    char.leftHand.reaching = true;
    char.rightHand.reaching = true;
    char.leftHand.reachBlend = dampValue(char.leftHand.reachBlend, 1, 16.0, dt);
    char.rightHand.reachBlend = dampValue(char.rightHand.reachBlend, 1, 16.0, dt);
    char.leftHand.punchTimer = 0;
    char.rightHand.punchTimer = 0;
    char.leftHand.prevHeld = input.leftHandHeld;
    char.rightHand.prevHeld = input.rightHandHeld;
    syncTwoHandGripTracking(char, world);
    return;
  }

  if (char.grappleAttemptTimer > 0) {
    char.leftHand.reaching = true;
    char.rightHand.reaching = true;
    char.leftHand.reachBlend = dampValue(char.leftHand.reachBlend, 1, 18.0, dt);
    char.rightHand.reachBlend = dampValue(char.rightHand.reachBlend, 1, 18.0, dt);
    char.leftHand.punchTimer = 0;
    char.rightHand.punchTimer = 0;
    char.leftHand.prevHeld = input.leftHandHeld;
    char.rightHand.prevHeld = input.rightHandHeld;
    syncTwoHandGripTracking(char, world);
    return;
  }

  // Hand reaching, grabbing & independent punching logic (Left & Right hands)
  const opponent = world.characters[char.color === 'w' ? 'b' : 'w'];
  const opponentCanReceivePunch =
    !opponent.isKnockedDown && opponent.stunTimer <= 0 && opponent.pushCooldown <= 0;
  const hands: Array<{
    side: 'left' | 'right';
    hand: HandState;
    heldInput: boolean;
    punchPressed: boolean;
  }> = [
    {
      side: 'left',
      hand: char.leftHand,
      heldInput: input.leftHandHeld,
      punchPressed: Boolean(input.leftPunchPressed),
    },
    {
      side: 'right',
      hand: char.rightHand,
      heldInput: input.rightHandHeld,
      punchPressed: Boolean(input.rightPunchPressed),
    },
  ];

  for (const { side, hand, heldInput, punchPressed } of hands) {
    const risingEdge = heldInput && !hand.prevHeld;
    hand.prevHeld = heldInput;
    const prevPunchTimer = hand.punchTimer;
    hand.punchTimer = Math.max(0, hand.punchTimer - dt);

    // If a swing finished without landing a hit (and wasn't converted into a piece grab), reset consecutive hit streak
    if (
      prevPunchTimer > 0 &&
      hand.punchTimer === 0 &&
      !hand.punchHitRegistered &&
      !hand.grabbedPieceId
    ) {
      if (char.comboHits > 0 && char.comboTimer < COMBO_WINDOW - PUNCH_DURATION - 0.04) {
        char.comboHits = 0;
        char.comboLastHand = null;
        char.comboTargetColor = null;
        char.comboTimer = 0;
      }
    }

    // Clear per-swing hit flag as soon as the swing finishes or the button is released,
    // so chess piece grabbing on subsequent presses is NEVER blocked during the 10s punch cooldown.
    if (!heldInput || hand.punchTimer === 0) {
      hand.punchHitRegistered = false;
    }

    const grabPriority =
      heldInput &&
      !hand.grabbedPieceId &&
      !input.grappleHeld &&
      (Boolean(char.leftHand.grabbedPieceId || char.rightHand.grabbedPieceId) ||
        evaluateGrabVsGrapplePriority(char, world, engine).prioritizeChessPiece);

    if (grabPriority) {
      const prioritizedPiece = findGrabbablePieceForCharacter(
        char,
        world,
        engine,
        side,
        events,
        false,
      );
      if (prioritizedPiece) {
        hand.grabbedPieceId = prioritizedPiece.id;
        hand.punchTimer = 0;
        hand.punchHitRegistered = false;
        hand.reaching = true;
        hand.reachBlend = Math.max(hand.reachBlend, 0.45);
        prioritizedPiece.heldBy = char.color;
        prioritizedPiece.heldHands =
          (char.leftHand.grabbedPieceId === prioritizedPiece.id ? 1 : 0) +
          (char.rightHand.grabbedPieceId === prioritizedPiece.id ? 1 : 0);
        prioritizedPiece.settlingTarget = null;
        events.push({
          type: 'grab',
          color: char.color,
          pieceId: prioritizedPiece.id,
          from: prioritizedPiece.originSquare,
        });
        continue;
      }
    }

    // Initiate punch ONLY when hand is free, not grappling/attempting grapple chord, off hand cooldown, AND charges remain
    if (
      (punchPressed || risingEdge) &&
      !input.grappleHeld &&
      !char.grappleTargetColor &&
      !hand.grabbedPieceId &&
      hand.punchCooldown <= 0 &&
      hand.punchTimer <= 0 &&
      char.punchSequenceCooldown <= 0 &&
      char.punchesRemaining > 0 &&
      opponentCanReceivePunch
    ) {
      hand.punchTimer = PUNCH_DURATION;
      hand.punchCooldown = PUNCH_COOLDOWN;
      hand.punchHitRegistered = false;
      char.punchesRemaining = Math.max(0, char.punchesRemaining - 1);
      if (char.punchesRemaining === 0) {
        triggerCombatCooldown(char);
      } else {
        syncCombatEnergyFromCharges(char);
      }
      events.push({ type: 'punch_swing', color: char.color, side, x: char.x, z: char.z });
    }

    hand.reaching = heldInput;
    hand.reachBlend = dampValue(hand.reachBlend, heldInput ? 1 : 0, 16.0, dt);

    if (heldInput) {
      if (!hand.grabbedPieceId) {
        const minReachBlend = char.punchSequenceCooldown > 0 ? 0.2 : 0.32;
        // After punch strike phase passes without landing a hit (or immediately during cooldown), allow piece grabbing while held
        if (
          hand.reachBlend > minReachBlend &&
          !hand.punchHitRegistered &&
          hand.punchTimer <= PUNCH_ACTIVE_END
        ) {
          const target = findGrabbablePieceForCharacter(char, world, engine, side, events);
          if (target) {
            hand.grabbedPieceId = target.id;
            hand.punchTimer = 0;
            target.heldBy = char.color;
            target.heldHands =
              (char.leftHand.grabbedPieceId === target.id ? 1 : 0) +
              (char.rightHand.grabbedPieceId === target.id ? 1 : 0);
            target.settlingTarget = null;
            events.push({
              type: 'grab',
              color: char.color,
              pieceId: target.id,
              from: target.originSquare,
            });
          }
        }
      }
    } else if (hand.grabbedPieceId) {
      // Hand button released!
      const releasedId = hand.grabbedPieceId;
      hand.grabbedPieceId = null;

      const stillHeldByOther =
        char.leftHand.grabbedPieceId === releasedId ||
        char.rightHand.grabbedPieceId === releasedId;

      const piece = world.pieces.get(releasedId);
      if (piece) {
        if (!stillHeldByOther) {
          piece.heldBy = null;
          piece.heldHands = 0;
          evaluatePieceRelease(piece, world, engine, events);
        } else {
          piece.heldHands = 1;
        }
      }
    }
  }

  syncTwoHandGripTracking(char, world);
}

function distPointToSegmentXZ(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
): { dist: number; t: number } {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  if (lenSq <= 1e-6) {
    return { dist: Math.hypot(px - ax, pz - az), t: 0 };
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
  const cx = ax + abx * t;
  const cz = az + abz * t;
  return { dist: Math.hypot(px - cx, pz - cz), t };
}

function isPunchBlockedByPieceObstacle(
  attacker: CharacterPhysicsState,
  defender: CharacterPhysicsState,
  world: WorldPhysicsState,
  fistY: number,
): boolean {
  const centerDist = Math.hypot(defender.x - attacker.x, defender.z - attacker.z);
  if (centerDist < 1.5) return false;

  for (const piece of world.pieces.values()) {
    if (piece.captured || piece.fallingFromDrop || piece.heldBy) continue;
    const pieceTop = piece.y + PIECE_HEIGHT[piece.type];
    if (pieceTop < fistY - 0.15) continue;

    const { dist, t } = distPointToSegmentXZ(
      piece.x,
      piece.z,
      attacker.x,
      attacker.z,
      defender.x,
      defender.z,
    );
    // Only pieces strictly between attacker and defender can block the strike
    if (t > 0.15 && t < 0.85 && dist < PIECE_COLLISION_RADIUS[piece.type] * 0.92) {
      return true;
    }
  }
  return false;
}

function resolveCombatHits(
  world: WorldPhysicsState,
  events: PhysicsEvent[],
): void {
  if (world.cameraMode === 'observer' || world.pendingPromotion) return;

  interface PendingHit {
    attacker: CharacterPhysicsState;
    defender: CharacterPhysicsState;
    side: 'left' | 'right';
    kx: number;
    kz: number;
    centerDist: number;
  }

  const pendingHits: PendingHit[] = [];

  for (const attackerColor of ['w', 'b'] as const) {
    const attacker = world.characters[attackerColor];
    const defender = world.characters[attackerColor === 'w' ? 'b' : 'w'];

    // Do not consume or resolve punches against an opponent who is down or still recovering.
    if (defender.isKnockedDown || defender.stunTimer > 0 || defender.pushCooldown > 0) continue;

    const fwdX = Math.sin(attacker.yaw);
    const fwdZ = Math.cos(attacker.yaw);
    const leftX = Math.cos(attacker.yaw);
    const leftZ = -Math.sin(attacker.yaw);

    const defLeftX = Math.cos(defender.yaw);
    const defLeftZ = -Math.sin(defender.yaw);

    const checkHands: Array<{ side: 'left' | 'right'; hand: HandState }> = [
      { side: 'left', hand: attacker.leftHand },
      { side: 'right', hand: attacker.rightHand },
    ];

    for (const { side, hand } of checkHands) {
      if (
        hand.punchTimer <= PUNCH_ACTIVE_END ||
        hand.punchTimer > PUNCH_WINDUP_END ||
        hand.punchHitRegistered
      ) {
        continue;
      }

      const toDefX = defender.x - attacker.x;
      const toDefZ = defender.z - attacker.z;
      const centerDist = Math.hypot(toDefX, toDefZ);
      if (centerDist > PUNCH_MAX_CENTER_DIST) continue;

      const strikeProgress =
        1 - (hand.punchTimer - PUNCH_ACTIVE_END) / (PUNCH_WINDUP_END - PUNCH_ACTIVE_END);
      const reach =
        1.05 + Math.sin(Math.min(1, strikeProgress * 1.25) * Math.PI * 0.5) * (PUNCH_REACH - 1.05);
      const sideSign = side === 'left' ? 1 : -1;

      // Swept arm segment from upper-torso/shoulder toward extended fist
      const shoulderX = attacker.x + fwdX * 0.15 + leftX * sideSign * 0.34;
      const shoulderZ = attacker.z + fwdZ * 0.15 + leftZ * sideSign * 0.34;
      const fistX = attacker.x + fwdX * reach + leftX * sideSign * 0.30;
      const fistY = attacker.y + 1.48;
      const fistZ = attacker.z + fwdZ * reach + leftZ * sideSign * 0.30;

      // Check defender's torso center and both upper-body shoulders so hits connect cleanly even when carrying pieces
      const centerSeg = distPointToSegmentXZ(
        defender.x,
        defender.z,
        shoulderX,
        shoulderZ,
        fistX,
        fistZ,
      );
      const leftShoulderSeg = distPointToSegmentXZ(
        defender.x + defLeftX * 0.3,
        defender.z + defLeftZ * 0.3,
        shoulderX,
        shoulderZ,
        fistX,
        fistZ,
      );
      const rightShoulderSeg = distPointToSegmentXZ(
        defender.x - defLeftX * 0.3,
        defender.z - defLeftZ * 0.3,
        shoulderX,
        shoulderZ,
        fistX,
        fistZ,
      );
      const segDistXZ = Math.min(centerSeg.dist, leftShoulderSeg.dist, rightShoulderSeg.dist);
      const dy = Math.abs(defender.y + 1.42 - fistY);

      // Bias directional cone slightly toward the punching hand's side while strictly rejecting attacks from behind
      const handYaw = attacker.yaw + sideSign * 0.22;
      const handDirX = Math.sin(handYaw);
      const handDirZ = Math.cos(handYaw);
      const forwardDot =
        centerDist > 1e-4 ? (toDefX * fwdX + toDefZ * fwdZ) / centerDist : 1;
      const handArcDot =
        centerDist > 1e-4 ? (toDefX * handDirX + toDefZ * handDirZ) / centerDist : 1;

      const inFrontCone =
        forwardDot >= PUNCH_MIN_FORWARD_DOT ||
        (handArcDot >= PUNCH_MIN_FORWARD_DOT && centerDist <= 2.65);

      if (
        segDistXZ <= PUNCH_HIT_RADIUS + CHARACTER_RADIUS &&
        dy <= 1.85 &&
        inFrontCone &&
        !isPunchBlockedByPieceObstacle(attacker, defender, world, fistY)
      ) {
        hand.punchHitRegistered = true;
        const kx = centerDist > 1e-4 ? toDefX / centerDist : fwdX;
        const kz = centerDist > 1e-4 ? toDefZ / centerDist : fwdZ;
        pendingHits.push({ attacker, defender, side, kx, kz, centerDist });
        break;
      }
    }
  }

  // Apply hits symmetrically after detecting both sides
  for (const hit of pendingHits) {
    const { attacker, defender, side, kx, kz, centerDist } = hit;

    // Validate defender grip BEFORE applying impact
    syncTwoHandGripTracking(defender, world);
    const twoHandPiece = getTwoHandHeldPiece(defender, world);
    const defenderHoldingOneHand =
      !twoHandPiece &&
      Boolean(defender.leftHand.grabbedPieceId || defender.rightHand.grabbedPieceId);

    const distFactor = Math.max(
      0.55,
      Math.min(1.15, 1.15 - (centerDist / PUNCH_MAX_CENTER_DIST) * 0.45),
    );

    // Angle relative to defender's facing direction affects stability
    const defFwdX = Math.sin(defender.yaw);
    const defFwdZ = Math.cos(defender.yaw);
    const hitDot = kx * defFwdX + kz * defFwdZ;
    const angleFactor = hitDot > 0.35 ? 1.18 : Math.abs(hitDot) <= 0.35 ? 1.1 : 0.92;

    // Lateral hook torque based on punching hand
    const sideSign = side === 'left' ? 1 : -1;
    const hookX = kx - kz * sideSign * 0.22;
    const hookZ = kz + kx * sideSign * 0.22;
    const hookLen = Math.hypot(hookX, hookZ) || 1;
    const dirX = hookX / hookLen;
    const dirZ = hookZ / hookLen;

    // Update consecutive hit combo state (punch charge was already consumed on punch attempt)
    const sequenceHitCount =
      attacker.comboTimer > 0 && attacker.comboTargetColor === defender.color
        ? attacker.comboHits + 1
        : 1;
    attacker.comboHits = sequenceHitCount;
    attacker.comboLastHand = side;
    attacker.comboTargetColor = defender.color;
    attacker.comboTimer = COMBO_WINDOW;

    const isThirdConsecutiveCombo = sequenceHitCount >= 3;
    const isFinalSequencePunch = attacker.punchesRemaining === 0;

    if (isThirdConsecutiveCombo) {
      attacker.comboHits = 0;
      attacker.comboLastHand = null;
      attacker.comboTargetColor = null;
      attacker.comboTimer = 0;
    }

    if (isFinalSequencePunch && attacker.punchSequenceCooldown <= 0) {
      triggerCombatCooldown(attacker);
    }

    // If defender was grappling someone when hit strongly, break that grapple safely
    if (defender.grappleTargetColor && (isThirdConsecutiveCombo || sequenceHitCount >= 2)) {
      endGrapplePair(world, defender.color, 'break', events);
    }

    // Two-hand grip protection: keep holding on Hit 1 & Hit 2, release immediately on Hit 3
    let twoHandProtected = false;
    let shouldReleasePiece = defenderHoldingOneHand;
    if (twoHandPiece) {
      defender.twoHandHitsTaken += 1;
      if (defender.twoHandHitsTaken < 3) {
        twoHandProtected = true;
        shouldReleasePiece = false;
      } else {
        twoHandProtected = false;
        shouldReleasePiece = true;
        defender.twoHandHitsTaken = 0;
        defender.twoHandPieceId = null;
      }
    }

    const protectedFromKnockdown = defender.knockdownProtectionTimer > 0 || twoHandProtected;
    let causedKnockdown = false;
    let triggeredComboFinisher = false;

    if (isThirdConsecutiveCombo && !protectedFromKnockdown) {
      // 3rd consecutive hit finisher: strong backward launch, knockdown, ragdoll reaction & floor slide
      causedKnockdown = true;
      triggeredComboFinisher = true;
      defender.isKnockedDown = true;
      defender.stunTimer = STUN_KNOCKDOWN_DURATION;
      defender.stumbleTimer = 0;
      defender.pushCooldown = PUSH_REACTION_COOLDOWN;
      defender.knockdownProtectionTimer = STUN_KNOCKDOWN_DURATION + KNOCKDOWN_POST_PROTECTION;
      defender.balance = 0;
      defender.hitFlashTimer = 0.18;
      defender.squashY = 0.65;

      const kbSpeed = COMBO_PUNCH_KNOCKBACK * distFactor * angleFactor;
      defender.vx = dirX * kbSpeed;
      defender.vz = dirZ * kbSpeed;
      defender.vy = Math.max(defender.vy, 5.2);
      defender.grounded = false;
      defender.yaw = normalizeAngle(defender.yaw - sideSign * 0.68);
      defender.stumbleTwist = -sideSign * 0.9;
      defender.leanPitch = -0.54;
      defender.leanRoll = -sideSign * 0.36;
    } else if (isFinalSequencePunch && !protectedFromKnockdown && (!defender.grounded || defender.balance <= 0.65)) {
      // 6th/final consumed punch knocks an unsteady opponent down strongly
      causedKnockdown = true;
      defender.isKnockedDown = true;
      defender.stunTimer = STUN_FALL_DURATION;
      defender.stumbleTimer = 0;
      defender.pushCooldown = PUSH_REACTION_COOLDOWN;
      defender.knockdownProtectionTimer = STUN_FALL_DURATION + KNOCKDOWN_POST_PROTECTION * 0.8;
      defender.balance = 0;
      defender.hitFlashTimer = 0.16;
      defender.squashY = 0.72;

      const kbSpeed = SECOND_PUNCH_KNOCKBACK * 1.25 * distFactor * angleFactor;
      defender.vx = dirX * kbSpeed;
      defender.vz = dirZ * kbSpeed;
      defender.vy = Math.max(defender.vy, 3.4);
      defender.grounded = false;
      defender.yaw = normalizeAngle(defender.yaw - sideSign * 0.52);
      defender.stumbleTwist = -sideSign * 0.72;
      defender.leanPitch = -0.45;
      defender.leanRoll = -sideSign * 0.3;
    } else {
      const wasUnstableBeforeHit =
        sequenceHitCount === 1 &&
        (!defender.grounded || defender.balance <= 0.42);
      const singleCausesFall =
        wasUnstableBeforeHit && !protectedFromKnockdown && distFactor >= 0.78;

      defender.balance = Math.max(0, defender.balance - 0.35 * distFactor * angleFactor);
      defender.hitFlashTimer = 0.12;

      if (singleCausesFall) {
        // Single punch against an already off-balance opponent causes a fall
        causedKnockdown = true;
        defender.isKnockedDown = true;
        defender.stunTimer = STUN_FALL_DURATION;
        defender.stumbleTimer = 0;
        defender.pushCooldown = PUSH_REACTION_COOLDOWN;
        defender.knockdownProtectionTimer = STUN_FALL_DURATION + KNOCKDOWN_POST_PROTECTION * 0.8;
        defender.squashY = 0.74;

        const kbSpeed = SINGLE_PUNCH_KNOCKBACK * 1.25 * distFactor * angleFactor;
        defender.vx = dirX * kbSpeed;
        defender.vz = dirZ * kbSpeed;
        defender.vy = Math.max(defender.vy, 2.8);
        defender.grounded = false;
        defender.yaw = normalizeAngle(defender.yaw - sideSign * 0.45);
        defender.stumbleTwist = -sideSign * 0.65;
        defender.leanPitch = -0.42;
        defender.leanRoll = -sideSign * 0.28;
      } else {
        // 1st or 2nd hit (or hit absorbed by two-hand protection / knockdown protection): push + rotation + stumble
        const isSecondHit = sequenceHitCount === 2 || (twoHandPiece && defender.twoHandHitsTaken === 2);
        const basePush = isSecondHit ? SECOND_PUNCH_KNOCKBACK : SINGLE_PUNCH_KNOCKBACK;
        const protMult = !twoHandProtected && defender.knockdownProtectionTimer > 0 ? 0.65 : 1.0;
        const kbSpeed = basePush * distFactor * angleFactor * protMult;

        defender.vx = dirX * kbSpeed;
        defender.vz = dirZ * kbSpeed;
        defender.vy = Math.max(defender.vy, isSecondHit ? 1.8 : 1.4);
        defender.grounded = false;
        defender.stumbleTimer =
          !twoHandProtected && defender.knockdownProtectionTimer > 0 ? 0.24 : STUN_STUMBLE_DURATION;
        defender.pushCooldown = PUSH_REACTION_COOLDOWN;
        defender.squashY = isSecondHit ? 0.8 : 0.84;
        defender.yaw = normalizeAngle(
          defender.yaw - sideSign * (isSecondHit ? 0.42 : 0.32) * angleFactor,
        );
        defender.stumbleTwist = -sideSign * (isSecondHit ? 0.68 : 0.55);
        defender.leanPitch = isSecondHit ? -0.38 : -0.32;
        defender.leanRoll = -sideSign * (isSecondHit ? 0.26 : 0.22);
      }
    }

    if (shouldReleasePiece) {
      releaseHeldPieceFromHit(defender, world, kx, kz, events);
    }

    events.push({
      type: 'punch_hit',
      color: defender.color,
      side,
      knockdown: causedKnockdown,
      combo: triggeredComboFinisher,
      x: defender.x,
      z: defender.z,
    });
  }
}

function resolveCharacterCollisions(world: WorldPhysicsState): void {
  const cW = world.characters.w;
  const cB = world.characters.b;

  // 1. Character vs Character cylinder collision
  const dxCC = cB.x - cW.x;
  const dzCC = cB.z - cW.z;
  const distCC = Math.hypot(dxCC, dzCC);
  const minCC = CHARACTER_RADIUS * 2.05;
  if (distCC < minCC) {
    const nx = distCC > 1e-4 ? dxCC / distCC : 1;
    const nz = distCC > 1e-4 ? dzCC / distCC : 0;
    const overlap = (minCC - distCC) * 0.5;
    cW.x -= nx * overlap;
    cW.z -= nz * overlap;
    cB.x += nx * overlap;
    cB.z += nz * overlap;
  }

  // 2. Each Character vs Non-Held Chess Pieces on the board
  for (const color of ['w', 'b'] as const) {
    const char = world.characters[color];
    for (const piece of world.pieces.values()) {
      if (piece.captured || piece.fallingFromDrop) continue;
      // Don't collide with the piece currently held by this character
      if (piece.heldBy === color) continue;
      // Allow walking past if character jumped cleanly over a pawn
      if (char.y > piece.y + PIECE_HEIGHT[piece.type] * 0.85) continue;

      const pieceRad = PIECE_COLLISION_RADIUS[piece.type];
      const minDist = CHARACTER_RADIUS + pieceRad;
      const dx = char.x - piece.x;
      const dz = char.z - piece.z;
      const dist = Math.hypot(dx, dz);

      if (dist < minDist) {
        const nx = dist > 1e-4 ? dx / dist : 0;
        const nz = dist > 1e-4 ? dz / dist : 1;
        const push = minDist - dist;
        char.x += nx * push;
        char.z += nz * push;

        // Project out inward velocity component so sliding around pieces feels smooth
        const vn = char.vx * nx + char.vz * nz;
        if (vn < 0) {
          char.vx -= vn * nx;
          char.vz -= vn * nz;
        }
      }
    }

    // Re-clamp inside playable board boundaries after pushouts
    char.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.x));
    char.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, char.z));
  }
}

function stepPieces(
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  dt: number,
  events: PhysicsEvent[],
): void {
  // First compute hand world anchors (either grabbing a piece, grappling opponent shoulders, or reaching)
  for (const color of ['w', 'b'] as const) {
    const char = world.characters[color];
    const fwdX = Math.sin(char.yaw);
    const fwdZ = Math.cos(char.yaw);
    const leftX = Math.cos(char.yaw);
    const leftZ = -Math.sin(char.yaw);

    if (char.grappleTargetColor) {
      const victim = world.characters[char.grappleTargetColor];
      const vicLeftX = Math.cos(victim.yaw);
      const vicLeftZ = -Math.sin(victim.yaw);
      const shoulderSpread = 0.36;
      char.leftHand.worldX = victim.x + vicLeftX * shoulderSpread;
      char.leftHand.worldY = victim.y + 1.52;
      char.leftHand.worldZ = victim.z + vicLeftZ * shoulderSpread;

      char.rightHand.worldX = victim.x - vicLeftX * shoulderSpread;
      char.rightHand.worldY = victim.y + 1.52;
      char.rightHand.worldZ = victim.z - vicLeftZ * shoulderSpread;
      continue;
    }

    const leftExtend = 0.65 + char.leftHand.reachBlend * 1.15;
    const rightExtend = 0.65 + char.rightHand.reachBlend * 1.15;

    char.leftHand.worldX = char.x + fwdX * leftExtend + leftX * 0.44;
    char.leftHand.worldY = char.y + 1.48;
    char.leftHand.worldZ = char.z + fwdZ * leftExtend + leftZ * 0.44;

    char.rightHand.worldX = char.x + fwdX * rightExtend - leftX * 0.44;
    char.rightHand.worldY = char.y + 1.48;
    char.rightHand.worldZ = char.z + fwdZ * rightExtend - leftZ * 0.44;
  }

  for (const piece of world.pieces.values()) {
    if (piece.heldBy) {
      const char = world.characters[piece.heldBy];
      const leftHolding = char.leftHand.grabbedPieceId === piece.id;
      const rightHolding = char.rightHand.grabbedPieceId === piece.id;
      const handCount = (leftHolding ? 1 : 0) + (rightHolding ? 1 : 0);
      piece.heldHands = handCount;

      const fwdX = Math.sin(char.yaw);
      const fwdZ = Math.cos(char.yaw);
      const leftX = Math.cos(char.yaw);
      const leftZ = -Math.sin(char.yaw);

      const sideBias = leftHolding && !rightHolding ? 0.3 : rightHolding && !leftHolding ? -0.3 : 0;
      const carryForward = 1.48;
      const carryHeight = char.y + (handCount === 2 ? 1.15 : 0.92);

      const targetX = char.x + fwdX * carryForward + leftX * sideBias;
      const targetY = Math.max(BOARD_SURFACE_Y + 0.25, carryHeight);
      const targetZ = char.z + fwdZ * carryForward + leftZ * sideBias;

      // Second-order spring suspension for physical carry weight & sway
      const stiffness = handCount === 2 ? 165 : 120;
      const damping = handCount === 2 ? 18 : 15;
      piece.vx += ((targetX - piece.x) * stiffness - piece.vx * damping) * dt;
      piece.vy += ((targetY - piece.y) * stiffness - piece.vy * damping) * dt;
      piece.vz += ((targetZ - piece.z) * stiffness - piece.vz * damping) * dt;

      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.z += piece.vz * dt;
      if (piece.y < BOARD_SURFACE_Y) {
        piece.y = BOARD_SURFACE_Y;
        piece.vy = Math.max(0, piece.vy);
      }

      // Funny pendulum tilt while being carried
      piece.tiltX = dampValue(piece.tiltX, Math.max(-0.26, Math.min(0.26, piece.vz * 0.035)), 12, dt);
      piece.tiltZ = dampValue(piece.tiltZ, Math.max(-0.26, Math.min(0.26, -piece.vx * 0.035)), 12, dt);

      // Snap hand world anchors onto the carried piece sides for visual gripping
      if (leftHolding) {
        char.leftHand.worldX = piece.x + leftX * PIECE_COLLISION_RADIUS[piece.type] * 0.72;
        char.leftHand.worldY = piece.y + PIECE_HEIGHT[piece.type] * 0.45;
        char.leftHand.worldZ = piece.z + leftZ * PIECE_COLLISION_RADIUS[piece.type] * 0.72;
      }
      if (rightHolding) {
        char.rightHand.worldX = piece.x - leftX * PIECE_COLLISION_RADIUS[piece.type] * 0.72;
        char.rightHand.worldY = piece.y + PIECE_HEIGHT[piece.type] * 0.45;
        char.rightHand.worldZ = piece.z - leftZ * PIECE_COLLISION_RADIUS[piece.type] * 0.72;
      }
    } else if (piece.fallingFromDrop) {
      // Natural ballistic fall after carrier is punched
      piece.vy -= GRAVITY * dt;
      const drag = Math.exp(-3.0 * dt);
      piece.vx *= drag;
      piece.vz *= drag;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.z += piece.vz * dt;
      piece.tiltX = dampValue(piece.tiltX, Math.max(-0.45, Math.min(0.45, piece.vz * 0.08)), 10, dt);
      piece.tiltZ = dampValue(piece.tiltZ, Math.max(-0.45, Math.min(0.45, -piece.vx * 0.08)), 10, dt);

      const onBoardSlab =
        Math.abs(piece.x) <= BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH &&
        Math.abs(piece.z) <= BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH;
      const landY = onBoardSlab ? BOARD_SURFACE_Y : -0.45;

      if (piece.y <= landY) {
        piece.y = landY;
        evaluateDroppedPieceLanding(piece, world, engine, events);
      }
    } else if (piece.settlingTarget) {
      // Smoothly glide/drop onto target square or captured tray
      const t = piece.settlingTarget;
      const lambda = piece.captured ? 6.5 : 15.0;
      piece.x = dampValue(piece.x, t.x, lambda, dt);
      piece.z = dampValue(piece.z, t.z, lambda, dt);

      if (piece.y > t.y + 0.01 || piece.vy > 0.1) {
        piece.vy -= GRAVITY * dt;
        piece.y += piece.vy * dt;
        if (piece.y <= t.y) {
          piece.y = t.y;
          piece.vy = 0;
        }
      } else {
        piece.y = dampValue(piece.y, t.y, 16.0, dt);
        piece.vy = 0;
      }

      piece.vx = 0;
      piece.vz = 0;
      piece.tiltX = dampValue(piece.tiltX, 0, 14.0, dt);
      piece.tiltZ = dampValue(piece.tiltZ, 0, 14.0, dt);

      if (
        Math.hypot(piece.x - t.x, piece.z - t.z) < 0.02 &&
        Math.abs(piece.y - t.y) < 0.02 &&
        Math.abs(piece.vy) < 0.05
      ) {
        piece.x = t.x;
        piece.y = t.y;
        piece.z = t.z;
        piece.tiltX = 0;
        piece.tiltZ = 0;
        piece.settlingTarget = null;
      }
    } else {
      // Resting cleanly
      const restY = piece.captured ? -0.25 : BOARD_SURFACE_Y;
      piece.y = dampValue(piece.y, restY, 16.0, dt);
      piece.tiltX = dampValue(piece.tiltX, 0, 14.0, dt);
      piece.tiltZ = dampValue(piece.tiltZ, 0, 14.0, dt);
    }
  }
}

export function verifyWorldIntegrity(
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
): boolean {
  if (!engine.verifyIntegrity()) return false;
  const seenSquares = new Set<string>();
  const enginePieces = engine.getAllPieces();
  if (world.pieces.size !== enginePieces.length) return false;

  for (const rec of enginePieces) {
    const p = world.pieces.get(rec.id);
    if (!p) return false;
    if (p.color !== rec.color || p.type !== rec.type || p.captured !== rec.captured) {
      return false;
    }
    if (!p.captured) {
      if (p.originSquare !== rec.square) return false;
      if (seenSquares.has(p.originSquare)) return false;
      seenSquares.add(p.originSquare);
    }
  }
  return true;
}

function resolveGrappleInitiation(
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  inputs: { w: CharacterInput; b: CharacterInput },
  events: PhysicsEvent[],
): void {
  if (world.cameraMode === 'observer' || world.pendingPromotion) {
    endGrapplePair(world, 'w', 'release', events);
    endGrapplePair(world, 'b', 'release', events);
    return;
  }

  for (const color of ['w', 'b'] as const) {
    const char = world.characters[color];
    const oppColor: PlayerColor = color === 'w' ? 'b' : 'w';
    const opp = world.characters[oppColor];
    const input = inputs[color];

    const holdingPiece = Boolean(
      char.leftHand.grabbedPieceId || char.rightHand.grabbedPieceId,
    );
    if (holdingPiece || input.grappleHeld === false) {
      continue;
    }

    const priorityDecision = evaluateGrabVsGrapplePriority(char, world, engine);
    if (priorityDecision.prioritizeChessPiece) {
      continue;
    }

    const grappleIntent =
      Boolean(input.grappleHeld) ||
      (input.leftHandHeld &&
        input.rightHandHeld &&
        !char.grappleTargetColor &&
        Math.hypot(opp.x - char.x, opp.z - char.z) <= GRAPPLE_MAX_RANGE + 0.9);

    if (!grappleIntent) continue;
    if (
      char.grappleTargetColor ||
      char.grabbedByColor ||
      char.stunTimer > 0 ||
      char.stumbleTimer > 0 ||
      char.punchSequenceCooldown > 0 ||
      char.punchesRemaining <= 0
    ) {
      continue;
    }

    const dx = opp.x - char.x;
    const dz = opp.z - char.z;
    const dist = Math.hypot(dx, dz);
    const fwdX = Math.sin(char.yaw);
    const fwdZ = Math.cos(char.yaw);
    const dot = dist > 1e-4 ? (dx * fwdX + dz * fwdZ) / dist : 1;

    if (
      dist <= GRAPPLE_MAX_RANGE &&
      (dot >= -0.2 || dist <= 1.65) &&
      !opp.isKnockedDown &&
      !opp.grabbedByColor &&
      !opp.grappleTargetColor &&
      opp.grappleEscapeCooldown <= 0
    ) {
      // Establish physical grapple and consume exactly ONE full punch charge
      char.grappleTargetColor = oppColor;
      char.grappleDuration = 0;
      char.grappleAttemptTimer = 0;
      char.leftHand.punchTimer = 0;
      char.rightHand.punchTimer = 0;
      char.punchesRemaining = Math.max(0, char.punchesRemaining - 1);
      if (char.punchesRemaining === 0) {
        triggerCombatCooldown(char);
      } else {
        syncCombatEnergyFromCharges(char);
      }

      opp.grabbedByColor = color;
      opp.grappleStruggleMeter = 0;
      opp.grappleTapCooldown = 0;

      // If victim was holding a chess piece with ONE hand, release it safely to be chess-validated.
      // Two-hand grips remain protected until sustained dragging exceeds threshold!
      const oppTwoHand = getTwoHandHeldPiece(opp, world);
      if (!oppTwoHand && (opp.leftHand.grabbedPieceId || opp.rightHand.grabbedPieceId)) {
        const kx = dist > 1e-4 ? dx / dist : fwdX;
        const kz = dist > 1e-4 ? dz / dist : fwdZ;
        releaseHeldPieceFromHit(opp, world, kx, kz, events);
      }

      events.push({
        type: 'grapple_start',
        color,
        targetColor: oppColor,
        x: opp.x,
        z: opp.z,
      });
    } else if (dist <= GRAPPLE_MAX_RANGE + 1.0 && char.grappleAttemptTimer <= 0) {
      // Out-of-range grab attempt must NOT consume any charge
      char.grappleAttemptTimer = 0.22;
      events.push({
        type: 'grapple_attempt',
        color,
        targetColor: oppColor,
        x: char.x,
        z: char.z,
      });
    }
  }
}

function stepActiveGrappleTethers(
  world: WorldPhysicsState,
  inputs: { w: CharacterInput; b: CharacterInput },
  dt: number,
  events: PhysicsEvent[],
): void {
  // Defensive orphan cleanup so permanent attachment is impossible
  for (const c of ['w', 'b'] as const) {
    const ch = world.characters[c];
    if (ch.grabbedByColor && world.characters[ch.grabbedByColor].grappleTargetColor !== c) {
      ch.grabbedByColor = null;
      ch.grappleStruggleMeter = 0;
    }
  }

  for (const grabberColor of ['w', 'b'] as const) {
    const grabber = world.characters[grabberColor];
    const victimColor = grabber.grappleTargetColor;
    if (!victimColor) continue;
    const victim = world.characters[victimColor];
    const grabberInput = inputs[grabberColor];

    const stillHoldingBoth =
      grabberInput.grappleHeld !== undefined
        ? grabberInput.grappleHeld
        : grabberInput.leftHandHeld && grabberInput.rightHandHeld;

    if (!stillHoldingBoth || grabber.stunTimer > 0 || grabber.isKnockedDown) {
      endGrapplePair(world, grabberColor, 'release', events);
      continue;
    }

    if (victim.grappleStruggleMeter >= 1.0) {
      endGrapplePair(world, grabberColor, 'break', events);
      continue;
    }

    grabber.grappleDuration += dt;

    // Physical spring-tether positioning (smooth velocity pull, zero teleportation)
    const dx = victim.x - grabber.x;
    const dz = victim.z - grabber.z;
    const dist = Math.hypot(dx, dz);
    const dirX = dist > 1e-4 ? dx / dist : Math.sin(grabber.yaw);
    const dirZ = dist > 1e-4 ? dz / dist : Math.cos(grabber.yaw);

    const desiredX = grabber.x + dirX * GRAPPLE_HOLD_DISTANCE;
    const desiredZ = grabber.z + dirZ * GRAPPLE_HOLD_DISTANCE;
    const errX = desiredX - victim.x;
    const errZ = desiredZ - victim.z;

    // Pull victim smoothly toward hold distance while preserving obstacle collisions
    const pullGain = 15.0;
    const damp = 1 - Math.exp(-pullGain * dt);
    const stepX = errX * damp;
    const stepZ = errZ * damp;
    // Cap per-step pull displacement so dragging cannot snap across obstacles
    const maxPullStep = GRAPPLE_DRAG_SPEED * 1.45 * dt;
    const stepLen = Math.hypot(stepX, stepZ);
    if (stepLen > maxPullStep && stepLen > 1e-4) {
      victim.x += (stepX / stepLen) * maxPullStep;
      victim.z += (stepZ / stepLen) * maxPullStep;
    } else {
      victim.x += stepX;
      victim.z += stepZ;
    }

    victim.vx = dampValue(victim.vx, grabber.vx * 0.85, 10.0, dt);
    victim.vz = dampValue(victim.vz, grabber.vz * 0.85, 10.0, dt);
    victim.x = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, victim.x));
    victim.z = Math.max(-BOARD_WALK_HALF, Math.min(BOARD_WALK_HALF, victim.z));
  }
}

function enforceGrappleObstacleStretch(
  world: WorldPhysicsState,
  events: PhysicsEvent[],
): void {
  for (const grabberColor of ['w', 'b'] as const) {
    const grabber = world.characters[grabberColor];
    const victimColor = grabber.grappleTargetColor;
    if (!victimColor) continue;
    const victim = world.characters[victimColor];
    const dist = Math.hypot(victim.x - grabber.x, victim.z - grabber.z);
    if (dist > GRAPPLE_MAX_STRETCH) {
      endGrapplePair(world, grabberColor, 'break', events);
    }
  }
}

export function stepWorldPhysics(
  world: WorldPhysicsState,
  engine: ChessMatchEngine,
  inputs: {
    w: CharacterInput;
    b: CharacterInput;
  },
  cameraYaw: number,
  rawDt: number,
): PhysicsEvent[] {
  const dt = Math.min(rawDt, 0.05);
  const events: PhysicsEvent[] = [];

  // Camera forward projected onto XZ plane
  const refForwardX = -Math.sin(cameraYaw);
  const refForwardZ = -Math.cos(cameraYaw);

  resolveGrappleInitiation(world, engine, inputs, events);

  stepCharacter(world.characters.w, inputs.w, refForwardX, refForwardZ, world, engine, dt, events);
  stepCharacter(world.characters.b, inputs.b, refForwardX, refForwardZ, world, engine, dt, events);

  stepActiveGrappleTethers(world, inputs, dt, events);
  resolveCombatHits(world, events);
  resolveCharacterCollisions(world);
  enforceGrappleObstacleStretch(world, events);
  stepPieces(world, engine, dt, events);

  return events;
}
