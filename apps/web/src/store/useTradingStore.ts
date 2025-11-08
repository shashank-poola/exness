import { create } from "zustand";

type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

interface TradingStore {
  symbol: string;
  timeframe: Timeframe;
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
}

export const useTradingStore = create<TradingStore>((set) => ({
  symbol: "BTCUSDT",
  timeframe: "1m",
  setSymbol: (symbol) => set({ symbol }),
  setTimeframe: (timeframe) => set({ timeframe }),
}));

