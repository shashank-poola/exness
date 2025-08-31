-- Insert sample data for time bucketing demonstration
INSERT INTO test_candles (time, symbol, price) VALUES 
(NOW() - INTERVAL '1 hour', 'BTCUSD', 50100.00),
(NOW() - INTERVAL '30 minutes', 'BTCUSD', 50200.00),
(NOW() - INTERVAL '15 minutes', 'BTCUSD', 50300.00),
(NOW() - INTERVAL '5 minutes', 'BTCUSD', 50400.00),
(NOW() - INTERVAL '1 minute', 'BTCUSD', 50500.00);
