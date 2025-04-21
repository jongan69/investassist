
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchSectorPerformanceServer = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/sector-performance`);
      return response.json();
    } catch (error) {
      console.error('Error fetching sector performance serverside:', error);
      return [];
    }
  }