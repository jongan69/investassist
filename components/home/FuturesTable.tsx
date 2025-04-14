'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Future {
    ticker: string;
    label: string;
    group: string;
    perf: number;
}

interface FuturesData {
    futures: Future[];
    total_futures: number;
    dates: (string | null)[];
}

export function FuturesTable() {
    const [data, setData] = useState<FuturesData>({ futures: [], total_futures: 0, dates: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Fetch data from the API
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/finviz/futures');
            
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }
            
            const result = await response.json();
            setData(result);
            
            // Initialize all groups as expanded
            const initialExpandedState = result.futures.reduce((acc: Record<string, boolean>, future: Future) => {
                acc[future.group] = true;
                return acc;
            }, {});
            setExpandedGroups(initialExpandedState);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setData({ futures: [], total_futures: 0, dates: [] });
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Group futures by their category
    const groupedFutures = data.futures.reduce((acc, future) => {
        if (!acc[future.group]) {
            acc[future.group] = [];
        }
        acc[future.group].push(future);
        return acc;
    }, {} as Record<string, Future[]>);

    // Sort groups by average performance
    const sortedGroups = Object.entries(groupedFutures)
        .sort(([, a], [, b]) => {
            const avgA = a.reduce((sum, f) => sum + f.perf, 0) / a.length;
            const avgB = b.reduce((sum, f) => sum + f.perf, 0) / b.length;
            return avgB - avgA;
        });

    // Toggle group expansion
    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    // Toggle all groups
    const toggleAllGroups = (expanded: boolean) => {
        const newState = Object.keys(groupedFutures).reduce((acc, group) => {
            acc[group] = expanded;
            return acc;
        }, {} as Record<string, boolean>);
        setExpandedGroups(newState);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pt-2">
                <div className="flex flex-wrap gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleAllGroups(true)}
                        className="text-xs"
                    >
                        Expand All
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleAllGroups(false)}
                        className="text-xs"
                    >
                        Collapse All
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                    {sortedGroups.map(([group]) => (
                        <Badge
                            key={group}
                            variant={selectedGroup === group ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                        >
                            {group}
                        </Badge>
                    ))}
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={fetchData} 
                    disabled={loading}
                    className="h-8 w-8"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedGroups
                        .filter(([group]) => !selectedGroup || group === selectedGroup)
                        .map(([group, futures]) => {
                            const isExpanded = expandedGroups[group];
                            const avgPerf = futures.reduce((sum, f) => sum + f.perf, 0) / futures.length;
                            
                            return (
                                <Card key={group} className="overflow-hidden">
                                    <CardHeader 
                                        className="py-4 px-5 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => toggleGroup(group)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                <CardTitle className="text-base font-medium">
                                                    {group}
                                                </CardTitle>
                                                <Badge variant="secondary" className="text-xs">
                                                    {futures.length} items
                                                </Badge>
                                            </div>
                                            <Badge 
                                                variant={avgPerf > 0 ? "default" : "destructive"} 
                                                className={cn(
                                                    "text-xs",
                                                    avgPerf > 0 ? "bg-green-500/20 text-green-600" : ""
                                                )}
                                            >
                                                {avgPerf > 0 ? '+' : ''}{avgPerf.toFixed(2)}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    {isExpanded && (
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="w-24 px-4 py-3">Ticker</TableHead>
                                                            <TableHead className="px-4 py-3">Name</TableHead>
                                                            <TableHead className="text-right w-24 px-4 py-3">Performance</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {futures
                                                            .sort((a, b) => b.perf - a.perf)
                                                            .map((future) => (
                                                                <TableRow key={future.ticker} className="hover:bg-muted/50">
                                                                    <TableCell className="font-medium px-4 py-3">
                                                                        {future.ticker}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3">{future.label}</TableCell>
                                                                    <TableCell className={cn(
                                                                        "text-right px-4 py-3",
                                                                        future.perf > 0 ? "text-green-600" : "text-red-600"
                                                                    )}>
                                                                        {future.perf > 0 ? '+' : ''}{future.perf.toFixed(2)}%
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                </div>
            )}
        </div>
    );
} 