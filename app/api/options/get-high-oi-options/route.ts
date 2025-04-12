// api/get-high-oi-options?ticker=AAPL&optionType=call
import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest";
import { NextResponse } from "next/server";
import { validateTicker } from "@/lib/utils";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const decodedTicker = decodeURIComponent(ticker ?? '');
    const optionType = searchParams.get('optionType');

    // Input validation
    if (!ticker) {
        return NextResponse.json(
            { error: 'Ticker symbol is required' }, 
            { status: 400 }
        );
    }

    if (!validateTicker(decodedTicker)) {
        return NextResponse.json(
            { error: `Invalid ticker symbol: ${decodedTicker}. Please check the symbol and try again.` }, 
            { status: 400 }
        );
    }

    if (optionType && !['call', 'put'].includes(optionType.toLowerCase())) {
        return NextResponse.json(
            { error: 'Option type must be either "call" or "put"' }, 
            { status: 400 }
        );
    }

    try {
        const result = await getHighOpenInterestContracts(decodedTicker, optionType ?? 'call');
        
        // If there's an error in the result, return it with appropriate status
        if (result.error) {
            return NextResponse.json(
                { error: result.error }, 
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error in get-high-oi-options API:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while fetching options data' }, 
            { status: 500 }
        );
    }
}