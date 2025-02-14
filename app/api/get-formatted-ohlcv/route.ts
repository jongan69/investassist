import yahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";
import { standardIntervals, StandardInterval, fetchAllTimeframes } from "@/lib/solana/fetchCoinQuote";

interface StandardOHLCV {
    timestamp: number;  // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

function formatYahooData(data: any): StandardOHLCV[] {
    const timestamps = data.timestamp;
    const quotes = data.indicators.quote[0];

    return timestamps.map((time: number, index: number) => ({
        timestamp: time,
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index]
    })).filter((candle: any) =>
        candle.open !== null &&
        candle.high !== null &&
        candle.low !== null &&
        candle.close !== null &&
        candle.volume !== null
    );
}

function formatKrakenData(data: any, interval: StandardInterval): StandardOHLCV[] {
    const ohlcv = data[interval]?.data?.result?.[Object.keys(data[interval].data.result)[0]];
    if (!ohlcv) return [];

    return ohlcv.map((candle: any) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[6])
    }));
}

// Yahoo Finance interval mapping
const yahooIntervalMapping: Partial<Record<StandardInterval, "1m" | "5m" | "15m" | "30m" | "60m" | "1d" | "1h" | "1wk">> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "1d": "1d",
    "1w": "1wk",
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get("symbol") || "AAPL";
        const interval = (searchParams.get("interval") || "1d") as StandardInterval;

        if (!Object.keys(standardIntervals).includes(interval)) {
            return NextResponse.json(
                { error: `Invalid interval. Supported intervals: ${Object.keys(standardIntervals).join(", ")}` },
                { status: 400 }
            );
        }

        // Try Kraken first
        const krakenresult = await fetchAllTimeframes(symbol);

        if (!krakenresult.error && krakenresult.data) {
            return NextResponse.json({
                source: 'kraken',
                data: formatKrakenData(krakenresult.data, interval)
            });
        }

        // Fall back to Yahoo Finance
        const yahooInterval = yahooIntervalMapping[interval];

        if (!yahooInterval) {
            return NextResponse.json(
                { error: `Interval ${interval} not supported by Yahoo Finance` },
                { status: 400 }
            );
        }

        const startDate = new Date();
        if(interval === '1m') startDate.setDate(startDate.getDate() - 8); // Get last 30 days by default
        else startDate.setDate(startDate.getDate() - 30); // Get last 30 days by default
        const endDate = new Date();

        const yahooresult = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: endDate,
            interval: yahooInterval,
            return: "object"
        });

        return NextResponse.json({
            source: 'yahoo',
            data: formatYahooData(yahooresult)
        });

    } catch (error) {
        console.error("Error fetching chart data:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
