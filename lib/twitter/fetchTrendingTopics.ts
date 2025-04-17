export const fetchTrendingTopics = async () => {
    try {
        const response = await fetch(`/api/twitter/twitter-trending`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return [];
    }
};