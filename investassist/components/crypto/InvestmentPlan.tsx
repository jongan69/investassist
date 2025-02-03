"use client"
import React from 'react';
import Script from 'next/script';
import { useWallet } from '@solana/wallet-adapter-react';

declare global {
    interface Window {
        HelioPay?: any;
    }
}

const helioConfig = {
    paylinkId: "67a111f8b67b34ded1dc0f19",
    theme: {
        themeMode: "light"
    },
    primaryColor: "#fa6ece",
    neutralColor: "#2a302f",
};

const InvestmentPlan = () => {
    const { publicKey } = useWallet();
    const [isHelioLoaded, setIsHelioLoaded] = React.useState(false);

    const initializeHelio = React.useCallback(() => {
        if (window.HelioPay && publicKey) {
            window.HelioPay.init({
                ...helioConfig,
                onSuccess: () => {
                    console.log('Payment successful');
                },
                onError: (error: any) => {
                    console.error('Payment failed:', error);
                }
            });
        }
    }, [publicKey]);

    React.useEffect(() => {
        if (isHelioLoaded && publicKey) {
            initializeHelio();
        }
    }, [isHelioLoaded, publicKey, initializeHelio]);

    return (
        <main className='min-h-screen text-white max-w-7xl'>
            <Script 
                src="https://cdn.helio.fm/js/v2/helio.js" 
                onLoad={() => setIsHelioLoaded(true)}
            />
            <section className='grid grid-cols-1 sm:grid-cols-6 gap-4 p-4'>
                <div className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='font-bold text-2xl text-[#fa6ece]'>
                            Purchase Investment Plan
                        </h2>
                    </div>

                    {!publicKey ? (
                        <div className='text-center p-4 bg-yellow-900/30 text-yellow-100 border border-yellow-500/30 rounded-lg'>
                            Please connect your wallet to continue
                        </div>
                    ) : (
                        <div id="helio-checkout-container" className="w-full min-h-[400px]" />
                    )}
                </div>
            </section>
        </main>
    );
};

export default InvestmentPlan; 