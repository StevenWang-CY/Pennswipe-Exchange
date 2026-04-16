import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getMe(req.userId!);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}
