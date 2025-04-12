'use client'
import * as ScrollArea from '@radix-ui/react-scroll-area';
import Link from 'next/link';

export function LatestTweets({ latestTweets, isTweetsLoading, tweetsError }: { latestTweets: any, isTweetsLoading: boolean, tweetsError: string }) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-foreground">
                Latest Tweets
            </h2>
            {tweetsError ? (
                <p className="text-sm p-4 rounded-lg bg-destructive/10 text-destructive">
                    {tweetsError}
                </p>
            ) : isTweetsLoading ? (
                <div className="flex items-center justify-center h-40">
                    <p className="text-sm animate-pulse text-muted-foreground">
                        Loading tweets...
                    </p>
                </div>
            ) : latestTweets && latestTweets.length > 0 ? (
                <ScrollArea.Root className="h-[500px] overflow-hidden rounded-lg border border-border">
                    <ScrollArea.Viewport className="h-full w-full rounded-lg">
                        <div className="space-y-4 p-4">
                            {latestTweets.map((cluster: any, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-xl p-4 bg-card hover:bg-accent transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                                                    Cluster {index + 1}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {cluster.size} tweets
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-3 flex flex-wrap gap-2">
                                                {cluster.terms.slice(0, 5).map((term: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded-full bg-secondary/20">
                                                        {term}
                                                    </span>
                                                ))}
                                                {cluster.terms.length > 5 && (
                                                    <span className="px-2 py-1 rounded-full bg-secondary/20">
                                                        +{cluster.terms.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {cluster.tweets.map((tweet: any, tweetIndex: number) => (
                                                    <div
                                                        key={tweetIndex}
                                                        className="text-sm text-muted-foreground border-l-2 pl-3 border-border hover:border-primary transition-colors duration-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="font-medium text-foreground hover:text-primary transition-colors duration-200">@{tweet.username}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(tweet.createdAt).toLocaleTimeString()}
                                                            </span>
                                                            {tweet?.url && (
                                                                <Link
                                                                    href={tweet.url}
                                                                    target="_blank"
                                                                    className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
                                                                >
                                                                    View Tweet
                                                                </Link>
                                                            )}
                                                        </div>
                                                        <p className="leading-relaxed">{tweet.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className="flex touch-none select-none bg-secondary/20 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-secondary/30 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col rounded-full"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-primary/50 hover:bg-primary before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 transition-colors duration-200" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner className="bg-secondary/20" />
                </ScrollArea.Root>
            ) : (
                <div className="flex items-center justify-center h-40">
                    <p className="text-sm text-muted-foreground">
                        No tweets available
                    </p>
                </div>
            )}
        </div>
    )
} 