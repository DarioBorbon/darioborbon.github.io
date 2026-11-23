"use client";

import { useState } from "react";
import { videos, profile, projectBySlug } from "@/lib/content";
import type { Video } from "@/lib/types";
import { Beat, BeatHeader } from "@/components/ui/Beat";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Lightbox } from "@/components/ui/Lightbox";
import { SmartLink } from "@/components/ui/SmartLink";
import { imgProps } from "@/components/ui/Media";

/**
 * 07 · BURBUJAS — audiovisual production. Posters only: the video file is
 * requested when you press play (nothing autoplays on the page).
 * Each piece states what I actually did on it.
 */
export function Videos() {
  const [open, setOpen] = useState<Video | null>(null);
  const ig = profile.socials.find((s) => s.url.includes("instagram"));
  return (
    <Beat id="videos" wide>
      <BeatHeader
        id="videos"
        title={<>Producción <em>audiovisual</em></>}
        lede="Guion, cámara, montaje en Premiere Pro y acabado. Reels pensados para redes y piezas promocionales con intención cinematográfica."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)]">
        {videos.map((v, i) => {
          const project = v.project ? projectBySlug(v.project) : undefined;
          return (
            <Reveal key={v.id} i={i} className={v.orientation === "vertical" ? "sm:row-span-2" : ""}>
              <article className="card group h-full p-3">
                <button type="button" onClick={() => setOpen(v)} className="block w-full text-left" aria-label={`Reproducir vídeo: ${v.title}${v.duration ? `, ${v.duration}` : ""}`}>
                  <div className="frame" style={{ aspectRatio: v.orientation === "vertical" ? "9/16" : "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img {...imgProps(v.poster, "(min-width: 900px) 30vw, 92vw")} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-ink/40 text-bone backdrop-blur-md transition-[transform,background-color,border-color] duration-300 ease-out-expo group-hover:scale-105 group-hover:border-rose/60 group-hover:bg-rose/20">
                      <Icon name="play" className="ml-0.5 h-5 w-5" />
                    </span>
                    {v.duration && <span className="mono absolute bottom-3 right-3 rounded bg-ink/60 px-1.5 py-0.5 text-[10px] text-bone-muted backdrop-blur">{v.duration}</span>}
                  </div>
                </button>
                <div className="px-2 pb-2 pt-4">
                  <p className="mono text-[10px] uppercase tracking-label text-bone-dim">{v.category}</p>
                  <h3 className="display mt-1.5 text-[1.7rem] leading-tight">{v.title}</h3>
                  <p className="body-copy mt-2 text-sm">{v.description}</p>
                  <p className="mono mb-2 mt-4 text-[10px] uppercase tracking-label text-bone-dim">Qué hice</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {v.role.map((r) => (
                      <li key={r} className="chip">{r}</li>
                    ))}
                  </ul>
                  {project && (
                    <SmartLink href={`/proyectos/${project.slug}/`} className="link-u mt-4 inline-flex min-h-8 items-center gap-1.5 text-sm text-rose-soft">
                      Proyecto: {project.title} <Icon name="arrow" className="arrow h-3 w-3" />
                    </SmartLink>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
        {ig && (
          <Reveal i={2}>
            <a href={ig.url} target="_blank" rel="noopener noreferrer" className="card card-hover group flex h-full min-h-40 flex-col justify-between p-6">
              <p className="mono text-[10px] uppercase tracking-label text-bone-dim">Más contenido</p>
              <div>
                <p className="display text-[1.7rem] leading-tight">Reels, carteles y piezas en Instagram</p>
                <p className="link-u mt-2 text-sm text-rose-soft">{ig.handle} <Icon name="arrow" className="arrow h-3.5 w-3.5" /><span className="sr-only"> (se abre en otra pestaña)</span></p>
              </div>
            </a>
          </Reveal>
        )}
      </div>

      <Lightbox open={!!open} onClose={() => setOpen(null)} label={open?.title ?? "Vídeo"}>
        {open && (
          <figure>
            <video
              src={open.src}
              poster={open.poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className={`rounded-xl bg-black ${open.orientation === "vertical" ? "max-h-[84vh] w-auto" : "w-[min(92vw,1100px)]"}`}
            />
            <figcaption className="mt-3 text-sm text-bone-muted">{open.title}</figcaption>
          </figure>
        )}
      </Lightbox>
    </Beat>
  );
}
