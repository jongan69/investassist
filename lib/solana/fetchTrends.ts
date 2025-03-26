export const fetchCryptoTrends = async (setTrends: (trends: any) => void, setIsLoading: (isLoading: boolean) => void, setError: (error: string | null) => void) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/crypto-trends');
        // console.log(response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.bitcoinPrice || !data.ethereumPrice || !data.solanaPrice) {
            throw new Error('Missing required price data');
        }

        // Set all state updates in a single batch
        setTrends(data);
    } catch (error) {
        console.error('Error fetching crypto trends:', error);
        setError('Failed to load crypto trends');
        setTrends({}); // Set empty object instead of null to prevent null checks
    } finally {
        setIsLoading(false);
    }
};