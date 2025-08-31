"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CandleData {
  time: number;
  symbol: string;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LiveTrade {
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
}

interface WebSocketContextType {
  isConnected: boolean;
  candles: CandleData[];
  liveTrades: LiveTrade[];
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to the Pooler WebSocket
    const websocket = new WebSocket('ws://localhost:3001');
    
    websocket.onopen = () => {
      console.log('Connected to Pooler WebSocket');
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'candle-update') {
          setCandles(prev => {
            const existingIndex = prev.findIndex(
              c => c.time === data.time && c.symbol === data.symbol && c.timeframe === data.timeframe
            );
            
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = data;
              return updated;
            } else {
              return [...prev, data];
            }
          });
        } else if (data.type === 'live-trade') {
          setLiveTrades(prev => {
            const existingIndex = prev.findIndex(
              t => t.symbol === data.symbol && t.timestamp === data.timestamp
            );
            
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = data;
              return updated;
            } else {
              return [...prev, data].slice(-100); // Keep only last 100 trades
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from Pooler WebSocket');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const subscribeToSymbol = (symbol: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        symbol,
        channels: ['candles', 'trades']
      }));
    }
  };

  const unsubscribeFromSymbol = (symbol: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol,
        channels: ['candles', 'trades']
      }));
    }
  };

  const value: WebSocketContextType = {
    isConnected,
    candles,
    liveTrades,
    subscribeToSymbol,
    unsubscribeFromSymbol,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
