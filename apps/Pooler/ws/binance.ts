import { createClient } from "redis";
import { w3cwebsocket as WebSocket } from "websocket";

const URL =
  "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade";

const publisher = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
});

async function connect() {
  try {
    await publisher.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection failed:", err);
    return;
  }
  const ws = new WebSocket(URL);
  ws.onopen = () => {
    console.log("Connected to Binance");
  };

  ws.onmessage = (event: any) => {
    const data = event.data || event;
    const msg = JSON.parse(data.toString());
    if (msg?.data?.e === "trade") {
      const trade = msg.data;
      const symbol = trade.s;
      const price = Number(trade.p);
      const quantity = Number(trade.q);
      const timestamp = Number(trade.T);
      const tradeData = {
        symbol,
        price,
        quantity,
        timestamp,
      };
      console.log(tradeData);
      publisher.publish("trades", JSON.stringify(tradeData));
    } else {
      console.log("Unkown error ", msg);
    }
  };

<<<<<<< HEAD
  ws.onerror = (error: any) => {
=======
  ws.onerror = (error) => {
>>>>>>> 135147198af6e7baa8494b0d13c4e8e1b7b8a684
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("Disconnected.Reconnecting in 3s...");
    setTimeout(connect, 3000);
  };
}

connect();
