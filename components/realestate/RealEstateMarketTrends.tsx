'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RateSample {
  apr: number;
  rate: number;
  time: string;
  volume: number;
}

interface MarketTrendsData {
  currentRates: {
    thirtyYear: {
      rate: number;
      apr: number;
      timestamp: string;
    };
    fifteenYear: {
      rate: number;
      apr: number;
      timestamp: string;
    };
  };
  historicalData: {
    thirtyYear: RateSample[];
    fifteenYear: RateSample[];
  };
  query: {
    creditScoreBucket: string;
    loanAmountBucket: string;
    loanToValueBucket: string;
    loanType: string;
    stateAbbreviation: string;
  };
}

export default function RealEstateMarketTrends() {
  const [data, setData] = useState<MarketTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/realestate/market-trends');
        if (!response.ok) throw new Error('Failed to fetch mortgage rate data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isDark = resolvedTheme === 'dark';
  
  // Dynamic colors based on theme for FRED charts
  const bgColor = '%23000000'; // Always black background
  const fgColor = isDark ? '%23e5e7eb' : '%23333333';
  const lineColor = isDark ? '%233b82f6' : '%23333333';
  const linkColor = isDark ? '%233b82f6' : '%23333333';
  const graphBgColor = '%23000000'; // Always black graph background
  
  // Dynamic dimensions based on screen size
  const chartWidth = isMobile ? 350 : 670;
  const chartHeight = isMobile ? 250 : 475;
  
  const colorParams = `bgcolor=${bgColor}&fgcolor=${fgColor}&linecolor=${lineColor}&linkcolor=${linkColor}&graphbgcolor=${graphBgColor}`;
  const dimensionParams = `width=${chartWidth}&height=${chartHeight}`;

  // FRED Chart Component
  const FredChart = () => (
    <div className="flex justify-center items-center w-full">
      <Card className="overflow-hidden border-0 shadow-lg bg-black backdrop-blur-sm" style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }}>
        <CardHeader className="border-b border-gray-700/50 p-2 sm:p-6">
          <CardTitle className="text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Mortgage Rate Trends (FRED Data)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1 sm:p-6">
          <div className="relative w-full h-[300px] sm:h-[525px] overflow-hidden rounded-md bg-black">
            <iframe 
              src={`https://fred.stlouisfed.org/graph/graph-landing.php?g=1I69W&${dimensionParams}&${colorParams}`}
              style={{ 
                overflow: 'hidden', 
                width: '100%', 
                height: '100%',
                borderRadius: '0.375rem',
                backgroundColor: 'black',
                border: 'none',
              }} 
              allowTransparency={true} 
              loading="lazy"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) return <FredChart />;
  if (error) return <FredChart />;
  if (!data) return <FredChart />;

  return (
    <div className="w-full max-w-full mx-auto p-1 sm:p-4 space-y-2 sm:space-y-6 px-2 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
        {/* Current Rates Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Current 30-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Rate:</span>
                <span className="text-lg sm:text-2xl font-bold text-blue-500">{data.currentRates.thirtyYear.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">APR:</span>
                <span className="text-base sm:text-xl font-semibold text-blue-500">{data.currentRates.thirtyYear.apr}%</span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                Updated: {new Date(data.currentRates.thirtyYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700/50 p-2 sm:p-6">
            <CardTitle className="text-sm sm:text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              Current 15-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="space-y-1 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Rate:</span>
                <span className="text-lg sm:text-2xl font-bold text-green-500">{data.currentRates.fifteenYear.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">APR:</span>
                <span className="text-base sm:text-xl font-semibold text-green-500">{data.currentRates.fifteenYear.apr}%</span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                Updated: {new Date(data.currentRates.fifteenYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FRED Chart */}
      <FredChart />

      {/* Loan Details */}
      <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b dark:border-gray-700/50 p-2 sm:p-6">
          <CardTitle className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Credit Score:</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">{data.query.creditScoreBucket}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Loan Amount:</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">{data.query.loanAmountBucket}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Loan Type:</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">{data.query.loanType}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">State:</span>
              <p className="text-xs sm:text-sm font-medium text-foreground">{data.query.stateAbbreviation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
