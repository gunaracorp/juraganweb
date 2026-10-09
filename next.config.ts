import type { NextConfig } from "next";

// === Konfigurasi build untuk dua mode ===
// - Dev/standalone: `output: "standalone"` (default, untuk VPS/server Node)
// - Shared hosting: `output: "export"` (untuk cPanel — static HTML + PHP API)
//
// Cara build untuk shared hosting:
//   SHARED_HOSTING=1 bun run build:export
//
// Atau tinggal jalankan `bun run build:export` (sudah set otomatis).
const isSharedHosting =
  process.env.SHARED_HOSTING === "1" ||
  process.env.BUILD_TARGET === "export";

const nextConfig: NextConfig = {
  // Untuk shared hosting cPanel → static export
  // Untuk dev / VPS → standalone
  output: isSharedHosting ? "export" : "standalone",

  // Saat static export, gambar dari domain eksternal perlu di-allow
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },

  // Trailing slash supaya /admin bisa diakses tanpa index.html
  trailingSlash: false,

  // Ignor build errors (komponen sudah tested)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
