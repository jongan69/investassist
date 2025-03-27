// api/get-high-oi-options?ticker=AAPL&optionType=call
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest";
import { NextResponse } from "next/server";
import { validateTicker } from "@/lib/utils";
import { DateTime } from 'luxon';
import yahooFinance from 'yahoo-finance2';

// Define types for Yahoo Finance data
interface YahooQuote {
    symbol: string;
    longName: string;
    regularMarketPrice: number;
    dividendRate: number;
    dividendYield: number;
    marketCap: number;
    trailingPE: number;
    epsTrailingTwelveMonths: number;
    payoutRatio: number;
    beta: number;
    debtToEquity: number;
    averageDailyVolume3Month: number;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekHigh: number;
    sector: string;
    industry: string;
    quoteType: string;
    bookValue: number;
    currentAssets: number;
    currentLiabilities: number;
    dividendGrowthRate: number;
}

interface YahooQuoteResponse {
    regularMarketPrice: number;
    dividendRate: number;
}

interface SectorBreakdown {
    investment: number;
    income: number;
    weight: number;
}

type ScreenerType = 
    | 'undervalued_large_caps'
    | 'portfolio_anchors'
    | 'solid_large_growth_funds'
    | 'conservative_foreign_funds'
    | 'high_yield_bond'
    | 'top_mutual_funds'
    | 'undervalued_growth_stocks'
    | 'solid_midcap_growth_funds';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate options-enhanced income
const calculateOptionsEnhancedIncome = async (stock: YahooQuote, investmentAmount: number) => {
    try {
        // Get current stock price
        const quote = await yahooFinance.quote(stock.symbol) as YahooQuoteResponse;
        const currentPrice = quote.regularMarketPrice || 0;
        
        // Calculate base dividend income
        const shares = Math.floor(investmentAmount / currentPrice);
        const annualDividendIncome = shares * (quote.dividendRate || 0);
        
        // Get options data
        const callOptions = await getHighOpenInterestContracts(stock.symbol, 'call');
        const putOptions = await getHighOpenInterestContracts(stock.symbol, 'put');
        
        // Calculate covered call income (assuming monthly calls)
        const callStrike = Math.round(currentPrice * 1.05); // 5% OTM
        const callPremium = currentPrice * 0.02; // Assuming 2% monthly premium
        const monthlyCallIncome = shares * callPremium;
        const annualCallIncome = monthlyCallIncome * 12;
        
        // Calculate cash-secured put income (assuming monthly puts)
        const putStrike = Math.round(currentPrice * 0.95); // 5% OTM
        const putPremium = currentPrice * 0.015; // Assuming 1.5% monthly premium
        const monthlyPutIncome = shares * putPremium;
        const annualPutIncome = monthlyPutIncome * 12;
        
        // Calculate total options-enhanced income
        const totalAnnualIncome = annualDividendIncome + annualCallIncome + annualPutIncome;
        const effectiveYield = (totalAnnualIncome / investmentAmount) * 100;
        
        return {
            shares,
            annualDividendIncome,
            annualCallIncome,
            annualPutIncome,
            totalAnnualIncome,
            effectiveYield,
            monthlyIncome: totalAnnualIncome / 12,
            optionsStrategy: {
                callStrike,
                putStrike,
                monthlyCallPremium: callPremium,
                monthlyPutPremium: putPremium,
                callOptions: callOptions,
                putOptions: putOptions
            }
        };
    } catch (error) {
        console.error(`Error calculating options-enhanced income for ${stock.symbol}:`, error);
        return null;
    }
};

