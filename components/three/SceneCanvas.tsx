"use client";

import { useEffect, useRef } from "react";
import { getPrefs, setPrefs, subscribe } from "@/lib/prefs";
import { STORY } from "@/lib/story";
import type { CocktailScene } from "./CocktailScene";

/**
 * Mounts the single fixed full-screen canvas and feeds it the story position.
 * three.js is code-split (dynamic import) so text content paints first.
 *
 * Story position: for each [data-beat] section we cache top/height; the
 * viewport centre's progress through section i gives s = i + local.
 */
function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: CocktailScene | null = null;
    let disposed = false;
    let sections: { top: number; height: number }[] = [];

    const measure = () => {
      sections = STORY.map((b) => {
        const el = document.getElementById(b.id);
        if (!el) return { top: 0, height: 1 };
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, height: Math.max(1, r.height) };
      });
    };

    const storyPosition = () => {
      const c = window.scrollY + window.innerHeight * 0.5;
      let s = 0;
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (c >= sec.top) s = i + Math.min(1, (c - sec.top) / sec.height);
      }
      return Math.min(s, STORY.length - 0.0001);
    };

    let lastActive = -1;
    const onScroll = () => {
      const s = storyPosition();
      scene?.setStory(s);
      const active = Math.floor(s);
      if (active !== lastActive) {
        lastActive = active;
        setPrefs({ active });
      }
    };

    const onResize = () => {
      measure();
      scene?.setMobile(window.innerWidth < 900);
      scene?.resize();
      onScroll();
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };

    const onVisibility = () => {
      if (!scene) return;
      if (document.hidden) scene.stop();
      else if (getPrefs().scene3d) scene.start();
    };

    // sections can change height (images load, fonts swap) → re-measure
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);

    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const boot = async () => {
      if (!getPrefs().scene3d) return;
      if (!hasWebGL2()) {
        setPrefs({ failed: true, ready: true });
        return;
      }
      try {
        const { CocktailScene } = await import("./CocktailScene");
        if (disposed) return;
        scene = new CocktailScene(canvas, {
          mobile: window.innerWidth < 900,
          reducedMotion: getPrefs().motion === "reduced",
          onReady: () => setPrefs({ ready: true }),
        });
        measure();
        scene.setStory(storyPosition());
        scene.start();
      } catch (err) {
        console.error("[scene] failed to start", err);
        setPrefs({ failed: true, ready: true });
      }
    };
    boot();

    // react to preference changes (motion / 3D toggle)
    let prev = getPrefs();
    const unsub = subscribe(() => {
      const p = getPrefs();
      if (p.motion !== prev.motion) scene?.setReducedMotion(p.motion === "reduced");
      if (p.scene3d !== prev.scene3d) {
        if (p.scene3d) {
          if (scene) scene.start();
          else boot();
        } else scene?.stop();
      }
      prev = p;
    });

    return () => {
      disposed = true;
      unsub();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      scene?.dispose();
    };
  }, []);

  return (
    <div className="scene-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* static fallback when 3D is off or unsupported */}
      <div className="scene-fallback">
        <div className="fallback-glow" />
        <svg viewBox="0 0 200 300" className="fallback-glass" role="presentation">
          <defs>
            <linearGradient id="fg" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="0.2" stopColor="#fff" stopOpacity="0.05" />
              <stop offset="0.8" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff8fb8" stopOpacity="0.75" />
              <stop offset="1" stopColor="#9d0f43" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path d="M44 20 L156 20 L148 280 L52 280 Z" fill="url(#fg)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <path d="M49 92 L151 92 L146 262 L54 262 Z" fill="url(#fl)" opacity="0.85" />
        </svg>
      </div>
      {/* edge scrims keep text readable over the scene */}
      <div className="scene-scrim" />
    </div>
  );
}
