"use client"

import React, { useState } from 'react';

import { Card, CardContent } from "@/components/ui/card";

import UserProfileContainer from './UserProfileContainer';

import { Profile, BaseInvestmentPlan } from '@/types/users';

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
    tweets?: any[];
}

const UserInvestmentPlan: React.FC<UserInvestmentPlanProps> = ({
    profile,
    tweets = []
}) => {
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

    // If we have a generated plan, update the profile with it
    if (generatedPlan) {
        profile = {
            ...profile,
            investmentPlan: generatedPlan
        };
    }

    return <UserProfileContainer profile={profile} tweets={tweets} />;
};

export default UserInvestmentPlan;

