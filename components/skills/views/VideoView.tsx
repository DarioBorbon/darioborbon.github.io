"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { skills, videos } from "@/lib/content";
import { asset } from "@/lib/asset";

/**
 * VÍDEO — a compact edit suite built from my real footage.
 * Viewer with working transport (play/pause, mute, time), a timeline whose
 * V1 track is made of real frames from the selected piece (click to seek),
 * and a "production" track listing what I did on it. The video file is only
 * requested when you press play.
 */
const cat = skills.categories.find((c) => c.id === "video")!;
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const thumbs = (id: string) => Array.from({ length: 8 }, (_, i) => asset(`/assets/skills/${id}-t${String(i + 1).padStart(2, "0")}.webp`));

export function VideoView() {
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const v = videos[sel];

  // pause when the panel is hidden (category change) or the clip changes
  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDur(0);
  }, [sel]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && el.pause());
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  const seek = (ratio: number) => {
    const el = ref.current;
    if (!el) return;
    const go = () => { el.currentTime = ratio * (el.duration || 0); };
    if (el.readyState < 1) { el.preload = "metadata"; el.load(); el.addEventListener("loadedmetadata", go, { once: true }); }
    else go();
  };
  const total = dur || (v.duration ? Number(v.duration.split(":")[0]) * 60 + Number(v.duration.split(":")[1]) : 0);
  const p = total ? Math.min(1, time / total) : 0;

  return (
    <div className="vid-view">
      <div className="sk-item vid-suite" style={{ "--i": 1 } as CSSProperties}>
        {/* clip bin */}
        <div className="vid-bin" role="group" aria-label="Elegir pieza">
          {videos.map((x, i) => (
            <button key={x.id} type="button" aria-pressed={i === sel} onClick={() => setSel(i)} className="vid-clip">
              <span className="mono text-[9px] uppercase tracking-label">{x.orientation === "vertical" ? "9:16" : "16:9"} · {x.duration}</span>
              <span className="text-[12.5px] leading-tight">{x.title.split("·")[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* viewer */}
        <div className={`vid-viewer ${v.orientation}`}>
          <video
            key={v.id}
            ref={ref}
            src={v.src}
            poster={v.poster}
            preload="none"
            playsInline
            muted={muted}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onClick={toggle}
            aria-label={`Vídeo: ${v.title}`}
          />
          <span className="vid-rec mono" aria-hidden="true"><i /> {playing ? "PLAY" : "READY"}</span>
        </div>

        {/* transport */}
        <div className="vid-transport">
          <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"} className="vid-btn vid-btn-main">
            {playing ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>}
          </button>
          <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Activar sonido" : "Silenciar"} aria-pressed={!muted} className="vid-btn">
            {muted ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l4 6M21 9l-4 6" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" /></svg>}
          </button>
          <span className="mono text-[11px] tabular-nums text-bone-muted">{fmt(time)} / {fmt(total)}</span>
          <span className="mono ml-auto truncate text-[10px] uppercase tracking-label text-bone-dim">{v.category}</span>
        </div>

        {/* timeline */}
        <div className="vid-timeline" style={{ "--p": p } as CSSProperties}>
          <div className="vid-ruler mono" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => <span key={i}>{fmt((total * i) / 4)}</span>)}
          </div>
          <div className="vid-track">
            <span className="vid-tag mono">V1</span>
            <div className="vid-strip" role="slider" aria-label="Línea de tiempo" aria-valuemin={0} aria-valuemax={Math.round(total)} aria-valuenow={Math.round(time)} tabIndex={0}
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); }}
              onKeyDown={(e) => { if (e.key === "ArrowRight") seek(Math.min(1, p + 0.05)); if (e.key === "ArrowLeft") seek(Math.max(0, p - 0.05)); }}
            >
              {thumbs(v.id).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" decoding="async" />
              ))}
            </div>
          </div>
          <div className="vid-track">
            <span className="vid-tag mono">A1</span>
            <div className="vid-wave" aria-hidden="true">
              {Array.from({ length: 48 }, (_, i) => <i key={i} style={{ height: `${22 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 70}%` }} />)}
            </div>
          </div>
          <div className="vid-track">
            <span className="vid-tag mono">QUÉ</span>
            <ul className="vid-roles" aria-label="Qué hice en esta pieza">
              {v.role.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <span className="vid-playhead" aria-hidden="true" />
        </div>
      </div>

      <div className="sk-item mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8" style={{ "--i": 2 } as CSSProperties}>
        <div>
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Herramientas</p>
          <ul className="space-y-1">
            {cat.tools.map((t) => <li key={t.name} className="text-[14px] text-bone">{t.name}</li>)}
          </ul>
        </div>
        <div>
          <p className="mono mb-2 text-[10px] uppercase tracking-label text-bone-dim">Competencias</p>
          <ul className="flex flex-wrap gap-1.5">
            {cat.abilities.map((a) => <li key={a} className="chip">{a}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
