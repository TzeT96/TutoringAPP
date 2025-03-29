/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      `${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`
    ],
  },
}

module.exports = nextConfig 