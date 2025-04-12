/**
 * Determines the market sentiment based on the percentage change
 * @param changePercentage The percentage change in the market
 * @returns The sentiment as "bullish", "bearish", or "neutral"
 */
export function getMarketSentiment(changePercentage: number | undefined) {
  if (!changePercentage) {
    return "neutral"
  }
  if (changePercentage > 0.1) {
    return "bullish"
  } else if (changePercentage < -0.1) {
    return "bearish"
  } else {
    return "neutral"
  }
} 