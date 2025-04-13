// api/get-high-oi-options?ticker=AAPL&optionType=call
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest";
import { NextResponse } from "next/server";
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
    fairMarketValue?: number;
    // Add missing fields for better FMV calculation
    revenueGrowth: number;
    operatingMargin: number;
    returnOnEquity: number;
    freeCashflow: number;
    totalCash: number;
    totalDebt: number;
    enterpriseValue: number;
    forwardPE: number;
    pegRatio: number;
    priceToSales: number;
    revenue: number;
    grossProfit: number;
    operatingIncome: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    shortTermDebt: number;
    longTermDebt: number;
    cashPerShare: number;
    revenuePerShare: number;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
    priceToBook: number;
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

// Helper function to calculate fair market value
async function calculateFairMarketValue(stock: YahooQuote): Promise<number> {
    console.log('Calculating FMV for', stock.symbol + ':');
    console.log('Input data:', {
        price: stock.regularMarketPrice,
        eps: stock.epsTrailingTwelveMonths,
        pe: stock.trailingPE,
        bookValue: stock.bookValue,
        dividendRate: stock.dividendRate,
        forwardPE: stock.forwardPE,
        priceToBook: stock.priceToBook,
        marketCap: stock.marketCap,
        fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
        fiftyDayAverage: stock.fiftyDayAverage,
        twoHundredDayAverage: stock.twoHundredDayAverage
    });

    try {
        // Get insights data from Yahoo Finance
        const insights = await yahooFinance.insights(stock.symbol, {
            lang: 'en-US',
            reportsCount: 2,
            region: 'US'
        });

        console.log('Insights data:', JSON.stringify(insights, null, 2));

        // Use Trading Central's valuation data if available
        const valuation = insights.instrumentInfo?.valuation;
        if (valuation?.discount && typeof valuation.discount === 'string') {
            const currentPrice = stock.regularMarketPrice;
            const discountStr = valuation.discount.replace('%', '');
            const discountValue = parseFloat(discountStr) / 100;
            
            // Calculate FMV based on the discount, but apply additional conservatism
            const fmv = (currentPrice / (1 - discountValue)) * 0.85; // Apply 15% additional discount
            console.log('FMV from Trading Central:', fmv, {
                currentPrice,
                discountValue,
                description: valuation.description,
                additionalDiscount: 0.85
            });
            return fmv;
        }

        // Fallback to our original calculation if insights data is not available
        const methods: { value: number; weight: number }[] = [];

        // 1. PE-based valuation (using both trailing and forward PE)
        if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths > 0) {
            const industryPE = 10; // More conservative industry average
            const peValue = stock.epsTrailingTwelveMonths * industryPE;
            console.log('PE-based value:', peValue, {
                eps: stock.epsTrailingTwelveMonths,
                industryPE,
                growthAdj: 1,
                riskAdj: 1
            });
            methods.push({ value: peValue, weight: 0.3 });
        }

        // 2. Asset-based valuation (using book value and price-to-book)
        if (stock.bookValue && stock.bookValue > 0) {
            const pbRatio = 0.8; // More conservative P/B ratio
            const assetValue = stock.bookValue * pbRatio;
            console.log('Asset-based value:', assetValue, {
                bookValue: stock.bookValue,
                pbRatio,
                debtToEquityAdj: 1
            });
            methods.push({ value: assetValue, weight: 0.3 });
        }

        // 3. Income-based valuation (using dividend rate)
        if (stock.dividendRate && stock.dividendRate > 0) {
            const requiredReturn = 0.15; // Higher required return (15%)
            const growthRate = 0.01; // Lower growth rate (1%)
            const sustainableDividend = stock.dividendRate * 0.6; // More conservative (60% of current dividend)
            const incomeValue = sustainableDividend / (requiredReturn - growthRate);
            console.log('Income-based value:', incomeValue, {
                sustainableDividend,
                requiredReturn,
                growthRate,
                profitabilityAdj: 1
            });
            methods.push({ value: incomeValue, weight: 0.2 });
        }

        // 4. Technical analysis based valuation (using moving averages)
        if (stock.fiftyDayAverage && stock.twoHundredDayAverage) {
            const technicalValue = Math.min(stock.fiftyDayAverage, stock.twoHundredDayAverage) * 0.9; // 10% discount
            console.log('Technical value:', technicalValue, {
                fiftyDayAvg: stock.fiftyDayAverage,
                twoHundredDayAvg: stock.twoHundredDayAverage,
                discount: 0.9
            });
            methods.push({ value: technicalValue, weight: 0.1 });
        }

        // 5. Price range based valuation (using 52-week range)
        if (stock.fiftyTwoWeekHigh && stock.fiftyTwoWeekLow) {
            const rangeValue = stock.fiftyTwoWeekLow * 1.05; // Use low + 5% as conservative estimate
            console.log('Range-based value:', rangeValue, {
                fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                adjustment: 1.05
            });
            methods.push({ value: rangeValue, weight: 0.1 });
        }

        // Filter out any invalid methods and adjust weights
        const validMethods = methods.filter(m => !isNaN(m.value) && isFinite(m.value));
        console.log('Valid methods:', validMethods?.map(m => m.value));

        if (validMethods.length === 0) {
            console.log('No valid methods available for FMV calculation');
            return 0;
        }

        // Calculate weighted average
        const totalWeight = validMethods.reduce((sum, m) => sum + m.weight, 0);
        const weightedSum = validMethods.reduce((sum, m) => sum + (m.value * m.weight), 0);
        const weightedAverage = weightedSum / totalWeight;

        console.log('Weighted average FMV:', weightedAverage, {
            weightedSum,
            totalWeight,
            weights: validMethods?.map(m => m.weight)
        });

        // Apply final market adjustment (20% discount for conservative estimate)
        const finalFMV = weightedAverage * 0.8;
        console.log('Final FMV:', finalFMV, { marketAdjustment: 0.8 });

        return finalFMV;
    } catch (error) {
        console.error(`Error getting insights for ${stock.symbol}:`, error);
        return 0;
    }
}

