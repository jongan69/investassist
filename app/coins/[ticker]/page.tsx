import News from "@/app/stocks/[ticker]/components/News"
import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"
import type { Metadata } from "next"
import { type KrakenInterval, fetchAllTimeframes } from "@/lib/solana/fetchCoinQuote"
import { getDexScreenerData } from "@/lib/solana/fetchDexData"
import CoinChart from "@/app/coins/[ticker]/components/CoinChart"
import { Skeleton } from "@/components/ui/skeleton"
import DexSummary from "./components/DexSummary"
import { getTokenInfoFromTicker } from "@/lib/solana/fetchTokenInfoFromTicker"
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

export default async function CoinsPage({ params, searchParams }: Props) {
  const ticker = (await params).ticker
  const typedSearchParams = await searchParams
  const ca = typedSearchParams?.ca as string || null
  const hasCa = ca ? true : false
  const range = typedSearchParams?.range || '1d'
  const interval = typedSearchParams?.interval || '1m'

  const allTimeframeData = await fetchAllTimeframes(`${ticker}USD`)
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
                interval={interval as any}
                timeframeData={allTimeframeData.data}
              />}
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
