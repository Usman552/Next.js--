import type { NextConfig } from "next";

/**
 * v1 CSP baseline. `unsafe-inline` and `unsafe-eval` are required by Next.js's
 * hydration and Turbopack chunks; tighten with per-route nonces in a follow-up
 * once we have a stable observability story.
 */
// Google Fonts stylesheets (some third-party libraries and browser extensions
// inject <link> tags pointing here); the actual font files live on gstatic.
const GOOGLE_FONTS_STYLE = "https://fonts.googleapis.com";
const GOOGLE_FONTS_FILES = "https://fonts.gstatic.com";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS_STYLE}`,
  `style-src-elem 'self' 'unsafe-inline' ${GOOGLE_FONTS_STYLE}`,
  "img-src 'self' data: blob: https:",
  `font-src 'self' data: ${GOOGLE_FONTS_FILES}`,
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
