'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react"

import { Card } from "@/components/ui/card"

import { cn } from "@/lib/utils/utils"

import { TokenData } from "@/lib/solana/fetchTokens"
import { getDexScreenerData } from "@/lib/solana/fetchDexData"

interface TokenCardProps {
  token: TokenData
  rank: number
}

export function TokenCard({ token, rank }: TokenCardProps) {
  const tokenMint = token.mintAddress
  const [priceChange, setPriceChange] = useState(0)
  const isPositive = priceChange >= 0
  const [imgSrc, setImgSrc] = useState(token.logo || '/placeholder-token.jpeg')

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDexScreenerData(tokenMint)
      setPriceChange(data.pairs[0].priceChange.h24 ?? 0)
    }
    
    fetchData()
  }, [tokenMint])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Left section with rank and token info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-sm font-medium">#{rank}</span>
            </div>

            {/* Token Icon */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={imgSrc}
                alt={token.name}
                fill
                sizes="40px"
                className="rounded-full object-cover"
                onError={() => setImgSrc('/placeholder-token.jpeg')}
              />
            </div>

            {/* Token Info */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <h3 className="text-base font-semibold truncate">{token.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">({token.symbol})</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="truncate">{token.amount.toLocaleString()} tokens</span>
                <span>•</span>
                <span className={cn(
                  "flex items-center gap-1 whitespace-nowrap",
                  isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(priceChange)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right section with value and link */}
          <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 flex-shrink-0">
            {/* Value */}
            <div className="text-right">
              <div className="text-base font-semibold whitespace-nowrap">
                ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                ${token.pricePerToken?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
            </div>

            {/* External Link */}
            <Link
              href={`https://solscan.io/token/${token.tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 