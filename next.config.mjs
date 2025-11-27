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
  reactStrictMode: true,
  distDir: 'build',
  // 🔥 REQUIRED FOR AZURE APP SERVICE
  output: "standalone",
};

export default nextConfig;

