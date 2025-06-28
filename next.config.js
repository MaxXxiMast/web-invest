/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: 'v',
            // the page value will not be available in the
            // header key/values since value is provided and
            // doesn't use a named capture group e.g. (?<page>home)
            value: 'latest',
          },
        ],
        headers: [
          {
            key: 'Clear-Site-Data',
            value: '"cache", "cookies", "storage"',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  images: {
    loader: 'default',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gi-strapi.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.gripinvest.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static-assets.gripinvest.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.gripinvest.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname:
          'gi-cms-strapi-dev-1.eba-3zvxtipf.ap-south-1.elasticbeanstalk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gi-cms-strapi-dev-2.ap-south-1.elasticbeanstalk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gi-devstrapi.gripinvest.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'teamvedika.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.lottie$/,
      type: 'asset/resource',
    });

    return config;
  },
};

module.exports = nextConfig;
