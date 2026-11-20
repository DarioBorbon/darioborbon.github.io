import { projects } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import { SampleTag } from "@/components/ui/SampleTag";

/** 02 · LICOR — the projects that give the drink its character. */
export function Projects() {
  return (
    <Beat id="proyectos" wide>
      <BeatHeader
        id="proyectos"
        title={<>Mis <em>proyectos</em></>}
        lede="Marcas propias, negocio real y piezas digitales. Cada proyecto es un sabor distinto de la misma forma de trabajar."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => {
          const Wrapper = p.link ? "a" : "div";
          return (
            <Reveal key={p.id} i={i % 2} className={i === 0 ? "md:col-span-2" : ""}>
              <Wrapper
                {...(p.link ? { href: p.link.url, target: "_blank", rel: "noreferrer" } : {})}
                className="card card-hover group block h-full p-3"
              >
                <Media
                  src={p.cover.src}
                  alt={p.cover.alt}
                  aspect={i === 0 ? "21/9" : "16/10"}
                  position={p.cover.position}
                  label={p.category}
                  sizes="(min-width: 900px) 40vw, 92vw"
                />
                <div className="px-3 pb-3 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mono text-[10px] uppercase tracking-label text-bone-dim">
                        {p.category} · {p.year}
                      </p>
                      <h3 className="display mt-2 text-[2rem] leading-none">{p.title}</h3>
                    </div>
                    {p.link && (
                      <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-bone-muted transition-colors duration-300 group-hover:border-rose/50 group-hover:text-bone">
                        <Icon name="arrow" className="arrow h-4 w-4" />
                        <span className="sr-only">{p.link.label} (se abre en otra pestaña)</span>
                      </span>
                    )}
                  </div>
                  <p className="body-copy mt-3 text-sm">{p.description}</p>
                  <p className="mt-3 text-xs text-bone-dim">
                    <span className="text-bone-muted">Rol:</span> {p.role}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Herramientas">
                    {p.tools.map((t) => (
                      <li key={t} className="chip">{t}</li>
                    ))}
                  </ul>
                  {p.sample && <SampleTag />}
                </div>
              </Wrapper>
            </Reveal>
          );
        })}
      </div>
    </Beat>
  );
}
