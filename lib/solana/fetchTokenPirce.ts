import { INVEST_ASSIST_MINT } from "@/lib/utils/constants";

const URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getTokenPrice() {
    try {
      // During build time, NEXT_PUBLIC_BASE_URL might be localhost which isn't available
      // Return default values if URL is not set or is localhost during build
      if (!URL || URL.includes('localhost') || URL.includes('127.0.0.1')) {
        // Check if we're in a build context
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
          return { price: 0, uiFormatted: '$0.000', confidenceLevel: 'low' };
        }
      }

      console.log('Fetching token price...');
      const response = await fetch(`${URL}/api/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outputMint: INVEST_ASSIST_MINT
        }),
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }
      // console.log('Price data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching price:', error);
      return { price: 0, uiFormatted: '$0.000', confidenceLevel: 'low' };
    }
  }