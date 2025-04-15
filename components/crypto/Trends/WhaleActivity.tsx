'use client'
import Link from 'next/link'
import { Fragment } from 'react';

export function WhaleActivity({ trends }: { trends: any }) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-4 sm:p-6 mt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">
                Whale Activity
            </h2>
            {['bullish', 'bearish'].map((type, index) => (
                <Fragment key={type}>
                    {index === 1 && (
                        <div className="relative my-6 sm:my-8">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 text-xs font-medium bg-card text-muted-foreground">
                                    Bearish Activity
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-secondary/20">
                                    <tr>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Symbol</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Name</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">{`${type.charAt(0).toUpperCase() + type.slice(1)} Score`}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {trends.whaleActivity[type as 'bullish' | 'bearish'].map((activity: WhaleActivity) => {
                                        const score = (type === 'bullish' ? activity.bullishScore : activity.bearishScore) ?? 0;
                                        return (
                                            <tr key={activity.symbol} className="group">
                                                <td colSpan={3} className="p-0">
                                                    <Link
                                                        href={`/coins/${activity.symbol}?ca=${activity.token_address}`}
                                                        className="block w-full relative z-10"
                                                        target="_blank"
                                                    >
                                                        <div className="flex hover:bg-accent transition-colors duration-150">
                                                            <div className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-foreground w-1/3">
                                                                {activity.symbol}
                                                            </div>
                                                            <div className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-muted-foreground w-1/3">
                                                                <span className="block truncate max-w-[80px] sm:max-w-full">
                                                                    {activity.name}
                                                                </span>
                                                            </div>
                                                            <div className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm w-1/3">
                                                                <span 
                                                                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold"
                                                                    style={{ 
                                                                        backgroundColor: type === 'bullish' 
                                                                            ? 'rgb(34 197 94 / 0.1)' // green with opacity
                                                                            : 'rgb(239 68 68 / 0.1)', // red with opacity
                                                                        color: type === 'bullish' 
                                                                            ? 'rgb(34 197 94)' // green
                                                                            : 'rgb(239 68 68)', // red
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
                    </div>
                </Fragment>
            ))}
        </div>
    )
} 