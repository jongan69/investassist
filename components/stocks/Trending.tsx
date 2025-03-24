import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NewsItemCard } from "./NewsItemCard"
import { Skeleton } from "@/components/ui/skeleton"

// Function to normalize ticker symbols
const normalizeTicker = (ticker: string) => {
    return ticker === 'FB' ? 'META' : ticker;
};

interface TrendingStocksProps {
    data: {
        news: Array<{
            id: string;
            headline: string;
            author: string;
            symbols: string[];
            images?: Array<{
                size: string;
                url: string;
            }>;
        }>;
        highOiOptions: Array<{
            shortTerm?: {
                root_symbol: string;
                strike_price: number;
                close_price: number;
                expiration_date: string;
                open_interest: number;
            };
            mediumTerm?: {
                root_symbol: string;
                strike_price: number;
                close_price: number;
                expiration_date: string;
                open_interest: number;
            };
            longTerm?: {
                root_symbol: string;
                strike_price: number;
                close_price: number;
                expiration_date: string;
                open_interest: number;
            };
        }>;
    };
    isLoading?: boolean;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3 p-3 max-w-xl mx-auto">
            {[...Array(5)].map((_, i) => (
                <Card key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center">
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <div className="flex justify-center">
                                <div className="flex flex-col gap-1.5 items-center">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2.5 w-16" />
                                    <Skeleton className="h-[60px] w-[60px] rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-lg">
                                        <Skeleton className="h-3 w-16 mb-1" />
                                        <div className="grid grid-cols-2 gap-x-3">
                                            {[...Array(4)].map((_, k) => (
                                                <Skeleton key={k} className="h-2.5 w-12" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function TrendingStocks({ data, isLoading = false }: TrendingStocksProps) {
    if (isLoading) {
        return (
            <Card className="rounded-md border-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                        Trending Stocks with High Open Interest
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] rounded-md border border-none">
                        <div className="p-4 space-x-4">
                            <LoadingSkeleton />
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.news || !data.highOiOptions) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        No trending stocks data available at the moment.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { news, highOiOptions } = data;
    const filteredNews = news.filter((item) => item.symbols && item.symbols.length > 0);

    if (filteredNews.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        No trending stocks with news available at the moment.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-md border-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                    Trending Stocks with High Open Interest
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea 
                    className="h-[500px] rounded-md border border-none"
                    role="region"
                    aria-label="Trending stocks list"
                >
                    <div className="p-4">
                        <div className="space-y-4">
                            {filteredNews.map((newsItem) => {
                                const normalizedTicker = normalizeTicker(newsItem.symbols[0]);
                                const options = highOiOptions.find((option) =>
                                    option?.shortTerm?.root_symbol === normalizedTicker
                                );

                                return (
                                    <NewsItemCard
                                        key={newsItem.id}
                                        newsItem={newsItem}
                                        options={options || {}}
                                        normalizedTicker={normalizedTicker}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}