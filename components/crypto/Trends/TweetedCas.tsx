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
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">
                Tweeted Contract Addresses
            </h2>
            {casError ? (
                <p className="text-sm p-3 sm:p-4 rounded-lg bg-destructive/10 text-destructive">
                    {casError}
                </p>
            ) : isCasLoading ? (
                <p className="text-sm animate-pulse text-muted-foreground p-3 sm:p-4">
                    Loading Contract Addresses...
                </p>
            ) : tweetedCas && tweetedCas.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-secondary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50 transition-all">
                    {tweetedCas.map((cas: any, index: number) => (
                        <div
                            key={index}
                            className="rounded-xl p-3 sm:p-4 bg-card hover:bg-accent transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        {cas.tokenInfo ? (
                                            <>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {cas.tokenInfo.name} ({cas.tokenInfo.symbol})
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                                                        ${cas.tokenInfo.price}
                                                    </span>
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                                                        MC: ${cas?.tokenInfo?.marketCap?.toLocaleString() ?? 'N/A'}
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
                                <div className="rounded-lg bg-secondary/20 p-2 sm:p-3 space-y-2 sm:space-y-3">
                                    {cas.tweets.map((tweet: any, tweetIndex: number) => (
                                        <div
                                            key={tweetIndex}
                                            className="text-sm text-muted-foreground border-l-2 pl-2 sm:pl-3 border-border hover:border-primary transition-colors duration-200"
                                        >
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <span className="font-semibold text-foreground hover:text-primary transition-colors">@{tweet.username}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(tweet.createdAt).toLocaleTimeString()}
                                                </span>
                                                <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                                                    {tweet?.url && (
                                                        <Link
                                                            href={tweet.url}
                                                            target="_blank"
                                                            className="text-xs font-medium px-2 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                                                        >
                                                            View Link
                                                        </Link>
                                                    )}
                                                    {cas.tokenInfo ? (
                                                        <Link
                                                            href={`/coins/${cas.tokenInfo.symbol}?ca=${cas.tokenInfo.contractAddress}`}
                                                            target="_blank"
                                                            className="text-xs font-medium px-2 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                                                        >
                                                            View Coin
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href={`https://solscan.io/address/${cas.address}`}
                                                            target="_blank"
                                                            className="text-xs font-medium px-2 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                                                        >
                                                            View Address
                                                        </Link>
                                                    )}
                                                </div>
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
                <p className="text-sm text-muted-foreground p-3 sm:p-4">
                    No Contract Addresses available
                </p>
            )}
        </div>
    )
} 