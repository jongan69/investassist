import { DataTable } from "@/components/stocks/markets/data-table"
import yahooFinance from "yahoo-finance2"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import { Interval } from "@/types/yahoo-finance"
import { Suspense, useState } from "react"
import MarketsChart from "@/components/chart/MarketsChart"
import Link from "next/link"
import { columns } from "@/components/stocks/markets/columns"
import SectorPerformance from "@/components/stocks/SectorPerformance"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"
import { fetchStockSearch } from "@/lib/yahoo-finance/fetchStockSearch"
import MarketSummary from '@/components/stocks/MarketSummary';
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"
import { fetchSectorPerformance } from "@/lib/yahoo-finance/fetchSectorPerformance"
import CryptoTrends from "@/components/crypto/Trends"
import NewsSection from "@/components/NewsSection"
import { tickersFutures, tickerAfterOpen, isMarketOpen } from "@/lib/utils"


function getMarketSentiment(changePercentage: number | undefined) {
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

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    ticker?: string
    range?: string
    interval?: string
    page?: string
  }
}) {
  const tickers = isMarketOpen() ? tickerAfterOpen : tickersFutures

  const ticker = tickers[0].symbol || "BTC-USD"
  const range = validateRange(searchParams?.range || DEFAULT_RANGE)
  const interval = validateInterval(
    range,
    (searchParams?.interval as Interval) || DEFAULT_INTERVAL
  )
  const news = await fetchStockSearch("^DJI", 100)

  const promises = tickers.map(({ symbol }) =>
    yahooFinance.quoteCombine(symbol)
  )
  const results = await Promise.allSettled(promises)
    .then(results => results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
    );

  const resultsWithTitles = results.map((result, index) => ({
    ...result,
    shortName: tickers[index].shortName,
  }))

  const marketSentiment = getMarketSentiment(
    resultsWithTitles[0]?.regularMarketChangePercent
  )

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

  const fearGreedValue = await fetchFearGreedIndex()
  const sectorPerformance = await fetchSectorPerformance()
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Invest Assist</h1>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <Card className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden">
            <CardHeader>
              <CardTitle className="z-50 w-fit rounded-full px-4  py-2 font-medium dark:bg-neutral-100/5">
                The markets are{" "}
                <strong className={sentimentColor}>{marketSentiment} </strong>
                because Zach is a {marketSentiment === "bullish" ? "a genius" : "couch fucker"}
              </CardTitle>
            </CardHeader>
            {fearGreedValue && sectorPerformance && (
              <MarketSummary
                sentimentColor={sentimentColor}
                fearGreedValue={fearGreedValue}
                sectorPerformance={sectorPerformance}
              />
            )}
            <NewsSection news={news.news} />
            <div
              className={`pointer-events-none absolute inset-0 z-0 h-[65%] w-[65%] -translate-x-[10%] -translate-y-[30%] rounded-full blur-3xl ${sentimentBackground}`}
            />
          </Card>
        </div>
        <div className="w-full lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading...</div>}>
                <SectorPerformance />
              </Suspense>
            </CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <CryptoTrends data={resultsWithTitles} />
            </Suspense>
          </Card>
        </div>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium">Markets</h2>
        <Card className="flex flex-col gap-4 p-6 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <Suspense fallback={<div>Loading...</div>}>
              <DataTable columns={columns as any} data={resultsWithTitles} />
            </Suspense>
          </div>
          <div className="w-full lg:w-3/4">
            <Suspense fallback={<div>Loading...</div>}>
              <MarketsChart ticker={ticker} range={range} interval={interval} />
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  )
}