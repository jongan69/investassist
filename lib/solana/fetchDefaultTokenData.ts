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
}

// Helper function to fetch token info from contract address
export async function getTokenInfo(address: string): Promise<TokenInfo | null> {
    try {
      const response = await fetch(`${DEXSCREENER}/latest/dex/tokens/${address}`);
      if (!response.ok) return null;
      
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
      };
    } catch (error) {
      console.error("Error fetching token info for", address, ":", error);
      return null;
    }
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