/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core optimization
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lodash', 'react-icons'],
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Bundle splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for stable dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          // ReactFlow specific chunk (large dependency)
          reactflow: {
            test: /[\\/]node_modules[\\/](reactflow|@reactflow)[\\/]/,
            name: 'reactflow',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // UI components chunk
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 15,
            minSize: 10000,
          },
          // Hooks chunk
          hooks: {
            test: /[\\/]hooks[\\/]/,
            name: 'hooks',
            chunks: 'all',
            priority: 12,
            minSize: 5000,
          }
        }
      }

      // Tree shaking optimizations
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // Minimize and compress
      config.optimization.minimize = true
      
      // Module concatenation for smaller bundles
      config.optimization.concatenateModules = true
    }

    // Resolve optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize lodash imports
      'lodash': 'lodash-es',
      // Use ES modules where available
      '@heroicons/react/24/outline': '@heroicons/react/24/outline/esm',
      '@heroicons/react/24/solid': '@heroicons/react/24/solid/esm',
    }

    // Exclude unnecessary files from bundle
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader'
    })

    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/images/[name].[hash][ext]'
      }
    })

    return config
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output optimization
  output: 'standalone',
  
  // Compression
  compress: true,

  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,

  // Optimize CSS
  optimizeFonts: true,

  // Power optimization
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
    BUILD_ID: process.env.BUILD_ID || 'development',
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // API routes optimization
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite /api/health to a simple health check
        {
          source: '/api/health',
          destination: '/api/status',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Redirects for better SEO and UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
