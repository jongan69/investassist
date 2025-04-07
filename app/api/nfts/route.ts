import { NextResponse } from 'next/server';

const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || typeof address !== 'string') {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`${HELIUS_RPC_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'wallet-holdings',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress: address,
                    page: 1,
                    limit: 1000,
                    sortBy: {
                        sortBy: 'created',
                        sortDirection: 'asc'
                    },
                    options: {
                        showUnverifiedCollections: false,
                        showCollectionMetadata: true,
                        showGrandTotal: false,
                        showFungible: false,
                        showNativeBalance: false,
                        showInscription: true,
                        showZeroBalance: false
                    }
                }
            })
        });

        const data = await response.json();
        console.log(data);

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        const filteredNfts = data.result.items.filter((item: any) => item.compression.compressed === false && item.content.metadata.attributes.length > 0);

        return NextResponse.json(filteredNfts, { status: 200 });
    } catch (error) {
        console.error('Error fetching wallet holdings:', error);
        return NextResponse.json({ error: 'Failed to fetch wallet holdings' }, { status: 500 });
    }
} 