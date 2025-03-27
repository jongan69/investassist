export const fetchTwitterFollowers = async (username: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const url = `${BASE_URL}/api/twitter/check-twitter-handle`;
    const response = await fetch(url, { cache: 'no-store', method: 'POST', body: JSON.stringify({ username }) });
    const data = await response.json();
    return data;
}
