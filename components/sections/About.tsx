import { profile } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";

/** 01 · HIELO — the solid base: identity, facts, CV. */
export function About() {
  const facts = [
    { k: "Edad", v: `${profile.age} años` },
    { k: "Ciudad", v: profile.location },
    { k: "Ahora", v: "Grado Superior en Marketing y Publicidad" },
    { k: "Disponible para", v: profile.availability },
  ];
  return (
    <Beat id="sobre-mi">
      <BeatHeader id="sobre-mi" title={<>Quién <em>soy</em></>} lede={profile.about.lead} />

      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
        <Reveal className="relative">
          <Media src={profile.portrait.src} alt={profile.portrait.alt} aspect="4/5" sizes="(min-width: 900px) 22vw, 90vw" position="50% 20%" />
          <p className="mono mt-3 text-[10px] uppercase tracking-label text-bone-dim">{profile.name} · {profile.location.split(",")[0]}</p>
        </Reveal>

        <div>
          {profile.about.paragraphs.map((p, i) => (
            <Reveal as="p" key={i} i={i + 1} className="body-copy mb-5 text-[15.5px]">
              {p}
            </Reveal>
          ))}

          <Reveal as="dl" i={3} className="card mt-8 divide-y divide-white/[0.06] px-5">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5 text-sm">
                <dt className="mono text-[11px] uppercase tracking-label text-bone-dim">{f.k}</dt>
                <dd className="text-bone/90">{f.v}</dd>
              </div>
            ))}
          </Reveal>

          <Reveal i={4} className="mt-8">
            <a href={profile.cv.src} download={profile.cv.fileName} className="btn btn-primary">
              <Icon name="download" /> {profile.cv.label} <span className="mono text-[11px] text-ink/50">PDF</span>
            </a>
          </Reveal>
        </div>
      </div>

      <ul className="mt-16 grid gap-px overflow-hidden rounded-[1.125rem] border border-white/[0.07] bg-white/[0.06] md:grid-cols-3">
        {profile.about.differentiators.map((d, i) => (
          <Reveal as="li" key={d.title} i={i} className="bg-ink-900/90 p-6 backdrop-blur-md">
            <span className="mono text-[11px] text-rose-soft">0{i + 1}</span>
            <h3 className="display mt-3 text-2xl">{d.title}</h3>
            <p className="body-copy mt-2 text-sm">{d.text}</p>
          </Reveal>
        ))}
      </ul>
    </Beat>
  );
}
