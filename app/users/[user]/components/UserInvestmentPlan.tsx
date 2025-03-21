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
import { generateInvestmentPlan } from '@/lib/users/generateInvesmentPlan';
import ProfileHeader from './ProfileHeader';
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

    return <ProfileHeader profile={profile} />;
};

export default UserInvestmentPlan;

