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

interface TokenCategories {
  memecoins: any[];
  verified: any[];
  lst: any[];
  defi: any[];
  other: any[];
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4o"; // Add fallback model

export async function POST(req: Request) {
  const maxRetries = 2;
  const retryDelay = 1000;
  let userPortfolio;
  let memecoinPercentage = 0;
  let memecoins: any[] = [];
  let categorizedTokens = null;

  try {
    const { fearGreedValue, sectorPerformance, marketData, userPortfolio: portfolioData } = await req.json();
    userPortfolio = portfolioData;
    if (!userPortfolio) {
      return NextResponse.json({ error: "User portfolio not found" }, { status: 404 });
    }
    
    // Filter and process portfolio data more efficiently
    userPortfolio.holdings = userPortfolio.holdings
      .filter((position: any) => position.usdValue > 1)
      .slice(0, 10)
      .map((h: any) => ({
        symbol: h.symbol,
        usdValue: h.usdValue
      }));

    const updatedPortfolioValue = userPortfolio.holdings.reduce((sum: number, token: any) => sum + token.usdValue, 0);

    // Token categorization with memory optimization
    try {
      const tokenCategorizationPromise = categorizeTokens(userPortfolio.holdings);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Token categorization timed out')), 5000)
      );

      categorizedTokens = await Promise.race([tokenCategorizationPromise, timeoutPromise]) as TokenCategories | null;
      memecoins = categorizedTokens?.memecoins || [];
      memecoinPercentage = Math.min(20, (memecoins.reduce((sum, token) => sum + token.usdValue, 0) / updatedPortfolioValue) * 100);
    } catch (error) {
      console.error('Error or timeout in token categorization:', error);
      categorizedTokens = null;
      memecoins = [];
      memecoinPercentage = 0;
    }

    // Construct prompt more efficiently
    const portfolioSection = `Current Portfolio:\nTotal Value: $${updatedPortfolioValue}\nHoldings: ${
      userPortfolio.holdings.map((h: any) => `${h.symbol}: $${h.usdValue.toFixed(2)}`).join(', ')
    }`;

    const sentimentSection = `Market Sentiment:\nCurrent: ${fearGreedValue.fgi.now.value} (${fearGreedValue.fgi.now.valueText})\nTrend: ${fearGreedValue.fgi.previousClose.valueText}`;

    const sectorSection = `Sector Performance:\n${
      sectorPerformance.slice(0, 5).map((sector: any) => `${sector.sector}: ${sector.performance}%`).join('\n')
    }`;

    const categoriesSection = categorizedTokens ? `
      Portfolio Categories:
      Verified: ${categorizedTokens.verified.map((t: any) => t.symbol).join(', ')}
      LST: ${categorizedTokens.lst.map((t: any) => t.symbol).join(', ')}
      DeFi: ${categorizedTokens.defi.map((t: any) => t.symbol).join(', ')}
      Memecoins: ${categorizedTokens.memecoins.map((t: any) => t.symbol).join(', ')}` : '';

    const prompt = `
      As a financial advisor, analyze the following data and provide an investment allocation plan:
      
      ${portfolioSection}
      ${sentimentSection}
      ${sectorSection}
      ${categoriesSection}
      ${memecoins.length ? `Current memecoin allocation: ${memecoinPercentage.toFixed(1)}%` : ''}

      Provide a JSON response with:
      1. "marketAnalysis": { "overview": string }
      2. "allocations": Array of { "asset": string, "percentage": number, "reasoning": string }
      3. "summary": string
      4. "riskLevel": string

      Total allocation must be 100%.
    `;

    console.log('Generated prompt for OpenAI:', prompt); // Debug log
    let attempt = 0;
    let responseGenerated = false;

    while (attempt < maxRetries && !responseGenerated) {
      try {
        console.log(`Attempt ${attempt + 1} to generate response`); // Debug log
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: MODEL,
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4000,
        });

        // Add more detailed error logging
        if (!completion) {
          console.error('OpenAI completion is null or undefined');
          throw new Error('Empty completion from OpenAI');
        }

        if (!completion.choices || completion.choices.length === 0) {
          console.error('OpenAI completion has no choices:', completion);
          throw new Error('No choices in OpenAI completion');
        }

        if (!completion.choices[0].message?.content) {
          console.error('OpenAI completion has no content:', completion.choices[0]);
          throw new Error('No content in OpenAI completion');
        }

        console.log('Completion from OpenAI:', completion); // Debug log
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
      } catch (apiError: any) {
        console.error(`Attempt ${attempt + 1} failed with error:`, {
          name: apiError.name,
          message: apiError.message,
          status: apiError.status,
          stack: apiError.stack,
        });

        // Check for specific OpenAI API errors
        if (apiError.status === 429) {
          console.error('Rate limit exceeded');
        } else if (apiError.status === 401) {
          console.error('Authentication error - check OPENAI_API_KEY');
        }

        // Add delay between retries
        if (!responseGenerated && attempt < maxRetries - 1) {
          const currentDelay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Retrying after ${currentDelay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
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