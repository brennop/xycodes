const CopyPlugin = require('copy-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
   config.plugins.push(new CopyPlugin({
      patterns: [
        {
          // In this project, zbar-wasm becomes part of static/chunks/pages/_app.js
          from: 'node_modules/@undecaf/zbar-wasm/dist/zbar.wasm',
          to: 'static/chunks/pages/'
        },
      ],
    }))

    if (!isServer) {
      // Resolve node modules that are irrelevant for the client
      config.resolve.fallback = {
        ...config.resolve.fallback,

        fs: false,
        path: false,
      }
    }

    config.module.rules.push({
      test: /\.glsl/,
      type: 'asset/source'
    })

    return config
  }
}

module.exports = nextConfig
