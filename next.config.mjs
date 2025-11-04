/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@radix-ui"],
  },
    output: 'export', 
}

export default nextConfig
