"use client"
import React from 'react';
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

    // Update the COLORS array to use theme-based colors
    const COLORS = resolvedTheme === 'dark' 
        ? ['#fa6ece', '#63b3ed', '#48bb78', '#f6ad55', '#fc8181', '#b794f4', '#f687b3']  // Dark theme colors
        : ['#d53f8c', '#4299e1', '#38a169', '#ed8936', '#e53e3e', '#805ad5', '#d53f8c'];  // Light theme colors

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Add the pie chart component
    const AllocationChart = ({ allocations }: { allocations: AllocationData[] }) => (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={allocations}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={150}
                        innerRadius={80}
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
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px'
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    // Update the investment plan display section

    // Update the transformAllocationData function

    return (
        <main className='min-h-screen w-full dark:text-white text-gray-800 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
            <motion.section 
                className='max-w-7xl mx-auto p-4 sm:p-6 space-y-6'
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
                    <div className="space-y-6">
                        {/* Profile Overview Card */}
                        <motion.div {...fadeInUp}>
                            <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="border-b dark:border-gray-700/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                                {profile.username}&apos;s Portfolio
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{profile.walletAddress}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                            <p className="text-3xl font-bold text-pink-500">${profile.totalValue.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6">
                                    <Tabs defaultValue="holdings" className="w-full">
                                        <TabsList className="w-full justify-start mb-6">
                                            <TabsTrigger value="holdings" className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4" />
                                                Holdings
                                            </TabsTrigger>
                                            <TabsTrigger value="analysis" className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Analysis
                                            </TabsTrigger>
                                            <TabsTrigger value="allocation" className="flex items-center gap-2">
                                                <PieChartIcon className="w-4 h-4" />
                                                Allocation
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="holdings">
                                            <div className="grid gap-4">
                                                {profile.holdings.map((token, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Card className="hover:shadow-md transition-all duration-200">
                                                            <CardContent className="p-4 flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
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
                                                                <div className="text-right">
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

                                        <TabsContent value="allocation">
                                            {profile.investmentPlan && (
                                                <Card className="p-6">
                                                    <AllocationChart allocations={profile.investmentPlan.allocations ?? []} />
                                                </Card>
                                            )}
                                        </TabsContent>
                                    </Tabs>
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

