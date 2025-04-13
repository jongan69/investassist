export async function fetchCalendar() {
    try {
        console.log('Fetching calendar data...');
        
        // fetch from calendar API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        console.log('Base URL:', baseUrl);
        const url = `${baseUrl}/api/calendar`;
        console.log('Full URL:', url);
        
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { 
            signal: controller.signal,
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Calendar data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // The API already returns data in the correct format
        return data;
    } catch (error) {
        console.error('Error fetching calendar:', error);
        
        // Return a default structure with a message about the error
        return {
            calendar: [],
            total_events: 0,
            dates: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}