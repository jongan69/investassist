import { cn } from "@/lib/utils/utils"
import { fetchSectorPerformance } from "@/lib/yahoo-finance/fetchSectorPerformance"

interface Sector {
  sector: string
  changesPercentage: string
  error?: string
}

export default async function SectorPerformance() {
  try {
    const response = await fetchSectorPerformance()
    
    if ('error' in response) {
      console.error('Sector performance API error:', response.error)
      return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          {response.error}
        </div>
      )
    }

    if (!Array.isArray(response)) {
      console.error('Invalid response format from sector performance API')
      return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          Sector performance data unavailable
        </div>
      )
    }

    const data = response as Sector[]
    if (!data || data.length === 0) {
      return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
          No sector performance data available
        </div>
      )
    }

    const totalChangePercentage = data.reduce((total, sector) => {
      const percentage = parseFloat(sector.changesPercentage)
      return isNaN(percentage) ? total : total + percentage
    }, 0)

    const averageChangePercentage =
      (totalChangePercentage / data.length).toFixed(2) + "%"

    const allSectors = {
      sector: "All sectors",
      changesPercentage: averageChangePercentage,
    }
    data.unshift(allSectors)

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
  } catch (error) {
    console.error('Error in SectorPerformance component:', error)
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        Unable to load sector performance data
      </div>
    )
  }
}
