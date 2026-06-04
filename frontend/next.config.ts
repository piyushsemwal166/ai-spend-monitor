import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: (() => {
          const base = process.env.NEXT_PUBLIC_API_BASE_URL
            ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
            : null;
          return base ? `${base}/:path*` : "http://localhost:4000/api/v1/:path*";
        })(),
      },
    ];
  },
};

export default nextConfig;
