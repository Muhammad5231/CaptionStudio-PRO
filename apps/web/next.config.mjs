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
};

export default nextConfig;

