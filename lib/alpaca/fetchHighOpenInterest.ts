import { DateTime } from 'luxon';

const ALPACA_API_KEY = process.env.ALPACA_API_LIVE_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    throw new Error('Alpaca API credentials are not configured');
}

// Fetch high open-interest contracts
export const getHighOpenInterestContracts = async (ticker: string, optionType = 'call') => {
    try {
        const shortTermExpiration = {
            start: DateTime.utc().plus({ days: 1 }).toISODate(),
            end: DateTime.utc().plus({ days: 60 }).toISODate(),
        };

        const leapExpiration = {
            start: DateTime.utc().plus({ days: 365 }).toISODate(),
            end: DateTime.utc().plus({ days: 730 }).toISODate(),
        };

        const fetchContracts = async (expiration: any) => {
            const url = `https://api.alpaca.markets/v2/options/contracts?` +
                `underlying_symbol=${ticker}` +
                `&status=active` +
                `&expiration_date_gte=${expiration.start}` +
                `&expiration_date_lte=${expiration.end}` +
                `&type=${optionType}` +
                `&limit=100`;
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
                    return {
                        error: `Invalid ticker symbol: ${ticker}`
                    };
                }
                console.error(`Error fetching contracts: ${response.status} ${response.statusText}`);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.option_contracts.sort((a: any, b: any) => b.open_interest - a.open_interest)[0];
        };

        const shortTermContract = await fetchContracts(shortTermExpiration);
        const leapContract = await fetchContracts(leapExpiration);

        return {
            shortTerm: shortTermContract,
            leap: leapContract,
            error: null
        };
    } catch (error: any) {
        console.error(`Error fetching high open-interest contracts for ${ticker}: ${error.message}`);
        return {
            shortTerm: null,
            leap: null,
            error: error.message
        };
    }
};