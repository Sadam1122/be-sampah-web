import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: isDev ? "http://localhost:3000" : "https://sobatsampah.id",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-user-role, x-user-desa-id",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=()" },
        ],
      },
    ];
  },

  images: {
    domains: ["sobatsampah.id", "localhost"],
    formats: ["image/avif", "image/webp"],
  },

  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (isDev ? "http://localhost:3001" : "https://api.sobatsampah.id"),
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  output: "standalone",
};

export default nextConfig;
