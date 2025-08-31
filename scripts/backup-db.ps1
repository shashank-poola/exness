# Database backup script for TimescaleDB (PowerShell version)
# This script creates regular backups of your TimescaleDB data

# Configuration
$DB_NAME = "exness_trade"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$BACKUP_DIR = "./backups"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"

# Create backup directory if it doesn't exist
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force
}

# Create backup filename
$BACKUP_FILE = "$BACKUP_DIR/exness_trade_$DATE.sql"

Write-Host "Starting backup of $DB_NAME at $DATE..."

# Perform the backup using pg_dump
# This will backup the entire database including TimescaleDB hypertables
try {
    docker exec exness_postgres pg_dump `
        -U $DB_USER `
        -d $DB_NAME `
        -h $DB_HOST `
        -p $DB_PORT `
        --verbose `
        --clean `
        --create `
        --if-exists `
        --no-owner `
        --no-privileges `
        > $BACKUP_FILE

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup completed successfully: $BACKUP_FILE"
        
        # Compress the backup file (if 7-Zip is available)
        if (Get-Command "7z" -ErrorAction SilentlyContinue) {
            & 7z a -tgzip "$BACKUP_FILE.gz" $BACKUP_FILE
            Remove-Item $BACKUP_FILE
            Write-Host "Backup compressed: $BACKUP_FILE.gz"
        } else {
            Write-Host "7-Zip not found. Backup saved as: $BACKUP_FILE"
        }
        
        # Keep only last 7 days of backups
        $cutoffDate = (Get-Date).AddDays(-7)
        Get-ChildItem $BACKUP_DIR -Filter "*.sql*" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
        Write-Host "Old backups cleaned up"
    } else {
        Write-Host "Backup failed with exit code: $LASTEXITCODE"
        exit 1
    }
} catch {
    Write-Host "Backup failed with error: $_"
    exit 1
}
