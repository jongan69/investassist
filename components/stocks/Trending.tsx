import Image from "next/image"

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
}

export default function TrendingStocks({ data }: TrendingStocksProps) {
    if (!data || !data.news || !data.highOiOptions) {
        return (
            <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    No trending stocks data available at the moment.
                </div>
            </div>
        );
    }

    const { news, highOiOptions } = data;
    const filteredNews = news.filter((item) => item.symbols && item.symbols.length > 0);

    if (filteredNews.length === 0) {
        return (
            <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    No trending stocks with news available at the moment.
                </div>
            </div>
        );
    }

    return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            <h1 className="text-center text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">Trending Stocks with High Open Interest</h1>
            <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
                <div className="max-h-[1000px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">News</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Options Data</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-black divide-y divide-gray-300 dark:divide-gray-700">
                            {filteredNews.map((newsItem) => {
                                const normalizedTicker = normalizeTicker(newsItem.symbols[0]);
                                const options = highOiOptions.find((option) =>
                                    option?.shortTerm?.root_symbol === normalizedTicker
                                );

                                return (
                                    <tr key={newsItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <a href={`/stocks/${normalizedTicker}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                {normalizedTicker}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-start space-x-3 items-center justify-center">
                                                {newsItem.images && newsItem.images.length > 0 && (
                                                    <Image
                                                        src={newsItem.images.find((img) => img.size === "large")?.url || ''}
                                                        alt={newsItem.headline}
                                                        width={100}
                                                        height={100}
                                                        className="rounded-lg object-cover"
                                                        loading="lazy"
                                                        placeholder="blur"
                                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z2Rlc2MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPbWAAEAAAAA0y1tbHVjAAAAAAAAAAAAAAAAAAAEZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiSk46NjU1VkRARkA6QkA6QED/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{newsItem.headline}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">By {newsItem.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {options && Object.entries(options).map(([key, optionDetails]) => 
                                                optionDetails ? (
                                                    <div key={key} className="mb-2">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{key}</p>
                                                        <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600 dark:text-gray-400">
                                                            <p>Strike: ${optionDetails.strike_price}</p>
                                                            <p>Close: ${optionDetails.close_price}</p>
                                                            <p>Exp: {optionDetails.expiration_date}</p>
                                                            <p>OI: {optionDetails.open_interest}</p>
                                                        </div>
                                                    </div>
                                                ) : null
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}