"use client";

import Candles from "@/components/candles";
import {
  BarChart3,
  Camera,
  Crosshair,
  Download,
  Maximize2,
  Minus,
  MousePointer,
  Settings,
  TrendingUp,
  Type,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/websocket-context";

interface ChartAreaProps {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const TIMEFRAMES = [
  { label: "30s", value: "30s" },
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1d" },
];

const CHART_TOOLS = [
  { icon: MousePointer, label: "Cursor", active: true },
  { icon: Crosshair, label: "Crosshair" },
  { icon: TrendingUp, label: "Trend Line" },
  { icon: Minus, label: "Horizontal Line" },
  { icon: Type, label: "Text" },
];

export function ChartArea({
  symbol,
  timeframe,
  onTimeframeChange,
}: ChartAreaProps) {
  const [activeTool, setActiveTool] = useState("cursor");
  const [showIndicators, setShowIndicators] = useState(false);
  const { candles, liveTrades } = useWebSocket();
  const [currentOHLC, setCurrentOHLC] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    change: 0,
    changePercent: 0
  });

  // Get current OHLC data for the selected symbol and timeframe
  useEffect(() => {
    const currentCandle = candles.find(
      c => c.symbol === symbol && c.timeframe === timeframe
    );
    
    if (currentCandle) {
      const change = currentCandle.close - currentCandle.open;
      const changePercent = (change / currentCandle.open) * 100;
      
      setCurrentOHLC({
        open: currentCandle.open,
        high: currentCandle.high,
        low: currentCandle.low,
        close: currentCandle.close,
        change,
        changePercent
      });
    }
  }, [candles, symbol, timeframe]);

  // Get latest price for buy/sell buttons
  const latestTrade = liveTrades
    .filter(trade => trade.symbol === symbol)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const currentPrice = latestTrade?.price || currentOHLC.close || 0;
  const isPositive = currentOHLC.change >= 0;

  // Calculate bid/ask prices with spread
  const spread = symbol === "BTCUSDT" ? 21.60 : symbol === "ETHUSDT" ? 2.14 : 0.22;
  const bidPrice = currentPrice - (spread / 2);
  const askPrice = currentPrice + (spread / 2);

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e11]">
      {/* Chart Header */}
      <div className="h-16 border-b border-[#1f2a35] px-4 flex items-center justify-between">
        {/* Symbol Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-white">
                {symbol === "BTCUSDT"
                  ? "Bitcoin vs US Dollar"
                  : symbol === "ETHUSDT"
                    ? "Ethereum vs US Dollar"
                    : symbol === "SOLUSDT"
                      ? "Solana vs US Dollar"
                      : symbol}{" "}
                • {timeframe}
              </h2>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">O</span>
            <span className="text-white font-mono">{currentOHLC.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
            <span className="text-gray-400">H</span>
            <span className="text-white font-mono">{currentOHLC.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
            <span className="text-gray-400">L</span>
            <span className="text-white font-mono">{currentOHLC.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
            <span className="text-gray-400">C</span>
            <span className="text-white font-mono">{currentOHLC.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</span>
            <span
              className={`font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}{currentOHLC.change.toFixed(2)} ({isPositive ? "+" : ""}{currentOHLC.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Chart Actions */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm bg-[#1f2a35] hover:bg-[#2a3441] rounded text-white transition-colors">
            Save
          </button>
          <button className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Camera size={16} />
          </button>
          <button className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Download size={16} />
          </button>
          <button className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
          <button className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Chart Toolbar */}
      <div className="h-12 border-b border-[#1f2a35] px-4 flex items-center justify-between">
        {/* Timeframes */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf.value
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1f2a35]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Tools */}
        <div className="flex items-center gap-1">
          {CHART_TOOLS.map((tool, index) => (
            <button
              key={index}
              onClick={() => setActiveTool(tool.label.toLowerCase())}
              className={`p-2 rounded transition-colors ${
                activeTool === tool.label.toLowerCase()
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1f2a35]"
              }`}
              title={tool.label}
            >
              <tool.icon size={16} />
            </button>
          ))}
          <div className="w-px h-6 bg-[#1f2a35] mx-2" />
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              showIndicators
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1f2a35]"
            }`}
          >
            Indicators
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2a35] rounded transition-colors">
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        <Candles symbol={symbol} timeframe={timeframe as any} />

        {/* Buy/Sell Buttons Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors shadow-lg">
            Sell {bidPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
          </button>
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors shadow-lg">
            Buy {askPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
          </button>
          <div className="text-center text-xs text-gray-400 bg-[#1f2a35] rounded px-2 py-1">
            Spread: {spread.toFixed(2)}
          </div>
        </div>

        {/* Chart Overlay - Price Line */}
        <div className="absolute top-4 left-4 bg-[#1f2a35] rounded px-3 py-2 text-sm">
          <div className="text-gray-400">Current Price</div>
          <div
            className={`font-mono text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
          >
            {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
          </div>
        </div>
      </div>
    </div>
  );
}
