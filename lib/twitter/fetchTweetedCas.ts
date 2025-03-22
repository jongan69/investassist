import { getTokenInfo } from '../solana/fetchDefaultTokenData';

export const fetchTweetedCas = async (setTweetedCas: (tweetedCas: any) => void, setIsLoading: (isLoading: boolean) => void, setError: (error: string | null) => void) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/twitter-cas', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        // if (!responseData.success || !responseData.data) {
        //     throw new Error('Invalid API response format');
        // }

        const data = responseData?.data;

        // Fetch token info in parallel for better performance
        if (data && data.length > 0) {
            const tokenInfoPromises = data.map(async (item: any) => {
                try {
                    const tokenInfo = await getTokenInfo(item.address);
                if (tokenInfo) {
                    return { ...item, tokenInfo };
                }
            } catch (error) {
                console.error(`Error fetching token info for ${item.address}:`, error);
            }
            return item;
        });

            const enrichedData = await Promise.all(tokenInfoPromises);
            setTweetedCas(enrichedData);
        } else {
            setTweetedCas([]);
        }
    } catch (error) {
        console.error('Error fetching Twitter trending cas:', error);
        setError('Failed to load Twitter trending cas');
        setTweetedCas([]); // Set empty array instead of null to prevent null checks
    } finally {
        setIsLoading(false);
    }
};