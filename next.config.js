/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle PDFKit font files for server-side rendering
      // PDFKit needs access to its font data files
      config.resolve.alias = {
        ...config.resolve.alias,
      }
      // Ensure PDFKit can find its data files
      config.resolve.modules = [...(config.resolve.modules || []), 'node_modules']
    }
    return config
  },
}

module.exports = nextConfig

