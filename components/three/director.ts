import { COLORS } from "./dims";
import { clamp, envelope, lerp, range, smootherstep, smoothstep } from "./math";

/**
 * DIRECTOR — turns the story position `s` into a shot and an ingredient state.
 *
 * s = sectionIndex + progress through that section (viewport centre based).
 * Each beat owns a SHOT, keyed at the beat's centre (s = i + 0.5). Between
 * keys we blend with smootherstep, which has flat ends: the camera settles and
 * "holds" each composition while you read, then glides to the next one.
 *
 * Ingredient actions are scrubbed over explicit windows of s so they always
 * happen as their section enters the screen (and rewind when scrolling up).
 */
export type Shot = {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** horizontal framing of the glass in NDC (−1 left … 1 right), desktop only */
  shift: number;
  glow: number;
};

// Order matches lib/story.ts
export const SHOTS: Shot[] = [
  /* 0 inicio      — empty glass, hero */        { pos: [0.5, 1.9, 7.6],   target: [0, 1.25, 0],   fov: 30, shift: 0.36,  glow: 0.42 },
  /* 1 sobre-mi    — high angle, ice drop */     { pos: [2.0, 4.3, 6.5],   target: [0, 1.2, 0],    fov: 30, shift: -0.38, glow: 0.46 },
  /* 2 proyectos   — liquor pour */              { pos: [-2.0, 2.2, 6.9],  target: [0, 1.25, 0],   fov: 30, shift: 0.38,  glow: 0.6 },
  /* 3 webs        — low angle, fizz */          { pos: [1.5, 1.0, 6.1],   target: [0, 1.35, 0],   fov: 30, shift: -0.38, glow: 0.64 },
  /* 4 arsenal     — medium, centred, orbit */   { pos: [0, 3.0, 10.6],    target: [0, 1.3, 0],    fov: 28, shift: 0,     glow: 0.64 },
  /* 5 experiencia — garnish */                  { pos: [2.5, 3.5, 5.6],   target: [0.3, 1.85, 0], fov: 30, shift: 0.36,  glow: 0.68 },
  /* 6 formacion   — rim macro */                { pos: [-1.25, 3.55, 3.5], target: [-0.2, 2.3, 0.2], fov: 26, shift: -0.42, glow: 0.68 },
  /* 7 videos      — dew close-up */             { pos: [-1.0, 1.9, 7.4], target: [0, 1.45, 0],   fov: 30, shift: 0.5,   glow: 0.7 },
  /* 8 fotos       — atmosphere */               { pos: [1.3, 2.3, 7.1],   target: [0, 1.35, 0],   fov: 30, shift: -0.5,  glow: 0.7 },
  /* 9 contacto    — the finished drink */       { pos: [0, 1.8, 9.8],     target: [0, 1.32, 0],   fov: 28, shift: 0,     glow: 0.8 },
];

export type ShotState = {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  shift: number;
  glow: number;
  orbit: number;
};

const out: ShotState = { pos: [0, 0, 0], target: [0, 0, 0], fov: 30, shift: 0, glow: 0.5, orbit: 0 };

export function shotAt(s: number): ShotState {
  const n = SHOTS.length;
  const k = clamp(s - 0.5, 0, n - 1);
  const i = Math.min(n - 2, Math.floor(k));
  const f = smootherstep(k - i);
  const a = SHOTS[i], b = SHOTS[i + 1];
  for (let j = 0; j < 3; j++) {
    out.pos[j] = lerp(a.pos[j], b.pos[j], f);
    out.target[j] = lerp(a.target[j], b.target[j], f);
  }
  out.fov = lerp(a.fov, b.fov, f);
  out.shift = lerp(a.shift, b.shift, f);
  out.glow = lerp(a.glow, b.glow, f);
  // gentle orbit through the Arsenal beat (stirring), returns to 0 after
  const ar = range(s, 4.15, 4.85);
  out.orbit = Math.sin(ar * Math.PI) * 0.55;
  return out;
}

export type Ingredients = {
  ice: number;
  liquor: number;
  mixer: number;
  arsenal: number;
  garnish: number;
  rim: number;
  condensation: number;
  atmosphere: number;
  finale: number;
};

export function ingredientsAt(s: number): Ingredients {
  return {
    ice: range(s, 0.6, 1.4),
    liquor: range(s, 1.55, 2.45),
    mixer: range(s, 2.55, 3.45),
    // Arsenal is a sticky 300vh section: the stage is pinned for s ∈ ~[4.17, 4.83]
    arsenal: range(s, 4.1, 4.86),
    garnish: range(s, 4.95, 5.5),
    rim: range(s, 5.7, 6.45),
    condensation: range(s, 6.6, 7.45),
    atmosphere: smoothstep(6.8, 7.8, s),
    finale: range(s, 8.6, 9.35),
  };
}

export const pourEnvelope = (p: number) => envelope(p, 0.12, 0.88);
export const fillCurve = (p: number) => smoothstep(0.1, 0.95, p);
export const DRINK = COLORS;
