import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createBurnInstruction } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { INVEST_ASSIST_MINT_DECIMALS } from "../utils/constants";

export const burnTokens = async (mintAddress: string, wallet: WalletContextState, amount: number, connection: Connection): Promise<string | null> => {
    try {
        if (!wallet || !wallet.publicKey) throw new Error("Wallet not connected");

        const mintPubkey = new PublicKey(mintAddress);
        const owner = wallet.publicKey;

        // Convert amount to smallest unit using decimals
        const adjustedAmount = Math.floor(amount * Math.pow(10, INVEST_ASSIST_MINT_DECIMALS));

        // Get associated token account
        const ata = await getAssociatedTokenAddress(mintPubkey, owner);

        // Create burn instruction with adjusted amount
        const burnIx = createBurnInstruction(ata, mintPubkey, owner, adjustedAmount);

        // Create and sign transaction
        const tx = new Transaction().add(burnIx);
        tx.feePayer = owner;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        if (!wallet.signTransaction) throw new Error("Wallet does not support signing");
        const signedTx = await wallet.signTransaction(tx);
        const txId = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
        });

        console.log("Transaction ID:", txId);
        return txId;
    } catch (error) {
        console.error("Burn Error:", error);
        return null;
    }
};
