"use client";

import { useState } from "react";
import axios from "axios";
import LoadingOverlay from "@/components/LoadingOverlay";

const BuySellComponent = () => {
  const [isBtnBuy, setIsBtnBuy] = useState(true);
  const [isBtnSell, setIsBtnSell] = useState(true);
  const [focus, setFocus] = useState(false);
  const [apiSecret, setApiSecret] = useState("");
  const [accesskey, setAccesskey] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [quantitySell, setQuantitySell] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuyCoin = async () => {
    setFocus(true);
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
      if (response) {
        setIsBtnBuy(false);
        alert(JSON.stringify(response.data));
      }
    } catch (error: any) {
      alert(error.response ? error.response.data.error : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellCoin = async () => {
    setFocus(true);

    if (!accesskey || !apiSecret || !priceSell || !quantitySell || !symbol) {
      return alert("Vui lòng nhập đử thông tin!");
    }
    try {
      setLoading(true);

      const response = await axios.post("/api/sell", {
        symbol: symbol.toUpperCase(),
        quantity: quantitySell,
        price: priceSell,
        apiSecret,
        accesskey,
      });
      if (response) {
        setIsBtnSell(false);
        alert(JSON.stringify(response.data));
      }
    } catch (error: any) {
      alert(error.response ? error.response.data.error : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col ${
        focus ? "bg-sky-950" : "bg-slate-600"
      }  justify-center  mr-10 w-1/2`}
    >
      {loading && <LoadingOverlay />}
      <div className="flex flex-col ml-5 mt-4">
        <h4 className="mb-2">Account Name</h4>
        <input
          type="text"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="Enter Account Name"
          className="w-4/5 text-fuchsia-500 text-2xl p-2 border bg-slate-800 rounded focus:bg-teal-800"
        />
      </div>

      <div className={`flex flex-row  mr-10`}>
        <div className={`flex-col ml-4`}>
          <div className="px-2 py-1 w-full">
            <h4 className="mb-2 mt-2">Access Key</h4>
            <input
              type="text"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              value={accesskey}
              onChange={(e) => setAccesskey(e.target.value)}
              placeholder="Enter Access Key"
              className="w-4/5 p-2 border bg-slate-800 rounded focus:bg-teal-800"
            />
          </div>
          <div className="px-2 py-2 w-full ">
            <h4 className="mb-2">Secret Key</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter Secret Key"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
          </div>
          <div className="mt-2 px-2 py-3 w-full ">
            <h1 className="text-yellow-300">INFO ORDER</h1>
            <h4 className="mb-2">Symbol (Tên COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter Symbol"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            <h4 className="mt-3 mb-2">Price (Giá COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter Price"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            <h4 className="mt-3 mb-2">Quantity (Số lượng COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />

            <div className="flex w-4/5  mt-4 flex-row justify-end">
              <button
                onClick={handleBuyCoin}
                className="hover:bg-green-400 w-full  self-end bg-green-600 rounded-md p-3"
              >
                Buy
              </button>
              {/* {isBtnBuy ? (
                <button
                  onClick={handleBuyCoin}
                  className="hover:bg-green-400 w-full  self-end bg-green-600 rounded-md p-3"
                >
                  Buy
                </button>
              ) : (
                <h4>Đã mua</h4>
              )} */}
            </div>
          </div>
        </div>

        <div className="h-full w-2 bg-slate-50"></div>

        <div className={`flex-col ml-4`}>
          <div className="mt-2 px-2 py-3 w-full ">
            <h1 className="text-yellow-300">
              Name Coin : {symbol.toUpperCase()}
            </h1>
            <h4 className="mt-3 mb-2">Price (Giá COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={priceSell}
              onChange={(e) => setPriceSell(e.target.value)}
              placeholder="Enter Price"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            <h4 className="mt-3 mb-2">Quantity (Số lượng COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={quantitySell}
              onChange={(e) => setQuantitySell(e.target.value)}
              placeholder="Enter Quantity"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />

            <div className="flex w-4/5  mt-4 flex-row justify-end">
              <button
                onClick={handleSellCoin}
                className="hover:bg-red-500 w-full  self-end bg-red-600 rounded-md p-3"
              >
                SELL
              </button>
              {/* {isBtnSell ? (
                <button
                  onClick={handleSellCoin}
                  className="hover:bg-red-500 w-full  self-end bg-red-600 rounded-md p-3"
                >
                  SELL
                </button>
              ) : (
                <h4>Đã bán</h4>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellComponent;
