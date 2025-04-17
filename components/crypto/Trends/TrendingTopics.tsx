"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { TrendingUp, ExternalLink, ChevronDown, ChevronUp, TrendingDown, Minus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils/utils";

import { fetchTrendingTopics } from "@/lib/twitter/fetchTrendingTopics";

interface PumpFunResult {
    totalResults: number;
    results: {
        mint: string;
        name: string;
        symbol: string;
        metrics: {
            marketCap: number;
            usdMarketCap: number;
        };
        pumpFunUrl: string;
    }[];
    dexScreenerData?: {
        pairs?: Array<{
            url: string;
            priceUsd?: number;
            priceChange24h?: number;
            volume24h?: number;
            liquidity?: number;
            [key: string]: any;
        }>;
        [key: string]: any;
    } | null;
}

interface TopicResults {
    [key: string]: PumpFunResult | null;
}

interface CacheEntry {
    timestamp: number;
    data: PumpFunResult;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 3; // Number of concurrent requests
const BATCH_DELAY = 500; // Delay between batches in ms

// Helper function to clean topics by removing symbols
const cleanTopic = (topic: string): string => {
  // Remove $, @, #, and other common symbols
  return topic.replace(/[$@#&*(){}[\]|\\:;'"<>,.?/!~`]/g, '').trim();
};

// Helper function to format market cap
const formatMarketCap = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

// Helper function to format price
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toExponential(2)}`;
};

// Helper function to format volume
const formatVolume = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export function TrendingTopics() {
    const [topics, setTopics] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<TopicResults>({});
    const [isSearching, setIsSearching] = useState<{[key: string]: boolean}>({});
    const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
    
    // Cache ref to persist between renders but not trigger them
    const searchCache = useRef<{[key: string]: CacheEntry}>({});
    const abortControllers = useRef<{[key: string]: AbortController}>({});
    // Track the latest request ID to prevent race conditions
    const requestIds = useRef<{[key: string]: number}>({});

    const searchPumpFun = useCallback(async (topic: string) => {
        // Strip $ symbol from topic if present and clean the topic
        const cleanTopicText = cleanTopic(topic);

        // Check cache first
        const cached = searchCache.current[cleanTopicText];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setSearchResults(prev => ({
                ...prev,
                [topic]: cached.data
            }));
            return;
        }

        // Cancel any existing search for this topic
        if (abortControllers.current[cleanTopicText]) {
            abortControllers.current[cleanTopicText].abort();
        }

        // Create new abort controller
        const controller = new AbortController();
        abortControllers.current[cleanTopicText] = controller;
        
        // Generate a new request ID for this search
        const requestId = Date.now();
        requestIds.current[cleanTopicText] = requestId;

        setIsSearching(prev => ({ ...prev, [topic]: true }));
        try {
            const res = await fetch('/api/pumpfun/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchTerm: cleanTopicText }),
                signal: controller.signal
            });
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            
            // Only update state if this is still the latest request for this topic
            if (requestIds.current[cleanTopicText] === requestId) {
                // Update cache
                searchCache.current[cleanTopicText] = {
                    timestamp: Date.now(),
                    data
                };

                setSearchResults(prev => ({
                    ...prev,
                    [topic]: data
                }));
            }
        } catch (err) {
            // Only log and update state if it's not an abort error
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                console.error(`Error searching for ${topic}:`, err);
                // Only update state if this is still the latest request for this topic
                if (requestIds.current[cleanTopicText] === requestId) {
                    setSearchResults(prev => ({
                        ...prev,
                        [topic]: null
                    }));
                }
            }
        } finally {
            // Only update searching state if this is still the latest request for this topic
            if (requestIds.current[cleanTopicText] === requestId) {
                setIsSearching(prev => ({ ...prev, [topic]: false }));
            }
            delete abortControllers.current[cleanTopicText];
        }
    }, []);

    // Process topics in batches
    const processBatch = useCallback(async (topics: string[]) => {
        for (let i = 0; i < topics.length; i += BATCH_SIZE) {
            const batch = topics.slice(i, i + BATCH_SIZE);
            await Promise.all(batch?.map(topic => searchPumpFun(topic)));
            if (i + BATCH_SIZE < topics.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }
    }, [searchPumpFun]);

    // Fetch trending topics
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const trendingTopicsData = await fetchTrendingTopics();
                setTopics(trendingTopicsData);
            } catch (err) {
                console.error("Error fetching trending topics:", err);
                setError("Failed to load trending topics. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTopics();

        // Capture the current value of the ref
        const currentAbortControllers = abortControllers.current;

        // Cleanup function to abort any pending requests
        return () => {
            // Abort all controllers in the captured ref
            Object.values(currentAbortControllers).forEach(controller => {
                controller.abort();
            });
        };
    }, []);

    // Process topics when they change
    useEffect(() => {
        if (topics.length > 0) {
            processBatch(topics);
        }
    }, [topics, processBatch]);

    const toggleExpand = useCallback((topic: string) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topic]: !prev[topic]
        }));
    }, []);

    // Helper function to get the best pair from DexScreener data
    const getBestPair = useCallback((dexScreenerData: PumpFunResult['dexScreenerData']) => {
        if (!dexScreenerData?.pairs?.length) {
            return null;
        }
        
        // Sort by liquidity (highest first)
        const sortedPairs = [...dexScreenerData.pairs].sort((a, b) => {
            const liquidityA = a.liquidity || 0;
            const liquidityB = b.liquidity || 0;
            return liquidityB - liquidityA;
        });
        
        return sortedPairs[0];
    }, []);

    // Memoize sorted topics to avoid unnecessary re-sorting on every render
    const sortedTopics = useMemo(() => {
        return [...topics].sort((a, b) => {
            const aResults = searchResults[a]?.totalResults || 0;
            const bResults = searchResults[b]?.totalResults || 0;
            return bResults - aResults;
        });
    }, [topics, searchResults]);

    if (isLoading) {
        return (
            <div className="p-4">
                <Card className="w-full p-6">
                    <CardHeader className="px-0">
                        <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />  
                            X Trending Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-16 bg-secondary/20 rounded-lg"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Card className="w-full p-6">
                    <CardHeader className="px-0">
                        <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />  
                            X Trending Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="text-center text-destructive bg-destructive/10 p-4 rounded-lg">
                            {error}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <div className="p-4">
                <Card className="w-full p-6">
                    <CardHeader className="px-0">
                        <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            X Trending Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="text-center text-muted-foreground">
                            No trending topics available at the moment.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card className="w-full p-6">
                <CardHeader className="px-0">
                    <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        X Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sortedTopics.map((topic, index) => {
                            const result = searchResults[topic];
                            const isLoading = isSearching[topic];
                            const isExpanded = expandedTopics[topic];
                            
                            return (
                                <div 
                                    key={index} 
                                    className={cn(
                                        "p-3 rounded-lg border transition-all duration-200",
                                        result ? "border-primary/50 bg-primary/5" : "border-border bg-card",
                                        isLoading ? "animate-pulse" : ""
                                    )}
                                >
                                    <div className="flex flex-col mb-2">
                                        <span className="font-medium text-foreground break-words">{topic}</span>
                                        {result && (
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap mt-1 self-start">
                                                {result.totalResults} results
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isLoading ? (
                                        <div className="h-4 w-3/4 bg-secondary/20 rounded animate-pulse"></div>
                                    ) : (result?.results && result.results.length > 0) ? (
                                        <div className="space-y-2">
                                            {result.results.slice(0, isExpanded ? 3 : 1).map((item, i) => {
                                                const bestPair = getBestPair(result?.dexScreenerData);
                                                const priceChange = bestPair?.priceChange24h || 0;
                                                const isPositive = priceChange > 0;
                                                const isNegative = priceChange < 0;
                                                
                                                return (
                                                    <div key={i} className="text-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-foreground truncate max-w-[60%]">{item.symbol}</span>
                                                            <a 
                                                                href={item.pumpFunUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:text-primary/80 flex items-center gap-1"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span className="truncate max-w-[80px]">{formatMarketCap(item.metrics.usdMarketCap)}</span>
                                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                            </a>
                                                        </div>
                                                        
                                                        {bestPair && (
                                                            <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-muted-foreground">Price:</span>
                                                                    <span className="font-medium">{formatPrice(bestPair.priceUsd || 0)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-muted-foreground">24h:</span>
                                                                    <span className={cn(
                                                                        "font-medium flex items-center gap-0.5",
                                                                        isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"
                                                                    )}>
                                                                        {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                                        {Math.abs(priceChange).toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-muted-foreground">Vol:</span>
                                                                    <span className="font-medium">{formatVolume(bestPair.volume24h || 0)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-muted-foreground">Liq:</span>
                                                                    <span className="font-medium">{formatVolume(bestPair.liquidity || 0)}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {result && result.results && result.results.length > 1 && (
                                                <button 
                                                    onClick={() => toggleExpand(topic)}
                                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                                                    aria-expanded={isExpanded}
                                                    aria-label={isExpanded ? "Show less results" : `Show ${result?.results?.length ? result.results.length - 1 : 0} more results`}
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-3 h-3" />
                                                            <span>Show less</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-3 h-3" />
                                                            <span>Show {result?.results?.length ? result.results.length - 1 : 0} more</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 