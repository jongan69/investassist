import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const screenerType = searchParams.get('screener') || 'topGainers'
    const includeQuotes = searchParams.get('includeQuotes') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Use require for server-side only
    const stockScreener = require('@jongan69/stonksjs-stock-screener').default
    const quote = require('@jongan69/stonksjs-quote').default
    const finviz = require('@jongan69/stonksjs-finviz').default

    // Get symbols from screener
    let symbols: string[] = []
    
    switch (screenerType) {
      case 'topGainers':
        symbols = await stockScreener.getTopGainers()
        break
      case 'topLosers':
        symbols = await stockScreener.getTopLosers()
        break
      case 'mostActive':
        symbols = await stockScreener.getMostActive()
        break
      case 'mostVolatile':
        symbols = await stockScreener.getMostVolatile()
        break
      case 'unusualVolume':
        symbols = await stockScreener.getUnusualVolume()
        break
      case 'oversold':
        symbols = await stockScreener.getOversold()
        break
      case 'overbought':
        symbols = await stockScreener.getOverbought()
        break
      case 'upgrades':
        symbols = await stockScreener.getUpgrades()
        break
      case 'downgrades':
        symbols = await stockScreener.getDowngrades()
        break
      case 'earningsBefore':
        symbols = await stockScreener.getEarningsBefore()
        break
      case 'earningsAfter':
        symbols = await stockScreener.getEarningsAfter()
        break
      case 'recentInsiderBuying':
        symbols = await stockScreener.getRecentInsiderBuying()
        break
      case 'recentInsiderSelling':
        symbols = await stockScreener.getRecentInsiderSelling()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid screener type' },
          { status: 400 }
        )
    }

    // Limit results
    symbols = symbols.slice(0, limit)

    let result: any = {
      screenerType,
      symbols,
      count: symbols.length,
      timestamp: new Date().toISOString()
    }

    // If quotes are requested, fetch detailed data for each symbol
    if (includeQuotes && symbols.length > 0) {
      const quotePromises = symbols.map(async (symbol) => {
        try {
          const quoteData = await quote.get(symbol)
          const finvizData = await finviz.getQuote(symbol)
          
          return {
            symbol,
            quote: quoteData,
            finviz: finvizData
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
          return {
            symbol,
            error: 'Failed to fetch data'
          }
        }
      })

      const detailedData = await Promise.allSettled(quotePromises)
      result.detailedData = detailedData
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching combined stonksjs data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch combined data' },
      { status: 500 }
    )
  }
}