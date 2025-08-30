import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // keep builds green on warnings; errors still fail
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
