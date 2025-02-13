export const fetchCryptoTrends = async (setTrends: (trends: any) => void, setIsLoading: (isLoading: boolean) => void, setError: (error: string | null) => void) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/crypto-trends');
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.bitcoinPrice || !data.ethereumPrice || !data.solanaPrice) {
            console.error('Missing required price data');
        }

        setTrends(data);
    } catch (error) {
        console.error('Error fetching crypto trends:', error);
        setError('Failed to load crypto trends');
        setTrends(null);
    } finally {
        setIsLoading(false);
    }
};