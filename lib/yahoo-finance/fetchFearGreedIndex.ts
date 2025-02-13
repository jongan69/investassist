export async function fetchFearGreedIndex() {
  try {
    const url = "https://fear-and-greed-index.p.rapidapi.com/v1/fgi"

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY as string,
        "X-RapidAPI-Host": "fear-and-greed-index.p.rapidapi.com",
      },
      next: {
        revalidate: 3600,
      },
    }
    const res = await fetch(url, options)
    if (!res.ok) {
      throw new Error("Failed to fetch fear and greed index")
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching fear and greed index", error)
    return null
  }
}
