import { INVEST_ASSIST_MINT } from '@/lib/utils/constants'

const contractAddress = INVEST_ASSIST_MINT
export async function GET() {
    try {
        const URL = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
        const response = await fetch(URL, { cache: 'no-store' })
        const CoinData = await response.json()
        
        // Check if pairs exist and have at least one entry
        if (!CoinData.pairs || CoinData.pairs.length === 0) {
            return Response.json({
                ...CoinData,
                pair: [],
                message: 'No trading pairs found for this token'
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            })
        }
        
        const pairAddress = CoinData.pairs[0].pairAddress
        const pairURL = `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairAddress}`
        const pairResponse = await fetch(pairURL, { cache: 'no-store' })
        const pairData = await pairResponse.json()
        const tokenInfo = {
            ...CoinData,
            pair: [pairData]
        }
        // console.log('CoinData', CoinData)
        // console.log('pairData', pairData)
        return Response.json(tokenInfo, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        })
    } catch (error) {
        console.error('Error fetching token info:', error)
        return Response.json({ error: 'Failed to load token info' }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        })
    }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400' // 24 hours
        }
    });
}
