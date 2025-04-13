export async function fetchCalendar() {
    try {
        console.log('Fetching calendar data...');
        
        // fetch from calendar API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        console.log('Base URL:', baseUrl);
        const url = `${baseUrl}/api/calendar`;
        console.log('Full URL:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Calendar data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // The API already returns data in the correct format
        return data;
    } catch (error) {
        console.error('Error fetching calendar:', error);
        // Return a default structure instead of an empty array
        return {
            calendar: [],
            total_events: 0,
            dates: []
        };
    }
}