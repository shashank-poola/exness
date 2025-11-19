import { createClient } from "redis";
import { client, connectDB, query } from "../../packages/db/connection";
import "./ws-server"; // Start WebSocket server

const subscriber = createClient({
  url: "redis://localhost:6379",
});

const publisher = createClient({
  url: "redis://localhost:6379",
});

const candles = new Map<string, any>();

async function startConsumer() {
  try {
    await connectDB();
    await subscriber.connect();
    await publisher.connect();
    console.log("Connected to Redis");
    await subscriber.subscribe("trades", (message) => {
      const trade = JSON.parse(message);
      processTrade(trade);
    });
    startCandleBroadcasting();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
}

function processTrade(trade: any) {
  const { symbol, price, timestamp } = trade;

  broadcastLiveTrades(trade);

  const intervals = [30, 60, 300, 3600];
  intervals.forEach((interval) => {
    const bucketKey = `${symbol}_${interval}`;
    const currentBucketStart =
      Math.floor(timestamp / (interval * 1000)) * (interval * 1000);

    const existingCandle = candles.get(bucketKey);
    if (existingCandle && existingCandle.startTime < currentBucketStart) {
      console.log(
        `Storing completed candle: ${bucketKey} (${existingCandle.startTime} -> ${currentBucketStart})`
      );
      storeCandle(existingCandle);
      candles.delete(bucketKey);
    }

    if (!candles.has(bucketKey)) {
      candles.set(bucketKey, {
        symbol,
        interval,
        startTime: currentBucketStart,
        open: price,
        high: price,
        low: price,
        close: price,
      });
      console.log(` Created new candle: ${bucketKey}`);
    } else {
      const candle = candles.get(bucketKey);
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      console.log(` Updated candle: ${bucketKey}`);
    }
  });
  broadcastCurrentCandles(symbol);
}

async function broadcastCurrentCandles(symbol: string) {
  const timeframes = ["30s", "1m", "5m", "1h"];
  const intervals = [30, 60, 300, 3600];

  timeframes.forEach(async (timeframe, index) => {
    const interval = intervals[index];
    const bucketKey = `${symbol}_${interval}`;
    const currentCandle = candles.get(bucketKey);

    if (currentCandle) {
      const candleData = {
        time: currentCandle.startTime,
        symbol: currentCandle.symbol,
        timeframe,
        open: currentCandle.open,
        high: currentCandle.high,
        low: currentCandle.low,
        close: currentCandle.close,
      };
      try {
        await publisher.publish("candles-updates", JSON.stringify(candleData));
      } catch (error) {
        console.error(
          `Error broadcasting current candle for ${symbol} ${timeframe}:`,
          error
        );
      }
    }
  });
}

async function broadcastCandleUpdates() {
  const timeframes = ["30s", "1m", "5m", "1h"];
  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      try {
        const tableName = `candles_${timeframe}`;
        const result = await query(
          `SELECT 
            (EXTRACT(EPOCH FROM bucket) * 1000)::bigint AS time,
            symbol, open, high, low, close
          FROM ${tableName}
          WHERE symbol = $1
          ORDER BY bucket DESC
          LIMIT 1`,
          [symbol]
        );

        if (result.rows.length > 0) {
          const candle = {
            ...result.rows[0],
            symbol,
            timeframe,
            open: parseFloat(result.rows[0].open),
            close: parseFloat(result.rows[0].close),
            high: parseFloat(result.rows[0].high),
            low: parseFloat(result.rows[0].low),
          };
          await publisher.publish("candles-updates", JSON.stringify(candle));
        }
      } catch (error) {
        console.error(`Error broadcasting ${symbol} ${timeframe}:`, error);
      }
    }
  }
}

async function startCandleBroadcasting() {
  setInterval(broadcastCandleUpdates, 250);
  console.log("Started candle broadcasting every 250ms");
}

async function storeCandle(candle: any) {
  try {
    // Determine the correct table name based on interval
    let tableName: string;
    switch (candle.interval) {
      case 30:
        tableName = "candles_30s";
        break;
      case 60:
        tableName = "candles_1m";
        break;
      case 300:
        tableName = "candles_5m";
        break;
      case 3600:
        tableName = "candles_1h";
        break;
      default:
        console.error(`Invalid interval: ${candle.interval}`);
        return;
    }

    await client.query(
      `INSERT INTO ${tableName} (bucket, symbol, open, high, low, close)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date(candle.startTime),
        candle.symbol,
        candle.open,
        candle.high,
        candle.low,
        candle.close,
      ]
    );
    console.log(`Stored candle for ${candle.symbol} at ${candle.startTime} in ${tableName}`);
  } catch (err) {
    console.error("Error storing candle:", err);
  }
}

async function broadcastLiveTrades(trade: any) {
  try {
    // Broadcast individual trades for real-time candle updates
    await publisher.publish(
      "live-trades",
      JSON.stringify({
        symbol: trade.symbol,
        price: trade.price,
        quantity: trade.quantity,
        timestamp: trade.timestamp,
      })
    );
  } catch (error) {
    console.error("Error broadcasting live trade:", error);
  }
}

// Generate mock trade data for testing
function generateMockTrades() {
  const symbols = ["BTCUSDT", "XAUUSD", "EURUSD"];
  const basePrices = {
    "BTCUSDT": 110000,
    "XAUUSD": 3400,
    "EURUSD": 1.15
  };

  setInterval(() => {
    symbols.forEach(symbol => {
      const basePrice = basePrices[symbol as keyof typeof basePrices];
      const volatility = basePrice * 0.001; // 0.1% volatility
      const price = basePrice + (Math.random() - 0.5) * volatility;
      
      const mockTrade = {
        symbol,
        price: parseFloat(price.toFixed(5)),
        quantity: Math.random() * 10,
        timestamp: Date.now()
      };

      // Publish mock trade
      publisher.publish("trades", JSON.stringify(mockTrade));
    });
  }, 1000); // Generate trades every second
}

startConsumer();
// Start generating mock trades for testing
generateMockTrades();
