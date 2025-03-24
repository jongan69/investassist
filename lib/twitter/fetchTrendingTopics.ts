export const fetchTrendingTopics = async (setTrendingTopics: (trendingTopics: string[]) => void, setIsLoading: (isLoading: boolean) => void, setError: (error: string | null) => void) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/twitter-trending', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // if (!data.data || !data.data.clusters) {
        //     throw new Error('Invalid API response format');
        // }
        // console.log(data);
        setTrendingTopics(data);
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        setError('Failed to load trending topics');
        setTrendingTopics([]);
    } finally {
        setIsLoading(false);
    }
};