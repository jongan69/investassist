import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Interval } from "@/types/yahoo-finance"
import tickers from "@/data/tickers.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStartDate(interval: Interval) {
  const today = new Date()
  let subtractDays

  switch (interval) {
    case "1d":
    case "1m":
    case "2m":
    case "5m":
    case "15m":
    case "30m":
    case "60m":
    case "90m":
    case "1h":
      subtractDays = 1
      break
    case "5d":
      subtractDays = 5
      break
    case "1wk":
      subtractDays = 7
      break
    case "1mo":
      subtractDays = 30
      break
    case "3mo":
      subtractDays = 90
      break
    default:
      subtractDays = 0
  }

  today.setDate(today.getDate() - subtractDays)

  // Format the date in the 'YYYY-MM-DD' format
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function CalculateRange(range: string) {
  const currentDate = new Date()
  let from

  switch (range) {
    case "1d":
      currentDate.setDate(currentDate.getDate() - 1)
      break
    case "1w":
      currentDate.setDate(currentDate.getDate() - 7)
      break
    case "1m":
      currentDate.setMonth(currentDate.getMonth() - 1)
      break
    case "3m":
      currentDate.setMonth(currentDate.getMonth() - 3)
      break
    case "1y":
      currentDate.setFullYear(currentDate.getFullYear() - 1)
      break
    default:
      throw new Error(`Invalid range: ${range}`)
  }

  from = currentDate.toISOString().split("T")[0] // format date to 'YYYY-MM-DD'
  return from
}

export function calculateInterval(range: string) {
  let interval

  switch (range) {
    case "1d":
      interval = "15m" // 15 minutes
      break
    case "1w":
    case "1m":
      interval = "1h" // 1 hour
      break
    case "3m":
    case "1y":
      interval = "1d" // 1 day
      break
    default:
      throw new Error(`Invalid range: ${range}`)
  }

  return interval
}

export function isMarketOpen() {
  const now = new Date()

  // Convert to New York time
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }
  const formatter = new Intl.DateTimeFormat([], options)

  const timeString = formatter.format(now)
  const [hour, minute] = timeString.split(":").map(Number)
  const timeInET = hour + minute / 60

  // Get the day of the week in New York time
  const dayInET = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  ).getDay()

  // Check if the current time is between 9:30 AM and 4:00 PM ET on a weekday
  if (dayInET >= 1 && dayInET <= 5 && timeInET >= 9.5 && timeInET < 16) {
    return true
  } else {
    return false
  }
}

export const tickersFutures = [
  { symbol: "ES=F", shortName: "S&P 500 Futures" },
  { symbol: "NQ=F", shortName: "NASDAQ Futures" },
  { symbol: "YM=F", shortName: "Dow Jones Futures" },
  { symbol: "RTY=F", shortName: "Russell 2000 Futures" },
  { symbol: "CL=F", shortName: "Crude Oil" },
  { symbol: "GC=F", shortName: "Gold" },
  { symbol: "SI=F", shortName: "Silver" },
  { symbol: "EURUSD=X", shortName: "EUR/USD" },
  { symbol: "^TNX", shortName: "10 Year Bond" },
  { symbol: "BTC-USD", shortName: "Bitcoin" },
  { symbol: "ETH-USD", shortName: "Ethereum" },
  { symbol: "SOL-USD", shortName: "Solana" },
]

export const tickerAfterOpen = [
  { symbol: "^GSPC", shortName: "S&P 500" },
  { symbol: "^IXIC", shortName: "NASDAQ" },
  { symbol: "^DJI", shortName: "Dow Jones" },
  { symbol: "^RUT", shortName: "Russell 2000" },
  { symbol: "CL=F", shortName: "Crude Oil" },
  { symbol: "GC=F", shortName: "Gold" },
  { symbol: "SI=F", shortName: "Silver" },
  { symbol: "EURUSD=X", shortName: "EUR/USD" },
  { symbol: "^TNX", shortName: "10 Year Bond" },
  { symbol: "BTC-USD", shortName: "Bitcoin" },
  { symbol: "ETH-USD", shortName: "Ethereum" },
  { symbol: "SOL-USD", shortName: "Solana" },
]

export const validateTicker = (ticker: string): boolean => {
  // Convert ticker to uppercase for consistent comparison
  const upperTicker = ticker.toUpperCase();
  
  // Check if it's a special ticker (like indices or futures)
  const isSpecialTicker = [...tickerAfterOpen, ...tickersFutures].some(
    (t: { symbol: string }) => t.symbol === upperTicker
  );
  
  if (isSpecialTicker) return true;
  
  // Check if it exists in our tickers database
  // Note: This is a simple check - in a production environment, you might want to use a more efficient data structure
  return tickers.some((t: { ticker: string }) => t.ticker === upperTicker);
};

export async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        throw new Error('Request timed out. Please try again.');
      }
    }
    throw error;
  }
}

export function handleApiError(error: unknown): { message: string; isTimeout: boolean } {
  if (error instanceof Error) {
    return {
      message: error.message.includes('timed out') 
        ? 'Request timed out. Please try again.'
        : error.message || 'An unexpected error occurred.',
      isTimeout: error.message.includes('timed out')
    };
  }
  return {
    message: 'An unexpected error occurred.',
    isTimeout: false
  };
}

export async function processBatch<T>(
  items: T[],
  processFn: (item: T) => Promise<any>,
  batchSize: number = 3,
  timeoutMs: number = 5000,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  globalTimeoutMs: number = 25000 // Global timeout of 25 seconds (leaving 5s buffer)
): Promise<any[]> {
  const results = [];
  let currentDelay = initialDelay;
  const startTime = Date.now();

  // Create a promise that rejects after global timeout
  const globalTimeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Global timeout reached. Operation cancelled.'));
    }, globalTimeoutMs);
  });

  try {
    for (let i = 0; i < items.length; i += batchSize) {
      // Check if we've exceeded global timeout
      if (Date.now() - startTime >= globalTimeoutMs) {
        console.warn('Global timeout reached, stopping batch processing');
        break;
      }

      const batch = items.slice(i, i + batchSize);
      let retryCount = 0;
      let batchSuccess = false;

      while (!batchSuccess && retryCount < maxRetries) {
        try {
          // Race between batch processing and global timeout
          const batchPromise = Promise.allSettled(
            batch.map(item => fetchWithTimeout(processFn(item), timeoutMs))
          );

          const batchResults = await Promise.race([
            batchPromise,
            globalTimeoutPromise
          ]);

          const validResults = batchResults
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .map(result => result.value);
          
          results.push(...validResults);
          batchSuccess = true;
          
          // If successful, reduce delay for next batch
          currentDelay = Math.max(initialDelay, currentDelay / 2);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('Global timeout')) {
              console.warn('Global timeout reached during batch processing');
              break;
            }
            if (error.message.includes('Rate limit')) {
              retryCount++;
              console.log(`Rate limit hit, waiting ${currentDelay}ms before retry ${retryCount}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, currentDelay));
              currentDelay *= 2;
            } else {
              console.error(`Error processing batch:`, error);
              break;
            }
          }
        }
      }

      if (!batchSuccess) {
        console.warn(`Failed to process batch after ${retryCount} retries`);
      }
    }

    // If we have no results at all, throw an error
    if (results.length === 0) {
      throw new Error('No data could be processed within the time limit');
    }

    return results;
  } catch (error) {
    // If we have partial results, return them
    if (results.length > 0) {
      console.warn('Returning partial results due to error:', error);
      return results;
    }
    throw error;
  }
}