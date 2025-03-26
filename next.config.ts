module.exports = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
      return [
          {
              source: "/api/:path*",
              headers: [
                  {
                      key: "Access-Control-Allow-Origin",
                      value: "https://infinitech-api5.site",
                  },
                  {
                      key: "Access-Control-Allow-Credentials",
                      value: "true",
                  },
                  {
                      key: "Access-Control-Allow-Methods",
                      value: "GET, POST, PUT, DELETE, OPTIONS",
                  },
                  {
                      key: "Access-Control-Allow-Headers",
                      value: "Content-Type, Authorization",
                  },
              ],
          },
      ];
  },
};
