// @ts-nocheck
"use client"
import { memo, useCallback, useMemo, useReducer, useRef, useEffect, useState } from "react"
import { scalePoint } from "d3-scale"
import { bisectRight } from "d3-array"
import * as d3 from "d3"

import { localPoint } from "@visx/event"
import { LinearGradient } from "@visx/gradient"
import { AreaClosed, LinePath } from "@visx/shape"
import { scaleLinear } from "@visx/scale"
import { ParentSize } from "@visx/responsive"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { DEFAULT_RANGE } from "@/lib/yahoo-finance/constants"
// import { Range } from "@/lib/yahoo-finance/types"
import { useSpring, animated } from "@react-spring/web"
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect"
import { cn } from "@/lib/utils"
// UTILS
const toDate = (d: any) => +new Date(d?.date || d)

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format

const MemoAreaClosed = memo(AreaClosed)
const MemoLinePath = memo(LinePath)

// Add this function near the top of the file with other utility functions
const getChartColor = (isHovered: boolean, isIncreasing: boolean) => {
  if (isHovered) return "#3b82f6" // Bright blue
  return isIncreasing ? "#22c55e" : "#ef4444" // Green or red
}

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
    (event: React.PointerEvent<SVGRectElement>) => {
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
        x: xScale(toDate(d)), // Use exact x position from scale
        y: pointer.y,
        width 
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
      fill={"transparent"}
    />
  )
}

interface AreaProps {
  mask: string
  id: string
  data: any[]
  x: any
  y: any
  yScale: any
  color: string
}

function Area({ mask, id, data, x, y, yScale, color }: AreaProps) {
  // Pre-calculate the path data for immediate render
  const areaPath = useMemo(() => {
    const area = d3.area()
      .x((d: any) => x(d))
      .y0(yScale.range()[0])
      .y1((d: any) => y(d))
      .curve(d3.curveMonotoneX)
    
    return area(data)
  }, [data, x, y, yScale])

  const linePath = useMemo(() => {
    const line = d3.line()
      .x((d: any) => x(d))
      .y((d: any) => y(d))
      .curve(d3.curveMonotoneX)
    
    return line(data)
  }, [data, x, y])

  return (
    <g 
      strokeLinecap="round" 
      className="stroke-1"
    >
      <LinearGradient
        id={id}
        from={color}
        fromOpacity={0.4}
        to={color}
        toOpacity={0.1}
        y1="0%"
        y2="100%"
      />
      <path
        d={areaPath}
        stroke="transparent"
        fill={`url(#${id})`}
        mask={mask}
      />
      <path 
        d={linePath}
        stroke={color}
        strokeWidth={2}
        fill="none"
        mask={mask}
      />
    </g>
  )
}

// Add animation for the hover marker
function MarkerCircle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const spring = useSpring({
    to: { cx, cy },
    config: { 
      tension: 170,
      friction: 26,
      mass: 1,
      clamp: true
    },
    immediate: false
  })

  return (
    <animated.circle
      {...spring}
      r={8}
      fill={color}
      stroke="#FFF"
      strokeWidth={3}
      style={{ willChange: 'transform' }}
    />
  )
}

// Update the GraphSlider interface
interface GraphSliderProps {
  data: any[]
  width: number
  height: number
  top: number
  state: any
  dispatch: any
  range: KrakenRange  // Add this
}

