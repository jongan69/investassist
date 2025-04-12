// React and Next.js imports
import { Suspense } from "react"

// External library imports
import yahooFinance from "yahoo-finance2"

// Internal component imports
import { DataTable } from "@/components/stocks/markets/data-table"
import { columns } from "@/components/stocks/markets/columns"
import MarketsChart from "@/components/chart/MarketsChart"
import SectorPerformance from "@/components/stocks/SectorPerformance"
import MarketSummary from '@/components/stocks/MarketSummary'
import CryptoTrends from "@/components/crypto/Trends"
import NewsSection from "@/components/NewsSection"
import TrendingStocks from "@/components/stocks/Trending"
import { LiveTrades } from "@/components/crypto/LiveTrades/LiveTrades"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Internal utility/type imports
import { DEFAULT_INTERVAL, DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
import { Interval } from "@/types/yahoo-finance"
import {
  validateInterval,
  validateRange,
} from "@/lib/yahoo-finance/fetchChartData"
import { fetchStockSearch } from "@/lib/yahoo-finance/fetchStockSearch"
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"
import { fetchSectorPerformance } from "@/lib/yahoo-finance/fetchSectorPerformance"
import { tickersFutures, tickerAfterOpen, isMarketOpen, processBatch } from "@/lib/utils"
import { fetchStockNews } from "@/lib/alpaca/fetchStockNews"
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest"
import { fetchWithTimeout, handleApiError } from "@/lib/utils"
import { TrendingTopics } from "@/components/crypto/Trends/TrendingTopics"
import RealEstateMarketTrends from "@/components/realestate/RealEstateMarketTrends"
import { CarPriceIndex } from "@/components/automotive/CarPriceIndex"
import BoxOffice from "@/components/crypto/BoxOffice"
import TrumpPosts from "@/components/truthsocial/TrumpPosts"

// Add route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30 // Increase timeout to 30 seconds

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

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
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

  const interval = validateInterval(
    range,
    ((Array.isArray(params?.interval) ? params.interval[0] : params.interval) || DEFAULT_INTERVAL) as Interval
  )

  // Split data fetching into smaller chunks
  const [marketData, latestNews] = await Promise.all([
    Promise.allSettled(
      tickers.map(({ symbol }) => yahooFinance.quoteCombine(symbol))
    ).then(results => results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
    ),
    fetchStockNews()
  ])

  const resultsWithTitles = marketData.map((result, index) => ({
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

  return (
    <div className="flex flex-col gap-4 max-w-[2000px] mx-auto px-4">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-gradient">Invest Assist</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <Card className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="z-50 w-fit rounded-full px-4 py-2 font-medium dark:bg-neutral-100/5 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  <Suspense fallback={<div className="animate-pulse h-6 w-32 bg-muted rounded" />}>
                    The markets are{" "}
                    <strong className={`${sentimentColor} transition-colors duration-300`}>{marketSentiment}</strong>

                    {btcData && (
                      <span className="ml-2 transition-all duration-300 hover:scale-105">and Bitcoin is <strong className={`${bitcoinColor} transition-colors duration-300`}>{bitcoinWeekly.trend}</strong>{" "}
                        <span className={`${bitcoinColor} transition-colors duration-300`}>
                          ({bitcoinWeekly.percentage > 0 ? "+" : ""}
                          {bitcoinWeekly.percentage.toFixed(2)}%)
                        </span>
                      </span>
                    )}
                  </Suspense>
                </CardTitle>
              </CardHeader>
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <SectorPerformanceWrapper />
              </Suspense>
              {/* Bitcoin Trend Analysis */}
              {btcData && (
                <div className="px-6 sm:px-4">
                  <div className="rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column - Signals and Analysis */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-3 text-sm font-medium flex items-center justify-between">
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Bitcoin Trend Analysis</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${bitcoinWeekly.trend === 'bullish'
                                ? 'bg-green-500/10 text-green-500'
                                : bitcoinWeekly.trend === 'bearish'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-neutral-500/10 text-neutral-500'
                                }`}>
                                {bitcoinWeekly.trend.toUpperCase()}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${bitcoinWeekly.tradingSignal === 'strong_buy'
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

                          {/* Signal Reasoning */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                              <span>Signal Analysis</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted animate-pulse">
                                Confidence: {bitcoinWeekly.signalStrength.toFixed(1)} / 5
                              </span>
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {bitcoinWeekly.signalReasons.map((reason, index) => (
                                <div key={index} className="p-2 rounded-lg bg-card/50 transition-all duration-300 hover:bg-card/80 hover:shadow-sm">
                                  <span className="text-muted-foreground">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Technical Signals */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <span>Technical Signals</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted animate-pulse">
                              {Object.entries(bitcoinWeekly.signals)
                                .filter(([key]) => key !== 'volatility')
                                .filter(([, value]) => value === 'bullish').length} / 8 Bullish
                            </span>
                          </h4>
                          <div className="grid gap-2">
                            {Object.entries(bitcoinWeekly.signals).map(([signal, value]) => (
                              <div key={signal}
                                className={`space-y-1 p-2 rounded-lg transition-all duration-300 hover:shadow-sm hover:scale-[1.02] ${value === 'high'
                                  ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
                                  : value === 'low'
                                    ? 'bg-blue-500/5 hover:bg-blue-500/10'
                                    : value === 'bullish'
                                      ? 'bg-green-500/5 hover:bg-green-500/10'
                                      : value === 'bearish'
                                        ? 'bg-red-500/5 hover:bg-red-500/10'
                                        : 'bg-neutral-500/5 hover:bg-neutral-500/10'
                                  }`}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="capitalize font-medium">
                                    {signal.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span className={`transition-colors duration-300 ${value === 'high'
                                    ? 'text-yellow-500'
                                    : value === 'low'
                                      ? 'text-blue-500'
                                      : value === 'bullish'
                                        ? 'text-green-500 dark:text-green-400'
                                        : value === 'bearish'
                                          ? 'text-red-500 dark:text-red-400'
                                          : 'text-muted-foreground'
                                    }`}>
                                    {value}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground/80">
                                  {signal === 'priceVs50dma' && `${value === 'bullish' ? 'Price is above' : 'Price is below'} the 50-day average - ${value === 'bullish' ? 'indicating' : 'suggesting'} short-term ${value === 'bullish' ? 'strength' : 'weakness'}`}
                                  {signal === 'priceVs200dma' && `${value === 'bullish' ? 'Price is above' : 'Price is below'} the 200-day average - ${value === 'bullish' ? 'indicating' : 'suggesting'} long-term ${value === 'bullish' ? 'strength' : 'weakness'}`}
                                  {signal === 'goldenCross' && `${value === 'bullish' ? 'Golden Cross pattern active' : 'Death Cross pattern active'} - ${value === 'bullish' ? 'suggesting' : 'indicating'} a ${value === 'bullish' ? 'bullish' : 'bearish'} trend`}
                                  {signal === 'weeklyMomentum' && `${value === 'bullish' ? 'Strong' : value === 'bearish' ? 'Weak' : 'Neutral'} weekly momentum - ${value === 'bullish' ? 'showing' : value === 'bearish' ? 'indicating' : 'suggesting'} ${value === 'bullish' ? 'positive' : value === 'bearish' ? 'negative' : 'stable'} short-term movement`}
                                  {signal === 'yearlyPerformance' && `${value === 'bullish' ? 'Positive' : 'Negative'} year-over-year performance - ${value === 'bullish' ? 'showing' : 'indicating'} ${value === 'bullish' ? 'strong' : 'weak'} long-term growth`}
                                  {signal === 'volumeTrend' && `${value === 'bullish' ? 'Above' : value === 'bearish' ? 'Below' : 'Near'} average trading volume - ${value === 'bullish' ? 'indicating' : value === 'bearish' ? 'suggesting' : 'showing'} ${value === 'bullish' ? 'strong' : value === 'bearish' ? 'weak' : 'normal'} market interest`}
                                  {signal === 'priceAboveOpen' && `${value === 'bullish' ? 'Price is above' : 'Price is below'} today's opening - ${value === 'bullish' ? 'showing' : 'indicating'} ${value === 'bullish' ? 'positive' : 'negative'} daily momentum`}
                                  {signal === 'dailyMomentum' && `${value === 'bullish' ? 'Strong' : value === 'bearish' ? 'Weak' : 'Moderate'} daily price movement - ${value === 'bullish' ? 'showing' : value === 'bearish' ? 'indicating' : 'suggesting'} ${value === 'bullish' ? 'positive' : value === 'bearish' ? 'negative' : 'stable'} immediate strength`}
                                  {signal === 'volatility' && `${value === 'high' ? 'High' : value === 'low' ? 'Low' : 'Normal'} price volatility - ${value === 'high' ? 'indicating' : value === 'low' ? 'suggesting' : 'showing'} ${value === 'high' ? 'increased' : value === 'low' ? 'reduced' : 'stable'} market uncertainty`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Key Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-medium text-muted-foreground">Key Metrics</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(bitcoinWeekly.metrics).map(([key, value]) => (
                            <div key={key} className="space-y-1 p-2 rounded-lg bg-card/50 transition-all duration-300 hover:shadow-sm hover:scale-[1.02]">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className={`transition-colors duration-300 ${typeof value === 'number' && value > 0
                                  ? 'text-green-500 dark:text-green-400'
                                  : typeof value === 'number' && value < 0
                                    ? 'text-red-500 dark:text-red-400'
                                    : 'text-muted-foreground'
                                  }`}>
                                  {key === 'averageDailyVolume' || key === 'marketCap'
                                    ? formatNumber(value)
                                    : typeof value === 'number'
                                      ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
                                      : value}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground/80">
                                {key === 'marketCap' ? 'Total market value' : 'Performance metric'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <RealEstateMarketTrends />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <CarPriceIndex />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
              <TrendingTopics />
            </Suspense>
            <div className="flex flex-col">
              <div className="px-6 sm:px-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <MarketSummaryWrapper
                    sentimentColor={sentimentColor}
                  />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <TrendingStocksWrapper latestNews={latestNews} />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <NewsSectionWrapper ticker={ticker} />
                </Suspense>
              </div>

              <div className="px-6 sm:px-4 mt-4">
                <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}>
                  <TrumpPosts />
                </Suspense>
              </div>
            </div>

            <div
              className={`pointer-events-none absolute inset-0 z-0 h-[65%] w-[65%] -translate-x-[10%] -translate-y-[30%] rounded-full blur-3xl transition-all duration-500 ${sentimentBackground}`}
            />
          </Card>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
            <CryptoTrends data={resultsWithTitles} />
          </Suspense>
          <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
            <BoxOffice />
          </Suspense>
          <Card className="rounded-md border-none transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-lg" />}>
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Live Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveTrades />
              </CardContent>
            </Suspense>
          </Card>
        </div>
      </div>
      <div>
        <h2 className="py-4 text-xl font-medium bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Markets</h2>
        <Card className="flex flex-col gap-4 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <DataTable columns={columns as any} data={resultsWithTitles} />
              </Suspense>
            </div>
            <div className="w-full">
              <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
                <MarketsChart ticker={ticker} range={range} interval={interval} />
              </Suspense>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Wrapper components for streaming
async function MarketSummaryWrapper({
  sentimentColor
}: {
  sentimentColor: string
}) {
  try {
    const [fearGreedValue, sectorPerformance] = await Promise.allSettled([
      fetchWithTimeout(fetchFearGreedIndex(), 5000),
      fetchWithTimeout(fetchSectorPerformance(), 5000)
    ]);

    // Handle individual failures
    if (fearGreedValue.status === 'rejected') {
      console.error('Failed to fetch fear greed index:', fearGreedValue.reason);
    }
    if (sectorPerformance.status === 'rejected') {
      console.error('Failed to fetch sector performance:', sectorPerformance.reason);
    }

    // If both requests failed, show error message
    if (fearGreedValue.status === 'rejected' && sectorPerformance.status === 'rejected') {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load market summary data. Please try again later.
          </div>
        </div>
      );
    }

    // Use available data even if one request failed
    const validFearGreedValue = fearGreedValue.status === 'fulfilled' ? fearGreedValue.value : null;
    const validSectorPerformance = sectorPerformance.status === 'fulfilled' ? sectorPerformance.value : null;

    if (!validFearGreedValue || !validSectorPerformance || validSectorPerformance.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Market summary data is incomplete. Please try again later.
          </div>
        </div>
      );
    }

    return (
      <MarketSummary
        sentimentColor={sentimentColor}
        fearGreedValue={validFearGreedValue}
        sectorPerformance={validSectorPerformance}
      />
    );
  } catch (error) {
    const { message, isTimeout } = handleApiError(error);
    console.error('Error in MarketSummaryWrapper:', error);

    return (
      <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {message}
          {isTimeout && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
}

async function TrendingStocksWrapper({ latestNews }: { latestNews: any[] }) {
  try {
    if (!latestNews || !Array.isArray(latestNews)) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load trending stocks data.
          </div>
        </div>
      );
    }

    // Limit the number of news items to process and filter out invalid ones
    const limitedNews = latestNews
      .filter((newsArticle: any) =>
        newsArticle.symbols &&
        newsArticle.symbols.length > 0 &&
        // Filter out crypto and other non-stock symbols
        !newsArticle.symbols.some((symbol: string) =>
          symbol.includes('USD') ||
          symbol.includes('BTC') ||
          symbol.includes('ETH') ||
          symbol.length > 5
        )
      )
      .slice(0, 2); // Process only top 2 valid news items to ensure we stay within time limit

    if (limitedNews.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            No trending stocks with news available at the moment.
          </div>
        </div>
      );
    }

    // Get unique symbols to avoid duplicate API calls
    const uniqueSymbols = Array.from(new Set(
      limitedNews.flatMap((newsArticle: any) => newsArticle.symbols)
    ));

    // Process symbols in smaller batches with strict timeouts
    const highOiOptions = await processBatch(
      uniqueSymbols,
      (symbol: string) => getHighOpenInterestContracts(symbol, 'call'),
      1, // Process 1 symbol at a time to minimize failures
      5000, // 5 second timeout per call
      2, // Max 2 retries
      1000, // Start with 1 second delay
      25000 // Global timeout of 25 seconds
    );

    // If no valid options data, show error message
    if (highOiOptions.length === 0) {
      return (
        <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Unable to load options data. Please try again later.
          </div>
        </div>
      );
    }

    return <TrendingStocks data={{ news: limitedNews, highOiOptions }} />;
  } catch (error) {
    const { message, isTimeout } = handleApiError(error);
    console.error('Error in TrendingStocksWrapper:', error);

    return (
      <div className="prose prose-sm max-w-full p-5 font-roboto bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <div className="text-center text-gray-600 dark:text-gray-400">
          {message}
          {isTimeout && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }
}

async function NewsSectionWrapper({ ticker }: { ticker: string }) {
  const news = await fetchStockSearch(ticker, 100)
  return <NewsSection news={news.news} />
}

async function SectorPerformanceWrapper() {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-lg">Sector Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <SectorPerformance />
      </CardContent>
    </Card>
  )
}