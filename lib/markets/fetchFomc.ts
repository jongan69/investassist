export async function fetchFomc() {
    try {
        // console.log('Fetching calendar data...');
        
        // fetch from calendar API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // console.log('Base URL:', baseUrl);
        const url = `${baseUrl}/api/fomc/latest`;
        
        // Add timeout to the fetch request - increase to 20 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('Request timed out after 20 seconds, aborting...');
            controller.abort();
        }, 20000); // 20 second timeout
        
        // Add more detailed fetch options
        const fetchOptions = { 
            signal: controller.signal,
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'InvestAssist/1.0'
            },
            // Add mode: 'cors' to explicitly handle CORS
            mode: 'cors' as RequestMode,
            // Add credentials to handle authentication if needed
            credentials: 'same-origin' as RequestCredentials
        };
        
        // console.log('Fetch options:', JSON.stringify(fetchOptions, null, 2));
        
        // Log the start time
        const startTime = Date.now();
        console.log('Starting fomc fetch request at:', new Date().toISOString());
        
        const response = await fetch(url, fetchOptions);
        
        // Log the end time and duration
        const endTime = Date.now();
        console.log('FOMC API Fetch completed at:', new Date().toISOString());
        console.log('FOMC API Fetch duration:', endTime - startTime, 'ms');
        
        clearTimeout(timeoutId);
                
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            console.error('Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 100)}...`);
        }
        
        const data = await response.json();
        // console.log('Calendar data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // The API already returns data in the correct format
        return data;
    } catch (error) {
        console.error('Error fetching calendar:', error);
        
        // Try a fallback to the external API directly if the internal API fails
        try {
            console.log('Attempting fallback to external API...');
            const externalUrl = 'https://marketapi-mu83.onrender.com/fomc/latest';
            // console.log('External API URL:', externalUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('Fallback request timed out after 15 seconds, aborting...');
                controller.abort();
            }, 15000);
            
            // Log the start time for fallback
            const startTime = Date.now();
            console.log('Starting fallback fetch at:', new Date().toISOString());
            
            const response = await fetch(externalUrl, { 
                cache: 'no-store',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'InvestAssist/1.0'
                }
            });
            
            // Log the end time and duration for fallback
            const endTime = Date.now();
            console.log('Fallback fetch completed at:', new Date().toISOString());
            console.log('Fallback fetch duration:', endTime - startTime, 'ms');
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`External API returned status: ${response.status}`);
            }
            
            const rawData = await response.json();
            
            // Transform the data into the expected format
            const transformedData = {
                calendar: rawData.events || [],
                total_events: rawData.events ? rawData.events.length : 0,
                dates: rawData.events ? [...new Set(rawData.events.map((event: any) => event.Date))] : []
            };
            
            console.log('Fallback successful, returning transformed data');
            return transformedData;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            
            // Return a default structure with a message about the error
            return {
                calendar: [],
                total_events: 0,
                dates: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}