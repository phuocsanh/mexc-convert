"use client";

import { useState } from "react";
import axios from "axios";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function Home() {
  const [apiSecret, setApiSecret] = useState("");
  const [accesskey, setAccesskey] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuyCoin = async () => {
    if (!accesskey || !apiSecret || !price || !quantity || !symbol) {
      return alert("Vui lòng nhập đử thông tin!");
    }
    try {
      setLoading(true);

      const response = await axios.post("/api/order", {
        symbol: symbol.toUpperCase(),
        quantity,
        price,
        apiSecret,
        accesskey,
      });

      alert(JSON.stringify(response.data));
    } catch (error: any) {
      alert(error.response ? error.response.data.error : error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex flex-col items-center justify-between p-24">
      {loading && <LoadingOverlay />}
      <div className="px-2 py-1 bg-slate-500 w-1/2 ">
        <h4 className="mb-2">Access Key</h4>
        <input
          type="text"
          value={accesskey}
          onChange={(e) => setAccesskey(e.target.value)}
          placeholder="Enter Access Key"
          className="w-[500px] p-2 border bg-slate-800 rounded"
        />
      </div>
      <div className="px-2 py-3 bg-slate-500 w-1/2 ">
        <h4 className="mb-2">Secret Key</h4>
        <input
          type="text"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="Enter Secret Key"
          className="w-[500px] p-2 border bg-slate-800 rounded"
        />
      </div>
      <div className="mt-2 px-2 py-3 bg-slate-500 w-1/2 ">
        <h1 className="text-yellow-300">INFO ORDER</h1>
        <h4 className="mb-2">Symbol (Tên COIN)</h4>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter Symbol"
          className="w-[500px] p-2 border bg-slate-800 rounded"
        />
        <h4 className="mt-3 mb-2">Quantity (Số lượng COIN)</h4>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter Quantity"
          className="w-[500px] p-2 border bg-slate-800 rounded"
        />
        <div className="flex flex-row">
          <div className="">
            <h4 className="mt-3 mb-2">Price (Giá COIN)</h4>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter Price"
              className="w-[500px] p-2 border bg-slate-800 rounded"
            />
          </div>
          <div className=" ml-20 flex justify-center">
            <button
              onClick={handleBuyCoin}
              className="hover:bg-green-400 w-36 self-center bg-green-600 rounded-md p-4"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
