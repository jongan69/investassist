import { unstable_noStore as noStore } from "next/cache"
import yahooFinance from "yahoo-finance2"

export type QuoteError = {
  message: string;
  code: 'VALIDATION_ERROR' | 'HTTP_ERROR' | 'UNKNOWN_ERROR';
}

export async function fetchQuote(ticker: string) {
  noStore()

  try {
    const response = await yahooFinance.quote(ticker)
    return { data: response, error: null }
  } catch (err: unknown) {
    const error = err as Error
    
    if (error instanceof yahooFinance.errors.FailedYahooValidationError) {
      console.error("Yahoo Finance validation error for ticker:", ticker, error)
      return {
        data: null,
        error: { message: `Invalid ticker symbol: ${ticker}`, code: 'VALIDATION_ERROR' } as QuoteError
      }
    }
    
    if (error instanceof yahooFinance.errors.HTTPError) {
      console.error("HTTP error while fetching quote for ticker:", ticker, error)
      return {
        data: null,
        error: { message: `Failed to fetch quote for ${ticker}: ${error.message}`, code: 'HTTP_ERROR' } as QuoteError
      }
    }

    console.error("Failed to fetch stock quote for ticker:", ticker, error)
    return {
      data: null,
      error: { 
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: 'UNKNOWN_ERROR'
      } as QuoteError
    }
  }
}
