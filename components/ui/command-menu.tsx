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
import { searchUsers } from "@/lib/users/searchUsers"
import { getDexScreenerData } from "@/lib/solana/fetchDexData"

// Solana address validation regex
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const index = tickers.length

const SUGGESTIONS = [
  { id: index + 1, ticker: "BTC-USD", title: "Bitcoin", assetType: "stocks" },
  { id: index + 2, ticker: "ETH-USD", title: "Ethereum", assetType: "stocks" },
  { id: index + 3, ticker: "SOL-USD", title: "Solana", assetType: "stocks" },
  { id: index + 4, ticker: "DOGE-USD", title: "Dogecoin", assetType: "stocks" },
  { id: index + 5, ticker: "SHIB-USD", title: "Shiba Inu", assetType: "stocks" },
  { id: index + 6, ticker: "XRP-USD", title: "XRP", assetType: "stocks" },
  { id: index + 7, ticker: "ADA-USD", title: "Cardano", assetType: "stocks" },
  { id: index + 8, ticker: "DOT-USD", title: "Polkadot", assetType: "stocks" },
  { id: index + 9, ticker: "LINK-USD", title: "Chainlink", assetType: "stocks" },
  { id: index + 10, ticker: "UNI-USD", title: "Uniswap", assetType: "stocks" },
  { id: index + 11, ticker: "LOCKIN", title: "Lockin", assetType: "coins" },
  { id: index + 12, ticker: "MLG", title: "360noscope420blazeit", assetType: "coins" },
  { id: index + 13, ticker: "CRASHOUT", title: "Crashout", assetType: "coins" },
  { id: index + 14, ticker: "RETARDIO", title: "Retardio", assetType: "coins" },
  { id: index + 15, ticker: "GIGACHAD", title: "GigaChad", assetType: "coins" },
  { id: index + 16, ticker: "WIF", title: "DogWifHat", assetType: "coins" },
  { id: index + 17, ticker: "Business", title: "Business Coin", assetType: "coins" },
  { id: index + 18, ticker: "Sidelined", title: "Sidelined", assetType: "coins" },
]

interface WalletAddresses {
  [chain: string]: string[];
}

interface UserResult {
  username?: string;
  walletAddresses?: WalletAddresses;
  isTracked?: boolean;
}

// Filter out suggestions that already exist in tickers
const filteredSuggestions = SUGGESTIONS.filter(suggestion => 
  !tickers.some(ticker => ticker.ticker === suggestion.ticker)
);

const COMBINED_TICKERS = [...filteredSuggestions, ...tickers]

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [topTweetedTickers, setTopTweetedTickers] = useState<TopTweetedTickers[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if search is a valid Solana address
  const isSolanaAddress = SOLANA_ADDRESS_REGEX.test(search);

  useEffect(() => {
    if (isSolanaAddress) {
      const fetchTokenData = async () => {
        try {
          const data = await getDexScreenerData(search);
          setTokenData(data);
        } catch (error) {
          console.error("Error fetching token data:", error);
          setTokenData(null);
        }
      };
      fetchTokenData();
    } else {
      setTokenData(null);
    }
  }, [search, isSolanaAddress]);

  useEffect(() => {
    if (search) {
      searchUsers(search).then(setUserResults);
    } else {
      setUserResults([]);
    }
  }, [search]);

  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        const trendsData = await fetchCryptoTrends();
        setTrends(trendsData);
      } else {
        // Reset states when closing
        setTrends(null);
        setTopTweetedTickers([]);
        setIsLoading(true);
        setError(null);
      }
    };
    
    fetchData();
  }, [open]);

  useEffect(() => {
    if (!trends) return;

    const topTweetedTickers = trends?.topTweetedTickers || []
    const whaleTickers = trends?.whaleActivity || { bullish: [], bearish: [] }
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
  }, [trends]);

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
          Search assets, users, or contract addresses...
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:text-foreground sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearch("");
            setTokenData(null);
          }
        }}
      >
        <Command>
          <CommandInput
            title="Search"
            placeholder="Search assets, users, or contract addresses..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {isSolanaAddress && tokenData?.pairs?.length > 0 && (
              <CommandGroup heading="Token by Contract Address">
                {tokenData.pairs.slice(0, 3).map((pair: any) => (
                  <CommandItem
                    key={pair.pairAddress}
                    value={pair.baseToken.address}
                    onSelect={() => {
                      setOpen(false);
                      setSearch("");
                      router.push(`/coins/${pair.baseToken.symbol}?ca=${pair.baseToken.address}`);
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{pair.baseToken.symbol}</p>
                        <p className="text-sm text-muted-foreground">${parseFloat(pair.priceUsd).toFixed(6)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vol: ${pair.volume?.h24?.toLocaleString() || '0'} •
                        MC: ${pair.marketCap?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {isSolanaAddress && (
              <CommandGroup heading="Wallet Address">
                <CommandItem
                  key={search}
                  value={search}
                  onSelect={() => {
                    setOpen(false)
                    setSearch("")
                    router.push(`/users/${search}`)
                  }}
                >
                  <p className="mr-2 font-semibold">{search.slice(0, 8)}...</p>
                  <p className="text-sm text-muted-foreground">SOL</p>
                </CommandItem>
              </CommandGroup>
            )}
            {userResults && userResults.length > 0 && (
              <CommandGroup heading="Users & Wallets">
                {userResults.map((result) => {
                  // Get all wallet addresses from different chains
                  const allAddresses = Object.entries(result.walletAddresses || {}).flatMap(
                    ([chain, addresses]) =>
                      (addresses as string[]).map(address => ({ chain, address }))
                  );

                  return allAddresses.length > 0 ? (
                    // Map through each address
                    allAddresses.map(({ chain, address }) => (
                      <CommandItem
                        key={`${result.username}-${chain}-${address}`}
                        value={result.username || address}
                        onSelect={() => {
                          setOpen(false)
                          setSearch("")
                          router.push(`/users/${address}`)
                        }}
                      >
                        <p className="mr-2 font-semibold">{result.username || address.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{chain}</p>
                        {result.isTracked && (
                          <p className="ml-2 text-sm text-muted-foreground">Tracked Account</p>
                        )}
                        <p className="ml-2 text-xs text-muted-foreground">
                          {address.slice(0, 4)}...{address.slice(-4)}
                        </p>
                      </CommandItem>
                    ))
                  ) : (
                    // Fallback for users without addresses
                    <CommandItem
                      key={result.username}
                      value={result.username}
                      onSelect={() => {
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      <p className="mr-2 font-semibold">{result.username}</p>
                      {result.isTracked && (
                        <p className="text-sm text-muted-foreground">Tracked Account</p>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {search.length === 0 && (
              <>
                <CommandGroup heading="Trending Tickers">
                  {isLoading && !topTweetedTickers?.length ? (
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
            {search.length > 0 && (
              <CommandGroup heading="Assets">
                {COMBINED_TICKERS
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
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
