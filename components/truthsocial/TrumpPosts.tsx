"use client";
import { useState, useEffect } from "react";
import { fetchTrumpSocialPosts } from "@/lib/truthsocial/fetchTrumpSocialPosts";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { formatNumber } from "@/lib/utils";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces for the data structure
interface MediaAttachment {
  id: string;
  type: string;
  url: string;
  preview_url: string;
  description: string | null;
  meta: {
    original: {
      width: number;
      height: number;
    };
  };
}

interface Account {
  id: string;
  username: string;
  display_name: string;
  avatar: string;
  avatar_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  verified: boolean;
}

interface Post {
  id: string;
  created_at: string;
  content: string;
  account: Account;
  media_attachments: MediaAttachment[];
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  url: string;
}

// Loading component
function LoadingPosts() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Donald J. Trump on Truth Social</h1>
      <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full rounded-xl border bg-card p-4 shadow-md animate-pulse">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-secondary mr-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-secondary mb-1"></div>
                      <div className="h-2 w-32 bg-secondary"></div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-secondary mb-1"></div>
                  <div className="h-2 w-3/4 bg-secondary mb-2"></div>
                  <div className="flex justify-between">
                    <div className="h-2 w-12 bg-secondary"></div>
                    <div className="h-2 w-12 bg-secondary"></div>
                    <div className="h-2 w-12 bg-secondary"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorPosts() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Donald J. Trump on Truth Social</h1>
      <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-red-50 dark:bg-red-900/30">
        <p className="text-base text-red-600 dark:text-red-400">Failed to load posts. Please try again later.</p>
      </div>
    </div>
  );
}

// Empty state component
function EmptyPosts() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Donald J. Trump on Truth Social</h1>
      <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-gray-100 dark:bg-gray-800">
        <p className="text-base text-gray-600 dark:text-gray-400">No posts available at the moment.</p>
      </div>
    </div>
  );
}

// Post card component
function PostCard({ post, formattedDate }: { post: Post; formattedDate: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Function to handle card click and open the post
  const handleCardClick = () => {
    if (post.url) {
      window.open(post.url, '_blank');
    }
  };
  
  return (
    <div 
      className="w-full rounded-xl border bg-card p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={handleCardClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
            <Image 
              src={post.account.avatar} 
              alt={post.account.display_name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h3 className="font-semibold text-sm truncate">{post.account.display_name}</h3>
              {post.account.verified && (
                <svg className="h-4 w-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">@{post.account.username}</p>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {formattedDate}
            </p>
          </div>
        </div>
        
        <div 
          className="text-sm text-foreground mb-2 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Media Attachments */}
        {post.media_attachments.length > 0 && (
          <div className="mt-2 space-y-3">
            {post.media_attachments.map((media) => (
              <div key={media.id} className="rounded-lg overflow-hidden">
                {media.type === "image" ? (
                  <div className="relative aspect-video">
                    <Image
                      src={media.url}
                      alt={media.description || "Post image"}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : media.type === "video" ? (
                  <div className="relative aspect-video">
                    <video 
                      src={media.url} 
                      controls
                      className="w-full h-full rounded-lg"
                      poster={media.preview_url}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between text-xs mt-auto">
          <div className="text-muted-foreground">
            <span className="font-medium">{formatNumber(post.replies_count)}</span> replies
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">{formatNumber(post.reblogs_count)}</span> reblogs
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">{formatNumber(post.favourites_count)}</span> favorites
          </div>
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View on Truth Social
          </a>
        </div>
      </div>
    </div>
  );
}

// Client-side component that fetches data
function TrumpPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      if (hasFetched) return;
      
      try {
        setLoading(true);
        const data = await fetchTrumpSocialPosts();
        setPosts(data);
        setHasFetched(true);
      } catch (err) {
        setError("Failed to load posts. Please try again later.");
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [hasFetched]);

  useEffect(() => {
    if (posts.length > 0) {
      const dates: Record<string, string> = {};
      posts.forEach(post => {
        dates[post.id] = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
      });
      setFormattedDates(dates);
    }
  }, [posts]);

  if (loading) {
    return <LoadingPosts />;
  }

  if (error) {
    return <ErrorPosts />;
  }

  if (!posts || posts.length === 0) {
    return <EmptyPosts />;
  }

  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Donald J. Trump on Truth Social</h1>
      <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              formattedDate={formattedDates[post.id] || formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main component
export default function TrumpPosts() {
  return <TrumpPostsClient />;
}