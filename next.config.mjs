/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Keep off during ongoing migration to avoid double-render issues
  // TypeScript errors are suppressed during build — enable gradually as types are fixed
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Auth avatars
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'firebase', 'firebase-admin', 'framer-motion', 'date-fns', 'lodash'],
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.47', '192.168.1.*'],
  output: "standalone",

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default async function config() {
  if (process.env.ANALYZE === 'true') {
    try {
      const bundleAnalyzer = (await import('@next/bundle-analyzer')).default;
      return bundleAnalyzer({ enabled: true })(nextConfig);
    } catch {
      return nextConfig;
    }
  }
  return nextConfig;
}

