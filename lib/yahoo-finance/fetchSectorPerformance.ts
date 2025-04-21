export async function fetchSectorPerformance() {
  try {
    const res = await fetch(`/api/sector-performance`)
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    
    if ('error' in data) {
      throw new Error(data.error)
    }

    return data
  } catch (error) {
    console.error("Error fetching sector performance:", error)
    return { error: error instanceof Error ? error.message : "Failed to fetch sector performance" }
  }
}
