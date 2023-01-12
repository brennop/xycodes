/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    // redirect "/" to "/xy%2B"
    return [
      {
        source: '/',
        destination: '/xy%2B',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
