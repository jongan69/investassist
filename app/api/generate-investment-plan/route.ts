import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface InvestmentPlanResponse {
  marketAnalysis: {
    overview?: string;
    summary?: string;
    sectors?: Record<string, number>;
    currentPortfolio?: {
      totalValue: number;
      holdings: Record<string, number>;
    };
  };
  allocations: Array<{
    asset: string;
    percentage: number;
    reasoning: string;
  }>;
  summary?: string;
  riskLevel?: string;
}

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  tags: string[];
  daily_volume: number;
}

async function categorizeTokens(holdings: any[]) {
  try {
    // Fetch verified tokens from Jupiter API
    const response = await fetch('https://api.jup.ag/tokens/v1/all');
    const allTokens: JupiterToken[] = await response.json();
    const categorized = {
      verified: [] as any[],
      memecoins: [] as any[],
      lst: [] as any[],  // Liquid Staked Tokens
      defi: [] as any[],
      other: [] as any[]
    };

    for (const holding of holdings) {
      const jupiterToken = allTokens.find(t => t.address === holding.mintAddress);

      if (!jupiterToken) {
        categorized.other.push(holding);
        continue;
      }

      // Check tags
      if (jupiterToken.tags.includes('lst')) {
        categorized.lst.push(holding);
      } else if (jupiterToken.tags.includes('verified')) {
        if (jupiterToken.tags.includes('defi')) {
          categorized.defi.push(holding);
        } else if (
          jupiterToken.symbol.includes('PEPE') ||
          jupiterToken.symbol.includes('DOGE') ||
          jupiterToken.symbol.includes('SHIB') ||
          jupiterToken.symbol.includes('BONK') ||
          jupiterToken.symbol.includes('WIF') ||
          jupiterToken.daily_volume < 10000 // Low volume might indicate meme tokens
        ) {
          categorized.memecoins.push(holding);
        } else {
          categorized.verified.push(holding);
        }
      } else {
        categorized.other.push(holding);
      }
    }

    return categorized;
  } catch (error) {
    console.error('Error categorizing tokens:', error);
    return null;
  }
}

