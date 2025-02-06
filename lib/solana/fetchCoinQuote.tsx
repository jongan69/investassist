import { unstable_noStore as noStore } from "next/cache"

export type QuoteError = {
    message: string;
    code: 'VALIDATION_ERROR' | 'HTTP_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR' | 'PARTIAL_ERROR';
}

export type KrakenInterval = keyof typeof krakenIntervalMapping;

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
    // console.log("pairAddress", pairAddress)
    const response = await fetch(
        `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairAddress}`
    );
    if (!response.ok) {
        throw new Error(`DexScreener pair details API error: ${response.status}`);
    }
    const data = await response.json(); 
    // console.log("dexscreener socials", data?.ds?.socials)
    // console.log("dexscreener websites", data?.ds?.websites)
    // console.log("tokeninfo socials", data?.ti?.socials)
    // console.log("tokeninfo websites", data)
    // console.log("cmc urls", data?.cmc?.urls)
    // console.log("cmc socials", data.cmc.urls.twitter)
    // console.log("cmc socials", data.cmc.urls.website)
    // console.log("cmc socials", data.cmc.urls.chat)
    return data;
}

export interface KrakenOHLCResponse {
    error: string[];
    result: {
        [pair: string]: Array<[
            number,  // time
            string,  // open
            string,  // high
            string,  // low
            string,  // close
            string,  // vwap
            string,  // volume
            number   // count
        ]>;
        // last: number;  // id to be used as since when polling for new data
    };
}

export const krakenIntervalMapping = {
  "1d": 1,      // 1 minute intervals for 1 day
  "1w": 15,     // 15 minute intervals for 1 week
  "1m": 60,     // 1 hour intervals for 1 month
  "3m": 240,    // 4 hour intervals for 3 months
  "1y": 1440,   // 1 day intervals for 1 year
} as const;

export type KrakenRange = keyof typeof krakenIntervalMapping;

// Add more sophisticated caching with types
interface CacheEntry<T> {
  timestamp: number
  data: T
}

const CACHE_TIME = {
  "1d": 60 * 1000,    // 1 minute for 1d data
  "1w": 5 * 60 * 1000,  // 5 minutes for 1w data
  "1m": 15 * 60 * 1000, // 15 minutes for 1m data
  "3m": 30 * 60 * 1000, // 30 minutes for 3m data
  "1y": 60 * 60 * 1000, // 1 hour for 1y data
} as const

const priceCache = new Map<string, CacheEntry<KrakenOHLCResponse>>()

// Add retry utility
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options)
            if (response.ok) return response
            
            // If we get rate limited, wait longer before retry
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
                continue
            }
            
            throw new Error(`HTTP error ${response.status}`)
        } catch (error) {
            if (i === retries - 1) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
    throw new Error('Max retries reached')
}

export async function fetchCoinQuote(ticker: string, range: KrakenRange = "1d") {
    const cacheKey = `${ticker}-${range}`
    const cached = priceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TIME[range]) {
        return { data: cached.data, error: null }
    }
    
    try {
        const pair = `${ticker}USD`
        const interval = krakenIntervalMapping[range]
        const url = new URL('https://api.kraken.com/0/public/OHLC')
        const params = new URLSearchParams({
            pair,
            interval: interval.toString()
        })
        url.search = params.toString()

        const response = await fetchWithRetry(url.toString(), {
            next: { revalidate: 300 } // 5 minutes
        })

        if (!response.ok) {
            const errorData = await response.json()
            return {
                data: null,
                error: {
                    message: errorData.error?.[0] || `HTTP error ${response.status}`,
                    code: 'HTTP_ERROR'
                } as QuoteError
            }
        }

        const data: KrakenOHLCResponse = await response.json()
        
        if (data.error?.length > 0) {
            return {
                data: null,
                error: {
                    message: data.error[0],
                    code: 'API_ERROR'
                } as QuoteError
            }
        }

        priceCache.set(cacheKey, {
            timestamp: Date.now(),
            data
        })
        
        return { data, error: null }

    } catch (err: unknown) {
        const error = err as Error
        console.error("Failed to fetch coin quote:", error)
        return {
            data: null,
            error: {
                message: error.message || "Unknown error occurred",
                code: 'UNKNOWN_ERROR'
            } as QuoteError
        }
    }
}

export async function fetchAllTimeframes(ticker: string) {
    noStore()
    
    console.time(`fetchAllTimeframes:${ticker}`)  // Start timer
    
    const timeframes = Object.keys(krakenIntervalMapping) as KrakenRange[]
    const timeframeData: Record<KrakenRange, { 
        data: KrakenOHLCResponse | null, 
        error: QuoteError | null 
    }> = {} as any
    
    try {
        // Track if any timeframe failed
        let hasPartialFailure = false
        let completeFailure = true

        // Fetch all timeframes
        await Promise.all(
            timeframes.map(async (range) => {
                try {
                    const result = await fetchCoinQuote(ticker, range)
                    timeframeData[range] = result
                    
                    if (!result.error) {
                        completeFailure = false
                    } else {
                        hasPartialFailure = true
                    }
                } catch (err) {
                    hasPartialFailure = true
                    timeframeData[range] = {
                        data: null,
                        error: {
                            message: err instanceof Error ? err.message : "Failed to fetch timeframe",
                            code: 'UNKNOWN_ERROR'
                        } as QuoteError
                    }
                }
            })
        )

        console.timeEnd(`fetchAllTimeframes:${ticker}`)  // End timer

        // If all timeframes failed, return error
        if (completeFailure) {
            return {
                data: null,
                error: {
                    message: "Failed to fetch data for all timeframes",
                    code: 'UNKNOWN_ERROR'
                } as QuoteError
            }
        }

        // Return data with warning if some timeframes failed
        return {
            data: timeframeData,
            error: hasPartialFailure ? {
                message: "Some timeframes failed to load",
                code: 'PARTIAL_ERROR'
            } as QuoteError : null
        }

    } catch (err: unknown) {
        console.timeEnd(`fetchAllTimeframes:${ticker}`)  // End timer in case of error
        const error = err as Error
        console.error("Failed to fetch timeframe data:", error)
        return {
            data: null,
            error: {
                message: error.message || "Failed to fetch timeframe data",
                code: 'UNKNOWN_ERROR'
            } as QuoteError
        }
    }
}

export async function fetchKrakenTickerData(ticker: string) {
    noStore()
    try {   
        const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${ticker.toUpperCase()}USD`)
        const data = await response.json()
        return data
    } catch (err) {
        console.error("Failed to fetch kraken ticker data:", err)
        return null
    }
}