import { education } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";

/** 06 · ESCARCHADO — studies & training: precise, refined, crystalline. */
export function EducationSection() {
  return (
    <Beat id="formacion">
      <BeatHeader
        id="formacion"
        title={<>Dónde he <em>estudiado</em></>}
        lede="Una base técnica en producción gráfica y una formación en marketing que la pone al servicio de las marcas."
      />
      <div className="grid gap-4">
        {education.studies.map((s, i) => (
          <Reveal key={s.id} i={i} className="card p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="mono text-[11px] uppercase tracking-label text-bone-dim">{s.center || "Centro por confirmar"}</p>
              <span
                className={`mono rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-label ${s.status === "current" ? "bg-rose/10 text-rose-soft" : "border border-white/10 text-bone-muted"}`}
              >
                {s.period}
              </span>
            </div>
            <h3 className="display mt-3 text-[1.9rem] leading-tight">{s.title}</h3>
            <p className="body-copy mt-2 text-sm">{s.description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {s.highlights.map((h) => (
                <li key={h} className="chip">{h}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <p className="mono mb-4 text-[10px] uppercase tracking-label text-bone-dim">Formación complementaria</p>
        <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {education.training.map((t) => (
            <li key={t.title} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="text-bone">{t.title}</span>
              <span className="text-sm text-bone-dim">{t.note}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Beat>
  );
}
