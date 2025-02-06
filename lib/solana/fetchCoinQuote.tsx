import { unstable_noStore as noStore } from "next/cache"
import { getSolanaTokenCA } from "./getCaFromTicker"
// import yahooFinance from "yahoo-finance2"

export type QuoteError = {
    message: string;
    code: 'VALIDATION_ERROR' | 'HTTP_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR';
}

export type KrakenInterval = keyof typeof krakenIntervalMapping;

interface DexScreenerToken {
    baseToken: {
        symbol: string;
        address: string;
    };
    quoteToken: {
        address: string;
    };
    pairAddress: string;
    txns: {
        buys: number;
        sells: number;
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    liquidity: {
        usd: number;
    };
}

async function getDexScreenerData(contractAddress: string) {
    const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
    );
    if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
    }
    return response.json();
}

async function getPairDetails(pairAddress: string) {
    const response = await fetch(
        `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairAddress}`
    );
    if (!response.ok) {
        throw new Error(`DexScreener pair details API error: ${response.status}`);
    }
    return response.json();
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

export async function fetchCoinQuote(ticker: string, range: KrakenRange = "1d") {
    noStore()
    
    try {
        const pair = `${ticker}USD`
        const interval = krakenIntervalMapping[range]
        const url = new URL('https://api.kraken.com/0/public/OHLC')
        const params = new URLSearchParams({
            pair,
            interval: interval.toString()
        })
        url.search = params.toString()

        const response = await fetch(url)

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

export interface OHLCVResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            ohlcv_list: [number, number, number, number, number, number][];
            meta: {
                base: {
                    address: string;
                    name: string;
                    symbol: string;
                };
                quote: {
                    address: string;
                    name: string;
                    symbol: string;
                };
            };
        };
    };
}

export interface OHLCVParams {
    network: string;
    poolAddress: string;
    timeframe: 'day' | 'hour' | 'minute';
    aggregate?: number;
    beforeTimestamp?: number;
    limit?: number;
    currency?: 'usd' | string;
    token?: 'base' | 'quote' | string;
}

export type OHLCVError = QuoteError & {
    code: 'VALIDATION_ERROR' | 'HTTP_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR';
};

export async function fetchSolanaOHLCV({
    network,
    poolAddress,
    timeframe,
    aggregate = 1,
    beforeTimestamp,
    limit = 100,
    currency = 'usd',
    token,
}: OHLCVParams) {
    noStore();

    const apiKey = process.env.COINGECKO_PRO_API_KEY;
    console.log('apiKey', apiKey)
    if (!apiKey) {
        return {
            data: null,
            error: {
                message: 'CoinGecko Pro API key not configured',
                code: 'VALIDATION_ERROR'
            } as OHLCVError
        };
    }
    // pro base url
    //   const proBaseUrl = 'https://pro-api.coingecko.com/api/v3';
    // DEMO base url
    const baseUrl = 'https://api.coingecko.com/api/v3';
    const queryParams = new URLSearchParams({
        aggregate: aggregate.toString(),
        limit: limit.toString(),
        currency,
        ...(beforeTimestamp && { before_timestamp: beforeTimestamp.toString() }),
        ...(token && { token }),
    });

    const url = `${baseUrl}/onchain/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}?${queryParams}`;
    console.log('url', url)
    try {
        const response = await fetch(url, {
            headers: {
                'x-cg-pro-api-key': apiKey,
            },
        });
        console.log('response', response)
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return {
                data: null,
                error: {
                    message: errorData?.error || `HTTP error ${response.status}`,
                    code: 'HTTP_ERROR'
                } as OHLCVError
            };
        }

        const data: OHLCVResponse = await response.json();
        return { data, error: null };

    } catch (err: unknown) {
        const error = err as Error;
        console.error("Failed to fetch OHLCV data:", error);

        return {
            data: null,
            error: {
                message: error.message || "Unknown error occurred",
                code: 'UNKNOWN_ERROR'
            } as OHLCVError
        };
    }
}

export async function fetchAllTimeframes(ticker: string) {
    noStore()
    
    const timeframes = Object.keys(krakenIntervalMapping) as KrakenRange[]
    
    try {
        const results = await Promise.all(
            timeframes.map(async (range) => {
                const result = await fetchCoinQuote(ticker, range)
                return {
                    range,
                    ...result
                }
            })
        )

        // Create a map of timeframe data
        const timeframeData = results.reduce((acc, { range, data, error }) => {
            acc[range] = { data, error }
            return acc
        }, {} as Record<KrakenRange, { 
            data: KrakenOHLCResponse | null, 
            error: QuoteError | null 
        }>)

        return {
            data: timeframeData,
            error: null
        }

    } catch (err: unknown) {
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
