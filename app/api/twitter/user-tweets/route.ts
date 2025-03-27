import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    console.log(username);
    const BASE_URL = process.env.TWITTER_API_ENDPOINT;
    const url = `${BASE_URL}/userTweets/${username}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    // console.log(data);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error retrieving Twitter user tweets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Twitter user tweets' },
      { status: 500 }
    );
  }
} 