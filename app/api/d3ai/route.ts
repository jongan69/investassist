import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiUrl = 'https://api.dex3.ai/deep-signals';
  const body = {
    type: 'whale',
    limit: 100,
    lastTimestamp: null,
    buysOnly: false,
    sellsOnly: false,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from dex3.ai' }, { status: response.status });
    }

    const responseData = await response.json();
    const result = responseData.data.data;
    const filteredResult = result.filter(
      (item: any) => item.symbol && item.symbol.trim() !== ''
    );

    // Helper to aggregate signals by symbol
    function aggregateBySymbol(signals: any[]) {
      const map = new Map();
      for (const s of signals) {
        if (!map.has(s.symbol)) {
          map.set(s.symbol, { ...s });
        } else {
          const agg = map.get(s.symbol);
          agg.volume += s.volume;
          agg.marketCap += s.marketCap;
          // Use the latest timestamp and txHash
          if (s.timestamp > agg.timestamp) {
            agg.timestamp = s.timestamp;
            agg.txHash = s.txHash;
          }
        }
      }
      // Sort by volume descending
      return Array.from(map.values()).sort((a, b) => b.volume - a.volume);
    }

    const buys = aggregateBySymbol(filteredResult.filter((signal: any) => signal.side === 'bought'));
    const sells = aggregateBySymbol(filteredResult.filter((signal: any) => signal.side === 'sold'));

    return NextResponse.json({ buys, sells });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
