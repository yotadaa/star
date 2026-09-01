const imageRemotePatterns = [
  { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
  { protocol: 'https', hostname: 'scholar.googleusercontent.com' },
  { protocol: 'https', hostname: 'r2-2.mukhtada.my.id' },
  { protocol: 'https', hostname: 'raw.githubusercontent.com' },
];

const configuredR2Domain = String(process.env.R2_PUBLIC_DOMAIN || '').trim();
if (configuredR2Domain) {
  try {
    const r2Url = new URL(configuredR2Domain);
    const candidate = {
      protocol: r2Url.protocol.replace(':', ''),
      hostname: r2Url.hostname,
      ...(r2Url.port ? { port: r2Url.port } : {}),
      pathname: `${r2Url.pathname.replace(/\/+$/, '') || ''}/**`,
    };
    if (!imageRemotePatterns.some((pattern) => pattern.protocol === candidate.protocol && pattern.hostname === candidate.hostname)) {
      imageRemotePatterns.push(candidate);
    }
  } catch {
    // Runtime media resolution will keep using raw URLs if the optional domain is malformed.
  }
}

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
    remotePatterns: imageRemotePatterns,
  },
};

module.exports = nextConfig;
