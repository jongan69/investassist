export async function getSolanaTokenCA(ticker: string) {
    /**
     * Retrieve the contract address (CA) of a Solana token by its ticker symbol.
     * Returns the CA of the token with the highest liquidity.
     *
     * @param {string} ticker - The ticker symbol of the Solana token (e.g., 'SOL', 'USDC', or '$SOL').
     * @returns {Promise<string|null>} - The contract address of the token if found, otherwise null.
     */
  
    // Remove '$' if present at the start of the ticker
    if (ticker.startsWith('$')) {
      ticker = ticker.slice(1);
    }
  
    try {
      // Store both uppercase and lowercase versions of the ticker for comparison
      const tickerUpper = ticker.toUpperCase();
      const tickerLower = ticker.toLowerCase();
  
      // DEX Screener API search endpoint
      const url = `https://api.dexscreener.com/latest/dex/search?q=${ticker}`;
  
      // Send GET request to the API
      const response = await fetch(url);
      const data = await response.json();
      // Filter for Solana pairs and valid quote tokens (SOL or USDC)
      const validPairs = ((data.pairs || []) as any[]).filter((pair: any) => 
        pair.chainId === 'solana' && 
        (pair.quoteToken?.address === 'So11111111111111111111111111111111111111112' || // SOL
         pair.quoteToken?.address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') && // USDC
        pair.liquidity?.usd > 5000 // Minimum liquidity threshold
      );
  
      // Group pairs by base token address
      const groupedPairs = validPairs.reduce((acc: { [key: string]: any[] }, pair: any) => {
        const address = pair.baseToken?.address;
        if (address) {
          if (!acc[address]) acc[address] = [];
          acc[address].push(pair);
        }
        return acc;
      }, {});
  
      // For each token, select the SOL pair with highest market cap
      const bestPairs = Object.values(groupedPairs).map(pairs => {
        // Only consider SOL pairs
        const solPairs = pairs.filter((p: { quoteToken: { address: string; }; }) => 
          p.quoteToken?.address === 'So11111111111111111111111111111111111111112'
        );
        
        // If we have SOL pairs, pick the one with highest market cap
        if (solPairs.length > 0) {
          return solPairs.reduce((best: any, current: any) => {
            const bestMarketCap = best.baseToken?.fdv || 0;
            const currentMarketCap = current.baseToken?.fdv || 0;
            return currentMarketCap > bestMarketCap ? current : best;
          });
        }

        // If no SOL pairs, return null
        return null;
      }).filter(Boolean); // Remove null entries

      // Sort by market cap
      bestPairs.sort((a: any, b: any) => {
        const marketCapA = a.baseToken?.fdv || 0;
        const marketCapB = b.baseToken?.fdv || 0;
        return marketCapB - marketCapA;
      });
  
      // Sort by market cap, holder count, and liquidity
      bestPairs.sort((a: any, b: any) => {
        const marketCapA = a.baseToken?.fdv || 0;
        const marketCapB = b.baseToken?.fdv || 0;
        const holdersA = a.holders?.holders?.length || 0;
        const holdersB = b.holders?.holders?.length || 0;
        const liquidityA = a.liquidity?.usd || 0;
        const liquidityB = b.liquidity?.usd || 0;
        
        // First compare by holder count
        if (holdersA !== holdersB) {
          return holdersB - holdersA;
        }
        
        // Then by market cap
        if (marketCapA !== marketCapB) {
          return marketCapB - marketCapA;
        }
        
        // Finally by liquidity
        return liquidityB - liquidityA;
      });
  
      // Find the highest market cap pair that matches the ticker
      for (const pair of bestPairs) {
        const baseToken = pair.baseToken || {};
        const quoteToken = pair.quoteToken || {};
  
        if (
          baseToken.symbol?.toUpperCase() === tickerUpper ||
          baseToken.symbol?.toLowerCase() === tickerLower
        ) {
          return baseToken.address;
        } else if (
          quoteToken.symbol?.toUpperCase() === tickerUpper ||
          quoteToken.symbol?.toLowerCase() === tickerLower
        ) {
          return quoteToken.address;
        }
      }
  
      // If no exact match found but we have valid pairs, return the highest market cap one
      if (bestPairs.length > 0) {
        return bestPairs[0].baseToken.address;
      }
  
      // Return null if no valid pairs found
      return null;
  
    } catch (error: any) {
      console.error(`Error fetching token data: ${error.message}`);
      return null;
    }
  }