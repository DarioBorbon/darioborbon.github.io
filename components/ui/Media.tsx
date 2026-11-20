import Image from "next/image";

/**
 * Media — image with lazy loading; when `src` is empty it renders an
 * art-directed placeholder (so the site looks finished before every asset
 * exists). Replace the src in /content/*.json and it switches automatically.
 */
export function Media({
  src,
  alt,
  aspect = "16/10",
  label,
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
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: position ?? "50% 50%" }}
        />
      ) : (
        <div className="placeholder-art" role="img" aria-label={alt || label || "Imagen pendiente"}>
          <div className="absolute inset-0 flex items-end p-5">
            <span className="eyebrow text-[10px] opacity-70">{label ?? "Próximamente"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
