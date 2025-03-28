export async function saveUser(username: string, walletAddress: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    try {
        const response = await fetch(`${baseUrl}/api/database/save-user`, {
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