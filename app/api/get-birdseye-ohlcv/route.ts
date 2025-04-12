// app/api/ohlcv/route.ts

import { NextResponse } from 'next/server';

const API_KEY = process.env.BIRDEYE_API_KEY; // Ensure this is set in your environment
const MAX_RETRIES = 3;

// Define all desired timeframes.
const TIMEFRAMES = [
  "1m", "3m", "5m", "15m", "30m",     // Minute intervals
  "1H", "2H", "4H", "6H", "8H", "12H",  // Hour intervals
  "1D", "3D",                         // Day intervals
  "1W", "1M"                          // Week and Month intervals
];

/**
 * Calculate an exponential backoff delay (in milliseconds) based on the current attempt.
 * Example: attempt 0 => 1s, attempt 1 => 2s, attempt 2 => 4s, etc.
 */
function exponentialBackoff(attempt: number): number {
  return Math.pow(2, attempt) * 1000;
}

/**
 * Returns a Promise that resolves after the specified delay.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch OHLCV data for a given token and timeframe from the external API.
 *
 * @param tokenAddress - The token contract address.
 * @param timeframe - The timeframe to fetch (e.g. "1H").
 * @param startTime - Start unix timestamp as a string.
 * @param endTime - End unix timestamp as a string.
 *
 * @returns The processed OHLCV data, or null if no data was returned,
 *          or an error object if something goes wrong.
 */
async function fetchDataForTimeframe(
  tokenAddress: string,
  timeframe: string,
  startTime: string,
  endTime: string
): Promise<any> {
  const baseUrl = 'https://public-api.birdeye.so/defi/ohlcv';
  const params = new URLSearchParams({
    address: tokenAddress,
    type: timeframe,
    time_from: startTime,
    time_to: endTime,
  });
  const url = `${baseUrl}?${params.toString()}`;

  const headers = {
    'X-API-KEY': API_KEY || '',
    'accept': 'application/json',
    'x-chain': 'solana',
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers });

      if (res.status === 200) {
        const json = await res.json();
        const dataItems: any[] = json?.data?.items || [];

        if (dataItems.length === 0) {
          console.debug(`No data returned for ${tokenAddress} - ${timeframe}`);
          return null;
        }

        // Process the data:
        // - Convert unixTime to an ISO timestamp.
        // - Rename keys: o => open, h => high, l => low, c => close, v => volume.
        // - Convert numeric strings to numbers.
        const processedData = dataItems?.map((item) => ({
          timestamp: new Date(item.unixTime * 1000).toISOString(),
          open: parseFloat(item.o),
          high: parseFloat(item.h),
          low: parseFloat(item.l),
          close: parseFloat(item.c),
          volume: parseFloat(item.v),
        }));

        // Sort data by timestamp in ascending order.
        processedData.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        console.debug(
          `Successfully fetched ${processedData.length} datapoints for ${tokenAddress} - ${timeframe}`
        );
        return processedData;
      } else if (res.status === 429 || res.status >= 500) {
        // Handle rate limiting or server errors by retrying.
        if (attempt < MAX_RETRIES - 1) {
          const delay = exponentialBackoff(attempt);
          console.warn(
            `Status ${res.status} for ${timeframe}. Retrying in ${delay / 1000}s (attempt ${
              attempt + 1
            }/${MAX_RETRIES}).`
          );
          await sleep(delay);
          continue;
        }
      } else {
        // Other HTTP errors: return error message.
        const text = await res.text();
        console.error(`API error ${res.status} for ${timeframe}: ${text}`);
        return { error: text };
      }
    } catch (error: any) {
      if (attempt < MAX_RETRIES - 1) {
        const delay = exponentialBackoff(attempt);
        console.warn(
          `Request failed for ${timeframe} (attempt ${attempt + 1}/${MAX_RETRIES}): ${error.toString()}. Retrying in ${delay / 1000}s.`
        );
        await sleep(delay);
        continue;
      } else {
        console.error(`All retry attempts failed for ${timeframe}: ${error.toString()}`);
        return { error: error.toString() };
      }
    }
  }

  console.error(`Failed to fetch data for ${tokenAddress} - ${timeframe} after ${MAX_RETRIES} attempts.`);
  return { error: 'Failed to fetch data after multiple attempts.' };
}

/**
 * GET /api/ohlcv endpoint.
 *
 * Query Parameters:
 *  - token_address (required): Token contract address.
 *  - start_time (optional): Start unix timestamp (default: 0).
 *  - end_time (optional): End unix timestamp (default: current time).
 *
 * This endpoint fetches OHLCV data for all defined timeframes concurrently and returns
 * the combined data in a JSON object keyed by each timeframe.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Validate the required token_address parameter.
  const tokenAddress = searchParams.get('token_address');
  if (!tokenAddress) {
    return NextResponse.json(
      { error: 'Missing required query parameter: token_address' },
      { status: 400 }
    );
  }

  // Set optional parameters with defaults.
  const startTime = searchParams.get('start_time') || '0';
  const endTime = searchParams.get('end_time') || Math.floor(Date.now() / 1000).toString();

  // Fetch data for each timeframe concurrently.
  const results = await Promise.all(
    TIMEFRAMES.map(async (tf) => {
      const data = await fetchDataForTimeframe(tokenAddress, tf, startTime, endTime);
      return { timeframe: tf, data };
    })
  );

  // Assemble the response object mapping each timeframe to its data.
  const responseData: { [timeframe: string]: any } = {};
  results.forEach((result) => {
    responseData[result.timeframe] = result.data;
  });

  return NextResponse.json({ data: responseData });
}
