"use client"

import { CellContext, ColumnDef } from "@tanstack/react-table"

import type { ScreenerResult } from "@/node_modules/yahoo-finance2/dist/esm/src/modules/screener"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Extend the ScreenerResult type to include the missing properties
interface ExtendedScreenerResult extends ScreenerResult {
  regularMarketPrice?: number;
  epsTrailingTwelveMonths?: number;
  trailingAnnualDividendRate?: number;
}

export const columns: ColumnDef<ExtendedScreenerResult>[] = [
  {
    accessorKey: "symbol",
    meta: "Stock ticker symbol that uniquely identifies the company in the market",
    header: () => <div className="text-left">Symbol</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const symbol: string = row.getValue("symbol")
      return (
        <Link
          prefetch={false}
          href={`/stocks/${symbol}`}
          className="font-bold text-blue-500 hover:underline"
        >
          {symbol}
        </Link>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "shortName",
    meta: "Company's common name or trading name",
    header: () => <div className="text-left">Company</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      return <div className="text-left">{row.getValue("shortName")}</div>
    },
  },
  {
    accessorKey: "P/E",
    meta: "Price-to-Earnings ratio - A measure of the company's share price relative to its earnings per share. Lower P/E ratios may indicate undervaluation.",
    sortUndefined: -1,
    header: () => <div className="text-right w-full">P/E</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props

      const regularMarketPrice = row.original.regularMarketPrice
      const epsTrailingTwelveMonths = row.original.epsTrailingTwelveMonths || 0

      if (
        regularMarketPrice === undefined ||
        epsTrailingTwelveMonths === undefined ||
        regularMarketPrice === null ||
        epsTrailingTwelveMonths === null
      ) {
        return <div className="text-right w-full">N/A</div>
      }

      const pe = regularMarketPrice / epsTrailingTwelveMonths
      if (pe < 0) {
        return <div className="text-right w-full">N/A</div>
      }

      return <div className="text-right w-full">{pe.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "epsTrailingTwelveMonths",
    meta: "Earnings Per Share (TTM) - The company's total earnings over the past 12 months divided by the number of outstanding shares",
    header: () => <div className="text-right w-full">EPS</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const eps = row.original.epsTrailingTwelveMonths
      
      if (eps === undefined || eps === null) {
        return <div className="text-right w-full">N/A</div>
      }
      
      return <div className="text-right w-full">{eps.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "trailingAnnualDividendRate",
    meta: "Dividend Per Share (DPS) - The annual dividend payment per share of stock",
    header: () => <div className="text-right w-full">DPS</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const dps = row.original.trailingAnnualDividendRate
      
      if (dps === undefined || dps === null) {
        return <div className="text-right w-full">N/A</div>
      }
      
      return <div className="text-right w-full">{dps.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "regularMarketPrice",
    meta: "Current stock price in the regular market trading session",
    header: () => <div className="text-right w-full">Price</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const price = parseFloat(row.getValue("regularMarketPrice"))
      return <div className="text-right w-full">{price.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "regularMarketChange",
    meta: "Absolute price change from the previous day's closing price in dollars",
    header: () => <div className="text-right w-full">Change</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const marketChange = parseFloat(row.getValue("regularMarketChange"))
      return (
        <div className="text-right w-full">
          <div
            className={cn(
              marketChange > 0
                ? "text-green-800 dark:text-green-400"
                : "text-red-800 dark:text-red-500"
            )}
          >
            {marketChange > 0 ? "+" : ""}
            {marketChange.toFixed(2)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "regularMarketChangePercent",
    meta: "Percentage change from the previous day's closing price",
    header: () => <div className="text-right w-full">% Change</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const marketChangePercent = parseFloat(
        row.getValue("regularMarketChangePercent")
      )
      return (
        <div className="text-right w-full">
          <div
            className={cn(
              "w-[4rem] min-w-fit rounded-md px-2 py-0.5",
              marketChangePercent > 0
                ? "bg-green-300 text-green-800 dark:bg-green-950 dark:text-green-400"
                : "bg-red-300 text-red-800 dark:bg-red-950 dark:text-red-500"
            )}
          >
            {marketChangePercent > 0 ? "+" : ""}
            {marketChangePercent.toFixed(2)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "regularMarketVolume",
    meta: "Number of shares traded during the current trading day",
    header: () => <div className="text-right w-full">Volume</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const volume = parseFloat(row.getValue("regularMarketVolume"))
      const formatVolume = (volume: number): string => {
        if (volume >= 1000000) {
          return `${(volume / 1000000).toFixed(3)}M`
        } else {
          return volume.toString()
        }
      }

      return <div className="text-right w-full">{formatVolume(volume)}</div>
    },
  },
  {
    accessorKey: "averageDailyVolume3Month",
    meta: "Average number of shares traded per day over the last 3 months",
    header: () => <div className="text-right w-full">Avg Volume</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const volume = parseFloat(row.getValue("averageDailyVolume3Month"))
      const formatVolume = (volume: number): string => {
        if (volume >= 1000000) {
          return `${(volume / 1000000).toFixed(3)}M`
        } else {
          return volume.toString()
        }
      }

      return <div className="text-right w-full">{formatVolume(volume)}</div>
    },
  },
  {
    accessorKey: "marketCap",
    meta: "Market Capitalization - Total value of all outstanding shares (Price × Total Shares)",
    header: () => <div className="text-right w-full">Market Cap</div>,
    cell: (props: CellContext<ExtendedScreenerResult, unknown>) => {
      const { row } = props
      const marketCap = parseFloat(row.getValue("marketCap"))
      const formatMarketCap = (marketCap: number): string => {
        if (marketCap >= 1_000_000_000_000) {
          return `${(marketCap / 1_000_000_000_000).toFixed(3)}T`
        } else if (marketCap >= 1_000_000_000) {
          return `${(marketCap / 1_000_000_000).toFixed(3)}B`
        } else {
          return `${(marketCap / 1_000_000).toFixed(3)}M`
        }
      }

      return <div className="text-right w-full">{formatMarketCap(marketCap)}</div>
    },
  },
]
