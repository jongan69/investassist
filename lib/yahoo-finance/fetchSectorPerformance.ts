export async function fetchSectorPerformance() {
  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sector-performance`)
  
    if (!res.ok) {
      throw new Error("Failed to fetch sector performance")
    }
    return res.json()
  } catch (error) {
    console.error("Error fetching sector performance:", error)
    return []
  }
}
