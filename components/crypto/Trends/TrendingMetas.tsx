'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { fetchTrendingMetas } from '@/lib/solana/fetchTrendingMetas';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils/utils";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg py-4 my-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Trending Pumpfun Metas
      </h2>
      <div className="flex overflow-x-auto pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-x-visible">
        {trendingMetas.map((meta, index) => (
          <a
            key={index}
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-6 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0 w-[300px] mr-6 md:mr-0",
              meta.isTrendingTwitterTopic 
                ? 'border-green-500 bg-green-50/80 dark:bg-green-900/30 hover:bg-green-100/90 dark:hover:bg-green-900/50' 
                : 'border-border bg-card hover:bg-accent'
            )}
            onClick={(e) => {
              e.preventDefault();
              window.open(meta.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{meta.word_with_strength}</h3>
              {meta.isTrendingTwitterTopic && (
                <span className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100/80 dark:bg-green-900/50 rounded-full">
                  Trending on Twitter
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Score: {meta.score.toFixed(4)}</p>
              <p>Transactions: {meta.total_txns.toLocaleString()}</p>
              <p>Volume: {meta.total_vol.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}; 