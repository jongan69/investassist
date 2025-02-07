"use client"
import React, { useEffect, useState } from 'react';
import { HelioCheckout } from '@heliofi/checkout-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { apiLimiter, fetchTokenAccounts, handleTokenData } from '@/lib/solana/fetchTokens';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { getProfileByWalletAddress } from '@/lib/users/getProfileByWallet';
import { Profile, BaseInvestmentPlan, AllocationData } from '@/types/users';
import { saveInvestmentPlan } from '@/lib/users/saveInvestmentPlan';
import { checkUsername } from '@/lib/users/checkUsername';

interface InvestmentPlanProps {
  initialData: any[]; // TODO: type this properly
  fearGreedValue: any;
  sectorPerformance: any;
}

const helioConfig = {
    paylinkId: "67a111f8b67b34ded1dc0f19",
    theme: {
        themeMode: "light" as const
    },
    primaryColor: "#fa6ece", // Updated to match your existing pink color theme
    neutralColor: "#2a302f", // Updated to match your dark background
};


const generateInvestmentPlan = async (fearGreedValue: any, sectorPerformance: any, marketData: any[], userPortfolio: any, username: string) => {
    const formattedSectorPerformance = sectorPerformance.map((sector: any) => ({
        sector: sector.sector,
        performance: parseFloat(sector.changesPercentage.replace('%', ''))
      }));
    const response = await fetch('/api/generate-investment-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fearGreedValue,
            sectorPerformance: formattedSectorPerformance,
            marketData: {
                cryptoMarket: {
                    bitcoin: marketData.find(d => d.symbol === 'BTC-USD')?.regularMarketPrice,
                    ethereum: marketData.find(d => d.symbol === 'ETH-USD')?.regularMarketPrice,
                    solana: marketData.find(d => d.symbol === 'SOL-USD')?.regularMarketPrice,
                },
                indices: {
                    sp500: marketData.find(d => d.symbol === 'ES=F')?.regularMarketPrice,
                    nasdaq: marketData.find(d => d.symbol === 'NQ=F')?.regularMarketPrice,
                    dowJones: marketData.find(d => d.symbol === 'YM=F')?.regularMarketPrice,
                },
                commodities: {
                    gold: marketData.find(d => d.symbol === 'GC=F')?.regularMarketPrice,
                    silver: marketData.find(d => d.symbol === 'SI=F')?.regularMarketPrice,
                },
                tenYearYield: marketData.find(d => d.symbol === '^TNX')?.regularMarketPrice,
            },
            userPortfolio: {
                totalValue: userPortfolio.totalValue,
                holdings: userPortfolio.holdings
            }
        }),
    });
    const data = await response.json();
    saveInvestmentPlan(username, data);
    return data;
}

