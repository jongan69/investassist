export async function fetchPulse() {
    try {
        const res = await fetch('/api/axiom-pulse')
        const data = await res.json()
        return data
    } catch (error) {
        console.error('Error fetching pulse data:', error)
        return null
    }
}