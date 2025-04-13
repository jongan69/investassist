export async function fetchCalendar() {
    try {
        console.log('Fetching calendar data...');
        // Use a hardcoded base URL for testing
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        // console.log('Base URL:', baseUrl);
        const url = `${baseUrl}/api/calendar`;
        // console.log('Full URL:', url);
        const response = await fetch(url);
        // console.log('Response status:', response.status);
        const data = await response.json();
        // console.log('Calendar data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Ensure the data has the expected structure
        if (!data.calendar || !Array.isArray(data.calendar)) {
            console.error('Invalid calendar data structure:', data);
            return {
                calendar: [],
                total_events: 0,
                dates: []
            };
        }
        
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