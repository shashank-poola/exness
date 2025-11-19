import { Client } from "pg";

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "exness_trade",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL Database");
    return client;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

export async function query(text: string, params?: any[]) {
  return client.query(text, params);
}

export { client };
