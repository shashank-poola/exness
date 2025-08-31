# TimescaleDB Setup Guide

This guide explains how to set up and use TimescaleDB in Docker for your Exness trading application.

## What is TimescaleDB?

TimescaleDB is a time-series database built on top of PostgreSQL. It's optimized for:
- High-volume time-series data (like financial market data)
- Automatic data partitioning and compression
- Fast queries on time ranges
- SQL compatibility with PostgreSQL

## Quick Start

### 1. Start the Database

```bash
# Navigate to the project directory
cd Exness-main

# Start TimescaleDB and other services
docker-compose up -d
```

### 2. Verify Installation

```bash
# Check if TimescaleDB is running
docker exec exness_postgres psql -U postgres -d exness_trade -c "SELECT version();"

# Check TimescaleDB extension
docker exec exness_postgres psql -U postgres -d exness_trade -c "SELECT * FROM pg_extension WHERE extname = 'timescaledb';"
```

### 3. Access the Database

- **Direct connection**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050` (admin@exness.com / admin)
- **Database**: `exness_trade`
- **User**: `postgres`
- **Password**: `password`

## Data Persistence

### Volumes
- **PostgreSQL data**: `postgres_data` (persistent)
- **Backups**: `./backups` (local directory)
- **Migrations**: `./apps/Pooler/db/migrations`

### Backup Strategy

#### Automatic Backup (Linux/Mac)
```bash
# Make script executable
chmod +x scripts/backup-db.sh

# Run backup
./scripts/backup-db.sh

# Set up cron job for daily backups
crontab -e
# Add: 0 2 * * * /path/to/Exness-main/scripts/backup-db.sh
```

#### Manual Backup (Windows)
```powershell
# Run PowerShell script
.\scripts\backup-db.ps1

# Or use Task Scheduler for automated backups
```

#### Restore from Backup
```bash
# Stop the application
docker-compose down

# Restore the database
docker exec -i exness_postgres psql -U postgres -d exness_trade < backups/your_backup_file.sql

# Restart services
docker-compose up -d
```

## TimescaleDB Features

### 1. Hypertables
Your `candles` table is automatically converted to a hypertable for better performance:

```sql
-- Check hypertable status
SELECT * FROM timescaledb_information.hypertables;

-- View chunk information
SELECT * FROM timescaledb_information.chunks;
```

### 2. Time Bucketing
Aggregate data by time periods:

```sql
-- Hourly OHLCV data
SELECT 
    time_bucket('1 hour', time) AS bucket,
    symbol,
    first(open, time) AS open,
    max(high) AS high,
    min(low) AS low,
    last(close, time) AS close,
    sum(volume) AS volume
FROM candles
WHERE time >= NOW() - INTERVAL '24 hours'
GROUP BY bucket, symbol
ORDER BY bucket DESC;
```

### 3. Compression
Enable compression for older data:

```sql
-- Enable compression
ALTER TABLE candles SET (timescaledb.compress);

-- Add compression policy (compress data older than 7 days)
SELECT add_compression_policy('candles', INTERVAL '7 days');

-- Check compression status
SELECT * FROM timescaledb_information.compression_settings;
```

### 4. Continuous Aggregates
Create materialized views for common queries:

```sql
-- Create hourly aggregate
CREATE MATERIALIZED VIEW candles_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    symbol,
    first(open, time) AS open,
    max(high) AS high,
    min(low) AS low,
    last(close, time) AS close,
    sum(volume) AS volume
FROM candles
GROUP BY bucket, symbol;

-- Add refresh policy
SELECT add_continuous_aggregate_policy('candles_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```

## Performance Tuning

### Current Optimizations
- **Shared buffers**: 256MB
- **Effective cache size**: 1GB
- **Work memory**: 4MB
- **Maintenance work memory**: 64MB
- **WAL buffers**: 16MB

### Monitor Performance
```sql
-- Check query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Monitor hypertable performance
SELECT * FROM timescaledb_information.hypertables;
SELECT * FROM timescaledb_information.chunks;
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs postgres
   
   # Check disk space
   docker system df
   ```

2. **Performance issues**
   ```sql
   -- Check if TimescaleDB is loaded
   SHOW shared_preload_libraries;
   
   -- Check current settings
   SHOW timescaledb.max_background_workers;
   ```

3. **Data not persisting**
   ```bash
   # Check volume status
   docker volume ls
   docker volume inspect exness_main_postgres_data
   ```

### Reset Database
```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker volume rm exness_main_postgres_data

# Restart
docker-compose up -d
```

## Production Considerations

1. **Change default passwords** in docker-compose.yml
2. **Use environment variables** for sensitive data
3. **Set up monitoring** with tools like Grafana
4. **Configure automated backups** to external storage
5. **Use connection pooling** for high-traffic applications
6. **Monitor disk space** and set up alerts

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f postgres

# Execute SQL in container
docker exec -it exness_postgres psql -U postgres -d exness_trade

# Backup specific tables
docker exec exness_postgres pg_dump -U postgres -t candles exness_trade > candles_backup.sql

# Check disk usage
docker system df
```

## Support

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
