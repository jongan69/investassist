import { NextResponse } from "next/server"

export async function GET() {
    try {
        if (!process.env.FMP_API_KEY) {
            console.error("FMP_API_KEY is not configured")
            return NextResponse.json(
                { error: "API configuration error" },
                { status: 500 }
            )
        }

        const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
        const res = await fetch(url)

        if (!res.ok) {
            console.error("Failed to fetch sector performance:", res.status, res.statusText)
            return NextResponse.json(
                { error: "Failed to fetch sector performance data" },
                { status: res.status }
            )
        }

        const data = await res.json()
        
        if (!Array.isArray(data)) {
            console.error("Invalid response format from FMP API")
            return NextResponse.json(
                { error: "Invalid data format received" },
                { status: 500 }
            )
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
            },
        })
    } catch (error) {
        console.error("Error fetching sector performance:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}