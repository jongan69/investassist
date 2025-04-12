import { INVEST_ASSIST_MINT } from '@/lib/solana/constants'

const contractAddress = INVEST_ASSIST_MINT
export async function GET() {
    try {
        const URL = `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
        const response = await fetch(URL, { cache: 'no-store' })
        const CoinData = await response.json()
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
        return Response.json(tokenInfo)
    } catch (error) {
        console.error('Error fetching token info:', error)
        return Response.json({ error: 'Failed to load token info' })
    }
}
