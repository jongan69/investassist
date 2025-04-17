import { NextResponse } from "next/server"

// Types for Raydium API responses
interface PlatformInfo {
    pubKey: string;
    platformClaimFeeWallet: string;
    platformLockNftWallet: string;
    platformScale: string;
    creatorScale: string;
    burnScale: string;
    feeRate: string;
    name: string;
    web: string;
    img: string;
}

interface ConfigInfo {
    name: string;
    pubKey: string;
    epoch: number;
    curveType: number;
    index: number;
    migrateFee: string;
    tradeFeeRate: string;
    maxShareFeeRate: string;
    minSupplyA: string;
    maxLockRate: string;
    minSellRateA: string;
    minMigrateRateA: string;
    minFundRaisingB: string;
    protocolFeeOwner: string;
    migrateFeeOwner: string;
    migrateToAmmWallet: string;
    migrateToCpmmWallet: string;
    mintB: string;
}

interface MintB {
    chainId: number;
    address: string;
    programId: string;
    logoURI: string;
    symbol: string;
    name: string;
    decimals: number;
    tags: string[];
    extensions: Record<string, any>;
}

interface TokenData {
    mint: string;
    poolId: string;
    configId: string;
    creator: string;
    createAt: number;
    name: string;
    symbol: string;
    description: string;
    twitter?: string;
    imgUrl: string;
    metadataUrl: string;
    platformInfo: PlatformInfo;
    configInfo: ConfigInfo;
    mintB: MintB;
    decimals: number;
    supply: number;
    marketCap: number;
    volumeA: number;
    volumeB: number;
    volumeU: number;
    finishingRate: number;
    initPrice: string;
    endPrice: string;
    totalLockedAmount: number;
    cliffPeriod: string;
    unlockPeriod: string;
    startTime: number;
    totalAllocatedShare: number;
    defaultCurve: boolean;
    pubKey: string;
}

interface TradeInfo {
    amountA: number;
    amountB: number;
    side: 'buy' | 'sell';
}

interface TokenWithTrade {
    mintInfo: TokenData;
    tradeInfo: TradeInfo;
}

interface TopTokenMintResponse {
    id: string;
    success: boolean;
    data: {
        data: TokenData;
    };
}

interface TopTokenLeftToMintResponse {
    id: string;
    success: boolean;
    data: {
        data: TokenWithTrade[];
    };
}

interface TokensSortedResponse {
    id: string;
    success: boolean;
    data: {
        rows: TokenData[];
        nextPageId?: string;
    };
}

interface ScoredToken extends TokenData {
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
}

// Constants
const TIMEOUT_MS = 15000; // 15 seconds
const CACHE_DURATION = 60; // 1 minute

// Scoring weights
const SCORING_WEIGHTS = {
    marketCap: 0.20,      // 20% weight
    volume: 0.20,         // 20% weight
    finishingRate: 0.15,  // 15% weight
    liquidity: 0.15,      // 15% weight
    social: 0.10,         // 10% weight
    newness: 0.20         // 20% weight
};

// Helper function to check if error is rate limit
function isRateLimitError(error: any): boolean {
    return error?.status === 429 || 
           (error?.message?.includes('Rate limit exceeded') || 
            error?.message?.includes('429'));
}

// Helper function to normalize scores between 0 and 1
function normalizeScore(value: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
}

// Helper function to calculate token score
function calculateTokenScore(token: TokenData, allTokens: TokenData[], source: 'new' | 'lastTrade'): ScoredToken {
    // Calculate min/max values for normalization
    const marketCaps = allTokens.map(t => t.marketCap);
    const volumes = allTokens.map(t => t.volumeU);
    const finishingRates = allTokens.map(t => t.finishingRate);
    const liquidities = allTokens.map(t => t.volumeB);
    const createTimes = allTokens.map(t => t.createAt);

    const minMarketCap = Math.min(...marketCaps);
    const maxMarketCap = Math.max(...marketCaps);
    const minVolume = Math.min(...volumes);
    const maxVolume = Math.max(...volumes);
    const minFinishingRate = Math.min(...finishingRates);
    const maxFinishingRate = Math.max(...finishingRates);
    const minLiquidity = Math.min(...liquidities);
    const maxLiquidity = Math.max(...liquidities);
    const minCreateTime = Math.min(...createTimes);
    const maxCreateTime = Math.max(...createTimes);

    // Calculate individual scores
    const marketCapScore = normalizeScore(token.marketCap, minMarketCap, maxMarketCap);
    const volumeScore = normalizeScore(token.volumeU, minVolume, maxVolume);
    const finishingRateScore = normalizeScore(token.finishingRate, minFinishingRate, maxFinishingRate);
    const liquidityScore = normalizeScore(token.volumeB, minLiquidity, maxLiquidity);
    
    // Social score based on Twitter presence
    const socialScore = token.twitter ? 1 : 0;

    // Newness score based on creation time
    const newnessScore = source === 'new' ? 1 : normalizeScore(token.createAt, minCreateTime, maxCreateTime);

    // Calculate weighted total score
    const totalScore = 
        marketCapScore * SCORING_WEIGHTS.marketCap +
        volumeScore * SCORING_WEIGHTS.volume +
        finishingRateScore * SCORING_WEIGHTS.finishingRate +
        liquidityScore * SCORING_WEIGHTS.liquidity +
        socialScore * SCORING_WEIGHTS.social +
        newnessScore * SCORING_WEIGHTS.newness;

    return {
        ...token,
        score: totalScore,
        scoreBreakdown: {
            marketCapScore,
            volumeScore,
            finishingRateScore,
            liquidityScore,
            socialScore,
            newnessScore
        },
        source
    };
}

