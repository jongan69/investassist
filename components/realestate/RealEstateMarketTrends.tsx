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
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/realestate/market-trends');
        if (!response.ok) throw new Error('Failed to fetch data');
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
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
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
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: true,
        text: 'Mortgage Rate Trends',
        color: isDark ? '#e5e7eb' : '#374151',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Interest Rate (%)',
          color: isDark ? '#e5e7eb' : '#374151',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Rates Cards */}
        <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700/50">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Current 30-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="text-2xl font-bold text-blue-500">{data.currentRates.thirtyYear.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">APR:</span>
                <span className="text-xl font-semibold text-blue-500">{data.currentRates.thirtyYear.apr}%</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Updated: {new Date(data.currentRates.thirtyYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700/50">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              Current 15-Year Fixed Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="text-2xl font-bold text-green-500">{data.currentRates.fifteenYear.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">APR:</span>
                <span className="text-xl font-semibold text-green-500">{data.currentRates.fifteenYear.apr}%</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Updated: {new Date(data.currentRates.fifteenYear.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b dark:border-gray-700/50">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Mortgage Rate Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card className="overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b dark:border-gray-700/50">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-muted-foreground">Credit Score:</span>
              <p className="font-medium text-foreground">{data.query.creditScoreBucket}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Loan Amount:</span>
              <p className="font-medium text-foreground">{data.query.loanAmountBucket}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Loan Type:</span>
              <p className="font-medium text-foreground">{data.query.loanType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">State:</span>
              <p className="font-medium text-foreground">{data.query.stateAbbreviation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
