import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root configuration
  turbopack: {
    root: '../../',
  },
};

export default nextConfig;
