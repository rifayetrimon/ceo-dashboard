// next.config.js
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    reactStrictMode: false,
    eslint: { ignoreDuringBuilds: true },
    output: 'standalone',

    basePath: '',
    assetPrefix: '',

    images: {
        domains: ['devsec.awfatech.com'],
    },

    env: {
        NEXT_PUBLIC_BASE_PATH: '',
    },
};
