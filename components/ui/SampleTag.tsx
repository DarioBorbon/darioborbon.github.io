/**
 * Marks sample/placeholder entries — visible ONLY in development (`npm run dev`)
 * so you can spot what to replace; hidden in the production build.
 */
export function SampleTag() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="mono mt-3 inline-block rounded-full border border-dashed border-rose/40 px-2 py-0.5 text-[10px] uppercase tracking-label text-rose-soft">
      Ejemplo · reemplazar
    </span>
  );
}
