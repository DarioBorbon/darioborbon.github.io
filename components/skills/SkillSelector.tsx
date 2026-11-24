"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { SkillCategory } from "@/lib/types";
import { pad2 } from "@/lib/story";

/**
 * Horizontal tab selector: number + name, a sliding indicator in the
 * category accent, arrow/Home/End keys (WAI-ARIA tabs), prev/next buttons.
 * Never changes on its own: the visitor drives.
 */
export function SkillSelector({ cats, active, onSelect }: { cats: SkillCategory[]; active: number; onSelect: (i: number) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);

  // measure the active tab for the indicator; keep it in view on mobile
  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector<HTMLElement>(`#tab-${cats[active].id}`);
      if (!el) return;
      setBar({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const el = listRef.current?.querySelector<HTMLElement>(`#tab-${cats[active].id}`);
    const list = listRef.current;
    if (el && list && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, cats]);

  const go = (i: number) => {
    const n = (i + cats.length) % cats.length;
    onSelect(n);
    listRef.current?.querySelector<HTMLElement>(`#tab-${cats[n].id}`)?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: cats.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    go(map[e.key]);
  };

  return (
    <div className="skills-nav" style={{ "--accent": cats[active].accent } as CSSProperties}>
      <button type="button" className="skills-step" onClick={() => onSelect(active - 1)} aria-label="Competencia anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <div ref={listRef} role="tablist" aria-label="Competencias" className="skills-tabs" onKeyDown={onKey}>
        {cats.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${c.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => onSelect(i)}
            className="skills-tab"
            style={{ "--tab-accent": c.accent } as CSSProperties}
          >
            <span className="mono skills-tab-num">{pad2(i + 1)}</span>
            <span className="skills-tab-name">{c.short}</span>
          </button>
        ))}
        {bar && <span aria-hidden="true" className="skills-ink" style={{ transform: `translateX(${bar.x}px)`, width: bar.w }} />}
      </div>
      <button type="button" className="skills-step" onClick={() => onSelect(active + 1)} aria-label="Competencia siguiente">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}
