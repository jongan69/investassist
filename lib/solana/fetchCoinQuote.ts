import { unstable_noStore as noStore } from "next/cache"

export type QuoteError = {
    message: string;
    code: 'VALIDATION_ERROR' | 'HTTP_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR' | 'PARTIAL_ERROR';
}

export type KrakenInterval = keyof typeof krakenIntervalMapping;

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

export const standardIntervals = {
    "1m": "1m",    // 1 minute
    "5m": "5m",    // 5 minutes
    "15m": "15m",  // 15 minutes
    "30m": "30m",  // 30 minutes
    "1h": "60m",   // 1 hour
    "4h": "240m",  // 4 hours
    "1d": "1d",    // 1 day
    "1w": "1w",    // 1 week
} as const;

export type StandardInterval = keyof typeof standardIntervals;

// Update krakenIntervalMapping to map from StandardInterval
export const krakenIntervalMapping: Record<StandardInterval, number> = {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "30m": 30,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
    "1w": 10080,
} as const;

// Update the cache time constants
const CACHE_TIME: Record<StandardInterval, number> = {
    "1m": 30 * 1000,        // 30 seconds
    "5m": 60 * 1000,        // 1 minute
    "15m": 2 * 60 * 1000,   // 2 minutes
    "30m": 5 * 60 * 1000,   // 5 minutes
    "1h": 10 * 60 * 1000,   // 10 minutes
    "4h": 30 * 60 * 1000,   // 30 minutes
    "1d": 60 * 60 * 1000,   // 1 hour
    "1w": 4 * 60 * 60 * 1000, // 4 hours
} as const;

// Add more sophisticated caching with types
interface CacheEntry<T> {
    timestamp: number;
    data: T;
}

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

export async function fetchCoinQuote(ticker: string, range: StandardInterval = "1d") {
    const cacheKey = `${ticker}-${range}`
    const cached = priceCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TIME[range]) {
        return { data: cached.data, error: null }
    }

    try {
        const pair = ticker.replace('-', '')
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
    console.time(`fetchAllTimeframes:${ticker}`)

    const timeframes = Object.keys(standardIntervals) as StandardInterval[]
    const timeframeData: Record<StandardInterval, {
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
        const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${ticker.toUpperCase().replace('-', '')}`)
        const data = await response.json()
        return data
    } catch (err) {
        console.error("Failed to fetch kraken ticker data:", err)
        return null
    }
}