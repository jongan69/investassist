"use client"

import { useState } from "react"
import Switch from "@/components/ui/switch"

interface ChartTypeSwitchProps {
  onChartTypeChange: (checked: boolean) => void
}

export default function ChartTypeSwitch({ onChartTypeChange }: ChartTypeSwitchProps) {
  const [checked, setChecked] = useState(false)
  
  const handleChange = (value: boolean) => {
    setChecked(value)
    onChartTypeChange(value)
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
      />
      <label className="text-sm font-medium">
        Candle Chart
      </label>
    </div>
  )
} 