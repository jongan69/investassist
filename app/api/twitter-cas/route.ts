import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://soltrendio.com/api/premium/twitter-trending-cas');
    const data = await response.json();
    console.log(data);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
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