// Add this custom hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Modify the GraphSlider component to use ResizeObserver
function GraphSlider({ data, width, height, top, state, dispatch, range }: GraphSliderProps) {
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

  // Use debounced dimensions to prevent excessive recalculations
  const debouncedDimensions = useDebounce(dimensions, 100)

  // Pre-calculate scales and domains once
  const [xScale, yScale] = useMemo(() => {
    const xScale = scalePoint()
      .domain(data.map(toDate))
      .range([0, width])
      .padding(0.1)

    const yScale = scaleLinear({
      range: [height, 0],
      domain: [
        Math.min(...data.map((d: any) => d.close)) * 0.99, // Add small padding
        Math.max(...data.map((d: any) => d.close)) * 1.01
      ],
      nice: true // Round to nice numbers
    })

    return [xScale, yScale]
  }, [data, width, height])

  const x = useCallback((d: any) => xScale(toDate(d)), [xScale])
  const y = useCallback((d: any) => yScale(d.close), [yScale])

  const isIncreasing = data[data.length - 1].close > data[0].close
  const chartColor = getChartColor(state.hovered, isIncreasing)

  return (
    <div className="transition-all duration-300 ease-in-out">
      <svg 
        height={height} 
        width="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }} // Allow hover elements to overflow
      >
        <defs>
          <mask id="mask" className="w-full">
            <rect x={0} y={0} width={width} height="100%" fill="#000" />
            <rect
              x={0}
              y={0}
              width={width}
              height="100%"
              fill="#fff"
              style={{
                transform: `translateX(${(parseFloat(state.translate) / 100) * width}px)`,
              }}
            />
          </mask>
        </defs>

        {/* Render both areas immediately */}
        <Area
          id="background"
          data={data}
          x={x}
          y={y}
          top={top}
          yScale={yScale}
          color={chartColor}
        />
        <Area
          id="top"
          data={data}
          x={x}
          y={y}
          yScale={yScale}
          top={top}
          color={chartColor}
          mask="url(#mask)"
        />

        {/* Hover effects */}
        {state.x && (
          <g className="marker">
            <line
              x1={state.x}
              x2={state.x}
              y1={0}
              y2={height}
              stroke={chartColor}
              strokeWidth={2}
            />
            <MarkerCircle 
              cx={state.x} 
              cy={yScale(state.close)}
              color={chartColor} 
            />
            <text
              suppressHydrationWarning
              textAnchor={state.x + 8 > width / 2 ? "end" : "start"}
              x={state.x + 8 > width / 2 ? state.x - 8 : state.x + 6}
              y={0}
              dy={"0.75em"}
              fill={chartColor}
              className="text-base font-medium"
            >
              {formatCurrency(state.close)}
            </text>
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

// Add proper types
interface ChartQuote {
  date: Date
  close: number
}

interface AreaClosedCoinChartProps {
  chartQuotes: ChartQuote[]
  range: KrakenRange
  availableRanges: KrakenRange[]
}

// Add Range type import
import { type KrakenRange } from "@/lib/solana/fetchCoinQuote"

// Add this new component for price display
const PriceDisplay = memo(function PriceDisplay({ 
  date, 
  close, 
  range 
}: { 
  date: Date, 
  close: number, 
  range: KrakenRange 
}) {
  const formattedDate = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const formattedTime = date
    .toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".")

  return (
    <div suppressHydrationWarning className="flex items-center justify-center font-medium">
      {formattedDate}{" "}
      {range !== "3m" && range !== "1y" && "at " + formattedTime}
    </div>
  )
})

// Memoize the Area component
const MemoizedArea = memo(Area)

// Optimize the main component
const AreaClosedCoinChart = memo(function AreaClosedCoinChart({ 
  chartQuotes, 
  range,
  availableRanges
}: AreaClosedCoinChartProps) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()

  const last = useMemo(() => chartQuotes[chartQuotes.length - 1], [chartQuotes])

  const initialState = useMemo(() => ({
    close: last.close,
    date: last.date,
    translate: "0%",
    hovered: false,
  }), [last])

  const [state, dispatch] = useReducer(reducer, initialState)

  // Memoize range options and validation
  const rangeOptions = useMemo(() => ["1d", "1w", "1m", "3m", "1y"] as const, [])
  
  const createPageURL = useCallback(
    (range: string) => {
      const params = new URLSearchParams(searchParams)
      if (range) {
        params.set("range", range)
      } else {
        params.delete("range")
      }
      return `${pathname}?${params.toString().toLowerCase()}`
    },
    [searchParams, pathname]
  )

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const range = e.currentTarget.textContent
    if (range) {
      replace(createPageURL(range))
    }
  }, [createPageURL, replace])

  return (
    <div 
      suppressHydrationWarning
      className="w-full min-w-fit transition-opacity duration-300 ease-in-out"
    >
      {state.hovered && (
        <PriceDisplay 
          date={new Date(state.date)} 
          close={state.close} 
          range={range}
        />
      )}
      <div className="h-80">
        {chartQuotes.length > 0 ? (
          <ParentSize>
            {({ width, height }) => (
              <GraphSlider
                data={chartQuotes}
                width={width}
                height={height}
                top={0}
                state={state}
                dispatch={dispatch}
                range={range}
              />
            )}
          </ParentSize>
        ) : (
          <div className="flex h-80 w-full items-center justify-center">
            <p>No data available</p>
          </div>
        )}
      </div>
      <div className="mt-1 flex flex-row">
        {rangeOptions.map((r) => (
          <Button
            key={r}
            variant={"ghost"}
            onClick={handleClick}
            disabled={!availableRanges.includes(r)}
            className={cn(
              range === r
                ? "bg-accent font-bold text-accent-foreground"
                : "text-muted-foreground",
              !availableRanges.includes(r) && "opacity-50 cursor-not-allowed"
            )}
          >
            {r.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
})

// Extract range buttons to separate component
const RangeButtons = memo(function RangeButtons({ 
  range, 
  onRangeChange 
}: { 
  range: KrakenRange
  onRangeChange: (range: string) => void 
}) {
  const rangeOptions = ["1d", "1w", "1m", "3m", "1y"]
  
  return (
    <div className="mt-1 flex flex-row">
      {rangeOptions.map((r) => (
        <Button
          key={r}
          variant={"ghost"}
          onClick={() => onRangeChange(r)}
          className={
            range === r
              ? "bg-accent font-bold text-accent-foreground"
              : "text-muted-foreground"
          }
        >
          {r.toUpperCase()}
        </Button>
      ))}
    </div>
  )
})

export default AreaClosedCoinChart
