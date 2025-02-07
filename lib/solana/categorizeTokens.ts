interface JupiterToken {
    address: string;
    name: string;
    symbol: string;
    tags: string[];
    daily_volume: number;
}

export async function categorizeTokens(holdings: any[]) {
    try {
        console.log('Categorizing tokens for holdings:', holdings); // Debug log
        // Fetch verified tokens from Jupiter API
        const response = await fetch('https://api.jup.ag/tokens/v1/all');
        const allTokens: JupiterToken[] = await response.json();
        console.log('Fetched tokens from Jupiter API:', allTokens.length); // Debug log
        const categorized = {
            verified: [] as any[],
            memecoins: [] as any[],
            lst: [] as any[],  // Liquid Staked Tokens
            defi: [] as any[],
            other: [] as any[]
        };

        for (const holding of holdings) {
            const jupiterToken = allTokens.find(t => t.address === holding.mintAddress);
            console.log('Processing holding:', holding, 'Found token:', jupiterToken); // Debug log

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