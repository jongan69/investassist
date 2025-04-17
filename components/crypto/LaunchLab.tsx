'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { fetchLaunchlab } from '@/lib/launchlab/fetchlaunchlab';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScoreBreakdown {
    marketCapScore: number;
    volumeScore: number;
    finishingRateScore: number;
    liquidityScore: number;
    socialScore: number;
    newnessScore: number;
}

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
    scoreBreakdown: ScoreBreakdown;
    source: 'new' | 'lastTrade';
    tradeInfo?: {
        amountA: number;
        amountB: number;
        side: 'buy' | 'sell';
    };
}

interface TokenListProps {
    className?: string;
}

// Define sort methods
type SortMethod = 'finishingRate' | 'marketCap';

export function LaunchLab({ className }: TokenListProps) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [newTokens, setNewTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortMethod, setSortMethod] = useState<SortMethod>('finishingRate');

    const fetchTokens = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch data from our API
            const data = await fetchLaunchlab();
            
            // Ensure we have valid data
            if (data && data.tokensSortedByScore && data.tokensSortedByScore.data && Array.isArray(data.tokensSortedByScore.data.rows)) {
                // Get tokens from tokensSortedByScore and map finishingRate to bondingProgress
                const sortedTokens = data.tokensSortedByScore.data.rows.map((token: any) => ({
                    ...token,
                    bondingProgress: token.finishingRate || 0
                }));
                
                // Get trading tokens from topTokenLeftToMintData
                const tradingTokens = data.topTokenLeftToMintData?.data?.data?.map((item: any) => {
                    // Find if this token already exists in sortedTokens
                    const existingToken = sortedTokens.find((t: Token) => t.mint === item.mintInfo.mint);
                    
                    if (existingToken) {
                        // If it exists, update its source to 'lastTrade'
                        return {
                            ...existingToken,
                            source: 'lastTrade',
                            tradeInfo: item.tradeInfo
                        };
                    } else {
                        // If it doesn't exist, add it with source 'lastTrade'
                        return {
                            ...item.mintInfo,
                            bondingProgress: item.mintInfo.finishingRate || 0,
                            source: 'lastTrade',
                            tradeInfo: item.tradeInfo,
                            // Add default score and scoreBreakdown if not present
                            score: 0.5,
                            scoreBreakdown: {
                                marketCapScore: 0.5,
                                volumeScore: 0.5,
                                finishingRateScore: 0.5,
                                liquidityScore: 0.5,
                                socialScore: 0.5,
                                newnessScore: 0.5
                            }
                        };
                    }
                }) || [];
                
                // Combine tokens, ensuring no duplicates by mint
                const allTokensMap = new Map<string, Token>();
                
                // Add sorted tokens first (they have scores)
                sortedTokens.forEach((token: Token) => {
                    allTokensMap.set(token.mint, token);
                });
                
                // Add trading tokens, updating existing ones if needed
                tradingTokens.forEach((token: Token) => {
                    allTokensMap.set(token.mint, token);
                });
                
                // Convert map back to array
                const allTokens = Array.from(allTokensMap.values());
                
                // Validate each token has the required properties
                const validTokens = allTokens.filter((token: Token) => 
                    token && 
                    typeof token.score === 'number' && 
                    token.scoreBreakdown && 
                    typeof token.scoreBreakdown.marketCapScore === 'number' &&
                    typeof token.scoreBreakdown.volumeScore === 'number' &&
                    typeof token.scoreBreakdown.finishingRateScore === 'number' &&
                    typeof token.scoreBreakdown.liquidityScore === 'number'
                );
                
                setTokens(validTokens);
                
                // Get new tokens from our API
                if (data.newTokens && data.newTokens.success && data.newTokens.data && Array.isArray(data.newTokens.data.rows)) {
                    // Map finishingRate to bondingProgress for new tokens
                    const processedNewTokens = data.newTokens.data.rows.map((token: any) => ({
                        ...token,
                        bondingProgress: token.finishingRate || 0
                    }));
                    
                    // Deduplicate new tokens by mint
                    const newTokensMap = new Map<string, Token>();
                    processedNewTokens.forEach((token: Token) => {
                        newTokensMap.set(token.mint, token);
                    });
                    
                    setNewTokens(Array.from(newTokensMap.values()));
                } else {
                    console.warn('No new tokens data available from API');
                    setNewTokens([]);
                }
            } else {
                console.error('Invalid data structure received:', data);
                setError('Invalid data structure received from API');
            }
        } catch (err) {
            console.error('Error fetching tokens:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const formatScore = (score: number) => (score * 100).toFixed(1);

    // Sort tokens by finishing rate (from greatest to least)
    const sortTokensByFinishingRate = (tokensToSort: Token[]) => {
        return [...tokensToSort].sort((a, b) => b.finishingRate - a.finishingRate);
    };

    // Sort tokens by market cap (from greatest to least)
    const sortTokensByMarketCap = (tokensToSort: Token[]) => {
        return [...tokensToSort].sort((a, b) => b.marketCap - a.marketCap);
    };

    // Generic sort function that uses the current sort method
    const sortTokens = (tokensToSort: Token[]) => {
        if (sortMethod === 'marketCap') {
            return sortTokensByMarketCap(tokensToSort);
        }
        return sortTokensByFinishingRate(tokensToSort);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="w-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="text-center text-red-500">
                        Error: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`${className} h-[calc(100vh-200px)] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">LaunchLab</h1>
                <div className="flex items-center gap-4">
                    <Select
                        value={sortMethod}
                        onValueChange={(value) => setSortMethod(value as SortMethod)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="finishingRate">Sort by Bonding Progress</SelectItem>
                            <SelectItem value="marketCap">Sort by Market Cap</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchTokens} 
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Tokens</TabsTrigger>
                    <TabsTrigger value="new">New Tokens</TabsTrigger>
                    <TabsTrigger value="trading">Active Trading</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                    {/* Combine both new tokens and trading tokens for the "All Tokens" tab and sort by selected method */}
                    {(() => {
                        // Create a map to deduplicate tokens by mint address
                        const tokenMap = new Map<string, Token>();
                        
                        // Add new tokens first
                        newTokens.forEach(token => {
                            tokenMap.set(token.mint, token);
                        });
                        
                        // Add trading tokens, updating existing ones if needed
                        tokens.filter(token => token.source === 'lastTrade').forEach(token => {
                            tokenMap.set(token.mint, token);
                        });
                        
                        // Convert map to array and sort by selected method
                        return sortTokens(Array.from(tokenMap.values())).map((token) => (
                            <TokenCard key={token.mint} token={token} formatNumber={formatNumber} formatScore={formatScore} />
                        ));
                    })()}
                </TabsContent>

                <TabsContent value="new" className="space-y-8">
                    {newTokens.length > 0 ? (
                        sortTokens(newTokens).map((token) => (
                            <TokenCard key={token.mint} token={token} formatNumber={formatNumber} formatScore={formatScore} />
                        ))
                    ) : (
                        <Card className="w-full">
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    No new tokens available at the moment.
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="trading" className="space-y-8">
                    {sortTokens(tokens.filter((token) => token.source === 'lastTrade')).map((token) => (
                        <TokenCard key={token.mint} token={token} formatNumber={formatNumber} formatScore={formatScore} />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TokenCard({ token, formatNumber, formatScore }: { token: Token; formatNumber: (num: number) => string; formatScore: (score: number) => string }) {
    // Ensure we have valid score values with defaults
    const overallScore = token.score || 0;
    const marketCapScore = token.scoreBreakdown?.marketCapScore || 0;
    const volumeScore = token.scoreBreakdown?.volumeScore || 0;
    const finishingRateScore = token.scoreBreakdown?.finishingRateScore || 0;
    const liquidityScore = token.scoreBreakdown?.liquidityScore || 0;

    const raydiumUrl = `https://raydium.io/launchpad/token/?mint=${token.mint}&lreferrer=4cjrPocxTryHXka56qSnNPqJY5METi3UQKMs7EwwPKfs`;

    // Handle Twitter link click to prevent event propagation
    const handleTwitterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (token.twitter) {
            window.open(token.twitter, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Link href={raydiumUrl} target="_blank" rel="noopener noreferrer">
            <Card className="w-full hover:bg-accent/50 transition-colors cursor-pointer mb-8">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="relative h-12 w-12">
                        <Image
                            src={token.imgUrl}
                            alt={token.name}
                            fill
                            className="rounded-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.png';
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{token.name}</h3>
                            <Badge variant={token.source === 'new' ? 'default' : 'secondary'}>
                                {token.source === 'new' ? 'New' : 'Trading'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{token.symbol}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold">${formatNumber(token.marketCap)}</div>
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Overall Score</span>
                                <span className="font-medium">{formatScore(overallScore)}%</span>
                            </div>
                            <Progress 
                                value={overallScore * 100} 
                                variant="launchlab" 
                                className="animate-pulse" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Market Cap Score</span>
                                    <span>{formatScore(marketCapScore)}%</span>
                                </div>
                                <Progress 
                                    value={marketCapScore * 100} 
                                    variant="launchlab" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Volume Score</span>
                                    <span>{formatScore(volumeScore)}%</span>
                                </div>
                                <Progress 
                                    value={volumeScore * 100} 
                                    variant="launchlab" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Bonding Progress</span>
                                    <span>{formatScore(finishingRateScore)}%</span>
                                </div>
                                <Progress 
                                    value={finishingRateScore * 100} 
                                    variant="launchlab" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Liquidity</span>
                                    <span>{formatScore(liquidityScore)}%</span>
                                </div>
                                <Progress 
                                    value={liquidityScore * 100} 
                                    variant="launchlab" 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span>Volume:</span>
                                <span className="font-medium">${formatNumber(token.volumeU)}</span>
                            </div>
                            {token.twitter && (
                                <button
                                    onClick={handleTwitterClick}
                                    className="text-blue-500 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                                >
                                    Twitter
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
} 