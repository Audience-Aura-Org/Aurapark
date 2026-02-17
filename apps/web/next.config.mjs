import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Set explicit root for Turbopack to silence workspace warnings
  // and ensure efficient file scanning in the monorepo.
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },

  // These are standard but some Next.js versions/Turbopack versions 
  // can be picky about them if not needed. 
  // Removing 'eslint' to fix the unrecognized key warning.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
