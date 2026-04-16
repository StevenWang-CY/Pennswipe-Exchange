import { Request, Response } from 'express';
import * as tradeService from '../services/tradeService';

export async function getTrades(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const trades = await tradeService.getTrades(limit, offset);
    res.status(200).json(trades);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function getUserTrades(req: Request, res: Response) {
  try {
    const trades = await tradeService.getUserTrades(req.userId!);
    res.status(200).json(trades);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}
