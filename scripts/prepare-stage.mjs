/**
 * prepare-stage.mjs — turns the real footage of the drink being made into the
 * scroll-scrubbed frame sequence used by components/stage/FootageStage.tsx.
 *   node scripts/prepare-stage.mjs
 * Source: media-src/mixkit-9418-ice-and-drink-black.mp4 (Mixkit Free License).
 * We keep 0–5.6s (empty glass → ice → citrus) and 10–20s (pour → full),
 * crop around the glass, shift orange → pink grapefruit, 15 fps, WebP.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import ffmpeg from "ffmpeg-static";

const src = "media-src/mixkit-9418-ice-and-drink-black.mp4";
const out = "public/assets/stage/seq";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const vf = "fps=15,crop=480:720:455:0,hue=h=-36:s=1.05,eq=contrast=1.06";
const run = (ss, t, start) =>
  execFileSync(ffmpeg, ["-y", "-ss", String(ss), "-t", String(t), "-i", src, "-vf", vf,
    "-c:v", "libwebp", "-quality", "74", "-start_number", String(start), `${out}/f%03d.webp`], { stdio: "ignore" });
run(0, 5.6, 0);
const a = fs.readdirSync(out).length;
run(10, 10, a);
const n = fs.readdirSync(out).length;
console.log(`segment A: ${a} frames · total: ${n} frames`);
