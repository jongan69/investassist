// React and Next.js imports
import { Suspense } from "react"

// External library imports
import yahooFinance from "yahoo-finance2"

// Internal component imports
import { DataTable } from "@/components/stocks/markets/data-table"
import { columns } from "@/components/stocks/markets/columns"
import MarketsChart from "@/components/chart/MarketsChart"
import CryptoTrends from "@/components/crypto/Trends"
import { LiveTrades } from "@/components/crypto/LiveTrades/LiveTrades"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Internal type imports
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import { Interval } from "@/types/yahoo-finance"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"

// Internal utility imports
import { fetchStockNews } from "@/lib/alpaca/fetchStockNews"
import { tickersFutures, tickerAfterOpen, isMarketOpen } from "@/lib/utils/utils"
import { getMarketSentiment } from "@/lib/utils/marketSentiment"

// Home page component imports
import BitcoinTrendAnalysis from "@/components/home/BitcoinTrendAnalysis"
import { 
  MarketSummaryWrapper, 
  TrendingStocksWrapper, 
  NewsSectionWrapper, 
  SectorPerformanceWrapper 
} from "@/components/home/WrapperComponents"
import { EmailSignupPrompt } from "@/components/home/EmailSignupPrompt"
import { FuturesTable } from "@/components/home/FuturesTable"
import Calendar from "@/components/home/Calendar"
import InsiderTrading from "@/components/home/InsiderTrading"
import HighVolume from "@/components/home/HighVolume"

// Extra components imports
import { TrendingTopics } from "@/components/crypto/Trends/TrendingTopics"
import { CarPriceIndex } from "@/components/automotive/CarPriceIndex"
import RealEstateMarketTrends from "@/components/realestate/RealEstateMarketTrends"
import TrumpPosts from "@/components/truthsocial/TrumpPosts"


// Add route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30 // Increase timeout to 30 seconds

interface Props {
  searchParams: Promise<any>
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams
  const tickers = isMarketOpen() ? tickerAfterOpen : tickersFutures
  const ticker = tickers[0].symbol || params.ticker
  const range = validateRange(
    (Array.isArray(params?.range) ? params.range[0] : params.range) || DEFAULT_RANGE
  )

  const interval = validateInterval(
    range,
    ((Array.isArray(params?.interval) ? params.interval[0] : params.interval) || DEFAULT_INTERVAL) as Interval
  )

  // Split data fetching into smaller chunks
  const [marketData, latestNews] = await Promise.all([
    Promise.allSettled(
      tickers?.map(({ symbol }) => yahooFinance.quoteCombine(symbol))
    ).then(results => results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      ?.map(result => result.value)
    ),
    fetchStockNews()
  ])

  const resultsWithTitles = marketData?.map((result, index) => ({
    ...result,
    shortName: tickers[index].shortName,
  }))

  const marketSentiment = getMarketSentiment(
    resultsWithTitles[0]?.regularMarketChangePercent
  )

  const btcData = resultsWithTitles.find(result => result.symbol === 'BTC-USD')
  
  const sentimentColor =
    marketSentiment === "bullish"
      ? "text-green-500"
      : marketSentiment === "bearish"
        ? "text-red-500"
        : "text-neutral-500"

  const sentimentBackground =
    marketSentiment === "bullish"
      ? "bg-green-500/10"
      : marketSentiment === "bearish"
        ? "bg-red-300/50 dark:bg-red-950/50"
        : "bg-neutral-500/10"

  return (
    <div className="flex flex-col gap-4 max-w-[2000px] mx-auto px-4" >
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white animate-gradient">Invest Assist</h1>
      
      <EmailSignupPrompt />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <Card className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="z-1 w-fit rounded-full px-4 py-2 font-medium dark:bg-neutral-100/5 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <Suspense fallback={<div className="animate-pulse h-6 w-32 bg-muted rounded" />}>
                    The markets are{" "}
                    <strong className={`${sentimentColor} transition-colors duration-300`}>{marketSentiment}</strong>

                    {btcData && (
                      <span className="ml-2 transition-all duration-300 hover:scale-105">
                        and Bitcoin is <strong className={`${btcData.regularMarketChangePercent > 0 ? "text-green-500" : "text-red-500"} transition-colors duration-300`}>
                          {btcData.regularMarketChangePercent > 0 ? "bullish" : "bearish"}
                        </strong>{" "}
                        <span className={`${btcData.regularMarketChangePercent > 0 ? "text-green-500" : "text-red-500"} transition-colors duration-300`}>
                          ({btcData.regularMarketChangePercent > 0 ? "+" : ""}
                          {btcData.regularMarketChangePercent.toFixed(2)}%)
                        </span>
                      </span>
                    )}
                  </Suspense>
                </CardTitle>
              </CardHeader>
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <SectorPerformanceWrapper />
              </Suspense>
              {/* Bitcoin Trend Analysis */}
              {btcData && (
                <BitcoinTrendAnalysis btcData={btcData} />
              )}
            </div>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <Calendar />
            </Suspense>
            {/* <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <TradingReports />
            </Suspense> */}
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <HighVolume />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <RealEstateMarketTrends />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <CarPriceIndex />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <TrendingTopics />
            </Suspense>
            <div className="flex flex-col">
              <div className="px-6 sm:px-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <MarketSummaryWrapper
                    sentimentColor={sentimentColor}
                  />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <TrendingStocksWrapper latestNews={latestNews} />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <NewsSectionWrapper ticker={ticker} />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <TrumpPosts />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <InsiderTrading />
                </Suspense>
              </div>
            </div>

            <div
              className={`pointer-events-none absolute inset-0 z-0 h-[65%] w-[65%] -translate-x-[10%] -translate-y-[30%] rounded-full blur-3xl transition-all duration-500 ${sentimentBackground}`}
            />
          </Card>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
            <CryptoTrends data={resultsWithTitles} />
          </Suspense>
          {/* <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
            <BoxOffice />
          </Suspense> */}
          <Card className="rounded-md border-none transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">Live Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveTrades />
              </CardContent>
            </Suspense>
          </Card>
          <Card className="rounded-md border-none transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">Futures</CardTitle>
              </CardHeader>
              <CardContent>
                <FuturesTable />
              </CardContent>
            </Suspense>
          </Card>
        </div>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">Markets</h2>
        <Card className="flex flex-col gap-4 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <DataTable columns={columns as any} data={resultsWithTitles} />
              </Suspense>
            </div>
            <div className="w-full">
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <MarketsChart ticker={ticker} range={range} interval={interval} />
              </Suspense>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}