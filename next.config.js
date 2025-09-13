/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove static export config for Vercel deployment
  // basePath and assetPrefix not needed for Vercel
  images: {
    unoptimized: true,
  },
  // Enable serverless functions for Vercel
  // output: 'standalone', // Uncomment if needed for optimization
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
