/** @type {import('next').NextConfig} */
const nextConfig = {
  // These should be fixed before deploying to production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Strict type checking in production
    strict: true,
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Add Next.js Image Optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  productionBrowserSourceMaps: false,
  compress: true,
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: ['@radix-ui', 'lucide-react'],
    reactCompiler: true,
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
  redirects: async () => {
    return []
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/docs',
          destination: '/swagger-docs',
        },
      ],
    }
  },
}

export default nextConfig
