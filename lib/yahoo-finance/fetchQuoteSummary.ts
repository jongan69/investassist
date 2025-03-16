import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"

export async function fetchQuoteSummary(ticker: string) {
  noStore()

  try {
    const response = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    })

    return response
  } catch (error) {
    console.error("Failed to fetch quote summary.", error)
    return null
  }
}
