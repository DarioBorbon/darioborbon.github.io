"use client";

import Image from "next/image";
import { useState } from "react";
import { photos } from "@/lib/content";
import type { Photo } from "@/lib/types";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Lightbox } from "@/components/ui/Lightbox";
import { SampleTag } from "@/components/ui/SampleTag";

/** 08 · CONDENSACIÓN — editorial photo gallery (photos taken of me). */
export function Photos() {
  const [open, setOpen] = useState<Photo | null>(null);
  return (
    <Beat id="fotos" wide>
      <BeatHeader
        id="fotos"
        title={<>Fotos que me han <em>realizado</em></>}
        lede="Imagen y presencia: sesiones y retratos que forman parte de mi marca personal."
      />
      <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
        {photos.map((p, i) => (
          <Reveal as="li" key={p.id} i={i % 3} className="break-inside-avoid">
            <figure>
              {p.src ? (
                <button type="button" onClick={() => setOpen(p)} className="group block w-full" aria-label={`Ampliar foto: ${p.caption}`}>
                  <Media src={p.src} alt={p.alt} aspect={p.aspect} sizes="(min-width: 900px) 20vw, 45vw" position="50% 25%" />
                </button>
              ) : (
                <Media alt={p.caption} aspect={p.aspect} label="Sesión próximamente" />
              )}
              <figcaption className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xs text-bone-muted">{p.caption}</span>
                {p.credit && <span className="mono text-[10px] text-bone-dim">© {p.credit}</span>}
              </figcaption>
              {p.sample && <SampleTag />}
            </figure>
          </Reveal>
        ))}
      </ul>

      <Lightbox open={!!open} onClose={() => setOpen(null)} label={open?.caption ?? "Foto"}>
        {open && (
          <figure>
            <Image src={open.src} alt={open.alt} width={1200} height={1500} className="h-auto max-h-[84vh] w-auto rounded-xl object-contain" />
            <figcaption className="mt-3 text-sm text-bone-muted">{open.caption}</figcaption>
          </figure>
        )}
      </Lightbox>
    </Beat>
  );
}
