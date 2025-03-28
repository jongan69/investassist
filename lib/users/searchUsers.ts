  // Add user search function
  export const searchUsers = async (query: string) => {
    if (query.length < 2) {
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/database/search-users?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.results) {
        return data.results;
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };