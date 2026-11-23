import { profile } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { beatIndex, pad2 } from "@/lib/story";

/**
 * 09 · SERVIDA — the finished drink is the hero again, centred, and the
 * content frames it. Only verified contact data is published.
 */
export function Contact() {
  const i = beatIndex("contacto");
  const socials = profile.socials.filter((s) => !s.sample || process.env.NODE_ENV !== "production");
  return (
    <section id="contacto" data-beat="contacto" data-glass="center" aria-labelledby="contacto-title" className="beat relative flex min-h-[100svh] flex-col justify-center !pb-16">
      <div className="beat-inner w-full">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr_1fr] lg:items-end">
          <div>
            <Reveal className="eyebrow mb-6">
              <span className="dot" />
              <span>{pad2(i)}</span>
              <span className="rule" />
              <span>Servida · Contacto</span>
            </Reveal>
            <Reveal as="h2" i={1} id="contacto-title" className="title !text-[clamp(2.8rem,5.2vw,5.2rem)]">
              ¿Tienes un proyecto <em>en mente?</em>
            </Reveal>
            <Reveal as="p" i={2} className="body-copy mt-6 max-w-sm">
              {profile.availability}. Si buscas a alguien que mezcle marketing, diseño, vídeo, web e inteligencia artificial, escríbeme y te respondo pronto.
            </Reveal>
            <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="btn btn-primary">
                <span className="btn-dot" /> Hablemos
              </a>
              <a href={profile.cv.src} download={profile.cv.fileName} className="btn btn-ghost">
                <Icon name="download" /> {profile.cv.label} <span className="sr-only">(PDF)</span>
              </a>
            </Reveal>
          </div>

          <div aria-hidden="true" className="hidden lg:block" />

          <div className="lg:pb-2 xl:pr-24">
            <Reveal i={1}>
              <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Email</p>
              <a href={`mailto:${profile.email}`} className="link-u display break-all text-[clamp(1.6rem,2.4vw,2.3rem)] leading-tight hover:text-rose-soft">
                {profile.email}
              </a>
              {profile.showPhone && profile.phone && (
                <p className="mt-3 text-sm text-bone-muted">
                  <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="link-u">{profile.phone}</a>
                </p>
              )}
            </Reveal>
            <Reveal as="ul" i={2} className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-12 items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-bone-muted transition-colors group-hover:text-bone">{s.label}</span>
                    <span className="flex items-center gap-2 text-bone">
                      {s.handle} <Icon name="arrow" className="arrow h-3.5 w-3.5" />
                      <span className="sr-only">(se abre en otra pestaña)</span>
                    </span>
                  </a>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Site footer (outside <main>). */
export function SiteFooter() {
  return (
    <footer className="relative z-[1] mx-auto flex w-full max-w-[92rem] flex-col gap-4 border-t border-white/[0.06] px-[var(--gutter)] py-8 text-xs text-bone-dim sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} {profile.name} · Marketing, diseño web e IA en Zaragoza, Aragón</p>
      <p className="mono text-[10px] uppercase tracking-label">Hecho con Next.js y Claude Code</p>
      <a href="#inicio" className="link-u inline-flex min-h-8 items-center gap-1.5 self-start text-bone-muted hover:text-bone sm:self-auto">
        Volver arriba <Icon name="up" className="h-3.5 w-3.5" />
      </a>
    </footer>
  );
}
