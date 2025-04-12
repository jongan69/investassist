'use client'
import Link from 'next/link'

export function TopTweeted({ trends }: { trends: any }) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-foreground">
                Top Tweeted
            </h2>
            <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary/20">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/2">Symbol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/2">Count</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {trends?.topTweetedTickers?.map((item: any) => (
                            <tr key={item.ticker} className="group">
                                <td colSpan={2} className="p-0">
                                    <Link
                                        href={`/coins/${item.ticker.replace(/\$/g, '')}?ca=${item.ca}`}
                                        className="block w-full relative z-10"
                                        target="_blank"
                                    >
                                        <div className="flex hover:bg-accent transition-colors duration-150">
                                            <div className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground w-1/2">
                                                {item.ticker}
                                            </div>
                                            <div className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground w-1/2">
                                                {item.count}
                                            </div>
                                        </div>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}