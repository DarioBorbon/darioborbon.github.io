/**
 * Content schema. Every JSON file in /content is typed here, so a typo in a
 * field name surfaces at build time instead of as a blank card.
 * Fields starting with "_" (e.g. "_TODO") are notes for the editor and are ignored.
 */

export type Link = { label: string; url: string };
export type Social = { label: string; handle: string; url: string; sample?: boolean };

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  role: string;
  tagline: string;
  intro: string;
  availability: string;
  about: {
    lead: string;
    paragraphs: string[];
    differentiators: { title: string; text: string }[];
  };
  portrait: { src: string; alt: string };
  cv: { src: string; label: string; fileName: string };
  email: string;
  phone?: string;
  showPhone?: boolean;
  socials: Social[];
};

export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  role: string;
  tools: string[];
  /** src empty → an art-directed placeholder is rendered instead. */
  cover: { src: string; alt: string; position?: string };
  link: Link | null;
  sample?: boolean;
};

export type Website = {
  id: string;
  name: string;
  url: string;
  description: string;
  stack: string[];
  role: string[];
  outcome: string;
  screenshot: string;
  sample?: boolean;
};

export type Experience = {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  current: boolean;
  type: string;
  bullets: string[];
};

export type Education = {
  studies: {
    id: string;
    title: string;
    center: string;
    period: string;
    status: "current" | "done";
    description: string;
    highlights: string[];
  }[];
  training: { title: string; note: string }[];
};

export type Video = {
  id: string;
  title: string;
  category: string;
  description: string;
  src: string;
  poster: string;
  orientation: "vertical" | "horizontal";
  duration?: string;
  sample?: boolean;
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  credit?: string;
  /** CSS aspect-ratio, e.g. "4/5" */
  aspect: string;
  sample?: boolean;
};

export type SkillTool = { name: string; status: "uso" | "aprendiendo"; note?: string };
export type SkillCategory = {
  id: string;
  name: string;
  short: string;
  featured: boolean;
  icon: "spark" | "play" | "pen" | "window" | "pulse" | "grid";
  description: string;
  tools: SkillTool[];
  abilities: string[];
  examples: { label: string; href: string }[];
};
export type Skills = { title: string; statement: string; categories: SkillCategory[] };
