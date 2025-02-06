import { cn } from "@/lib/utils"
// import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
// import type { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedCoinChart from "./AreaClosedCoinChart"
// import yahooFinance from "yahoo-finance2"
import { fetchCoinQuote } from "@/lib/solana/fetchCoinQuote"
import { type KrakenRange, type KrakenInterval, type KrakenOHLCResponse, type QuoteError } from "@/lib/solana/fetchCoinQuote"
import { useMemo } from "react"
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

export default function CoinChart({ ticker, range, timeframeData }: CoinChartProps) {
  // Get the data for the current range
  const upperCaseTicker = ticker.toUpperCase()
  const memoizedCurrentData = useMemo(() => timeframeData, [timeframeData])
  const currentData = memoizedCurrentData[range]

  if (!currentData?.data) {
    return <div>No data available for {upperCaseTicker} on the {range} range</div>
  }
  // console.log("currentData", currentData)
  // console.log("ticker", ticker)
  // console.log("currentData.data.result[`${upperCaseTicker}USD`]", currentData.data.result[`${upperCaseTicker}USD`])
  const quotes = currentData.data.result[`${upperCaseTicker}USD`]?.map(
    ([timestamp, open, high, low, close]) => ({
      date: new Date(timestamp * 1000),
      close: parseFloat(close)
    })
  ) || []

  const priceChangePercentage =
    quotes.length &&
    calculatePriceChangePercentage(
      Number(quotes[0].close),
      Number(currentData.data.result[`${upperCaseTicker}USD`][quotes.length - 1][4])
    )
  const priceChangeUsd =
    quotes.length &&
    calculatePriceChangeUsd(
      Number(quotes[0].close),
      Number(currentData.data.result[`${upperCaseTicker}USD`][quotes.length - 1][4])
    )
  console.log("priceChangePercentage", priceChangePercentage)
  // log("quotes", quotes)
  return (
    <div>
      <div className="flex flex-row items-end justify-between">
        <div className="space-x-1">
          <span className="text-nowrap">
            <span className="text-xl font-bold">
              {upperCaseTicker}{" "}
              <span className="text-muted-foreground">·{" "}</span>
              ${currentData.data.result[`${upperCaseTicker}USD`][quotes.length - 1][4]}{" "}
            </span>
            <span className="font-semibold">
              <span className="text-muted-foreground">·{" "}</span>
              {priceChangePercentage &&
                priceChangePercentage !== undefined ? (
                priceChangePercentage > 0 ? (
                  <span className="text-green-800 dark:text-green-400">
                    +{priceChangeUsd}{" "}
                    <span className="text-muted-foreground">
                      (+{priceChangePercentage.toFixed(2)}%)
                    </span>
                  </span>
                ) : (
                  <span className="text-red-800 dark:text-red-500">
                    {priceChangeUsd}{" "}
                    <span className="text-muted-foreground">
                      ({priceChangePercentage.toFixed(2)}%)
                    </span>
                  </span>
                )
              ) : null}
            </span>
          </span>

          <AreaClosedCoinChart chartQuotes={quotes} range={range} />
        </div>
      </div>
    </div>
  )
}
