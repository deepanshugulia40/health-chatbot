import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets the site work when opened by this PC's network IP (or from
  // a phone on the same Wi-Fi), not just http://localhost:3000. Update the IP
  // if your router gives this PC a new one (run `ipconfig` to check).
  allowedDevOrigins: ["192.168.1.32"],
  // pdf-parse loads pdf.js at runtime; keep it out of the server bundle.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
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
