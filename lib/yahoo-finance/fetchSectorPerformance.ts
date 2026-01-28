export async function fetchSectorPerformance() {
  try {
    const res = await fetch(`/api/sector-performance`, {
      cache: 'no-store',
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!res.ok) {
      let errorMessage = `HTTP error! status: ${res.status}`
      try {
        const errorData = await res.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = res.statusText || errorMessage
      }
      console.error("Sector performance API error:", errorMessage)
      return { error: errorMessage }
    }

    const data = await res.json()
    
    if ('error' in data) {
      console.error("Sector performance API returned error:", data.error)
      return { error: data.error }
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      console.error("Invalid response format from sector performance API")
      return { error: "Invalid data format received" }
    }

    return data
  } catch (error) {
    console.error("Error fetching sector performance:", error)
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch sector performance data" 
    }
  }
}
