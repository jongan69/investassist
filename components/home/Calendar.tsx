"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils/utils"
import { fetchCalendar } from "@/lib/markets/fetchCalendar"

interface CalendarEvent {
    Date: string
    Time: string
    Datetime: string
    Release: string
    Impact: string
    For: string
    Actual: string | null
    Expected: string | null
    Prior: string | null
}

interface CalendarData {
    calendar: CalendarEvent[]
    total_events: number
    dates: string[]
}

export default function Calendar() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const isDark = resolvedTheme === 'dark'
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const retryCountRef = useRef<number>(0)
    const maxRetries = 2

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const loadCalendar = async () => {
            // If we've already reached max retries, don't try again
            if (retryCountRef.current > maxRetries) {
                console.log('Calendar component: Maximum retries reached, stopping attempts');
                setIsLoading(false);
                return;
            }

            try {
                if (!mounted) return;
                
                setIsLoading(true)
                setError(null)
                console.log('Calendar component: Fetching calendar data...');
                const data = await fetchCalendar();
                
                if (!mounted) return;
                
                if (!data || !data.calendar) {
                    console.error('Calendar component: Invalid data structure:', data);
                    setError('Invalid data structure received');
                    setIsLoading(false);
                    return;
                }
                
                if (data.error) {
                    console.error('Calendar component: API returned error:', data.error);
                    setError(`API Error: ${data.error}`);
                    
                    // Retry logic
                    if (retryCountRef.current < maxRetries) {
                        console.log(`Calendar component: Retrying (${retryCountRef.current + 1}/${maxRetries})...`);
                        retryCountRef.current += 1;
                        timeoutId = setTimeout(loadCalendar, 2000); // Retry after 2 seconds
                    } else {
                        console.log('Calendar component: Maximum retries reached, stopping attempts');
                        setIsLoading(false);
                    }
                    return;
                }
                
                if (data.calendar.length === 0) {
                    console.warn('Calendar component: No calendar events found');
                } else {
                    console.log(`Calendar component: Found ${data.calendar.length} events`);
                }
                
                setCalendarData(data);
                setIsLoading(false);
            } catch (err) {
                if (!mounted) return;
                
                console.error('Calendar component: Error loading calendar:', err);
                setError('Failed to load calendar data');
                
                // Retry logic
                if (retryCountRef.current < maxRetries) {
                    console.log(`Calendar component: Retrying (${retryCountRef.current + 1}/${maxRetries})...`);
                    retryCountRef.current += 1;
                    timeoutId = setTimeout(loadCalendar, 2000); // Retry after 2 seconds
                } else {
                    console.log('Calendar component: Maximum retries reached, stopping attempts');
                    setIsLoading(false);
                }
            }
        }
        
        loadCalendar();
        
        // Cleanup function to prevent memory leaks and state updates after unmount
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [mounted]) // Only run when mounted changes

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "3":
                return "bg-red-500/20 text-red-500 dark:bg-red-500/20 dark:text-red-500"
            case "2":
                return "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-500"
            case "1":
                return "bg-green-500/20 text-green-500 dark:bg-green-500/20 dark:text-green-500"
            default:
                return "bg-gray-500/20 text-gray-500 dark:bg-gray-500/20 dark:text-gray-500"
        }
    }

    const getValueColor = (actual: string | null, expected: string | null) => {
        if (!actual || !expected) return ""
        const actualNum = parseFloat(actual.replace(/[^0-9.-]+/g, ""))
        const expectedNum = parseFloat(expected.replace(/[^0-9.-]+/g, ""))
        if (actualNum > expectedNum) return "text-green-500 dark:text-green-500"
        if (actualNum < expectedNum) return "text-red-500 dark:text-red-500"
        return ""
    }

    if (error) {
        // Return null instead of showing an error message to hide the component
        return null;
    }

    if (isLoading) {
        return (
            <TooltipProvider delayDuration={0}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full overflow-hidden border-0 dark:bg-black/80 bg-white/80 backdrop-blur-sm transition-all duration-300">
                        <CardHeader className="border-b dark:border-gray-700/50 border-gray-200/50 p-4">
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">
                                Economic Calendar   
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="flex justify-center items-center h-32">
                                <div className="text-muted-foreground">Loading calendar data...</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </TooltipProvider>
        )
    }

    // Check if calendar array is empty
    if (!calendarData || !calendarData.calendar || calendarData.calendar.length === 0) {
        // Return null instead of showing an empty state message to hide the component
        return null;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full overflow-hidden border-0 dark:bg-black/80 bg-white/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="border-b dark:border-gray-700/50 border-gray-200/50 p-4">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-black dark:text-white">
                            Economic Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b dark:border-gray-700/50 border-gray-200/50">
                                        <TableHead className="w-[100px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Time</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Time of the economic event release</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Release</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Name of the economic indicator or event</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[80px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Impact</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Expected market impact: High (3), Medium (2), Low (1)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[100px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>For</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Currency or country the event relates to</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[100px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Actual</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Actual reported value of the economic indicator</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[100px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Expected</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Market consensus forecast for the indicator</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[100px] text-muted-foreground">
                                            <Tooltip>
                                                <TooltipTrigger>Prior</TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Previous reported value of the indicator</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {calendarData?.calendar?.map((event: CalendarEvent, index: number) => (
                                        <TableRow 
                                            key={index} 
                                            className={cn(
                                                "transition-colors duration-150",
                                                isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100/80"
                                            )}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-sm">{event.Time}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Time of the economic event release</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className="text-xs text-muted-foreground">{event.Date}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{event.Release}</TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="secondary" className={getImpactColor(event.Impact)}>
                                                            {event.Impact}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                        <p>Impact Level: {event.Impact === "3" ? "High" : event.Impact === "2" ? "Medium" : "Low"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{event.For}</TableCell>
                                            <TableCell className={getValueColor(event.Actual, event.Expected)}>
                                                {event.Actual || "-"}
                                            </TableCell>
                                            <TableCell>{event.Expected || "-"}</TableCell>
                                            <TableCell>{event.Prior || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden">
                            <ScrollArea className="h-[600px]">
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {calendarData?.calendar?.map((event: CalendarEvent, index: number) => (
                                        <div 
                                            key={index}
                                            className={cn(
                                                "p-4 transition-colors duration-150",
                                                isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100/80"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-sm font-medium">{event.Time}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Time of the economic event release</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className="text-xs text-muted-foreground">{event.Date}</span>
                                                </div>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="secondary" className={getImpactColor(event.Impact)}>
                                                            {event.Impact}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                        <p>Impact Level: {event.Impact === "3" ? "High" : event.Impact === "2" ? "Medium" : "Low"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <h3 className="font-medium mb-2">{event.Release}</h3>
                                                </TooltipTrigger>
                                                <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                    <p>Name of the economic indicator or event</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-muted-foreground">For:</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Currency or country the event relates to</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className="ml-1">{event.For}</span>
                                                </div>
                                                <div>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-muted-foreground">Actual:</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Actual reported value of the economic indicator</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className={cn("ml-1", getValueColor(event.Actual, event.Expected))}>
                                                        {event.Actual || "-"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-muted-foreground">Expected:</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Market consensus forecast for the indicator</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className="ml-1">{event.Expected || "-"}</span>
                                                </div>
                                                <div>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-muted-foreground">Prior:</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="z-50 max-w-[200px] p-2 text-sm" sideOffset={5}>
                                                            <p>Previous reported value of the indicator</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <span className="ml-1">{event.Prior || "-"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </TooltipProvider>
    )
}