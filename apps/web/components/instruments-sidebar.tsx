"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/websocket-context";

interface Instrument {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  trending: "up" | "down";
}

const INSTRUMENTS: Instrument[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    bid: 108738.92,
    ask: 108760.52,
    change: 144.46,
    changePercent: 0.13,
    trending: "up",
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum",
    bid: 3456.78,
    ask: 3458.92,
    change: -23.45,
    changePercent: -0.67,
    trending: "down",
  },
  {
    symbol: "SOLUSDT",
    name: "Solana",
    bid: 98.45,
    ask: 98.67,
    change: 2.34,
    changePercent: 2.44,
    trending: "up",
  },
];

interface InstrumentsSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
}

export function InstrumentsSidebar({
  collapsed,
  onToggle,
  selectedSymbol,
  onSymbolSelect,
}: InstrumentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("favorites");
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const { liveTrades, subscribeToSymbol, unsubscribeFromSymbol } = useWebSocket();

  // Subscribe to live data for all instruments
  useEffect(() => {
    INSTRUMENTS.forEach(instrument => {
      subscribeToSymbol(instrument.symbol);
    });

    return () => {
      INSTRUMENTS.forEach(instrument => {
        unsubscribeFromSymbol(instrument.symbol);
      });
    };
  }, [subscribeToSymbol, unsubscribeFromSymbol]);

  // Update instrument prices from live trades
  useEffect(() => {
    if (liveTrades.length > 0) {
      setInstruments(prev => prev.map(instrument => {
        const latestTrade = liveTrades
          .filter(trade => trade.symbol === instrument.symbol)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        if (latestTrade) {
          const spread = instrument.ask - instrument.bid;
          const newBid = latestTrade.price - (spread / 2);
          const newAsk = latestTrade.price + (spread / 2);
          
          return {
            ...instrument,
            bid: newBid,
            ask: newAsk,
            change: latestTrade.price - (instrument.bid + instrument.ask) / 2,
            changePercent: ((latestTrade.price - (instrument.bid + instrument.ask) / 2) / (instrument.bid + instrument.ask) / 2) * 100,
            trending: latestTrade.price > (instrument.bid + instrument.ask) / 2 ? "up" : "down"
          };
        }
        return instrument;
      }));
    }
  }, [liveTrades]);

  const filteredInstruments = instruments.filter(
    (instrument) =>
      instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-12 bg-[#0f1419] border-r border-[#1f2a35] flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0f1419] border-r border-[#1f2a35] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1f2a35]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-300">INSTRUMENTS</h2>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors">
              <Search size={14} />
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-[#1f2a35] rounded text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1f2a35] border border-[#2a3441] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-[#1f2a35]">
        <div className="flex">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 py-1 text-xs font-medium rounded ${
              activeTab === "favorites"
                ? "bg-[#1f2a35] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 border-b border-[#1f2a35]">
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium">
          <div className="col-span-4">Symbol</div>
          <div className="col-span-3 text-right">Bid</div>
          <div className="col-span-3 text-right">Ask</div>
          <div className="col-span-2"></div>
        </div>
      </div>

      {/* Instruments List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInstruments.map((instrument) => (
          <div
            key={instrument.symbol}
            onClick={() => onSymbolSelect(instrument.symbol)}
            className={`px-4 py-3 border-b border-[#1f2a35] hover:bg-[#1f2a35] cursor-pointer transition-colors ${
              selectedSymbol === instrument.symbol ? "bg-[#1f2a35]" : ""
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Symbol & Name */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {instrument.symbol.includes("BTC")
                      ? "₿"
                      : instrument.symbol.includes("ETH")
                        ? "Ξ"
                        : instrument.symbol.includes("SOL")
                          ? "◎"
                          : "📈"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {instrument.symbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid Price */}
              <div className="col-span-3 text-right">
                <div
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    instrument.trending === "down"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-transparent text-white"
                  }`}
                >
                  {instrument.bid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                </div>
              </div>

              {/* Ask Price */}
              <div className="col-span-3 text-right">
                <div
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    instrument.trending === "up"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-transparent text-white"
                  }`}
                >
                  {instrument.ask.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="col-span-2 flex justify-end">
                {instrument.trending === "up" ? (
                  <TrendingUp className="text-green-400" size={14} />
                ) : (
                  <TrendingDown className="text-red-400" size={14} />
                )}
              </div>
            </div>

            {/* Change Info */}
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className="text-gray-500">{instrument.name}</span>
              <span
                className={`font-medium ${
                  instrument.trending === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {instrument.change > 0 ? "+" : ""}{instrument.change.toFixed(2)} ({instrument.changePercent > 0 ? "+" : ""}{instrument.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
