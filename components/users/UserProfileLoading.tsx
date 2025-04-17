'use client'

import React from 'react';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList } from "@/components/ui/tabs";

export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Skeleton className="h-8 w-64 bg-muted/50" />
              <Skeleton className="h-4 w-48 mt-2 bg-muted/50" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Skeleton className="h-4 w-20 bg-muted/50" />
                <Skeleton className="h-8 w-32 mt-1 bg-muted/50" />
              </div>
              <Skeleton className="h-9 w-9 rounded-md bg-muted/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-muted/50" />
            ))}
          </TabsList>

          {/* Overview Tab Content */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[400px]">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-muted/50" />
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  <Skeleton className="h-full w-full rounded-lg bg-muted/50" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-muted/50" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full bg-muted/50" />
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-muted/50" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full bg-muted/50" />
                <Skeleton className="h-4 w-3/4 bg-muted/50" />
                <Skeleton className="h-4 w-5/6 bg-muted/50" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full bg-muted/50" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 