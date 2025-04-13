export async function fetchCalendar() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar`);
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error('Error fetching calendar:', error);
        return [];
    }
}