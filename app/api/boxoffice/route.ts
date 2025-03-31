import { NextResponse } from "next/server"

interface TokenMetadata {
  name: string;
  symbol: string;
  image?: string;
  extensions?: {
    website?: string;
    twitter?: string;
    boxoffice?: string;
  };
}

interface BoxOfficeToken {
  clerk: string;
  tokenMint: string;
  name: string;
  ticker: string;
  uri: string;
  ticketsSold: number;
  tokenSupply: string;
  maxTicketSupply: number;
  status: {
    closed?: {};
    initialized?: {};
  };
  metadata?: TokenMetadata;
}

export async function GET(request: Request) {
  try {
    // Fetch Box Office data
    const boxOfficeResponse = await fetch('https://boxm.me/get/data?sortOrder=creation_time&sortDirection=asc&page=1&entriesPerPage=100&searchTerm=');
    const boxOfficeData = await boxOfficeResponse.json();

    // Fetch metadata for each token
    const tokensWithMetadata = await Promise.all(
      boxOfficeData.data.map(async (token: BoxOfficeToken) => {
        try {
          const metadataResponse = await fetch(token.uri);
          const metadata = await metadataResponse.json();
          return {
            ...token,
            metadata
          };
        } catch (error) {
          console.error(`Error fetching metadata for ${token.name}:`, error);
          return token;
        }
      })
    );

    return NextResponse.json({
      success: true,
      totalResults: tokensWithMetadata.length,
      data: tokensWithMetadata
    });
  } catch (error) {
    console.error('Error fetching Box Office data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Box Office data'
      },
      { status: 500 }
    );
  }
}