export async function POST(req: Request) {
  const maxRetries = 2;
  const retryDelay = 1000;
  let userPortfolio;
  let memecoinPercentage = 0;
  let memecoins: any[] = [];

  try {
    const { fearGreedValue, sectorPerformance, marketData, userPortfolio: portfolioData } = await req.json();
    console.log(JSON.stringify(fearGreedValue));
    userPortfolio = portfolioData
    userPortfolio.holdings = userPortfolio.holdings.filter((position: any) => position.usdValue > 1).slice(0, 10);
    const updatedPortfolioValue = userPortfolio.holdings.reduce((sum: number, token: any) => sum + token.usdValue, 0);
    // Replace detectMemecoins with new categorization
    const categorizedTokens = await categorizeTokens(userPortfolio.holdings);
    const memecoins = categorizedTokens?.memecoins || [];
    const memecoinValue = memecoins.reduce((sum, token) => sum + token.usdValue, 0);
    memecoinPercentage = Math.min(20, (memecoinValue / userPortfolio.totalValue) * 100);

    const prompt = `
      As a financial advisor, analyze the following data and provide an investment allocation plan:
      
      Current Portfolio:
      Total Value: $${updatedPortfolioValue}
      Holdings: ${userPortfolio.holdings.map((h: any) => `${h.symbol}: $${h.usdValue.toFixed(2)}`).join(', ')}
      
      Market Sentiment (Fear & Greed Index):
      Current: ${fearGreedValue.fgi.now.value} (${fearGreedValue.fgi.now.valueText})
      Previous Close: ${fearGreedValue.fgi.previousClose.value} (${fearGreedValue.fgi.previousClose.valueText})
      One Week Ago: ${fearGreedValue.fgi.oneWeekAgo.value} (${fearGreedValue.fgi.oneWeekAgo.valueText})
      One Month Ago: ${fearGreedValue.fgi.oneMonthAgo.value} (${fearGreedValue.fgi.oneMonthAgo.valueText})
      One Year Ago: ${fearGreedValue.fgi.oneYearAgo.value} (${fearGreedValue.fgi.oneYearAgo.valueText})
      Last Updated: ${new Date(fearGreedValue.lastUpdated.humanDate).toLocaleString()}
      
      Sector Performance:
      ${sectorPerformance.map((sector: any) => `${sector.sector}: ${sector.performance}%`).join('\n')}

      Market Data:
      ${JSON.stringify(marketData, null, 2)}
      
      Current Portfolio includes ${memecoins.length} memecoins worth $${memecoinValue.toFixed(2)}.
      Memecoins: ${memecoins.map(m => `${m.symbol}: $${m.usdValue.toFixed(2)}`).join(', ')}
      
      Include these memecoins in the allocation, but limit their total allocation to max 20%.
      
      Portfolio Categories:
      - Verified Tokens: ${categorizedTokens?.verified.map(t => t.symbol).join(', ')}
      - Liquid Staked Tokens: ${categorizedTokens?.lst.map(t => t.symbol).join(', ')}
      - DeFi Tokens: ${categorizedTokens?.defi.map(t => t.symbol).join(', ')}
      - Memecoins: ${categorizedTokens?.memecoins.map(t => t.symbol).join(', ')}
      - Other: ${categorizedTokens?.other.map(t => t.symbol).join(', ')}
      
      Provide a response in JSON format that MUST include:
      1. A "marketAnalysis" object with an "overview" of current market conditions
      2. An "allocations" array where each item has:
         - "asset": The asset name (string)
         - "percentage": The recommended allocation (number between 0-100)
         - "reasoning": Why this allocation is recommended (string)
      3. A "summary" string explaining the overall strategy
      4. A "riskLevel" string indicating portfolio risk level

      The sum of all allocation percentages must equal 100.
    `;
    console.log(prompt);
    let attempt = 0;
    let responseGenerated = false;

    while (attempt < maxRetries && !responseGenerated) {
      try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o",
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1000,
        });

        if (completion.choices[0].message.content) {
          responseGenerated = true;
          const response = JSON.parse(completion.choices[0].message.content);

          // Validate the response has the required structure
          if (!response.allocations || !Array.isArray(response.allocations)) {
            throw new Error('Invalid response format - missing allocations array');
          }

          // Validate that allocations sum to 100%
          const totalAllocation = response.allocations.reduce(
            (sum: number, item: any) => sum + (item.percentage || 0),
            0
          );

          if (Math.abs(totalAllocation - 100) > 0.1) { // Allow small rounding differences
            throw new Error('Allocations do not sum to 100%');
          }

          return NextResponse.json(response as InvestmentPlanResponse);
        }
      } catch (apiError) {
        console.error(`Attempt ${attempt + 1} failed:`, apiError);
      }

      if (!responseGenerated && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      attempt++;
    }

    if (!responseGenerated) {
      // Update the fallback response to include memecoins if present
      const fallbackResponse: InvestmentPlanResponse = {
        marketAnalysis: {
          overview: "Unable to generate detailed market analysis. Using conservative allocation with existing memecoin holdings.",
          sectors: {},
          currentPortfolio: userPortfolio
        },
        allocations: [
          { asset: "Large Cap Stocks", percentage: 30 - (memecoinPercentage / 2), reasoning: "Core market exposure" },
          { asset: "Bonds", percentage: 30 - (memecoinPercentage / 2), reasoning: "Stability and income" },
          { asset: "Cash", percentage: 20, reasoning: "Safety and flexibility" },
          { asset: "Gold", percentage: 10, reasoning: "Inflation hedge" },
          ...(memecoinPercentage > 0 ? [{
            asset: "Memecoins",
            percentage: memecoinPercentage,
            reasoning: `Existing memecoin holdings: ${memecoins.map(m => m.symbol).join(', ')}`
          }] : []),
          {
            asset: "Cryptocurrencies",
            percentage: 10,
            reasoning: "Growth potential"
          }
        ],
        summary: `Conservative allocation with ${memecoinPercentage.toFixed(1)}% existing memecoin exposure`,
        riskLevel: memecoinPercentage > 10 ? "High" : "Moderate"
      };

      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Error generating investment plan:', error);

    // Update the fallback response to include memecoins if present
    const fallbackResponse: InvestmentPlanResponse = {
      marketAnalysis: {
        overview: "Unable to generate detailed market analysis. Using conservative allocation with existing memecoin holdings.",
        sectors: {},
        currentPortfolio: userPortfolio
      },
      allocations: [
        { asset: "Large Cap Stocks", percentage: 30 - (memecoinPercentage / 2), reasoning: "Core market exposure" },
        { asset: "Bonds", percentage: 30 - (memecoinPercentage / 2), reasoning: "Stability and income" },
        { asset: "Cash", percentage: 20, reasoning: "Safety and flexibility" },
        { asset: "Gold", percentage: 10, reasoning: "Inflation hedge" },
        ...(memecoinPercentage > 0 ? [{
          asset: "Memecoins",
          percentage: memecoinPercentage,
          reasoning: `Existing memecoin holdings: ${memecoins.map(m => m.symbol).join(', ')}`
        }] : []),
        {
          asset: "Cryptocurrencies",
          percentage: 10,
          reasoning: "Growth potential"
        }
      ],
      summary: `Conservative allocation with ${memecoinPercentage.toFixed(1)}% existing memecoin exposure`,
      riskLevel: memecoinPercentage > 10 ? "High" : "Moderate"
    };

    return NextResponse.json(fallbackResponse);
  }
} 