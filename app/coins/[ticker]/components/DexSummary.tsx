import Image from "next/image"
import { getDexScreenerData, getPairDetails, fetchKrakenTickerData } from "@/lib/solana/fetchCoinQuote"
import { getSolanaTokenCA } from "@/lib/solana/getCaFromTicker"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Twitter, Send, Globe, Search } from "lucide-react"
import { getTokenInfoFromTicker } from "@/lib/solana/getTokenInfoFromTicker"

function formatNumber(num: number) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  return num.toFixed(2)
}

function formatWholeNumber(num: number) {
  if (num >= 1e12) return `${Math.round(num / 1e12)}T`
  if (num >= 1e9) return `${Math.round(num / 1e9)}B`
  if (num >= 1e6) return `${Math.round(num / 1e6)}M`
  return Math.round(num).toLocaleString()
}

const keysToDisplay = [
  {
    key: "priceUsd",
    title: "Price",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Current market price in USD"
  },
  {
    key: "volume24h",
    title: "24h Vol",
    format: (n: number) => `$${formatNumber(n)}`,
    tooltip: "Total trading volume in the last 24 hours"
  },
  {
    key: "liquidity",
    title: "Liquidity",
    format: (n: number) => `$${formatNumber(n)}`,
    tooltip: "Total value of tokens available for trading in the liquidity pool"
  },
  {
    key: "marketCap",
    title: "Mkt cap",
    format: (n: number) => `$${formatNumber(n)}`,
    tooltip: "Total market value of circulating tokens (Price × Circulating Supply)"
  },
  {
    key: "priceChange24h",
    title: "24h Change",
    format: (n: number) => `${n.toFixed(2)}%`,
    tooltip: "Percentage price change in the last 24 hours"
  },
  {
    key: "holders",
    title: "Holders",
    format: formatWholeNumber,
    tooltip: "Number of unique addresses holding this token"
  },
  {
    key: "krakenBid",
    title: "Kraken Bid",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Highest price buyers are willing to pay on Kraken"
  },
  {
    key: "krakenAsk",
    title: "Kraken Ask",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Lowest price sellers are willing to accept on Kraken"
  },
  {
    key: "krakenVWAP",
    title: "Kraken 24h VWAP",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Volume Weighted Average Price - The average price of all trades over the last 24 hours, weighted by the volume of each trade"
  },
  {
    key: "krakenTrades",
    title: "Kraken 24h Trades",
    format: formatWholeNumber,
    tooltip: "Number of trades executed on Kraken in the last 24 hours"
  },
  {
    key: "krakenHigh",
    title: "Kraken 24h High",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Highest price traded on Kraken in the last 24 hours"
  },
  {
    key: "krakenLow",
    title: "Kraken 24h Low",
    format: (n: number) => `$${n.toFixed(6)}`,
    tooltip: "Lowest price traded on Kraken in the last 24 hours"
  },
] as const

type SocialIcon = {
  type: string
  component: React.ComponentType<{ className?: string }>
}

const socialIcons: Record<string, SocialIcon> = {
  twitter: { type: 'Twitter', component: Twitter },
  telegram: { type: 'Telegram', component: Send },
  website: { type: 'Website', component: Globe },
  chat: { type: 'Chat', component: Send },
  explorer: { type: 'Explorer', component: Search },
}

