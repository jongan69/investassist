export const fetchTwitterFollowers = async (username: string) => {
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
        const url = `${BASE_URL}/api/twitter/check-twitter-handle`;
        const response = await fetch(url, { cache: 'no-store', method: 'POST', body: JSON.stringify({ username }) });
        const data = await response.json();
        console.log('Twitter followers:', data);
        return data;
    } catch (error) {
        console.error('Error fetching Twitter followers:', error);
        return { error: 'Failed to fetch Twitter followers' };
    }
}
