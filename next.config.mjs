/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dd.dexscreener.com'
            },
            {
                protocol: 'https',
                hostname: 'coin-images.coingecko.com'
            },
            {
                protocol: 'https',
                hostname: 'ipfs.io'
            },
            {
                protocol: 'https',
                hostname: 'cdn.benzinga.com'
            },
            {
                protocol: 'https',
                hostname: 'avatar.iran.liara.run'
            }
        ]
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
          };
        }
        return config;
      },
};

export default nextConfig;
