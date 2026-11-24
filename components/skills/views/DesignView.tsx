import type { CSSProperties } from "react";
import { skills, profile } from "@/lib/content";
import { asset } from "@/lib/asset";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * DISEÑO — an editorial spread, not a card grid. Real details taken from my
 * work (the club kit and identity, the Mori proposal's identity and type),
 * each with a figure caption; pieces reveal with a clip-path wipe in
 * different directions. A tools specimen and an index of competencies sit in
 * the margin like a magazine layout.
 */
const cat = skills.categories.find((c) => c.id === "diseno")!;
const FIGS = [
  { src: "/assets/skills/fc-equipacion-primera.webp", w: 450, h: 700, cap: "Equipación 2026/27 con la identidad del club", from: "La Encantadora FC", href: "/proyectos/la-encantadora-fc/", cls: "fig-tall" },
  { src: "/assets/skills/fc-composicion-tipografica.webp", w: 600, h: 310, cap: "Composición tipográfica para la web del club", from: "La Encantadora FC", href: "/proyectos/la-encantadora-fc/", cls: "fig-wide" },
  { src: "/assets/skills/mori-identidad.webp", w: 640, h: 720, cap: "Identidad: monograma y logotipo", from: "Propuesta Mori Sushi", href: "/proyectos/mori-sushi/", cls: "fig-square" },
  { src: "/assets/skills/mori-titular-editorial.webp", w: 680, h: 300, cap: "Titular editorial en serif", from: "Propuesta Mori Sushi", href: "/proyectos/mori-sushi/", cls: "fig-strip" },
];

export function DesignView() {
  const ig = profile.socials.find((s) => s.url.includes("laencantadorafc"));
  return (
    <div className="dsg-view">
      <div className="dsg-spread">
        {FIGS.map((f, i) => (
          <figure key={f.src} className={`sk-item dsg-fig ${f.cls}`} style={{ "--i": i + 1 } as CSSProperties}>
            <SmartLink href={f.href} className="dsg-frame" aria-label={`${f.cap} — ${f.from}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(f.src)} width={f.w} height={f.h} alt={`${f.cap} (${f.from})`} loading="eager" fetchPriority="low" decoding="async" />
            </SmartLink>
            <figcaption className="mono">
              <span style={{ color: "var(--accent)" }}>Fig. {String(i + 1).padStart(2, "0")}</span> {f.cap} · {f.from}
            </figcaption>
          </figure>
        ))}
        <aside className="sk-item dsg-margin" style={{ "--i": 5 } as CSSProperties}>
          <p className="mono text-[10px] uppercase tracking-label text-bone-dim">Herramientas</p>
          <ul className="dsg-specimen">
            {cat.tools.map((t) => <li key={t.name}>{t.name.replace("Adobe ", "")}</li>)}
          </ul>
          <p className="mono mt-4 text-[10px] uppercase tracking-label text-bone-dim">Índice</p>
          <ol className="dsg-index">
            {cat.abilities.map((a, i) => (
              <li key={a}><span className="mono">{String(i + 1).padStart(2, "0")}</span>{a}</li>
            ))}
          </ol>
          {ig && (
            <a href={ig.url} target="_blank" rel="noopener noreferrer" className="link-u mt-4 inline-flex min-h-8 items-center gap-1 text-[13px] text-bone hover:text-[var(--accent)]">
              Carteles de partidos y resultados en {ig.handle} ↗<span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
