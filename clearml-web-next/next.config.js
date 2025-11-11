/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-table'],
  },

  // Turbopack configuration
  turbopack: {
    root: '/Users/martin/CODE/pints/clearml-web/clearml-web-next',
  },

  // API proxy to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/clearml/:path*',
        destination: 'https://api.clear.ml/v2.0/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
