import { GRAPPLE_CHORD_WINDOW_SEC } from './constants';

export interface RawMouseCombatInput {
  leftHeld: boolean;
  rightHeld: boolean;
  leftJustPressed: boolean;
  rightJustPressed: boolean;
  leftJustReleased?: boolean;
  rightJustReleased?: boolean;
  bothHeldSinceLastTick?: boolean;
  leftPressedAtMs?: number | null;
  rightPressedAtMs?: number | null;
  nowMs?: number;
  alreadyCarryingPiece: boolean;
  alreadyGrappling: boolean;
  prioritizeChessPiece?: boolean;
  canPunchLeft?: boolean;
  canPunchRight?: boolean;
  inSequenceCooldown?: boolean;
}

export interface ResolvedMouseCombatInput {
  leftHandHeld: boolean;
  rightHandHeld: boolean;
  leftPunchPressed: boolean;
  rightPunchPressed: boolean;
  grappleHeld: boolean;
}

interface QueuedSingleClick {
  side: 'left' | 'right';
  pressedAtMs: number;
  releasedAtMs: number;
}

const SAME_HAND_BOUNCE_MS = 55;
const STALE_CLICK_EXPIRE_MS = 12000;

/**
 * Distinguishes simultaneous LMB + RMB holds (grappling) from individual
 * LMB or RMB clicks (left/right punches) using real-time DOM event recording
 * and timestamps so quick clicks are never lost even at very low FPS.
 */
export class CombatInputProcessor {
  private pendingSide: 'left' | 'right' | null = null;
  private pendingTimer = 0;
  private pendingPressedAtMs: number | null = null;
  private chordActive = false;
  private prevLeftHeld = false;
  private prevRightHeld = false;

  // DOM-event queue state (independent of render/simulation frame rate)
  private usingDomEvents = false;
  private domLeftHeld = false;
  private domRightHeld = false;
  private domPendingSide: 'left' | 'right' | null = null;
  private domPendingPressedAtMs = 0;
  private domChordActive = false;
  private queuedClicks: QueuedSingleClick[] = [];
  private lastDispatchedMs: Record<'left' | 'right', number> = {
    left: -Infinity,
    right: -Infinity,
  };

  reset(): void {
    this.pendingSide = null;
    this.pendingTimer = 0;
    this.pendingPressedAtMs = null;
    this.chordActive = false;
    this.prevLeftHeld = false;
    this.prevRightHeld = false;

    this.usingDomEvents = false;
    this.domLeftHeld = false;
    this.domRightHeld = false;
    this.domPendingSide = null;
    this.domPendingPressedAtMs = 0;
    this.domChordActive = false;
    this.queuedClicks = [];
    this.lastDispatchedMs.left = -Infinity;
    this.lastDispatchedMs.right = -Infinity;
  }

  /**
   * Call directly from DOM `mousedown` so every click is captured at exact event
   * time regardless of simulation framerate.
   */
  recordMouseDown(side: 'left' | 'right', nowMs: number): void {
    this.usingDomEvents = true;
    if (side === 'left') {
      this.domLeftHeld = true;
    } else {
      this.domRightHeld = true;
    }

    if (this.domLeftHeld && this.domRightHeld) {
      // Simultaneous LMB + RMB down -> grapple chord; cancel any pending single hold
      this.domChordActive = true;
      this.domPendingSide = null;
      this.domPendingPressedAtMs = 0;
      return;
    }

    if (this.domChordActive) {
      return;
    }

    this.domPendingSide = side;
    this.domPendingPressedAtMs = nowMs;
  }

