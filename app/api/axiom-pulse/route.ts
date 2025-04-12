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
        "moonshot": true
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
        "max": 50 // Limit concentration of top holders to avoid manipulation
      },
      "devHolding": {
        "min": null,
        "max": 10 // Limit dev holdings to avoid rug pulls
      },
      "snipers": {
        "min": null,
        "max": 30 // Limit sniper holdings to avoid manipulation
      },
      "insiders": {
        "min": null,
        "max": 40 // Limit insider holdings to avoid manipulation
      },
      "bundle": {
        "min": null,
        "max": 30 // Limit bundler holdings to avoid manipulation
      },
      "holders": {
        "min": 50, // Require at least 50 holders for better distribution
        "max": null
      },
      "botUsers": {
        "min": null,
        "max": 50 // Limit bot users to avoid artificial trading
      },
      "bondingCurve": {
        "min": 70, // Require at least 70% bonding curve for better price stability
        "max": null
      },
      "liquidity": {
        "min": 50, // Require at least 50 SOL in liquidity
        "max": null
      },
      "volume": {
        "min": 50, // Require at least 50 SOL in volume for trading activity
        "max": null
      },
      "marketCap": {
        "min": 100, // Require at least 100 SOL in market cap
        "max": null
      },
      "txns": {
        "min": 200, // Require at least 200 transactions for trading activity
        "max": null
      },
      "numBuys": {
        "min": 100, // Require at least 100 buy transactions
        "max": null
      },
      "numSells": {
        "min": 50, // Require at least 50 sell transactions
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

  // Fetch data from all tables in parallel
  const fetchPromises = tables.map(table => {
    const filters = JSON.stringify({
      ...filterTemplate,
      table
    });
    
    return fetch('https://api5.axiom.trade/pulse', {
      method: 'POST',
      headers: {
        'Cookie': process.env.AXIOM_COOKIE || ''
      },
      body: filters
    }).then(response => response.json());
  });

  try {
    // Wait for all fetch requests to complete
    const results = await Promise.all(fetchPromises);
    
    // Combine all results into a single array
    const allTokens: Token[] = [];
    
    results.forEach((data, index) => {
      if (Array.isArray(data)) {
        // Add source table information to each token
        const tokensWithSource = data.map(token => ({
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
    
    // Ensure all tokens have a score property
    const tokensWithScores = deduplicatedTokens.map(token => {
      // If token doesn't have a score, calculate one
      if (token.score === undefined) {
        return {
          ...token,
          score: calculateTokenScore(token)
        };
      }
      return token;
    });
    
    // Calculate scores and sort tokens (if not already sorted)
    const sortedTokens = tokensWithScores.sort((a, b) => b.score - a.score);
    
    return NextResponse.json(sortedTokens);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// Function to calculate a composite score for each token
function calculateTokenScore(token: Token): number {
  // Weight factors for different metrics
  const weights = {
    volume: 0.25,
    liquidity: 0.2,
    bondingCurve: 0.15,
    numHolders: 0.1,
    buySellRatio: 0.15,
    holderDistribution: 0.15
  };
  
  // Calculate buy/sell ratio (higher is better)
  const buySellRatio = token.numSells > 0 ? token.numBuys / token.numSells : 0;
  
  // Calculate holder distribution score (lower concentration is better)
  const holderDistributionScore = 100 - token.top10HoldersPercent;
  
  // Normalize metrics to 0-100 scale
  const normalizedVolume = Math.min(100, (token.volumeSol / 1000) * 100);
  const normalizedLiquidity = Math.min(100, (token.liquiditySol / 100) * 100);
  const normalizedHolders = Math.min(100, (token.numHolders / 500) * 100);
  
  // Calculate weighted score
  const score = 
    (normalizedVolume * weights.volume) +
    (normalizedLiquidity * weights.liquidity) +
    (token.bondingCurvePercent * weights.bondingCurve / 100) +
    (normalizedHolders * weights.numHolders / 100) +
    (Math.min(100, buySellRatio * 10) * weights.buySellRatio / 100) +
    (holderDistributionScore * weights.holderDistribution / 100);
  
  return score;
}
