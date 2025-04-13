export async function GET() {
    try {
        // console.log('API route: Fetching calendar data...');
        const URL = `https://marketapi-mu83.onrender.com/calendar`
        // console.log('External API URL:', URL);
        const response = await fetch(URL, { cache: 'no-store' })
        // console.log('External API response status:', response.status);
        const rawData = await response.json()
        // console.log('External API raw data:', rawData);
        
        // Transform the data into the expected format
        const transformedData = {
            calendar: rawData.events || [],
            total_events: rawData.events ? rawData.events.length : 0,
            dates: rawData.events ? [...new Set(rawData.events.map((event: any) => event.Date))] : []
        };
        
        // console.log('Transformed calendar data:', transformedData);
        return Response.json(transformedData)
    } catch (error) {
        console.error('Error fetching calendar data:', error)
        return Response.json({ error: 'Failed to load calendar data' })
    }
}
