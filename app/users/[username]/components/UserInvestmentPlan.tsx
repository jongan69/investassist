"use client"
import React, { useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { AllocationData, Profile } from '@/types/users';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, PieChart as PieChartIcon } from "lucide-react";
import Image from 'next/image';

interface UserInvestmentPlanProps {
    profile: Profile;
}

const UserInvestmentPlan: React.FC<UserInvestmentPlanProps> = ({ profile }) => {
    const { resolvedTheme } = useTheme();
    const [selectedTab, setSelectedTab] = useState('holdings');

    // Update the COLORS array to use theme-based colors
    const COLORS = resolvedTheme === 'dark' 
        ? ['#fa6ece', '#63b3ed', '#48bb78', '#f6ad55', '#fc8181', '#b794f4', '#f687b3']  // Dark theme colors
        : ['#d53f8c', '#4299e1', '#38a169', '#ed8936', '#e53e3e', '#805ad5', '#d53f8c'];  // Light theme colors

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Update the AllocationChart component
    const AllocationChart = ({ allocations }: { allocations: AllocationData[] }) => (
        <div className="h-[500px] sm:h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={allocations}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        label={({ name, percent }) => 
                            window.innerWidth < 640 
                                ? `${(percent * 100).toFixed(0)}%`
                                : `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={window.innerWidth < 640 ? 80 : 150}
                        innerRadius={window.innerWidth < 640 ? 40 : 80}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="asset"
                        paddingAngle={2}
                    >
                        {allocations.map((entry, index) => (
                            <Cell 

                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                className="hover:opacity-80 transition-opacity duration-200"
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', 
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                            
                        }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-md">
                                        <p className="text-sm font-medium">{payload[0].name}</p>
                                        <p className="text-xs text-gray-500">{(Number(payload[0].value)).toFixed(2)}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={20}
                        formatter={(value) => (
                            <span className="text-sm font-medium px-2 py-1">{value}</span>
                        )}
                        wrapperStyle={{
                            marginTop: '30px',
                            paddingTop: '30px',
                            marginBottom: '30px',
                            paddingBottom: '30px',
                            width: '100%',
                            
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    // Add this function to calculate current allocations from holdings
    const calculateCurrentAllocations = (holdings: typeof profile.holdings): AllocationData[] => {
        const total = holdings.reduce((sum, token) => sum + token.usdValue, 0);
        return holdings.map(token => ({
            asset: token.symbol,
            percentage: total > 0 ? (token.usdValue / total) * 100 : 0
        }));
    };

    return (
        <main className='min-h-screen w-full dark:text-white text-gray-800 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
            <motion.section 
                className='max-w-7xl mx-auto p-2 sm:p-6 space-y-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {!profile ? (
                    <Card className="border-2 border-yellow-500/30">
                        <CardContent className="p-6">
                            <div className='text-center p-4 dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-100 text-yellow-800 rounded-lg'>
                                Please connect your wallet to continue
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-10">
                        {/* Profile Overview Card */}
                        <motion.div {...fadeInUp}>
                            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="border-b dark:border-gray-700/50">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                        <div>
                                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                                {profile.username}&apos;s Portfolio
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{profile.walletAddress}</p>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto">
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                            <p className="text-3xl font-bold text-pink-500">${profile.totalValue.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 sm:p-6">
                                    {/* Tabs for larger screens */}
                                    <div className="hidden sm:block">
                                        <Tabs defaultValue={selectedTab} className="w-full">
                                            <TabsList className="w-full justify-start mb-6 flex-wrap gap-2">
                                                <TabsTrigger value="holdings" className="flex items-center gap-2" onClick={() => setSelectedTab('holdings')}>
                                                    <Wallet className="w-4 h-4" />
                                                    Holdings
                                                </TabsTrigger>
                                                <TabsTrigger value="analysis" className="flex items-center gap-2" onClick={() => setSelectedTab('analysis')}>
                                                    <TrendingUp className="w-4 h-4" />
                                                    Analysis
                                                </TabsTrigger>
                                                <TabsTrigger value="current-allocation" className="flex items-center gap-2" onClick={() => setSelectedTab('current-allocation')}>
                                                    <PieChartIcon className="w-4 h-4" />
                                                    Current Allocation
                                                </TabsTrigger>
                                                <TabsTrigger value="allocation" className="flex items-center gap-2" onClick={() => setSelectedTab('allocation')}>
                                                    <PieChartIcon className="w-4 h-4" />
                                                    Target Allocation
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="holdings">
                                                <div className="grid gap-3 sm:gap-4">
                                                    {profile.holdings.map((token, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <Card className="hover:shadow-md transition-all duration-200">
                                                                <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                        {token.logo && (
                                                                            <Image 
                                                                                src={token.logo} 
                                                                                alt={token.symbol} 
                                                                                className="w-10 h-10 rounded-full"
                                                                                width={40}
                                                                                height={40}
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <p className="font-semibold">{token.name}</p>
                                                                            <Badge variant="secondary">{token.symbol}</Badge>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-left sm:text-right w-full sm:w-auto">
                                                                        <p className="text-lg font-bold text-pink-500">${token.usdValue.toFixed(2)}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {token.amount.toFixed(4)} {token.symbol}
                                                                        </p>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="analysis">
                                                {profile.investmentPlan && (
                                                    <Card>
                                                        <CardContent className="p-6 space-y-4">
                                                            <p className="text-lg leading-relaxed">
                                                                {profile.investmentPlan?.marketAnalysis?.overview ?? 'No market analysis available'}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-pink-500">Risk Level</Badge>
                                                                <span className="text-pink-500 font-semibold">{profile.investmentPlan.riskLevel}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="current-allocation">
                                                <Card className="p-10 m-10 flex justify-center items-center">
                                                    <AllocationChart allocations={calculateCurrentAllocations(profile.holdings)} />
                                                </Card>
                                            </TabsContent>

                                            <TabsContent value="allocation">
                                                {profile.investmentPlan && (
                                                    <Card className="p-10 m-10 flex justify-center items-center">
                                                        <AllocationChart allocations={profile.investmentPlan.allocations ?? []} />
                                                    </Card>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    {/* Mobile view */}
                                    <div className="block sm:hidden">
                                        <select 
                                            className="w-full p-2 border rounded mb-6"
                                            value={selectedTab}
                                            onChange={(e) => setSelectedTab(e.target.value)}
                                        >
                                            <option value="holdings">Holdings</option>
                                            <option value="analysis">Analysis</option>
                                            <option value="current-allocation">Current Allocation</option>
                                            <option value="allocation">Target Allocation</option>
                                        </select>

                                        {/* Mobile content based on selected tab */}
                                        <div className="mt-2 p-6">
                                            {selectedTab === 'holdings' && (
                                                <div className="grid gap-3">
                                                    {profile.holdings.map((token, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <Card className="hover:shadow-md transition-all duration-200">
                                                                <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                        {token.logo && (
                                                                            <Image 
                                                                                src={token.logo} 
                                                                                alt={token.symbol} 
                                                                                className="w-10 h-10 rounded-full"
                                                                                width={40}
                                                                                height={40}
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <p className="font-semibold">{token.name}</p>
                                                                            <Badge variant="secondary">{token.symbol}</Badge>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-left sm:text-right w-full sm:w-auto">
                                                                        <p className="text-lg font-bold text-pink-500">${token.usdValue.toFixed(2)}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {token.amount.toFixed(4)} {token.symbol}
                                                                        </p>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedTab === 'analysis' && (
                                                <Card className="p-6">
                                                    {profile.investmentPlan && (
                                                        <Card>
                                                            <CardContent className="p-6 space-y-4">
                                                                <p className="text-lg leading-relaxed">
                                                                    {profile.investmentPlan?.marketAnalysis?.overview ?? 'No market analysis available'}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-pink-500">Risk Level</Badge>
                                                                    <span className="text-pink-500 font-semibold">{profile.investmentPlan.riskLevel}</span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </Card>
                                            )}
                                            {selectedTab === 'current-allocation' && (
                                                <Card className="mb-20 pb-20 flex">
                                                    <AllocationChart allocations={calculateCurrentAllocations(profile.holdings)} />
                                                </Card>
                                            )}
                                            {selectedTab === 'allocation' && profile.investmentPlan && (
                                                <Card className="mb-20 pb-20 flex">
                                                    <AllocationChart allocations={profile.investmentPlan.allocations ?? []} />
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </motion.section>
        </main>
    );
};

export default UserInvestmentPlan;

