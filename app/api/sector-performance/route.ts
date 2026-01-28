import { NextResponse } from "next/server"

interface SectorSnapshot {
    date: string
    sector: string
    exchange: string
    averageChange: number
}

interface SectorPerformance {
    sector: string
    changesPercentage: string
}

/**
 * Aggregates sector performance data across exchanges
 * Converts decimal values to percentage strings
 */
function transformSectorData(snapshots: SectorSnapshot[]): SectorPerformance[] {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
        return []
    }

    // Group by sector and aggregate across exchanges
    const sectorMap = new Map<string, number[]>()
    
    for (const snapshot of snapshots) {
        if (!sectorMap.has(snapshot.sector)) {
            sectorMap.set(snapshot.sector, [])
        }
        sectorMap.get(snapshot.sector)!.push(snapshot.averageChange)
    }

    // Calculate average change per sector and format as percentage string
    const result: SectorPerformance[] = []
    
    for (const [sector, changes] of Array.from(sectorMap.entries())) {
        const averageChange = changes.reduce((sum, val) => sum + val, 0) / changes.length
        const percentage = (averageChange * 100).toFixed(2) + "%"
        
        result.push({
            sector,
            changesPercentage: percentage
        })
    }

    // Sort by sector name for consistent ordering
    return result.sort((a, b) => a.sector.localeCompare(b.sector))
}

export async function GET() {
    try {
        if (!process.env.FMP_API_KEY) {
            console.error("FMP_API_KEY is not configured")
            return NextResponse.json(
                { error: "API configuration error" },
                { status: 500 }
            )
        }

        // Use today's date for the snapshot endpoint
        const today = new Date().toISOString().split('T')[0]
        const url = `https://financialmodelingprep.com/stable/sector-performance-snapshot?date=${today}&apikey=${process.env.FMP_API_KEY}`
        
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

            // Handle non-OK responses
            if (!res.ok) {
                // Always try to parse as JSON first (FMP API returns JSON even for errors)
                let errorData: any = null
                let errorText = ''
                
                try {
                    const responseText = await res.text()
                    try {
                        errorData = JSON.parse(responseText)
                    } catch {
                        errorText = responseText || res.statusText || 'Unknown error'
                    }
                } catch (parseError) {
                    errorText = res.statusText || 'Unknown error'
                    console.error("Error parsing response:", parseError)
                }
                
                console.error("Failed to fetch sector performance:", res.status, res.statusText, errorText || errorData)
                
                // Check if API returned an error message in JSON format
                if (errorData && typeof errorData === 'object' && 'Error Message' in errorData) {
                    const errorMsg = errorData['Error Message']
                    const errorMessage = typeof errorMsg === 'string' ? errorMsg : String(errorMsg)
                    
                    console.error("FMP API error:", errorMessage)
                    
                    // Return empty array with warning instead of error to prevent UI crashes
                    if (typeof errorMessage === 'string' && (errorMessage.includes('Legacy Endpoint') || errorMessage.includes('no longer supported'))) {
                        console.warn("FMP API endpoint deprecated, returning empty array")
                        return NextResponse.json([], {
                            headers: {
                                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                            },
                        })
                    }
                }
                
                // Handle 403 Forbidden or other errors gracefully
                if (res.status === 403 || res.status === 404) {
                    console.warn(`FMP API returned ${res.status}, returning empty array`)
                    return NextResponse.json([], {
                        headers: {
                            'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                        },
                    })
                }
                
                return NextResponse.json(
                    { error: `Failed to fetch sector performance data: ${res.status} ${res.statusText}` },
                    { status: res.status }
                )
            }

            const data = await res.json()
            
            // Validate response is an array
            if (!Array.isArray(data)) {
                console.error("Invalid response format from FMP API:", typeof data, data)
                
                // Check if API returned an error message (some errors might return 200 with error object)
                if (data && typeof data === 'object' && 'Error Message' in data) {
                    const errorMsg = data['Error Message']
                    const errorMessage = typeof errorMsg === 'string' ? errorMsg : String(errorMsg)
                    
                    console.error("FMP API error:", errorMessage)
                    
                    if (typeof errorMessage === 'string' && (errorMessage.includes('Legacy Endpoint') || errorMessage.includes('no longer supported'))) {
                        console.warn("FMP API endpoint deprecated, returning empty array")
                        return NextResponse.json([], {
                            headers: {
                                'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                            },
                        })
                    }
                }
                
                return NextResponse.json(
                    { error: "Invalid data format received from API" },
                    { status: 500 }
                )
            }

            // Transform the new format to expected format
            const transformedData = transformSectorData(data as SectorSnapshot[])
            
            if (transformedData.length === 0) {
                console.warn("FMP API returned empty array or no valid sector data")
                return NextResponse.json([], {
                    headers: {
                        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
                    },
                })
            }

            return NextResponse.json(transformedData, {
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
