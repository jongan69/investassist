import { PublicKey } from "@solana/web3.js";

export const getProfileByWalletAddress = async (walletAddress: PublicKey) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    try {
        const response = await fetch(`${baseUrl}/api/database/get-profile`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            walletAddress: walletAddress.toBase58(),
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}