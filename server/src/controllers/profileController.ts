import { Request, Response } from 'express';
import * as profileService from '../services/profileService';

export async function getProfile(req: Request, res: Response) {
  try {
    const profile = await profileService.getProfile(req.userId!);
    res.status(200).json(profile);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { displayName } = req.body;
    const profile = await profileService.updateProfile(req.userId!, displayName);
    res.status(200).json(profile);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  }
}
