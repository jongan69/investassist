import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { categorizeTokens } from '@/lib/solana/categorizeTokens';
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


export async function POST(req: Request) {
  const maxRetries = 2;
  const retryDelay = 1000;
  let userPortfolio;
  let memecoinPercentage = 0;
  let memecoins: any[] = [];
  let categorizedTokens = null;

  try {
    const { fearGreedValue, sectorPerformance, marketData, userPortfolio: portfolioData } = await req.json();
    // console.log('Received request data:', { fearGreedValue, sectorPerformance, marketData, portfolioData }); // Debug log
    userPortfolio = portfolioData;
    if (!userPortfolio) {
      return NextResponse.json({ error: "User portfolio not found" }, { status: 404 });
    }
    userPortfolio.holdings = userPortfolio.holdings.filter((position: any) => position.usdValue > 1).slice(0, 10);
    // console.log('Filtered user portfolio holdings:', userPortfolio.holdings); // Debug log
    const updatedPortfolioValue = userPortfolio.holdings.reduce((sum: number, token: any) => sum + token.usdValue, 0);
    // console.log('Updated portfolio value:', updatedPortfolioValue); // Debug log

    // Try to categorize tokens with a timeout
    try {
      const tokenCategorizationPromise = categorizeTokens(userPortfolio.holdings);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token categorization timed out')), 5000)
      );
      
      categorizedTokens = await Promise.race([tokenCategorizationPromise, timeoutPromise]) as {
        memecoins: any[];
        verified: any[];
        lst: any[];
        defi: any[];
        other: any[];
      } | null;
      memecoins = categorizedTokens?.memecoins || [];
      const memecoinValue = memecoins.reduce((sum, token) => sum + token.usdValue, 0);
      memecoinPercentage = Math.min(20, (memecoinValue / updatedPortfolioValue) * 100);
      console.log('Memecoin percentage:', memecoinPercentage); // Debug log
    } catch (error) {
      console.error('Error or timeout in token categorization:', error);
      // Continue without categorization
      categorizedTokens = null;
      memecoins = [];
      memecoinPercentage = 0;
    }

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
      ${categorizedTokens ? `
      Portfolio Categories:
      - Verified Tokens: ${categorizedTokens.verified.map((t: any) => t.symbol).join(', ')}
      - Liquid Staked Tokens: ${categorizedTokens.lst.map((t: any) => t.symbol).join(', ')}
      - DeFi Tokens: ${categorizedTokens.defi.map((t: any) => t.symbol).join(', ')}
      - Memecoins: ${categorizedTokens.memecoins.map((t: any) => t.symbol).join(', ')}
      - Other: ${categorizedTokens.other.map((t: any) => t.symbol).join(', ')}
      
      Current Portfolio includes ${memecoins.length} memecoins worth $${memecoins.reduce((sum, m) => sum + m.usdValue, 0).toFixed(2)}.
      Include these memecoins in the allocation, but limit their total allocation to max 20%.
      ` : ''}

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
    console.log('Generated prompt for OpenAI:', prompt); // Debug log
    let attempt = 0;
    let responseGenerated = false;

    while (attempt < maxRetries && !responseGenerated) {
      try {
        console.log(`Attempt ${attempt + 1} to generate response`); // Debug log
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o",
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1000,
        });
        console.log('Completion from OpenAI:', completion); // Debug log
        if (completion.choices[0].message.content) {
          responseGenerated = true;
          const response = JSON.parse(completion.choices[0].message.content);
          console.log('Received response from OpenAI:', response); // Debug log

          // Validate the response has the required structure
          if (!response.allocations || !Array.isArray(response.allocations)) {
            console.error('Invalid response format - missing allocations array');
          }

          // Validate that allocations sum to 100%
          const totalAllocation = response.allocations.reduce(
            (sum: number, item: any) => sum + (item.percentage || 0),
            0
          );

          if (Math.abs(totalAllocation - 100) > 0.1) { // Allow small rounding differences
            console.error('Allocations do not sum to 100%');
          }

          return NextResponse.json(response as InvestmentPlanResponse);
        }
      } catch (apiError) {
        console.error(`Attempt ${attempt + 1} failed:`, apiError);
      }

      if (!responseGenerated && attempt < maxRetries - 1) {
        console.log(`Retrying after ${retryDelay}ms delay`); // Debug log
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      attempt++;
    }

    if (!responseGenerated) {
      console.log('Generating fallback response'); // Debug log
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