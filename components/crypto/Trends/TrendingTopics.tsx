"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTrendingTopics } from "@/lib/twitter/fetchTrendingTopics";
import { useState } from "react";
import { TrendingUp } from "lucide-react"
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function TrendingTopics() {
    const { resolvedTheme } = useTheme();
    const [topics, setTopics] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrendingTopics(setTopics, setIsLoading, setError);
    }, []);

    if (isLoading) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors flex items-center gap-2`}>
                            <TrendingUp className="w-6 h-6" />
                            X Trending Topics
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-black/10 dark:bg-white/10 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center text-red-600 dark:text-red-400">
                    {error}
                </div>
            </motion.div>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <motion.div
                className={cn(
                    "group relative rounded-xl",
                    `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                    "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center text-gray-600 dark:text-gray-400">
                    No trending topics available at the moment.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn(
                "group relative rounded-xl",
                `bg-gradient-to-r from-${resolvedTheme === 'dark' ? 'white' : 'black'} to-${resolvedTheme === 'dark' ? 'white' : 'black'}`,
                "shadow-lg transition-all duration-300 hover:shadow-2xl p-6"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'} transition-colors flex items-center gap-2`}>
                        <TrendingUp className="w-6 h-6" />
                        X Trending Topics
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
                    {topics.map((topic, index) => {
                        const url = `https://x.com/search?q=${encodeURIComponent(topic)}`;
                        return (
                            <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full min-h-[80px] bg-black/5 dark:bg-white/5 rounded-lg p-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 relative z-20"
                            >
                                <span className="text-sm font-medium text-black dark:text-white text-center block">
                                    {topic}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
} 