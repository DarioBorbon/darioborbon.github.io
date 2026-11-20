import { profile } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";

/**
 * 00 · LA COPA — the empty glass, dramatic and clean.
 * The name is split into masked lines that rise once the scene is ready.
 * Quick links let a recruiter skip the story entirely.
 */
export function Hero() {
  const quick = [
    { href: "#proyectos", label: "Proyectos" },
    { href: "#webs", label: "Webs" },
    { href: "#arsenal", label: "Habilidades" },
    { href: "#experiencia", label: "Experiencia" },
    { href: "#contacto", label: "Contacto" },
  ];
  return (
    <section id="inicio" data-beat="inicio" data-glass="right" aria-labelledby="inicio-title" className="beat relative flex min-h-[100svh] items-center !pb-16 !pt-28">
      <div className="beat-inner w-full">
        <div className="max-w-[44rem] max-md:pt-[40vh] md:max-w-[min(44rem,50vw)]">
          <p className="eyebrow mb-8">
            <span className="dot" />
            {profile.location.split(",")[0]} · {profile.age} años · {profile.role}
          </p>

          <h1 id="inicio-title" className="display text-[clamp(4.2rem,11.5vw,10.5rem)]">
            <span className="line-mask"><span className="line-in" style={{ ["--d" as string]: "120ms" }}>{profile.firstName}</span></span>
            <span className="line-mask"><span className="line-in" style={{ ["--d" as string]: "240ms" }}><em>{profile.lastName}</em></span></span>
          </h1>

          <p className="lede mt-8 text-bone/90">{profile.tagline}</p>
          <p className="body-copy mt-4 max-w-[34rem] text-[15px]">{profile.intro}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href="#proyectos" className="btn btn-primary">
              <span className="btn-dot" /> Ver proyectos
            </a>
            <a href={profile.cv.src} download={profile.cv.fileName} className="btn btn-ghost">
              <Icon name="download" /> {profile.cv.label}
            </a>
            <a href="#contacto" className="link-u ml-2 text-sm text-bone-muted hover:text-bone">
              Contactar <Icon name="arrow" className="arrow h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-8 md:mt-24 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="scroll-cue" aria-hidden="true" />
            <p className="mono text-[11px] uppercase tracking-label text-bone-dim">
              Desliza para preparar la copa
            </p>
          </div>
          <nav aria-label="Acceso rápido" className="max-w-md">
            <p className="mono mb-3 text-[10px] uppercase tracking-label text-bone-dim">¿Con prisa? Ve directo a</p>
            <ul className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <li key={q.href}>
                  <a href={q.href} className="chip transition-colors duration-300 hover:border-rose/40 hover:text-bone">
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
