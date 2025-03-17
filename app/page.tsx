import { DataTable } from "@/components/stocks/markets/data-table"
import yahooFinance from "yahoo-finance2"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import { Interval } from "@/types/yahoo-finance"
import { Suspense } from "react"
import MarketsChart from "@/components/chart/MarketsChart"
import { columns } from "@/components/stocks/markets/columns"
import SectorPerformance from "@/components/stocks/SectorPerformance"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"
import { fetchStockSearch } from "@/lib/yahoo-finance/fetchStockSearch"
import MarketSummary from '@/components/stocks/MarketSummary';
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"
import { fetchSectorPerformance } from "@/lib/yahoo-finance/fetchSectorPerformance"
import CryptoTrends from "@/components/crypto/Trends"
import NewsSection from "@/components/NewsSection"
import { tickersFutures, tickerAfterOpen, isMarketOpen } from "@/lib/utils"
import InvestmentPlan from "@/components/crypto/InvestmentPlan"
import { fetchStockNews } from "@/lib/alpaca/fetchStockNews"
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest"
import TrendingStocks from "@/components/stocks/Trending"
import SmsAlert from "@/components/ui/sms-alert/SmsAlert"

function getMarketSentiment(changePercentage: number | undefined) {
  if (!changePercentage) {
    return "neutral"
  }
  if (changePercentage > 0.1) {
    return "bullish"
  } else if (changePercentage < -0.1) {
    return "bearish"
  } else {
    return "neutral"
  }
}

interface BitcoinTrendSignals {
  priceVs50dma: "bullish" | "bearish";
  priceVs200dma: "bullish" | "bearish";
  goldenCross: "bullish" | "bearish";
  weeklyMomentum: "bullish" | "bearish" | "neutral";
  yearlyPerformance: "bullish" | "bearish";
  volumeTrend: "bullish" | "bearish" | "neutral";
  priceAboveOpen: "bullish" | "bearish";
  dailyMomentum: "bullish" | "bearish" | "neutral";
  volatility: "high" | "low" | "normal";
}

type TradingSignal = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";

interface BitcoinTrendMetrics {
  priceVs50dma: number;
  priceVs200dma: number;
  distanceFromHigh: number;
  distanceFromLow: number;
  fiftyTwoWeekChange: number;
  dailyChange: number;
  volumeChange: number;
  averageDailyVolume: number;
  volatilityPercentage: number;
  marketCap: number;
}

interface BitcoinTrendResult {
  trend: "bullish" | "bearish" | "neutral";
  percentage: number;
  signals: BitcoinTrendSignals;
  metrics: BitcoinTrendMetrics;
  tradingSignal: TradingSignal;
  signalStrength: number;
  signalReasons: string[];
}

