import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const URL = 'https://frontend-api-v3.pump.fun/metas/current'
    if (!URL) {
      console.error('PUMP_FUN_API_ENDPOINT environment variable is not set');
      return NextResponse.json(
        { error: 'Pump Fun API endpoint configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(URL, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InvestAssist/1.0'
      }
    });

    if (!response.ok) {
      console.error('Pump Fun API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: `Pump Fun API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate the response format
    if (!Array.isArray(data)) {
      console.error('Pump Fun API returned invalid response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from Pump Fun API' },
        { status: 500 }
      );
    }

    // Validate each item has required fields
    const isValidFormat = data.every(item => 
      typeof item.word === 'string' &&
      typeof item.word_with_strength === 'string' &&
      typeof item.score === 'number' &&
      typeof item.total_txns === 'number' &&
      typeof item.total_vol === 'number'
    );

    if (!isValidFormat) {
      console.error('Pump Fun API response items missing required fields');
      return NextResponse.json(
        { error: 'Invalid data format in Pump Fun API response' },
        { status: 500 }
      );
    }

    // Add URL to each item
    const enrichedData = data?.map(item => ({
      ...item,
      url: `https://pump.fun/board?include-nsfw=true&meta=${encodeURIComponent(item.word)}`
    }));

    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error retrieving Pump Fun metas data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Pump Fun metas data' },
      { status: 500 }
    );
  }
} 