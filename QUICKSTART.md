# Quick Start Guide

## Prerequisites

- Node.js 20+
- Upstash Redis account (free)
- Neon PostgreSQL account (free)

## Setup Steps

### 1. Clone & Install

```bash
git clone https://github.com/[your-username]/order-execution-engine.git
cd order-execution-engine
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
NODE_ENV=development
PORT=3000

# Upstash Redis
REDIS_HOST=worthy-roughy-35448.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AYp4AAIncDI0Yzc4NWZiMjQ5NGY0ODczOTRiYTk5ZDRhYTU1MjljMHAyMzU0NDg
REDIS_TLS=true

# Neon PostgreSQL
DATABASE_URL=postgresql://[your-connection-string]
```

### 3. Build & Run

```bash
# Build
npm run build

# Start server
npm start

# Or run in development mode
npm run dev
```

### 4. Test the API

**Submit an order:**

```bash
curl -X POST http://localhost:3000/api/orders/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tokenIn": "SOL",
    "tokenOut": "USDC",
    "amountIn": 1.5,
    "slippage": 0.01
  }'
```

**WebSocket Connection:**

Use a WebSocket client (e.g., Postman, wscat) to connect:

```
ws://localhost:3000/api/orders/execute
```

Send the same JSON payload and watch real-time status updates!

## Testing

```bash
npm test
```

## Deployment to Render

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your repo
5. Set environment variables:
   - `DATABASE_URL`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`
   - `REDIS_TLS=true`
   - `NODE_ENV=production`
6. Deploy!

## API Endpoints

- `POST /api/orders/execute` - Submit order (upgrades to WebSocket)
- `GET /api/health` - Health check

## WebSocket Status Flow

```
pending → routing → building → submitted → confirmed
```

Each status update includes:
- `orderId`
- `status`
- `timestamp`
- Additional data (dex, price, txHash, error)
