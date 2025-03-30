import AreaClosedCoinChart from "./AreaClosedCoinChart"
import { type KrakenInterval, type KrakenOHLCResponse, type QuoteError } from "@/lib/solana/fetchCoinQuote"
import { useMemo, memo } from "react"

interface CoinChartProps {
  ticker: string
  range: any
  interval?: KrakenInterval
  timeframeData: Record<any, {
    data: KrakenOHLCResponse | null
    error: QuoteError | null
  }>
}

// Add this utility function at the top
function isTimeframeAvailable(timeframeData: Record<any, {
  data: KrakenOHLCResponse | null
  error: QuoteError | null
}>, range: any) {
  const data = timeframeData[range]
  return data?.data?.result && !data?.error
}

// Modify the CoinChart component
const CoinChart = memo(function CoinChart({ ticker, range, timeframeData }: CoinChartProps) {
  const upperCaseTicker = useMemo(() => ticker.toUpperCase(), [ticker])

  // Add this to check available ranges
  const availableRanges = useMemo(() => {
    return Object.keys(timeframeData).filter(r =>
      isTimeframeAvailable(timeframeData, r)
    )
  }, [timeframeData])

  // If current range is unavailable, use the closest available range
  const effectiveRange = useMemo(() => {
    if (isTimeframeAvailable(timeframeData, range)) {
      return range
    }

    // Order ranges from shortest to longest
    const rangeOrder: any[] = ['1d', '1w', '1m', '3m', '1y']
    const currentIndex = rangeOrder.indexOf(range)

    // Try to find the closest available range
    let closestRange = range
    let distance = 1
    while (distance < rangeOrder.length) {
      // Try ranges both shorter and longer than current
      const shorterIndex = currentIndex - distance
      const longerIndex = currentIndex + distance

      if (shorterIndex >= 0 && availableRanges.includes(rangeOrder[shorterIndex])) {
        closestRange = rangeOrder[shorterIndex]
        break
      }
      if (longerIndex < rangeOrder.length && availableRanges.includes(rangeOrder[longerIndex])) {
        closestRange = rangeOrder[longerIndex]
        break
      }
      distance++
    }

    return closestRange
  }, [range, timeframeData, availableRanges])

  // Use effectiveRange instead of range for data access
  const { currentData, quotes, priceStats } = useMemo(() => {
    const currentData = timeframeData[effectiveRange]

    if (!currentData?.data?.result?.[`${upperCaseTicker}USD`]) {
      return { currentData, quotes: [], priceStats: null }
    }

    const data = currentData.data as KrakenOHLCResponse
    const quotes = data.result[`${upperCaseTicker}USD`].map(
      ([timestamp, , , , close]) => ({
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
  }, [timeframeData, effectiveRange, upperCaseTicker])

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
        No data available for {upperCaseTicker} on the {effectiveRange} timeframe
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="w-full">
      <div className="flex flex-col items-center w-full">
        <div className="space-x-1 w-full">
          <PriceHeader
            ticker={upperCaseTicker}
            priceStats={priceStats}
          />

          {effectiveRange !== range && (
            <div className="mt-2 text-sm text-muted-foreground">
              {range.toUpperCase()} data unavailable. Showing {effectiveRange.toUpperCase()} instead.
            </div>
          )}

          <AreaClosedCoinChart
            chartQuotes={quotes}
            range={effectiveRange}
            availableRanges={availableRanges}
          />
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
