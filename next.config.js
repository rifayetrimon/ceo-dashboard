// next.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    reactStrictMode: false,
    eslint: { ignoreDuringBuilds: true },
    output: 'standalone',
    basePath: isProd ? '/ceo-dashboard' : '',
    assetPrefix: isProd ? '/ceo-dashboard' : '',
    images: {
        domains: ['devsec.awfatech.com'],
    },
    env: {
        NEXT_PUBLIC_BASE_PATH: isProd ? '/ceo-dashboard' : '',
    },
};
