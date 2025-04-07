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
    <Switch
      checked={checked}
      onCheckedChange={handleChange}
    />

  )
} 