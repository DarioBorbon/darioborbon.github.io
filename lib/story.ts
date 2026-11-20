/**
 * THE STORY — single source of truth shared by the DOM and the 3D scene.
 *
 * Each beat is one page section AND one ingredient of the drink. Its index is
 * the beat's position on the scroll timeline: the scene reads a continuous
 * "story position" s, where s = i + (progress through section i).
 *
 * `glass` tells the layout on which side the 3D glass is framed on desktop,
 * so content always sits on the opposite side.
 */
export type GlassSide = "left" | "right" | "center";

export type Beat = {
  id: string;
  nav: string;          // label in navigation
  ingredient: string;   // narrative ingredient
  glass: GlassSide;
  inNav: boolean;
};

export const STORY: Beat[] = [
  { id: "inicio",      nav: "Inicio",      ingredient: "La copa",       glass: "right",  inNav: false },
  { id: "sobre-mi",    nav: "Quién soy",   ingredient: "Hielo",         glass: "left",   inNav: true },
  { id: "proyectos",   nav: "Proyectos",   ingredient: "Cítrico",         glass: "right",  inNav: true },
  { id: "webs",        nav: "Webs",        ingredient: "Primer chorro",        glass: "left",   inNav: true },
  { id: "arsenal",     nav: "Arsenal",     ingredient: "La mezcla",     glass: "center", inNav: true },
  { id: "experiencia", nav: "Experiencia", ingredient: "Cuerpo",       glass: "right",  inNav: true },
  { id: "formacion",   nav: "Formación",   ingredient: "Hasta arriba",    glass: "left",   inNav: true },
  { id: "videos",      nav: "Vídeos",      ingredient: "Burbujas",      glass: "right",  inNav: true },
  { id: "fotos",       nav: "Fotos",       ingredient: "Reposo",  glass: "left",   inNav: true },
  { id: "contacto",    nav: "Contacto",    ingredient: "Servida",       glass: "center", inNav: true },
];

export const beatIndex = (id: string) => STORY.findIndex((b) => b.id === id);
export const pad2 = (n: number) => String(n).padStart(2, "0");
