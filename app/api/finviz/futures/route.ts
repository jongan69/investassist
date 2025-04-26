import { MARKET_API } from "@/lib/utils/constants";

export async function GET() {
    try {
        // console.log('API route: Fetching calendar data...');
        const URL = `${MARKET_API}/futures`;
        // console.log('External API URL:', URL);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('API route: Request timed out after 15 seconds, aborting...');
            controller.abort();
        }, 15000); // 15 second timeout
        
        // Log the start time
        const startTime = Date.now();
        console.log('Finviz Futures API route: Starting fetch at:', new Date().toISOString());
        
        const response = await fetch(URL, { 
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'InvestAssist/1.0'
            }
        });
        
        // Log the end time and duration
        const endTime = Date.now();
        console.log('Finviz Futures API route: Fetch completed at:', new Date().toISOString());
        console.log('Finviz Futures API route: Fetch duration:', endTime - startTime, 'ms');
        clearTimeout(timeoutId);
        
        console.log('Finviz Futures API route response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            console.error('Error response body:', errorText);
            throw new Error(`External API returned status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
        }
        
        const rawData = await response.json();
        // console.log('External API raw data:', rawData);
        
        // Transform the data into the expected format
        const transformedData = {
            futures: rawData || [],
            total_futures: rawData ? rawData.length : 0,

        };
        
        // console.log('Transformed futures data:', transformedData);
        
        // Return with CORS headers
        return new Response(JSON.stringify(transformedData), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600'
            }
        });
    } catch (error) {
        console.error('Error fetching futures data:', error);
        
        // Return a more detailed error message with CORS headers
        const errorMessage = error instanceof Error 
            ? `Failed to load futures data: ${error.message}` 
            : 'Failed to load futures data';
            
        return new Response(JSON.stringify({ 
            error: errorMessage,
            futures: [],
            total_futures: 0,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
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
