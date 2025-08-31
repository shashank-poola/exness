"use client";

import { ChartArea } from "@/components/chart-area";
import { InstrumentsSidebar } from "@/components/instruments-sidebar";
import { PositionsPanel } from "@/components/positions-panel";
import { TradingPanel } from "@/components/trading-panel";
import { useState } from "react";

export function TradingLayout() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#0b0e11] text-white flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-[#1a1d23] border-b border-[#2a2d35] px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">E</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              exness
            </h1>
          </div>
        </div>

        {/* Instrument Tabs */}
        <div className="flex items-center space-x-1">
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            XAU/USD
          </button>
          <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded">
            BTC
          </button>
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            EUR/USD
          </button>
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            USD/JPY
          </button>
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            XAU/USD
          </button>
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            AAPL
          </button>
          <button className="px-3 py-2 text-sm bg-[#2a2d35] text-white rounded hover:bg-[#3a3d45] transition-colors">
            +
          </button>
        </div>

        {/* Account Info */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Demo Standard</div>
            <div className="text-lg font-semibold text-white">10,286.43 USD</div>
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors">
            Deposit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Instruments */}
        <InstrumentsSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedSymbol={selectedSymbol}
          onSymbolSelect={setSelectedSymbol}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Section - Chart and Trading Panel */}
          <div className="flex-1 flex">
            {/* Chart Area */}
            <ChartArea
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />

            {/* Right Panel - Trading */}
            <TradingPanel symbol={selectedSymbol} />
          </div>

          {/* Bottom Panel - Positions/Orders */}
          <PositionsPanel />
        </div>
      </div>

      {/* Footer Bar */}
      <div className="h-12 bg-[#1a1d23] border-t border-[#2a2d35] px-6 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6 text-gray-400">
          <span>Equity: 10,286.43 USD</span>
          <span>Free Margin: 10,286.43 USD</span>
          <span>Balance: 10,286.43 USD</span>
          <span>Margin: 0.00 USD</span>
          <span>Margin level: -</span>
        </div>
        <div className="text-gray-500">3.3.0</div>
      </div>
    </div>
  );
}
