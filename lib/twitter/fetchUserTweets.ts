export async function fetchUserTweets(username: string) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user-tweets`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ username: username }),
    });
    const data = await response.json();
    return data;
}
