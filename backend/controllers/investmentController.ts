import { Response, Request } from 'express';
import { Investment } from '../models/Investment';
import { UserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getInvestments = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const investments = await Investment.find({ userId: req.user._id });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInvestment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const newInvestment = await Investment.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(400).json({ message: 'Invalid investment data' });
  }
};
