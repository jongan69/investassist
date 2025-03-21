import { OptionPrices, OptionContract } from '@/types/alpaca';
import { DateTime } from 'luxon';

const ALPACA_API_KEY = process.env.ALPACA_API_LIVE_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    throw new Error('Alpaca API credentials are not configured');
}

// Helper function to fetch current option prices
export const getOptionPrices = async (contract: { symbol: string }): Promise<OptionPrices | null> => {
    try {
        const url = `https://api.alpaca.markets/v2/options/contracts/${contract.symbol}`;
        
        console.info(`Fetching current prices for option ${contract.symbol}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Apca-Api-Key-Id': ALPACA_API_KEY,
                'Apca-Api-Secret-Key': ALPACA_API_SECRET,
            },
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`Rate limit hit for option prices, waiting before retry`);
                return getOptionPrices(contract);
            }
            console.error(`Error fetching option prices: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        
        // Log the raw response data for debugging
        // console.info(`Raw option price data for ${contract.symbol}:`, data);

        // Check if we have valid price data
        if (!data.close_price) {
            console.warn(`No close price found for option ${contract.symbol}`);
            return null;
        }

        // Log the processed price data
        // console.info(`Successfully fetched prices for option ${contract.symbol}:`, {
        //     close_price: data.close_price,
        //     close_price_date: data.close_price_date,
        //     open_interest: data.open_interest,
        //     open_interest_date: data.open_interest_date
        // });

        // Return the price data in the format expected by calculateOptionPrices
        return {
            ask_price: data.close_price,
            bid_price: data.close_price,
            last_price: data.close_price,
            implied_volatility: 0, // We don't have IV in the response
            open_interest: data.open_interest,
            open_interest_date: data.open_interest_date,
            close_price_date: data.close_price_date
        };
    } catch (error) {
        console.error(`Error fetching option prices: ${(error as Error).message}`, {
            error: (error as Error).stack,
            contract: contract.symbol
        });
        return null;
    }
};

// Fetch high open-interest contracts
export const getHighOpenInterestContracts = async (ticker: String, optionType = 'call') => {
    try {
        const shortTermExpiration = {
            start: DateTime.utc().plus({ days: 1 }).toISODate(),
            end: DateTime.utc().plus({ days: 60 }).toISODate(),
        };

        const leapExpiration = {
            start: DateTime.utc().plus({ days: 365 }).toISODate(),
            end: DateTime.utc().plus({ days: 730 }).toISODate(),
        };

        const fetchContracts = async (expiration: { start: string, end: string }) => {
            const url = `https://api.alpaca.markets/v2/options/contracts?` +
                `underlying_symbol=${ticker}` +
                `&status=active` +
                `&expiration_date_gte=${expiration.start}` +
                `&expiration_date_lte=${expiration.end}` +
                `&type=${optionType}` +
                `&limit=100`;

            // console.info(`Fetching ${optionType} options for ${ticker} with expiration range ${expiration.start} to ${expiration.end}`);

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Apca-Api-Key-Id': ALPACA_API_KEY,
                        'Apca-Api-Secret-Key': ALPACA_API_SECRET,
                    },
                });

                if (!response.ok) {
                    if (response.status === 422) {
                        console.error(`Invalid ticker symbol: ${ticker}`);
                        return null;
                    }
                    if (response.status === 429) {
                        console.warn(`Rate limit hit for ${ticker}, waiting before retry`);
                        return fetchContracts(expiration);
                    }
                    console.error(`Error fetching contracts for ${ticker}: ${response.status} ${response.statusText}`);
                    return null;
                }

                const data = await response.json();
                
                if (!data.option_contracts || data.option_contracts.length === 0) {
                    console.warn(`No ${optionType} contracts found for ${ticker}`);
                    return null;
                }

                // Sort by open interest and get the highest one
                const sortedContracts = data.option_contracts.sort((a: OptionContract, b: OptionContract) => b.open_interest - a.open_interest);
                const bestContract = sortedContracts[0];

                // console.info(`Found best ${optionType} contract for ${ticker}: Strike ${bestContract.strike_price}, Expiration ${bestContract.expiration_date}, OI ${bestContract.open_interest}`);
                
                // Fetch current prices for the contract
                const prices = await getOptionPrices(bestContract);
                if (prices) {
                    // Merge the price data with the contract data
                    Object.assign(bestContract, prices);
                    // console.info(`Updated contract with price data:`, {
                    //     symbol: bestContract.symbol,
                    //     ask_price: bestContract.ask_price,
                    //     bid_price: bestContract.bid_price,
                    //     last_price: bestContract.last_price,
                    //     implied_volatility: bestContract.implied_volatility
                    // });
                } else {
                    console.warn(`Failed to get price data for contract ${bestContract.symbol}`);
                }
                
                return bestContract;
            } catch (error) {
                console.error(`Network error fetching contracts for ${ticker}: ${(error as Error).message}`);
                return null;
            }
        };

        const shortTermContract = await fetchContracts(shortTermExpiration);
        const leapContract = await fetchContracts(leapExpiration);

        return {
            shortTerm: shortTermContract,
            leap: leapContract,
            error: null
        };
    } catch (error) {
        console.error(`Error fetching high open-interest contracts for ${ticker}: ${(error as Error).message}`);
        return {
            shortTerm: null,
            leap: null,
            error: (error as Error).message
        };
    }
};