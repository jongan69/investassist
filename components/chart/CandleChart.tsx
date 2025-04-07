"use client"
import { memo, useCallback, useMemo, useReducer, useRef, useState } from "react"
import { scalePoint } from "d3-scale"
import * as d3 from "d3"
import { localPoint } from "@visx/event"
import { scaleLinear } from "@visx/scale"
import { ParentSize } from "@visx/responsive"
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect"

// Add type declaration for d3
declare module 'd3' {
  export function bisector<T>(accessor: (d: T) => number): {
    left: (array: T[], x: number) => number
  }
}

// UTILS
const toDate = (d: any) => +new Date(d?.date || d)

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format

function reducer(state: any, action: any) {
  const initialState = {
    close: state.close,
    date: state.date,
    translate: "0%",
    hovered: false,
  }

  switch (action.type) {
    case "UPDATE": {
      return {
        close: action.close,
        date: action.date,
        x: action.x,
        y: action.y,
        translate: `-${(1 - action.x / action.width) * 100}%`,
        hovered: true,
        open: action.open,
        high: action.high,
        low: action.low,
      }
    }
    case "CLEAR": {
      return {
        ...initialState,
        x: undefined,
        y: undefined,
      }
    }
    default:
      return state
  }
}

interface InteractionsProps {
  width: number
  height: number
  xScale: any
  data: any[]
  dispatch: any
}

function Interactions({
  width,
  height,
  xScale,
  data,
  dispatch,
}: InteractionsProps) {
  const handleMove = useCallback(
    (event: React.PointerEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
      const point = localPoint(event)
      if (!point) return

      const pointer = {
        x: Math.max(0, Math.floor(point.x)),
        y: Math.max(0, Math.floor(point.y)),
      }

      // Get the date range for the x-axis
      const dates = data.map(d => toDate(d))
      const xPositions = dates.map(d => xScale(d))

      // Find the closest x position to the pointer
      const closestIndex = d3.bisector((x: number) => x).left(xPositions, pointer.x)

      // Get the two closest points
      const d0 = data[Math.max(0, closestIndex - 1)]
      const d1 = data[Math.min(data.length - 1, closestIndex)]

      // Determine which point is closer
      let d = d0
      if (d1) {
        const x0 = xScale(toDate(d0))
        const x1 = xScale(toDate(d1))
        d = Math.abs(pointer.x - x0) > Math.abs(pointer.x - x1) ? d1 : d0
      }

      dispatch({
        type: "UPDATE",
        ...d,
        x: xScale(toDate(d)),
        y: pointer.y,
        width,
        // Explicitly include OHLC values to ensure they're in the state
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
      })
    },
    [xScale, data, dispatch, width]
  )

  const handleLeave = useCallback(() => dispatch({ type: "CLEAR" }), [dispatch])

  return (
    <rect
      width={width}
      height={height}
      rx={12}
      ry={12}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onTouchMove={handleMove}
      onTouchEnd={handleLeave}
      fill="transparent"
      style={{ touchAction: 'none' }}
    />
  )
}

function Candle({ x, y, width, height, color }: { x: number, y: number, width: number, height: number, color: string }) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={y}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x - width / 2}
        y={y}
        width={width}
        height={height}
        fill={color}
      />
    </g>
  )
}

