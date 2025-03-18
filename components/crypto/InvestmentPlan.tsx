"use client"
import React, { useEffect, useState } from 'react';
import { HelioCheckout } from '@heliofi/checkout-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { fetchTokenDatafromPublicKey } from '@/lib/solana/fetchTokens';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { getProfileByWalletAddress } from '@/lib/users/getProfileByWallet';
import { Profile, BaseInvestmentPlan, AllocationData } from '@/types/users';
import { generateInvestmentPlan } from '@/lib/users/generateInvesmentPlan';
import { hasFreeAccess } from '@/lib/users/hasFreeAccess';
import { burnTokens } from '@/lib/solana/burnTokens';
import { connection } from 'next/dist/server/request/connection';
import { INVEST_ASSIST_MINT, COST_OF_INVESTMENT_PLAN } from '@/lib/solana/constants';
interface InvestmentPlanProps {
    initialData: {
        symbol: string;
        regularMarketPrice: number;
    }[];
    fearGreedValue: {
        value: number;
        classification: string;
    };
    sectorPerformance: {
        sector: string;
        changesPercentage: string;
    }[];
}


const InvestmentPlan: React.FC<InvestmentPlanProps> = ({ initialData, fearGreedValue, sectorPerformance }) => {
    const wallet = useWallet();
    const { resolvedTheme } = useTheme();
    const isDevelopment = process.env.NEXT_PUBLIC_ENV === 'development';
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [username, setUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [investmentPlan, setInvestmentPlan] = useState<BaseInvestmentPlan | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [freeAccess, setHasFreeAccess] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [paymentMethod, setPaymentMethod] = useState<'burn' | 'helio'>('helio');
    const { connection } = useConnection();

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const helioConfig = {
        paylinkId: "67a111f8b67b34ded1dc0f19",
        theme: {
            themeMode: resolvedTheme as "light" | "dark"
        },
        primaryColor: "#fa6ece", // Pink accent color
        neutralColor: resolvedTheme === 'dark' ? "#1f2937" : "#f3f4f6", // Dark/light background
        width: windowWidth < 640 ? "240px" : "300px", // Dynamic width based on screen size
        height: "450px",
        fontSize: "14px",
    };

    // Update the COLORS array to use theme-based colors
    const COLORS = resolvedTheme === 'dark'
        ? ['#fa6ece', '#63b3ed', '#48bb78', '#f6ad55', '#fc8181', '#b794f4', '#f687b3']  // Dark theme colors
        : ['#d53f8c', '#4299e1', '#38a169', '#ed8936', '#e53e3e', '#805ad5', '#d53f8c'];  // Light theme colors

    useEffect(() => {
        const checkProfile = async () => {
            if (wallet.publicKey) {
                const freeAccessResponse = await hasFreeAccess(wallet.publicKey.toString());
                setHasFreeAccess(freeAccessResponse);
                setIsLoading(true);
                try {
                    const profileData = await getProfileByWalletAddress(wallet.publicKey.toString());
                    if (profileData && profileData.exists) {
                        setProfile(profileData.profile);
                        setUsername(profileData.profile.username);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        checkProfile();
    }, [wallet.publicKey]);

    const paymentSuccessful = async () => {
        // console.log("Payment successful");
        setShowProfileForm(true);
    }

    const handleProfileSubmit = async (e: React.FormEvent, publicKey: PublicKey) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Add input validation
        if (username.length < 3) {
            setUsernameError('Username must be at least 3 characters long');
            setIsSubmitting(false);
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
            setIsSubmitting(false);
            return;
        }

        const { tokens, totalValue } = await fetchTokenDatafromPublicKey(publicKey);
        try {
            const response = await fetch('/api/create-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    walletAddress: publicKey?.toString(),
                    holdings: tokens,
                    totalValue,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create profile');
            }

            const data = await response.json();
            setShowProfileForm(false);
            setProfile(data.profile);
            setUsername(data.profile.username);
        } catch (error) {
            console.error('Error creating profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cryptoConfig = {
        ...helioConfig,
        onSuccess: (payment: any) => {
            // console.log("Payment success", payment);
            paymentSuccessful();
        }
    };

    // Add function to generate investment plan
    const generatePlan = async () => {
        if (!profile || !username) {
            console.error('Profile or username missing');
            return;
        }
        setIsGeneratingPlan(true);
        try {
            const plan = await generateInvestmentPlan(
                fearGreedValue,
                sectorPerformance,
                initialData,
                {
                    totalValue: profile.totalValue,
                    holdings: profile.holdings
                },
                username
            );
            setInvestmentPlan(plan);
        } catch (error) {
            console.error('Error generating investment plan:', error);
            // Add error state handling here
            setError('Failed to generate investment plan. Please try again.');
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    // Add the pie chart component
    const AllocationChart = ({ allocations }: { allocations: AllocationData[] }) => (
        <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={allocations}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                            // Only show label if percentage is >= 1.5%
                            if (percent < 0.015) return null;
                            return `${name} (${(percent * 100).toFixed(0)}%)`;
                        }}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="asset"
                    >
                        {allocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    // Update the investment plan display section
    const InvestmentPlanDisplay = ({ plan }: { plan: BaseInvestmentPlan }) => {
        const marketAnalysis = plan.marketAnalysis || {};
        const recommendation = plan.portfolioRecommendation || plan.investmentRecommendation || {};
        const allocations = transformAllocationData(plan);

        return (
            <div className="space-y-4 mt-6">
                <div className="bg-black-700/30 p-4 rounded-lg">
                    <h3 className="text-xl mb-2 text-[#fa6ece]">Market Analysis</h3>
                    <p className="text-sm mb-4">
                        {marketAnalysis.overview || marketAnalysis.summary || plan.summary}
                    </p>

                    {marketAnalysis.sectors && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Handle both sector formats */}
                            {Array.isArray(marketAnalysis.sectors.positive) ? (
                                <>
                                    <div className="bg-black-800/30 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2 text-green-400">Positive Sectors</h4>
                                        <ul className="text-sm space-y-1">
                                            {marketAnalysis.sectors.positive?.map(sector => (
                                                <li key={sector}>{sector}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-black-800/30 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2 text-red-400">Negative Sectors</h4>
                                        <ul className="text-sm space-y-1">
                                            {Object.values(marketAnalysis.sectors.negative as string[]).map(sector => (
                                                <li key={sector}>{sector}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-black-800/30 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2 text-gray-400">Neutral Sectors</h4>
                                        <ul className="text-sm space-y-1">
                                            {Object.values(marketAnalysis.sectors.neutral as string[]).map(sector => (
                                                <li key={sector}>{sector}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-3">
                                    <h4 className="font-medium mb-2">Sector Performance</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(marketAnalysis.sectors as Record<string, number>).map(([sector, performance]: [string, number]) => (
                                            <div key={sector} className="bg-black-800/30 p-2 rounded-lg">
                                                <span>{sector}: </span>
                                                <span className={performance > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {typeof performance === 'number' ? `${performance.toFixed(2)}%` : performance}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-black-700/30 p-4 rounded-lg">
                    <h3 className="text-xl mb-2 text-[#fa6ece]">Portfolio Recommendation</h3>
                    {(recommendation as any).diversification && (
                        <p className="text-sm mb-4">{(recommendation as any).diversification}</p>
                    )}
                    {((recommendation as any).strategy || (recommendation as any).rationale) && (
                        <p className="text-sm mb-4">{(recommendation as any).strategy || (recommendation as any).rationale}</p>
                    )}
                    {plan.riskLevel && (
                        <p className="text-sm mb-4">Risk Level: {plan.riskLevel}</p>
                    )}
                </div>

                <div className="dark:bg-black-700/50 bg-black-100 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-center mb-6 text-pink-600 dark:text-pink-400">
                        Recommended Portfolio Allocation
                    </h3>
                    {allocations && allocations.length > 0 ? (
                        <AllocationChart allocations={allocations} />
                    ) : (
                        <p className="text-center text-gray-500">No allocation data available</p>
                    )}
                </div>
            </div>
        );
    };

    // Update the transformAllocationData function
    const transformAllocationData = (plan: BaseInvestmentPlan): AllocationData[] => {
        // If plan already has allocations array, use it
        if (plan.allocations && Array.isArray(plan.allocations)) {
            return plan.allocations;
        }

        const allocations: AllocationData[] = [];
        const allocation = plan.portfolioRecommendation?.allocation ||
            plan.investmentRecommendation?.allocationPlan || {};

        // Process equities
        if (allocation.equities) {
            Object.entries(allocation.equities).forEach(([asset, percentage]) => {
                allocations.push({
                    asset: asset.charAt(0).toUpperCase() + asset.slice(1),
                    percentage,
                    reasoning: 'Sector allocation based on market analysis'
                });
            });
        }

        // Process fixed income/bonds
        const bondPercentage = typeof allocation.fixedIncome === 'number'
            ? allocation.fixedIncome
            : allocation.fixedIncome?.bonds ||
            allocation.bonds;

        if (bondPercentage) {
            allocations.push({
                asset: 'Bonds',
                percentage: bondPercentage,
                reasoning: 'Fixed income allocation for stability'
            });
        }

        // Process commodities
        if (allocation.commodities) {
            Object.entries(allocation.commodities).forEach(([commodity, percentage]) => {
                allocations.push({
                    asset: commodity.charAt(0).toUpperCase() + commodity.slice(1),
                    percentage,
                    reasoning: 'Commodity allocation for diversification'
                });
            });
        }

        // Process cryptocurrencies
        if (allocation.cryptocurrencies) {
            Object.entries(allocation.cryptocurrencies).forEach(([crypto, percentage]) => {
                allocations.push({
                    asset: crypto.charAt(0).toUpperCase() + crypto.slice(1),
                    percentage,
                    reasoning: 'Crypto allocation for growth potential'
                });
            });
        }

        // Process cash
        if (allocation.cash) {
            allocations.push({
                asset: 'Cash',
                percentage: allocation.cash,
                reasoning: 'Cash reserve for opportunities'
            });
        }

        // console.log('Final allocations:', allocations); // Add debugging
        return allocations;
    };

    const handleBurnTokens = async () => {
        const txId = await burnTokens(INVEST_ASSIST_MINT, wallet, COST_OF_INVESTMENT_PLAN, connection);
        if (txId) {
            try {
                // Wait for transaction confirmation
                const confirmation = await connection.confirmTransaction(txId);
                if (confirmation) {
                    // Transaction confirmed, proceed to profile creation
                    setShowProfileForm(true);
                }
            } catch (error) {
                console.error("Error confirming burn transaction:", error);
            }
        }
    };

    return (
        <div className='min-h-screen w-full p-4 text-gray-900 dark:text-gray-100 bg-black-50 dark:bg-black-900'>
            <div className='max-w-4xl mx-auto'>
                <div className='rounded-xl shadow-lg p-6 bg-black-50 dark:bg-black-800'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='font-bold text-2xl text-pink-600 dark:text-pink-400'>
                            {profile ?
                                <a href={`/users/${profile.username}`} className='text-pink-600 dark:text-pink-400'>Your Profile</a>
                                : showProfileForm
                                    ? 'Create Your Profile'
                                    : 'Purchase Investment Plan'}
                        </h2>
                    </div>

                    {!wallet.publicKey ? (
                        <div className='text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
                            Please connect your wallet to continue
                        </div>
                    ) : isLoading ? (
                        <div className='text-center p-4'>
                            Loading...
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl">
                                <p className="text-lg mb-3">Username: <span className="text-pink-600 dark:text-pink-400 font-semibold">{profile.username}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Wallet: {profile.walletAddress}</p>
                                <p className="text-lg mt-4 font-medium">Total Portfolio Value: ${profile.totalValue.toFixed(2)}</p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold">Your Holdings</h3>
                                {profile?.holdings.map((token, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium">{token.symbol}</span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            ({token.amount.toFixed(2)} {token.symbol}) ${token.usdValue.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {investmentPlan && <InvestmentPlanDisplay plan={investmentPlan} />}
                            <button
                                onClick={generatePlan}
                                disabled={isGeneratingPlan}
                                className="w-full bg-pink-600 dark:bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 disabled:opacity-50 transition-colors"
                            >
                                {isGeneratingPlan ? 'Generating Investment Plan...' : error ? 'Error Generating Investment Plan' : 'Generate Investment Plan'}
                            </button>
                        </div>
                    ) : showProfileForm ? (
                        <form onSubmit={(e) => {
                            if (wallet.publicKey) handleProfileSubmit(e, wallet.publicKey)
                        }} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setUsernameError(null);
                                    }}
                                    className={`w-full p-2 rounded-lg bg-black-50 dark:bg-black-700 border border-black-300 dark:border-gray-600 ${usernameError ? 'border-red-500 dark:border-red-500' : ''
                                        }`}
                                    required
                                />
                                {usernameError && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{usernameError}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !!usernameError}
                                className="w-full bg-pink-600 dark:bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                            </button>
                        </form>
                    ) : (
                        <div className='max-w-screen-sm mx-auto'>
                            <div className="mb-6">
                                <div className="flex justify-center space-x-4 p-4 bg-black-100 dark:bg-black-800 rounded-lg">
                                    <button
                                        onClick={() => setPaymentMethod('helio')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${paymentMethod === 'helio'
                                                ? 'bg-pink-600 text-white'
                                                : 'bg-black-200 dark:bg-black-700'
                                            }`}
                                    >
                                        Pay with Helio
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('burn')}
                                        className={`px-4 py-2 rounded-lg transition-colors ${paymentMethod === 'burn'
                                                ? 'bg-pink-600 text-white'
                                                : 'bg-black-200 dark:bg-black-700'
                                            }`}
                                    >
                                        Burn Tokens
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'helio' ? (
                                <div className="flex flex-col items-center">
                                    <div className="max-w-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <HelioCheckout config={cryptoConfig} />
                                        </div>
                                    </div>
                                    {(isDevelopment || freeAccess) && (
                                        <button
                                            onClick={() => paymentSuccessful()}
                                            className="w-full max-w-sm bg-yellow-600 dark:bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 text-sm sm:text-base mt-4 transition-colors"
                                        >
                                            Free Access: Skip Payment
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                                        Burn your tokens to access the investment plan
                                    </p>
                                    <button
                                        onClick={handleBurnTokens}
                                        className="w-full max-w-sm bg-pink-600 dark:bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors"
                                    >
                                        Burn Tokens
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestmentPlan;

