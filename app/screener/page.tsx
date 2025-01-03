import type { Metadata } from "next"
import { columns } from "@/app/screener/components/columns"
import { DataTable } from "@/app/screener/components/data-table"
import { DEFAULT_SCREENER } from "@/lib/yahoo-finance/constants"
import { fetchScreenerStocks } from "@/lib/yahoo-finance/fetchScreenerStocks"

export const metadata: Metadata = {
  title: "InvestAssist: Investment Assistant",
  description: "Generate a your portfolio with AI",
}
export default async function ScreenerPage({
  searchParams,
}: {
  searchParams?: {
    screener?: string
  }
}) {
  const screener = searchParams?.screener || DEFAULT_SCREENER

  const screenerDataResults = await fetchScreenerStocks(screener)

  return (
    <div>
      <DataTable columns={columns} data={screenerDataResults.quotes} />
    </div>
  )
}
