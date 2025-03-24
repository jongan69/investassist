"use client"
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import * as walletAdapterWallets from '@solana/wallet-adapter-wallets'
import * as web3 from '@solana/web3.js';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { HELIUS } from '@/lib/solana/constants';
import '../../styles/custom-wallet-styles.css'; // Custom wallet Button styles
import { getProfileByWalletAddress } from '@/lib/users/getProfileByWallet';
import { saveUser } from '@/lib/users/saveUser';

// Define a type for the context value
type WalletContextType = {
    wallet: any; // Replace 'any' with the actual type if known
    setWallet: React.Dispatch<React.SetStateAction<any>>;
    showProfileForm: boolean;
    setShowProfileForm: React.Dispatch<React.SetStateAction<boolean>>;
    handleProfileSubmit: (username: string) => Promise<void>;
};

// Initialize the context with the correct type
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Create a wrapper component to handle wallet connection
const WalletConnectionHandler = ({ 
    children,
    setWallet,
    setShowProfileForm 
}: { 
    children: React.ReactNode;
    setWallet: (wallet: any) => void;
    setShowProfileForm: (show: boolean) => void;
}) => {
    const solanaWallet = useSolanaWallet();
    const hasCheckedProfile = useRef<string | null>(null);

    // Memoize the wallet address to prevent unnecessary re-renders
    const walletAddress = useMemo(() => 
        solanaWallet.publicKey?.toString(), 
        [solanaWallet.publicKey]
    );

    useEffect(() => {
        // Set wallet regardless of connection status
        setWallet(solanaWallet);

        const checkProfile = async () => {
            if (!solanaWallet.publicKey) return;
            
            const currentAddress = solanaWallet.publicKey.toString();
            // Only check if we haven't checked this address before
            if (hasCheckedProfile.current !== currentAddress) {
                try {
                    const response = await getProfileByWalletAddress(solanaWallet.publicKey);
                    if (!response.exists) {
                        setShowProfileForm(true);
                    }
                    // Mark this address as checked
                    hasCheckedProfile.current = currentAddress;
                } catch (error) {
                    console.error('Error checking profile:', error);
                }
            }
        };

        if (solanaWallet.connected) {
            checkProfile();
        } else {
            // Reset the check when wallet disconnects
            hasCheckedProfile.current = null;
            setShowProfileForm(false);
        }
    }, [solanaWallet.connected, walletAddress, setWallet, setShowProfileForm]);

    return <>{children}</>;
};

const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
    const endpoint = HELIUS ?? web3.clusterApiUrl('mainnet-beta');
    const wallets = [
        new walletAdapterWallets.CoinbaseWalletAdapter(),
        new walletAdapterWallets.BraveWalletAdapter(),
        new walletAdapterWallets.TorusWalletAdapter()
    ];

    const [wallet, setWallet] = useState<any>(null);
    const [showProfileForm, setShowProfileForm] = useState(false);

    const handleProfileSubmit = useCallback(async (username: string) => {
        if (!wallet?.publicKey) return;
        
        try {
            await saveUser(username, wallet.publicKey.toString());
            setShowProfileForm(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }, [wallet]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    <WalletContext.Provider value={{ 
                        wallet, 
                        setWallet, 
                        showProfileForm, 
                        setShowProfileForm,
                        handleProfileSubmit 
                    }}>
                        <WalletConnectionHandler
                            setWallet={setWallet}
                            setShowProfileForm={setShowProfileForm}
                        >
                            {children}
                        </WalletConnectionHandler>
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