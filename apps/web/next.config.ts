// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.livepeer.studio",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**", // pentru Firebase Storage (bucket public)
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**", // pentru Firebase Storage (URL implicit)
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // avatar Google, dacă îl vei folosi
      },
      // adaugă aici alte domenii de unde vei încărca imagini
      // { protocol: "https", hostname: "cdn.livepeer.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
