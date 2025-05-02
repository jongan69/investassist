"use client";
import React, { useEffect, useState } from "react";
import { fetchVolume } from "@/lib/markets/fetchVolume";

interface HighVolumeStock {
  ticker: string;
  company: string;
  price: number;
  volume: number;
}

const HighVolume: React.FC = () => {
  const [highVolumeStocks, setHighVolumeStocks] = useState<HighVolumeStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchVolume();
        console.log(data?.high_volume_stocks?.stocks);
        setHighVolumeStocks(data?.high_volume_stocks?.stocks || []);
      } catch (error) {
        console.error("Error fetching high volume stocks:", error);
        setError("Failed to fetch high volume stocks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 flex-col gap-4">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">
          Loading high volume stocks...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!highVolumeStocks.length) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center text-gray-800 dark:text-gray-100">
        📈 High Volume Stocks
      </h2>
      <div className="rounded-2xl backdrop-blur-lg bg-white/30 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/20 shadow-lg max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="backdrop-blur-md bg-white/40 dark:bg-gray-800/40 border-b border-white/20 dark:border-gray-700/20">
              <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 w-1/4">Ticker</th>
              <th className="text-right px-4 py-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 w-1/4">Price</th>
              <th className="text-right px-4 py-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 w-1/2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {highVolumeStocks.map((stock) => (
              <tr
                key={stock.ticker}
                className="hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
              >
                <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base group relative">
                  <span className="cursor-help hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">{stock.ticker}</span>
                  <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-xl">
                    {stock.company}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                  ${stock.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                  {stock.volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HighVolume;
