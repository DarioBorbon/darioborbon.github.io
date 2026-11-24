import type { CSSProperties } from "react";
import { skills, experience } from "@/lib/content";
import { asset } from "@/lib/asset";
import { imgProps } from "@/components/ui/Media";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * GESTIÓN — an executive dossier. Two case files (the business I run and the
 * project I founded) with real frames from my footage, responsibilities as a
 * gold-ruled ledger, and the areas I'm accountable for set as a numbered
 * matrix. Dates only where they are real.
 */
const cat = skills.categories.find((c) => c.id === "gestion")!;
const le = experience.find((e) => e.id === "la-encantadora")!;
const fc = experience.find((e) => e.id === "la-encantadora-fc")!;
const FILES = [
  { tag: "Negocio", title: le.company, role: le.role, period: le.period, img: "/assets/img/la-encantadora-reel-cumpleanos.webp", pos: "50% 28%", alt: "Darío en el reel de cumpleaños de La Encantadora", lines: le.bullets, href: "/proyectos/la-encantadora/" },
  { tag: "Proyecto propio", title: fc.company, role: fc.role, period: "Fundador", img: "/assets/skills/pieza-restaurante-t04.webp", pos: "50% 50%", alt: "Fotograma del vídeo del patrocinador de La Encantadora FC", lines: [...fc.bullets.slice(0, 2), "Relación con el patrocinador del equipo y vídeo de presentación."], href: "/proyectos/la-encantadora-fc/" },
];

export function ManagementView() {
  return (
    <div className="mgmt-view">
      <div className="grid gap-4 md:grid-cols-2">
        {FILES.map((f, i) => {
          const src = f.img.startsWith("/assets/img/") ? imgProps(f.img, "(min-width: 900px) 22vw, 90vw") : { src: asset(f.img) };
          return (
            <article key={f.title} className="sk-item mgmt-file" style={{ "--i": 1 + i } as CSSProperties}>
              <div className="mgmt-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...src} alt={f.alt} loading="lazy" decoding="async" style={{ objectPosition: f.pos }} />
                <span className="mono">{f.tag}</span>
              </div>
              <div className="p-4">
                <p className="mono text-[10px] uppercase tracking-label" style={{ color: "var(--accent)" }}>{f.period}</p>
                <h4 className="display mt-1 text-[1.6rem] leading-none">{f.title}</h4>
                <p className="mt-1 text-[12.5px] text-bone-muted">{f.role}</p>
                <ul className="mgmt-ledger">
                  {f.lines.map((l) => <li key={l}>{l}</li>)}
                </ul>
                <SmartLink href={f.href} className="link-u mt-3 inline-flex min-h-8 items-center text-[13px] text-bone hover:text-[var(--accent)]">Ver caso ↗</SmartLink>
              </div>
            </article>
          );
        })}
      </div>
      <ol className="sk-item mgmt-matrix" style={{ "--i": 3 } as CSSProperties} aria-label="Áreas de responsabilidad">
        {cat.abilities.map((a, i) => (
          <li key={a}><span className="display">{["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i]}</span>{a}</li>
        ))}
      </ol>
    </div>
  );
}
