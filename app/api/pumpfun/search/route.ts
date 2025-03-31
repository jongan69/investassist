import { NextResponse } from 'next/server';

// Define interfaces for better type safety
interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description: string | null;
  image_uri: string;
  metadata_uri: string;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  market_cap: number;
  usd_market_cap: number;
  total_supply: number;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  last_trade_timestamp: number | null;
  reply_count: number;
  nsfw: boolean;
}

interface TransformedToken {
  mint: string;
  name: string;
  symbol: string;
  description: string | null;
  imageUrl: string;
  metadataUrl: string;
  socialLinks: {
    twitter: string | null;
    telegram: string | null;
    website: string | null;
  };
  metrics: {
    marketCap: number;
    usdMarketCap: number;
    totalSupply: number;
    virtualSolReserves: number;
    virtualTokenReserves: number;
    lastTradeTimestamp: number | null;
    replyCount: number;
  };
  nsfw: boolean;
  pumpFunUrl: string;
}

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { error: 'Search term is required and must be a string' },
        { status: 400 }
      );
    }

    const URL = `https://frontend-api-v3.pump.fun/coins/search_ranked?offset=0&limit=48&sort=market_cap&includeNsfw=true&order=DESC&searchTerm=${encodeURIComponent(searchTerm)}&type=hybrid`;

    const response = await fetch(URL, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InvestAssist/1.0'
      }
    });

    if (!response.ok) {
      console.error('Pump Fun API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: `Pump Fun API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: PumpFunToken[] = await response.json();

    // Validate the response format
    if (!Array.isArray(data)) {
      console.error('Pump Fun API returned invalid response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from Pump Fun API' },
        { status: 500 }
      );
    }

    // Transform the data into a cleaner format
    const transformedData: TransformedToken[] = data.map(token => ({
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      imageUrl: token.image_uri,
      metadataUrl: token.metadata_uri,
      socialLinks: {
        twitter: token.twitter,
        telegram: token.telegram,
        website: token.website
      },
      metrics: {
        marketCap: token.market_cap,
        usdMarketCap: token.usd_market_cap,
        totalSupply: token.total_supply,
        virtualSolReserves: token.virtual_sol_reserves,
        virtualTokenReserves: token.virtual_token_reserves,
        lastTradeTimestamp: token.last_trade_timestamp,
        replyCount: token.reply_count
      },
      nsfw: token.nsfw,
      pumpFunUrl: `https://pump.fun/coin/${token.mint}`
    }));

    // Sort the data by market cap in descending order  
    const sortedData = transformedData.sort((a, b) => b.metrics.marketCap - a.metrics.marketCap);

    // Add the number of results to the response
    const responseData = {
      totalResults: sortedData.length,
      results: sortedData
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error retrieving Pump Fun trending data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Pump Fun trending data' },
      { status: 500 }
    );
  }
} 