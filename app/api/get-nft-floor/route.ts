
export async function POST(req: Request) {
    const { ca } = await req.json();

    // Validate contract address
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!ca || !solanaAddressRegex.test(ca)) {
        return Response.json({
            floorPrice: "Invalid contract address",
            usdValue: 0.00,
            uiFormmatted: "0.0000 Sol"
        });
    }

    const url = `https://api.simplehash.com/api/v0/nfts/solana/${ca}/0`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'X-API-KEY': process.env.SIMPLEHASH_API_KEY ?? ""
        },
    };

    try {
        const response = await fetch(url, options)
            .then(res => res.json());

        const floorPriceInSol = response.collection.floor_prices[0].value / 1_000_000_000;
        const usdValue = response.collection.floor_prices[0].value_usd_cents / 100;

        return Response.json({
            floorPrice: floorPriceInSol,
            usdValue,
            uiFormmatted: `${floorPriceInSol.toFixed(4)} Sol ($${usdValue.toFixed(2)})`
        });
    } catch (error) {
        console.error(`Error fetching NFT Collection data: ${error}`);
        return Response.json({
            floorPrice: "Error",
            usdValue: 0.00,
            uiFormmatted: "0.0000 Sol"
        });
    }
}