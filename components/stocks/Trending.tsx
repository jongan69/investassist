import Image from "next/image"

export default function TrendingStocks(data: any) {
    console.log(data)
    const { news, highOiOptions } = data.data
    return (
        news && highOiOptions && (
            <div className="p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
                <h1 className="text-center text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">Trending Stocks with High Open Interest</h1>
                <div className="flex flex-wrap justify-center">
                    {news?.map((newsItem: any) => {
                        // Find the corresponding options for the news item
                        const options = highOiOptions.find((option: any) =>
                            option.shortTerm.root_symbol === newsItem.symbols[0]
                        );

                        return (
                            <a href={`/stocks/${newsItem.symbols[0]}`} target="_blank" rel="noopener noreferrer" key={newsItem.id} className="block text-inherit transition-transform duration-200">
                                <div className="border border-gray-300 dark:border-black-700 rounded-lg m-2 p-3 w-64 shadow-md bg-white dark:bg-black transition-shadow duration-300 hover:shadow-lg">
                                    <h2 className="text-md font-semibold mb-1 text-black dark:text-white truncate whitespace-nowrap overflow-hidden">{newsItem.headline}</h2>
                                    <p className="text-xs mb-1 text-gray-600 dark:text-gray-400">Author: {newsItem.author}</p>
                                    {/* Display the large image for the news item */}
                                    {/* {newsItem.images && newsItem.images.length > 0 && (
                                        <Image
                                            src={newsItem.images.find((img: any) => img.size === "large")?.url}
                                            alt={newsItem.headline}
                                            width={80}
                                            height={80}
                                            className="rounded-md mt-1"
                                        />
                                    )} */}
                                    {options && (
                                        <div className="mt-2">
                                            {Object.entries(options).map(([key, optionDetails]: [string, any]) => 
                                                options[key] ? (
                                                    <div key={key} className="mb-2">
                                                        <h3 className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200 capitalize">{key} Options</h3>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Name: {optionDetails?.name}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Expiration Date: {optionDetails?.expiration_date}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Close Price: {optionDetails?.close_price}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Strike Price: {optionDetails?.strike_price}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">Open Interest: {optionDetails?.open_interest}</p>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        )
    );
}