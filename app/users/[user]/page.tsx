import { Suspense } from "react"
import type { Metadata } from "next"

// Types
import type { TokenData } from "@/lib/solana/fetchTokens"

// Client Components
import { ErrorBoundary } from "@/components/users/ErrorBoundary"
import UserProfileLoadingWithFeedback from "@/components/users/UserProfileLoadingWithFeedback"

// Import the UserProfileContainer component dynamically
const UserProfileContainer = (await import('@/components/users/UserProfileContainer')).default;

// Lib
import { fetchUserTweets } from "@/lib/twitter/fetchUserTweets"
import { fetchFearGreedIndex } from "@/lib/yahoo-finance/fetchFearGreedIndex"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const fetchCryptoTrendsServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/crypto-trends`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching crypto trends:', error);
    return [];
  }
}

const searchUsersServer = async (query: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/database/search-users?q=${query}`);
    return response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

const fetchSectorPerformanceServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/sector-performance`);
    return response.json();
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    return [];
  }
}

// New interfaces for the holdings response
interface TokenAccount {
  address: string;
  balance: number;
}

interface PriceInfo {
  price_per_token: number;
  total_price: number;
  currency: string;
}

interface TokenInfo {
  token_accounts: TokenAccount[];
  symbol: string;
  balance: number;
  supply: number;
  decimals: number;
  token_program: string;
  associated_token_address: string;
  price_info: PriceInfo;
}

interface TokenContent {
  $schema: string;
  json_uri: string;
  files: Array<{
    uri: string;
    cdn_uri: string;
    mime: string;
  }>;
  metadata: {
    description: string;
    name: string;
    symbol: string;
    token_standard: string;
  };
  links: {
    image: string;
  };
}

interface TokenAuthority {
  address: string;
  scopes: string[];
}

interface TokenItem {
  interface: string;
  id: string;
  content: TokenContent;
  authorities: TokenAuthority[];
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: any[];
  royalty: {
    royalty_model: string;
    target: null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: any[];
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: null;
    ownership_model: string;
    owner: string;
  };
  supply: null;
  mutable: boolean;
  burnt: boolean;
  token_info: TokenInfo;
  inscription: null;
  spl20: null;
}

interface NativeBalance {
  lamports: number;
  price_per_sol: number;
  total_price: number;
}

interface HoldingsResult {
  total: number;
  limit: number;
  page: number;
  items: TokenItem[];
  nativeBalance: NativeBalance;
}

interface HoldingsResponse {
  jsonrpc: string;
  result: HoldingsResult;
  id: string;
}

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

// Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;
  const userProfile = await searchUsersServer(user);
  if (!userProfile) {
    return {
      title: "User Profile",
      description: "User profile page",
      keywords: ["profile", "user", "profile page"],
    }
  }

  return {
    title: `${userProfile[0]?.username ?? 'User'} Profile`,
    description: `Portfolio page for ${userProfile[0]?.username ?? 'User'}`,
    keywords: ["profile", userProfile[0]?.username],
  }
}

// Main page component
export default async function UserProfilePage({ params }: Props) {
  const { user } = await params;
  if (!user) {
    return <div>No username or wallet address provided</div>
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <Suspense fallback={<UserProfileLoadingWithFeedback />}>
        <UserProfileContent user={user} />
      </Suspense>
    </ErrorBoundary>
  )
}

async function UserProfileContent({ user }: { user: string }) {
  try {
    const userProfile = await searchUsersServer(user);
    
    // Fetch tweets with error handling
    let userTweets = [];
    try {
      userTweets = await fetchUserTweets(userProfile[0]?.username);
    } catch (tweetError) {
      console.error('Error fetching tweets:', tweetError);
      // Continue with empty tweets array if there's an error
    }

    // Fetch holdings data
    const holdingsResponse = await fetch(`${BASE_URL}/api/users/holdings?address=${user}`);
    const holdingsData: HoldingsResponse = await holdingsResponse.json();

    // Extract native SOL balance and price info
    const nativeBalance = holdingsData.result.nativeBalance;
    const solBalance = {
      solBalance: (nativeBalance.lamports / 1e9).toString(),
      solUsdValue: nativeBalance.total_price.toString()
    };

    // Process token items with enhanced information
    const tokens = holdingsData.result.items.map((item: TokenItem) => {
      // Add null checks for tokenInfo and content
      const tokenInfo = item.token_info || {};
      const content = item.content || { metadata: {}, links: {} };
      const metadata = content.metadata || {};
      const links = content.links || {};

      return {
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || 'UNKNOWN',
        amount: tokenInfo.balance ? tokenInfo.balance / Math.pow(10, tokenInfo.decimals || 0) : 0,
        usdValue: tokenInfo.price_info?.total_price || 0,
        decimals: tokenInfo.decimals || 0,
        logo: links.image || '',
        isNft: item.interface === 'NFT',
        description: metadata.description || '',
        tokenAddress: item.id || '',
        mintAddress: item.id || '',
        cid: null,
        tokenProgram: tokenInfo.token_program || '',
        associatedTokenAddress: tokenInfo.associated_token_address || '',
        pricePerToken: tokenInfo.price_info?.price_per_token || 0,
        priceCurrency: tokenInfo.price_info?.currency || 'USDC',
        supply: tokenInfo.supply || 0,
        isFrozen: item.ownership?.frozen || false,
        isDelegated: item.ownership?.delegated || false,
        authorities: (item.authorities || []).map(auth => ({
          address: auth.address || '',
          scopes: auth.scopes || []
        })),
        royalty: item.royalty || {},
        creators: item.creators || []
      };
    });

    // Sort tokens by USD value
    const sortedTokens = tokens.sort((a: TokenData, b: TokenData) => b.usdValue - a.usdValue);

    // Calculate total value including SOL
    const totalValue = sortedTokens.reduce((sum: number, token: TokenData) => sum + token.usdValue, 0);
    const updatedTotalValue = totalValue + nativeBalance.total_price;

    // Create a basic profile object
    const profile: Profile = {
      username: userProfile[0]?.username || 'User',
      walletAddress: user,
      holdings: [
        {
          name: 'Solana',
          symbol: 'SOL',
          amount: parseFloat(solBalance.solBalance),
          usdValue: parseFloat(solBalance.solUsdValue),
          decimals: 9,
          logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          isNft: false,
          description: 'Solana Native Token',
          tokenAddress: 'So11111111111111111111111111111111111111112',
          mintAddress: 'So11111111111111111111111111111111111111112',
          cid: null,
          pricePerToken: nativeBalance.price_per_sol
        },
        ...sortedTokens
      ],
      totalValue: updatedTotalValue
    };

    // Fetch market data for investment plan generation
    let investmentPlan = null;
    try {
      // Fetch market data, fear/greed index, and sector performance
      const [marketData, fearGreedValue, sectorPerformance] = await Promise.all([
        fetchCryptoTrendsServer(),
        fetchFearGreedIndex(),
        fetchSectorPerformanceServer()
      ]);

      // Generate investment plan using the server-side API route
      const investmentPlanResponse = await fetch(`${BASE_URL}/api/generate-investment-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fearGreedValue,
          sectorPerformance,
          marketData,
          userPortfolio: profile,
          username: profile.username
        }),
      });

      if (!investmentPlanResponse.ok) {
        throw new Error(`HTTP error! Status: ${investmentPlanResponse.status}`);
      }

      investmentPlan = await investmentPlanResponse.json();

      // Update profile with the generated investment plan
      profile.investmentPlan = investmentPlan;
    } catch (error) {
      console.error('Error generating investment plan:', error);
      // Continue without investment plan if there's an error
    }

    return <UserProfileContainer profile={profile} tweets={userTweets} />;
  } catch (error) {
    console.error('Error loading profile:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We encountered an error while loading the profile data. This could be due to:
          </p>
          <ul className="text-left text-gray-600 dark:text-gray-300 mb-6 list-disc pl-5">
            <li>Invalid wallet address</li>
            <li>Network connectivity issues</li>
            <li>Temporary service disruption</li>
          </ul>
          <p>{JSON.stringify(error)}</p>
          <p className="text-gray-600 dark:text-gray-300">
            Please try again later or @invest_assist on twitter if the issue persists.
          </p>
        </div>
      </div>
    );
  }
}
