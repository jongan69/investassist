import { NextResponse } from 'next/server';

const TIKTOK_RAPID_API_KEY = process.env.TIKTOK_RAPID_API_KEY;
const RAPID_API_HOST = 'tiktok-api23.p.rapidapi.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count') || '30';

    const url = `https://tiktok-api23.p.rapidapi.com/api/post/trending?count=${count}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': TIKTOK_RAPID_API_KEY || '',
        'x-rapidapi-host': RAPID_API_HOST
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      console.error('HTTP error! status:', response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching TikTok trending posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TikTok trending posts' },
      { status: 500 }
    );
  }
}