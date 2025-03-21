'use client'
import Link from 'next/link'

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const truncateAddressesInText = (text: string) => {
    // Match Solana addresses (base58 encoded, typically 32-44 characters)
    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    return text.replace(addressRegex, (address) => truncateAddress(address));
};

export function TweetedCas({ tweetedCas, isCasLoading, casError }: { tweetedCas: any, isCasLoading: boolean, casError: string }) {
    {/* Tweeted CAS Section */ }
    return (
        <div className="prose prose-sm prose-invert max-w-full py-1">
            <h1 className="text-xl font-bold mb-4 tracking-tight text-foreground">
                Tweeted Contract Addresses
            </h1>
            {casError ? (
                <p className="leading-relaxed text-sm font-medium text-destructive">
                    {casError}
                </p>
            ) : isCasLoading ? (
                <p className="leading-relaxed text-sm animate-pulse text-muted-foreground">
                    Loading CAS tokens...
                </p>
            ) : tweetedCas && tweetedCas.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent hover:scrollbar-thumb-primary transition-all">
                    {tweetedCas.map((cas: any, index: number) => (
                        <div
                            key={index}
                            className="rounded-xl p-4 bg-card hover:bg-accent transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        {cas.tokenInfo ? (
                                            <>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {cas.tokenInfo.name} ({cas.tokenInfo.symbol})
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-green-500">
                                                        ${cas.tokenInfo.price}
                                                    </span>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-blue-500">
                                                        MC: ${cas.tokenInfo.marketCap.toLocaleString()}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-sm font-medium text-foreground">
                                                {truncateAddress(cas.address)}
                                            </span>
                                        )}
                                        <div className="text-xs font-medium text-muted-foreground">
                                            {cas.count} tweets
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted p-3 space-y-3">
                                    {cas.tweets.map((tweet: any, tweetIndex: number) => (
                                        <div
                                            key={tweetIndex}
                                            className="text-sm text-muted-foreground border-l-2 pl-3 border-border hover:border-primary transition-colors duration-200"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold hover:text-primary transition-colors">@{tweet.username}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(tweet.createdAt).toLocaleTimeString()}
                                                </span>
                                                {tweet?.url && (
                                                    <Link
                                                        href={tweet.url}
                                                        target="_blank"
                                                        className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-primary hover:bg-accent transition-colors duration-200"
                                                    >
                                                        View Link
                                                    </Link>
                                                )}
                                                {cas.tokenInfo ? (
                                                    <Link
                                                        href={`/coins/${cas.tokenInfo.symbol}?ca=${cas.tokenInfo.contractAddress}`}
                                                        target="_blank"
                                                        className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-primary hover:bg-accent transition-colors duration-200"
                                                    >
                                                        View Coin
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`https://solscan.io/address/${cas.address}`}
                                                        target="_blank"
                                                        className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-primary hover:bg-accent transition-colors duration-200"
                                                    >
                                                        View Address
                                                    </Link>
                                                )}
                                            </div>
                                            <p className="leading-relaxed">{truncateAddressesInText(tweet.text)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="leading-relaxed text-sm text-muted-foreground">
                    No CAS tokens available
                </p>
            )}
        </div>
    )
} 