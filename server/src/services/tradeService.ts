import prisma from '../config/prisma';

export async function getTrades(limit: number = 20, offset: number = 0) {
  const trades = await prisma.trade.findMany({
    orderBy: { executedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      buyer: { select: { username: true } },
      seller: { select: { username: true } },
    },
  });

  return trades.map((t) => ({
    id: t.id,
    price: t.price,
    quantity: t.quantity,
    buyerUsername: t.buyer.username,
    sellerUsername: t.seller.username,
    executedAt: t.executedAt,
  }));
}

export async function getUserTrades(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { executedAt: 'desc' },
    include: {
      buyer: { select: { username: true } },
      seller: { select: { username: true } },
    },
  });

  return trades.map((t) => ({
    id: t.id,
    price: t.price,
    quantity: t.quantity,
    buyerUsername: t.buyer.username,
    sellerUsername: t.seller.username,
    executedAt: t.executedAt,
  }));
}
