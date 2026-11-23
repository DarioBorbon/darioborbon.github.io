/**
 * Optimise source images into responsive WebP files with descriptive names.
 *   node scripts/optimize-images.mjs
 * Writes public/assets/img/<name>.webp (+ <name>-640.webp, <name>-og.jpg) and
 * lib/images.json (dimensions, used by <Media> for srcset and to avoid CLS).
 * Add new images to SOURCES and run the script again.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SOURCES = [
  { in: "public/assets/videos/encantadora-cumples.jpg", name: "la-encantadora-reel-cumpleanos", max: 960 },
  { in: "public/assets/videos/pieza-restaurante.jpg", name: "la-encantadora-fc-video-patrocinador", max: 960 },
  { in: "public/assets/websites/laencantadorafc.jpg", name: "la-encantadora-fc-web", max: 1440 },
  { in: "public/assets/websites/morisushi.jpg", name: "mori-sushi-propuesta-web", max: 1440 },
  { in: "public/assets/websites/portfolio.jpg", name: "portfolio-dario-borbon-web", max: 1440 },
  { in: "public/assets/photos/IMG_0076.jpg", name: "dario-borbon-retrato-otono", max: 1200 },
  { in: "public/assets/photos/IMG_2368.jpg", name: "dario-borbon-retrato-columna", max: 1200 },
];

const outDir = "public/assets/img";
fs.mkdirSync(outDir, { recursive: true });
const manifest = {};

for (const s of SOURCES) {
  if (!fs.existsSync(s.in)) { console.warn("missing", s.in); continue; }
  const base = sharp(s.in).rotate();
  const meta = await base.metadata();
  const w = Math.min(meta.width, s.max);
  const h = Math.round((meta.height * w) / meta.width);
  await base.clone().resize({ width: w }).webp({ quality: 80 }).toFile(path.join(outDir, `${s.name}.webp`));
  const small = w > 640;
  if (small) await base.clone().resize({ width: 640 }).webp({ quality: 78 }).toFile(path.join(outDir, `${s.name}-640.webp`));
  // social-share crop (1200×630 JPEG: the most widely supported format for link previews)
  await base.clone().resize({ width: 1200, height: 630, fit: "cover", position: "top" }).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, `${s.name}-og.jpg`));
  manifest[`/assets/img/${s.name}.webp`] = { w, h, small };
  console.log(s.name, `${w}x${h}`);
}
fs.writeFileSync("lib/images.json", JSON.stringify(manifest, null, 2) + "\n");
