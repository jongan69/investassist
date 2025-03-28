import { getHighOpenInterestContracts } from '@/lib/alpaca/fetchHighOpenInterest';
import { Stock, Contract, Recommendation } from '@/types/alpaca';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate stock score
const calculateStockScore = (stock: Stock) => {
  let score = 0;
  
  // Price change percentage (weighted)
  if (stock.regularMarketChangePercent) {
      score += stock.regularMarketChangePercent * 0.3;
  }
  
  // Volume (weighted)
  if (stock.regularMarketVolume) {
      const volumeScore = Math.min(stock.regularMarketVolume / 1000000, 10); // Normalize volume
      score += volumeScore * 0.2;
  }
  
  // Market cap (weighted)
  if (stock.marketCap) {
      const marketCapScore = Math.min(stock.marketCap / 1000000000, 10); // Normalize market cap
      score += marketCapScore * 0.2;
  }
  
  // Price to book ratio (weighted)
  if (stock.priceToBook) {
      const pbScore = Math.max(0, 10 - stock.priceToBook); // Lower P/B is better
      score += pbScore * 0.15;
  }
  
  // 52-week high proximity (weighted)
  if (stock.fiftyTwoWeekHigh && stock.regularMarketPrice) {
      const highProximity = (stock.regularMarketPrice / stock.fiftyTwoWeekHigh) * 10;
      score += highProximity * 0.15;
  }
  
  return score;
};

