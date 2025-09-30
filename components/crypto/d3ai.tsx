'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Signal = {
  symbol: string;
  token: string;
  signer: string;
  txHash: string;
  poolId: string;
  poolCreatedAt: number | null;
  side: string;
  volume: number;
  type: string;
  marketCap: number;
  createdAt: number;
  timestamp: number;
  metadata: any;
};

type ApiResponse = {
  buys: Signal[];
  sells: Signal[];
};

export default function D3aiSignals() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/d3ai')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const coinLink = (symbol: string, contract: string) => {
    router.push(`/coins/${symbol}?ca=${contract}`);
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-lg font-semibold animate-pulse">Loading signals...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-500 font-semibold">Error: {error}</div>;
  if (!data) return <div className="flex justify-center items-center h-64 text-muted-foreground">No data found.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Most Bought */}
      <div className="bg-card rounded-lg shadow-lg p-4 flex flex-col h-[60vh]">
        <h2 className="text-xl font-bold mb-4 text-primary">Most Bought</h2>
        <div className="overflow-y-auto flex-1">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-background z-10">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Symbol</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Volume</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Market Cap</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.buys?.map((signal, idx) => (
                <tr key={signal.txHash + idx} className="even:bg-muted/40 hover:bg-accent/40 transition-colors">
                  <td className="px-3 py-2 font-mono font-medium">
                    <button
                      className="text-blue-600 hover:underline focus:outline-none"
                      onClick={() => coinLink(signal.symbol, signal.token)}
                      type="button"
                    >
                      {signal.symbol}
                    </button>
                  </td>
                  <td className="px-3 py-2">{signal.volume.toLocaleString()}</td>
                  <td className="px-3 py-2">{signal.marketCap.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(signal.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Most Sold */}
      <div className="bg-card rounded-lg shadow-lg p-4 flex flex-col h-[60vh]">
        <h2 className="text-xl font-bold mb-4 text-primary">Most Sold</h2>
        <div className="overflow-y-auto flex-1">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-background z-10">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Symbol</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Volume</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Market Cap</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.sells?.map((signal, idx) => (
                <tr key={signal.txHash + idx} className="even:bg-muted/40 hover:bg-accent/40 transition-colors">
                  <td className="px-3 py-2 font-mono font-medium">
                    <button
                      className="text-blue-600 hover:underline focus:outline-none"
                      onClick={() => coinLink(signal.symbol, signal.token)}
                      type="button"
                    >
                      {signal.symbol}
                    </button>
                  </td>
                  <td className="px-3 py-2">{signal.volume.toLocaleString()}</td>
                  <td className="px-3 py-2">{signal.marketCap.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(signal.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}