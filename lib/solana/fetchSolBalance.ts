import { createSolanaClient, LAMPORTS_PER_SOL, address } from "gill";
import { fetchSolPrice } from "./fetchSolPrice";

const { rpc } = createSolanaClient({
    urlOrMoniker: "mainnet", // or `mainnet`, `localnet`, etc
});

export async function getSolBalance(walletAddress: string) {
    try {
        const wallet = address(walletAddress);
        const { value: balance } = await rpc.getBalance(wallet).send();
        const solBalance = Number(balance) / LAMPORTS_PER_SOL;
        const solPrice = await fetchSolPrice();
        const solUsdValue = solBalance * solPrice;
        return {
            solBalance: solBalance.toFixed(2),
            solUsdValue: solUsdValue.toFixed(2)
        };
    } catch (error) {
        console.error("Error fetching balance:", error);
        return null;
    }
}