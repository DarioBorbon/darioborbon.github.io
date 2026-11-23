"use client";

import { useState } from "react";
import { photos } from "@/lib/content";
import type { Photo } from "@/lib/types";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media, imgProps } from "@/components/ui/Media";
import { Lightbox } from "@/components/ui/Lightbox";

/**
 * 08 · REPOSO — personal brand images. These are portraits where I am the
 * model; they are not photographs I took, and the copy says so.
 */
export function Photos() {
  const [open, setOpen] = useState<Photo | null>(null);
  return (
    <Beat id="fotos" wide>
      <BeatHeader
        id="fotos"
        title={<>Imagen <em>personal</em></>}
        lede="Retratos que forman parte de mi marca personal. Aparezco como modelo: no son fotografías realizadas por mí."
      />
      <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
        {photos.map((p, i) => (
          <Reveal as="li" key={p.id} i={i % 3} className="break-inside-avoid">
            <figure>
              <button type="button" onClick={() => setOpen(p)} className="group block w-full" aria-label={`Ampliar foto: ${p.caption}`}>
                <Media src={p.src} alt={p.alt} aspect={p.aspect} sizes="(min-width: 900px) 20vw, 45vw" position="50% 25%" />
              </button>
              <figcaption className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xs text-bone-muted">{p.caption}</span>
                <span className="mono text-[10px] text-bone-dim">{p.credit ? `Foto: ${p.credit}` : "Darío como modelo"}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>

      <Lightbox open={!!open} onClose={() => setOpen(null)} label={open?.caption ?? "Foto"}>
        {open && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...imgProps(open.src, "92vw")} alt={open.alt} className="h-auto max-h-[84vh] w-auto rounded-xl object-contain" />
            <figcaption className="mt-3 text-sm text-bone-muted">{open.caption}</figcaption>
          </figure>
        )}
      </Lightbox>
    </Beat>
  );
}
