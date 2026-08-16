import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.CONDUCTOR_API_ORIGIN ?? "http://localhost:8000";

// Security headers applied to every response. These are the safe, broadly
// compatible set; a strict Content-Security-Policy needs per-request nonces to
// avoid breaking Next.js hydration and is documented as a follow-up rather than
// enforced here (an incorrect CSP would silently break the app).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    // Proxy API calls to the control-api so the browser stays same-origin
    // (no CORS, no cross-origin token handling). In production, set
    // CONDUCTOR_API_ORIGIN to the deployed backend URL (the Render service).
    return [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` }];
  },
};

export default withNextIntl(nextConfig);
