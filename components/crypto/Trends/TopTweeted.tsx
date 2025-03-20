import { useTheme } from 'next-themes';
import { Link } from 'next-view-transitions';

export function TopTweeted({ trends }: { trends: any }) {
    const { resolvedTheme } = useTheme();
    return (
        trends && trends.topTweetedTickers && trends.topTweetedTickers.length > 0 && (
            <div className="prose prose-sm prose-invert max-w-full py-4">
                <h1 className="text-lg font-semibold mb-4 text-foreground">
                    Top Tweeted Cryptos
                </h1>
                <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Ticker</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {trends.topTweetedTickers.map((ticker: any) => (
                                <tr key={ticker.ticker} className="group">
                                    <td colSpan={2} className="p-0">
                                        <Link
                                            href={`/coins/${ticker.ticker.replace(/\$/g, '')}`}
                                            // href={`https://dexscreener.com/solana/${ticker.ca}`}
                                            className="block w-full relative z-10"
                                            target="_blank"
                                        >
                                            <div className="flex cursor-pointer hover:bg-accent transition-colors duration-150">
                                                <div className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground w-1/2">
                                                    {ticker.ticker}
                                                </div>
                                                <div className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground w-1/2">
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
            </div>
        )
    )
}