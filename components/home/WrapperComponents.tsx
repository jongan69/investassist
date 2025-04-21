import { Suspense } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MarketSummary from '@/components/stocks/MarketSummary'
import TrendingStocks from "@/components/stocks/Trending"
import NewsSection from "@/components/home/NewsSection"
import SectorPerformance from "@/components/stocks/SectorPerformance"

import { fetchCalendar } from "@/lib/markets/fetchCalendar"   
import { fetchFomc } from "@/lib/markets/fetchFomc"

import { fetchStockSearch } from "@/lib/yahoo-finance/fetchStockSearch"
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"
import { fetchSectorPerformanceServer } from "@/lib/yahoo-finance/fetchSectorPerformanceServer"
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest"
import { fetchCryptoTrendsServer } from "@/lib/solana/fetchTrendsServer"

import { fetchWithTimeout, handleApiError, processBatch } from "@/lib/utils/utils"


export async function MarketSummaryWrapper({
  sentimentColor
}: {
  sentimentColor: string
}) {
  try {
    const [fearGreedValue, sectorPerformance, calendar, fomc, cryptoTrends] = await Promise.allSettled([
      fetchWithTimeout(fetchFearGreedIndex(), 10000),
      fetchWithTimeout(fetchSectorPerformanceServer(), 30000),
      fetchWithTimeout(fetchCalendar(), 10000),
      fetchWithTimeout(fetchFomc(), 10000),
      fetchWithTimeout(fetchCryptoTrendsServer(), 10000)
    ]);

    // Handle individual failures
    if (fearGreedValue.status === 'rejected') {
      console.error('Failed to fetch fear greed index:', fearGreedValue.reason);
    }
    if (sectorPerformance.status === 'rejected') {
      console.error('Failed to fetch sector performance:', sectorPerformance.reason);
    }

    // If both requests failed, show error message
    if (fearGreedValue.status === 'rejected' && sectorPerformance.status === 'rejected') {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load market summary data. Please try again later.
          </div>
        </div>
      );
    }

    // Use available data even if one request failed
    const validFearGreedValue = fearGreedValue.status === 'fulfilled' ? fearGreedValue.value : null;
    const validSectorPerformance = sectorPerformance.status === 'fulfilled' ? sectorPerformance.value : null;

    if (!validFearGreedValue || !validSectorPerformance || validSectorPerformance.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Market summary data is incomplete. Please try again later.
          </div>
        </div>
      );
    }

    return (
      <MarketSummary
        sentimentColor={sentimentColor}
        fearGreedValue={validFearGreedValue}
        sectorPerformance={validSectorPerformance}
        calendar={calendar}
        fomc={fomc}
        cryptoTrends={cryptoTrends}
      />
    );
  } catch (error) {
    const { message, isTimeout } = handleApiError(error);
    console.error('Error in MarketSummaryWrapper:', error);

    return (
      <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {message}
          {isTimeout && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
}

export async function TrendingStocksWrapper({ latestNews }: { latestNews: any[] }) {
  try {
    if (!latestNews || !Array.isArray(latestNews)) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100" suppressHydrationWarning>
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load trending stocks data.
          </div>
        </div>
      );
    }

    // Limit the number of news items to process and filter out invalid ones
    const limitedNews = latestNews
      .filter((newsArticle: any) =>
        newsArticle.symbols &&
        newsArticle.symbols.length > 0 &&
        // Filter out crypto and other non-stock symbols
        !newsArticle.symbols.some((symbol: string) =>
          symbol.includes('USD') ||
          symbol.includes('BTC') ||
          symbol.includes('ETH') ||
          symbol.length > 5
        )
      )
      .slice(0, 2); // Process only top 2 valid news items to ensure we stay within time limit

    if (limitedNews.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            No trending stocks with news available at the moment.
          </div>
        </div>
      );
    }

    // Get unique symbols to avoid duplicate API calls
    const uniqueSymbols = Array.from(new Set(
      limitedNews.flatMap((newsArticle: any) => newsArticle.symbols)
    ));

    // Process symbols in smaller batches with strict timeouts
    const highOiOptions = await processBatch(
      uniqueSymbols,
      (symbol: string) => getHighOpenInterestContracts(symbol, 'call'),
      1, // Process 1 symbol at a time to minimize failures
      5000, // 5 second timeout per call
      2, // Max 2 retries
      1000, // Start with 1 second delay
      25000 // Global timeout of 25 seconds
    );

    // If no valid options data, show error message
    if (highOiOptions.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load options data. Please try again later.
          </div>
        </div>
      );
    }

    return <TrendingStocks data={{ news: limitedNews, highOiOptions }} />;
  } catch (error) {
    const { message, isTimeout } = handleApiError(error);
    console.error('Error in TrendingStocksWrapper:', error);

    return (
      <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {message}
          {isTimeout && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
}

export async function NewsSectionWrapper({ ticker }: { ticker: string }) {
  const news = await fetchStockSearch(ticker, 100)
  return <NewsSection news={news.news} />
}

export async function SectorPerformanceWrapper() {
  return (
    <Card className="m-4" suppressHydrationWarning>
      <CardHeader>
        <CardTitle className="text-lg">Sector Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg pt-4" />}>
          <SectorPerformance />
        </Suspense>
      </CardContent>
    </Card>
  )
} 