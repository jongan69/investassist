import { NextResponse } from "next/server"

export async function GET() {
    try {
        const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
        const options = {
            method: "GET",
            next: {
                revalidate: 3600,
            },
        }
        const res = await fetch(url, options)

        if (!res.ok) {
            throw new Error("Failed to fetch sector performance")
        }
        return NextResponse.json(await res.json())
    } catch (error) {
        console.error("Error fetching sector performance:", error)
        return NextResponse.json([])
    }
}