/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type' }
          ],
        },
      ];
    },
    env: {
      BASE_URL: process.env.BASE_URL || 'http://yukio.vercel.app',
    }
  };