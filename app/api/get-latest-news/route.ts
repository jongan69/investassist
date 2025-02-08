// api/get-latest-news
import { fetchStockNews } from "@/lib/alpaca/fetchStockNews";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await fetchStockNews();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}