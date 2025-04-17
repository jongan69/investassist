export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  change7d: number;
  change30d: number;
}

export interface TokenHolding {
  token: TokenData;
  percentage: number;
} 