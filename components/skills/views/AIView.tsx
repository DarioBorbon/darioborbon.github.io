"use client";

import { useState, type CSSProperties } from "react";
import { skills } from "@/lib/content";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * IA — a live system diagram, not a logo wall. Six tools wired to one hub
 * ("criterio"): hover or focus a node to light its connection and read what
 * that tool does in my workflow. Right column: capabilities as a terminal log
 * and the real projects where the system was used.
 */
const cat = skills.categories.find((c) => c.id === "ia")!;

// node positions on a 360×300 board, around the hub at (180,150)
const POS = [
  { x: 62, y: 52 }, { x: 180, y: 26 }, { x: 298, y: 52 },
  { x: 298, y: 248 }, { x: 180, y: 274 }, { x: 62, y: 248 },
];

const PROJECTS = [
  { label: "Web La Encantadora FC", href: "/proyectos/la-encantadora-fc/", via: "Claude Code" },
  { label: "Propuesta web Mori Sushi", href: "/proyectos/mori-sushi/", via: "Claude Code" },
  { label: "Este portfolio", href: "/proyectos/portfolio/", via: "Claude Code" },
  { label: "Contenido de La Encantadora", href: "/proyectos/la-encantadora/", via: "ChatGPT" },
];

export function AIView() {
  const [hot, setHot] = useState<number | null>(null);
  const t = hot === null ? null : cat.tools[hot];
  return (
    <div className="ai-view grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="sk-item min-w-0" style={{ "--i": 1 } as CSSProperties}>
      <div className="ai-board">
        <svg viewBox="0 0 360 300" className="ai-wires" aria-hidden="true">
          {POS.map((p, i) => (
            <path
              key={i}
              d={`M180 150 Q ${(180 + p.x) / 2 + (i % 2 ? 18 : -18)} ${(150 + p.y) / 2} ${p.x} ${p.y}`}
              className={`ai-wire ${hot === i ? "is-hot" : ""}`}
              style={{ "--d": `${i * 0.35}s` } as CSSProperties}
            />
          ))}
        </svg>
        <div className="ai-hub" style={{ left: "50%", top: "50%" }}>
          <span className="mono text-[9px] uppercase tracking-label text-bone-dim">núcleo</span>
          <span className="display text-[1.15rem] leading-none">Criterio</span>
        </div>
        <ul aria-label="Herramientas de IA">
          {cat.tools.map((tool, i) => (
            <li key={tool.name} className="ai-node" style={{ left: `${(POS[i].x / 360) * 100}%`, top: `${(POS[i].y / 300) * 100}%` }}>
              <button
                type="button"
                onMouseEnter={() => setHot(i)}
                onMouseLeave={() => setHot(null)}
                onFocus={() => setHot(i)}
                onBlur={() => setHot(null)}
                aria-describedby="ai-readout"
                className={hot === i ? "is-hot" : ""}
              >
                {tool.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p id="ai-readout" className="ai-readout mono" aria-live="polite">
        {t ? <><span style={{ color: "var(--accent)" }}>{t.name}</span> → {t.note}</> : "Pasa por un nodo para ver qué hace cada herramienta"}
      </p>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="sk-item ai-log" style={{ "--i": 2 } as CSSProperties}>
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Competencias</p>
          <ul className="space-y-1.5">
            {cat.abilities.map((a, i) => (
              <li key={a} className="mono text-[12.5px] text-bone/90">
                <span style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")} ›</span> {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="sk-item" style={{ "--i": 3 } as CSSProperties}>
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Aplicado en proyectos reales</p>
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {PROJECTS.map((p) => (
              <li key={p.href}>
                <SmartLink href={p.href} className="sk-row group">
                  <span className="text-[14px] text-bone">{p.label}</span>
                  <span className="mono text-[10px] uppercase tracking-label text-bone-dim group-hover:text-[var(--accent)]">{p.via} ↗</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
