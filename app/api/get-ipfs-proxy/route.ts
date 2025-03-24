import { DEFAULT_IMAGE_URL } from "@/lib/solana/constants";
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cid = url.searchParams.get('cid');
    
    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required' },
        { status: 400 }
      );
    }

    const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
    const response = await fetch(ipfsUrl, { 
      mode: 'no-cors',
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Error fetching IPFS data: ${response.status}`);
      return NextResponse.json(
        { imageUrl: DEFAULT_IMAGE_URL },
        { status: 200 } // Return default image instead of error
      );
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data || typeof data.image !== 'string') {
      return NextResponse.json(
        { imageUrl: DEFAULT_IMAGE_URL },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { imageUrl: data.image },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error(`Error in IPFS proxy: ${error}`);
    return NextResponse.json(
      { imageUrl: DEFAULT_IMAGE_URL },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }
}