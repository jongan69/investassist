import StockChart from "@/components/chart/StockChart"
import CompanySummaryCard from "@/app/stocks/[ticker]/components/CompanySummaryCard"
import FinanceSummary from "@/app/stocks/[ticker]/components/FinanceSummary"
import News from "@/app/stocks/[ticker]/components/News"
import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"
import { Interval } from "@/types/yahoo-finance"
import { Suspense } from "react"
import type { Metadata } from "next"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest"
import OpenInterest from "./components/OpenInterest"
type Props = {
  params: Promise<any>
  searchParams: Promise<{
    ticker?: string
    range?: string
    interval?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = (await params).ticker
  const decodedTicker = decodeURIComponent(ticker)
  const quoteData = await fetchQuote(decodedTicker)
  const regularMarketPrice = quoteData.data?.regularMarketPrice?.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  )

  return {
    title: `${decodedTicker} ${regularMarketPrice}`,
    description: `Stocks page for ${decodedTicker}`,
    keywords: [decodedTicker, "stocks"],
  }
}

export default async function StocksPage({ params, searchParams }: Props) {
  const ticker = (await params).ticker
  const typedSearchParams = await searchParams
  const range = validateRange(typedSearchParams?.range || DEFAULT_RANGE)
  // const highOiOptions = await getHighOpenInterestContracts(ticker)
  const interval = validateInterval(
    range,
    (typedSearchParams?.interval as Interval) || DEFAULT_INTERVAL
  )
  return (
    <div>
      <Card>
        <CardContent className="space-y-10 pt-6 lg:px-40 lg:py-14">
          <Suspense
            fallback={
              <div className="flex h-[27.5rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <StockChart ticker={ticker} range={range} interval={interval} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <FinanceSummary ticker={ticker} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[27.5rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <OpenInterest ticker={ticker} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <CompanySummaryCard ticker={ticker} />
          </Suspense>
          <Suspense
            fallback={
              <div className="flex h-[20rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <News ticker={ticker} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
