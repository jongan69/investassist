import { TokenData, TokenHolding } from '@/types/token';
import { InvestmentPlan } from '@/types/investment-plan';

export interface UserProfile {
  username: string;
  address: string;
  holdings: TokenHolding[];
  investmentPlan: InvestmentPlan | null;
}

export interface Tweet {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
}

/**
 * Fetches a user profile by username
 * @param username The username to fetch the profile for
 * @returns The user profile
 */
export async function getProfileByUsername(username: string): Promise<UserProfile> {
  // Mock data for demonstration
  const mockTokens: TokenData[] = [
    {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: 10.5,
      price: 100,
      value: 1050,
      change24h: 5.2,
      change7d: 12.3,
      change30d: 25.6
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 1000,
      price: 1,
      value: 1000,
      change24h: 0,
      change7d: 0,
      change30d: 0
    }
  ];

  const mockHoldings: TokenHolding[] = mockTokens.map(token => ({
    token,
    percentage: (token.value / mockTokens.reduce((sum, t) => sum + t.value, 0)) * 100
  }));

  return {
    username,
    address: '8xydh5GfYPqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX',
    holdings: mockHoldings,
    investmentPlan: null
  };
}

/**
 * Fetches tweets for a user by username
 * @param username The username to fetch tweets for
 * @returns An array of tweets
 */
export async function getTweetsByUsername(username: string): Promise<Tweet[]> {
  // Mock data for demonstration
  return [
    {
      id: '1',
      content: 'Just invested in $SOL! The future of web3 is bright! 🌟',
      timestamp: new Date().toISOString(),
      likes: 42,
      retweets: 12
    },
    {
      id: '2',
      content: 'My investment strategy is paying off! Up 25% this month! 📈',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      likes: 38,
      retweets: 8
    }
  ];
} 