/**
 * Single entry point for all editable content.
 * To update the site, edit the JSON files in /content — no component changes needed.
 */
import profileJson from "@/content/profile.json";
import projectsJson from "@/content/projects.json";
import aiJson from "@/content/ai.json";
import experienceJson from "@/content/experience.json";
import educationJson from "@/content/education.json";
import videosJson from "@/content/videos.json";
import photosJson from "@/content/photos.json";
import skillsJson from "@/content/skills.json";
import type {
  Profile, Project, AI, Experience, Education, Video, Photo, Skills,
} from "./types";
import { withAssets } from "./asset";

export const profile = withAssets(profileJson) as Profile;
export const projects = withAssets(projectsJson) as Project[];
export const ai = aiJson as AI;
export const experience = withAssets(experienceJson) as Experience[];
export const education = withAssets(educationJson) as Education;
export const videos = withAssets(videosJson) as Video[];
export const photos = withAssets(photosJson) as Photo[];
export const skills = withAssets(skillsJson) as Skills;

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Public site origin (canonical URLs, sitemap, Open Graph). */
export const SITE_URL = "https://darioborbon.github.io";
export const PROJECT_TAGS: Record<string, string> = {
  web: "Diseño web",
  grafico: "Diseño gráfico y marca",
  audiovisual: "Producción audiovisual",
  ia: "Inteligencia artificial",
};