  /**
   * Call directly from DOM `mouseup` so rapid clicks that start and finish
   * between simulation frames are queued instead of lost.
   */
  recordMouseUp(side: 'left' | 'right', nowMs: number): void {
    this.usingDomEvents = true;
    if (side === 'left') {
      this.domLeftHeld = false;
    } else {
      this.domRightHeld = false;
    }

    if (this.domChordActive) {
      this.domPendingSide = null;
      if (!this.domLeftHeld && !this.domRightHeld) {
        this.domChordActive = false;
      }
      return;
    }

    if (this.domPendingSide === side) {
      const pressedAtMs = this.domPendingPressedAtMs;
      this.domPendingSide = null;
      this.domPendingPressedAtMs = 0;

      // Guard against accidental hardware micro-bounce on the same button
      if (pressedAtMs - this.lastDispatchedMs[side] >= SAME_HAND_BOUNCE_MS) {
        this.queuedClicks.push({ side, pressedAtMs, releasedAtMs: nowMs });
        if (this.queuedClicks.length > 12) {
          this.queuedClicks.shift();
        }
      }
    }
  }

  private popQueuedClick(side: 'left' | 'right', nowMs: number, canPunch: boolean): boolean {
    if (!canPunch) return false;
    for (let i = 0; i < this.queuedClicks.length; i++) {
      const entry = this.queuedClicks[i];
      if (nowMs - entry.releasedAtMs > STALE_CLICK_EXPIRE_MS) {
        this.queuedClicks.splice(i, 1);
        i -= 1;
        continue;
      }
      if (entry.side === side) {
        this.queuedClicks.splice(i, 1);
        if (entry.pressedAtMs - this.lastDispatchedMs[side] < SAME_HAND_BOUNCE_MS) {
          continue;
        }
        this.lastDispatchedMs[side] = entry.pressedAtMs;
        return true;
      }
    }
    return false;
  }

  private stepWithDomQueue(raw: RawMouseCombatInput): ResolvedMouseCombatInput {
    const nowMs = raw.nowMs ?? 0;
    const canLeft = raw.canPunchLeft ?? true;
    const canRight = raw.canPunchRight ?? true;

    // Preserve instant chess-piece grabbing/carrying without grapple chord delay
    if (raw.alreadyCarryingPiece || raw.prioritizeChessPiece) {
      this.domChordActive = false;
      let leftPunchPressed = false;
      let rightPunchPressed = false;

      if (this.domPendingSide === 'left' && this.domLeftHeld) {
        this.domPendingSide = null;
        if (canLeft && nowMs - this.lastDispatchedMs.left >= SAME_HAND_BOUNCE_MS) {
          this.lastDispatchedMs.left = this.domPendingPressedAtMs || nowMs;
          leftPunchPressed = true;
        }
      } else if (this.domPendingSide === 'right' && this.domRightHeld) {
        this.domPendingSide = null;
        if (canRight && nowMs - this.lastDispatchedMs.right >= SAME_HAND_BOUNCE_MS) {
          this.lastDispatchedMs.right = this.domPendingPressedAtMs || nowMs;
          rightPunchPressed = true;
        }
      }

      if (!leftPunchPressed) leftPunchPressed = this.popQueuedClick('left', nowMs, canLeft);
      if (!rightPunchPressed) rightPunchPressed = this.popQueuedClick('right', nowMs, canRight);

      return {
        leftHandHeld: raw.leftHeld,
        rightHandHeld: raw.rightHeld,
        leftPunchPressed,
        rightPunchPressed,
        grappleHeld: false,
      };
    }

    if (this.domChordActive || (raw.leftHeld && raw.rightHeld)) {
      this.domChordActive = raw.leftHeld || raw.rightHeld;
      this.domPendingSide = null;
      this.queuedClicks = [];
      return {
        leftHandHeld: raw.leftHeld,
        rightHandHeld: raw.rightHeld,
        leftPunchPressed: false,
        rightPunchPressed: false,
        grappleHeld: raw.leftHeld && raw.rightHeld,
      };
    }

    if (raw.inSequenceCooldown) {
      this.queuedClicks = [];
    }

    let leftPunchPressed = this.popQueuedClick('left', nowMs, canLeft);
    let rightPunchPressed = this.popQueuedClick('right', nowMs, canRight);

    // Promote a single held button once the 85ms simultaneous-chord grace window elapses
    if (this.domPendingSide) {
      const elapsedSec = Math.max(0, (nowMs - this.domPendingPressedAtMs) / 1000);
      if (elapsedSec >= GRAPPLE_CHORD_WINDOW_SEC || raw.alreadyGrappling) {
        const side = this.domPendingSide;
        const pressedAtMs = this.domPendingPressedAtMs;
        this.domPendingSide = null;
        this.domPendingPressedAtMs = 0;

        if (side === 'left' && !leftPunchPressed && canLeft) {
          if (pressedAtMs - this.lastDispatchedMs.left >= SAME_HAND_BOUNCE_MS) {
            this.lastDispatchedMs.left = pressedAtMs;
            leftPunchPressed = true;
          }
        } else if (side === 'right' && !rightPunchPressed && canRight) {
          if (pressedAtMs - this.lastDispatchedMs.right >= SAME_HAND_BOUNCE_MS) {
            this.lastDispatchedMs.right = pressedAtMs;
            rightPunchPressed = true;
          }
        }
      }
    }

    const suppressLeftHold = this.domPendingSide === 'left';
    const suppressRightHold = this.domPendingSide === 'right';

    return {
      leftHandHeld: suppressLeftHold ? false : raw.leftHeld,
      rightHandHeld: suppressRightHold ? false : raw.rightHeld,
      leftPunchPressed,
      rightPunchPressed,
      grappleHeld: false,
    };
  }

