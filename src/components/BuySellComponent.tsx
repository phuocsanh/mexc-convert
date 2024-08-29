"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LoadingOverlay from "@/components/LoadingOverlay";
import { containsDigitGreaterThanOrEqualTo2 } from "@/ultil";
import { get } from "http";

const BuySellComponent = () => {
  const [accountName, setAccountName] = useState("");
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

  const [network, setNetwork] = useState("");
  const [addressWallet, setAddressWallet] = useState("");
  const [quantityUSDTWithdraw, setQuantityUSDTWithdraw] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [historyConvertMX, setHistoryConvertMX] = useState(0);
  const [accountInFo, setAccountInfo] = useState<any>({});
  const [historyWidthdraw, setHistoryWidthdraw] = useState<any>({});
  console.log("🚀 ~ BuySellComponent ~ historyWidthdraw:", historyWidthdraw);

  const reload = () => {
    setAccountName("");
    setResponseOrderData(null);
    setStart(false);
    setIsBtnBuy(true);
    setIsBtnSell(true);
    setApiSecret("");
    setAccesskey("");
    setSymbolSearch("");
    setSymbol("");
    setQuantity("");
    setPrice("");
    setQuantityOrderSell([]);
    setQuantityUSDTWithdraw("");
    setWithdrawStatus("");
    setHistoryConvertMX(0);
    setAccountInfo({});
    // setNetwork('')
  };
  function giamHaiDonVi(x: string): string {
    // Xác định số chữ số thập phân của x
    const decimalPlaces = x.toString().split(".")[1]?.length || 0;
    // Tạo giá trị trừ đi dựa trên vị trí của chữ số thập phân cuối cùng
    const subtractValue = 3 * Math.pow(10, -decimalPlaces);
    // Trừ đi giá trị này từ số ban đầu
    const convert = +x - subtractValue;

    console.log("giamHaiDonVi", convert.toString().slice(0, x.length));

    return convert.toString().slice(0, x.length);
  }

  const getAccountInFo = async (inUseEffect?: boolean) => {
    try {
      const response = await axios.get("/api/accountInfo", {
        params: {
          accesskey,
          apiSecret,
        },
      });
      if (response.status !== 200) return null;
      if (inUseEffect) {
        setAccountInfo(response.data);
        const findUsdc = response?.data?.balances?.find(
          (balance: any, _: any) => balance.asset === "USDT"
        );
        if (findUsdc) {
          setQuantityUSDTWithdraw(findUsdc.free || "0");
        }
      }
      return response.data;
    } catch (error) {}
  };
  const getWidthdrawHistory = async () => {
    try {
      const response = await axios.get("/api/withdrawHistory", {
        params: {
          accesskey,
          apiSecret,
        },
      });
      if (response.status !== 200) return;
      setHistoryWidthdraw(response?.data?.[0]);
    } catch (error) {}
  };

  const getPriceCoinAndCovertMxAuto = async (accountInfo: any) => {
    console.log(
      "🚀 ~ getPriceCoinAndCovertMxAuto ~ getPriceCoinAndCovertMxAuto:"
    );

    try {
      if (accesskey && symbolSearch && apiSecret) {
        const response = await axios.get("/api/getPriceCurrentCoin", {
          params: {
            symbol: symbol.toUpperCase() + "USDT",
            accesskey,
            apiSecret,
          },
        });
        const isGreaterOne = containsDigitGreaterThanOrEqualTo2(
          response.data.price
        );
        if (!isGreaterOne) {
          return;
        }
        if (isGreaterOne) {
          for (let i = 0; i <= 10; i++) {
            if (accountInfo?.balances && accountInfo?.balances.length) {
              const currentCoin = accountInfo?.balances.find(
                (balance: any, _: any) =>
                  balance.asset === symbolSearch.toUpperCase()
              );

              const response = await axios.get("/api/getPriceCurrentCoin", {
                params: {
                  symbol: symbol.toUpperCase() + "USDT",
                  accesskey,
                  apiSecret,
                },
              });

              if (response.status === 200 && response.data.price) {
                const isGreaterOne = containsDigitGreaterThanOrEqualTo2(
                  response.data.price
                );

                if (isGreaterOne) {
                  if (currentCoin.free === "0") {
                    const responseOrderCurrent = await axios.get("/api/order", {
                      params: {
                        symbol: symbolSearch.toUpperCase(),
                        accesskey,
                        apiSecret,
                      },
                    });

                    if (
                      responseOrderCurrent.status === 200 &&
                      responseOrderCurrent.data
                    ) {
                      if (responseOrderCurrent?.data?.length > 0) {
                        const filterOrderSellItem =
                          responseOrderCurrent.data.filter(
                            (orderSell: any, _: any) =>
                              orderSell?.side === "SELL"
                          );

                        if (filterOrderSellItem.length > 0) {
                          const responseOrderDelete = await axios.delete(
                            "/api/order",
                            {
                              params: {
                                orderId: filterOrderSellItem?.[0]?.orderId,
                                symbol: symbolSearch.toUpperCase(),
                                accesskey,
                                apiSecret,
                              },
                            }
                          );
                        }
                      }
                    }
                  } else {
                    await axios.post("/api/convertMX", {
                      symbol: symbol.toUpperCase(),
                      apiSecret,
                      accesskey,
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ getPriceCoin ~ error:", error);
    } finally {
    }
  };

  const getPriceCoinAndCovertMX = async () => {
    setFocus(true);
    try {
      setLoading(true);

      if (accesskey && symbolSearch && apiSecret) {
        for (let i = 0; i <= 10; i++) {
          const response = await axios.get("/api/getPriceCurrentCoin", {
            params: {
              symbol: symbol.toUpperCase() + "USDT",
              accesskey,
              apiSecret,
            },
          });

          if (response.status === 200 && response.data.price) {
            const isGreaterOne = containsDigitGreaterThanOrEqualTo2(
              response.data.price
            );

            if (isGreaterOne) {
              const accountInfo = await getAccountInFo();

              if (accountInfo?.balances && accountInfo?.balances.length) {
                const currentCoin = accountInfo?.balances.find(
                  (balance: any, _: any) =>
                    balance.asset === symbolSearch.toUpperCase()
                );

                console.log("🚀 ~ convertMX ~ currentCoin:", currentCoin);

                if (!currentCoin) {
                  return alert("Đã đổi hết coin!");
                }

                if (currentCoin.free === "0") {
                  const responseOrderCurrent = await axios.get("/api/order", {
                    params: {
                      symbol: symbolSearch.toUpperCase(),
                      accesskey,
                      apiSecret,
                    },
                  });

                  console.log(
                    "🚀 ~ convertMX ~ responseOrderCurrent:",
                    responseOrderCurrent
                  );

                  if (responseOrderCurrent.status === 400) {
                    return alert("Get lệnh hiện tại fail");
                  }

                  if (
                    responseOrderCurrent.status === 200 &&
                    responseOrderCurrent.data
                  ) {
                    if (responseOrderCurrent?.data?.length > 0) {
                      const filterOrderSellItem =
                        responseOrderCurrent.data.filter(
                          (orderSell: any, _: any) => orderSell?.side === "SELL"
                        );

                      if (filterOrderSellItem.length > 0) {
                        const responseOrderDelete = await axios.delete(
                          "/api/order",
                          {
                            params: {
                              orderId: filterOrderSellItem?.[0]?.orderId,
                              symbol: symbolSearch.toUpperCase(),
                              accesskey,
                              apiSecret,
                            },
                          }
                        );
                        console.log(
                          "🚀 ~ convertMX ~ responseOrderDelete:",
                          responseOrderDelete
                        );
                      } else {
                        console.log("🚀 ~ convertMX ~ else: 162");
                        return;
                      }
                    }
                  }
                } else {
                  await axios.post("/api/convertMX", {
                    symbol: symbol.toUpperCase(),
                    apiSecret,
                    accesskey,
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ getPriceCoin ~ error:", error);
    } finally {
      setLoading(false);
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

  const getHistoryConvertMX = async () => {
    const responseHistoryCovertMX = await axios.get("/api/convertMX", {
      params: {
        accesskey,
        apiSecret,
      },
    });

    if (responseHistoryCovertMX.status !== 200) {
      return;
    }
    setHistoryConvertMX(responseHistoryCovertMX?.data?.totalRecords || 0);
  };

  const autoSellMX = async (accountInfo?: any) => {
    console.log("🚀 ~ autoSellMX ~ autoSellMX:");

    try {
      if (accountInfo?.balances && accountInfo?.balances?.length) {
        const isMXCoin = accountInfo?.balances.find(
          (balance: any, _: any) => balance.asset === "MX"
        );
        if (isMXCoin) {
          if (!isMXCoin) {
            return alert("Không tìm thấy MX COIN");
          }
          if (isMXCoin) {
            const responsePriceMxUsdc = await axios.get(
              "/api/currentPrice24hr",
              {
                params: {
                  symbol: "MXUSDC",
                  accesskey,
                  apiSecret,
                },
              }
            );

            if (
              responsePriceMxUsdc.status !== 200 ||
              !responsePriceMxUsdc?.data?.bidPrice
            )
              return;

            if (Number(responsePriceMxUsdc?.data?.price) <= 3.0) {
              return alert("Giá MX nhỏ hơn 3.0 USDT vui lòng kiểm tra lại");
            }
            if (!isMXCoin?.free) {
              return alert("Số lượng MX không có");
            }

            let decimalPlaces: number = 2;
            let factor: number = Math.pow(10, decimalPlaces);

            // Làm tròn xuống số
            let roundedNumber: number =
              Math.floor(isMXCoin?.free * factor) / factor;

            if (roundedNumber.toString() !== "0") {
              await axios.post("/api/sellMx", {
                symbol: "MXUSDC",
                quantity: roundedNumber.toString(),
                price: giamHaiDonVi(responsePriceMxUsdc?.data?.bidPrice),
                apiSecret,
                accesskey,
              });
            }

            const accountInfo = await getAccountInFo();

            const isUSDC = accountInfo?.balances.find(
              (balance: any, _: any) => balance.asset === "USDC"
            );

            if (isUSDC.free) {
              const responsePriceUSDCUSDT = await axios.get(
                "/api/currentPrice24hr",
                {
                  params: {
                    symbol: "USDCUSDT",
                    accesskey,
                    apiSecret,
                  },
                }
              );
              let roundedNumberUSDC: number =
                Math.floor(isUSDC?.free * factor) / factor;

              if (
                responsePriceUSDCUSDT?.data?.bidPrice &&
                roundedNumberUSDC.toString() !== "0"
              ) {
                await axios.post("/api/sellMx", {
                  symbol: "USDCUSDT",
                  quantity: roundedNumberUSDC.toString(),
                  price: giamHaiDonVi(responsePriceUSDCUSDT?.data?.bidPrice),
                  apiSecret,
                  accesskey,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ autoSellMX ~ error:", error);
    }
  };
  const sellMX = async () => {
    try {
      setLoading(true);

      const accountInfo = await getAccountInFo();

      if (accountInfo?.balances?.length) {
        const isMXCoin = accountInfo?.balances.find(
          (balance: any, _: any) => balance.asset === "MX"
        );
        if (!isMXCoin) {
          return alert("Không tìm thấy MX COIN");
        }
        if (isMXCoin) {
          const responsePriceMxUsdc = await axios.get("/api/currentPrice24hr", {
            params: {
              symbol: "MXUSDC",
              accesskey,
              apiSecret,
            },
          });

          if (
            responsePriceMxUsdc.status !== 200 ||
            !responsePriceMxUsdc?.data?.bidPrice
          )
            return;

          if (Number(responsePriceMxUsdc?.data?.price) <= 3.0) {
            return alert("Giá MX nhỏ hơn 3.0 USDT vui lòng kiểm tra lại");
          }
          if (!isMXCoin?.free) {
            return alert("Số lượng MX không có");
          }

          let decimalPlaces: number = 2;
          let factor: number = Math.pow(10, decimalPlaces);

          // Làm tròn xuống số
          let roundedNumber: number =
            Math.floor(isMXCoin?.free * factor) / factor;

          const responseSellMxUsdc = await axios.post("/api/sellMx", {
            symbol: "MXUSDC",
            quantity: roundedNumber.toString(),
            price: giamHaiDonVi(responsePriceMxUsdc?.data?.bidPrice),
            apiSecret,
            accesskey,
          });

          if (responseSellMxUsdc.status === 200) {
            const accountInfo = await getAccountInFo();

            const isUSDC = accountInfo?.balances.find(
              (balance: any, _: any) => balance.asset === "USDC"
            );

            if (isUSDC.free) {
              const responsePriceUSDCUSDT = await axios.get(
                "/api/currentPrice24hr",
                {
                  params: {
                    symbol: "USDCUSDT",
                    accesskey,
                    apiSecret,
                  },
                }
              );

              if (responsePriceUSDCUSDT.status === 400) {
                return;
              }

              let roundedNumberUSDC: number =
                Math.floor(isUSDC?.free * factor) / factor;

              const responseSellUSDCUSDT = await axios.post("/api/sellMx", {
                symbol: "USDCUSDT",
                quantity: roundedNumberUSDC.toString(),
                price: giamHaiDonVi(responsePriceUSDCUSDT?.data?.bidPrice),
                apiSecret,
                accesskey,
              });

              if (responseSellUSDCUSDT.status !== 200) {
                return alert("Bán USDC không thành công!");
              }

              alert("Bán USDC thành công!");
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ sellMX ~ error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleBuyCoin = async () => {
    setFocus(true);
    if (!start) {
      return alert("Vui lòng nhấn START trước!");
    }
    setLoading(true);
    if (!accesskey || !apiSecret || !price || !quantity || !symbol) {
      return alert("Vui lòng nhập đử thông tin!");
    }
    try {
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
      setLoading(false);
      alert(error.response ? error.response.data.error : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellCoin = async () => {
    if (!start) {
      return alert("Vui lòng nhấn START trước!");
    }
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

  const withdrawUsdtToWallet = async () => {
    setFocus(true);

    if (!start) {
      return alert("Vui lòng nhấn START trước!");
    }
    try {
      setLoading(true);

      const response = await axios.post("/api/withdrawUsdt", {
        netWork: network,
        address: addressWallet,
        amount: quantityUSDTWithdraw,
        apiSecret,
        accesskey,
      });

      if (response.status !== 200) {
        setLoading(false);
        setWithdrawStatus("Rút thất bại");
        return alert("Rút tiền không thành công");
      }
      setWithdrawStatus("Rút thành công");
    } catch (error) {
      console.log("🚀 ~ withdrawUsdtToWal ~ error:", error);
      setLoading(false);
      setWithdrawStatus("Rút thất bại");
      alert("Lỗi Rút tiền không thành công");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!start) {
      return;
    }
    if (accesskey && apiSecret && symbolSearch) {
      setInterval(() => {
        getCurrentOrder();
        getHistoryConvertMX();
        getAccountInFo(true);
        if (withdrawStatus === "Rút thành công") {
          getWidthdrawHistory();
        }
      }, 3000);
    }
  }, [isBtnSell, accesskey, apiSecret, symbolSearch, start, withdrawStatus]);

  useEffect(() => {
    if (accountInFo) {
      getPriceCoinAndCovertMxAuto(accountInFo);
      autoSellMX(accountInFo);
    }
  }, [accountInFo]);

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
      }, 2500);
    }
  }, [idOrderBuy, start]);

  useEffect(() => {
    if (symbol.length > 0) {
      setTimeout(() => {
        setSymbolSearch(symbol);
      }, 500);
    }
  }, [symbol]);

  return (
    <div
      className={`flex flex-col ${
        focus ? "bg-sky-950" : "bg-slate-600"
      }  justify-center  mr-10 w-1/2 pb-5`}
    >
      {loading && <LoadingOverlay />}
      <div className="flex flex-col ml-5 mt-4">
        <div className="px-2 py-1 w-full">
          <h4 className="mb-2">Account Name</h4>

          <div className="flex justify-between">
            <input
              type="text"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter Account Name"
              className="w-4/5  text-fuchsia-500 px-2  border bg-slate-800 rounded focus:bg-teal-800"
            />
            {
              <button
                className="px-3 py-2 bg-lime-700 rounded-md"
                onClick={() => {
                  setFocus(true);
                  reload();
                }}
              >
                {" "}
                RELOAD
              </button>
            }
          </div>
        </div>
        <div className="flex">
          <div className="px-2 py-1 w-full">
            <h4 className="mb-2 ">Access Key</h4>
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
          <div className="px-2 py-1 w-full ">
            <h4 className="mb-2">Secret Key</h4>
            <div className="flex justify-between">
              <input
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                type="text"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter Secret Key"
                className="w-full p-2 border bg-slate-800 rounded  focus:bg-teal-800"
              />
            </div>
          </div>
        </div>

        <div className="px-2 py-2 w-full ">
          <h4 className="mb-2">Symbol (Tên COIN)</h4>
          <div className="flex justify-between">
            <input
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Copy tên coin pass vào (không nhập tay)"
              className="w-4/5 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
            />
            {!start ? (
              <button
                className="px-5 py-2  rounded-md bg-orange-300"
                onClick={() => {
                  setFocus(true);

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
        </div>
      </div>

      <div className={`flex flex-row  mr-10`}>
        <div className={` flex flex-col ml-4 w-1/2`}>
          <div className=" px-2 py-1 w-full ">
            <h1 className="text-yellow-300">INFO ORDER</h1>
            <h4 className=" mb-2">Price (Giá COIN)</h4>
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
                  disabled={loading}
                  onClick={handleBuyCoin}
                  className="hover:bg-green-400 w-full  self-end bg-green-600 rounded-md p-3"
                >
                  BUY
                </button>
              ) : (
                <div className="flex flex-col">
                  <h4 className="text-rose-600 text-xl">Đã mua</h4>
                  {responseOrderData?.status && (
                    <div>
                      <p>Status: {responseOrderData?.status}</p>
                      <span className="text-xl text-cyan-300">
                        BUYED :{" "}
                        {responseOrderData?.origQuoteOrderQty.slice(0, 7)}{" "}
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
          <div className=" px-2 py-2 w-full ">
            <h1 className="text-yellow-300">
              Name Coin : {symbol.toUpperCase()}
            </h1>
            <h4 className=" mb-2">Price (Giá COIN)</h4>
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
                  setFocus(true);
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
                <h4 className="text-rose-600 text-xl mt-1">
                  Đã đặt bán {quantityOrderSell?.length} lệnh{" "}
                </h4>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full h-2 bg-white"></div>
      <div className="px-2">
        <div className="flex justify-between">
          <button
            disabled={loading}
            className="px-9 py-2 hover:bg-amber-500 bg-amber-600 mt-2 rounded-md"
            onClick={() => {
              setFocus(true);
              if (!accesskey || !apiSecret || !symbol || !start) {
                return alert(
                  "Vui lòng nhập Assetkey , ApiKey và tên COIN sau đó nhấn START"
                );
              }
              getPriceCoinAndCovertMX();
            }}
          >
            ConvertMX
          </button>

          <button
            disabled={loading}
            className="px-9 py-2 hover:bg-purple-500  bg-purple-600 mt-2 rounded-md"
            onClick={() => {
              setFocus(true);
              if (!accesskey || !apiSecret || !symbol || !start) {
                return alert(
                  "Vui lòng nhập Assetkey , ApiKey và tên COIN sau đó nhấn START"
                );
              }
              sellMX();
            }}
          >
            SELL MX{" "}
            {(accountInFo?.balances?.length &&
              accountInFo?.balances?.find(
                (balance: any, _: any) => balance?.asset === "MX"
              ).free) ||
              "0"}
          </button>
          <p
            className={`mt-2 ${
              withdrawStatus === "Rút thất bại"
                ? "text-red-500"
                : withdrawStatus === "Rút thành công"
                ? "text-lime-500"
                : " text-orange-500"
            }`}
          >
            Nhấn rút: {!withdrawStatus ? "chưa" : withdrawStatus}
          </p>
        </div>
        <div className=" flex justify-between">
          <p className="mt-2">Đã đổi MX: {historyConvertMX}</p>
          <p className="mt-2">
            USDC HIỆN CÓ:{" "}
            {(accountInFo?.balances?.length &&
              accountInFo?.balances
                ?.find((balance: any, _: any) => balance?.asset === "USDC")
                ?.free?.slice(0, 5)) ||
              "0"}
          </p>
          <p className="mt-2">
            USDT HIỆN CÓ:{" "}
            {(accountInFo?.balances?.length &&
              accountInFo?.balances
                ?.find((balance: any, _: any) => balance?.asset === "USDT")
                ?.free?.slice(0, 5)) ||
              "0"}
          </p>
        </div>
        <div>
          <div className="flex mt-2">
            <div>
              <span>{"NETWORK (TÊN MẠNG)"}</span>
              <input
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                type="text"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="Enter network"
                className="w-full mt-2 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
              />
            </div>
            <div className=" w-full ml-20">
              <span>{"ADDRESS (ĐỊA CHỈ VÍ)"}</span>
              <input
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                type="text"
                value={addressWallet}
                onChange={(e) => setAddressWallet(e.target.value)}
                placeholder="Enter Address"
                className="w-full mt-2 p-2 border bg-slate-800 rounded  focus:bg-teal-800 "
              />
            </div>
          </div>
          <div className="justify-between w-full flex mt-2">
            <div>
              <div className="flex ">
                <span>{"Quantity USDT (Số tiền muốn rút)"}</span>
              </div>

              <input
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                type="text"
                value={quantityUSDTWithdraw}
                onChange={(e) => setQuantityUSDTWithdraw(e.target.value)}
                placeholder="Enter quantity"
                className="w-full mt-2 p-2 border bg-slate-800 rounded  focus:bg-teal-800"
              />
            </div>
            <div className="flex w-1/2 flex-col">
              <p className="">Tên Acc: {accountName}</p>
              <button
                disabled={loading}
                className="mt-2 px-8 py-3 rounded-md hover:bg-cyan-500 bg-cyan-600"
                onClick={() => {
                  setFocus(true);
                  if (
                    !addressWallet ||
                    !addressWallet ||
                    !quantityUSDTWithdraw ||
                    !start
                  ) {
                    return alert(
                      "Vui lòng kiểm tra lại mạng rút, địa chỉ ví hoặc số tiền và đã START!"
                    );
                  }
                  withdrawUsdtToWallet();
                }}
              >
                Rút USDT{" "}
                {(accountInFo?.balances?.length &&
                  accountInFo?.balances
                    ?.find((balance: any, _: any) => balance?.asset === "USDT")
                    ?.free?.slice(0, 5)) ||
                  "0"}
              </button>
              {!!historyWidthdraw?.status && (
                <p className="mt-2 text-lg text-teal-400">
                  Tiến trình rút:{" "}
                  {historyWidthdraw?.status < 7
                    ? "Đang rút"
                    : historyWidthdraw?.status === 7
                    ? "Rút hoàn tất"
                    : historyWidthdraw?.status === 8
                    ? "Thất bại"
                    : historyWidthdraw?.status === 9
                    ? "Bị hủy"
                    : historyWidthdraw?.status === 10
                    ? "Kiểm tra thủ công"
                    : "Không xác định"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellComponent;
