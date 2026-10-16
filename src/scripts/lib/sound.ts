// Tiny WebAudio synth. Off by default; only created after an explicit toggle.
let ctx: AudioContext | null = null;
let enabled = false;
const KEY = 'upampi:sound';

export const soundEnabled = () => enabled;

export function setSound(on: boolean) {
  enabled = on;
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {}
  if (on && !ctx) ctx = new AudioContext();
  if (on) ctx?.resume();
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Desactivar sonido' : 'Activar sonido');
  });
}

export function restoreSound() {
  let on = false;
  try {
    on = sessionStorage.getItem(KEY) === '1';
  } catch {}
  // Audio needs a user gesture; restore the visual state and lazily resume.
  if (on) setSound(true);
}

let last = 0;
/** A soft plucked tone; `pitch` 0..1 maps to a pentatonic scale. */
export function pluck(pitch: number, gain = 0.06) {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  if (now - last < 0.035) return;
  last = now;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const note = scale[Math.min(scale.length - 1, Math.floor(pitch * scale.length))];
  const freq = 196 * Math.pow(2, note / 12);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  f.type = 'lowpass';
  f.frequency.value = 2400;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  osc.connect(f).connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1);
}
