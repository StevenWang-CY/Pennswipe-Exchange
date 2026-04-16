import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import { emitOrderBookUpdate, emitTradeExecuted, emitBalanceUpdate } from '../socket';
import prisma from '../config/prisma';

export async function placeOrder(req: Request, res: Response) {
  try {
    const { side, price, quantity } = req.body;
    const result = await orderService.placeOrder(req.userId!, side, price, quantity || 1);

    const io = req.app.get('io');
    await emitOrderBookUpdate(io);

    if (result.trade) {
      // Fetch usernames for the trade event
      const [buyer, seller] = await Promise.all([
        prisma.user.findUnique({ where: { id: result.trade.buyerId }, select: { username: true, diningDollarBalance: true, swipeBalance: true } }),
        prisma.user.findUnique({ where: { id: result.trade.sellerId }, select: { username: true, diningDollarBalance: true, swipeBalance: true } }),
      ]);

      emitTradeExecuted(io, {
        id: result.trade.id,
        price: result.trade.price,
        quantity: result.trade.quantity,
        buyerUsername: buyer!.username,
        sellerUsername: seller!.username,
        executedAt: result.trade.executedAt,
      });

      emitBalanceUpdate(io, result.trade.buyerId, {
        diningDollarBalance: buyer!.diningDollarBalance,
        swipeBalance: buyer!.swipeBalance,
      });
      emitBalanceUpdate(io, result.trade.sellerId, {
        diningDollarBalance: seller!.diningDollarBalance,
        swipeBalance: seller!.swipeBalance,
      });
    } else {
      // Emit balance update for the user who placed the order (balance deducted)
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { diningDollarBalance: true, swipeBalance: true },
      });
      emitBalanceUpdate(io, req.userId!, {
        diningDollarBalance: user!.diningDollarBalance,
        swipeBalance: user!.swipeBalance,
      });
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function getOrderBook(_req: Request, res: Response) {
  try {
    const book = await orderService.getOrderBook();
    res.status(200).json(book);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function getUserOrders(req: Request, res: Response) {
  try {
    const orders = await orderService.getUserOrders(req.userId!);
    res.status(200).json(orders);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const result = await orderService.cancelOrder(req.params.id as string, req.userId!);

    const io = req.app.get('io');
    await emitOrderBookUpdate(io);

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { diningDollarBalance: true, swipeBalance: true },
    });
    emitBalanceUpdate(io, req.userId!, {
      diningDollarBalance: user!.diningDollarBalance,
      swipeBalance: user!.swipeBalance,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}
