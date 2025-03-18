'use client'
import { useTheme } from 'next-themes';
import * as ScrollArea from '@radix-ui/react-scroll-area';

export function LatestTweets({ latestTweets, isTweetsLoading, tweetsError }: { latestTweets: any, isTweetsLoading: boolean, tweetsError: string }) {
    const { resolvedTheme } = useTheme();
    return (
        <div className="h-[600px] flex flex-col pt-6">
            <h1 className="text-xl font-bold mb-6 text-foreground">
                Latest Tweets
            </h1>
            {tweetsError ? (
                <p className="text-sm p-4 rounded-lg bg-destructive/10 text-destructive">
                    {tweetsError}
                </p>
            ) : isTweetsLoading ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm animate-pulse text-muted-foreground">
                        Loading tweets...
                    </p>
                </div>
            ) : latestTweets && latestTweets.length > 0 ? (
                <ScrollArea.Root className="flex-1 overflow-hidden rounded-lg border border-border">
                    <ScrollArea.Viewport className="size-full rounded-lg">
                        <div className="space-y-4 p-6">
                            {latestTweets.map((cluster: any, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-xl p-4 bg-card hover:bg-accent transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground">
                                                    Cluster {index + 1}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {cluster.size} tweets
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-3 flex flex-wrap gap-2">
                                                {cluster.terms.slice(0, 5).map((term: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded-full bg-muted">
                                                        {term}
                                                    </span>
                                                ))}
                                                {cluster.terms.length > 5 && (
                                                    <span className="px-2 py-1 rounded-full bg-muted">
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
                                                            <span className="font-medium hover:text-primary transition-colors duration-200">@{tweet.username}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(tweet.createdAt).toLocaleTimeString()}
                                                            </span>
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
                        className="flex touch-none select-none bg-muted p-0.5 transition-colors duration-[160ms] ease-out hover:bg-accent data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col rounded-full"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-muted-foreground hover:bg-primary before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 transition-colors duration-200" />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner className="bg-muted" />
                </ScrollArea.Root>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                        No tweets available
                    </p>
                </div>
            )}
        </div>
    )
} 