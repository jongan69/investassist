interface TrendingMeta {
  word: string;
  word_with_strength: string;
  score: number;
  total_txns: number;
  total_vol: number;
  isTrendingTwitterTopic: boolean;
  url: string;
}

export const fetchTrendingMetas = async (
  setTrendingMetas: (trendingMetas: TrendingMeta[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await fetch('/api/combinedTrending', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // if (!data.data || !data.data.clusters) {
    //     throw new Error('Invalid API response format');
    // }
    // console.log(data);
    setTrendingMetas(data);
  } catch (error) {
    console.error('Error fetching trending metas:', error);
    setError('Failed to load trending metas');
    setTrendingMetas([]);
  } finally {
    setIsLoading(false);
  }
};