import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createSignature } from "@/ultil/createSignature";

export async function POST(req: NextRequest) {
  try {
    const { symbol, quantity, price, apiSecret, accesskey } = await req.json();

    const requests = Array.from({ length: 9 }).map(async () => {
      const params: Record<string, any> = {
        symbol: symbol,
        side: "SELL",
        type: "LIMIT",
        quantity,
        price,
      };

      const parametersArray = Object.keys(params).map((key: any) => ({
        key,
        value: params[key],
        disabled: false, // Hoặc sử dụng giá trị thực tế nếu có
      }));

      const response = await axios.post(
        "https://api.mexc.com/api/v3/order",
        null,
        {
          params: {
            ...params,
            timestamp: Date.now(),
            signature: createSignature(parametersArray, apiSecret),
          },
          headers: {
            "Content-Type": "application/json",
            "X-MEXC-APIKEY": accesskey,
          },
        }
      );

      return response.data;
    });

    const results = await Promise.all(requests);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
