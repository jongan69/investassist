import axios from "axios";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const result = await axios.get(`https://api.hel.io/v1/currency/all`);

    return NextResponse.json(result.data, {
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