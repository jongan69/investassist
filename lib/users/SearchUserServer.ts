const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const searchUsersServer = async (query: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/database/search-users?q=${query}`);
      return response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }