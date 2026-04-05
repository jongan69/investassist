import { DateTime } from 'luxon';

const getAlpacaConfig = () => {
    const apiUrl = process.env.ALPACA_NEWS_API_ENDPOINT;
    const apiKey = process.env.ALPACA_API_LIVE_KEY;
    const apiSecret = process.env.ALPACA_API_SECRET;

    if (!apiUrl || !apiKey || !apiSecret) {
        return null;
    }

    return { apiUrl, apiKey, apiSecret };
};

// Fetch stock news
export const fetchStockNews = async () => {
    try {
        const config = getAlpacaConfig();
        if (!config) {
            console.warn('Alpaca news config missing; returning empty news payload');
            return [];
        }

        const today = DateTime.utc().toISODate();
        const fiveDaysPrior = DateTime.utc().minus({ days: 5 }).toISODate();
        // console.log(`\nFetching stock news from ${fiveDaysPrior} to ${today}\n`);
        const response = await fetch(`${config.apiUrl}?sort=desc&start=${fiveDaysPrior}&end=${today}&exclude_contentless=true`, {
            method: 'GET',
            headers: {
                'Apca-Api-Key-Id': config.apiKey,
                'Apca-Api-Secret-Key': config.apiSecret,
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