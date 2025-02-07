import { Card, CardContent } from "@/components/ui/card"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Skeleton } from "@/components/ui/skeleton"
import { getProfileByUsername } from "@/lib/users/getProfileByUsername"
import UserInvestmentPlan from "./components/UserInvestmentPlan"

type Props = {
  params: Promise<{
    username?: string
    walletAddress?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  if (!username) {
    return {
      title: "User Profile",
      description: "User profile page",
      keywords: ["profile", "user", "profile page"],
    }
  }
  return {
    title: `${username}'s Profile`,
    description: `Profile page for ${username}`,
    keywords: ["profile", username],
  }
}

function LoadingProfile() {
  return (
    <div className="space-y-8" suppressHydrationWarning>
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full bg-muted/50" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 bg-muted/50" />
          <Skeleton className="h-4 w-32 bg-muted/50" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-muted/25" />
        <Skeleton className="h-32 w-full bg-muted/25" />
      </div>
    </div>
  )
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  if (!username) {
    return <div>Username is required</div>
  }
  const profileData = await getProfileByUsername(username);
  if (!profileData.exists) {
    return <div>Profile not found</div>
  }
  
  return (
    <div className="min-w-full" suppressHydrationWarning>
          <Suspense fallback={<LoadingProfile />}>
            <UserInvestmentPlan profile={profileData.profile} />
          </Suspense>
    </div>
  )
}
