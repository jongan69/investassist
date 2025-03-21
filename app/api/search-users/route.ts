import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongo/connect"
import trackedAccounts from "@/data/trackedAccounts.json"
import { PublicKey } from "@solana/web3.js"

type WalletAddresses = {
    [key: string]: {
        ETH?: string[];
        SOL?: string[];
    };
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q')?.toLowerCase();

        if (!query) {
            return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("investassist");
        const collection = db.collection("profiles");

        // Check if query is a valid Solana address
        let isWalletAddress = false;
        try {
            new PublicKey(query);
            isWalletAddress = true;
        } catch {}

        let results = [];

        // Search in database
        const dbResults = await collection.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                ...(isWalletAddress ? [{ walletAddress: query }] : [])
            ]
        }).limit(5).toArray();
        
        results.push(...dbResults);

        // Search in tracked accounts
        const walletAddresses = trackedAccounts.walletAddresses as WalletAddresses;
        
        // Get all usernames to search through (both from trackedAccounts and walletAddresses)
        const allUsernames = [...new Set([
            ...trackedAccounts.trackedAccounts,
            ...Object.keys(walletAddresses)
        ])];
        
        const trackedMatches = allUsernames
            .filter(account => {
                // Check username match
                if (!isWalletAddress && account.toLowerCase().includes(query)) {
                    return true;
                }
                
                // Check wallet addresses match
                const addresses = walletAddresses[account];
                if (addresses) {
                    const ethAddresses = addresses.ETH?.map(addr => addr.toLowerCase()) || [];
                    const solAddresses = addresses.SOL?.map(addr => addr.toLowerCase()) || [];
                    return ethAddresses.includes(query) || solAddresses.includes(query);
                }
                return false;
            })
            .map(account => ({
                username: account,
                isTracked: trackedAccounts.trackedAccounts.includes(account),
                walletAddresses: walletAddresses[account] || {}
            }));
        
        results.push(...trackedMatches);

        return NextResponse.json({ 
            results: results.slice(0, 5),
            isWalletAddress 
        }, { status: 200 });

    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }
} 