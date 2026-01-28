import type { Metadata } from "next"
import { columns } from "@/app/screener/components/columns"
import { DataTable } from "@/app/screener/components/data-table"
import { DEFAULT_SCREENER } from "@/lib/yahoo-finance/constants"
import { fetchScreenerStocks } from "@/lib/yahoo-finance/fetchScreenerStocks"
import { fetchCustomScreenerStocks } from "@/lib/yahoo-finance/fetchCustomScreenerStocks"
import { CustomScreenerType } from "@/lib/yahoo-finance/customScreeners"
import StonksjsScreenerWidget from "@/components/stonksjs/StonksjsScreenerWidget"

export const metadata: Metadata = {
  title: "InvestAssist: Investment Assistant",
  description: "Generate a your portfolio with AI",
}

interface ScreenerPageProps {
  searchParams: Promise<any>
}

// List of all custom screener types
const CUSTOM_SCREENER_TYPES = [
  "low_pe_ratio",
  "high_margin_tech",
  "undervalued_midcaps",
  "momentum_leaders",
  "value_stocks",
  "growth_stocks",
  "income_stocks",
  // New valuation-based screeners
  "dcf_undervalued",
  "epv_undervalued",
  "rim_undervalued",
  "relative_value",
  "nav_undervalued",
  "gordon_growth",
  // New quality and strategy screeners
  "quality_moat",
  "dividend_growth",
  "momentum_value",
  "low_volatility"
] as const

export default async function ScreenerPage({
  searchParams,
}: ScreenerPageProps) {
  const params = await searchParams
  const screener = params?.screener || DEFAULT_SCREENER
  
  // Check if this is a custom screener - more robust check
  const isCustomScreener = typeof screener === 'string' && 
    CUSTOM_SCREENER_TYPES.includes(screener as any)
  
  console.log(`[DEBUG] Screener: ${screener}, isCustomScreener: ${isCustomScreener}`)
  
  let screenerDataResults
  
  try {
    if (isCustomScreener) {
      // Use custom screener
      console.log(`[DEBUG] Using custom screener: ${screener}`)
      screenerDataResults = await fetchCustomScreenerStocks(screener as CustomScreenerType)
    } else {
      // Use standard screener
      console.log(`[DEBUG] Using standard screener: ${screener}`)
      screenerDataResults = await fetchScreenerStocks(screener)
    }
  } catch (error) {
    console.error(`Error fetching screener data:`, error)
    // Return empty results on error
    screenerDataResults = { quotes: [], total: 0, count: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={screenerDataResults.quotes as any} />
        </div>
        <div className="lg:col-span-1">
          <StonksjsScreenerWidget />
        </div>
      </div>
    </div>
  )
}
