#!/bin/bash

# Database backup script for TimescaleDB
# This script creates regular backups of your TimescaleDB data

# Configuration
DB_NAME="exness_trade"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/exness_trade_$DATE.sql"

echo "Starting backup of $DB_NAME at $DATE..."

# Perform the backup using pg_dump
# This will backup the entire database including TimescaleDB hypertables
docker exec exness_postgres pg_dump \
    -U $DB_USER \
    -d $DB_NAME \
    -h $DB_HOST \
    -p $DB_PORT \
    --verbose \
    --clean \
    --create \
    --if-exists \
    --no-owner \
    --no-privileges \
    > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Compress the backup file
    gzip $BACKUP_FILE
    echo "Backup compressed: $BACKUP_FILE.gz"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi
