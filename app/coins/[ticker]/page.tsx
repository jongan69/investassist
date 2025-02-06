import StockChart from "@/components/chart/StockChart"
import CompanySummaryCard from "@/app/stocks/[ticker]/components/CompanySummaryCard"
import FinanceSummary from "@/app/stocks/[ticker]/components/FinanceSummary"
import News from "@/app/stocks/[ticker]/components/News"
import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"
import type { Metadata } from "next"
// import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"
import { type KrakenRange, type KrakenInterval, fetchAllTimeframes, getDexScreenerData } from "@/lib/solana/fetchCoinQuote"
import CoinChart from "@/app/coins/[ticker]/components/CoinChart"
import { Skeleton } from "@/components/ui/skeleton"
import DexSummary from "./components/DexSummary"
// import { DelayedFallback } from "@/components/DelayedFallback"
import { getTokenInfoFromTicker } from "@/lib/solana/getTokenInfoFromTicker"
type Props = {
  params: Promise<any>
  searchParams: Promise<{
    ticker?: string
    range?: string
    interval?: string
    ca?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = (await params).ticker.toUpperCase()
  const ca = (await params).ca
  const hasCa = ca ? true : false
  const decodedTicker = decodeURIComponent(ticker)
  const price = hasCa ? await getDexScreenerData(ca) : await getTokenInfoFromTicker(decodedTicker)
  // console.log("price", price)
  // const allData = await fetchAllTimeframes(decodedTicker)

  // Get the latest price from 1d timeframe data
  // const dayData = allData.data?.["1d"]?.data?.result?.[`${decodedTicker}USD`]
  // // console.log("dayData", dayData)
  // const latestPrice = Array.isArray(dayData)
  //   ? Number(dayData[0]?.[4] || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })
  //   : "N/A"
  const latestPrice = price?.pairs[0]?.priceUsd || 'N/A'
  return {
    title: `${decodedTicker} Price: $${latestPrice}`,
    description: `Coin page for ${decodedTicker}`,
    keywords: [decodedTicker, "coins"],
  }
}

// Update the LoadingChart component
function LoadingChart() {
  return (
    <div className="space-y-8" suppressHydrationWarning>
      <div className="flex items-center justify-between opacity-50">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 bg-muted/50" />
          <Skeleton className="h-8 w-36 bg-muted/50" />
        </div>
        <div className="flex gap-1.5">
          {['1H', '1D', '1W', '1M', 'ALL'].map((_, i) => (
            <Skeleton key={i} className="h-7 w-12 bg-muted/50" />
          ))}
        </div>
      </div>

      <div className="relative h-[350px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="text-sm text-muted-foreground">Loading chart data...</div>
          </div>
        </div>
        <Skeleton className="h-full w-full bg-muted/25" />
      </div>
    </div>
  )
}

// Add this new component
// function DelayedFallback({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="transition-opacity duration-1000">
//       {children}
//     </div>
//   )
// }

export default async function CoinsPage({ params, searchParams }: Props) {
  const ticker = (await params).ticker
  const typedSearchParams = await searchParams
  const ca = typedSearchParams?.ca as string || null
  const hasCa = ca ? true : false
  const range = typedSearchParams?.range as KrakenRange || '1d'
  const interval = typedSearchParams?.interval as KrakenInterval || '1m'

  const allTimeframeData = await fetchAllTimeframes(ticker)

  // if (!allTimeframeData.data) {
  //   return <div>Error loading data</div>
  // }
  // console.log("allTimeframeData", allTimeframeData.data)
  return (
    <div suppressHydrationWarning>
      <Card>
        <CardContent className="space-y-10 pt-6 lg:px-40 lg:py-14">
          <Suspense
            fallback={
              <div className="flex h-[10rem] items-center justify-center text-muted-foreground ">
                Loading...
              </div>
            }
          >
            <DexSummary ticker={ticker} ca={ca || ''} hasCa={hasCa} />
          </Suspense>
          <Suspense fallback={
            <LoadingChart />
          }>
            {allTimeframeData.data && !allTimeframeData.data["1d"].error &&
              <CoinChart
                ticker={ticker}
                range={range}
                interval={interval}
                timeframeData={allTimeframeData.data}
              />}
          </Suspense>


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
