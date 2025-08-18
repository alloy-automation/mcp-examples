const path = require("path");
const { config } = require("dotenv");

// Load environment variables from the root .env file
config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_ALLOY_API_KEY: process.env.NEXT_PUBLIC_ALLOY_API_KEY,
    NEXT_PUBLIC_MCP_SERVER_URL: process.env.NEXT_PUBLIC_MCP_SERVER_URL,
    NEXT_PUBLIC_MCP_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MCP_ACCESS_TOKEN,
  },
  webpack: (config) => {
    // Handle node modules that need to be transpiled
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
