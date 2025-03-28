import { DuneClient, QueryParameter } from "@duneanalytics/client-sdk";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {

    try {
        if (!process.env.DUNE_API_KEY) {
            return NextResponse.json({ error: 'Dune API key is required' }, { status: 400 } );
        }
        const { walletAddress } = await req.json();
        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }
        const dune = new DuneClient(process.env.DUNE_API_KEY);
        const queryID = 4680134;
        const params = [
            QueryParameter.text("wallet_address", walletAddress)
        ];
          
          
        const query_result = await dune.runQuery({queryId: queryID, query_parameters: params});


        return NextResponse.json({
            pnl: query_result.result?.rows || []
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching PNL:', error);
        return NextResponse.json({
            error: 'Internal server error while fetching PNL',
            errorMessage: error.message.error
        }, { status: 500 });
    }
}