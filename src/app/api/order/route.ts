import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createSignature } from "@/ultil/createSignature";

export async function POST(req: NextRequest) {
  try {
    const { symbol, quantity, price, apiSecret, accesskey } = await req.json();
    const timestamp = Date.now();
    const params: Record<string, any> = {
      symbol: symbol + "USDT",
      side: "BUY",
      type: "LIMIT",
      quantity,
      price,
      timestamp,
    };

    const parametersArray = Object.keys(params).map((key: any) => ({
      key,
      value: params[key],
      disabled: false, // Hoặc sử dụng giá trị thực tế nếu có
    }));

    const signature = createSignature(parametersArray, apiSecret);
    const response = await axios.post(
      "https://api.mexc.com/api/v3/order",
      null,
      {
        params: {
          ...params,
          signature,
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
