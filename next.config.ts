import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["canvas", "@tensorflow/tfjs-node"],
  output: "standalone",
};

export default nextConfig;
