export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  mouseLockSensitivity: number;
  graphicsQuality: GraphicsQuality;
  showControlsBar: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  muted: false,
  masterVolume: 1.0,
  sfxVolume: 1.0,
  cameraSensitivity: 1.0,
  mouseLockSensitivity: 1.0,
  graphicsQuality: 'high',
  showControlsBar: true,
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function normalizeGameSettings(
  raw: Partial<GameSettings> | null | undefined,
  defaultShowControls = true,
): GameSettings {
  const source = raw ?? {};
  const validQuality: GraphicsQuality =
    source.graphicsQuality === 'low' ||
    source.graphicsQuality === 'medium' ||
    source.graphicsQuality === 'high'
      ? source.graphicsQuality
      : DEFAULT_GAME_SETTINGS.graphicsQuality;

  return {
    muted: typeof source.muted === 'boolean' ? source.muted : DEFAULT_GAME_SETTINGS.muted,
    masterVolume: clampNumber(source.masterVolume, 0, 1, DEFAULT_GAME_SETTINGS.masterVolume),
    sfxVolume: clampNumber(source.sfxVolume, 0, 1, DEFAULT_GAME_SETTINGS.sfxVolume),
    cameraSensitivity: clampNumber(
      source.cameraSensitivity,
      0.5,
      1.8,
      DEFAULT_GAME_SETTINGS.cameraSensitivity,
    ),
    mouseLockSensitivity: clampNumber(
      source.mouseLockSensitivity,
      0.5,
      1.8,
      DEFAULT_GAME_SETTINGS.mouseLockSensitivity,
    ),
    graphicsQuality: validQuality,
    showControlsBar:
      typeof source.showControlsBar === 'boolean' ? source.showControlsBar : defaultShowControls,
  };
}

export function resolveGraphicsProfile(
  quality: GraphicsQuality,
  devicePixelRatio: number,
  isSoftwareGl: boolean,
): { pixelRatio: number; shadowsEnabled: boolean } {
  if (isSoftwareGl) {
    return { pixelRatio: 1, shadowsEnabled: false };
  }
  const safeDpr = Math.max(1, Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1);
  if (quality === 'low') {
    return { pixelRatio: 1, shadowsEnabled: false };
  }
  if (quality === 'medium') {
    return { pixelRatio: Math.min(safeDpr, 1.5), shadowsEnabled: true };
  }
  return { pixelRatio: Math.min(safeDpr, 2), shadowsEnabled: true };
}
