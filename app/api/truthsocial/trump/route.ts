import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `https://truthsocial.com/api/v1/accounts/107780257626128497/statuses?exclude_replies=true&only_replies=false&with_muted=true`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://truthsocial.com/',
        'Origin': 'https://truthsocial.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.log(response);
      throw new Error(`HTTP error! response: ${JSON.stringify(response)} status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trump social posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trump social posts' },
      { status: 500 }
    );
  }
}