import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "misca.ir",
        pathname: "/assets/images/products/**",
      },
      {
        protocol: "https",
        hostname: "misca.ir",
        pathname: "/assets/images/business/**",
      },
    ],
  },
};

export default nextConfig;
