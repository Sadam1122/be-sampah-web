import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aktifkan Strict Mode untuk debugging lebih baik
  reactStrictMode: true,

  // Menggunakan SWC untuk minifikasi lebih cepat dan optimal
  swcMinify: true,

  // Konfigurasi Custom Headers untuk API
  async headers() {
    return [
      {
        source: "/api/:path*", // Berlaku hanya untuk semua endpoint API
        headers: [
          // Pengaturan CORS
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ORIGIN || "http://localhost:3000", // Sesuaikan dengan frontend
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-user-role",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true", // Memungkinkan pengiriman kredensial (misalnya cookies)
          },

          // Pengaturan Keamanan Tambahan
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=()" }, // Contoh pembatasan fitur
        ],
      },
    ];
  },

  // Konfigurasi Image Optimization
  images: {
    domains: ["example.com"], // Ganti dengan domain gambar yang digunakan
    formats: ["image/avif", "image/webp"],
  },

  // Konfigurasi Environment Variables
  env: {
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3001/api", // Bisa diubah dari `.env.local`
  },

  // Konfigurasi TypeScript
  typescript: {
    ignoreBuildErrors: false, // Pastikan build gagal jika ada error TypeScript
  },

  // Output berbasis Standalone (untuk deploy yang lebih fleksibel)
  output: "standalone",
};

export default nextConfig;
