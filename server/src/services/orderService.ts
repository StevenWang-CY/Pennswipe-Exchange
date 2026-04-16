import prisma from '../config/prisma';
import { tryMatch } from './matchingService';

export async function getOrderBook() {
  const [bids, asks] = await Promise.all([
    prisma.order.findMany({
      where: { side: 'BID', status: 'OPEN' },
      orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
      include: { user: { select: { username: true } } },
    }),
    prisma.order.findMany({
      where: { side: 'ASK', status: 'OPEN' },
      orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
      include: { user: { select: { username: true } } },
    }),
  ]);

  return {
    bids: bids.map((o) => ({
      id: o.id,
      username: o.user.username,
      price: o.price,
      quantity: o.quantity,
      createdAt: o.createdAt,
    })),
    asks: asks.map((o) => ({
      id: o.id,
      username: o.user.username,
      price: o.price,
      quantity: o.quantity,
      createdAt: o.createdAt,
    })),
  };
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId, status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((o) => ({
    id: o.id,
    side: o.side,
    price: o.price,
    quantity: o.quantity,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

export async function placeOrder(userId: string, side: string, price: number, quantity: number) {
  // Validation
  if (side !== 'BID' && side !== 'ASK') {
    throw { status: 400, message: 'Side must be BID or ASK' };
  }
  if (!price || price <= 0) {
    throw { status: 400, message: 'Price must be a positive number' };
  }
  if (Math.round(price * 100) !== price * 100) {
    throw { status: 400, message: 'Price can have at most 2 decimal places' };
  }
  if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
    throw { status: 400, message: 'Quantity must be a positive integer' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 404, message: 'User not found' };

  // Balance checks
  if (side === 'BID' && user.diningDollarBalance < price * quantity) {
    throw { status: 400, message: 'Insufficient Dining Dollar balance' };
  }
  if (side === 'ASK' && user.swipeBalance < quantity) {
    throw { status: 400, message: 'Insufficient swipe balance' };
  }

  // Deduct balance upfront
  if (side === 'BID') {
    await prisma.user.update({
      where: { id: userId },
      data: { diningDollarBalance: { decrement: price * quantity } },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { swipeBalance: { decrement: quantity } },
    });
  }

  // Create the order
  const order = await prisma.order.create({
    data: {
      userId,
      side: side as 'BID' | 'ASK',
      price,
      quantity,
    },
  });

  // Try to match
  const trade = await tryMatch(order);

  // Fetch updated order status
  const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });

  return {
    order: {
      id: updatedOrder!.id,
      side: updatedOrder!.side,
      price: updatedOrder!.price,
      quantity: updatedOrder!.quantity,
      status: updatedOrder!.status,
      createdAt: updatedOrder!.createdAt,
    },
    trade: trade
      ? {
          id: trade.id,
          price: trade.price,
          quantity: trade.quantity,
          buyerId: trade.buyerId,
          sellerId: trade.sellerId,
          executedAt: trade.executedAt,
        }
      : null,
  };
}

export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) {
    throw { status: 404, message: 'Order not found' };
  }
  if (order.status !== 'OPEN') {
    throw { status: 400, message: 'Order is already filled or cancelled' };
  }

  // Cancel and refund in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });

    if (order.side === 'BID') {
      await tx.user.update({
        where: { id: userId },
        data: { diningDollarBalance: { increment: order.price * order.quantity } },
      });
    } else {
      await tx.user.update({
        where: { id: userId },
        data: { swipeBalance: { increment: order.quantity } },
      });
    }
  });

  return { message: 'Order cancelled' };
}
