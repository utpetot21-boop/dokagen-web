/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dokagen.online',
      },
      {
        protocol: 'http',
        hostname: '76.13.23.42',
      },
    ],
  },
};

module.exports = nextConfig;
