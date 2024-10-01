/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/v1/:path*", // When your frontend makes a request to `/api/...`
          destination: "http://localhost:8000/api/v1/:path*", // Proxy to the backend running at localhost:3001
        },
      ];
    },
  };
  
  export default nextConfig;
  