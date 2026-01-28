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
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            })
            
            clearTimeout(timeoutId)

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Unknown error')
                console.error("Failed to fetch sector performance:", res.status, res.statusText, errorText)
                return NextResponse.json(
                    { error: `Failed to fetch sector performance data: ${res.status} ${res.statusText}` },
                    { status: res.status }
                )
            }

            const data = await res.json()
            
            // Check if API returned an error message (FMP legacy endpoint deprecation)
            if (data && typeof data === 'object' && 'Error Message' in data) {
                const errorMsg = data['Error Message']
                console.error("FMP API error:", errorMsg)
                
                // Return empty array with warning instead of error to prevent UI crashes
                // The component will handle empty data gracefully
                if (errorMsg.includes('Legacy Endpoint') || errorMsg.includes('no longer supported')) {
                    console.warn("FMP API endpoint deprecated, returning empty array")
                    return NextResponse.json([], {
                        headers: {
                            'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                        },
                    })
                }
                
                return NextResponse.json(
                    { error: errorMsg || "API returned an error" },
                    { status: 500 }
                )
            }
            
            if (!Array.isArray(data)) {
                console.error("Invalid response format from FMP API:", typeof data, data)
                return NextResponse.json(
                    { error: "Invalid data format received from API" },
                    { status: 500 }
                )
            }
            
            // Validate data structure
            if (data.length === 0) {
                console.warn("FMP API returned empty array")
                return NextResponse.json([])
            }

            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                },
            })
        } catch (fetchError) {
            clearTimeout(timeoutId)
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error("Sector performance fetch timeout")
                return NextResponse.json(
                    { error: "Request timeout - please try again later" },
                    { status: 504 }
                )
            }
            throw fetchError
        }
    } catch (error) {
        console.error("Error fetching sector performance:", error)
        const errorMessage = error instanceof Error ? error.message : "Internal server error"
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}