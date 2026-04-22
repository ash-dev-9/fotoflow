import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@vladmandic/face-api",
    "@tensorflow/tfjs-node",
    "canvas",
  ],
};

export default nextConfig;
