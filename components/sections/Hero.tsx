import { profile } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";

/**
 * 00 · LA COPA — the empty glass, dramatic and clean.
 * The name is split into masked lines that rise once the scene is ready.
 * "Ir directo a" lets anyone skip the story and jump to the work.
 */
export function Hero() {
  const quick = [
    { href: "#proyectos", label: "Proyectos" },
    { href: "#ia", label: "IA" },
    { href: "#videos", label: "Vídeo" },
    { href: "#experiencia", label: "Experiencia" },
    { href: "#contacto", label: "Contacto" },
  ];
  return (
    <section id="inicio" data-beat="inicio" data-glass="right" aria-labelledby="inicio-title" className="beat relative flex min-h-[100svh] items-center !pb-16 !pt-28">
      <div className="beat-inner w-full">
        <div className="max-w-[46rem] max-md:pt-[34vh] md:max-w-[min(46rem,52vw)]">
          <p className="eyebrow mb-7">
            <span className="dot" />
            Zaragoza, España · {profile.role}
          </p>

          <h1 id="inicio-title" className="display text-[clamp(4rem,11vw,10rem)]">
            <span className="line-mask"><span className="line-in" style={{ ["--d" as string]: "120ms" }}>{profile.firstName}</span></span>{" "}
            <span className="line-mask"><span className="line-in" style={{ ["--d" as string]: "240ms" }}><em>{profile.lastName}</em></span></span>
          </h1>

          <p className="hero-headline mt-7">{profile.headline}</p>
          <p className="body-copy mt-4 max-w-[34rem] text-[15.5px]">{profile.tagline}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#proyectos" className="btn btn-primary">
              <span className="btn-dot" /> Ver proyectos
            </a>
            <a href="#contacto" className="btn btn-ghost">
              Contactar <Icon name="arrow" className="arrow h-3.5 w-3.5" />
            </a>
            <a href={profile.cv.src} download={profile.cv.fileName} className="link-u ml-1 inline-flex min-h-11 items-center gap-2 text-sm text-bone-muted hover:text-bone">
              <Icon name="download" className="h-3.5 w-3.5" /> Descargar CV <span className="sr-only">(PDF)</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 md:mt-20 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="scroll-cue" aria-hidden="true" />
            <p className="mono text-[11px] uppercase tracking-label text-bone-dim">
              Desliza para preparar la copa
            </p>
          </div>
          <nav aria-label="Saltar la introducción" className="max-w-md rounded-2xl border border-white/[0.06] bg-ink/70 p-4 backdrop-blur-md">
            <p className="mono mb-3 text-[10px] uppercase tracking-label text-bone-dim">¿Con prisa? Salta la intro y ve a</p>
            <ul className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <li key={q.href}>
                  <a href={q.href} className="chip chip-link">
                    {q.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
