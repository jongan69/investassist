export interface DexScreenerToken {
    pairs: {
        chainId: string;
        dexId: string;
        url: string;
        pairAddress: string;
        labels?: string[];
        baseToken: {
            symbol: string;
            address: string;
            name?: string;
        };
        quoteToken: {
            address: string;
            symbol?: string;
            name?: string;
        };
        priceNative: string;
        priceUsd: string;
        txns: {
            buys: number;
            sells: number;
        };
        volume: {
            h24?: number;
            h6?: number;
            h1?: number;
            m5?: number;
        };
        priceChange: {
            h24?: number;
            h6?: number;
            h1?: number;
            m5?: number;
        };
        liquidity: {
            usd: number;
        };
        fdv: number;
        marketCap: number;
        pairCreatedAt: number;
        info?: Record<string, any>;
    }[];
}

export interface TokenScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        symbol: string;
        address: string;
        name?: string;
    };
    quoteToken: {
        address: string;
        symbol?: string;
        name?: string;
    };
    priceUsd: string;
    volume: { h24?: number };
    liquidity: { usd: number };
    marketCap: number;
    priceChange: { h24?: number };
}

export interface DexScreenerPair extends TokenScreenerPair {
    priceNative: string;
    txns: {
        buys: number;
        sells: number;
    };
    pairCreatedAt: number;
    info?: Record<string, any>;
}

export interface PairDetails {
    pairs: DexScreenerPair[];
    holders: {
        count: number;
        totalSupply: string;
    };
    cg?: {
        id: string;
        url: string;
        description: string;
        maxSupply: number;
        totalSupply: number;
        websites: [
            {
                url: string;
                label: string;
            }
        ];
        social: any[];
        imageUrl: string;
        categories: string[];
    };
    ti?: {
        id: string;
        chain: { id: string };
        address: string;
        name: string;
        symbol: string;
        description: string;
        image: string;
        headerImage: string;
        websites: [
            {
                url: string;
                label: string;
            }
        ];
        socials: [
            {
                url: string;
                type: string;
            }
        ];
        lockedAddresses: any[];
        createdAt: string;
        updatedAt: string;
        sortByDate: string;
    };
    ds?: {
        socials: any[];
        websites: [
            {
                url: string;
                label: string;
            }
        ];
    }
    cmc?: {
        urls: {
            twitter: [
                {
                    url: string;
                    type: string;
                }
            ];
            website: [
                {
                    url: string;
                    type: string;
                }
            ];
            chat: [
                {
                    url: string;
                    type: string;
                }
            ];
        };
    };
    isNft: boolean;
}

export interface DexScreenerTokenInfo {
    schemaVersion: string;
    pairs: TokenScreenerPair[];  // Use new TokenScreenerPair for token pairs
    cg?: {
        id: string;
        url: string;
        description: string;
        maxSupply: number;
        totalSupply: number;
        circulatingSupply: number;
        websites: any[];
        social: any[];
        imageUrl: string;
        categories: string[];
    };
    ti?: {
        id: string;
        chain: { id: string };
        address: string;
        name: string;
        symbol: string;
        description: string;
        websites: string[];
        socials: any[];
        lockedAddresses: any[];
        createdAt: string;
        updatedAt: string;
        sortByDate: string;
        image: string;
        headerImage: string;
        claims: any[];
        profile: {
            header: boolean;
            website: boolean;
            twitter: boolean;
            discord: boolean;
            linkCount: number;
            imgKey: string;
        };
    };
    holders?: {
        count: number;
        totalSupply: string;
    };
    lpHolders?: {
        count: number;
        totalSupply: string;
        holders: any[];
    };
    su?: {
        totalSupply: number;
        circulatingSupply: number;
    };
    ta?: {
        solana: {
            isMintable: boolean;
            isFreezable: boolean;
        };
    };
}

export async function getDexScreenerData(contractAddress: string): Promise<DexScreenerTokenInfo> {
    const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
    );
    if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
    }
    return response.json();
}

export async function getPairDetails(pairAddress: string): Promise<PairDetails> {
    const response = await fetch(
        `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairAddress}`
    );
    if (!response.ok) {
        throw new Error(`DexScreener pair details API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
}