/** @type {import('next').NextConfig} */
// Static HTML export (for GitHub Pages).
// If the site lives at https://USER.github.io/REPO, build with BASE_PATH=/REPO
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  outputFileTracingRoot: import.meta.dirname,
  reactStrictMode: true,
  images: { unoptimized: true },
};
export default nextConfig;
