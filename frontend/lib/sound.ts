/**
 * Generated sound effects using the Web Audio API.
 * No audio assets required — all tones are synthesized in-browser.
 * Works offline. ~zero bytes added to bundle.
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  _ctx = new AudioCtor();
  return _ctx;
}

/**
 * Defect buzzer — harsh sawtooth, two short blips. ~0.4s total.
 */
export function playBuzz(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const beepAt = (start: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, start);
    osc.frequency.exponentialRampToValueAtTime(120, start + 0.18);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  };

  beepAt(now);
  beepAt(now + 0.22);
}

/**
 * OK chime — short, friendly two-note ding. ~0.3s total.
 */
export function playChime(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const tone = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.14, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  };

  tone(880, now, 0.12);     // A5
  tone(1318, now + 0.08, 0.18); // E6
}

/**
 * Uncertain ping — single soft note. ~0.2s.
 */
export function playUncertain(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(560, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}
