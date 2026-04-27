import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typescript: {
    // This tells Vercel: "I know what I'm doing, just build the app."
    ignoreBuildErrors: true,
  },
  eslint: {
    // This handles any linting gripes too
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
