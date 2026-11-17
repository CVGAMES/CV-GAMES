const ALLOWED_PROFILES = new Set(['educvv dev', 'educvv dev1', 'lista']);

export function normalizeArenaProfileName(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

export function canAccessArenaProfile(serializedProfile: string | null): boolean {
  if (!serializedProfile) return false;

  try {
    const profile = JSON.parse(serializedProfile) as { nickname?: unknown } | null;
    return ALLOWED_PROFILES.has(normalizeArenaProfileName(profile?.nickname));
  } catch {
    return false;
  }
}
