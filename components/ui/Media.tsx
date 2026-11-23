import images from "@/lib/images.json";

type ImgMeta = { w: number; h: number; small: boolean };
const META = images as Record<string, ImgMeta>;

/** Strip the deploy base path so we can look the file up in lib/images.json. */
const key = (src: string) => {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return base && src.startsWith(base) ? src.slice(base.length) : src;
};

/** Responsive attributes for an optimised image (see scripts/optimize-images.mjs). */
export function imgProps(src: string, sizes: string) {
  const meta = META[key(src)];
  if (!meta) return { src };
  const srcSet = meta.small ? `${src.replace(/\.webp$/, "-640.webp")} 640w, ${src} ${meta.w}w` : undefined;
  return { src, srcSet, sizes: srcSet ? sizes : undefined, width: meta.w, height: meta.h };
}

/**
 * Media — responsive, lazy-loaded image in a framed box of fixed aspect ratio
 * (no layout shift). When `src` is empty it renders a neutral art-directed
 * panel with no "coming soon" copy, so nothing provisional is ever shown.
 */
export function Media({
  src,
  alt,
  aspect = "16/10",
  position,
  sizes = "(min-width: 900px) 50vw, 100vw",
  priority = false,
  className = "",
}: {
  src?: string;
  alt: string;
  aspect?: string;
  label?: string;
  position?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`frame ${className}`} style={{ aspectRatio: aspect }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...imgProps(src, sizes)}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position ?? "50% 50%" }}
        />
      ) : (
        <div className="placeholder-art" role="img" aria-label={alt} />
      )}
    </div>
  );
}

