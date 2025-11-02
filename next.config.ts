import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Added Azure Blob domain here
    domains: ["imgtagger.blob.core.windows.net"], 
  },
};

export default nextConfig;
