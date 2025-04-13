export async function fetchTrendingVids() {
    try {
        const response = await fetch('/api/tiktok/trending');
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        const trendingVids = data.data.itemList;
        return trendingVids;
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        return [];
    }
}