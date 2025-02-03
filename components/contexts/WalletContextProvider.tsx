"use client"
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import * as walletAdapterWallets from '@solana/wallet-adapter-wallets'
import * as web3 from '@solana/web3.js';
import React, { createContext, useContext, useState } from 'react';
import { NETWORK } from '@/lib/solana/constants';
// require('@solana/wallet-adapter-react-ui/styles.css');
import '../../styles/custom-wallet-styles.css'; // Custom wallet Button styles

// Define a type for the context value
type WalletContextType = {
    wallet: any; // Replace 'any' with the actual type if known
    setWallet: React.Dispatch<React.SetStateAction<any>>;
};

// Initialize the context with the correct type
const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {

    const endpoint = NETWORK ?? web3.clusterApiUrl('mainnet-beta');
    const wallets = [
        new walletAdapterWallets.PhantomWalletAdapter(),
        new walletAdapterWallets.CoinbaseWalletAdapter(),
        new walletAdapterWallets.BraveWalletAdapter(),
        new walletAdapterWallets.TorusWalletAdapter()
    ];

    const [wallet, setWallet] = useState<any>(null); // Replace 'any' with the actual type if known

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    <WalletContext.Provider value={{ wallet, setWallet }}>
                        {children}
                    </WalletContext.Provider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletContextProvider');
    }
    return context;
};

export default WalletContextProvider;