function getBitcoinWeeklyTrend(btcData: any): BitcoinTrendResult {
  if (!btcData) return {
    trend: "neutral",
    percentage: 0,
    signals: {
      priceVs50dma: "neutral" as "bullish",
      priceVs200dma: "neutral" as "bullish",
      goldenCross: "neutral" as "bullish",
      weeklyMomentum: "neutral",
      yearlyPerformance: "neutral" as "bullish",
      volumeTrend: "neutral",
      priceAboveOpen: "neutral" as "bullish",
      dailyMomentum: "neutral",
      volatility: "normal"
    },
    metrics: {
      priceVs50dma: 0,
      priceVs200dma: 0,
      distanceFromHigh: 0,
      distanceFromLow: 0,
      fiftyTwoWeekChange: 0,
      dailyChange: 0,
      volumeChange: 0,
      averageDailyVolume: 0,
      volatilityPercentage: 0,
      marketCap: 0
    },
    tradingSignal: "hold",
    signalStrength: 0,
    signalReasons: ["Insufficient data"]
  }

  const weeklyChange = btcData.regularMarketChangePercent
  const fiftyDayMA = btcData.fiftyDayAverage
  const twoHundredDayMA = btcData.twoHundredDayAverage
  const currentPrice = btcData.regularMarketPrice
  const fiftyTwoWeekHigh = btcData.fiftyTwoWeekHigh
  const fiftyTwoWeekLow = btcData.fiftyTwoWeekLow
  const fiftyTwoWeekChange = btcData.fiftyTwoWeekChangePercent
  const dailyChange = btcData.regularMarketChange
  const openPrice = btcData.regularMarketOpen
  const volume = btcData.regularMarketVolume
  const averageVolume = btcData.averageDailyVolume10Day
  const marketCap = btcData.marketCap
  const dayHigh = btcData.regularMarketDayHigh
  const dayLow = btcData.regularMarketDayLow

  // Calculate additional metrics
  const volumeChange = ((volume - averageVolume) / averageVolume) * 100
  const volatilityPercentage = ((dayHigh - dayLow) / openPrice) * 100

  // Determine trend based on multiple factors
  let trend: "bullish" | "bearish" | "neutral" = "neutral"
  const signals: BitcoinTrendSignals = {
    priceVs50dma: currentPrice > fiftyDayMA ? "bullish" : "bearish",
    priceVs200dma: currentPrice > twoHundredDayMA ? "bullish" : "bearish",
    goldenCross: fiftyDayMA > twoHundredDayMA ? "bullish" : "bearish",
    weeklyMomentum: weeklyChange > 3 ? "bullish" : weeklyChange < -3 ? "bearish" : "neutral",
    yearlyPerformance: fiftyTwoWeekChange > 0 ? "bullish" : "bearish",
    volumeTrend: volumeChange > 20 ? "bullish" : volumeChange < -20 ? "bearish" : "neutral",
    priceAboveOpen: currentPrice > openPrice ? "bullish" : "bearish",
    dailyMomentum: dailyChange > 1000 ? "bullish" : dailyChange < -1000 ? "bearish" : "neutral",
    volatility: volatilityPercentage > 5 ? "high" : volatilityPercentage < 2 ? "low" : "normal"
  }

  // Count bullish signals (excluding volatility which is not directional)
  const bullishCount = Object.entries(signals)
    .filter(([key]) => key !== 'volatility')
    .filter(([, value]) => value === "bullish").length
  const bearishCount = Object.entries(signals)
    .filter(([key]) => key !== 'volatility')
    .filter(([, value]) => value === "bearish").length

  if (bullishCount >= 4) {
    trend = "bullish"
  } else if (bearishCount >= 4) {
    trend = "bearish"
  }

  // Calculate distance from 52-week high and low
  const distanceFromHigh = ((fiftyTwoWeekHigh - currentPrice) / fiftyTwoWeekHigh) * 100
  const distanceFromLow = ((currentPrice - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 100

  // Calculate trading signal
  let signalPoints = 0;
  const signalReasons: string[] = [];

  // Technical Analysis Points
  if (currentPrice > fiftyDayMA) {
    signalPoints += 1;
    if (currentPrice > twoHundredDayMA) {
      signalPoints += 1;
      signalReasons.push("Price above both 50 & 200-day MA");
    }
  } else if (currentPrice < fiftyDayMA && currentPrice < twoHundredDayMA) {
    signalPoints -= 2;
    signalReasons.push("Price below both moving averages");
  }

  // Golden Cross / Death Cross
  if (fiftyDayMA > twoHundredDayMA) {
    signalPoints += 2;
    signalReasons.push("Golden Cross pattern active");
  } else {
    signalPoints -= 2;
    signalReasons.push("Death Cross pattern active");
  }

  // Volume Analysis
  if (volumeChange > 20) {
    signalPoints += 1;
    signalReasons.push("Strong volume support");
  } else if (volumeChange < -20) {
    signalPoints -= 1;
    signalReasons.push("Declining volume");
  }

  // Momentum
  if (weeklyChange > 3) {
    signalPoints += 1;
    signalReasons.push("Strong weekly momentum");
  } else if (weeklyChange < -3) {
    signalPoints -= 1;
    signalReasons.push("Weak weekly momentum");
  }

  // Distance from 52-week levels
  if (distanceFromHigh < 10) {
    signalPoints -= 1;
    signalReasons.push("Near 52-week high - potential resistance");
  }
  if (distanceFromLow < 10) {
    signalPoints += 1;
    signalReasons.push("Near 52-week low - potential support");
  }

  // Volatility consideration
  if (volatilityPercentage > 5) {
    signalPoints = signalPoints * 0.8; // Reduce confidence in high volatility
    signalReasons.push("High volatility - reduced confidence");
  }

  // Determine trading signal
  let tradingSignal: TradingSignal;
  if (signalPoints >= 4) {
    tradingSignal = "strong_buy";
  } else if (signalPoints >= 2) {
    tradingSignal = "buy";
  } else if (signalPoints <= -4) {
    tradingSignal = "strong_sell";
  } else if (signalPoints <= -2) {
    tradingSignal = "sell";
  } else {
    tradingSignal = "hold";
  }

  return {
    trend,
    percentage: weeklyChange,
    signals,
    metrics: {
      priceVs50dma: ((currentPrice - fiftyDayMA) / fiftyDayMA) * 100,
      priceVs200dma: ((currentPrice - twoHundredDayMA) / twoHundredDayMA) * 100,
      distanceFromHigh,
      distanceFromLow,
      fiftyTwoWeekChange,
      dailyChange,
      volumeChange,
      averageDailyVolume: averageVolume,
      volatilityPercentage,
      marketCap
    },
    tradingSignal,
    signalStrength: Math.abs(signalPoints),
    signalReasons
  }
}

interface Props {
  searchParams: Promise<any>
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams
  const tickers = isMarketOpen() ? tickerAfterOpen : tickersFutures
  const ticker = tickers[0].symbol || params.ticker
  const range = validateRange(
    (Array.isArray(params?.range) ? params.range[0] : params.range) || DEFAULT_RANGE
  )

  const latestNews = await fetchStockNews()
  const latestNewsSymbols = latestNews.filter((newsArticle: any) => newsArticle.symbols.length > 0)
  const highOiOptions = await Promise.all(
    latestNewsSymbols.flatMap((newsArticle: any) =>
      newsArticle.symbols.map((symbol: string) => getHighOpenInterestContracts(symbol, 'call'))
    )
  )

  // console.log(latestNews)

  const interval = validateInterval(
    range,
    ((Array.isArray(params?.interval) ? params.interval[0] : params.interval) || DEFAULT_INTERVAL) as Interval
  )

  const news = await fetchStockSearch("^DJI", 100)

  const promises = tickers.map(({ symbol }) =>
    yahooFinance.quoteCombine(symbol)
  )
  const results = await Promise.allSettled(promises)
    .then(results => results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
    );

  const resultsWithTitles = results.map((result, index) => ({
    ...result,
    shortName: tickers[index].shortName,
  }))

  const marketSentiment = getMarketSentiment(
    resultsWithTitles[0]?.regularMarketChangePercent
  )

  const btcData = resultsWithTitles.find(result => result.symbol === 'BTC-USD')
  const bitcoinWeekly = getBitcoinWeeklyTrend(btcData)
  const sentimentColor =
    marketSentiment === "bullish"
      ? "text-green-500"
      : marketSentiment === "bearish"
        ? "text-red-500"
        : "text-neutral-500"

  const bitcoinColor =
    bitcoinWeekly.trend === "bullish"
      ? "text-green-500"
      : bitcoinWeekly.trend === "bearish"
        ? "text-red-500"
        : "text-neutral-500"

  const sentimentBackground =
    marketSentiment === "bullish"
      ? "bg-green-500/10"
      : marketSentiment === "bearish"
        ? "bg-red-300/50 dark:bg-red-950/50"
        : "bg-neutral-500/10"

  const fearGreedValue = await fetchFearGreedIndex()
  const sectorPerformance = await fetchSectorPerformance()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Invest Assist</h1>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <Card className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden">
            <CardHeader>
              <CardTitle className="z-50 w-fit rounded-full px-4 py-2 font-medium dark:bg-neutral-100/5">
                The markets are{" "}
                <strong className={sentimentColor}>{marketSentiment}</strong>
                {btcData && (
                  <span className="ml-2">and Bitcoin is <strong className={bitcoinColor}>{bitcoinWeekly.trend}</strong>{" "}
                    <span className={bitcoinColor}>
                      ({bitcoinWeekly.percentage > 0 ? "+" : ""}
                      {bitcoinWeekly.percentage.toFixed(2)}%)
                    </span>
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            {/* Bitcoin Trend Analysis */}
            {btcData && (
              <div className="mb-4 px-6 sm:px-4">
                <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                  <h3 className="mb-3 text-sm font-medium flex items-center justify-between">
                    <span>Bitcoin Trend Analysis</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        bitcoinWeekly.trend === 'bullish'
                          ? 'bg-green-500/10 text-green-500'
                          : bitcoinWeekly.trend === 'bearish'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-neutral-500/10 text-neutral-500'
                      }`}>
                        {bitcoinWeekly.trend.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        bitcoinWeekly.tradingSignal === 'strong_buy'
                          ? 'bg-green-500/20 text-green-500 font-medium'
                          : bitcoinWeekly.tradingSignal === 'buy'
                            ? 'bg-green-500/10 text-green-500'
                            : bitcoinWeekly.tradingSignal === 'strong_sell'
                              ? 'bg-red-500/20 text-red-500 font-medium'
                              : bitcoinWeekly.tradingSignal === 'sell'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-neutral-500/10 text-neutral-500'
                      }`}>
                        {bitcoinWeekly.tradingSignal.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                  </h3>

                  <div className="grid gap-6 lg:grid-cols-2 lg:gap-4">
                    {/* Signal Reasoning */}
                    <div className="space-y-3 lg:col-span-2">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <span>Signal Analysis</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                          Confidence: {bitcoinWeekly.signalStrength.toFixed(1)} / 5
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {bitcoinWeekly.signalReasons.map((reason, index) => (
                          <div key={index} className="p-2 rounded-lg bg-card/50">
                            <span className="text-muted-foreground">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Signals */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <span>Technical Signals</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                          {Object.entries(bitcoinWeekly.signals)
                            .filter(([key]) => key !== 'volatility')
                            .filter(([, value]) => value === 'bullish').length} / 8 Bullish
                        </span>
                      </h4>
                      <div className="grid gap-3">
                        {Object.entries(bitcoinWeekly.signals).map(([signal, value]) => (
                          <div key={signal}
                            className={`space-y-1 p-2 rounded-lg transition-colors ${
                              value === 'high' 
                                ? 'bg-yellow-500/5'
                                : value === 'low'
                                  ? 'bg-blue-500/5'
                                  : value === 'bullish'
                                    ? 'bg-green-500/5'
                                    : value === 'bearish'
                                      ? 'bg-red-500/5'
                                      : 'bg-neutral-500/5'
                            }`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize font-medium">
                                {signal.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className={
                                value === 'high'
                                  ? 'text-yellow-500'
                                  : value === 'low'
                                    ? 'text-blue-500'
                                    : value === 'bullish'
                                      ? 'text-green-500 dark:text-green-400'
                                      : value === 'bearish'
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'text-muted-foreground'
                              }>
                                {value}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              {signal === 'priceVs50dma' && "Price compared to 50-day moving average - indicates short-term trend"}
                              {signal === 'priceVs200dma' && "Price compared to 200-day moving average - indicates long-term trend"}
                              {signal === 'goldenCross' && "50-day MA vs 200-day MA - classic trend reversal indicator"}
                              {signal === 'weeklyMomentum' && "Weekly price movement - shows short-term momentum"}
                              {signal === 'yearlyPerformance' && "Year-over-year performance - long-term market direction"}
                              {signal === 'volumeTrend' && "Volume compared to 10-day average - shows trading activity strength"}
                              {signal === 'priceAboveOpen' && "Current price vs today&apos;s opening - shows intraday momentum"}
                              {signal === 'dailyMomentum' && "Daily price change in absolute terms - short-term strength"}
                              {signal === 'volatility' && "Price range relative to opening - market stability indicator"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-muted-foreground">Key Metrics</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">vs 50-day MA</span>
                              <span className={bitcoinWeekly.metrics.priceVs50dma > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                                {bitcoinWeekly.metrics.priceVs50dma > 0 ? '+' : ''}
                                {bitcoinWeekly.metrics.priceVs50dma.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Short-term trend indicator
                            </p>
                          </div>

                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">vs 200-day MA</span>
                              <span className={bitcoinWeekly.metrics.priceVs200dma > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                                {bitcoinWeekly.metrics.priceVs200dma > 0 ? '+' : ''}
                                {bitcoinWeekly.metrics.priceVs200dma.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Long-term trend indicator
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">Volume Change</span>
                              <span className={bitcoinWeekly.metrics.volumeChange > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                                {bitcoinWeekly.metrics.volumeChange > 0 ? '+' : ''}
                                {bitcoinWeekly.metrics.volumeChange.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              vs 10-day average volume
                            </p>
                          </div>

                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">Daily Range</span>
                              <span className="text-muted-foreground">
                                {bitcoinWeekly.metrics.volatilityPercentage.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Today's trading range
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">From 52w High</span>
                              <span className="text-muted-foreground">
                                -{bitcoinWeekly.metrics.distanceFromHigh.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Distance from peak
                            </p>
                          </div>

                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">From 52w Low</span>
                              <span className="text-muted-foreground">
                                +{bitcoinWeekly.metrics.distanceFromLow.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Growth from bottom
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1 p-2 rounded-lg bg-card/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">Market Cap</span>
                              <span className="text-muted-foreground">
                                ${(bitcoinWeekly.metrics.marketCap / 1e9).toFixed(2)}B
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Total market value
                            </p>
                          </div>

                          <div className="space-y-1 p-2 rounded-lg bg-card/50 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">52-Week Change</span>
                              <span className={bitcoinWeekly.metrics.fiftyTwoWeekChange > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                                {bitcoinWeekly.metrics.fiftyTwoWeekChange > 0 ? '+' : ''}
                                {bitcoinWeekly.metrics.fiftyTwoWeekChange.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/80">
                              Yearly performance
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fearGreedValue && sectorPerformance && sectorPerformance?.length > 0 && (
              <MarketSummary
                sentimentColor={sentimentColor}
                fearGreedValue={fearGreedValue}
                sectorPerformance={sectorPerformance}
              />
            )}
            <Suspense fallback={<div>Loading...</div>}>
              {latestNews && highOiOptions && <TrendingStocks data={{ news: latestNews, highOiOptions }} />}
            </Suspense>
            <NewsSection news={news.news} />
            <div
              className={`pointer-events-none absolute inset-0 z-0 h-[65%] w-[65%] -translate-x-[10%] -translate-y-[30%] rounded-full blur-3xl ${sentimentBackground}`}
            />
          </Card>
        </div>
        <div className="w-full lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading...</div>}>
                <SectorPerformance />
              </Suspense>
            </CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <CryptoTrends data={resultsWithTitles} />
            </Suspense>
          </Card>
        </div>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium">Markets</h2>
        <Card className="flex flex-col gap-4 p-6 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <Suspense fallback={<div>Loading...</div>}>
              <DataTable columns={columns as any} data={resultsWithTitles} />
            </Suspense>
          </div>
          <div className="w-full lg:w-3/4">
            <Suspense fallback={<div>Loading...</div>}>
              <MarketsChart ticker={ticker} range={range} interval={interval} />
            </Suspense>
          </div>
        </Card>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium">SMS Alerts</h2>
        <SmsAlert />
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium">Investment Plan</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <InvestmentPlan
            initialData={resultsWithTitles}
            fearGreedValue={fearGreedValue}
            sectorPerformance={sectorPerformance}
          />
        </Suspense>
      </div>
    </div>
  )
}