import { SceneMount } from "@/components/three/SceneMount";
import { Chrome } from "@/components/ui/Chrome";
import { Cursor } from "@/components/ui/Cursor";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { AISection } from "@/components/sections/AI";
import { Arsenal } from "@/components/sections/Arsenal";
import { ExperienceSection } from "@/components/sections/Experience";
import { EducationSection } from "@/components/sections/Education";
import { Videos } from "@/components/sections/Videos";
import { Photos } from "@/components/sections/Photos";
import { Contact, SiteFooter } from "@/components/sections/Contact";
import { homeJsonLd, ld } from "@/lib/seo";

/**
 * The page is the recipe. Section order = ingredient order (lib/story.ts).
 * All content is server-rendered HTML; the footage behind it is decoration.
 */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(homeJsonLd())} />
      <SceneMount />
      <Chrome />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Projects />
        <AISection />
        <Arsenal />
        <ExperienceSection />
        <EducationSection />
        <Videos />
        <Photos />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
