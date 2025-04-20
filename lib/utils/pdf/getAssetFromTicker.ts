import data from '@/data/tickers.json';
import yahooFinance from 'yahoo-finance2';

export async function getAssetFromTicker(ticker: string) {
  const asset = data.find((asset) => asset.ticker === ticker);
  console.log('Found asset:', asset?.title);
  if(!asset) {
    const quote = await yahooFinance.quote(ticker);
    console.log('Found Yahoo Finance Name:', quote.longName);
    return quote.longName;
  }
  return asset?.title;
}
