import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, projectBySlug, videos, profile, PROJECT_TAGS } from "@/lib/content";
import { projectJsonLd, ld } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/** One static, indexable case-study page per project (/proyectos/<slug>/). */
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  const path = `/proyectos/${p.slug}/`;
  const title = `${p.title}: ${p.category}`;
  const og = p.cover.src.replace(/\.webp$/, "-og.jpg");
  return {
    title,
    description: p.summary,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: `${title} | ${profile.name}`, description: p.summary, images: [{ url: og, width: 1200, height: 630, alt: p.cover.alt }] },
    twitter: { card: "summary_large_image", title: `${title} | ${profile.name}`, description: p.summary, images: [og] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const related = projects.filter((o) => o.slug !== p.slug);
  const pieces = videos.filter((v) => p.videos.includes(v.id));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(projectJsonLd(p))} />
      <div className="case-bg" aria-hidden="true" />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
        Saltar al contenido
      </a>
      <header className="relative z-10 border-b border-white/[0.06]">
        <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[92rem] items-center justify-between gap-4 px-[var(--gutter)]">
          <SmartLink href="/" className="display text-[1.35rem] leading-none">Darío Borbón</SmartLink>
          <ul className="flex items-center gap-1 text-[13px]">
            <li><SmartLink href="/#proyectos" className="inline-flex min-h-10 items-center rounded-full px-3 text-bone-muted hover:text-bone">Proyectos</SmartLink></li>
            <li><SmartLink href="/#contacto" className="btn btn-ghost h-9 px-4 text-[13px]">Contacto</SmartLink></li>
          </ul>
        </nav>
      </header>

      <main id="main" className="relative z-[1] mx-auto max-w-[72rem] px-[var(--gutter)] pb-24 pt-10 md:pt-16">
        <nav aria-label="Ruta de navegación" className="mono mb-10 text-[11px] uppercase tracking-label text-bone-dim">
          <ol className="flex flex-wrap items-center gap-2">
            <li><SmartLink href="/" className="hover:text-bone">Inicio</SmartLink></li>
            <li aria-hidden="true">/</li>
            <li><SmartLink href="/#proyectos" className="hover:text-bone">Proyectos</SmartLink></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-bone-muted">{p.title}</li>
          </ol>
        </nav>

        <article>
          <header className="max-w-[48rem]">
            <p className="eyebrow mb-6"><span className="dot" />{p.category}{p.year ? ` · ${p.year}` : ""}</p>
            <h1 className="title">{p.title}</h1>
            <p className="lede mt-6">{p.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Áreas">
              {p.tags.map((t) => <li key={t} className="chip">{PROJECT_TAGS[t]}</li>)}
            </ul>
            {p.link && (
              <SmartLink href={p.link.url} className="btn btn-primary mt-8">
                <span className="btn-dot" /> {p.link.label} <Icon name="arrow" className="arrow h-3.5 w-3.5" />
              </SmartLink>
            )}
          </header>

          <div className="card mt-12 p-3">
            <Media src={p.cover.src} alt={p.cover.alt} aspect={p.slug === "la-encantadora" ? "16/9" : "16/10"} position={p.cover.position} sizes="(min-width: 1180px) 1100px, 94vw" priority />
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
            <div className="space-y-12">
              <section aria-labelledby="necesidad">
                <h2 id="necesidad" className="display text-[2.2rem] leading-tight">La <em>necesidad</em></h2>
                <p className="body-copy mt-4 text-[16px]">{p.need}</p>
              </section>
              <section aria-labelledby="solucion">
                <h2 id="solucion" className="display text-[2.2rem] leading-tight">La <em>solución</em></h2>
                <p className="body-copy mt-4 text-[16px]">{p.solution}</p>
              </section>
              <section aria-labelledby="resultado" className="border-l border-rose/60 pl-5">
                <h2 id="resultado" className="mono text-[11px] uppercase tracking-label text-bone-dim">Resultado</h2>
                <p className="mt-2 text-[16px] text-bone/90">{p.outcome}</p>
              </section>
            </div>

            <aside className="space-y-10">
              <section aria-labelledby="participacion">
                <h2 id="participacion" className="mono mb-3 text-[11px] uppercase tracking-label text-bone-dim">Mi participación</h2>
                <ul className="space-y-2 text-[15px] text-bone-muted">
                  {p.role.map((r) => (
                    <li key={r} className="flex gap-3"><span className="mt-[0.7em] h-px w-3 shrink-0 bg-rose-soft/70" aria-hidden="true" />{r}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="herramientas">
                <h2 id="herramientas" className="mono mb-3 text-[11px] uppercase tracking-label text-bone-dim">Herramientas</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {p.tools.map((t) => <li key={t} className="chip">{t}</li>)}
                </ul>
              </section>
              {pieces.length > 0 && (
                <section aria-labelledby="piezas">
                  <h2 id="piezas" className="mono mb-3 text-[11px] uppercase tracking-label text-bone-dim">Piezas de vídeo</h2>
                  <ul className="space-y-2">
                    {pieces.map((v) => (
                      <li key={v.id}>
                        <SmartLink href="/#videos" className="link-u inline-flex min-h-8 items-center gap-1.5 text-sm text-bone hover:text-rose-soft">
                          {v.title} <Icon name="arrow" className="arrow h-3 w-3" />
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </article>

        <section aria-labelledby="mas-proyectos" className="mt-24 border-t border-white/[0.06] pt-12">
          <h2 id="mas-proyectos" className="display text-[2.2rem] leading-tight">Más <em>proyectos</em></h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {related.map((o) => (
              <li key={o.slug}>
                <SmartLink href={`/proyectos/${o.slug}/`} className="card card-hover group block h-full p-3">
                  <Media src={o.cover.src} alt="" aspect="16/10" position={o.cover.position} sizes="(min-width: 900px) 30vw, 92vw" />
                  <span className="mono mt-4 block px-2 text-[10px] uppercase tracking-label text-bone-dim">{o.category}</span>
                  <span className="display mt-1 block px-2 pb-2 text-[1.6rem] leading-tight">{o.title}</span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cta" className="card mt-16 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta" className="display text-[2.2rem] leading-tight">¿Tienes un proyecto <em>en mente?</em></h2>
            <p className="body-copy mt-2 text-sm">Marketing, diseño, vídeo, web e IA. Escríbeme y lo vemos.</p>
          </div>
          <a href={`mailto:${profile.email}`} className="btn btn-primary self-start md:self-auto"><span className="btn-dot" /> Hablemos</a>
        </section>
      </main>

      <footer className="relative z-[1] mx-auto flex max-w-[92rem] flex-col gap-3 border-t border-white/[0.06] px-[var(--gutter)] py-8 text-xs text-bone-dim sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name} · Zaragoza, Aragón</p>
        <SmartLink href="/" className="link-u text-bone-muted hover:text-bone">Volver al portfolio</SmartLink>
      </footer>
    </>
  );
}
