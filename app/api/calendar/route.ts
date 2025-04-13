export async function GET() {
    try {
        console.log('API route: Fetching calendar data...');
        const URL = `https://marketapi-mu83.onrender.com/calendar`;
        console.log('External API URL:', URL);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(URL, { 
            cache: 'no-store',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('External API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`External API returned status: ${response.status}`);
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
        return Response.json(transformedData);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        
        // Return a more detailed error message
        const errorMessage = error instanceof Error 
            ? `Failed to load calendar data: ${error.message}` 
            : 'Failed to load calendar data';
            
        return Response.json({ 
            error: errorMessage,
            calendar: [],
            total_events: 0,
            dates: []
        });
    }
}
