import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createSignature } from "@/ultil/createSignature";

export async function POST(req: NextRequest) {
  try {
    const { apiSecret, accesskey, symbol } = await req.json();

    if (!accesskey || !apiSecret || !symbol) {
      return;
    }

    const params: Record<string, any> = {
      asset: symbol,
    };

    const parametersArray = Object.keys(params).map((key: any) => ({
      key,
      value: params[key],
      disabled: false, // Hoặc sử dụng giá trị thực tế nếu có
    }));

    const response = await axios.post(
      "https://api.mexc.com/api/v3/capital/convert",
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
    console.log("🚀 ~ POST ~ response /api/convertMX:", response);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const accesskey = req.nextUrl.searchParams.get("accesskey");
    const apiSecret = req.nextUrl.searchParams.get("apiSecret");

    if (!accesskey || !apiSecret) {
      return;
    }

    const params: Record<string, any> = {
      timestamp: Date.now(),
    };

    const parametersArray = Object.keys(params).map((key: any) => ({
      key,
      value: params[key],
      disabled: false,
    }));

    const response = await axios.get(
      "https://api.mexc.com/api/v3/capital/convert",
      {
        params: {
          ...params,
          signature: createSignature(parametersArray, apiSecret),
        },
        headers: {
          "Content-Type": "application/json",
          "X-MEXC-APIKEY": accesskey,
        },
      }
    );
    console.log("🚀 ~ GET ~ response history convertmx:", response);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
