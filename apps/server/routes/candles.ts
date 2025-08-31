import { Router } from "express";
import { getDBCandles } from "../db/queries";
import { Timeframe } from "../types/candles";

const router = Router();

// Generate mock candle data for testing
function generateMockCandles(symbol: string, timeframe: string, limit: number = 50) {
  const candles = [];
  const now = Date.now();
  const intervals = {
    "30s": 30000,
    "1m": 60000,
    "5m": 300000,
    "1h": 3600000,
  };
  
  const interval = intervals[timeframe as keyof typeof intervals] || 60000;
  
  for (let i = limit - 1; i >= 0; i--) {
    const time = now - (i * interval);
    const basePrice = symbol === "BTCUSDT" ? 110000 : symbol === "XAUUSD" ? 3400 : 1.15;
    const volatility = basePrice * 0.02; // 2% volatility
    
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    candles.push({
      time,
      symbol: symbol.toUpperCase(),
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });
  }
  
  return candles;
}

router.get("/:symbol/:timeframe", async (req, res) => {
  try {
    const { symbol, timeframe } = req.params;
    const limit = 50;

    if (!["30s", "1m", "5m", "1h"].includes(timeframe)) {
      return res.status(400).json({
        error: "Invalid timeframe. Use: 30s, 1m, 5m, or 1h",
      });
    }

    let candles;
    try {
      // Try to get real data from database
      candles = await getDBCandles(
        symbol.toUpperCase(),
        timeframe as Timeframe,
        limit
      );
      
      // If no data in database, use mock data
      if (!candles || candles.length === 0) {
        console.log(`No data found for ${symbol} ${timeframe}, using mock data`);
        candles = generateMockCandles(symbol, timeframe, limit);
      }
    } catch (dbError) {
      console.log(`Database error for ${symbol} ${timeframe}, using mock data:`, dbError);
      candles = generateMockCandles(symbol, timeframe, limit);
    }

    res.json({
      symbol: symbol.toUpperCase(),
      timeframe,
      candles: candles.reverse(),
    });
  } catch (error) {
    console.error("Error in candle endpoint:", error);
    res.status(500).json({ error: "Failed to fetch candles" });
  }
});

// Trade execution endpoint
router.post("/trade", async (req, res) => {
  try {
    const { symbol, type, volume, price, stopLoss, takeProfit } = req.body;
    
    // Validate required fields
    if (!symbol || !type || !volume || !price) {
      return res.status(400).json({
        error: "Missing required fields: symbol, type, volume, price"
      });
    }

    if (!["buy", "sell"].includes(type)) {
      return res.status(400).json({
        error: "Invalid trade type. Must be 'buy' or 'sell'"
      });
    }

    if (volume <= 0) {
      return res.status(400).json({
        error: "Volume must be greater than 0"
      });
    }

    // In a real application, you would:
    // 1. Validate user authentication
    // 2. Check user balance/margin
    // 3. Execute the trade with a broker
    // 4. Store the trade in database
    // 5. Update user positions

    const trade = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      type,
      volume: parseFloat(volume),
      price: parseFloat(price),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: Date.now(),
      status: "executed"
    };

    // Simulate trade execution delay
    await new Promise(resolve => setTimeout(resolve, 100));

    res.json({
      success: true,
      message: `${type.toUpperCase()} order executed successfully`,
      trade
    });

  } catch (error) {
    console.error("Error executing trade:", error);
    res.status(500).json({ error: "Failed to execute trade" });
  }
});

// Get user positions
router.get("/positions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real application, you would fetch from database
    // For now, return mock data
    const mockPositions = [
      {
        id: "1",
        symbol: "BTCUSDT",
        type: "buy",
        volume: 0.01,
        price: 110911.02,
        currentPrice: 110889.42,
        pnl: -21.60,
        timestamp: Date.now() - 3600000
      }
    ];

    res.json({
      success: true,
      positions: mockPositions
    });

  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// Close position
router.delete("/positions/:positionId", async (req, res) => {
  try {
    const { positionId } = req.params;
    
    // In a real application, you would:
    // 1. Validate user owns the position
    // 2. Execute the closing trade
    // 3. Update database
    // 4. Calculate P&L

    res.json({
      success: true,
      message: "Position closed successfully"
    });

  } catch (error) {
    console.error("Error closing position:", error);
    res.status(500).json({ error: "Failed to close position" });
  }
});

export default router;
