"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { skills } from "@/lib/content";
import { beatIndex, pad2 } from "@/lib/story";
import { getPrefs, setPrefs } from "@/lib/prefs";
import { SkillSelector } from "./SkillSelector";
import { AIView } from "./views/AIView";
import { VideoView } from "./views/VideoView";
import { DesignView } from "./views/DesignView";
import { WebView } from "./views/WebView";
import { MarketingView } from "./views/MarketingView";
import { ManagementView } from "./views/ManagementView";
import "./skills.css";

/**
 * 04 · LA MEZCLA — Skills.
 *
 * Six categories, six different interfaces, one persistent glass.
 * Ownership of the scene: while this section is on screen the selected
 * category writes prefs.skillSide / skillAccent and FootageStage springs the
 * glass there; outside it, the scroll story owns the glass again.
 *
 * Transition (interruptible): the selector, the glass and the light react
 * at once; the old panel leaves in ~180 ms, the new one enters on the other
 * side of the glass with a 55 ms stagger. Fast clicks skip straight to the
 * latest category — nothing queues.
 *
 * Every panel is rendered into the HTML (inactive ones are `hidden`), so all
 * the content is indexable and readable without animation.
 */
const VIEWS: Record<string, () => ReactNode> = {
  ia: () => <AIView />,
  video: () => <VideoView />,
  diseno: () => <DesignView />,
  web: () => <WebView />,
  marketing: () => <MarketingView />,
  gestion: () => <ManagementView />,
};
const EXIT_MS = 180;

export function SkillsSection() {
  const cats = skills.categories;
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idx = beatIndex("arsenal");

  // publish the selection to the scene (glass side + light)
  useEffect(() => {
    setPrefs({ skillSide: cats[active].side, skillAccent: cats[active].accent });
  }, [active, cats]);

  const select = useCallback(
    (i: number) => {
      const n = (i + cats.length) % cats.length;
      setActive(n);
      clearTimeout(timer.current);
      if (n === shown && !leaving) return;
      if (getPrefs().motion === "reduced") {
        setShown(n);
        setLeaving(false);
        return;
      }
      setLeaving(true);
      timer.current = setTimeout(() => {
        setShown(n);
        setLeaving(false);
        const top = bodyRef.current?.getBoundingClientRect().top ?? 0;
        if (top < 0) window.scrollBy({ top: top - 150, behavior: "auto" });
      }, EXIT_MS);
    },
    [cats.length, shown, leaving]
  );
  useEffect(() => () => clearTimeout(timer.current), []);

  const side = cats[shown].side;

  return (
    <section
      id="arsenal"
      data-beat="arsenal"
      data-glass={cats[active].side}
      aria-labelledby="arsenal-title"
      className="skills relative z-[1]"
    >
      <div className="skills-stage beat">
        <div className="beat-inner">
          {/* header */}
          <div className="skills-head">
            <div className="min-w-0">
              <p className="eyebrow mb-3">
                <span className="dot" />
                <span>{pad2(idx)}</span>
                <span className="rule" />
                <span>Ingrediente · La mezcla</span>
              </p>
              <h2 id="arsenal-title" className="display text-[clamp(2.3rem,3.4vw,3.4rem)] leading-none">
                {skills.title}
              </h2>
              <p className="sr-only">{skills.statement}</p>
            </div>
          </div>
          {/* selector: sticks under the site header for the whole section */}
          <div className="skills-sticky">
            <SkillSelector cats={cats} active={active} onSelect={select} />
          </div>

          {/* panels: on the side opposite the glass */}
          <div ref={bodyRef} className="skills-body relative mt-6 lg:mt-8" data-side={side}>
            {cats.map((c, i) => (
              <div
                key={c.id}
                id={`panel-${c.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${c.id}`}
                tabIndex={0}
                hidden={i !== shown}
                className={`skill-panel ${i === shown && leaving ? "is-out" : "is-in"}`}
                style={{ "--accent": c.accent } as CSSProperties}
                data-cat={c.id}
              >
                <header className="sk-item mb-4" style={{ "--i": 0 } as CSSProperties}>
                  <p className="mono text-[10px] uppercase tracking-label" style={{ color: c.accent }}>
                    {pad2(i + 1)} — {c.short}
                  </p>
                  <h3 className="display mt-2 text-[clamp(1.9rem,2.6vw,2.6rem)] leading-[1.02]">{c.name}</h3>
                  <p className="body-copy mt-2 max-w-[48ch] text-[14px] leading-relaxed">{c.intro}</p>
                </header>
                {VIEWS[c.id]()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
