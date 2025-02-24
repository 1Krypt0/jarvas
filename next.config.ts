import { NextConfig } from "next";
import "./src/env";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
