export async function fetchSectorPerformance() {
    const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`
    const options = {
      method: "GET",
      next: {
        revalidate: 3600,
      },
    }
    const res = await fetch(url, options)
  
    if (!res.ok) {
      throw new Error("Failed to fetch sector performance")
    }
    return res.json()
  }