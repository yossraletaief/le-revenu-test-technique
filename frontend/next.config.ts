import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is deliberately off: every page depends on the request (URL filters, session
  // cookie, relative dates). Public Strapi data is cached per fetch (revalidate + tags) instead.
  turbopack: {
    rules: {
      // Tailwind CSS v4 loader for Turbopack
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
