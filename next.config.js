/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: true },
  allowedDevOrigins: [
    'dusk-navigator.preview.emergentagent.com',
    '*.preview.emergentagent.com',
    '*.preview.emergentcf.cloud',
    '*.emergentcf.cloud',
    '*.emergentagent.com',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'scholar.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
