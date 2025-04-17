import { useMemo } from 'react';

// Types for candlestick data
export interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type PatternType = 'bullish' | 'bearish' | 'neutral';

// Types for pattern detection results
export interface PatternResult {
  pattern: string;
  type: PatternType;
  index: number;
  description: string;
}

// Memoized candle calculations
const calculateCandleMetrics = (candle: any) => {
  const bodySize = Math.abs(candle.close - candle.open);
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  const totalSize = candle.high - candle.low;
  const bodyRatio = totalSize > 0 ? bodySize / totalSize : 0;
  const upperWickRatio = totalSize > 0 ? upperWick / totalSize : 0;
  const lowerWickRatio = totalSize > 0 ? lowerWick / totalSize : 0;
  const isBullish = candle.close > candle.open;
  
  return {
    bodySize,
    upperWick,
    lowerWick,
    totalSize,
    bodyRatio,
    upperWickRatio,
    lowerWickRatio,
    isBullish
  };
};

// Optimized pattern detection functions
const checkDoji = (metrics: ReturnType<typeof calculateCandleMetrics>) => {
  return metrics.bodyRatio < 0.1 && 
         metrics.upperWickRatio > 0.4 && 
         metrics.lowerWickRatio > 0.4;
};

const checkSpinningTop = (metrics: ReturnType<typeof calculateCandleMetrics>) => {
  return metrics.bodyRatio < 0.3 && 
         metrics.upperWickRatio > 0.3 && 
         metrics.lowerWickRatio > 0.3;
};

const checkMarubozu = (metrics: ReturnType<typeof calculateCandleMetrics>) => {
  return metrics.bodyRatio > 0.6 && 
         metrics.upperWickRatio < 0.1 && 
         metrics.lowerWickRatio < 0.1;
};

const checkHammer = (metrics: ReturnType<typeof calculateCandleMetrics>) => {
  return metrics.bodyRatio < 0.3 && 
         metrics.lowerWickRatio > 0.6 && 
         metrics.upperWickRatio < 0.1;
};

const checkShootingStar = (metrics: ReturnType<typeof calculateCandleMetrics>) => {
  return metrics.bodyRatio < 0.3 && 
         metrics.upperWickRatio > 0.6 && 
         metrics.lowerWickRatio < 0.1;
};

