export async function fetchTrumpSocialPosts() {
    try {
        const response = await fetch('/api/truthsocial/trump');
        const data = await response.json();
        if (data.error) {
            throw new Error(JSON.stringify(data, null, 2), { cause: data.error });
        }
        return data;
    } catch (error) {
        console.error('Error fetching trump social posts:', error);
        return [];
    }
}