"use client"
import React, { useState } from 'react';
import { Profile, BaseInvestmentPlan } from '@/types/users';
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, PieChart as PieChartIcon, Share2 } from "lucide-react";
import { AllocationChart } from './charts/AllocationChart';
import { HoldingCard } from './HoldingCard';
import { AnalysisCard } from './AnalysisCard';
import { Button } from "@/components/ui/button";
import * as htmlToImage from 'html-to-image';
import { generateInvestmentPlan } from '@/lib/users/generateInvesmentPlan';

interface UserInvestmentPlanProps {
    profile: Profile;
    marketData?: any[];
    fearGreedValue?: {
        value: number;
        classification: string;
    };
    sectorPerformance?: {
        sector: string;
        changesPercentage: string;
    }[];
    isWalletAddress?: boolean;
}

const UserInvestmentPlan: React.FC<UserInvestmentPlanProps> = ({ 
    profile, 
    marketData, 
    fearGreedValue, 
    sectorPerformance,
    isWalletAddress 
}) => {
    const [selectedTab, setSelectedTab] = useState('holdings');
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<BaseInvestmentPlan | null>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Calculate current allocations from holdings
    const currentAllocations = React.useMemo(() => {
        if (!profile?.holdings || profile.holdings.length === 0) {
            return [];
        }

        const total = profile.holdings.reduce((sum, token) => sum + (token.usdValue || 0), 0);
        if (total === 0) {
            return [];
        }

        return profile.holdings
            .filter(token => token.usdValue > 0) // Only include tokens with value
            .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0)) // Sort by value descending
            .map(token => ({
                asset: token.symbol || 'Unknown',
                percentage: (token.usdValue / total) * 100
            }));
    }, [profile?.holdings]);

    // Sort holdings by value
    const sortedHoldings = React.useMemo(() => {
        if (!profile?.holdings) return [];
        return [...profile.holdings].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
    }, [profile?.holdings]);

    // Generate investment plan for wallet addresses
    const handleGeneratePlan = async () => {
        if (!marketData || !fearGreedValue || !sectorPerformance) {
            setError('Missing market data required for generating investment plan');
            return;
        }

        setIsGeneratingPlan(true);
        setError(null);

        try {
            const plan = await generateInvestmentPlan(
                fearGreedValue,
                sectorPerformance,
                marketData,
                {
                    totalValue: profile.totalValue,
                    holdings: profile.holdings
                },
                profile.username
            );
            setGeneratedPlan(plan);
            // Add analysis tab if not already present
            if (!availableTabs.find(tab => tab.value === 'analysis')) {
                setAvailableTabs(prev => [
                    ...prev,
                    { value: 'analysis', icon: TrendingUp, label: 'Analysis' },
                    { value: 'allocation', icon: PieChartIcon, label: 'Target Allocation' }
                ]);
            }
            setSelectedTab('analysis');
        } catch (error) {
            console.error('Error generating investment plan:', error);
            setError('Failed to generate investment plan. Please try again.');
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    // Define available tabs based on profile data
    const [availableTabs, setAvailableTabs] = useState(() => {
        const tabs = [
            { value: 'holdings', icon: Wallet, label: 'Holdings' },
            { value: 'current-allocation', icon: PieChartIcon, label: 'Current Allocation' },
        ];

        if (profile.investmentPlan || generatedPlan) {
            tabs.push(
                { value: 'analysis', icon: TrendingUp, label: 'Analysis' },
                { value: 'allocation', icon: PieChartIcon, label: 'Target Allocation' }
            );
        }

        return tabs;
    });

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'holdings':
                return (
                    <div className="grid gap-4">
                        {sortedHoldings.map((token, index) => (
                            <HoldingCard key={index} token={token} />
                        ))}
                    </div>
                );
            case 'current-allocation':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Portfolio Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AllocationChart allocations={currentAllocations} />
                        </CardContent>
                    </Card>
                );
            case 'analysis':
                return (profile.investmentPlan || generatedPlan) && (
                    <AnalysisCard plan={generatedPlan || profile.investmentPlan} />
                );
            case 'allocation':
                return (profile.investmentPlan || generatedPlan) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Portfolio Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AllocationChart 
                                allocations={(generatedPlan || profile.investmentPlan)?.allocations || []} 
                            />
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    const handleShare = async () => {
        if (cardRef.current) {
            try {
                const dataUrl = await htmlToImage.toPng(cardRef.current, {
                    quality: 1.0,
                    backgroundColor: '#000',
                });

                // Convert base64 to blob
                const response = await fetch(dataUrl);
                const blob = await response.blob();

                // Create form data
                const formData = new FormData();
                formData.append('image', blob, 'portfolio.png');

                // Upload via our API route
                const uploadResponse = await fetch('/api/upload-share-image', {
                    method: 'POST',
                    body: formData
                });

                const { imageUrl } = await uploadResponse.json();

                // Create the share text with image
                const shareText = `Check out my crypto portfolio on InvestAssist.app! 🚀\n\nTotal Value: $${profile.totalValue.toFixed(2)}\n\nView my Portfolio: ${imageUrl}`;
                
                // Create the X share URL
                const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                
                // Open X share window
                window.open(shareUrl, '_blank', 'width=550,height=420');

            } catch (error) {
                console.error('Error sharing to X:', error);
            }
        }
    };

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

    // Add check for empty holdings
    if (!profile.holdings || profile.holdings.length === 0) {
        return (
            <Card className="border-2 border-yellow-500/30">
                <CardContent className="p-6">
                    <div className='text-center p-4 dark:bg-yellow-900/30 bg-yellow-100 dark:text-yellow-100 text-yellow-800 rounded-lg'>
                        No tokens found in this wallet
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
                    <Card 
                        ref={cardRef}
                        className="overflow-hidden border-0 shadow-lg dark:bg-black-800/50 bg-black/80 backdrop-blur-sm min-w-full"
                    >
                        <CardHeader className="border-b dark:border-gray-700/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                <div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                        {profile.username}&apos;s Portfolio
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{profile.walletAddress}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-muted-foreground">Total Value</p>
                                        <p className="text-3xl font-bold text-pink-500">${profile.totalValue.toFixed(2)}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleShare}
                                        className="ml-2"
                                        title="Share to X"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
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
                                    {renderTabContent()}
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
                                <div className="mt-2">
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

