'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

interface QuoteData {
  symbol: string
  data: any
  timestamp: string
}

export default function StonksjsQuote() {
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuoteData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a symbol')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stonksjs/quote?symbol=${encodeURIComponent(symbol.trim())}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchQuoteData()
    }
  }

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    if (typeof value === 'string') {
      return value
    }
    return JSON.stringify(value)
  }

  const renderDataField = (key: string, value: any) => {
    if (value === null || value === undefined) return null
    
    return (
      <div key={key} className="flex justify-between items-center py-1">
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        <span className="text-sm font-mono">
          {formatValue(value)}
        </span>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          StonksJS Quote Data
        </CardTitle>
        <CardDescription>
          Detailed real-time stock quote data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={fetchQuoteData}
            disabled={loading || !symbol.trim()}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
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
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {data.symbol}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Quote Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {data.data && typeof data.data === 'object' ? (
                    Object.entries(data.data).map(([key, value]) => renderDataField(key, value))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {formatValue(data.data)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

