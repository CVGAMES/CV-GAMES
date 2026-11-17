export function computeEffectiveGain(
  baseGain: number,
  muted: boolean,
  masterVolume: number,
  sfxVolume: number,
): number {
  if (muted) return 0;
  const master = Math.max(0, Math.min(1, Number.isFinite(masterVolume) ? masterVolume : 1));
  const sfx = Math.max(0, Math.min(1, Number.isFinite(sfxVolume) ? sfxVolume : 1));
  return Math.max(0, baseGain * master * sfx);
}

class SoundFX {
  private ctx: AudioContext | null = null;
  private muted = false;
  private masterVolume = 1.0;
  private sfxVolume = 1.0;
  private lastStepTime = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || this.masterVolume <= 0.001 || this.sfxVolume <= 0.001) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private scaleGain(baseGain: number): number {
    return Math.max(0.001, computeEffectiveGain(baseGain, this.muted, this.masterVolume, this.sfxVolume));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolumes(masterVolume: number, sfxVolume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, Number.isFinite(masterVolume) ? masterVolume : 1));
    this.sfxVolume = Math.max(0, Math.min(1, Number.isFinite(sfxVolume) ? sfxVolume : 1));
  }

  playStep(): void {
    const now = performance.now();
    if (now - this.lastStepTime < 220) return;
    this.lastStepTime = now;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const pitch = 115 + (Math.random() - 0.5) * 20;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.055);
    gain.gain.setValueAtTime(this.scaleGain(0.06), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.065);
  }

  playJump(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.14);
    gain.gain.setValueAtTime(this.scaleGain(0.1), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playLand(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(135, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.09);
    gain.gain.setValueAtTime(this.scaleGain(0.11), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  playGrab(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.07);
    gain.gain.setValueAtTime(this.scaleGain(0.1), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playPlaceValid(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // Crisp wooden clack: two short resonant transients
    [220, 480].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.08);
      gain.gain.setValueAtTime(this.scaleGain(idx === 0 ? 0.18 : 0.09), t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  playPlaceInvalid(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(195, t);
    osc.frequency.exponentialRampToValueAtTime(115, t + 0.15);
    gain.gain.setValueAtTime(this.scaleGain(0.06), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  playCapture(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(310, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.18);
    gain.gain.setValueAtTime(this.scaleGain(0.09), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.19);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playPunchSwing(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.08);
    gain.gain.setValueAtTime(this.scaleGain(0.06), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.095);
  }

  playPunchHit(knockdown: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(knockdown ? 175 : 210, t);
    osc.frequency.exponentialRampToValueAtTime(knockdown ? 42 : 62, t + (knockdown ? 0.16 : 0.11));
    gain.gain.setValueAtTime(this.scaleGain(knockdown ? 0.22 : 0.16), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + (knockdown ? 0.17 : 0.12));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + (knockdown ? 0.18 : 0.13));
  }

  playGrappleGrab(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.09);
    gain.gain.setValueAtTime(this.scaleGain(0.14), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playGrappleBreak(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.14);
    gain.gain.setValueAtTime(this.scaleGain(0.11), t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playVictory(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = t + i * 0.09;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(this.scaleGain(0.11), start);
      gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  playDefeat(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = t + i * 0.11;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(this.scaleGain(0.09), start);
      gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }
}

export const soundFX = new SoundFX();
