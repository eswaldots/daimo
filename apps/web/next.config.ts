import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cautious-pelican-191.convex.cloud", // Replace with your image domain
        pathname: "/api/storage/**", // Optional: restrict to a specific path
      },
      {
        protocol: "http",
        hostname: "127.0.0.1", // Replace with your image domain
        port: "3210", // Optional: specify if your images are served on a specific port
        pathname: "/api/storage/**", // Optional: restrict to a specific path
      },
      {
        protocol: "https",
        hostname: "another-domain.com",
      },
    ],
  },
};

export default nextConfig;
