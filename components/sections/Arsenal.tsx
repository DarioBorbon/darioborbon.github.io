"use client";

import { useId, useState } from "react";
import { skills } from "@/lib/content";
import type { SkillCategory } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import { beatIndex, pad2 } from "@/lib/story";

/**
 * 04 · REMOVEDOR — "Mi arsenal creativo".
 * Desktop: a 300vh section whose stage stays pinned while the chrome bar spoon
 * descends, stirs and rests (driven by scroll in the 3D director). The six
 * competencies orbit the glass; selecting one opens its detail panel.
 * Mobile: a regular stacked section with tabs.
 */
const ORBIT: { x: number; y: number }[] = [
  // positions around the centred glass (% of the orbit box)
  { x: 22, y: 16 }, { x: 8, y: 50 }, { x: 22, y: 84 },
  { x: 80, y: 28 }, { x: 80, y: 72 },
];

export function Arsenal() {
  const [active, setActive] = useState<string>(skills.categories[0].id);
  const current = skills.categories.find((c) => c.id === active)!;
  const idx = beatIndex("arsenal");
  const tablistId = useId();

  return (
    <section id="arsenal" data-beat="arsenal" data-glass="center" aria-labelledby="arsenal-title" className="relative z-[1] lg:h-[300vh]">
      <div className="beat lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:!py-0">
        <div className="beat-inner w-full lg:pt-16">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
            {/* left: header + statement */}
            <div>
              <Reveal className="eyebrow mb-6">
                <span className="dot" />
                <span>{pad2(idx)}</span>
                <span className="rule" />
                <span>Ingrediente · La mezcla</span>
              </Reveal>
              <Reveal as="h2" i={1} id="arsenal-title" className="title hyphens-auto break-words !text-[clamp(2.3rem,4.4vw,4.5rem)]">
                Habilidades y <em>herramientas</em>
              </Reveal>
              <Reveal as="blockquote" i={2} className="mt-8 border-l border-rose/60 pl-5">
                <p className="display text-[1.45rem] leading-snug text-bone/95">“{skills.statement}”</p>
              </Reveal>
              <Reveal as="p" i={3} className="body-copy mt-6 max-w-sm text-sm">
                Selecciona una competencia para ver las herramientas que uso, lo que sé hacer y dónde lo he aplicado. La IA tiene su propia sección.
              </Reveal>
            </div>

            {/* centre: competencies orbiting the glass (desktop) / tabs (mobile) */}
            <div className="relative">
              <div
                role="tablist"
                aria-label="Competencias"
                id={tablistId}
                onKeyDown={(e) => {
                  // roving selection with arrow keys (WAI-ARIA tabs pattern)
                  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
                  e.preventDefault();
                  const list = skills.categories;
                  const n = list.findIndex((c) => c.id === active);
                  const next = list[(n + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length];
                  setActive(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }}
                className="flex flex-wrap gap-2 lg:relative lg:block lg:h-[min(64vh,560px)] lg:overflow-visible lg:pb-0"
              >
                {skills.categories.map((c, i) => (
                  <OrbitChip key={c.id} c={c} i={i} active={c.id === active} onSelect={() => setActive(c.id)} />
                ))}
              </div>
            </div>

            {/* right: detail panel */}
            <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} aria-live="polite">
              <Panel key={current.id} c={current} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrbitChip({ c, i, active, onSelect }: { c: SkillCategory; i: number; active: boolean; onSelect: () => void }) {
  const pos = ORBIT[i % ORBIT.length];
  return (
    <div className="shrink-0 lg:absolute lg:-translate-x-1/2 lg:-translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
    <Reveal i={i}>
      <button
        type="button"
        role="tab"
        id={`tab-${c.id}`}
        aria-selected={active}
        tabIndex={active ? 0 : -1}
        aria-controls={`panel-${c.id}`}
        onClick={onSelect}
        className={`group relative flex items-center gap-2.5 rounded-full border py-2 pl-2 pr-4 text-[13px] backdrop-blur-md transition-[border-color,background-color,color,transform] duration-500 ease-out-expo active:scale-[0.97] ${
          active
            ? "border-rose/60 bg-ink-800/80 text-bone shadow-[0_0_40px_-10px_rgba(255,61,139,0.6)]"
            : "border-white/10 bg-ink-900/60 text-bone-muted hover:border-white/25 hover:text-bone"
        }`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-500 ${active ? "bg-rose text-ink" : "bg-white/[0.06] text-bone-muted group-hover:text-bone"}`}>
          <Icon name={c.icon} className="h-3.5 w-3.5" />
        </span>
        {c.short}
              </button>
    </Reveal>
    </div>
  );
}

function Panel({ c }: { c: SkillCategory }) {
  const using = c.tools.filter((t) => t.status === "uso");
  const learning = c.tools.filter((t) => t.status === "aprendiendo");
  return (
    <div className="card panel-enter p-6 lg:max-h-[78vh] lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <p className="mono text-[10px] uppercase tracking-label text-bone-dim">Competencia</p>
        {c.featured && (
          <span className="mono rounded-full border border-rose/40 px-2 py-0.5 text-[10px] uppercase tracking-label text-rose-soft">Destacada</span>
        )}
      </div>
      <h3 className="display mt-2 text-[2.1rem] leading-none">{c.name}</h3>
      <p className="body-copy mt-3 text-sm">{c.description}</p>

      {c.tools.length > 0 && (
        <div className="mt-6">
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Herramientas que uso</p>
          <ul className="space-y-1.5">
            {using.map((t) => (
              <li key={t.name} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-1.5 text-sm">
                <span className="text-bone">{t.name}</span>
                {t.note && <span className="text-right text-xs text-bone-dim">{t.note}</span>}
              </li>
            ))}
          </ul>
          {learning.length > 0 && (
            <>
              <p className="mono mb-2 mt-5 text-[10px] uppercase tracking-label text-bone-dim">Aprendiendo</p>
              <ul className="flex flex-wrap gap-1.5">
                {learning.map((t) => (
                  <li key={t.name} className="chip chip-learning">{t.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="mt-6">
        <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Qué sé hacer</p>
        <ul className="space-y-1.5 text-sm text-bone-muted">
          {c.abilities.map((a) => (
            <li key={a} className="flex gap-2.5">
              <span className="mt-2 h-px w-3 shrink-0 bg-rose-soft/70" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {c.examples.length > 0 && (
        <div className="mt-6">
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Dónde lo he aplicado</p>
          <ul className="space-y-1.5">
            {c.examples.map((e) => {
              return (
                <li key={e.label}>
                  <SmartLink href={e.href} className="link-u inline-flex min-h-8 items-center gap-1 text-sm text-bone hover:text-rose-soft">
                    {e.label} <Icon name="arrow" className="arrow h-3 w-3" />
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
