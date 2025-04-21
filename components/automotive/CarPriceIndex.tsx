"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, DollarSign, Gauge } from "lucide-react"

interface PriceIndex {
  totalListings: number;
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  averageMileage: number;
  priceByYear: Record<number, {
    count: number;
    averagePrice: number;
    averageMileage: number;
  }>;
  priceByMake: Record<string, {
    count: number;
    averagePrice: number;
    averageMileage: number;
  }>;
}

export function CarPriceIndex() {
  const [data, setData] = useState<PriceIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/automotive');
        if (!response.ok) {
          throw new Error('Failed to fetch car price data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="w-full p-6">
          <CardHeader className="px-0">
            <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Used Car Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="w-full p-6">
          <CardHeader className="px-0">
            <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Used Car Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  // Sort years for display
  const sortedYears = Object.keys(data.priceByYear)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate price trend
  const priceTrend = sortedYears.length >= 2 
    ? ((data.priceByYear[sortedYears[sortedYears.length - 1]].averagePrice - data.priceByYear[sortedYears[0]].averagePrice) / data.priceByYear[sortedYears[0]].averagePrice) * 100
    : 0;

  return (
    <div className="p-4">
      <Card className="w-full p-6">
        <CardHeader className="px-0 pb-6">
          <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">
            Used Car Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-10">
            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Price Trend</h3>
                </div>
                <p className={`text-2xl font-bold ${priceTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {priceTrend >= 0 ? '+' : ''}{priceTrend.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">vs. oldest data</p>
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Average Price</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.averagePrice)}</p>
                <p className="text-xs text-muted-foreground mt-1">Current market</p>
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Mileage</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">{data.averageMileage.toLocaleString()} mi</p>
                <p className="text-xs text-muted-foreground mt-1">Current market</p>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative pt-8">
              <h3 className="text-sm font-medium text-foreground pb-10">Price Range</h3>
              <div className="relative h-2 bg-muted/80 dark:bg-muted/50 rounded-full">
                <div 
                  className="absolute h-full bg-black dark:bg-white rounded-full"
                  style={{
                    left: `${((data.priceRange.min - data.priceRange.min) / (data.priceRange.max - data.priceRange.min)) * 100}%`,
                    width: `${((data.priceRange.max - data.priceRange.min) / (data.priceRange.max - data.priceRange.min)) * 100}%`
                  }}
                />
                <div 
                  className="absolute h-4 w-4 rounded-full bg-green-500 dark:bg-green-400 border-2 border-background -top-1"
                  style={{
                    left: `${((data.averagePrice - data.priceRange.min) / (data.priceRange.max - data.priceRange.min)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
                <div className="absolute -top-8 left-0 text-xs text-muted-foreground">
                  {formatCurrency(data.priceRange.min)}
                </div>
                <div className="absolute -top-8 right-0 text-xs text-muted-foreground">
                  {formatCurrency(data.priceRange.max)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 