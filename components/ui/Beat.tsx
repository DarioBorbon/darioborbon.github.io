import type { ReactNode } from "react";
import { STORY, beatIndex, pad2 } from "@/lib/story";
import { Reveal } from "./Reveal";

/**
 * Beat — a page section that is also a scene of the 3D story.
 * `data-glass` mirrors which side the glass is framed on, so the content
 * column automatically sits on the other side (see .beat-col in globals.css).
 */
export function Beat({
  id,
  children,
  className = "",
  wide = false,
  labelledBy,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
  labelledBy?: string;
}) {
  const beat = STORY[beatIndex(id)];
  return (
    <section id={id} data-beat={id} data-glass={beat.glass} aria-labelledby={labelledBy ?? `${id}-title`} className={`beat ${className}`}>
      <div className="beat-inner">
        <div className={`beat-col ${wide ? "wide" : ""}`}>{children}</div>
      </div>
    </section>
  );
}

/** Section header: ingredient number + name, serif title, lede. */
export function BeatHeader({
  id,
  title,
  lede,
}: {
  id: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  const i = beatIndex(id);
  const beat = STORY[i];
  return (
    <header className="mb-12 md:mb-16">
      <Reveal className="eyebrow mb-6">
        <span className="dot" />
        <span>{pad2(i)}</span>
        <span className="rule" />
        <span>Ingrediente · {beat.ingredient}</span>
      </Reveal>
      <Reveal as="h2" i={1} id={`${id}-title`} className="title">
        {title}
      </Reveal>
      {lede && (
        <Reveal as="p" i={2} className="lede mt-6">
          {lede}
        </Reveal>
      )}
    </header>
  );
}
