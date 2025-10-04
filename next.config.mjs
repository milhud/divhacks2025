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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude Google Cloud libraries from client-side bundle
      config.externals = config.externals || []
      config.externals.push({
        '@google-cloud/video-intelligence': 'commonjs @google-cloud/video-intelligence',
        '@google-cloud/storage': 'commonjs @google-cloud/storage',
      })
    }
    
    // Handle node modules that might have issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    }
    
    return config
  },
}

export default nextConfig
