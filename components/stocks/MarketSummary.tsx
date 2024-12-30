"use client"

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface MarketSummaryProps {
  fearGreedValue: {
    fgi: {
      now: {
        value: number;
        valueText: string;
      };
    };
  };
  sectorPerformance: {
    sector: string;
    changesPercentage: string;
  }[];
  className?: string;
}

export default function MarketSummary({ 
  fearGreedValue, 
  sectorPerformance,
  className 
}: MarketSummaryProps) {
  const [summary, setSummary] = useState<string>('Loading market analysis...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateMarketSummary = async () => {
      try {
        setIsLoading(true);
        const formattedSectorPerformance = sectorPerformance.map(sector => ({
          sector: sector.sector,
          performance: parseFloat(sector.changesPercentage.replace('%', ''))
        }));

        const response = await fetch('/api/market-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fearGreedValue: fearGreedValue.fgi.now.value,
            sectorPerformance: formattedSectorPerformance,
          }),
        });

        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        console.error('Error generating market summary:', error);
        setSummary('Unable to generate market summary at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    generateMarketSummary();
  }, [fearGreedValue, sectorPerformance]);

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl",
      "bg-black/40 backdrop-blur-sm",
      "shadow-lg transition-all duration-200 hover:shadow-xl",
      className
    )}>
      <div className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors">
            AI Market Analysis
          </h2>
          {isLoading && (
            <div className="flex gap-2">
              <span className="animate-pulse h-2 w-2 rounded-full bg-blue-500/80" />
              <span className="animate-pulse h-2 w-2 rounded-full bg-blue-500/80 delay-75" />
              <span className="animate-pulse h-2 w-2 rounded-full bg-blue-500/80 delay-150" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed text-sm tracking-wide">
            {summary}
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
    </div>
  );
} 