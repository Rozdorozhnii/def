import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@contracts': path.resolve(__dirname, '../packages/contracts/src'),
    };
    return config;
  },
};

export default nextConfig;
