'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trade } from '@/types/trades'

interface TradeCardProps {
  trade: Trade
}

export function TradeCard({ trade }: TradeCardProps) {
  const getTradeOpacity = (timestamp?: number) => {
    if (!timestamp) return 1
    const ageInMs = Date.now() - timestamp
    const fiveMinutesInMs = 5 * 60 * 1000
    return Math.max(0.3, 1 - (ageInMs / fiveMinutesInMs) * 0.7)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: getTradeOpacity(trade.timestamp), 
        y: 0 
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
      className="flex justify-between items-center p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors overflow-hidden"
    >
      <Link href={`https://solscan.io/tx/${trade.signature}`} target="_blank" className="w-full">
        <div className="flex justify-between w-full gap-4">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-sm truncate max-w-full">{trade.label}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {trade.wallet?.slice(0, 6)}...{trade.wallet?.slice(-4)}
            </span>
            {trade.action ? (
              <span className="font-mono text-xs text-muted-foreground truncate">
                {trade.fromAmount} {trade.fromTokenSymbol} → {trade.toAmount} {trade.toTokenSymbol}
              </span>
            ) : (
              <span className="font-mono text-xs text-muted-foreground truncate">
                {trade.description}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="font-medium text-sm whitespace-nowrap">
              {trade.toAmount} {trade.toTokenSymbol}
            </span>
            {trade.toTokenData && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ${Number(trade.toTokenData.priceUsd).toFixed(4)}
              </span>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(trade.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
} 