import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns"
import Link from "next/link"
import { fetchTwitterSearch } from "@/lib/twitter/fetchTwitterSearch"

function timeAgo(publishTime: string) {
  const publishDate = new Date(publishTime)
  const now = new Date()

  const diffInMinutes = differenceInMinutes(now, publishDate)
  const diffInHours = differenceInHours(now, publishDate)
  const diffInDays = differenceInDays(now, publishDate)

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}

interface Tweet {
  id: string
  text: string
  username: string
  name: string
  timeParsed: string
  permanentUrl: string
}

export default async function CoinNews({ ticker }: { ticker: string }) {
  const coinNewsData = await fetchTwitterSearch(`$${ticker} coin`)

  return (
    <div className="w-4/5">
      {coinNewsData.tweets.tweets.length === 0 && (
        <div className="py-4 text-center text-sm font-medium text-muted-foreground">
          No Recent Tweets
        </div>
      )}
      {coinNewsData.tweets.tweets.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {coinNewsData.tweets.tweets.map((tweet: Tweet) => (
              <Link
                key={tweet.id}
                href={tweet.permanentUrl}
                prefetch={false}
                className="flex flex-col gap-1"
                target="_blank"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {tweet.name} (@{tweet.username}) - {timeAgo(tweet.timeParsed)}
                </span>
                <span className="font-semibold">{tweet.text}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
