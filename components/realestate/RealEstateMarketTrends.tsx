'use client';

import { useEffect, useState } from 'react';
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
import { Skeleton } from "@/components/ui/skeleton";

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
  
  // Dynamic dimensions based on screen size - adjusted for better mobile fit
  const chartWidth = isMobile ? '100%' : '100%';
  const chartHeight = isMobile ? 350 : 550; // Reduced height for mobile to prevent cutoff
  
  const colorParams = `bgcolor=${bgColor}&fgcolor=${fgColor}&linecolor=${lineColor}&linkcolor=${linkColor}&graphbgcolor=${graphBgColor}`;
  const dimensionParams = `width=${chartWidth}&height=${chartHeight}`;

  // FRED Chart Component
  const FredChart = () => (
    <div className="w-full flex justify-center" suppressHydrationWarning>
      <div className={`overflow-hidden border-0 shadow-lg ${isDark ? 'bg-black' : 'bg-white'} backdrop-blur-sm rounded-lg w-full`}>
        <div className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} p-2 sm:p-4`}>
          <h3 className={`text-base sm:text-xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'} bg-clip-text text-black dark:text-white`}>
            Mortgage Rate Trends
          </h3>
        </div>
        <div className={isDark ? "bg-black" : "bg-white"} style={{ height: `${chartHeight}px`, paddingBottom: '20px' }}>
          {isDark ? (
            <iframe 
              src={`https://fred.stlouisfed.org/graph/graph-landing.php?g=1I69W&${dimensionParams}&${colorParams}`}
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                display: 'block',
                margin: 0,
                padding: 0,
                backgroundColor: 'black',
              }} 
              loading="lazy"
            ></iframe>
          ) : (
            <iframe 
              src={`https://fred.stlouisfed.org/graph/graph-landing.php?g=1I8L9&${dimensionParams}`}
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                display: 'block',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
              }} 
              loading="lazy"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-full mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
            <CardHeader className="p-3 sm:p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
            <CardHeader className="p-3 sm:p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <FredChart />
        <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardHeader className="p-3 sm:p-4">
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - just show the chart without error message
  if (error) {
    return (
      <div className="w-full max-w-full mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
        <FredChart />
      </div>
    );
  }

  // No data state - just show the chart without message
  if (!data) {
    return (
      <div className="w-full max-w-full mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
        <FredChart />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Current Rates Cards */}
        <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardHeader className={`border-b ${isDark ? 'dark:border-gray-700/50' : 'border-gray-200/50'} p-3 sm:p-4`}>
            <CardTitle className={`text-base sm:text-xl font-bold ${isDark ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'} bg-clip-text text-black dark:text-white`}>
              Current 30-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>Rate:</span>
                <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>{data.currentRates.thirtyYear.rate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>APR:</span>
                <span className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>{data.currentRates.thirtyYear.apr}%</span>
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>
                Updated: {new Date(data.currentRates.thirtyYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardHeader className={`border-b ${isDark ? 'dark:border-gray-700/50' : 'border-gray-200/50'} p-3 sm:p-4`}>
            <CardTitle className={`text-base sm:text-xl font-bold ${isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-green-600 to-green-700'} bg-clip-text text-black dark:text-white`}>
              Current 15-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>Rate:</span>
                <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-green-500' : 'text-green-600'}`}>{data.currentRates.fifteenYear.rate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${isDark ? 'text-muted-foreground' : 'text-gray-600'}`}>APR:</span>
                <span className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-green-500' : 'text-green-600'}`}>{data.currentRates.fifteenYear.apr}%</span>
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-500'}`}>
                Updated: {new Date(data.currentRates.fifteenYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FRED Chart */}
      <FredChart />

      {/* Loan Details */}
      <Card className={`overflow-hidden border-0 shadow-lg ${isDark ? 'dark:bg-black/80 bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardHeader className={`border-b ${isDark ? 'dark:border-gray-700/50' : 'border-gray-200/50'} p-3 sm:p-4`}>
          <CardTitle className={`text-base sm:text-xl font-bold ${isDark ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-orange-600 to-yellow-600'} bg-clip-text text-black dark:text-white`}>
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <span className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'} block mb-1`}>Credit Score:</span>
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-foreground' : 'text-gray-800'}`}>{data.query.creditScoreBucket}</p>
            </div>
            <div>
              <span className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'} block mb-1`}>Loan Amount:</span>
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-foreground' : 'text-gray-800'}`}>{data.query.loanAmountBucket}</p>
            </div>
            <div>
              <span className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'} block mb-1`}>Loan Type:</span>
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-foreground' : 'text-gray-800'}`}>{data.query.loanType}</p>
            </div>
            <div>
              <span className={`text-xs sm:text-sm ${isDark ? 'text-muted-foreground' : 'text-gray-600'} block mb-1`}>State:</span>
              <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-foreground' : 'text-gray-800'}`}>{data.query.stateAbbreviation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