const SocialLinks = ({ dexScreenerData, pairDetails, hasCmc }: { dexScreenerData: any, pairDetails: any, hasCmc: boolean }) => {
  const renderSocialLink = (url: string, type: string) => {
    const iconInfo = socialIcons[type.toLowerCase()] || { component: Globe }
    const Icon = iconInfo.component

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        key={url}
        className="hover:text-primary transition-colors"
      >
        <Icon className="w-6 h-6" />
      </a>
    )
  }

  if (hasCmc && dexScreenerData?.cmc?.urls) {
    return (
      <div className="flex flex-row items-center gap-4 justify-center">
        {Object.entries(dexScreenerData.cmc.urls).map(([type, urls]) => (
          Array.isArray(urls) && urls.map((url: string) => renderSocialLink(url, type))
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-row items-center gap-4 justify-center">
      {dexScreenerData?.ds?.socials?.map((social: { type: string, url: string }) =>
        renderSocialLink(social.url, social.type)
      )}
      {dexScreenerData?.cg?.websites?.map((website: { url: string }) =>
        renderSocialLink(website.url, 'website')
      )}
    </div>
  )
}

export default async function DexSummary({ ticker, ca, hasCa }: { ticker: string, ca: string, hasCa: boolean }) {
  const tokenInfo = hasCa ? await getDexScreenerData(ca) : await getTokenInfoFromTicker(ticker)
  if (!tokenInfo) {
    return <div>Error: Token info not found</div>
  }
  const detailsPair = tokenInfo.pairs[0]
  if (!ca) ca = tokenInfo.pairs[0].pairAddress
  console.log("ca", ca)
  const datiledOfPair = await getPairDetails(tokenInfo.pairs[0].pairAddress)
  const krakenData = await fetchKrakenTickerData(ticker)
  const tokenPair = tokenInfo.pairs[0]
  const hasCmc = datiledOfPair?.cmc ? true : false

  const getData = (key: typeof keysToDisplay[number]['key']) => {
    if (!tokenPair) return undefined
    const detailsData = detailsPair
    const krakenPair = krakenData?.result?.[ticker.toUpperCase() + 'USD']

    switch (key) {
      case "priceUsd": return parseFloat(detailsData?.priceUsd || tokenPair.priceUsd)
      case "volume24h": return detailsData?.volume?.h24 || tokenPair.volume?.h24
      case "liquidity": return detailsData?.liquidity?.usd || tokenPair.liquidity?.usd
      case "marketCap": return detailsData?.marketCap || tokenPair.marketCap
      case "priceChange24h": return detailsData?.priceChange?.h24 || tokenPair.priceChange?.h24
      case "holders": return datiledOfPair?.holders?.count || 0
      case "krakenBid": return krakenPair ? parseFloat(krakenPair.b[0]) : undefined
      case "krakenAsk": return krakenPair ? parseFloat(krakenPair.a[0]) : undefined
      case "krakenVWAP": return krakenPair ? parseFloat(krakenPair.p[1]) : undefined
      case "krakenTrades": return krakenPair ? krakenPair.t[1] : undefined
      case "krakenHigh": return krakenPair ? parseFloat(krakenPair.h[1]) : undefined
      case "krakenLow": return krakenPair ? parseFloat(krakenPair.l[1]) : undefined
      default: return undefined
    }
  }

  return (
    <TooltipProvider>
      <Card className="p-6 space-y-6">
        {/* Token Header Section */}
        <div className="space-y-4">
          {datiledOfPair?.ti?.name && (
            <a href={`https://dexscreener.com/solana/${ca}`} target="_blank" rel="noopener noreferrer">
              <h2 className="text-2xl font-bold text-center">
                {datiledOfPair.ti.name}
              </h2>
            </a>
          )}

          <div className="flex flex-col items-center gap-4">
            {datiledOfPair?.cg?.imageUrl && (
              <div className="relative">
                <a href={`https://dexscreener.com/solana/${ca}`} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={datiledOfPair.cg.imageUrl}
                    alt={datiledOfPair.cg.id}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </a>
              </div>
            )}

            {datiledOfPair?.ti?.headerImage && (
              <div className="w-full flex justify-center">
             
                  <Image
                    src={datiledOfPair.ti.headerImage}
                    alt={datiledOfPair.ti.name || 'Token header image'}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto max-w-2xl rounded-lg shadow-md"
                    style={{ objectFit: 'contain' }}
                  />
              
              </div>
            )}
            <SocialLinks dexScreenerData={datiledOfPair} pairDetails={datiledOfPair} hasCmc={hasCmc} />
          </div>

          {datiledOfPair?.ti?.description && (
            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              {datiledOfPair.ti.description}
            </p>
          )}
          <br />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {keysToDisplay.map(({ key, title, format, tooltip }) => {
            const data = getData(key)
            const formattedData = data !== undefined && !isNaN(data)
              ? format(data)
              : "N/A"

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        {title}
                      </span>
                      <span className="font-semibold">
                        {formattedData}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </Card>
    </TooltipProvider>
  )
}
