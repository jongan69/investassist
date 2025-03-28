export async function fetchTwitterSearch(query: string) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/twitter-search`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ searchQuery: query }),
        cache: 'no-store',
    });
    const data = await response.json();
    return data;
}
