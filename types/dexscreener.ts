export interface Social {
    type: string;
    url: string;
  }
  
  export interface Pair {
    dexId: string;
    url: string;
    priceUsd: string;
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    priceChange: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    txns: {
      h24: { buys: number; sells: number };
      h6: { buys: number; sells: number };
      h1: { buys: number; sells: number };
      m5: { buys: number; sells: number };
    };
    marketCap: number;
    fdv: number;
    labels?: string[];
    baseToken: {
      name: string;
      symbol: string;
      address: string;
    };
    quoteToken: {
      name: string;
      symbol: string;
      address: string;
    };
    info: {
      socials: Social[];
    };
  }
  
  export interface TokenInfo {
    pairs: Pair[];
    pair: [{
      ti: {
        description: string;
        createdAt: string;
        image: string;
        headerImage: string;
      };
      baseToken: {
        address: string;
        name: string;
        symbol: string;
      };
      holders: {
        count: number;
        totalSupply: string;
        holders: Array<{
          id: string;
          balance: string;
          percentage: number;
        }>;
      };
      ll: {
        locks: Array<{
          tag: string;
          address: string;
          amount: string;
          percentage: number;
        }>;
        totalPercentage: number;
      };
    }];
  }