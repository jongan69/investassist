import { MARKET_API } from "@/lib/utils/constants";

export async function GET(request: Request) {
    try {
        // Get the option parameter from the URL
        const url = new URL(request.url);
        const option: string | null = url.searchParams.get('option');
        
        // Construct the URL based on the option
        const baseURL = `${MARKET_API}/insider`;
        const apiURL = option 
            ? `${baseURL}?option=${option}` 
            : baseURL;
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('API route: Request timed out after 15 seconds, aborting...');
            controller.abort();
        }, 15000); // 15 second timeout
        
        const response = await fetch(apiURL, { 
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'InvestAssist/1.0'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`External API returned status: ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Transform the data into the expected format
        const transformedData = rawData?.map((item: any) => ({
            Ticker: item.Ticker || '',
            Owner: item.Owner || '',
            Relationship: item.Relationship || '',
            Date: item.Date || '',
            Transaction: item.Transaction || '',
            Cost: item.Cost || '',
            Shares: item["#Shares"] || '',
            Value: `$${item["Value ($)"]}` || '',
            Total: item["#Shares Total"] || '',
            SEC: item["SEC Form 4"] || ''
        }));
        
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
        console.error('Error fetching insider trading data:', error);
        
        const errorMessage = error instanceof Error 
            ? `Failed to load insider trading data: ${error.message}` 
            : 'Failed to load insider trading data';
            
        return new Response(JSON.stringify({ 
            error: errorMessage,
            data: []
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
