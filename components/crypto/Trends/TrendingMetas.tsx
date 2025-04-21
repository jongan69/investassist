'use client'

import React, { useEffect, useState } from 'react';
import { fetchTrendingMetas } from '@/lib/solana/fetchTrendingMetas';
import { cn } from "@/lib/utils/utils";
import { TrendingUp, Twitter } from 'lucide-react';

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
  const [trendingMetas, setTrendingMetas] = useState<TrendingMeta[]>([]);

  useEffect(() => {
    const trendingMetas = async () => {
      const trendingMetasData = await fetchTrendingMetas();
      setTrendingMetas(trendingMetasData);
    }
    trendingMetas();
  }, []);

  return (
    <>
      {trendingMetas.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Trending Pumpfun Metas
              </h2>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <Twitter className="w-4 h-4 text-green-500" />
                <span>Twitter Trending</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingMetas.map((meta, index) => (
                <a
                  key={index}
                  href={meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group relative block p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                    meta.isTrendingTwitterTopic 
                      ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/30' 
                      : 'border-border bg-card hover:bg-accent/50'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(meta.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {meta.word_with_strength}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {meta.word}
                        </p>
                      </div>
                      {meta.isTrendingTwitterTopic && (
                        <span className="flex-shrink-0 ml-2 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100/80 dark:bg-green-900/50 rounded-full">
                          <Twitter className="w-3 h-3 inline-block mr-1" />
                          Twitter
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <div>
                            <span className="text-xs text-muted-foreground block">Score</span>
                            <span className="text-sm font-medium text-foreground">{meta.score}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          View details
                        </span>
                        <svg 
                          className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 