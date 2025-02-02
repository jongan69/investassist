"use client"
import { isMarketOpen, tickersFutures, tickerAfterOpen } from '@/lib/utils';
import { useEffect, useState } from 'react'

export default function MarketData({ initialData }: { initialData: any }) {
  const [tickers, setTickers] = useState(initialData);

  useEffect(() => { 
    const checkMarketOpen = () => {
      const isOpen = isMarketOpen();
      setTickers(isOpen ? tickerAfterOpen : tickersFutures);
    };

    checkMarketOpen();
    const interval = setInterval(checkMarketOpen, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickers.map((ticker: any) => (
          <div 
          key={ticker.symbol}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{ticker.symbol}</h3>
            <span className={`font-bold ${
              ticker.change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {ticker.price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Change: {ticker.change.toFixed(2)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Volume: {ticker.volume.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 