CREATE EXTENSION IF NOT EXISTS timescaledb;

--  creating the base for the candles table and init the hypertable
CREATE TABLE CANDLE_TABLE (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price DECIMAL(20, 8)  NOT NULL,
    high DECIMAL(20, 8),
    low DECIMAL(20, 8),      
    open DECIMAL(20, 8),
    close DECIMAL(20, 8)  
);

SELECT create_hypertable('CANDLE_TABLE', 'time', if_not_exists => TRUE);

-- create indexes

CREATE INDEX IF NOT EXISTS idx_candle_symbol ON CANDLE_TABLE(symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_candle_time ON CANDLE_TABLE(time DESC);

-- CREATE USERS TABLE 

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    demo_balance DECIMAL(20, 2) DEFAULT 10000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)