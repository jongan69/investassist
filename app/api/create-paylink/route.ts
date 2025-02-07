import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const SECRET_API_KEY = process.env.HELIO_PAY_SECRET_KEY;
  const PUBLIC_API_KEY = process.env.HELIO_PAY_PUBLIC_KEY;
  const { walletId, currencyId, price, name } = await req.json();
  try {
    const result = await axios.post(
      `https://api.hel.io/v1/paylink/create/api-key`,
      {
        template: "OTHER", // Important that this is capitalized
        name: name,
        price: price, // price is int64 represented by the base units of each currency, e.g. "price": "1000000" = 1 USDC
        pricingCurrency: currencyId, // To get currency IDs, see the /get-currencies endpoint
        features: {},
        recipients: [
          {
            walletId: walletId, // Change this to your wallet id
            currencyId: currencyId, // To get currency IDs, see the /get-currencies endpoint
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
        },
        params: {
          apiKey: PUBLIC_API_KEY,
        },
      },
    );

    // console.log(`https://hel.io/pay/${result.data.id}`);

    return NextResponse.json(`https://hel.io/pay/${result.data.id}`, {
      status: 200,
    });
  } catch (error: any) {
    console.error(
      `${error.response?.data?.code} ${error.response?.data?.message}`,
    );

    return NextResponse.json(error.response?.data?.message || "Error", {
      status: error.response?.status || 500,
    });
  }
}