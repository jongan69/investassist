import { cn } from "@/lib/utils"
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"

export default async function FearGreedIndex() {
  const data = await fetchFearGreedIndex()

  return (
    <div>
      {/* FEAR AND GREED INDEX */}
      <div>
        The markets are{" "}
        <strong
          className={cn(
            data.fgi.now.value > 80
              ? "text-green-500"
              : data.fgi.now.value > 60
                ? "text-green-400"
                : data.fgi.now.value > 40
                  ? "text-gray-500"
                  : data.fgi.now.value > 20
                    ? "text-red-400"
                    : "text-red-500"
          )}
        >
          {data.fgi.now.value > 80
            ? "extremely bullish"
            : data.fgi.now.value > 60
              ? "bullish"
              : data.fgi.now.value > 40
                ? "neutral"
                : data.fgi.now.value > 20
                  ? "bearish"
                  : "extremely bearish"}
        </strong>
      </div>
    </div>
  )
}