const InvestmentPlan: React.FC<InvestmentPlanProps> = ({ initialData, fearGreedValue, sectorPerformance }) => {
    const { publicKey } = useWallet();
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

    // Update the COLORS array to use theme-based colors
    const COLORS = resolvedTheme === 'dark' 
        ? ['#fa6ece', '#63b3ed', '#48bb78', '#f6ad55', '#fc8181', '#b794f4', '#f687b3']  // Dark theme colors
        : ['#d53f8c', '#4299e1', '#38a169', '#ed8936', '#e53e3e', '#805ad5', '#d53f8c'];  // Light theme colors

    useEffect(() => {
        const checkProfile = async () => {
            if (publicKey) {
                setIsLoading(true);
                try {
                    const profileData = await getProfileByWalletAddress(publicKey.toString());
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
    }, [publicKey]);

    const paymentSuccessful = async () => {
        console.log("Payment successful");
        setShowProfileForm(true);
    }



    const handleProfileSubmit = async (e: React.FormEvent, publicKey: PublicKey) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Check username availability first
        const isUsernameAvailable = await checkUsername(username);
        if (!isUsernameAvailable) {
            setIsSubmitting(false);
            return;
        }

        const tokenAccounts = await fetchTokenAccounts(publicKey);
        let calculatedTotalValue = 0;
        let processedTokens = 0;

        const tokenDataPromises = tokenAccounts.value.map(async (tokenAccount) => {
          try {
            const tokenData = await handleTokenData(publicKey, tokenAccount, apiLimiter);
            processedTokens++;
            calculatedTotalValue += tokenData.usdValue;
            return tokenData;
          } catch (error) {
            console.error("Error processing token data:", error);
            return null;
          }
        });
        const settledResults = await Promise.allSettled(tokenDataPromises);
        const tokens = settledResults
          .filter((result): result is PromiseFulfilledResult<Exclude<Awaited<ReturnType<typeof handleTokenData>>, null>> =>
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);
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
                    totalValue: calculatedTotalValue,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create profile');
            }

            setShowProfileForm(false);
        } catch (error) {
            console.error('Error creating profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cryptoConfig = {
        ...helioConfig,
        onSuccess: (payment: any) => {
            console.log("Payment success", payment);
            paymentSuccessful();
        }
    };

    // Add function to generate investment plan
    const generatePlan = async () => {
        if (!profile || !username) return;
        setIsGeneratingPlan(true);
        console.log("username", username)
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
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-xl mb-2 text-[#fa6ece]">Market Analysis</h3>
                    <p className="text-sm mb-4">
                        {marketAnalysis.overview || marketAnalysis.summary || plan.summary}
                    </p>
                    
                    {marketAnalysis.sectors && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Handle both sector formats */}
                            {Array.isArray(marketAnalysis.sectors.positive) ? (
                                <>
                                    <div className="bg-gray-800/30 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2 text-green-400">Positive Sectors</h4>
                                        <ul className="text-sm space-y-1">
                                            {marketAnalysis.sectors.positive?.map(sector => (
                                                <li key={sector}>{sector}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-800/30 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2 text-red-400">Negative Sectors</h4>
                                        <ul className="text-sm space-y-1">
                                            {Object.values(marketAnalysis.sectors.negative as string[]).map(sector => (
                                                <li key={sector}>{sector}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-800/30 p-3 rounded-lg">
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
                                            <div key={sector} className="bg-gray-800/30 p-2 rounded-lg">
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

                <div className="bg-gray-700/30 p-4 rounded-lg">
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
                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-xl mb-2 text-[#fa6ece] text-center pb-10 mb-10">Allocation</h3>
                    <AllocationChart allocations={allocations} />
                </div>

                <div className="dark:bg-gray-700/50 bg-gray-100 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-center mb-6 text-pink-600 dark:text-pink-400">
                        Portfolio Allocation
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

        console.log('Final allocations:', allocations); // Add debugging
        return allocations;
    };

    return (
        <main className='min-h-screen w-full dark:text-white text-gray-800 bg-gray-50 dark:bg-gray-900'>
            <section className='grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 max-w-[2000px] mx-auto'>
                <div className='rounded-xl shadow-lg p-6 dark:bg-gray-800 bg-white sm:col-span-12'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='font-bold text-2xl text-[#fa6ece] dark:text-[#fa6ece] text-pink-600'>
                            {profile ? 'Your Profile' : showProfileForm ? 'Create Your Profile' : 'Purchase Investment Plan'}
                        </h2>
                    </div>

                    {!publicKey ? (
                        <div className='text-center p-4 dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-100 text-yellow-800 dark:border-yellow-500/30 border-yellow-400 rounded-lg'>
                            Please connect your wallet to continue
                        </div>
                    ) : isLoading ? (
                        <div className='text-center p-4'>
                            Loading...
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">
                            <div className="dark:bg-gray-700/50 bg-gray-100 p-6 rounded-xl">
                                <p className="text-lg mb-3">Username: <span className="text-pink-600 dark:text-pink-400 font-semibold">{profile.username}</span></p>
                                <p className="text-sm dark:text-gray-300 text-gray-600">Wallet: {profile.walletAddress}</p>
                                <p className="text-lg mt-4 font-medium">Total Portfolio Value: ${profile.totalValue.toFixed(2)}</p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-semibold">Your Holdings</h3>
                                {profile?.holdings.map((token, index) => (
                                    <div key={index} className="dark:bg-gray-700/50 bg-gray-100 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium">{token.symbol}</span>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            ({token.amount.toFixed(2)} {token.symbol}) ${token.usdValue.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={generatePlan}
                                disabled={isGeneratingPlan}
                                className="w-full bg-[#fa6ece] text-white py-2 px-4 rounded-lg hover:bg-[#e55eb7]"
                            >
                                {isGeneratingPlan ? 'Generating Investment Plan...' : 'Generate Investment Plan'}
                            </button>

                            {investmentPlan && <InvestmentPlanDisplay plan={investmentPlan} />}
                        </div>
                    ) : showProfileForm ? (
                        <form onSubmit={(e) => handleProfileSubmit(e, publicKey)} className="space-y-4">
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
                                        setUsernameError(null); // Clear error when user types
                                    }}
                                    className={`w-full p-2 rounded-lg bg-gray-700 text-white ${
                                        usernameError ? 'border-red-500 border-2' : ''
                                    }`}
                                    required
                                />
                                {usernameError && (
                                    <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !!usernameError}
                                className="w-full bg-[#fa6ece] text-white py-2 px-4 rounded-lg hover:bg-[#e55eb7] disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6 dark:bg-gray-800/50 bg-gray-100 p-6 rounded-xl">
                            <div className="flex justify-center items-center">
                                <h3 className="text-xl mb-2">Helio Pay with Crypto</h3>
                                <HelioCheckout config={cryptoConfig} />
                                {isDevelopment && (
                                    <button
                                        onClick={() => paymentSuccessful()}
                                        className="mt-4 w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
                                    >
                                        Test Mode: Skip Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default InvestmentPlan;

