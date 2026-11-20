/** Small, allocation-free helpers used across the scene. */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** progress of v between a and b, clamped 0..1 */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = range(v, a, b);
  return t * t * (3 - 2 * t);
};
/** flat at both ends — makes camera "hold" each shot before moving */
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutBack = (t: number, s = 1.3) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** frame-rate independent exponential damping */
export const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));
/** a 0→1→0 envelope with soft shoulders, used for pour streams */
export const envelope = (p: number, inEnd = 0.08, outStart = 0.9) =>
  smoothstep(0, inEnd, p) * (1 - smoothstep(outStart, 1, p));

/** Deterministic PRNG so the drink is identical on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
