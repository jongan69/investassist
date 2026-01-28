import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    // Use require for server-side only
    const quote = require('@jongan69/stonksjs-quote').default
    
    // Get detailed quote data using stonksjs
    const quoteData = await quote.get(symbol)
    
    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      data: quoteData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching stonksjs quote data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote data' },
      { status: 500 }
    )
  }
}
