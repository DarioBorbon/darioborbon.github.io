"use client";

import { useEffect, useRef } from "react";
import stageJson from "@/content/stage.json";
import { withAssets } from "@/lib/asset";
const stage = withAssets(stageJson);
import { STORY } from "@/lib/story";
import { getPrefs, setPrefs } from "@/lib/prefs";

/**
 * PRODUCT STAGE — real product photography instead of 3D.
 * One full-height panel sits on the side opposite the text (from lib/story.ts)
 * and glides across when that side changes. Inside it, one photo per
 * ingredient crossfades as you scroll, with a slow push-in, and a soft
 * vignette mask dissolves the photo edges into the black page.
 */
type Shot = { beat: string; src: string; alt: string; position?: string; dim?: number };
const shots = (stage.shots as Shot[]).filter((s) => s.src);

export const stageReady = shots.length === STORY.length;

/** panel offset in vw for each glass side (panel is 46vw wide) */
const sideX = (beat: string) => {
  const g = STORY.find((b) => b.id === beat)?.glass ?? "center";
  return g === "right" ? 52 : g === "left" ? 2 : 27;
};

export default function ProductStage() {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    let s = target();
    let raf = 0;
    let lastActive = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const reduced = getPrefs().motion === "reduced";
      s += (target() - s) * (reduced ? 1 : 0.1);

      const active = Math.floor(s);
      if (active !== lastActive) {
        lastActive = active;
        setPrefs({ active });
      }

      // shot i owns its section; the cut to i+1 happens around the boundary
      const i = Math.min(shots.length - 1, Math.floor(s));
      const local = s - i;
      const f = Math.min(1, Math.max(0, (local - 0.72) / 0.28));
      const ease = f * f * (3 - 2 * f);
      const next = Math.min(i + 1, shots.length - 1);

      const mobile = window.innerWidth < 900;
      if (panel.current) {
        const x = sideX(shots[i].beat) * (1 - ease) + sideX(shots[next].beat) * ease;
        panel.current.style.transform = mobile ? "none" : `translate3d(${x.toFixed(3)}vw,0,0)`;
      }
      layers.current.forEach((el, n) => {
        if (!el) return;
        const o = n === i ? (i === next ? 1 : 1 - ease) : n === next ? ease : 0;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.001 ? "visible" : "hidden";
        if (o > 0.001) {
          const p = n === i ? local : 0;
          el.style.transform = reduced ? "none" : `scale(${(1.08 - p * 0.06).toFixed(4)})`;
        }
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    tick();
    setPrefs({ ready: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="scene-layer" aria-hidden="true">
      <div ref={panel} className="stage-panel">
        {shots.map((shot, n) => (
          <div
            key={shot.beat}
            ref={(el) => {
              layers.current[n] = el;
            }}
            className="absolute inset-0 will-change-[opacity,transform]"
            style={{ opacity: n === 0 ? 1 : 0, visibility: n === 0 ? "visible" : "hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: shot.position ?? "50% 50%", filter: shot.dim ? `brightness(${shot.dim}) saturate(0.92)` : undefined }}
              loading={n < 2 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={n === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>
      <div className="scene-scrim" />
    </div>
  );
}
