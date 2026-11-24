import type { CSSProperties } from "react";
import { skills } from "@/lib/content";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * MARKETING — a strategy board. A method rail (research → segment → plan →
 * create → publish → promote) maps every competency to a stage; two real
 * brands show the same method with different goals; a typical content week
 * is drawn as an editorial calendar. Deliberately qualitative: no invented
 * metrics, growth or follower counts.
 */
const cat = skills.categories.find((c) => c.id === "marketing")!;
const STAGES = [
  { k: "Investigar", d: "Investigación de mercados" },
  { k: "Segmentar", d: "Segmentación de públicos" },
  { k: "Planificar", d: "Planificación de campañas" },
  { k: "Crear", d: "Estrategia de contenidos y comunicación de marca" },
  { k: "Publicar", d: "Gestión de redes sociales y publicidad digital" },
  { k: "Promocionar", d: "Promoción de eventos" },
];
const BRANDS = [
  { name: "La Encantadora", href: "/proyectos/la-encantadora/", goal: "Llenar el local en sus eventos y celebraciones", audience: "Público del barrio y grupos que celebran", channel: "Instagram · reels, carteles y promociones" },
  { name: "La Encantadora FC", href: "/proyectos/la-encantadora-fc/", goal: "Crear comunidad alrededor del equipo y dar visibilidad al patrocinador", audience: "Jugadores, aficionados y entorno del club", channel: "Instagram · carteles de partido, resultados y web" },
];
const WEEK = [
  { d: "L", e: "Resultado del partido", b: "FC" },
  { d: "M", e: "", b: "" },
  { d: "X", e: "Promoción del local", b: "LE" },
  { d: "J", e: "Cartel de partido", b: "FC" },
  { d: "V", e: "Reel de evento", b: "LE" },
  { d: "S", e: "Día de partido", b: "FC" },
  { d: "D", e: "", b: "" },
];

export function MarketingView() {
  return (
    <div className="mkt-view">
      <ol className="sk-item mkt-rail" style={{ "--i": 1 } as CSSProperties} aria-label="Método de trabajo">
        {STAGES.map((s, i) => (
          <li key={s.k} style={{ "--n": i } as CSSProperties}>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            <strong>{s.k}</strong>
            <em>{s.d}</em>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {BRANDS.map((b, i) => (
          <article key={b.name} className="sk-item mkt-brief" style={{ "--i": 2 + i } as CSSProperties}>
            <header className="flex items-baseline justify-between gap-3">
              <h4 className="display text-[1.5rem] leading-none">{b.name}</h4>
              <SmartLink href={b.href} className="mono text-[10px] uppercase tracking-label text-bone-dim hover:text-[var(--accent)]">Caso ↗</SmartLink>
            </header>
            <dl>
              <div><dt>Objetivo</dt><dd>{b.goal}</dd></div>
              <div><dt>Público</dt><dd>{b.audience}</dd></div>
              <div><dt>Canal</dt><dd>{b.channel}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <figure className="sk-item mkt-cal" style={{ "--i": 4 } as CSSProperties}>
        <figcaption className="mono flex justify-between gap-3 text-[10px] uppercase tracking-label text-bone-dim">
          <span>Calendario editorial · semana tipo</span>
          <span>Ilustrativo, sin métricas</span>
        </figcaption>
        <ol>
          {WEEK.map((w) => (
            <li key={w.d} data-brand={w.b || undefined}>
              <span className="mono">{w.d}</span>
              {w.e && <span className="mkt-post">{w.e}</span>}
            </li>
          ))}
        </ol>
      </figure>
    </div>
  );
}
