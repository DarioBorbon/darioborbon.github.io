import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Darío Borbón · Portfolio",
    short_name: "Darío Borbón",
    description: "Portfolio de Darío Borbón: marketing, diseño web, producción audiovisual e inteligencia artificial en Zaragoza.",
    start_url: "/",
    display: "browser",
    background_color: "#050506",
    theme_color: "#050506",
    lang: "es",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
