"use client"
import React from 'react';
import { HelioCheckout } from '@heliofi/checkout-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
// import { ExternalLinkIcon } from '@heroicons/react/outline';

const helioConfig = {
    paylinkId: "67a111f8b67b34ded1dc0f19",
    theme: {
        themeMode: "light" as const
    },
    primaryColor: "#fa6ece", // Updated to match your existing pink color theme
    neutralColor: "#2a302f", // Updated to match your dark background
};

interface InvestmentPlanProps {
    initialData: any[] // You should replace 'any' with a more specific type
}

const InvestmentPlan: React.FC<InvestmentPlanProps> = ({ initialData }) => {
    const { publicKey } = useWallet();
    const { push } = useRouter();

    const cryptoConfig = {
        ...helioConfig,
        onSuccess: (payment: any) => {
            console.log("Payment success", payment);
            push('/investment/success'); // Adjust this path to your success page
        }
    };

    const fiatConfig = {
        ...helioConfig,
        primaryPaymentMethod: "fiat" as const,
        onSuccess: (payment: any) => {
            console.log("Payment success", payment);
            push('/investment/success'); // Adjust this path to your success page
        }
    };

    return (
        <main className='min-h-screen text-white max-w-7xl'>
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
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl mb-2">Helio Pay with Crypto</h3>
                                <HelioCheckout config={cryptoConfig} />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default InvestmentPlan;
