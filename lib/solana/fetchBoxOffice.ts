export async function fetchBoxOffice() {
    try {
        const res = await fetch(`/api/boxoffice`)
        const data = await res.json()
        return data
    } catch (error) {
        console.error("Error fetching Box Office data:", error)
        return []
    }
}