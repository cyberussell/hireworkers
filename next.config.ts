import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project lives under iCloud-synced ~/Documents on the local dev
  // machine, and iCloud's file-provider materialization races with
  // Turbopack's dev-server writes to .next, corrupting it on every run
  // ("Unable to write SST file ... No such file or directory"). Relocating
  // the build output outside the synced tree avoids the race. Must be
  // absolute — Turbopack rejects a relative distDir that navigates outside
  // the project directory. Other tooling (eslint-config-next's default
  // ignores) doesn't know about this path, so it's also ignored explicitly
  // in eslint.config.mjs. Only applied locally — that absolute path doesn't
  // exist on Vercel's build machines, so this must stay out of deployed
  // builds (Vercel sets VERCEL=1).
  ...(process.env.VERCEL
    ? {}
    : { distDir: "/Users/russellparayno/.cache/payjobs-work-next" }),
};

export default nextConfig;
