# Trading Application Startup Script
# This script starts all necessary services for the Exness Trading application

Write-Host "🚀 Starting Exness Trading Application..." -ForegroundColor Green

# Check if Docker is running
Write-Host "📦 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL and Redis with Docker Compose
Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "✅ Database services started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start database services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Install dependencies for all apps
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Start the Pooler service (data processing)
Write-Host "🔄 Starting Pooler service..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd apps/Pooler && pnpm dev" -WindowStyle Normal

# Wait a moment for the pooler to start
Start-Sleep -Seconds 5

# Start the Backend server
Write-Host "🔧 Starting Backend server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd apps/server && pnpm dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start the Frontend web app
Write-Host "🌐 Starting Frontend web app..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd apps/web && pnpm dev" -WindowStyle Normal

Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📊 Pooler: Running in background" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 You can now open http://localhost:3000 in your browser to access the trading platform!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: Make sure you have the following installed:" -ForegroundColor Yellow
Write-Host "   - Node.js (v20 or higher)" -ForegroundColor White
Write-Host "   - pnpm package manager" -ForegroundColor White
Write-Host "   - Docker Desktop" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To stop all services, close the PowerShell windows or run: docker-compose down" -ForegroundColor Yellow
