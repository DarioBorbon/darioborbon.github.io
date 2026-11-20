"use client";

import { useEffect, useRef } from "react";
import { STORY } from "@/lib/story";
import { getPrefs, setPrefs, subscribe } from "@/lib/prefs";
import { Ambient } from "@/components/ui/Ambient";
import { asset } from "@/lib/asset";

/**
 * FOOTAGE STAGE — the drink being made, for real.
 *
 * One continuous shot of a real highball glass on black (ice drops in, citrus
 * follows, the drink is poured to the top) is exported as a frame sequence
 * (scripts/prepare-stage.mjs) and scrubbed by scroll on a <canvas>: scrolling
 * down builds the drink, scrolling up un-builds it.
 *
 * Each section owns a slice of the footage (END_FRAME): the action plays as
 * the section enters the screen and then holds while you read.
 */
const TOTAL = 234;
const src = (n: number) => asset(`/assets/stage/seq/f${String(n).padStart(3, "0")}.webp`);

/** last frame reached by each beat (order = lib/story.ts) */
const END_FRAME = [
  /* 0 inicio      empty glass       */ 19,
  /* 1 sobre-mi    ice falls         */ 56,
  /* 2 proyectos   citrus drops in   */ 83,
  /* 3 webs        first pour        */ 108,
  /* 4 arsenal     the mix rises     */ 134,
  /* 5 experiencia body              */ 152,
  /* 6 formacion   filled to the top */ 170,
  /* 7 videos      bubbles settle    */ 196,
  /* 8 fotos       resting           */ 219,
  /* 9 contacto    served            */ 233,
];
/** scroll window [from, to] (in story units) in which beat i plays its slice */
const windowOf = (i: number): [number, number] => (i === 4 ? [3.7, 4.8] : [i - 0.42, i + 0.3]);

const sideX = (i: number) => {
  const g = STORY[i]?.glass ?? "center";
  return g === "right" ? 54 : g === "left" ? 0 : 27; // vw (panel is 46vw wide)
};

