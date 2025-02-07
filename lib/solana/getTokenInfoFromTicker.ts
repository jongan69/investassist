import { getSolanaTokenCA } from "./getCaFromTicker"

import { getDexScreenerData } from "./fetchDexData"

export async function getTokenInfoFromTicker(ticker: string) {
    try {
        const contractAddress = await getSolanaTokenCA(ticker)
        const tokenInfo = await getDexScreenerData(contractAddress)
        return tokenInfo
    } catch (error) {
        console.error("Error fetching token info:", error)
        return null
    }
}