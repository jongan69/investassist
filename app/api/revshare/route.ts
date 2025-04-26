import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://api.revshare.dev/index.php?action=get_trending_tokens');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return NextResponse.json({ error: 'Failed to fetch trending tokens' }, { status: 500 });
    }
}