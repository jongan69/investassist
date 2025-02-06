import StockChart from "@/components/chart/StockChart"
import CompanySummaryCard from "@/app/stocks/[ticker]/components/CompanySummaryCard"
import FinanceSummary from "@/app/stocks/[ticker]/components/FinanceSummary"
import News from "@/app/stocks/[ticker]/components/News"
import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"
import type { Metadata } from "next"
// import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"
import { type KrakenRange, type KrakenInterval, fetchAllTimeframes } from "@/lib/solana/fetchCoinQuote"
import CoinChart from "@/app/coins/[ticker]/components/CoinChart"
type Props = {
  params: Promise<any>
  searchParams: Promise<{
    ticker?: string
    range?: string
    interval?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = (await params).ticker.toUpperCase()
  const decodedTicker = decodeURIComponent(ticker)
  const allData = await fetchAllTimeframes(decodedTicker)
  
  // Get the latest price from 1d timeframe data
  const dayData = allData.data?.["1d"]?.data?.result?.[`${decodedTicker}USD`]
  // console.log("dayData", dayData)
  const latestPrice = Array.isArray(dayData) 
    ? Number(dayData[0]?.[4] || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "N/A"

  return {
    title: `${decodedTicker} ${latestPrice || 'N/A'}`,
    description: `Coin page for ${decodedTicker}`,
    keywords: [decodedTicker, "coins"],
  }
}

export default async function CoinsPage({ params, searchParams }: Props) {
  const ticker = (await params).ticker
  const typedSearchParams = await searchParams
  const range = typedSearchParams?.range as KrakenRange || '1d'
  const interval = typedSearchParams?.interval as KrakenInterval || '1m'
  
  const allTimeframeData = await fetchAllTimeframes(ticker)
  
  if (!allTimeframeData.data) {
    return <div>Error loading data</div>
  }

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
            <CoinChart 
              ticker={ticker} 
              range={range} 
              interval={interval}
              timeframeData={allTimeframeData.data} 
            />
          </Suspense>

          {/* <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <FinanceSummary ticker={ticker} />
          </Suspense> */}
          {/* <Suspense
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
          </Suspense> */}
        </CardContent>
      </Card>
    </div>
  )
}
