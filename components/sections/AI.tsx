import { ai } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * 03 · PRIMER CHORRO — artificial intelligence as a way of working.
 * Not a logo wall: each workflow shows which tools I chain, what each one
 * does and which real project came out of it.
 */
export function AISection() {
  return (
    <Beat id="ia" wide>
      <BeatHeader
        id="ia"
        title={<>Inteligencia artificial <em>aplicada</em></>}
        lede={ai.statement}
      />

      <Reveal as="ul" className="mb-10 flex flex-wrap gap-2" aria-label="Dónde uso la IA">
        {ai.areas.map((a) => (
          <li key={a} className="chip">{a}</li>
        ))}
      </Reveal>

      <ol className="space-y-5">
        {ai.workflows.map((w, i) => (
          <Reveal as="li" key={w.title} i={i} className="card p-5 md:p-7">
            <article>
              <p className="mono text-[10px] uppercase tracking-label text-bone-dim">
                Flujo {String(i + 1).padStart(2, "0")} · {w.context}
              </p>
              <h3 className="display mt-2 text-[1.9rem] leading-tight">{w.title}</h3>

              <ol className="flow mt-6" aria-label="Pasos del flujo">
                {w.steps.map((s, n) => (
                  <li key={s.tool} className="flow-step">
                    <span className="mono text-[10px] text-rose-soft">{String(n + 1).padStart(2, "0")}</span>
                    <span className="mt-1 block text-[15px] text-bone">{s.tool}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-bone-dim">{s.does}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-bone/90">
                  <span className="mono mr-2 text-[10px] uppercase tracking-label text-bone-dim">Resultado</span>
                  {w.result}
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {w.links.map((l) => (
                    <li key={l.href}>
                      <SmartLink href={l.href} className="link-u inline-flex min-h-8 items-center gap-1.5 text-sm text-bone hover:text-rose-soft">
                        {l.label} <Icon name="arrow" className="arrow h-3 w-3" />
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </Beat>
  );
}
