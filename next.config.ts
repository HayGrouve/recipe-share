import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Skip type checking during build for production deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint checking during build for production deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
