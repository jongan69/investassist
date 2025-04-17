import { JUPITER } from "@/lib/utils/constants";
import { getTokenInfo } from "@/lib/solana/fetchDefaultTokenData";

export const fetchJupiterSwap = async (id: string | undefined) => {
  try {
    if (!id) return null;
    
    const response = await fetch(`${JUPITER}/price/v2?ids=${id}`);
    if (!response.ok) {
      const tokenInfo = await getTokenInfo(id);
      if (tokenInfo) {
        return {
          data: {
            [id]: {
              price: tokenInfo.price,
              liquidity: tokenInfo.liquidity?.usd || 0,
              volume: tokenInfo.volume?.h24 || 0
            }
          }
        };
      }
    }
    const price = await response.json();
    return price;
  } catch (error) {
    console.error('Error fetching Jupiter swap price:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};