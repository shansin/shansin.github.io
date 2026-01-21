/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
