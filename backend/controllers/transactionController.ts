import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { UserDocument } from '../models/User';

import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  try {
    const transactions = await Transaction.find({ userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const addTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  try {
    const newTx = await Transaction.create({ ...req.body, userId });
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ message: 'Error adding transaction' });
  }
};
