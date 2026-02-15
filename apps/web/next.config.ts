import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root configuration
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
};

export default nextConfig;
