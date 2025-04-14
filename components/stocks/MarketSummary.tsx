"use client"

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  calendar: any;
}

export default function MarketSummary({ 
  fearGreedValue, 
  sectorPerformance,
  calendar,
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
            economicEvents: calendar,
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
  }, [fearGreedValue, sectorPerformance, calendar, isMounted]);

  if (!resolvedTheme || !isMounted) {
    return null; // Ensure the theme is resolved and component is mounted
  }

  const isDark = resolvedTheme === 'dark';
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden",
        "w-[calc(100%+1rem)] -ml-2",
        className
      )}
      style={{
        borderLeft: `4px solid ${sentimentColor}`
      }}
      suppressHydrationWarning
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {isLoading ? "AI Market Analysis" : `${model} Market Analysis`}
          </CardTitle>
          {isLoading && (
            <div className="flex gap-1 px-1">
              {[0, 0.2, 0.4].map((delay) => (
                <motion.span
                  key={delay}
                  className="h-2 w-2 rounded-full bg-primary animate-pulse"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay }}
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-full dark:prose-invert">
          <p className="leading-relaxed text-sm tracking-wide">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 