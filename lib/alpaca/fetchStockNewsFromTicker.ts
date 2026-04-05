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

export const fetchNewsForTicker = async (ticker: string) => {
    try {
        const config = getAlpacaConfig();
        if (!config) {
            console.warn('Alpaca news config missing; returning empty ticker news payload');
            return [];
        }

        const today = DateTime.utc().toISODate();
        const threeDaysPrior = DateTime.utc().minus({ days: 3 }).toISODate();
        // console.log(`\nFetching stock news from ${threeDaysPrior} to ${today}\n`);
        const response = await fetch(`${config.apiUrl}?sort=desc&start=${threeDaysPrior}&end=${today}&symbols=${ticker}&exclude_contentless=true`, {
            method: 'GET',
            headers: {
                'Apca-Api-Key-Id': config.apiKey,
                'Apca-Api-Secret-Key': config.apiSecret,
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