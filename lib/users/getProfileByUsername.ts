export const getProfileByUsername = async (username: string) => {
    // Get the base URL from environment variable, falling back to localhost in development    
    try {   
        const response = await fetch(`/api/database/get-profile`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
        }),
        // Add cache: 'no-store' if you want real-time data
        // or use next: { revalidate: 60 } for ISR with 60 second intervals
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}