import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aktifkan strict mode React untuk debugging
  reactStrictMode: true,

  // Aktifkan SWC untuk minifikasi lebih cepat
  swcMinify: true,

  // Konfigurasi custom headers
  async headers() {
    return [
      {
        source: "/api/:path*", // Berlaku untuk semua endpoint API
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" }, // Ganti dengan domain frontend Anda
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },

  // Konfigurasi tambahan untuk image optimization (opsional)
  images: {
    domains: ["example.com"], // Ganti dengan domain tempat gambar Anda di-host
    formats: ["image/avif", "image/webp"], // Format gambar yang didukung
  },

  // Konfigurasi environment variable
  env: {
    API_BASE_URL: "http://localhost:3001/api", // Ganti dengan URL API backend Anda
  },

  // Konfigurasi TypeScript (opsional)
  typescript: {
    ignoreBuildErrors: false, // Hentikan build jika ada error TypeScript
  },
};

export default nextConfig;
