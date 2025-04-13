import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const BASE_URL = process.env.TWITTER_API_ENDPOINT;
    const URL = 'https://frontend-api-v3.pump.fun/metas/current'
    const DEX_SCREENER_URL = 'https://api.dexscreener.com/latest/dex/search?q=';
    
    if (!BASE_URL || !URL) {
      console.error('PUMP_FUN_API_ENDPOINT environment variable is not set');
      return NextResponse.json(
        { error: 'Pump Fun API endpoint configuration missing' },
        { status: 500 }
      );
    }
    const response = await fetch(`${BASE_URL}/trendingTopics`, { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'InvestAssist/1.0'
        }
      });

    if (!response.ok) {
      console.error('Twitter API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: `Twitter API error: ${response.status}` },
        { status: response.status }
      );
    }

    const trendingTopics = await response.json();
    
    // Ensure trendingTopics is an array
    if (!Array.isArray(trendingTopics)) {
      console.error('Twitter API returned invalid response format:', trendingTopics);
      return NextResponse.json(
        { error: 'Invalid response format from Twitter API' },
        { status: 500 }
      );
    }

    const response1 = await fetch(URL, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InvestAssist/1.0'
      }
    });

    if (!response1.ok) {
      console.error('Pump Fun API error:', {
        status: response1.status,
        statusText: response1.statusText
      });
      return NextResponse.json(
        { error: `Pump Fun API error: ${response1.status}` },
        { status: response1.status }
      );
    }

    const data1 = await response1.json();

    // Validate the response format
    if (!Array.isArray(data1)) {
      console.error('Pump Fun API returned invalid response format:', data1);
      return NextResponse.json(
        { error: 'Invalid response format from Pump Fun API' },
        { status: 500 }
      );
    }

    // Validate each item has required fields
    const isValidFormat = data1.every(item => 
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

    // Create a set of trending topics for case-insensitive comparison
    const trendingTopicsSet = new Set(trendingTopics?.map(topic => topic.toLowerCase()));

    // Function to fetch DexScreener data for a topic
    const fetchDexScreenerData = async (topic: string) => {
      try {
        const cleanedTopic = topic.replace(/,/g, '');
        const dexResponse = await fetch(`${DEX_SCREENER_URL}${encodeURIComponent(cleanedTopic)}`, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'InvestAssist/1.0'
          }
        });
        
        if (!dexResponse.ok) {
          console.error(`DexScreener API error for topic ${topic}:`, {
            status: dexResponse.status,
            statusText: dexResponse.statusText
          });
          return null;
        }
        
        const dexData = await dexResponse.json();
        return dexData;
      } catch (error) {
        console.error(`Error fetching DexScreener data for topic ${topic}:`, error);
        return null;
      }
    };

    // Enrich all items with isTrending field, URL, and DexScreener data
    const enrichedDataPromises = data1?.map(async (item) => {
      const dexScreenerData = await fetchDexScreenerData(item.word);
      
      return {
        ...item,
        isTrendingTwitterTopic: trendingTopicsSet.has(item.word.toLowerCase()),
        url: `https://pump.fun/board?include-nsfw=true&meta=${encodeURIComponent(item.word)}`,
        dexScreenerData: dexScreenerData
      };
    });

    // Wait for all DexScreener requests to complete
    const enrichedData = await Promise.all(enrichedDataPromises);

    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error retrieving combined trending data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve combined trending data' },
      { status: 500 }
    );
  }
} 