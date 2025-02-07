interface JupiterToken {
    address: string;
    name: string;
    symbol: string;
    tags: string[];
    daily_volume: number;
}

// Add this cache object at the top of the file, outside the function
let tokenCache: {
    data: JupiterToken[] | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

export async function categorizeTokens(holdings: any[]) {
    try {
        // Check cache first (cache valid for 1 hour)
        const ONE_HOUR = 3600000;
        const now = Date.now();
        
        let allTokens: JupiterToken[];
        
        if (tokenCache.data && (now - tokenCache.timestamp) < ONE_HOUR) {
            allTokens = tokenCache.data;
        } else {
            // Fetch from our Next.js API route instead of directly from Jupiter
            const response = await fetch('/api/jupiter-tokens');
            
            if (!response.ok) {
                throw new Error('Failed to fetch tokens');
            }
            
            allTokens = await response.json();
            
            // Update cache
            tokenCache = {
                data: allTokens,
                timestamp: now
            };
        }

        // console.log('Fetched tokens from Jupiter API:', allTokens.length); // Debug log
        const categorized = {
            verified: [] as any[],
            memecoins: [] as any[],
            lst: [] as any[],  // Liquid Staked Tokens
            defi: [] as any[],
            other: [] as any[]
        };

        for (const holding of holdings) {
            const jupiterToken = allTokens.find(t => t.address === holding.mintAddress);
            // console.log('Processing holding:', holding, 'Found token:', jupiterToken); // Debug log

            if (!jupiterToken) {
                categorized.other.push(holding);
                continue;
            }

            // Check tags
            if (jupiterToken.tags.includes('lst')) {
                categorized.lst.push(holding);
            } else if (jupiterToken.tags.includes('verified')) {
                if (jupiterToken.tags.includes('defi')) {
                    categorized.defi.push(holding);
                } else if (
                    jupiterToken.symbol.includes('PEPE') ||
                    jupiterToken.symbol.includes('DOGE') ||
                    jupiterToken.symbol.includes('SHIB') ||
                    jupiterToken.symbol.includes('BONK') ||
                    jupiterToken.symbol.includes('WIF') ||
                    jupiterToken.daily_volume < 10000 // Low volume might indicate meme tokens
                ) {
                    categorized.memecoins.push(holding);
                } else {
                    categorized.verified.push(holding);
                }
            } else {
                categorized.other.push(holding);
            }
        }

        console.log('Categorized tokens:', categorized); // Debug log
        return categorized;
    } catch (error) {
        console.error('Error categorizing tokens:', error);
        return null;
    }
}