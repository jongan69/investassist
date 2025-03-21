import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const BASE_URL = process.env.TWITTER_API_ENDPOINT;
    const url = `${BASE_URL}/followers`;
    
    // Use screen_name instead of username for Twitter API compatibility
    const body = { username: username.trim() };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twitter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch Twitter data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error retrieving Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Twitter data' },
      { status: 500 }
    );
  }
} 