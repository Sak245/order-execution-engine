# Order Execution Engine

A high-performance order execution engine with DEX routing (Raydium + Meteora) and real-time WebSocket status updates.

## 🚀 Live Demo

- **API Endpoint**: [Coming Soon]
- **GitHub**: https://github.com/[your-username]/order-execution-engine

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Testing](#testing)

## ✨ Features

- **Market Order Execution**: Immediate execution at best available price
- **DEX Routing**: Automatic price comparison between Raydium and Meteora
- **Real-time Updates**: WebSocket streaming of order lifecycle
- **Concurrent Processing**: Handle up to 10 orders simultaneously
- **Retry Logic**: Exponential backoff with 3 retry attempts
- **Order History**: PostgreSQL persistence for audit trail

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Web Framework | Fastify + @fastify/websocket |
| Queue | BullMQ + Redis |
| Database | PostgreSQL |
| Cache | Redis |
| Testing | Jest |

## 🏗 Architecture

### Order Lifecycle

```
1. pending    → Order received and queued
2. routing    → Comparing Raydium vs Meteora prices
3. building   → Preparing transaction
4. submitted  → Executing swap on selected DEX
5. confirmed  → Transaction successful (with txHash)
6. failed     → Error occurred (with reason)
```

### Components

- **DEX Router**: Mock implementation simulating Raydium and Meteora
  - Raydium: 0.3% fee, ±2-4% price variance
  - Meteora: 0.2% fee, ±3-5% price variance
  - Selects DEX with better estimated output
  
- **Order Queue**: BullMQ with Redis
  - Concurrency: 10 workers
  - Rate limit: 100 orders/minute
  - Retry: Exponential backoff (1s, 2s, 4s)

- **WebSocket Manager**: Real-time status streaming
  - HTTP → WebSocket upgrade pattern
  - Per-order connection tracking
  - Automatic cleanup on completion

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- Redis (local or cloud)
- PostgreSQL (local or cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/[your-username]/order-execution-engine.git
cd order-execution-engine

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Redis and PostgreSQL credentials

# Build
npm run build

# Start server
npm start
```

### Development Mode

```bash
npm run dev
```

## 📡 API Documentation

### POST /api/orders/execute

Submit an order and receive real-time updates via WebSocket.

**Request:**
```json
{
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amountIn": 1.5,
  "slippage": 0.01
}
```

**Response (HTTP):**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "timestamp": "2025-01-24T12:00:00.000Z"
}
```

**WebSocket Updates:**
```json
{ "orderId": "...", "status": "routing", "timestamp": "..." }
{ "orderId": "...", "status": "building", "dex": "raydium", "price": 100.45 }
{ "orderId": "...", "status": "confirmed", "txHash": "5j7K8...", "price": 100.42 }
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-24T12:00:00.000Z"
}
```

## 🎯 Design Decisions

### Why Market Orders?

**Chosen**: Market Order  
**Reason**: Simplest order type to demonstrate core routing and execution logic without price monitoring complexity.

**Extension Path**:
- **Limit Orders**: Add a price watcher service that monitors market prices and triggers execution when target price is reached.
- **Sniper Orders**: Add event listeners for token launch/migration events and trigger execution on detection.

### Why Mock Implementation?

**Chosen**: Mock DEX simulation  
**Reason**: Focus on architecture, routing logic, and real-time updates without blockchain complexity.

**Benefits**:
- Faster development and testing
- No devnet dependencies
- Predictable behavior for demos
- Easy to extend to real Solana integration

### Why BullMQ?

**Chosen**: BullMQ over other queue systems  
**Reason**: 
- Built-in retry logic with exponential backoff
- Excellent concurrency control
- Redis-backed for high performance
- TypeScript support

### Why Fastify?

**Chosen**: Fastify over Express  
**Reason**:
- Native WebSocket support via plugin
- Better performance (2x faster than Express)
- Built-in TypeScript support
- Modern async/await patterns

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**Test Coverage**:
- ✅ DEX Router: Quote generation, price comparison, swap execution
- ✅ Order Queue: Retry logic, concurrency, rate limiting
- ✅ WebSocket: Message format, lifecycle states

## 📊 Performance

- **Throughput**: 100 orders/minute
- **Concurrency**: 10 simultaneous orders
- **Latency**: 
  - Quote fetching: ~400ms (2 DEXs in parallel)
  - Swap execution: 2-3 seconds (simulated)
  - Total: ~3-4 seconds per order

## 🔐 Environment Variables

```env
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://user:password@localhost:5432/orders_db
```

## 📝 License

ISC

## 👤 Author

[Your Name]

---

Built for Eterna Labs Backend Assessment
