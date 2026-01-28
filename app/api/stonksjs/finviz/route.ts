import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const action = searchParams.get('action') || 'getQuote'
    
    if (!symbol && action === 'getQuote') {
      return NextResponse.json(
        { error: 'Symbol parameter is required for getQuote action' },
        { status: 400 }
      )
    }

    // Use require for server-side only
    const finviz = require('@jongan69/stonksjs-finviz').default

    let result: any = null

    switch (action) {
      case 'getQuote':
        result = await finviz.getQuote(symbol!)
        break
      case 'getScreener':
        result = await finviz.getScreener()
        break
      case 'getScreenerFilters':
        result = await finviz.getScreenerFilters()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: getQuote, getScreener, getScreenerFilters' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      action,
      symbol: symbol?.toUpperCase(),
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching stonksjs finviz data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finviz data' },
      { status: 500 }
    )
  }
}
