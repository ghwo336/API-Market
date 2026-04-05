import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@apimarket/shared"],
  output: "standalone",
};

export default nextConfig;
