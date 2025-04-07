"use client"

import { useState } from "react"
import AreaClosedChart from "./AreaClosedChart"
import CandleChart from "./CandleChart"
import ChartTypeSwitch from "./ChartTypeSwitch"
import { Range } from "@/types/yahoo-finance"
import { Button } from "../ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface ChartDisplayProps {
  chartQuotes: any[]
  range: Range
}

export default function ChartDisplay({ chartQuotes, range }: ChartDisplayProps) {
  const [isCandleChart, setIsCandleChart] = useState(false)
  const rangeOptions = ["1d", "1w", "1m", "3m", "1y"]
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChartTypeChange = (checked: boolean) => {
    setIsCandleChart(checked)
  }

  const handleRangeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newRange = e.currentTarget.value
    if (rangeOptions.includes(newRange)) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("range", newRange)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  if (chartQuotes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-neutral-500">
        No Quote Data Was Available
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {isCandleChart ? (
        <CandleChart chartQuotes={chartQuotes} range={range} />
      ) : (
        <AreaClosedChart chartQuotes={chartQuotes} range={range} />
      )}
      
      <div className="mt-1 flex flex-row items-center justify-between">
        <div className="flex flex-row">
          {rangeOptions.map((r) => (
            <Button
              key={r}
              variant="ghost"
              value={r}
              onClick={handleRangeClick}
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
        <div className="flex items-center">
          <ChartTypeSwitch onChartTypeChange={handleChartTypeChange} />
        </div>
      </div>
    </div>
  )
}