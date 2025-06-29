/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    port: 3500,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig