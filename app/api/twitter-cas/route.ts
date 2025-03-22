import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const BASE_URL = process.env.TWITTER_API_ENDPOINT;
    if (!BASE_URL) {
      console.error('TWITTER_API_ENDPOINT environment variable is not set');
      return NextResponse.json(
        { error: 'Twitter API endpoint configuration missing' },
        { status: 500 }
      );
    }

    const url = `${BASE_URL}/trendingCAs`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InvestAssist/1.0'
      }
    });

    if (!response.ok) {
      console.error('Twitter API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: `Twitter API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Twitter API response:', data);

    if (!data.success) {
      console.error('Twitter API returned unsuccessful response:', data);
      return NextResponse.json(
        { error: 'Twitter API returned unsuccessful response' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error retrieving Twitter trending cas:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Twitter trending cas' },
      { status: 500 }
    );
  }
} 