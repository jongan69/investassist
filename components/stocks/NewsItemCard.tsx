import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NewsItemCardProps {
    newsItem: {
        id: string;
        headline: string;
        author: string;
        symbols: string[];
        images?: Array<{
            size: string;
            url: string;
        }>;
    };
    options: {
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
    };
    normalizedTicker: string;
}

export function NewsItemCard({ newsItem, options, normalizedTicker }: NewsItemCardProps) {
    return (
        <Card 
            key={newsItem.id} 
            className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150"
            role="article"
            aria-label={`News about ${normalizedTicker}`}
        >
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stock Symbol */}
                    <div className="flex items-center">
                        <a 
                            href={`/stocks/${normalizedTicker}`} 
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            aria-label={`View details for ${normalizedTicker}`}
                        >
                            {normalizedTicker}
                        </a>
                    </div>

                    {/* News Content */}
                    <div className="flex space-x-3">
                        <div className="flex flex-col gap-2 w-full items-center">
                            <div>
                                <p className="font-medium text-sm">{newsItem.headline}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">By {newsItem.author}</p>
                            </div>
                            {newsItem.images && newsItem.images.length > 0 && (
                                <div className="relative">
                                    <Image
                                        src={newsItem.images.find((img) => img.size === "large")?.url || ''}
                                        alt={`News image for ${newsItem.headline}`}
                                        width={100}
                                        height={100}
                                        className="rounded-lg object-cover w-auto h-auto"
                                        placeholder="blur"
                                        priority={false}
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiS0hLPVBVW1xbOEVJW1L/2wBDARUXFx4aHjshITtLQktLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options Data */}
                    <div className="space-y-2">
                        {options && Object.entries(options).map(([key, optionDetails]) =>
                            optionDetails ? (
                                <TooltipProvider key={key}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg cursor-help">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{key}</p>
                                                <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600 dark:text-gray-400">
                                                    <p>Strike: ${optionDetails.strike_price}</p>
                                                    <p>Close: ${optionDetails.close_price}</p>
                                                    <p>Exp: {optionDetails.expiration_date}</p>
                                                    <p>OI: {optionDetails.open_interest}</p>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1 text-sm p-2 max-w-[300px]">
                                                <p className="font-medium">{optionDetails.root_symbol} {key} Option Details:</p>
                                                <p>• Strike Price: ${Number(optionDetails.strike_price).toFixed(2)} - The price at which you can buy/sell the underlying stock</p>
                                                <p>• Current Price: ${Number(optionDetails.close_price).toFixed(2)} - The last traded price of this option</p>
                                                <p>• Expiration: {new Date(optionDetails.expiration_date).toLocaleDateString()} - When this option contract expires</p>
                                                <p>• Open Interest: {Number(optionDetails.open_interest).toLocaleString()} - Number of active contracts</p>
                                                <p className="text-xs text-gray-500 mt-1">This is a {key} option, which typically has {key === 'shortTerm' ? 'less than 3 months' : key === 'mediumTerm' ? '3-6 months' : 'more than 6 months'} until expiration.</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : null
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 