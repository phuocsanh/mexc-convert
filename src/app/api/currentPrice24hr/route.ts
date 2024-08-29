import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol");
    const accesskey = req.nextUrl.searchParams.get("accesskey");

    if (!symbol || !accesskey) {
      return;
    }

    const response = await axios.get(
      "https://api.mexc.com/api/v3/ticker/24hr",
      {
        params: {
          symbol: symbol,
          // timestamp: Date.now(),
          // signature: createSignature(parametersArray, apiSecret),
        },
        headers: {
          "Content-Type": "application/json",
          "X-MEXC-APIKEY": accesskey,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
