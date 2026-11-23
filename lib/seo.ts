/**
 * Schema.org JSON-LD builders. Only verifiable data: name, location (city),
 * own profiles (sameAs), real projects. No ratings, awards or clients.
 */
import { profile, projects, SITE_URL } from "./content";
import type { Project } from "./types";

export const url = (path = "/") => `${SITE_URL}${path}`;
const PERSON_ID = url("/#persona");
const SITE_ID = url("/#web");

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  givenName: profile.firstName,
  familyName: profile.lastName,
  url: url("/"),
  image: url(profile.portrait.src),
  jobTitle: "Creativo digital: marketing, diseño web e inteligencia artificial",
  description: profile.seoDescription,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Zaragoza", addressRegion: "Aragón", addressCountry: "ES" },
  knowsAbout: ["Marketing digital", "Diseño web", "Diseño gráfico", "Producción audiovisual", "Inteligencia artificial", "Gestión de redes sociales"],
  alumniOf: [{ "@type": "EducationalOrganization", name: "IES Pilar Lorengar" }],
  sameAs: profile.socials.filter((s) => s.own).map((s) => s.url),
};

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": SITE_ID, url: url("/"), name: `${profile.name} · Portfolio`, inLanguage: "es-ES", publisher: { "@id": PERSON_ID } },
      { "@type": "ProfilePage", "@id": url("/#pagina"), url: url("/"), name: `${profile.name} | Marketing, Diseño Web e IA en Zaragoza`, isPartOf: { "@id": SITE_ID }, inLanguage: "es-ES", mainEntity: { "@id": PERSON_ID } },
      person,
      {
        "@type": "ItemList",
        name: "Proyectos destacados",
        itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: url(`/proyectos/${p.slug}/`), name: p.title })),
      },
    ],
  };
}

export function projectJsonLd(p: Project) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": url(`/proyectos/${p.slug}/#proyecto`),
        name: p.title,
        description: p.summary,
        url: url(`/proyectos/${p.slug}/`),
        image: url(p.cover.src),
        inLanguage: "es-ES",
        genre: p.category,
        creator: person,
        ...(p.link ? { sameAs: p.link.url } : {}),
        isPartOf: { "@id": SITE_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: url("/") },
          { "@type": "ListItem", position: 2, name: "Proyectos", item: url("/#proyectos") },
          { "@type": "ListItem", position: 3, name: p.title, item: url(`/proyectos/${p.slug}/`) },
        ],
      },
    ],
  };
}

/** Safe inline JSON for <script type="application/ld+json">. */
export const ld = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\u003c") });