// Helper function to check if stock meets quality criteria
const meetsQualityCriteria = (stock: YahooQuote) => {
    // Must be a common stock (not a fund or ETF)
    if (stock.quoteType !== 'EQUITY') return false;
    
    // Must have a dividend yield
    if (!stock.dividendYield || stock.dividendYield <= 0) return false;
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false;
    
    // Must have a reasonable price (at least $5)
    if (!stock.regularMarketPrice || stock.regularMarketPrice < 5) return false;
    
    // Must have a reasonable P/E ratio (less than 50)
    if (stock.trailingPE && stock.trailingPE > 50) return false;
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false;
    
    // Must have a reasonable dividend yield (between 1% and 15%)
    if (stock.dividendYield < 1 || stock.dividendYield > 15) return false;
    
    // Must have a reasonable payout ratio (less than 100%)
    if (stock.payoutRatio && stock.payoutRatio > 100) return false;
    
    // Must have a reasonable beta (less than 2)
    if (stock.beta && stock.beta > 2) return false;
    
    // Must have a reasonable debt to equity ratio (less than 2)
    if (stock.debtToEquity && stock.debtToEquity > 2) return false;
    
    // Must have sufficient liquidity (average volume > 100,000)
    if (!stock.averageDailyVolume3Month || stock.averageDailyVolume3Month < 100000) return false;
    
    // Must have a reasonable dividend coverage ratio (at least 1.2)
    const dividendCoverage = stock.epsTrailingTwelveMonths / (stock.dividendRate || 0);
    if (dividendCoverage < 1.2) return false;
    
    // Must be trading within 20% of 52-week low
    if (stock.fiftyTwoWeekLow && stock.regularMarketPrice > stock.fiftyTwoWeekLow * 1.2) return false;
    
    return true;
};

// Helper function to calculate optimal number of stocks
const calculateOptimalStockCount = (investmentAmount: number, averageStockPrice = 50) => {
    // Base number of stocks based on investment amount
    let baseCount = Math.floor(investmentAmount / (averageStockPrice * 100));
    
    // Minimum 3 stocks for basic diversification
    baseCount = Math.max(3, baseCount);
    
    // Maximum 10 stocks to maintain meaningful positions
    baseCount = Math.min(10, baseCount);
    
    // Adjust based on investment size
    if (investmentAmount < 50000) {
        // Smaller portfolios: 3-5 stocks
        return Math.min(5, baseCount);
    } else if (investmentAmount < 100000) {
        // Medium portfolios: 4-7 stocks
        return Math.min(7, baseCount);
    } else {
        // Larger portfolios: 5-10 stocks
        return Math.min(10, baseCount);
    }
};

