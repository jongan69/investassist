import { Suspense } from "react"
import type { Metadata } from "next"

import { Connection } from "@solana/web3.js"

import { Skeleton } from "@/components/ui/skeleton"
import { searchUsers } from "@/lib/users/searchUsers"

// import { getProfileByUsername } from "@/lib/users/getProfileByUsername"
// import { getProfileByWalletAddress } from "@/lib/users/getProfileByWallet"

import UserInvestmentPlan from "./components/UserInvestmentPlan"
import { getTokenAccountsWithMetadata } from "@/lib/solana/fetchTokensV2"
import type { TokenData } from "@/lib/solana/fetchTokens"

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
          // Ensure all required fields are present
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

    return (
      <div className="min-w-full" suppressHydrationWarning>
        <Suspense fallback={<LoadingProfile />}>
          <UserInvestmentPlan
            profile={profileData.profile}
            isWalletAddress={isWalletAddress}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error loading profile:', error);
    return <div>Error loading profile</div>
  }
}
