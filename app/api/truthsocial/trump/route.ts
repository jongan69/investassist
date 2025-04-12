import { NextResponse } from 'next/server';
import { getEndpoint } from '@/lib/ngrok/getEndpoint';

export async function GET() {
  try {
    const url = `https://truthsocial.com/api/v1/accounts/107780257626128497/statuses?exclude_replies=true&only_replies=false&with_muted=true`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.43.3',
        'Host': 'truthsocial.com',
      }
    });
    
    if (!response.ok) {
      console.log('Primary API call failed, trying fallback endpoint');
      const endpoint = await getEndpoint();
      
      if (endpoint) {
        const fallbackUrl = `${endpoint}/api/truthsocial/trumpTruthSocial`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          return NextResponse.json(data);
        } else {
          throw new Error(`Fallback API also failed with status: ${fallbackResponse.status}`);
        }
      } else {
        throw new Error(`HTTP error! response: ${JSON.stringify(response)} status: ${response.status}`);
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trump social posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trump social posts: ' + error },
      { status: 500 }
    );
  }
}