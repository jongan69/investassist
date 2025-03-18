import { DateTime } from 'luxon';

const ALPACA_NEWS_API_URL = process.env.ALPACA_NEWS_API_ENDPOINT;
const ALPACA_API_KEY = process.env.ALPACA_API_LIVE_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    throw new Error('Alpaca API credentials are not configured');
}

// Fetch stock news
export const fetchStockNews = async () => {
    try {
        const today = DateTime.utc().toISODate();
        const fiveDaysPrior = DateTime.utc().minus({ days: 5 }).toISODate();
        // console.log(`\nFetching stock news from ${fiveDaysPrior} to ${today}\n`);
        const response = await fetch(`${ALPACA_NEWS_API_URL}?sort=desc&start=${fiveDaysPrior}&end=${today}&exclude_contentless=true`, {
            method: 'GET',
            headers: {
                'Apca-Api-Key-Id': ALPACA_API_KEY,
                'Apca-Api-Secret-Key': ALPACA_API_SECRET,
            },
        });
        if (!response.ok) {
            console.error(`Error fetching stock news: ${response.status} ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        return data.news || [];
    } catch (error: any) {
        console.error(`Error fetching stock news: ${error.message}`);
        return [];
    }
};