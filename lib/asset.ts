/** Prefix a local /assets path with the deploy base path (GitHub Pages sub-folder). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const asset = (p: string) => (BASE && p.startsWith("/") && !p.startsWith("//") ? BASE + p : p);

/** Deep-copy JSON content, prefixing every "/assets/..." string. */
export function withAssets<T>(v: T): T {
  if (!BASE) return v;
  if (typeof v === "string") return (v.startsWith("/assets/") ? BASE + v : v) as T;
  if (Array.isArray(v)) return v.map(withAssets) as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withAssets(x)])) as T;
  }
  return v;
}
