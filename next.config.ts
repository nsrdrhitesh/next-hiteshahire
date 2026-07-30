import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // images: {
  //   domains: ['localhost'], // allow localhost
  // },
  images: {
    domains: ["192.168.1.23"], // allow your backend IP
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "http",
  //       hostname: "192.168.1.23",
  //       port: "3003",
  //       pathname: "/uploads/**",
  //     },
  //   ],
  // },
};

export default nextConfig;
