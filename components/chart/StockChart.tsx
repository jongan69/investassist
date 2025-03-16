import { cn } from "@/lib/utils"
import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
import type { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedChart from "./AreaClosedChart"
import yahooFinance from "yahoo-finance2"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"

interface StockGraphProps {
  ticker: string
  range: Range
  interval: Interval
}

const rangeTextMapping = {
  "1d": "",
  "1w": "Past Week",
  "1m": "Past Month",
  "3m": "Past 3 Months",
  "1y": "Past Year",
}

function calculatePriceChange(qouteClose: number, currentPrice: number) {
  const firstItemPrice = qouteClose || 0
  return ((currentPrice - firstItemPrice) / firstItemPrice) * 100
}

export default async function StockChart({
  ticker,
  range,
  interval,
}: StockGraphProps) {
  const decodedTicker = decodeURIComponent(ticker)

  const chartData = await fetchChartData(decodedTicker, range, interval)
  const quoteData = await fetchQuote(decodedTicker)

  const [chart, quote] = await Promise.all([chartData, quoteData])

  if (quote.error || !quote.data) {
    return <div>Error loading quote data for {ticker}</div>
  }

  const quoteInfo = quote.data

  const priceChange =
    chart.quotes.length &&
    calculatePriceChange(
      Number(chart.quotes[0].close),
      Number(chart.meta.regularMarketPrice)
    )

  const ChartQuotes = chart.quotes
    .map((quote) => ({
      date: quote.date,
      close: quote.close?.toFixed(2),
    }))
    .filter((quote) => quote.close !== undefined && quote.date !== null)

  console.log('chart.quotes', chart.quotes)
  return (
    <div className="h-[27.5rem] w-full">
      <div>
        <div className="space-x-1 text-muted-foreground">
          <span className="font-bold text-primary">{quoteInfo.symbol}</span>
          <span>·</span>
          <span>
            {quoteInfo.fullExchangeName === "NasdaqGS"
              ? "NASDAQ"
              : quoteInfo.fullExchangeName}
          </span>
          <span>{quoteInfo.shortName}</span>
        </div>

        <div className="flex flex-row items-end justify-between">
          <div className="space-x-1">
            <span className="text-nowrap">
              <span className="text-xl font-bold">
                {quoteInfo.currency === "USD" ? "$" : ""}
                {quoteInfo.regularMarketPrice?.toFixed(2)}
              </span>
              <span className="font-semibold">
                {quoteInfo.regularMarketChange &&
                quoteInfo.regularMarketChangePercent !== undefined ? (
                  quoteInfo.regularMarketChange > 0 ? (
                    <span className="text-green-800 dark:text-green-400">
                      +{quoteInfo.regularMarketChange.toFixed(2)} (+
                      {quoteInfo.regularMarketChangePercent.toFixed(2)}%)
                    </span>
                  ) : (
                    <span className="text-red-800 dark:text-red-500">
                      {quoteInfo.regularMarketChange.toFixed(2)} (
                      {quoteInfo.regularMarketChangePercent.toFixed(2)}%)
                    </span>
                  )
                ) : null}
              </span>
            </span>
            <span className="inline space-x-1 font-semibold text-muted-foreground">
              {quoteInfo.preMarketChange && quoteInfo.postMarketPrice && (
                <>
                  <span>·</span>
                  <span>
                    Post-Market: {quoteInfo.currency === "USD" ? "$" : ""}
                    {quoteInfo.postMarketPrice.toFixed(2)}
                  </span>
                  <span>
                    {quoteInfo.postMarketChange &&
                    quoteInfo.postMarketChangePercent !== undefined ? (
                      quoteInfo.postMarketChange > 0 ? (
                        <span className="text-green-800 dark:text-green-400">
                          +{quoteInfo.postMarketChange.toFixed(2)} (+
                          {quoteInfo.postMarketChangePercent.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-red-800 dark:text-red-500">
                          {quoteInfo.postMarketChange.toFixed(2)} (
                          {quoteInfo.postMarketChangePercent.toFixed(2)}%)
                        </span>
                      )
                    ) : null}
                  </span>
                </>
              )}
              {quoteInfo.preMarketChange && quoteInfo.preMarketPrice && (
                <>
                  <span>·</span>
                  <span>
                    Pre-Market: {quoteInfo.currency === "USD" ? "$" : ""}
                    {quoteInfo.preMarketPrice.toFixed(2)}
                  </span>
                  <span>
                    {quoteInfo.preMarketChange &&
                    quoteInfo.preMarketChangePercent !== undefined ? (
                      quoteInfo.preMarketChange > 0 ? (
                        <span className="text-green-800 dark:text-green-400">
                          +{quoteInfo.preMarketChange.toFixed(2)} (+
                          {quoteInfo.preMarketChangePercent.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-red-800 dark:text-red-500">
                          {quoteInfo.preMarketChange.toFixed(2)} (
                          {quoteInfo.preMarketChangePercent.toFixed(2)}%)
                        </span>
                      )
                    ) : null}
                  </span>
                </>
              )}
            </span>
          </div>
    
          <span className="flex flex-col sm:flex-row sm:items-center sm:space-x-1 whitespace-nowrap font-semibold text-[10px] xs:text-xs sm:text-base">
            {priceChange !== 0 && rangeTextMapping[range] !== "" && (
              <span
                className={cn(
                  priceChange > 0
                    ? "text-green-800 dark:text-green-400"
                    : "text-red-800 dark:text-red-500"
                )}
              >
                {priceChange > 0
                  ? `+${priceChange.toFixed(2)}%`
                  : `${priceChange.toFixed(2)}%`}
              </span>
            )}
            <span className="text-muted-foreground">
              {rangeTextMapping[range]}
            </span>
          </span>
        </div>
      </div>
      {chart.quotes.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-neutral-500">
          No Quote Data Was Available for {decodedTicker}
        </div>
      )}
      {chart.quotes.length > 0 && (
        <AreaClosedChart chartQuotes={ChartQuotes} range={range} />
      )}
    </div>
  )
}
