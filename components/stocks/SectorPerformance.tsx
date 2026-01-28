"use client"
import { cn } from "@/lib/utils/utils"
import { fetchSectorPerformance } from "@/lib/yahoo-finance/fetchSectorPerformance"
import { useEffect, useState } from "react"

interface Sector {
  sector: string
  changesPercentage: string
  error?: string
}

export default function SectorPerformance() {
  const [data, setData] = useState<Sector[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchSectorPerformance()
        
        // Check if response has error property
        if (response && typeof response === 'object' && 'error' in response) {
          const errorMessage = (response as { error: string }).error
          console.error('Sector performance API error:', errorMessage)
          setError(errorMessage || 'Failed to fetch sector performance data')
          setLoading(false)
          return
        }

        // Validate response is an array
        if (!Array.isArray(response)) {
          console.error('Invalid response format from sector performance API:', response)
          setError('Sector performance data unavailable')
          setLoading(false)
          return
        }

        const sectorData = response as Sector[]
        if (!sectorData || sectorData.length === 0) {
          setError('Sector performance data is currently unavailable. The data provider has deprecated this endpoint.')
          setLoading(false)
          return
        }

        // Calculate average change percentage
        const totalChangePercentage = sectorData.reduce((total, sector) => {
          const percentage = parseFloat(sector.changesPercentage?.replace('%', '') || '0')
          return isNaN(percentage) ? total : total + percentage
        }, 0)

        const averageChangePercentage =
          sectorData.length > 0 
            ? (totalChangePercentage / sectorData.length).toFixed(2) + "%"
            : "0.00%"

        const allSectors = {
          sector: "All sectors",
          changesPercentage: averageChangePercentage,
        }
        sectorData.unshift(allSectors)
        
        setData(sectorData)
      } catch (error) {
        console.error('Error in SectorPerformance component:', error)
        setError(error instanceof Error ? error.message : 'Unable to load sector performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        Loading sector performance data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {data.map((sector: Sector) => (
          <div
            key={sector.sector}
            className="flex w-full flex-row items-center justify-between text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="font-medium">{sector.sector}</span>
            <span
              className={cn(
                "w-[5rem] min-w-fit rounded-md px-3 py-1 text-right transition-colors",
                parseFloat(sector.changesPercentage) > 0
                  ? "bg-gradient-to-l from-green-300 text-green-800 dark:from-green-950 dark:text-green-400"
                  : "bg-gradient-to-l from-red-300 text-red-800 dark:from-red-950 dark:text-red-500"
              )}
            >
              {parseFloat(sector.changesPercentage).toFixed(2) + "%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
