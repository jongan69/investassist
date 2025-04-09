import { fetchTrendingVids } from "@/lib/tiktok/fetchTrendingVids"
import Image from "next/image"
import { formatNumber } from "@/lib/utils"
import { Suspense, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Separate the video card into its own component for better organization
function VideoCard({ vid }: { vid: any }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    return (
        <div className={cn(
            "rounded-lg shadow-md overflow-hidden",
            isDark ? "bg-gray-800" : "bg-white"
        )}>
            <div className="relative h-64 w-full">
                <Image 
                    src={vid.video.cover} 
                    alt={vid.desc || "TikTok video"} 
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-4">
                <div className="flex items-center mb-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                        <Image 
                            src={vid.author.avatarLarger} 
                            alt={vid.author.nickname} 
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                        )}>{vid.author.nickname}</h3>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                        )}>{vid.author.signature}</p>
                    </div>
                </div>
                
                <p className={cn(
                    "text-sm mb-3 line-clamp-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                )}>{vid.desc}</p>
                
                <div className="flex justify-between text-sm">
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>
                        <span className="font-medium">{formatNumber(vid.stats.playCount)}</span> plays
                    </div>
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>
                        <span className="font-medium">{formatNumber(vid.stats.diggCount)}</span> likes
                    </div>
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>
                        <span className="font-medium">{formatNumber(vid.stats.commentCount)}</span> comments
                    </div>
                </div>
                
                {vid.challenges && vid.challenges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {vid.challenges.map((challenge: any) => (
                            <span key={challenge.id} className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                            )}>
                                #{challenge.title}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Loading component
function LoadingVideos() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    return (
        <div className="container mx-auto py-8">
            <h1 className={cn(
                "text-3xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
            )}>Trending TikTok Videos</h1>
            <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={cn(
                            "rounded-lg shadow-md overflow-hidden animate-pulse",
                            isDark ? "bg-gray-800" : "bg-white"
                        )}>
                            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="p-4">
                                <div className="flex items-center mb-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                                    <div>
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700"></div>
                                    </div>
                                </div>
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 mb-3"></div>
                                <div className="flex justify-between">
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Error component
function ErrorVideos() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    return (
        <div className="container mx-auto py-8">
            <h1 className={cn(
                "text-3xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
            )}>Trending TikTok Videos</h1>
            <div className={cn(
                "p-8 rounded-lg text-center",
                isDark ? "bg-red-900/30" : "bg-red-50"
            )}>
                <p className={cn(
                    "text-lg",
                    isDark ? "text-red-400" : "text-red-600"
                )}>Failed to load trending videos. Please try again later.</p>
            </div>
        </div>
    );
}

// Empty state component
function EmptyVideos() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    return (
        <div className="container mx-auto py-8">
            <h1 className={cn(
                "text-3xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
            )}>Trending TikTok Videos</h1>
            <div className={cn(
                "p-8 rounded-lg text-center",
                isDark ? "bg-gray-800" : "bg-gray-100"
            )}>
                <p className={cn(
                    "text-lg",
                    isDark ? "text-gray-400" : "text-gray-600"
                )}>No trending videos available at the moment.</p>
            </div>
        </div>
    );
}

// Client-side component that fetches data
function TrendingVideosClient() {
    const [trendingVids, setTrendingVids] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched) return;
            
            try {
                setIsLoading(true);
                const data = await fetchTrendingVids();
                setTrendingVids(data);
                setHasFetched(true);
            } catch (err) {
                console.error("Error fetching trending videos:", err);
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [hasFetched]);

    if (isLoading) {
        return <LoadingVideos />;
    }

    if (error) {
        return <ErrorVideos />;
    }

    if (!trendingVids || trendingVids.length === 0) {
        return <EmptyVideos />;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className={cn(
                "text-3xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
            )}>Trending TikTok Videos</h1>
            <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingVids.map((vid: any) => (
                        <VideoCard key={vid.id} vid={vid} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Main component with Suspense
export default function TrendingVideos() {
    return (
        <Suspense fallback={<LoadingVideos />}>
            <TrendingVideosClient />
        </Suspense>
    );
}