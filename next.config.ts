import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static optimization to avoid build errors with error pages
  experimental: {
    staticGenerationRetryCount: 0,
  },
  // Skip build-time static generation for error pages
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
