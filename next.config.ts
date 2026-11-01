import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
  serverExternalPackages: [
    "@imgly/background-removal-node",
    "onnxruntime-node",
    "sharp",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: "/widget",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        source: "/embed.js",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
