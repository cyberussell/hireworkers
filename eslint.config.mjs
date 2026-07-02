import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived pre-2.0 static site, not part of the Next.js app.
    "legacy/**",
    // Build output relocated outside iCloud-synced ~/Documents (see
    // next.config.ts) — eslint-config-next's default ".next/**" ignore
    // doesn't match it. Some tooling double-joins the absolute distDir onto
    // the project root, so this matches both the plain and joined forms.
    "**/.cache/payjobs-work-next/**",
  ]),
]);

export default eslintConfig;
