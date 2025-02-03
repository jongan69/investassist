import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { transactionSigature } = await req.json();
  const SECRET_API_KEY = process.env.HELIO_PAY_SECRET_KEY;
  const PUBLIC_API_KEY = process.env.HELIO_PAY_PUBLIC_KEY;

  try {
    const result = await axios.get(
      `https://api.hel.io/v1/payment-state/signature/${transactionSigature}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_API_KEY}`,
        },
        params: {
          apiKey: PUBLIC_API_KEY,
        },
      },
    );

    // This is the internal Helio ID of the transaction, if it matches the one recieved in onSuccess callback from the Helio Checkout, the transaction is valid!
    console.log(result.data.meta.id);

    return NextResponse.json(result.data, {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(error.response?.data?.message || "Error", {
      status: error.response?.status || 500,
    });
  }
}