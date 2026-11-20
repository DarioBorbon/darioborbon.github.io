import { SceneMount } from "@/components/three/SceneMount";
import { Chrome } from "@/components/ui/Chrome";
import { Cursor } from "@/components/ui/Cursor";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Websites } from "@/components/sections/Websites";
import { Arsenal } from "@/components/sections/Arsenal";
import { ExperienceSection } from "@/components/sections/Experience";
import { EducationSection } from "@/components/sections/Education";
import { Videos } from "@/components/sections/Videos";
import { Photos } from "@/components/sections/Photos";
import { Contact } from "@/components/sections/Contact";


/**
 * The page is the recipe. Section order = ingredient order (lib/story.ts).
 */
export default function Page() {
  return (
    <>
      <SceneMount />
      <Chrome />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Projects />
        <Websites />
        <Arsenal />
        <ExperienceSection />
        <EducationSection />
        <Videos />
        <Photos />
        <Contact />
      </main>
    </>
  );
}
