"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/lib/prefs";

/**
 * CURSOR — a drop of the drink.
 *
 *  · a rose dot glued to the pointer + a ring that follows with lag and
 *    stretches with speed, like a liquid drop
 *  · while moving it leaves a trail of tiny bubbles that rise and pop;
 *    a click releases a burst of fizz
 *  · over links/buttons the ring swells; over media it fills and shows a
 *    label ("Ver", "Play", "Ampliar" or data-cursor="…")
 *  · magnetic buttons (.btn, [data-magnetic]) lean towards the pointer
 *  · cards get a soft spotlight that follows the pointer (--mx/--my)
 *
 * Only for a real mouse and full motion; touch and reduced-motion keep the
 * native cursor untouched.
 */

type Bubble = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; ph: number };

const INTERACTIVE = "a,button,[role='button'],summary,label,select,[data-cursor]";
const MAGNETIC = ".btn,[data-magnetic]";

function labelFor(el: Element | null): string {
  if (!el) return "";
  const explicit = el.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
  if (explicit) return explicit;
  if (el.closest("#videos") && el.querySelector("video, img, .frame")) return "Play";
  if (el.closest("#fotos") && el.querySelector("img")) return "Ampliar";
  if (el.querySelector("img, video, .frame")) return "Ver";
  return "";
}

export function Cursor() {
  const motion = usePrefs((s) => s.motion);
  const [on, setOn] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setOn(mq.matches && motion === "full");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [motion]);

  useEffect(() => {
    if (!on) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const L = layer.current!, D = dot.current!, R = ring.current!, T = label.current!, C = canvas.current!;
    const ctx = C.getContext("2d")!;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      C.width = window.innerWidth * dpr;
      C.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const m = { x: -100, y: -100 };
    const p = { x: -100, y: -100 };
    let seen = false;
    let travelled = 0;
    let state = "";
    let magnet: HTMLElement | null = null;
    let card: HTMLElement | null = null;
    const bubbles: Bubble[] = [];

    const spawn = (x: number, y: number, burst = false) => {
      if (bubbles.length > 160) bubbles.shift();
      const a = Math.random() * Math.PI * 2;
      const sp = burst ? 1.2 + Math.random() * 2.6 : 0.2;
      const max = burst ? 0.9 + Math.random() * 0.9 : 1 + Math.random() * 1.2;
      bubbles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (burst ? 0.6 : 0.3),
        r: burst ? 1.5 + Math.random() * 3.5 : 1 + Math.random() * 2.6,
        life: max, max, ph: Math.random() * 6.28,
      });
    };

    const releaseMagnet = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };
    const releaseCard = () => {
      if (card) card.classList.remove("is-lit");
      card = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - m.x, dy = e.clientY - m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      if (!seen) {
        seen = true;
        p.x = m.x;
        p.y = m.y;
        L.dataset.hidden = "false";
      } else {
        travelled += Math.hypot(dx, dy);
        while (travelled > 34) {
          travelled -= 34;
          spawn(m.x + (Math.random() - 0.5) * 8, m.y + (Math.random() - 0.5) * 8);
        }
      }

      const t = e.target as Element | null;
      const hit = t?.closest?.(INTERACTIVE) ?? null;
      const text = labelFor(hit);
      const next = hit ? (text ? "media" : "link") : "";
      if (next !== state) {
        state = next;
        L.dataset.state = state;
      }
      if (text && T.textContent !== text) T.textContent = text;

      // magnetic buttons
      const mg = t?.closest?.<HTMLElement>(MAGNETIC) ?? null;
      if (mg !== magnet) {
        releaseMagnet();
        magnet = mg;
      }
      if (magnet) {
        const b = magnet.getBoundingClientRect();
        const ox = m.x - (b.left + b.width / 2);
        const oy = m.y - (b.top + b.height / 2);
        magnet.style.translate = `${ox * 0.22}px ${oy * 0.32}px`;
      }

      // spotlight on cards
      const cd = t?.closest?.<HTMLElement>(".card") ?? null;
      if (cd !== card) {
        releaseCard();
        card = cd;
        card?.classList.add("is-lit");
      }
      if (card) {
        const b = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${m.x - b.left}px`);
        card.style.setProperty("--my", `${m.y - b.top}px`);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      L.dataset.down = "true";
      for (let i = 0; i < 16; i++) spawn(m.x, m.y, true);
    };
    const onUp = () => (L.dataset.down = "false");
    const onLeave = () => {
      L.dataset.hidden = "true";
      seen = false;
      releaseMagnet();
      releaseCard();
    };
    // scrolling moves content under a still pointer: refresh hover state
    const onScroll = () => {
      if (!seen) return;
      const el = document.elementFromPoint(m.x, m.y);
      if (el) onMove({ pointerType: "mouse", clientX: m.x, clientY: m.y, target: el } as unknown as PointerEvent);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    html.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = dt * 60;

      // ring follows with lag and stretches along its velocity
      const k = 1 - Math.pow(1 - 0.2, f);
      const vx = (m.x - p.x) * k, vy = (m.y - p.y) * k;
      p.x += vx;
      p.y += vy;
      const speed = Math.hypot(vx, vy) / Math.max(f, 0.001);
      const squash = Math.min(0.45, speed / 60) * (state === "media" ? 0.25 : 1);
      const ang = Math.atan2(vy, vx);
      D.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
      R.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${ang}rad) scale(${1 + squash}, ${1 - squash * 0.6})`;
      T.style.transform = `rotate(${-ang}rad)`;

      // bubbles
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, C.width, C.height);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life -= dt;
        if (b.life <= 0) {
          bubbles.splice(i, 1);
          continue;
        }
        b.ph += dt * 6;
        b.vx *= Math.pow(0.94, f);
        b.vy = b.vy * Math.pow(0.96, f) - 0.035 * f; // buoyancy
        b.x += (b.vx + Math.sin(b.ph) * 0.25) * f;
        b.y += b.vy * f;
        const t = b.life / b.max;
        const a = Math.min(1, t * 2.2) * 0.75;
        const r = b.r * (t < 0.12 ? 1 + (0.12 - t) * 6 : 1); // swell before popping
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 180, 210, ${a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - r * 0.35, b.y - r * 0.35, Math.max(0.5, r * 0.25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.8})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      releaseMagnet();
      releaseCard();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div ref={layer} className="cursor-layer" data-hidden="true" aria-hidden="true">
      <canvas ref={canvas} />
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
