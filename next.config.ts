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
      {
        protocol: "https",
        hostname: "api.misca.ir",
        pathname: "/temp/uploads/**",
      },
    ],
  },
};

export default nextConfig;
