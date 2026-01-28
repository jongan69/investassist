'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SwitchComponent from '@/components/ui/switch'
import { Loader2, TrendingUp, TrendingDown, Activity, Volume2, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react'

interface DetailedData {
  symbol: string
  quote?: any
  finviz?: any
  error?: string
}

interface CombinedResult {
  screenerType: string
  symbols: string[]
  count: number
  timestamp: string
  detailedData?: DetailedData[]
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

export default function StonksjsCombined() {
  const [selectedScreener, setSelectedScreener] = useState('topGainers')
  const [includeQuotes, setIncludeQuotes] = useState(false)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState<CombinedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCombinedData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        screener: selectedScreener,
        includeQuotes: includeQuotes.toString(),
        limit: limit.toString()
      })
      
      const response = await fetch(`/api/stonksjs/combined?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch combined data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [selectedScreener, includeQuotes, limit])

  useEffect(() => {
    fetchCombinedData()
  }, [selectedScreener, includeQuotes, limit, fetchCombinedData])

  const selectedOption = SCREENER_OPTIONS.find(opt => opt.value === selectedScreener)
  const IconComponent = selectedOption?.icon || TrendingUp

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    if (typeof value === 'string') {
      return value
    }
    return JSON.stringify(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${selectedOption?.color}`} />
          StonksJS Combined Data
        </CardTitle>
        <CardDescription>
          Screener results with optional detailed quote and Finviz data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedScreener} onValueChange={setSelectedScreener}>
            <SelectTrigger className="w-[200px]">
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

          <div className="flex items-center gap-2">
            <SwitchComponent
              checked={includeQuotes}
              onCheckedChange={setIncludeQuotes}
              label="Include detailed quotes"
            />
          </div>

          <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={fetchCombinedData}
            disabled={loading}
            size="sm"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {data.count} stocks found
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {!includeQuotes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {data.symbols.map((symbol) => (
                  <Badge 
                    key={symbol} 
                    variant="outline" 
                    className="justify-center py-2 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => window.open(`/stocks/${symbol}`, '_blank')}
                  >
                    {symbol}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.detailedData?.map((item) => (
                  <Card key={item.symbol} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {item.symbol}
                      </Badge>
                      {item.error && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                    </div>
                    
                    {item.error ? (
                      <div className="text-red-500 text-sm">
                        {item.error}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.quote && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Quote Data
                            </h4>
                            <div className="space-y-1 text-xs">
                              {typeof item.quote === 'object' ? (
                                Object.entries(item.quote).slice(0, 5).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-mono">
                                      {formatValue(value)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div>{formatValue(item.quote)}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {item.finviz && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Finviz Data
                            </h4>
                            <div className="space-y-1 text-xs">
                              {typeof item.finviz === 'object' ? (
                                Object.entries(item.finviz).slice(0, 5).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-mono">
                                      {formatValue(value)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div>{formatValue(item.finviz)}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
