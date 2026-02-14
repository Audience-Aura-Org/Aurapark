import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // @ts-ignore - Turbopack root configuration
  turbopack: {
    root: '../../',
  },
};

export default nextConfig;
