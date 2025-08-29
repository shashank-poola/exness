# Exness Trade Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ and npm/pnpm

## Quick Start

### 1. Start the Database Services
```bash
# Start PostgreSQL, Redis, and pgAdmin
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Or if using npm
npm install
```

### 3. Set Environment Variables
Copy the environment file and configure it:
```bash
cp env.example .env
# Edit .env with your preferred values
```

### 4. Run the Applications

#### Pooler (WebSocket Service)
```bash
cd apps/Pooler
npm run dev
```

#### Server (API)
```bash
cd apps/server
npm run dev
```

#### Web App
```bash
cd apps/web
npm run dev
```

## Database Access

- **PostgreSQL**: localhost:5432
  - Database: exness_trade
  - Username: postgres
  - Password: password

- **Redis**: localhost:6379

- **pgAdmin**: http://localhost:5050
  - Email: admin@exness.com
  - Password: admin

## Customization

### Change Database Credentials
1. Edit `docker-compose.yml` and update the environment variables
2. Update your `.env` file
3. Restart the containers: `docker-compose down && docker-compose up -d`

### Add New Services
Add new services to `docker-compose.yml` following the same pattern.

## Troubleshooting

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### View Logs
```bash
docker-compose logs postgres
docker-compose logs redis
```

### Access Database Shell
```bash
docker exec -it exness_postgres psql -U postgres -d exness_trade
```
