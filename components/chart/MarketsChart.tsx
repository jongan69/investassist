import { fetchChartData } from "@/lib/yahoo-finance/fetchChartData"
import { Interval, Range } from "@/types/yahoo-finance"
import AreaClosedChart from "./AreaClosedChart"
import { fetchQuote } from "@/lib/yahoo-finance/fetchQuote"

export default async function MarketsChart({
  ticker,
  range,
  interval,
}: {
  ticker: string
  range: Range
  interval: Interval
}) {
  const chartData = await fetchChartData(ticker, range, interval)
  const quoteData = await fetchQuote(ticker)

  const [chart, quote] = await Promise.all([chartData, quoteData])
  // console.log("chart", chart)
  // console.log("quote", quote)
  const stockQuotes = chart.quotes
    ? chart.quotes
        .map((quote) => ({
          date: quote.date,
          close: quote.close?.toFixed(2),
        }))
        .filter((quote) => quote.close !== undefined && quote.date !== null)
    : []

  // Check for quote error and handle it gracefully
  const quoteInfo = !quote.error ? (
    <div className="mb-0.5 font-medium">
      {quote.data.shortName} ({quote.data.symbol}){" "}
      {quote.data.regularMarketPrice?.toLocaleString(undefined, {
        style: "currency",
        currency: quote.data.currency,
      })}
    </div>
  ) : null

  return (
    <>
      {quoteInfo}
      {chart.quotes.length > 0 ? (
        <AreaClosedChart chartQuotes={stockQuotes} range={range} />
      ) : (
        <div className="flex h-full items-center justify-center text-center text-neutral-500">
          No data available
        </div>
      )}
    </>
  )
}
