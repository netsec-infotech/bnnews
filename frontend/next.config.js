/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // Internal backend URL for Next.js server-side proxying (port 5010 on VPS)
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5010';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