// Main pattern detection function
export const detectCandlestickPatterns = (data: any[]): PatternResult[] => {
  if (!data || data.length < 3) return [];
  
  const patterns: PatternResult[] = [];
  const metricsCache = new Map<number, ReturnType<typeof calculateCandleMetrics>>();
  
  // Pre-calculate metrics for all candles
  for (let i = 0; i < data.length; i++) {
    metricsCache.set(i, calculateCandleMetrics(data[i]));
  }
  
  // Detect patterns
  for (let i = 0; i < data.length; i++) {
    const currentMetrics = metricsCache.get(i)!;
    const current = data[i];
    
    // Single candle patterns
    if (checkDoji(currentMetrics)) {
      patterns.push({
        pattern: 'Doji',
        type: 'neutral',
        index: i,
        description: 'A Doji forms when the opening and closing prices are virtually equal. The candlestick has a very small body with upper and lower wicks of similar length. This pattern indicates market indecision and potential trend reversal.'
      });
      continue;
    }
    
    if (checkSpinningTop(currentMetrics)) {
      patterns.push({
        pattern: 'Spinning Top',
        type: 'neutral',
        index: i,
        description: 'A Spinning Top has a small body with upper and lower wicks of similar length. It shows market indecision, with neither buyers nor sellers gaining control. Often appears during consolidation or before trend reversals.'
      });
      continue;
    }
    
    if (checkMarubozu(currentMetrics)) {
      patterns.push({
        pattern: currentMetrics.isBullish ? 'White Marubozu' : 'Black Marubozu',
        type: currentMetrics.isBullish ? 'bullish' : 'bearish',
        index: i,
        description: currentMetrics.isBullish 
          ? 'A White Marubozu is a strong bullish candle with no upper or lower wicks. The entire candle is white/green, indicating strong buying pressure from open to close. Suggests continued bullish momentum.'
          : 'A Black Marubozu is a strong bearish candle with no upper or lower wicks. The entire candle is black/red, indicating strong selling pressure from open to close. Suggests continued bearish momentum.'
      });
      continue;
    }
    
    if (checkHammer(currentMetrics)) {
      patterns.push({
        pattern: 'Hammer',
        type: 'bullish',
        index: i,
        description: 'A Hammer forms after a downtrend and has a small body with a long lower wick (at least 2-3 times the body) and little to no upper wick. The long lower wick shows rejection of lower prices, suggesting a potential bullish reversal.'
      });
      continue;
    }
    
    if (checkShootingStar(currentMetrics)) {
      patterns.push({
        pattern: 'Shooting Star',
        type: 'bearish',
        index: i,
        description: 'A Shooting Star forms after an uptrend and has a small body with a long upper wick and little to no lower wick. The long upper wick shows rejection of higher prices, suggesting a potential bearish reversal.'
      });
      continue;
    }
    
    // Two candle patterns
    if (i > 0) {
      const prevMetrics = metricsCache.get(i - 1)!;
      const prev = data[i - 1];
      
      // Engulfing patterns
      if (currentMetrics.isBullish !== prevMetrics.isBullish) {
        const isEngulfing = currentMetrics.bodySize > prevMetrics.bodySize &&
                           current.open < prev.close &&
                           current.close > prev.open;
        
        if (isEngulfing) {
          patterns.push({
            pattern: currentMetrics.isBullish ? 'Bullish Engulfing' : 'Bearish Engulfing',
            type: currentMetrics.isBullish ? 'bullish' : 'bearish',
            index: i,
            description: currentMetrics.isBullish
              ? 'A Bullish Engulfing pattern consists of two candles: a small bearish candle followed by a larger bullish candle that completely "engulfs" the previous candle\'s body. This strong reversal pattern suggests a potential shift from bearish to bullish momentum.'
              : 'A Bearish Engulfing pattern consists of two candles: a small bullish candle followed by a larger bearish candle that completely "engulfs" the previous candle\'s body. This strong reversal pattern suggests a potential shift from bullish to bearish momentum.'
          });
          continue;
        }
      }
      
      // Tweezer patterns
      if (Math.abs(current.high - prev.high) < (current.high * 0.001) ||
          Math.abs(current.low - prev.low) < (current.low * 0.001)) {
        patterns.push({
          pattern: currentMetrics.isBullish ? 'Tweezer Bottoms' : 'Tweezer Tops',
          type: currentMetrics.isBullish ? 'bullish' : 'bearish',
          index: i,
          description: currentMetrics.isBullish
            ? 'Tweezer Bottoms form when two consecutive candles have the same low point, creating a support level. The second candle is typically bullish, suggesting a potential reversal from bearish to bullish trend.'
            : 'Tweezer Tops form when two consecutive candles have the same high point, creating a resistance level. The second candle is typically bearish, suggesting a potential reversal from bullish to bearish trend.'
        });
        continue;
      }
    }
    
    // Three candle patterns
    if (i > 1) {
      const prevMetrics = metricsCache.get(i - 1)!;
      const prevPrevMetrics = metricsCache.get(i - 2)!;
      const prev = data[i - 1];
      const prevPrev = data[i - 2];
      
      // Morning/Evening Star
      if (Math.abs(currentMetrics.bodySize) > 0.3 * currentMetrics.totalSize &&
          Math.abs(prevMetrics.bodySize) < 0.2 * prevMetrics.bodySize &&
          Math.abs(prevPrevMetrics.bodySize) > 0.3 * prevPrevMetrics.totalSize) {
        const isMorningStar = !prevPrevMetrics.isBullish && !prevMetrics.isBullish && currentMetrics.isBullish;
        const isEveningStar = prevPrevMetrics.isBullish && !prevMetrics.isBullish && !currentMetrics.isBullish;
        
        if (isMorningStar) {
          patterns.push({
            pattern: 'Morning Star',
            type: 'bullish',
            index: i,
            description: 'A Morning Star is a three-candle pattern that forms after a downtrend: a large bearish candle, followed by a small-bodied candle (bullish or bearish) that gaps down, and finally a large bullish candle that closes above the midpoint of the first candle. This strong reversal pattern suggests a potential shift from bearish to bullish momentum.'
          });
          continue;
        }
        
        if (isEveningStar) {
          patterns.push({
            pattern: 'Evening Star',
            type: 'bearish',
            index: i,
            description: 'An Evening Star is a three-candle pattern that forms after an uptrend: a large bullish candle, followed by a small-bodied candle (bullish or bearish) that gaps up, and finally a large bearish candle that closes below the midpoint of the first candle. This strong reversal pattern suggests a potential shift from bullish to bearish momentum.'
          });
          continue;
        }
      }
      
      // Three White Soldiers / Three Black Crows
      if (i > 2) {
        const isThreeWhiteSoldiers = 
          currentMetrics.isBullish && 
          prevMetrics.isBullish && 
          prevPrevMetrics.isBullish &&
          current.close > prev.close &&
          prev.close > prevPrev.close;
          
        const isThreeBlackCrows = 
          !currentMetrics.isBullish && 
          !prevMetrics.isBullish && 
          !prevPrevMetrics.isBullish &&
          current.close < prev.close &&
          prev.close < prevPrev.close;
          
        if (isThreeWhiteSoldiers) {
          patterns.push({
            pattern: 'Three White Soldiers',
            type: 'bullish',
            index: i,
            description: 'Three White Soldiers consist of three consecutive long bullish candles, each opening higher than the previous day\'s open and closing near its high. This strong continuation pattern indicates sustained buying pressure and suggests the bullish trend may continue.'
          });
          continue;
        }
        
        if (isThreeBlackCrows) {
          patterns.push({
            pattern: 'Three Black Crows',
            type: 'bearish',
            index: i,
            description: 'Three Black Crows consist of three consecutive long bearish candles, each opening lower than the previous day\'s open and closing near its low. This strong continuation pattern indicates sustained selling pressure and suggests the bearish trend may continue.'
          });
          continue;
        }
      }
    }
  }
  
  return patterns;
};

// Hook for memoized pattern detection
export const useCandlestickPatterns = (data: any[]) => {
  return useMemo(() => detectCandlestickPatterns(data), [data]);
}; 