/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Updated to remotePatterns (modern, more secure way in Next.js 14+)
    // This replaces the old "domains" array and prevents any security warnings
    remotePatterns: [
      // Keep your existing picsum.photos placeholder images
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.picsum.photos', // sometimes picsum uses this subdomain
      },

      // NEW: Required for Replicate Flux image generation
      // These hostnames are where Replicate serves the generated images
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: '*.replicate.com', // wildcard for any subdomains
      },
    ],
  },

  // You can add more config here later (e.g. experimental, headers, etc.)
};

module.exports = nextConfig;