  private startPending(
    side: 'left' | 'right',
    pressedAtMs: number | null | undefined,
    nowMs: number | undefined,
  ): void {
    this.pendingSide = side;
    if (nowMs !== undefined && pressedAtMs !== undefined && pressedAtMs !== null) {
      this.pendingPressedAtMs = pressedAtMs;
      const elapsedSec = Math.max(0, (nowMs - pressedAtMs) / 1000);
      this.pendingTimer = Math.max(0, GRAPPLE_CHORD_WINDOW_SEC - elapsedSec);
    } else {
      this.pendingPressedAtMs = null;
      this.pendingTimer = GRAPPLE_CHORD_WINDOW_SEC;
    }
  }

  private clearPending(): void {
    this.pendingSide = null;
    this.pendingTimer = 0;
    this.pendingPressedAtMs = null;
  }

  step(raw: RawMouseCombatInput, dt: number): ResolvedMouseCombatInput {
    if (this.usingDomEvents) {
      return this.stepWithDomQueue(raw);
    }

    const leftEdge = raw.leftJustPressed || (raw.leftHeld && !this.prevLeftHeld);
    const rightEdge = raw.rightJustPressed || (raw.rightHeld && !this.prevRightHeld);
    const leftReleased = Boolean(raw.leftJustReleased) || (!raw.leftHeld && this.prevLeftHeld);
    const rightReleased = Boolean(raw.rightJustReleased) || (!raw.rightHeld && this.prevRightHeld);

    this.prevLeftHeld = raw.leftHeld;
    this.prevRightHeld = raw.rightHeld;

    let leftPunchPressed = false;
    let rightPunchPressed = false;

    // Preserve instant chess-piece grabbing/carrying without grapple chord delay
    if (raw.alreadyCarryingPiece || raw.prioritizeChessPiece) {
      this.clearPending();
      this.chordActive = false;
      return {
        leftHandHeld: raw.leftHeld,
        rightHandHeld: raw.rightHeld,
        leftPunchPressed: leftEdge,
        rightPunchPressed: rightEdge,
        grappleHeld: false,
      };
    }

    // Simultaneous hold -> active grapple
    if (raw.leftHeld && raw.rightHeld) {
      this.clearPending();
      this.chordActive = true;
      return {
        leftHandHeld: true,
        rightHandHeld: true,
        leftPunchPressed: false,
        rightPunchPressed: false,
        grappleHeld: true,
      };
    }

    // End active chord cleanly once either button releases, without swallowing fresh clicks
    if (this.chordActive) {
      this.chordActive = false;
      this.clearPending();
      if (!leftEdge && !rightEdge && (leftReleased || rightReleased)) {
        return {
          leftHandHeld: raw.leftHeld,
          rightHandHeld: raw.rightHeld,
          leftPunchPressed: false,
          rightPunchPressed: false,
          grappleHeld: false,
        };
      }
    }

    // Brief simultaneous overlap that fully released before this frame
    if (raw.bothHeldSinceLastTick && !raw.leftHeld && !raw.rightHeld) {
      this.clearPending();
      return {
        leftHandHeld: false,
        rightHandHeld: false,
        leftPunchPressed: false,
        rightPunchPressed: false,
        grappleHeld: false,
      };
    }

    // Resolve any pending single-button hold from a previous frame
    if (this.pendingSide === 'left') {
      if (rightEdge && (raw.rightHeld || raw.bothHeldSinceLastTick) && (!leftReleased || raw.bothHeldSinceLastTick)) {
        this.clearPending();
        this.chordActive = true;
        return {
          leftHandHeld: true,
          rightHandHeld: true,
          leftPunchPressed: false,
          rightPunchPressed: false,
          grappleHeld: true,
        };
      }
      if (leftReleased || !raw.leftHeld) {
        this.clearPending();
        leftPunchPressed = true;
      }
    } else if (this.pendingSide === 'right') {
      if (leftEdge && (raw.leftHeld || raw.bothHeldSinceLastTick) && (!rightReleased || raw.bothHeldSinceLastTick)) {
        this.clearPending();
        this.chordActive = true;
        return {
          leftHandHeld: true,
          rightHandHeld: true,
          leftPunchPressed: false,
          rightPunchPressed: false,
          grappleHeld: true,
        };
      }
      if (rightReleased || !raw.rightHeld) {
        this.clearPending();
        rightPunchPressed = true;
      }
    }

    // Quick completed taps (down + up within a single frame or low-FPS tick) must fire immediately
    const leftCompletedTap = leftEdge && !raw.leftHeld && !raw.bothHeldSinceLastTick;
    const rightCompletedTap = rightEdge && !raw.rightHeld && !raw.bothHeldSinceLastTick;

    if (leftCompletedTap && !leftPunchPressed) {
      leftPunchPressed = true;
    }
    if (rightCompletedTap && !rightPunchPressed) {
      rightPunchPressed = true;
    }

    // Start chord detection window for single buttons still held down
    if (leftEdge && raw.leftHeld && !raw.rightHeld && !raw.alreadyGrappling) {
      if (this.pendingSide === 'right') {
        this.clearPending();
        this.chordActive = true;
        return {
          leftHandHeld: true,
          rightHandHeld: true,
          leftPunchPressed: false,
          rightPunchPressed: false,
          grappleHeld: true,
        };
      }
      this.startPending('left', raw.leftPressedAtMs, raw.nowMs);
    } else if (rightEdge && raw.rightHeld && !raw.leftHeld && !raw.alreadyGrappling) {
      if (this.pendingSide === 'left') {
        this.clearPending();
        this.chordActive = true;
        return {
          leftHandHeld: true,
          rightHandHeld: true,
          leftPunchPressed: false,
          rightPunchPressed: false,
          grappleHeld: true,
        };
      }
      this.startPending('right', raw.rightPressedAtMs, raw.nowMs);
    }

    // Advance chord detection window (prefer real-time DOM timestamps when provided)
    if (this.pendingSide) {
      if (raw.nowMs !== undefined && this.pendingPressedAtMs !== null) {
        const elapsedSec = Math.max(0, (raw.nowMs - this.pendingPressedAtMs) / 1000);
        this.pendingTimer = Math.max(0, GRAPPLE_CHORD_WINDOW_SEC - elapsedSec);
      } else {
        this.pendingTimer -= dt;
      }

      if (this.pendingTimer <= 0) {
        if (this.pendingSide === 'left' && raw.leftHeld) {
          leftPunchPressed = true;
        } else if (this.pendingSide === 'right' && raw.rightHeld) {
          rightPunchPressed = true;
        }
        this.clearPending();
      }
    }

    // Suppress rising-edge hold while waiting for chord window
    const suppressLeftHold = this.pendingSide === 'left';
    const suppressRightHold = this.pendingSide === 'right';

    return {
      leftHandHeld: suppressLeftHold ? false : raw.leftHeld,
      rightHandHeld: suppressRightHold ? false : raw.rightHeld,
      leftPunchPressed,
      rightPunchPressed,
      grappleHeld: false,
    };
  }
}
