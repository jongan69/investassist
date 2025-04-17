import { DEXSCREENER } from "../utils/constants";
import { getDexScreenerData } from "./fetchDexData";
import { DEFAULT_IMAGE_URL } from "../utils/constants";

interface TokenInfo {
    name: string;
    contractAddress: string;
    symbol: string;
    decimals: number;
    marketCap?: number;
    price: number;
    priceNative: number;
    image?: string;
    website?: string[];
}

interface TokenMetadata {
    name: string;
    symbol: string;
    logo: string;
    cid: string;
    collectionName: string;
    collectionLogo: string;
    isNft: boolean;
}

/**
 * Fetches token information from DexScreener API
 * @param address - Token contract address
 * @returns TokenInfo object or null if fetch fails
 */
export async function getTokenInfo(address: string): Promise<TokenInfo | null> {
    try {
        const response = await fetch(`${DEXSCREENER}/latest/dex/tokens/${address}`);
        if (!response.ok) return null;

        const data = await response.json();
        const pair = data.pairs?.[0];

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

/**
 * Processes token metadata, attempting to fetch missing information from various sources
 * @param token - Token object containing metadata
 * @param logo - Logo URL
 * @param cid - Content identifier
 * @param mint - Token mint address
 * @returns Processed TokenMetadata object
 */
export async function processTokenMetadata(
    token: any,
    logo: string,
    cid: string,
    mint: string
): Promise<TokenMetadata> {
    try {
        let tokenName = mint;
        let symbol = mint;
        let finalLogo = logo;

        if (!logo) {
            const tokenInfo = await getTokenInfo(mint);
            
            if (tokenInfo) {
                tokenName = tokenInfo.name ?? mint;
                symbol = tokenInfo.symbol ?? mint;
                finalLogo = tokenInfo.image ?? DEFAULT_IMAGE_URL;
            } else {
                // Fallback to DexScreener data
                const dexScreenerData = await getDexScreenerData(mint);
                const baseToken = dexScreenerData?.pairs?.[0]?.baseToken;
                
                if (baseToken) {
                    tokenName = baseToken.name ?? mint;
                    symbol = baseToken.symbol ?? mint;
                    finalLogo = dexScreenerData?.cg?.imageUrl ?? DEFAULT_IMAGE_URL;
                }
            }
        }

        return {
            name: token?.metadata?.name || tokenName,
            symbol: token?.metadata?.symbol || symbol,
            logo: finalLogo,
            cid: cid,
            collectionName: token?.metadata?.name || tokenName,
            collectionLogo: finalLogo ?? DEFAULT_IMAGE_URL,
            isNft: false
        };
    } catch (error) {
        console.error("Error processing token metadata for", mint, ":", error);
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