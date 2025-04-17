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

export default function UserProfileContainer({ profile, tweets = [], isGeneratingPlan = false }: UserProfileContainerProps) {
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
        className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="w-full sm:w-auto min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate">
                {profile.username}&apos;s Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-all">
                {profile.walletAddress}
              </p>
            </div>
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end min-w-0">
              <div className="text-right min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate">
                  ${profile.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="ml-4 flex-shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                title="Share to X"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div variants={itemVariants} className="w-full">
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap w-full gap-2 sm:gap-3 mb-8 sm:mb-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg rounded-lg p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="holdings" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Holdings</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="allocation" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Allocation</span>
              </TabsTrigger>
              <TabsTrigger value="tweets" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Tweets</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <Card className="h-[300px] sm:h-[400px] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="py-2">
                    <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Portfolio Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)] p-6">
                    <div className="h-full w-full">
                      <ClientAllocationChart
                        allocations={profile.investmentPlan?.allocations || []}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-6">
                    <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Top Holdings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
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

              <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6">
                  <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AnalysisCard plan={profile.investmentPlan} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-4">
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {profile.holdings.map((token, index) => (
                  <TokenCard
                    key={token.tokenAddress}
                    token={token}
                    rank={index + 1}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis">
              <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6">
                  <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AnalysisCard plan={profile.investmentPlan} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Allocation Tab */}
            <TabsContent value="allocation">
              <Card className="h-[500px] sm:h-[700px] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Portfolio Allocation</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)] p-6 pt-2">
                  <div className="h-full w-full flex items-center justify-center">
                    <ClientAllocationChart
                      allocations={profile.investmentPlan?.allocations || []}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tweets Tab */}
            <TabsContent value="tweets">
              <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="p-6">
                  <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Recent Tweets</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] sm:max-h-[600px] overflow-y-auto p-6">
                  {tweets && tweets.length > 0 ? (
                    <UserTweets tweets={tweets} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-center">No tweets available at the moment.</p>
                      <p className="text-sm text-center mt-2">Tweets could not be loaded or the user has no recent tweets.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
} 