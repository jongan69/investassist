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
  let [chartResult, quoteResult] = await Promise.allSettled([
    fetchChartData(ticker, range, interval),
    fetchQuote(ticker),
  ])

  let chartData = chartResult.status === "fulfilled" ? chartResult.value : null
  let quoteData = quoteResult.status === "fulfilled" ? quoteResult.value : null

  // If chartData fetch is successful but quotes are empty, attempt to fetch BTC-USD data and quote
  if (chartData && chartData.quotes.length === 0) {
    const [fallbackChartResult, fallbackQuoteResult] = await Promise.allSettled([
      fetchChartData("BTC-USD", range, interval),
      fetchQuote("BTC-USD"),
    ]);
    chartResult = fallbackChartResult;
    quoteResult = fallbackQuoteResult;
    chartData = chartResult.status === "fulfilled" ? chartResult.value : null
    quoteData = quoteResult.status === "fulfilled" ? quoteResult.value : null
  }

  const stockQuotes = chartData?.quotes
    ? chartData.quotes
        .map((quote) => ({
          date: quote.date,
          close: quote.close?.toFixed(2),
        }))
        .filter((quote) => quote.close !== undefined && quote.date !== null)
    : []

  // Check for quote error and handle it gracefully
  const quoteInfo = quoteData && !quoteData.error ? (
    <div className="mb-0.5 font-medium">
      {quoteData.data.shortName} ({quoteData.data.symbol}){" "}
      {quoteData.data.regularMarketPrice?.toLocaleString(undefined, {
        style: "currency",
        currency: quoteData.data.currency,
      })}
    </div>
  ) : null

  return (
    <>
      {quoteInfo}
      {chartData && chartData.quotes && chartData.quotes.length > 0 ? (
        <AreaClosedChart chartQuotes={stockQuotes} range={range} />
      ) : (
        <div className="flex h-full items-center justify-center text-center text-neutral-500">
          No data available
        </div>
      )}
    </>
  )
}