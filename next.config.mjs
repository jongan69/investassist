/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['dd.dexscreener.com', 'coin-images.coingecko.com', 'ipfs.io', 'cdn.benzinga.com']
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
