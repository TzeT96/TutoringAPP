/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'tommy-demo-s3-v2.s3.us-west-1.amazonaws.com',
      'tommy-demo-s3-v2.s3.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  // Ensure we handle trailing slashes properly
  trailingSlash: false,
  // Add proper Output configuration
  output: 'standalone',
}

module.exports = nextConfig 