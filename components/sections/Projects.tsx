"use client";

import { useState } from "react";
import { projects, PROJECT_TAGS } from "@/lib/content";
import type { ProjectTag } from "@/lib/types";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

const FILTERS: { id: "all" | ProjectTag; label: string }[] = [
  { id: "all", label: "Todos" },
  ...Object.entries(PROJECT_TAGS).map(([id, label]) => ({ id: id as ProjectTag, label })),
];

/**
 * 02 · CÍTRICO — the work. One card per project (no repeats elsewhere);
 * each card leads to its own indexable case-study page.
 * The filter only hides cards visually: every project stays in the HTML.
 */
export function Projects() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const visible = (tags: ProjectTag[]) => filter === "all" || tags.includes(filter);
  const count = projects.filter((p) => visible(p.tags)).length;

  return (
    <Beat id="proyectos" wide>
      <BeatHeader
        id="proyectos"
        title={<>Proyectos <em>destacados</em></>}
        lede="Negocio real, marca propia y propuestas web. Cada proyecto tiene su caso de estudio: qué necesitaba, qué hice y qué resultado se puede comprobar."
      />

      <div role="group" aria-label="Filtrar proyectos por área" className="-mx-1 mb-8 flex flex-wrap gap-2 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`chip chip-link min-h-10 px-4 ${filter === f.id ? "!border-rose/60 !text-bone" : ""}`}
          >
            {f.label}
          </button>
        ))}
        <p className="sr-only" aria-live="polite">{count} proyectos</p>
      </div>

      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal
            as="li"
            key={p.slug}
            i={i % 2}
            hidden={!visible(p.tags)}
            className={i === 0 && filter === "all" ? "md:col-span-2" : ""}
          >
            <article className="card card-hover group relative flex h-full flex-col p-3 focus-within:border-rose/60">
              <Media
                src={p.cover.src}
                alt={p.cover.alt}
                aspect={i === 0 && filter === "all" ? "21/9" : "16/10"}
                position={p.cover.position}
                sizes={i === 0 ? "(min-width: 900px) 60vw, 92vw" : "(min-width: 900px) 30vw, 92vw"}
              />
              <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                <p className="mono text-[10px] uppercase tracking-label text-bone-dim">
                  {p.category}{p.year ? ` · ${p.year}` : ""}
                </p>
                <h3 className="display mt-2 text-[2rem] leading-none">
                  <SmartLink href={`/proyectos/${p.slug}/`} className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none">
                    {p.title}
                  </SmartLink>
                </h3>
                <p className="body-copy mt-3 text-sm">{p.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Áreas">
                  {p.tags.map((t) => (
                    <li key={t} className="chip">{PROJECT_TAGS[t]}</li>
                  ))}
                </ul>
                <p className="mt-auto flex items-center gap-2 pt-5 text-sm text-rose-soft">
                  Ver caso de estudio <Icon name="arrow" className="arrow h-3.5 w-3.5" />
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </Beat>
  );
}
