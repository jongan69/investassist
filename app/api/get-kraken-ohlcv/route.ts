import { NextResponse } from 'next/server'
import { fetchCoinQuote, fetchAllTimeframes, krakenIntervalMapping } from '@/lib/solana/fetchCoinQuote'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker')?.toUpperCase()
    const range = searchParams.get('range') as keyof typeof krakenIntervalMapping | null

    if (!ticker) {
        return NextResponse.json({ error: "Missing 'ticker' query parameter" }, { status: 400 })
    }

    try {
        let result

        if (range) {
            result = await fetchCoinQuote(ticker, range)
        } else {
            result = await fetchAllTimeframes(ticker)
        }

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 })
        }

        return NextResponse.json({ data: result.data })
    } catch (error) {
        console.error("Error fetching OHLCV data:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
