import { DateTime } from 'luxon';

const ALPACA_NEWS_API_URL = process.env.ALPACA_NEWS_API_ENDPOINT;
const ALPACA_API_KEY = process.env.ALPACA_API_LIVE_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
    throw new Error('Alpaca API credentials are not configured');
}

export const fetchNewsForTicker = async (ticker: string) => {
    try {
        const today = DateTime.utc().toISODate();
        const threeDaysPrior = DateTime.utc().minus({ days: 3 }).toISODate();
        // console.log(`\nFetching stock news from ${threeDaysPrior} to ${today}\n`);
        const response = await fetch(`${ALPACA_NEWS_API_URL}?sort=desc&start=${threeDaysPrior}&end=${today}&symbols=${ticker}&exclude_contentless=true`, {
            method: 'GET',
            headers: {
                'Apca-Api-Key-Id': ALPACA_API_KEY,
                'Apca-Api-Secret-Key': ALPACA_API_SECRET,
            },
        });
        // console.log(`\nSTOCK NEWS response: ${JSON.stringify(response)}\n`);
        if (!response.ok) {
            console.error(`Error fetching stock news: ${response.status} ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        // console.log(`\nSTOCK NEWS data: ${JSON.stringify(data)}\n`);
        return data.news || [];
    } catch (error: any) {
        console.error(`Error fetching stock news: ${error.message}`);
        return [];
    }
};