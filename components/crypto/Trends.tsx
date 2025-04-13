"use client"

import { useEffect, useState, Fragment, useRef, useCallback, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
import AxiomPulse from './Trends/AxiomPulse';
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
        <div className="space-y-8">
            <AxiomPulse />
            
            <Card className="max-w-full mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Crypto Trends
                        </CardTitle>
                        {isLoading && (
                            <div className="flex gap-1 px-1">
                                {[0, 0.2, 0.4].map((delay) => (
                                    <motion.span
                                        key={delay}
                                        className="h-2 w-2 rounded-full bg-primary animate-pulse"
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {trendsError ? (
                        <p className="text-sm p-4 rounded-lg bg-destructive/10 text-destructive">
                            {trendsError}
                        </p>
                    ) : trends ? (
                        <Fragment>
                            <Overview trends={trends} data={data} />
                            <TrendingMetas />
                            {trends?.topTweetedTickers?.length > 0 && <TopTweeted trends={trends} />}
                            <WhaleActivity trends={trends} />
                          
                        </Fragment>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Fetching crypto trends...
                        </p>
                    )}
                </CardContent>
            </Card>
            
            <TrendingVideos />
            
            {(!isCasLoading && tweetedCas && tweetedCas.length === 0) && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={refreshCas}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Tweets</span>
                    </button>
                </div>
            )}
            
            <LatestTweets latestTweets={latestTweets} isTweetsLoading={isTweetsLoading} tweetsError={tweetsError ?? ''} />
        </div>
    );
} 