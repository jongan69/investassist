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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  // if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (error) return null;
  if (!data) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isDark = resolvedTheme === 'dark';
  const chartData = {
    labels: data.historicalData.thirtyYear.map(sample => formatDate(sample.time)),
    datasets: [
      {
        label: '30-Year Fixed',
        data: data.historicalData.thirtyYear.map(sample => sample.rate),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: '15-Year Fixed',
        data: data.historicalData.fifteenYear.map(sample => sample.rate),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          boxWidth: isMobile ? 8 : 12,
          padding: isMobile ? 4 : 8,
          font: {
            size: isMobile ? 10 : 12
          }
        },
      },
      title: {
        display: true,
        text: 'Mortgage Rate Trends',
        color: isDark ? '#e5e7eb' : '#374151',
        font: {
          size: isMobile ? 14 : 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Interest Rate (%)',
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 0 : 45,
          minRotation: isMobile ? 0 : 45,
        },
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 45,
          minRotation: isMobile ? 45 : 45,
        },
      },
    },
  };

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

      {/* Chart */}
      <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b dark:border-gray-700/50 p-2 sm:p-6">
          <CardTitle className="text-sm sm:text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Mortgage Rate Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1 sm:p-6">
          <div className="relative w-full h-[200px] sm:h-[400px] overflow-hidden">
            <Line options={chartOptions} data={chartData} />
          </div>
        </CardContent>
      </Card>

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
