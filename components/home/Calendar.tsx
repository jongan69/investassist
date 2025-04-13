"use client"
import { fetchCalendar } from "@/lib/markets/fetchCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    const isDark = resolvedTheme === 'dark'
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadCalendar = async () => {
            try {
                console.log('Calendar component: Fetching calendar data...');
                const data = await fetchCalendar();
                console.log('Calendar component: Received data:', data);
                
                if (!data || !data.calendar) {
                    console.error('Calendar component: Invalid data structure:', data);
                    setError('Invalid data structure received');
                    return;
                }
                
                if (data.error) {
                    console.error('Calendar component: API returned error:', data.error);
                    setError(`API Error: ${data.error}`);
                    return;
                }
                
                if (data.calendar.length === 0) {
                    console.warn('Calendar component: No calendar events found');
                } else {
                    console.log(`Calendar component: Found ${data.calendar.length} events`);
                }
                
                setCalendarData(data);
            } catch (err) {
                console.error('Calendar component: Error loading calendar:', err);
                setError('Failed to load calendar data');
            }
        }
        loadCalendar()
    }, [])

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
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="border-b dark:border-gray-700/50 p-4">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Economic Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex flex-col justify-center items-center h-32">
                            <div className="text-red-500 mb-2">{error}</div>
                            <div className="text-sm text-muted-foreground">Please try again later or check your network connection.</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    if (!calendarData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="border-b dark:border-gray-700/50 p-4">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Economic Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex justify-center items-center h-32">
                            <div className="flex gap-1 px-1">
                                <motion.span 
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        isDark ? "bg-white" : "bg-black"
                                    )}
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.6 }}
                                />
                                <motion.span 
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        isDark ? "bg-white" : "bg-black"
                                    )}
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                />
                                <motion.span 
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        isDark ? "bg-white" : "bg-black"
                                    )}
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    // Check if calendar array is empty
    if (!calendarData.calendar || calendarData.calendar.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="border-b dark:border-gray-700/50 p-4">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Economic Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex justify-center items-center h-32">
                            <div className="text-muted-foreground">No economic events available</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full overflow-hidden border-0 shadow-lg dark:bg-black/80 bg-black/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="border-b dark:border-gray-700/50 p-4">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Economic Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b dark:border-gray-700/50">
                                    <TableHead className="w-[100px] text-muted-foreground">Time</TableHead>
                                    <TableHead className="text-muted-foreground">Release</TableHead>
                                    <TableHead className="w-[80px] text-muted-foreground">Impact</TableHead>
                                    <TableHead className="w-[100px] text-muted-foreground">For</TableHead>
                                    <TableHead className="w-[100px] text-muted-foreground">Actual</TableHead>
                                    <TableHead className="w-[100px] text-muted-foreground">Expected</TableHead>
                                    <TableHead className="w-[100px] text-muted-foreground">Prior</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calendarData?.calendar?.map((event: CalendarEvent, index: number) => (
                                    <TableRow 
                                        key={index} 
                                        className={cn(
                                            "transition-colors duration-150",
                                            isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-sm">{event.Time}</span>
                                                <span className="text-xs text-muted-foreground">{event.Date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{event.Release}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getImpactColor(event.Impact)}>
                                                {event.Impact}
                                            </Badge>
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
                </CardContent>
            </Card>
        </motion.div>
    )
}