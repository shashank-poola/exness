"use client";

import { Settings, TrendingDown, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

interface TradingPanelProps {
  symbol: string;
}

interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

export function TradingPanel({ symbol }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "pending">("market");
  const [volume, setVolume] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<Trade[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time price updates
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to trading server");
      newSocket.emit("subscribe-trades", { symbol });
    });

    newSocket.on("live-trade", (trade: any) => {
      if (trade.symbol === symbol) {
        setCurrentPrice(trade.price);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [symbol]);

  // Mock data for display
  const mockPrice = currentPrice || (symbol === "BTCUSDT" ? 110911.02 : symbol === "XAUUSD" ? 3384.518 : 1.15916);
  const spread = symbol === "BTCUSDT" ? 21.60 : 0.002;

  const handleTrade = async (type: "buy" | "sell") => {
    if (!volume || parseFloat(volume) <= 0) {
      alert("Please enter a valid volume");
      return;
    }

    setIsLoading(true);
    try {
      const tradeData = {
        symbol,
        type,
        volume: parseFloat(volume),
        price: mockPrice,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      };

      // Send trade to backend
      const response = await fetch("http://localhost:3001/api/candles/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        throw new Error("Trade execution failed");
      }

      const result = await response.json();
      
      if (result.success) {
        // Add the trade to positions
        const newTrade: Trade = {
          id: result.trade.id,
          ...result.trade,
        };

        setPositions(prev => [...prev, newTrade]);
        
        // Reset form
        setVolume("0.01");
        setStopLoss("");
        setTakeProfit("");
        
        // Show success message
        alert(result.message);
      } else {
        throw new Error(result.error || "Trade execution failed");
      }
      
    } catch (error) {
      console.error("Trade execution failed:", error);
      alert("Trade execution failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closePosition = (positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  return (
    <div className="w-80 bg-[#0f1419] border-l border-[#1f2a35] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">{symbol}</h3>
          <button className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
            <Settings size={14} />
          </button>
        </div>

        {/* Price Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Sell</span>
            <span className="text-lg font-mono text-red-400">{mockPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Buy</span>
            <span className="text-lg font-mono text-green-400">
              {mockPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">Spread: {spread} USD</div>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex bg-[#1f2a35] rounded p-1">
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              orderType === "market"
                ? "bg-[#0b0e11] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType("pending")}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              orderType === "pending"
                ? "bg-[#0b0e11] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Trading Form */}
      <div className="flex-1 p-4 space-y-4">
        {/* Volume */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Volume</label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none"
              step="0.01"
              min="0.01"
            />
            <span className="px-3 text-xs text-gray-400">Lots</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ~${(parseFloat(volume) * 100000).toLocaleString()}
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Stop Loss</label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="text"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Not set"
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button className="px-3 text-xs text-gray-400 hover:text-white">
              Price
            </button>
          </div>
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Take Profit
          </label>
          <div className="flex items-center bg-[#1f2a35] rounded">
            <input
              type="text"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Not set"
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm focus:outline-none placeholder-gray-500"
            />
            <button className="px-3 text-xs text-gray-400 hover:text-white">
              Price
            </button>
          </div>
        </div>

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={() => handleTrade("sell")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white rounded font-medium transition-colors"
          >
            <TrendingDown size={16} />
            {isLoading ? "..." : "SELL"}
          </button>
          <button
            onClick={() => handleTrade("buy")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-700 text-white rounded font-medium transition-colors"
          >
            <TrendingUp size={16} />
            {isLoading ? "..." : "BUY"}
          </button>
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t border-[#1f2a35] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Free Margin:</span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="text-white font-mono">10,000.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin:</span>
            <span className="text-white font-mono">0.00 USD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin level:</span>
            <span className="text-white font-mono">-</span>
          </div>
        </div>

        {/* Active Positions */}
        {positions.length > 0 && (
          <div className="pt-4 border-t border-[#1f2a35]">
            <h4 className="text-sm font-medium text-white mb-3">Active Positions</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {positions.map((position) => (
                <div key={position.id} className="bg-[#1f2a35] rounded p-2 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${position.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {position.type.toUpperCase()} {position.symbol}
                    </span>
                    <button
                      onClick={() => closePosition(position.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-gray-400">
                    Volume: {position.volume} • Price: ${position.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
