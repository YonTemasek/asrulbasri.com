import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy blog redirect
      {
        source: '/blog',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      // Old route redirects
      {
        source: '/frameworks',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/frameworks/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      {
        source: '/tools',
        destination: '/library',
        permanent: true,
      },
      {
        source: '/systems',
        destination: '/services',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
