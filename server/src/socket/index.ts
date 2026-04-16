import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as orderService from '../services/orderService';

interface JwtPayload {
  userId: string;
  username: string;
}

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('authenticate', (data: { token: string }) => {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as JwtPayload;
        socket.join(`user:${decoded.userId}`);
        console.log(`Socket ${socket.id} authenticated as ${decoded.username}`);
      } catch {
        console.log(`Socket ${socket.id} failed authentication`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

export async function emitOrderBookUpdate(io: Server) {
  const book = await orderService.getOrderBook();
  io.emit('orderBook:update', book);
}

export function emitTradeExecuted(
  io: Server,
  trade: {
    id: string;
    price: number;
    quantity: number;
    buyerUsername: string;
    sellerUsername: string;
    executedAt: Date;
  }
) {
  io.emit('trade:executed', trade);
}

export function emitBalanceUpdate(
  io: Server,
  userId: string,
  balances: { diningDollarBalance: number; swipeBalance: number }
) {
  io.to(`user:${userId}`).emit('balance:update', balances);
}
