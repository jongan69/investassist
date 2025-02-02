import { NextResponse } from "next/server"

export async function GET() {
    try {
        const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
        const res = await fetch(url)

        if (!res.ok) {
           console.error("Failed to fetch sector performance: ", res)
        }

        const data = await res.json();
        return NextResponse.json(data, {
            headers: {
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
            },
          });
    } catch (error) {
        console.error("Error fetching sector performance:", error)
        return NextResponse.json([])
    }
}