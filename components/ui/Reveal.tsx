"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Reveal — fades/rises content into place once, when it enters the viewport.
 * One shared IntersectionObserver for the whole page. `i` staggers siblings
 * (80ms steps) so cards arrive as a sequence, not a wall.
 */
let io: IntersectionObserver | null = null;
function observer() {
  if (io || typeof window === "undefined") return io;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
  );
  return io;
}

export function Reveal({
  as: Tag = "div",
  i = 0,
  className = "",
  children,
  style,
  ...rest
}: {
  as?: ElementType;
  i?: number;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const o = observer();
    if (!el || !o) return;
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ ...style, ["--i" as string]: i }} {...rest}>
      {children}
    </Tag>
  );
}
