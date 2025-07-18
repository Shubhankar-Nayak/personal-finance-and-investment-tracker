import { Response, Request } from 'express';
import { Budget } from '../models/Budget';
import { UserDocument } from '../models/User';


interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const newBudget = await Budget.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ message: 'Invalid budget data' });
  }
};
