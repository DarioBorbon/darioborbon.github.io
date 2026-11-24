"use client";

import { useState, type CSSProperties } from "react";
import { skills, projectBySlug } from "@/lib/content";
import { imgProps } from "@/components/ui/Media";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * WEB — a cascade of real browser windows (my three sites). Hover or focus
 * one to bring it forward; each opens its case study. The stack is split
 * honestly: what I ship with AI assistance vs what I'm still learning to
 * write by hand.
 */
const cat = skills.categories.find((c) => c.id === "web")!;
const SITES = [
  { slug: "la-encantadora-fc", host: "laencantadorafc.netlify.app" },
  { slug: "mori-sushi", host: "morisushi.netlify.app" },
  { slug: "portfolio", host: "darioborbon.github.io" },
];

export function WebView() {
  const [front, setFront] = useState(0);
  const using = cat.tools.filter((t) => t.status === "uso");
  const learning = cat.tools.filter((t) => t.status === "aprendiendo");
  return (
    <div className="web-view grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <ul className="web-stack" aria-label="Webs que he diseñado">
        {SITES.map((s, i) => {
          const p = projectBySlug(s.slug)!;
          const order = (i - front + SITES.length) % SITES.length;
          return (
            <li key={s.slug} className="sk-item web-win" style={{ "--i": i + 1, "--o": order } as CSSProperties} data-front={order === 0}>
              <SmartLink href={`/proyectos/${s.slug}/`} onMouseEnter={() => setFront(i)} onFocus={() => setFront(i)} className="block">
                <span className="web-chrome" aria-hidden="true">
                  <i /><i /><i />
                  <span className="mono">{s.host}</span>
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...imgProps(p.cover.src, "(min-width: 900px) 30vw, 80vw")} alt={p.cover.alt} loading="lazy" decoding="async" />
                <span className="web-label">
                  <span className="display text-[1.25rem] leading-none">{p.title}</span>
                  <span className="mono text-[10px] uppercase tracking-label text-bone-dim">Ver caso ↗</span>
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ul>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="sk-item web-split" style={{ "--i": 4 } as CSSProperties}>
          <div>
            <p className="mono text-[10px] uppercase tracking-label" style={{ color: "var(--accent)" }}>Uso real · con IA</p>
            <ul className="mt-2 space-y-1.5">
              {using.map((t) => (
                <li key={t.name} className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-1.5 text-[13.5px]">
                  <span className="text-bone">{t.name}</span>
                  <span className="text-right text-[11.5px] text-bone-dim">{t.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-label text-bone-dim">Programación manual · aprendiendo</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {learning.map((t) => <li key={t.name} className="chip chip-learning">{t.name}</li>)}
            </ul>
          </div>
        </div>
        <div className="sk-item" style={{ "--i": 5 } as CSSProperties}>
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Competencias</p>
          <ul className="web-caps">
            {cat.abilities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
