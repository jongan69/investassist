"use client"

import { useEffect, useState } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./button"
import tickers from "@/data/tickers.json"
import { useRouter } from "next/navigation"
import { fetchCryptoTrends } from "@/lib/solana/fetchTrends"

const index = tickers.length

const SUGGESTIONS = [
  { id: index+1, ticker: "BTC-USD", title: "Bitcoin", assetType: "stocks" },
  { id: index+2, ticker: "ETH-USD", title: "Ethereum", assetType: "stocks" },
  { id: index+3, ticker: "SOL-USD", title: "Solana", assetType: "stocks" },
  { id: index+4, ticker: "TSLA", title: "Tesla Inc.", assetType: "stocks" },
  { id: index+5, ticker: "NVDA", title: "NVIDIA Corporation", assetType: "stocks" },
  { id: index+6, ticker: "AAPL", title: "Apple Inc.", assetType: "stocks" },
  { id: index+7, ticker: "MSFT", title: "Microsoft Corporation", assetType: "stocks" },
  { id: index+8, ticker: "GOOGL", title: "Alphabet Inc.", assetType: "stocks" },
  { id: index+9, ticker: "AMZN", title: "Amazon.com Inc.", assetType: "stocks" },
  { id: index+10, ticker: "DOGE-USD", title: "Dogecoin", assetType: "stocks" },
  { id: index+11, ticker: "SHIB-USD", title: "Shiba Inu", assetType: "stocks" },
  { id: index+12, ticker: "XRP-USD", title: "XRP", assetType: "stocks" },
  { id: index+13, ticker: "ADA-USD", title: "Cardano", assetType: "stocks" },
  { id: index+14, ticker: "DOT-USD", title: "Polkadot", assetType: "stocks" },
  { id: index+15, ticker: "LINK-USD", title: "Chainlink", assetType: "stocks" },
  { id: index+16, ticker: "UNI-USD", title: "Uniswap", assetType: "stocks" },
  { id: index+17, ticker: "LOCKIN", title: "Lockin", assetType: "coins" },
  { id: index+18, ticker: "MLG", title: "360noscope420blazeit", assetType: "coins" },
  { id: index+19, ticker: "CRASHOUT", title: "Crashout", assetType: "coins" },
  { id: index+20, ticker: "RETARDIO", title: "Retardio", assetType: "coins" },
  { id: index+21, ticker: "GIGACHAD", title: "GigaChad", assetType: "coins" },
  { id: index+22, ticker: "WIF", title: "DogWifHat", assetType: "coins" },
  { id: index+23, ticker: "Business", title: "Business Coin", assetType: "coins" },
  { id: index+24, ticker: "Sidelined", title: "Sidelined", assetType: "coins" },  
]

const COMBINED_TICKERS = [...SUGGESTIONS, ...tickers]

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [topTweetedTickers, setTopTweetedTickers] = useState<TopTweetedTickers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      fetchCryptoTrends(setTrends, setIsLoading, setError);
    }
    if (trends) {
      const topTweetedTickers = trends.topTweetedTickers
      const whaleTickers = trends.whaleActivity
      const bullishTickers = whaleTickers.bullish.map((ticker) => ({
        ticker: ticker.symbol,
        count: ticker.bullishScore || 0,
        ca: ticker.token_address
      }))
      const bearishTickers = whaleTickers.bearish.map((ticker) => ({
        ticker: ticker.symbol,
        count: ticker.bearishScore || 0,
        ca: ticker.token_address
      }))
      const combinedTickers = [...topTweetedTickers, ...bullishTickers, ...bearishTickers]
      setTopTweetedTickers(combinedTickers);
    }
  }, [open, trends]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size={"sm"}
        className="group"
      >
        <p className="flex gap-10 text-sm text-muted-foreground group-hover:text-foreground">
          Search...
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:text-foreground sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            title="Search"
            placeholder="Search by symbols or companies..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {search.length === 0 && (
              <>
                <CommandGroup heading="Trending Tickers">
                  {isLoading && !topTweetedTickers.length ? (
                    <CommandItem value="loading" className="justify-center">
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Loading trending tickers...
                      </p>
                    </CommandItem>
                  ) : error ? (
                    <CommandItem value="error" className="justify-center">
                      <p className="text-sm text-muted-foreground">
                        Failed to load trending tickers
                      </p>
                    </CommandItem>
                  ) : topTweetedTickers.length === 0 ? (
                    <CommandItem value="empty" className="justify-center">
                      <p className="text-sm text-muted-foreground">
                        No trending tickers found
                      </p>
                    </CommandItem>
                  ) : (
                    topTweetedTickers.slice(0, 5).map((ticker) => (
                      <CommandItem
                        key={ticker.ticker}
                        value={ticker.ticker}
                        onSelect={() => {
                          setOpen(false)
                          setSearch("")
                          router.push(`/coins/${ticker.ticker.replace('$', '')}?ca=${ticker.ca}`)
                        }}
                      >
                        <p className="mr-2 font-semibold">{ticker.ticker}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {ticker.count}
                        </p>
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
                <CommandGroup heading="Suggestions">
                  {SUGGESTIONS.map((suggestion) => (
                    <CommandItem
                      key={suggestion.ticker}
                      value={suggestion.ticker + "\n \n" + suggestion.title}
                      onSelect={() => {
                        setOpen(false)
                        setSearch("")
                        router.push(`/${suggestion.assetType}/${suggestion.ticker}`)
                      }}
                    >
                      <p className="mr-2 font-semibold">{suggestion.ticker}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.title}
                      </p>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {search.length > 0 &&
              COMBINED_TICKERS
                .filter(
                  (ticker) =>
                    ticker.ticker
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    ticker.title.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 10)
                .map((ticker) => (
                  <CommandItem
                    key={ticker.id}
                    value={ticker.ticker + "\n \n" + ticker.title}
                    onSelect={() => {
                      setOpen(false)
                      setSearch("")
                      router.push(`/${ticker.assetType}/${ticker.ticker}`)
                    }}
                  >
                    <p className="mr-2 font-semibold">{ticker.ticker}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticker.title}
                    </p>
                  </CommandItem>
                ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
