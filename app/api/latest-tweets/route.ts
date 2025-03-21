import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // const url = 'https://soltrendio.com/api/premium/latest-tweets';
    const url = 'https://twitterapi-2cw6.onrender.com/api/twitter/latestTweets';
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error retrieving latest tweets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve latest tweets' },
      { status: 500 }
    );
  }
} 