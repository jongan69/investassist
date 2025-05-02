import { truncate } from "fs/promises";
import { NextResponse } from "next/server";

// Define token interface based on the API response
interface Token {
  pairAddress: string;
  tokenAddress: string;
  tokenName: string;
  tokenTicker: string;
  volumeSol: number;
  liquiditySol: number;
  bondingCurvePercent: number;
  numHolders: number;
  numBuys: number;
  numSells: number;
  top10HoldersPercent: number;
  [key: string]: any; // For other properties we might not be using
}

// Helper function for retries with logging
async function fetchWithRetry(url: string, options: any, maxRetries = 3, retryDelay = 1000, context = ""): Promise<any> {
  let attempt = 0;
  let lastError;
  while (attempt < maxRetries) {
    try {
      console.log(`[AxiomPulse][${context}] Fetch attempt #${attempt + 1} to`, url, "with options:", options);
      const response = await fetch(url, options);
      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error(`[AxiomPulse][${context}] Failed to parse JSON:`, text);
        throw parseErr;
      }
      if (!response.ok) {
        console.error(`[AxiomPulse][${context}] Non-OK response:`, response.status, json);
        throw new Error(`Non-OK response: ${response.status}`);
      }
      console.log(`[AxiomPulse][${context}] Success:`, json);
      return json;
    } catch (err) {
      lastError = err;
      console.error(`[AxiomPulse][${context}] Error on attempt #${attempt + 1}:`, err);
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, retryDelay));
        console.log(`[AxiomPulse][${context}] Retrying...`);
      }
    }
  }
  throw lastError;
}

// --- Improved Scoring System ---
// Default weights (can be overridden by query params)
const DEFAULT_WEIGHTS = {
  volume: 0.2,
  liquidity: 0.2,
  bondingCurve: 0.1,
  numHolders: 0.1,
  buySellRatio: 0.15,
  holderDistribution: 0.15,
};

