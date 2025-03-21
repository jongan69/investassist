import { DEXSCREENER } from "./constants";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  marketCap: number;
  price: number;
  priceNative: number;  // Price in SOL
  image: string;
  website: string;
  // Additional fields from API
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    header: string;
    openGraph: string;
    websites: Array<{ label: string; url: string }>;
    socials: Array<{ type: string; url: string }>;
  };
}

// Helper function to fetch token info from contract address
export async function getTokenInfo(address: string): Promise<TokenInfo | null> {
    const MAX_RETRIES = 3;
    const TIMEOUT = 5000; // 5 seconds timeout
    const RETRY_DELAY = 1000; // 1 second between retries
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
            
            const response = await fetch(`${DEXSCREENER}/latest/dex/tokens/${address}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0' // Some APIs require a user agent
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (response.status === 429) { // Rate limit
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
                    continue;
                }
                return null;
            }
            
            const data = await response.json();
            const pair = data.pairs?.[0]; // Get first pair's information
            
            if (!pair?.baseToken) return null;
            
            return {
                name: pair.baseToken.name,
                contractAddress: address,
                symbol: pair.baseToken.symbol,
                decimals: pair.baseToken.decimals,
                marketCap: pair.marketCap,
                price: pair.priceUsd || 0,
                priceNative: pair.priceNative || 0,
                image: pair.info?.imageUrl,
                website: pair.info?.websites,
                chainId: pair.chainId,
                dexId: pair.dexId,
                url: pair.url,
                pairAddress: pair.pairAddress,
                quoteToken: pair.quoteToken,
                txns: pair.txns,
                volume: pair.volume,
                priceChange: pair.priceChange,
                liquidity: pair.liquidity,
                fdv: pair.fdv,
                pairCreatedAt: pair.pairCreatedAt,
                info: pair.info,
            };
        } catch (error) {
            if (attempt === MAX_RETRIES - 1) {
                console.error("Error fetching token info for", address, ":", error);
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    return null;
}
const DEFAULT_IMAGE_URL = process.env.UNKNOWN_IMAGE_URL || "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

// Helper function to get default token metadata
export async function getDefaultTokenMetadata(mint: string) {
    const tokenInfo = await getTokenInfo(mint);
    return {
      name: tokenInfo?.name || mint,
      symbol: tokenInfo?.symbol || mint,
      logo: tokenInfo?.image || DEFAULT_IMAGE_URL,
      cid: null,
      collectionName: mint,
      collectionLogo: tokenInfo?.image || DEFAULT_IMAGE_URL,
      isNft: false
    };
  }