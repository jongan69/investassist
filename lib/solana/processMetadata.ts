import { DEXSCREENER } from "./constants";
import { getDexScreenerData } from "./fetchDexData";
const DEFAULT_IMAGE_URL = process.env.UNKNOWN_IMAGE_URL || "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

// Helper function to fetch token info from contract address
export async function getTokenInfo(address: string) {
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

// Helper function to process token metadata
export async function processTokenMetadata(token: any, logo: string, cid: string, mint: string) {
    try {
        let tokenName = mint;
        let symbol = mint;
        if (logo.length > 0) {
            logo = logo;
        } else {
            const tokenInfo = await getTokenInfo(mint);
            // If getTokenInfo fails, try getDexScreenerData as fallback
            if (!tokenInfo) {
                const dexScreenerData = await getDexScreenerData(mint);
                if (dexScreenerData) {
                    tokenName = dexScreenerData?.pairs?.[0]?.baseToken?.name ?? mint;
                    symbol = dexScreenerData?.pairs?.[0]?.baseToken?.symbol ?? mint;
                    logo = dexScreenerData?.cg?.imageUrl ?? DEFAULT_IMAGE_URL;
                }
            } else {
                tokenName = tokenInfo.name ?? mint;
                symbol = tokenInfo.symbol ?? mint;
                logo = tokenInfo.image ?? DEFAULT_IMAGE_URL;
            }
        }

        let metadata = {
            name: token?.metadata?.name || tokenName,
            symbol: token?.metadata?.symbol || symbol,
            logo: logo,
            cid: cid,
            collectionName: token?.metadata?.name || tokenName,
            collectionLogo: logo ?? DEFAULT_IMAGE_URL,
            isNft: false
        };
        return metadata;
    } catch (error) {
        console.error("Error processing token metadata for", mint, ":", error);
        // Return basic metadata with mint address if all else fails
        return {
            name: mint,
            symbol: mint,
            logo: DEFAULT_IMAGE_URL,
            cid: cid,
            collectionName: mint,
            collectionLogo: DEFAULT_IMAGE_URL,
            isNft: false
        };
    }
}