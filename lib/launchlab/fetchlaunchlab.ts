// Define the Token type
interface Token {
    mint: string;
    name: string;
    symbol: string;
    description: string;
    twitter?: string;
    imgUrl: string;
    marketCap: number;
    volumeU: number;
    finishingRate: number;
    volumeB: number;
    score: number;
    scoreBreakdown: {
        marketCapScore: number;
        volumeScore: number;
        finishingRateScore: number;
        liquidityScore: number;
        socialScore: number;
        newnessScore: number;
    };
    source: 'new' | 'lastTrade';
    tradeInfo?: {
        amountA: number;
        amountB: number;
        side: 'buy' | 'sell';
    };
}

interface LaunchlabResponse {
    tokensSortedByScore: {
        id: string;
        success: boolean;
        data: {
            rows: Token[];
            nextPageId: string | null;
        };
    };
    newTokens: {
        id: string;
        success: boolean;
        data: {
            rows: Token[];
            nextPageId: string | null;
        };
    };
    topTokenMintData: {
        id: string;
        success: boolean;
        data: {
            data: Token;
        };
    };
    topTokenLeftToMintData: {
        id: string;
        success: boolean;
        data: {
            data: Array<{
                mintInfo: Token;
                tradeInfo: {
                    amountA: number;
                    amountB: number;
                    side: 'buy' | 'sell';
                };
            }>;
        };
    };
}

export async function fetchLaunchlab(): Promise<LaunchlabResponse> {
    try {
        console.log('Fetching Launchlab data...');
        const response = await fetch('/api/launchlab');
        
        if (!response.ok) {
            console.error('Launchlab API error:', {
                status: response.status,
                statusText: response.statusText
            });
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Launchlab API response received');

        // Validate the response structure
        if (!data || typeof data !== 'object') {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from API');
        }

        // Validate required fields
        if (!data.tokensSortedByScore?.data?.rows || !Array.isArray(data.tokensSortedByScore.data.rows)) {
            console.error('Missing or invalid tokensSortedByScore data:', data.tokensSortedByScore);
            throw new Error('Missing or invalid tokensSortedByScore data');
        }

        if (!data.newTokens?.data?.rows || !Array.isArray(data.newTokens.data.rows)) {
            console.error('Missing or invalid newTokens data:', data.newTokens);
            throw new Error('Missing or invalid newTokens data');
        }

        // Validate tokens
        const validateToken = (token: any): token is Token => {
            return token 
                && typeof token === 'object'
                && typeof token.mint === 'string'
                && typeof token.name === 'string'
                && typeof token.symbol === 'string'
                && typeof token.marketCap === 'number'
                && typeof token.volumeU === 'number'
                && typeof token.finishingRate === 'number'
                && typeof token.score === 'number'
                && typeof token.scoreBreakdown === 'object';
        };

        // Filter and validate tokens
        const validSortedTokens = data.tokensSortedByScore.data.rows.filter(validateToken);
        const validNewTokens = data.newTokens.data.rows.filter(validateToken);

        console.log('Token validation results:', {
            totalSortedTokens: data.tokensSortedByScore.data.rows.length,
            validSortedTokens: validSortedTokens.length,
            totalNewTokens: data.newTokens.data.rows.length,
            validNewTokens: validNewTokens.length
        });

        // Return validated data
        return {
            ...data,
            tokensSortedByScore: {
                ...data.tokensSortedByScore,
                data: {
                    ...data.tokensSortedByScore.data,
                    rows: validSortedTokens
                }
            },
            newTokens: {
                ...data.newTokens,
                data: {
                    ...data.newTokens.data,
                    rows: validNewTokens
                }
            }
        };
    } catch (error) {
        console.error('Error fetching Launchlab data:', error);
        throw error;
    }
}