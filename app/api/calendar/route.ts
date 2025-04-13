export async function GET() {
    try {
        // console.log('API route: Fetching calendar data...');
        const URL = `https://marketapi-mu83.onrender.com/calendar`;
        // console.log('External API URL:', URL);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('API route: Request timed out after 15 seconds, aborting...');
            controller.abort();
        }, 15000); // 15 second timeout
        
        // Log the start time
        const startTime = Date.now();
        console.log('API route: Starting fetch at:', new Date().toISOString());
        
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
        console.log('API route: Fetch completed at:', new Date().toISOString());
        console.log('API route: Fetch duration:', endTime - startTime, 'ms');
        
        clearTimeout(timeoutId);
        
        console.log('External API response status:', response.status);
        console.log('External API response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            console.error('Error response body:', errorText);
            throw new Error(`External API returned status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
        }
        
        const rawData = await response.json();
        console.log('External API raw data:', rawData);
        
        // Transform the data into the expected format
        const transformedData = {
            calendar: rawData.events || [],
            total_events: rawData.events ? rawData.events.length : 0,
            dates: rawData.events ? [...new Set(rawData.events.map((event: any) => event.Date))] : []
        };
        
        console.log('Transformed calendar data:', transformedData);
        
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
        console.error('Error fetching calendar data:', error);
        
        // Return a more detailed error message with CORS headers
        const errorMessage = error instanceof Error 
            ? `Failed to load calendar data: ${error.message}` 
            : 'Failed to load calendar data';
            
        return new Response(JSON.stringify({ 
            error: errorMessage,
            calendar: [],
            total_events: 0,
            dates: []
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
