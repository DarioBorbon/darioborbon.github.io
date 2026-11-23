import type { MetadataRoute } from "next";
import { projects, SITE_URL } from "@/lib/content";

export const dynamic = "force-static";

/** Only real, public, indexable URLs (canonical form, trailing slash). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({ url: `${SITE_URL}/proyectos/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
