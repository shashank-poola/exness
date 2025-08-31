"use client";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useWebSocket } from "@/contexts/websocket-context";

type TF = "30s" | "1m" | "5m" | "1h";

function getTimeBucket(timestamp: number, timeframe: TF): number {
  const intervals = {
    "30s": 30000,
    "1m": 60000,
    "5m": 300000,
    "1h": 3600000,
  };
  const interval = intervals[timeframe];
  return Math.floor(timestamp / interval) * interval;
}

export default function Candles({
  symbol = "BTCUSDT",
  timeframe = "1m" as TF,
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const candlesRef = useRef<CandlestickData[]>([]);
  const liveCandle = useRef<CandlestickData | null>(null);
  const { candles, liveTrades } = useWebSocket();

  useEffect(() => {
    if (!ref.current) return;
    
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: ref.current.clientHeight || 400,
      layout: { 
        background: { color: "#0b0e11" }, 
        textColor: "#d1d4dc" 
      },
      grid: {
        vertLines: { color: "#1f2a35" },
        horzLines: { color: "#1f2a35" },
      },
      timeScale: {
        rightOffset: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: { 
        mode: 1,
        vertLine: {
          color: "#2962FF",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2962FF",
        },
        horzLine: {
          color: "#2962FF",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2962FF",
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
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

    const loadInitialData = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/candles/${symbol}/${timeframe}`,
          { cache: "no-store" }
        );
        
        if (res.ok) {
          const json = await res.json();
          const data: CandlestickData[] = json.candles.map((c: any) => ({
            time: Math.floor(Number(c.time) / 1000) as Time,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
          }));

          candlesRef.current = data;
          series.setData(data);
          chart.timeScale().fitContent();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        // Set some mock data if API fails
        const mockData: CandlestickData[] = [];
        const now = Math.floor(Date.now() / 1000);
        let basePrice = symbol === "BTCUSDT" ? 108000 : symbol === "ETHUSDT" ? 3400 : 98;
        
        for (let i = 0; i < 100; i++) {
          const time = (now - (100 - i) * 60) as Time;
          const open = basePrice + (Math.random() - 0.5) * 1000;
          const high = open + Math.random() * 500;
          const low = open - Math.random() * 500;
          const close = open + (Math.random() - 0.5) * 200;
          
          mockData.push({ time, open, high, low, close });
          basePrice = close;
        }
        
        candlesRef.current = mockData;
        series.setData(mockData);
        chart.timeScale().fitContent();
      }
    };

    loadInitialData();

    const onResize = () => {
      if (ref.current) {
        chart.applyOptions({ 
          width: ref.current.clientWidth,
          height: ref.current.clientHeight || 400
        });
      }
    };
    
    window.addEventListener("resize", onResize);
    
    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [symbol, timeframe]);

  // Update chart with real-time data from WebSocket context
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    const symbolCandles = candles.filter(
      c => c.symbol === symbol && c.timeframe === timeframe
    );

    if (symbolCandles.length > 0) {
      const latestCandle = symbolCandles[symbolCandles.length - 1];
      const candleData: CandlestickData = {
        time: Math.floor(Number(latestCandle.time) / 1000) as Time,
        open: latestCandle.open,
        high: latestCandle.high,
        low: latestCandle.low,
        close: latestCandle.close,
      };

      // Update or add the candle
      const existingIndex = candlesRef.current.findIndex(
        c => c.time === candleData.time
      );
      
      if (existingIndex >= 0) {
        candlesRef.current[existingIndex] = candleData;
      } else {
        candlesRef.current.push(candleData);
        // Keep only last 200 candles
        if (candlesRef.current.length > 200) {
          candlesRef.current = candlesRef.current.slice(-200);
        }
      }

      seriesRef.current.setData(candlesRef.current);
      chartRef.current.timeScale().scrollToRealTime();
    }
  }, [candles, symbol, timeframe]);

  // Update live candle with real-time trades
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    const symbolTrades = liveTrades.filter(t => t.symbol === symbol);
    
    if (symbolTrades.length > 0) {
      const latestTrade = symbolTrades[symbolTrades.length - 1];
      const currentTime = getTimeBucket(latestTrade.timestamp, timeframe);
      const candleTime = Math.floor(currentTime / 1000) as Time;

      if (!liveCandle.current || liveCandle.current.time !== candleTime) {
        liveCandle.current = {
          time: candleTime,
          open: latestTrade.price,
          high: latestTrade.price,
          low: latestTrade.price,
          close: latestTrade.price,
        };
      } else {
        liveCandle.current.high = Math.max(
          liveCandle.current.high,
          latestTrade.price
        );
        liveCandle.current.low = Math.min(
          liveCandle.current.low, 
          latestTrade.price
        );
        liveCandle.current.close = latestTrade.price;
      }

      // Update chart with live data
      let allData = [...candlesRef.current];
      const lastIndex = allData.findIndex(
        c => c.time === liveCandle.current!.time
      );
      
      if (lastIndex >= 0) {
        allData[lastIndex] = liveCandle.current;
      } else {
        allData.push(liveCandle.current);
      }

      seriesRef.current.setData(allData);
      chartRef.current.timeScale().scrollToRealTime();
    }
  }, [liveTrades, symbol, timeframe]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "400px"
      }} 
    />
  );
}