// Helper function to calculate option entry and exit prices
const calculateOptionPrices = (stock: Stock, contract: Contract) => {
  if (!contract) {
      console.warn(`Missing contract data for ${stock.symbol}`);
      return null;
  }

  try {
      // Log the incoming stock data
      console.info(`Processing stock data for ${stock.symbol}:`, {
          regularMarketPrice: stock.regularMarketPrice,
          marketPrice: stock.marketPrice,
          price: stock.price,
          regularMarketChange: stock.regularMarketPreviousClose,
          regularMarketChangePercent: stock.regularMarketChangePercent
      });

      // Get current stock price from various possible fields
      const currentPrice = parseFloat(
          String(stock.regularMarketPrice || '') || 
          String(stock.marketPrice || '') || 
          String(stock.price || '') || 
          String((stock.regularMarketChange || 0) + (stock.regularMarketPreviousClose || 0))
      );

      if (isNaN(currentPrice)) {
          console.warn(`Could not determine current price for ${stock.symbol}`);
          return null;
      }

      // Log the contract data
    //   console.info(`Processing contract data for ${stock.symbol}:`, {
    //       strike_price: contract.strike_price,
    //       ask_price: contract.ask_price,
    //       last_price: contract.last_price,
    //       bid_price: contract.bid_price,
    //       implied_volatility: contract.implied_volatility,
    //       type: contract.type,
    //       expiration_date: contract.expiration_date,
    //       open_interest: contract.open_interest
    //   });

      // Safely parse contract values
      const strikePrice = parseFloat(String(contract.strike_price));
      const optionPrice = parseFloat(String(contract.ask_price || contract.last_price || contract.bid_price || ''));
      const impliedVolatility = parseFloat(String(contract.implied_volatility || ''));

      // Log parsed values
    //   console.info(`Parsed values for ${stock.symbol}:`, {
    //       currentPrice,
    //       strikePrice,
    //       optionPrice,
    //       impliedVolatility
    //   });

      // Validate required values
      if (isNaN(strikePrice) || isNaN(optionPrice)) {
        //   console.warn(`Missing required contract data for ${stock.symbol}:`, {
        //       strikePrice,
        //       optionPrice,
        //       contract: {
        //           strike_price: contract.strike_price,
        //           ask_price: contract.ask_price,
        //           last_price: contract.last_price,
        //           bid_price: contract.bid_price
        //       }
        //   });
          return null;
      }

      // Calculate entry and exit prices based on various factors
      const entryPrice = optionPrice;
      const exitPrice = {
          takeProfit: entryPrice * 1.5, // 50% profit target
          stopLoss: entryPrice * 0.7,   // 30% loss limit
          breakEven: entryPrice         // Break-even point
      };

      // Calculate additional metrics
      const daysToExpiration = DateTime.fromISO(contract.expiration_date)
          .diff(DateTime.now(), 'days').days;
      
      const timeValue = optionPrice - Math.max(0, currentPrice - strikePrice);
      const intrinsicValue = Math.max(0, currentPrice - strikePrice);

      // Calculate moneyness (how far in/out of the money the option is)
      const moneyness = contract.type === 'call' 
          ? (currentPrice - strikePrice) / strikePrice
          : (strikePrice - currentPrice) / strikePrice;

      // Calculate profitability metrics
      const profitMetrics = {
          // Risk/Reward ratio
          riskRewardRatio: (exitPrice.takeProfit - entryPrice) / (entryPrice - exitPrice.stopLoss),
          
          // Break-even price
          breakEvenPrice: contract.type === 'call' 
              ? strikePrice + entryPrice 
              : strikePrice - entryPrice,
          
          // Distance to break-even
          distanceToBreakEven: Math.abs(currentPrice - (contract.type === 'call' 
              ? strikePrice + entryPrice 
              : strikePrice - entryPrice)),
          
          // Percentage distance to break-even
          breakEvenDistancePercent: Math.abs(currentPrice - (contract.type === 'call' 
              ? strikePrice + entryPrice 
              : strikePrice - entryPrice)) / currentPrice * 100,
          
          // Days to break-even (based on current price movement)
          daysToBreakEven: Math.abs(currentPrice - (contract.type === 'call' 
              ? strikePrice + entryPrice 
              : strikePrice - entryPrice)) / (Math.abs(stock.regularMarketChangePercent || 0) / 100) || 0,
          
          // Probability of profit (based on moneyness and time)
          probabilityOfProfit: Math.max(0, Math.min(100, 
              ((contract.type === 'call' ? moneyness : -moneyness) * 0.5 + 
              (daysToExpiration / 365) * 0.3) * 100
          )),
          
          // Risk level (1-5, where 1 is lowest risk)
          riskLevel: Math.min(5, Math.max(1, 
              (Math.abs(moneyness) * 2) + // Higher risk for OTM options
              (1 - (daysToExpiration / 365)) * 2 + // Higher risk for shorter time
              (Math.abs(stock.regularMarketChangePercent || 0) / 10) // Higher risk for volatile stocks
          )),

          // Position sizing and P/L simulation
          positionSizing: {
              // Account details
              accountDetails: {
                  totalPortfolio: 1200,
                  liquidCash: 200,
                  maxRiskPerTrade: 0.01, // 1% risk per trade
                  maxPositionSize: 0.2, // 20% of portfolio
                  maxLiquidityUsage: 0.8 // 80% of liquid cash
              },

              // Position size calculations
              calculations: {
                  // Maximum risk amount (1% of portfolio)
                  maxRiskAmount: 1200 * 0.01,
                  
                  // Maximum position size based on portfolio (20%)
                  maxPortfolioPosition: 1200 * 0.2,
                  
                  // Maximum position size based on liquid cash (80%)
                  maxLiquidPosition: 200 * 0.8,
                  
                  // Maximum contracts based on risk
                  maxContractsByRisk: Math.floor((1200 * 0.01) / (entryPrice * 100)),
                  
                  // Maximum contracts based on portfolio
                  maxContractsByPortfolio: Math.floor((1200 * 0.2) / (entryPrice * 100)),
                  
                  // Maximum contracts based on liquidity
                  maxContractsByLiquidity: Math.floor((200 * 0.8) / (entryPrice * 100)),
                  
                  // Maximum contracts based on open interest (20% of OI)
                  maxContractsByOI: Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
              },

              // Recommended position size (minimum of all maximums)
              recommendedContractSize: Math.min(
                  Math.floor((1200 * 0.01) / (entryPrice * 100)), // Risk-based
                  Math.floor((1200 * 0.2) / (entryPrice * 100)),  // Portfolio-based
                  Math.floor((200 * 0.8) / (entryPrice * 100)),   // Liquidity-based
                  Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100) // OI-based
              ),

              // Position cost breakdown
              costBreakdown: {
                  // Cost per contract
                  costPerContract: entryPrice * 100,
                  
                  // Total position cost
                  totalPositionCost: Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * entryPrice * 100,
                  
                  // Percentage of portfolio used
                  portfolioPercentage: (Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * entryPrice * 100) / 1200 * 100,
                  
                  // Percentage of liquid cash used
                  liquidCashPercentage: (Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * entryPrice * 100) / 200 * 100
              }
          },

          // Profit/Loss simulation
          profitLossSimulation: {
              // Entry cost for recommended position
              entryCost: Math.min(
                  Math.floor((1200 * 0.01) / (entryPrice * 100)),
                  Math.floor((1200 * 0.2) / (entryPrice * 100)),
                  Math.floor((200 * 0.8) / (entryPrice * 100)),
                  Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
              ) * entryPrice * 100,
              
              // Maximum profit (50% target)
              maxProfit: Math.min(
                  Math.floor((1200 * 0.01) / (entryPrice * 100)),
                  Math.floor((1200 * 0.2) / (entryPrice * 100)),
                  Math.floor((200 * 0.8) / (entryPrice * 100)),
                  Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
              ) * (exitPrice.takeProfit - entryPrice) * 100,
              
              // Maximum loss (30% stop loss)
              maxLoss: Math.min(
                  Math.floor((1200 * 0.01) / (entryPrice * 100)),
                  Math.floor((1200 * 0.2) / (entryPrice * 100)),
                  Math.floor((200 * 0.8) / (entryPrice * 100)),
                  Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
              ) * (entryPrice - exitPrice.stopLoss) * 100,
              
              // Break-even point
              breakEvenCost: Math.min(
                  Math.floor((1200 * 0.01) / (entryPrice * 100)),
                  Math.floor((1200 * 0.2) / (entryPrice * 100)),
                  Math.floor((200 * 0.8) / (entryPrice * 100)),
                  Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
              ) * entryPrice * 100,
              
              // Risk-adjusted return (max profit / max loss)
              riskAdjustedReturn: ((exitPrice.takeProfit - entryPrice) / (entryPrice - exitPrice.stopLoss)) * 100,
              
              // Daily theta decay (approximate)
              dailyThetaDecay: (timeValue / daysToExpiration) * 100,
              
              // Position value at different price points
              pricePoints: {
                  current: Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * entryPrice * 100,
                  takeProfit: Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * exitPrice.takeProfit * 100,
                  stopLoss: Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * exitPrice.stopLoss * 100,
                  breakEven: Math.min(
                      Math.floor((1200 * 0.01) / (entryPrice * 100)),
                      Math.floor((1200 * 0.2) / (entryPrice * 100)),
                      Math.floor((200 * 0.8) / (entryPrice * 100)),
                      Math.floor((parseInt(String(contract.open_interest || '0')) * 0.2) / 100)
                  ) * entryPrice * 100
              }
          }
      };

      // Calculate option metrics
      const optionMetrics = {
          entryPrice,
          exitPrice,
          strikePrice,
          impliedVolatility,
          currentStockPrice: currentPrice,
          optionType: contract.type,
          expirationDate: contract.expiration_date,
          daysToExpiration,
          timeValue,
          intrinsicValue,
          openInterest: parseInt(String(contract.open_interest || '0')),
          volume: parseInt(String(contract.volume || '0')),
          delta: parseFloat(String(contract.delta || '0')),
          gamma: parseFloat(String(contract.gamma || '0')),
          theta: parseFloat(String(contract.theta || '0')),
          vega: parseFloat(String(contract.vega || '0')),
          moneyness,
          // Add profitability metrics
          profitMetrics,
          // Add additional useful metrics
          optionSymbol: contract.symbol,
          exerciseStyle: contract.exercise_style,
          tradingStatus: contract.trading_status,
          lastTradeDate: contract.last_trade_date,
          lastPrice: contract.last_price,
          bidPrice: contract.bid_price,
          askPrice: contract.ask_price,
          underlyingSymbol: contract.underlying_symbol
      };

      // Log successful calculation
    //   console.info(`Successfully calculated option prices for ${stock.symbol}:`, {
    //       strikePrice,
    //       optionPrice,
    //       impliedVolatility,
    //       moneyness,
    //       daysToExpiration,
    //       timeValue,
    //       intrinsicValue,
    //       profitMetrics
    //   });

      return optionMetrics;
  } catch (error) {
      const err = error as Error;
      console.error(`Error calculating option prices for ${stock.symbol}:`, {
          error: err.message,
          stack: err.stack,
          stock: {
              symbol: stock.symbol,
              regularMarketPrice: stock.regularMarketPrice,
              marketPrice: stock.marketPrice,
              price: stock.price
          },
          contract: {
              strike_price: contract.strike_price,
              ask_price: contract.ask_price,
              last_price: contract.last_price,
              bid_price: contract.bid_price
          }
      });
      return null;
  }
};

