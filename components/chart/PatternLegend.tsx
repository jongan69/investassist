import React, { useState } from 'react';
import { PatternResult } from '@/lib/utils/candlestickPatterns';

interface PatternLegendProps {
  patterns: PatternResult[];
}

const PatternLegend: React.FC<PatternLegendProps> = ({ patterns }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Get unique patterns and group by type
  const groupedPatterns = React.useMemo(() => {
    const patternMap = new Map<string, PatternResult>();
    patterns.forEach(pattern => {
      if (!patternMap.has(pattern.pattern)) {
        patternMap.set(pattern.pattern, pattern);
      }
    });
    
    const uniquePatterns = Array.from(patternMap.values());
    
    // Group by type
    return uniquePatterns.reduce((acc, pattern) => {
      if (!acc[pattern.type]) {
        acc[pattern.type] = [];
      }
      acc[pattern.type].push(pattern);
      return acc;
    }, {} as Record<string, PatternResult[]>);
  }, [patterns]);

  // Get color based on pattern type
  const getColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return '#22c55e'; // Green
      case 'bearish':
        return '#ef4444'; // Red
      case 'neutral':
      default:
        return '#3b82f6'; // Blue
    }
  };
  
  // Get icon based on pattern
  const getIcon = (pattern: string) => {
    switch (pattern) {
      case 'Doji':
        return '○';
      case 'Spinning Top':
        return '◎';
      case 'White Marubozu':
      case 'Black Marubozu':
        return '■';
      case 'Hammer':
        return '🔨';
      case 'Hanging Man':
        return '🪦';
      case 'Inverted Hammer':
        return '🔨';
      case 'Shooting Star':
        return '⭐';
      case 'Bullish Engulfing':
        return '📈';
      case 'Bearish Engulfing':
        return '📉';
      case 'Tweezer Tops':
        return '🔝';
      case 'Tweezer Bottoms':
        return '🔻';
      case 'Morning Star':
        return '🌅';
      case 'Evening Star':
        return '🌆';
      case 'Three White Soldiers':
        return '⚔️';
      case 'Three Black Crows':
        return '🦅';
      default:
        return '•';
    }
  };

  // Get detailed pattern description
  const getPatternDescription = (pattern: PatternResult) => {
    switch (pattern.pattern) {
      case 'Doji':
        return 'A Doji forms when the opening and closing prices are virtually equal. The candlestick has a very small body with upper and lower wicks of similar length. This pattern indicates market indecision and potential trend reversal.';
      case 'Spinning Top':
        return 'A Spinning Top has a small body with upper and lower wicks of similar length. It shows market indecision, with neither buyers nor sellers gaining control. Often appears during consolidation or before trend reversals.';
      case 'White Marubozu':
        return 'A White Marubozu is a strong bullish candle with no upper or lower wicks. The entire candle is white/green, indicating strong buying pressure from open to close. Suggests continued bullish momentum.';
      case 'Black Marubozu':
        return 'A Black Marubozu is a strong bearish candle with no upper or lower wicks. The entire candle is black/red, indicating strong selling pressure from open to close. Suggests continued bearish momentum.';
      case 'Hammer':
        return 'A Hammer forms after a downtrend and has a small body with a long lower wick (at least 2-3 times the body) and little to no upper wick. The long lower wick shows rejection of lower prices, suggesting a potential bullish reversal.';
      case 'Hanging Man':
        return 'A Hanging Man looks like a Hammer but forms after an uptrend. It has a small body with a long lower wick and little to no upper wick. Despite the bullish appearance, it often signals a potential bearish reversal.';
      case 'Inverted Hammer':
        return 'An Inverted Hammer forms after a downtrend and has a small body with a long upper wick and little to no lower wick. The long upper wick shows rejection of higher prices, but may indicate a potential bullish reversal if followed by confirmation.';
      case 'Shooting Star':
        return 'A Shooting Star forms after an uptrend and has a small body with a long upper wick and little to no lower wick. The long upper wick shows rejection of higher prices, suggesting a potential bearish reversal.';
      case 'Bullish Engulfing':
        return 'A Bullish Engulfing pattern consists of two candles: a small bearish candle followed by a larger bullish candle that completely "engulfs" the previous candle\'s body. This strong reversal pattern suggests a potential shift from bearish to bullish momentum.';
      case 'Bearish Engulfing':
        return 'A Bearish Engulfing pattern consists of two candles: a small bullish candle followed by a larger bearish candle that completely "engulfs" the previous candle\'s body. This strong reversal pattern suggests a potential shift from bullish to bearish momentum.';
      case 'Tweezer Tops':
        return 'Tweezer Tops form when two consecutive candles have the same high point, creating a resistance level. The second candle is typically bearish, suggesting a potential reversal from bullish to bearish trend.';
      case 'Tweezer Bottoms':
        return 'Tweezer Bottoms form when two consecutive candles have the same low point, creating a support level. The second candle is typically bullish, suggesting a potential reversal from bearish to bullish trend.';
      case 'Morning Star':
        return 'A Morning Star is a three-candle pattern that forms after a downtrend: a large bearish candle, followed by a small-bodied candle (bullish or bearish) that gaps down, and finally a large bullish candle that closes above the midpoint of the first candle. This strong reversal pattern suggests a potential shift from bearish to bullish momentum.';
      case 'Evening Star':
        return 'An Evening Star is a three-candle pattern that forms after an uptrend: a large bullish candle, followed by a small-bodied candle (bullish or bearish) that gaps up, and finally a large bearish candle that closes below the midpoint of the first candle. This strong reversal pattern suggests a potential shift from bullish to bearish momentum.';
      case 'Three White Soldiers':
        return 'Three White Soldiers consist of three consecutive long bullish candles, each opening higher than the previous day\'s open and closing near its high. This strong continuation pattern indicates sustained buying pressure and suggests the bullish trend may continue.';
      case 'Three Black Crows':
        return 'Three Black Crows consist of three consecutive long bearish candles, each opening lower than the previous day\'s open and closing near its low. This strong continuation pattern indicates sustained selling pressure and suggests the bearish trend may continue.';
      default:
        return pattern.description;
    }
  };

  // Order of pattern types
  const typeOrder = ['bullish', 'neutral', 'bearish'];

  return (
    <div className="absolute bottom-0 left-0 z-10 max-w-[220px] max-h-[180px] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm text-xs p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-center text-[10px]">Candlestick Patterns</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col space-y-1">
          {typeOrder.map(type => {
            if (!groupedPatterns[type] || groupedPatterns[type].length === 0) return null;
            
            return (
              <div key={type} className="space-y-1">
                <h4 className="font-medium capitalize text-[10px]" style={{ color: getColor(type) }}>
                  {type}
                </h4>
                <div className="flex flex-col space-y-1">
                  {groupedPatterns[type].map((pattern, index) => (
                    <div key={index} className="flex items-center" title={getPatternDescription(pattern)}>
                      <span className="w-4 h-4 flex items-center justify-center rounded-full border text-[10px] mr-1" 
                            style={{ borderColor: getColor(type) }}>
                        {getIcon(pattern.pattern)}
                      </span>
                      <span className="truncate text-[10px]">{pattern.pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatternLegend; 