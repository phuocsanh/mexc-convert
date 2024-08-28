import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createSignature } from "@/ultil/createSignature";

export async function DELETE(req: NextRequest) {
  try {
    const accesskey = req.nextUrl.searchParams.get("accesskey");
    const apiSecret = req.nextUrl.searchParams.get("apiSecret");
    const symbol = req.nextUrl.searchParams.get("symbol");
    const orderId = req.nextUrl.searchParams.get("orderId");

    if (!accesskey || !apiSecret || !symbol || !orderId) return;

    const params: Record<string, any> = {
      symbol: symbol + "USDT",
      orderId,
    };

    const parametersArray = Object.keys(params).map((key: any) => ({
      key,
      value: params[key],
      disabled: false, // Hoặc sử dụng giá trị thực tế nếu có
    }));

    const response = await axios.delete("https://api.mexc.com/api/v3/order", {
      params: {
        ...params,
        timestamp: Date.now(),
        signature: createSignature(parametersArray, apiSecret),
      },
      headers: {
        "Content-Type": "application/json",
        "X-MEXC-APIKEY": accesskey,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { symbol, quantity, price, apiSecret, accesskey } = await req.json();
    if (!symbol || !quantity || !price || !apiSecret || !accesskey) return;
    const params: Record<string, any> = {
      symbol: symbol + "USDT",
      side: "BUY",
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

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol");
    const accesskey = req.nextUrl.searchParams.get("accesskey");
    const apiSecret = req.nextUrl.searchParams.get("apiSecret");

    if (!symbol || !accesskey || !apiSecret) {
      return;
    }

    const params: Record<string, any> = {
      symbol: symbol + "USDT",
    };

    const parametersArray = Object.keys(params).map((key: any) => ({
      key,
      value: params[key],
      disabled: false, // Hoặc sử dụng giá trị thực tế nếu có
    }));

    const response = await axios.get("https://api.mexc.com/api/v3/openOrders", {
      params: {
        ...params,
        timestamp: Date.now(),
        signature: createSignature(parametersArray, apiSecret),
      },
      headers: {
        "Content-Type": "application/json",
        "X-MEXC-APIKEY": accesskey,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
