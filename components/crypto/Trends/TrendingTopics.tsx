"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTrendingTopics } from "@/lib/twitter/fetchTrendingTopics";
import { useState, useRef, useCallback } from "react";
import { TrendingUp, ExternalLink } from "lucide-react"
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";

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

export function TrendingTopics() {
    const { resolvedTheme } = useTheme();
    const [topics, setTopics] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<TopicResults>({});
    const [isSearching, setIsSearching] = useState<{[key: string]: boolean}>({});
    
    // Cache ref to persist between renders but not trigger them
    const searchCache = useRef<{[key: string]: CacheEntry}>({});
    const abortControllers = useRef<{[key: string]: AbortController}>({});

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
            
            // Update cache
            searchCache.current[cleanTopicText] = {
                timestamp: Date.now(),
                data
            };

            setSearchResults(prev => ({
                ...prev,
                [topic]: data
            }));
        } catch (err) {
            // Only log and update state if it's not an abort error
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                console.error(`Error searching for ${topic}:`, err);
                setSearchResults(prev => ({
                    ...prev,
                    [topic]: null
                }));
            }
        } finally {
            setIsSearching(prev => ({ ...prev, [topic]: false }));
            delete abortControllers.current[cleanTopicText];
        }
    }, []);

    // Process topics in batches
    const processBatch = useCallback(async (topics: string[]) => {
        for (let i = 0; i < topics.length; i += BATCH_SIZE) {
            const batch = topics.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(topic => searchPumpFun(topic)));
            if (i + BATCH_SIZE < topics.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }
    }, [searchPumpFun]);

    useEffect(() => {
        fetchTrendingTopics(setTopics, setIsLoading, setError);

        // Capture the current value of the ref
        const currentControllers = abortControllers.current;

        // Cleanup function to abort any pending requests
        return () => {
            Object.values(currentControllers).forEach(controller => {
                controller.abort();
            });
        };
    }, []);

    useEffect(() => {
        if (topics.length > 0) {
            processBatch(topics);
        }
    }, [topics, processBatch]);

    if (isLoading) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors flex items-center gap-2`}>
                            <TrendingUp className="w-6 h-6" />
                            X Trending Topics
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-black/10 dark:bg-white/10 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center text-red-600 dark:text-red-400">
                    {error}
                </div>
            </motion.div>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center text-gray-600 dark:text-gray-400">
                    No trending topics available at the moment.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn(
                "group relative rounded-xl",
                `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors flex items-center gap-2`}>
                        <TrendingUp className="w-6 h-6" />
                        X Trending Topics
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
                    {topics
                        .sort((a, b) => {
                            const aResults = searchResults[a]?.totalResults || 0;
                            const bResults = searchResults[b]?.totalResults || 0;
                            return bResults - aResults;
                        })
                        .map((topic, index) => {
                            const twitterUrl = `https://x.com/search?q=${encodeURIComponent(topic)}`;
                            const results = searchResults[topic];
                            const isSearchingTopic = isSearching[topic];
                            const topResult = results?.results[0];

                            return (
                                <div
                                    key={index}
                                    className="block w-full min-h-[140px] bg-black/5 dark:bg-white/5 rounded-lg p-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 relative z-20 flex flex-col"
                                >
                                    <div className="flex items-center justify-center mb-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <a
                                        href={twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-black dark:text-white text-center block hover:underline line-clamp-2 mb-2"
                                    >
                                        {topic}
                                    </a>
                                    
                                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 flex-grow flex flex-col justify-end">
                                        {isSearchingTopic ? (
                                            "Searching PumpFun..."
                                        ) : results ? (
                                            <>
                                                <span className="mb-2">
                                                    {results.totalResults === 0 ? (
                                                        "No tokens found"
                                                    ) : (
                                                        `${results.totalResults} token${results.totalResults === 1 ? '' : 's'} found`
                                                    )}
                                                </span>
                                                <span className="mb-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full h-8 px-2"
                                                        onClick={() => {
                                                            // Check if we have DexScreener data with pairs that have URLs
                                                            const dexScreenerData = results.dexScreenerData;
                                                            let dexScreenerUrl = `https://dexscreener.com/search?q=${encodeURIComponent(cleanTopic(topic))}`;
                                                            
                                                            // If we have DexScreener data with pairs that have URLs, use the first one
                                                            if (dexScreenerData?.pairs && dexScreenerData.pairs.length > 0 && dexScreenerData.pairs[0].url) {
                                                                dexScreenerUrl = dexScreenerData.pairs[0].url;
                                                            }
                                                            
                                                            window.open(dexScreenerUrl, '_blank');
                                                        }}
                                                    >
                                                        View DexScreener
                                                    </Button>
                                                </span>
                                                {topResult && (
                                                    <div className="mt-auto">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full h-8 px-2"
                                                            asChild
                                                        >
                                                            <a
                                                                href={topResult.pumpFunUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-1 text-[11px]"
                                                            >
                                                                View PumpFun
                                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            "No results"
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </motion.div>
    );
} 