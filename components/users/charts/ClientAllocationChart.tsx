'use client'

import { AllocationChart } from './AllocationChart'

interface Allocation {
  asset: string;
  percentage: number;
}

export function ClientAllocationChart({ allocations }: { allocations: Allocation[] }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full max-w-full">
        <AllocationChart allocations={allocations} />
      </div>
    </div>
  )
} 