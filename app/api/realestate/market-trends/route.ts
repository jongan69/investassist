import { NextResponse } from 'next/server';

interface RateSample {
  apr: number;
  rate: number;
  time: string;
  volume: number;
}

interface ProcessedData {
  currentRates: {
    thirtyYear: {
      rate: number;
      apr: number;
      timestamp: string;
    };
    fifteenYear: {
      rate: number;
      apr: number;
      timestamp: string;
    };
  };
  historicalData: {
    thirtyYear: RateSample[];
    fifteenYear: RateSample[];
  };
  query: {
    creditScoreBucket: string;
    loanAmountBucket: string;
    loanToValueBucket: string;
    loanType: string;
    stateAbbreviation: string;
  };
}

export async function GET() {
  try {
    const baseUrl = 'https://zillow-api-data.p.rapidapi.com/trend';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.ZILLOW_API_KEY,
        'x-rapidapi-host': 'zillow-api-data.p.rapidapi.com'
      }
    };

    // Fetch both 15-year and 30-year rates
    const [thirtyYearResponse, fifteenYearResponse] = await Promise.all([
      fetch(`${baseUrl}?durationDays=21&includeCurrentRate=true&limit=5&program=Fixed30Year`, options as RequestInit),
      fetch(`${baseUrl}?durationDays=21&includeCurrentRate=true&limit=5&program=Fixed15Year`, options as RequestInit)
    ]);

    const [thirtyYearData, fifteenYearData] = await Promise.all([
      thirtyYearResponse.json(),
      fifteenYearResponse.json()
    ]);

    // Process and format the data
    const processedData: ProcessedData = {
      currentRates: {
        thirtyYear: {
          rate: thirtyYearData.data.currentRate.rate,
          apr: thirtyYearData.data.currentRate.apr,
          timestamp: thirtyYearData.data.currentRate.time
        },
        fifteenYear: {
          rate: fifteenYearData.data.currentRate.rate,
          apr: fifteenYearData.data.currentRate.apr,
          timestamp: fifteenYearData.data.currentRate.time
        }
      },
      historicalData: {
        thirtyYear: thirtyYearData.data.samples,
        fifteenYear: fifteenYearData.data.samples
      },
      query: thirtyYearData.data.query // Both queries are the same except for program
    };

    return NextResponse.json(processedData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      },
    });

  } catch (error) {
    console.error('Error fetching Zillow market trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market trends' },
      { status: 500 }
    );
  }
} 