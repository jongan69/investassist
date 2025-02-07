import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Using the verified tokens endpoint instead of all tokens
        // This will give us a smaller, more focused dataset of verified tokens
        const response = await fetch('https://api.jup.ag/tokens/v1/tagged/verified', {
            headers: {
                'Accept': 'application/json',
            },
            next: { 
                revalidate: 3600, // Cache for 1 hour
            },
        });

        if (!response.ok) {
            throw new Error(`Jupiter API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        });
    } catch (error) {
        console.error('Error fetching Jupiter tokens:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tokens' }, 
            { status: 500 }
        );
    }
} 