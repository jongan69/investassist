import { getDexScreenerData } from "./fetchDexData";

export async function getPairFromCa(ca: string) {
    const response = await getDexScreenerData(ca);
    const validPairs = ((response.pairs || []) as any[]).filter((pair: any) =>
        pair.chainId === 'solana' &&
        (pair.quoteToken?.address === 'So11111111111111111111111111111111111111112' || // SOL
            pair.quoteToken?.address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') && // USDC
        pair.liquidity?.usd > 5000 // Minimum liquidity threshold
    );
    const groupedPairs = validPairs.reduce((acc: { [key: string]: any[] }, pair: any) => {
        const address = pair.baseToken?.address;
        if (address) {
            if (!acc[address]) acc[address] = [];
            acc[address].push(pair);
        }
        return acc;
    }, {});

    // For each token, select the SOL pair with highest market cap
    const bestPairs = Object.values(groupedPairs).map(pairs => {
        // Only consider SOL pairs
        const solPairs = pairs.filter((p: { quoteToken: { address: string; }; }) =>
            p.quoteToken?.address === 'So11111111111111111111111111111111111111112'
        );

        // If we have SOL pairs, pick the one with highest market cap
        if (solPairs.length > 0) {
            return solPairs.reduce((best: any, current: any) => {
                const bestMarketCap = best.baseToken?.fdv || 0;
                const currentMarketCap = current.baseToken?.fdv || 0;
                return currentMarketCap > bestMarketCap ? current : best;
            });
        }

        // If no SOL pairs, return null
        return null;
    }).filter(Boolean); // Remove null entries

    // Sort by market cap
    bestPairs.sort((a: any, b: any) => {
        const marketCapA = a.baseToken?.fdv || 0;
        const marketCapB = b.baseToken?.fdv || 0;
        return marketCapB - marketCapA;
    });

    // Sort by market cap, holder count, and liquidity
    bestPairs.sort((a: any, b: any) => {
        const marketCapA = a.baseToken?.fdv || 0;
        const marketCapB = b.baseToken?.fdv || 0;
        const holdersA = a.holders?.holders?.length || 0;
        const holdersB = b.holders?.holders?.length || 0;
        const liquidityA = a.liquidity?.usd || 0;
        const liquidityB = b.liquidity?.usd || 0;

        // First compare by holder count
        if (holdersA !== holdersB) {
            return holdersB - holdersA;
        }

        // Then by market cap
        if (marketCapA !== marketCapB) {
            return marketCapB - marketCapA;
        }

        // Finally by liquidity
        return liquidityB - liquidityA;
    });

    // Return the address of the best pair, or null if no pairs found
    return bestPairs.length > 0 ? bestPairs[0].pairAddress : null;
}