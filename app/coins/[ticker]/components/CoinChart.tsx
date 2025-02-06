import { cn } from "@/lib/utils"
// import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
// import type { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedCoinChart from "./AreaClosedCoinChart"
// import yahooFinance from "yahoo-finance2"
import { fetchCoinQuote } from "@/lib/solana/fetchCoinQuote"
import { type KrakenRange, type KrakenInterval, type KrakenOHLCResponse, type QuoteError } from "@/lib/solana/fetchCoinQuote"
import { useMemo, memo, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
// import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"

interface CoinChartProps {
  ticker: string
  range: KrakenRange
  interval?: KrakenInterval
  timeframeData: Record<KrakenRange, {
    data: KrakenOHLCResponse | null
    error: QuoteError | null
  }>
}

const rangeTextMapping = {
  "1d": "",
  "1w": "Past Week",
  "1m": "Past Month",
  "3m": "Past 3 Months",
  "1y": "Past Year",
}

function calculatePriceChangePercentage(qouteClose: number, currentPrice: number) {
  const firstItemPrice = qouteClose || 0
  return ((currentPrice - firstItemPrice) / firstItemPrice) * 100
}

function calculatePriceChangeUsd(qouteClose: number, currentPrice: number) {
  const firstItemPrice = qouteClose || 0
  return currentPrice - firstItemPrice
}

// Add a loading component
const ChartSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-end justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <Skeleton className="h-[350px] w-full" />
  </div>
)

// Modify the CoinChart component to use React.memo
const CoinChart = memo(function CoinChart({ ticker, range, timeframeData }: CoinChartProps) {
  const upperCaseTicker = useMemo(() => ticker.toUpperCase(), [ticker])
  
  // Memoize the current timeframe data processing
  const { currentData, quotes, priceStats } = useMemo(() => {
    const currentData = timeframeData[range]
    
    if (!currentData?.data?.result?.[`${upperCaseTicker}USD`]) {
      return { currentData, quotes: [], priceStats: null }
    }

    const data = currentData.data as KrakenOHLCResponse
    const quotes = data.result[`${upperCaseTicker}USD`].map(
      ([timestamp, open, high, low, close]) => ({
        date: new Date(timestamp * 1000),
        close: parseFloat(close)
      })
    )

    const lastQuote = data.result[`${upperCaseTicker}USD`][quotes.length - 1]
    const currentPrice = Number(lastQuote[4])
    const firstPrice = Number(quotes[0].close)
    
    const priceStats = {
      priceChangePercentage: ((currentPrice - firstPrice) / firstPrice) * 100,
      priceChangeUsd: currentPrice - firstPrice,
      currentPrice
    }

    return { currentData, quotes, priceStats }
  }, [timeframeData, range, upperCaseTicker])

  // Handle error state
  if (currentData?.error) {
    return (
      <div className="flex h-80 items-center justify-center text-destructive">
        Error: {currentData.error.message}
      </div>
    )
  }

  // Handle loading/no data state
  if (!quotes.length || !priceStats) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No data available for {upperCaseTicker} on the {range} timeframe
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      <div className="flex flex-row items-end justify-between">
        <div className="space-x-1">
          <PriceHeader 
            ticker={upperCaseTicker}
            priceStats={priceStats}
          />

          <Suspense fallback={<ChartSkeleton />}>
            <AreaClosedCoinChart chartQuotes={quotes} range={range} />
          </Suspense>
        </div>
      </div>
    </div>
  )
})

// Extract PriceHeader to its own memoized component
const PriceHeader = memo(function PriceHeader({ 
  ticker, 
  priceStats 
}: { 
  ticker: string
  priceStats: { currentPrice: number; priceChangeUsd: number; priceChangePercentage: number } | null
}) {
  if (!priceStats) return null
  
  return (
    <span className="text-nowrap">
      <span className="text-xl font-bold">
        {ticker}{" "}
        <span className="text-muted-foreground">·{" "}</span>
        <span suppressHydrationWarning>${priceStats.currentPrice.toFixed(2)}</span>{" "}
      </span>
      <PriceChange priceStats={priceStats} />
    </span>
  )
})

// Extract price change display to its own memoized component
const PriceChange = memo(function PriceChange({ 
  priceStats 
}: { 
  priceStats: { priceChangeUsd: number; priceChangePercentage: number }
}) {
  const isPositive = priceStats.priceChangePercentage > 0
  const colorClass = isPositive ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-500"
  
  return (
    <span className="font-semibold">
      <span className="text-muted-foreground">·{" "}</span>
      <span suppressHydrationWarning className={colorClass}>
        {isPositive && "+"}
        {priceStats.priceChangeUsd.toFixed(2)}{" "}
        <span className="text-muted-foreground">
          ({isPositive && "+"}
          {priceStats.priceChangePercentage.toFixed(2)}%)
        </span>
      </span>
    </span>
  )
})

export default CoinChart
