/** Short UI sounds via Web Audio (no asset files). */

let audioCtx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(freq: number, duration: number, type: OscillatorType, gainStart: number, gainEnd: number) {
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gainStart, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0008, gainEnd), ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.02);
}

export function playGameSound(kind: "correct" | "wrong") {
  const ctx = context();
  if (!ctx) return;
  try {
    if (kind === "correct") {
      beep(523.25, 0.08, "sine", 0.09, 0.01);
      window.setTimeout(() => beep(659.25, 0.1, "sine", 0.08, 0.01), 55);
      window.setTimeout(() => beep(783.99, 0.15, "sine", 0.07, 0.001), 120);
    } else {
      beep(180, 0.12, "triangle", 0.1, 0.015);
      window.setTimeout(() => beep(140, 0.18, "triangle", 0.08, 0.005), 100);
    }
  } catch {
    /* browsers without full WebAudio */
  }
}
