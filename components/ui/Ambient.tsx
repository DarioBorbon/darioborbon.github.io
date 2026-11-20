"use client";

import { useEffect, useRef } from "react";

/**
 * AMBIENT — the room around the glass, so the page is never a flat black.
 *
 *  · out-of-focus bar lights (big soft bokeh) drifting slowly
 *  · tiny specks rising like loose fizz
 *  · a fine dot grid, almost invisible, that lights up around the cursor
 *
 * Rendered INSIDE the scene layer (FootageStage), under the footage canvas,
 * so the canvas' screen blend dissolves its black into these lights.
 * The film grain lives in app/page.tsx (.grain).
 *
 * Everything is CSS-animated; JS only feeds the (smoothed) pointer and scroll
 * position for parallax. Reduced-motion turns the drift off (globals.css).
 */

/* big blurred lights: x/y in %, size in vw, rgb, alpha, drift duration (s) */
const ORBS = [
  { x: 6, y: 14, s: 30, c: "255,61,139", a: 0.13, d: 38 },
  { x: 80, y: 8, s: 22, c: "255,166,92", a: 0.08, d: 46 },
  { x: 64, y: 66, s: 34, c: "176,22,90", a: 0.16, d: 52 },
  { x: 18, y: 78, s: 20, c: "255,143,184", a: 0.08, d: 34 },
  { x: 94, y: 44, s: 14, c: "255,204,150", a: 0.07, d: 28 },
  { x: 38, y: 36, s: 12, c: "255,143,184", a: 0.05, d: 30 },
];

/* deterministic pseudo-random so server and client render the same specks */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const r = rng(7);
const SPECKS = Array.from({ length: 22 }, () => ({
  x: r() * 100,
  size: 2 + r() * 5,
  dur: 18 + r() * 26,
  delay: -r() * 40,
  sway: (r() - 0.5) * 60,
  o: 0.18 + r() * 0.35,
}));

export function Ambient() {
  const root = useRef<HTMLDivElement>(null);
  const orbs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const layer = orbs.current!;
    const target = { x: -9999, y: -9999 };
    const cur = { x: -9999, y: -9999 };
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (cur.x < -999) {
        cur.x = target.x;
        cur.y = target.y;
      }
    };
    const onLeave = () => {
      target.x = target.y = -9999;
      cur.x = cur.y = -9999;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.pow(0.0015, dt); // frame-rate independent easing
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      el.style.setProperty("--mx", `${cur.x}px`);
      el.style.setProperty("--my", `${cur.y}px`);

      // parallax: lights lean away from the cursor and breathe with scroll
      const w = window.innerWidth, h = window.innerHeight;
      const px = target.x > -999 ? (cur.x / w - 0.5) * -26 : 0;
      const py = target.y > -999 ? (cur.y / h - 0.5) * -18 : 0;
      const sy = Math.sin(window.scrollY / 900) * 40;
      layer.style.transform = `translate3d(${px}px, ${py + sy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
      <div ref={root} className="ambient" aria-hidden="true">
        <div ref={orbs} className="ambient-orbs">
          {ORBS.map((o, i) => (
            <span
              key={i}
              className="orb"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.s}vw`,
                height: `${o.s}vw`,
                background: `radial-gradient(closest-side, rgba(${o.c},${o.a}), rgba(${o.c},${o.a * 0.35}) 55%, transparent)`,
                animationDuration: `${o.d}s`,
                animationDelay: `${-i * 7}s`,
              }}
            />
          ))}
        </div>
        <div className="ambient-specks">
          {SPECKS.map((s, i) => (
            <span
              key={i}
              className="speck"
              style={
                {
                  left: `${s.x}%`,
                  width: s.size,
                  height: s.size,
                  opacity: s.o,
                  animationDuration: `${s.dur}s`,
                  animationDelay: `${s.delay}s`,
                  "--sway": `${s.sway}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="ambient-grid" />
        <div className="ambient-grid ambient-grid--lit" />
        <div className="ambient-vignette" />
      </div>
  );
}
