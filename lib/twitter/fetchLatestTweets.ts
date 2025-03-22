export const fetchLatestTweets = async (setLatestTweets: (latestTweets: any) => void, setIsLoading: (isLoading: boolean) => void, setError: (error: string | null) => void) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/latest-tweets', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // if (!data.data || !data.data.clusters) {
        //     throw new Error('Invalid API response format');
        // }
        // console.log(data);
        const filteredData = data?.data?.clusters?.filter((clusters: any) => clusters.size > 1);
        // console.log(filteredData);
        setLatestTweets(filteredData);
    } catch (error) {
        console.error('Error fetching latest tweets:', error);
        setError('Failed to load latest tweets');
        setLatestTweets([]);
    } finally {
        setIsLoading(false);
    }
};