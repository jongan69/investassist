"use client"

import { useEffect, useState, Fragment, useRef } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { fetchCryptoTrends } from '@/lib/solana/fetchTrends';
import { fetchLatestTweets } from '@/lib/twitter/fetchLatestTweets';
import { fetchTweetedCas } from '@/lib/twitter/fetchTweetedCas';
import { TweetedCas } from './Trends/TweetedCas';
import { WhaleActivity } from './Trends/WhaleActivity';
import { LatestTweets } from './Trends/LatestTweets';
import { Overview } from './Trends/Overview';
import { TopTweeted } from './Trends/TopTweeted';

export default function CryptoTrends({ data }: { data: any }) {
    const { resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);


    const [trends, setTrends] = useState<TrendData | null>(null);
    const [latestTweets, setLatestTweets] = useState<any[]>([]);
    const [tweetedCas, setTweetedCas] = useState<any[]>([]);

    // Separate loading states
    const [isTrendsLoading, setIsTrendsLoading] = useState(true);
    const [isTweetsLoading, setIsTweetsLoading] = useState(true);
    const [isCasLoading, setIsCasLoading] = useState(true);

    // Separate error states
    const [trendsError, setTrendsError] = useState<string | null>(null);
    const [tweetsError, setTweetsError] = useState<string | null>(null);
    const [casError, setCasError] = useState<string | null>(null);

    // Add a ref to track if we've already fetched data
    const hasFetchedData = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetchedData.current) return;
            hasFetchedData.current = true;

            try {
                await Promise.all([
                    fetchCryptoTrends(setTrends, setIsTrendsLoading, setTrendsError),
                    fetchLatestTweets(setLatestTweets, setIsTweetsLoading, setTweetsError),
                    fetchTweetedCas(setTweetedCas, setIsCasLoading, setCasError)
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                setTrendsError('Failed to load crypto trends');
                setTweetsError('Failed to load latest tweets');
                setCasError('Failed to load CAS tokens');
            }
        };

        fetchData();
    }, []); // Empty dependency array since these functions are stable

    useEffect(() => {
        setIsMounted(true);
    }, []); // Empty dependency array since this only needs to run once

    // Ensure the component only renders after the theme is resolved and the component is mounted
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
                        {(isTrendsLoading || isTweetsLoading || isCasLoading) && (
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
            <TweetedCas tweetedCas={tweetedCas} isCasLoading={isCasLoading} casError={casError ?? ''} />
            <LatestTweets latestTweets={latestTweets} isTweetsLoading={isTweetsLoading} tweetsError={tweetsError ?? ''} />
        </>
    );
} 