import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Eye } from 'lucide-react'

interface Tweet {
  id: string
  text: string
  html: string
  name: string
  username: string
  likes: number
  retweets: number
  replies: number
  views: number
  photos?: { url: string; id: string }[]
  videos?: { preview: string; url: string; id: string }[]
  timeParsed: string
  isRetweet: boolean
  isReply: boolean
  retweetedStatus?: Tweet
}

interface UserTweetsProps {
  tweets: Tweet[]
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  const displayTweet = tweet.isRetweet ? tweet.retweetedStatus! : tweet
  const formattedDate = formatDistanceToNow(new Date(displayTweet.timeParsed), { addSuffix: true })

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
      {tweet.isRetweet && (
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Repeat2 className="w-4 h-4 mr-2" />
          <span>{tweet.name} Retweeted</span>
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-semibold">{displayTweet.name}</span>
            <span className="text-gray-500 ml-2">@{displayTweet.username}</span>
            <span className="text-gray-500 mx-2">·</span>
            <span className="text-gray-500">{formattedDate}</span>
          </div>
          
          <div className="mb-3" dangerouslySetInnerHTML={{ __html: displayTweet.html }} />

          {displayTweet.photos?.map((photo) => (
            <div key={photo.id} className="relative rounded-lg overflow-hidden mb-3">
              <Image
                src={photo.url}
                alt="Tweet image"
                width={500}
                height={300}
                className="object-cover"
                priority={false}
              />
            </div>
          ))}

          {displayTweet.videos?.map((video) => (
            <div key={video.id} className="relative rounded-lg overflow-hidden mb-3">
              <video
                controls
                poster={video.preview}
                className="w-full"
              >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}

          <div className="flex items-center space-x-6 text-gray-500 text-sm mt-2">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>{displayTweet.replies}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Repeat2 className="w-4 h-4" />
              <span>{displayTweet.retweets}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>{displayTweet.likes}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{displayTweet.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserTweets({ tweets }: UserTweetsProps) {
  if (!tweets?.length) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        No tweets found
      </div>
    )
  }

  return (
    <div className="space-y-4 pr-2">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="transform transition-all duration-200 hover:scale-[1.02]">
          <TweetCard tweet={tweet} />
        </div>
      ))}
    </div>
  )
} 