export default function FootageStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const frames: (HTMLImageElement | null)[] = new Array(TOTAL).fill(null);
    let cancelled = false;

    /* ---- progressive loading: first slice now, the rest in order ---- */
    const load = (n: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          frames[n] = img;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = src(n);
      });
    (async () => {
      await Promise.all(Array.from({ length: 24 }, (_, n) => load(n)));
      if (cancelled) return;
      setPrefs({ ready: true });
      let next = 24;
      const worker = async () => {
        while (!cancelled && next < TOTAL) await load(next++);
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    })();

    /* ---- story position (same maths as the sections) ---- */
    let sections: { top: number; height: number }[] = [];
    const measure = () => {
      sections = STORY.map((b) => {
        const el = document.getElementById(b.id);
        if (!el) return { top: 0, height: 1 };
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, height: Math.max(1, r.height) };
      });
    };
    const target = () => {
      const c = window.scrollY + window.innerHeight * 0.5;
      let s = 0;
      sections.forEach((sec, i) => {
        if (c >= sec.top) s = i + Math.min(1, (c - sec.top) / sec.height);
      });
      return Math.min(s, STORY.length - 0.0001);
    };
    const frameAt = (s: number) => {
      let f = END_FRAME[0] * Math.min(1, s / 0.5);
      for (let i = 1; i < END_FRAME.length; i++) {
        const [a, b] = windowOf(i);
        const p = Math.min(1, Math.max(0, (s - a) / (b - a)));
        f += p * (END_FRAME[i] - END_FRAME[i - 1]);
      }
      return f;
    };

    /* ---- fizz: fine bubbles rising through the real liquid ----
     * The liquid surface is read from the footage itself (topmost saturated
     * red row in the middle of the glass), so bubbles only live in the drink. */
    const BASE_Y = 612;           // inner floor of the glass in the 480×720 frame
    const X0 = 158, X1 = 352;     // inner walls
    const levels: number[] = [];
    let level = BASE_Y;
    const readLevel = () => {
      // scan upward from the glass floor: the liquid is the unbroken red run
      // that starts at the bottom (so floating citrus is never mistaken for it)
      const x0 = X0 + 10, w = X1 - X0 - 20, top = 60;
      const rows = BASE_Y - top;
      const d = ctx.getImageData(x0, top, w, rows).data;
      let surface = rows, gap = 0;
      for (let y = rows - 6; y >= 0; y -= 2) {
        let hits = 0, n = 0;
        for (let x = 0; x < w; x += 5, n++) {
          const k = (y * w + x) * 4;
          if (d[k] > 95 && d[k] > d[k + 1] * 1.55 && d[k] > d[k + 2] * 1.55) hits++;
        }
        if (hits > n * 0.3) {
          surface = y;
          gap = 0;
        } else if ((gap += 2) > 36 || surface === rows) {
          if (surface === rows && gap <= 36) continue;
          break;
        }
      }
      return surface + top;
    };
    type Bubble = { x: number; y: number; r: number; v: number; ph: number; cling: boolean };
    const bubbles: Bubble[] = [];
    const spawn = (b: Bubble, anywhere: boolean) => {
      b.cling = Math.random() < 0.22;
      b.x = b.cling ? (Math.random() < 0.5 ? X0 + Math.random() * 10 : X1 - Math.random() * 10) : X0 + 14 + Math.random() * (X1 - X0 - 28);
      b.y = anywhere ? level + Math.random() * (BASE_Y - level) : BASE_Y - Math.random() * 24;
      b.r = 0.8 + Math.pow(Math.random(), 2.2) * 2.4;
      b.v = b.cling ? 3 + Math.random() * 6 : 26 + b.r * 22 + Math.random() * 20;
      b.ph = Math.random() * 6.28;
    };
    for (let i = 0; i < 70; i++) {
      const b = { x: 0, y: 0, r: 1, v: 1, ph: 0, cling: false };
      bubbles.push(b);
    }
    let seeded = false;
    const drawBubbles = (dt: number, reduced: boolean) => {
      const depth = BASE_Y - level;
      if (depth < 26) {
        seeded = false;
        return;
      }
      if (!seeded) {
        bubbles.forEach((b) => spawn(b, true));
        seeded = true;
      }
      const count = Math.min(bubbles.length, Math.round(depth / 5.5));
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < count; i++) {
        const b = bubbles[i];
        if (!reduced) {
          b.y -= b.v * dt;
          b.ph += dt * 3;
        }
        if (b.y < level + 4 || b.y > BASE_Y) spawn(b, false);
        const x = b.x + (b.cling ? 0 : Math.sin(b.ph) * 1.6);
        const fade = Math.min(1, (b.y - level) / 26) * Math.min(1, (BASE_Y - b.y) / 14 + 0.3);
        ctx.strokeStyle = `rgba(255,236,232,${(0.5 * fade).toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, 6.283);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,250,246,${(0.8 * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.35, b.r * 0.32), 0, 6.283);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let s = target();
    let lastT = performance.now();
    let idle = 0;
    let clock = 0;
    let drawn = -1;
    let raf = 0;
    let lastActive = -1;
    let running = true;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const reduced = getPrefs().motion === "reduced";
      const t = target();
      // damped scroll: the footage glides instead of stuttering with the wheel
      s += (t - s) * (reduced ? 0.35 : 0.085);
      if (Math.abs(t - s) < 0.0005) s = t;

      const active = Math.floor(t);
      if (active !== lastActive) {
        lastActive = active;
        setPrefs({ active });
      }

      /* ---- ALIVE AT REST ----
       * When the wheel stops, the footage keeps breathing: it drifts a few
       * real frames back and forth (sub-frame blended, so it is smooth) —
       * ice glints, the stream shimmers, the surface trembles. */
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const moving = Math.abs(t - s) > 0.004;
      idle += ((moving || reduced ? 0 : 1) - idle) * Math.min(1, dt * (moving ? 6 : 1.4));
      clock += dt;
      const sway = (Math.sin(clock * 2.1) * 2.2 + Math.sin(clock * 0.83 + 1.3) * 1.3) * idle;

      const f = Math.min(TOTAL - 1.001, Math.max(0, frameAt(s) + sway));
      let n = Math.floor(f);
      while (n > 0 && !frames[n]) n--;
      const a = frames[n + 1] ? f - Math.floor(f) : 0;
      const img = frames[n];
      if (img) {
        const key = n + a;
        if (key !== drawn || level < BASE_Y) {
          drawn = key;
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (a > 0.02) {
            ctx.globalAlpha = a;
            ctx.drawImage(frames[n + 1]!, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
          }
          // where is the liquid surface in this frame? (cached per frame)
          if (levels[n] === undefined) levels[n] = readLevel();
          level += (levels[n] - level) * 0.2;
          drawBubbles(dt, reduced);
        }
      }

      // glide to the side opposite the text
      const panel = panelRef.current;
      if (panel) {
        if (window.innerWidth < 900) panel.style.transform = "none";
        else {
          const i = Math.min(STORY.length - 1, Math.floor(s));
          const j = Math.min(STORY.length - 1, i + 1);
          const f = Math.min(1, Math.max(0, (s - i - 0.62) / 0.38));
          const e = f * f * f * (f * (f * 6 - 15) + 10);
          panel.style.transform = `translate3d(${(sideX(i) * (1 - e) + sideX(j) * e).toFixed(3)}vw,0,0)`;
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    const onVis = () => {
      running = !document.hidden && getPrefs().scene3d;
      cancelAnimationFrame(raf);
      if (running) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    const unsub = subscribe(onVis);
    tick();

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsub();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="scene-layer" aria-hidden="true">
      <Ambient />
      <div ref={panelRef} className="footage-panel">
        <div className="footage-glow" />
        <canvas ref={canvasRef} width={480} height={720} className="footage-canvas" />
      </div>
      <div className="scene-scrim" />
    </div>
  );
}
