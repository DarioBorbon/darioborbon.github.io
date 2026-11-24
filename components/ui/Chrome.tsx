"use client";

import { useEffect, useRef, useState } from "react";
import { initPrefs, setPrefs, usePrefs } from "@/lib/prefs";
import { STORY, pad2 } from "@/lib/story";
import { profile } from "@/lib/content";
import { Icon } from "./Icon";

/**
 * Chrome — everything fixed on top of the story:
 * skip link, top navigation, settings (motion / 3D), mobile menu,
 * the ingredient rail (story progress) and the preloader.
 */
export function Chrome() {
  const active = usePrefs((s) => s.active);
  const skillSide = usePrefs((s) => s.skillSide);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    initPrefs();
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // mirror the active beat's glass side → scrims move to the text side
  // (in the skills section the selected category decides the side)
  useEffect(() => {
    const beat = STORY[active];
    document.documentElement.dataset.beat = beat?.id ?? "";
    document.documentElement.dataset.glass = beat?.id === "arsenal" ? skillSide : beat?.glass ?? "right";
  }, [active, skillSide]);

  // lock scroll & close on Escape while the mobile menu is open
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const links = STORY.filter((b) => b.inNav);

  return (
    <>
      <a href="#sobre-mi" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
        Saltar al contenido
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500 ease-out-expo ${
          scrolled ? "border-b border-white/[0.06] bg-ink/55 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Principal" className="mx-auto flex h-16 max-w-[92rem] items-center justify-between gap-6 px-[var(--gutter)]">
          <a href="#inicio" className="group flex items-baseline gap-2" aria-label="Darío Borbón, volver al inicio">
            <span className="display text-[1.35rem] leading-none">Darío Borbón</span>
            <span className="hidden text-[10px] uppercase tracking-label text-bone-dim sm:inline mono">Portfolio</span>
          </a>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {links.map((b) => {
              const idx = STORY.indexOf(b);
              const isActive = idx === active;
              return (
                <li key={b.id}>
                  <a
                    href={`#${b.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] transition-colors duration-300 ${isActive ? "text-bone" : "text-bone-muted hover:text-bone"}`}
                  >
                    {b.nav}
                    <span
                      className={`absolute bottom-1 left-1/2 h-px w-4 -translate-x-1/2 bg-rose transition-[opacity,transform] duration-500 ease-out-expo ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a href={profile.cv.src} download={profile.cv.fileName} className="btn btn-ghost hidden h-9 px-4 text-[13px] sm:inline-flex">
              <Icon name="download" className="h-3.5 w-3.5" /> CV
            </a>
            <Settings />
            <button
              type="button"
              className="btn btn-ghost h-9 w-9 justify-center px-0 xl:hidden"
              aria-label="Abrir menú"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              onClick={() => setMenu(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`fixed inset-0 z-[60] bg-ink/95 backdrop-blur-xl transition-[opacity,visibility] duration-500 ease-out-expo xl:hidden ${menu ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-[var(--gutter)]">
          <span className="display text-xl">Darío Borbón</span>
          <button type="button" className="btn btn-ghost h-9 w-9 justify-center px-0" aria-label="Cerrar menú" onClick={() => setMenu(false)}>
            <Icon name="close" />
          </button>
        </div>
        <ul className="px-[var(--gutter)] pt-6">
          {links.map((b, n) => (
            <li key={b.id} className="border-b border-white/[0.06]">
              <a
                href={`#${b.id}`}
                onClick={() => setMenu(false)}
                tabIndex={menu ? 0 : -1}
                className="flex items-baseline justify-between py-4"
                style={{ transition: `transform 0.7s var(--ease-out) ${menu ? n * 40 : 0}ms, opacity 0.7s var(--ease-out) ${menu ? n * 40 : 0}ms`, transform: menu ? "none" : "translateY(12px)", opacity: menu ? 1 : 0 }}
              >
                <span className="display text-4xl">{b.nav}</span>
                <span className="mono text-[11px] uppercase tracking-label text-bone-dim">{pad2(STORY.indexOf(b))} · {b.ingredient}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="px-[var(--gutter)] pt-8">
          <a href={profile.cv.src} download={profile.cv.fileName} tabIndex={menu ? 0 : -1} className="btn btn-primary">
            <span className="btn-dot" /> {profile.cv.label}
          </a>
        </div>
      </div>

      <StoryRail active={active} />
      <Preloader />
    </>
  );
}

/* ---------------- settings popover ---------------- */
function Settings() {
  const motion = usePrefs((s) => s.motion);
  const scene3d = usePrefs((s) => s.scene3d);
  const failed = usePrefs((s) => s.failed);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="btn btn-ghost h-9 w-9 justify-center px-0"
        aria-label="Preferencias: movimiento y animación"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="settings" />
      </button>
      <div
        role="group"
        aria-label="Preferencias"
        className={`card absolute right-0 top-12 w-72 origin-top-right p-2 transition-[opacity,transform,visibility] duration-300 ease-out-expo ${open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}
      >
        <Toggle
          label="Movimiento reducido"
          hint="Transiciones más directas"
          checked={motion === "reduced"}
          onChange={(v) => setPrefs({ motion: v ? "reduced" : "full" })}
          disabled={!open}
        />
        <Toggle
          label="Animación de la copa"
          hint={failed ? "No se ha podido cargar la animación" : "Desactívala para navegar más ligero"}
          checked={scene3d && !failed}
          onChange={(v) => setPrefs({ scene3d: v })}
          disabled={!open || failed}
        />
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl p-3 transition-colors hover:bg-white/[0.03]">
      <span>
        <span className="block text-sm text-bone">{label}</span>
        <span className="mt-0.5 block text-xs text-bone-dim">{hint}</span>
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden="true" className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-white/10 transition-colors duration-300 peer-checked:bg-rose peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-rose-soft">
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-bone transition-transform duration-300 ease-out-expo ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
    </label>
  );
}

/* ---------------- ingredient rail ---------------- */
function StoryRail({ active }: { active: number }) {
  return (
    <nav aria-label="Ingredientes de la historia" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col items-end gap-3">
        {STORY.map((b, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={b.id}>
              <a href={`#${b.id}`} className="group flex items-center gap-3 py-0.5" aria-current={on ? "step" : undefined} aria-label={`${pad2(i)} ${b.ingredient} — ${b.nav}`}>
                <span
                  className={`mono text-[10px] uppercase tracking-label transition-[opacity,transform] duration-500 ease-out-expo ${on ? "translate-x-0 text-bone opacity-100" : "translate-x-1 text-bone-dim opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`}
                >
                  {b.ingredient}
                </span>
                <span
                  className={`block h-px transition-[width,background-color] duration-500 ease-out-expo ${on ? "w-8 bg-rose" : done ? "w-4 bg-bone/50" : "w-3 bg-bone/20 group-hover:w-5 group-hover:bg-bone/50"}`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------------- preloader ---------------- */
function Preloader() {
  const ready = usePrefs((s) => s.ready);
  const scene3d = usePrefs((s) => s.scene3d);
  const [gone, setGone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const done = ready || !scene3d || timedOut;

  useEffect(() => {
    // never hold content hostage: reveal after 3.5s regardless
    const t = setTimeout(() => setTimedOut(true), 3500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!done) return;
    document.documentElement.classList.add("is-ready");
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;
  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-ink transition-opacity duration-1000 ease-out-expo ${done ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6">
        <span className="display text-5xl">
          D<em className="text-rose-soft">·</em>B
        </span>
        <div className="h-px w-40 overflow-hidden bg-white/10">
          <div className={`h-full bg-rose-soft transition-[width] duration-[1400ms] ease-out-expo ${done ? "w-full" : "w-2/3"}`} style={{ transitionDelay: done ? "0ms" : "100ms" }} />
        </div>
        <span className="eyebrow">Preparando la copa</span>
        <button type="button" onClick={() => setPrefs({ scene3d: false })} className="link-u text-xs text-bone-dim">
          Entrar sin animación
        </button>
      </div>
    </div>
  );
}
