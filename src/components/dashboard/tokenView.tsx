import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import XIcon from "@mui/icons-material/X";
import TelegramIcon from "@mui/icons-material/Telegram";
import {
  buy,
  connection,
  getMeme,
  getSPLTokenBalance,
  sell,
  Xdegen_mint,
} from "../testToken/swapfunction";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { priceDataService, PriceData } from "../../utils/priceData";
import { CustomTooltip } from "../ui/tooltip";
import {
  BarChartIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CrosshairIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LayersIcon,
} from "lucide-react";
import { Tooltip } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import type { Provider } from '@reown/appkit-adapter-solana/react';


type StatItem = {
  label: string;
  oppositeLabel: string;
  buyPercentage: number;
  sellPercentage: number;
  buyTag: number;
  sellTag: number;
  timeFrame: string;
};

type CandlestickData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ChartData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const formatPrice = (price: number) => price.toFixed(6);
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", { hour12: false });
};

const ChartControls = () => {
  const [showGrid, setShowGrid] = useState(true);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<"candles" | "line" | "area">(
    "candles"
  );
  const [showVolume, setShowVolume] = useState(true);

  const handleZoomIn = () => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;

      const newRange = {
        from: (from + (to - from) * 0.1) / 1000,
        to: (to - (to - from) * 0.1) / 1000,
      };

      timeScale.setVisibleRange({
        from: newRange.from as UTCTimestamp,
        to: newRange.to as UTCTimestamp,
      });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const visibleRange = timeScale.getVisibleRange();
    if (visibleRange) {
      const from = (visibleRange.from as UTCTimestamp) * 1000;
      const to = (visibleRange.to as UTCTimestamp) * 1000;

      const newRange = {
        from: (from - (to - from) * 0.1) / 1000,
        to: (to + (to - from) * 0.1) / 1000,
      };

      timeScale.setVisibleRange({
        from: newRange.from as UTCTimestamp,
        to: newRange.to as UTCTimestamp,
      });
    }
  };

  const toggleGrid = () => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      grid: {
        vertLines: { visible: !showGrid },
        horzLines: { visible: !showGrid },
      },
    });
    setShowGrid(!showGrid);
  };

  const toggleChartType = (type: "candles" | "line" | "area") => {
    setChartType(type);
  };

  const toggleVolume = () => {
    setShowVolume((prevShowVolume) => !prevShowVolume);
    // Add logic to toggle volume visibility on the chart if needed
  };

  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-background/50 rounded-lg">
      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="hover:bg-white/10"
        >
          <ZoomInIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="hover:bg-white/10"
        >
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <div className="w-[1px] h-6 bg-white/20 mx-2" />

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("candles")}
          className={`hover:bg-white/10 ${chartType === "candles" ? "bg-white/20" : ""
            }`}
        >
          <BarChartIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("line")}
          className={`hover:bg-white/10 ${chartType === "line" ? "bg-white/20" : ""
            }`}
        >
          <TrendingUpIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <CustomTooltip content="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleChartType("area")}
          className={`hover:bg-white/10 ${chartType === "area" ? "bg-white/20" : ""
            }`}
        >
          <TrendingDownIcon className="h-4 w-4" />
        </Button>
      </CustomTooltip>

      <div className="w-[1px] h-6 bg-white/20 mx-2" />

      <Tooltip title="Toggle Volume">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVolume}
          className={`hover:bg-white/10 ${showVolume ? "bg-white/20" : ""}`}
        >
          <LayersIcon className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip title="Toggle Grid">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleGrid}
          className={`hover:bg-white/10 ${showGrid ? "bg-white/20" : ""}`}
        >
          <CrosshairIcon className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default function TradingInterface() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [pairData, setPairData] = useState<any>(null);
  const [orderAmount, setOrderAmount] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [stats, setStats] = useState<StatItem[]>([]);
  const { publicKey, sendTransaction } = useWallet();
  const [swap, setSwap] = useState<"Buy" | "Sell">("Buy");
  const [XTokenMint, setXTokenMint] = useState<string>("");
  const [XSol, setXSol] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [updateBal, setUpdateBal] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<
    "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
  >("5m");
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [indicators, setIndicators] = useState<string[]>([]);
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  useEffect(() => {
    if (location.state && location.state.pairData) {
      setPairData(location.state.pairData);
      setPrice(parseFloat(location.state.pairData.priceUsd));
      updateStats(location.state.pairData);
    }
  }, [location.state]);

  useEffect(() => {
    if (!chartContainerRef.current || !pairData) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.log("Chart already disposed");
      }
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#0E1217" },
        textColor: "#D1D4DC",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.6)" },
        horzLines: { color: "rgba(42, 46, 57, 0.6)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (timestamp: number) => formatTimestamp(timestamp),
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.4)",
          style: 0,
        },
        horzLine: {
          width: 1,
          color: "rgba(255, 255, 255, 0.4)",
          style: 0,
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Add price line
    candleSeries.createPriceLine({
      price: currentPrice || 0,
      color: "#2962FF",
      lineWidth: 1,
      lineStyle: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const fetchData = async () => {
      const data = await priceDataService.getPriceData(
        pairData.baseToken.address,
        timeframe
      );

      if (data.length && candleSeriesRef.current) {
        const transformedData = data.map((item) => ({
          time: item.time as UTCTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        candleSeriesRef.current.setData(transformedData);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
          chartRef.current = null;
        } catch (e) {
          console.log("Chart already disposed");
        }
      }
    };
  }, [pairData, timeframe]);

  useEffect(() => {
    const get = async () => {
      if (!pairData) return;
      const walletPublicKey = publicKey ? publicKey : address ? new PublicKey(address) : undefined;

      if (!walletPublicKey) {
        setXSol("0");
        setXTokenMint("0");
        return;
      }
      try {
        console.log("checking balance");
        const Xdegen_mint = "3hA3XL7h84N1beFWt3gwSRCDAf5kwZu81Mf1cpUHKzce";
        const getXdegenTokenMint = await getMeme(pairData.baseToken.address);
        const xXSol = await getSPLTokenBalance(walletPublicKey, Xdegen_mint);
        if (!getXdegenTokenMint) {
          setXTokenMint("0");
        } else {
          const xXToken = await getSPLTokenBalance(
            walletPublicKey,
            getXdegenTokenMint
          );
          setXTokenMint(xXToken);
        }
        if (!xXSol) {
          setXSol("0");
        } else {
          setXSol(xXSol);
        }
      } catch (error) {
        console.error("Failed to fetch trading :", error);
      }
    };
    get();
  }, [pairData, publicKey, updateBal, address]);

  const fetchData = async () => {
    if (!pairData) return;

    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `https://api.example.com/trading-stats/${pairData.pairAddress}`
      );
      const data = await response.json();

      setPrice(data.price);
      updateStats(data);
    } catch (error) {
      console.error("Failed to fetch trading statistics:", error);
    }
  };

  const updateStats = (data: any) => {
    const timeFrames = ["m5", "h1", "h6", "h24"];
    const newStats = timeFrames.map((tf) => {
      const buys = data.txns[tf].buys;
      const sells = data.txns[tf].sells;
      const total = buys + sells;
      const buyPercentage = (buys / total) * 100;
      const sellPercentage = (sells / total) * 100;
      return {
        label: "Buys",
        oppositeLabel: "Sells",
        buyPercentage,
        sellPercentage,
        buyTag: buys,
        sellTag: sells,
        timeFrame: tf,
      };
    });
    setStats(newStats);
  };
  const setOption = (option: "Buy" | "Sell") => {
    setSwap(option);
  };

  const handleBuy = async () => {
    setLoading(true);
    const loadingId = toast.loading("Processing ... ");
    try {
      const walletPublicKey = publicKey ? publicKey : address ? new PublicKey(address) : undefined;

      if (!walletPublicKey) {
        throw new Error("Please connect your wallet!");
      }
      console.log(pairData.baseToken);
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const tokenAmount =
        +orderAmount / parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const tokenName = pairData.baseToken.symbol;
      const tokenMint = pairData.baseToken.address;
      const buyNow = await buy(
        Xdegen_mint,
        +orderAmount,
        walletPublicKey,
        tokenName,
        tokenMint,
        tokenAmount,
      );

      // Send the transaction
      const signature = await walletProvider.sendTransaction(buyNow, connection);

      // Confirm the transaction
      // const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      console.log(buyNow);
      console.log(
        `Buying ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`
      );
      toast.success(
        `Swapped ${orderAmount} XSol to ${tokenAmount} ${pairData?.baseToken.symbol} `,
        {
          action: {
            label: "View Transaction",
            onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
          }
        }
      );
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.log(error);
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const handleSell = async () => {
    setLoading(true);
    const loadingId = toast.loading("Processing ... ");
    try {
      const walletPublicKey = publicKey ? publicKey : address ? new PublicKey(address) : undefined;

      if (!walletPublicKey) {
        throw new Error("Please connect your wallet!");
      }
      console.log(pairData.baseToken);
      const price = parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const xSolAmount =
        +orderAmount * parseFloat(parseFloat(pairData.priceNative).toFixed(9));
      const sellNow = await sell(
        xSolAmount,
        walletPublicKey,
        pairData.baseToken.address,
        +orderAmount,
        // sendTransaction
      );
      if (!connection) return;
      // Send the transaction
      const signature = await walletProvider.sendTransaction(sellNow, connection);

      // Confirm the transaction
      // const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      console.log(sellNow);
      console.log(
        `Selling ${orderAmount} ${pairData?.baseToken.symbol} at ${price}`
      );
      toast.success(
        `Swapped ${orderAmount} ${pairData?.baseToken.symbol} to ${xSolAmount} XSol `,
        {
          action: {
            label: "View Transaction",
            onClick: () => window.open(`https://solscan.io/tx/${signature}?cluster=devnet`, "_blank")
          }
        }
      );
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "Transaction might have failed");
      console.log(error);
    } finally {
      if (updateBal) {
        setUpdateBal(false);
      } else {
        setUpdateBal(true);
      }
      setLoading(false);
      toast.dismiss(loadingId);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const getTimeFrameLabel = (tf: string) => {
    switch (tf) {
      case "m5":
        return "5m";
      case "h1":
        return "1h";
      case "h6":
        return "6h";
      case "h24":
        return "24h";
      default:
        return tf;
    }
  };

  const TimeframeSelector = () => (
    <div className="flex gap-2 mb-4">
      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
        <Button
          key={tf}
          onClick={() => setTimeframe(tf as any)}
          className={`px-3 py-1 ${timeframe === tf ? "bg-blue-500" : "bg-secondary"
            }`}
        >
          {tf}
        </Button>
      ))}
    </div>
  );

  useEffect(() => {
    if (!pairData?.baseToken?.address || !candleSeriesRef.current) return;

    const updateChart = (data: PriceData[]) => {
      if (!candleSeriesRef.current) return;

      const lastCandle = data[data.length - 1];

      // High-frequency update of latest candle only
      candleSeriesRef.current.update({
        time: lastCandle.time as UTCTimestamp,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });

      // Full data update at lower frequency to prevent performance issues
      if (!window.requestAnimationFrame) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    // Initial setup
    const setup = async () => {
      const data = await priceDataService.getPriceData(
        pairData.baseToken.address,
        timeframe
      );
      if (data.length && candleSeriesRef.current) {
        candleSeriesRef.current.setData(
          data.map((item) => ({
            time: item.time as UTCTimestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
        );
      }
    };

    setup();
    priceDataService.subscribe(pairData.baseToken.address, updateChart);

    return () => {
      priceDataService.unsubscribe(pairData.baseToken.address, updateChart);
    };
  }, [pairData, timeframe]);

  const toggleIndicator = (indicator: string) => {
    setIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  if (!pairData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full bg-secondary">
      <h1 className="text-2xl font-bold mb-4 text-white p-4">
        {pairData.baseToken.symbol}/{pairData.quoteToken.symbol}
      </h1>
      <div className="flex items-start justify-start gap-10 min-h-screen bg-secondary text-white p-4">
        <div className="flex flex-col gap-4">
          <div className="bg-background p-4 rounded-xl">
            <div className="flex flex-col justify-start items-start">
              <TimeframeSelector />
              <ChartControls />
            </div>
            <div
              ref={chartContainerRef}
              className="w-full h-[400px]"
              style={{ minWidth: "600px" }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-background p-4 rounded-lg">
              <span className="flex space-x-2 mb-4">
                <XIcon />
                <TelegramIcon />
              </span>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/20">
                <div>
                  <p className="text-gray-400 text-sm">USD price</p>
                  <p className="text-sm font-normal">
                    ${price !== null ? price.toFixed(6) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    {pairData.quoteToken.symbol} Price
                  </p>
                  <p className="text-sm font-normal">
                    {parseFloat(pairData.priceNative).toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Supply</p>
                  <p className="text-sm font-normal">
                    {(pairData.fdv / parseFloat(pairData.priceUsd)).toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 justify-start">
                <div>
                  <p className="text-gray-400 text-sm">Liquidity</p>
                  <p className="text-sm font-normal">
                    ${pairData.liquidity.usd.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Market cap</p>
                  <p className="text-sm font-normal">
                    ${pairData.fdv.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                  {pairData.pairAddress.slice(0, 4)}...
                  {pairData.pairAddress.slice(-4)}
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>

              <div className="flex items-center space-x-2">
                <p className="font-semibold">{pairData.dexId}</p>
                <span className="text-green-400 text-sm">Verify profile</span>
              </div>
            </div>

            <Card className="w-full bg-background text-white border-b border-secondary">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {stats.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#666666]">
                        <p>
                          {item.label} ({getTimeFrameLabel(item.timeFrame)})
                        </p>
                        <p>{item.oppositeLabel}</p>
                      </div>
                      <div className="flex justify-between text-xs text-[#666666]">
                        <p>{formatNumber(item.buyTag)}</p>
                        <p>{formatNumber(item.sellTag)}</p>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="h-full bg-[#319631]"
                            style={{ width: `${item.buyPercentage}%` }}
                          ></div>
                          <div
                            className="h-full bg-[#830f0f]"
                            style={{ width: `${item.sellPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-background w-full">
          <div className="py-6">
            <div className="flex space-x-4 mb-4 w-full">
              <Button
                onClick={() => setOption("Buy")}
                className="bg-blue-500 hover:bg-blue-600 w-full"
                disabled={loading}
              >
                Buy
              </Button>
              <Button
                onClick={() => setOption("Sell")}
                className="bg-red-500 hover:bg-red-600 w-full"
                disabled={loading}
              >
                Sell
              </Button>
            </div>
            {swap === "Buy" ? (
              <div>
                <div className="grid grid-cols-5 justify-center items-center gap-4 mb-4">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(
                    (amount, index) => (
                      <Button
                        key={index}
                        className="flex text-[12px] justify-center w-auto  items-center gap-2 bg-secondary rounded-full hover:bg-white/10 cursor-pointer"
                        onClick={() => setOrderAmount(amount.toString())}
                        disabled={loading}
                      >
                        <img src="/images/solana.svg" alt="solana" />
                        {amount}
                      </Button>
                    )
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
            <Input
              type="number"
              placeholder={
                swap === "Buy"
                  ? "Amount of XDEGEN SOL"
                  : `Amount of ${pairData.baseToken.symbol}`
              }
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              className="mb-4 text-white border border-white/30 focus:border-white/40 rounded-full overflow-hidden"
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={swap === "Buy" ? handleBuy : handleSell}
                disabled={
                  (swap === "Sell" && XTokenMint === "0") ||
                  (swap === "Buy" && XSol === "0") ||
                  orderAmount === "" ||
                  loading
                }
                className={
                  swap === "Sell"
                    ? "bg-red-500 hover:bg-red-600 w-full rounded-full"
                    : "bg-blue-500 hover:bg-blue-600 w-full rounded-full"
                }
              >
                {loading ? "Processing..." : swap}
              </Button>
              <p className="text-white/70 text-[12px]">
                {swap === "Buy"
                  ? `XDEGEN SOL: ${XSol}`
                  : `XDEGEN ${pairData.baseToken.symbol}: ${XTokenMint}`}
              </p>
              {/* <p className='text-white/70 text-[12px]'>Once you click on Quick buy, your transaction is sent immediately.</p> */}
            </div>
          </div>
          <div className="border-t border-secondary py-4 flex gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <a href="/setting">Advanced settings</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function setChartType(type: string) {
  throw new Error("Function not implemented.");
}

function setShowVolume(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setShowGrid(arg0: boolean) {
  throw new Error("Function not implemented.");
}
