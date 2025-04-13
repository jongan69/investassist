export async function GET() {
    try {
        const URL = `https://marketapi-mu83.onrender.com/calendar`
        const response = await fetch(URL, { cache: 'no-store' })
        const calendarData = await response.json()
        return Response.json(calendarData)
    } catch (error) {
        console.error('Error fetching calendar data:', error)
        return Response.json({ error: 'Failed to load calendar data' })
    }
}
