import { saveInvestmentPlan } from "./saveInvestmentPlan";

export const generateInvestmentPlan = async (fearGreedValue: any, sectorPerformance: any, marketData: any[], userPortfolio: any, username: string) => {
    const formattedSectorPerformance = sectorPerformance.map((sector: any) => ({
        sector: sector.sector,
        performance: parseFloat(sector.changesPercentage.replace('%', ''))
      }));
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
                totalValue: userPortfolio.totalValue,
                holdings: userPortfolio.holdings
            }
        }),
    });
    const data = await response.json();
    saveInvestmentPlan(username, data);
    return data;
}