import { saveInvestmentPlan } from "./saveInvestmentPlan";
import { categorizeTokens } from '@/lib/solana/categorizeTokens';

export const generateInvestmentPlan = async (fearGreedValue: any, sectorPerformance: any, marketData: any[], userPortfolio: any, username: string) => {
    const formattedSectorPerformance = sectorPerformance.map((sector: any) => ({
        sector: sector.sector,
        performance: parseFloat(sector.changesPercentage.replace('%', ''))
    }));
    const filteredHoldings = userPortfolio.holdings.filter((position: any) => position.usdValue > 1).slice(0, 10);
    const updatedPortfolioValue = filteredHoldings.reduce((sum: number, token: any) => sum + token.usdValue, 0);

    // Add token categorization here
    let categorizedTokens = null;
    let memecoins: any[] = [];
    let memecoinPercentage = 0;

    try {
        const tokenCategorizationPromise = categorizeTokens(filteredHoldings);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Token categorization timed out')), 15000) // 15 seconds Or Timeout
        );

        categorizedTokens = await Promise.race([tokenCategorizationPromise, timeoutPromise]) as {
            memecoins: any[];
            verified: any[];
            lst: any[];
            defi: any[];
            other: any[];
        } | null;

        memecoins = categorizedTokens?.memecoins || [];
        const memecoinValue = memecoins.reduce((sum: number, token) => sum + token.usdValue, 0);
        memecoinPercentage = Math.min(20, (memecoinValue / updatedPortfolioValue) * 100);
    } catch (error) {
        console.error('Error or timeout in token categorization:', error);
        categorizedTokens = null;
        memecoins = [];
        memecoinPercentage = 0;
    }

    try {
        const response = await fetch('/api/generate-investment-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fearGreedValue,
                sectorPerformance: formattedSectorPerformance,
                marketData: {
                    cryptoMarket: {
                        bitcoin: marketData.find(d => d.symbol === 'BTC-USD')?.regularMarketPrice,
                        ethereum: marketData.find(d => d.symbol === 'ETH-USD')?.regularMarketPrice,
                        solana: marketData.find(d => d.symbol === 'SOL-USD')?.regularMarketPrice,
                    },
                    indices: {
                        sp500: marketData.find(d => d.symbol === 'ES=F')?.regularMarketPrice,
                        nasdaq: marketData.find(d => d.symbol === 'NQ=F')?.regularMarketPrice,
                        dowJones: marketData.find(d => d.symbol === 'YM=F')?.regularMarketPrice,
                    },
                    commodities: {
                        gold: marketData.find(d => d.symbol === 'GC=F')?.regularMarketPrice,
                        silver: marketData.find(d => d.symbol === 'SI=F')?.regularMarketPrice,
                    },
                    tenYearYield: marketData.find(d => d.symbol === '^TNX')?.regularMarketPrice,
                },
                userPortfolio: {
                    totalValue: updatedPortfolioValue,
                    holdings: filteredHoldings
                },
                // Add categorization data
                tokenCategories: categorizedTokens,
                memecoinPercentage,
                memecoins
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError: unknown) {
            if (jsonError instanceof Error) {
                throw new Error('Failed to parse JSON response: ' + jsonError.message);
            }
            throw new Error('Failed to parse JSON response');
        }

        // console.log('Response from OpenAI:', data);
        saveInvestmentPlan(username, data);
        return data;
    } catch (error) {
        console.error('Error generating investment plan:', error);
        throw error;
    }
}