import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Lets devices on the local network (e.g. a phone) load dev-only assets;
  // without it the page renders but never hydrates.
  allowedDevOrigins: ["192.168.*.*"],
}

export default nextConfig
