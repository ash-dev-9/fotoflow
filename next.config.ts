import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@tensorflow/tfjs-node"],
};

export default nextConfig;
