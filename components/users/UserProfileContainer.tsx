'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import { Share2, Wallet, PieChart, TrendingUp, MessageSquare } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

import { TokenCard } from '@/components/users/TokenCard';
import { ClientAllocationChart } from '@/components/users/charts/ClientAllocationChart';
import InvestmentPlanLoading from '@/components/users/InvestmentPlanLoading';

import { AnalysisCard } from './AnalysisCard';
import UserTweets from './UserTweets';

import { Profile } from '@/types/users';

interface UserProfileContainerProps {
  profile: Profile;
  tweets: any[];
  isGeneratingPlan?: boolean;
}

export default function UserProfileContainer({ profile, tweets, isGeneratingPlan = false }: UserProfileContainerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Handle share functionality
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

  // Render the investment plan loading component if plan is being generated
  if (isGeneratingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-3xl mx-auto">
          <InvestmentPlanLoading />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {profile.username}&apos;s Portfolio
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                {profile.walletAddress}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-3xl font-bold text-pink-500">
                  ${profile.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
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
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="holdings" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Holdings</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="allocation" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Allocation</span>
              </TabsTrigger>
              <TabsTrigger value="tweets" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Tweets</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-[400px]">
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)]">
                    <ClientAllocationChart
                      allocations={profile.investmentPlan?.allocations || []}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Holdings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.holdings.slice(0, 5).map((token, index) => (
                      <TokenCard
                        key={token.tokenAddress}
                        token={token}
                        rank={index + 1}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalysisCard plan={profile.investmentPlan} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-4">
              {profile.holdings.map((token, index) => (
                <TokenCard
                  key={token.tokenAddress}
                  token={token}
                  rank={index + 1}
                />
              ))}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalysisCard plan={profile.investmentPlan} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Allocation Tab */}
            <TabsContent value="allocation">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle>Portfolio Allocation</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  <ClientAllocationChart
                    allocations={profile.investmentPlan?.allocations || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tweets Tab */}
            <TabsContent value="tweets">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tweets</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  <UserTweets tweets={tweets} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
} 