export const getLeaderboard = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-leaderboard`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        return [];
    }
}