// Helper function to check if stock meets quality criteria
const meetsQualityCriteria = async (stock: YahooQuote) => {
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

    // Calculate and check FMV
    const fmv = await calculateFairMarketValue(stock);
    if (fmv <= 0) return false;
    
    // Current price must be below FMV
    if (stock.regularMarketPrice >= fmv) return false;
    
    // Store FMV in the stock object
    stock.fairMarketValue = fmv;
    
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
                console.log(`\nFetching data from screener: ${screener}`);
                const response = await yahooFinance.screener({
                    scrIds: screener,
                    count: 40,
                    region: "US",
                    lang: "en-US",
                }, {
                    validateResult: false,
                });

                // Log raw data for first stock in each screener
                if (response.quotes.length > 0) {
                    console.log(`\nSample stock data from ${screener}:`);
                    console.log(JSON.stringify(response.quotes[0], null, 2));
                }

                // Process each stock from the screener
                for (const stock of response.quotes) {
                    if (!allStocks.has(stock.symbol) && await meetsQualityCriteria(stock)) {
                        allStocks.set(stock.symbol, stock);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch ${screener} screener:`, error);
            }
        }

        console.log(`\nTotal unique stocks found: ${allStocks.size}`);
        console.log('Sample of processed stock data:');
        const sampleStock = Array.from(allStocks.values())[0];
        if (sampleStock) {
            console.log(JSON.stringify(sampleStock, null, 2));
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
                    sectorBreakdown: Object.entries(sectorBreakdown)?.map(([sector, data]) => ({
                        sector,
                        investment: data.investment,
                        income: data.income,
                        weight: data.weight
                    }))
                }
            },
            portfolio: portfolio?.map(stock => ({
                symbol: stock.symbol,
                companyName: stock.longName,
                sector: stock.sector,
                industry: stock.industry,
                currentPrice: stock.regularMarketPrice,
                fairMarketValue: stock.fairMarketValue,
                priceToFairValue: stock.regularMarketPrice / (stock.fairMarketValue || 1),
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
                currentRatio: stock.currentAssets && stock.currentLiabilities ? 
                    stock.currentAssets / stock.currentLiabilities : 
                    undefined,
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