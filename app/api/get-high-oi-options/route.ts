// api/get-high-oi-options?ticker=AAPL&optionType=call
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const optionType = searchParams.get('optionType');
    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }
    try {
        const result = await getHighOpenInterestContracts(ticker, optionType ?? 'call');
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}