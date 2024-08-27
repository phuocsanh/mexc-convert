"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LoadingOverlay from "@/components/LoadingOverlay";
import { containsDigitGreaterThanOrEqualTo2 } from "@/ultil";

const BuySellComponent = () => {
  const [start, setStart] = useState(false);
  const [responseOrderData, setResponseOrderData] = useState<any>(null);
  const [idOrderBuy, setIdOrderBuy] = useState(null);
  const [isBtnBuy, setIsBtnBuy] = useState(true);
  const [isBtnSell, setIsBtnSell] = useState(true);
  const [focus, setFocus] = useState(false);
  const [apiSecret, setApiSecret] = useState("");
  const [accesskey, setAccesskey] = useState("");
  const [symbol, setSymbol] = useState("");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [quantitySell, setQuantitySell] = useState("");
  const [quantityOrderSell, setQuantityOrderSell] = useState([]);
  const [priceSell, setPriceSell] = useState("");
  const [loading, setLoading] = useState(false);

  const getAccountInFo = async () => {
    try {
      const response = await axios.get("/api/accountInfo", {
        params: {
          accesskey,
          apiSecret,
        },
      });
      if (response.status !== 200) return null;
      return response.data;
    } catch (error) {}
  };

  const getPriceCoinAndCovertMX = async () => {
    try {
      if (accesskey && symbolSearch && apiSecret) {
        const response = await axios.get("/api/currentPrice", {
          params: {
            symbol: symbol.toUpperCase(),
            accesskey,
            apiSecret,
          },
        });
        console.log("🚀 ~ getPriceCoinAndCovertMX ~ response:", response);
        if (response.status === 200 && response.data.price) {
          const isGreaterOne = containsDigitGreaterThanOrEqualTo2(
            response.data.price
          );
          if (isGreaterOne) {
            convertMX();
          }
        }
        return response.data;
      }
    } catch (error) {
      console.log("🚀 ~ getPriceCoin ~ error:", error);
    }
  };

  const convertMX = async () => {
    if (!accesskey || !apiSecret) {
      return;
    }

    try {
      const accountInfo = await getAccountInFo();

      if (accountInfo?.balances && accountInfo?.balances.length) {
        const currentCoin = accountInfo?.balances.find(
          (balance: any, _: any) => balance.asset === symbolSearch.toUpperCase()
        );
        if (!currentCoin) {
          return;
        }
        await axios.post("/api/convertMX", {
          symbol: symbol.toUpperCase(),
          apiSecret,
          accesskey,
        });

        const responseOrderCurrent = await axios.get("/api/order/openOrders", {
          params: {
            symbol: symbolSearch.toUpperCase(),
            accesskey,
            apiSecret,
          },
        });

        if (responseOrderCurrent.status === 200 && responseOrderCurrent.data) {
          if (responseOrderCurrent?.data?.length > 0) {
            const filterOrderSellItem = responseOrderCurrent.data.filter(
              (orderSell: any, _: any) => orderSell?.side === "SELL"
            );

            if (filterOrderSellItem.length > 0) {
              const responseOrderDelete = await axios.delete("/api/order", {
                params: {
                  orderId: filterOrderSellItem?.[0]?.orderId,
                  symbol: symbolSearch.toUpperCase(),
                  accesskey,
                  apiSecret,
                },
              });

              if (responseOrderDelete.status === 200) {
                convertMX();
              }
            } else {
              return;
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ convertMX ~ error:", error);
    }
  };

  const getCurrentOrder = async () => {
    if (!symbolSearch || !accesskey || !apiSecret) {
      return;
    }
    const responseOrderCurrent = await axios.get("/api/order", {
      params: {
        symbol: symbolSearch.toUpperCase(),
        accesskey,
        apiSecret,
      },
    });
    if (responseOrderCurrent.status === 200 && responseOrderCurrent.data) {
      const filterOrderSellItem = responseOrderCurrent.data.filter(
        (orderSell: any, _: any) => orderSell?.side === "SELL"
      );

      if (filterOrderSellItem) {
        setQuantityOrderSell(filterOrderSellItem);
      }
    }
  };

  useEffect(() => {
    if (!start) {
      return;
    }
    if (accesskey && apiSecret && symbolSearch) {
      setInterval(() => {
        getCurrentOrder();

        const autoSellCoinAndSellMX = async () => {
          const accountInfo = await getAccountInFo();
          console.log("🚀 ~ autoSellCoinAndSellMX ~ accountInfo:", accountInfo);

          if (accountInfo?.balances?.length) {
            const isMXCoin = accountInfo?.balances.find(
              (balance: any, _: any) => balance.asset === "MX"
            );
            console.log("🚀 ~ autoSellCoinAndSellMX ~ isMXCoin:", isMXCoin);
            const currentCoin = accountInfo?.balances.find(
              (balance: any, _: any) =>
                balance.asset === symbolSearch.toUpperCase()
            );
            console.log(
              "🚀 ~ autoSellCoinAndSellMX ~ currentCoin:",
              currentCoin
            );
            if (currentCoin) {
              handleSellCoin();
            }
            // if (isMXCoin) {
            //   try {
            //     const responseMXPrice = await axios.get("/api/currentPrice", {
            //       params: {
            //         symbol: "MX",
            //         accesskey,
            //         apiSecret,
            //       },
            //     });
            //     console.log(
            //       "🚀 ~ autoSellCoinAndSellMX ~ responseMXPrice:",
            //       responseMXPrice
            //     );
            //     if (
            //       responseMXPrice.status !== 200 ||
            //       !responseMXPrice?.data?.price
            //     )
            //       return;
            //     if (Number(responseMXPrice?.data?.price) <= 3.0) {
            //       return alert("Giá MX nhỏ hơn 3.0 USDT vui lòng kiểm tra lại");
            //     }
            //     if (!isMXCoin?.free) {
            //       return alert("Số lượng MX không có");
            //     }
            //     console.log(
            //       "🚀 ~ autoSellCoinAndSellMX ~ isMXCoin?.free:",
            //       isMXCoin?.free
            //     );

            //     let decimalPlaces: number = 2;
            //     let factor: number = Math.pow(10, decimalPlaces);

            //     // Làm tròn xuống số
            //     let roundedNumber: number =
            //       Math.floor(isMXCoin?.free * factor) / factor;
            //     console.log(
            //       "🚀 ~ autoSellCoinAndSellMX ~ roundedNumber:",
            //       roundedNumber
            //     );

            //     const response = await axios.post("/api/sell", {
            //       symbol: "MX",
            //       quantity: roundedNumber.toString(),
            //       price: responseMXPrice?.data?.price,
            //       apiSecret,
            //       accesskey,
            //     });
            //     if (response) {
            //     }
            //   } catch (error: any) {
            //   } finally {
            //     setLoading(false);
            //   }
            // }
          }
        };

        autoSellCoinAndSellMX();
      }, 5000);
    }
  }, [
    isBtnSell,
    accesskey,
    apiSecret,
    symbolSearch,
    start,
    quantitySell,
    priceSell,
  ]);

  useEffect(() => {
    if (!start) {
      return;
    }
    if (idOrderBuy && accesskey && apiSecret && symbolSearch) {
      const getOrderById = async () => {
        const responseOrderData = await axios.get("/api/getOrderById", {
          params: {
            accesskey,
            apiSecret,
            orderId: idOrderBuy,
            symbol: symbolSearch.toUpperCase(),
          },
        });
        if (responseOrderData.status === 200) {
          setResponseOrderData(responseOrderData.data);
        }
      };

      setInterval(() => {
        getOrderById();
      }, 5000);
    }
  }, [idOrderBuy, start]);

  useEffect(() => {
    if (!start) {
      return;
    }
    if (symbolSearch.length > 0) {
      setInterval(() => {
        if (!accesskey || !symbolSearch || !apiSecret) {
          return;
        }
        getPriceCoinAndCovertMX();
      }, 5000);
    }
  }, [accesskey, symbolSearch, apiSecret, start]);

  useEffect(() => {
    if (symbol.length > 0) {
      setTimeout(() => {
        setSymbolSearch(symbol);
      }, 500);
    }
  }, [symbol]);

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
      if (response.status === 200) {
        if (response?.data?.orderId) {
          setIdOrderBuy(response?.data?.orderId);
        }
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
      return;
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
      }  justify-center  mr-10 w-1/2 pb-10`}
    >
      {loading && <LoadingOverlay />}
      <div className="flex flex-col ml-5 mt-4">
        <div className="px-2 py-1 w-full">
          <div className="flex justify-between">
            <h4 className="mb-2">Account Name</h4>
            {!start ? (
              <button
                className="p-4 bg-orange-300"
                onClick={() => {
                  if (!symbolSearch || !apiSecret || !accesskey) {
                    return alert("Vui lòng nhập đủ thông tin!");
                  }
                  setStart(true);
                }}
              >
                {" "}
                START
              </button>
            ) : (
              <p className="p-4 text-orange-300">STARTING</p>
            )}
          </div>
          <input
            type="text"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder="Enter Account Name"
            className="w-4/5  text-fuchsia-500 text-2xl p-2 border bg-slate-800 rounded focus:bg-teal-800"
          />
        </div>
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
        <div className="px-2 py-2 w-full ">
          <h4 className="mb-2">Symbol (Tên COIN)</h4>
          <input
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Copy tên coin pass vào (không nhập tay)"
            className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
          />
        </div>
      </div>

      <div className={`flex flex-row  mr-10`}>
        <div className={` flex flex-col ml-4 w-1/2`}>
          <div className="mt-2 px-2 py-3 w-full ">
            <h1 className="text-yellow-300">INFO ORDER</h1>

            <h4 className="mt-3 mb-2">Price (Giá COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter Price"
              className="w-full p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            <h4 className="mt-3 mb-2">Quantity (Số lượng COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              className="w-full p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />

            <div className="flex w-4/5  mt-4 flex-row justify-end">
              {isBtnBuy ? (
                <button
                  onClick={handleBuyCoin}
                  className="hover:bg-green-400 w-full  self-end bg-green-600 rounded-md p-3"
                >
                  Buy
                </button>
              ) : (
                <div className="flex flex-col">
                  <h4 className="text-rose-600 text-xl">Đã mua</h4>
                  {responseOrderData?.status && (
                    <div>
                      <p>Status: {responseOrderData?.status}</p>
                      <span className="text-xl text-cyan-300">
                        BUYED :{" "}
                        {responseOrderData?.origQuoteOrderQty.slice(0, 7) +
                          " USDT"}{" "}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-full w-2 bg-slate-50 ml-9"></div>

        <div className={`flex flex-col ml-4 w-1/2`}>
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
              className="w-full p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            <h4 className="mt-3 mb-2">Quantity (Số lượng COIN)</h4>
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={quantitySell}
              onChange={(e) => setQuantitySell(e.target.value)}
              placeholder="Enter Quantity"
              className="w-full p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />

            <div className="flex w-4/5  mt-4 flex-col justify-end">
              <button
                onClick={() => {
                  if (
                    !accesskey ||
                    !apiSecret ||
                    !priceSell ||
                    !quantitySell ||
                    !symbol
                  ) {
                    return alert("Vui lòng nhập đử thông tin!");
                  }
                  handleSellCoin();
                }}
                className="hover:bg-red-500 w-full  self-end bg-red-600 rounded-md p-3"
              >
                SELL
              </button>
              {isBtnSell && (
                <h4 className="text-rose-600 text-xl mt-4">
                  Đã đặt bán {quantityOrderSell?.length} lệnh{" "}
                </h4>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellComponent;
