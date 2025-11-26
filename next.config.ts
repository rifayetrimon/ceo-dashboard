import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    output: 'standalone',

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'devsec.awfatech.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
