import { NextResponse } from "next/server"

const FRED_API_KEY = process.env.FRED_API_KEY

// Define the Release interface based on the FRED API response
interface Release {
    id: number;
    realtime_start: string;
    realtime_end: string;
    name: string;
    press_release: boolean;
    link?: string;
    notes?: string;
}

export async function GET(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url)
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Extract all possible parameters with defaults optimized for market-impacting releases
    const file_type = searchParams.get('file_type') || 'json'
    const realtime_start = searchParams.get('realtime_start') || today
    const realtime_end = searchParams.get('realtime_end') || today
    const limit = searchParams.get('limit') || '1000' // Get maximum releases by default
    const offset = searchParams.get('offset') || '0'
    const order_by = searchParams.get('order_by') || 'release_id'
    const sort_order = searchParams.get('sort_order') || 'desc' // Default to descending to get latest first
    
    // Build the URL with all parameters
    let url = `https://api.stlouisfed.org/fred/releases/dates?api_key=${FRED_API_KEY}&file_type=${file_type}&realtime_start=${realtime_start}&realtime_end=${realtime_end}&limit=${limit}&offset=${offset}&order_by=${order_by}&sort_order=${sort_order}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    // Return the complete data without any filtering or post-processing
    return NextResponse.json(data)
}