'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, TrendingUp, TrendingDown, Activity, Volume2, AlertTriangle, DollarSign, ExternalLink } from 'lucide-react'

interface ScreenerResult {
  screenerType: string
  symbols: string[]
  count: number
  timestamp: string
}

const SCREENER_OPTIONS = [
  { value: 'topGainers', label: 'Top Gainers', icon: TrendingUp, color: 'text-green-500' },
  { value: 'topLosers', label: 'Top Losers', icon: TrendingDown, color: 'text-red-500' },
  { value: 'mostActive', label: 'Most Active', icon: Activity, color: 'text-blue-500' },
  { value: 'mostVolatile', label: 'Most Volatile', icon: AlertTriangle, color: 'text-orange-500' },
  { value: 'unusualVolume', label: 'Unusual Volume', icon: Volume2, color: 'text-purple-500' },
  { value: 'oversold', label: 'Oversold', icon: TrendingDown, color: 'text-red-400' },
  { value: 'overbought', label: 'Overbought', icon: TrendingUp, color: 'text-green-400' },
  { value: 'upgrades', label: 'Upgrades', icon: TrendingUp, color: 'text-green-600' },
  { value: 'downgrades', label: 'Downgrades', icon: TrendingDown, color: 'text-red-600' },
  { value: 'earningsBefore', label: 'Earnings Before', icon: DollarSign, color: 'text-yellow-500' },
  { value: 'earningsAfter', label: 'Earnings After', icon: DollarSign, color: 'text-yellow-600' },
  { value: 'recentInsiderBuying', label: 'Insider Buying', icon: TrendingUp, color: 'text-green-700' },
  { value: 'recentInsiderSelling', label: 'Insider Selling', icon: TrendingDown, color: 'text-red-700' }
]

export default function StonksjsScreenerWidget() {
  const [selectedScreener, setSelectedScreener] = useState('topGainers')
  const [data, setData] = useState<ScreenerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScreenerData = async (screenerType: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stonksjs/screeners?type=${screenerType}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch screener data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScreenerData(selectedScreener)
  }, [selectedScreener])

  const selectedOption = SCREENER_OPTIONS.find(opt => opt.value === selectedScreener)
  const IconComponent = selectedOption?.icon || TrendingUp

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${selectedOption?.color}`} />
            <CardTitle className="text-lg">StonksJS Screeners</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/stonksjs', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View All
          </Button>
        </div>
        <CardDescription>
          Industry-standard screeners powered by Finviz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={selectedScreener} onValueChange={setSelectedScreener}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select screener" />
            </SelectTrigger>
            <SelectContent>
              {SCREENER_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => fetchScreenerData(selectedScreener)}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Refresh
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {data.count} stocks
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
              {data.symbols.slice(0, 12).map((symbol) => (
                <Badge 
                  key={symbol} 
                  variant="outline" 
                  className="justify-center py-1 text-xs hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => window.open(`/stocks/${symbol}`, '_blank')}
                >
                  {symbol}
                </Badge>
              ))}
            </div>
            
            {data.symbols.length > 12 && (
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open('/stonksjs', '_blank')}
                  className="text-xs"
                >
                  View {data.symbols.length - 12} more...
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

