import { Suspense } from "react"
import { useMemo } from "react"
import type { Metadata } from "next"

import { Connection } from "@solana/web3.js"

import { Skeleton } from "@/components/ui/skeleton"
import { searchUsers } from "@/lib/users/searchUsers"

// import { getProfileByUsername } from "@/lib/users/getProfileByUsername"
// import { getProfileByWalletAddress } from "@/lib/users/getProfileByWallet"

import UserInvestmentPlan from "./components/UserInvestmentPlan"
import UserTweets from "./components/UserTweets"
import { getTokenAccountsWithMetadata } from "@/lib/solana/fetchTokensV2"
import type { TokenData } from "@/lib/solana/fetchTokens"
import { fetchUserTweets } from "@/lib/twitter/fetchUserTweets"
import { Card, CardContent } from "@/components/ui/card"
import { ClientAllocationChart } from "./components/charts/ClientAllocationChart"
// Constants
const RPC_ENDPOINT = 'https://christiane-z5lsaw-fast-mainnet.helius-rpc.com';
const solanaConnection = new Connection(RPC_ENDPOINT);

// Types
type Props = {
  params: Promise<{
    user: string
  }>
}

interface Profile {
  username: string;
  walletAddress: string;
  holdings: TokenData[];
  totalValue: number;
  investmentPlan?: any;
}

interface ProfileData {
  exists: boolean;
  profile: Profile;
}

// Loading component
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

// Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;
  const userProfile = await searchUsers(user);
  if (!userProfile) {
    return {
      title: "User Profile",
      description: "User profile page",
      keywords: ["profile", "user", "profile page"],
    }
  }

  return {
    title: `${userProfile[0]?.username}'s Profile`,
    description: `Portfolio page for ${userProfile[0]?.username}`,
    keywords: ["profile", userProfile[0]?.username],
  }
}

// Main page component
export default async function UserProfilePage({ params }: Props) {
  const { user } = await params;
  if (!user) {
    return <div>No username or wallet address provided</div>
  }

  try {
    const userProfile = await searchUsers(user);
    const userTweets = await fetchUserTweets(userProfile[0]?.username);
    let isWalletAddress = false;
    const tokens = await getTokenAccountsWithMetadata(user, solanaConnection);
    const totalValue = tokens.reduce((sum: number, token: TokenData) => sum + token.usdValue, 0);

    // Format the data to match the Profile type
    const profileData: ProfileData = {
      exists: true,
      profile: {
        username: userProfile[0]?.username,
        walletAddress: user,
        holdings: tokens.map(token => ({
          ...token,
          name: token.name || 'Unknown Token',
          symbol: token.symbol || '???',
          amount: token.amount || 0,
          usdValue: token.usdValue || 0,
          decimals: token.decimals || 0,
          logo: token.logo || '',
          isNft: token.isNft || false,
          description: token.description || '',
          tokenAddress: token.tokenAddress || '',
          cid: token.cid || null
        })),
        totalValue,
        investmentPlan: undefined
      }
    };

    // Calculate current allocations
    const currentAllocations = profileData.profile.holdings
      .filter(token => token.usdValue > 0)
      .sort((a, b) => b.usdValue - a.usdValue)
      .map(token => ({
        asset: token.symbol || 'Unknown',
        percentage: (token.usdValue / totalValue) * 100
      }));

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
        {/* Header Section */}
        <div className="w-full bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* User Info */}
              <div className="lg:w-1/3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {profileData.profile.username}&apos;s Portfolio
                </h1>
                <p className="text-sm text-gray-500 mt-1 break-all">{profileData.profile.walletAddress}</p>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-3xl font-bold text-pink-500">${profileData.profile.totalValue.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Allocation Chart */}
              <div className="lg:w-2/3">
                <Card className="h-[400px] lg:h-[350px]">
                  <CardContent className="h-full p-4">
                    <div className="flex flex-col h-full">
                      <h2 className="text-lg font-semibold">Portfolio Allocation</h2>
                      <div className="flex-1 min-h-0 w-full">
                        <ClientAllocationChart allocations={currentAllocations} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Holdings */}
            <div className="space-y-4">
              <div className="sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Holdings</h2>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <Suspense fallback={<LoadingProfile />}>
                    <UserInvestmentPlan
                      profile={profileData.profile}
                      isWalletAddress={isWalletAddress}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
            
            {/* Right Column - Tweets */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Recent Tweets</h2>
              <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-4 rounded-lg">
                <Suspense fallback={<LoadingProfile />}>
                  <UserTweets tweets={userTweets} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading profile:', error);
    return <div>Error loading profile</div>
  }
}
