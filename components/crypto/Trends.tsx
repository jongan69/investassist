"use client"

import { useEffect, useState, Fragment, useRef } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { fetchCryptoTrends } from '@/lib/solana/fetchTrends';
import { fetchLatestTweets } from '@/lib/twitter/fetchLatestTweets';
import { fetchTweetedCas } from '@/lib/twitter/fetchTweetedCas';

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
        <motion.div
            className={cn(
                "group relative overflow-hidden rounded-xl",
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
                        <div className="prose prose-sm prose-invert max-w-full py-1">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className={`bg-${resolvedTheme === 'dark' ? 'gray-700' : 'gray-50'}`}>
                                    <tr>
                                        <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase`}>Crypto</th>
                                        <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase`}>Averaged Price</th>
                                    </tr>
                                </thead>
                                <tbody className={`bg-${resolvedTheme === 'dark' ? 'gray-800' : 'white'} divide-y divide-gray-200`}>
                                    {['Bitcoin', 'Ethereum', 'Solana'].map((crypto) => (
                                        <tr key={crypto}>
                                            <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium text-${resolvedTheme === 'dark' ? 'white' : 'gray-900'}`}>{crypto}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-xs text-${resolvedTheme === 'dark' ? 'gray-400' : 'gray-500'}`}>
                                                ${(() => {
                                                    try {
                                                        const price = trends[`${crypto.toLowerCase()}Price` as keyof TrendData] as string;
                                                        const formattedPrice = Number(price.replace(",", "")).toFixed(2);
                                                        const cryptoData = data.find((item: any) => item.shortName.toLowerCase() === crypto.toLowerCase());
                                                        const yfianncePrice = cryptoData ? cryptoData.regularMarketPrice : Number(formattedPrice);
                                                        const averagePrice = (Number(formattedPrice) + yfianncePrice) / 2;
                                                        return averagePrice.toFixed(2);
                                                    } catch (e) {
                                                        return 'N/A';
                                                    }
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Latest Tweets Section */}
                        <div className="prose prose-sm prose-invert max-w-full py-1">
                            <h1 className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed font-bold`}>
                                Latest Tweets
                            </h1>
                            {tweetsError ? (
                                <p className={`${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'} leading-relaxed text-xs`}>
                                    {tweetsError}
                                </p>
                            ) : isTweetsLoading ? (
                                <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed text-xs`}>
                                    Loading tweets...
                                </p>
                            ) : latestTweets && latestTweets.length > 0 ? (
                                <div className="space-y-3 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                    {latestTweets.map((cluster: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg p-3 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} hover:bg-gray-700/50 transition-colors`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                                                            Cluster {index + 1}
                                                        </span>
                                                        <span className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {cluster.size} tweets
                                                        </span>
                                                    </div>
                                                    <div className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                                                        Terms: {cluster.terms.slice(0, 5).join(', ')}
                                                        {cluster.terms.length > 5 && ` +${cluster.terms.length - 5} more`}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {cluster.tweets.map((tweet: any, tweetIndex: number) => (
                                                            <div
                                                                key={tweetIndex}
                                                                className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} border-l-2 pl-2 border-gray-600`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium">@{tweet.username}</span>
                                                                    <span className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {new Date(tweet.createdAt).toLocaleTimeString()}
                                                                    </span>
                                                                </div>
                                                                <p>{tweet.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed text-xs`}>
                                    No tweets available
                                </p>
                            )}
                        </div>

                        {trends.topTweetedTickers.length > 0 && (
                            <div className="prose prose-sm prose-invert max-w-full py-1">
                                <h1 className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed font-bold`}>
                                    Top Tweeted Cryptos
                                </h1>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className={`bg-${resolvedTheme === 'dark' ? 'gray-700' : 'gray-50'}`}>
                                        <tr>
                                            <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase`}>Ticker</th>
                                            <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase`}>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`bg-${resolvedTheme === 'dark' ? 'gray-800' : 'white'} divide-y divide-gray-200 relative z-10`}>
                                        {trends.topTweetedTickers.map((ticker: any) => (
                                            <tr key={ticker.ticker} className="group">
                                                <td colSpan={2} className="p-0">
                                                    <Link
                                                        href={`/coins/${ticker.ticker.replace(/\$/g, '')}`}
                                                        // href={`https://dexscreener.com/solana/${ticker.ca}`}
                                                        className="block w-full relative z-10"
                                                        target="_blank"
                                                    >
                                                        <div className="flex cursor-pointer hover:bg-gray-700/50 transition-colors">
                                                            <div className={`px-4 py-2 whitespace-nowrap text-xs font-medium text-${resolvedTheme === 'dark' ? 'white' : 'gray-900'} w-1/2`}>
                                                                {ticker.ticker}
                                                            </div>
                                                            <div className={`px-4 py-2 whitespace-nowrap text-xs text-${resolvedTheme === 'dark' ? 'gray-400' : 'gray-500'} w-1/2`}>
                                                                {ticker.count}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="prose prose-sm prose-invert max-w-full py-1">
                            <h1 className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed font-bold`}>
                                Whale Activity
                            </h1>
                            {['bullish', 'bearish'].map((type, index) => (
                                <Fragment key={type}>
                                    {index === 1 && (
                                        <div className={`my-4 h-1 ${resolvedTheme === 'dark' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    )}
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className={`bg-${resolvedTheme === 'dark' ? 'gray-700' : 'gray-50'}`}>
                                            <tr>
                                                <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase w-1/3`}>Symbol</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase w-1/3`}>Name</th>
                                                <th className={`px-4 py-2 text-left text-xs font-medium text-${resolvedTheme === 'dark' ? 'gray-300' : 'gray-500'} uppercase w-1/3`}>{`${type.charAt(0).toUpperCase() + type.slice(1)} Score`}</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`bg-${resolvedTheme === 'dark' ? 'gray-800' : 'white'} divide-y divide-gray-200`}>
                                            {trends.whaleActivity[type as 'bullish' | 'bearish'].map((activity: WhaleActivity) => {
                                                const score = (type === 'bullish' ? activity.bullishScore : activity.bearishScore) ?? 0;
                                                const scoreColor = type === 'bullish'
                                                    ? `hsl(120, ${Math.min(100, score * 1.2)}%, 50%)` // Always green
                                                    : `hsl(0, ${Math.min(100, score * 1.2)}%, 50%)`; // Always red

                                                return (
                                                    <tr key={activity.symbol} className="group">
                                                        <td colSpan={3} className="p-0">
                                                            <Link
                                                                href={`/coins/${activity.symbol}?ca=${activity.token_address}`}
                                                                // href={`https://dexscreener.com/solana/${activity.token_address}`}
                                                                className="block w-full relative z-10"
                                                                target="_blank"
                                                            >
                                                                <div className="flex hover:bg-gray-700/50 transition-colors">
                                                                    <div className={`px-4 py-2 whitespace-nowrap text-xs font-medium text-${resolvedTheme === 'dark' ? 'white' : 'gray-900'} w-1/3`}>
                                                                        {activity.symbol}
                                                                    </div>
                                                                    <div className={`px-4 py-2 whitespace-nowrap text-xs text-${resolvedTheme === 'dark' ? 'gray-400' : 'gray-500'} w-1/3`}>
                                                                        <span className="block truncate sm:text-clip">
                                                                            {activity.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`px-4 py-2 whitespace-nowrap text-xs w-1/3 text-center`} style={{ color: scoreColor }}>
                                                                        {score}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </Fragment>
                            ))}
                        </div>

                        {/* Tweeted CAS Section */}
                        <div className="prose prose-sm prose-invert max-w-full py-1">
                            <h1 className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed font-bold`}>
                                Tweeted CAS Tokens
                            </h1>
                            {casError ? (
                                <p className={`${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'} leading-relaxed text-xs`}>
                                    {casError}
                                </p>
                            ) : isCasLoading ? (
                                <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed text-xs`}>
                                    Loading CAS tokens...
                                </p>
                            ) : tweetedCas && tweetedCas.length > 0 ? (
                                <div className="space-y-3 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                    {tweetedCas.map((cas: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg p-3 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} hover:bg-gray-700/50 transition-colors`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            {cas.tokenInfo ? (
                                                                <>
                                                                    <span className={`text-xs font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                                                                        {cas.tokenInfo.name} ({cas.tokenInfo.symbol})
                                                                    </span>
                                                                    <div className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        ${cas.tokenInfo.price} | MC: ${cas.tokenInfo.marketCap.toLocaleString()}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className={`text-xs font-medium ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}>
                                                                    {cas.address.slice(0, 6)}...{cas.address.slice(-4)}
                                                                </span>
                                                            )}
                                                            <div className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {cas.count} tweets
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {cas.tweets.map((tweet: any, tweetIndex: number) => (
                                                            <div
                                                                key={tweetIndex}
                                                                className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} border-l-2 pl-2 border-gray-600`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium">@{tweet.username}</span>
                                                                    <span className={`text-xs ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {new Date(tweet.createdAt).toLocaleTimeString()}
                                                                    </span>
                                                                    {tweet?.url && (
                                                                        <Link href={tweet.url} target="_blank" className={`text-xs ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                            View
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                                <p>{tweet.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed text-xs`}>
                                    No CAS tokens available
                                </p>
                            )}
                        </div>
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
    );
} 