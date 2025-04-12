"use client"

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

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
  sentimentColor: string;
}

export default function MarketSummary({ 
  fearGreedValue, 
  sectorPerformance,
  className,
  sentimentColor
}: MarketSummaryProps) {
  const { resolvedTheme } = useTheme();
  const [summary, setSummary] = useState<string>('Loading market analysis...');
  const [model, setModel] = useState<string>('AI');
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Ensure the component is mounted before fetching data

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
        setModel(data.model.charAt(0).toUpperCase() + data.model.slice(1));
      } catch (error) {
        console.error('Error generating market summary:', error);
        setSummary('Unable to generate market summary at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    generateMarketSummary();
  }, [fearGreedValue, sectorPerformance, isMounted]);

  if (!resolvedTheme || !isMounted) {
    return null; // Ensure the theme is resolved and component is mounted
  }

  const isDark = resolvedTheme === 'dark';
  
  return (
    <motion.div 
      className={cn(
        "group relative overflow-hidden rounded-xl",
        isDark ? "bg-gradient-to-r from-white/10 to-white/5" : "bg-gradient-to-r from-black/10 to-black/5",
        "shadow-lg transition-all duration-300 hover:shadow-2xl p-6",
        "max-w-full mx-auto",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderLeft: `4px solid ${sentimentColor}`
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className={cn(
            "text-xl font-bold transition-colors",
            isDark ? "text-white group-hover:text-gray-300" : "text-black group-hover:text-gray-700"
          )}>
            {isLoading ? "AI Market Analysis" : `${model} Market Analysis`}
          </h2>
          {isLoading && (
            <div className="flex gap-1 px-1">
              <motion.span 
                className={cn(
                  "h-2 w-2 rounded-full",
                  isDark ? "bg-white" : "bg-black"
                )}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <motion.span 
                className={cn(
                  "h-2 w-2 rounded-full",
                  isDark ? "bg-white" : "bg-black"
                )}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
              />
              <motion.span 
                className={cn(
                  "h-2 w-2 rounded-full",
                  isDark ? "bg-white" : "bg-black"
                )}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-full">
          <p className={cn(
            "leading-relaxed text-sm tracking-wide",
            isDark ? "text-white/90" : "text-black/90"
          )}>
            {summary}
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current/5" />
    </motion.div>
  );
} 