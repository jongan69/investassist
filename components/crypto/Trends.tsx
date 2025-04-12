"use client"

import { useEffect, useState, Fragment, useRef, useCallback, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { RefreshCw } from 'lucide-react';

import { fetchCryptoTrends } from '@/lib/solana/fetchTrends';
import { fetchLatestTweets } from '@/lib/twitter/fetchLatestTweets';
import { fetchTweetedCas } from '@/lib/twitter/fetchTweetedCas';
import { TweetedCas } from './Trends/TweetedCas';
import { WhaleActivity } from './Trends/WhaleActivity';
import { LatestTweets } from './Trends/LatestTweets';
import { Overview } from './Trends/Overview';
import { TopTweeted } from './Trends/TopTweeted';
import { TrendingMetas } from './Trends/TrendingMetas';
import TrendingVideos from '../tiktok/TrendingVideos';

export default function CryptoTrends({ data }: { data: any }) {
    const { resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const isMountedRef = useRef(false);

    // State management
    const [trends, setTrends] = useState<TrendData | null>(null);
    const [latestTweets, setLatestTweets] = useState<any[]>([]);
    const [tweetedCas, setTweetedCas] = useState<any[]>([]);

    // Loading states
    const [isTrendsLoading, setIsTrendsLoading] = useState(true);
    const [isTweetsLoading, setIsTweetsLoading] = useState(true);
    const [isCasLoading, setIsCasLoading] = useState(true);

    // Error states
    const [trendsError, setTrendsError] = useState<string | null>(null);
    const [tweetsError, setTweetsError] = useState<string | null>(null);
    const [casError, setCasError] = useState<string | null>(null);

    // Data fetching ref
    const hasFetchedData = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Memoized refresh functions
    const refreshTweets = useCallback(async () => {
        if (!isMountedRef.current) return;
        try {
            setIsTweetsLoading(true);
            setTweetsError(null);
            await fetchLatestTweets(setLatestTweets, setIsTweetsLoading, setTweetsError);
        } catch (error) {
            console.error('Error refreshing tweets:', error);
            if (isMountedRef.current) {
                setTweetsError('Failed to refresh latest tweets');
            }
        }
    }, []);

    const refreshCas = useCallback(async () => {
        if (!isMountedRef.current) return;
        try {
            setIsCasLoading(true);
            setCasError(null);
            await fetchTweetedCas(setTweetedCas, setIsCasLoading, setCasError);
        } catch (error) {
            console.error('Error refreshing CAS:', error);
            if (isMountedRef.current) {
                setCasError('Failed to refresh CAS tokens');
            }
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        isMountedRef.current = true;
        setIsMounted(true);

        const fetchData = async () => {
            if (hasFetchedData.current || !isMountedRef.current) return;
            hasFetchedData.current = true;

            // Create new AbortController for this fetch
            abortControllerRef.current = new AbortController();

            try {
                await Promise.all([
                    fetchCryptoTrends(setTrends, setIsTrendsLoading, setTrendsError),
                    fetchLatestTweets(setLatestTweets, setIsTweetsLoading, setTweetsError),
                    fetchTweetedCas(setTweetedCas, setIsCasLoading, setCasError)
                ]);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Fetch aborted');
                    return;
                }
                console.error('Error fetching data:', error);
                if (isMountedRef.current) {
                    setTrendsError('Failed to load crypto trends');
                    setTweetsError('Failed to load latest tweets');
                    setCasError('Failed to load CAS tokens');
                }
            }
        };

        fetchData();

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Memoized loading state
    const isLoading = useMemo(() => 
        isTrendsLoading || isTweetsLoading || isCasLoading,
        [isTrendsLoading, isTweetsLoading, isCasLoading]
    );

    // Early return if not mounted or theme not resolved
    if (!resolvedTheme || !isMounted) return null;

    return (
        <>
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6 max-w-full mx-auto"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors`}>
                            Crypto Trends
                        </h2>
                        {isLoading && (
                            <div className="flex gap-1 px-1">
                                {[0, 0.2, 0.4].map((delay) => (
                                    <motion.span
                                        key={delay}
                                        className={`animate-pulse h-2 w-2 rounded-full ${resolvedTheme === 'dark' ? 'bg-white' : 'bg-black'}`}
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {trendsError ? (
                        <p className={`${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'} leading-relaxed text-xs`}>
                            {trendsError}
                        </p>
                    ) : trends ? (
                        <Fragment>
                            <Overview trends={trends} data={data} />
                            <TrendingMetas />
                            <TopTweeted trends={trends} />
                            <WhaleActivity trends={trends} />
                          
                        </Fragment>
                    ) : (
                        <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed text-xs`}>
                            Fetching crypto trends...
                        </p>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 py-6 z-0" />
            </motion.div>
            <TrendingVideos />
            {(!isCasLoading && tweetedCas && tweetedCas.length === 0) && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={refreshCas}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg",
                            "bg-gray-200 dark:bg-gray-800",
                            "hover:bg-gray-300 dark:hover:bg-gray-700",
                            "transition-colors"
                        )}
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh CAs</span>
                    </button>
                </div>
            )}
            
            <TweetedCas tweetedCas={tweetedCas} isCasLoading={isCasLoading} casError={casError ?? ''} />
            {(!isTweetsLoading && latestTweets && latestTweets.length === 0) && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={refreshTweets}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg",
                            "bg-gray-200 dark:bg-gray-800",
                            "hover:bg-gray-300 dark:hover:bg-gray-700",
                            "transition-colors"
                        )}
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Tweets</span>
                    </button>
                </div>
            )}
            <LatestTweets latestTweets={latestTweets} isTweetsLoading={isTweetsLoading} tweetsError={tweetsError ?? ''} />
        </>
    );
} 