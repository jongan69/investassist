export const fetchTraderAccounts = async () => {
    try {
        const response = await fetch('/api/tracked-accounts');
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching tracked accounts:', error);
        return null;
    }
};