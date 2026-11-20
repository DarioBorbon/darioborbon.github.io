"use client";
import dynamic from "next/dynamic";

/**
 * The story layer behind the page. Currently: real footage of the drink being
 * made, scrubbed by scroll (components/stage/FootageStage.tsx).
 * Alternatives kept in the repo: ./SceneCanvas (procedural 3D) and
 * ../stage/ProductStage (one still photo per section).
 */
const FootageStage = dynamic(() => import("@/components/stage/FootageStage"), { ssr: false });

export function SceneMount() {
  return <FootageStage />;
}
