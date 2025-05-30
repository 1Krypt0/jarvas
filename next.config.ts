import { NextConfig } from "next";
import createMDX from "@next/mdx";
import "./src/env";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    authInterrupts: true,
  },
  serverExternalPackages: ["pino", "pino-pretty"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
