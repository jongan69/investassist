"use client"
import React, { useState } from 'react';
import { Profile } from '@/types/users';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, PieChart as PieChartIcon } from "lucide-react";
import { AllocationChart } from './charts/AllocationChart';
import { HoldingCard } from './HoldingCard';
import { AnalysisCard } from './AnalysisCard';

interface UserInvestmentPlanProps {
    profile: Profile;
}

const UserInvestmentPlan: React.FC<UserInvestmentPlanProps> = ({ profile }) => {
    const [selectedTab, setSelectedTab] = useState('holdings');

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Calculate current allocations from holdings
    const currentAllocations = React.useMemo(() => {
        const total = profile?.holdings.reduce((sum, token) => sum + token.usdValue, 0) ?? 0;
        return profile?.holdings.map(token => ({
            asset: token.symbol,
            percentage: total > 0 ? (token.usdValue / total) * 100 : 0
        })) ?? [];
    }, [profile?.holdings]);

    // Define available tabs based on profile data
    const availableTabs = React.useMemo(() => {
        const tabs = [
            { value: 'holdings', icon: Wallet, label: 'Holdings' },
            { value: 'current-allocation', icon: PieChartIcon, label: 'Current Allocation' },
        ];

        if (profile.investmentPlan) {
            tabs.push(
                { value: 'analysis', icon: TrendingUp, label: 'Analysis' },
                { value: 'allocation', icon: PieChartIcon, label: 'Target Allocation' }
            );
        }

        return tabs;
    }, [profile.investmentPlan]);

    const renderTabContent = () => (
        <>
            {selectedTab === 'holdings' && (
                <div className="grid gap-3 sm:gap-4">
                    {profile.holdings.map((token, index) => (
                        <HoldingCard key={index} token={token} index={index} />
                    ))}
                </div>
            )}
            {selectedTab === 'analysis' && profile.investmentPlan !== undefined && (
                <AnalysisCard investmentPlan={profile.investmentPlan} />
            )}
            {selectedTab === 'current-allocation' && (
                <Card className="w-full flex-1 flex justify-center items-center p-6">
                    <AllocationChart allocations={currentAllocations} />
                </Card>
            )}
            {selectedTab === 'allocation' && profile.investmentPlan !== undefined && (
                <Card className="w-full flex-1 flex justify-center items-center p-6">
                    <AllocationChart allocations={profile.investmentPlan.allocations ?? []} />
                </Card>
            )}
        </>
    );

    if (!profile) {
        return (
            <Card className="border-2 border-yellow-500/30">
                <CardContent className="p-6">
                    <div className='text-center p-4 dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-100 text-yellow-800 rounded-lg'>
                        Please connect your wallet to continue
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <motion.section 
                className='max-w-7xl mx-auto p-2 sm:p-6 space-y-6'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div {...fadeInUp}>
                    <Card className="overflow-hidden border-0 shadow-lg dark:bg-black-800/50 bg-black/80 backdrop-blur-sm min-w-full">
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
                        
                        <CardContent className="min-w-full">
                            {/* Desktop view */}
                            <div className="hidden sm:block">
                                <Tabs defaultValue={selectedTab} className="w-full">
                                    <TabsList className="w-full gap-2 m-2">
                                        {availableTabs.map(({ value, icon: Icon, label }) => (
                                            <TabsTrigger 
                                                key={value}
                                                value={value} 
                                                className="flex items-center gap-2"
                                                onClick={() => setSelectedTab(value)}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <TabsContent value={selectedTab}>
                                        {renderTabContent()}
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Mobile view */}
                            <div className="block sm:hidden min-w-full p-6">
                                <select 
                                    className="w-full p-2 border rounded mb-6"
                                    value={selectedTab}
                                    onChange={(e) => setSelectedTab(e.target.value)}
                                >
                                    {availableTabs.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <div className="mt-2 p-6">
                                    {renderTabContent()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.section>
        </>
    );
};

export default UserInvestmentPlan;

