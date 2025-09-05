// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vod-cdn.lp-playback.studio", pathname: "/**" },
      { protocol: "https", hostname: "image.livepeer.studio", pathname: "/**" },
      { protocol: "https", hostname: "livepeercdn.com", pathname: "/**" },
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
    // ✅ obligatoriu pentru rute locale cu query (/thumb/frame?...).
    localPatterns: [
      { pathname: "/thumb/frame", search: "*" }, // exact /thumb/frame + orice query
      { pathname: "/thumb/**",    search: "*" }, // orice sub /thumb/ + orice query (backup)
      {
        pathname: "/avatars/**", // permite toate imaginile din /public/avatars
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
