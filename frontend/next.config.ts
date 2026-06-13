import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.0.0.14", // VM local IP
      },
      {
        protocol: "http",
        hostname: "196.188.249.162", // pfSense public IP
      },
      {
        protocol: "http",
        hostname: "backend", // Docker internal service name
      },
      {
        protocol: "https",
        hostname: "yourdomain.com", // replace when you get a domain
      },
    ],
  },
  // In production, nginx proxies /api/* to the backend.
  // In development (npm run dev), we need Next.js rewrites to proxy API calls.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
