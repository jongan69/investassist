export const fetchLatestTweets = async () => {
    try {
        const response = await fetch(`/api/twitter/latest-tweets`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const filteredData = data?.data?.clusters?.filter((clusters: any) => clusters.size > 1);
        return filteredData;
    } catch (error) {
        console.error('Error fetching latest tweets:', error);
        return [];
    }
};