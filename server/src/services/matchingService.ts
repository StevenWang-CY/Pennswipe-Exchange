import prisma from '../config/prisma';
import { Order, Side } from '@prisma/client';

interface TradeResult {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  quantity: number;
  executedAt: Date;
}

export async function tryMatch(order: Order): Promise<TradeResult | null> {
  if (order.side === 'BID') {
    // Find the lowest-priced OPEN ASK where ask.price <= bid.price
    const matchingAsk = await prisma.order.findFirst({
      where: {
        side: 'ASK',
        status: 'OPEN',
        price: { lte: order.price },
      },
      orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
    });

    if (!matchingAsk) return null;

    const tradePrice = matchingAsk.price; // Execute at resting order's price
    const tradeQuantity = order.quantity;
    const refundAmount = (order.price - tradePrice) * tradeQuantity;

    // Execute everything in a transaction
    const trade = await prisma.$transaction(async (tx) => {
      // Mark both orders as FILLED
      await tx.order.update({ where: { id: order.id }, data: { status: 'FILLED' } });
      await tx.order.update({ where: { id: matchingAsk.id }, data: { status: 'FILLED' } });

      // Create trade record
      const t = await tx.trade.create({
        data: {
          buyOrderId: order.id,
          sellOrderId: matchingAsk.id,
          buyerId: order.userId,
          sellerId: matchingAsk.userId,
          price: tradePrice,
          quantity: tradeQuantity,
        },
      });

      // Update buyer: refund difference + add swipes
      await tx.user.update({
        where: { id: order.userId },
        data: {
          diningDollarBalance: { increment: refundAmount },
          swipeBalance: { increment: tradeQuantity },
        },
      });

      // Update seller: add dining dollars
      await tx.user.update({
        where: { id: matchingAsk.userId },
        data: {
          diningDollarBalance: { increment: tradePrice * tradeQuantity },
        },
      });

      return t;
    });

    return trade;
  } else {
    // ASK: find the highest-priced OPEN BID where bid.price >= ask.price
    const matchingBid = await prisma.order.findFirst({
      where: {
        side: 'BID',
        status: 'OPEN',
        price: { gte: order.price },
      },
      orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
    });

    if (!matchingBid) return null;

    const tradePrice = matchingBid.price; // Execute at resting order's price
    const tradeQuantity = order.quantity;

    const trade = await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: matchingBid.id }, data: { status: 'FILLED' } });
      await tx.order.update({ where: { id: order.id }, data: { status: 'FILLED' } });

      const t = await tx.trade.create({
        data: {
          buyOrderId: matchingBid.id,
          sellOrderId: order.id,
          buyerId: matchingBid.userId,
          sellerId: order.userId,
          price: tradePrice,
          quantity: tradeQuantity,
        },
      });

      // Buyer already paid bid.price upfront (which equals tradePrice here), add swipes
      await tx.user.update({
        where: { id: matchingBid.userId },
        data: {
          swipeBalance: { increment: tradeQuantity },
        },
      });

      // Seller: add dining dollars
      await tx.user.update({
        where: { id: order.userId },
        data: {
          diningDollarBalance: { increment: tradePrice * tradeQuantity },
        },
      });

      return t;
    });

    return trade;
  }
}
