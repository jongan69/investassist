"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchTrendingTopics } from "@/lib/twitter/fetchTrendingTopics";
import { useState } from "react";
import { TrendingUp } from "lucide-react"
import { useEffect } from "react";

export function TrendingTopics() {
    const [topics, setTopics] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrendingTopics(setTopics, setIsLoading, setError);
    }, []);
    if (isLoading) {
        return (
            <Card className="rounded-md border-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-600 dark:text-red-400">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        No trending topics available at the moment.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-md border-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    X Trending Topics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topics.map((topic, index) => {
                            const url = `https://x.com/search?q=${encodeURIComponent(topic)}`;
                            return (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="block w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer z-10 relative"
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center block">
                                        {topic}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 