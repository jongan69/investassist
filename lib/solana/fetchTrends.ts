export const fetchCryptoTrends = async () => {
    try {
        const response = await fetch(`/api/crypto-trends`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.bitcoinPrice || !data.ethereumPrice || !data.solanaPrice) {
            throw new Error('Missing required price data');
        }
        return data;
    } catch (error) {
        console.error('Error fetching crypto trends:', error);
        return [];
    }
};