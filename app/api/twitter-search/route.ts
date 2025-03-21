import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { searchQuery } = await req.json();
    console.log(searchQuery);
    const url = `https://twitterapi-2cw6.onrender.com/api/twitter/search?q=${searchQuery}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    // console.log(data);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error retrieving Twitter search:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Twitter search' },
      { status: 500 }
    );
  }
} 