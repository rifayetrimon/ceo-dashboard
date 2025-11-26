// next.config.js
module.exports = {
    reactStrictMode: false,
    eslint: { ignoreDuringBuilds: true },
    output: 'standalone',

    images: {
        domains: ['devsec.awfatech.com'],
    },
};
