/**
 * prepare-media.mjs — one-off helper that turns your raw files into web-ready assets.
 *   npm run media
 * - Compresses raw videos (Vídeos/*.mp4|mov) into /public/assets/videos (H.264 720p + poster .jpg)
 * - Copies the CV into /public/assets/cv
 * - Extracts embedded JPEG photos from the CV PDF into /public/assets/profile
 * Re-run whenever you drop new raw videos in /Vídeos.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const root = process.cwd();
const rawDir = path.join(root, "Vídeos");
const outVid = path.join(root, "public/assets/videos");
const outCv = path.join(root, "public/assets/cv");
const outProfile = path.join(root, "public/assets/profile");
[outVid, outCv, outProfile].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

for (const f of fs.readdirSync(rawDir)) {
  const src = path.join(rawDir, f);
  if (/\.(mp4|mov|m4v)$/i.test(f)) {
    const name = slug(f);
    const out = path.join(outVid, `${name}.mp4`);
    if (!fs.existsSync(out)) {
      console.log("encoding", f);
      execFileSync(ffmpeg, ["-y", "-i", src, "-vf", "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2", "-c:v", "libx264",
        "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "112k",
        "-movflags", "+faststart", out], { stdio: "inherit" });
    }
    const poster = path.join(outVid, `${name}.jpg`);
    if (!fs.existsSync(poster)) {
      execFileSync(ffmpeg, ["-y", "-ss", "2", "-i", out, "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4", poster], { stdio: "inherit" });
    }
  }
  if (/\.pdf$/i.test(f)) {
    fs.copyFileSync(src, path.join(outCv, "Curriculum_Dario_Borbon.pdf"));
    // pull raw DCT (JPEG) streams out of the PDF
    const buf = fs.readFileSync(src);
    let i = 0, n = 0;
    while ((i = buf.indexOf(Buffer.from([0xff, 0xd8, 0xff]), i)) !== -1) {
      const end = buf.indexOf(Buffer.from([0xff, 0xd9]), i);
      // find the EOI that precedes "endstream"
      const es = buf.indexOf(Buffer.from("endstream"), i);
      const stop = es !== -1 ? buf.lastIndexOf(Buffer.from([0xff, 0xd9]), es) + 2 : end + 2;
      if (stop > i + 5000) fs.writeFileSync(path.join(outProfile, `cv-photo-${n++}.jpg`), buf.subarray(i, stop));
      i = stop;
    }
    console.log(`extracted ${n} image(s) from CV`);
  }
}
console.log("done");
