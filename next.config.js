module.exports = {
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type' },
        { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' }
      ]
    }];
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core']
  }
};
