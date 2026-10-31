/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const nextConfig = {
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Configure PWA
const pwaConfig = withPWA({
  dest: "public",
  register: false,
  cacheStartUrl: true,
  dynamicStartUrl: false,
  navigateFallback: "/",
  navigateFallbackAllowlist: [/^\/$/, /^\/patient\//, /^\/admin\/?$/],
  skipWaiting: true,
  buildExcludes: [/app-build-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: ({url}) => url.pathname.startsWith("/auth/") || url.hostname.endsWith(".supabase.co"),
      handler: "NetworkOnly",
    },
    {
      urlPattern: ({request}) => ["script", "style", "font", "image"].includes(request.destination),
      handler: "StaleWhileRevalidate",
      options: {cacheName: "app-assets", expiration: {maxEntries: 100}},
    },
  ],
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
