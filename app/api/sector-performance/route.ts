import { NextResponse } from "next/server"

export async function GET() {
    try {
        const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
        const res = await fetch(url)

        if (!res.ok) {
           console.error("Failed to fetch sector performance: ", res)
        }
        return NextResponse.json(await res.json())
    } catch (error) {
        console.error("Error fetching sector performance:", error)
        return NextResponse.json([])
    }
}