export async function GET(request: Request) {
    const newTokensUrl = 'https://launch-mint-v1.raydium.io/get/list?sort=new&includeNsfw=false';
    const lastTradeTokensUrl = 'https://launch-mint-v1.raydium.io/get/list?sort=lastTrade&size=100&mintType=default&includeNsfw=false&platformId=PlatformWhiteList';
    const topTokenMintUrl = 'https://launch-mint-v1.raydium.io/get/random/index-top-mint';
    const topTokenLeftToMintUrl = 'https://launch-mint-v1.raydium.io/get/random/index-left-mint';

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log('API route: Request timed out after 15 seconds, aborting...');
        controller.abort();
    }, TIMEOUT_MS);

    try {
        console.log('Fetching data from Raydium API...');
        // console.log('URLs:', {
        //     newTokens: newTokensUrl,
        //     lastTradeTokens: lastTradeTokensUrl,
        //     topTokenMint: topTokenMintUrl,
        //     topTokenLeftToMint: topTokenLeftToMintUrl
        // });

        const [newTokensResponse, lastTradeTokensResponse, topTokenMintResponse, topTokenLeftToMintResponse] = await Promise.all([
            fetch(newTokensUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'InvestAssist/1.0'
                }
            }),
            fetch(lastTradeTokensUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'InvestAssist/1.0'
                }
            }),
            fetch(topTokenMintUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'InvestAssist/1.0'
                }
            }),
            fetch(topTokenLeftToMintUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'InvestAssist/1.0'
                }
            })
        ]);

        clearTimeout(timeoutId);

        // Log response statuses for debugging
        console.log('API Response Statuses:', {
            newTokens: newTokensResponse.status,
            lastTradeTokens: lastTradeTokensResponse.status,
            topTokenMint: topTokenMintResponse.status,
            topTokenLeftToMint: topTokenLeftToMintResponse.status
        });

        // Check for rate limiting
        if (newTokensResponse.status === 429 || 
            lastTradeTokensResponse.status === 429 || 
            topTokenMintResponse.status === 429 || 
            topTokenLeftToMintResponse.status === 429) {
            throw new Error('Rate limit exceeded');
        }

        // Log response headers for debugging
        // console.log('Response Headers:', {
        //     newTokens: Object.fromEntries(newTokensResponse.headers.entries()),
        //     lastTradeTokens: Object.fromEntries(lastTradeTokensResponse.headers.entries()),
        //     topTokenMint: Object.fromEntries(topTokenMintResponse.headers.entries()),
        //     topTokenLeftToMint: Object.fromEntries(topTokenLeftToMintResponse.headers.entries())
        // });

        // Try to get response text for failed requests to see error details
        if (!newTokensResponse.ok) {
            const errorText = await newTokensResponse.text();
            console.error('New Tokens Error Response:', errorText);
        }
        
        if (!lastTradeTokensResponse.ok) {
            const errorText = await lastTradeTokensResponse.text();
            console.error('Last Trade Tokens Error Response:', errorText);
        }

        // Check if any response is not ok
        if (!newTokensResponse.ok || 
            !lastTradeTokensResponse.ok || 
            !topTokenMintResponse.ok || 
            !topTokenLeftToMintResponse.ok) {
            const errorDetails = {
                newTokens: {
                    status: newTokensResponse.status,
                    statusText: newTokensResponse.statusText,
                    ok: newTokensResponse.ok
                },
                lastTradeTokens: {
                    status: lastTradeTokensResponse.status,
                    statusText: lastTradeTokensResponse.statusText,
                    ok: lastTradeTokensResponse.ok
                },
                topTokenMint: {
                    status: topTokenMintResponse.status,
                    statusText: topTokenMintResponse.statusText,
                    ok: topTokenMintResponse.ok
                },
                topTokenLeftToMint: {
                    status: topTokenLeftToMintResponse.status,
                    statusText: topTokenLeftToMintResponse.statusText,
                    ok: topTokenLeftToMintResponse.ok
                }
            };
            console.error('API Error Details:', errorDetails);
            
            // If both new and last trade tokens fail, but we have top tokens, continue with those
            if (!newTokensResponse.ok && !lastTradeTokensResponse.ok && 
                topTokenMintResponse.ok && topTokenLeftToMintResponse.ok) {
                console.log('Continuing with partial data (top tokens only)');
            } else {
                throw new Error(`One or more API requests failed: ${JSON.stringify(errorDetails)}`);
            }
        }

        const [newTokensData, lastTradeTokensData, topTokenMintData, topTokenLeftToMintData] = await Promise.all([
            newTokensResponse.ok ? newTokensResponse.json().catch(e => {
                console.error('Error parsing newTokensResponse:', e);
                return { success: true, data: { rows: [] } };
            }) : Promise.resolve({ success: true, data: { rows: [] } }),
            lastTradeTokensResponse.ok ? lastTradeTokensResponse.json().catch(e => {
                console.error('Error parsing lastTradeTokensResponse:', e);
                return { success: true, data: { rows: [] } };
            }) : Promise.resolve({ success: true, data: { rows: [] } }),
            topTokenMintResponse.json().catch(e => {
                console.error('Error parsing topTokenMintResponse:', e);
                throw e;
            }),
            topTokenLeftToMintResponse.json().catch(e => {
                console.error('Error parsing topTokenLeftToMintResponse:', e);
                throw e;
            })
        ]);

        // Log response data structure for debugging
        // console.log('API Response Structure:', {
        //     newTokens: {
        //         success: newTokensData.success,
        //         hasRows: Array.isArray(newTokensData.data?.rows),
        //         rowCount: newTokensData.data?.rows?.length,
        //         sampleToken: newTokensData.data?.rows?.[0]
        //     },
        //     lastTradeTokens: {
        //         success: lastTradeTokensData.success,
        //         hasRows: Array.isArray(lastTradeTokensData.data?.rows),
        //         rowCount: lastTradeTokensData.data?.rows?.length,
        //         sampleToken: lastTradeTokensData.data?.rows?.[0]
        //     },
        //     topTokenMint: {
        //         success: topTokenMintData.success,
        //         hasData: !!topTokenMintData.data?.data,
        //         sampleToken: topTokenMintData.data?.data
        //     },
        //     topTokenLeftToMint: {
        //         success: topTokenLeftToMintData.success,
        //         hasData: Array.isArray(topTokenLeftToMintData.data?.data),
        //         sampleToken: topTokenLeftToMintData.data?.data?.[0]
        //     }
        // });

        // Validate required fields in token data
        const validateTokenData = (token: TokenData) => {
            // Only require mint address as it's the unique identifier
            return token.mint && token.mint.length > 0;
        };

        // Combine and validate all tokens
        const allTokens = [
            ...newTokensData.data.rows,
            ...lastTradeTokensData.data.rows,
            // Include top token mint if available
            ...(topTokenMintData.data?.data ? [topTokenMintData.data.data] : []),
            // Include top tokens left to mint if available
            ...(topTokenLeftToMintData.data?.data?.map((item: { mintInfo: TokenData }) => item.mintInfo) || [])
        ];

        // Deduplicate tokens based on mint address
        const uniqueTokens = Array.from(
            new Map(allTokens.map(token => [token.mint, token])).values()
        );

        // Filter out invalid tokens instead of throwing error
        const validTokens = uniqueTokens.filter(token => validateTokenData(token));
        
        // Log validation results for debugging
        // console.log('Token Validation Results:', {
        //     totalTokens: uniqueTokens.length,
        //     validTokens: validTokens.length,
        //     invalidTokens: uniqueTokens.length - validTokens.length,
        //     invalidTokenExamples: uniqueTokens
        //         .filter(token => !validateTokenData(token))
        //         .slice(0, 3)
        //         .map(token => ({ mint: token.mint, reason: 'Missing mint address' }))
        // });

        // Calculate scores for valid tokens
        const scoredTokens = validTokens.map(token => {
            // Determine source based on where the token came from
            let source: 'new' | 'lastTrade' = 'new';
            if (lastTradeTokensData.data.rows.some((t: TokenData) => t.mint === token.mint)) {
                source = 'lastTrade';
            }
            return calculateTokenScore(token, validTokens, source);
        });

        // Sort tokens by score
        const sortedTokens = scoredTokens.sort((a, b) => b.score - a.score);

        // Get top 50 tokens by score
        const topScoredTokens = sortedTokens.slice(0, 50);

        // Process new tokens specifically for the "New Tokens" tab
        const newTokens = newTokensData.data.rows.map((token: TokenData) => {
            // Find if this token already exists in scoredTokens
            const existingToken = scoredTokens.find(t => t.mint === token.mint);
            
            if (existingToken) {
                // If it exists, use the scored version
                return existingToken;
            } else {
                // If it doesn't exist, create a new scored token
                return calculateTokenScore(token, validTokens, 'new');
            }
        });

        return NextResponse.json({
            tokensSortedByScore: {
                id: 'combined-score',
                success: true,
                data: {
                    rows: topScoredTokens,
                    nextPageId: null
                }
            },
            newTokens: {
                id: 'new-tokens',
                success: true,
                data: {
                    rows: newTokens,
                    nextPageId: newTokensData.data.nextPageId || null
                }
            },
            topTokenMintData,
            topTokenLeftToMintData
        }, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION}`,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        
        // Handle rate limiting specifically
        if (isRateLimitError(error)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    }
                }
            );
        }

        // Return more detailed error information
        return NextResponse.json(
            { 
                error: 'Failed to fetch data',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400' // 24 hours
        }
    });
}
