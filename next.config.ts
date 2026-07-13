import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack empty configuration to allow default build fallbacks
  turbopack: {},
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Strict mode for development
  reactStrictMode: true,
  // Skip type checking in build (handled by IDE and CI)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
