import { getTokenInfo } from '../solana/fetchDefaultTokenData';

export const fetchTweetedCas = async () => {
    try {
        const URL = process.env.NEXT_PUBLIC_BASE_URL;
        const response = await fetch(`${URL}/api/twitter/twitter-cas`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        const data = responseData?.data;

        // Fetch token info in parallel with improved error handling and retries
        if (data && data.length > 0) {
            const BATCH_SIZE = 5; // Process 5 tokens at a time to avoid rate limits
            const enrichedData = [];
            
            // Process tokens in batches
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                const batch = data.slice(i, i + BATCH_SIZE);
                const batchPromises = batch?.map(async (item: any) => {
                    if (!item.address) return item;
                    
                    try {
                        const tokenInfo = await getTokenInfo(item.address);
                        // Only enrich with token info if we successfully got the data
                        if (tokenInfo) {
                            return { 
                                ...item, 
                                tokenInfo: {
                                    name: tokenInfo.name,
                                    symbol: tokenInfo.symbol,
                                    price: tokenInfo.price,
                                    marketCap: tokenInfo.marketCap,
                                    contractAddress: tokenInfo.contractAddress,
                                    image: tokenInfo.image
                                }
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching token info for ${item.address}:`, error);
                    }
                    return item;
                });

                const batchResults = await Promise.all(batchPromises);
                enrichedData.push(...batchResults);

                // Add a small delay between batches to respect rate limits
                if (i + BATCH_SIZE < data.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return enrichedData;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching Twitter trending cas:', error);
        return [];
    }
};