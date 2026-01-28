import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const screenerType = searchParams.get('type') || 'topGainers'
    
    // Use require for server-side only
    const stockScreener = require('@jongan69/stonksjs-stock-screener').default
    
    let results: string[] = []
    
    switch (screenerType) {
      case 'topGainers':
        results = await stockScreener.getTopGainers()
        break
      case 'topLosers':
        results = await stockScreener.getTopLosers()
        break
      case 'newHigh':
        results = await stockScreener.getNewHigh()
        break
      case 'newLow':
        results = await stockScreener.getNewLow()
        break
      case 'mostVolatile':
        results = await stockScreener.getMostVolatile()
        break
      case 'mostActive':
        results = await stockScreener.getMostActive()
        break
      case 'unusualVolume':
        results = await stockScreener.getUnusualVolume()
        break
      case 'overbought':
        results = await stockScreener.getOverbought()
        break
      case 'oversold':
        results = await stockScreener.getOversold()
        break
      case 'downgrades':
        results = await stockScreener.getDowngrades()
        break
      case 'upgrades':
        results = await stockScreener.getUpgrades()
        break
      case 'earningsBefore':
        results = await stockScreener.getEarningsBefore()
        break
      case 'earningsAfter':
        results = await stockScreener.getEarningsAfter()
        break
      case 'recentInsiderBuying':
        results = await stockScreener.getRecentInsiderBuying()
        break
      case 'recentInsiderSelling':
        results = await stockScreener.getRecentInsiderSelling()
        break
      case 'majorNews':
        results = await stockScreener.getMajorNews()
        break
      case 'horizontalSR':
        results = await stockScreener.getHorizontalSR()
        break
      case 'tlResistance':
        results = await stockScreener.getTlResistance()
        break
      case 'tlSupport':
        results = await stockScreener.getTlSupport()
        break
      case 'wedgeUp':
        results = await stockScreener.getWedgeUp()
        break
      case 'wedgeDown':
        results = await stockScreener.getWedgeDown()
        break
      case 'triangleAscending':
        results = await stockScreener.getTriangleAscending()
        break
      case 'triangleDescending':
        results = await stockScreener.getTriangleDescending()
        break
      case 'wedge':
        results = await stockScreener.getWedge()
        break
      case 'channelUp':
        results = await stockScreener.getChannelUp()
        break
      case 'channelDown':
        results = await stockScreener.getChannelDown()
        break
      case 'channel':
        results = await stockScreener.getChannel()
        break
      case 'doubleTop':
        results = await stockScreener.getDoubleTop()
        break
      case 'doubleBottom':
        results = await stockScreener.getDoubleBottom()
        break
      case 'multipleTop':
        results = await stockScreener.getMultipleTop()
        break
      case 'multipleBottom':
        results = await stockScreener.getMultipleBottom()
        break
      case 'headShoulders':
        results = await stockScreener.getHeadShoulders()
        break
      case 'headShouldersInverse':
        results = await stockScreener.getHeadShouldersInverse()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid screener type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      screenerType,
      symbols: results,
      count: results.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching stonksjs screener data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screener data' },
      { status: 500 }
    )
  }
}
