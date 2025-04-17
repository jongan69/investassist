import React, { useMemo, useCallback } from 'react';
import { PatternResult } from '@/lib/utils/candlestickPatterns';

interface PatternIndicatorProps {
  pattern: PatternResult;
  x: number;
  y: number;
  width: number;
  height: number;
  onHover: (pattern: PatternResult) => void;
  onLeave: () => void;
}

const PatternIndicator: React.FC<PatternIndicatorProps> = ({
  pattern,
  x,
  y,
  width,
  height,
  onHover,
  onLeave,
}) => {
  // Memoize the color based on the pattern type
  const color = useMemo(() => {
    switch (pattern.type) {
      case 'bullish':
        return '#22c55e'; // Green
      case 'bearish':
        return '#ef4444'; // Red
      case 'neutral':
      default:
        return '#3b82f6'; // Blue
    }
  }, [pattern.type]);

  // Memoize the icon based on the pattern
  const icon = useMemo(() => {
    switch (pattern.pattern) {
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
  }, [pattern.pattern]);

  // Memoize the hover handler
  const handleHover = useCallback(() => {
    onHover(pattern);
  }, [onHover, pattern]);

  // Memoize the transform string
  const transform = useMemo(() => `translate(${x}, ${y})`, [x, y]);

  return (
    <g
      transform={transform}
      onMouseEnter={handleHover}
      onMouseLeave={onLeave}
      style={{ cursor: 'pointer' }}
      className="pattern-indicator"
    >
      {/* Background circle with glow effect */}
      <circle
        cx={0}
        cy={0}
        r={6}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
        filter="url(#glow)"
      />
      
      {/* Pattern icon */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={8}
        fontWeight="bold"
      >
        {icon}
      </text>
      
      {/* Tooltip (shown on hover) */}
      <g className="pattern-tooltip" opacity={0}>
        <rect
          x={-100}
          y={-50}
          width="200"
          height="60"
          rx="4"
          fill="rgba(0, 0, 0, 0.8)"
        />
        <text
          x={0}
          y={-30}
          textAnchor="middle"
          fill="white"
          fontSize={12}
          fontWeight="bold"
        >
          {pattern.pattern}
        </text>
        <text
          x={0}
          y={-10}
          textAnchor="middle"
          fill="white"
          fontSize={10}
        >
          {pattern.description}
        </text>
        <text
          x={0}
          y={10}
          textAnchor="middle"
          fill={color}
          fontSize={10}
          fontWeight="bold"
        >
          {pattern.type.toUpperCase()}
        </text>
      </g>
    </g>
  );
};

export default React.memo(PatternIndicator); 