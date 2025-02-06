"use client"

import { useEffect, useState, Fragment } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { fetchCryptoTrends } from '@/lib/solana/getTrends';

export default function CryptoTrends({ data }: { data: any }) {
    const { resolvedTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    const [trends, setTrends] = useState<TrendData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // console.log(data)
    useEffect(() => {

        fetchCryptoTrends(setTrends, setIsLoading, setError);
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

                {error ? (
                    <p className={`${resolvedTheme === 'dark' ? 'text-red-400' : 'text-red-600'} leading-relaxed text-xs`}>
                        {error}
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

                                                        // Find the correct object in the data array
                                                        const cryptoData = data.find((item: any) => item.shortName.toLowerCase() === crypto.toLowerCase());

                                                        // Use yfinance price if available, otherwise use formattedPrice
                                                        const yfianncePrice = cryptoData ? cryptoData.regularMarketPrice : Number(formattedPrice);
                                                        // console.log(yfianncePrice);

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
                                                        href={`https://dexscreener.com/solana/${ticker.ca}`}
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
                                                                href={`https://dexscreener.com/solana/${activity.token_address}`}
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