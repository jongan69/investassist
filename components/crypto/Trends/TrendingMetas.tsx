'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { fetchTrendingMetas } from '@/lib/solana/fetchTrendingMetas';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

interface TrendingMeta {
  word: string;
  word_with_strength: string;
  score: number;
  total_txns: number;
  total_vol: number;
  isTrendingTwitterTopic: boolean;
  url: string;
}

export const TrendingMetas: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [trendingMetas, setTrendingMetas] = useState<TrendingMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingMetas(setTrendingMetas, setIsLoading, setError);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl",
        `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
        "shadow-lg transition-all duration-300 hover:shadow-2xl p-6 max-w-full mx-auto"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4 p-4">
        <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors`}>
          Trending Pumpfun Metas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {trendingMetas.map((meta, index) => (
          <a
            key={index}
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              meta.isTrendingTwitterTopic 
                ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 hover:bg-blue-100/90 dark:hover:bg-blue-900/50' 
                : 'border-black/20 dark:border-white/20 bg-white/80 dark:bg-black/80 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            onClick={(e) => {
              e.preventDefault();
              window.open(meta.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-black dark:text-white">{meta.word_with_strength}</h3>
              {meta.isTrendingTwitterTopic && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/50 rounded-full">
                  Trending on Twitter
                </span>
              )}
            </div>
            <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
              <p>Score: {meta.score.toFixed(4)}</p>
              <p>Transactions: {meta.total_txns.toLocaleString()}</p>
              <p>Volume: {meta.total_vol.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </a>
        ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 py-6 z-0" />
    </motion.div>
  );
}; 