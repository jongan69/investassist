import { fetchTrendingVids } from "@/lib/tiktok/fetchTrendingVids"
import Image from "next/image"
import { formatNumber } from "@/lib/utils/utils"
import { Suspense, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils/utils"

// Separate the video card into its own component for better organization
function VideoCard({ vid }: { vid: any }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    
    // Function to handle card click and open the video
    const handleCardClick = () => {
        if (vid.video && vid.video.playAddr) {
            window.open(`https://www.tiktok.com/@${vid.author.uniqueId}/video/${vid.id}`, '_blank');
        }
    };
    
    return (
        <div 
            className="w-full rounded-xl border bg-card p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50"
            onClick={handleCardClick}
        >
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative aspect-video md:w-1/3 rounded-lg overflow-hidden">
                    <Image 
                        src={vid.video.cover} 
                        alt={vid.desc || "TikTok video"} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="flex-grow flex flex-col md:w-2/3">
                    <div className="flex items-center mb-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                            <Image 
                                src={vid.author.avatarLarger} 
                                alt={vid.author.nickname} 
                                fill
                                className="object-cover"
                                sizes="32px"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{vid.author.nickname}</h3>
                            <p className="text-xs text-muted-foreground truncate">{vid.author.signature}</p>
                        </div>
                    </div>
                    
                    <p className="text-xs mb-2 line-clamp-2 flex-grow text-muted-foreground">{vid.desc}</p>
                    
                    <div className="flex justify-between text-xs mt-auto">
                        <div className="text-muted-foreground">
                            <span className="font-medium">{formatNumber(vid.stats.playCount)}</span> plays
                        </div>
                        <div className="text-muted-foreground">
                            <span className="font-medium">{formatNumber(vid.stats.diggCount)}</span> likes
                        </div>
                        <div className="text-muted-foreground">
                            <span className="font-medium">{formatNumber(vid.stats.commentCount)}</span> comments
                        </div>
                    </div>
                    
                    {vid.challenges && vid.challenges.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {vid.challenges.map((challenge: any) => (
                                <span key={challenge.id} className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                    #{challenge.title}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Loading component
function LoadingVideos() {
    return (
        <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
            <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Trending TikTok Videos</h1>
            <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-full rounded-xl border bg-card p-4 shadow-md animate-pulse">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="aspect-video md:w-1/3 bg-secondary rounded-lg"></div>
                                <div className="flex-grow md:w-2/3">
                                    <div className="flex items-center mb-2">
                                        <div className="h-8 w-8 rounded-full bg-secondary mr-2 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-24 bg-secondary mb-1"></div>
                                            <div className="h-2 w-32 bg-secondary"></div>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary mb-1"></div>
                                    <div className="h-2 w-3/4 bg-secondary mb-2"></div>
                                    <div className="flex justify-between">
                                        <div className="h-2 w-12 bg-secondary"></div>
                                        <div className="h-2 w-12 bg-secondary"></div>
                                        <div className="h-2 w-12 bg-secondary"></div>
                                    </div>
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
    return (
        <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
            <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Trending TikTok Videos</h1>
            <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-red-50 dark:bg-red-900/30">
                <p className="text-base text-red-600 dark:text-red-400">Failed to load trending videos. Please try again later.</p>
            </div>
        </div>
    );
}

// Empty state component
// function EmptyVideos() {
//     return (
//         <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
//             <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Trending TikTok Videos</h1>
//             <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-gray-100 dark:bg-black">
//                 <p className="text-base text-gray-600 dark:text-gray-400">No trending videos available at the moment.</p>
//             </div>
//         </div>
//     );
// }

// Client-side component that fetches data
function TrendingVideosClient() {
    const [trendingVids, setTrendingVids] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

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
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
            <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Trending TikTok Videos</h1>
            <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
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