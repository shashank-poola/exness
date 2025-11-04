# Exness Trading Platform Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v20 or higher)
- **pnpm** package manager
- **Docker Desktop** (for PostgreSQL and Redis)
- **Git** (to clone the repository)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start All Services
```bash
# Windows PowerShell
.\start-trading-app.ps1

# Or manually start each service:
cd apps/Pooler && pnpm dev
cd apps/server && pnpm dev  
cd apps/web && pnpm dev
```

### 3. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Architecture

### Services
1. **Frontend (Next.js)**: Trading interface with real-time charts
2. **Backend (Express)**: API server with WebSocket support
3. **Pooler**: Data processing and candle generation
4. **PostgreSQL**: Database for candles and user data
5. **Redis**: Real-time data streaming and caching

### Key Features
- ✅ Real-time candlestick charts
- ✅ Live price updates via WebSocket
- ✅ Buy/Sell order execution
- ✅ Position management
- ✅ Multiple timeframes (30s, 1m, 5m, 1h)
- ✅ Multiple instruments (BTCUSDT, XAUUSD, EURUSD)

## 📊 Trading Features

### Chart Functionality
- **Timeframes**: 30 seconds, 1 minute, 5 minutes, 1 hour
- **Instruments**: Bitcoin, Gold, Euro/USD
- **Real-time updates**: Live price feeds and candle updates
- **Interactive charts**: Built with Lightweight Charts

### Order Management
- **Market Orders**: Immediate execution at current price
- **Volume Control**: Adjustable lot sizes
- **Stop Loss**: Optional stop loss orders
- **Take Profit**: Optional take profit orders
- **Position Tracking**: Monitor open positions

### Risk Management
- **Demo Account**: $10,000 starting balance
- **Margin Monitoring**: Real-time margin level tracking
- **Position Sizing**: Volume-based position management

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exness_trade
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
SERVER_PORT=3001
JWT_SECRET=your-secret-key
```

### Database Setup
The application automatically creates necessary tables and provides mock data if no real data exists.

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3001
   # Kill the process
   taskkill /PID <PID> /F
   ```

2. **Docker Not Running**
   - Start Docker Desktop
   - Ensure Docker service is running

3. **Database Connection Failed**
   - Check if PostgreSQL container is running: `docker ps`
   - Restart containers: `docker-compose restart`

4. **WebSocket Connection Failed**
   - Ensure backend server is running on port 3001
   - Check browser console for connection errors

### Logs
- **Backend**: Check the server terminal for API logs
- **Pooler**: Check the pooler terminal for data processing logs
- **Frontend**: Check browser console for client-side errors

## 📈 Adding New Instruments

To add new trading instruments:

1. **Update Frontend**: Add to `InstrumentsSidebar` component
2. **Update Backend**: Add to candle generation logic
3. **Update Pooler**: Add to data processing pipeline

## 🔒 Security Notes

- This is a demo application with mock data
- No real money is involved
- JWT tokens are used for authentication
- Passwords are hashed with bcrypt
- CORS is configured for local development

## 🚀 Production Deployment

For production use:
1. Use environment-specific configuration
2. Implement proper authentication
3. Add rate limiting and security headers
4. Use production-grade database and Redis
5. Implement proper logging and monitoring
6. Add SSL/TLS encryption

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all services are running
4. Verify Docker containers are healthy

## 🎯 Next Steps

- [ ] Add more technical indicators
- [ ] Implement order book visualization
- [ ] Add portfolio analytics
- [ ] Implement risk management tools
- [ ] Add mobile responsiveness
- [ ] Implement user preferences

---

**Happy Trading! 🎉**
