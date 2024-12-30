export async function fetchFearGreedIndex() {
  try {
    const url = "https://fear-and-greed-index.p.rapidapi.com/v1/fgi"

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "a6296db2bamshd608b485c322047p1b0b03jsn5e4c3b5d0c77",
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
    console.log("Fetched fear and greed index", data)
    return data
  } catch (error) {
    console.error("Error fetching fear and greed index", error)
    throw new Error("Failed to fetch fear and greed index")
  }
}
