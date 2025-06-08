import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //reactStrictMode: false, // Disable React Strict Mode
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  // optional settings:
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // distDir: 'dist',
};

export default nextConfig;
