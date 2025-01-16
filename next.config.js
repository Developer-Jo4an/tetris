const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const env = process.env.NODE_ENV;
const path = require('path');
const dev = env !== "production";

module.exports = withBundleAnalyzer({
  experimental: {
    basePath: dev ? "" : "/2020/200620",
  },
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"]
      },
      {
        test: /preloader.txt$/,
        use: ["raw-loader"],
      },
      {
        test: /\.html$/,
        use: ["raw-loader"],
      }
    );
    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, '../')],
  },
});


