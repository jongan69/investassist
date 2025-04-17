import { NextRequest, NextResponse } from 'next/server';

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${HELIUS_RPC_URL}/?api-key=${process.env.HELIUS_API_KEY}`, {
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
            showUnverifiedCollections: true,
            showCollectionMetadata: true,
            showGrandTotal: true,
            showFungible: true,
            showNativeBalance: true,
            showInscription: true,
            showZeroBalance: false
          }
        }
      })
    });

    const data = await response.json();

    console.log(data);
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching wallet holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet holdings' },
      { status: 500 }
    );
  }
} 