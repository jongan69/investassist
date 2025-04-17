export async function saveUser(username: string, walletAddress: string) {
    try {
        const response = await fetch(`/api/database/save-user`, {
            method: 'POST',
            body: JSON.stringify({ username, walletAddress })
        })

        if (!response.ok) {
            throw new Error(`Failed to save user: ${response.statusText}`);
        }

        return response.json()
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
}