import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"
import type { SearchResult } from "@/node_modules/yahoo-finance2/dist/esm/src/modules/search"

export async function fetchStockSearch(ticker: string, newsCount: number = 5) {
  noStore()

  const queryOptions = {
    quotesCount: 1,
    newsCount: newsCount,
    enableFuzzyQuery: true,
  }

  try {
    const response: SearchResult = await yahooFinance.search(
      ticker,
      queryOptions
    )
    
    // Only return necessary fields
    return {
      news: response.news?.map(news => ({
        uuid: news.uuid,
        title: news.title,
        link: news.link,
        publisher: news.publisher,
        publishedAt: news.providerPublishTime,
        type: news.type,
        relatedTickers: news.relatedTickers,
        thumbnail: news.thumbnail
      }))
    }
  } catch (error) {
    console.error("Failed to fetch stock search", error)
    throw new Error("Failed to fetch stock search.")
  }
}
