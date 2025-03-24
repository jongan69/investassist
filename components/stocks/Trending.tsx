import Image from "next/image"

// Function to normalize ticker symbols
const normalizeTicker = (ticker: string) => {
    return ticker === 'FB' ? 'META' : ticker;
};

export default function TrendingStocks(data: any) {
    // console.log(data)
    const { news, highOiOptions } = data.data
    const filteredNews = news.filter((item: any) => item.symbols.length > 0)
    // console.log(filteredNews)
    // console.log(highOiOptions)
    return (
        filteredNews && highOiOptions && (
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
                                {filteredNews?.map((newsItem: any) => {
                                    // Normalize the ticker symbol before finding options
                                    const normalizedTicker = normalizeTicker(newsItem.symbols[0]);
                                    const options = highOiOptions.find((option: any) =>
                                        option?.shortTerm?.root_symbol === normalizedTicker
                                    );

                                    // Display the normalized ticker in the link
                                    const displayTicker = normalizedTicker;

                                    return (
                                        <tr key={newsItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <a href={`/stocks/${displayTicker}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {displayTicker}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-start space-x-3 items-center justify-center">
                                                    {newsItem.images && newsItem.images.length > 0 && (
                                                        <Image
                                                            src={newsItem.images.find((img: any) => img.size === "large")?.url}
                                                            alt={newsItem.headline}
                                                            width={60}
                                                            height={60}
                                                            className="rounded-md w-[60px] h-auto object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-sm">{newsItem.headline}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">By {newsItem.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {options && Object.entries(options).map(([key, optionDetails]: [string, any]) => 
                                                    options[key] ? (
                                                        <div key={key} className="mb-2">
                                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{key}</p>
                                                            <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600 dark:text-gray-400">
                                                                <p>Strike: ${optionDetails?.strike_price}</p>
                                                                <p>Close: ${optionDetails?.close_price}</p>
                                                                <p>Exp: {optionDetails?.expiration_date}</p>
                                                                <p>OI: {optionDetails?.open_interest}</p>
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
        )
    );
}