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
import { useState } from "react";

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

  // Mock price data
  const mockPrice =
    symbol === "BTCUSDT"
      ? "110,889.42"
      : symbol === "XAUUSD"
        ? "3,384.518"
        : "1.15916";
  const mockChange =
    symbol === "BTCUSDT"
      ? "+144.46"
      : symbol === "XAUUSD"
        ? "-0.104"
        : "+0.0012";
  const mockChangePercent =
    symbol === "BTCUSDT" ? "+0.13%" : symbol === "XAUUSD" ? "-0.00%" : "+0.10%";
  const isPositive = !mockChange.startsWith("-");

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
                  : symbol === "XAUUSD"
                    ? "Gold vs US Dollar"
                    : symbol === "EURUSD"
                      ? "Euro vs US Dollar"
                      : symbol}{" "}
                • {timeframe}
              </h2>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">O</span>
            <span className="text-white font-mono">{mockPrice}</span>
            <span className="text-gray-400">H</span>
            <span className="text-white font-mono">{mockPrice}</span>
            <span className="text-gray-400">L</span>
            <span className="text-white font-mono">{mockPrice}</span>
            <span className="text-gray-400">C</span>
            <span className="text-white font-mono">{mockPrice}</span>
            <span
              className={`font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {mockChange} ({mockChangePercent})
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

        {/* Chart Overlay - Price Line */}
        <div className="absolute top-4 right-4 bg-[#1f2a35] rounded px-3 py-2 text-sm">
          <div className="text-gray-400">Current Price</div>
          <div
            className={`font-mono text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
          >
            {mockPrice}
          </div>
        </div>
      </div>
    </div>
  );
}
