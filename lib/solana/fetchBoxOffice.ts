export async function fetchBoxOffice() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not set")
    }
    try {
        const res = await fetch(`${baseUrl}/api/boxoffice`)
        const data = await res.json()
        return data
    } catch (error) {
        console.error("Error fetching Box Office data:", error)
        return []
    }
}