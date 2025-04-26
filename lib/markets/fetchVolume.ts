import { MARKET_API } from "../utils/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const TIMEOUT_DURATION = 20000; // 20 seconds
const FALLBACK_TIMEOUT = 15000; // 15 seconds

const defaultFetchOptions = {
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'InvestAssist/1.0'
    },
    mode: 'cors' as RequestMode,
    credentials: 'same-origin' as RequestCredentials
};

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export async function fetchVolume() {
    try {
        const isServer = typeof window === 'undefined';
        const url = isServer ? `${BASE_URL}/api/finviz/highestvolume` : `/api/finviz/highestvolume`;
        
        const response = await fetchWithTimeout(url, {
            ...defaultFetchOptions,
            next: { revalidate: 3600 }
        }, TIMEOUT_DURATION);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        return data;
    } catch (error) {
        console.error('Error fetching high volume stocks:', error);
        
        try {
            const externalUrl = `${MARKET_API}/screener/volume`;
            const response = await fetchWithTimeout(externalUrl, {
                ...defaultFetchOptions,
                cache: 'no-store'
            }, FALLBACK_TIMEOUT);

            if (!response.ok) {
                throw new Error(`External API returned status: ${response.status}`);
            }

            const rawData = await response.json();
            return {
                high_volume_stocks: rawData.high_volume_stocks.stocks || [],
                total_high_volume_stocks: rawData.high_volume_stocks?.stocks?.length || 0,
            };
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return {
                high_volume_stocks: [],
                total_high_volume_stocks: 0,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}