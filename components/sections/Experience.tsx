import { experience } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";

/** 05 · CÍTRICO — experience: character, flavour, personality. */
export function ExperienceSection() {
  return (
    <Beat id="experiencia">
      <BeatHeader
        id="experiencia"
        title={<>Mi experiencia <em>laboral</em></>}
        lede="Del taller de impresión a la gestión de un negocio. Experiencia práctica, con clientes reales y responsabilidad real."
      />
      <ol className="relative border-l border-white/10 pl-8">
        {experience.map((e, i) => (
          <Reveal as="li" key={e.id} i={i} className="relative pb-12 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute -left-[37px] top-1.5 h-[9px] w-[9px] rounded-full border ${e.current ? "border-rose bg-rose shadow-[0_0_14px_#ff3d8b]" : "border-white/30 bg-ink"}`}
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="mono text-[11px] uppercase tracking-label text-bone-dim">{e.period}</p>
              {e.current && <span className="mono rounded-full bg-rose/10 px-2 py-0.5 text-[10px] uppercase tracking-label text-rose-soft">Actual</span>}
              <span className="mono text-[10px] uppercase tracking-label text-bone-dim/70">· {e.type}</span>
            </div>
            <h3 className="display mt-2 text-[2rem] leading-tight">{e.company}</h3>
            <p className="text-sm text-bone/85">{e.role} · <span className="text-bone-dim">{e.location}</span></p>
            <ul className="mt-4 space-y-2">
              {e.bullets.map((b) => (
                <li key={b} className="body-copy flex gap-3 text-[14.5px]">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-rose-soft/70" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Beat>
  );
}
