'use client'

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils/utils"

import { TokenData } from "@/lib/solana/fetchTokens"

interface TokenCardProps {
  token: TokenData
  rank: number
}

export function TokenCard({ token, rank }: TokenCardProps) {
  const priceChange = 0 // TODO: Add price change calculation
  const isPositive = priceChange >= 0
  const [imgSrc, setImgSrc] = useState(token.logo || '/placeholder-token.jpeg')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-sm font-medium">#{rank}</span>
          </div>

          {/* Token Icon */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={imgSrc}
              alt={token.name}
              fill
              className="rounded-full object-cover"
              onError={() => setImgSrc('/placeholder-token.jpeg')}
            />
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold truncate">{token.name}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{token.amount.toLocaleString()} tokens</span>
              <span>•</span>
              <span className={cn(
                "flex items-center gap-1",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(priceChange)}%
              </span>
            </div>
          </div>

          {/* Value */}
          <div className="text-right">
            <div className="text-lg font-semibold">
              ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ${token.pricePerToken?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
          </div>

          {/* External Link */}
          <Link
            href={`https://solscan.io/token/${token.tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </Card>
    </motion.div>
  )
} 