function GraphSlider({ data, width, height, top, state, dispatch }: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Pre-calculate scales and domains once
  const [xScale, yScale] = useMemo(() => {
    const xScale = scalePoint()
      .domain(data.map(toDate))
      .range([0, width])
      .padding(0.1)

    const yScale = scaleLinear({
      range: [height, 0],
      domain: [
        Math.min(...data.map((d: any) => d.low)) * 0.99,
        Math.max(...data.map((d: any) => d.high)) * 1.01
      ],
      nice: true
    })

    return [xScale, yScale]
  }, [data, width, height])

  const x = useCallback((d: any) => {
    const date = toDate(d);
    // @ts-ignore - Ignoring type error for xScale
    return xScale(date);
  }, [xScale])
  
  const y = useCallback((d: any) => {
    return yScale(d.close);
  }, [yScale])

  const candleWidth = width / data.length * 0.8

  return (
    <div className="transition-all duration-300 ease-in-out touch-none">
      <svg
        height={height}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible', touchAction: 'none' }}
      >
        {data.map((d: any, i: number) => {
          const isIncreasing = d.close > d.open
          const color = isIncreasing ? "#22c55e" : "#ef4444"
          const candleHeight = Math.abs(yScale(d.close) - yScale(d.open))
          const wickHeight = Math.abs(yScale(d.high) - yScale(d.low))
          const yPos = yScale(Math.max(d.open, d.close))
          const xPos = x(d) || 0; // Provide a default value if x(d) is undefined
          
          return (
            <Candle
              key={i}
              x={xPos}
              y={yPos}
              width={candleWidth}
              height={candleHeight}
              color={color}
            />
          )
        })}

        {/* Hover effects */}
        {state.x && (
          <g className="marker">
            <line
              x1={state.x}
              x2={state.x}
              y1={0}
              y2={height}
              stroke={state.hovered ? "#3b82f6" : "#666"}
              strokeWidth={2}
            />
            <circle
              cx={state.x}
              cy={yScale(state.close)}
              r={8}
              fill={state.hovered ? "#3b82f6" : "#666"}
              stroke="#FFF"
              strokeWidth={3}
            />
            
            {/* OHLC Values Display - Positioned at pointer location */}
            <g transform={`translate(${state.x}, ${state.y})`}>
              <rect
                x="-70"
                y="-80"
                width="140"
                height="90"
                rx="4"
                fill="rgba(0, 0, 0, 0.8)"
                opacity={0.9}
              />
              <text
                suppressHydrationWarning
                textAnchor="middle"
                x="0"
                y="-65"
                fill="#fff"
                className="text-xs font-medium"
              >
                {new Date(state.date).toLocaleDateString()}
              </text>
              <text
                suppressHydrationWarning
                textAnchor="middle"
                x="0"
                y="-50"
                fill="#fff"
                className="text-xs font-medium"
              >
                O: {formatCurrency(state.open || 0)}
              </text>
              <text
                suppressHydrationWarning
                textAnchor="middle"
                x="0"
                y="-35"
                fill="#fff"
                className="text-xs font-medium"
              >
                H: {formatCurrency(state.high || 0)}
              </text>
              <text
                suppressHydrationWarning
                textAnchor="middle"
                x="0"
                y="-20"
                fill="#fff"
                className="text-xs font-medium"
              >
                L: {formatCurrency(state.low || 0)}
              </text>
              <text
                suppressHydrationWarning
                textAnchor="middle"
                x="0"
                y="-5"
                fill="#fff"
                className="text-xs font-medium"
              >
                C: {formatCurrency(state.close || 0)}
              </text>
            </g>
          </g>
        )}

        <Interactions
          width={width}
          height={height}
          data={data}
          xScale={xScale}
          dispatch={dispatch}
        />
      </svg>
    </div>
  )
}

interface CandleChartProps {
  chartQuotes: {
    date: Date
    open: number
    high: number
    low: number
    close: number
  }[]
  range: string
}

const CandleChart = memo(function CandleChart({
  chartQuotes,
  range,
}: CandleChartProps) {
  const last = useMemo(() => chartQuotes[chartQuotes.length - 1], [chartQuotes])

  const initialState = useMemo(() => ({
    close: last.close,
    date: last.date,
    translate: "100%",
    hovered: false,
  }), [last])

  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div
      suppressHydrationWarning
      className="w-full min-w-fit transition-opacity duration-300 ease-in-out"
    >
      {state.hovered && (
        <div className="flex items-center justify-center font-medium">
          {new Date(state.date).toLocaleDateString()}
          {range !== "3m" && range !== "1y" && (
            <span className="ml-2 text-muted-foreground">
              at {new Date(state.date).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
      <div className="h-[300px] sm:h-80">
        {chartQuotes.length > 0 ? (
          <div className="relative h-full w-full">
            <ParentSize>
              {({ width, height }) => (
                <GraphSlider
                  data={chartQuotes}
                  width={width}
                  height={height}
                  top={0}
                  state={state}
                  dispatch={dispatch}
                />
              )}
            </ParentSize>
          </div>
        ) : (
          <div className="flex h-[300px] sm:h-80 w-full items-center justify-center">
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  )
})

export default CandleChart 