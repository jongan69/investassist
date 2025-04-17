"use client";

import React from "react";
import { Switch } from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/utils";

function SwitchComponent({ 
  checked, 
  onCheckedChange,
  label = "Candle Chart"
}: { 
  checked: boolean, 
  onCheckedChange: (checked: boolean) => void,
  label?: string
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        name="chart-type"
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          checked ? "bg-blue-500" : "bg-gray-200"
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </Switch>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default SwitchComponent;