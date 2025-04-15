import { formatNumber } from "@/lib/utils"

// Types
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

// Helper function to analyze Bitcoin trends
export function getBitcoinWeeklyTrend(btcData: any): BitcoinTrendResult {
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

// Component to display Bitcoin trend analysis
export default function BitcoinTrendAnalysis({ btcData }: { btcData: any }) {
  const bitcoinWeekly = getBitcoinWeeklyTrend(btcData)
  const bitcoinColor =
    bitcoinWeekly.trend === "bullish"
      ? "text-green-500 dark:text-green-400"
      : bitcoinWeekly.trend === "bearish"
        ? "text-red-500 dark:text-red-400"
        : "text-neutral-500 dark:text-neutral-400"

  return (
    <div className="p-4">
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Signals and Analysis */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-medium flex items-center justify-between">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">Bitcoin Trend Analysis</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${bitcoinWeekly.trend === 'bullish'
                    ? 'bg-green-500/10 text-green-500 dark:text-green-400'
                    : bitcoinWeekly.trend === 'bearish'
                      ? 'bg-red-500/10 text-red-500 dark:text-red-400'
                      : 'bg-neutral-500/10 text-neutral-500 dark:text-neutral-400'
                    }`}>
                    {bitcoinWeekly.trend.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 ${bitcoinWeekly.tradingSignal === 'strong_buy'
                    ? 'bg-green-500/20 text-green-500 dark:text-green-400 font-medium'
                    : bitcoinWeekly.tradingSignal === 'buy'
                      ? 'bg-green-500/10 text-green-500 dark:text-green-400'
                      : bitcoinWeekly.tradingSignal === 'strong_sell'
                        ? 'bg-red-500/20 text-red-500 dark:text-red-400 font-medium'
                        : bitcoinWeekly.tradingSignal === 'sell'
                          ? 'bg-red-500/10 text-red-500 dark:text-red-400'
                          : 'bg-neutral-500/10 text-neutral-500 dark:text-neutral-400'
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
                        ? 'text-yellow-500 dark:text-yellow-400'
                        : value === 'low'
                          ? 'text-blue-500 dark:text-blue-400'
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
  )
} 