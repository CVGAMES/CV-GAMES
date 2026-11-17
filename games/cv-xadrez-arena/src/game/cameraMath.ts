export const CHAR_CAM_MIN_PITCH = 0.06;
export const CHAR_CAM_MAX_PITCH = 1.36;
export const CHAR_CAM_MIN_DIST = 8.0;
export const CHAR_CAM_MAX_DIST = 32.0;

export interface CameraOrbitTarget {
  yaw: number;
  pitch: number;
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeAngle(a: number): number {
  let angle = a;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

/**
 * Applies clamped mouse movement deltas to third-person camera yaw and pitch targets.
 * - Positive dx (moving mouse right) rotates camera look direction right (decreases yaw).
 * - Positive dy (moving mouse down) raises camera elevation (increases pitch) within safe limits.
 */
export function applyMouseLookDelta(
  current: CameraOrbitTarget,
  rawDx: number,
  rawDy: number,
  yawSensitivity = 0.0042,
  pitchSensitivity = 0.0036,
): CameraOrbitTarget {
  const dx = clampValue(rawDx, -60, 60);
  const dy = clampValue(rawDy, -60, 60);
  return {
    yaw: current.yaw - dx * yawSensitivity,
    pitch: clampValue(current.pitch + dy * pitchSensitivity, CHAR_CAM_MIN_PITCH, CHAR_CAM_MAX_PITCH),
  };
}

/**
 * Computes desired third-person camera world coordinates around a focus point.
 * Keeps camera safely above the chessboard surface.
 */
export function computeThirdPersonCameraPosition(
  focus: { x: number; y: number; z: number },
  yaw: number,
  pitch: number,
  dist: number,
): { x: number; y: number; z: number } {
  const clampedPitch = clampValue(pitch, CHAR_CAM_MIN_PITCH, CHAR_CAM_MAX_PITCH);
  const clampedDist = clampValue(dist, CHAR_CAM_MIN_DIST, CHAR_CAM_MAX_DIST);
  const horizDist = Math.cos(clampedPitch) * clampedDist;
  const vertDist = Math.sin(clampedPitch) * clampedDist;
  return {
    x: focus.x + Math.sin(yaw) * horizDist,
    y: Math.max(1.35, focus.y + vertDist),
    z: focus.z + Math.cos(yaw) * horizDist,
  };
}