const ITEMS_PER_PAGE = 40;

// Define screener types to analyze
const SCREENER_TYPES = [
  // Momentum and Volume Screeners
  'day_gainers',              // Stocks with highest percentage gains
  'day_losers',               // Stocks with highest percentage losses (potential bounce candidates)
  'most_actives',             // Stocks with highest trading volume
  'small_cap_gainers',        // Small cap stocks showing strong momentum
  
  // Growth and Technology Screeners
  'growth_technology_stocks', // High-growth tech companies
  'solid_large_growth_funds', // Established growth companies
  'solid_midcap_growth_funds', // Mid-sized growth companies
  
  // Value Screeners
  'undervalued_growth_stocks', // Growth stocks trading below their potential
  'undervalued_large_caps',    // Large cap stocks trading at attractive valuations
  
  // Risk and Opportunity Screeners
  'most_shorted_stocks',      // Highly shorted stocks (potential short squeeze candidates)
  'aggressive_small_caps',     // High-risk, high-reward small cap stocks
  
  // Fund and Portfolio Screeners
  'top_mutual_funds',         // Best performing mutual funds
  'portfolio_anchors',        // Stable, reliable investments
  'conservative_foreign_funds', // International conservative investments
  'high_yield_bond'           // High-yield fixed income opportunities
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '5';
    const allStocks = new Map();

    // First, get the lucrative stocks
    for (const screener of SCREENER_TYPES) {
        try {
            const response = await yahooFinance.screener({
                scrIds: screener as "day_gainers" | "day_losers" | "most_actives" | "small_cap_gainers" | "growth_technology_stocks" | "solid_large_growth_funds" | "solid_midcap_growth_funds" | "undervalued_growth_stocks" | "undervalued_large_caps" | "most_shorted_stocks" | "aggressive_small_caps" | "top_mutual_funds" | "portfolio_anchors" | "conservative_foreign_funds" | "high_yield_bond",
                count: ITEMS_PER_PAGE,
                region: "US",
                lang: "en-US",
            }, {
                validateResult: false,
            });

            response.quotes.forEach((stock: Stock) => {
                if (!allStocks.has(stock.symbol)) {
                    const stockWithScore = {
                        ...stock,
                        score: calculateStockScore(stock),
                        screener: screener
                    };
                    allStocks.set(stock.symbol, stockWithScore);
                }
            });
        } catch (error) {
            console.error(`Failed to fetch ${screener} screener:`, error);
        }
    }

    // Sort stocks by score and get top performers
    const topStocks = Array.from(allStocks.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, parseInt(limit));

    // Get options data for each stock with rate limiting
    const optionsRecommendations = [];
    for (const stock of topStocks) {
        try {
            console.info(`Processing options for ${stock.symbol}`);
            
            const callOptions = await getHighOpenInterestContracts(stock.symbol, 'call');
            // console.info(`Raw call options data for ${stock.symbol}:`, {
            //     shortTerm: callOptions.shortTerm,
            //     leap: callOptions.leap
            // });
            await delay(100);
            const putOptions = await getHighOpenInterestContracts(stock.symbol, 'put');
            // console.info(`Raw put options data for ${stock.symbol}:`, {
            //     shortTerm: putOptions.shortTerm,
            //     leap: putOptions.leap
            // });

            // console.info(`Processing options for ${stock.symbol}:`, {
            //     hasShortTermCall: !!callOptions.shortTerm,
            //     hasLeapCall: !!callOptions.leap,
            //     hasShortTermPut: !!putOptions.shortTerm,
            //     hasLeapPut: !!putOptions.leap
            // });

            const callPrices = calculateOptionPrices(stock, callOptions.shortTerm);
            const leapCallPrices = calculateOptionPrices(stock, callOptions.leap);
            const putPrices = calculateOptionPrices(stock, putOptions.shortTerm);
            const leapPutPrices = calculateOptionPrices(stock, putOptions.leap);

            const recommendation: Recommendation = {
                symbol: stock.symbol,
                companyName: stock.longName,
                stockScore: stock.score,
                screener: stock.screener,
                currentPrice: stock.regularMarketPrice,
                options: {
                    shortTermCalls: callPrices,
                    leapCalls: leapCallPrices,
                    shortTermPuts: putPrices,
                    leapPuts: leapPutPrices
                },
                optionsAvailable: {
                    shortTermCalls: !!callPrices,
                    leapCalls: !!leapCallPrices,
                    shortTermPuts: !!putPrices,
                    leapPuts: !!leapPutPrices
                }
            };

            optionsRecommendations.push(recommendation);
        } catch (error: any) {
            console.error(`Failed to process options for ${stock.symbol}: ${error.message}`);
            // Continue with next stock even if one fails
            continue;
        }
    }

    return NextResponse.json({
        total_stocks_analyzed: allStocks.size,
        recommendations: optionsRecommendations
    });
  } catch (error) {
    console.error('Error retrieving options:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve options' },
      { status: 500 }
    );
  }
} 