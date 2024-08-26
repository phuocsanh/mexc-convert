/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.mexc.com/:path*", // Thay đổi thành URL API của bạn
      },
    ];
  },
};

export default nextConfig;