// Normalize a value to 0-100 scale given min and max
function normalize(value: number, min: number, max: number): number {
  if (value == null || isNaN(value)) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate a composite score for a token.
 * Penalizes tokens with zero liquidity (not tradable).
 * High top10HoldersPercent is penalized in the score, but not excluded.
 * Allows custom weights for each metric.
 */
function calculateTokenScore(token: Token, weights = DEFAULT_WEIGHTS): number {
  // Penalize tokens with zero liquidity (not tradable)
  if (!token.liquiditySol) return 0;

  // Example normalization ranges (tune as needed)
  const normalizedVolume = normalize(token.volumeSol, 0, 1000);
  const normalizedLiquidity = normalize(token.liquiditySol, 0, 100);
  const normalizedHolders = normalize(token.numHolders, 0, 500);
  const normalizedBondingCurve = normalize(token.bondingCurvePercent, 0, 100);

  // Buy/sell ratio (capped)
  const buySellRatio = token.numSells > 0 ? token.numBuys / token.numSells : 0;
  const normalizedBuySellRatio = Math.min(100, buySellRatio * 10);

  // Holder distribution (lower concentration is better)
  const holderDistributionScore = 100 - (token.top10HoldersPercent ?? 100);

  // Weighted sum
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  return (
    normalizedVolume * (weights.volume || 0) +
    normalizedLiquidity * (weights.liquidity || 0) +
    normalizedBondingCurve * (weights.bondingCurve || 0) +
    normalizedHolders * (weights.numHolders || 0) +
    normalizedBuySellRatio * (weights.buySellRatio || 0) +
    holderDistributionScore * (weights.holderDistribution || 0)
  ) / (totalWeight || 1);
}

export async function GET(request: Request) {
  // Define the tables to fetch data from
  const tables = ["finalStretch", "newPairs", "migrated"];
  
  // Create a filter template that will be used for all tables
  const filterTemplate = {
    "filters": {
      "protocols": {
        "raydium": true,
        "pump": true,
        "pumpAmm": true,
        "launchLab": true,
        "virtualCurve": true,
        "bonk": true,
        "boop": true,
        "meteoraAmm": false,
        "meteoraAmmV2": false,
        "moonshot": false
      },
      "searchKeywords": [],
      "excludeKeywords": [],
      "dexPaid": false,
      "mustEndInPump": false,
      "age": {
        "min": null,
        "max": null
      },
      "top10Holders": {
        "min": null,
        "max": null
      },
      "devHolding": {
        "min": null,
        "max": null
      },
      "snipers": {
        "min": null,
        "max": null
      },
      "insiders": {
        "min": null,
        "max": null
      },
      "bundle": {
        "min": null,
        "max": null
      },
      "holders": {
        "min": null,
        "max": null
      },
      "botUsers": {
        "min": null,
        "max": null
      },
      "bondingCurve": {
        "min": null,
        "max": null
      },
      "liquidity": {
        "min": null,
        "max": null
      },
      "volume": {
        "min": null,
        "max": null
      },
      "marketCap": {
        "min": null,
        "max": null
      },
      "txns": {
        "min": null,
        "max": null
      },
      "numBuys": {
        "min": null,
        "max": null
      },
      "numSells": {
        "min": null,
        "max": null
      },
      "numMigrations": {
        "min": null,
        "max": null
      },
      "twitter": {
        "min": null,
        "max": null
      },
      "twitterExists": false,
      "website": false,
      "telegram": false,
      "atLeastOneSocial": false
    },
    "usdPerSol": null
  };

  // Fetch data from all tables in parallel with retries and logging
  const fetchPromises = tables?.map(async (table) => {
    const filters = JSON.stringify({
      ...filterTemplate,
      table,
    });
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://axiom.trade",
        "Referer": "https://axiom.trade/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
        "Cookie": process.env.AXIOM_COOKIE || ""
      },
      body: filters,
    };
    console.log(`[AxiomPulse] Fetching table: ${table} with filters:`, filters);
    try {
      const data = await fetchWithRetry(
        "https://api6.axiom.trade/pulse",
        fetchOptions,
        3,
        1000,
        table
      );
      return data;
    } catch (err) {
      console.error(`[AxiomPulse] Failed to fetch table: ${table} after retries`, err);
      return [];
    }
  });

  try {
    // Wait for all fetch requests to complete
    const results = await Promise.all(fetchPromises);
    console.log("[AxiomPulse] Raw results from all tables:", results);
    
    // Combine all results into a single array
    const allTokens: Token[] = [];
    
    results.forEach((data, index) => {
      console.log(`[AxiomPulse] Processing data for table: ${tables[index]}`, data);
      if (Array.isArray(data)) {
        // Add source table information to each token
        const tokensWithSource = data?.map(token => ({
          ...token,
          sourceTable: tables[index]
        }));
        allTokens.push(...tokensWithSource);
      }
    });
    
    // Deduplicate tokens based on tokenAddress
    const uniqueTokensMap = new Map<string, Token>();
    
    allTokens.forEach(token => {
      const tokenAddress = token.tokenAddress;
      
      if (!uniqueTokensMap.has(tokenAddress)) {
        uniqueTokensMap.set(tokenAddress, token);
      } else {
        const existingToken = uniqueTokensMap.get(tokenAddress)!;
        
        // Keep the token with the higher score
        if (token.score > existingToken.score) {
          uniqueTokensMap.set(tokenAddress, token);
        } 
        // If scores are equal, use the calculateTokenScore function
        else if (token.score === existingToken.score) {
          const tokenScore = calculateTokenScore(token);
          const existingScore = calculateTokenScore(existingToken);
          
          if (tokenScore > existingScore) {
            uniqueTokensMap.set(tokenAddress, token);
          }
        }
      }
    });
    
    // Convert the map values back to an array
    const deduplicatedTokens = Array.from(uniqueTokensMap.values());
    console.log("[AxiomPulse] Deduplicated tokens:", deduplicatedTokens);
    
    // Parse query params for custom weights (e.g., ?volume=0.3&liquidity=0.1...)
    const url = new URL(request.url);
    const params = url.searchParams;
    const customWeights: any = {};
    let hasCustom = false;
    for (const key of Object.keys(DEFAULT_WEIGHTS)) {
      const val = params.get(key);
      if (val !== null) {
        customWeights[key] = parseFloat(val);
        hasCustom = true;
      }
    }
    const weights = hasCustom ? { ...DEFAULT_WEIGHTS, ...customWeights } : DEFAULT_WEIGHTS;
    
    // Ensure all tokens have a score property using improved scoring
    const tokensWithScores = deduplicatedTokens?.map(token => {
      if (token.score === undefined) {
        const scored = {
          ...token,
          score: calculateTokenScore(token, weights),
        };
        // console.log("[AxiomPulse] Calculated score for token:", scored);
        return scored;
      }
      return token;
    });
    
    // Calculate scores and sort tokens (if not already sorted)
    const sortedTokens = tokensWithScores.sort((a, b) => b.score - a.score);
    // Only return the top 20 tokens
    return NextResponse.json(sortedTokens.slice(0, 20));
  } catch (error) {
    console.error("[AxiomPulse] Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
