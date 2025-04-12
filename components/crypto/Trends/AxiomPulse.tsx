"use client"
import { fetchPulse } from "@/lib/axiom/fetchPulse"
import { useEffect, useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { formatNumber } from "@/lib/utils"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Define token interface based on the API response
interface Token {
  pairAddress: string;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
  tokenImage: string;
  volumeSol: number;
  liquiditySol: number;
  bondingCurvePercent: number;
  numHolders: number;
  numBuys: number;
  numSells: number;
  top10HoldersPercent: number;
  score: number;
  sourceTable: string;
  createdAt: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  protocol: string;
  [key: string]: any;
}

// Loading component
function LoadingTokens() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Axiom Pulse</h1>
      <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1600px] mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full rounded-xl border bg-card p-4 shadow-md animate-pulse">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-secondary mr-3 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-secondary mb-1"></div>
                  <div className="h-3 w-16 bg-secondary"></div>
                </div>
                <div className="h-6 w-16 rounded-full bg-secondary"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="h-12 bg-secondary rounded"></div>
                <div className="h-12 bg-secondary rounded"></div>
                <div className="h-12 bg-secondary rounded"></div>
                <div className="h-12 bg-secondary rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-secondary"></div>
                <div className="h-3 w-16 bg-secondary"></div>
                <div className="h-3 w-16 bg-secondary"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorTokens() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Axiom Pulse</h1>
      <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-destructive/10 text-destructive">
        <p className="text-base">Failed to load tokens. Please try again later.</p>
      </div>
    </div>
  );
}

// Empty state component
function EmptyTokens() {
  return (
    <div className="container mx-auto px-4 py-4 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
      <h1 className="text-2xl font-bold mb-6 max-w-[1600px] mx-auto">Axiom Pulse</h1>
      <div className="p-6 rounded-xl text-center max-w-[1600px] mx-auto bg-card border border-border">
        <p className="text-base text-muted-foreground">No tokens available at the moment.</p>
      </div>
    </div>
  );
}

// Token card component
function TokenCard({ token }: { token: Token }) {
  const { resolvedTheme } = useTheme();
  
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'finalStretch':
        return 'bg-blue-500';
      case 'newPairs':
        return 'bg-green-500';
      case 'migrated':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 40) return 'text-green-500';
    if (score >= 30) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  // Default image to use when tokenImage is empty
  const defaultImage = "/images/default-token.png";

  // Function to handle card click and open the Axiom Trade link
  const handleCardClick = () => {
    if (token.pairAddress) {
      window.open(`https://axiom.trade/meme/${token.pairAddress}/@drboob`, '_blank');
    }
  };

  return (
    <div 
      className="w-full rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={handleCardClick}
    >
      <div className="flex items-start mb-2">
        <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
          {token.tokenImage ? (
            <Image 
              src={token.tokenImage} 
              alt={token.tokenName}
              fill
              unoptimized
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium">{token.tokenTicker?.charAt(0) || '?'}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-xs break-words text-foreground">{token.tokenName}</h2>
          <p className="text-xs text-muted-foreground truncate">{token.tokenTicker}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] text-white ${getSourceBadgeColor(token.sourceTable)}`}>
          {token.sourceTable}
        </span>
        <span className={`text-[10px] font-bold ${getScoreColor(token.score)}`}>
          Score: {token.score?.toFixed(2) || 'N/A'}
        </span>
        <span className="text-[10px] text-muted-foreground break-words">
          {token.protocol}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div className="bg-secondary/20 p-1.5 rounded">
          <p className="text-[10px] text-muted-foreground">Volume</p>
          <p className="font-semibold text-xs text-foreground">{formatNumber(token.volumeSol || 0)} SOL</p>
        </div>
        <div className="bg-secondary/20 p-1.5 rounded">
          <p className="text-[10px] text-muted-foreground">Liquidity</p>
          <p className="font-semibold text-xs text-foreground">{formatNumber(token.liquiditySol || 0)} SOL</p>
        </div>
        <div className="bg-secondary/20 p-1.5 rounded">
          <p className="text-[10px] text-muted-foreground">Holders</p>
          <p className="font-semibold text-xs text-foreground">{token.numHolders?.toFixed(0) || '0'}</p>
        </div>
        <div className="bg-secondary/20 p-1.5 rounded">
          <p className="text-[10px] text-muted-foreground">Bonding Curve</p>
          <p className="font-semibold text-xs text-foreground">{token.bondingCurvePercent?.toFixed(2) || '0'}%</p>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
        <div>
          <span className="font-medium">{token.numBuys?.toFixed(0) || '0'}</span> buys
        </div>
        <div>
          <span className="font-medium">{token.numSells?.toFixed(0) || '0'}</span> sells
        </div>
        <div>
          <span className="font-medium">{token.top10HoldersPercent?.toFixed(2) || '0'}%</span> top 10
        </div>
      </div>

      <div className="flex space-x-1.5">
        {token.twitter && (
          <a 
            href={token.twitter} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
          </a>
        )}
        {token.telegram && (
          <a 
            href={token.telegram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.44 3.97-1.44.09 0 .28.02.41.09.11.06.19.14.22.24.03.11.04.21.01.3z"></path>
            </svg>
          </a>
        )}
        {token.website && (
          <a 
            href={token.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// Client-side component that fetches data
function AxiomPulseClient() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchPulse();
      if (data) {
        setTokens(data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchData();
      setHasFetched(true);
    }
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [hasFetched]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-6 max-w-full mx-auto mb-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Axiom Pulse
          </h2>
          <div className="text-xs text-muted-foreground">
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </div>
        
        {loading ? (
          <LoadingTokens />
        ) : error ? (
          <ErrorTokens />
        ) : tokens.length === 0 ? (
          <EmptyTokens />
        ) : (
          <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token, index) => (
                <TokenCard key={index} token={token} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AxiomPulse() {
  return <AxiomPulseClient />;
}