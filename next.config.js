/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent double-mounting in dev which can cause socket issues
  reactStrictMode: false, 
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;