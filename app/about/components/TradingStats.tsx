'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
interface TokenInfo {
  name: string;
  symbol: string;
  description: string;
  image: string;
  socials: Array<{ type: string; url: string }>;
  profile: {
    header: boolean;
    website: boolean;
    twitter: boolean;
    discord: boolean;
    linkCount: number;
  };
}

interface TradingStatsProps {
  data: {
    pairs: Array<{
      dexId: string;
      priceUsd: string;
      volume: { h24: number; h6: number; h1: number; m5: number };
      txns: {
        h24: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        m5: { buys: number; sells: number };
      };
      priceChange: { h24: number; h6: number; h1: number; m5: number };
      liquidity: { usd: number; base: number; quote: number };
      marketCap: number;
      url: string;
      baseToken: {
        address: string;
        name: string;
        symbol: string;
      };
      quoteToken: {
        address: string;
        name: string;
        symbol: string;
      };
    }>;
    ti?: TokenInfo;
    holders?: {
      count: number;
      totalSupply: string;
      holders: Array<unknown>;
    };
    lpHolders?: {
      count: number;
      totalSupply: string;
      holders: Array<unknown>;
    };
  };
}

export default function TradingStats({ data }: TradingStatsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'m5' | 'h1' | 'h6' | 'h24'>('h24');
  const mainPair = data.pairs[0]; // Using Raydium as main pair
  const tokenInfo = data.ti;
  const contractAddress = mainPair?.baseToken?.address || '';
  const pumpSwapUrl = `https://swap.pump.fun/?input=So11111111111111111111111111111111111111112&output=${contractAddress}`;
  const timeframes = [
    { value: 'm5', label: '5M' },
    { value: 'h1', label: '1H' },
    { value: 'h6', label: '6H' },
    { value: 'h24', label: '24H' },
  ] as const;

  const formatSupply = (supply: string) => {
    const num = parseFloat(supply);
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        Market Statistics
      </h2>
      
      {/* Token Info Section */}
      {tokenInfo && (
        <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            {tokenInfo.image && (
              <Image 
                src={tokenInfo.image} 
                alt={tokenInfo.name} 
                className="w-16 h-16 rounded-full border-2 border-yellow-400 flex-shrink-0"
                width={64}
                height={64}
              />
            )}
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-yellow-400 truncate">{tokenInfo.symbol}</h2>
              <p className="text-base text-gray-300 truncate">{tokenInfo.name}</p>
            </div>
          </div>
          {tokenInfo.description && (
            <p className="text-base text-gray-300 mb-6 break-words">{tokenInfo.description}</p>
          )}
          <div className="flex flex-wrap gap-4">
            {tokenInfo.socials?.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300 whitespace-nowrap"
              >
                {social.type === 'twitter' ? '𝕏 Twitter' : social.type}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Trading Stats Section */}
      <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-2xl font-bold text-yellow-400">Market Performance</h3>
          <div className="flex flex-wrap gap-3">
            {timeframes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedTimeframe(value)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  selectedTimeframe === value
                    ? 'bg-yellow-500 text-black font-bold shadow-md'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 shadow-md">
            <h4 className="text-gray-300 mb-3 text-lg">Trading Volume</h4>
            <p className="text-3xl font-bold text-white break-words">
              {formatNumber(mainPair?.volume?.[selectedTimeframe] || 0)}
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 shadow-md">
            <h4 className="text-gray-300 mb-3 text-lg text-center">Market Activity</h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <p className="text-green-400 text-lg whitespace-nowrap">
                {mainPair?.txns?.[selectedTimeframe]?.buys || 0} Buys
              </p>
              <p className="text-red-400 text-lg whitespace-nowrap">
                {mainPair?.txns?.[selectedTimeframe]?.sells || 0} Sells
              </p>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 shadow-md">
            <h4 className="text-gray-300 mb-3 text-lg">Price Performance</h4>
            <p className={`text-3xl font-bold break-words ${
              (mainPair?.priceChange?.[selectedTimeframe] || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(mainPair?.priceChange?.[selectedTimeframe] || 0).toFixed(2)}%
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 shadow-md">
            <h4 className="text-gray-300 mb-3 text-lg">Market Cap</h4>
            <p className="text-3xl font-bold text-white break-words">
              {formatNumber(mainPair?.marketCap || 0)}
            </p>
          </div>
        </div>

        <div className="w-full py-6">
          <div className="bg-white/10 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="min-w-0">
                <h4 className="text-gray-300 text-lg">Market Liquidity</h4>
                <p className="text-2xl font-bold text-white break-words">{formatNumber(mainPair?.liquidity?.usd || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">Trading on</p>
                <a 
                  href={mainPair?.dexId === 'pumpswap' ? pumpSwapUrl : mainPair?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-lg font-bold text-blue-400 capitalize hover:text-blue-300 transition-colors duration-300 break-words"
                >
                  {mainPair?.dexId || 'Unknown'} 🔗
                </a>
              </div>
            </div>
          </div>

          {data.holders && (
            <div className="bg-white/10 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-300 text-lg mb-2">Token Holders</h4>
                  <p className="text-2xl font-bold text-white">{data.holders.count.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-gray-300 text-lg mb-2">Total Supply</h4>
                  <div className="max-w-full">
                    <p className="text-lg font-bold text-blue-400 truncate">
                      {formatSupply(data.holders.totalSupply)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 