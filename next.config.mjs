/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default withBundleAnalyzer(nextConfig);

