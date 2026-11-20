import type { ReactElement } from "react";
/** Minimal stroke icon set — 1.5px lines, quiet, consistent. */
type Name =
  | "arrow" | "download" | "play" | "close" | "menu" | "settings" | "mail" | "up"
  | "spark" | "pen" | "window" | "pulse" | "grid";

const paths: Record<Name, ReactElement> = {
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  download: <><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>,
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  menu: <><path d="M4 8h16" /><path d="M4 16h16" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M4 12h3M17 12h3M12 4v3M12 17v3" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  up: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  spark: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  pen: <><path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z" /><path d="M14 7l3 3" /></>,
  window: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9h17" /><path d="M7 6.8h.01M9.5 6.8h.01" /></>,
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></>,
};

export function Icon({ name, className = "h-4 w-4" }: { name: Name; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
