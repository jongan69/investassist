import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function fetchUserTweets(username: string) {
  try {
    // Use fetchWithTimeout with a 50-second timeout
    const response = await fetchWithTimeout(
      `${BASE_URL}/api/twitter/user-tweets?username=${username}`,
      {},
      50000 // 50 seconds timeout
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    // Return empty array on error to ensure the page still loads
    return [];
  }
}
