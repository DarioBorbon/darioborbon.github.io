import { websites } from "@/lib/content";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";

/** 03 · TÓNICA — the digital layer: websites, presented as editorial case studies. */
export function Websites() {
  return (
    <Beat id="webs" wide>
      <BeatHeader
        id="webs"
        title={<>Webs que he <em>diseñado</em></>}
        lede="Webs para negocios reales, diseñadas por mí y desarrolladas con inteligencia artificial."
      />
      <ol className="space-y-6">
        {websites.map((w, i) => {
          const host = w.url ? new URL(w.url).host : "localhost · este sitio";
          return (
            <Reveal as="li" key={w.id} className="card group overflow-hidden">
              {/* browser mockup */}
              <div className="border-b border-white/[0.06] bg-white/[0.015] px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <i className="h-2 w-2 rounded-full bg-white/15" />
                    <i className="h-2 w-2 rounded-full bg-white/15" />
                    <i className="h-2 w-2 rounded-full bg-white/15" />
                  </span>
                  <span className="mono flex-1 truncate rounded-md bg-white/[0.04] px-3 py-1 text-center text-[11px] text-bone-dim">{host}</span>
                  <span className="mono text-[10px] text-bone-dim">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
              <div className="p-3">
                <Media src={w.screenshot} alt={`Captura de la web ${w.name}`} aspect="16/9" label="Captura en preparación" sizes="(min-width: 900px) 55vw, 92vw" position="50% 0%" className="!rounded-lg" />
              </div>

              <div className="grid gap-8 px-6 pb-7 pt-3 md:grid-cols-[1.25fr_1fr]">
                <div>
                  <h3 className="display text-[2.25rem] leading-none">{w.name}</h3>
                  <p className="body-copy mt-3 text-[15px]">{w.description}</p>
                  <div className="mt-5 border-l border-rose/50 pl-4">
                    <p className="mono text-[10px] uppercase tracking-label text-bone-dim">Resultado</p>
                    <p className="mt-1 text-sm text-bone/90">{w.outcome}</p>
                  </div>
                  {w.url && (
                    <a href={w.url} target="_blank" rel="noreferrer" className="btn btn-ghost mt-6 h-10 text-sm">
                      Visitar web <Icon name="arrow" className="arrow h-3.5 w-3.5" />
                      <span className="sr-only">(se abre en otra pestaña)</span>
                    </a>
                  )}
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Qué hice</p>
                    <ul className="space-y-1.5 text-sm text-bone-muted">
                      {w.role.map((r) => (
                        <li key={r} className="flex gap-2.5">
                          <span className="mt-2 h-px w-3 shrink-0 bg-rose-soft/70" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Stack</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {w.stack.map((s) => (
                        <li key={s} className="chip">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Beat>
  );
}
