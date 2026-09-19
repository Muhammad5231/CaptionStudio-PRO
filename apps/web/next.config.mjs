/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@captionstudio/ui',
    '@captionstudio/types',
    '@captionstudio/billing',
    '@captionstudio/captions',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'node:fs': false,
        'node:path': false,
        crypto: false,
        'node:crypto': false,
      };
    }
    return config;
  },
};

export default nextConfig;

