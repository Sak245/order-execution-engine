import { FastifyInstance, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../types/order';
import { enqueueOrder } from '../services/orderQueue';
import { registerConnection, unregisterConnection } from '../utils/websocket';

interface ExecuteOrderBody {
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    slippage: number;
}

export async function orderRoutes(fastify: FastifyInstance) {
    // POST /api/orders/execute - Submit order and upgrade to WebSocket
    fastify.post<{ Body: ExecuteOrderBody }>(
        '/api/orders/execute',
        { websocket: true },
        async (connection, req) => {
            const { tokenIn, tokenOut, amountIn, slippage } = req.body;

            // Validate input
            if (!tokenIn || !tokenOut || !amountIn || amountIn <= 0) {
                connection.socket.send(JSON.stringify({
                    error: 'Invalid order parameters'
                }));
                connection.socket.close();
                return;
            }

            // Create order
            const order: Order = {
                id: uuidv4(),
                tokenIn,
                tokenOut,
                amountIn,
                slippage: slippage || 0.01,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Register WebSocket connection
            registerConnection(order.id, connection);

            // Send initial response
            connection.socket.send(JSON.stringify({
                orderId: order.id,
                status: 'pending',
                timestamp: new Date().toISOString()
            }));

            // Enqueue order for processing
            await enqueueOrder(order);

            // Handle disconnection
            connection.socket.on('close', () => {
                unregisterConnection(order.id);
            });
        }
    );

    // GET /api/health - Health check
    fastify.get('/api/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
}
