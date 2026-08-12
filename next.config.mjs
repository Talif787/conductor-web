/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.CONDUCTOR_API_ORIGIN ?? "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy API calls to the control-api so the browser stays same-origin
    // (no CORS, no cross-origin token handling) during development.
    return [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/api/v1/:path*` }];
  },
};

export default nextConfig;
