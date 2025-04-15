'use client'
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChartIcon, Share2, TrendingUp, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { BaseInvestmentPlan, Profile } from "@/types/users";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import * as htmlToImage from 'html-to-image';
import { AllocationChart } from "./charts/AllocationChart";
import { HoldingCard } from "./HoldingCard";
import { AnalysisCard } from "./AnalysisCard";

export default function ProfileHeader({ profile }: { profile: Profile }) {
    const [selectedTab, setSelectedTab] = useState('holdings');
    const [generatedPlan, setGeneratedPlan] = useState<BaseInvestmentPlan | null>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);
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

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    // Sort holdings by value
    const sortedHoldings = React.useMemo(() => {
        if (!profile?.holdings) return [];
        return [...profile.holdings].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
    }, [profile?.holdings]);

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
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-black dark:text-white">
                                        {profile.username}&apos;s Holdings
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
    )
}