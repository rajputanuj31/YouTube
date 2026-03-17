/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL || "https://youtube-nogs.onrender.com"}/api/v1/:path*`,
        },
      ];
    },
  };
  
  export default nextConfig;
  