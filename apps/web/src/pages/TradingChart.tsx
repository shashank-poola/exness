import React, { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useTradingStore } from "@/store/useTradingStore";

const KLINES_BASE =
  process.env.NEXT_PUBLIC_BINANCE_KLINES_API_URL ||
  "https://fapi.binance.com/fapi/v1/klines";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
type TF = (typeof TIMEFRAMES)[number];

const TIMEFRAME_LABELS: Record<TF, string> = {
  "1m": "1 min",
  "5m": "5 min",
  "15m": "15 min",
  "1h": "1 hour",
  "4h": "4 hours",
  "1d": "1 day",
};

interface TradingChartProps {
  hideControls?: boolean;
  height?: number;
}

export default function TradingChart({ hideControls = false, height }: TradingChartProps) {
  const { symbol, timeframe, setSymbol, setTimeframe } = useTradingStore();
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Calculate height - use provided height or container height
    const chartHeight = height || (containerRef.current?.clientHeight || 400);

    // --- Create chart ---
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: chartHeight,
      layout: { background: { color: "#0b0e11" }, textColor: "#d1d4dc" },
      grid: { vertLines: { color: "#1f2a35" }, horzLines: { color: "#1f2a35" } },
      timeScale: { rightOffset: 2, borderVisible: false },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    seriesRef.current = series;

    // --- Load history candles ---
    const loadCandles = async () => {
      try {
        const params = new URLSearchParams();
        params.set("symbol", symbol);
        params.set("interval", timeframe);
        params.set("limit", "500");

        const url = `${KLINES_BASE}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const candles: CandlestickData[] = data.map((d: any[]) => ({
          time: Math.floor(d[0] / 1000) as Time,
          open: Number(d[1]),
          high: Number(d[2]),
          low: Number(d[3]),
          close: Number(d[4]),
        }));

        if (seriesRef.current && chartRef.current) {
          seriesRef.current.setData(candles);
          chartRef.current.timeScale().fitContent();
        }
      } catch (err) {
        console.error("Error fetching candles:", err);
      }
    };

    loadCandles();

    // --- WebSocket for live updates ---
    const wsSymbol = symbol.toLowerCase();
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(
        `wss://fstream.binance.com/ws/${wsSymbol}@kline_${timeframe}`
      );

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.e === "kline" && msg.k && seriesRef.current) {
            const k = msg.k;
            const candle: CandlestickData = {
              time: Math.floor(k.t / 1000) as Time, // open time
              open: Number(k.o),
              high: Number(k.h),
              low: Number(k.l),
              close: Number(k.c),
            };
            seriesRef.current.update(candle);
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
    }

    // Resize handling
    const onResize = () => {
      if (ref.current && chartRef.current) {
        const chartHeight = height || (containerRef.current?.clientHeight || 400);
        chartRef.current.applyOptions({ 
          width: ref.current.clientWidth,
          height: chartHeight
        });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (ws) {
        ws.close();
      }
      window.removeEventListener("resize", onResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, timeframe, height]);

  return (
    <div ref={containerRef} className="space-y-2 relative h-full flex flex-col">
      {/* Controls row */}
      {!hideControls && (
        <div className="flex items-center gap-4 relative z-10">
          {/* Symbol selector */}
          <select
            className="relative z-10 border px-2 py-1 rounded bg-black cursor-pointer"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            {["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "SUIUSDT"].map(
              (s) => (
                <option key={s} value={s} className="cursor-pointer">
                  {s}
                </option>
              )
            )}
          </select>

          {/* Timeframe selector */}
          <select
            className="relative z-10 border px-2 py-1 rounded bg-black cursor-pointer"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as TF)}
          >
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>
                {TIMEFRAME_LABELS[tf]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={ref}
        className="relative z-0 flex-1"
        style={{ width: "100%", height: "100%", minHeight: height || 400 }}
      />
    </div>
  );
}