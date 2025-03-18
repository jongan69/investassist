'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes';
import { Fragment } from 'react';

export function WhaleActivity({ trends }: { trends: any }) {
    const { resolvedTheme } = useTheme();
    {/* Whale Activity Section */ }
    return (
        <div className="prose prose-sm prose-invert max-w-full py-4">
            <h1 className="text-xl font-bold mb-6 text-foreground">
                Whale Activity
            </h1>
            {['bullish', 'bearish'].map((type, index) => (
                <Fragment key={type}>
                    {index === 1 && (
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 text-xs font-medium bg-background text-muted-foreground">
                                    Bearish Activity
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Symbol</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">{`${type.charAt(0).toUpperCase() + type.slice(1)} Score`}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                {trends.whaleActivity[type as 'bullish' | 'bearish'].map((activity: WhaleActivity) => {
                                    const score = (type === 'bullish' ? activity.bullishScore : activity.bearishScore) ?? 0;
                                    const scoreColor = type === 'bullish'
                                        ? `hsl(120, ${Math.min(100, score * 1.2)}%, 50%)`
                                        : `hsl(0, ${Math.min(100, score * 1.2)}%, 50%)`;

                                    return (
                                        <tr key={activity.symbol} className="group">
                                            <td colSpan={3} className="p-0">
                                                <Link
                                                    href={`/coins/${activity.symbol}?ca=${activity.token_address}`}
                                                    className="block w-full relative z-10"
                                                    target="_blank"
                                                >
                                                    <div className="flex hover:bg-accent transition-colors duration-150">
                                                        <div className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground w-1/3">
                                                            {activity.symbol}
                                                        </div>
                                                        <div className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground w-1/3">
                                                            <span className="block truncate sm:text-clip">
                                                                {activity.name}
                                                            </span>
                                                        </div>
                                                        <div className="px-4 py-3 whitespace-nowrap text-sm w-1/3">
                                                            <span 
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                                                                style={{ 
                                                                    backgroundColor: type === 'bullish' 
                                                                        ? 'rgb(34 197 94)' // solid green
                                                                        : 'rgb(239 68 68)', // solid red
                                                                    color: 'white',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
                                                            >
                                                                {score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Fragment>
            ))}
        </div>
    )
} 