export async function POST(request: Request) {
    try {
        const { targetIncome } = await request.json();
        
        if (!targetIncome || targetIncome <= 0) {
            return NextResponse.json(
                { error: 'Please provide a valid target annual income' },
                { status: 400 }
            );
        }

        // Fetch dividend stocks from Yahoo Finance screeners
        const screeners: ScreenerType[] = [
            'undervalued_large_caps',
            'portfolio_anchors',
            'solid_large_growth_funds',
            'conservative_foreign_funds',
            'high_yield_bond',
            'top_mutual_funds',
            'undervalued_growth_stocks',
            'solid_midcap_growth_funds'
        ];

        const allStocks = new Map<string, YahooQuote>();

        // Fetch data from all screeners
        for (const screener of screeners) {
            try {
                const response = await yahooFinance.screener({
                    scrIds: screener,
                    count: 40,
                    region: "US",
                    lang: "en-US",
                }, {
                    validateResult: false,
                });

                // Process each stock from the screener
                response.quotes.forEach((stock: YahooQuote) => {
                    if (!allStocks.has(stock.symbol) && meetsQualityCriteria(stock)) {
                        allStocks.set(stock.symbol, stock);
                    }
                });
            } catch (error) {
                console.error(`Failed to fetch ${screener} screener:`, error);
            }
        }

        // Convert Map to array and calculate options-enhanced income for each stock
        const stocks = Array.from(allStocks.values());
        const stocksWithOptions = [];

        for (const stock of stocks) {
            const optionsAnalysis = await calculateOptionsEnhancedIncome(stock, targetIncome);
            if (optionsAnalysis) {
                stocksWithOptions.push({
                    ...stock,
                    optionsAnalysis
                });
            }
        }

        // Sort by effective yield
        const sortedStocks = stocksWithOptions
            .sort((a, b) => b.optionsAnalysis.effectiveYield - a.optionsAnalysis.effectiveYield);

        // Calculate optimal portfolio size
        const maxStocks = calculateOptimalStockCount(targetIncome);
        
        // Select top stocks for portfolio
        const portfolio = sortedStocks.slice(0, maxStocks);
        
        // Calculate portfolio metrics
        const totalInvestment = portfolio.reduce((sum, stock) => 
            sum + (stock.optionsAnalysis.shares * stock.regularMarketPrice), 0);
        
        const totalAnnualIncome = portfolio.reduce((sum, stock) => 
            sum + stock.optionsAnalysis.totalAnnualIncome, 0);
        
        const averageYield = (totalAnnualIncome / totalInvestment) * 100;
        
        // Group stocks by sector for diversification analysis
        const sectorBreakdown: Record<string, SectorBreakdown> = {};
        portfolio.forEach(stock => {
            const sector = stock.sector || 'Other';
            if (!sectorBreakdown[sector]) {
                sectorBreakdown[sector] = {
                    investment: 0,
                    income: 0,
                    weight: 0
                };
            }
            const investment = stock.optionsAnalysis.shares * stock.regularMarketPrice;
            sectorBreakdown[sector].investment += investment;
            sectorBreakdown[sector].income += stock.optionsAnalysis.totalAnnualIncome;
            sectorBreakdown[sector].weight += investment / totalInvestment;
        });

        return NextResponse.json({
            target_annual_income: targetIncome,
            total_stocks_analyzed: allStocks.size,
            portfolio_metrics: {
                total_investment: totalInvestment,
                total_annual_income: totalAnnualIncome,
                average_yield: averageYield,
                monthly_income: totalAnnualIncome / 12,
                optimal_stocks: maxStocks,
                diversification: {
                    sectors: Object.keys(sectorBreakdown).length,
                    stocks: portfolio.length,
                    sectorBreakdown: Object.entries(sectorBreakdown).map(([sector, data]) => ({
                        sector,
                        investment: data.investment,
                        income: data.income,
                        weight: data.weight
                    }))
                }
            },
            portfolio: portfolio.map(stock => ({
                symbol: stock.symbol,
                companyName: stock.longName,
                sector: stock.sector,
                industry: stock.industry,
                currentPrice: stock.regularMarketPrice,
                dividendYield: stock.dividendYield,
                dividendRate: stock.dividendRate,
                shares: stock.optionsAnalysis.shares,
                investmentAmount: stock.optionsAnalysis.shares * stock.regularMarketPrice,
                annualDividendIncome: stock.optionsAnalysis.annualDividendIncome,
                annualCallIncome: stock.optionsAnalysis.annualCallIncome,
                annualPutIncome: stock.optionsAnalysis.annualPutIncome,
                totalAnnualIncome: stock.optionsAnalysis.totalAnnualIncome,
                monthlyIncome: stock.optionsAnalysis.monthlyIncome,
                effectiveYield: stock.optionsAnalysis.effectiveYield,
                optionsStrategy: stock.optionsAnalysis.optionsStrategy,
                marketCap: stock.marketCap,
                trailingPE: stock.trailingPE,
                beta: stock.beta,
                dividendCoverage: stock.epsTrailingTwelveMonths / (stock.dividendRate || 0),
                priceToBook: stock.regularMarketPrice / (stock.bookValue || 0),
                currentRatio: stock.currentAssets / (stock.currentLiabilities || 0),
                dividendGrowthRate: stock.dividendGrowthRate || 0,
                fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                averageVolume: stock.averageDailyVolume3Month
            }))
        });
    } catch (error: any) {
        console.error('Error in options-enhanced API:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while analyzing options-enhanced portfolio' },
            { status: 500 }
        );
    }
}