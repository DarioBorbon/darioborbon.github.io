import { profile } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { beatIndex, pad2 } from "@/lib/story";

/**
 * 09 · SERVIDA — the finished drink is the hero again. The camera pulls back,
 * the glass turns slowly in the centre and the content frames it.
 */
export function Contact() {
  const i = beatIndex("contacto");
  const socials = profile.socials.filter((s) => !s.sample || process.env.NODE_ENV !== "production");
  return (
    <section id="contacto" data-beat="contacto" data-glass="center" aria-labelledby="contacto-title" className="beat relative flex min-h-[100svh] flex-col justify-between !pb-8">
      <div className="beat-inner w-full">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr_1fr] lg:items-end">
          <div>
            <Reveal className="eyebrow mb-6">
              <span className="dot" />
              <span>{pad2(i)}</span>
              <span className="rule" />
              <span>Servida</span>
            </Reveal>
            <Reveal as="h2" i={1} id="contacto-title" className="title !text-[clamp(3rem,5.6vw,5.6rem)]">
              ¿Preparamos algo <em>juntos?</em>
            </Reveal>
            <Reveal as="p" i={2} className="body-copy mt-6 max-w-sm">
              Busco equipos y marcas donde mezclar diseño, marketing, vídeo e inteligencia artificial. Escríbeme y te respondo pronto.
            </Reveal>
          </div>

          <div aria-hidden="true" className="hidden lg:block" />

          <div className="lg:pb-2">
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
                  <a href={s.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between py-3 text-sm">
                    <span className="text-bone-muted transition-colors group-hover:text-bone">{s.label}</span>
                    <span className="flex items-center gap-2 text-bone">
                      {s.handle} <Icon name="arrow" className="arrow h-3.5 w-3.5" />
                    </span>
                  </a>
                </li>
              ))}
            </Reveal>
            <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="btn btn-primary">
                <span className="btn-dot" /> Escríbeme
              </a>
              <a href={profile.cv.src} download={profile.cv.fileName} className="btn btn-ghost">
                <Icon name="download" /> {profile.cv.label}
              </a>
            </Reveal>
          </div>
        </div>
      </div>

      <footer className="beat-inner mt-24 flex w-full flex-col gap-4 border-t border-white/[0.06] pt-6 text-xs text-bone-dim sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name} · {profile.location}</p>
        <p className="mono text-[10px] uppercase tracking-label">Next.js · three.js · Claude Code</p>
        <a href="#inicio" className="link-u self-start text-bone-muted hover:text-bone sm:self-auto">
          Volver arriba <Icon name="up" className="h-3.5 w-3.5" />
        </a>
      </footer>
    </section>
  );
}
