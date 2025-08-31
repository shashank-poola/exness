import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createClient } from "redis";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import candleRoutes from "./routes/candles";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const subscriber = createClient({ url: "redis://localhost:6379" });

app.use(cors());
app.use(express.json());
app.use("/api/candles", candleRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: {
      server: "running",
      redis: subscriber.isReady ? "connected" : "disconnected",
      database: "checking..."
    }
  });
});

async function setupRedis() {
  try {
    await subscriber.connect();
    console.log("Redis subscriber connected");

    await subscriber.subscribe("candles-updates", (message) => {
      console.log("Received candle update:", message);
      const candleUpdate = JSON.parse(message);
      const room = `candles-${candleUpdate.symbol}-${candleUpdate.timeframe}`;
      console.log(`Emitting to room: ${room}`);
      io.to(room).emit("candle-update", candleUpdate);
    });

    await subscriber.subscribe("live-trades", (message) => {
      const trade = JSON.parse(message);
      const room = `trades-${trade.symbol}`;
      io.to(room).emit("live-trade", trade);
    });
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
}

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);
  socket.on("subscribe-candles", async ({ symbol, timeframe }) => {
    const room = `candles-${symbol}-${timeframe}`;
    await socket.join(room);
    console.log(`Client subscribed to ${room}`);
  });

  socket.on("subscribe-trades", async ({ symbol }) => {
    const room = `trades-${symbol}`;
    await socket.join(room);
    console.log(`Client subscribed to live trades: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected:", socket.id);
  });
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World");
});

server.listen(3001, () => {
  console.log("Server with WebSocket is running on port 3001");
  setupRedis();
});
