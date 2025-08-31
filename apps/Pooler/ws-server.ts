import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import { IncomingMessage } from 'http';
import { URL } from 'url';

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
}

const wss = new WebSocketServer({ port: 3001 });
const clients = new Map<WebSocket, Client>();

const subscriber = createClient({
  url: "redis://localhost:6379",
});

const publisher = createClient({
  url: "redis://localhost:6379",
});

async function startWebSocketServer() {
  try {
    await subscriber.connect();
    await publisher.connect();
    console.log("WebSocket server connected to Redis");

    // Subscribe to Redis channels
    await subscriber.subscribe("candles-updates", (message) => {
      const candleData = JSON.parse(message);
      broadcastToClients({
        type: "candle-update",
        ...candleData
      });
    });

    await subscriber.subscribe("live-trades", (message) => {
      const tradeData = JSON.parse(message);
      broadcastToClients({
        type: "live-trade",
        ...tradeData
      });
    });

  } catch (err) {
    console.error("Redis connection failed:", err);
  }
}

function broadcastToClients(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
  console.log('New client connected');
  
  const client: Client = {
    ws,
    subscriptions: new Set()
  };
  
  clients.set(ws, client);

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'subscribe') {
        const { symbol, channels } = message;
        client.subscriptions.add(symbol);
        console.log(`Client subscribed to ${symbol}`);
      } else if (message.type === 'unsubscribe') {
        const { symbol } = message;
        client.subscriptions.delete(symbol);
        console.log(`Client unsubscribed from ${symbol}`);
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

startWebSocketServer();

console.log('WebSocket server started on port 3001');
