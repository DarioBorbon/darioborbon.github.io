"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Lightbox — native <dialog> (focus trap, Esc, inert background for free).
 * Children only mount while open, so videos never load until requested.
 */
export function Lightbox({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="relative">
          <button type="button" onClick={onClose} className="btn btn-ghost absolute -top-12 right-0 h-9 w-9 justify-center px-0" aria-label="Cerrar">
            <Icon name="close" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
