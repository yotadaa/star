/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  allowedDevOrigins: [
    'dusk-navigator.preview.emergentagent.com',
    '*.preview.emergentagent.com',
    '*.preview.emergentcf.cloud',
    '*.emergentcf.cloud',
    '*.emergentagent.com',
    'mukhtada.my.id',
    'mukhtada.my.id/*',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'scholar.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
