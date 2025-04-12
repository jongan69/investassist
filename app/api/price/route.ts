// route.ts

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
    request: Request
) {
    try {
        const { outputMint } = await request.json();
        console.log(`Fetching price for token: ${outputMint}`);
        
        const url = `https://api.jup.ag/price/v2?ids=${outputMint}&showExtraInfo=true`;
        // console.log(`Fetching price from: ${url}`);
        const response = await fetch(url, { 
            cache: 'no-store',
            next: { revalidate: 0 }
        });
        
        if (!response.ok) {
            console.error(`Jupiter API error: ${response.status}`);
            throw new Error(`Jupiter API error: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log('Jupiter API response:', data);

        if (!data.data || !data.data[outputMint]) {
            console.error('Token price data not found in response');
            throw new Error('Token price data not found');
        }

        const tokenData = data.data[outputMint];
        const price = parseFloat(tokenData.price);
        
        if (isNaN(price)) {
            console.error('Invalid price data received');
            throw new Error('Invalid price data');
        }
        
        const result = { 
            price,
            uiFormatted: `$${price.toFixed(6)}`,
            confidenceLevel: tokenData.extraInfo?.confidenceLevel,
            lastTraded: {
                buy: tokenData.extraInfo?.lastSwappedPrice?.lastJupiterBuyPrice,
                sell: tokenData.extraInfo?.lastSwappedPrice?.lastJupiterSellPrice
            }
        };
        
        // console.log('Price data processed:', result);
        return Response.json(result);
    } catch (error: unknown) {
        console.error(`Error in price API: ${error}`);
        return Response.json({ 
            error: error instanceof Error ? error.message : 'Failed to load price data',
            price: 0,
            uiFormatted: '$0.000000',
            confidenceLevel: 'low'
        });
    }
}