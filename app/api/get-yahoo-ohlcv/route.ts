import yahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "AAPL";
    const interval = searchParams.get("interval") || "1d";
    const period1 = searchParams.get("period1");
    const period2 = searchParams.get("period2");

    // Convert Unix timestamps to Date objects
    const startDate = period1 ? new Date(parseInt(period1) * 1000) : new Date("2024-01-01");
    const endDate = period2 ? new Date(parseInt(period2) * 1000) : new Date();

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: interval as "1d" | "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "5d" | "1wk" | "1mo" | "3mo",
      return: "object" as const
    };

    // console.log("Fetching data with options:", {
    //   symbol,
    //   period1: startDate.toISOString(),
    //   period2: endDate.toISOString(),
    //   interval
    // });

    const result = await yahooFinance.chart(symbol, queryOptions);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
