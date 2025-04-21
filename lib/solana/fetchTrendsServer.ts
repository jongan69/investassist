
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchCryptoTrendsServer = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/crypto-trends`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching crypto trends:', error);
        return [];
    }
}