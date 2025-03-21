"use client"
import React, { useState } from 'react';
import { Profile, BaseInvestmentPlan } from '@/types/users';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, PieChart as PieChartIcon } from "lucide-react";
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
    profile }) => {
    const [generatedPlan, setGeneratedPlan] = useState<BaseInvestmentPlan | null>(null);

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

