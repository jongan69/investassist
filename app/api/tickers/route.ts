import { NextResponse } from "next/server";
import tickers from "@/data/tickers.json";

export async function GET() {
  return NextResponse.json(tickers);
}